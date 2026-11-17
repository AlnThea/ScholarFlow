import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildAutoCitePrompt, matchAutoCitations, type AutoCiteRequest } from '@/lib/api/auto-cite';
import { calculateManuscriptRelevanceScore } from '@/lib/editor/reference-importer';
import type { CitationCandidate } from '@/lib/api/citations';

describe('Phase 74: AI Auto-Citation Attribution & Matchmaker Engine', () => {
  const sampleCandidates: CitationCandidate[] = [
    {
      source: 'NeurIPS 2017',
      title: 'Attention Is All You Need',
      authors: ['Vaswani, Ashish', 'Shazeer, Noam', 'Parmar, Niki'],
      year: 2017,
      doi: '10.5555/3295222.3295349',
      url: 'https://doi.org/10.5555/3295222.3295349',
      reference_id: 'vaswani2017',
      citation_label: '[Vaswani et al., 2017]',
      ranking_score: 1.0,
      ranking_reason: ['Imported from RIS'],
      abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks.',
      journal: 'NeurIPS',
      cited_by_count: 95000,
      pdf_url: null,
    },
    {
      source: 'ICLR 2015',
      title: 'Adam: A Method for Stochastic Optimization',
      authors: ['Kingma, Diederik P.', 'Ba, Jimmy'],
      year: 2015,
      doi: '10.48550/arXiv.1412.6980',
      url: 'https://doi.org/10.48550/arXiv.1412.6980',
      reference_id: 'kingma2015',
      citation_label: '[Kingma & Ba, 2015]',
      ranking_score: 1.0,
      ranking_reason: ['Imported from BibTeX'],
      abstract: 'We introduce Adam, an algorithm for first-order gradient-based optimization of stochastic objective functions.',
      journal: 'ICLR',
      cited_by_count: 140000,
      pdf_url: null,
    },
  ];

  const sampleBlocks = [
    {
      id: 'b_1',
      text: 'Neural machine translation has progressed rapidly with self-attention architectures that eschew recurrence.',
    },
    {
      id: 'b_2',
      text: 'To train our deep models efficiently, we employed stochastic first-order gradient optimization with adaptive learning rates.',
    },
  ];

  describe('buildAutoCitePrompt', () => {
    it('generates a strict English closed-world prompt with candidate references and paragraphs', () => {
      const prompt = buildAutoCitePrompt({
        blocks: sampleBlocks,
        candidates: sampleCandidates,
        language: 'en',
      });

      expect(prompt).toContain('CLOSED SET - ONLY USE THESE');
      expect(prompt).toContain('vaswani2017');
      expect(prompt).toContain('[Vaswani et al., 2017]');
      expect(prompt).toContain('Attention Is All You Need');
      expect(prompt).toContain('kingma2015');
      expect(prompt).toContain('Neural machine translation has progressed rapidly');
      expect(prompt).toContain('Return strictly valid JSON');
    });

    it('generates a strict Indonesian closed-world prompt with candidate references and paragraphs', () => {
      const prompt = buildAutoCitePrompt({
        blocks: sampleBlocks,
        candidates: sampleCandidates,
        language: 'id',
      });

      expect(prompt).toContain('DAFTAR PAPER REFERENSI YANG TERSEDIA (HANYA GUNAKAN DAFTAR INI)');
      expect(prompt).toContain('vaswani2017');
      expect(prompt).toContain('kingma2015');
      expect(prompt).toContain('HANYA JSON valid');
      expect(prompt).toContain('BLOK PARAGRAF NASKAH');
    });

    it('gracefully handles missing authors and missing years', () => {
      const minimalCandidate: CitationCandidate = {
        source: 'Unknown',
        title: 'Minimal Reference Title',
        authors: [],
        year: null,
        doi: null,
        url: null,
        reference_id: 'minimal_ref',
        citation_label: '[Minimal, n.d.]',
        ranking_score: 1.0,
        ranking_reason: [],
        abstract: null,
        journal: null,
        cited_by_count: 0,
        pdf_url: null,
      };

      const prompt = buildAutoCitePrompt({
        blocks: [{ id: 'b_0', text: 'Some factual claim.' }],
        candidates: [minimalCandidate],
        language: 'en',
      });

      expect(prompt).toContain('minimal_ref');
      expect(prompt).toContain('(n.d.)');
      expect(prompt).toContain('Unknown');
    });
  });

  describe('matchAutoCitations API client', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
      vi.resetAllMocks();
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('successfully calls endpoint and parses response', async () => {
      const mockResult = {
        matches: [
          {
            matchId: 'match_1',
            blockId: 'b_1',
            sentenceText: 'Neural machine translation has progressed rapidly with self-attention architectures',
            referenceId: 'vaswani2017',
            citationLabel: '[Vaswani et al., 2017]',
            confidence: 0.96,
            rationale: 'Discusses self-attention architecture without recurrence.',
          },
        ],
        totalMatches: 1,
        tokensConsumed: 1200,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResult,
      });

      const res = await matchAutoCitations({
        blocks: sampleBlocks,
        candidates: sampleCandidates,
        language: 'en',
      });

      expect(res.totalMatches).toBe(1);
      expect(res.matches[0].referenceId).toBe('vaswani2017');
      expect(res.matches[0].confidence).toBe(0.96);
    });

    it('throws error with message on failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Monthly token quota exceeded' }),
      });

      await expect(
        matchAutoCitations({
          blocks: sampleBlocks,
          candidates: sampleCandidates,
          language: 'en',
        })
      ).rejects.toThrow('Monthly token quota exceeded');
    });

    it('throws Pro-tier gating error when non-pro user attempts auto-citation', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({
          error: 'Auto-Cite is an exclusive Pro feature. Please upgrade to Pro to unlock automated AI manuscript citation matching.',
          proRequired: true,
        }),
      });

      await expect(
        matchAutoCitations({
          blocks: sampleBlocks,
          candidates: sampleCandidates,
          language: 'en',
          userPlan: 'free',
        })
      ).rejects.toThrow('Auto-Cite is an exclusive Pro feature');
    });
  });

  describe('calculateManuscriptRelevanceScore', () => {
    it('calculates higher match scores for papers with high topical keyword overlap', () => {
      const taxManuscript = 'This research investigates tax compliance behaviour and fiscal policies in developing markets.';
      
      const taxPaper: CitationCandidate = {
        source: 'Journal of Finance',
        title: 'Fiscal Incentives and Tax Compliance Behaviour in Industrial Clusters',
        authors: ['Nwokoye, E.S.'],
        year: 2023,
        doi: '10.1080/15228916.2022.2031827',
        url: 'https://doi.org',
        reference_id: 'nwokoye2023',
        citation_label: '[Nwokoye et al., 2023]',
        ranking_score: 1.0,
        ranking_reason: [],
        abstract: 'Investigates the impact of fiscal incentives on tax compliance behavior of firms.',
        journal: 'Journal of Business',
        cited_by_count: 45,
        pdf_url: null,
      };

      const unrelatedPaper: CitationCandidate = {
        source: 'Astrophysics Journal',
        title: 'Deep Stellar Spectroscopy and Galaxy Cluster Velocity',
        authors: ['Hubble, Edwin'],
        year: 2018,
        doi: null,
        url: null,
        reference_id: 'hubble2018',
        citation_label: '[Hubble, 2018]',
        ranking_score: 1.0,
        ranking_reason: [],
        abstract: 'Observations of red-shift in distant galaxies.',
        journal: 'Astrophysics',
        cited_by_count: 10,
        pdf_url: null,
      };

      const taxScore = calculateManuscriptRelevanceScore(taxPaper, taxManuscript);
      const unrelatedScore = calculateManuscriptRelevanceScore(unrelatedPaper, taxManuscript);

      expect(taxScore).toBeGreaterThanOrEqual(85);
      expect(taxScore).toBeGreaterThan(unrelatedScore);
    });

    it('returns a sensible baseline score when manuscript text is empty', () => {
      const score = calculateManuscriptRelevanceScore(sampleCandidates[0], '');
      expect(score).toBeGreaterThanOrEqual(80);
      expect(score).toBeLessThanOrEqual(98);
    });
  });

  describe('DOM in-text citation injection resilience', () => {
    it('successfully matches and injects citations even with non-breaking spaces and HTML entities', () => {
      const container = document.createElement('div');
      container.id = 'editorjs-holder';
      // Simulate real-world browser contenteditable with &nbsp; and formatting
      container.innerHTML = `
        <div class="ce-block" data-id="block_1">
          <div class="ce-paragraph cdx-block" contenteditable="true">
            Di era digitalisasi&nbsp;saat ini, perguruan tinggi dituntut untuk <b>berinovasi</b> secara berkelanjutan.
          </div>
        </div>
      `;
      document.body.appendChild(container);

      const match = {
        matchId: 'm1',
        blockId: 'block_1',
        sentenceText: 'Di era digitalisasi saat ini, perguruan tinggi dituntut untuk berinovasi secara berkelanjutan.',
        referenceId: 'vaswani2017',
        citationLabel: '[Vaswani et al., 2017]',
        confidence: 0.95,
        rationale: 'Supports educational innovation claim.',
      };

      const normalizeForMatching = (str: string) => {
        return (str || '')
          .replace(/&nbsp;/gi, ' ')
          .replace(/\u00A0/g, ' ')
          .replace(/&amp;/gi, '&')
          .replace(/&quot;/gi, '"')
          .replace(/&#39;|&apos;/gi, "'")
          .replace(/&lt;/gi, '<')
          .replace(/&gt;/gi, '>')
          .replace(/[“”]/g, '"')
          .replace(/[‘’]/g, "'")
          .replace(/\s+/g, ' ')
          .trim();
      };

      const editables = Array.from(container.querySelectorAll('[contenteditable="true"]')) as HTMLElement[];
      let placed = false;

      for (const el of editables) {
        const normElText = normalizeForMatching(el.textContent || '');
        const normTarget = normalizeForMatching(match.sentenceText);
        expect(normElText).toContain(normTarget);

        const words = normTarget.split(/\s+/).filter(Boolean);
        const escapedWords = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const fullRegex = new RegExp(`(${escapedWords.join('(?:\\s+|&nbsp;|\\u00A0|<[^>]+>)+')}[.,;:!?]?)`, 'i');

        expect(fullRegex.test(el.innerHTML)).toBe(true);

        const cleanLabel = match.citationLabel.replace(/^\[|\]$/g, '');
        const citeHtml = ` <cite data-citation="true" data-ref-id="${match.referenceId}">[${cleanLabel}]</cite>`;
        el.innerHTML = el.innerHTML.replace(fullRegex, `$1${citeHtml}`);
        placed = true;
      }

      expect(placed).toBe(true);
      const insertedCite = container.querySelector('cite[data-citation="true"]');
      expect(insertedCite).not.toBeNull();
      expect(insertedCite?.getAttribute('data-ref-id')).toBe('vaswani2017');
      expect(insertedCite?.textContent).toBe('[Vaswani et al., 2017]');

      document.body.removeChild(container);
    });
  });
});
