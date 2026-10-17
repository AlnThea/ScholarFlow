import { describe, it, expect } from 'vitest';
import {
  createSuggestionMarkup,
  applyAcceptSuggestionToHtml,
  applyRejectSuggestionToHtml,
  extractSuggestionsFromHtml,
  transformEditorBlocksSuggestion,
  escapeHtml,
} from '@/lib/editor/suggesting-engine';

describe('Phase 29: Live Track Changes & Suggesting Mode Unit Tests', () => {
  describe('HTML escaping and markup generation', () => {
    it('escapes unsafe HTML characters properly', () => {
      const raw = 'Deep Learning <Transformer> & "Attention" \'2017\'';
      const escaped = escapeHtml(raw);
      expect(escaped).toBe('Deep Learning &lt;Transformer&gt; &amp; &quot;Attention&quot; &#039;2017&#039;');
    });

    it('generates inline diff markup with <del> and <ins> elements', () => {
      const markup = createSuggestionMarkup('sug-123', 'old hypothesis', 'revised hypothesis', 'Dr. Smith');
      expect(markup).toContain('data-suggestion-id="sug-123"');
      expect(markup).toContain('data-author="Dr. Smith"');
      expect(markup).toContain('<del');
      expect(markup).toContain('old hypothesis</del>');
      expect(markup).toContain('<ins');
      expect(markup).toContain('revised hypothesis</ins>');
      expect(markup).toContain('line-through');
      expect(markup).toContain('underline');
    });

    it('handles suggestion with only new inserted text (no deletion)', () => {
      const markup = createSuggestionMarkup('sug-456', '', 'newly added citation', 'Reviewer #2');
      expect(markup).not.toContain('<del');
      expect(markup).toContain('<ins');
      expect(markup).toContain('newly added citation</ins>');
    });
  });

  describe('Single suggestion resolution: Accept & Reject', () => {
    it('accepts a specific suggestion by removing <del> and unwrapping <ins>', () => {
      const markup = createSuggestionMarkup('sug-1', 'initial draft', 'final polished text', 'Editor');
      const paragraph = `<p>This is our ${markup} for submission.</p>`;

      const accepted = applyAcceptSuggestionToHtml(paragraph, 'sug-1');
      expect(accepted).not.toContain('<del');
      expect(accepted).not.toContain('<ins');
      expect(accepted).not.toContain('initial draft');
      expect(accepted).toContain('final polished text');
      expect(accepted).toBe('<p>This is our final polished text for submission.</p>');
    });

    it('rejects a specific suggestion by removing <ins> and restoring original <del> text', () => {
      const markup = createSuggestionMarkup('sug-1', 'initial draft', 'final polished text', 'Editor');
      const paragraph = `<p>This is our ${markup} for submission.</p>`;

      const rejected = applyRejectSuggestionToHtml(paragraph, 'sug-1');
      expect(rejected).not.toContain('<del');
      expect(rejected).not.toContain('<ins');
      expect(rejected).not.toContain('final polished text');
      expect(rejected).toContain('initial draft');
      expect(rejected).toBe('<p>This is our initial draft for submission.</p>');
    });

    it('preserves other suggestions when resolving a targeted suggestion ID', () => {
      const sug1 = createSuggestionMarkup('sug-1', 'A', 'B', 'Reviewer 1');
      const sug2 = createSuggestionMarkup('sug-2', 'C', 'D', 'Reviewer 2');
      const paragraph = `Text ${sug1} and ${sug2}.`;

      // Accept only sug-1
      const acceptedSug1 = applyAcceptSuggestionToHtml(paragraph, 'sug-1');
      expect(acceptedSug1).toContain('Text B and');
      expect(acceptedSug1).toContain('data-suggestion-id="sug-2"');
      expect(acceptedSug1).toContain('C');
      expect(acceptedSug1).toContain('D');

      // Reject sug-2 on the result
      const resolvedBoth = applyRejectSuggestionToHtml(acceptedSug1, 'sug-2');
      expect(resolvedBoth).toBe('Text B and C.');
    });
  });

  describe('Batch operations: Accept All & Reject All', () => {
    it('batch accepts all suggestions across HTML content simultaneously', () => {
      const sug1 = createSuggestionMarkup('sug-1', 'bad', 'excellent', 'Reviewer');
      const sug2 = createSuggestionMarkup('sug-2', 'slow', 'high-throughput', 'Editor');
      const html = `<p>The results were ${sug1} with ${sug2} architecture.</p>`;

      const batchAccepted = applyAcceptSuggestionToHtml(html);
      expect(batchAccepted).toBe('<p>The results were excellent with high-throughput architecture.</p>');
    });

    it('batch rejects all suggestions across HTML content simultaneously', () => {
      const sug1 = createSuggestionMarkup('sug-1', 'bad', 'excellent', 'Reviewer');
      const sug2 = createSuggestionMarkup('sug-2', 'slow', 'high-throughput', 'Editor');
      const html = `<p>The results were ${sug1} with ${sug2} architecture.</p>`;

      const batchRejected = applyRejectSuggestionToHtml(html);
      expect(batchRejected).toBe('<p>The results were bad with slow architecture.</p>');
    });
  });

  describe('Extracting suggestions from HTML markup', () => {
    it('correctly extracts embedded suggestions with author metadata', () => {
      const sug1 = createSuggestionMarkup('sug-99', 'heuristic', 'exact algorithm', 'Prof. Alan');
      const sug2 = createSuggestionMarkup('sug-100', '10 iterations', '50 iterations', 'Reviewer #2');
      const html = `<div>${sug1} and ${sug2}</div>`;

      const list = extractSuggestionsFromHtml(html, 'block-42');
      expect(list).toHaveLength(2);

      expect(list[0].id).toBe('sug-99');
      expect(list[0].authorName).toBe('Prof. Alan');
      expect(list[0].oldText).toBe('heuristic');
      expect(list[0].newText).toBe('exact algorithm');
      expect(list[0].blockId).toBe('block-42');

      expect(list[1].id).toBe('sug-100');
      expect(list[1].authorName).toBe('Reviewer #2');
      expect(list[1].oldText).toBe('10 iterations');
      expect(list[1].newText).toBe('50 iterations');
    });

    it('returns empty array when no suggestions are present', () => {
      const html = '<p>Clean text without any suggestions.</p>';
      expect(extractSuggestionsFromHtml(html)).toEqual([]);
    });
  });

  describe('EditorJS Block Tree Transformations', () => {
    it('transforms blocks for batch accept and reports affected count', () => {
      const sug1 = createSuggestionMarkup('sug-1', 'old', 'new', 'Author');
      const blocks = [
        { id: 'b1', type: 'paragraph', data: { text: `Block 1 with ${sug1}` } },
        { id: 'b2', type: 'paragraph', data: { text: 'Block 2 without changes' } },
      ];

      const { updatedBlocks, affectedCount } = transformEditorBlocksSuggestion(blocks, 'accept_all');
      expect(affectedCount).toBe(1);
      expect(updatedBlocks[0].data.text).toBe('Block 1 with new');
      expect(updatedBlocks[1].data.text).toBe('Block 2 without changes');
    });

    it('transforms blocks for batch reject and reports affected count', () => {
      const sug1 = createSuggestionMarkup('sug-1', 'original phrase', 'suggested phrase', 'Author');
      const blocks = [
        { id: 'b1', type: 'paragraph', data: { text: `Discussion: ${sug1}` } },
      ];

      const { updatedBlocks, affectedCount } = transformEditorBlocksSuggestion(blocks, 'reject_all');
      expect(affectedCount).toBe(1);
      expect(updatedBlocks[0].data.text).toBe('Discussion: original phrase');
    });
  });
});
