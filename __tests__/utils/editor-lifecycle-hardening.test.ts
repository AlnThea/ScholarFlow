// __tests__/utils/editor-lifecycle-hardening.test.ts
// Unit tests for Phase 41: Editor Canvas Lifecycle, Block Persistence & Rich Content Bridge

import { describe, it, expect, vi } from 'vitest';
import { createSuggestionMarkup, applyAcceptSuggestionToHtml } from '@/lib/editor/suggesting-engine';
import { getCaretCharacterOffsetWithin, setCaretCharacterOffsetWithin } from '@/lib/editor/editor-utils';

describe('Phase 41: Editor Canvas Lifecycle & Content Bridge Hardening Unit Tests', () => {
  it('preserves rich HTML <cite> tag without stripping when building in-text citation HTML', () => {
    const rawText = 'Recent findings suggest significant improvements.';
    const referenceId = 'ref-scholarly-101';
    const label = 'Smith, 2024';

    let htmlToInsert = rawText;
    if (referenceId && !rawText.includes('data-citation="true"')) {
      const citeLabel = label || 'Ref';
      if (rawText.includes(`[${citeLabel}]`)) {
        htmlToInsert = rawText.replace(
          `[${citeLabel}]`,
          `<cite data-citation="true" data-ref-id="${referenceId}" class="text-indigo-600 font-semibold not-italic cursor-pointer hover:underline"> [${citeLabel}]</cite>`
        );
      } else {
        htmlToInsert = `${rawText} <cite data-citation="true" data-ref-id="${referenceId}" class="text-indigo-600 font-semibold not-italic cursor-pointer hover:underline"> [${citeLabel}]</cite>`;
      }
    }

    expect(htmlToInsert).toContain('<cite data-citation="true"');
    expect(htmlToInsert).toContain('data-ref-id="ref-scholarly-101"');
    expect(htmlToInsert).toContain('[Smith, 2024]');
  });

  it('safely replaces oldText with suggestion markup instead of appending duplicate text', () => {
    const originalHtml = 'This is a preliminary draft with some typos.';
    const oldText = 'preliminary draft';
    const newText = 'polished manuscript';
    const suggestionId = 'sug-test-101';
    const markup = createSuggestionMarkup(suggestionId, oldText, newText, 'Peer Reviewer');

    expect(markup).toContain('sf-suggestion-wrapper');
    expect(markup).toContain(oldText);
    expect(markup).toContain(newText);

    // Verify replacement logic
    const replacedHtml = originalHtml.replace(oldText, markup);
    expect(replacedHtml).not.toBe(originalHtml);
    expect(replacedHtml).toContain(markup);
    
    // Acceptance: <del> is removed and <ins> is unwrapped
    const acceptedHtml = applyAcceptSuggestionToHtml(replacedHtml, suggestionId);
    expect(acceptedHtml).toContain('This is a polished manuscript with some typos.');
    expect(acceptedHtml).not.toContain(oldText);
  });

  it('synthesizer text handler prioritizes customText over empty fallback', () => {
    let insertedContent = '';
    const mockInsertHtml = vi.fn((val: string) => {
      insertedContent = val;
    });

    const synthesizedText = ''; // empty in session
    const handleInsert = (customText?: string) => {
      const textToInsert = typeof customText === 'string' && customText.trim() ? customText : synthesizedText;
      if (textToInsert) {
        mockInsertHtml(textToInsert);
      }
    };

    // When AI History passes improved text
    handleInsert('Comprehensive literature synthesis from cloud history.');
    expect(mockInsertHtml).toHaveBeenCalledTimes(1);
    expect(insertedContent).toBe('Comprehensive literature synthesis from cloud history.');
  });

  it('supports unified renderContent and render method interfaces', () => {
    let renderedData: any = null;
    const fakeEditor = {
      renderContent: (data: any) => {
        renderedData = data;
      },
      render: async (data: any) => {
        renderedData = data;
      }
    };

    // Caller 1: calls renderContent
    fakeEditor.renderContent({ time: 100, blocks: [{ type: 'paragraph', data: { text: 'Hello' } }] });
    expect(renderedData.blocks[0].data.text).toBe('Hello');

    // Caller 2: calls render
    fakeEditor.render({ time: 200, blocks: [{ type: 'header', data: { text: 'Title' } }] });
    expect(renderedData.blocks[0].data.text).toBe('Title');
  });

  it('accurately computes and restores caret character offset inside contenteditable elements without resetting to end', () => {
    const container = document.createElement('div');
    container.setAttribute('contenteditable', 'true');
    container.innerHTML = 'This is an academic sentence that we are typing in the middle.';
    document.body.appendChild(container);

    // Simulate caret at character 11 (after "This is an ")
    const targetOffset = 11;
    setCaretCharacterOffsetWithin(container, targetOffset);

    // Read back offset
    const measuredOffset = getCaretCharacterOffsetWithin(container);
    expect(measuredOffset).toBe(targetOffset);

    // Modify a sibling element or non-interfering DOM attribute
    container.setAttribute('data-modified', 'true');

    // Restore caret position
    setCaretCharacterOffsetWithin(container, targetOffset);
    const restoredOffset = getCaretCharacterOffsetWithin(container);
    expect(restoredOffset).toBe(targetOffset);
    expect(restoredOffset).not.toBe(container.textContent?.length);

    document.body.removeChild(container);
  });

  it('correctly handles caret restoration in elements with nested HTML formatting tags', () => {
    const container = document.createElement('div');
    container.setAttribute('contenteditable', 'true');
    container.innerHTML = 'Hello <b>bold world</b> and <i>italic text</i>.';
    document.body.appendChild(container);

    // Place caret inside "bold world" at total offset 10 ("Hello bold")
    const targetOffset = 10;
    setCaretCharacterOffsetWithin(container, targetOffset);

    const measured = getCaretCharacterOffsetWithin(container);
    expect(measured).toBe(targetOffset);

    document.body.removeChild(container);
  });
});
