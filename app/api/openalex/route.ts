// app/api/openalex/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim() ?? '';
  if (!query) return NextResponse.json({ error: 'Missing query parameter "q".' }, { status: 400 });

  const apiBase = process.env.OPENALEX_API_BASE ?? 'https://api.openalex.org/works';
  const url = `${apiBase}?search=${encodeURIComponent(query)}&per-page=10`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OpenAlex responded ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('OpenAlex error:', err);
    return NextResponse.json({ error: 'Failed to fetch OpenAlex data.' }, { status: 502 });
  }
}
