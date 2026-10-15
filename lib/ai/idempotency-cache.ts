// lib/ai/idempotency-cache.ts
// Smart In-Memory Idempotency & Prompt Deduplication Cache for AI Workloads
// Prevents duplicate LLM calls and avoids redundant token deduction on repeated requests within 5 minutes.

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
}

// In-memory cache store (shared per server instance / lambda warm container)
const idempotencyStore = new Map<string, CacheEntry<any>>();

export const DEFAULT_IDEMPOTENCY_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Deterministic hash generator compatible with both Node.js and Edge Runtime.
 * Uses double-pass FNV-1a 64-bit algorithm for collision resistance without external packages.
 */
export function generateIdempotencyKey(...parts: (string | number | undefined | null)[]): string {
  const normalized = parts
    .map((p) => (p === undefined || p === null ? '' : String(p).trim().toLowerCase()))
    .join(':::');

  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= ch;
    h2 = Math.imul(h2, 0x27d4eb2d);
  }

  const p1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const p2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `sf_idem_${p1}${p2}_len${normalized.length}`;
}

/**
 * Retrieve cached response if valid and not expired
 */
export function getIdempotentAiResponse<T>(key: string): T | null {
  const entry = idempotencyStore.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    idempotencyStore.delete(key);
    return null;
  }

  return entry.data as T;
}

/**
 * Store AI response in idempotency cache
 */
export function setIdempotentAiResponse<T>(
  key: string,
  data: T,
  ttlMs: number = DEFAULT_IDEMPOTENCY_TTL_MS
): void {
  // Routine cleanup of stale entries if store grows
  if (idempotencyStore.size > 1000) {
    const now = Date.now();
    for (const [k, v] of idempotencyStore.entries()) {
      if (now > v.expiresAt) {
        idempotencyStore.delete(k);
      }
    }
  }

  idempotencyStore.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
    createdAt: Date.now(),
  });
}

/**
 * Invalidate a key manually if needed
 */
export function invalidateIdempotentKey(key: string): void {
  idempotencyStore.delete(key);
}

/**
 * Clear the entire cache (useful for testing)
 */
export function clearIdempotencyCache(): void {
  idempotencyStore.clear();
}
