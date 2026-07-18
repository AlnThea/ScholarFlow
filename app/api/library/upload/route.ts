// app/api/library/upload/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import pdf from 'pdf-parse';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_KEY ?? '',
);

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const userId = data.get('userId') as string;

    if (!file) {
      return NextResponse.json({ error: 'Missing file in upload request.' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text using pdf-parse
    let parsedData;
    try {
      parsedData = await pdf(buffer);
    } catch (parseError) {
      console.error('Error parsing PDF text:', parseError);
      return NextResponse.json({ error: 'Failed to extract text from PDF.' }, { status: 422 });
    }

    const text = parsedData.text || '';
    if (!text.trim()) {
      return NextResponse.json({ error: 'PDF contains no extractable text.' }, { status: 422 });
    }

    // Helper parsing DOI
    const doiRegex = /\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+\b/gi;
    const doiMatch = doiRegex.exec(text);
    const doi = doiMatch ? doiMatch[0].trim() : null;

    // Helper parsing Year
    const yearRegex = /\b(19|20)\d{2}\b/g;
    let year: number | null = null;
    let yMatch;
    const snippet = text.substring(0, 3000);
    while ((yMatch = yearRegex.exec(snippet)) !== null) {
      const y = parseInt(yMatch[0]);
      if (y <= new Date().getFullYear()) {
        year = y;
        break;
      }
    }
    if (!year) {
      year = new Date().getFullYear();
    }

    // Clean Title from file name
    const title = file.name
      .replace(/\.[^/.]+$/, "") // strip extension
      .replace(/[_-]/g, " ")     // replace underscores/hyphens
      .trim();

    // Create unique reference_id
    const referenceId = doi ? doi.toLowerCase() : `lib-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    // Short label
    const shortTitle = title.split(' ').slice(0, 2).join(' ');
    const citationLabel = `[${shortTitle} ${year}]`;

    // Construct CitationCandidate
    const candidate = {
      source: 'Library PDF',
      title: title,
      authors: ['Library Upload'],
      year: year,
      doi: doi,
      url: null,
      reference_id: referenceId,
      citation_label: citationLabel,
      ranking_score: 0,
      ranking_reason: ['Uploaded local PDF source'],
      abstract: text.substring(0, 4000), // Store abstract snippet
      journal: null,
      cited_by_count: 0,
      pdf_url: null
    };

    // Save to Supabase global citation_library
    const { error } = await supabaseAdmin
      .from('citation_library')
      .upsert(
        {
          reference_id: referenceId,
          citation_data: candidate,
          added_by: userId || null,
        },
        { onConflict: 'reference_id' }
      );

    if (error) {
      console.error('Error saving to library:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, candidate });
  } catch (err) {
    console.error('Upload handler error:', err);
    return NextResponse.json({ error: 'Server error handling file upload.' }, { status: 500 });
  }
}
