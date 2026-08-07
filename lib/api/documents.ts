// lib/api/documents.ts
// Helper untuk membaca & menulis tabel documents di Supabase

import { supabase } from '@/lib/supabase';

export type DocumentSettings = {
  publishYear: 'all' | '5_years' | 'custom';
  publishYearStart?: number | null;
  publishYearEnd?: number | null;
  impactFactor: 'all' | '0.25+' | '3+' | '10+';
  considerExternal: boolean;
  considerLibrary: boolean;
  limitCollection: string;
  citationStyle: string;
  citationLocale: string;
  showPageNumber: boolean;
  folders?: string[];
  folder_assignments?: Record<string, string>;
  projectId?: string;
  projectName?: string;
  projectType?: 'skripsi' | 'jurnal' | 'makalah' | 'independent';
  projectPart?: string;
  templateId?: 'empty' | 'ieee' | 'skripsi' | 'apa' | 'report';
  shareActive?: boolean;
  sharePermission?: 'view' | 'edit';
  alignments?: Record<string, string>;
};

export type DocumentEntry = {
  id: string;
  title: string;
  content: any; // EditorJS JSON content
  settings: DocumentSettings;
  user_id: string;
  created_at: string;
  updated_at: string;
  ownerPlan?: string;
};

export type DocumentListItem = {
  id: string;
  title: string;
  settings: DocumentSettings;
  created_at: string;
  updated_at: string;
};

/**
 * Fetch all documents for a specific user (only select basic meta fields to avoid large content downloads)
 */
export async function fetchDocuments(userId: string): Promise<DocumentListItem[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('id, title, settings, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error || !data) {
    console.error('Error fetching documents:', error);
    return [];
  }

  return data as DocumentListItem[];
}

/**
 * Fetch document details by ID
 */
export async function fetchDocumentById(docId: string, userId: string): Promise<DocumentEntry | null> {
  const { data, error } = await supabase
    .from('documents')
    .select('id, title, content, settings, user_id, created_at, updated_at')
    .eq('id', docId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    console.error('Error fetching document detail:', error);
    return null;
  }

  return data as DocumentEntry;
}

/**
 * Create a new document in the cloud database
 */
export async function createDocument(
  userId: string, 
  title = 'Untitled Document', 
  content: any = null,
  settings: Partial<DocumentSettings> = {}
): Promise<DocumentEntry | null> {
  const defaultSettings: DocumentSettings = {
    publishYear: 'all',
    publishYearStart: null,
    publishYearEnd: null,
    impactFactor: 'all',
    considerExternal: false,
    considerLibrary: false,
    limitCollection: 'all',
    citationStyle: 'apa',
    citationLocale: 'en-US',
    showPageNumber: false
  };

  const { data, error } = await supabase
    .from('documents')
    .insert({
      title,
      content,
      user_id: userId,
      settings: { ...defaultSettings, ...settings }
    })
    .select()
    .single();

  if (error || !data) {
    console.error('Error creating document:', error);
    return null;
  }

  return data as DocumentEntry;
}

/**
 * Update document content and/or title
 */
export async function updateDocument(
  docId: string,
  userId: string,
  updates: { title?: string; content?: any; settings?: Partial<DocumentSettings> }
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('documents')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', docId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating document:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Delete document from database
 */
export async function deleteDocument(docId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', docId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting document:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Fetch a shared document detail by ID (calls Next.js server-side API to bypass RLS safely)
 */
export async function fetchSharedDocument(docId: string): Promise<DocumentEntry | null> {
  try {
    const res = await fetch(`/api/shared-document?id=${encodeURIComponent(docId)}`);
    if (!res.ok) {
      console.error('Failed to fetch shared document:', res.statusText);
      return null;
    }
    const data = await res.json();
    return data as DocumentEntry;
  } catch (err) {
    console.error('Error in fetchSharedDocument API call:', err);
    return null;
  }
}

/**
 * Update a shared document content/title (calls Next.js server-side API)
 */
export async function updateSharedDocument(
  docId: string,
  updates: { title?: string; content?: any; settings?: Partial<DocumentSettings> }
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/shared-document?id=${encodeURIComponent(docId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.error || res.statusText };
    }
    return { success: true };
  } catch (err) {
    console.error('Error in updateSharedDocument API call:', err);
    return { success: false, error: String(err) };
  }
}


