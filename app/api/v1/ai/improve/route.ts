// app/api/v1/ai/improve/route.ts
export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { defaultAiRateLimiter } from '@/lib/ai/rate-limiter';

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

function buildPrompt(text: string, tone: string, language: string = 'en'): string {
  let toneInstruction = '';
  switch (tone) {
    case 'simplify':
      toneInstruction = 'Simplify complex jargon and sentence structures. Make it clear and highly readable while maintaining scholarly professionalism.';
      break;
    case 'shorten':
      toneInstruction = 'Condense the text. Remove wordiness and redundancy to make it concise and direct without losing key academic meaning.';
      break;
    case 'expand':
      toneInstruction = 'Elaborate on the arguments. Add detail and scholarly depth to expand the draft into a more complete, well-reasoned text.';
      break;
    case 'paraphrase':
      toneInstruction = 'Paraphrase the text. Rewrite it with a different sentence structure and vocabulary while keeping the exact original meaning and a scholarly tone.';
      break;
    case 'summarize':
      toneInstruction = 'Summarize the text. Condense it into a concise, high-level academic summary that highlights the key concepts and findings.';
      break;
    case 'academic':
    default:
      toneInstruction = 'Improve clarity, academic vocabulary, objectivity, and scholarly phrasing.';
      break;
  }

  return (
    'You are an expert academic editor. Rewrite the selected text according to the following instructions:\n' +
    `- Target Tone: ${tone.toUpperCase()}\n` +
    `- Instruction: ${toneInstruction}\n` +
    'Requirements:\n' +
    '- Keep the original meaning and core arguments.\n' +
    '- Do not add external citations, facts, statistics, or unbacked claims.\n' +
    '- Write the rewritten text in the exact same language as the input text (e.g. if the input text is in Indonesian, rewrite the text in Indonesian; if the input text is in English, rewrite in English).\n' +
    '- Return ONLY the rewritten text. Do NOT wrap it in quotes, markdown block, or write any greeting/explanation.\n\n' +
    `Text to rewrite:\n${text}`
  );
}

function fallbackResponse(text: string, tone: string, disclaimer: string) {
  let cleanedText = text.replace(/\s+/g, ' ').trim();
  let improvedText = cleanedText;

  if (cleanedText) {
    improvedText = cleanedText[0].toUpperCase() + cleanedText.substring(1);
    if (!improvedText.endsWith('.')) {
      improvedText += '.';
    }
  }

  return {
    original_text: text,
    improved_text: improvedText,
    tone: tone,
    disclaimer: disclaimer,
  };
}

import { geminiKeyPool } from '@/lib/ai/gemini-key-pool';

/**
 * Streaming Gemini 2.0 Flash API via SSE ReadableStream
 */
async function callDirectGeminiStream(prompt: string, model: string): Promise<ReadableStream> {
  const { result } = await geminiKeyPool.execute(async (apiKey) => {
    const geminiModel = model.includes('2.0') ? 'gemini-2.0-flash' : (process.env.GEMINI_MODEL || 'gemini-1.5-flash');
    const url = `${GEMINI_API_BASE_URL}/models/${geminiModel}:streamGenerateContent?key=${apiKey}&alt=sse`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, topP: 0.9, maxOutputTokens: 2048 },
      }),
    });

    if (!response.ok || !response.body) {
      const errObj: any = new Error(`Gemini Stream error ${response.status}`);
      errObj.status = response.status;
      throw errObj;
    }

    return response.body;
  });

  return result;
}

/**
 * Non-streaming direct Gemini API call with Multi-Key Failover Pool
 */
async function callDirectGemini(prompt: string, model: string, customApiKey?: string): Promise<string> {
  const { result } = await geminiKeyPool.execute(async (apiKey) => {
    const geminiModel = model.includes('2.0') ? 'gemini-2.0-flash' : (process.env.GEMINI_MODEL || 'gemini-1.5-flash');
    const url = `${GEMINI_API_BASE_URL}/models/${geminiModel}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, topP: 0.9, maxOutputTokens: 2048 },
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
    const text = candidateParts
      .map((part: any) => (part?.text || '').trim())
      .filter(Boolean)
      .join('\n')
      .trim();

    if (!text) throw new Error('Google API returned empty text');
    return text;
  }, customApiKey);

  return result;
}

/**
 * OpenRouter API call
 */
async function callOpenRouter(prompt: string, model: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://scholarflow.app',
      'X-Title': 'ScholarFlow',
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    }),
  });

  if (!response.ok) throw new Error(`OpenRouter status ${response.status}`);

  const result = await response.json();
  const text = result?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('OpenRouter returned empty text');

  return text;
}

/**
 * Custom OpenAI-Compatible Provider API Call (Third-Party API Sellers, Proxies, Private LLMs)
 */
async function callCustomOpenAI(
  prompt: string,
  model: string,
  baseUrl?: string,
  customApiKey?: string
): Promise<string> {
  const apiKey = customApiKey || process.env.CUSTOM_OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('API Key is not configured for Custom Provider');

  let rawUrl = (baseUrl && baseUrl.trim().length > 0) ? baseUrl.trim() : (process.env.CUSTOM_OPENAI_BASE_URL || 'https://openrouter.ai/api/v1');
  let endpoint = rawUrl;
  if (!rawUrl.endsWith('/chat/completions')) {
    const cleanUrl = rawUrl.replace(/\/+$/, '');
    endpoint = cleanUrl.endsWith('/v1') ? `${cleanUrl}/chat/completions` : `${cleanUrl}/v1/chat/completions`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    }),
  });

  if (!response.ok) throw new Error(`Custom Provider API status ${response.status}`);

  const result = await response.json();
  const text = result?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Custom Provider API returned empty text');

  return text;
}

/**
 * Hugging Face Inference API & Router Call (Supports HuggingFace catalog models)
 */
async function callHuggingFace(
  prompt: string,
  model: string,
  customApiKey?: string,
  baseUrl?: string
): Promise<string> {
  const apiKey = customApiKey || process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('Hugging Face API Key (HUGGINGFACE_API_KEY or HF_TOKEN) is not configured');

  const rawUrl = (baseUrl && baseUrl.trim().length > 0)
    ? baseUrl.trim()
    : 'https://router.huggingface.co/v1';

  let endpoint = rawUrl;
  if (!rawUrl.endsWith('/chat/completions')) {
    const cleanUrl = rawUrl.replace(/\/+$/, '');
    endpoint = cleanUrl.endsWith('/v1') ? `${cleanUrl}/chat/completions` : `${cleanUrl}/v1/chat/completions`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Hugging Face status ${response.status}: ${errText}`);
  }

  const result = await response.json();
  const text = result?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Hugging Face API returned empty text');

  return text;
}

export async function POST(request: Request) {
  try {
    // 1. Edge Rate Limiter Guard (15 RPM)
    const clientIp = request.headers.get('x-forwarded-for') || 'global-client';
    const rateCheck = defaultAiRateLimiter.check(clientIp);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Maximum 15 requests per minute allowed.',
          resetSeconds: rateCheck.resetSeconds,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateCheck.limit),
            'X-RateLimit-Remaining': String(rateCheck.remaining),
            'X-RateLimit-Reset': String(rateCheck.resetSeconds),
          },
        }
      );
    }

    const body = await request.json();
    const { text, tone = 'academic', model = 'gemini', language = 'en', stream = false } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text parameter is required.' }, { status: 400 });
    }

    const prompt = buildPrompt(text, tone, language);

    // If client requested SSE streaming
    if (stream && (model === 'gemini' || model === 'gemini-2.0-flash')) {
      try {
        const streamBody = await callDirectGeminiStream(prompt, model);
        return new Response(streamBody, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      } catch (streamErr) {
        console.warn('[AI Stream] Streaming failed, falling back to JSON response:', streamErr);
      }
    }

    // 2. Dynamic model cascading list
    const { data: dbModels } = await supabase.from('ai_models').select('*');

    const modelsList: any[] = dbModels || [
      { id: 'gemini', name: 'Gemini 2.0 Flash (Direct)', model_id: 'gemini-2.0-flash', is_enabled: true, is_premium: false, provider_type: 'gemini' },
      { id: 'llama3', name: 'Llama 3 (Free OR)', model_id: 'meta-llama/llama-3-8b-instruct:free', is_enabled: true, is_premium: false, provider_type: 'openrouter' },
      { id: 'gemma2', name: 'Gemma 2 (Free OR)', model_id: 'google/gemma-2-9b-it:free', is_enabled: true, is_premium: false, provider_type: 'openrouter' },
      { id: 'claude', name: 'Claude 3.5 (Pro OR)', model_id: 'anthropic/claude-3.5-sonnet', is_enabled: true, is_premium: true, provider_type: 'openrouter' }
    ];

    const chosenModel = modelsList.find(m => m.id === model);
    const attempts: { name: string; run: () => Promise<string> }[] = [];

    const getRunnerForModel = (item: any) => {
      if (item.provider_type === 'huggingface') {
        return () => callHuggingFace(prompt, item.model_id, item.custom_api_key, item.base_url);
      } else if (item.provider_type === 'groq') {
        return () => callCustomOpenAI(prompt, item.model_id, item.base_url || 'https://api.groq.com/openai/v1', item.custom_api_key || process.env.GROQ_API_KEY);
      } else if (item.provider_type === 'together') {
        return () => callCustomOpenAI(prompt, item.model_id, item.base_url || 'https://api.together.xyz/v1', item.custom_api_key || process.env.TOGETHER_API_KEY);
      } else if (item.provider_type === 'custom_openai' || (item.base_url && item.base_url.trim().length > 0)) {
        return () => callCustomOpenAI(prompt, item.model_id, item.base_url, item.custom_api_key);
      } else if (item.provider_type === 'gemini' || item.id === 'gemini' || item.model_id.includes('gemini')) {
        return () => callDirectGemini(prompt, item.model_id, item.custom_api_key);
      } else {
        return () => callOpenRouter(prompt, item.model_id);
      }
    };

    if (chosenModel && chosenModel.is_enabled) {
      attempts.push({
        name: chosenModel.name,
        run: getRunnerForModel(chosenModel)
      });
    } else if (model === 'gemini') {
      attempts.push({
        name: 'Gemini 2.0 Flash (Direct)',
        run: () => callDirectGemini(prompt, process.env.GEMINI_MODEL || 'gemini-2.0-flash')
      });
    }

    modelsList.forEach(item => {
      const isAlreadyTried = (model === item.id) || (model === 'gemini' && item.id === 'gemini');
      if (item.is_enabled && !item.is_premium && !isAlreadyTried) {
        attempts.push({
          name: `${item.name} (Fallback)`,
          run: getRunnerForModel(item)
        });
      }
    });

    let finalResult = null;
    let successfulModelName = '';
    let disclaimer = null;
    const errors: string[] = [];

    for (let i = 0; i < attempts.length; i++) {
      try {
        finalResult = await attempts[i].run();
        successfulModelName = attempts[i].name;

        if (i > 0) {
          disclaimer = language === 'en'
            ? `Primary AI service is busy. Automatically fell back to: ${successfulModelName}.`
            : `Layanan AI Utama sedang sibuk. Otomatis dialihkan ke: ${successfulModelName}.`;
        }
        break;
      } catch (err: any) {
        errors.push(`${attempts[i].name}: ${err.message || err}`);
      }
    }

    if (!finalResult) {
      return NextResponse.json(
        fallbackResponse(
          text,
          tone,
          language === 'en'
            ? `All AI models are busy. Log Error: ${errors.join('; ')}`
            : `Seluruh model AI sedang sibuk. Log Error: ${errors.join('; ')}`
        )
      );
    }

    return NextResponse.json({
      original_text: text,
      improved_text: finalResult,
      tone: tone,
      disclaimer: disclaimer,
    });
  } catch (error) {
    console.error('Error in dynamic AI cascading improve API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
