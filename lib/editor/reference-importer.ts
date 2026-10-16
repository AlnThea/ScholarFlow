import type { CitationCandidate } from '@/lib/api/citations';

/**
 * Normalizes DOI by stripping url prefixes (doi.org, dx.doi.org, https://...)
 * and removing trailing punctuation.
 */
export function normalizeDoi(rawDoi: string | null | undefined): string | null {
  if (!rawDoi) return null;
  let doi = rawDoi.trim();
  doi = doi.replace(/^(https?:\/\/)?(dx\.)?doi\.org\//i, '');
  doi = doi.replace(/^[dD][oO][iI]:\s*/, '');
  doi = doi.replace(/[.,;:)\]]+$/, ''); // Strip trailing punctuation
  return doi.trim() || null;
}

/**
 * Generates an academic citation label like [Smith et al., 2023] or [Smith & Doe, 2021]
 */
export function generateCitationLabel(authors: string[], year: number | null, fallbackKey?: string): string {
  const yearStr = year ? String(year) : 'n.d.';
  if (!authors || authors.length === 0) {
    if (fallbackKey) return `[${fallbackKey}, ${yearStr}]`;
    return `[Unknown, ${yearStr}]`;
  }

  const getFamilyName = (authorStr: string): string => {
    const cleaned = authorStr.trim();
    if (cleaned.includes(',')) {
      return cleaned.split(',')[0].trim();
    }
    const parts = cleaned.split(/\s+/);
    return parts[parts.length - 1] || cleaned;
  };

  const firstAuthor = getFamilyName(authors[0]);

  if (authors.length === 1) {
    return `[${firstAuthor}, ${yearStr}]`;
  }
  if (authors.length === 2) {
    const secondAuthor = getFamilyName(authors[1]);
    return `[${firstAuthor} & ${secondAuthor}, ${yearStr}]`;
  }
  return `[${firstAuthor} et al., ${yearStr}]`;
}

/**
 * Generates a clean, unique reference_id (cite key)
 */
export function generateReferenceId(authors: string[], year: number | null, title?: string, fallbackKey?: string): string {
  if (fallbackKey && fallbackKey.trim()) {
    return fallbackKey.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  }
  const firstAuthor = authors && authors.length > 0
    ? authors[0].toLowerCase().replace(/[^a-z0-9]/g, '')
    : 'ref';
  const yearStr = year ? String(year) : 'nd';
  const titlePart = title
    ? title.toLowerCase().split(/\s+/).slice(0, 2).join('').replace(/[^a-z0-9]/g, '')
    : '';
  const rand = Math.random().toString(36).substring(2, 6);
  return `${firstAuthor}${yearStr}${titlePart ? `_${titlePart}` : ''}_${rand}`;
}

/**
 * Cleans BibTeX field value: strips enclosing quotes/braces and unescapes common LaTeX symbols
 */
export function cleanBibtexValue(val: string): string {
  if (!val) return '';
  let cleaned = val.trim();

  // Strip trailing commas
  cleaned = cleaned.replace(/,\s*$/, '');

  // Strip outer quotes or braces
  if ((cleaned.startsWith('{') && cleaned.endsWith('}')) || (cleaned.startsWith('"') && cleaned.endsWith('"'))) {
    cleaned = cleaned.slice(1, -1);
  }

  // Unescape common LaTeX characters
  cleaned = cleaned
    .replace(/\\&/g, '&')
    .replace(/\\%/g, '%')
    .replace(/\\#/g, '#')
    .replace(/\\_/g, '_')
    .replace(/\\\{/g, '{')
    .replace(/\\\}/g, '}')
    .replace(/\\"/g, '"')
    .replace(/\{([^{}]+)\}/g, '$1') // unwrap inner braces like {DNA} -> DNA
    .replace(/\\['`^"~=.]\{?([a-zA-Z])\}?/g, '$1') // remove basic diacritics
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
}

/**
 * Splits BibTeX authors separated by "and"
 */
export function parseBibtexAuthors(authorsStr: string): string[] {
  if (!authorsStr) return [];
  const rawList = authorsStr.split(/\s+and\s+/i);
  return rawList
    .map((auth) => cleanBibtexValue(auth))
    .filter((auth) => Boolean(auth && auth.length > 0));
}

/**
 * Parses a BibTeX (.bib) file string into an array of CitationCandidate
 */
export function parseBibtexFile(content: string): CitationCandidate[] {
  if (!content || !content.trim()) return [];

  const candidates: CitationCandidate[] = [];
  // Match entries: @type{key, fields...}
  const entryRegex = /@([a-zA-Z]+)\s*\{\s*([^,\s]+)\s*,\s*([\s\S]*?)(?=\n@|\r\n@|\s*$)/g;
  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(content)) !== null) {
    const entryType = match[1].toLowerCase();
    const citeKey = match[2].trim();
    const body = match[3];

    // Skip non-reference entries like @comment, @string, @preamble
    if (['comment', 'string', 'preamble'].includes(entryType)) {
      continue;
    }

    const fields: Record<string, string> = {};

    // Match individual field = {value} or field = "value" or field = 1234
    // Using regex that captures key and braced/quoted/bare value
    const fieldRegex = /([a-zA-Z_-]+)\s*=\s*(?:\{([\s\S]*?)\}|"([\s\S]*?)"|([^\s,}]+))/g;
    let fieldMatch: RegExpExecArray | null;

    while ((fieldMatch = fieldRegex.exec(body)) !== null) {
      const fieldKey = fieldMatch[1].toLowerCase();
      const val = fieldMatch[2] !== undefined
        ? fieldMatch[2]
        : fieldMatch[3] !== undefined
          ? fieldMatch[3]
          : fieldMatch[4];
      if (val !== undefined) {
        fields[fieldKey] = cleanBibtexValue(val);
      }
    }

    const title = fields.title || fields.booktitle || `Untitled (${citeKey})`;
    const authors = parseBibtexAuthors(fields.author || fields.editor || '');
    
    let year: number | null = null;
    if (fields.year) {
      const yrMatch = fields.year.match(/\b(18|19|20)\d{2}\b/);
      if (yrMatch) {
        year = parseInt(yrMatch[0], 10);
      }
    }

    const journal = fields.journal || fields.booktitle || fields.publisher || fields.school || fields.institution || null;
    const source = journal || (entryType ? `${entryType.toUpperCase()} Publication` : 'Academic Reference');
    const doi = normalizeDoi(fields.doi);
    const url = fields.url || (doi ? `https://doi.org/${doi}` : null);
    const abstract = fields.abstract || null;
    const pdfUrl = fields.file || fields.pdf || null;

    const citationLabel = generateCitationLabel(authors, year, citeKey);
    const referenceId = citeKey || generateReferenceId(authors, year, title);

    candidates.push({
      source,
      title,
      authors: authors.length > 0 ? authors : ['Unknown Author'],
      year,
      doi,
      url,
      reference_id: referenceId,
      citation_label: citationLabel,
      ranking_score: 1.0,
      ranking_reason: ['Imported from BibTeX (.bib) file'],
      abstract,
      journal,
      cited_by_count: 0,
      pdf_url: pdfUrl,
    });
  }

  return candidates;
}

/**
 * Parses an RIS (.ris) file string containing one or multiple records into CitationCandidate[]
 */
export function parseRisFile(content: string): CitationCandidate[] {
  if (!content || !content.trim()) return [];

  const candidates: CitationCandidate[] = [];
  // Records are terminated by "ER  -" or file boundary
  const rawRecords = content.split(/\r?\n\s*ER\s*-\s*/i);

  for (const rawRecord of rawRecords) {
    if (!rawRecord.trim()) continue;

    const lines = rawRecord.split(/\r?\n/);
    let title = '';
    const authors: string[] = [];
    let journal = '';
    let year: number | null = null;
    let doi: string | null = null;
    let url: string | null = null;
    let abstract = '';
    let id = '';
    let type = '';

    for (const line of lines) {
      const match = line.match(/^([A-Z0-9]{2})\s*-\s*(.*)$/);
      if (!match) continue;

      const tag = match[1].toUpperCase();
      const val = match[2].trim();

      switch (tag) {
        case 'TY':
          type = val;
          break;
        case 'TI':
        case 'T1':
        case 'CT':
          if (!title) title = val;
          break;
        case 'AU':
        case 'A1':
        case 'A2':
        case 'ED':
          if (val) authors.push(val);
          break;
        case 'JO':
        case 'JF':
        case 'JA':
        case 'T2':
          if (!journal) journal = val;
          break;
        case 'PY':
        case 'Y1':
        case 'DA':
          if (!year) {
            const yrMatch = val.match(/\b(18|19|20)\d{2}\b/);
            if (yrMatch) year = parseInt(yrMatch[0], 10);
          }
          break;
        case 'DO':
          if (!doi) doi = val;
          break;
        case 'UR':
        case 'LK':
          if (!url) url = val;
          break;
        case 'AB':
        case 'N2':
          abstract = abstract ? `${abstract} ${val}` : val;
          break;
        case 'ID':
          if (!id) id = val;
          break;
      }
    }

    // Skip empty records
    if (!title && authors.length === 0 && !doi) {
      continue;
    }

    const cleanDoi = normalizeDoi(doi);
    const cleanUrl = url || (cleanDoi ? `https://doi.org/${cleanDoi}` : null);
    const cleanTitle = title || (cleanDoi ? `Paper DOI: ${cleanDoi}` : 'Untitled RIS Reference');
    const source = journal || (type ? `${type} Publication` : 'RIS Journal');
    const citeKey = id || generateReferenceId(authors, year, cleanTitle);
    const citationLabel = generateCitationLabel(authors, year, citeKey);

    candidates.push({
      source,
      title: cleanTitle,
      authors: authors.length > 0 ? authors : ['Unknown Author'],
      year,
      doi: cleanDoi,
      url: cleanUrl,
      reference_id: citeKey,
      citation_label: citationLabel,
      ranking_score: 1.0,
      ranking_reason: ['Imported from RIS (.ris) file'],
      abstract: abstract || null,
      journal: journal || null,
      cited_by_count: 0,
      pdf_url: null,
    });
  }

  return candidates;
}

/**
 * Searches for DOI inside raw text or buffer string
 */
export function extractDoiFromText(text: string): string | null {
  if (!text) return null;
  // Standard DOI regex pattern
  const doiRegex = /\b(10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+)\b/;
  const match = text.match(doiRegex);
  if (!match) return null;
  return normalizeDoi(match[1]);
}

/**
 * Extracts basic metadata from PDF file content (searches for DOIs, Title, Author)
 */
export async function extractPdfMetadata(file: File): Promise<CitationCandidate | null> {
  try {
    // Read the first 256KB of the PDF file to scan header and metadata dictionaries
    const slice = file.slice(0, 256 * 1024);
    const arrayBuffer = await slice.arrayBuffer();
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const textChunk = decoder.decode(arrayBuffer);

    const foundDoi = extractDoiFromText(textChunk);

    // Look for PDF info dictionary tags: /Title, /Author, /CreationDate
    let title: string | null = null;
    const titleMatch = textChunk.match(/\/Title\s*(?:\(([^)]{3,200})\)|<([0-9a-fA-F]{6,400})>)/);
    if (titleMatch) {
      title = titleMatch[1] || null;
    }

    let author: string | null = null;
    const authorMatch = textChunk.match(/\/Author\s*(?:\(([^)]{2,100})\)|<([0-9a-fA-F]{4,200})>)/);
    if (authorMatch) {
      author = authorMatch[1] || null;
    }

    let year: number | null = null;
    const dateMatch = textChunk.match(/\/CreationDate\s*\(\s*D:\s*(\d{4})/);
    if (dateMatch) {
      year = parseInt(dateMatch[1], 10);
    } else {
      // Fallback: check file lastModified
      const fileYear = new Date(file.lastModified).getFullYear();
      if (fileYear >= 1990 && fileYear <= new Date().getFullYear()) {
        year = fileYear;
      }
    }

    // Clean file name as title fallback (e.g., "1706.03762v7_Attention_is_all_you_need.pdf")
    const cleanFileName = file.name
      .replace(/\.pdf$/i, '')
      .replace(/[-_]+/g, ' ')
      .trim();

    const resolvedTitle = title && title.trim().length > 3 ? title.trim() : cleanFileName;
    const authors = author && author.trim().length > 1 ? [author.trim()] : ['Unknown Author'];
    const citeKey = generateReferenceId(authors, year, resolvedTitle);
    const label = generateCitationLabel(authors, year, citeKey);

    return {
      source: 'PDF Document Import',
      title: resolvedTitle,
      authors,
      year,
      doi: foundDoi,
      url: foundDoi ? `https://doi.org/${foundDoi}` : null,
      reference_id: citeKey,
      citation_label: label,
      ranking_score: 1.0,
      ranking_reason: [
        foundDoi ? `Extracted DOI: ${foundDoi}` : 'Imported from PDF metadata',
      ],
      abstract: null,
      journal: 'Imported PDF',
      cited_by_count: 0,
      pdf_url: null,
    };
  } catch (err) {
    console.error('[ReferenceImporter] Failed to extract PDF metadata:', err);
    return null;
  }
}

/**
 * Universal router: parses any bibliographic file (.bib, .ris, .pdf, or text)
 */
export async function parseReferenceFile(file: File): Promise<CitationCandidate[]> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.pdf')) {
    const candidate = await extractPdfMetadata(file);
    return candidate ? [candidate] : [];
  }

  const text = await file.text();

  if (fileName.endsWith('.bib') || fileName.endsWith('.bibtex')) {
    return parseBibtexFile(text);
  }

  if (fileName.endsWith('.ris')) {
    return parseRisFile(text);
  }

  // Heuristic inspection if file extension is .txt or untyped
  if (text.includes('@article') || text.includes('@book') || text.includes('@inproceedings') || text.includes('@misc')) {
    return parseBibtexFile(text);
  }

  if (text.includes('TY  -') || text.includes('ER  -')) {
    return parseRisFile(text);
  }

  return [];
}
