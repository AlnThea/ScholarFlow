// lib/api/citations.ts
// Citation search helper — memanggil /api/citations/search (Next.js route)
// yang akan cek Supabase cache terlebih dahulu sebelum hit OpenAlex/Crossref

export type CitationCandidate = {
  source: string;
  title: string;
  authors: string[];
  year: number | null;
  doi: string | null;
  url: string | null;
  reference_id: string;
  citation_label: string;
  ranking_score: number;
  ranking_reason: string[];
  abstract: string | null;
  journal: string | null;
  cited_by_count: number;
  pdf_url: string | null;
};

export type CitationSearchResponse = {
  query: string;
  results: CitationCandidate[];
  sources: string[];
  cached: boolean;
  note: string | null;
};

export async function searchCitations(
  query: string,
  limit = 5,
): Promise<CitationSearchResponse> {
  const response = await fetch('/api/citations/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, limit }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to search citations.');
  }

  return (await response.json()) as CitationSearchResponse;
}
