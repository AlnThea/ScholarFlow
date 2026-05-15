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
};

export type CitationSearchResponse = {
  query: string;
  results: CitationCandidate[];
  sources: string[];
  note: string | null;
};

export async function searchCitations(
  apiBaseUrl: string,
  query: string,
  limit = 5,
): Promise<CitationSearchResponse> {
  const response = await fetch(`${apiBaseUrl}/citations/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, limit }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to search citations.');
  }

  return (await response.json()) as CitationSearchResponse;
}
