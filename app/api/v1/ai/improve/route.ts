// app/api/v1/ai/improve/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

function buildPrompt(text: string, tone: string): string {
  return (
    'Rewrite the selected text for academic writing.\n' +
    `Target tone: ${tone}.\n` +
    'Requirements:\n' +
    '- Keep the original meaning.\n' +
    '- Improve clarity, grammar, and scholarly phrasing.\n' +
    '- Do not add citations, facts, statistics, or claims.\n' +
    '- Preserve the language of the input text.\n' +
    '- Return only the rewritten text, without markdown or explanation.\n\n' +
    `Text:\n${text}`
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

/**
 * Panggilan langsung ke API Google Gemini AI Studio
 */
async function callDirectGemini(prompt: string, model: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const url = `${GEMINI_API_BASE_URL}/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.9,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Google API status ${response.status}`);
  }

  const result = await response.json();
  const candidateParts = result?.candidates?.[0]?.content?.parts || [];
  const text = candidateParts
    .map((part: any) => (part?.text || '').trim())
    .filter(Boolean)
    .join('\n')
    .trim();

  if (!text) {
    throw new Error('Google API returned empty text');
  }

  return text;
}

/**
 * Panggilan terpadu ke API OpenRouter
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
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter status ${response.status}`);
  }

  const result = await response.json();
  const text = result?.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new Error('OpenRouter returned empty text');
  }

  return text;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, tone = 'academic', model = 'gemini' } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text parameter is required.' }, { status: 400 });
    }

    const prompt = buildPrompt(text, tone);

    // 1. Ambil seluruh model AI dari database Supabase (untuk fallback dinamis)
    const { data: dbModels, error: dbError } = await supabase
      .from('ai_models')
      .select('*');

    if (dbError) {
      console.warn('Error loading dynamic models from DB, using fallback list:', dbError.message);
    }

    const modelsList = dbModels || [
      { id: 'gemini', name: 'Gemini Flash (Direct)', model_id: 'gemini-1.5-flash', is_enabled: true, is_premium: false },
      { id: 'llama3', name: 'Llama 3 (Free OR)', model_id: 'meta-llama/llama-3-8b-instruct:free', is_enabled: true, is_premium: false },
      { id: 'gemma2', name: 'Gemma 2 (Free OR)', model_id: 'google/gemma-2-9b-it:free', is_enabled: true, is_premium: false },
      { id: 'claude', name: 'Claude 3.5 (Pro OR)', model_id: 'anthropic/claude-3.5-sonnet', is_enabled: true, is_premium: true }
    ];

    // 2. Cari model pilihan utama user
    const chosenModel = modelsList.find(m => m.id === model);
    const attempts: { name: string; run: () => Promise<string> }[] = [];

    // Jika model pilihan user ditemukan dan diaktifkan, jadikan prioritas pertama
    if (chosenModel && chosenModel.is_enabled) {
      if (chosenModel.id === 'gemini') {
        // Gunakan model_id dinamis dari DB
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
      // Fallback jika DB kosong / error
      attempts.push({
        name: 'Gemini Flash (Direct)',
        run: () => callDirectGemini(prompt, process.env.GEMINI_MODEL || 'gemini-1.5-flash')
      });
    }

    // 3. Masukkan model-model aktif non-premium lainnya sebagai antrean failover otomatis
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

    // 4. Selalu tambahkan GPT-4o-mini sebagai baris pertahanan berbayar termurah jika semuanya gagal
    const hasMiniInList = modelsList.some(item => item.model_id === 'openai/gpt-4o-mini' && item.is_enabled);
    const isMiniTried = model === 'openai/gpt-4o-mini';
    if (!isMiniTried && !hasMiniInList) {
      attempts.push({
        name: 'GPT-4o-mini (Paid Fallback)',
        run: () => callOpenRouter(prompt, 'openai/gpt-4o-mini')
      });
    }

    let finalResult = null;
    let successfulModelName = '';
    let disclaimer = null;
    const errors: string[] = [];

    // Eksekusi antrean cascading retry
    for (let i = 0; i < attempts.length; i++) {
      try {
        finalResult = await attempts[i].run();
        successfulModelName = attempts[i].name;

        // Jika berhasil menggunakan cadangan, informasikan ke pengguna
        if (i > 0) {
          disclaimer = `Layanan AI Utama sedang sibuk. Otomatis dialihkan ke: ${successfulModelName}.`;
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
          `Seluruh model AI sedang sibuk. Log Error: ${errors.join('; ')}`
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
