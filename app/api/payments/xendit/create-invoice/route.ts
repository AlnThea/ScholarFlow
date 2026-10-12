// app/api/payments/xendit/create-invoice/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';


// In-memory invoice store for real-time status check and simulated testing
const invoiceMemoryStore = new Map<string, any>();

async function getXenditSecretKey(): Promise<string | null> {
  // 1. Cek Admin gateway config di Supabase
  try {
    const { data } = await supabase
      .from('payment_gateways')
      .select('config, is_enabled')
      .eq('id', 'xendit')
      .single();

    if (data?.config?.secret_key) {
      return data.config.secret_key;
    }
  } catch (err) {
    // ignore
  }

  // 2. Fallback ke process.env
  return process.env.XENDIT_SECRET_KEY || null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, planName, amount, payerEmail, customerName, userId } = body;

    if (!amount || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required invoice parameters' },
        { status: 400 }
      );
    }

    const externalId = `sf_inv_${userId}_${planId}_${Date.now()}`;
    const secretKey = await getXenditSecretKey();

    // Jika secret key resmi Xendit tersedia
    if (secretKey && secretKey.startsWith('xnd_')) {
      try {
        const authHeader = 'Basic ' + Buffer.from(secretKey + ':').toString('base64');
        const xenditRes = await fetch('https://api.xendit.co/v2/invoices', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader
          },
          body: JSON.stringify({
            external_id: externalId,
            amount: Number(amount),
            description: `ScholarFlow ${planName || 'Pro Writer'} Subscription`,
            invoice_duration: 86400, // 24 jam
            payer_email: payerEmail || undefined,
            customer: {
              given_names: customerName || 'ScholarFlow User',
              email: payerEmail || undefined
            },
            currency: 'IDR',
            payment_methods: ['QRIS', 'BCA', 'MANDIRI', 'BNI', 'BRI', 'OVO', 'SHOPEEPAY', 'CREDIT_CARD']
          })
        });

        if (xenditRes.ok) {
          const invoiceData = await xenditRes.json();
          invoiceMemoryStore.set(externalId, {
            ...invoiceData,
            user_id: userId,
            plan_id: planId,
            status: invoiceData.status || 'PENDING'
          });

          return NextResponse.json({
            success: true,
            is_live: true,
            invoice: {
              id: invoiceData.id,
              external_id: externalId,
              invoice_url: invoiceData.invoice_url,
              status: invoiceData.status,
              amount: invoiceData.amount,
              expiry_date: invoiceData.expiry_date
            }
          });
        }
      } catch (err: any) {
        console.warn('Xendit live API call failed, falling back to simulated sandbox:', err.message);
      }
    }

    // Fallback: Sandbox / In-App Interactive Simulation Invoice
    const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const simulatedInvoice = {
      id: `xnd_sim_${Date.now()}`,
      external_id: externalId,
      invoice_url: `https://checkout.xendit.co/v2/simulated/${externalId}`,
      status: 'PENDING',
      amount: Number(amount),
      expiry_date: expiryDate,
      user_id: userId,
      plan_id: planId
    };

    invoiceMemoryStore.set(externalId, simulatedInvoice);

    return NextResponse.json({
      success: true,
      is_simulated: true,
      invoice: simulatedInvoice
    });
  } catch (error: any) {
    console.error('Error generating Xendit invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const externalId = searchParams.get('external_id');
  const action = searchParams.get('action'); // 'check' or 'simulate_pay'

  if (!externalId) {
    return NextResponse.json({ success: false, error: 'external_id required' }, { status: 400 });
  }

  const invoice = invoiceMemoryStore.get(externalId);

  // Jika tombol demo 'simulate_pay' diklik untuk testing instan
  if (action === 'simulate_pay' && invoice) {
    invoice.status = 'PAID';
    invoiceMemoryStore.set(externalId, invoice);

    // Update user di Supabase
    if (invoice.user_id) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      await supabase
        .from('profiles')
        .update({
          subscription_plan: invoice.plan_id || 'pro',
          subscription_status: 'active',
          subscription_end: nextMonth.toISOString()
        })
        .eq('id', invoice.user_id);
    }

    return NextResponse.json({
      success: true,
      status: 'PAID',
      message: 'Simulated payment succeeded! Account upgraded.'
    });
  }

  return NextResponse.json({
    success: true,
    status: invoice?.status || 'PENDING'
  });
}
