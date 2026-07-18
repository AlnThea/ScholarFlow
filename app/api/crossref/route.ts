// app/api/crossref/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim() ?? '';
  if (!query) return NextResponse.json({ error: 'Missing query parameter "q".' }, { status: 400 });

  const apiBase = process.env.CROSSREF_API_BASE ?? 'https://api.crossref.org/works';
  const url = `${apiBase}?query=${encodeURIComponent(query)}&rows=10`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Crossref responded ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Crossref error:', err);
    return NextResponse.json({ error: 'Failed to fetch Crossref data.' }, { status: 502 });
  }
}
