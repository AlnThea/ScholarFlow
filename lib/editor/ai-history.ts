export type AiHistoryEntry = {
  id: string;
  originalText: string;
  improvedText: string;
  tone: string;
  model: string;
  savedAt: string;
  source?: 'cloud' | 'local';
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
  const nextHistory = [{ ...entry, source: entry.source || 'local' }, ...filtered];
  const sliced = nextHistory.slice(0, MAX_AI_HISTORY_ITEMS);
  saveAiHistory(sliced);
  return sliced;
}

export function convertCloudRecordToHistoryEntry(record: any): AiHistoryEntry {
  let formattedTime = 'Barusan';
  try {
    if (record.created_at) {
      formattedTime = new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  } catch (_) {}

  return {
    id: record.id,
    originalText: record.original_text || '',
    improvedText: record.result_text || '',
    tone: record.tone || (record.feature_type === 'stats' ? 'statistical' : (record.feature_type || 'academic')),
    model: record.model || 'gemini',
    savedAt: formattedTime,
    source: 'cloud',
  };
}

export function mergeAiHistories(
  localHistory: AiHistoryEntry[],
  cloudRecords: any[]
): AiHistoryEntry[] {
  const convertedCloud = cloudRecords.map(convertCloudRecordToHistoryEntry);
  
  // Combine: cloud records taking precedence for completed jobs, while preserving recent local drafts
  const map = new Map<string, AiHistoryEntry>();
  
  // First add local
  localHistory.forEach((item) => {
    const key = `${item.originalText}___${item.tone}`;
    map.set(key, item);
  });

  // Then add cloud (overwrites if identical, marked as cloud)
  convertedCloud.forEach((item) => {
    const key = `${item.originalText}___${item.tone}`;
    map.set(key, item);
  });

  const merged = Array.from(map.values()).slice(0, MAX_AI_HISTORY_ITEMS);
  saveAiHistory(merged);
  return merged;
}

