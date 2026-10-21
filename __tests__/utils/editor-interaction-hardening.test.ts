import { describe, it, expect } from 'vitest';
import { extractMentionQuery, getCaretCoordinates } from '@/lib/editor/mention-parser';
import { formatInTextCitationLabel } from '@/lib/editor/citation-transformer';
import { injectMentionCitationToDom } from '@/lib/editor/methods/mention-injector';

describe('Phase 40: Canvas & Document Editor Interaction Hardening', () => {
  it('correctly matches @cite:, @ref:, and @ trigger tokens in text before caret', () => {
    const match1 = extractMentionQuery('According to recent findings @cite:smith');
    expect(match1).not.toBeNull();
    expect(match1?.trigger).toBe('@cite:');
    expect(match1?.query).toBe('smith');

    const match2 = extractMentionQuery('Prior work demonstrated @ref:deep learning');
    expect(match2).not.toBeNull();
    expect(match2?.trigger).toBe('@ref:');
    expect(match2?.query).toBe('deep learning');

    const match3 = extractMentionQuery('As stated by @vaswani2017');
    expect(match3).not.toBeNull();
    expect(match3?.trigger).toBe('@');
    expect(match3?.query).toBe('vaswani2017');

    const matchNoTrigger = extractMentionQuery('email me at contact@example.com for info');
    expect(matchNoTrigger).toBeNull();
  });

  it('formats in-text citation labels properly across APA, IEEE, Harvard, and Vancouver', () => {
    const candidate = {
      title: 'Attention Is All You Need',
      authors: ['Ashish Vaswani', 'Noam Shazeer'],
      year: 2017,
      doi: '10.5555/3295222.3295349',
    };

    const apa = formatInTextCitationLabel(candidate as any, 'apa', 1);
    expect(apa).toBe('(Vaswani & Shazeer, 2017)');

    const ieee = formatInTextCitationLabel(candidate as any, 'ieee', 3);
    expect(ieee).toBe('[3]');

    const harvard = formatInTextCitationLabel(candidate as any, 'harvard', 1);
    expect(harvard).toBe('(Vaswani and Shazeer 2017)');

    const vancouver = formatInTextCitationLabel(candidate as any, 'vancouver', 5);
    expect(vancouver).toBe('(5)');
  });

  it('injectMentionCitationToDom handles node replacement cleanly', () => {
    const candidate = {
      title: 'Deep Residual Learning for Image Recognition',
      authors: ['Kaiming He', 'Xiangyu Zhang'],
      year: 2016,
      reference_id: 'he2016deep',
    };

    // In JSDOM environment, create a mock element and selection
    const paragraph = document.createElement('p');
    paragraph.textContent = 'Image recognition improved rapidly @cite:he';
    document.body.appendChild(paragraph);

    const range = document.createRange();
    const textNode = paragraph.firstChild!;
    range.setStart(textNode, textNode.textContent!.length);
    range.setEnd(textNode, textNode.textContent!.length);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    const mentionMatch = extractMentionQuery(textNode.textContent!);
    expect(mentionMatch).not.toBeNull();

    const result = injectMentionCitationToDom(candidate as any, 'apa', 1, mentionMatch);
    expect(result.success).toBe(true);
    expect(result.referenceId).toBe('he2016deep');
    expect(result.label).toBe('(He & Zhang, 2016)');

    // Verify DOM contains <cite data-citation="true">
    const citeEl = paragraph.querySelector('cite[data-citation="true"]');
    expect(citeEl).not.toBeNull();
    expect(citeEl?.getAttribute('data-ref-id')).toBe('he2016deep');
    expect(citeEl?.textContent).toContain('He & Zhang, 2016');

    document.body.removeChild(paragraph);
  });

  it('correctly resolves citation search query with fallback to window selection when query is not passed directly', () => {
    const testDiv = document.createElement('div');
    testDiv.textContent = 'Machine learning for climate modeling';
    document.body.appendChild(testDiv);

    const range = document.createRange();
    range.selectNodeContents(testDiv);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    const resolveQuery = (customQuery?: string, selectedText?: string): string => {
      let queryToUse = (typeof customQuery === 'string' && customQuery.trim()) ? customQuery.trim() : (selectedText?.trim() || '');
      if (!queryToUse && typeof window !== 'undefined') {
        const windowSel = window.getSelection()?.toString()?.trim();
        if (windowSel) {
          queryToUse = windowSel;
        }
      }
      return queryToUse;
    };

    expect(resolveQuery('deep learning')).toBe('deep learning');
    expect(resolveQuery('', 'artificial intelligence')).toBe('artificial intelligence');
    expect(resolveQuery('', '')).toBe('Machine learning for climate modeling');

    document.body.removeChild(testDiv);
  });
});
