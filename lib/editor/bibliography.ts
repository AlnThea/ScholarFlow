import { Cite } from '@citation-js/core';
import '@citation-js/plugin-csl';
import type { CitationCandidate } from '@/lib/api/citations';

export type BibliographyEntry = {
  referenceId: string;
  label: string;
  formatted: string;
};

function formatAuthorsForStyle(authors: string[], style: string): string {
  if (authors.length === 0) return 'Unknown author';
  
  // Clean authors to extract parts
  const parsedAuthors = authors.map(author => {
    if (author.includes(',')) {
      const parts = author.split(',');
      return {
        family: parts[0].trim(),
        given: parts.slice(1).join(',').trim()
      };
    } else {
      const parts = author.trim().split(/\s+/);
      if (parts.length === 1) {
        return { family: author, given: '' };
      } else {
        const family = parts[parts.length - 1];
        const given = parts.slice(0, parts.length - 1).join(' ');
        return { family, given };
      }
    }
  });

  const getInitials = (given: string) => {
    if (!given) return '';
    return given.split(/\s+/).map(p => p[0] ? `${p[0]}.` : '').join(' ');
  };

  const cleanStyle = style.toLowerCase();

  if (cleanStyle === 'ieee') {
    // IEEE style: Initials Given Family (e.g. J. S. Smith)
    const formattedList = parsedAuthors.map(auth => {
      const init = getInitials(auth.given);
      return init ? `${init} ${auth.family}` : auth.family;
    });
    if (formattedList.length === 1) return formattedList[0];
    if (formattedList.length === 2) return `${formattedList[0]} and ${formattedList[1]}`;
    return `${formattedList.slice(0, -1).join(', ')}, and ${formattedList[formattedList.length - 1]}`;
  }

  if (cleanStyle === 'mla' || cleanStyle === 'chicago') {
    // MLA/Chicago style: Last, First for 1st author; First Last for subsequent ones
    const formattedList = parsedAuthors.map((auth, idx) => {
      if (idx === 0) {
        return auth.given ? `${auth.family}, ${auth.given}` : auth.family;
      } else {
        return auth.given ? `${auth.given} ${auth.family}` : auth.family;
      }
    });
    if (formattedList.length === 1) return formattedList[0];
    if (formattedList.length === 2) return `${formattedList[0]} and ${formattedList[1]}`;
    return `${formattedList.slice(0, -1).join(', ')}, and ${formattedList[formattedList.length - 1]}`;
  }

  if (cleanStyle === 'harvard') {
    // Harvard style: Family, Initials (e.g. Smith, J.S.)
    const formattedList = parsedAuthors.map(auth => {
      const init = getInitials(auth.given);
      return init ? `${auth.family}, ${init}` : auth.family;
    });
    if (formattedList.length === 1) return formattedList[0];
    if (formattedList.length === 2) return `${formattedList[0]} and ${formattedList[1]}`;
    return `${formattedList.slice(0, -1).join(', ')} & ${formattedList[formattedList.length - 1]}`;
  }

  // Default APA style: Family, Initials (e.g. Smith, J. S.) with &
  const formattedList = parsedAuthors.map(auth => {
    const init = getInitials(auth.given);
    return init ? `${auth.family}, ${init}` : auth.family;
  });
  if (formattedList.length === 1) return formattedList[0];
  if (formattedList.length === 2) return `${formattedList[0]} & ${formattedList[1]}`;
  return `${formattedList.slice(0, -1).join(', ')}, & ${formattedList[formattedList.length - 1]}`;
}

function formatManualBibliography(candidate: CitationCandidate, style: string): string {
  const authors = formatAuthorsForStyle(candidate.authors, style);
  const year = candidate.year || '';
  const title = candidate.title;
  const source = candidate.source;

  const cleanStyle = style.toLowerCase();

  if (cleanStyle === 'ieee') {
    return `${authors}, "${title}," <i>${source}</i>, ${year}.${candidate.doi ? ` DOI: ${candidate.doi}.` : ''}`;
  }

  if (cleanStyle === 'harvard') {
    const yearStr = year ? ` (${year})` : ' (n.d.)';
    return `${authors}${yearStr} '${title}', <i>${source}</i>.${candidate.doi ? ` DOI: ${candidate.doi}.` : candidate.url ? ` Available at: ${candidate.url}.` : ''}`;
  }

  if (cleanStyle === 'mla') {
    const yearStr = year ? `, ${year}` : '';
    return `${authors}. "${title}." <i>${source}</i>${yearStr}.${candidate.doi ? ` DOI: ${candidate.doi}.` : candidate.url ? ` ${candidate.url}.` : ''}`;
  }

  if (cleanStyle === 'chicago') {
    const yearStr = year ? ` (${year})` : '';
    return `${authors}. "${title}." <i>${source}</i>${yearStr}.${candidate.doi ? ` DOI: ${candidate.doi}.` : candidate.url ? ` ${candidate.url}.` : ''}`;
  }

  // Default APA
  const yearStr = year ? `(${year})` : '(n.d.)';
  const parts = [authors, yearStr, title, `<i>${source}</i>`].filter(Boolean);
  const mainStr = parts.join('. ');
  if (candidate.doi) {
    return `${mainStr}. DOI: ${candidate.doi}`;
  } else if (candidate.url) {
    return `${mainStr}. ${candidate.url}`;
  }
  return mainStr;
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
    let formatted = cite.format('bibliography', {
      format: 'html',
      template: style.toLowerCase(),
      lang: lang,
    }) as string;

    // Clean outer div tags commonly returned in html format by citation-js
    formatted = formatted
      .replace(/<div[^>]*>/g, '')
      .replace(/<\/div>/g, '')
      .trim();

    return formatted;
  } catch (error) {
    // If citation-js fails (e.g. because style template is not loaded), fallback to manual styling
    return formatManualBibliography(candidate, style);
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
