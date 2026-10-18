// __tests__/utils/citation-mention.test.ts
// Phase 32: Smart In-Text Reference Mention (@cite / @ref) Unit Tests

import { describe, it, expect, beforeEach } from 'vitest';
import { extractMentionQuery } from '@/lib/editor/mention-parser';
import { searchLocalReferences } from '@/lib/editor/reference-search-index';
import { formatInTextCitationLabel } from '@/lib/editor/citation-transformer';
import type { CitationCandidate } from '@/lib/api/citations';

const MOCK_REFERENCES: CitationCandidate[] = [
  {
    source: 'openalex',
    title: 'Attention Is All You Need',
    authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit'],
    year: 2017,
    doi: '10.48550/arXiv.1706.03762',
    url: 'https://arxiv.org/abs/1706.03762',
    reference_id: 'openalex:W2963403868',
    citation_label: 'Vaswani et al., 2017',
    ranking_score: 95,
    ranking_reason: ['Seminal transformer architecture paper'],
    abstract: 'We propose a new simple network architecture, the Transformer...',
    journal: 'Advances in Neural Information Processing Systems',
    cited_by_count: 98000,
    pdf_url: null,
  },
  {
    source: 'crossref',
    title: 'Deep Residual Learning for Image Recognition',
    authors: ['Kaiming He', 'Xiangyu Zhang', 'Shaoqing Ren', 'Jian Sun'],
    year: 2016,
    doi: '10.1109/CVPR.2016.90',
    url: 'https://doi.org/10.1109/cvpr.2016.90',
    reference_id: 'crossref:he2016resnet',
    citation_label: 'He et al., 2016',
    ranking_score: 90,
    ranking_reason: ['Foundational ResNet computer vision paper'],
    abstract: 'Deeper neural networks are more difficult to train...',
    journal: 'IEEE Conference on Computer Vision and Pattern Recognition',
    cited_by_count: 125000,
    pdf_url: null,
  },
  {
    source: 'local',
    title: 'Sistem Informasi Manajemen Tugas Akhir Berbasis Web',
    authors: ['Budi Pratama', 'Agus Wijaya'],
    year: 2023,
    doi: '10.1234/simta.2023.01',
    url: null,
    reference_id: 'local:pratama2023',
    citation_label: 'Pratama & Wijaya, 2023',
    ranking_score: 80,
    ranking_reason: ['Local thesis management implementation'],
    abstract: 'Penelitian ini merancang sistem informasi manajemen skripsi...',
    journal: 'Jurnal Sistem Informasi Indonesia',
    cited_by_count: 15,
    pdf_url: null,
  },
];

describe('Phase 32: Smart In-Text Reference Mention Engine', () => {
  describe('extractMentionQuery (Mention Trigger Parser)', () => {
    it('detects explicit @cite: trigger with query', () => {
      const text = 'As stated in the preliminary literature @cite:vaswani';
      const result = extractMentionQuery(text);

      expect(result).not.toBeNull();
      expect(result?.match).toBe(true);
      expect(result?.trigger).toBe('@cite:');
      expect(result?.query).toBe('vaswani');
      expect(result?.fullMatch).toBe('@cite:vaswani');
    });

    it('detects explicit @ref: trigger with multiple words query', () => {
      const text = 'Experimental proof shown by @ref:deep residual';
      const result = extractMentionQuery(text);

      expect(result).not.toBeNull();
      expect(result?.match).toBe(true);
      expect(result?.trigger).toBe('@ref:');
      expect(result?.query).toBe('deep residual');
    });

    it('detects shorthand @author trigger', () => {
      const text = 'According to recent findings @pratama';
      const result = extractMentionQuery(text);

      expect(result).not.toBeNull();
      expect(result?.match).toBe(true);
      expect(result?.trigger).toBe('@');
      expect(result?.query).toBe('pratama');
      expect(result?.fullMatch).toBe('@pratama');
    });

    it('ignores regular email addresses (does not treat domain as mention)', () => {
      const text = 'Please reach out to contact@scholarflow.com';
      const result = extractMentionQuery(text);

      // In contact@scholarflow.com, @ is preceded immediately by alphanumeric characters without space
      expect(result).toBeNull();
    });

    it('returns null when text does not contain any mention trigger', () => {
      const text = 'Standard academic sentence without any symbol.';
      const result = extractMentionQuery(text);
      expect(result).toBeNull();
    });
  });

  describe('searchLocalReferences (Multi-Field In-Memory Search Indexer)', () => {
    it('returns all references when query is empty', () => {
      const results = searchLocalReferences('', MOCK_REFERENCES);
      expect(results).toHaveLength(3);
    });

    it('matches by author surname with highest score', () => {
      const results = searchLocalReferences('Vaswani', MOCK_REFERENCES);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].candidate.authors[0]).toContain('Vaswani');
      expect(results[0].score).toBeGreaterThanOrEqual(50);
      expect(results[0].matchField).toBe('author');
    });

    it('matches by title keywords', () => {
      const results = searchLocalReferences('Residual Learning', MOCK_REFERENCES);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].candidate.title).toBe('Deep Residual Learning for Image Recognition');
    });

    it('matches by publication year', () => {
      const results = searchLocalReferences('2023', MOCK_REFERENCES);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].candidate.year).toBe(2023);
      expect(results[0].candidate.title).toContain('Tugas Akhir');
    });

    it('matches Indonesian author and title seamlessly', () => {
      const results = searchLocalReferences('Pratama skripsi', MOCK_REFERENCES);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].candidate.authors[0]).toBe('Budi Pratama');
    });
  });

  describe('Citation Label Formatting for Mentions', () => {
    it('formats in-text citation correctly for APA (Author-Year)', () => {
      const label = formatInTextCitationLabel(MOCK_REFERENCES[0], 'apa');
      expect(label).toBe('(Vaswani et al., 2017)');
    });

    it('formats in-text citation correctly for IEEE (Numeric [X])', () => {
      const label = formatInTextCitationLabel(MOCK_REFERENCES[0], 'ieee', 1);
      expect(label).toBe('[1]');
    });

    it('formats two-author citation in APA with ampersand (&)', () => {
      const label = formatInTextCitationLabel(MOCK_REFERENCES[2], 'apa');
      expect(label).toBe('(Pratama & Wijaya, 2023)');
    });
  });
});
