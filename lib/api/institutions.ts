// lib/api/institutions.ts
// Helper untuk mengelola data B2B Institutional / Campus Organizations di Supabase & Dual-Persistence fallback

import { supabase } from '@/lib/supabase';

export interface Institution {
  id: string;
  name: string;
  admin_email: string;
  domains: string[];
  total_seats: number;
  used_seats: number;
  contract_start: string;
  contract_end: string;
  status: 'active' | 'suspended' | 'expired';
  created_at?: string;
  updated_at?: string;
}

const STORAGE_KEY = 'scholarflow.institutions.v1';

// Seed default sample data jika tabel belum ada / fallback lokal
export const DEFAULT_INSTITUTIONS: Institution[] = [
  {
    id: 'inst_um_malang',
    name: 'Universitas Negeri Malang (UM)',
    admin_email: 'dahlan@um.ac.id',
    domains: ['um.ac.id', 'student.um.ac.id'],
    total_seats: 150,
    used_seats: 47,
    contract_start: '2026-01-01T00:00:00.000Z',
    contract_end: '2026-12-31T23:59:59.000Z',
    status: 'active'
  },
  {
    id: 'inst_ugm_yogyakarta',
    name: 'Universitas Gadjah Mada (UGM)',
    admin_email: 'dekan.pasca@ugm.ac.id',
    domains: ['ugm.ac.id', 'mail.ugm.ac.id'],
    total_seats: 300,
    used_seats: 112,
    contract_start: '2026-02-15T00:00:00.000Z',
    contract_end: '2027-02-14T23:59:59.000Z',
    status: 'active'
  }
];

function getLocalInstitutions(): Institution[] {
  if (typeof window === 'undefined') return DEFAULT_INSTITUTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_INSTITUTIONS));
      return DEFAULT_INSTITUTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_INSTITUTIONS;
  }
}

function saveLocalInstitutions(list: Institution[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save institutions to localStorage:', e);
  }
}

/**
 * Mengambil seluruh data institusi kampus (Supabase dengan fallback localStorage)
 */
export async function fetchInstitutions(): Promise<Institution[]> {
  try {
    const { data, error } = await supabase
      .from('institutions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return getLocalInstitutions();
    }

    const parsed: Institution[] = data.map((item: any) => ({
      ...item,
      domains: Array.isArray(item.domains) ? item.domains : JSON.parse(item.domains || '[]')
    }));

    saveLocalInstitutions(parsed);
    return parsed;
  } catch {
    return getLocalInstitutions();
  }
}

/**
 * Menambahkan institusi kampus baru
 */
export async function createInstitution(
  payload: Omit<Institution, 'id' | 'used_seats' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; data?: Institution; error?: string }> {
  const newInst: Institution = {
    ...payload,
    id: `inst_${Date.now()}`,
    used_seats: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // 1. Simpan ke local persistence
  const localList = getLocalInstitutions();
  saveLocalInstitutions([newInst, ...localList]);

  // 2. Simpan ke Supabase jika tabel siap
  try {
    const { data, error } = await supabase
      .from('institutions')
      .insert({
        ...newInst,
        domains: newInst.domains
      })
      .select()
      .single();

    if (!error && data) {
      return { success: true, data: { ...data, domains: newInst.domains } };
    }
  } catch (err: any) {
    console.warn('Supabase institutions insert fallback to local:', err?.message);
  }

  return { success: true, data: newInst };
}

/**
 * Memperbarui data institusi kampus
 */
export async function updateInstitution(
  id: string,
  updates: Partial<Omit<Institution, 'id' | 'created_at'>>
): Promise<{ success: boolean; error?: string }> {
  // 1. Update local persistence
  const localList = getLocalInstitutions();
  const updatedList = localList.map((item) =>
    item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
  );
  saveLocalInstitutions(updatedList);

  // 2. Update Supabase
  try {
    const { error } = await supabase
      .from('institutions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.warn('Supabase institutions update error:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase institutions update error:', err?.message);
  }

  return { success: true };
}

/**
 * Menghapus data institusi kampus
 */
export async function deleteInstitution(id: string): Promise<{ success: boolean; error?: string }> {
  // 1. Delete from local persistence
  const localList = getLocalInstitutions();
  saveLocalInstitutions(localList.filter((item) => item.id !== id));

  // 2. Delete from Supabase
  try {
    const { error } = await supabase.from('institutions').delete().eq('id', id);
    if (error) {
      console.warn('Supabase institutions delete error:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase institutions delete error:', err?.message);
  }

  return { success: true };
}
