/**
 * journal-presets.ts
 *
 * Journal Formatting Presets & Author Guidelines Audit Engine.
 * Formulates and verifies publication criteria (word limits, abstract length,
 * figure/table quotas, citation style, and recent reference recency) across major publishers:
 * IEEE, Elsevier, Springer Nature, PLOS ONE, and SINTA (Dikti).
 */

import { cleanHtmlText } from './slide-deck-generator';

export interface JournalPreset {
  id: string;
  name: string;
  publisher: string;
  category: 'international-engineering' | 'international-multidisciplinary' | 'national-accredited' | 'custom';
  descriptionEn: string;
  descriptionId: string;
  requiredCitationStyle: 'ieee' | 'apa' | 'vancouver' | 'harvard';
  maxTotalWords: number;
  minTotalWords?: number;
  maxAbstractWords: number;
  maxFiguresAndTables: number;
  minRecentReferencesPercent: number; // e.g. 70 means 70% must be within the last 5 years
  requiredSections: string[];
}

export interface JournalAuditItem {
  id: string;
  titleEn: string;
  titleId: string;
  status: 'pass' | 'warning' | 'fail';
  currentValue: string | number;
  targetValue: string | number;
  messageEn: string;
  messageId: string;
}

export interface JournalAuditResult {
  preset: JournalPreset;
  readinessScore: number; // 0 - 100
  overallStatus: 'ready' | 'needs-minor-fixes' | 'unprepared';
  items: JournalAuditItem[];
  metrics: {
    totalWords: number;
    abstractWords: number;
    figureCount: number;
    tableCount: number;
    totalReferences: number;
    recentReferencesCount: number;
    recentReferencesPercent: number;
    activeCitationStyle: string;
  };
}

export const STANDARD_JOURNAL_PRESETS: JournalPreset[] = [
  {
    id: 'ieee-transactions',
    name: 'IEEE Transactions & Journals',
    publisher: 'IEEE',
    category: 'international-engineering',
    descriptionEn: 'Rigorous engineering standard requiring numeric IEEE citations, high reference recency, and strict length limits.',
    descriptionId: 'Standar jurnal teknik IEEE dengan sitasi numerik, rujukan terkini 5 tahun terakhir, dan batasan kata ketat.',
    requiredCitationStyle: 'ieee',
    maxTotalWords: 8000,
    minTotalWords: 3500,
    maxAbstractWords: 200,
    maxFiguresAndTables: 12,
    minRecentReferencesPercent: 75,
    requiredSections: ['Introduction', 'Related Work', 'Methodology', 'Results', 'Discussion', 'Conclusion'],
  },
  {
    id: 'elsevier-sciencedirect',
    name: 'Elsevier Research Paper',
    publisher: 'Elsevier / ScienceDirect',
    category: 'international-multidisciplinary',
    descriptionEn: 'Broad international publication format using APA/Harvard author-year standard and in-depth discussion.',
    descriptionId: 'Format publikasi internasional Elsevier dengan gaya sitasi APA/Harvard dan kedalaman pembahasan hasil.',
    requiredCitationStyle: 'apa',
    maxTotalWords: 8500,
    minTotalWords: 4000,
    maxAbstractWords: 250,
    maxFiguresAndTables: 10,
    minRecentReferencesPercent: 70,
    requiredSections: ['Introduction', 'Literature Review', 'Materials & Methods', 'Results', 'Discussion', 'Conclusion'],
  },
  {
    id: 'springer-nature',
    name: 'Springer Nature / Scientific Reports',
    publisher: 'Springer Nature',
    category: 'international-multidisciplinary',
    descriptionEn: 'High-impact multidisciplinary standard prioritizing concise abstracts and robust open methodology.',
    descriptionId: 'Standar jurnal multidisiplin Springer Nature yang menekankan kejelasan metodologi dan ringkasan padat.',
    requiredCitationStyle: 'vancouver',
    maxTotalWords: 6500,
    minTotalWords: 3000,
    maxAbstractWords: 200,
    maxFiguresAndTables: 8,
    minRecentReferencesPercent: 80,
    requiredSections: ['Introduction', 'Results', 'Discussion', 'Methods'],
  },
  {
    id: 'sinta-kemdikbud',
    name: 'SINTA 1 & 2 Accredited Journal (Dikti)',
    publisher: 'Kemdikbudristek (Indonesia)',
    category: 'national-accredited',
    descriptionEn: 'Indonesian Higher Education national accreditation standard with bilingual abstract and primary literature focus.',
    descriptionId: 'Standar akreditasi jurnal nasional SINTA 1 & 2 dengan abstrak dwibahasa dan rujukan primer jurnal bereputasi.',
    requiredCitationStyle: 'apa',
    maxTotalWords: 6000,
    minTotalWords: 3500,
    maxAbstractWords: 200,
    maxFiguresAndTables: 8,
    minRecentReferencesPercent: 80,
    requiredSections: ['Pendahuluan', 'Metode Penelitian', 'Hasil dan Pembahasan', 'Kesimpulan', 'Daftar Pustaka'],
  },
  {
    id: 'plos-one',
    name: 'PLOS ONE Open Access',
    publisher: 'Public Library of Science',
    category: 'international-multidisciplinary',
    descriptionEn: 'Rigorous open-access journal requiring Vancouver style, robust statistical power, and no arbitrary word limit.',
    descriptionId: 'Jurnal akses terbuka saintifik terkemuka dengan sitasi Vancouver dan penekanan validitas metodologis.',
    requiredCitationStyle: 'vancouver',
    maxTotalWords: 12000,
    minTotalWords: 3000,
    maxAbstractWords: 300,
    maxFiguresAndTables: 15,
    minRecentReferencesPercent: 65,
    requiredSections: ['Introduction', 'Materials and Methods', 'Results', 'Discussion', 'Conclusions'],
  },
];

/**
 * Extracts total words, abstract words, and figure/table counts from EditorJS blocks.
 */
export function extractDocumentMetrics(blocks: any[] = []): {
  totalWords: number;
  abstractWords: number;
  figureCount: number;
  tableCount: number;
} {
  let totalText = '';
  let abstractText = '';
  let inAbstract = false;
  let figureCount = 0;
  let tableCount = 0;

  for (const block of blocks) {
    if (block.type === 'header' && block.data?.text) {
      const heading = cleanHtmlText(block.data.text).toLowerCase();
      inAbstract = heading.includes('abstract') || heading.includes('abstrak');
      totalText += ' ' + block.data.text;
    } else if (block.type === 'paragraph' && block.data?.text) {
      totalText += ' ' + block.data.text;
      if (inAbstract) {
        abstractText += ' ' + block.data.text;
      }
    } else if (block.type === 'list' && Array.isArray(block.data?.items)) {
      block.data.items.forEach((item: any) => {
        const txt = typeof item === 'string' ? item : item?.content || '';
        totalText += ' ' + txt;
        if (inAbstract) abstractText += ' ' + txt;
      });
    } else if (block.type === 'image') {
      figureCount++;
    } else if (block.type === 'table') {
      tableCount++;
    }
  }

  const countWords = (str: string) => {
    const cleaned = cleanHtmlText(str).trim();
    if (!cleaned) return 0;
    return cleaned.split(/\s+/).filter((w) => w.length > 0).length;
  };

  return {
    totalWords: countWords(totalText),
    abstractWords: countWords(abstractText),
    figureCount,
    tableCount,
  };
}

/**
 * Audits reference recency against current year (e.g. references within the last 5 years).
 */
export function auditReferenceRecency(
  bibliographyEntries: any[] = [],
  recencyWindowYears = 5
): {
  totalReferences: number;
  recentCount: number;
  recentPercent: number;
} {
  if (!bibliographyEntries || bibliographyEntries.length === 0) {
    return { totalReferences: 0, recentCount: 0, recentPercent: 0 };
  }

  const currentYear = new Date().getFullYear();
  const thresholdYear = currentYear - recencyWindowYears;

  let recentCount = 0;
  const yearRegex = /\b(19\d{2}|20\d{2})\b/;

  bibliographyEntries.forEach((entry) => {
    let entryText = '';
    let year: number | null = null;

    if (typeof entry === 'string') {
      entryText = entry;
    } else if (entry && typeof entry === 'object') {
      entryText = `${entry.text || ''} ${entry.year || ''}`;
      if (entry.year) {
        const parsed = parseInt(String(entry.year), 10);
        if (!isNaN(parsed)) year = parsed;
      }
    }

    if (year === null) {
      const match = entryText.match(yearRegex);
      if (match && match[1]) {
        year = parseInt(match[1], 10);
      }
    }

    if (year && year >= thresholdYear && year <= currentYear + 1) {
      recentCount++;
    }
  });

  const total = bibliographyEntries.length;
  const percent = total > 0 ? Math.round((recentCount / total) * 100) : 0;

  return {
    totalReferences: total,
    recentCount,
    recentPercent: percent,
  };
}

/**
 * Audits a manuscript against a chosen Journal Publishing Preset.
 */
export function auditJournalReadiness(
  blocks: any[] = [],
  bibliographyEntries: any[] = [],
  presetId = 'ieee-transactions',
  activeCitationStyle = 'apa',
  customPreset?: Partial<JournalPreset>
): JournalAuditResult {
  const basePreset = STANDARD_JOURNAL_PRESETS.find((p) => p.id === presetId) || STANDARD_JOURNAL_PRESETS[0];
  const preset: JournalPreset = { ...basePreset, ...(customPreset || {}) };

  const docMetrics = extractDocumentMetrics(blocks);
  const refMetrics = auditReferenceRecency(bibliographyEntries, 5);

  const items: JournalAuditItem[] = [];
  let passedCount = 0;
  const totalChecks = 5;

  // 1. Total Word Count Check
  let wordStatus: 'pass' | 'warning' | 'fail' = 'pass';
  let wordMsgEn = `Word count is well within the ${preset.maxTotalWords} words limit.`;
  let wordMsgId = `Jumlah kata sesuai dengan batas maksimal ${preset.maxTotalWords} kata.`;

  if (docMetrics.totalWords > preset.maxTotalWords) {
    wordStatus = 'fail';
    wordMsgEn = `Exceeds max limit by ${docMetrics.totalWords - preset.maxTotalWords} words. Trimming is required.`;
    wordMsgId = `Melebihi batas maksimal sebanyak ${docMetrics.totalWords - preset.maxTotalWords} kata. Perlu pemangkasan naskah.`;
  } else if (preset.minTotalWords && docMetrics.totalWords < preset.minTotalWords) {
    wordStatus = 'warning';
    wordMsgEn = `Below minimum threshold of ${preset.minTotalWords} words. Expand discussions.`;
    wordMsgId = `Di bawah ambang batas minimal ${preset.minTotalWords} kata. Perluas pembahasan hasil.`;
  } else {
    passedCount++;
  }

  items.push({
    id: 'check-word-count',
    titleEn: 'Total Manuscript Word Count',
    titleId: 'Jumlah Kata Naskah Total',
    status: wordStatus,
    currentValue: `${docMetrics.totalWords} words`,
    targetValue: preset.minTotalWords ? `${preset.minTotalWords} - ${preset.maxTotalWords} words` : `≤ ${preset.maxTotalWords} words`,
    messageEn: wordMsgEn,
    messageId: wordMsgId,
  });

  // 2. Abstract Length Check
  let abstractStatus: 'pass' | 'warning' | 'fail' = 'pass';
  let abstractMsgEn = `Abstract length adheres to the ≤ ${preset.maxAbstractWords} words guideline.`;
  let abstractMsgId = `Panjang abstrak mematuhi batas ≤ ${preset.maxAbstractWords} kata.`;

  if (docMetrics.abstractWords > preset.maxAbstractWords) {
    abstractStatus = 'fail';
    abstractMsgEn = `Abstract exceeds limit by ${docMetrics.abstractWords - preset.maxAbstractWords} words.`;
    abstractMsgId = `Abstrak melebihi batas sebanyak ${docMetrics.abstractWords - preset.maxAbstractWords} kata.`;
  } else if (docMetrics.abstractWords === 0) {
    abstractStatus = 'warning';
    abstractMsgEn = 'No dedicated abstract section detected in the document.';
    abstractMsgId = 'Bagian abstrak belum terdeteksi pada naskah.';
  } else {
    passedCount++;
  }

  items.push({
    id: 'check-abstract-words',
    titleEn: 'Abstract Length Limit',
    titleId: 'Batas Panjang Abstrak',
    status: abstractStatus,
    currentValue: `${docMetrics.abstractWords} words`,
    targetValue: `≤ ${preset.maxAbstractWords} words`,
    messageEn: abstractMsgEn,
    messageId: abstractMsgId,
  });

  // 3. Figures & Tables Quota Check
  const totalVisuals = docMetrics.figureCount + docMetrics.tableCount;
  let visualStatus: 'pass' | 'warning' | 'fail' = 'pass';
  let visualMsgEn = `Total visuals (${totalVisuals}) within allowance.`;
  let visualMsgId = `Total visual (${totalVisuals}) dalam batas aman jurnal.`;

  if (totalVisuals > preset.maxFiguresAndTables) {
    visualStatus = 'fail';
    visualMsgEn = `Too many figures/tables (${totalVisuals} vs max ${preset.maxFiguresAndTables}). Consider moving some to an appendix.`;
    visualMsgId = `Jumlah gambar & tabel terlalu banyak (${totalVisuals} vs maks ${preset.maxFiguresAndTables}). Pindahkan sebagian ke lampiran.`;
  } else {
    passedCount++;
  }

  items.push({
    id: 'check-visuals-quota',
    titleEn: 'Figures & Tables Quota',
    titleId: 'Batas Gambar & Tabel',
    status: visualStatus,
    currentValue: `${totalVisuals} (${docMetrics.figureCount} Figs, ${docMetrics.tableCount} Tabs)`,
    targetValue: `≤ ${preset.maxFiguresAndTables}`,
    messageEn: visualMsgEn,
    messageId: visualMsgId,
  });

  // 4. Reference Recency (< 5 Years) Check
  let recencyStatus: 'pass' | 'warning' | 'fail' = 'pass';
  let recencyMsgEn = `${refMetrics.recentPercent}% of references are recent (within 5 years).`;
  let recencyMsgId = `${refMetrics.recentPercent}% referensi berasal dari 5 tahun terakhir.`;

  if (refMetrics.totalReferences === 0) {
    recencyStatus = 'warning';
    recencyMsgEn = 'No bibliography citations recorded in the manuscript.';
    recencyMsgId = 'Belum ada sitasi kepustakaan yang tercatat pada naskah.';
  } else if (refMetrics.recentPercent < preset.minRecentReferencesPercent) {
    recencyStatus = 'fail';
    recencyMsgEn = `Only ${refMetrics.recentPercent}% recent references (minimum required: ${preset.minRecentReferencesPercent}%). Replace older citations.`;
    recencyMsgId = `Hanya ${refMetrics.recentPercent}% referensi mutakhir (syarat minimal: ${preset.minRecentReferencesPercent}%). Ganti referensi lawas.`;
  } else {
    passedCount++;
  }

  items.push({
    id: 'check-reference-recency',
    titleEn: 'Reference Recency (< 5 Years)',
    titleId: 'Kemutakhiran Rujukan (< 5 Tahun)',
    status: recencyStatus,
    currentValue: `${refMetrics.recentPercent}% (${refMetrics.recentCount}/${refMetrics.totalReferences})`,
    targetValue: `≥ ${preset.minRecentReferencesPercent}%`,
    messageEn: recencyMsgEn,
    messageId: recencyMsgId,
  });

  // 5. Required Citation Style Check
  const styleMatches = activeCitationStyle.toLowerCase() === preset.requiredCitationStyle.toLowerCase();
  items.push({
    id: 'check-citation-style',
    titleEn: 'Required Citation Format',
    titleId: 'Format Gaya Sitasi Wajib',
    status: styleMatches ? 'pass' : 'fail',
    currentValue: activeCitationStyle.toUpperCase(),
    targetValue: preset.requiredCitationStyle.toUpperCase(),
    messageEn: styleMatches
      ? `Active citation style matches target journal specification.`
      : `Journal mandates ${preset.requiredCitationStyle.toUpperCase()} style. Use 1-click switch.`,
    messageId: styleMatches
      ? `Format sitasi aktif telah sesuai dengan ketentuan jurnal.`
      : `Jurnal mewajibkan format ${preset.requiredCitationStyle.toUpperCase()}. Gunakan tombol alih 1-klik.`,
  });
  if (styleMatches) passedCount++;

  const readinessScore = Math.round((passedCount / totalChecks) * 100);
  const overallStatus: JournalAuditResult['overallStatus'] =
    readinessScore >= 80 ? 'ready' : readinessScore >= 60 ? 'needs-minor-fixes' : 'unprepared';

  return {
    preset,
    readinessScore,
    overallStatus,
    items,
    metrics: {
      ...docMetrics,
      ...refMetrics,
      recentReferencesCount: refMetrics.recentCount,
      recentReferencesPercent: refMetrics.recentPercent,
      activeCitationStyle,
    },
  };
}
