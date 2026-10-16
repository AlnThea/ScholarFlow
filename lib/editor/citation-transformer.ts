// lib/editor/citation-transformer.ts
// ScholarFlow Bidirectional Reactive In-Text Citation Style Transformer
// Transforms citations between APA (Author-Year), IEEE (Numeric [1]), Harvard, Vancouver, and MLA

import type { CitationCandidate } from '@/lib/api/citations';
import { formatBibliographyCandidate } from './bibliography';

export type CitationStyleType = 'apa' | 'ieee' | 'harvard' | 'vancouver' | 'mla' | 'chicago';

export interface CitationStyleOption {
  id: CitationStyleType;
  label: string;
  category: 'numeric' | 'author-year';
  description: {
    en: string;
    id: string;
  };
  sample: string;
}

export const SUPPORTED_CITATION_STYLES: CitationStyleOption[] = [
  {
    id: 'apa',
    label: 'APA 7th Edition',
    category: 'author-year',
    description: {
      en: 'Standard author-year format used in social sciences, psychology, and education.',
      id: 'Format standar penulis-tahun untuk ilmu sosial, psikologi, dan pendidikan.',
    },
    sample: '(Vaswani et al., 2017)',
  },
  {
    id: 'ieee',
    label: 'IEEE',
    category: 'numeric',
    description: {
      en: 'Numbered citation in square brackets ordered by appearance in engineering and IT.',
      id: 'Sitasi berpenomoran tanda kurung siku sesuai urutan naskah untuk teknik dan ilmu komputer.',
    },
    sample: '[1]',
  },
  {
    id: 'harvard',
    label: 'Harvard',
    category: 'author-year',
    description: {
      en: 'Author-year format without comma between author and date for general academic research.',
      id: 'Format penulis-tahun tanpa tanda koma untuk riset akademis umum dan ekonomi.',
    },
    sample: '(Vaswani et al. 2017)',
  },
  {
    id: 'vancouver',
    label: 'Vancouver',
    category: 'numeric',
    description: {
      en: 'Numeric citation system commonly used in medicine, health sciences, and biology.',
      id: 'Sistem penomoran numerik untuk kedokteran, farmasi, dan ilmu kesehatan.',
    },
    sample: '(1)',
  },
  {
    id: 'chicago',
    label: 'Chicago (Author-Date)',
    category: 'author-year',
    description: {
      en: 'Author-date format widely used in humanities, physical, and natural sciences.',
      id: 'Format penulis-tahun untuk humaniora, sejarah, dan ilmu alam.',
    },
    sample: '(Vaswani et al. 2017)',
  },
  {
    id: 'mla',
    label: 'MLA 9th Edition',
    category: 'author-year',
    description: {
      en: 'Author and page style standard for literature, languages, and cultural studies.',
      id: 'Format nama penulis untuk bidang sastra, bahasa, dan kajian budaya.',
    },
    sample: '(Vaswani)',
  },
];

/**
 * Extracts author's family/last name from raw author string
 */
export function extractFamilyName(authorStr: string): string {
  if (!authorStr || typeof authorStr !== 'string') return 'Unknown';
  const trimmed = authorStr.trim();
  if (trimmed.includes(',')) {
    return trimmed.split(',')[0].trim();
  }
  const parts = trimmed.split(/\s+/);
  return parts[parts.length - 1].trim();
}

/**
 * Builds formatted in-text citation string based on candidate metadata and target style
 */
export function formatInTextCitationLabel(
  candidate: CitationCandidate | undefined | null,
  targetStyle: string,
  numericIndex?: number
): string {
  const cleanStyle = (targetStyle || 'apa').toLowerCase() as CitationStyleType;

  // 1. Numeric styles (IEEE, Vancouver)
  if (cleanStyle === 'ieee') {
    const num = numericIndex !== undefined ? numericIndex : 1;
    return `[${num}]`;
  }

  if (cleanStyle === 'vancouver') {
    const num = numericIndex !== undefined ? numericIndex : 1;
    return `(${num})`;
  }

  // 2. Author-Year styles (APA, Harvard, Chicago, MLA)
  const authors = candidate?.authors || [];
  const year = candidate?.year || 'n.d.';

  let authorPart = 'Unknown';
  if (authors.length === 1) {
    authorPart = extractFamilyName(authors[0]);
  } else if (authors.length === 2) {
    const f1 = extractFamilyName(authors[0]);
    const f2 = extractFamilyName(authors[1]);
    if (cleanStyle === 'harvard') {
      authorPart = `${f1} and ${f2}`;
    } else {
      authorPart = `${f1} & ${f2}`;
    }
  } else if (authors.length >= 3) {
    const f1 = extractFamilyName(authors[0]);
    authorPart = `${f1} et al.`;
  }

  if (cleanStyle === 'harvard' || cleanStyle === 'chicago') {
    return `(${authorPart} ${year})`;
  }

  if (cleanStyle === 'mla') {
    return `(${authorPart})`;
  }

  // Default: APA style "(Author, Year)"
  return `(${authorPart}, ${year})`;
}

/**
 * Scans EditorJS content to collect all unique reference IDs in the order they first appear
 */
export function extractReferenceIdsInOrder(content: any): string[] {
  if (!content || !Array.isArray(content.blocks)) return [];

  const foundIds: string[] = [];
  const seen = new Set<string>();

  const citeRegex = /<cite[^>]*?data-ref-id="([^"]+)"[^>]*?>/gi;

  for (const block of content.blocks) {
    if (!block || !block.data) continue;

    const checkText = (text: string) => {
      let match;
      while ((match = citeRegex.exec(text)) !== null) {
        const refId = match[1];
        if (refId && !seen.has(refId)) {
          seen.add(refId);
          foundIds.push(refId);
        }
      }
    };

    if (typeof block.data.text === 'string') {
      checkText(block.data.text);
    }
    if (Array.isArray(block.data.items)) {
      for (const item of block.data.items) {
        const itemText = typeof item === 'string' ? item : item?.content || '';
        checkText(itemText);
      }
    }
  }

  return foundIds;
}

/**
 * Transforms all in-text citations inside EditorJS blocks to match target style
 */
export function transformEditorContentCitations(
  content: any,
  targetStyle: string,
  citationLibrary: Record<string, CitationCandidate> = {}
): {
  newContent: any;
  transformedCount: number;
  refIdToNumericMap: Map<string, number>;
  orderedReferenceIds: string[];
} {
  if (!content || !Array.isArray(content.blocks)) {
    return {
      newContent: content,
      transformedCount: 0,
      refIdToNumericMap: new Map(),
      orderedReferenceIds: [],
    };
  }

  // Step 1: Collect reference IDs in order of first appearance
  const orderedReferenceIds = extractReferenceIdsInOrder(content);
  const refIdToNumericMap = new Map<string, number>();
  orderedReferenceIds.forEach((id, index) => {
    refIdToNumericMap.set(id, index + 1);
  });

  // Step 2: Deep clone content to transform safely
  const cloned = JSON.parse(JSON.stringify(content));
  let transformedCount = 0;

  const citeReplaceRegex = /<cite([^>]*?)data-ref-id="([^"]+)"([^>]*?)>([\s\S]*?)<\/cite>/gi;

  const replaceBlockText = (text: string): string => {
    return text.replace(citeReplaceRegex, (fullMatch, before, refId, after) => {
      const candidate = citationLibrary[refId];
      const numericIndex = refIdToNumericMap.get(refId) || 1;
      const newLabel = formatInTextCitationLabel(candidate, targetStyle, numericIndex);
      transformedCount++;
      return `<cite${before}data-ref-id="${refId}"${after}> ${newLabel}</cite>`;
    });
  };

  cloned.blocks.forEach((block: any) => {
    if (!block || !block.data) return;

    if (typeof block.data.text === 'string') {
      block.data.text = replaceBlockText(block.data.text);
    } else if (Array.isArray(block.data.items)) {
      block.data.items = block.data.items.map((item: any) => {
        if (typeof item === 'string') {
          return replaceBlockText(item);
        } else if (item && typeof item.content === 'string') {
          return { ...item, content: replaceBlockText(item.content) };
        }
        return item;
      });
    }
  });

  return {
    newContent: cloned,
    transformedCount,
    refIdToNumericMap,
    orderedReferenceIds,
  };
}

/**
 * Sorts and formats bibliography entries based on the active citation style convention:
 * - Numeric styles (IEEE, Vancouver): Sorted by order of appearance [1], [2], [3]...
 * - Author-Year styles (APA, Harvard, MLA, Chicago): Sorted alphabetically (A-Z) by first author's family name.
 */
export function sortAndFormatBibliography(
  referenceIds: string[],
  citationLibrary: Record<string, CitationCandidate>,
  targetStyle: string = 'apa',
  orderedIdsInDocument: string[] = [],
  locale: string = 'en-US'
): Array<{ referenceId: string; label: string; formatted: string; numericIndex?: number }> {
  const cleanStyle = (targetStyle || 'apa').toLowerCase();
  const isNumericStyle = cleanStyle === 'ieee' || cleanStyle === 'vancouver';

  const candidatesWithMeta = referenceIds
    .map((id) => {
      const candidate = citationLibrary[id];
      if (!candidate) return null;

      // Determine order index from document appearance
      const docAppearanceIndex = orderedIdsInDocument.indexOf(id);
      const appearanceRank = docAppearanceIndex !== -1 ? docAppearanceIndex + 1 : 9999;

      const firstAuthor = candidate.authors && candidate.authors.length > 0 ? candidate.authors[0] : '';
      const familyName = extractFamilyName(firstAuthor).toLowerCase();

      return {
        candidate,
        id,
        appearanceRank,
        familyName,
      };
    })
    .filter(Boolean) as Array<{
      candidate: CitationCandidate;
      id: string;
      appearanceRank: number;
      familyName: string;
    }>;

  if (isNumericStyle) {
    // Sort by appearance in the document [1], [2], [3]...
    candidatesWithMeta.sort((a, b) => a.appearanceRank - b.appearanceRank);
  } else {
    // Sort alphabetically by first author's family name (A-Z)
    candidatesWithMeta.sort((a, b) => a.familyName.localeCompare(b.familyName));
  }

  return candidatesWithMeta.map((item, idx) => {
    const numericIndex = isNumericStyle ? item.appearanceRank : idx + 1;
    const label = isNumericStyle
      ? cleanStyle === 'ieee'
        ? `[${numericIndex}]`
        : `(${numericIndex})`
      : item.candidate.citation_label || item.candidate.title.substring(0, 20);

    const formatted = formatBibliographyCandidate(item.candidate, cleanStyle, locale);

    return {
      referenceId: item.id,
      label,
      formatted,
      numericIndex,
    };
  });
}
