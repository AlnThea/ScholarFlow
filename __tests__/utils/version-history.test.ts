import { describe, it, expect, beforeEach } from 'vitest';
import {
  extractPlainTextFromEditorJs,
  computeWordDiff,
  calculateDiffStats,
  formatRelativeTime,
} from '@/lib/editor/diff-engine';
import {
  loadLocalRevisions,
  saveLocalRevisions,
  appendLocalRevision,
  countWordsFromContent,
  DocumentRevision,
} from '@/lib/editor/version-history';

describe('Document Version History & Visual Diff Engine Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('EditorJS Plain Text Extraction (extractPlainTextFromEditorJs)', () => {
    it('extracts and cleans paragraph blocks with HTML tags', () => {
      const mockEditorJsContent = {
        blocks: [
          {
            type: 'paragraph',
            data: { text: 'Metodologi penelitian ini menggunakan <b>regresi logistik</b> multivariat.' }
          },
          {
            type: 'paragraph',
            data: { text: 'Hasil menunjukkan tingkat signifikansi <span class="math">p &lt; 0.05</span>.' }
          }
        ]
      };

      const plainText = extractPlainTextFromEditorJs(mockEditorJsContent);
      expect(plainText).toContain('Metodologi penelitian ini menggunakan regresi logistik multivariat.');
      expect(plainText).toContain('Hasil menunjukkan tingkat signifikansi p < 0.05.');
      expect(plainText).not.toContain('<b>');
      expect(plainText).not.toContain('</span>');
    });

    it('extracts list items and code blocks correctly', () => {
      const mockListContent = {
        blocks: [
          {
            type: 'list',
            data: {
              items: ['Tahap Pengumpulan Data', 'Tahap Pra-pemrosesan', 'Tahap Pelatihan Model']
            }
          },
          {
            type: 'code',
            data: { code: 'const accuracy = 0.945;' }
          }
        ]
      };

      const text = extractPlainTextFromEditorJs(mockListContent);
      expect(text).toContain('• Tahap Pengumpulan Data');
      expect(text).toContain('• Tahap Pra-pemrosesan');
      expect(text).toContain('const accuracy = 0.945;');
    });

    it('handles empty or null content safely', () => {
      expect(extractPlainTextFromEditorJs(null)).toBe('');
      expect(extractPlainTextFromEditorJs(undefined)).toBe('');
      expect(extractPlainTextFromEditorJs({})).toBe('');
    });
  });

  describe('Word-Level Visual Diff Algorithm (computeWordDiff)', () => {
    it('detects completely identical texts as unchanged', () => {
      const text = 'Sistem kecerdasan buatan mendukung efisiensi analisis literatur.';
      const diff = computeWordDiff(text, text);

      expect(diff.length).toBe(1);
      expect(diff[0].type).toBe('unchanged');
      expect(diff[0].value).toBe(text);

      const stats = calculateDiffStats(diff);
      expect(stats.addedWords).toBe(0);
      expect(stats.removedWords).toBe(0);
      expect(stats.unchangedWords).toBe(7);
    });

    it('identifies added words at the end of sentence', () => {
      const oldText = 'Analisis data selesai dilakukan';
      const newText = 'Analisis data selesai dilakukan dengan metode kualitatif';

      const diff = computeWordDiff(oldText, newText);
      const addedChunks = diff.filter(c => c.type === 'added');
      expect(addedChunks.length).toBeGreaterThan(0);

      const stats = calculateDiffStats(diff);
      expect(stats.addedWords).toBe(3); // "dengan", "metode", "kualitatif"
      expect(stats.removedWords).toBe(0);
    });

    it('identifies removed words from original draft', () => {
      const oldText = 'Model ini menghasilkan akurasi yang cukup tinggi dan sangat memuaskan.';
      const newText = 'Model ini menghasilkan akurasi yang tinggi.';

      const diff = computeWordDiff(oldText, newText);
      const removedChunks = diff.filter(c => c.type === 'removed');
      expect(removedChunks.length).toBeGreaterThan(0);

      const stats = calculateDiffStats(diff);
      expect(stats.removedWords).toBeGreaterThan(0);
    });

    it('handles completely new document additions', () => {
      const diff = computeWordDiff('', 'Pendahuluan karya ilmiah.');
      expect(diff).toEqual([{ type: 'added', value: 'Pendahuluan karya ilmiah.' }]);

      const stats = calculateDiffStats(diff);
      expect(stats.addedWords).toBe(3);
      expect(stats.removedWords).toBe(0);
    });
  });

  describe('Relative Time Formatting (formatRelativeTime)', () => {
    it('formats recent timestamps in English and Indonesian', () => {
      const now = new Date();
      expect(formatRelativeTime(now, 'en')).toBe('Just now');
      expect(formatRelativeTime(now, 'id')).toBe('Baru saja');

      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatRelativeTime(fiveMinutesAgo, 'en')).toBe('5m ago');
      expect(formatRelativeTime(fiveMinutesAgo, 'id')).toBe('5 mnt lalu');

      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
      expect(formatRelativeTime(threeHoursAgo, 'en')).toBe('3h ago');
      expect(formatRelativeTime(threeHoursAgo, 'id')).toBe('3 jam lalu');
    });
  });

  describe('Local Revisions Storage & FIFO Capacity (lib/editor/version-history)', () => {
    it('saves and loads document revisions from localStorage', () => {
      const docId = 'doc-test-123';
      const mockRevision: DocumentRevision = {
        id: 'rev-1',
        document_id: docId,
        user_id: 'user-1',
        title: 'Draft Bab 1',
        content: { blocks: [{ type: 'paragraph', data: { text: 'Paragraf pertama.' } }] },
        word_count: 2,
        change_summary: 'Inisiasi draf awal',
        is_auto_saved: false,
        created_at: new Date().toISOString(),
        author_name: 'Peneliti 1',
      };

      saveLocalRevisions(docId, [mockRevision]);
      const loaded = loadLocalRevisions(docId);

      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe('rev-1');
      expect(loaded[0].title).toBe('Draft Bab 1');
      expect(loaded[0].word_count).toBe(2);
    });

    it('appends revisions in descending chronological order without duplicate ID', () => {
      const docId = 'doc-test-456';
      const rev1: DocumentRevision = {
        id: 'rev-a',
        document_id: docId,
        user_id: 'u1',
        title: 'V1',
        content: {},
        word_count: 10,
        is_auto_saved: true,
        created_at: '2026-10-16T10:00:00Z',
      };

      const rev2: DocumentRevision = {
        id: 'rev-b',
        document_id: docId,
        user_id: 'u1',
        title: 'V2',
        content: {},
        word_count: 25,
        is_auto_saved: false,
        created_at: '2026-10-16T10:15:00Z',
      };

      appendLocalRevision(docId, rev1);
      const afterSecond = appendLocalRevision(docId, rev2);

      expect(afterSecond).toHaveLength(2);
      expect(afterSecond[0].id).toBe('rev-b'); // Newest first
      expect(afterSecond[1].id).toBe('rev-a');
    });

    it('counts words from EditorJS content accurately', () => {
      const content = {
        blocks: [
          { type: 'paragraph', data: { text: 'Satu dua tiga empat lima.' } },
          { type: 'paragraph', data: { text: 'Enam tujuh delapan.' } },
        ]
      };

      expect(countWordsFromContent(content)).toBe(8);
      expect(countWordsFromContent(null)).toBe(0);
    });
  });
});
