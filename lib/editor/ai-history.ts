export type AiHistoryEntry = {
  id: string;
  originalText: string;
  improvedText: string;
  tone: string;
  model: string;
  savedAt: string;
};

const MAX_AI_HISTORY_ITEMS = 15;
export const AI_HISTORY_STORAGE_KEY = 'scholarflow.editor.ai-history.v1';

export function loadAiHistory(): AiHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(AI_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[AI History] Failed to load history from localStorage:', err);
    return [];
  }
}

export function saveAiHistory(history: AiHistoryEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      AI_HISTORY_STORAGE_KEY,
      JSON.stringify(history.slice(0, MAX_AI_HISTORY_ITEMS))
    );
  } catch (err) {
    console.warn('[AI History] Failed to save history to localStorage:', err);
  }
}

export function addAiHistoryEntry(
  history: AiHistoryEntry[],
  entry: AiHistoryEntry
): AiHistoryEntry[] {
  // Saring entri dengan teks asli dan tone yang sama untuk menghindari duplikasi berulang
  const filtered = history.filter(
    (item) => !(item.originalText === entry.originalText && item.tone === entry.tone)
  );
  const nextHistory = [entry, ...filtered];
  const sliced = nextHistory.slice(0, MAX_AI_HISTORY_ITEMS);
  saveAiHistory(sliced);
  return sliced;
}
