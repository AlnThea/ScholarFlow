// lib/api/citation-library.ts
// Helper untuk membaca & menulis tabel citation_library di Supabase
// citation_library = koleksi global, semua user bisa baca, hanya admin yang bisa kelola

import { supabase } from '@/lib/supabase';
import type { CitationCandidate } from '@/lib/api/citations';

export type CitationLibraryEntry = {
  id: string;
  reference_id: string;
  citation_data: CitationCandidate;
  added_by: string | null;
  added_at: string;
};

/**
 * Ambil semua citation dari global library
 */
export async function fetchCitationLibrary(): Promise<Record<string, CitationCandidate>> {
  const { data, error } = await supabase
    .from('citation_library')
    .select('reference_id, citation_data')
    .order('added_at', { ascending: false });

  if (error || !data) return {};

  const result: Record<string, CitationCandidate> = {};
  for (const row of data) {
    result[row.reference_id] = row.citation_data as CitationCandidate;
  }
  return result;
}

/**
 * Simpan satu citation ke global library
 * Akan di-skip jika reference_id sudah ada (upsert)
 */
export async function saveCitationToLibrary(
  candidate: CitationCandidate,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('citation_library')
    .upsert(
      {
        reference_id: candidate.reference_id,
        citation_data: candidate,
        added_by: userId,
      },
      { onConflict: 'reference_id', ignoreDuplicates: true },
    );

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Hapus citation dari global library (hanya admin)
 */
export async function deleteCitationFromLibrary(
  referenceId: string,
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('citation_library')
    .delete()
    .eq('reference_id', referenceId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Cek apakah satu citation sudah ada di library
 */
export async function isCitationInLibrary(referenceId: string): Promise<boolean> {
  const { data } = await supabase
    .from('citation_library')
    .select('id')
    .eq('reference_id', referenceId)
    .maybeSingle();

  return !!data;
}
