// lib/editor/suggesting-engine.ts
// Core engine for Live "Track Changes" / Suggesting Mode in ScholarFlow

export interface SuggestionItem {
  id: string;
  documentId?: string;
  authorName: string;
  oldText: string;
  newText: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
  blockId?: string;
  blockIndex?: number;
}

/**
 * Escapes HTML entities in strings for safe insertion into DOM markup
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generates semantic inline diff markup for a text suggestion
 */
export function createSuggestionMarkup(
  id: string,
  oldText: string,
  newText: string,
  authorName: string = 'Reviewer'
): string {
  const safeId = escapeHtml(id);
  const safeAuthor = escapeHtml(authorName);
  const safeOld = escapeHtml(oldText);
  const safeNew = escapeHtml(newText);

  const delMarkup = oldText
    ? `<del class="sf-suggestion-del text-rose-600 bg-rose-50/80 dark:bg-rose-950/40 dark:text-rose-400 line-through rounded px-1 py-0.5 cursor-pointer selection:bg-rose-200" data-suggestion-id="${safeId}" data-author="${safeAuthor}" title="${safeAuthor}: Deleted &quot;${safeOld}&quot;">${safeOld}</del>`
    : '';

  const insMarkup = newText
    ? `<ins class="sf-suggestion-ins text-emerald-700 bg-emerald-50/80 dark:bg-emerald-950/40 dark:text-emerald-400 underline decoration-emerald-500 font-medium rounded px-1 py-0.5 ml-0.5 cursor-pointer selection:bg-emerald-200" data-suggestion-id="${safeId}" data-author="${safeAuthor}" title="${safeAuthor}: Suggested &quot;${safeNew}&quot;">${safeNew}</ins>`
    : '';

  return `<span class="sf-suggestion-wrapper inline-flex items-baseline flex-wrap gap-0.5 mx-0.5 rounded px-0.5 border border-dashed border-amber-300 dark:border-amber-700/60 bg-amber-50/30 dark:bg-amber-950/20" data-suggestion-id="${safeId}" data-author="${safeAuthor}">${delMarkup}${insMarkup}</span>`;
}

/**
 * Applies acceptance of a specific suggestion to an HTML string
 * Replaces <del>...</del> with nothing, and unwraps <ins>...</ins> to plain text
 */
export function applyAcceptSuggestionToHtml(html: string, suggestionId?: string): string {
  if (!html) return '';

  if (suggestionId) {
    // Escape suggestionId for regex safety
    const safeId = suggestionId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Remove wrappers matching this suggestion id:
    // First remove deleted text for this ID
    let result = html.replace(
      new RegExp(`<del[^>]*data-suggestion-id=["']${safeId}["'][^>]*>.*?</del>`, 'gi'),
      ''
    );
    // Unwrap inserted text for this ID
    result = result.replace(
      new RegExp(`<ins[^>]*data-suggestion-id=["']${safeId}["'][^>]*>(.*?)</ins>`, 'gi'),
      '$1'
    );
    // Strip wrapper for this ID
    result = result.replace(
      new RegExp(`<span[^>]*class=["'][^"']*sf-suggestion-wrapper[^"']*["'][^>]*data-suggestion-id=["']${safeId}["'][^>]*>(.*?)</span>`, 'gi'),
      '$1'
    );
    return result;
  }

  // Accept all suggestions in the HTML
  let result = html.replace(/<del[^>]*class=["'][^"']*sf-suggestion-del[^"']*["'][^>]*>.*?<\/del>/gi, '');
  result = result.replace(/<ins[^>]*class=["'][^"']*sf-suggestion-ins[^"']*["'][^>]*>(.*?)<\/ins>/gi, '$1');
  result = result.replace(/<del[^>]*>.*?<\/del>/gi, '');
  result = result.replace(/<ins[^>]*>(.*?)<\/ins>/gi, '$1');
  result = result.replace(/<span[^>]*class=["'][^"']*sf-suggestion-wrapper[^"']*["'][^>]*>(.*?)<\/span>/gi, '$1');
  return result;
}

/**
 * Applies rejection of a specific suggestion to an HTML string
 * Removes <ins>...</ins> completely, and unwraps <del>...</del> to restore original text
 */
export function applyRejectSuggestionToHtml(html: string, suggestionId?: string): string {
  if (!html) return '';

  if (suggestionId) {
    const safeId = suggestionId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Remove inserted text for this ID
    let result = html.replace(
      new RegExp(`<ins[^>]*data-suggestion-id=["']${safeId}["'][^>]*>.*?</ins>`, 'gi'),
      ''
    );
    // Unwrap deleted text to restore it for this ID
    result = result.replace(
      new RegExp(`<del[^>]*data-suggestion-id=["']${safeId}["'][^>]*>(.*?)</del>`, 'gi'),
      '$1'
    );
    // Strip wrapper for this ID
    result = result.replace(
      new RegExp(`<span[^>]*class=["'][^"']*sf-suggestion-wrapper[^"']*["'][^>]*data-suggestion-id=["']${safeId}["'][^>]*>(.*?)</span>`, 'gi'),
      '$1'
    );
    return result;
  }

  // Reject all suggestions in the HTML
  let result = html.replace(/<ins[^>]*class=["'][^"']*sf-suggestion-ins[^"']*["'][^>]*>.*?<\/ins>/gi, '');
  result = result.replace(/<del[^>]*class=["'][^"']*sf-suggestion-del[^"']*["'][^>]*>(.*?)<\/del>/gi, '$1');
  result = result.replace(/<ins[^>]*>.*?<\/ins>/gi, '');
  result = result.replace(/<del[^>]*>(.*?)<\/del>/gi, '$1');
  result = result.replace(/<span[^>]*class=["'][^"']*sf-suggestion-wrapper[^"']*["'][^>]*>(.*?)<\/span>/gi, '$1');
  return result;
}

/**
 * Extracts all embedded suggestion items from an HTML string or EditorJS blocks
 */
export function extractSuggestionsFromHtml(html: string, blockId?: string): SuggestionItem[] {
  if (!html) return [];

  const suggestions: SuggestionItem[] = [];
  const wrapperRegex = /<span[^>]*class=["'][^"']*sf-suggestion-wrapper[^"']*["'][^>]*data-suggestion-id=["']([^"']+)["'][^>]*>(.*?)<\/span>/gi;

  let match: RegExpExecArray | null;
  while ((match = wrapperRegex.exec(html)) !== null) {
    const id = match[1];
    const innerContent = match[2];

    const authorMatch = match[0].match(/data-author=["']([^"']+)["']/i);
    const authorName = authorMatch ? authorMatch[1] : 'Reviewer';

    let oldText = '';
    let newText = '';

    const delMatch = innerContent.match(/<del[^>]*>(.*?)<\/del>/i);
    if (delMatch) {
      oldText = delMatch[1].replace(/<[^>]+>/g, '').trim();
    }

    const insMatch = innerContent.match(/<ins[^>]*>(.*?)<\/ins>/i);
    if (insMatch) {
      newText = insMatch[1].replace(/<[^>]+>/g, '').trim();
    }

    suggestions.push({
      id,
      authorName,
      oldText,
      newText,
      createdAt: new Date().toISOString(),
      status: 'pending',
      blockId,
    });
  }

  return suggestions;
}

/**
 * Applies accept/reject operation across an EditorJS content structure
 */
export function transformEditorBlocksSuggestion(
  blocks: any[],
  action: 'accept' | 'reject' | 'accept_all' | 'reject_all',
  suggestionId?: string
): { updatedBlocks: any[]; affectedCount: number } {
  if (!Array.isArray(blocks)) {
    return { updatedBlocks: [], affectedCount: 0 };
  }

  let affectedCount = 0;

  const updatedBlocks = blocks.map((block) => {
    if (!block || !block.data || typeof block.data.text !== 'string') {
      return block;
    }

    const originalText = block.data.text;
    let transformedText = originalText;

    if (action === 'accept' && suggestionId) {
      transformedText = applyAcceptSuggestionToHtml(originalText, suggestionId);
    } else if (action === 'reject' && suggestionId) {
      transformedText = applyRejectSuggestionToHtml(originalText, suggestionId);
    } else if (action === 'accept_all') {
      transformedText = applyAcceptSuggestionToHtml(originalText);
    } else if (action === 'reject_all') {
      transformedText = applyRejectSuggestionToHtml(originalText);
    }

    if (transformedText !== originalText) {
      affectedCount++;
      return {
        ...block,
        data: {
          ...block.data,
          text: transformedText,
        },
      };
    }

    return block;
  });

  return { updatedBlocks, affectedCount };
}
