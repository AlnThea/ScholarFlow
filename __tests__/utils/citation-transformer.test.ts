import { describe, it, expect } from 'vitest';
import {
  extractFamilyName,
  formatInTextCitationLabel,
  extractReferenceIdsInOrder,
  transformEditorContentCitations,
  sortAndFormatBibliography,
} from '@/lib/editor/citation-transformer';
import type { CitationCandidate } from '@/lib/api/citations';

describe('Bidirectional Reactive Citation Style Transformer Unit Tests', () => {
  const candidate1: CitationCandidate = {
    reference_id: 'ref-transformer-1',
    title: 'Attention Is All You Need',
    authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit'],
    year: 2017,
    source: 'Advances in Neural Information Processing Systems (NeurIPS)',
    citation_label: 'Vaswani et al., 2017',
    doi: '10.5555/3295222.3295349',
  };

  const candidate2: CitationCandidate = {
    reference_id: 'ref-transformer-2',
    title: 'Deep Learning',
    authors: ['Yann LeCun', 'Yoshua Bengio'],
    year: 2015,
    source: 'Nature',
    citation_label: 'LeCun & Bengio, 2015',
    doi: '10.1038/nature14539',
  };

  const candidate3: CitationCandidate = {
    reference_id: 'ref-transformer-3',
    title: 'A Mathematical Theory of Communication',
    authors: ['Claude E. Shannon'],
    year: 1948,
    source: 'Bell System Technical Journal',
    citation_label: 'Shannon, 1948',
  };

  const mockLibrary: Record<string, CitationCandidate> = {
    'ref-transformer-1': candidate1,
    'ref-transformer-2': candidate2,
    'ref-transformer-3': candidate3,
  };

  describe('Author Name Parsing (extractFamilyName)', () => {
    it('extracts family name from Western format (First Last)', () => {
      expect(extractFamilyName('Ashish Vaswani')).toBe('Vaswani');
      expect(extractFamilyName('Claude E. Shannon')).toBe('Shannon');
    });

    it('extracts family name from Academic Comma format (Last, First)', () => {
      expect(extractFamilyName('Vaswani, Ashish')).toBe('Vaswani');
      expect(extractFamilyName('Bengio, Yoshua')).toBe('Bengio');
    });

    it('handles single-word names and empty inputs safely', () => {
      expect(extractFamilyName('Aristotle')).toBe('Aristotle');
      expect(extractFamilyName('')).toBe('Unknown');
    });
  });

  describe('In-Text Citation Formatting (formatInTextCitationLabel)', () => {
    it('formats IEEE numeric citations with square brackets', () => {
      expect(formatInTextCitationLabel(candidate1, 'ieee', 1)).toBe('[1]');
      expect(formatInTextCitationLabel(candidate2, 'ieee', 2)).toBe('[2]');
    });

    it('formats Vancouver numeric citations with parentheses', () => {
      expect(formatInTextCitationLabel(candidate1, 'vancouver', 1)).toBe('(1)');
      expect(formatInTextCitationLabel(candidate3, 'vancouver', 3)).toBe('(3)');
    });

    it('formats APA author-year citations according to author count', () => {
      // 1 author: (Shannon, 1948)
      expect(formatInTextCitationLabel(candidate3, 'apa')).toBe('(Shannon, 1948)');

      // 2 authors: (LeCun & Bengio, 2015)
      expect(formatInTextCitationLabel(candidate2, 'apa')).toBe('(LeCun & Bengio, 2015)');

      // 3+ authors: (Vaswani et al., 2017)
      expect(formatInTextCitationLabel(candidate1, 'apa')).toBe('(Vaswani et al., 2017)');
    });

    it('formats Harvard citations without comma between author and year', () => {
      expect(formatInTextCitationLabel(candidate3, 'harvard')).toBe('(Shannon 1948)');
      expect(formatInTextCitationLabel(candidate2, 'harvard')).toBe('(LeCun and Bengio 2015)');
      expect(formatInTextCitationLabel(candidate1, 'harvard')).toBe('(Vaswani et al. 2017)');
    });

    it('formats MLA author citations without year', () => {
      expect(formatInTextCitationLabel(candidate1, 'mla')).toBe('(Vaswani et al.)');
      expect(formatInTextCitationLabel(candidate3, 'mla')).toBe('(Shannon)');
    });
  });

  describe('Order of Appearance Extraction (extractReferenceIdsInOrder)', () => {
    it('extracts reference IDs in the exact order they appear in text blocks', () => {
      const mockContent = {
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: 'Model arsitektur transformator diperkenalkan oleh <cite data-citation="true" data-ref-id="ref-transformer-1"> [Vaswani et al., 2017]</cite>.'
            }
          },
          {
            type: 'paragraph',
            data: {
              text: 'Fondasi teori informasi dibangun oleh <cite data-citation="true" data-ref-id="ref-transformer-3"> [Shannon, 1948]</cite> dan dilanjutkan dengan deep learning <cite data-citation="true" data-ref-id="ref-transformer-2"> [LeCun & Bengio, 2015]</cite>.'
            }
          },
          {
            type: 'paragraph',
            data: {
              text: 'Rujukan berulang ke transformator <cite data-citation="true" data-ref-id="ref-transformer-1"> [Vaswani et al., 2017]</cite> harus deduplikasi.'
            }
          }
        ]
      };

      const orderedIds = extractReferenceIdsInOrder(mockContent);
      expect(orderedIds).toEqual([
        'ref-transformer-1',
        'ref-transformer-3',
        'ref-transformer-2',
      ]);
    });
  });

  describe('Bidirectional Content Transformation (transformEditorContentCitations)', () => {
    it('transforms APA author-year citations to IEEE numbered brackets in order of appearance', () => {
      const initialContent = {
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: 'Kajian neural networks dipelopori <cite data-citation="true" data-ref-id="ref-transformer-2"> (LeCun & Bengio, 2015)</cite> lalu dilanjutkan mekanisme atensi <cite data-citation="true" data-ref-id="ref-transformer-1"> (Vaswani et al., 2017)</cite>.'
            }
          }
        ]
      };

      const result = transformEditorContentCitations(initialContent, 'ieee', mockLibrary);

      expect(result.transformedCount).toBe(2);
      expect(result.refIdToNumericMap.get('ref-transformer-2')).toBe(1);
      expect(result.refIdToNumericMap.get('ref-transformer-1')).toBe(2);

      const transformedText = result.newContent.blocks[0].data.text;
      expect(transformedText).toContain('data-ref-id="ref-transformer-2"> [1]</cite>');
      expect(transformedText).toContain('data-ref-id="ref-transformer-1"> [2]</cite>');
    });

    it('transforms IEEE numbered citations back to APA author-year format (Bidirectional)', () => {
      const ieeeContent = {
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: 'Teori komunikasi klasik <cite data-citation="true" data-ref-id="ref-transformer-3"> [1]</cite> menjadi landasan awal.'
            }
          }
        ]
      };

      const result = transformEditorContentCitations(ieeeContent, 'apa', mockLibrary);

      expect(result.transformedCount).toBe(1);
      const text = result.newContent.blocks[0].data.text;
      expect(text).toContain('data-ref-id="ref-transformer-3"> (Shannon, 1948)</cite>');
    });
  });

  describe('Bibliography Sorting & Re-indexing (sortAndFormatBibliography)', () => {
    it('sorts bibliography entries by order of appearance when IEEE style is active', () => {
      const orderedIds = ['ref-transformer-3', 'ref-transformer-1']; // Shannon first, Vaswani second

      const entries = sortAndFormatBibliography(
        ['ref-transformer-1', 'ref-transformer-3'],
        mockLibrary,
        'ieee',
        orderedIds
      );

      expect(entries).toHaveLength(2);
      expect(entries[0].referenceId).toBe('ref-transformer-3'); // Appearance rank 1
      expect(entries[0].label).toBe('[1]');
      expect(entries[1].referenceId).toBe('ref-transformer-1'); // Appearance rank 2
      expect(entries[1].label).toBe('[2]');
    });

    it('sorts bibliography entries alphabetically by first author family name when APA style is active', () => {
      const orderedIds = ['ref-transformer-3', 'ref-transformer-1', 'ref-transformer-2'];

      const entries = sortAndFormatBibliography(
        ['ref-transformer-3', 'ref-transformer-1', 'ref-transformer-2'],
        mockLibrary,
        'apa',
        orderedIds
      );

      // LeCun (L) -> Shannon (S) -> Vaswani (V)
      expect(entries[0].referenceId).toBe('ref-transformer-2'); // LeCun
      expect(entries[1].referenceId).toBe('ref-transformer-3'); // Shannon
      expect(entries[2].referenceId).toBe('ref-transformer-1'); // Vaswani
    });
  });
});
