import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateLocalFallbackAudit,
  loadCachedPeerReviewAudit,
  saveCachedPeerReviewAudit,
  type PeerReviewAuditReport,
} from '@/lib/editor/peer-reviewer';

describe('Peer Reviewer & Journal Readiness Audit Simulation (Phase 25)', () => {
  beforeEach(() => {
    // Mock localStorage
    const store: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => {
        store[key] = val;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const k in store) delete store[k];
      },
    });
  });

  describe('generateLocalFallbackAudit', () => {
    it('generates a valid fallback audit report for short drafts', () => {
      const report = generateLocalFallbackAudit({
        documentId: 'doc-short',
        documentTitle: 'Short Preliminary Draft',
        wordCount: 150,
        citationCount: 1,
        language: 'en',
      });

      expect(report).toBeDefined();
      expect(report.documentId).toBe('doc-short');
      expect(report.readinessScore).toBeGreaterThanOrEqual(35);
      expect(report.readinessScore).toBeLessThan(70);
      expect(report.overallVerdict).toBe('REJECT');
      expect(report.rubric.methodology.verdict).toBe('vulnerable');
      expect(report.rubric.citationAdequacy.verdict).toBe('vulnerable');
      expect(report.criticalInquiries.length).toBeGreaterThan(0);
      expect(report.actionableChecklist.length).toBeGreaterThan(0);
    });

    it('generates a strong score for comprehensive papers with high citations', () => {
      const report = generateLocalFallbackAudit({
        documentId: 'doc-ready',
        documentTitle: 'Advanced Deep Learning Survey',
        wordCount: 1200,
        citationCount: 15,
        language: 'en',
      });

      expect(report.readinessScore).toBeGreaterThanOrEqual(80);
      expect(report.overallVerdict).toBe('MINOR_REVISION');
      expect(report.rubric.methodology.verdict).toBe('adequate');
      expect(report.rubric.citationAdequacy.verdict).toBe('strong');
      expect(report.rubric.citationAdequacy.score).toBeGreaterThanOrEqual(80);
    });

    it('supports Indonesian language output seamlessly', () => {
      const report = generateLocalFallbackAudit({
        documentId: 'doc-id',
        documentTitle: 'Analisis Transformasi Digital',
        wordCount: 500,
        citationCount: 5,
        language: 'id',
      });

      expect(report.executiveSummary).toContain('Naskah menunjukkan pembahasan yang menarik');
      expect(report.criticalInquiries[0].question).toContain('metodologi');
      expect(report.actionableChecklist[0].task).toContain('Perjelas');
    });
  });

  describe('localStorage caching', () => {
    it('caches and retrieves peer review audit reports accurately', () => {
      const mockReport: PeerReviewAuditReport = {
        id: 'audit_test_123',
        documentId: 'doc_abc',
        documentTitle: 'Test Manuscript',
        overallVerdict: 'MINOR_REVISION',
        readinessScore: 82,
        executiveSummary: 'Solid manuscript ready for second review.',
        rubric: {
          methodology: { score: 85, verdict: 'adequate', strengths: ['Rigorous sample'], vulnerabilities: [] },
          significanceAndNovelty: { score: 80, verdict: 'adequate', strengths: ['Novel contribution'], vulnerabilities: [] },
          argumentCoherence: { score: 82, verdict: 'adequate', strengths: ['Fluent logic'], vulnerabilities: [] },
          citationAdequacy: { score: 88, verdict: 'strong', strengths: ['20+ peer reviewed'], vulnerabilities: [] },
        },
        criticalInquiries: [
          {
            id: 'inq_1',
            question: 'What is the confidence interval?',
            section: 'Results',
            importance: 'critical',
            suggestedRemedy: 'Add 95% CI to Table 2',
          },
        ],
        actionableChecklist: [
          { id: 'chk_1', task: 'Add CI intervals', status: 'todo', priority: 'high' },
        ],
        createdAt: '2026-10-16T10:00:00.000Z',
      };

      saveCachedPeerReviewAudit('doc_abc', mockReport);
      const loaded = loadCachedPeerReviewAudit('doc_abc');

      expect(loaded).not.toBeNull();
      expect(loaded?.id).toBe('audit_test_123');
      expect(loaded?.readinessScore).toBe(82);
      expect(loaded?.overallVerdict).toBe('MINOR_REVISION');
      expect(loaded?.rubric.methodology.score).toBe(85);
      expect(loaded?.criticalInquiries[0].suggestedRemedy).toBe('Add 95% CI to Table 2');
    });

    it('returns null when document cache does not exist', () => {
      const loaded = loadCachedPeerReviewAudit('non_existent_doc');
      expect(loaded).toBeNull();
    });

    it('handles empty documentId safely', () => {
      const loaded = loadCachedPeerReviewAudit('');
      expect(loaded).toBeNull();
    });
  });
});
