// lib/editor/cross-reference.ts
// Scientific Cross-Referencing & Auto-Numbering Engine for Figures & Tables (Phase 30)

export type ScientificItemType = 'figure' | 'table';

export interface ScientificItem {
  id: string;
  type: ScientificItemType;
  index: number;
  label: string;
  caption: string;
  blockId: string;
  thumbnailUrl?: string;
  previewSnippet?: string;
}

export interface CrossReferenceMention {
  targetId: string;
  type: ScientificItemType;
  currentLabel: string;
}

/**
 * Escapes characters for HTML attribute and content safety
 */
export function escapeCrossReferenceHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Extracts all figures and tables sequentially from an array of EditorJS blocks
 */
export function extractScientificItems(
  blocks: any[],
  language: 'en' | 'id' = 'id'
): { figures: ScientificItem[]; tables: ScientificItem[] } {
  const figures: ScientificItem[] = [];
  const tables: ScientificItem[] = [];

  if (!Array.isArray(blocks)) {
    return { figures, tables };
  }

  let figureCounter = 1;
  let tableCounter = 1;

  blocks.forEach((block, idx) => {
    if (!block || !block.type || !block.data) return;

    const blockId = block.id || `block-${idx}`;

    if (block.type === 'image') {
      const caption = (block.data.caption || '').trim();
      const label = language === 'en' ? `Figure ${figureCounter}` : `Gambar ${figureCounter}`;
      const url = block.data.file?.url || block.data.url || '';

      figures.push({
        id: blockId,
        type: 'figure',
        index: figureCounter,
        label,
        caption: caption || (language === 'en' ? 'Untitled Figure' : 'Gambar Tanpa Judul'),
        blockId,
        thumbnailUrl: url,
      });

      figureCounter++;
    } else if (block.type === 'table') {
      const caption = (block.data.caption || '').trim();
      const label = language === 'en' ? `Table ${tableCounter}` : `Tabel ${tableCounter}`;

      // Extract a short preview snippet from table headers or first cells
      let previewSnippet = '';
      if (Array.isArray(block.data.content) && block.data.content.length > 0) {
        const firstRow = block.data.content[0];
        if (Array.isArray(firstRow)) {
          previewSnippet = firstRow.map((c) => String(c).replace(/<[^>]+>/g, '').trim()).filter(Boolean).join(' | ');
        }
      }

      tables.push({
        id: blockId,
        type: 'table',
        index: tableCounter,
        label,
        caption: caption || previewSnippet || (language === 'en' ? 'Untitled Table' : 'Tabel Tanpa Judul'),
        blockId,
        previewSnippet,
      });

      tableCounter++;
    }
  });

  return { figures, tables };
}

/**
 * Generates an interactive cross-reference anchor markup
 */
export function createCrossReferenceMarkup(
  targetId: string,
  type: ScientificItemType,
  index: number,
  language: 'en' | 'id' = 'id',
  customText?: string
): string {
  const safeTargetId = escapeCrossReferenceHtml(targetId);
  const defaultLabel =
    type === 'figure'
      ? language === 'en' ? `Figure ${index}` : `Gambar ${index}`
      : language === 'en' ? `Table ${index}` : `Tabel ${index}`;

  const displayText = customText ? escapeCrossReferenceHtml(customText) : defaultLabel;
  const titleText = language === 'en' ? `Jump to ${defaultLabel}` : `Lompat ke ${defaultLabel}`;

  return `<a class="sf-cross-ref inline-flex items-center gap-0.5 font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline decoration-indigo-300 dark:decoration-indigo-600 underline-offset-2 cursor-pointer transition-colors" data-cross-ref="true" data-ref-type="${type}" data-target-id="${safeTargetId}" href="#${safeTargetId}" title="${titleText}">${displayText}</a>`;
}

/**
 * Re-indexes all existing in-text cross-reference anchors in HTML text
 * Updates labels like 'Gambar 1' -> 'Gambar 2' if the target image changed index
 */
export function updateHtmlCrossReferences(
  html: string,
  figures: ScientificItem[],
  tables: ScientificItem[],
  language: 'en' | 'id' = 'id'
): string {
  if (!html) return '';

  const figureMap = new Map<string, ScientificItem>();
  figures.forEach((f) => figureMap.set(f.id, f));

  const tableMap = new Map<string, ScientificItem>();
  tables.forEach((t) => tableMap.set(t.id, t));

  // Match: <a ... class="...sf-cross-ref..." ... data-ref-type="..." data-target-id="..." ...>...</a>
  const regex = /<a[^>]*class=["'][^"']*sf-cross-ref[^"']*["'][^>]*data-target-id=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;

  return html.replace(regex, (fullMatch, targetId, innerText) => {
    // Check if it's a figure or table
    const isFigure = fullMatch.includes('data-ref-type="figure"');
    const isTable = fullMatch.includes('data-ref-type="table"');

    let updatedItem: ScientificItem | undefined;
    if (isFigure) {
      updatedItem = figureMap.get(targetId);
    } else if (isTable) {
      updatedItem = tableMap.get(targetId);
    } else {
      updatedItem = figureMap.get(targetId) || tableMap.get(targetId);
    }

    if (!updatedItem) {
      // If target item is no longer found in document, return as is or preserve
      return fullMatch;
    }

    // Determine correct updated label
    const newLabel =
      updatedItem.type === 'figure'
        ? language === 'en' ? `Figure ${updatedItem.index}` : `Gambar ${updatedItem.index}`
        : language === 'en' ? `Table ${updatedItem.index}` : `Tabel ${updatedItem.index}`;

    // Reconstruct tag cleanly with updated label
    return createCrossReferenceMarkup(targetId, updatedItem.type, updatedItem.index, language, newLabel);
  });
}

/**
 * Parses and replaces in-text shorthand mentions like @fig:1 or @tab:1 or @fig:block-id
 */
export function replaceShorthandMentions(
  text: string,
  figures: ScientificItem[],
  tables: ScientificItem[],
  language: 'en' | 'id' = 'id'
): string {
  if (!text) return '';

  let result = text;

  // Replace @fig:X where X is index (1-based) or blockId
  result = result.replace(/@fig:([a-zA-Z0-9_-]+)/g, (match, param) => {
    const num = parseInt(param, 10);
    const item = !isNaN(num)
      ? figures.find((f) => f.index === num)
      : figures.find((f) => f.id === param);

    if (item) {
      return createCrossReferenceMarkup(item.id, 'figure', item.index, language);
    }
    return match;
  });

  // Replace @tab:X where X is index (1-based) or blockId
  result = result.replace(/@tab:([a-zA-Z0-9_-]+)/g, (match, param) => {
    const num = parseInt(param, 10);
    const item = !isNaN(num)
      ? tables.find((t) => t.index === num)
      : tables.find((t) => t.id === param);

    if (item) {
      return createCrossReferenceMarkup(item.id, 'table', item.index, language);
    }
    return match;
  });

  return result;
}

/**
 * Re-indexes in-text cross references across the entire EditorJS content blocks
 */
export function reindexContentCrossReferences(
  content: any,
  language: 'en' | 'id' = 'id'
): { updatedContent: any; count: number } {
  if (!content || !content.blocks || !Array.isArray(content.blocks)) {
    return { updatedContent: content, count: 0 };
  }

  const { figures, tables } = extractScientificItems(content.blocks, language);
  let count = 0;

  const updatedBlocks = content.blocks.map((block: any) => {
    if (!block || !block.data || typeof block.data.text !== 'string') {
      return block;
    }

    const originalText = block.data.text;
    let newText = updateHtmlCrossReferences(originalText, figures, tables, language);
    newText = replaceShorthandMentions(newText, figures, tables, language);

    if (newText !== originalText) {
      count++;
      return {
        ...block,
        data: {
          ...block.data,
          text: newText,
        },
      };
    }

    return block;
  });

  return {
    updatedContent: {
      ...content,
      blocks: updatedBlocks,
    },
    count,
  };
}
