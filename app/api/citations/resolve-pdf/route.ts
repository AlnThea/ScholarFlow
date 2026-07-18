import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 3600 } // cache for 1 hour
    });

    if (!res.ok) {
      return NextResponse.json({ pdf_url: null, reason: 'Failed to fetch landing page' });
    }

    const html = await res.text();

    // 1. Check Google Scholar meta tag (most reliable for direct PDF link)
    const metaMatch = html.match(/<meta\s+name=["']citation_pdf_url["']\s+content=["']([^"']+)["']/i);
    if (metaMatch && metaMatch[1]) {
      return NextResponse.json({ pdf_url: metaMatch[1] });
    }

    // 2. Check alternative order in meta tags
    const metaMatchAlt = html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']citation_pdf_url["']/i);
    if (metaMatchAlt && metaMatchAlt[1]) {
      return NextResponse.json({ pdf_url: metaMatchAlt[1] });
    }

    // 3. Look for PDF links in anchors (OJS article/view/xx/yy or download/xx/yy)
    const downloadMatch = html.match(/href=["']([^"']+\/article\/download\/\d+\/\d+(?:\/\d+)?)["']/i);
    if (downloadMatch && downloadMatch[1]) {
      return NextResponse.json({ pdf_url: downloadMatch[1] });
    }

    const viewPdfMatch = html.match(/href=["']([^"']+\/article\/view\/\d+\/\d+)["']/i);
    if (viewPdfMatch && viewPdfMatch[1]) {
      return NextResponse.json({ pdf_url: viewPdfMatch[1] });
    }

    // 4. Look for any link ending with .pdf
    const genericPdfMatch = html.match(/href=["']([^"']+\.pdf(?:\?[^"']+)?)["']/i);
    if (genericPdfMatch && genericPdfMatch[1]) {
      let pdfUrl = genericPdfMatch[1];
      if (pdfUrl.startsWith('/')) {
        const origin = new URL(targetUrl).origin;
        pdfUrl = origin + pdfUrl;
      }
      return NextResponse.json({ pdf_url: pdfUrl });
    }

    return NextResponse.json({ pdf_url: null, reason: 'No PDF links found' });
  } catch (err: any) {
    return NextResponse.json({ pdf_url: null, error: err.message }, { status: 500 });
  }
}
