// lib/editor/peer-reviewer.ts
// Peer Reviewer & Journal Readiness Audit Simulation (Phase 25)

export type PeerReviewVerdict = 'ACCEPT' | 'MINOR_REVISION' | 'MAJOR_REVISION' | 'REJECT';

export interface RubricCategoryScore {
  score: number; // 0 - 100
  verdict: 'strong' | 'adequate' | 'vulnerable';
  strengths: string[];
  vulnerabilities: string[];
}

export interface ReviewerInquiry {
  id: string;
  question: string;
  section: string;
  importance: 'critical' | 'moderate';
  suggestedRemedy: string;
}

export interface PeerReviewAuditReport {
  id: string;
  documentId?: string;
  documentTitle?: string;
  language?: 'en' | 'id';
  overallVerdict: PeerReviewVerdict;
  readinessScore: number; // 0 - 100
  executiveSummary: string;
  rubric: {
    methodology: RubricCategoryScore;
    significanceAndNovelty: RubricCategoryScore;
    argumentCoherence: RubricCategoryScore;
    citationAdequacy: RubricCategoryScore;
  };
  criticalInquiries: ReviewerInquiry[];
  actionableChecklist: Array<{
    id: string;
    task: string;
    status: 'todo' | 'done';
    priority: 'high' | 'medium';
  }>;
  createdAt: string;
}

const PEER_REVIEW_STORAGE_PREFIX = 'scholarflow.peer_review.v1.';

/**
 * Load cached peer review audit for a document from localStorage
 */
export function loadCachedPeerReviewAudit(documentId: string, language?: 'en' | 'id'): PeerReviewAuditReport | null {
  if (typeof window === 'undefined' || !documentId) return null;
  try {
    if (language) {
      const langSpecific = window.localStorage.getItem(`${PEER_REVIEW_STORAGE_PREFIX}${documentId}.${language}`);
      if (langSpecific) return JSON.parse(langSpecific) as PeerReviewAuditReport;
    }
    const raw = window.localStorage.getItem(`${PEER_REVIEW_STORAGE_PREFIX}${documentId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PeerReviewAuditReport;
    if (language && parsed.language && parsed.language !== language) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Save cached peer review audit for a document to localStorage
 */
export function saveCachedPeerReviewAudit(documentId: string, report: PeerReviewAuditReport, language?: 'en' | 'id'): void {
  if (typeof window === 'undefined' || !documentId) return;
  try {
    const reportWithLang = language ? { ...report, language } : report;
    if (language) {
      window.localStorage.setItem(`${PEER_REVIEW_STORAGE_PREFIX}${documentId}.${language}`, JSON.stringify(reportWithLang));
    }
    window.localStorage.setItem(`${PEER_REVIEW_STORAGE_PREFIX}${documentId}`, JSON.stringify(reportWithLang));
  } catch (err) {
    console.warn('[PeerReviewer] Failed to cache audit report:', err);
  }
}

/**
 * Helper to compute an initial fallback audit report when offline or testing
 */
export function generateLocalFallbackAudit(params: {
  documentId?: string;
  documentTitle?: string;
  wordCount: number;
  citationCount: number;
  language?: 'en' | 'id';
}): PeerReviewAuditReport {
  const isEn = params.language === 'en';
  const hasEnoughWords = params.wordCount >= 300;
  const hasCitations = params.citationCount >= 3;

  const readinessScore = Math.min(
    Math.max(
      Math.round(
        (hasEnoughWords ? 45 : 20) +
        (hasCitations ? 30 : 10) +
        (params.wordCount > 800 ? 15 : 5)
      ),
      35
    ),
    88
  );

  let overallVerdict: PeerReviewVerdict = 'MAJOR_REVISION';
  if (readinessScore >= 80) overallVerdict = 'MINOR_REVISION';
  else if (readinessScore < 50) overallVerdict = 'REJECT';

  return {
    id: `audit_${Date.now()}`,
    documentId: params.documentId,
    documentTitle: params.documentTitle || 'Academic Manuscript',
    overallVerdict,
    readinessScore,
    executiveSummary: isEn
      ? `The manuscript demonstrates an active exploration of the subject. However, the theoretical framing requires sharper distinction and methodological verification before formal journal submission.`
      : `Naskah menunjukkan pembahasan yang menarik dan relevan. Namun, landasan metodologis dan ketajaman kontribusi teoretis perlu diperkuat sebelum diserahkan ke dewan editor jurnal.`,
    rubric: {
      methodology: {
        score: hasEnoughWords ? 76 : 52,
        verdict: hasEnoughWords ? 'adequate' : 'vulnerable',
        strengths: isEn
          ? ['Clear articulation of research objectives', 'Identified scope of inquiry']
          : ['Tujuan penelitian terdefinisi', 'Ruang lingkup kajian jelas'],
        vulnerabilities: isEn
          ? ['Need explicit justification for sample/dataset selection', 'Threats to validity require deeper treatment']
          : ['Perlu justifikasi eksplisit pemilihan sampel/dataset', 'Ancaman validitas riset perlu diperdalam'],
      },
      significanceAndNovelty: {
        score: 72,
        verdict: 'adequate',
        strengths: isEn
          ? ['Timely research domain', 'Addresses practical application']
          : ['Topik riset mutakhir', 'Relevan untuk aplikasi praktis'],
        vulnerabilities: isEn
          ? ['Positioning against the latest 2024-2026 literature could be more assertive']
          : ['Posisi kontribusi dibanding literatur terbaru (2024-2026) perlu ditegaskan'],
      },
      argumentCoherence: {
        score: hasEnoughWords ? 78 : 60,
        verdict: hasEnoughWords ? 'adequate' : 'vulnerable',
        strengths: isEn
          ? ['Logical progression between paragraphs']
          : ['Alur pemikiran antar bagian tertata'],
        vulnerabilities: isEn
          ? ['Transitions between findings and discussion could be tightened']
          : ['Transisi antara hasil temuan dan diskusi perlu dipertajam'],
      },
      citationAdequacy: {
        score: hasCitations ? 84 : 48,
        verdict: hasCitations ? 'strong' : 'vulnerable',
        strengths: isEn
          ? [`Includes ${params.citationCount} referenced peer-reviewed sources`]
          : [`Memuat ${params.citationCount} rujukan terindeks`],
        vulnerabilities: hasCitations
          ? (isEn ? ['Ensure all in-text citations are matched in reference list'] : ['Pastikan semua sitasi in-text sinkron di daftar pustaka'])
          : (isEn ? ['Insufficient citations; journal review requires at least 15-20 verified sources'] : ['Jumlah sitasi minim; standar jurnal membutuhkan 15-20 referensi']),
      },
    },
    criticalInquiries: [
      {
        id: 'inq_1',
        question: isEn
          ? 'How does this methodology control for confounding external factors or sample selection bias?'
          : 'Bagaimana metodologi penelitian ini mengontrol faktor perancu eksternal atau bias pemilihan sampel?',
        section: isEn ? 'Methodology' : 'Metodologi',
        importance: 'critical',
        suggestedRemedy: isEn
          ? 'Include a dedicated subsection explicitly detailing sample inclusion criteria and bias mitigations.'
          : 'Tambahkan sub-bab khusus yang merinci kriteria inklusi sampel dan mitigasi bias.',
      },
      {
        id: 'inq_2',
        question: isEn
          ? 'What is the precise quantitative or qualitative threshold distinguishing your contribution from existing state-of-the-art?'
          : 'Apa tolok ukur spesifik yang membedakan kontribusi riset Anda dari literatur rujukan sebelumnya?',
        section: isEn ? 'Introduction / Discussion' : 'Pendahuluan / Pembahasan',
        importance: 'moderate',
        suggestedRemedy: isEn
          ? 'Formulate a comparative synthesis table or dedicated contribution bullet points.'
          : 'Buat tabel perbandingan atau rangkuman poin kontribusi spesifik di akhir bab pendahuluan.',
      },
    ],
    actionableChecklist: [
      {
        id: 'chk_1',
        task: isEn
          ? 'Clarify research design boundaries and threats to external validity'
          : 'Perjelas batasan desain riset dan ancaman validitas eksternal',
        status: 'todo',
        priority: 'high',
      },
      {
        id: 'chk_2',
        task: isEn
          ? 'Expand literature review with 3-5 recent peer-reviewed empirical studies'
          : 'Perkaya tinjauan pustaka dengan 3-5 paper empiris terbaru',
        status: 'todo',
        priority: 'high',
      },
      {
        id: 'chk_3',
        task: isEn
          ? 'Tighten conclusions to ensure every claim is empirically supported'
          : 'Periksa kesimpulan agar setiap klaim didukung data/literatur secara langsung',
        status: 'todo',
        priority: 'medium',
      },
    ],
    createdAt: new Date().toISOString(),
  };
}
