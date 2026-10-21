import React from 'react';


export function isBibliographyHeaderText(text?: string | null): boolean {
  if (!text) return false;
  const t = text.trim().toLowerCase();
  return (
    t === 'daftar pustaka' ||
    t === 'references' ||
    t === 'daftar pustaka / references' ||
    t === 'daftar pustaka/references' ||
    t === 'references / daftar pustaka' ||
    t === 'daftar pustaka & references' ||
    t === 'daftar referensi' ||
    t === 'bibliografi' ||
    t === 'bibliography'
  );
}

export interface ExtractTextOptions {
  excludeHeaders?: boolean;
}

export function cleanBlockHtmlText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\u00A0/g, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+/g, ' ')
    .trim();
}

export function extractTextFromContent(content: any, options?: ExtractTextOptions): string {
  if (!content || !content.blocks || !Array.isArray(content.blocks)) return '';
  const texts: string[] = [];
  let inBibliography = false;

  for (const block of content.blocks) {
    if (block.type === 'header') {
      if (options?.excludeHeaders) {
        continue; // Exclude headings (Bab, sub-bab) from body sentence analysis
      }
      const txt = block.data?.text;
      const clean = cleanBlockHtmlText(txt);
      if (isBibliographyHeaderText(clean)) {
        inBibliography = true;
        continue; // Exclude bibliography header from text analysis
      }
      if (inBibliography) {
        // If a new standard section appears, reset flag
        inBibliography = false;
      }
      if (clean) texts.push(clean);
    } else if (block.type === 'paragraph') {
      const txt = block.data?.text;
      if (txt) {
        if (
          inBibliography ||
          txt.includes('sf-bibliography-blur') ||
          txt.includes('sf-bibliography-fade-container') ||
          txt.includes('sf-premium-banner-container') ||
          txt.includes('References are a paid feature')
        ) {
          continue; // Exclude bibliography content and upgrade cards from text analysis
        }
        const clean = cleanBlockHtmlText(txt);
        if (clean) texts.push(clean);
      }
    } else if (block.type === 'list') {
      if (inBibliography) continue;
      const items = block.data?.items;
      if (items && Array.isArray(items)) {
        for (const item of items) {
          const rawItem = typeof item === 'string' ? item : item?.content || '';
          const cleanItem = cleanBlockHtmlText(rawItem);
          if (cleanItem) texts.push(cleanItem);
        }
      }
    }
  }
  return texts.join('\n\n');
}

export function countWords(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

export function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function findMostRelevantSentence(abstract: string | null | undefined, query: string): string {
  if (!abstract) return "Abstrak tidak tersedia.";
  
  // Pre-process abstract to add spaces after periods if missing (e.g. "konvensional.Sistem" -> "konvensional. Sistem")
  const cleanedAbstract = abstract.replace(/(?<=[.!?])(?=[A-Za-z])/g, " ");
  
  const sentences = cleanedAbstract.split(/(?<=[.!?])\s+/);
  if (sentences.length <= 1) return cleanedAbstract;
  const queryWords = new Set(query.toLowerCase().match(/[a-z0-9]+/g) ?? []);
  if (queryWords.size === 0) return sentences[0];
  let bestSentence = sentences[0];
  let maxOverlap = -1;
  for (const sentence of sentences) {
    const sentenceWords = new Set(sentence.toLowerCase().match(/[a-z0-9]+/g) ?? []);
    let overlap = 0;
    for (const word of sentenceWords) {
      if (queryWords.has(word)) overlap++;
    }
    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      bestSentence = sentence;
    }
  }
  return bestSentence;
}

export function HighlightedAbstract({ abstract, query }: { abstract: string | null | undefined; query: string }) {
  if (!abstract) return <p className="text-slate-400 italic text-xs">Abstrak tidak tersedia.</p>;
  
  // Pre-process abstract to add spaces after periods if missing
  const cleanedAbstract = abstract.replace(/(?<=[.!?])(?=[A-Za-z])/g, " ");
  
  const sentences = cleanedAbstract.split(/(?<=[.!?])\s+/);
  if (sentences.length <= 1) {
    return <p className="text-slate-600 leading-relaxed text-xs">{cleanedAbstract}</p>;
  }
  const queryWords = new Set(query.toLowerCase().match(/[a-z0-9]+/g) ?? []);
  let bestIndex = 0;
  let maxOverlap = -1;
  sentences.forEach((sentence, idx) => {
    const sentenceWords = new Set(sentence.toLowerCase().match(/[a-z0-9]+/g) ?? []);
    let overlap = 0;
    for (const word of sentenceWords) {
      if (queryWords.has(word)) overlap++;
    }
    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      bestIndex = idx;
    }
  });
  return (
    <p className="text-slate-600 leading-relaxed text-xs">
      {sentences.map((sentence, idx) => {
        if (idx === bestIndex) {
          return (
            <mark key={idx} className="bg-indigo-50 text-indigo-950 font-semibold px-1 rounded border-b border-indigo-200">
              {sentence}{' '}
            </mark>
          );
        }
        return <span key={idx}>{sentence} </span>;
      })}
    </p>
  );
}

export function findMostUniqueWord(sentence: string): string {
  if (!sentence) return "";
  const words = sentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'\[\]]/g, " ").split(/\s+/);
  const stopwords = new Set([
    'dan', 'di', 'yang', 'untuk', 'dengan', 'itu', 'ini', 'dalam', 'pada', 'dari', 'ke', 'sebagai', 'adalah',
    'oleh', 'atau', 'telah', 'bisa', 'dapat', 'akan', 'juga', 'ada', 'mereka', 'ia', 'kita', 'kami', 'saya',
    'kamu', 'dia', 'namun', 'tetapi', 'karena', 'sehingga', 'maka', 'jika', 'serta', 'seperti',
    'tersebut', 'secara', 'sebesar', 'sistem', 'metode', 'aplikasi', 'penelitian', 'peneliti', 'hasil', 'pada',
    'the', 'and', 'of', 'in', 'to', 'for', 'with', 'on', 'at', 'by', 'an', 'be', 'this', 'that', 'from', 'it', 'is', 'was', 'were', 'are', 'as'
  ]);
  let bestWord = "";
  let maxScore = -1;
  for (const word of words) {
    const cleanWord = word.trim();
    if (!cleanWord || stopwords.has(cleanWord.toLowerCase())) continue;
    let score = cleanWord.length;
    if (/[vxzyqp]/i.test(cleanWord)) score += 2;
    if (/[A-Z]/.test(cleanWord)) score += 1;
    if (/\d/.test(cleanWord)) score += 1;
    if (score > maxScore) {
      maxScore = score;
      bestWord = cleanWord;
    }
  }
  return bestWord || words[0] || "";
}

function normalizeBlockDataForComparison(data: any): any {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data.map(normalizeBlockDataForComparison);
  }
  const normalized: Record<string, any> = {};
  for (const key of Object.keys(data).sort()) {
    const val = data[key];
    if (typeof val === 'string') {
      normalized[key] = val.replace(/&nbsp;/gi, ' ').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
    } else if (typeof val === 'object' && val !== null) {
      normalized[key] = normalizeBlockDataForComparison(val);
    } else {
      normalized[key] = val;
    }
  }
  return normalized;
}

export const getContentComparisonString = (content: any): string => {
  if (!content) return JSON.stringify([]);
  let parsed = content;
  if (typeof content === 'string') {
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      return content.trim();
    }
  }
  if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
    const comparableBlocks = parsed.blocks.map((b: any) => ({
      type: b?.type || '',
      data: normalizeBlockDataForComparison(b?.data)
    }));
    return JSON.stringify(comparableBlocks);
  }
  return JSON.stringify(parsed);
};

/**
 * Safely calculates character offset of current caret within a contentEditable element.
 */
export function getCaretCharacterOffsetWithin(element: Node): number {
  if (typeof window === 'undefined') return 0;
  let caretOffset = 0;
  const doc = element.ownerDocument || document;
  const win = doc.defaultView || window;
  const sel = win.getSelection();
  if (sel && sel.rangeCount > 0) {
    try {
      const range = sel.getRangeAt(0);
      if (element.contains(range.commonAncestorContainer)) {
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
      }
    } catch (e) {
      // safe fallback
    }
  }
  return caretOffset;
}

/**
 * Safely restores caret to the exact character offset inside a contentEditable element.
 */
export function setCaretCharacterOffsetWithin(element: Node, offset: number) {
  if (typeof window === 'undefined') return;
  const doc = element.ownerDocument || document;
  const win = doc.defaultView || window;
  const sel = win.getSelection();
  if (!sel) return;

  try {
    let currentOffset = 0;
    const range = doc.createRange();
    range.setStart(element, 0);
    range.collapse(true);

    const nodeStack: Node[] = [element];
    let node: Node | undefined;
    let found = false;

    while (!found && (node = nodeStack.pop())) {
      if (node.nodeType === Node.TEXT_NODE) {
        const nextOffset = currentOffset + (node.nodeValue?.length || 0);
        if (offset >= currentOffset && offset <= nextOffset) {
          range.setStart(node, Math.max(0, offset - currentOffset));
          range.collapse(true);
          found = true;
          break;
        }
        currentOffset = nextOffset;
      } else {
        let i = node.childNodes.length;
        while (i--) {
          nodeStack.push(node.childNodes[i]);
        }
      }
    }

    if (found) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  } catch (e) {
    // safe fallback
  }
}


