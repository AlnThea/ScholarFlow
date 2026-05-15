export type CitationHistoryEntry = {
  query: string;
  resultCount: number;
  note: string | null;
  savedAt: string;
};

const MAX_CITATION_HISTORY_ITEMS = 6;

export function addCitationHistoryEntry(
  history: CitationHistoryEntry[],
  entry: CitationHistoryEntry,
): CitationHistoryEntry[] {
  const nextHistory = [entry, ...history.filter((item) => item.query !== entry.query)];
  return nextHistory.slice(0, MAX_CITATION_HISTORY_ITEMS);
}
