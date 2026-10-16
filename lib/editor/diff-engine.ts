// lib/editor/diff-engine.ts
// ScholarFlow Visual Diff Engine for Document Version History (LCS Word-Level Diff)

export type DiffType = 'added' | 'removed' | 'unchanged';

export interface DiffChunk {
  type: DiffType;
  value: string;
}

export interface DiffStats {
  addedWords: number;
  removedWords: number;
  unchangedWords: number;
  totalWordsCurrent: number;
}

function stripAndCleanHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts clean, normalized plain text from EditorJS JSON blocks or raw string
 */
export function extractPlainTextFromEditorJs(content: any): string {
  if (!content) return '';
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      return extractPlainTextFromEditorJs(parsed);
    } catch {
      // It's raw text or HTML, strip tags
      return stripAndCleanHtml(content);
    }
  }

  if (Array.isArray(content.blocks)) {
    const paragraphs: string[] = [];
    for (const block of content.blocks) {
      if (!block || !block.data) continue;
      const data = block.data;

      if (typeof data.text === 'string') {
        const clean = stripAndCleanHtml(data.text);
        if (clean) paragraphs.push(clean);
      } else if (Array.isArray(data.items)) {
        // List block
        for (const item of data.items) {
          const itemText = typeof item === 'string' ? item : item?.content || '';
          const clean = stripAndCleanHtml(itemText);
          if (clean) paragraphs.push(`• ${clean}`);
        }
      } else if (typeof data.code === 'string') {
        paragraphs.push(data.code.trim());
      } else if (typeof data.caption === 'string' && data.caption.trim()) {
        paragraphs.push(data.caption.trim());
      }
    }
    return paragraphs.join('\n\n');
  }

  return '';
}

/**
 * Tokenize text into words preserving delimiters for accurate reconstruction
 */
function tokenizeWords(text: string): string[] {
  if (!text) return [];
  // Split on whitespace or punctuation boundaries, capturing tokens
  const tokens = text.match(/\S+|\s+/g);
  return tokens || [];
}

/**
 * Computes Longest Common Subsequence (LCS) table between two token arrays
 */
function computeLcsTable(oldTokens: string[], newTokens: string[]): number[][] {
  const m = oldTokens.length;
  const n = newTokens.length;

  // Use flat typed array or bounded 2D array
  // For huge documents (>2000 tokens), if length exceeds safety threshold, fallback to paragraph diff
  const maxDimension = 2500;
  if (m > maxDimension || n > maxDimension) {
    return [];
  }

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (oldTokens[i] === newTokens[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  return dp;
}

/**
 * Computes fine-grained word-by-word diff between oldText and newText
 */
export function computeWordDiff(oldText: string, newText: string): DiffChunk[] {
  const oldTokens = tokenizeWords(oldText);
  const newTokens = tokenizeWords(newText);

  if (oldTokens.length === 0 && newTokens.length === 0) {
    return [];
  }

  if (oldTokens.length === 0) {
    return [{ type: 'added', value: newText }];
  }

  if (newTokens.length === 0) {
    return [{ type: 'removed', value: oldText }];
  }

  const dp = computeLcsTable(oldTokens, newTokens);

  // If text is extraordinarily huge, fallback to fast chunk comparison
  if (dp.length === 0) {
    return [
      { type: 'removed', value: oldText },
      { type: 'added', value: newText }
    ];
  }

  // Backtrack LCS table to produce diff chunks
  let i = oldTokens.length;
  let j = newTokens.length;
  const rawChunks: DiffChunk[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldTokens[i - 1] === newTokens[j - 1]) {
      rawChunks.push({ type: 'unchanged', value: oldTokens[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawChunks.push({ type: 'added', value: newTokens[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      rawChunks.push({ type: 'removed', value: oldTokens[i - 1] });
      i--;
    }
  }

  rawChunks.reverse();

  // Merge consecutive chunks with the same type
  const mergedChunks: DiffChunk[] = [];
  for (const chunk of rawChunks) {
    if (mergedChunks.length > 0 && mergedChunks[mergedChunks.length - 1].type === chunk.type) {
      mergedChunks[mergedChunks.length - 1].value += chunk.value;
    } else {
      mergedChunks.push({ ...chunk });
    }
  }

  return mergedChunks;
}

/**
 * Calculates quantitative difference stats (added, removed, net words)
 */
export function calculateDiffStats(chunks: DiffChunk[]): DiffStats {
  let addedWords = 0;
  let removedWords = 0;
  let unchangedWords = 0;

  for (const chunk of chunks) {
    const wordCount = (chunk.value.match(/\S+/g) || []).length;
    if (chunk.type === 'added') {
      addedWords += wordCount;
    } else if (chunk.type === 'removed') {
      removedWords += wordCount;
    } else {
      unchangedWords += wordCount;
    }
  }

  return {
    addedWords,
    removedWords,
    unchangedWords,
    totalWordsCurrent: unchangedWords + addedWords,
  };
}

/**
 * Formats a timestamp into human-readable relative duration
 */
export function formatRelativeTime(dateInput: string | Date, language: 'en' | 'id' = 'en'): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const isEn = language === 'en';

  if (diffInSeconds < 30) {
    return isEn ? 'Just now' : 'Baru saja';
  }
  if (diffInSeconds < 60) {
    return isEn ? `${diffInSeconds}s ago` : `${diffInSeconds} dtk lalu`;
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return isEn ? `${diffInMinutes}m ago` : `${diffInMinutes} mnt lalu`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return isEn ? `${diffInHours}h ago` : `${diffInHours} jam lalu`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return isEn ? 'Yesterday' : 'Kemarin';
  }
  if (diffInDays < 7) {
    return isEn ? `${diffInDays}d ago` : `${diffInDays} hari lalu`;
  }

  return date.toLocaleDateString(isEn ? 'en-US' : 'id-ID', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit',
  });
}
