import { Cite } from '@citation-js/core';
import '@citation-js/plugin-csl';
import type { CitationCandidate } from '@/lib/api/citations';

export type BibliographyEntry = {
  referenceId: string;
  label: string;
  formatted: string;
};

function formatAuthors(authors: string[]): string {
  if (authors.length === 0) return 'Unknown author';
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} & ${authors[1]}`;
  return `${authors[0]} et al.`;
}

export function formatBibliographyCandidate(
  candidate: CitationCandidate,
  style = 'apa',
  lang = 'en-US'
): string {
  try {
    const csl: any = {
      id: candidate.reference_id,
      type: 'article-journal',
      title: candidate.title,
      'container-title': candidate.source,
      DOI: candidate.doi || undefined,
      URL: candidate.url || undefined,
    };

    if (candidate.year) {
      csl.issued = { 'date-parts': [[candidate.year]] };
    }

    if (candidate.authors && candidate.authors.length > 0) {
      csl.author = candidate.authors.map((author) => {
        if (author.includes(',')) {
          const parts = author.split(',');
          return {
            family: parts[0].trim(),
            given: parts.slice(1).join(',').trim(),
          };
        } else {
          const parts = author.trim().split(/\s+/);
          if (parts.length === 1) {
            return { literal: author };
          } else {
            const family = parts[parts.length - 1];
            const given = parts.slice(0, parts.length - 1).join(' ');
            return { family, given };
          }
        }
      });
    }

    const cite = new Cite([csl]);
    const formatted = cite.format('bibliography', {
      format: 'text',
      template: style,
      lang: lang,
    });

    return formatted.trim();
  } catch (error) {
    console.error('Error formatting citation with citation.js, falling back to manual format:', error);
    // Fallback to original manual formatting logic
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
}

export function serializeBibliographyText(entries: BibliographyEntry[]): string {
  if (entries.length === 0) {
    return 'No bibliography entries available.';
  }

  return entries
    .map((entry) => `[${entry.label}] ${entry.formatted}`)
    .join('\n\n');
}
