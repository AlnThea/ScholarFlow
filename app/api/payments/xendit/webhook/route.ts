// app/api/payments/xendit/webhook/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { status, external_id, paid_amount } = body;

    // Cek header x-callback-token jika dikonfigurasi
    const callbackToken = req.headers.get('x-callback-token');
    const configuredToken = process.env.XENDIT_WEBHOOK_TOKEN;
    if (configuredToken && callbackToken && callbackToken !== configuredToken) {
      return NextResponse.json({ error: 'Unauthorized webhook token' }, { status: 401 });
    }

    if (status === 'PAID' && external_id) {
      // Format external_id: sf_inv_${userId}_${planId}_${timestamp}
      const parts = external_id.split('_');
      // parts[0] = 'sf', parts[1] = 'inv', parts[2] = userId, parts[3] = planId
      if (parts.length >= 4) {
        const userId = parts[2];
        const planId = parts[3];

        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const isPro = planId.toLowerCase() === 'pro' || planId.toLowerCase() === 'institution';
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_plan: planId,
            subscription_status: 'active',
            subscription_end: nextMonth.toISOString(),
            ai_monthly_quota: isPro ? 1000000 : 50000,
            ai_tokens_used: 0,
            ai_quota_reset_at: nextMonth.toISOString()
          })
          .eq('id', userId);

        if (error) {
          console.error('Failed to update user profile upon Xendit payment:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log(`Successfully upgraded user ${userId} to plan ${planId} via Xendit invoice.`);
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    console.error('Error handling Xendit webhook:', error);
    return NextResponse.json({ error: error.message || 'Webhook error' }, { status: 500 });
  }
}
