// app/api/citations/search/route.ts
// Citation search API route — Next.js
// Alur: Cek Supabase cache → Cache HIT return → Cache MISS hit OpenAlex+Crossref → simpan cache → return

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Supabase admin client (service role — bypass RLS untuk write cache)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_KEY ?? '',
);

export type CitationCandidate = {
  source: string;
  title: string;
  authors: string[];
  year: number | null;
  doi: string | null;
  url: string | null;
  reference_id: string;
  citation_label: string;
  ranking_score: number;
  ranking_reason: string[];
  abstract: string | null;
  journal: string | null;
  cited_by_count: number;
  pdf_url: string | null;
};

// ─── Helpers ────────────────────────────────────────────────

function hashQuery(query: string): string {
  return crypto.createHash('md5').update(query.trim().toLowerCase()).digest('hex');
}

/** Normalisasi DOI — strip URL prefix jika ada */
function normalizeDoi(doi: string | null | undefined): string | null {
  if (!doi) return null;
  return doi
    .replace(/^https?:\/\/doi\.org\//i, '')
    .replace(/^doi:/i, '')
    .trim() || null;
}

function getLastName(author: string): string {
  const cleanAuthor = author.trim();
  if (cleanAuthor.includes(',')) {
    return cleanAuthor.split(',')[0].trim();
  }
  const parts = cleanAuthor.split(/\s+/);
  return parts[parts.length - 1] ?? cleanAuthor;
}

/** Citation label singkat: "LastName Year" atau "LastName et al. Year" */
function shortLabel(authors: string[], year: number | null, title: string): string {
  let authorPart = '';
  if (authors.length === 1) {
    authorPart = getLastName(authors[0]);
  } else if (authors.length === 2) {
    authorPart = `${getLastName(authors[0])} & ${getLastName(authors[1])}`;
  } else if (authors.length >= 3) {
    authorPart = `${getLastName(authors[0])} et al.`;
  } else {
    // Fallback: 2 kata pertama dari judul
    authorPart = title.split(/\s+/).slice(0, 2).join(' ');
  }
  return year ? `${authorPart} ${year}` : authorPart;
}

function cleanTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function refineQuery(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return '';

  // Pecah berdasarkan spasi dan tanda baca agar kata yang dempet koma/titik (misal: "mengumpulkan,mengolah") terpisah dengan benar
  const words = trimmed.split(/[\s,.;:!?()]+/).filter(Boolean);
  if (words.length <= 5) return trimmed;

  // Stop words Bahasa Indonesia & English yang komprehensif
  const stopWords = new Set([
    // Indonesian stop words
    'yang', 'di', 'dari', 'untuk', 'dengan', 'dan', 'atau', 'pada', 'ke', 'telah', 'mengalami', 
    'signifikan', 'terhadap', 'dalam', 'adalah', 'bahwa', 'ini', 'itu', 'oleh', 'sebagai', 
    'serta', 'secara', 'perkembangan', 'pergeseran', 'paradigma',
    'bisa', 'ada', 'kok', 'nah', 'malah', 'keluar', 'sama', 'seharus', 'nya', 'saya', 'nyari',
    'didapat', 'jelas', 'banyak', 'seperti', 'ambil', 'pernah', 'pake', 'tapi', 'sangat', 'bagi',
    'ia', 'ya', 'hal',
    // Indonesian filler/definition words
    'merupakan', 'ialah', 'yaitu', 'yakni', 'adapun', 'bahwasanya',
    'sekumpulan', 'kumpulan', 'komponen', 'saling', 'proses', 'suatu', 'sebuah', 'satu', 'dua', 
    'beberapa', 'banyak', 'berbagai', 'tersebut', 'terutama', 'maupun', 'lalu', 'kemudian',
    'mengumpulkan', 'mengolah', 'menyimpan', 'menyajikan', 'guna', 'mendukung', 'melakukan', 
    'membuat', 'menggunakan', 'menghasilkan', 'meningkatkan', 'menurunkan', 'membantu', 
    'dapat', 'oleh', 'tentang', 'buat', 'supaya', 'agar', 'bagi', 'pada', 'tentang', 'mengenai',
    'secara', 'sehingga', 'jika', 'maka', 'namun', 'tetapi', 'melainkan', 'sementara', 'sedangkan',
    'sambil', 'seraya', 'tatkala', 'sewaktu', 'ketika', 'sebelum', 'sesudah', 'setelah', 'sejak', 
    'semenjak', 'hingga', 'sampai', 'demi', 'atas', 'bagaikan', 'umpama', 'laksana', 'ibarat', 
    'sebab', 'karena', 'daripada', 'tentu', 'tentunya', 'juga', 'saja', 'pun', 'hanya', 'saja',
    'bahkan', 'malah', 'justru', 'selain', 'melainkan', 'hanya', 'kecuali', 'tentang',
    // English stop words
    'the', 'of', 'and', 'a', 'to', 'in', 'is', 'for', 'on', 'that', 'by', 'this', 'with', 'as', 
    'an', 'are', 'from', 'at', 'it', 'be', 'or', 'was', 'were', 'which', 'about', 'also', 'has',
    'have', 'had', 'been', 'will', 'would', 'should', 'can', 'could', 'may', 'might', 'must',
    'about', 'above', 'after', 'again', 'against', 'all', 'am', 'any', 'are', 'arent', 'as', 'at',
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'cant',
    'cannot', 'could', 'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down',
    'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadnt', 'has', 'hasnt', 'have',
    'havent', 'having', 'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres', 'hers', 'herself',
    'him', 'himself', 'his', 'how', 'hows', 'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into',
    'is', 'isnt', 'it', 'its', 'itself', 'lets', 'me', 'more', 'most', 'mustnt', 'my', 'myself',
    'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours',
    'ourselves', 'out', 'over', 'own', 'same', 'shant', 'she', 'shed', 'shell', 'shes', 'should',
    'shouldnt', 'so', 'some', 'such', 'than', 'that', 'thats', 'the', 'their', 'theirs', 'them',
    'themselves', 'then', 'there', 'theres', 'these', 'they', 'theyd', 'theyll', 'theyre',
    'theyve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was',
    'wasnt', 'we', 'wed', 'well', 'were', 'weve', 'werent', 'what', 'whats', 'when', 'whens',
    'where', 'wheres', 'which', 'while', 'who', 'whos', 'whom', 'why', 'whys', 'with', 'wont',
    'would', 'wouldnt', 'you', 'youd', 'youll', 'youre', 'youve', 'your', 'yours', 'yourself',
    'yourselves'
  ]);

  const cleanWords = words
    .map(w => w.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase())
    .filter(w => w.length >= 2 && !stopWords.has(w));

  if (cleanWords.length === 0) {
    return words.slice(0, 5).join(' ');
  }

  // Ambil maks 12 kata bersih pertama untuk menjaga agar kata kunci utama di seluruh kalimat tetap terjaga
  const selectedSet = new Set(cleanWords.slice(0, 12));

  const finalKeywords = words
    .map(w => w.replace(/[^a-zA-Z0-9-]/g, ''))
    .filter(w => selectedSet.has(w.toLowerCase()));

  return finalKeywords.join(' ');
}

function reconstructOpenAlexAbstract(invertedIndex: unknown): string | null {
  if (!invertedIndex || typeof invertedIndex !== 'object') return null;
  const index = invertedIndex as Record<string, number[]>;
  const words: string[] = [];
  let maxPos = -1;
  for (const [word, positions] of Object.entries(index)) {
    if (Array.isArray(positions)) {
      for (const pos of positions) {
        if (typeof pos === 'number') {
          words[pos] = word;
          if (pos > maxPos) maxPos = pos;
        }
      }
    }
  }
  if (maxPos === -1) return null;
  const result: string[] = [];
  for (let i = 0; i <= maxPos; i++) {
    result.push(words[i] ?? '');
  }
  return result.join(' ').replace(/\s+/g, ' ').trim();
}

function cleanString(str: string | null | undefined): string | null {
  if (!str) return null;

  // 1. Decode HTML entities (e.g. &lt; -> <, &amp; -> &, etc.)
  const htmlEntities: Record<string, string> = {
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&quot;': '"',
    '&apos;': "'",
    '&#39;': "'",
    '&ndash;': '–',
    '&#8211;': '–',
    '&mdash;': '—',
    '&#8212;': '—',
    '&nbsp;': ' ',
  };

  let clean = str.replace(/&[a-zA-Z0-9#]+;/g, (match) => {
    return htmlEntities[match] || htmlEntities[match.toLowerCase()] || match;
  });

  // 2. Strip HTML tags (e.g. <b>, </i>, etc.)
  clean = clean.replace(/<\/?[^>]+(>|$)/g, "");

  // 3. Clean up multiple whitespaces/newlines
  return clean.replace(/\s+/g, ' ').trim() || null;
}

function cleanText(str: string | null | undefined): string {
  if (!str) return '';
  return cleanString(str) ?? '';
}

function cleanCrossrefAbstract(abstract: string | null | undefined): string | null {
  return cleanString(abstract);
}

// ─── OpenAlex ───────────────────────────────────────────────

function parseOpenAlexAuthors(authorships: unknown[]): string[] {
  if (!Array.isArray(authorships)) return [];
  const names: string[] = [];
  for (const a of authorships) {
    const item = a as Record<string, unknown>;
    const author = item?.author as Record<string, unknown> | undefined;
    const name = (author?.display_name ?? author?.name ?? '') as string;
    if (name.trim()) names.push(name.trim());
  }
  return names;
}

async function fetchOpenAlex(query: string, limit: number): Promise<CitationCandidate[]> {
  const base = process.env.OPENALEX_API_BASE ?? 'https://api.openalex.org/works';
  // Gunakan per-page (dengan tanda hubung) — parameter resmi OpenAlex
  // Jangan masukkan 'url' di select karena tidak ada di skema works
  const url = `${base}?search=${encodeURIComponent(query)}&per-page=${limit}&select=id,display_name,authorships,publication_year,doi,abstract_inverted_index,primary_location,cited_by_count`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { 'User-Agent': 'ScholarFlow/1.0 (mailto:admin@scholarflow.app)' },
      signal: AbortSignal.timeout(8000),
    });
  } catch (e) {
    console.error('[OpenAlex] fetch error:', e);
    return [];
  }

  if (!res.ok) {
    console.error('[OpenAlex] HTTP error:', res.status, await res.text().catch(() => ''));
    return [];
  }

  let data: { results?: unknown[] };
  try {
    data = await res.json();
  } catch {
    console.error('[OpenAlex] JSON parse error');
    return [];
  }

  return (data.results ?? []).slice(0, limit).map((item: unknown) => {
    const it = item as Record<string, unknown>;
    const authors = parseOpenAlexAuthors(it.authorships as unknown[] ?? []);
    const year = typeof it.publication_year === 'number' ? it.publication_year : null;
    // OpenAlex DOI datang sebagai URL penuh: https://doi.org/10.xxx
    const doi = normalizeDoi(it.doi as string | null);
    const title = cleanText(String(it.display_name ?? 'Untitled'));
    // Gunakan DOI sebagai reference_id jika ada, fallback ke OpenAlex ID
    const reference_id = doi ?? String(it.id ?? title);
    const doiUrl = doi ? `https://doi.org/${doi}` : null;
    const abstract = cleanString(reconstructOpenAlexAbstract(it.abstract_inverted_index));
    const journal = cleanString((it.primary_location as Record<string, any> | undefined)?.source?.display_name ?? null);
    const cited_by_count = typeof it.cited_by_count === 'number' ? it.cited_by_count : 0;
    const pdf_url = (it.primary_location as Record<string, any> | undefined)?.pdf_url ?? 
                    (it.open_access as Record<string, any> | undefined)?.oa_url ?? null;

    return {
      source: 'OpenAlex',
      title,
      authors,
      year,
      doi,
      url: doiUrl,
      reference_id,
      citation_label: shortLabel(authors, year, title),
      ranking_score: 0,
      ranking_reason: [],
      abstract,
      journal,
      cited_by_count,
      pdf_url,
    };
  });
}

// ─── Crossref ───────────────────────────────────────────────

function parseCrossrefPdfUrl(links: unknown[] | undefined): string | null {
  if (!Array.isArray(links)) return null;
  for (const link of links) {
    const item = link as Record<string, any>;
    if (item['content-type'] === 'application/pdf' || String(item.URL).endsWith('.pdf')) {
      return item.URL || null;
    }
  }
  return null;
}

function parseCrossrefAuthors(authors: unknown[]): string[] {
  if (!Array.isArray(authors)) return [];
  const names: string[] = [];
  for (const a of authors) {
    const item = a as Record<string, string>;
    const given = (item?.given ?? '').trim();
    const family = (item?.family ?? '').trim();
    let name = [family, given].filter(Boolean).join(', ');
    if (!name && item?.name) {
      name = item.name.trim();
    }
    if (name) names.push(name);
  }
  return names;
}

async function fetchCrossref(query: string, limit: number): Promise<CitationCandidate[]> {
  const base = process.env.CROSSREF_API_BASE ?? 'https://api.crossref.org/works';
  const url = `${base}?query.bibliographic=${encodeURIComponent(query)}&rows=${limit}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { 'User-Agent': 'ScholarFlow/1.0 (mailto:admin@scholarflow.app)' },
      signal: AbortSignal.timeout(8000),
    });
  } catch (e) {
    console.error('[Crossref] fetch error:', e);
    return [];
  }

  if (!res.ok) {
    console.error('[Crossref] HTTP error:', res.status);
    return [];
  }

  let data: { message?: { items?: unknown[] } };
  try {
    data = await res.json();
  } catch {
    console.error('[Crossref] JSON parse error');
    return [];
  }

  return (data.message?.items ?? []).slice(0, limit).map((item: unknown) => {
    const it = item as Record<string, unknown>;
    const authors = parseCrossrefAuthors(it.author as unknown[] ?? []);
    const issued = (it.issued as Record<string, unknown[]> | undefined)?.['date-parts'];
    const year = Array.isArray(issued) && Array.isArray(issued[0])
      ? (Number(issued[0][0]) || null)
      : null;
    const doi = normalizeDoi(it.DOI as string | null);
    const titleArr = it.title as string[] | undefined;
    const title = cleanText(titleArr?.[0] ?? 'Untitled');
    const reference_id = doi ?? String(it.URL ?? title);
    const doiUrl = doi ? `https://doi.org/${doi}` : (it.URL as string | null) ?? null;
    const abstract = cleanString(it.abstract as string);
    const journal = cleanString((it['container-title'] as string[] | undefined)?.[0] ?? null);
    const cited_by_count = typeof it['is-referenced-by-count'] === 'number' ? it['is-referenced-by-count'] : 0;
    const pdf_url = parseCrossrefPdfUrl(it.link as any[] | undefined);

    return {
      source: 'Crossref',
      title,
      authors,
      year,
      doi,
      url: doiUrl,
      reference_id,
      citation_label: shortLabel(authors, year, title),
      ranking_score: 0,
      ranking_reason: [],
      abstract,
      journal,
      cited_by_count,
      pdf_url,
    };
  });
}

// ─── Ranking ────────────────────────────────────────────────

function scoreCandidateRaw(query: string, c: CitationCandidate): number {
  const qTokens = new Set(query.toLowerCase().match(/[a-z0-9]+/g) ?? []);
  // Deduplicate title tokens so repeated words don't inflate the score
  const titleTokens = Array.from(new Set(c.title.toLowerCase().match(/[a-z0-9]+/g) ?? []));
  const overlap = titleTokens.filter(t => qTokens.has(t)).length;
  let score = overlap * 12;
  if (c.doi) score += 10;
  if (c.authors.length > 0) score += 5;
  if (c.year && c.year >= 2015) score += 3;
  if (c.source === 'OpenAlex') score += 2;
  return score;
}

function scoreCandidate(query: string, c: CitationCandidate): number {
  return Math.min(scoreCandidateRaw(query, c), 100);
}

function getOverlapRatio(query: string, c: CitationCandidate): number {
  const qTokens = new Set(query.toLowerCase().match(/[a-z0-9]+/g) ?? []);
  const titleTokens = Array.from(new Set(c.title.toLowerCase().match(/[a-z0-9]+/g) ?? []));
  if (titleTokens.length === 0) return 0;
  const overlap = titleTokens.filter(t => qTokens.has(t)).length;
  return overlap / titleTokens.length;
}

// ─── POST handler ────────────────────────────────────────────

export async function POST(request: Request) {
  let body: { query?: string; limit?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const query = (body.query ?? '').trim();
  const limit = Math.min(body.limit ?? 5, 20);

  if (!query) {
    return NextResponse.json({ error: 'Missing "query" field.' }, { status: 400 });
  }

  const queryHash = hashQuery(query);
  const now = new Date().toISOString();

  // ── 1. Cek Supabase cache ──────────────────────────────────
  const { data: cached } = await supabaseAdmin
    .from('citation_cache')
    .select('results, sources, hit_count')
    .eq('query_hash', queryHash)
    .gt('expires_at', now)
    .maybeSingle();

  if (cached) {
    supabaseAdmin
      .from('citation_cache')
      .update({ hit_count: (cached.hit_count ?? 1) + 1 })
      .eq('query_hash', queryHash)
      .then(() => {});

    const cachedResults = (cached.results as CitationCandidate[]) ?? [];
    const hasPerfectMatch = cachedResults.some(c => c.ranking_score === 100);
    const finalResults = hasPerfectMatch
      ? cachedResults.filter(c => c.ranking_score === 100)
      : cachedResults;

    return NextResponse.json({
      query,
      results: finalResults.slice(0, limit),
      sources: cached.sources,
      cached: true,
      note: null,
    });
  }

  // ── 2. Cache MISS — fetch parallel OpenAlex + Crossref ─────
  const refined = refineQuery(query);
  console.log(`[citations] Fetching for query: "${query}" (refined to: "${refined}")`);
  
  // Gunakan limit pencarian eksternal yang lebih besar agar tidak terpotong ranking bawaan API
  // sebelum dinilai ulang secara presisi menggunakan fungsi overlap scoreCandidate kita.
  const fetchLimit = 40;
  const [openAlexResult, crossrefResult] = await Promise.allSettled([
    fetchOpenAlex(refined, fetchLimit),
    fetchCrossref(refined, fetchLimit),
  ]);

  const openAlex = openAlexResult.status === 'fulfilled' ? openAlexResult.value : [];
  const crossref = crossrefResult.status === 'fulfilled' ? crossrefResult.value : [];

  console.log(`[citations] OpenAlex: ${openAlex.length}, Crossref: ${crossref.length}`);

  // ── 3. Merge + dedupe berdasarkan DOI yang sudah dinormalisasi DAN Judul
  const seenDoi = new Set<string>();
  const seenTitle = new Set<string>();
  const merged: CitationCandidate[] = [];
  for (const c of [...openAlex, ...crossref]) {
    const doiKey = c.doi ? c.doi.toLowerCase().trim() : null;
    const titleKey = cleanTitle(c.title);

    const hasSeenDoi = doiKey && seenDoi.has(doiKey);
    const hasSeenTitle = seenTitle.has(titleKey);

    if (!hasSeenDoi && !hasSeenTitle) {
      if (doiKey) seenDoi.add(doiKey);
      seenTitle.add(titleKey);
      merged.push(c);
    }
  }

  // ── 4. Ranking & sort ──────────────────────────────────────
  const ranked = merged
    .map(c => {
      const raw = scoreCandidateRaw(query, c);
      return { ...c, raw_score: raw, ranking_score: Math.min(raw, 100) };
    })
    .sort((a, b) =>
      b.raw_score - a.raw_score ||
      (getOverlapRatio(query, b) - getOverlapRatio(query, a)) ||
      (b.year ?? 0) - (a.year ?? 0)
    )
    .map(({ raw_score, ...c }) => c as CitationCandidate);

  // Jika ada paper dengan tingkat kecocokan sempurna (ranking_score === 100),
  // filter dan hanya kembalikan paper yang memiliki skor 100 tersebut.
  const hasPerfectMatch = ranked.some(c => c.ranking_score === 100);
  const finalResults = hasPerfectMatch
    ? ranked.filter(c => c.ranking_score === 100)
    : ranked;

  const slicedResults = finalResults.slice(0, limit);

  const sources = [
    ...(openAlex.length > 0 ? ['OpenAlex'] : []),
    ...(crossref.length > 0 ? ['Crossref'] : []),
  ];

  // ── 5. Simpan ke cache (fire & forget) ────────────────────
  if (slicedResults.length > 0) {
    supabaseAdmin
      .from('citation_cache')
      .upsert(
        {
          query_hash: queryHash,
          query_text: query,
          results: slicedResults,
          sources,
          hit_count: 1,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        { onConflict: 'query_hash' },
      )
      .then(() => {});
  }

  return NextResponse.json({
    query,
    results: slicedResults,
    sources,
    cached: false,
    note: slicedResults.length === 0 ? 'No citation candidates found.' : null,
  });
}
