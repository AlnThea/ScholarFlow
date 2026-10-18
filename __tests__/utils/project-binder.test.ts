// __tests__/utils/project-binder.test.ts
import { describe, it, expect } from 'vitest';
import {
  parseChapterNumber,
  countWordsFromContent,
  extractProjectChapters,
  calculateProjectSummary,
  extractCrossChapterFiguresAndTables,
  consolidateMasterBibliography,
  compileBinderToUnifiedBlocks,
  compileBinderToMarkdown
} from '@/lib/editor/project-binder';

describe('Phase 33: Multi-Chapter Thesis & Dissertation Project Binder Unit Tests', () => {
  it('parses chapter numbers correctly from various academic titles', () => {
    expect(parseChapterNumber('Bab 1: Pendahuluan', 1)).toBe(1);
    expect(parseChapterNumber('Chapter 2: Literature Review', 1)).toBe(2);
    expect(parseChapterNumber('Bagian 3: Metodologi Penelitian', 1)).toBe(3);
    expect(parseChapterNumber('4. Analisis dan Hasil', 1)).toBe(4);
    expect(parseChapterNumber('Bab 5: Kesimpulan dan Saran', 1)).toBe(5);
    expect(parseChapterNumber('Draft Tanpa Nomor', 99)).toBe(99);
  });

  it('accurately counts words from raw text and EditorJS JSON', () => {
    const plainText = 'Ini adalah naskah skripsi penelitian mahasiswa tingkat akhir.';
    const resultPlain = countWordsFromContent(plainText);
    expect(resultPlain.words).toBe(8);

    const editorJsJson = JSON.stringify({
      blocks: [
        { type: 'header', data: { text: 'Bab 1 Pendahuluan' } },
        { type: 'paragraph', data: { text: 'Latar belakang penelitian ini disusun secara ilmiah.' } }
      ]
    });
    const resultJson = countWordsFromContent(editorJsJson);
    expect(resultJson.words).toBe(10);
  });

  it('filters and sorts chapters belonging to a project by chapter number', () => {
    const docs = [
      {
        id: 'doc-3',
        title: 'Metode Penelitian',
        content: 'Konten bab 3',
        settings: { projectId: 'proj-123', projectPart: 'Bab 3: Metodologi' }
      },
      {
        id: 'doc-1',
        title: 'Pendahuluan',
        content: 'Konten bab 1',
        settings: { projectId: 'proj-123', projectPart: 'Bab 1: Pendahuluan' }
      },
      {
        id: 'doc-2',
        title: 'Tinjauan Pustaka',
        content: 'Konten bab 2',
        settings: { projectId: 'proj-123', projectPart: 'Bab 2: Landasan Teori' }
      },
      {
        id: 'doc-other',
        title: 'Independent Doc',
        content: 'Bukan bagian proyek',
        settings: { projectId: 'proj-456' }
      }
    ];

    const chapters = extractProjectChapters(docs, 'proj-123');
    expect(chapters.length).toBe(3);
    expect(chapters[0].chapterNumber).toBe(1);
    expect(chapters[1].chapterNumber).toBe(2);
    expect(chapters[2].chapterNumber).toBe(3);
    expect(chapters[0].title).toBe('Pendahuluan');
  });

  it('extracts cross-chapter figures and tables with chapter-prefixed numbering', () => {
    const chapters = [
      {
        id: 'ch-1',
        title: 'Bab 1',
        chapterNumber: 1,
        chapterLabel: 'Bab 1: Pendahuluan',
        content: JSON.stringify({
          blocks: [
            { type: 'paragraph', data: { text: 'Intro' } },
            { type: 'image', data: { caption: 'Alur Masalah Penelitian', url: '/img1.png' } },
            { type: 'table', data: { caption: 'Statistik Masalah', content: [['A', 'B']] } }
          ]
        }),
        wordCount: 100,
        characterCount: 600,
        updatedAt: '2026-10-18T10:00:00Z'
      },
      {
        id: 'ch-2',
        title: 'Bab 2',
        chapterNumber: 2,
        chapterLabel: 'Bab 2: Tinjauan Teori',
        content: JSON.stringify({
          blocks: [
            { type: 'image', data: { caption: 'Kerangka Teori Konseptual', url: '/img2.png' } },
            { type: 'image', data: { caption: 'Komparasi Model AI', url: '/img3.png' } }
          ]
        }),
        wordCount: 150,
        characterCount: 900,
        updatedAt: '2026-10-18T11:00:00Z'
      }
    ];

    const items = extractCrossChapterFiguresAndTables(chapters, 'id');
    expect(items.length).toBe(4);

    // Chapter 1 items
    expect(items[0].type).toBe('figure');
    expect(items[0].formattedLabel).toBe('Gambar 1.1');
    expect(items[0].caption).toBe('Alur Masalah Penelitian');

    expect(items[1].type).toBe('table');
    expect(items[1].formattedLabel).toBe('Tabel 1.1');

    // Chapter 2 items
    expect(items[2].type).toBe('figure');
    expect(items[2].formattedLabel).toBe('Gambar 2.1');
    expect(items[2].caption).toBe('Kerangka Teori Konseptual');

    expect(items[3].type).toBe('figure');
    expect(items[3].formattedLabel).toBe('Gambar 2.2');
  });

  it('consolidates and deduplicates citations across multiple chapters into a Master Bibliography', () => {
    const chapters = [
      {
        id: 'ch-1',
        title: 'Bab 1',
        chapterNumber: 1,
        chapterLabel: 'Bab 1',
        content: '<p>Terkait AI <cite data-citation="true" data-reference-id="ref-vaswani" data-title="Attention Is All You Need" data-author="Vaswani, A." data-year="2017" data-doi="10.1234/vaswani">(Vaswani et al., 2017)</cite> dan <cite data-citation="true" data-reference-id="ref-goodfellow" data-title="Deep Learning" data-author="Goodfellow, I." data-year="2016">(Goodfellow, 2016)</cite></p>',
        wordCount: 50,
        characterCount: 300,
        updatedAt: '2026-10-18T10:00:00Z'
      },
      {
        id: 'ch-2',
        title: 'Bab 2',
        chapterNumber: 2,
        chapterLabel: 'Bab 2',
        // Notice duplicate Vaswani cite in Chapter 2
        content: '<p>Model transformator dikembangkan oleh <cite data-citation="true" data-reference-id="ref-vaswani" data-title="Attention Is All You Need" data-author="Vaswani, A." data-year="2017" data-doi="10.1234/vaswani">(Vaswani et al., 2017)</cite> dan BERT <cite data-citation="true" data-reference-id="ref-devlin" data-title="BERT" data-author="Devlin, J." data-year="2019">(Devlin, 2019)</cite></p>',
        wordCount: 60,
        characterCount: 350,
        updatedAt: '2026-10-18T11:00:00Z'
      }
    ];

    const masterBib = consolidateMasterBibliography(chapters, 'apa');
    // Total unique citations should be 3 (Devlin, Goodfellow, Vaswani)
    expect(masterBib.length).toBe(3);

    const vaswani = masterBib.find((i) => i.title === 'Attention Is All You Need');
    expect(vaswani).toBeDefined();
    // Should record usage in both Chapter 1 and Chapter 2
    expect(vaswani?.usedInChapters).toEqual([1, 2]);

    // Should sort alphabetically for APA
    expect(masterBib[0].authors[0]).toContain('Devlin');
    expect(masterBib[1].authors[0]).toContain('Goodfellow');
    expect(masterBib[2].authors[0]).toContain('Vaswani');
  });

  it('calculates project summary metrics including read time and figures/tables', () => {
    const chapters = [
      {
        id: 'ch-1',
        title: 'Bab 1',
        chapterNumber: 1,
        chapterLabel: 'Bab 1',
        content: JSON.stringify({
          blocks: [
            { type: 'paragraph', data: { text: 'Satu dua tiga empat lima.' } },
            { type: 'image', data: { caption: 'Foto' } }
          ]
        }),
        wordCount: 300,
        characterCount: 1800,
        updatedAt: '2026-10-18T10:00:00Z'
      },
      {
        id: 'ch-2',
        title: 'Bab 2',
        chapterNumber: 2,
        chapterLabel: 'Bab 2',
        content: '<p>Enam tujuh delapan sembilan sepuluh.</p>',
        wordCount: 450,
        characterCount: 2700,
        updatedAt: '2026-10-18T11:00:00Z'
      }
    ];

    const summary = calculateProjectSummary('p-1', 'Skripsi Skala Besar', 'skripsi', chapters);
    expect(summary.totalChapters).toBe(2);
    expect(summary.totalWords).toBe(750);
    expect(summary.totalCharacters).toBe(4500);
    expect(summary.totalFigures).toBe(1);
    expect(summary.estimatedReadTimeMinutes).toBe(5); // 750 / 150 = 5 mins
  });

  it('compiles multi-chapter thesis into unified EditorJS blocks with dividers and chapter headers', () => {
    const chapters = [
      {
        id: 'c-1',
        title: 'Pendahuluan',
        chapterNumber: 1,
        chapterLabel: 'Bab 1: Pendahuluan',
        content: JSON.stringify({
          blocks: [{ id: 'b1', type: 'paragraph', data: { text: 'Paragraf pembuka bab satu.' } }]
        }),
        wordCount: 100,
        characterCount: 600,
        updatedAt: '2026-10-18T10:00:00Z'
      },
      {
        id: 'c-2',
        title: 'Metode',
        chapterNumber: 2,
        chapterLabel: 'Bab 2: Metodologi',
        content: JSON.stringify({
          blocks: [{ id: 'b2', type: 'paragraph', data: { text: 'Paragraf bab dua.' } }]
        }),
        wordCount: 120,
        characterCount: 720,
        updatedAt: '2026-10-18T11:00:00Z'
      }
    ];

    const blocks = compileBinderToUnifiedBlocks(chapters, {
      includeCover: true,
      projectName: 'Skripsi Kecerdasan Buatan',
      language: 'id'
    });

    // Check cover blocks
    expect(blocks[0].id).toBe('binder-cover-title');
    expect(blocks[0].data.text).toBe('SKRIPSI KECERDASAN BUATAN');
    expect(blocks[2].type).toBe('delimiter');

    // Check chapter 1 header
    const ch1Heading = blocks.find((b) => b.id === 'binder-chapter-heading-c-1');
    expect(ch1Heading).toBeDefined();
    expect(ch1Heading.data.text).toBe('Bab 1: Pendahuluan');

    // Check chapter 2 header
    const ch2Heading = blocks.find((b) => b.id === 'binder-chapter-heading-c-2');
    expect(ch2Heading).toBeDefined();
    expect(ch2Heading.data.text).toBe('Bab 2: Metodologi');

    // Divider exists between chapters
    const sep = blocks.find((b) => b.id === 'binder-sep-c-1');
    expect(sep).toBeDefined();
    expect(sep.type).toBe('delimiter');
  });

  it('compiles multi-chapter thesis into markdown with master bibliography', () => {
    const chapters = [
      {
        id: 'c-1',
        title: 'Bab 1',
        chapterNumber: 1,
        chapterLabel: 'Bab 1: Pendahuluan',
        content: JSON.stringify({
          blocks: [
            { type: 'paragraph', data: { text: 'Naskah bab 1 dengan <cite data-citation="true" data-title="NLP Book" data-author="Manning, C." data-year="2020">(Manning, 2020)</cite>' } }
          ]
        }),
        wordCount: 50,
        characterCount: 300,
        updatedAt: '2026-10-18T10:00:00Z'
      }
    ];

    const md = compileBinderToMarkdown(chapters, {
      projectName: 'Tesis Magister Ilmu Komputer',
      language: 'id'
    });

    expect(md).toContain('# Tesis Magister Ilmu Komputer');
    expect(md).toContain('## Bab 1: Pendahuluan');
    expect(md).toContain('## Daftar Pustaka Terpadu');
    expect(md).toContain('Manning, C. (2020). *NLP Book*. [Bab: 1]');
  });

  it('respects custom settings.chapterOrder when sorting project chapters', () => {
    const docs = [
      {
        id: 'doc-a',
        title: 'Bab Khusus',
        content: 'Teks',
        settings: { projectId: 'p-order', projectPart: 'Apendiks', chapterOrder: 9 }
      },
      {
        id: 'doc-b',
        title: 'Bab Awal',
        content: 'Teks',
        settings: { projectId: 'p-order', projectPart: 'Prolog', chapterOrder: 1 }
      }
    ];

    const chapters = extractProjectChapters(docs, 'p-order');
    expect(chapters[0].chapterNumber).toBe(1);
    expect(chapters[1].chapterNumber).toBe(9);
  });

  it('preserves order of appearance when style is numeric (ieee or vancouver)', () => {
    const chapters = [
      {
        id: 'c-1',
        title: 'Bab 1',
        chapterNumber: 1,
        chapterLabel: 'Bab 1',
        content: '<p><cite data-citation="true" data-title="Paper Z" data-author="Zack, A." data-year="2021">[1]</cite> <cite data-citation="true" data-title="Paper A" data-author="Adams, B." data-year="2018">[2]</cite></p>',
        wordCount: 10,
        characterCount: 50,
        updatedAt: '2026-10-18T10:00:00Z'
      }
    ];

    const masterBib = consolidateMasterBibliography(chapters, 'ieee');
    // First in appearance was Zack [1], then Adams [2]
    expect(masterBib[0].authors[0]).toContain('Zack');
    expect(masterBib[1].authors[0]).toContain('Adams');
  });

  it('handles empty documents array and missing project id gracefully', () => {
    expect(extractProjectChapters([], 'any')).toEqual([]);
    expect(extractProjectChapters(null as any, '')).toEqual([]);
    const summary = calculateProjectSummary('empty', 'Empty Project', 'skripsi', []);
    expect(summary.totalChapters).toBe(0);
    expect(summary.totalWords).toBe(0);
    expect(summary.totalFigures).toBe(0);
  });
});
