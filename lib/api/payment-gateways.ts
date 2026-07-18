// lib/api/payment-gateways.ts
// Helper untuk membaca & mengelola status payment gateway di Supabase
import { supabase } from '@/lib/supabase';

export type PaymentGateway = {
  id: string;
  name: string;
  is_enabled: boolean;
  updated_at: string;
};

/**
 * Mengambil status seluruh payment gateway dari Supabase
 */
export async function fetchPaymentGateways(): Promise<PaymentGateway[]> {
  const { data, error } = await supabase
    .from('payment_gateways')
    .select('*')
    .order('id', { ascending: true });

  if (error || !data) {
    console.error('Error fetching payment gateways:', error);
    return [];
  }

  return data as PaymentGateway[];
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
