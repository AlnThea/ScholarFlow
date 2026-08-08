// lib/api/suggestions.ts
// Helper API module for real-time Track Changes suggestions

export type DocumentSuggestion = {
  id: string;
  document_id: string;
  user_id?: string;
  author_name: string;
  selected_text: string;
  suggested_text: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  author?: string;
  old_text?: string;
  new_text?: string;
};

const localMemorySuggestions = new Map<string, DocumentSuggestion[]>();

export async function fetchSuggestions(docId: string): Promise<DocumentSuggestion[]> {
  try {
    const res = await fetch(`/api/v1/suggestions?docId=${encodeURIComponent(docId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.suggestions) {
        localMemorySuggestions.set(docId, data.suggestions);
        return data.suggestions;
      }
    }
  } catch (e) {
    console.warn('API fetch suggestions warning:', e);
  }
  return localMemorySuggestions.get(docId) || [];
}

export async function addSuggestion(
  docId: string,
  selectedText: string,
  suggestedText: string,
  authorName: string,
  suggestionId?: string,
  userId?: string
): Promise<DocumentSuggestion | null> {
  try {
    const res = await fetch('/api/v1/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        docId,
        suggestionId,
        userId,
        authorName,
        selectedText,
        suggestedText
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.suggestion) {
        const list = localMemorySuggestions.get(docId) || [];
        list.unshift(data.suggestion);
        localMemorySuggestions.set(docId, list);
        return data.suggestion;
      }
    }
  } catch (e) {
    console.warn('API add suggestion warning:', e);
  }
  return null;
}

export async function updateSuggestionStatus(
  docId: string,
  suggestionId: string,
  status: 'accepted' | 'rejected'
): Promise<boolean> {
  try {
    const res = await fetch('/api/v1/suggestions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docId, suggestionId, status })
    });
    if (res.ok) {
      const list = localMemorySuggestions.get(docId) || [];
      const item = list.find(s => s.id === suggestionId);
      if (item) item.status = status;
      return true;
    }
  } catch (e) {
    console.warn('API update suggestion warning:', e);
  }
  return false;
}
