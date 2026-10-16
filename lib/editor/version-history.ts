// lib/editor/version-history.ts
// ScholarFlow Document Version History & Time-Machine Storage Engine

import { supabase } from '@/lib/supabase';
import { extractPlainTextFromEditorJs } from './diff-engine';

export interface DocumentRevision {
  id: string;
  document_id: string;
  user_id: string;
  title: string;
  content: any; // EditorJS content object
  word_count: number;
  change_summary?: string;
  is_auto_saved: boolean;
  created_at: string;
  author_name?: string;
}

const LOCAL_REVISIONS_PREFIX = 'scholarflow.revisions.v1.';
const MAX_LOCAL_REVISIONS_PER_DOC = 30;

/**
 * Loads cached revisions from localStorage for instant offline access
 */
export function loadLocalRevisions(docId: string): DocumentRevision[] {
  if (typeof window === 'undefined' || !docId) return [];
  try {
    const raw = localStorage.getItem(`${LOCAL_REVISIONS_PREFIX}${docId}`);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.warn('Failed to load local revisions for doc:', docId, err);
    return [];
  }
}

/**
 * Saves revisions list to localStorage with FIFO cap
 */
export function saveLocalRevisions(docId: string, revisions: DocumentRevision[]): void {
  if (typeof window === 'undefined' || !docId) return;
  try {
    const capped = revisions.slice(0, MAX_LOCAL_REVISIONS_PER_DOC);
    localStorage.setItem(`${LOCAL_REVISIONS_PREFIX}${docId}`, JSON.stringify(capped));
  } catch (err) {
    console.warn('Failed to save local revisions for doc:', docId, err);
  }
}

/**
 * Appends a new revision to localStorage
 */
export function appendLocalRevision(docId: string, revision: DocumentRevision): DocumentRevision[] {
  const current = loadLocalRevisions(docId);
  // Avoid duplicate by ID
  const filtered = current.filter(r => r.id !== revision.id);
  const updated = [revision, ...filtered];
  saveLocalRevisions(docId, updated);
  return updated;
}

/**
 * Count total words in EditorJS content
 */
export function countWordsFromContent(content: any): number {
  const plainText = extractPlainTextFromEditorJs(content);
  if (!plainText) return 0;
  const words = plainText.match(/\S+/g);
  return words ? words.length : 0;
}

/**
 * Fetch document revisions from backend API with localStorage fallback
 */
export async function fetchDocumentRevisions(docId: string): Promise<DocumentRevision[]> {
  if (!docId) return [];

  try {
    const res = await fetch(`/api/v1/documents/${encodeURIComponent(docId)}/revisions`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.revisions)) {
        // Cache to local storage
        saveLocalRevisions(docId, data.revisions);
        return data.revisions;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch revisions from server, falling back to local storage:', err);
  }

  // Graceful fallback to client-side storage
  return loadLocalRevisions(docId);
}

/**
 * Create a new document snapshot revision
 */
export async function createDocumentRevision(
  docId: string,
  params: {
    userId: string;
    title: string;
    content: any;
    changeSummary?: string;
    isAutoSaved?: boolean;
    authorName?: string;
  }
): Promise<DocumentRevision> {
  const wordCount = countWordsFromContent(params.content);
  const newRevision: DocumentRevision = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    document_id: docId,
    user_id: params.userId,
    title: params.title || 'Untitled Document',
    content: params.content,
    word_count: wordCount,
    change_summary: params.changeSummary || (params.isAutoSaved ? 'Auto-saved snapshot' : 'Manual checkpoint'),
    is_auto_saved: Boolean(params.isAutoSaved),
    created_at: new Date().toISOString(),
    author_name: params.authorName || 'Author',
  };

  // 1. Immediately cache in local storage for instant responsiveness
  appendLocalRevision(docId, newRevision);

  // 2. Persist to server in background
  try {
    const res = await fetch(`/api/v1/documents/${encodeURIComponent(docId)}/revisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRevision),
    });

    if (res.ok) {
      const serverData = await res.json();
      if (serverData?.revision?.id) {
        // Update local cache with server assigned ID
        const localList = loadLocalRevisions(docId);
        const replaced = localList.map(r => r.id === newRevision.id ? serverData.revision : r);
        saveLocalRevisions(docId, replaced);
        return serverData.revision;
      }
    }
  } catch (err) {
    console.warn('Server revision persistence failed, retained in local storage:', err);
  }

  return newRevision;
}
