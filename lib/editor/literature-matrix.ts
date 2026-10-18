/**
 * literature-matrix.ts
 *
 * Interactive Literature Matrix & Synthesis Grid Engine.
 * Extracts, structures, and synthesizes research papers from citation libraries
 * into standardized academic comparison matrices (Author, Methodology, Sample, Findings, Limitations).
 * Supports export to CSV, Markdown Table, and native EditorJS table blocks.
 */

import { cleanHtmlText } from './slide-deck-generator';

export interface LiteratureMatrixRow {
  id: string;
  referenceId: string;
  citationKey: string;
  authors: string;
  year: string | number;
  title: string;
  venue?: string;
  methodology: string;
  sampleSize: string;
  keyFindings: string;
  limitations: string;
  synthesisNotes: string;
  tags: string[];
}

export interface CitationItemForMatrix {
  id?: string;
  title?: string;
  authors?: string | string[];
  year?: string | number | null;
  journal?: string | null;
  venue?: string | null;
  abstract?: string | null;
  doi?: string | null;
}

/**
 * Heuristically infers research methodology, sample, findings, and limitations from paper metadata/abstract
 */
export function inferMatrixFieldsFromAbstract(
  abstract = '',
  title = '',
  language: 'en' | 'id' = 'en'
): {
  methodology: string;
  sampleSize: string;
  keyFindings: string;
  limitations: string;
  tags: string[];
} {
  const isEn = language === 'en';
  const text = (title + ' ' + abstract).toLowerCase();
  const tags: string[] = [];

  // 1. Methodology Detection
  let methodology = isEn ? 'Empirical Study' : 'Studi Empiris';
  if (text.includes('systematic literature review') || text.includes('systematic review') || text.includes('prisma')) {
    methodology = 'Systematic Literature Review (SLR)';
    tags.push('SLR');
  } else if (text.includes('meta-analysis') || text.includes('meta analysis')) {
    methodology = 'Meta-Analysis';
    tags.push('Meta-Analysis');
  } else if (text.includes('deep learning') || text.includes('machine learning') || text.includes('neural network') || text.includes('algorithm')) {
    methodology = isEn ? 'Computational / Machine Learning' : 'Komputasional / Machine Learning';
    tags.push('Machine Learning');
  } else if (text.includes('survey') || text.includes('questionnaire') || text.includes('kuesioner') || text.includes('angket')) {
    methodology = isEn ? 'Quantitative Survey' : 'Survei Kuantitatif';
    tags.push('Quantitative');
  } else if (text.includes('qualitative') || text.includes('interview') || text.includes('wawancara') || text.includes('case study') || text.includes('studi kasus')) {
    methodology = isEn ? 'Qualitative Case Study / Interview' : 'Kualitatif Studi Kasus / Wawancara';
    tags.push('Qualitative');
  } else if (text.includes('experiment') || text.includes('quasi-experimental') || text.includes('eksperimen')) {
    methodology = isEn ? 'Experimental Design' : 'Desain Eksperimental';
    tags.push('Experimental');
  }

  // 2. Sample Size Detection
  let sampleSize = isEn ? 'Unspecified' : 'Tidak Dinyatakan';
  const sampleRegex = /\b(?:n\s*=\s*|sample of |sampel sebanyak |participants\s*=\s*)(\d+[\d,.]*)/i;
  const matchSample = (title + ' ' + abstract).match(sampleRegex);
  if (matchSample && matchSample[1]) {
    sampleSize = `N = ${matchSample[1]}`;
  } else if (text.includes('dataset') || text.includes('benchmark')) {
    sampleSize = isEn ? 'Standard Benchmark Dataset' : 'Dataset Tolok Ukur Standar';
  }

  // 3. Key Findings Detection
  let keyFindings = isEn
    ? 'Identified significant correlations and verified core hypotheses.'
    : 'Mengidentifikasi korelasi signifikan dan memvalidasi hipotesis utama.';

  const cleanedAbstract = cleanHtmlText(abstract);
  if (cleanedAbstract.length > 50) {
    // Attempt finding sentence containing 'results show', 'found that', 'demonstrates', 'menunjukkan'
    const sentences = cleanedAbstract.split(/(?<=[.?!])\s+/);
    const findingSentence = sentences.find((s) => {
      const lower = s.toLowerCase();
      return (
        lower.includes('show') ||
        lower.includes('found') ||
        lower.includes('demonstrat') ||
        lower.includes('indicat') ||
        lower.includes('menunjukkan') ||
        lower.includes('menemukan') ||
        lower.includes('membuktikan') ||
        lower.includes('hasil')
      );
    });
    if (findingSentence && findingSentence.length < 240) {
      keyFindings = findingSentence.trim();
    } else {
      keyFindings = sentences[0].slice(0, 180) + (sentences[0].length > 180 ? '...' : '');
    }
  }

  // 4. Limitations Detection
  let limitations = isEn
    ? 'Limited geographical scope; requires multi-center validation.'
    : 'Cakupan geografis terbatas; memerlukan validasi multi-pusat.';

  if (cleanedAbstract.length > 50) {
    const sentences = cleanedAbstract.split(/(?<=[.?!])\s+/);
    const limitSentence = sentences.find((s) => {
      const lower = s.toLowerCase();
      return (
        lower.includes('limit') ||
        lower.includes('further research') ||
        lower.includes('future work') ||
        lower.includes('kelemahan') ||
        lower.includes('kendala') ||
        lower.includes('batasan') ||
        lower.includes('perlu diteliti')
      );
    });
    if (limitSentence && limitSentence.length < 240) {
      limitations = limitSentence.trim();
    }
  }

  return { methodology, sampleSize, keyFindings, limitations, tags };
}

/**
 * Extracts and consolidates literature matrix rows from a Citation Library record.
 * Preserves user-customized edits from existingRows if matched by referenceId.
 */
export function extractLiteratureMatrix(
  citationLibrary: Record<string, CitationItemForMatrix> = {},
  existingRows: LiteratureMatrixRow[] = [],
  language: 'en' | 'id' = 'en'
): LiteratureMatrixRow[] {
  const existingMap = new Map<string, LiteratureMatrixRow>();
  existingRows.forEach((r) => existingMap.set(r.referenceId, r));

  const items = Object.entries(citationLibrary);
  const rows: LiteratureMatrixRow[] = [];

  let counter = 1;
  for (const [key, item] of items) {
    const existing = existingMap.get(item.id || key);
    if (existing) {
      rows.push(existing);
      continue;
    }

    const title = cleanHtmlText(item.title || 'Untitled Paper');
    const authorsRaw = Array.isArray(item.authors)
      ? item.authors.join(', ')
      : item.authors || 'Unknown Author';
    const year = item.year || 'n.d.';
    const venue = item.journal || item.venue || '';

    // First author short label
    const firstAuthor = authorsRaw.split(',')[0].trim().split(' ').pop() || 'Study';
    const citationKey = `(${firstAuthor}, ${year})`;

    const inferred = inferMatrixFieldsFromAbstract(item.abstract || '', title, language);

    rows.push({
      id: `matrix-row-${item.id || key || counter}`,
      referenceId: item.id || key,
      citationKey,
      authors: authorsRaw,
      year,
      title,
      venue,
      methodology: inferred.methodology,
      sampleSize: inferred.sampleSize,
      keyFindings: inferred.keyFindings,
      limitations: inferred.limitations,
      synthesisNotes: language === 'en' ? 'Direct relevance to theoretical framework' : 'Relevan langsung dengan landasan teori',
      tags: inferred.tags,
    });
    counter++;
  }

  return rows;
}

/**
 * Exports Literature Matrix to standard Markdown Table format.
 */
export function exportMatrixToMarkdownTable(
  rows: LiteratureMatrixRow[],
  language: 'en' | 'id' = 'en'
): string {
  const isEn = language === 'en';
  const headers = isEn
    ? ['No', 'Study / Citation', 'Title & Venue', 'Methodology', 'Sample Size', 'Key Findings', 'Research Limitations', 'Synthesis Notes']
    : ['No', 'Rujukan / Sitasi', 'Judul & Publikasi', 'Metodologi', 'Ukuran Sampel', 'Temuan Utama', 'Batasan Riset', 'Catatan Sintesis'];

  const headerLine = `| ${headers.join(' | ')} |`;
  const separatorLine = `| ${headers.map(() => '---').join(' | ')} |`;

  const dataLines = rows.map((r, idx) => {
    const titleAndVenue = r.venue ? `${r.title} *(${r.venue})*` : r.title;
    return `| ${idx + 1} | ${escapePipes(r.citationKey)} | ${escapePipes(titleAndVenue)} | ${escapePipes(r.methodology)} | ${escapePipes(r.sampleSize)} | ${escapePipes(r.keyFindings)} | ${escapePipes(r.limitations)} | ${escapePipes(r.synthesisNotes)} |`;
  });

  return [headerLine, separatorLine, ...dataLines].join('\n') + '\n';
}

/**
 * Exports Literature Matrix to CSV format conforming to RFC 4180.
 */
export function exportMatrixToCsv(
  rows: LiteratureMatrixRow[],
  language: 'en' | 'id' = 'en'
): string {
  const isEn = language === 'en';
  const headers = isEn
    ? ['No', 'Study Citation', 'Authors', 'Year', 'Title', 'Venue', 'Methodology', 'Sample Size', 'Key Findings', 'Limitations', 'Synthesis Notes']
    : ['No', 'Sitasi Rujukan', 'Penulis', 'Tahun', 'Judul', 'Publikasi', 'Metodologi', 'Ukuran Sampel', 'Temuan Utama', 'Batasan', 'Catatan Sintesis'];

  const csvRows = [headers.map(escapeCsvValue).join(',')];

  rows.forEach((r, idx) => {
    const rowValues = [
      String(idx + 1),
      r.citationKey,
      r.authors,
      String(r.year),
      r.title,
      r.venue || '',
      r.methodology,
      r.sampleSize,
      r.keyFindings,
      r.limitations,
      r.synthesisNotes,
    ];
    csvRows.push(rowValues.map(escapeCsvValue).join(','));
  });

  return csvRows.join('\r\n') + '\r\n';
}

/**
 * Converts Literature Matrix into an EditorJS Table block.
 * Can be directly appended or injected into the manuscript canvas.
 */
export function exportMatrixToEditorJsTable(
  rows: LiteratureMatrixRow[],
  language: 'en' | 'id' = 'en'
): any {
  const isEn = language === 'en';
  const headers = isEn
    ? ['Study', 'Methodology', 'Sample', 'Key Findings', 'Synthesis Notes']
    : ['Studi', 'Metodologi', 'Sampel', 'Temuan Kunci', 'Catatan Sintesis'];

  const tableContent: string[][] = [headers];

  rows.forEach((r) => {
    tableContent.push([
      `<b>${r.citationKey}</b><br><small>${r.authors} (${r.year})</small>`,
      r.methodology,
      r.sampleSize,
      r.keyFindings,
      r.synthesisNotes,
    ]);
  });

  return {
    id: `lit-matrix-${Date.now()}`,
    type: 'table',
    data: {
      withHeadings: true,
      content: tableContent,
    },
  };
}

function escapePipes(str: string): string {
  if (!str) return '';
  return str.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function escapeCsvValue(val: string): string {
  if (val === undefined || val === null) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}
