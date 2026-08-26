// lib/api/citation-library.ts
// Helper untuk membaca & menulis tabel user_saved_citations (Personal Shelf)
// dikombinasikan dengan citation_library (Global Master)

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
 * Ambil semua citation milik user yang sedang login dari rak pribadinya
 */
export async function fetchCitationLibrary(userId: string): Promise<Record<string, CitationCandidate>> {
  // Inner join: Ambil reference_id dari user_saved_citations milik user,
  // lalu tarik citation_data utuhnya dari citation_library
  const { data, error } = await supabase
    .from('user_saved_citations')
    .select(`
      reference_id,
      citation_library!inner (
        citation_data
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return {};

  const result: Record<string, CitationCandidate> = {};
  for (const row of data) {
    const libData = row.citation_library as any;
    result[row.reference_id] = libData.citation_data as CitationCandidate;
  }
  return result;
}

/**
 * Simpan satu citation ke Global Library (jika belum ada), 
 * lalu hubungkan ke Rak Pribadi User (jika belum terhubung).
 */
export async function saveCitationToLibrary(
  candidate: CitationCandidate,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  
  // Langkah 1: Upsert ke Global Master (Abaikan jika duplikat)
  const { error: globalError } = await supabase
    .from('citation_library')
    .upsert(
      {
        reference_id: candidate.reference_id,
        citation_data: candidate,
        added_by: userId, // Pencatat pengunggah pertama
      },
      { onConflict: 'reference_id', ignoreDuplicates: true },
    );

  if (globalError) {
    return { success: false, error: "Global DB Error: " + globalError.message };
  }

  // Langkah 2: Hubungkan ke Personal Shelf User (Abaikan jika sudah ada di raknya)
  const { error: shelfError } = await supabase
    .from('user_saved_citations')
    .upsert(
      {
        user_id: userId,
        reference_id: candidate.reference_id,
      },
      { onConflict: 'user_id,reference_id', ignoreDuplicates: true }
    );
    
  if (shelfError) {
    return { success: false, error: "Shelf Error: " + shelfError.message };
  }

  return { success: true };
}

/**
 * Hapus citation hanya dari Rak Pribadi User (Global Master tetap utuh)
 */
export async function deleteCitationFromLibrary(
  referenceId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('user_saved_citations')
    .delete()
    .match({ user_id: userId, reference_id: referenceId });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Cek apakah satu citation sudah ada di rak pribadi user
 */
export async function isCitationInLibrary(referenceId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_saved_citations')
    .select('id')
    .match({ user_id: userId, reference_id: referenceId })
    .maybeSingle();

  return !!data;
}
