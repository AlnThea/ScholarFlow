// lib/api/payment-gateways.ts
// Helper untuk membaca & mengelola status payment gateway di Supabase
import { supabase } from '@/lib/supabase';

export type PaymentGateway = {
  id: string;
  name: string;
  is_enabled: boolean;
  config?: {
    secret_key?: string;
    webhook_token?: string;
    [key: string]: any;
  };
  updated_at: string;
};

const DEFAULT_GATEWAYS: PaymentGateway[] = [
  { id: 'xendit', name: 'Xendit Invoice (QRIS, VA, E-Wallet)', is_enabled: true, updated_at: new Date().toISOString() },
  { id: 'midtrans', name: 'Midtrans Snap', is_enabled: true, updated_at: new Date().toISOString() },
  { id: 'stripe', name: 'Stripe Global Card', is_enabled: true, updated_at: new Date().toISOString() }
];

/**
 * Mengambil status seluruh payment gateway dari Supabase (dengan fallback Xendit)
 */
export async function fetchPaymentGateways(): Promise<PaymentGateway[]> {
  try {
    const { data, error } = await supabase
      .from('payment_gateways')
      .select('*')
      .order('id', { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_GATEWAYS;
    }

    const list = data as PaymentGateway[];
    // Pastikan xendit selalu ada di list
    if (!list.some(g => g.id === 'xendit')) {
      list.unshift(DEFAULT_GATEWAYS[0]);
    }

    return list;
  } catch {
    return DEFAULT_GATEWAYS;
  }
}


/**
 * Memperbarui status keaktifan payment gateway (Hanya admin via RLS)
 */
export async function updatePaymentGatewayStatus(
  id: string,
  isEnabled: boolean
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('payment_gateways')
    .update({
      is_enabled: isEnabled,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error(`Error updating payment gateway ${id}:`, error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
