// lib/ai/edge-parser.ts
// In-Memory TypedArray Parser Helper for Edge Runtime (PDF, RIS, & BibTeX)

export type ParsedReference = {
  title?: string;
  authors?: string[];
  year?: number;
  doi?: string;
  journal?: string;
  abstract?: string;
  rawText?: string;
};

/**
 * Safely parse raw text from an ArrayBuffer / Uint8Array without Node 'fs'
 */
export function parseArrayBufferText(buffer: ArrayBuffer | Uint8Array): string {
  const decoder = new TextDecoder('utf-8');
  if (buffer instanceof Uint8Array) {
    return decoder.decode(buffer);
  }
  return decoder.decode(new Uint8Array(buffer));
}

/**
 * Parse RIS formatted text in-memory
 */
export function parseRisInMemory(risText: string): ParsedReference[] {
  const entries: ParsedReference[] = [];
  const blocks = risText.split(/ER\s\s?-\s?/);

  for (const block of blocks) {
    if (!block.trim()) continue;

    const ref: ParsedReference = { authors: [] };
    const lines = block.split('\n');

    for (const line of lines) {
      const match = line.match(/^([A-Z0-9]{2})\s*-\s*(.*)$/);
      if (!match) continue;

      const tag = match[1].trim();
      const val = match[2].trim();

      switch (tag) {
        case 'TI':
        case 'T1':
          ref.title = val;
          break;
        case 'AU':
        case 'A1':
          ref.authors?.push(val);
          break;
        case 'PY':
        case 'Y1':
          const yearMatch = val.match(/\d{4}/);
          if (yearMatch) ref.year = parseInt(yearMatch[0], 10);
          break;
        case 'DO':
          ref.doi = val.replace(/^https?:\/\/doi\.org\//i, '');
          break;
        case 'JO':
        case 'JF':
        case 'T2':
          ref.journal = val;
          break;
        case 'AB':
        case 'N2':
          ref.abstract = val;
          break;
      }
    }

    if (ref.title || (ref.authors && ref.authors.length > 0)) {
      entries.push(ref);
    }
  }

  return entries;
}

/**
 * Parse BibTeX formatted text in-memory
 */
export function parseBibtexInMemory(bibText: string): ParsedReference[] {
  const entries: ParsedReference[] = [];
  const bibBlocks = bibText.split(/@\w+\s*\{/);

  for (const block of bibBlocks) {
    if (!block.trim()) continue;

    const ref: ParsedReference = { authors: [] };

    const titleMatch = block.match(/title\s*=\s*[\"\{](.*?)[\"\}]/i);
    if (titleMatch) ref.title = titleMatch[1];

    const authorMatch = block.match(/author\s*=\s*[\"\{](.*?)[\"\}]/i);
    if (authorMatch) {
      ref.authors = authorMatch[1].split(/\s+and\s+/i).map((a) => a.trim());
    }

    const yearMatch = block.match(/year\s*=\s*[\"\{]?(\d{4})[\"\}]?/i);
    if (yearMatch) ref.year = parseInt(yearMatch[1], 10);

    const doiMatch = block.match(/doi\s*=\s*[\"\{](.*?)[\"\}]/i);
    if (doiMatch) ref.doi = doiMatch[1].replace(/^https?:\/\/doi\.org\//i, '');

    const journalMatch = block.match(/journal\s*=\s*[\"\{](.*?)[\"\}]/i);
    if (journalMatch) ref.journal = journalMatch[1];

    if (ref.title || (ref.authors && ref.authors.length > 0)) {
      entries.push(ref);
    }
  }

  return entries;
}
