import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateIdempotencyKey,
  getIdempotentAiResponse,
  setIdempotentAiResponse,
  clearIdempotencyCache,
} from '@/lib/ai/idempotency-cache';

describe('Smart Idempotency Cache', () => {
  beforeEach(() => {
    clearIdempotencyCache();
  });

  it('generates deterministic keys for identical inputs', () => {
    const key1 = generateIdempotencyKey('user-123', 'improve', 'academic', 'en', 'Metode ini sangat penting.');
    const key2 = generateIdempotencyKey('user-123', 'improve', 'academic', 'en', 'Metode ini sangat penting.');
    expect(key1).toBe(key2);
  });

  it('generates different keys when text or tone differs', () => {
    const key1 = generateIdempotencyKey('user-123', 'improve', 'academic', 'en', 'Metode ini sangat penting.');
    const key2 = generateIdempotencyKey('user-123', 'improve', 'simplify', 'en', 'Metode ini sangat penting.');
    const key3 = generateIdempotencyKey('user-123', 'improve', 'academic', 'en', 'Metode ini sangat penting dan efisien.');

    expect(key1).not.toBe(key2);
    expect(key1).not.toBe(key3);
  });

  it('returns null for missing cache entry', () => {
    const result = getIdempotentAiResponse('non-existent-key');
    expect(result).toBeNull();
  });

  it('saves and retrieves cached response correctly', () => {
    const key = generateIdempotencyKey('u1', 'paraphrase', 'en', 'Original text sentence');
    const mockData = {
      improved_text: 'Rewritten scholarly sentence.',
      tokens_consumed: 0,
      is_idempotent_hit: true,
    };

    setIdempotentAiResponse(key, mockData, 60000);
    const cached = getIdempotentAiResponse<typeof mockData>(key);

    expect(cached).not.toBeNull();
    expect(cached?.improved_text).toBe('Rewritten scholarly sentence.');
    expect(cached?.is_idempotent_hit).toBe(true);
  });

  it('expires cache entry after TTL', async () => {
    const key = 'test-short-ttl';
    setIdempotentAiResponse(key, { result: 'quick test' }, 10); // 10ms TTL

    // Immediately available
    expect(getIdempotentAiResponse(key)).toEqual({ result: 'quick test' });

    // Wait 25ms for expiration
    await new Promise((r) => setTimeout(r, 25));
    expect(getIdempotentAiResponse(key)).toBeNull();
  });
});
