// app/api/v1/ai/ghostwrite/route.ts
import { NextResponse } from 'next/server';
import { geminiKeyPool } from '@/lib/ai/gemini-key-pool';
import { resolveTenantKey } from '@/lib/ai/tenant-key-resolver';
import { checkPersonalQuota, recordPersonalTokenConsumption, estimateTokens } from '@/lib/ai/token-quota';
import { generateIdempotencyKey, getIdempotentAiResponse, setIdempotentAiResponse } from '@/lib/ai/idempotency-cache';
import { createPendingAiGeneration, completeAiGeneration, failAiGeneration } from '@/lib/ai/server-ai-logger';

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

export function buildGhostwritePrompt(prefix: string, documentTitle?: string, language: string = 'en'): string {
  const isEn = language === 'en';
  const docContext = documentTitle ? `Document Title: "${documentTitle}"\n` : '';

  if (isEn) {
    return (
      `You are an elite academic co-writer and scholarly ghostwriter.\n` +
      `${docContext}` +
      `Your task is to predict and complete the user's sentence or thought with 1 to 2 cohesive, scholarly sentences that seamlessly continue the provided text.\n\n` +
      `Requirements:\n` +
      `- Write in high-level academic English with formal scholarly tone and objective cadence.\n` +
      `- Continue directly from the last word or punctuation mark without repeating any of the preceding text.\n` +
      `- Do NOT output quotation marks, markdown wrappers, greetings, explanations, or asterisks.\n` +
      `- Provide ONLY the exact continuation text that should immediately be appended.\n\n` +
      `Preceding Context:\n"""${prefix.slice(-600)}"""\n\n` +
      `Continuation:`
    );
  }

  return (
    `Anda adalah co-writer akademik senior dan asisten penulisan karya ilmiah.\n` +
    `${docContext}` +
    `Tugas Anda adalah melanjutkan kalimat atau alur pemikiran penulis dengan 1 sampai 2 kalimat akademik yang padat, kohesif, dan ilmiah.\n\n` +
    `Persyaratan:\n` +
    `- Tulis dalam Bahasa Indonesia formal berstandar skripsi/tesis/jurnal ilmiah.\n` +
    `- Lanjutkan langsung dari kata atau tanda baca terakhir tanpa mengulang teks sebelumnya.\n` +
    `- JANGAN menyertakan tanda petik, markdown bold/italic, salam, penjelasan, atau teks pembuka/penutup.\n` +
    `- Berikan HANYA teks kelanjutan yang akan langsung disambungkan ke kursor naskah.\n\n` +
    `Konteks Teks Sebelumnya:\n"""${prefix.slice(-600)}"""\n\n` +
    `Kelanjutan Teks:`
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prefix, documentTitle, language = 'en', model = 'gemini', userId, userPlan = 'free' } = body;

    if (!prefix || typeof prefix !== 'string' || prefix.trim().length < 8) {
      return NextResponse.json({ error: 'Sufficient text context is required for autocomplete.' }, { status: 400 });
    }

    const trimmedPrefix = prefix.trim();

    // 1. Smart Idempotency Cache Check (TTL 5 mins)
    const idempotencyKey = generateIdempotencyKey(userId || 'anon', 'ghostwrite', language, trimmedPrefix.slice(-200));
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

    // 3. Resolve Multi-Tenant Campus Key
    const tenantKeyRes = await resolveTenantKey({
      userId,
      userPlan,
      category: 'text',
    });

    const prompt = buildGhostwritePrompt(trimmedPrefix, documentTitle, language);

    // 4. Server-Side Background Task Tracker (ChatGPT-Style Resilience)
    let aiGenerationId: string | null = null;
    if (userId) {
      aiGenerationId = await createPendingAiGeneration({
        userId,
        featureType: 'ghostwrite',
        originalText: trimmedPrefix.slice(-200),
        tone: 'academic',
        model,
        metadata: {
          documentTitle,
          language,
        },
      });
    }

    // 5. Call LLM with Gemini Key Pool
    let continuationText = '';
    try {
      const { result } = await geminiKeyPool.execute(
        async (apiKey) => {
          const geminiModel = model.includes('2.0') ? 'gemini-2.0-flash' : (process.env.GEMINI_MODEL || 'gemini-1.5-flash');
          const url = `${GEMINI_API_BASE_URL}/models/${geminiModel}:generateContent?key=${apiKey}`;

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.25,
                topP: 0.85,
                maxOutputTokens: 120, // concise 1-2 sentences
              },
            }),
          });

          if (!response.ok) {
            const errText = await response.text().catch(() => '');
            const errObj: any = new Error(`Google API status ${response.status}: ${errText}`);
            errObj.status = response.status;
            throw errObj;
          }

          const resJson = await response.json();
          const candidateParts = resJson?.candidates?.[0]?.content?.parts || [];
          return candidateParts
            .map((part: any) => (part?.text || '').trim())
            .filter(Boolean)
            .join(' ')
            .trim();
        },
        tenantKeyRes.customKey,
        tenantKeyRes.category || 'text'
      );

      continuationText = result || '';
    } catch (llmError: any) {
      if (aiGenerationId) {
        await failAiGeneration(aiGenerationId, llmError.message || 'LLM execution failed');
      }
      return NextResponse.json(
        { error: 'Failed to generate ghost suggestion.', details: llmError.message },
        { status: 502 }
      );
    }

    if (!continuationText) {
      if (aiGenerationId) {
        await failAiGeneration(aiGenerationId, 'Empty continuation returned');
      }
      return NextResponse.json({ suggestion: '' });
    }

    // Clean continuation text: remove quotes or leading formatting
    let cleanSuggestion = continuationText.replace(/^["']|["']$/g, '').trim();
    // Ensure leading space if prefix does not end with space
    if (!trimmedPrefix.endsWith(' ') && !cleanSuggestion.startsWith(' ') && !cleanSuggestion.startsWith('.') && !cleanSuggestion.startsWith(',')) {
      cleanSuggestion = ' ' + cleanSuggestion;
    }

    const tokensConsumed = estimateTokens(prompt) + estimateTokens(cleanSuggestion);
    const usageRecord = await recordPersonalTokenConsumption(userId, tokensConsumed, userPlan);

    // 6. Complete Server Generation Log
    if (aiGenerationId) {
      await completeAiGeneration(aiGenerationId, {
        resultText: cleanSuggestion,
        tokensConsumed,
        metadata: {
          tone: 'ghostwrite',
          model,
          tenant_source: tenantKeyRes.source,
        },
      });
    }

    const resultPayload = {
      suggestion: cleanSuggestion,
      tokens_consumed: tokensConsumed,
      tokens_remaining: usageRecord.remaining,
      monthly_quota: usageRecord.limit,
      tokens_used: usageRecord.used,
      percent_used: usageRecord.percentUsed,
      tenant_source: tenantKeyRes.source,
      is_idempotent_hit: false,
      generation_id: aiGenerationId || undefined,
    };

    setIdempotentAiResponse(idempotencyKey, resultPayload);

    return NextResponse.json(resultPayload);
  } catch (err: any) {
    console.error('Error in ghostwrite API:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
