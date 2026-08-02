// app/api/v1/ai/synthesize/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

interface ReferenceInput {
  title: string;
  authors: string[];
  year?: number;
  source: string;
  label: string;
}

function buildSynthesisPrompt(references: ReferenceInput[], language = 'en'): string {
  const isEn = language === 'en';
  const papersFormatted = references
    .map((ref) => {
      const auth = ref.authors.join(', ');
      const yr = ref.year || (isEn ? 'n.d.' : 't.t.');
      const pubText = isEn ? `, published in ${ref.source}` : `, diterbitkan di ${ref.source}`;
      return `- [${ref.label}] "${ref.title}" by ${auth} (${yr})${pubText}`;
    })
    .join('\n');

  if (isEn) {
    return (
      'You are an expert academic editor and senior scientist. Your task is to write a cohesive, well-structured Literature Review paragraph synthesizing the following research papers.\n\n' +
      'Requirements:\n' +
      '- Write in English with a highly formal, objective, and elegant academic style.\n' +
      '- Synthesize their findings logically in one fluid paragraph (do not use bullet points or separate lists).\n' +
      '- You MUST naturally integrate inline citations using the provided bracketed labels (e.g. [Label] or [1]). Place each citation exactly next to the claim it supports.\n' +
      '- Do not add external data claims, statistics, or facts not present in the provided papers.\n' +
      '- Return ONLY the synthesized paragraph. Do NOT include quotes, markdown formatting block wrappers, greetings, or intro/outro text.\n\n' +
      `Paper List:\n${papersFormatted}\n\n` +
      'Literature Review Paragraph:'
    );
  }

  return (
    'Anda adalah seorang editor akademik dan ilmuwan senior. Tugas Anda adalah menulis sebuah paragraf Tinjauan Pustaka (Literature Review) ilmiah terstruktur yang mensintesis paper-paper penelitian berikut secara kohesif.\n\n' +
    'Persyaratan:\n' +
    '- Tulis dalam Bahasa Indonesia dengan gaya akademik yang sangat formal, objektif, dan elegan.\n' +
    '- Sintesis temuan mereka secara logis dalam satu paragraf yang mengalir lancar (tidak berupa daftar terpisah).\n' +
    '- Anda WAJIB menyertakan sitasi rujukan secara natural menggunakan label kurung siku yang diberikan (contoh: [Label] atau [1]). Letakkan sitasi tepat di bagian klaim kalimat yang dirujuk.\n' +
    '- Jangan menambahkan klaim data, statistik, atau fakta baru dari luar paper yang diberikan.\n' +
    '- Berikan HANYA teks paragraf hasil sintesis. Jangan menyertakan tanda kutip pembuka/penutup, blok markdown, salam, atau teks pengantar lainnya.\n\n' +
    `Daftar Paper:\n${papersFormatted}\n\n` +
    'Paragraf Tinjauan Pustaka:'
  );
}

function fallbackResponse(references: ReferenceInput[], disclaimer: string, language = 'en') {
  const isEn = language === 'en';
  const synthesis = references
    .map((ref) => {
      const yr = ref.year || (isEn ? 'n.d.' : 't.t.');
      return isEn 
        ? `Research by ${ref.authors[0]} et al. (${yr}) discusses "${ref.title}" [${ref.label}].`
        : `Penelitian oleh ${ref.authors[0]} et al. (${yr}) membahas tentang "${ref.title}" [${ref.label}].`;
    })
    .join(' ');

  return {
    synthesized_text: `[Fallback] ${synthesis}`,
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
        temperature: 0.3,
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
      temperature: 0.3,
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
    const { references, model = 'gemini', language = 'en' } = body;

    if (!references || !Array.isArray(references) || references.length === 0) {
      return NextResponse.json({ error: 'References array is required.' }, { status: 400 });
    }

    const prompt = buildSynthesisPrompt(references, language);

    // 1. Ambil seluruh model AI dari database Supabase (untuk fallback dinamis)
    const { data: dbModels, error: dbError } = await supabase
      .from('ai_models')
      .select('*');

    if (dbError) {
      console.warn('Error loading dynamic models from DB for synthesize, using fallback list:', dbError.message);
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
          references,
          language === 'en'
            ? `All AI models are busy. Log Error: ${errors.join('; ')}`
            : `Seluruh model AI sedang sibuk. Log Error: ${errors.join('; ')}`,
          language
        )
      );
    }

    return NextResponse.json({
      synthesized_text: finalResult,
      disclaimer: disclaimer,
    });
  } catch (error) {
    console.error('Error in AI literature review synthesize API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
