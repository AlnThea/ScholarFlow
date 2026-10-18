// lib/editor/academic-linter.ts
// ScholarFlow Academic Grammar, Formality & Style Linter Engine (Phase 34)

export type LintIssueType = 'informal' | 'contraction' | 'vague' | 'first_person';

export interface LintIssue {
  id: string;
  type: LintIssueType;
  original: string;
  matchedText: string;
  suggestions: string[];
  reasonEn: string;
  reasonId: string;
  index: number;
  length: number;
}

export interface LintRule {
  pattern: RegExp;
  type: LintIssueType;
  suggestions: string[];
  reasonEn: string;
  reasonId: string;
}

/**
 * Standard Academic Writing Rules Dictionary (Bilingual EN / ID)
 */
export const ACADEMIC_LINT_RULES_EN: LintRule[] = [
  // --- Contractions ---
  {
    pattern: /\b(don't)\b/gi,
    type: 'contraction',
    suggestions: ['do not'],
    reasonEn: 'Contractions should be avoided in formal academic papers.',
    reasonId: 'Singkatan (kontraksi) harus dihindari dalam penulisan ilmiah formal.'
  },
  {
    pattern: /\b(can't)\b/gi,
    type: 'contraction',
    suggestions: ['cannot'],
    reasonEn: 'Use "cannot" instead of informal "can\'t".',
    reasonId: 'Gunakan "cannot" untuk menggantikan singkatan "can\'t".'
  },
  {
    pattern: /\b(won't)\b/gi,
    type: 'contraction',
    suggestions: ['will not'],
    reasonEn: 'Use "will not" for objective academic tone.',
    reasonId: 'Gunakan "will not" untuk mempertahankan nada akademis.'
  },
  {
    pattern: /\b(it's)\b/gi,
    type: 'contraction',
    suggestions: ['it is'],
    reasonEn: 'Expand contraction "it\'s" to "it is".',
    reasonId: 'Urai kontraksi "it\'s" menjadi "it is".'
  },
  {
    pattern: /\b(didn't)\b/gi,
    type: 'contraction',
    suggestions: ['did not'],
    reasonEn: 'Use "did not" in academic manuscripts.',
    reasonId: 'Gunakan "did not" dalam manuskrip akademik.'
  },
  {
    pattern: /\b(shouldn't)\b/gi,
    type: 'contraction',
    suggestions: ['should not'],
    reasonEn: 'Avoid colloquial contractions like "shouldn\'t".',
    reasonId: 'Hindari kontraksi percakapan seperti "shouldn\'t".'
  },
  {
    pattern: /\b(they're)\b/gi,
    type: 'contraction',
    suggestions: ['they are'],
    reasonEn: 'Expand "they\'re" to "they are".',
    reasonId: 'Urai "they\'re" menjadi "they are".'
  },
  {
    pattern: /\b(we've)\b/gi,
    type: 'contraction',
    suggestions: ['we have'],
    reasonEn: 'Expand "we\'ve" to formal "we have".',
    reasonId: 'Urai "we\'ve" menjadi bentuk formal "we have".'
  },

  // --- Informal / Imprecise Words ---
  {
    pattern: /\b(a lot of|lots of)\b/gi,
    type: 'informal',
    suggestions: ['a substantial number of', 'numerous', 'a significant quantity of'],
    reasonEn: '"A lot of" is too colloquial for scientific publishing.',
    reasonId: '"A lot of" terlalu kasual untuk publikasi ilmiah jurnal.'
  },
  {
    pattern: /\b(huge)\b/gi,
    type: 'informal',
    suggestions: ['substantial', 'considerable', 'significant'],
    reasonEn: 'Replace exaggerated "huge" with precise scientific descriptors.',
    reasonId: 'Gantikan kata hiperbolis "huge" dengan istilah deskriptif yang terukur.'
  },
  {
    pattern: /\b(kids)\b/gi,
    type: 'informal',
    suggestions: ['children', 'pediatric subjects', 'adolescents'],
    reasonEn: 'Use scientific cohort terms instead of "kids".',
    reasonId: 'Gunakan terminologi subjek ilmiah alih-alih kata informal "kids".'
  },
  {
    pattern: /\b(bad)\b/gi,
    type: 'informal',
    suggestions: ['adverse', 'suboptimal', 'detrimental'],
    reasonEn: '"Bad" is simplistic. Specify the negative consequence objectively.',
    reasonId: '"Bad" terlalu sederhana. Nyatakan dampak negatif secara objektif.'
  },
  {
    pattern: /\b(good)\b/gi,
    type: 'informal',
    suggestions: ['beneficial', 'favorable', 'effective', 'robust'],
    reasonEn: 'Replace generic "good" with specific scientific merit.',
    reasonId: 'Gantikan kata "good" dengan ukuran manfaat ilmiah yang spesifik.'
  },
  {
    pattern: /\b(get|gets|got)\b/gi,
    type: 'informal',
    suggestions: ['obtain', 'acquire', 'derive'],
    reasonEn: '"Get" is conversational. Use "obtain" or "acquire".',
    reasonId: '"Get" bernada percakapan. Gunakan "obtain" atau "acquire".'
  },

  // --- Vague / Sweeping Claims ---
  {
    pattern: /\b(everyone knows that)\b/gi,
    type: 'vague',
    suggestions: ['evidence indicates that', 'previous studies demonstrate that'],
    reasonEn: 'Sweeping assumption without literature grounding.',
    reasonId: 'Asumsi tanpa rujukan sitasi pustaka yang valid.'
  },
  {
    pattern: /\b(it is obvious that|obviously)\b/gi,
    type: 'vague',
    suggestions: ['the findings suggest that', 'evidently', 'the data demonstrates that'],
    reasonEn: 'Avoid assuming facts are obvious; present supporting evidence.',
    reasonId: 'Hindari menganggap temuan sudah jelas tanpa bukti pendukung.'
  },
  {
    pattern: /\b(clearly)\b/gi,
    type: 'vague',
    suggestions: ['the empirical evidence demonstrates', 'consequently'],
    reasonEn: '"Clearly" can signal rhetorical bias without statistical support.',
    reasonId: '"Clearly" dapat menimbulkan bias retorika tanpa dukungan statistik.'
  },

  // --- First-Person Bias ---
  {
    pattern: /\b(I think that|in my opinion)\b/gi,
    type: 'first_person',
    suggestions: ['it is hypothesized that', 'the findings indicate that', 'it is proposed that'],
    reasonEn: 'Maintain scientific objectivity rather than personal opinion.',
    reasonId: 'Pertahankan objektivitas ilmiah dibanding opini pribadi penulis.'
  },
  {
    pattern: /\b(I found that)\b/gi,
    type: 'first_person',
    suggestions: ['the analysis revealed that', 'the results demonstrate that'],
    reasonEn: 'Focus on empirical findings rather than subjective persona.',
    reasonId: 'Fokuskan pada temuan empiris alih-alih subjek personal.'
  }
];

export const ACADEMIC_LINT_RULES_ID: LintRule[] = [
  // --- Informal / Singkatan Teks Percakapan ---
  {
    pattern: /\b(banget)\b/gi,
    type: 'informal',
    suggestions: ['sangat', 'secara signifikan'],
    reasonEn: 'Use formal Indonesian "sangat" instead of colloquial "banget".',
    reasonId: 'Kata "banget" merupakan ragam cakapan; gunakan kata formal "sangat".'
  },
  {
    pattern: /\b(banyak banget)\b/gi,
    type: 'informal',
    suggestions: ['sejumlah besar', 'secara substansial'],
    reasonEn: 'Replace colloquial quantity with formal academic phrasing.',
    reasonId: 'Gunakan frasa baku "sejumlah besar" atau "secara substansial".'
  },
  {
    pattern: /\b(nggak|ngga|gak|ngak)\b/gi,
    type: 'contraction',
    suggestions: ['tidak'],
    reasonEn: 'Replace informal Indonesian negation with formal "tidak".',
    reasonId: 'Kata "nggak/gak" bukan kata baku; gunakan kata resmi "tidak".'
  },
  {
    pattern: /\b(bikin)\b/gi,
    type: 'informal',
    suggestions: ['membuat', 'menghasilkan', 'menyebabkan'],
    reasonEn: 'Use formal verb "membuat" or "menghasilkan" instead of "bikin".',
    reasonId: 'Kata "bikin" adalah ragam non-formal; gunakan kata kerja baku "membuat/menghasilkan".'
  },
  {
    pattern: /\b(gimana)\b/gi,
    type: 'informal',
    suggestions: ['bagaimana'],
    reasonEn: 'Use formal question word "bagaimana".',
    reasonId: 'Gunakan kata tanya baku "bagaimana" untuk naskah ilmiah.'
  },
  {
    pattern: /\b(dapetin)\b/gi,
    type: 'informal',
    suggestions: ['memperoleh', 'mendapatkan'],
    reasonEn: 'Use formal standard affix "memperoleh".',
    reasonId: 'Gunakan bentukan kata berimbuhan baku "memperoleh".'
  },
  {
    pattern: /\b(tdk)\b/gi,
    type: 'contraction',
    suggestions: ['tidak'],
    reasonEn: 'Avoid informal text message abbreviations in academic thesis.',
    reasonId: 'Hindari singkatan pesan singkat "tdk" dalam naskah skripsi.'
  },
  {
    pattern: /\b(dgn)\b/gi,
    type: 'contraction',
    suggestions: ['dengan'],
    reasonEn: 'Do not abbreviate "dengan".',
    reasonId: 'Tulis lengkap kata tugas "dengan".'
  },
  {
    pattern: /\b(yg)\b/gi,
    type: 'contraction',
    suggestions: ['yang'],
    reasonEn: 'Do not abbreviate "yang".',
    reasonId: 'Tulis lengkap kata hubung "yang".'
  },
  {
    pattern: /\b(utk)\b/gi,
    type: 'contraction',
    suggestions: ['untuk'],
    reasonEn: 'Do not abbreviate "untuk".',
    reasonId: 'Tulis lengkap kata depan "untuk".'
  },
  {
    pattern: /\b(krn)\b/gi,
    type: 'contraction',
    suggestions: ['karena'],
    reasonEn: 'Do not abbreviate "karena".',
    reasonId: 'Tulis lengkap konjungsi "karena".'
  },

  // --- Vague / Asumsi Tanpa Dasar ---
  {
    pattern: /\b(sudah jelas bahwa)\b/gi,
    type: 'vague',
    suggestions: ['data menunjukkan bahwa', 'hasil analisis mengindikasikan bahwa'],
    reasonEn: 'Provide empirical evidence rather than declaring conclusions obvious.',
    reasonId: 'Sertakan rujukan empiris daripada mengklaim kesimpulan sudah jelas.'
  },
  {
    pattern: /\b(semua orang tahu bahwa)\b/gi,
    type: 'vague',
    suggestions: ['kajian terdahulu membuktikan bahwa', 'berdasarkan literatur'],
    reasonEn: 'Avoid unsupported generalizations in thesis writing.',
    reasonId: 'Hindari generalisasi tanpa rujukan literatur pendukung.'
  },
  {
    pattern: /\b(pasti)\b/gi,
    type: 'vague',
    suggestions: ['terindikasi kuat', 'memiliki probabilitas tinggi'],
    reasonEn: 'Avoid absolute certainty unless mathematically proven.',
    reasonId: 'Gunakan istilah probabilitas terukur alih-alih kepastian mutlak tanpa data.'
  },

  // --- Bias Persona Pertama ---
  {
    pattern: /\b(saya rasa bahwa|menurut saya)\b/gi,
    type: 'first_person',
    suggestions: ['dihipotesiskan bahwa', 'berdasarkan temuan empiris'],
    reasonEn: 'Avoid subjective first-person opinions in scientific research.',
    reasonId: 'Hindari opini subjektif orang pertama; gunakan pendekatan pasif saintifik.'
  },
  {
    pattern: /\b(saya menemukan bahwa)\b/gi,
    type: 'first_person',
    suggestions: ['analisis menunjukkan bahwa', 'hasil pengujian membuktikan bahwa'],
    reasonEn: 'Frame scientific discovery neutrally.',
    reasonId: 'Gunakan subjek temuan atau instrumen riset (contoh: "Hasil analisis menunjukkan bahwa").'
  }
];

/**
 * Scans manuscript text for academic style and formality issues.
 */
export function lintAcademicText(text: string, language: 'en' | 'id' = 'id'): LintIssue[] {
  if (!text || typeof text !== 'string') return [];

  const cleanText = text.replace(/<[^>]+>/g, ' ');
  const rules = language === 'en' ? ACADEMIC_LINT_RULES_EN : ACADEMIC_LINT_RULES_ID;
  const issues: LintIssue[] = [];

  rules.forEach((rule, rIdx) => {
    let match: RegExpExecArray | null;
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);

    while ((match = regex.exec(cleanText)) !== null) {
      issues.push({
        id: `lint-${rIdx}-${match.index}`,
        type: rule.type,
        original: match[0],
        matchedText: match[0],
        suggestions: rule.suggestions,
        reasonEn: rule.reasonEn,
        reasonId: rule.reasonId,
        index: match.index,
        length: match[0].length
      });
    }
  });

  // Sort issues in order of appearance in text
  return issues.sort((a, b) => a.index - b.index);
}

/**
 * Computes an Academic Formality Score (0 - 100).
 * Baseline is 100; deductions applied per issue density relative to total words.
 */
export function calculateAcademicStyleScore(issuesCount: number, wordCount: number): {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  labelEn: string;
  labelId: string;
} {
  if (wordCount === 0) {
    return {
      score: 100,
      grade: 'A',
      labelEn: 'Ready (Empty)',
      labelId: 'Siap (Kosong)'
    };
  }

  // Calculate issue density per 100 words
  const density = (issuesCount / Math.max(1, wordCount)) * 100;
  // Deduct 5 points per issue per 100 words
  const rawScore = Math.max(20, Math.min(100, Math.round(100 - density * 8)));

  let grade: 'A' | 'B' | 'C' | 'D' = 'A';
  let labelEn = 'Formal Academic';
  let labelId = 'Akademik Formal';

  if (rawScore >= 90) {
    grade = 'A';
    labelEn = 'High Academic Rigour';
    labelId = 'Kepatuhan Akademis Tinggi';
  } else if (rawScore >= 75) {
    grade = 'B';
    labelEn = 'Good (Minor Polish Needed)';
    labelId = 'Cukup Baik (Perlu Poles Ringan)';
  } else if (rawScore >= 60) {
    grade = 'C';
    labelEn = 'Colloquial Expressions Detected';
    labelId = 'Ditemukan Ungkapan Non-Formal';
  } else {
    grade = 'D';
    labelEn = 'Heavy Informal Language';
    labelId = 'Banyak Bahasa Percakapan';
  }

  return {
    score: rawScore,
    grade,
    labelEn,
    labelId
  };
}

/**
 * Applies a single lint replacement to the text cleanly and safely.
 */
export function applyLintReplacement(
  fullText: string,
  issue: LintIssue,
  selectedSuggestion: string
): string {
  if (!fullText || !issue || !selectedSuggestion) return fullText;

  // Use exact slice replacement at index if matched
  const before = fullText.slice(0, issue.index);
  const after = fullText.slice(issue.index + issue.length);
  return before + selectedSuggestion + after;
}
