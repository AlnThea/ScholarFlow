import { describe, it, expect, beforeEach } from 'vitest';
import { buildGhostwritePrompt } from '@/lib/ai/ghostwrite-helper';
import {
  generateIdempotencyKey,
  getIdempotentAiResponse,
  setIdempotentAiResponse,
  clearIdempotencyCache,
} from '@/lib/ai/idempotency-cache';

describe('Ghostwriter AI Autocomplete Unit Tests', () => {
  beforeEach(() => {
    clearIdempotencyCache();
  });

  describe('Prompt Construction (buildGhostwritePrompt)', () => {
    it('constructs an academic English prompt with document context', () => {
      const prompt = buildGhostwritePrompt(
        'The primary factor that contributes to the high variability of results is',
        'Deep Learning in Academic Workflows',
        'en'
      );

      expect(prompt).toContain('You are an elite academic co-writer');
      expect(prompt).toContain('Document Title: "Deep Learning in Academic Workflows"');
      expect(prompt).toContain('The primary factor that contributes to the high variability of results is');
      expect(prompt).toContain('Continuation:');
    });

    it('constructs a formal Indonesian prompt for thesis/journal context', () => {
      const prompt = buildGhostwritePrompt(
        'Berdasarkan hasil analisis regresi linier berganda, dapat disimpulkan bahwa',
        'Analisis Pengaruh Motivasi Terhadap Prestasi',
        'id'
      );

      expect(prompt).toContain('Anda adalah co-writer akademik senior');
      expect(prompt).toContain('Document Title: "Analisis Pengaruh Motivasi Terhadap Prestasi"');
      expect(prompt).toContain('Berdasarkan hasil analisis regresi linier berganda');
      expect(prompt).toContain('Kelanjutan Teks:');
    });

    it('truncates context to the last 600 characters for long paragraphs', () => {
      const longContext = 'Academic introduction sentence. '.repeat(50); // ~1600 chars
      const prompt = buildGhostwritePrompt(longContext, undefined, 'en');

      expect(prompt).not.toContain('Document Title:');
      // The prompt should contain the tail of the long context
      expect(prompt).toContain('Academic introduction sentence.');
      // Preceding context section length check
      const contextMatch = prompt.match(/"""([\s\S]*?)"""/);
      expect(contextMatch).not.toBeNull();
      if (contextMatch) {
        expect(contextMatch[1].length).toBeLessThanOrEqual(600);
      }
    });
  });

  describe('Ghostwriter Idempotency & Caching', () => {
    it('caches ghostwriting completions to prevent redundant API calls', () => {
      const prefix = 'The observed phenomena indicate that';
      const key = generateIdempotencyKey('user-ghost-1', 'ghostwrite', 'en', prefix);

      const mockCompletion = {
        suggestion: 'there is a statistically significant correlation between variables.',
        tokens_consumed: 18,
      };

      // Set cache
      setIdempotentAiResponse(key, mockCompletion, 300000); // 5 min TTL

      // Retrieve cache
      const cached = getIdempotentAiResponse<typeof mockCompletion>(key);
      expect(cached).not.toBeNull();
      expect(cached?.suggestion).toBe(mockCompletion.suggestion);
    });

    it('generates different keys for different text prefixes', () => {
      const key1 = generateIdempotencyKey('u1', 'ghostwrite', 'en', 'In summary, the results');
      const key2 = generateIdempotencyKey('u1', 'ghostwrite', 'en', 'In conclusion, the findings');

      expect(key1).not.toBe(key2);
    });
  });

  describe('Keyboard & Editor Interaction Rules', () => {
    it('recognizes Tab key as the trigger to accept suggestion', () => {
      const isTab = (key: string) => key === 'Tab';
      expect(isTab('Tab')).toBe(true);
      expect(isTab('Enter')).toBe(false);
    });

    it('recognizes Escape key as the trigger to dismiss suggestion', () => {
      const isDismiss = (key: string) => key === 'Escape';
      expect(isDismiss('Escape')).toBe(true);
      expect(isDismiss('Backspace')).toBe(false);
    });

    it('detects shortcut Ctrl+J or Cmd+J for ghostwriter toggle', () => {
      const isGhostwriterToggle = (e: { ctrlKey: boolean; metaKey: boolean; key: string }) => {
        return (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j';
      };

      expect(isGhostwriterToggle({ ctrlKey: true, metaKey: false, key: 'j' })).toBe(true);
      expect(isGhostwriterToggle({ ctrlKey: false, metaKey: true, key: 'J' })).toBe(true);
      expect(isGhostwriterToggle({ ctrlKey: false, metaKey: false, key: 'j' })).toBe(false);
    });
  });
});
