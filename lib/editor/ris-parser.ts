import type { CitationCandidate } from '@/lib/api/citations';

export const parseRISContent = (text: string): Partial<CitationCandidate> => {
  const lines = text.split(/\r?\n/);
  let title = '';
  const authors: string[] = [];
  let journal = '';
  let year: number | null = null;
  let doi: string | null = null;
  let url: string | null = null;

  for (const line of lines) {
    const match = line.match(/^([A-Z0-9]{2})\s*-\s*(.*)$/);
    if (!match) continue;
    const tag = match[1];
    const val = match[2].trim();

    switch (tag) {
      case 'TI':
      case 'T1':
        title = val;
        break;
      case 'AU':
      case 'A1':
        authors.push(val);
        break;
      case 'JO':
      case 'T2':
      case 'JF':
        journal = val;
        break;
      case 'PY':
      case 'Y1':
        const yrMatch = val.match(/\b(19|20)\d{2}\b/);
        if (yrMatch) year = parseInt(yrMatch[0]);
        break;
      case 'DO':
        doi = val;
        break;
      case 'UR':
        url = val;
        break;
    }
  }

  if (doi && doi.includes('doi.org/')) {
    doi = doi.split('doi.org/')[1];
  }

  return {
    title: title || 'Untitled RIS Import',
    authors: authors.length > 0 ? authors : ['Unknown Author'],
    year: year || new Date().getFullYear(),
    doi: doi || null,
    url: url || null,
    journal: journal || null,
  };
};
