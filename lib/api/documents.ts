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
};

export type DocumentEntry = {
  id: string;
  title: string;
  content: any; // EditorJS JSON content
  settings: DocumentSettings;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type DocumentListItem = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

/**
 * Fetch all documents for a specific user (only select basic meta fields to avoid large content downloads)
 */
export async function fetchDocuments(userId: string): Promise<DocumentListItem[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('id, title, created_at, updated_at')
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
