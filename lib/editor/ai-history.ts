export type AiHistoryEntry = {
  id: string;
  originalText: string;
  improvedText: string;
  tone: string;
  model: string;
  savedAt: string;
};

const MAX_AI_HISTORY_ITEMS = 10;

export function addAiHistoryEntry(
  history: AiHistoryEntry[],
  entry: AiHistoryEntry
): AiHistoryEntry[] {
  // Saring entri dengan teks asli dan tone yang sama untuk menghindari duplikasi berulang
  const filtered = history.filter(
    (item) => !(item.originalText === entry.originalText && item.tone === entry.tone)
  );
  const nextHistory = [entry, ...filtered];
  return nextHistory.slice(0, MAX_AI_HISTORY_ITEMS);
}
