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
  display_order?: number | null;
  updated_at: string;
};

const LOCAL_PRICING_ORDER_KEY = 'scholarflow.pricing_order.v1';

/**
  * Mengambil seluruh paket harga dari database Supabase
  * Terurut secara fleksibel: Mengikuti custom display_order / drag-and-drop admin,
  * dengan fallback ke susunan hierarki kanonikal: Free -> Pro -> Institution.
  */
export async function fetchPricingPlans(): Promise<PricingPlan[]> {
  const { data, error } = await supabase
    .from('pricing_plans')
    .select('*');

  if (error || !data) {
    console.error('Error fetching pricing plans:', error);
    return [];
  }

  // Cek apakah ada custom saved order dari drag-and-drop
  let localCustomOrder: string[] = [];
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_PRICING_ORDER_KEY);
      if (raw) localCustomOrder = JSON.parse(raw);
    } catch (_) {}
  }

  // Canonical fallback priority
  const defaultRank: Record<string, number> = {
    free: 1,
    pro: 2,
    institution: 3,
    enterprise: 4
  };

  const sorted = [...(data as PricingPlan[])].sort((a, b) => {
    // 1. Jika ada custom order dari drag & drop lokal admin
    if (localCustomOrder.length > 0) {
      const idxA = localCustomOrder.indexOf(a.id);
      const idxB = localCustomOrder.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
    }

    // 2. Jika di database ada kolom display_order
    if (typeof a.display_order === 'number' && typeof b.display_order === 'number') {
      return a.display_order - b.display_order;
    }

    // 3. Fallback ke canonical rank
    const rankA = defaultRank[a.id.toLowerCase()] ?? 99;
    const rankB = defaultRank[b.id.toLowerCase()] ?? 99;
    if (rankA !== rankB) return rankA - rankB;

    const priceA = a.price === -1 ? 999999999 : a.price;
    const priceB = b.price === -1 ? 999999999 : b.price;
    return priceA - priceB;
  });

  return sorted;
}

/**
 * Menyimpan urutan baru hasil Drag and Drop admin
 */
export async function reorderPricingPlans(orderedPlanIds: string[]): Promise<{ success: boolean; error?: string }> {
  // 1. Simpan langsung di localStorage untuk respon instan tanpa jeda
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_PRICING_ORDER_KEY, JSON.stringify(orderedPlanIds));
    } catch (_) {}
  }

  // 2. Upayakan update ke database (kolom display_order jika ada)
  try {
    const promises = orderedPlanIds.map((id, index) => 
      supabase
        .from('pricing_plans')
        .update({ display_order: index + 1, updated_at: new Date().toISOString() })
        .eq('id', id)
    );
    await Promise.allSettled(promises);
  } catch (err: any) {
    console.warn('[Pricing] Optional remote display_order update warning:', err);
  }

  return { success: true };
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

/**
  * Menambah paket harga baru (Hanya admin)
  */
export async function createPricingPlan(
  plan: Omit<PricingPlan, 'updated_at'>
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('pricing_plans')
    .insert({
      ...plan,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error creating pricing plan:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
  * Menghapus paket harga (Hanya admin)
  */
export async function deletePricingPlan(
  planId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('pricing_plans')
    .delete()
    .eq('id', planId);

  if (error) {
    console.error(`Error deleting pricing plan ${planId}:`, error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
