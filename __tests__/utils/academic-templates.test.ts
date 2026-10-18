// __tests__/utils/academic-templates.test.ts
// Phase 31: Academic Thesis/Paper Outline & Structure Generator Unit Tests

import { describe, it, expect } from 'vitest';
import {
  getAllAcademicPresets,
  getAcademicPreset,
  convertScaffoldToEditorJsBlocks,
  convertScaffoldToMarkdown,
} from '@/lib/editor/academic-templates';
import {
  convertTailoredAirOutlineToBlocks,
  TailoredOutlineData,
} from '@/lib/editor/methods/outline-scaffold';
import { buildOutlinePrompt } from '@/app/api/v1/ai/generate-outline/route';

describe('Phase 31: Academic Structure Templates & Outline Generator', () => {
  describe('Preset Definitions & Retrieval', () => {
    it('returns all 4 default academic structure presets', () => {
      const presets = getAllAcademicPresets();
      expect(presets).toHaveLength(4);
      const ids = presets.map((p) => p.id);
      expect(ids).toContain('imrad');
      expect(ids).toContain('skripsi_5bab');
      expect(ids).toContain('slr_prisma');
      expect(ids).toContain('case_study');
    });

    it('retrieves specific preset by id or falls back to default', () => {
      const imrad = getAcademicPreset('imrad');
      expect(imrad.id).toBe('imrad');
      expect(imrad.sections.length).toBeGreaterThan(4);

      const skripsi = getAcademicPreset('skripsi_5bab');
      expect(skripsi.id).toBe('skripsi_5bab');
      expect(skripsi.sections).toHaveLength(5);

      // Unknown fallback
      const fallback = getAcademicPreset('non_existent' as any);
      expect(fallback.id).toBe('imrad');
    });

    it('ensures each preset section has bilingual titles and guiding prompts', () => {
      const presets = getAllAcademicPresets();
      presets.forEach((preset) => {
        expect(preset.name.en).toBeTruthy();
        expect(preset.name.id).toBeTruthy();
        preset.sections.forEach((sec) => {
          expect(sec.title.en).toBeTruthy();
          expect(sec.title.id).toBeTruthy();
          expect(sec.guidingPrompt.en).toBeTruthy();
          expect(sec.guidingPrompt.id).toBeTruthy();
          expect(Array.isArray(sec.checklist.en)).toBe(true);
          expect(Array.isArray(sec.checklist.id)).toBe(true);
        });
      });
    });
  });

  describe('convertScaffoldToEditorJsBlocks', () => {
    it('generates valid EditorJS blocks with unique IDs for English', () => {
      const preset = getAcademicPreset('imrad');
      const blocks = convertScaffoldToEditorJsBlocks(preset, {
        language: 'en',
        includePromptsAsParagraphs: true,
        includeChecklistsAsLists: true,
        paperTitle: 'Deep Learning in Precision Agriculture',
      });

      expect(blocks.length).toBeGreaterThan(0);
      // First block is title
      expect(blocks[0].type).toBe('header');
      expect(blocks[0].data.text).toBe('Deep Learning in Precision Agriculture');
      expect(blocks[0].data.level).toBe(1);

      // Check all block IDs are unique
      const ids = blocks.map((b) => b.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('generates Indonesian language headings and guidance blocks', () => {
      const preset = getAcademicPreset('skripsi_5bab');
      const blocks = convertScaffoldToEditorJsBlocks(preset, {
        language: 'id',
        includePromptsAsParagraphs: true,
        includeChecklistsAsLists: true,
      });

      // Contains Bab 1 header
      const bab1Header = blocks.find(
        (b) => b.type === 'header' && b.data.text.includes('Bab I: Pendahuluan')
      );
      expect(bab1Header).toBeDefined();

      // Contains Indonesian guidance
      const guidanceBlock = blocks.find(
        (b) => b.type === 'paragraph' && b.data.text.includes('Panduan Penulisan')
      );
      expect(guidanceBlock).toBeDefined();
    });

    it('omits guiding prompt blocks when includePromptsAsParagraphs is false', () => {
      const preset = getAcademicPreset('imrad');
      const blocks = convertScaffoldToEditorJsBlocks(preset, {
        language: 'en',
        includePromptsAsParagraphs: false,
        includeChecklistsAsLists: false,
      });

      const guidanceBlock = blocks.find(
        (b) => b.type === 'paragraph' && b.data.text.includes('💡')
      );
      expect(guidanceBlock).toBeUndefined();
    });
  });

  describe('convertScaffoldToMarkdown', () => {
    it('compiles scaffold structure to standard Markdown string', () => {
      const preset = getAcademicPreset('slr_prisma');
      const md = convertScaffoldToMarkdown(preset, {
        language: 'en',
        includePromptsAsParagraphs: true,
        includeChecklistsAsLists: true,
        paperTitle: 'PRISMA Systematic Review',
      });

      expect(md).toContain('# PRISMA Systematic Review');
      expect(md).toContain('## 1. Introduction & Rationale');
      expect(md).toContain('> 💡 **Guidance:**');
      expect(md).toContain('- [ ]');
    });

    it('compiles Indonesian Markdown properly', () => {
      const preset = getAcademicPreset('case_study');
      const md = convertScaffoldToMarkdown(preset, {
        language: 'id',
        includePromptsAsParagraphs: true,
        includeChecklistsAsLists: true,
      });

      expect(md).toContain('## 1. Latar Belakang & Konteks Kasus');
      expect(md).toContain('> 💡 **Panduan:**');
    });
  });

  describe('convertTailoredAirOutlineToBlocks', () => {
    it('converts tailored AI outline data into EditorJS blocks', () => {
      const mockTailored: TailoredOutlineData = {
        topic: 'AI in Smart Traffic Management',
        executiveSummary: 'This paper studies CNN-based video analytics for intersection congestion reduction.',
        recommendedMethodology: 'YOLOv8 vehicle detection + real-time queue estimation',
        sections: [
          {
            title: '1. Introduction',
            level: 2,
            tailoredPrompt: 'Discuss urban gridlock costs and camera IoT penetration.',
            suggestedSubsections: ['1.1 Urban Congestion Crisis', '1.2 Computer Vision Potential'],
            keyKeywords: ['YOLO', 'Smart Traffic', 'IoT'],
          },
          {
            title: '2. Methodology',
            level: 2,
            tailoredPrompt: 'Detail camera placement and edge inference latency metrics.',
            suggestedSubsections: ['2.1 Edge Device Setup', '2.2 Real-time Queue Algorithm'],
          },
        ],
      };

      const blocks = convertTailoredAirOutlineToBlocks(mockTailored, 'en', true);
      expect(blocks.length).toBeGreaterThan(4);

      // Title header
      expect(blocks[0].type).toBe('header');
      expect(blocks[0].data.text).toBe('AI in Smart Traffic Management');

      // Executive summary
      expect(blocks[1].data.text).toContain('Executive Research Focus:');

      // Subsections list
      const listBlock = blocks.find((b) => b.type === 'list');
      expect(listBlock).toBeDefined();
      expect(listBlock?.data?.items[0]).toContain('1.1 Urban Congestion Crisis');
    });
  });

  describe('buildOutlinePrompt (AI Prompt Builder)', () => {
    it('builds structured prompt in English with JSON schema constraints', () => {
      const prompt = buildOutlinePrompt({
        topic: 'Autonomous Drone Navigation in GPS-Denied Environments',
        field: 'Robotics & Control Systems',
        methodology: 'Visual-Inertial Odometry & SLAM',
        presetId: 'imrad',
        language: 'en',
      });

      expect(prompt).toContain('Autonomous Drone Navigation in GPS-Denied Environments');
      expect(prompt).toContain('Robotics & Control Systems');
      expect(prompt).toContain('Visual-Inertial Odometry & SLAM');
      expect(prompt).toContain('exact schema');
      expect(prompt).toContain('"tailoredPrompt"');
    });

    it('builds structured prompt in Indonesian with Scopus/SINTA guidance', () => {
      const prompt = buildOutlinePrompt({
        topic: 'Analisis Faktor Keputusan Konsumen Menggunakan E-Wallet',
        field: 'Manajemen Pemasaran',
        methodology: 'SEM-PLS dengan SmartPLS 4',
        presetId: 'skripsi_5bab',
        language: 'id',
      });

      expect(prompt).toContain('Analisis Faktor Keputusan Konsumen Menggunakan E-Wallet');
      expect(prompt).toContain('Manajemen Pemasaran');
      expect(prompt).toContain('SEM-PLS dengan SmartPLS 4');
      expect(prompt).toContain('skripsi/tesis/jurnal ilmiah');
      expect(prompt).toContain('"tailoredPrompt"');
    });
  });
});
