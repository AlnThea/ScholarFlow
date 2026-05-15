import type { JSONContent } from '@tiptap/core';
import type { CitationCandidate } from '@/lib/api/citations';

export type BibliographyEntry = {
  referenceId: string;
  label: string;
  formatted: string;
};

type CitationNode = {
  type?: string;
  attrs?: {
    referenceId?: string | null;
    label?: string | null;
  };
  content?: CitationNode[];
};

function walkCitationNodes(node: CitationNode | CitationNode[] | null | undefined, out: CitationNode[] = []): CitationNode[] {
  if (!node) return out;
  if (Array.isArray(node)) {
    for (const child of node) {
      walkCitationNodes(child, out);
    }
    return out;
  }

  if (node.type === 'citationMarker') {
    out.push(node);
  }

  if (node.content) {
    walkCitationNodes(node.content, out);
  }

  return out;
}

export function collectCitationReferenceIds(doc: JSONContent | null | undefined): string[] {
  if (!doc) return [];

  const markers = walkCitationNodes(doc);
  const seen = new Set<string>();
  const ids: string[] = [];

  for (const marker of markers) {
    const referenceId = marker.attrs?.referenceId?.trim();
    if (!referenceId || seen.has(referenceId)) {
      continue;
    }
    seen.add(referenceId);
    ids.push(referenceId);
  }

  return ids;
}

function formatAuthors(authors: string[]): string {
  if (authors.length === 0) return 'Unknown author';
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} & ${authors[1]}`;
  return `${authors[0]} et al.`;
}

export function formatBibliographyCandidate(candidate: CitationCandidate): string {
  const authors = formatAuthors(candidate.authors);
  const year = candidate.year ? `(${candidate.year})` : '(n.d.)';
  const title = candidate.title;
  const source = candidate.source;
  const parts = [authors, year, title, source];

  if (candidate.doi) {
    parts.push(`DOI: ${candidate.doi}`);
  } else if (candidate.url) {
    parts.push(candidate.url);
  }

  return parts.filter(Boolean).join('. ');
}

export function buildBibliographyEntries(
  doc: JSONContent | null | undefined,
  citationLibrary: Record<string, CitationCandidate>,
): BibliographyEntry[] {
  const referenceIds = collectCitationReferenceIds(doc);
  const entries: BibliographyEntry[] = [];

  for (const referenceId of referenceIds) {
    const candidate = citationLibrary[referenceId];
    if (!candidate) continue;

    entries.push({
      referenceId,
      label: candidate.citation_label,
      formatted: formatBibliographyCandidate(candidate),
    });
  }

  return entries;
}
