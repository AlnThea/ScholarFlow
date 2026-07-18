// app/api/improve-writing/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  let payload;
  try {
    payload = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }
  const { text } = payload;
  if (!text) return NextResponse.json({ error: 'Missing "text" in request body.' }, { status: 400 });

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return NextResponse.json({ error: 'Gemini API key not configured.' }, { status: 500 });

  const model = process.env.GEMINI_MODEL ?? 'gemini-pro';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const body = {
    contents: [{ role: 'user', parts: [{ text }] }],
  };

  try {
    const res = await fetch(`${url}?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Gemini responded ${res.status}`);
    const data = await res.json();
    const improved = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return NextResponse.json({ improved });
  } catch (err) {
    console.error('Gemini error:', err);
    return NextResponse.json({ error: 'Failed to call Gemini API.' }, { status: 502 });
  }
}
