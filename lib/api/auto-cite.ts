// lib/api/auto-cite.ts
// AI Auto-Citation Attribution API Helper

import type { CitationCandidate } from './citations';

export interface AutoCiteMatch {
  matchId: string;
  blockId?: string;
  sentenceText: string;
  referenceId: string;
  citationLabel: string;
  referenceTitle?: string;
  referenceAuthors?: string[];
  referenceYear?: number | null;
  confidence: number;
  rationale: string;
}

export interface AutoCiteRequest {
  blocks: Array<{ id?: string; text: string }>;
  candidates: CitationCandidate[];
  language?: 'en' | 'id';
  userId?: string;
  userPlan?: string;
  customApiKey?: string;
  documentId?: string;
}

export interface AutoCiteResponse {
  matches: AutoCiteMatch[];
  totalMatches: number;
  tokensConsumed?: number;
  tokensRemaining?: number;
  monthlyQuota?: number;
  modelUsed?: string;
  userPlan?: string;
  isIdempotentHit?: boolean;
  disclaimer?: string | null;
}

/**
 * Sends manuscript blocks and reference candidates to AI Semantic Matchmaker
 */
export async function matchAutoCitations(
  request: AutoCiteRequest
): Promise<AutoCiteResponse> {
  const response = await fetch('/api/v1/ai/auto-cite-match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let message = 'Failed to analyze auto-citations.';
    try {
      const errJson = await response.json();
      if (errJson?.error) message = errJson.error;
    } catch (_) {
      message = await response.text().catch(() => message);
    }
    throw new Error(message);
  }

  return (await response.json()) as AutoCiteResponse;
}

export function buildAutoCitePrompt(params: {
  blocks: Array<{ id?: string; text: string }>;
  candidates: CitationCandidate[];
  language: 'en' | 'id';
}): string {
  const isEn = params.language === 'en';

  const formattedCandidates = params.candidates
    .map((c, i) => {
      const authorStr = c.authors && c.authors.length > 0 ? c.authors.join(', ') : 'Unknown';
      const yearStr = c.year ? String(c.year) : 'n.d.';
      const abstractSnippet = c.abstract ? `\n   Abstract: ${c.abstract.slice(0, 320)}...` : '';
      return `[Paper ${i + 1}] ID: "${c.reference_id}" | Label: "${c.citation_label}"\n   Title: "${c.title}" (${yearStr}) by ${authorStr}${abstractSnippet}`;
    })
    .join('\n\n');

  const formattedBlocks = params.blocks
    .map((b, i) => `[Block ${b.id || i + 1}]\n${b.text}`)
    .join('\n\n');

  if (isEn) {
    return (
      `You are an elite academic editor and citation attribution specialist.\n` +
      `Your task is to analyze the provided manuscript blocks and determine which sentences make empirical claims, factual statements, theoretical concepts, or methodological mentions that are directly supported by one of the PROVIDED reference papers.\n\n` +
      `AVAILABLE REFERENCE CANDIDATES (CLOSED SET - ONLY USE THESE):\n` +
      `${formattedCandidates}\n\n` +
      `MANUSCRIPT PARAGRAPHS:\n` +
      `${formattedBlocks}\n\n` +
      `STRICT RULES:\n` +
      `1. CLOSED WORLD: You MUST ONLY link sentences to a reference_id from the list above. NEVER invent references, DOIs, or author names.\n` +
      `2. PRECISION: Only match a sentence if the candidate paper truly supports the specific claim. Do not force matches.\n` +
      `3. SENTENCE SUBSTRING: For each match, provide the EXACT sentence or clause from the block (so we can locate and place the citation right after it).\n` +
      `4. MAXIMUM 1-2 CITATIONS PER SENTENCE.\n` +
      `5. OUTPUT FORMAT: Return strictly valid JSON adhering to this schema (no markdown fences, no conversational preamble):\n` +
      `{\n` +
      `  "matches": [\n` +
      `    {\n` +
      `      "blockId": "block id from input",\n` +
      `      "sentenceText": "exact sentence text from the manuscript",\n` +
      `      "referenceId": "reference_id from candidates",\n` +
      `      "citationLabel": "citation_label from candidate",\n` +
      `      "confidence": 0.95,\n` +
      `      "rationale": "Short explanation in English why this paper supports the sentence"\n` +
      `    }\n` +
      `  ]\n` +
      `}`
    );
  }

  return (
    `Anda adalah pakar penyuntingan akademis dan atribusi sitasi ilmiah.\n` +
    `Tugas Anda adalah menganalisis blok paragraf naskah pengguna dan mencocokkan kalimat-kalimat yang memuat klaim empiris, fakta, teori, atau metodologi dengan makalah referensi yang DISEDIAKAN.\n\n` +
    `DAFTAR PAPER REFERENSI YANG TERSEDIA (HANYA GUNAKAN DAFTAR INI):\n` +
    `${formattedCandidates}\n\n` +
    `BLOK PARAGRAF NASKAH:\n` +
    `${formattedBlocks}\n\n` +
    `ATURAN KETAT:\n` +
    `1. CLOSED WORLD: Anda HANYA boleh menghubungkan kalimat ke reference_id yang tercantum pada daftar di atas. JANGAN PERNAH membuat referensi fiktif atau mengambil referensi dari luar.\n` +
    `2. PRESISI TINGGI: Hanya pasangkan kalimat jika makalah rujukan benar-benar relevan mendukung klaim kalimat tersebut. Jangan memaksakan kecocokan.\n` +
    `3. KUTIPAN KALIMAT PERSIS: Berikan potongan kalimat PERSIS yang ada pada blok naskah agar sitasi dapat ditempatkan tepat di akhir kalimat tersebut.\n` +
    `4. MAKSIMAL 1-2 SITASI PER KALIMAT.\n` +
    `5. FORMAT KELUARAN: Kembalikan HANYA JSON valid sesuai skema berikut (tanpa backticks markdown atau teks pembuka/penutup):\n` +
    `{\n` +
    `  "matches": [\n` +
    `    {\n` +
    `      "blockId": "id blok dari input",\n` +
    `      "sentenceText": "teks kalimat persis dari naskah",\n` +
    `      "referenceId": "reference_id dari kandidat",\n` +
    `      "citationLabel": "citation_label dari kandidat",\n` +
    `      "confidence": 0.95,\n` +
    `      "rationale": "Penjelasan singkat dalam Bahasa Indonesia mengapa paper ini mendukung klaim kalimat tersebut"\n` +
    `    }\n` +
    `  ]\n` +
    `}`
  );
}
