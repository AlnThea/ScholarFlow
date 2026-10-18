// lib/editor/reference-search-index.ts
// Phase 32: Fast Reference Multi-Field In-Memory Search & Indexer Engine

import type { CitationCandidate } from '@/lib/api/citations';
import { searchCitations } from '@/lib/api/citations';

export interface ScoredReferenceCandidate {
  candidate: CitationCandidate;
  score: number;
  sourceType: 'local_library' | 'document_bib' | 'global_search';
  matchField: 'author' | 'title' | 'year' | 'doi' | 'general';
}

/**
 * Normalizes string for fast case-insensitive token comparison
 */
function normalizeText(text: string | null | undefined): string {
  if (!text) return '';
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

/**
 * Synchronous in-memory search across local document & library references
 */
export function searchLocalReferences(
  query: string,
  references: CitationCandidate[],
  limit = 6
): ScoredReferenceCandidate[] {
  if (!references || references.length === 0) {
    return [];
  }

  const cleanQuery = normalizeText(query);
  
  // If no query, return recent items
  if (!cleanQuery) {
    return references.slice(0, limit).map((candidate) => ({
      candidate,
      score: 10,
      sourceType: 'local_library',
      matchField: 'general',
    }));
  }

  const tokens = cleanQuery.split(/\s+/).filter(Boolean);
  const scoredList: ScoredReferenceCandidate[] = [];

  for (const candidate of references) {
    let score = 0;
    let matchField: 'author' | 'title' | 'year' | 'doi' | 'general' = 'general';

    const titleNorm = normalizeText(candidate.title);
    const authorsNorm = (candidate.authors || []).map(normalizeText).join(' ');
    const yearStr = candidate.year ? candidate.year.toString() : '';
    const doiNorm = normalizeText(candidate.doi);
    const journalNorm = normalizeText(candidate.journal);
    const abstractNorm = normalizeText(candidate.abstract);
    const labelNorm = normalizeText(candidate.citation_label);

    // Exact author match
    if (authorsNorm.includes(cleanQuery)) {
      score += 50;
      matchField = 'author';
    }

    // Exact title match
    if (titleNorm.includes(cleanQuery)) {
      score += 40;
      if (matchField === 'general') matchField = 'title';
    }

    // Tokenized search
    let matchedTokens = 0;
    for (const token of tokens) {
      if (authorsNorm.includes(token)) {
        score += 20;
        matchedTokens++;
      } else if (titleNorm.includes(token)) {
        score += 15;
        matchedTokens++;
      } else if (labelNorm.includes(token)) {
        score += 15;
        matchedTokens++;
      } else if (abstractNorm.includes(token)) {
        score += 12;
        matchedTokens++;
      } else if (yearStr.includes(token)) {
        score += 10;
        matchedTokens++;
      } else if (journalNorm.includes(token)) {
        score += 10;
        matchedTokens++;
      } else if (doiNorm.includes(token)) {
        score += 25;
        matchedTokens++;
      }
    }

    // Include if tokens matched or strong score achieved
    if (score > 0 && (matchedTokens === tokens.length || score >= 30)) {
      scoredList.push({
        candidate,
        score,
        sourceType: 'local_library',
        matchField,
      });
    }
  }

  // Sort descending by score
  scoredList.sort((a, b) => b.score - a.score);
  return scoredList.slice(0, limit);
}

/**
 * Multi-source search: returns local matches immediately, and queries Crossref/OpenAlex if local results are insufficient
 */
export async function searchMultiSourceReferences(
  query: string,
  localReferences: CitationCandidate[],
  options: {
    limit?: number;
    allowNetworkFallback?: boolean;
  } = {}
): Promise<ScoredReferenceCandidate[]> {
  const limit = options.limit || 6;
  const localResults = searchLocalReferences(query, localReferences, limit);

  // If local results are ample or query is too short for network, return immediately
  if (localResults.length >= 3 || !options.allowNetworkFallback || !query || query.trim().length < 3) {
    return localResults;
  }

  try {
    const networkRes = await searchCitations(query.trim(), limit);
    const networkItems: ScoredReferenceCandidate[] = (networkRes.results || []).map((cand) => ({
      candidate: cand,
      score: 5,
      sourceType: 'global_search',
      matchField: 'general',
    }));

    // Deduplicate by reference_id or DOI
    const existingIds = new Set(localResults.map((r) => r.candidate.reference_id || r.candidate.doi));
    const uniqueNetwork = networkItems.filter((n) => {
      const id = n.candidate.reference_id || n.candidate.doi;
      return id && !existingIds.has(id);
    });

    return [...localResults, ...uniqueNetwork].slice(0, limit);
  } catch (err) {
    console.warn('[searchMultiSourceReferences] Network search failed, using local only:', err);
    return localResults;
  }
}
