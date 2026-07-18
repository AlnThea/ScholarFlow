import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  const target = searchParams.get('target') || 'en';

  if (!text) {
    return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 });
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      throw new Error(`Google Translate returned status ${res.status}`);
    }

    const json = await res.json();
    if (json && json[0]) {
      const translatedText = json[0].map((item: any) => item[0]).join('');
      return NextResponse.json({ translatedText });
    }

    return NextResponse.json({ translatedText: text });
  } catch (err: any) {
    console.error('Translation error:', err);
    // Fallback to original text on error
    return NextResponse.json({ error: err.message, translatedText: text });
  }
}
