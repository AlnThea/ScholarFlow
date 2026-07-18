// lib/api/pricing.ts
// Helper untuk membaca & mengelola paket harga di Supabase
import { supabase } from '@/lib/supabase';

export type PricingPlan = {
  id: string;
  name: string;
  price: number;
  price_period: string;
  description: string | null;
  features: string[];
  is_popular: boolean;
  promo_text: string | null;
  updated_at: string;
};

/**
  * Mengambil seluruh paket harga dari database Supabase
  */
export async function fetchPricingPlans(): Promise<PricingPlan[]> {
  const { data, error } = await supabase
    .from('pricing_plans')
    .select('*')
    .order('price', { ascending: true });

  if (error || !data) {
    console.error('Error fetching pricing plans:', error);
    return [];
  }

  return data as PricingPlan[];
}

/**
  * Memperbarui salah satu paket harga (Hanya admin yang diizinkan oleh RLS)
  */
export async function updatePricingPlan(
  planId: string,
  updates: Partial<Omit<PricingPlan, 'id' | 'updated_at'>>
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('pricing_plans')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', planId);

  if (error) {
    console.error(`Error updating pricing plan ${planId}:`, error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
