import type { CitationCandidate } from '@/lib/api/citations';

function formatAuthors(authors: string[]): string {
  if (authors.length === 0) return 'Unknown author';
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} & ${authors[1]}`;
  return `${authors[0]} et al.`;
}

export function formatCitationCandidate(candidate: CitationCandidate): string {
  const authors = formatAuthors(candidate.authors);
  const year = candidate.year ? `(${candidate.year})` : '(n.d.)';
  const parts = [candidate.citation_label, authors, year, candidate.title, candidate.source];

  if (candidate.doi) {
    parts.push(`DOI: ${candidate.doi}`);
  } else if (candidate.url) {
    parts.push(candidate.url);
  }

  return parts.filter(Boolean).join('. ');
}

export function serializeCitationCandidatesText(candidates: CitationCandidate[]): string {
  if (candidates.length === 0) {
    return 'No citation results available.';
  }

  return candidates
    .map((candidate, index) => {
      const reason = candidate.ranking_reason.length > 0
        ? `Ranking: ${candidate.ranking_reason.join(', ')}`
        : null;
      const score = `Score: ${candidate.ranking_score.toFixed(1)}`;
      const metadata = [score, reason].filter(Boolean).join(' | ');

      return [
        `${index + 1}. ${formatCitationCandidate(candidate)}`,
        `Source: ${candidate.source}`,
        metadata ? metadata : null,
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n\n');
}
