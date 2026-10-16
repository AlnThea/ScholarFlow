// lib/ai/paper-chat.ts
// Client helper & state management for Interactive "Chat with Paper" Assistant (Phase 23)

export interface PaperChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedCitationSentence?: string;
  timestamp: string;
}

export interface PaperInsights {
  methodology?: string;
  sampleSize?: string;
  keyFindings?: string;
  limitations?: string;
}

export interface PaperChatResponse {
  answer: string;
  extractedInsights?: PaperInsights;
  suggestedCitationSentence?: string;
  conversation: PaperChatMessage[];
  tokensConsumed?: number;
  quotaRemaining?: number;
}

const STORAGE_PREFIX = 'scholarflow.paper_chat.v1.';

/**
 * Load chat history for a paper from server or localStorage fallback
 */
export async function loadPaperChatHistory(
  referenceId: string,
  userId?: string
): Promise<PaperChatMessage[]> {
  if (!referenceId) return [];

  // Try API first if user is logged in
  if (userId) {
    try {
      const res = await fetch(`/api/v1/ai/paper-chat?referenceId=${encodeURIComponent(referenceId)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          // Sync to localStorage as offline cache
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(
              `${STORAGE_PREFIX}${referenceId}`,
              JSON.stringify(data.messages)
            );
          }
          return data.messages;
        }
      }
    } catch (err) {
      console.warn('[PaperChat] Failed to fetch cloud conversation, using local fallback:', err);
    }
  }

  // LocalStorage fallback
  if (typeof window !== 'undefined') {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${referenceId}`);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // ignore JSON parse error
      }
    }
  }

  return [];
}

/**
 * Save chat history to localStorage cache
 */
export function cacheLocalPaperChat(referenceId: string, messages: PaperChatMessage[]): void {
  if (typeof window === 'undefined' || !referenceId) return;
  try {
    window.localStorage.setItem(
      `${STORAGE_PREFIX}${referenceId}`,
      JSON.stringify(messages)
    );
  } catch (err) {
    console.warn('[PaperChat] Failed to cache local chat:', err);
  }
}

/**
 * Clear chat history for a specific paper
 */
export async function clearPaperChatHistory(
  referenceId: string,
  userId?: string
): Promise<boolean> {
  if (!referenceId) return false;

  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(`${STORAGE_PREFIX}${referenceId}`);
  }

  if (userId) {
    try {
      await fetch(`/api/v1/ai/paper-chat?referenceId=${encodeURIComponent(referenceId)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('[PaperChat] Failed to clear cloud conversation:', err);
    }
  }

  return true;
}
