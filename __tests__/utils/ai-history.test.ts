import { describe, it, expect, beforeEach } from 'vitest';
import {
  addAiHistoryEntry,
  convertCloudRecordToHistoryEntry,
  mergeAiHistories,
  type AiHistoryEntry,
} from '@/lib/editor/ai-history';

describe('AI History Management', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
  });

  it('adds entries and filters exact duplicates by originalText and tone', () => {
    const initial: AiHistoryEntry[] = [];
    const entry1: AiHistoryEntry = {
      id: '1',
      originalText: 'Draft satu',
      improvedText: 'Polesan satu',
      tone: 'academic',
      model: 'gemini',
      savedAt: '10:00',
    };
    const entry2: AiHistoryEntry = {
      id: '2',
      originalText: 'Draft satu',
      improvedText: 'Polesan revisi',
      tone: 'academic',
      model: 'gemini',
      savedAt: '10:05',
    };

    const step1 = addAiHistoryEntry(initial, entry1);
    expect(step1).toHaveLength(1);

    const step2 = addAiHistoryEntry(step1, entry2);
    // Duplicate originalText + tone replaced/deduplicated with latest
    expect(step2).toHaveLength(1);
    expect(step2[0].improvedText).toBe('Polesan revisi');
  });

  it('converts cloud records for various feature types correctly', () => {
    const cloudRecordSynthesis = {
      id: 'syn-123',
      original_text: '[Ref1] Machine Learning; [Ref2] Neural Networks',
      result_text: 'Recent breakthroughs demonstrate significant accuracy.',
      tone: 'synthesis',
      model: 'gemini-1.5-flash',
      created_at: '2026-10-15T12:00:00Z',
    };

    const convertedSyn = convertCloudRecordToHistoryEntry(cloudRecordSynthesis);
    expect(convertedSyn.id).toBe('syn-123');
    expect(convertedSyn.tone).toBe('synthesis');
    expect(convertedSyn.source).toBe('cloud');
    expect(convertedSyn.originalText).toContain('Machine Learning');

    const cloudRecordStats = {
      id: 'stats-456',
      original_text: '[SPSS] Independent Samples T-Test',
      result_text: 'The independent samples t-test indicated a significant difference, t(48) = -6.18, p < .001.',
      feature_type: 'stats',
      model: 'gemini-1.5-flash',
      created_at: '2026-10-15T13:00:00Z',
    };

    const convertedStats = convertCloudRecordToHistoryEntry(cloudRecordStats);
    expect(convertedStats.id).toBe('stats-456');
    expect(convertedStats.tone).toBe('statistical');
    expect(convertedStats.source).toBe('cloud');
  });

  it('merges local and cloud history entries without losing recent local drafts', () => {
    const local: AiHistoryEntry[] = [
      {
        id: 'local-1',
        originalText: 'Draf lokal terbaru',
        improvedText: 'Hasil polesan lokal',
        tone: 'academic',
        model: 'gemini',
        savedAt: '10:30',
        source: 'local',
      },
    ];

    const cloud = [
      {
        id: 'cloud-1',
        original_text: 'Draf cloud lama',
        result_text: 'Hasil polesan cloud',
        tone: 'paraphrase',
        model: 'gemini',
        created_at: '2026-10-15T09:00:00Z',
      },
    ];

    const merged = mergeAiHistories(local, cloud);
    expect(merged).toHaveLength(2);
    expect(merged.some((e) => e.id === 'local-1')).toBe(true);
    expect(merged.some((e) => e.id === 'cloud-1')).toBe(true);
  });
});
