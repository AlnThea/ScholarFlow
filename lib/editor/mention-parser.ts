// lib/editor/mention-parser.ts
// Phase 32: Smart In-Text Reference Mention Detection & Caret Parser Engine

export interface MentionMatchResult {
  match: boolean;
  trigger: '@cite:' | '@ref:' | '@cite' | '@ref' | '@';
  query: string;
  fullMatch: string;
  startIndex: number;
  endIndex: number;
}

export interface CaretCoordinates {
  top: number;
  left: number;
  bottom: number;
  height: number;
}

/**
 * Regex to detect mention triggers at or right before the cursor:
 * - @cite:keyword or @ref:keyword
 * - @cite or @ref (trailing space or prompt)
 * - @keyword (general mention, at least 2 chars or space)
 */
const MENTION_REGEX = /(?:^|\s)(@cite:|@ref:|@cite\b|@ref\b|@)([a-zA-Z0-9_\-\s]{0,35})$/;

/**
 * Extracts mention query string and trigger type from text immediately preceding the caret
 */
export function extractMentionQuery(textBeforeCaret: string): MentionMatchResult | null {
  if (!textBeforeCaret || typeof textBeforeCaret !== 'string') {
    return null;
  }

  // Look only at the last 80 characters before caret to keep performance O(1)
  const windowText = textBeforeCaret.slice(-80);
  const match = MENTION_REGEX.exec(windowText);

  if (!match) {
    return null;
  }

  const rawTrigger = match[1] as '@cite:' | '@ref:' | '@cite' | '@ref' | '@';
  const query = (match[2] || '').trim();
  const fullMatch = match[0].trim();
  const matchIndexInWindow = match.index + (match[0].length - fullMatch.length);
  const globalStartIndex = (textBeforeCaret.length - windowText.length) + matchIndexInWindow;
  const globalEndIndex = textBeforeCaret.length;

  return {
    match: true,
    trigger: rawTrigger,
    query,
    fullMatch,
    startIndex: globalStartIndex,
    endIndex: globalEndIndex
  };
}

/**
 * Calculates screen pixel coordinates of the active caret
 */
export function getCaretCoordinates(): CaretCoordinates | null {
  if (typeof window === 'undefined') return null;

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0).cloneRange();
  range.collapse(true);

  let rect = range.getBoundingClientRect();

  // If bounding rect is zero (e.g. empty line or pseudo-element), try fallback span
  if (rect.width === 0 && rect.height === 0 && rect.top === 0 && rect.left === 0) {
    const dummy = document.createElement('span');
    dummy.appendChild(document.createTextNode('\u200b')); // Zero-width space
    range.insertNode(dummy);
    rect = dummy.getBoundingClientRect();
    const parent = dummy.parentNode;
    if (parent) {
      parent.removeChild(dummy);
      parent.normalize();
    }
  }

  if (rect.top === 0 && rect.left === 0 && rect.bottom === 0) {
    return null;
  }

  return {
    top: rect.top,
    left: rect.left,
    bottom: rect.bottom,
    height: rect.height || 20
  };
}
