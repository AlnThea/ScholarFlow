// app/api/v1/ai/peer-review/route.ts
// AI Peer Reviewer & Journal Readiness Audit Simulator (Phase 25)

import { NextResponse, NextRequest } from 'next/server';
import { checkPersonalQuota, recordPersonalTokenConsumption, estimateTokens } from '@/lib/ai/token-quota';
import { generateIdempotencyKey, getIdempotentAiResponse, setIdempotentAiResponse } from '@/lib/ai/idempotency-cache';
import { createPendingAiGeneration, completeAiGeneration, failAiGeneration } from '@/lib/ai/server-ai-logger';
import { geminiKeyPool } from '@/lib/ai/gemini-key-pool';
import { resolveTenantKey } from '@/lib/ai/tenant-key-resolver';
import { generateLocalFallbackAudit, type PeerReviewAuditReport } from '@/lib/editor/peer-reviewer';

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

function buildPeerReviewPrompt(params: {
  documentTitle: string;
  manuscriptText: string;
  wordCount: number;
  citationCount: number;
  targetTier: string;
  language: 'en' | 'id';
}): string {
  const { documentTitle, manuscriptText, wordCount, citationCount, targetTier, language } = params;
  const isEn = language === 'en';

  // Sample or truncate text to avoid exceeding token limit (up to 4,000 words)
  const sampledText = manuscriptText.slice(0, 16000);

  if (isEn) {
    return `You are a distinguished Senior Editor and renowned "Reviewer #2" for top-tier international scientific journals (e.g. Nature, IEEE Transactions, Elsevier, Springer).
You are conducting a rigorous, highly constructive peer-review audit simulation on this academic manuscript.

TARGET JOURNAL BENCHMARK: ${targetTier.toUpperCase()}
MANUSCRIPT TITLE: "${documentTitle}"
TOTAL WORD COUNT: ${wordCount}
TOTAL CITATIONS: ${citationCount}

MANUSCRIPT EXCERPT / TEXT:
"""
${sampledText || 'Title and abstract available; evaluate based on domain expectations.'}
"""

YOUR INSTRUCTIONS:
1. Objectively evaluate the paper across 4 standard peer-review dimensions:
   a. Methodology & Rigor (sample size, control of bias, validity of research design)
   b. Scientific Significance & Novelty (originality, distinction from prior state-of-the-art)
   c. Argument Coherence & Structure (logical flow, paragraph transitions, academic rigor)
   d. Citation Adequacy & Scholarly Flow (in-text citations, contextual framing, reference density)

2. Determine an Overall Verdict from:
   - "ACCEPT" (Readiness Score 85-100: Exceptional, minor copyediting only)
   - "MINOR_REVISION" (Readiness Score 70-84: Strong foundation, slight clarifications needed)
   - "MAJOR_REVISION" (Readiness Score 50-69: Substantial methodological or framing gaps)
   - "REJECT" (Readiness Score < 50: Critical structural deficiencies or severe lack of evidence)

3. Formulate 2-3 specific "Reviewer #2 Critical Inquiries" that the author must be prepared to defend.
4. Provide 3-4 actionable checklist items for the author before journal submission.

OUTPUT FORMAT:
You MUST reply strictly in JSON matching this schema:
{
  "overallVerdict": "ACCEPT" | "MINOR_REVISION" | "MAJOR_REVISION" | "REJECT",
  "readinessScore": 78,
  "executiveSummary": "A concise executive critique of the manuscript's readiness...",
  "rubric": {
    "methodology": {
      "score": 75,
      "verdict": "adequate",
      "strengths": ["List 1-2 strengths"],
      "vulnerabilities": ["List 1-2 vulnerabilities"]
    },
    "significanceAndNovelty": {
      "score": 80,
      "verdict": "strong",
      "strengths": ["..."],
      "vulnerabilities": ["..."]
    },
    "argumentCoherence": {
      "score": 72,
      "verdict": "adequate",
      "strengths": ["..."],
      "vulnerabilities": ["..."]
    },
    "citationAdequacy": {
      "score": 85,
      "verdict": "strong",
      "strengths": ["..."],
      "vulnerabilities": ["..."]
    }
  },
  "criticalInquiries": [
    {
      "id": "inq_1",
      "question": "The specific challenging question reviewer will ask...",
      "section": "Methodology",
      "importance": "critical",
      "suggestedRemedy": "How author should address this in the manuscript..."
    }
  ],
  "actionableChecklist": [
    {
      "id": "chk_1",
      "task": "Actionable revision item...",
      "status": "todo",
      "priority": "high"
    }
  ]
}
`;
  }

  // Indonesian prompt
  return `Anda adalah seorang Dewan Editor Senior dan "Reviewer #2" terkemuka untuk jurnal ilmiah bereputasi internasional (Scopus Q1/Q2 dan SINTA 1/2).
Tugas Anda adalah melakukan simulasi audit peer-review yang sangat kritis, objektif, dan konstruktif terhadap naskah karya ilmiah ini sebelum disubmit ke jurnal.

TARGET AKREDITASI JURNAL: ${targetTier.toUpperCase()}
JUDUL NASKAH: "${documentTitle}"
JUMLAH KATA: ${wordCount}
JUMLAH SITASI: ${citationCount}

CUPLIKAN NASKAH:
"""
${sampledText || 'Judul dan abstrak tersedia; evaluasi berdasarkan standar metodologi jurnal terkait.'}
"""

PETUNJUK EVALUASI:
1. Evaluasi naskah secara objektif pada 4 rubrik peer review standar:
   a. Metodologi & Ketelitian Ilmiah (ukuran sampel, validitas eksperimen, instrumen, mitigasi bias)
   b. Kebaruan & Kontribusi Ilmiah (novelty, signifikansi dibanding penelitian terdahulu)
   c. Koherensi Argumen & Struktur (alur logika, transisi antar paragraf, kejelasan premis)
   d. Kecukupan Sitasi & Gaya Akademik (kepadatan rujukan mutakhir, integrasi sitasi)

2. Tetapkan Keputusan Akhir (Overall Verdict):
   - "ACCEPT" (Skor Kesiapan 85-100: Naskah sangat matang, layak publikasi langsung)
   - "MINOR_REVISION" (Skor Kesiapan 70-84: Fondasi riset kuat, hanya butuh perbaikan minor)
   - "MAJOR_REVISION" (Skor Kesiapan 50-69: Ada celah metodologis/analisis yang harus ditambal)
   - "REJECT" (Skor Kesiapan < 50: Naskah belum memenuhi standar bukti empiris jurnal ilmiah)

3. Berikan 2-3 Pertanyaan Kritis Khas "Reviewer #2" yang wajib diantisipasi penulis.
4. Buat 3-4 daftar perbaikan konkret (checklist) sebelum naskah disubmit ke editor jurnal.

FORMAT OUTPUT:
Anda WAJIB menjawab HANYA dalam format JSON valid persis seperti ini:
{
  "overallVerdict": "ACCEPT" | "MINOR_REVISION" | "MAJOR_REVISION" | "REJECT",
  "readinessScore": 75,
  "executiveSummary": "Ringkasan eksekutif evaluasi kesiapan naskah dalam 2-3 kalimat...",
  "rubric": {
    "methodology": {
      "score": 70,
      "verdict": "adequate",
      "strengths": ["Kekuatan metodologi..."],
      "vulnerabilities": ["Kelemahan metodologi..."]
    },
    "significanceAndNovelty": {
      "score": 80,
      "verdict": "strong",
      "strengths": ["..."],
      "vulnerabilities": ["..."]
    },
    "argumentCoherence": {
      "score": 75,
      "verdict": "adequate",
      "strengths": ["..."],
      "vulnerabilities": ["..."]
    },
    "citationAdequacy": {
      "score": 72,
      "verdict": "adequate",
      "strengths": ["..."],
      "vulnerabilities": ["..."]
    }
  },
  "criticalInquiries": [
    {
      "id": "inq_1",
      "question": "Pertanyaan tajam reviewer yang menuntut pembuktian...",
      "section": "Metodologi",
      "importance": "critical",
      "suggestedRemedy": "Cara penulis merevisi/menjawab pertanyaan ini pada naskah..."
    }
  ],
  "actionableChecklist": [
    {
      "id": "chk_1",
      "task": "Tindakan revisi konkret yang harus dilakukan...",
      "status": "todo",
      "priority": "high"
    }
  ]
}
`;
}

async function callGeminiForPeerReview(
  prompt: string,
  modelName: string,
  customApiKey?: string
): Promise<string> {
  const { result } = await geminiKeyPool.execute(
    async (apiKey) => {
      const url = `${GEMINI_API_BASE_URL}/models/${modelName}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            topP: 0.9,
            maxOutputTokens: 2500,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!text) throw new Error('Gemini returned an empty peer review response.');
      return text;
    },
    { customKey: customApiKey }
  );

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      documentId = 'doc-current',
      documentTitle = 'Academic Manuscript',
      documentContent = '',
      wordCount = 0,
      citationCount = 0,
      targetTier = 'scopus_q2',
      language = 'id',
      userId,
      userPlan = 'free',
      model = 'gemini-1.5-flash',
    } = body;

    // 1. Idempotency Cache Check (5 min TTL)
    const contentSignature = (documentTitle + ':' + documentContent.slice(0, 500)).replace(/\s+/g, '');
    const idempotencyKey = generateIdempotencyKey(
      userId || 'anon',
      'peer_review',
      `${documentId}:${targetTier}:${language}`,
      contentSignature
    );
    const cachedResponse = getIdempotentAiResponse<PeerReviewAuditReport>(idempotencyKey);
    if (cachedResponse) {
      return NextResponse.json({
        ...cachedResponse,
        is_idempotent_hit: true,
        tokens_consumed: 0,
      });
    }

    // 2. Personal Token Quota Guard
    const estimatedCost = estimateTokens(documentContent.slice(0, 10000));
    const quotaCheck = await checkPersonalQuota(userId, userPlan);
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Personal monthly AI token quota exceeded.',
          quotaExceeded: true,
          tokensUsed: quotaCheck.used,
          monthlyQuota: quotaCheck.limit,
          remainingTokens: quotaCheck.remaining,
        },
        { status: 403 }
      );
    }

    // 3. Multi-Tenant Dedicated Key Resolver
    const tenantKeyRes = await resolveTenantKey({
      userId,
      userPlan,
      category: 'text',
    });

    // 4. Server-Side Logger Tracker
    let aiGenerationId: string | null = null;
    if (userId) {
      aiGenerationId = await createPendingAiGeneration({
        userId,
        documentId,
        featureType: 'peer_review',
        originalText: `[Peer Review] ${documentTitle}`,
        tone: 'peer_review',
        model,
        metadata: {
          wordCount,
          citationCount,
          targetTier,
        },
      });
    }

    // 5. Construct Prompt & Call AI
    const prompt = buildPeerReviewPrompt({
      documentTitle,
      manuscriptText: documentContent,
      wordCount,
      citationCount,
      targetTier,
      language: language === 'en' ? 'en' : 'id',
    });

    let report: PeerReviewAuditReport;

    try {
      const rawOutput = await callGeminiForPeerReview(
        prompt,
        'gemini-1.5-flash',
        tenantKeyRes?.apiKey || undefined
      );

      const cleaned = rawOutput
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();

      const parsed = JSON.parse(cleaned);

      report = {
        id: `audit_${Date.now()}`,
        documentId,
        documentTitle,
        overallVerdict: parsed.overallVerdict || 'MAJOR_REVISION',
        readinessScore: parsed.readinessScore || 70,
        executiveSummary: parsed.executiveSummary || 'Audit summary completed.',
        rubric: parsed.rubric,
        criticalInquiries: parsed.criticalInquiries || [],
        actionableChecklist: parsed.actionableChecklist || [],
        createdAt: new Date().toISOString(),
      };
    } catch (aiErr) {
      console.warn('[PeerReviewer] Primary AI simulation failed, using structured fallback:', aiErr);
      report = generateLocalFallbackAudit({
        documentId,
        documentTitle,
        wordCount,
        citationCount,
        language: language === 'en' ? 'en' : 'id',
      });
    }

    // 6. Deduct Quota Tokens & Complete Logger
    const actualTokens = Math.max(estimateTokens(documentContent.slice(0, 4000)), 50);
    if (userId) {
      await recordPersonalTokenConsumption(userId, actualTokens);
      if (aiGenerationId) {
        await completeAiGeneration(aiGenerationId, actualTokens, report.executiveSummary, {
          verdict: report.overallVerdict,
          readinessScore: report.readinessScore,
        });
      }
    }

    // 7. Cache Response
    setIdempotentAiResponse(idempotencyKey, report, 5 * 60 * 1000);

    return NextResponse.json(report);
  } catch (err: any) {
    console.error('[PeerReviewer] Route handler error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to simulate peer review audit.' },
      { status: 500 }
    );
  }
}
