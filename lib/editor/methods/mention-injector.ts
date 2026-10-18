// lib/editor/methods/mention-injector.ts
// Phase 32: Non-Destructive In-Text Citation Injector Engine

import type { CitationCandidate } from '@/lib/api/citations';
import { formatInTextCitationLabel } from '@/lib/editor/citation-transformer';
import type { MentionMatchResult } from '@/lib/editor/mention-parser';

export interface MentionInjectionResult {
  success: boolean;
  insertedElement: HTMLElement | null;
  label: string;
  referenceId: string;
}

/**
 * Injects a citation node directly into the active DOM selection, replacing the mention text
 */
export function injectMentionCitationToDom(
  candidate: CitationCandidate,
  targetStyle: string,
  numericIndex: number,
  mentionMatch?: MentionMatchResult | null
): MentionInjectionResult {
  if (typeof window === 'undefined') {
    return { success: false, insertedElement: null, label: '', referenceId: '' };
  }

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return { success: false, insertedElement: null, label: '', referenceId: '' };
  }

  const range = selection.getRangeAt(0);
  const container = range.startContainer;

  const label = formatInTextCitationLabel(candidate, targetStyle, numericIndex);
  const refId = candidate.reference_id || candidate.doi || `ref-${Date.now()}`;

  // Create cite element
  const cite = document.createElement('cite');
  cite.setAttribute('data-citation', 'true');
  cite.setAttribute('data-ref-id', refId);
  cite.setAttribute('data-label', label);
  cite.className = 'text-indigo-600 dark:text-indigo-400 font-semibold not-italic cursor-pointer hover:underline mx-0.5';
  cite.textContent = label.startsWith('[') || label.startsWith('(') ? label : ` [${label}]`;

  try {
    // If we have a text node and mention match, replace the typed mention text cleanly
    if (container.nodeType === Node.TEXT_NODE && mentionMatch && mentionMatch.fullMatch) {
      const text = container.textContent || '';
      const caretOffset = range.startOffset;
      const textBefore = text.slice(0, caretOffset);
      const matchIndex = textBefore.lastIndexOf(mentionMatch.fullMatch);

      if (matchIndex !== -1) {
        const replaceRange = document.createRange();
        replaceRange.setStart(container, matchIndex);
        replaceRange.setEnd(container, matchIndex + mentionMatch.fullMatch.length);
        replaceRange.deleteContents();
        replaceRange.insertNode(cite);

        // Position caret right after cite
        const newRange = document.createRange();
        newRange.setStartAfter(cite);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);

        // Trigger input event for EditorJS
        cite.dispatchEvent(new Event('input', { bubbles: true }));

        return {
          success: true,
          insertedElement: cite,
          label,
          referenceId: refId
        };
      }
    }

    // Fallback: normal range insertion
    range.deleteContents();
    range.insertNode(cite);

    const newRange = document.createRange();
    newRange.setStartAfter(cite);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);

    cite.dispatchEvent(new Event('input', { bubbles: true }));

    return {
      success: true,
      insertedElement: cite,
      label,
      referenceId: refId
    };
  } catch (err) {
    console.error('[injectMentionCitationToDom Error]:', err);
    return { success: false, insertedElement: null, label: '', referenceId: '' };
  }
}
