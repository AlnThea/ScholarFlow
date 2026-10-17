import { describe, it, expect } from 'vitest';
import {
  extractScientificItems,
  createCrossReferenceMarkup,
  updateHtmlCrossReferences,
  replaceShorthandMentions,
  reindexContentCrossReferences,
  escapeCrossReferenceHtml,
} from '@/lib/editor/cross-reference';

describe('Phase 30: Scientific Figure & Table Auto-Numbering Engine Unit Tests', () => {
  const sampleBlocks = [
    {
      id: 'block-img-1',
      type: 'image',
      data: {
        file: { url: 'https://example.com/arch.png' },
        caption: 'Convolutional neural network architecture',
      },
    },
    {
      id: 'block-p-1',
      type: 'paragraph',
      data: {
        text: 'The proposed baseline model is evaluated across multiple benchmarks.',
      },
    },
    {
      id: 'block-tab-1',
      type: 'table',
      data: {
        caption: 'Classification benchmark metrics',
        content: [
          ['Dataset', 'Accuracy', 'F1-Score'],
          ['CIFAR-10', '98.4%', '0.982'],
        ],
      },
    },
    {
      id: 'block-img-2',
      type: 'image',
      data: {
        file: { url: 'https://example.com/loss.png' },
        caption: 'Training loss convergence trajectory',
      },
    },
  ];

  describe('Scientific Items Extraction & Sequential Numbering', () => {
    it('extracts figures and tables sequentially with Indonesian labels', () => {
      const { figures, tables } = extractScientificItems(sampleBlocks, 'id');

      expect(figures).toHaveLength(2);
      expect(tables).toHaveLength(1);

      expect(figures[0].id).toBe('block-img-1');
      expect(figures[0].index).toBe(1);
      expect(figures[0].label).toBe('Gambar 1');
      expect(figures[0].caption).toBe('Convolutional neural network architecture');

      expect(figures[1].id).toBe('block-img-2');
      expect(figures[1].index).toBe(2);
      expect(figures[1].label).toBe('Gambar 2');

      expect(tables[0].id).toBe('block-tab-1');
      expect(tables[0].index).toBe(1);
      expect(tables[0].label).toBe('Tabel 1');
      expect(tables[0].caption).toBe('Classification benchmark metrics');
    });

    it('extracts figures and tables sequentially with English labels', () => {
      const { figures, tables } = extractScientificItems(sampleBlocks, 'en');

      expect(figures[0].label).toBe('Figure 1');
      expect(figures[1].label).toBe('Figure 2');
      expect(tables[0].label).toBe('Table 1');
    });

    it('handles blocks without explicit captions using fallback titles', () => {
      const blocksWithoutCaption = [
        { id: 'img-nocap', type: 'image', data: { file: { url: 'img.png' } } },
        { id: 'tab-nocap', type: 'table', data: { content: [['Header A', 'Header B']] } },
      ];

      const { figures, tables } = extractScientificItems(blocksWithoutCaption, 'en');
      expect(figures[0].caption).toBe('Untitled Figure');
      expect(tables[0].caption).toBe('Header A | Header B');
    });
  });

  describe('Cross-Reference Markup Generation', () => {
    it('generates secure HTML anchor markup with metadata attributes', () => {
      const markup = createCrossReferenceMarkup('block-img-1', 'figure', 1, 'en');

      expect(markup).toContain('data-cross-ref="true"');
      expect(markup).toContain('data-ref-type="figure"');
      expect(markup).toContain('data-target-id="block-img-1"');
      expect(markup).toContain('Figure 1</a>');
      expect(markup).toContain('href="#block-img-1"');
    });

    it('escapes unsafe HTML characters in custom text or target ID', () => {
      const escaped = escapeCrossReferenceHtml('<script>alert("xss")</script>');
      expect(escaped).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');

      const markup = createCrossReferenceMarkup('target&1', 'table', 2, 'id', 'Lihat <Tabel 2>');
      expect(markup).toContain('data-target-id="target&amp;1"');
      expect(markup).toContain('Lihat &lt;Tabel 2&gt;</a>');
    });
  });

  describe('In-Text Reference Re-numbering & Re-indexing', () => {
    it('updates in-text anchor labels when figures change order', () => {
      const { figures, tables } = extractScientificItems(sampleBlocks, 'id');

      // Initial anchor in paragraph
      const html = '<p>Sebagaimana tampak pada <a class="sf-cross-ref" data-ref-type="figure" data-target-id="block-img-2">Gambar 99</a>, konvergensi tercapai.</p>';

      // In sampleBlocks, block-img-2 is index 2 -> should re-label to Gambar 2
      const updated = updateHtmlCrossReferences(html, figures, tables, 'id');
      expect(updated).toContain('Gambar 2</a>');
      expect(updated).not.toContain('Gambar 99');
    });

    it('preserves references to items that are still in document when style language switches to English', () => {
      const { figures, tables } = extractScientificItems(sampleBlocks, 'en');
      const html = '<p>See <a class="sf-cross-ref" data-ref-type="table" data-target-id="block-tab-1">Tabel 1</a> for results.</p>';

      const updated = updateHtmlCrossReferences(html, figures, tables, 'en');
      expect(updated).toContain('Table 1</a>');
    });
  });

  describe('Shorthand Text Mentions Parsing (@fig & @tab)', () => {
    it('converts shorthand @fig:1 to interactive cross-reference anchor', () => {
      const { figures, tables } = extractScientificItems(sampleBlocks, 'id');
      const text = 'Sistem ini dijelaskan pada @fig:1 dalam naskah.';

      const parsed = replaceShorthandMentions(text, figures, tables, 'id');
      expect(parsed).toContain('data-target-id="block-img-1"');
      expect(parsed).toContain('Gambar 1</a>');
      expect(parsed).not.toContain('@fig:1');
    });

    it('converts shorthand @tab:1 and @tab:blockId correctly', () => {
      const { figures, tables } = extractScientificItems(sampleBlocks, 'en');
      const text = 'Data is aggregated in @tab:1 and verified in @tab:block-tab-1.';

      const parsed = replaceShorthandMentions(text, figures, tables, 'en');
      expect(parsed).toContain('data-target-id="block-tab-1"');
      expect(parsed).toContain('Table 1</a>');
    });

    it('ignores unknown shorthand mentions gracefully', () => {
      const { figures, tables } = extractScientificItems(sampleBlocks, 'en');
      const text = 'Contact @john_doe or see @fig:999.';

      const parsed = replaceShorthandMentions(text, figures, tables, 'en');
      expect(parsed).toContain('@john_doe');
      expect(parsed).toContain('@fig:999');
    });
  });

  describe('Full Document Re-indexing (reindexContentCrossReferences)', () => {
    it('re-indexes references across entire EditorJS content blocks', () => {
      const content = {
        blocks: [
          ...sampleBlocks,
          {
            id: 'block-eval',
            type: 'paragraph',
            data: {
              text: 'Visualized in @fig:1 and @tab:1.',
            },
          },
        ],
      };

      const { updatedContent, count } = reindexContentCrossReferences(content, 'en');
      expect(count).toBe(1);
      const evalText = updatedContent.blocks.find((b: any) => b.id === 'block-eval').data.text;
      expect(evalText).toContain('Figure 1</a>');
      expect(evalText).toContain('Table 1</a>');
    });
  });
});
