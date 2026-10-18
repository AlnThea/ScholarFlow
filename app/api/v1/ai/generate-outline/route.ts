// app/api/v1/ai/generate-outline/route.ts
// Phase 31: Personalized Academic Thesis & Paper Outline Generator Endpoint

import { NextResponse } from 'next/server';
import { geminiKeyPool } from '@/lib/ai/gemini-key-pool';
import { resolveTenantKey } from '@/lib/ai/tenant-key-resolver';
import { checkPersonalQuota, recordPersonalTokenConsumption, estimateTokens } from '@/lib/ai/token-quota';
import { generateIdempotencyKey, getIdempotentAiResponse, setIdempotentAiResponse } from '@/lib/ai/idempotency-cache';
import { createPendingAiGeneration, completeAiGeneration, failAiGeneration } from '@/lib/ai/server-ai-logger';
import { getAcademicPreset, AcademicStructurePresetId } from '@/lib/editor/academic-templates';

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

export function buildOutlinePrompt(params: {
  topic: string;
  field?: string;
  methodology?: string;
  presetId: AcademicStructurePresetId;
  language: 'en' | 'id';
}): string {
  const isEn = params.language === 'en';
  const preset = getAcademicPreset(params.presetId);
  const presetName = isEn ? preset.name.en : preset.name.id;
  const sectionsList = preset.sections.map(s => `- ${isEn ? s.title.en : s.title.id}`).join('\n');

  if (isEn) {
    return (
      `You are an elite academic curriculum dean and scholarly research advisor.\n` +
      `Your task is to generate a comprehensive, highly customized academic outline for the user's research topic.\n\n` +
      `RESEARCH DETAILS:\n` +
      `- Research Topic / Title: "${params.topic}"\n` +
      `- Field of Study: ${params.field || 'General Academic'}\n` +
      `- Research Methodology: ${params.methodology || 'Empirical / Mixed Methods'}\n` +
      `- Target Framework: ${presetName}\n\n` +
      `STANDARD SECTIONS TO TAILOR:\n${sectionsList}\n\n` +
      `INSTRUCTIONS:\n` +
      `Generate a JSON object with this exact schema:\n` +
      `{\n` +
      `  "topic": "${params.topic}",\n` +
      `  "executiveSummary": "1-2 sentence academic summary of what this proposed paper investigates.",\n` +
      `  "recommendedMethodology": "Recommended empirical methodology for this topic.",\n` +
      `  "sections": [\n` +
      `    {\n` +
      `      "title": "Section Title (e.g. 1. Introduction or Chapter 1: Introduction)",\n` +
      `      "level": 2,\n` +
      `      "tailoredPrompt": "Specific guiding questions and sub-topics the author must write for this specific topic.",\n` +
      `      "suggestedSubsections": ["Subsection 1.1 ...", "Subsection 1.2 ..."],\n` +
      `      "keyKeywords": ["keyword1", "keyword2", "keyword3"]\n` +
      `    }\n` +
      `  ]\n` +
      `}\n\n` +
      `IMPORTANT RULES:\n` +
      `- Tailor every sub-section specifically to "${params.topic}". Do NOT return generic placeholders.\n` +
      `- Return ONLY the valid JSON object without markdown code blocks, backticks, or conversational preamble.`
    );
  }

  return (
    `Anda adalah guru besar akademis senior dan pembimbing riset skripsi/tesis/jurnal ilmiah berstandar Scopus dan SINTA.\n` +
    `Tugas Anda adalah menyusun kerangka (outline) naskah penelitian yang komprehensif, terstruktur, dan dipersonalisasi sesuai topik riset pengguna.\n\n` +
    `RINCIAN PENELITIAN:\n` +
    `- Judul / Topik Penelitian: "${params.topic}"\n` +
    `- Bidang Ilmu: ${params.field || 'Ilmu Terapan / Umum'}\n` +
    `- Metodologi Penelitian: ${params.methodology || 'Kuantitatif / Kualitatif Terapan'}\n` +
    `- Format Kerangka Acuan: ${presetName}\n\n` +
    `BAGIAN STANDAR YANG PERLU DITINGKATKAN:\n${sectionsList}\n\n` +
    `INSTRUKSI:\n` +
    `Hasilkan objek JSON valid dengan skema berikut:\n` +
    `{\n` +
    `  "topic": "${params.topic}",\n` +
    `  "executiveSummary": "1-2 kalimat ringkasan akademik mengenai fokus penelitian ini.",\n` +
    `  "recommendedMethodology": "Rekomendasi metode penelitian yang tepat untuk topik ini.",\n` +
    `  "sections": [\n` +
    `    {\n` +
    `      "title": "Judul Bagian (contoh: Bab 1: Pendahuluan atau 1. Pendahuluan)",\n` +
    `      "level": 2,\n` +
    `      "tailoredPrompt": "Panduan penulisan spesifik yang menguraikan apa yang wajib diuraikan mahasiswa/peneliti pada topik ini.",\n` +
    `      "suggestedSubsections": ["Sub-bab 1.1 ...", "Sub-bab 1.2 ..."],\n` +
    `      "keyKeywords": ["kataKunci1", "kataKunci2", "kataKunci3"]\n` +
    `    }\n` +
    `  ]\n` +
    `}\n\n` +
    `ATURAN PENTING:\n` +
    `- Sesuaikan setiap sub-bab secara nyata dengan topik "${params.topic}". JANGAN berikan teks generik kosong.\n` +
    `- Berikan HANYA format JSON valid tanpa tanda kutip markdown (\`\`\`json), tanpa teks pembuka atau penutup.`
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      topic, 
      field, 
      methodology, 
      presetId = 'imrad', 
      language = 'en', 
      userId, 
      userPlan = 'free',
      institutionId 
    } = body;

    if (!topic || typeof topic !== 'string' || topic.trim().length < 5) {
      return NextResponse.json(
        { error: language === 'en' ? 'A valid research topic/title is required.' : 'Judul/topik penelitian yang valid wajib diisi.' },
        { status: 400 }
      );
    }

    const trimmedTopic = topic.trim();
    const resolvedPresetId: AcademicStructurePresetId = 
      ['imrad', 'skripsi_5bab', 'slr_prisma', 'case_study'].includes(presetId) 
        ? presetId 
        : 'imrad';

    // 1. Smart Idempotency Cache Check (TTL 5 mins)
    const idempotencyKey = generateIdempotencyKey(
      userId || 'anon',
      'outline_gen',
      language,
      `${resolvedPresetId}:${trimmedTopic}:${field || ''}`
    );
    const cachedResponse = getIdempotentAiResponse<any>(idempotencyKey);
    if (cachedResponse) {
      return NextResponse.json({
        ...cachedResponse,
        is_idempotent_hit: true,
        tokens_consumed: 0,
      });
    }

    // 2. Personal Token Quota Guard
    const quotaCheck = await checkPersonalQuota(userId, userPlan);
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        {
          error: language === 'en'
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

    // 3. Multi-Tenant Campus Dedicated AI Key Resolver
    const tenantKey = await resolveTenantKey(institutionId, 'text');
    const selectedApiKey = tenantKey?.apiKey || geminiKeyPool.getAvailableKey();

    if (!selectedApiKey) {
      return NextResponse.json(
        { error: language === 'en' ? 'No active AI key available.' : 'Kunci API AI tidak tersedia.' },
        { status: 503 }
      );
    }

    // 4. Server-Side AI Logger (Pending)
    const pendingGenId = await createPendingAiGeneration({
      userId: userId || 'anonymous',
      modelUsed: 'gemini-1.5-flash',
      prompt: `Outline: ${trimmedTopic}`,
      draftBefore: trimmedTopic,
      documentId: body.documentId,
      tone: 'scaffold',
      featureCategory: 'outline_generator',
    });

    // 5. Construct Prompt
    const prompt = buildOutlinePrompt({
      topic: trimmedTopic,
      field,
      methodology,
      presetId: resolvedPresetId,
      language: language === 'id' ? 'id' : 'en'
    });

    const endpoint = `${GEMINI_API_BASE_URL}/models/gemini-1.5-flash:generateContent?key=${selectedApiKey}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      await failAiGeneration(pendingGenId, errText);
      return NextResponse.json(
        { error: 'AI generation failed', details: errText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse JSON
    let parsedOutline: any = null;
    try {
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedOutline = JSON.parse(cleaned);
    } catch {
      parsedOutline = {
        topic: trimmedTopic,
        executiveSummary: rawText.slice(0, 200),
        sections: []
      };
    }

    // Calculate token consumption
    const estimatedTokens = estimateTokens(prompt + rawText);
    await recordPersonalTokenConsumption(userId, userPlan, estimatedTokens);

    const resultPayload = {
      success: true,
      data: parsedOutline,
      presetId: resolvedPresetId,
      language,
      tokens_consumed: estimatedTokens,
      generation_id: pendingGenId
    };

    // 6. Complete Server AI Generation & Store Idempotency Cache
    await completeAiGeneration(pendingGenId, JSON.stringify(parsedOutline), estimatedTokens);
    setIdempotentAiResponse(idempotencyKey, resultPayload);

    return NextResponse.json(resultPayload);
  } catch (error: any) {
    console.error('[GenerateOutline API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
