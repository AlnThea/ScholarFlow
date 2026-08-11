// app/api/v1/ai/test-connection/route.ts
export const runtime = 'edge';

import { NextResponse } from 'next/server';

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

export async function POST(request: Request) {
  const startTime = performance.now();
  try {
    const body = await request.json();
    const {
      provider_type = 'openrouter',
      model_id,
      base_url,
      custom_api_key,
    } = body;

    const cleanModelId = model_id.trim().replace(/\.+$/, '');

    if (!cleanModelId) {
      return NextResponse.json(
        { success: false, message: 'ID Model API (model_id) tidak boleh kosong.' },
        { status: 400 }
      );
    }

    const testPrompt = 'Ping test. Respond with OK.';
    let sampleResponse = '';

    if (provider_type === 'gemini') {
      const apiKey = custom_api_key || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY belum dikonfigurasi di environment atau Custom API Key.');
      }

      const geminiModel = model_id.includes('2.0')
        ? 'gemini-2.0-flash'
        : (process.env.GEMINI_MODEL || model_id || 'gemini-1.5-flash');

      const url = `${GEMINI_API_BASE_URL}/models/${geminiModel}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: testPrompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 20 },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Google Gemini API Error (${response.status}): ${errText || response.statusText}`);
      }

      const result = await response.json();
      const candidateParts = result?.candidates?.[0]?.content?.parts || [];
      sampleResponse = candidateParts.map((p: any) => p?.text || '').join('').trim() || 'OK';

    } else if (provider_type === 'custom_openai') {
      const apiKey = custom_api_key || process.env.CUSTOM_OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error('API Key belum diisi untuk Custom OpenAI-Compatible Provider.');
      }

      const rawUrl = (base_url && base_url.trim().length > 0)
        ? base_url.trim()
        : (process.env.CUSTOM_OPENAI_BASE_URL || 'https://openrouter.ai/api/v1');

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
          model: model_id,
          messages: [{ role: 'user', content: testPrompt }],
          max_tokens: 20,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Custom Provider API Error (${response.status}): ${errText || response.statusText}`);
      }

      const result = await response.json();
      sampleResponse = result?.choices?.[0]?.message?.content?.trim() || 'OK';

    } else {
      // Default: OpenRouter
      const apiKey = custom_api_key || process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY belum dikonfigurasi di environment atau Custom API Key.');
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://scholarflow.app',
          'X-Title': 'ScholarFlow',
        },
        body: JSON.stringify({
          model: model_id,
          messages: [{ role: 'user', content: testPrompt }],
          max_tokens: 20,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter API Error (${response.status}): ${errText || response.statusText}`);
      }

      const result = await response.json();
      sampleResponse = result?.choices?.[0]?.message?.content?.trim() || 'OK';
    }

    const duration = Math.round(performance.now() - startTime);

    return NextResponse.json({
      success: true,
      message: `Koneksi berhasil! Provider merespon dalam ${duration} ms.`,
      latency_ms: duration,
      sample_response: sampleResponse,
      provider_type,
    });
  } catch (err: any) {
    const duration = Math.round(performance.now() - startTime);
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Gagal terhubung ke provider AI.',
        latency_ms: duration,
      },
      { status: 400 }
    );
  }
}
