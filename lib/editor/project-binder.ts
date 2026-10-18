// lib/editor/project-binder.ts
// ScholarFlow Multi-Chapter Thesis & Dissertation Project Binder Engine

export interface ProjectChapter {
  id: string;
  title: string;
  chapterNumber: number;
  chapterLabel: string;
  content: string;
  wordCount: number;
  characterCount: number;
  updatedAt: string;
  settings?: any;
}

export interface BinderFigureTable {
  id: string;
  type: 'figure' | 'table';
  chapterNumber: number;
  indexInChapter: number;
  formattedLabel: string;
  caption: string;
  documentId: string;
}

export interface MasterBibliographyItem {
  key: string;
  title: string;
  authors: string[];
  year: string;
  journal?: string;
  doi?: string;
  usedInChapters: number[];
  formattedCitation: string;
}

export interface ProjectBinderSummary {
  projectId: string;
  projectName: string;
  projectType: string;
  totalChapters: number;
  totalWords: number;
  totalCharacters: number;
  totalFigures: number;
  totalTables: number;
  totalUniqueCitations: number;
  estimatedReadTimeMinutes: number;
}

/**
 * Extracts a numeric chapter index from string titles like "Bab 1: Pendahuluan", "Chapter 2", "1. Latar Belakang".
 */
export function parseChapterNumber(titleOrPart: string, fallbackIndex: number = 1): number {
  if (!titleOrPart) return fallbackIndex;
  const match = titleOrPart.match(/(?:bab|chapter|bagian)\s*([0-9]+)/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  const leadingNumMatch = titleOrPart.match(/^([0-9]+)[\.\s]/);
  if (leadingNumMatch && leadingNumMatch[1]) {
    return parseInt(leadingNumMatch[1], 10);
  }
  return fallbackIndex;
}

/**
 * Normalizes text content for accurate word count.
 */
export function countWordsFromContent(rawContent: string): { words: number; chars: number } {
  if (!rawContent) return { words: 0, chars: 0 };
  let text = rawContent;
  try {
    if (rawContent.trim().startsWith('{')) {
      const parsed = JSON.parse(rawContent);
      if (Array.isArray(parsed.blocks)) {
        text = parsed.blocks.map((b: any) => b.data?.text || b.data?.caption || '').join(' ');
      }
    }
  } catch {
    // Treat as plain text or HTML
  }

  const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
  return { words, chars: cleanText.length };
}

/**
 * Groups and sorts documents that belong to a single project binder.
 */
export function extractProjectChapters(documents: any[], projectId: string): ProjectChapter[] {
  if (!documents || !projectId) return [];

  const matched = documents.filter((doc) => {
    const s = doc.settings;
    return s?.projectId === projectId || doc.projectId === projectId;
  });

  const chapters: ProjectChapter[] = matched.map((doc, idx) => {
    const s = doc.settings || {};
    const partName = s.projectPart || doc.title || `Chapter ${idx + 1}`;
    const chapterNum = typeof s.chapterOrder === 'number' && s.chapterOrder > 0
      ? s.chapterOrder
      : parseChapterNumber(partName, idx + 1);
    
    const { words, chars } = countWordsFromContent(doc.content);

    return {
      id: doc.id,
      title: doc.title || partName,
      chapterNumber: chapterNum,
      chapterLabel: partName,
      content: doc.content || '',
      wordCount: words,
      characterCount: chars,
      updatedAt: doc.updatedAt || doc.updated_at || new Date().toISOString(),
      settings: s
    };
  });

  // Sort sequentially by chapter number
  return chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
}

/**
 * Calculates project binder summary statistics.
 */
export function calculateProjectSummary(
  projectId: string,
  projectName: string,
  projectType: string,
  chapters: ProjectChapter[]
): ProjectBinderSummary {
  let totalWords = 0;
  let totalChars = 0;

  chapters.forEach((ch) => {
    totalWords += ch.wordCount;
    totalChars += ch.characterCount;
  });

  const figuresAndTables = extractCrossChapterFiguresAndTables(chapters);
  const totalFigures = figuresAndTables.filter((item) => item.type === 'figure').length;
  const totalTables = figuresAndTables.filter((item) => item.type === 'table').length;
  const masterBib = consolidateMasterBibliography(chapters);

  return {
    projectId,
    projectName,
    projectType,
    totalChapters: chapters.length,
    totalWords,
    totalCharacters: totalChars,
    totalFigures,
    totalTables,
    totalUniqueCitations: masterBib.length,
    estimatedReadTimeMinutes: Math.max(1, Math.ceil(totalWords / 150))
  };
}

/**
 * Extracts and sequentializes figures and tables across all project chapters with chapter-prefixed numbering.
 * Example: "Gambar 1.1: Kerangka Konseptual" (Chapter 1) -> "Gambar 2.1: Desain Arsitektur" (Chapter 2).
 */
export function extractCrossChapterFiguresAndTables(
  chapters: ProjectChapter[],
  language: string = 'id'
): BinderFigureTable[] {
  const result: BinderFigureTable[] = [];
  const isEn = language === 'en';

  chapters.forEach((chapter) => {
    let figureIndexInChapter = 0;
    let tableIndexInChapter = 0;

    let blocks: any[] = [];
    try {
      if (chapter.content && chapter.content.trim().startsWith('{')) {
        const parsed = JSON.parse(chapter.content);
        if (Array.isArray(parsed.blocks)) {
          blocks = parsed.blocks;
        }
      }
    } catch {
      blocks = [];
    }

    blocks.forEach((block: any, idx: number) => {
      const type = block.type;
      const data = block.data || {};

      if (type === 'image') {
        figureIndexInChapter += 1;
        const caption = (data.caption || '').replace(/<[^>]+>/g, '').trim() || (isEn ? `Figure description` : `Deskripsi gambar`);
        const formattedLabel = isEn
          ? `Figure ${chapter.chapterNumber}.${figureIndexInChapter}`
          : `Gambar ${chapter.chapterNumber}.${figureIndexInChapter}`;

        result.push({
          id: block.id || `${chapter.id}-fig-${idx}`,
          type: 'figure',
          chapterNumber: chapter.chapterNumber,
          indexInChapter: figureIndexInChapter,
          formattedLabel,
          caption,
          documentId: chapter.id
        });
      } else if (type === 'table') {
        tableIndexInChapter += 1;
        const caption = (data.caption || '').replace(/<[^>]+>/g, '').trim() || (isEn ? `Table data` : `Data tabel`);
        const formattedLabel = isEn
          ? `Table ${chapter.chapterNumber}.${tableIndexInChapter}`
          : `Tabel ${chapter.chapterNumber}.${tableIndexInChapter}`;

        result.push({
          id: block.id || `${chapter.id}-tab-${idx}`,
          type: 'table',
          chapterNumber: chapter.chapterNumber,
          indexInChapter: tableIndexInChapter,
          formattedLabel,
          caption,
          documentId: chapter.id
        });
      }
    });
  });

  return result;
}

/**
 * Scans `<cite>` tags and metadata across all project chapters, deduplicating references
 * into a single unified Master Bibliography.
 */
export function consolidateMasterBibliography(
  chapters: ProjectChapter[],
  style: string = 'apa'
): MasterBibliographyItem[] {
  const map: Record<string, MasterBibliographyItem> = {};

  chapters.forEach((chapter) => {
    const citeRegex = /<cite\b([^>]*)>([\s\S]*?)<\/cite>/gi;
    let match: RegExpExecArray | null;

    while ((match = citeRegex.exec(chapter.content)) !== null) {
      const attrsStr = match[1] || '';
      const labelText = match[2]?.trim() || '';

      const getAttr = (name: string): string => {
        const m = attrsStr.match(new RegExp(`${name}=(?:\\\\?"|&quot;|")(.*?)(?:\\\\?"|&quot;|")`, 'i'));
        return m ? m[1].replace(/\\"/g, '"') : '';
      };

      const refId = getAttr('data-reference-id') || getAttr('data-doi') || labelText;
      const title = getAttr('data-title') || labelText || 'Untitled Reference';
      const authorsRaw = getAttr('data-author') || getAttr('data-authors') || '';
      const year = getAttr('data-year') || '2023';
      const journal = getAttr('data-journal') || '';
      const doi = getAttr('data-doi') || '';

      const authors = authorsRaw
        ? authorsRaw.split(/[,;&]/).map((a) => a.trim()).filter(Boolean)
        : ['Unknown Author'];

      // Generate a deduplication key
      const cleanDoi = doi.toLowerCase().trim();
      const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
      const key = cleanDoi || cleanTitle || refId;

      if (!map[key]) {
        map[key] = {
          key,
          title,
          authors: authors.length > 0 ? authors : ['Peneliti'],
          year,
          journal,
          doi,
          usedInChapters: [chapter.chapterNumber],
          formattedCitation: labelText
        };
      } else {
        if (!map[key].usedInChapters.includes(chapter.chapterNumber)) {
          map[key].usedInChapters.push(chapter.chapterNumber);
          map[key].usedInChapters.sort((a, b) => a - b);
        }
      }
    }
  });

  const list = Object.values(map);

  // Sort based on citation style: APA/Harvard alphabetical, IEEE/Numeric by appearance
  if (style === 'ieee' || style === 'vancouver') {
    return list; // appearance order
  }

  return list.sort((a, b) => {
    const firstA = (a.authors[0] || '').toLowerCase();
    const firstB = (b.authors[0] || '').toLowerCase();
    if (firstA !== firstB) return firstA.localeCompare(firstB);
    return (a.year || '').localeCompare(b.year || '');
  });
}

/**
 * Compiles all chapters into a unified array of EditorJS blocks.
 */
export function compileBinderToUnifiedBlocks(
  chapters: ProjectChapter[],
  options: { includeCover?: boolean; projectName?: string; language?: string } = {}
): any[] {
  const blocks: any[] = [];
  const isEn = options.language === 'en';
  const projName = options.projectName || (isEn ? 'Academic Thesis' : 'Skripsi / Tesis');

  if (options.includeCover) {
    blocks.push({
      id: 'binder-cover-title',
      type: 'header',
      data: {
        text: projName.toUpperCase(),
        level: 1
      }
    });
    blocks.push({
      id: 'binder-cover-desc',
      type: 'paragraph',
      data: {
        text: isEn
          ? `<em>Master Compilation of Multi-Chapter Academic Research Manuscript.</em>`
          : `<em>Kompilasi Naskah Lengkap Penelitian Akademik Multi-Bab.</em>`
      }
    });
    blocks.push({
      id: 'binder-cover-sep',
      type: 'delimiter',
      data: {}
    });
  }

  chapters.forEach((ch, idx) => {
    // Chapter Title Heading
    blocks.push({
      id: `binder-chapter-heading-${ch.id}`,
      type: 'header',
      data: {
        text: ch.chapterLabel || `${isEn ? 'Chapter' : 'Bab'} ${ch.chapterNumber}: ${ch.title}`,
        level: 2
      }
    });

    let chapterBlocks: any[] = [];
    try {
      if (ch.content && ch.content.trim().startsWith('{')) {
        const parsed = JSON.parse(ch.content);
        if (Array.isArray(parsed.blocks)) {
          chapterBlocks = parsed.blocks;
        }
      }
    } catch {
      chapterBlocks = [];
    }

    if (chapterBlocks.length > 0) {
      chapterBlocks.forEach((b: any, bIdx: number) => {
        blocks.push({
          ...b,
          id: b.id ? `b-${ch.id}-${b.id}` : `b-${ch.id}-${bIdx}`
        });
      });
    } else if (ch.content) {
      blocks.push({
        id: `b-${ch.id}-fallback`,
        type: 'paragraph',
        data: { text: ch.content.replace(/<[^>]+>/g, ' ') }
      });
    }

    // Divider between chapters (except the last one)
    if (idx < chapters.length - 1) {
      blocks.push({
        id: `binder-sep-${ch.id}`,
        type: 'delimiter',
        data: {}
      });
    }
  });

  return blocks;
}

/**
 * Compiles all chapters into a clean, unified Markdown document.
 */
export function compileBinderToMarkdown(
  chapters: ProjectChapter[],
  options: { projectName?: string; language?: string } = {}
): string {
  const isEn = options.language === 'en';
  const projName = options.projectName || (isEn ? 'Academic Thesis' : 'Skripsi / Tesis');
  const lines: string[] = [];

  lines.push(`# ${projName}`);
  lines.push('');
  lines.push(`*${isEn ? 'Consolidated Thesis Manuscript' : 'Kompilasi Naskah Skripsi Lengkap'}*`);
  lines.push('');
  lines.push('---');
  lines.push('');

  chapters.forEach((ch) => {
    lines.push(`## ${ch.chapterLabel || `Bab ${ch.chapterNumber}: ${ch.title}`}`);
    lines.push('');

    let chapterBlocks: any[] = [];
    try {
      if (ch.content && ch.content.trim().startsWith('{')) {
        const parsed = JSON.parse(ch.content);
        if (Array.isArray(parsed.blocks)) {
          chapterBlocks = parsed.blocks;
        }
      }
    } catch {
      chapterBlocks = [];
    }

    if (chapterBlocks.length > 0) {
      chapterBlocks.forEach((b: any) => {
        if (b.type === 'header') {
          const hashes = '#'.repeat(Math.min(6, (b.data?.level || 2) + 1));
          lines.push(`${hashes} ${b.data?.text || ''}`);
        } else if (b.type === 'paragraph') {
          lines.push(b.data?.text || '');
        } else if (b.type === 'list') {
          (b.data?.items || []).forEach((item: string) => {
            lines.push(`- ${item}`);
          });
        } else if (b.type === 'image') {
          lines.push(`![${b.data?.caption || 'Figure'}](${b.data?.url || ''})`);
        } else if (b.type === 'delimiter') {
          lines.push('---');
        }
        lines.push('');
      });
    } else if (ch.content) {
      lines.push(ch.content.replace(/<[^>]+>/g, ' '));
      lines.push('');
    }

    lines.push('');
  });

  // Append Consolidated Master Bibliography
  const masterBib = consolidateMasterBibliography(chapters);
  if (masterBib.length > 0) {
    lines.push('## ' + (isEn ? 'Consolidated References' : 'Daftar Pustaka Terpadu'));
    lines.push('');
    masterBib.forEach((item, idx) => {
      const authorText = item.authors.join(', ');
      const journalText = item.journal ? ` ${item.journal}.` : '';
      lines.push(`${idx + 1}. ${authorText} (${item.year}). *${item.title}*.${journalText} [Bab: ${item.usedInChapters.join(', ')}]`);
    });
    lines.push('');
  }

  return lines.join('\n');
}
