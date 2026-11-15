// app/api/v1/ai/auto-cite-match/route.ts
// AI Semantic Auto-Citation Matchmaker Endpoint

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { geminiKeyPool } from '@/lib/ai/gemini-key-pool';
import { resolveTenantKey } from '@/lib/ai/tenant-key-resolver';
import { checkPersonalQuota, recordPersonalTokenConsumption, estimateTokens } from '@/lib/ai/token-quota';
import { generateIdempotencyKey, getIdempotentAiResponse, setIdempotentAiResponse } from '@/lib/ai/idempotency-cache';
import { createPendingAiGeneration, completeAiGeneration, failAiGeneration } from '@/lib/ai/server-ai-logger';
import type { CitationCandidate } from '@/lib/api/citations';
import { type AutoCiteMatch, buildAutoCitePrompt } from '@/lib/api/auto-cite';

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com';

async function callDirectGemini(
  prompt: string,
  apiKey: string,
  modelName: string = 'gemini-1.5-flash-latest'
): Promise<string> {
  const candidateModels = Array.from(
    new Set([
      modelName,
      'gemini-1.5-flash-latest',
      'gemini-2.5-flash',
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash',
      'gemini-2.0-flash',
    ])
  );

  let lastError: Error | null = null;
  for (const mod of candidateModels) {
    for (const apiVer of ['v1beta', 'v1']) {
      try {
        const endpoint = `${GEMINI_API_BASE_URL}/${apiVer}/models/${mod}:generateContent?key=${apiKey}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              topP: 0.8,
              maxOutputTokens: 4096,
            },
          }),
        });

        if (!response.ok) {
          const errBody = await response.text().catch(() => '');
          // If 404, try next model candidate or API version
          if (response.status === 404) {
            lastError = new Error(`Gemini API error 404 (${mod} on ${apiVer}): ${errBody}`);
            continue;
          }
          throw new Error(`Gemini API error ${response.status}: ${errBody}`);
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        const contentPart = candidate?.content?.parts?.[0]?.text;
        if (contentPart) return contentPart;
      } catch (err: any) {
        if (err.message?.includes('402')) throw err; // Prepayment exhausted, bubble up
        lastError = err;
      }
    }
  }

  throw lastError || new Error('No content returned from Gemini.');
}

async function callCustomOpenAI(
  prompt: string,
  modelName: string,
  baseUrl: string,
  apiKey: string
): Promise<string> {
  let endpoint = baseUrl.trim();
  if (!endpoint.endsWith('/chat/completions')) {
    const cleanUrl = endpoint.replace(/\/+$/, '');
    endpoint = cleanUrl.endsWith('/v1') ? `${cleanUrl}/chat/completions` : `${cleanUrl}/v1/chat/completions`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelName,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Custom Provider API ${response.status}: ${errText}`);
  }

  const result = await response.json();
  const text = result?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Custom Provider returned empty text');
  return text;
}

async function callOpenRouter(prompt: string, modelName: string, apiKey: string): Promise<string> {
  const candidateModels = Array.from(
    new Set([
      modelName,
      'google/gemini-2.0-flash-exp:free',
      'google/gemini-flash-1.5-8b:free',
      'meta-llama/llama-3.3-70b-instruct:free',
      'deepseek/deepseek-chat',
      'anthropic/claude-3.5-sonnet-20241022',
      'google/gemma-2-9b-it:free',
    ])
  );

  let lastError: Error | null = null;
  for (const mod of candidateModels) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://scholarflow.app',
          'X-Title': 'ScholarFlow',
        },
        body: JSON.stringify({
          model: mod,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        // If 404 (model retired/discontinued on OpenRouter), try next candidate
        if (response.status === 404) {
          lastError = new Error(`OpenRouter API 404 (${mod}): ${errText}`);
          continue;
        }
        throw new Error(`OpenRouter API ${response.status}: ${errText}`);
      }

      const result = await response.json();
      const text = result?.choices?.[0]?.message?.content?.trim();
      if (text) return text;
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error('OpenRouter returned empty text');
}

export async function POST(req: Request) {
  let aiGenerationId: string | null = null;
  try {
    const body = await req.json();
    const {
      blocks = [],
      candidates = [],
      language = 'en',
      userId,
      userPlan = 'free',
      customApiKey,
      documentId,
    } = body;

    const isEn = language === 'en';

    if (!Array.isArray(blocks) || blocks.length === 0) {
      return NextResponse.json(
        { error: isEn ? 'No manuscript text blocks provided to analyze.' : 'Tidak ada blok teks naskah untuk dianalisis.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(candidates) || candidates.length === 0) {
      return NextResponse.json(
        { error: isEn ? 'No reference candidates provided.' : 'Tidak ada berkas/daftar referensi rujukan.' },
        { status: 400 }
      );
    }

    // 1. Smart Idempotency Cache Check (TTL 5 mins)
    const allBlocksText = blocks.map((b: any) => b.text || '').join(' ').slice(0, 500);
    const candidateIds = candidates.map((c: any) => c.reference_id).sort().join(',');
    const idempotencyKey = generateIdempotencyKey(
      userId || 'anon',
      'auto_cite_match',
      language,
      `${candidateIds}:${allBlocksText}`
    );
    const cachedResponse = getIdempotentAiResponse<any>(idempotencyKey);
    if (cachedResponse) {
      return NextResponse.json({
        ...cachedResponse,
        isIdempotentHit: true,
        tokensConsumed: 0,
      });
    }

    // 2. Personal Token Quota Guard
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

    // 3. Multi-Tenant Campus Dedicated AI Key Resolver & Tier Authorization Guard
    const tenantKey = await resolveTenantKey({
      userId,
      userPlan,
      category: 'text',
    });

    const isByok = tenantKey.source === 'campus_byok' || !!customApiKey;
    const isProOrHigher =
      userPlan === 'pro' ||
      userPlan === 'institution' ||
      userPlan === 'enterprise' ||
      isByok;

    // Strict Pro-tier gating for full-manuscript Auto-Citation
    if (!isProOrHigher) {
      return NextResponse.json(
        {
          error: isEn
            ? 'Auto-Cite is an exclusive Pro feature. Please upgrade to Pro to unlock automated AI manuscript citation matching.'
            : 'Fitur Auto-Sitasi naskah eksklusif untuk pengguna paket Pro. Silakan upgrade akun Anda ke Pro untuk menikmati pencocokan sitasi otomatis.',
          proRequired: true,
        },
        { status: 403 }
      );
    }

    // 4. Server-Side AI Logger (Pending)
    const initialLoggedModel = isProOrHigher ? 'gemini-2.0-flash' : 'gemini-1.5-flash';

    aiGenerationId = await createPendingAiGeneration({
      userId: userId || 'anonymous',
      model: initialLoggedModel,
      originalText: `Auto-Cite Match: ${candidates.length} refs across ${blocks.length} blocks [Plan: ${userPlan}]`,
      documentId,
      tone: 'citation_match',
      featureType: 'auto_cite',
    });

    // 5. Construct Prompt
    const prompt = buildAutoCitePrompt({
      blocks,
      candidates,
      language: isEn ? 'en' : 'id',
    });

    // Query active providers and models from Supabase database
    const dbClient = supabaseAdmin || supabase;
    const { data: dbProviders } = await dbClient.from('ai_providers').select('*');
    const { data: dbModels } = await dbClient.from('ai_models').select('*');

    const providersList: any[] = dbProviders || [];
    const modelsList: any[] = dbModels || [];

    const attempts: { name: string; modelName: string; run: () => Promise<string> }[] = [];

    // 1. If caller supplied customApiKey or campus tenantKey (BYOK)
    if (customApiKey || tenantKey.customKey) {
      const explicitKey = customApiKey || tenantKey.customKey!;
      const keyModel = isProOrHigher ? 'gemini-2.0-flash' : 'gemini-1.5-flash';
      attempts.push({
        name: `Caller / Tenant Custom Key (${keyModel})`,
        modelName: keyModel,
        run: () => callDirectGemini(prompt, explicitKey, keyModel),
      });
    }

    // 2. Database Gemini providers (google-gemini, google-gemini-pro)
    const geminiProviders = providersList.filter(
      (p) => p.type === 'gemini' && p.api_key && p.api_key.trim().length > 5
    );
    for (const gp of geminiProviders) {
      const isProProvider = gp.id?.includes('pro') || gp.name?.toLowerCase().includes('pro');
      // Pro models only accessible if user is on Pro/Institution tier or BYOK
      if (isProProvider && !isProOrHigher) {
        continue; // Gated: Free users cannot consume Pro tier provider keys
      }

      const geminiModel = isProProvider ? 'gemini-2.0-flash' : 'gemini-1.5-flash';
      attempts.push({
        name: `Database Gemini: ${gp.name || gp.id} (${geminiModel})`,
        modelName: geminiModel,
        run: () => callDirectGemini(prompt, gp.api_key.trim(), geminiModel),
      });
    }

    // 3. Database Custom OpenAI providers (nara-router, openagentic, etc.)
    const customOpenAiProviders = providersList.filter(
      (p) => p.type === 'custom_openai' && p.api_key && p.api_key.trim().length > 5 && p.base_url
    );
    for (const cp of customOpenAiProviders) {
      const matchedModel = modelsList.find((m) => m.provider_id === cp.id && m.is_enabled);
      const isModelPremium = matchedModel?.is_premium || matchedModel?.access_tier === 'pro';
      
      // Gate premium models for free users
      if (isModelPremium && !isProOrHigher) {
        continue;
      }

      const modelName = matchedModel?.model_id || (isProOrHigher ? 'agnes-2.5-flash' : 'agnes-2.5-flash');
      attempts.push({
        name: `Database Custom OpenAI: ${cp.name || cp.id} (${modelName})`,
        modelName,
        run: () => callCustomOpenAI(prompt, modelName, cp.base_url, cp.api_key.trim()),
      });
    }

    // 4. Database OpenRouter providers (Tier-Aware model selection)
    const openRouterProviders = providersList.filter(
      (p) => p.type === 'openrouter' && p.api_key && p.api_key.trim().length > 5
    );
    for (const op of openRouterProviders) {
      const orModel = isProOrHigher ? 'anthropic/claude-3.5-sonnet' : 'google/gemma-2-9b-it:free';
      attempts.push({
        name: `Database OpenRouter: ${op.name || op.id} (${orModel})`,
        modelName: orModel,
        run: () => callOpenRouter(prompt, orModel, op.api_key.trim()),
      });
    }

    // 5. Fallback via geminiKeyPool (env keys or pool)
    const poolModel = isProOrHigher ? 'gemini-2.0-flash' : 'gemini-1.5-flash';
    attempts.push({
      name: `Gemini Key Pool (Env Fallback: ${poolModel})`,
      modelName: poolModel,
      run: async () => {
        const exec = await geminiKeyPool.execute(
          async (apiKey) => callDirectGemini(prompt, apiKey, poolModel),
          undefined,
          'text'
        );
        return exec.result;
      },
    });

    let rawText = '';
    let successfulModelName = initialLoggedModel;
    const errors: string[] = [];
    for (let i = 0; i < attempts.length; i++) {
      try {
        rawText = await attempts[i].run();
        if (rawText && rawText.trim().length > 0) {
          successfulModelName = attempts[i].modelName;
          break;
        }
      } catch (attErr: any) {
        errors.push(`${attempts[i].name}: ${attErr?.message || attErr}`);
      }
    }

    if (!rawText) {
      throw new Error(`All configured AI providers failed. Errors: ${errors.join(' | ')}`);
    }

    // Clean JSON markdown code fences
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    }

    let parsedResult: { matches?: any[] } = { matches: [] };
    try {
      parsedResult = JSON.parse(cleaned);
    } catch (parseErr) {
      console.warn('[AutoCite] JSON parse failed, attempting regex extraction:', parseErr);
      const jsonMatch = cleaned.match(/\{[\s\S]*"matches"[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      }
    }

    // Map and enrich matches with candidate reference details
    const candidateMap = new Map<string, CitationCandidate>();
    candidates.forEach((c: CitationCandidate) => {
      candidateMap.set(c.reference_id, c);
    });

    const rawMatches = Array.isArray(parsedResult.matches) ? parsedResult.matches : [];
    const enrichedMatches: AutoCiteMatch[] = rawMatches
      .filter((m) => m && m.sentenceText && m.referenceId && candidateMap.has(m.referenceId))
      .map((m, idx) => {
        const ref = candidateMap.get(m.referenceId)!;
        return {
          matchId: `match_${Date.now()}_${idx}`,
          blockId: m.blockId,
          sentenceText: String(m.sentenceText).trim(),
          referenceId: m.referenceId,
          citationLabel: m.citationLabel || ref.citation_label,
          referenceTitle: ref.title,
          referenceAuthors: ref.authors,
          referenceYear: ref.year,
          confidence: typeof m.confidence === 'number' ? m.confidence : 0.9,
          rationale: m.rationale || (isEn ? 'Direct topical correlation' : 'Korelasi topik langsung'),
        };
      });

    // 6. Token Accounting
    const tokensEstimated = estimateTokens(prompt) + estimateTokens(rawText);
    const tokensConsumed = isByok ? 0 : tokensEstimated;

    let updatedQuota = null;
    if (userId && !isByok) {
      updatedQuota = await recordPersonalTokenConsumption(userId, tokensConsumed);
    }

    const finalResponse = {
      matches: enrichedMatches,
      totalMatches: enrichedMatches.length,
      tokensConsumed,
      tokensRemaining: updatedQuota?.remaining ?? quotaCheck.remaining,
      monthlyQuota: updatedQuota?.limit ?? quotaCheck.limit,
      modelUsed: successfulModelName,
      userPlan,
      isIdempotentHit: false,
    };

    // Cache response
    setIdempotentAiResponse(idempotencyKey, finalResponse);

    if (aiGenerationId) {
      await completeAiGeneration(aiGenerationId, {
        resultText: JSON.stringify(finalResponse),
        tokensConsumed,
        metadata: {
          matchesFound: enrichedMatches.length,
          candidatesCount: candidates.length,
          modelUsed: successfulModelName,
          userPlan,
        },
      });
    }

    return NextResponse.json(finalResponse);
  } catch (err: any) {
    console.error('[AutoCiteMatch] Error:', err);
    if (aiGenerationId) {
      await failAiGeneration(aiGenerationId, err.message || 'Auto-cite matching error');
    }
    return NextResponse.json(
      { error: err.message || 'Internal server error processing auto-citations' },
      { status: 500 }
    );
  }
}
