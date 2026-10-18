import { describe, it, expect } from 'vitest';
import {
  extractDocumentMetrics,
  auditReferenceRecency,
  auditJournalReadiness,
  STANDARD_JOURNAL_PRESETS,
} from '@/lib/editor/journal-presets';

describe('Phase 37: Journal Formatting & Publishing Presets Configurator Unit Tests', () => {
  it('extractDocumentMetrics: extracts words, abstract words, and visual counts', () => {
    const mockBlocks = [
      {
        id: 'b1',
        type: 'header',
        data: { text: 'Abstract' },
      },
      {
        id: 'b2',
        type: 'paragraph',
        data: { text: 'This study investigates the thermal efficiency of photovoltaic microgrids.' },
      },
      {
        id: 'b3',
        type: 'header',
        data: { text: '1. Introduction' },
      },
      {
        id: 'b4',
        type: 'paragraph',
        data: { text: 'Energy distribution networks require predictive monitoring algorithms to avoid overload.' },
      },
      {
        id: 'b5',
        type: 'image',
        data: { url: 'https://example.com/fig1.png', caption: 'Thermal schema' },
      },
      {
        id: 'b6',
        type: 'table',
        data: { content: [['A', 'B'], ['1', '2']] },
      },
    ];

    const metrics = extractDocumentMetrics(mockBlocks);
    expect(metrics.totalWords).toBeGreaterThan(15);
    expect(metrics.abstractWords).toBe(9); // "This study investigates the thermal efficiency of photovoltaic microgrids."
    expect(metrics.figureCount).toBe(1);
    expect(metrics.tableCount).toBe(1);
  });

  it('auditReferenceRecency: calculates percentage of references in the last 5 years', () => {
    const currentYear = new Date().getFullYear();
    const mockBibliography = [
      `Smith, J. (${currentYear}). Advanced AI architectures. Nature.`,
      `Doe, A. (${currentYear - 2}). Renewable systems. IEEE Trans.`,
      `Johnson, B. (${currentYear - 1}). Machine learning surveys. ACM.`,
      `OldAuthor, C. (2010). Classical algorithms for power. Elsevier.`,
    ];

    const recency = auditReferenceRecency(mockBibliography, 5);
    expect(recency.totalReferences).toBe(4);
    expect(recency.recentCount).toBe(3);
    expect(recency.recentPercent).toBe(75);
  });

  it('auditJournalReadiness: validates IEEE Transactions criteria with failing citation style', () => {
    const currentYear = new Date().getFullYear();
    const mockBlocks = [
      { id: 'b1', type: 'header', data: { text: 'Abstract' } },
      { id: 'b2', type: 'paragraph', data: { text: 'A concise 10 word test abstract for IEEE publishing submission.' } },
      { id: 'b3', type: 'header', data: { text: 'Introduction' } },
      { id: 'b4', type: 'paragraph', data: { text: 'Extensive empirical experimental details.' } },
    ];

    const mockBibliography = [
      `Author A. (${currentYear}). Modern computing.`,
      `Author B. (${currentYear - 1}). Fast routing protocols.`,
    ];

    // Audit with APA active, but IEEE Transactions requires IEEE numeric
    const result = auditJournalReadiness(mockBlocks, mockBibliography, 'ieee-transactions', 'apa');

    expect(result.preset.id).toBe('ieee-transactions');
    expect(result.metrics.activeCitationStyle).toBe('apa');

    // Citation style check should fail
    const styleCheck = result.items.find((i) => i.id === 'check-citation-style');
    expect(styleCheck).toBeDefined();
    expect(styleCheck?.status).toBe('fail');

    // Abstract length check should pass
    const abstractCheck = result.items.find((i) => i.id === 'check-abstract-words');
    expect(abstractCheck?.status).toBe('pass');

    // Reference recency should pass (100% recent)
    const recencyCheck = result.items.find((i) => i.id === 'check-reference-recency');
    expect(recencyCheck?.status).toBe('pass');
  });

  it('auditJournalReadiness: passes all criteria when properly formatted for Elsevier', () => {
    const currentYear = new Date().getFullYear();
    const words = new Array(5000).fill('word').join(' ');
    const mockBlocks = [
      { id: 'b1', type: 'header', data: { text: 'Abstract' } },
      { id: 'b2', type: 'paragraph', data: { text: 'Comprehensive abstract within limits.' } },
      { id: 'b3', type: 'header', data: { text: 'Introduction' } },
      { id: 'b4', type: 'paragraph', data: { text: words } },
    ];

    const mockBibliography = [
      `Smith, J. (${currentYear}). Novel Methods.`,
      `Lee, K. (${currentYear - 1}). Applied AI.`,
      `Tan, R. (${currentYear - 2}). Optimization.`,
      `Wong, P. (${currentYear - 3}). Empirical survey.`,
    ];

    // Elsevier requires APA, and active is APA
    const result = auditJournalReadiness(mockBlocks, mockBibliography, 'elsevier-sciencedirect', 'apa');

    expect(result.preset.id).toBe('elsevier-sciencedirect');
    expect(result.readinessScore).toBe(100);
    expect(result.overallStatus).toBe('ready');

    const styleCheck = result.items.find((i) => i.id === 'check-citation-style');
    expect(styleCheck?.status).toBe('pass');
  });

  it('STANDARD_JOURNAL_PRESETS: contains 5 presets including SINTA and IEEE', () => {
    expect(STANDARD_JOURNAL_PRESETS.length).toBeGreaterThanOrEqual(5);
    const sinta = STANDARD_JOURNAL_PRESETS.find((p) => p.id === 'sinta-kemdikbud');
    expect(sinta).toBeDefined();
    expect(sinta?.publisher).toContain('Kemdikbudristek');
  });
});
