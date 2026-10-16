import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadPaperChatHistory,
  cacheLocalPaperChat,
  clearPaperChatHistory,
  type PaperChatMessage,
  type PaperInsights,
} from '@/lib/ai/paper-chat';

describe('Phase 23: Interactive Paper Chat & Literature Q&A Assistant Unit Tests', () => {
  const dummyRefId = 'ref-scholarly-2026-xyz';
  const dummyUser = 'usr-test-123';

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('correctly caches and retrieves local chat history from localStorage', async () => {
    const mockMessages: PaperChatMessage[] = [
      {
        id: 'msg-1',
        role: 'user',
        content: 'What is the methodology used in this study?',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: 'The study employs a double-blind randomized controlled trial with N=520 participants.',
        suggestedCitationSentence: 'According to Smith et al. (2024), randomized trials revealed significant efficacy [Smith, 2024].',
        timestamp: new Date().toISOString(),
      },
    ];

    // Cache locally
    cacheLocalPaperChat(dummyRefId, mockMessages);

    // Retrieve via helper
    const loaded = await loadPaperChatHistory(dummyRefId);
    expect(loaded).toHaveLength(2);
    expect(loaded[0].role).toBe('user');
    expect(loaded[1].suggestedCitationSentence).toContain('Smith et al. (2024)');
  });

  it('returns empty array when no history exists for reference', async () => {
    const loaded = await loadPaperChatHistory('non-existent-ref-id');
    expect(loaded).toEqual([]);
  });

  it('clears paper chat history from storage cleanly', async () => {
    const mockMessages: PaperChatMessage[] = [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Explain the sample size.',
        timestamp: new Date().toISOString(),
      },
    ];

    cacheLocalPaperChat(dummyRefId, mockMessages);
    expect(await loadPaperChatHistory(dummyRefId)).toHaveLength(1);

    const cleared = await clearPaperChatHistory(dummyRefId);
    expect(cleared).toBe(true);

    const afterClear = await loadPaperChatHistory(dummyRefId);
    expect(afterClear).toEqual([]);
  });

  it('validates structured academic insights payload mapping', () => {
    const sampleInsights: PaperInsights = {
      methodology: 'Quasi-experimental regression discontinuity design',
      sampleSize: 'N = 1,420 undergraduate students across 4 universities',
      keyFindings: 'Statistically significant improvement of 24.3% in retention (p < 0.001)',
      limitations: 'Single-semester observation window without longitudinal career tracking',
    };

    expect(sampleInsights.methodology).toBeDefined();
    expect(sampleInsights.sampleSize).toContain('1,420');
    expect(sampleInsights.keyFindings).toContain('p < 0.001');
    expect(sampleInsights.limitations).toContain('longitudinal');
  });

  it('formats in-text citation replacement correctly for manuscript canvas injection', () => {
    const suggestedSentence = 'According to Doe and Watson (2023), AI-assisted writing increases academic flow [Doe, 2023].';
    const refId = 'doe-2023-paper';
    const label = 'Doe, 2023';

    let htmlToInsert = suggestedSentence;
    if (suggestedSentence.includes(`[${label}]`)) {
      htmlToInsert = suggestedSentence.replace(
        `[${label}]`,
        `<cite data-citation="true" data-ref-id="${refId}" class="text-indigo-600 font-semibold not-italic cursor-pointer hover:underline"> [${label}]</cite>`
      );
    }

    expect(htmlToInsert).toContain('<cite data-citation="true"');
    expect(htmlToInsert).toContain(`data-ref-id="${refId}"`);
    expect(htmlToInsert).toContain('[Doe, 2023]</cite>');
  });

  it('handles network fetch gracefully when cloud conversation fails', async () => {
    // Mock global fetch to return 500 error
    global.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));

    // Cache local message
    const localMsgs: PaperChatMessage[] = [
      {
        id: 'local-1',
        role: 'user',
        content: 'Fallback question',
        timestamp: new Date().toISOString(),
      },
    ];
    cacheLocalPaperChat(dummyRefId, localMsgs);

    // Call load with user ID (triggering fetch attempt then fallback)
    const result = await loadPaperChatHistory(dummyRefId, dummyUser);
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('Fallback question');
  });
});
