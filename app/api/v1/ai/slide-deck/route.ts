// app/api/v1/ai/slide-deck/route.ts
// AI Conference & Thesis Defense Slide Deck Generator Endpoint (Phase 35+)

import { NextResponse, NextRequest } from 'next/server';
import { checkPersonalQuota, recordPersonalTokenConsumption, estimateTokens } from '@/lib/ai/token-quota';
import { generateIdempotencyKey, getIdempotentAiResponse, setIdempotentAiResponse } from '@/lib/ai/idempotency-cache';
import { createPendingAiGeneration, completeAiGeneration, failAiGeneration } from '@/lib/ai/server-ai-logger';
import { geminiKeyPool } from '@/lib/ai/gemini-key-pool';
import { resolveTenantKey } from '@/lib/ai/tenant-key-resolver';
import {
  type SlideDeckProject,
  generateAcademicSlideDeck,
  normalizeSlideDeckProject,
} from '@/lib/editor/slide-deck-generator';

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

export function buildSlideDeckPrompt(params: {
  documentTitle: string;
  manuscriptText: string;
  authorName?: string;
  institutionName?: string;
  templateTheme?: string;
  language: 'en' | 'id';
}): string {
  const { documentTitle, manuscriptText, authorName, institutionName, templateTheme = 'academic-modern', language } = params;
  const isEn = language === 'en';
  const author = authorName || (isEn ? 'Researcher / Author' : 'Peneliti / Mahasiswa');
  const institution = institutionName || 'ScholarFlow Academic Workspace';

  // Sample or truncate text to avoid token limits (~16,000 characters)
  const sampledText = (manuscriptText || '').slice(0, 16000);

  if (isEn) {
    return (
      `You are an elite academic curriculum dean, senior thesis defense examiner, and scientific conference session chair.\n` +
      `Your task is to analyze the user's research manuscript and synthesize it into a high-impact, professional 9-slide thesis defense / conference presentation deck.\n\n` +
      `RESEARCH DETAILS:\n` +
      `- Manuscript Title: "${documentTitle}"\n` +
      `- Presenter / Author: ${author}\n` +
      `- Institution / Affiliation: ${institution}\n` +
      `- Presentation Theme: ${templateTheme}\n\n` +
      `MANUSCRIPT CONTENT FROM CANVAS:\n` +
      `"""\n` +
      `${sampledText || 'No detailed body text provided. Generate academically rigorous slides based on the title and standard research defense structure.'}\n` +
      `"""\n\n` +
      `INSTRUCTIONS:\n` +
      `1. Synthesize 9 coherent, highly tailored defense slides conforming to standard academic examination expectations:\n` +
      `   - Slide 1 (title): Title, Presenter, Institution, and formal greeting bullet points.\n` +
      `   - Slide 2 (problem): Background, Research Gap, and Problem Statement derived directly from the manuscript.\n` +
      `   - Slide 3 (objectives): Research Questions, Hypotheses, and Scope.\n` +
      `   - Slide 4 (literature): Theoretical Framework, Key Literature, and Baseline models.\n` +
      `   - Slide 5 (methodology): Research Design, Data Collection, Population/Sample, and Analysis protocols.\n` +
      `   - Slide 6 (findings): Key Results, Empirical Findings, statistical significance, or qualitative insights.\n` +
      `   - Slide 7 (discussion): Theoretical & Practical Implications, Novelty vs Prior Art.\n` +
      `   - Slide 8 (conclusion): Core Takeaways, Research Limitations, and Prospective Future Studies.\n` +
      `   - Slide 9 (references): Selected Primary Citations, Supervisor Acknowledgments, and formal Q&A opening.\n` +
      `2. For each slide, write concise, high-impact bulletPoints (3 to 4 points max, <= 25 words each).\n` +
      `3. For each slide, formulate realistic speakerNotes (2-3 spoken sentences that the presenter can read aloud to the examiners).\n` +
      `4. Return ONLY a valid JSON object matching the schema below without markdown backticks or commentary.\n\n` +
      `JSON SCHEMA:\n` +
      `{\n` +
      `  "title": "${documentTitle}",\n` +
      `  "presenter": "${author}",\n` +
      `  "institution": "${institution}",\n` +
      `  "templateTheme": "${templateTheme}",\n` +
      `  "estimatedMinutes": 15,\n` +
      `  "slides": [\n` +
      `    {\n` +
      `      "id": "slide-title-1",\n` +
      `      "slideNumber": 1,\n` +
      `      "title": "${documentTitle}",\n` +
      `      "subtitle": "Research Defense Presentation",\n` +
      `      "category": "title",\n` +
      `      "bulletPoints": ["Author: ${author}", "Institution: ${institution}", "Format: Thesis Defense Track"],\n` +
      `      "speakerNotes": "Welcome examiners..."\n` +
      `    }\n` +
      `  ]\n` +
      `}`
    );
  }

  return (
    `Anda adalah guru besar akademis senior, ketua dewan penguji sidang skripsi/tesis/disertasi, dan ketua sesi konferensi ilmiah terkemuka.\n` +
    `Tugas Anda adalah menganalisis teks naskah penelitian pengguna dan menyintesisnya menjadi rangkaian 9 slide presentasi sidang akademik yang profesional, berbobot ilmiah tinggi, dan relevan.\n\n` +
    `INFORMASI PENELITIAN:\n` +
    `- Judul Naskah: "${documentTitle}"\n` +
    `- Penyusun / Peneliti: ${author}\n` +
    `- Institusi: ${institution}\n` +
    `- Tema Desain: ${templateTheme}\n\n` +
    `ISI NASKAH DARI KANVAS:\n` +
    `"""\n` +
    `${sampledText || 'Tidak ada teks badan dokumen yang lengkap. Susun slide sidang baku secara akademis berdasarkan judul dan struktur ilmiah baku.'}\n` +
    `"""\n\n` +
    `INSTRUKSI PEMBUATAN SLIDE:\n` +
    `1. Susun 9 slide sidang komprehensif dalam Bahasa Indonesia akademik formal yang mencakup:\n` +
    `   - Slide 1 (title): Judul Lengkap, Peneliti, Institusi, dan Sesi Ujian Sidang.\n` +
    `   - Slide 2 (problem): Latar Belakang Masalah, Urgensi Riset, dan Kesenjangan Empiris dari naskah.\n` +
    `   - Slide 3 (objectives): Rumusan Masalah, Tujuan Penelitian, dan Batasan Ruang Lingkup.\n` +
    `   - Slide 4 (literature): Landasan Teori Utama, Kerangka Konseptual, dan Kajian Pustaka Terdahulu.\n` +
    `   - Slide 5 (methodology): Desain Penelitian, Sumber Data/Sampel, Instrumen, dan Teknik Analisis.\n` +
    `   - Slide 6 (findings): Temuan Kunci, Bukti Empiris, Nilai Signifikansi, atau Pola Data Utama.\n` +
    `   - Slide 7 (discussion): Pembahasan Hasil, Kebaruan (Novelty), dan Perbandingan dengan Teori Acuan.\n` +
    `   - Slide 8 (conclusion): Kesimpulan Menjawab Rumusan Masalah, Implikasi Praktis, dan Saran Riset Masa Depan.\n` +
    `   - Slide 9 (references): Rujukan Utama, Ucapan Terima Kasih kepada Pembimbing/Penguji, dan Pembuka Sesi Tanya Jawab.\n` +
    `2. Untuk setiap slide, berikan bulletPoints yang padat, jelas, dan berbobot (3-4 poin per slide, maks 25 kata per poin).\n` +
    `3. Untuk setiap slide, sertakan speakerNotes (2-3 kalimat narasi lisan yang santun dan siap dibacakan mahasiswa di hadapan dewan penguji).\n` +
    `4. Berikan HANYA format JSON valid tanpa tanda kutip markdown (\`\`\`json), tanpa pengantar atau penutup obrolan.\n\n` +
    `SKEMA JSON:\n` +
    `{\n` +
    `  "title": "${documentTitle}",\n` +
    `  "presenter": "${author}",\n` +
    `  "institution": "${institution}",\n` +
    `  "templateTheme": "${templateTheme}",\n` +
    `  "estimatedMinutes": 15,\n` +
    `  "slides": [\n` +
    `    {\n` +
    `      "id": "slide-title-1",\n` +
    `      "slideNumber": 1,\n` +
    `      "title": "${documentTitle}",\n` +
    `      "subtitle": "Presentasi Ujian Sidang Skripsi",\n` +
    `      "category": "title",\n` +
    `      "bulletPoints": ["Penyusun: ${author}", "Institusi: ${institution}", "Sesi: Ujian Sidang Sarjana / Konferensi"],\n` +
    `      "speakerNotes": "Selamat pagi/siang dewan penguji yang terhormat..."\n` +
    `    }\n` +
    `  ]\n` +
    `}`
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      documentTitle = 'Academic Research Defense',
      manuscriptText = '',
      editorBlocks = [],
      authorName,
      institutionName,
      templateTheme = 'academic-modern',
      language = 'id',
      userId,
      userPlan = 'free',
      model = 'gemini-1.5-flash',
    } = body;

    const isEn = language === 'en';
    const trimmedTitle = (documentTitle || '').trim() || (isEn ? 'Academic Research Presentation' : 'Presentasi Sidang Skripsi');

    // 1. Smart Idempotency Cache Check (TTL 5 mins)
    const contentSignature = (trimmedTitle + ':' + manuscriptText.slice(0, 500)).replace(/\s+/g, '');
    const idempotencyKey = generateIdempotencyKey(
      userId || 'anon',
      'slide_deck',
      `${templateTheme}:${language}`,
      contentSignature
    );
    const cachedResponse = getIdempotentAiResponse<SlideDeckProject>(idempotencyKey);
    if (cachedResponse) {
      return NextResponse.json({
        success: true,
        data: cachedResponse,
        is_idempotent_hit: true,
        tokens_consumed: 0,
      });
    }

    // 2. Personal Token Quota Guard
    const estimatedCost = estimateTokens((trimmedTitle + manuscriptText).slice(0, 10000));
    const quotaCheck = await checkPersonalQuota(userId, userPlan);
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        {
          error: isEn
            ? 'Monthly AI token quota exceeded. Please upgrade to Pro for 1,000,000 tokens.'
            : 'Batas kuota token AI bulanan telah tercapai. Silakan tingkatkan ke Pro untuk 1.000.000 token.',
          quotaExceeded: true,
          tokensUsed: quotaCheck.used,
          monthlyQuota: quotaCheck.limit,
          remainingTokens: quotaCheck.remaining,
        },
        { status: 403 }
      );
    }

    // 3. Multi-Tenant Campus Dedicated Key Resolver
    const tenantKey = await resolveTenantKey({
      userId,
      userPlan,
      category: 'text',
    });

    // 4. Server AI Logger (Pending)
    const pendingGenId = await createPendingAiGeneration({
      userId: userId || 'anonymous',
      model: process.env.GEMINI_MODEL || model || 'gemini-1.5-flash',
      originalText: `SlideDeck: ${trimmedTitle}`,
      documentId: body.documentId,
      tone: 'academic_defense',
      featureType: 'slide_deck_generator',
    });

    // 5. Build prompt
    const prompt = buildSlideDeckPrompt({
      documentTitle: trimmedTitle,
      manuscriptText,
      authorName,
      institutionName,
      templateTheme,
      language: isEn ? 'en' : 'id',
    });

    // Baseline fallback deck in case of parsing variance
    const fallbackDeck = generateAcademicSlideDeck(editorBlocks, trimmedTitle, {
      authorName,
      institutionName,
      templateTheme,
      language: isEn ? 'en' : 'id',
    });

    let rawText = '';
    const activeModel = process.env.GEMINI_MODEL || model || 'gemini-1.5-flash';

    try {
      const execution = await geminiKeyPool.execute(
        async (apiKey: string) => {
          const endpoint = `${GEMINI_API_BASE_URL}/models/${activeModel}:generateContent?key=${apiKey}`;
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.25,
                maxOutputTokens: 3000,
                responseMimeType: 'application/json',
              },
            }),
          });

          if (!response.ok) {
            const errText = await response.text();
            const errObj = new Error(`AI slide deck generation failed: ${errText}`);
            (errObj as any).status = response.status;
            throw errObj;
          }

          return await response.json();
        },
        tenantKey?.customKey,
        tenantKey?.category
      );

      const data = execution.result;
      rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (llmError: any) {
      if (pendingGenId) {
        await failAiGeneration(pendingGenId, llmError?.message || 'AI slide deck generation failed');
      }

      // Non-destructive fallback: return local deck with note
      return NextResponse.json({
        success: true,
        data: fallbackDeck,
        is_fallback: true,
        error_details: llmError?.message || 'AI request failed, fallback applied',
        tokens_consumed: 0,
      });
    }

    // Parse JSON
    let parsedRaw: any = null;
    try {
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedRaw = JSON.parse(cleaned);
    } catch {
      parsedRaw = fallbackDeck;
    }

    const normalizedDeck = normalizeSlideDeckProject(parsedRaw, fallbackDeck);

    // Calculate token consumption
    const consumedTokens = estimateTokens(prompt + rawText);
    await recordPersonalTokenConsumption(userId, consumedTokens, userPlan);

    // 6. Complete Server AI Generation & Store Idempotency Cache
    if (pendingGenId) {
      await completeAiGeneration(pendingGenId, {
        resultText: JSON.stringify(normalizedDeck),
        tokensConsumed: consumedTokens,
      });
    }

    setIdempotentAiResponse(idempotencyKey, normalizedDeck);

    return NextResponse.json({
      success: true,
      data: normalizedDeck,
      tokens_consumed: consumedTokens,
      generation_id: pendingGenId,
    });
  } catch (error: any) {
    console.error('Slide deck endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error processing slide deck request', details: error?.message },
      { status: 500 }
    );
  }
}
