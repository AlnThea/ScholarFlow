// app/api/v1/ai/abstract/route.ts
export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { defaultAiRateLimiter } from '@/lib/ai/rate-limiter';

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

function buildPrompt(text: string, language: string = 'en'): string {
  const langText = language === 'en' ? 'English' : 'Indonesian';
  return (
    'You are an expert academic editor. Write a structured academic abstract (around 150-250 words) based on the following document context:\n\n' +
    `Document Context:\n${text}\n\n` +
    'Requirements:\n' +
    '- Cover the research objective, methodology/proposed approach, and key expected results/conclusions.\n' +
    '- Maintain a formal, objective, and scholarly academic tone.\n' +
    '- Do not add external facts, citations, or statistics not mentioned in the context.\n' +
    `- Write the abstract in ${langText}.\n` +
    '- Return ONLY the generated abstract. Do NOT wrap it in quotes, markdown code block, or write any greeting/explanation.'
  );
}

function fallbackResponse(text: string, disclaimer: string) {
  return {
    abstract_text: "Abstract draft placeholder: Please configure Gemini API key to enable AI abstract generation based on your document content.",
    disclaimer: disclaimer,
  };
}

async function callDirectGeminiStream(prompt: string, model: string): Promise<ReadableStream> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const geminiModel = model.includes('2.0') ? 'gemini-2.0-flash' : (process.env.GEMINI_MODEL || 'gemini-1.5-flash');
  const url = `${GEMINI_API_BASE_URL}/models/${geminiModel}:streamGenerateContent?key=${apiKey}&alt=sse`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, topP: 0.9, maxOutputTokens: 2048 },
    }),
  });

  if (!response.ok || !response.body) throw new Error(`Gemini Stream error ${response.status}`);
  return response.body;
}

async function callDirectGemini(prompt: string, model: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const geminiModel = model.includes('2.0') ? 'gemini-2.0-flash' : (process.env.GEMINI_MODEL || 'gemini-1.5-flash');
  const url = `${GEMINI_API_BASE_URL}/models/${geminiModel}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, topP: 0.9, maxOutputTokens: 2048 },
    }),
  });

  if (!response.ok) throw new Error(`Google API status ${response.status}`);

  const result = await response.json();
  const candidateParts = result?.candidates?.[0]?.content?.parts || [];
  const text = candidateParts
    .map((part: any) => (part?.text || '').trim())
    .filter(Boolean)
    .join('\n')
    .trim();

  if (!text) throw new Error('Google API returned empty text');
  return text;
}

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
      temperature: 0.3,
    }),
  });

  if (!response.ok) throw new Error(`OpenRouter status ${response.status}`);

  const result = await response.json();
  const text = result?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('OpenRouter returned empty text');

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
    const { text, model = 'gemini', language = 'en', stream = false } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text parameter is required.' }, { status: 400 });
    }

    const prompt = buildPrompt(text, language);

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
        console.warn('[AI Abstract Stream] Streaming failed, falling back to JSON response:', streamErr);
      }
    }

    const { data: dbModels } = await supabase.from('ai_models').select('*');

    const modelsList = dbModels || [
      { id: 'gemini', name: 'Gemini 2.0 Flash (Direct)', model_id: 'gemini-2.0-flash', is_enabled: true, is_premium: false },
      { id: 'llama3', name: 'Llama 3 (Free OR)', model_id: 'meta-llama/llama-3-8b-instruct:free', is_enabled: true, is_premium: false },
      { id: 'gemma2', name: 'Gemma 2 (Free OR)', model_id: 'google/gemma-2-9b-it:free', is_enabled: true, is_premium: false },
      { id: 'claude', name: 'Claude 3.5 (Pro OR)', model_id: 'anthropic/claude-3.5-sonnet', is_enabled: true, is_premium: true }
    ];

    const chosenModel = modelsList.find(m => m.id === model);
    const attempts: { name: string; run: () => Promise<string> }[] = [];

    if (chosenModel && chosenModel.is_enabled) {
      if (chosenModel.id === 'gemini') {
        attempts.push({
          name: chosenModel.name,
          run: () => callDirectGemini(prompt, chosenModel.model_id)
        });
      } else {
        attempts.push({
          name: chosenModel.name,
          run: () => callOpenRouter(prompt, chosenModel.model_id)
        });
      }
    } else if (model === 'gemini') {
      attempts.push({
        name: 'Gemini 2.0 Flash (Direct)',
        run: () => callDirectGemini(prompt, process.env.GEMINI_MODEL || 'gemini-2.0-flash')
      });
    }

    modelsList.forEach(item => {
      const isAlreadyTried = (model === item.id) || (model === 'gemini' && item.id === 'gemini');
      if (item.is_enabled && !item.is_premium && !isAlreadyTried) {
        if (item.id === 'gemini') {
          attempts.push({
            name: `${item.name} (Fallback)`,
            run: () => callDirectGemini(prompt, item.model_id)
          });
        } else {
          attempts.push({
            name: `${item.name} (Fallback)`,
            run: () => callOpenRouter(prompt, item.model_id)
          });
        }
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
          language === 'en'
            ? `All AI models are busy. Log Error: ${errors.join('; ')}`
            : `Seluruh model AI sedang sibuk. Log Error: ${errors.join('; ')}`
        )
      );
    }

    return NextResponse.json({
      abstract_text: finalResult,
      disclaimer: disclaimer,
    });
  } catch (error) {
    console.error('Error in abstract generation API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
