// lib/editor/methods/outline-scaffold.ts
// Phase 31: Document Scaffolding Generator & EditorJS Block Builder

import { 
  AcademicStructurePreset, 
  convertScaffoldToEditorJsBlocks, 
  ScaffoldConversionOptions 
} from '../academic-templates';

export interface TailoredOutlineSection {
  title: string;
  level?: number;
  tailoredPrompt?: string;
  suggestedSubsections?: string[];
  keyKeywords?: string[];
}

export interface TailoredOutlineData {
  topic: string;
  executiveSummary?: string;
  recommendedMethodology?: string;
  sections: TailoredOutlineSection[];
}

/**
 * Converts a tailored AI outline into EditorJS block structure
 */
export function convertTailoredAirOutlineToBlocks(
  outlineData: TailoredOutlineData,
  language: 'en' | 'id',
  includePrompts: boolean = true
): any[] {
  const isEn = language === 'en';
  const blocks: any[] = [];
  const genId = (prefix: string) => `${prefix}-${Math.random().toString(36).substring(2, 9)}`;

  // Title
  if (outlineData.topic) {
    blocks.push({
      id: genId('h-title'),
      type: 'header',
      data: {
        text: outlineData.topic,
        level: 1
      }
    });
  }

  // Executive Summary blockquote
  if (outlineData.executiveSummary) {
    blocks.push({
      id: genId('p-exec-summary'),
      type: 'paragraph',
      data: {
        text: `<i><b>${isEn ? 'Executive Research Focus:' : 'Fokus Riset Utama:'}</b> ${outlineData.executiveSummary}</i>`
      }
    });
  }

  // Iterate sections
  outlineData.sections.forEach((sec, sIdx) => {
    // Section Header
    blocks.push({
      id: genId(`h-sec-${sIdx}`),
      type: 'header',
      data: {
        text: sec.title,
        level: sec.level || 2
      }
    });

    // Tailored guiding prompt
    if (includePrompts && sec.tailoredPrompt) {
      blocks.push({
        id: genId(`p-guide-${sIdx}`),
        type: 'paragraph',
        data: {
          text: `💡 <i>${isEn ? 'Guidance:' : 'Panduan:'} ${sec.tailoredPrompt}</i>`
        }
      });
    }

    // Subsections as bullet points if available
    if (sec.suggestedSubsections && sec.suggestedSubsections.length > 0) {
      blocks.push({
        id: genId(`list-sub-${sIdx}`),
        type: 'list',
        data: {
          style: 'unordered',
          items: sec.suggestedSubsections.map(sub => `<b>${sub}</b>: ${isEn ? 'Draft specific analysis' : 'Tuliskan rincian analisis'}`)
        }
      });
    }

    // Placeholder paragraph for student/researcher
    blocks.push({
      id: genId(`p-body-${sIdx}`),
      type: 'paragraph',
      data: {
        text: isEn 
          ? 'Start writing your research argument here...' 
          : 'Mulai menuliskan argumen penelitian Anda di sini...'
      }
    });
  });

  return blocks;
}

/**
 * Injects scaffolded blocks into active EditorJS instance
 */
export async function injectScaffoldIntoEditorJs(
  editorInstance: any,
  blocks: any[],
  mode: 'append' | 'replace' = 'append'
): Promise<boolean> {
  if (!editorInstance || typeof editorInstance.render !== 'function') {
    return false;
  }

  try {
    if (mode === 'replace') {
      await editorInstance.render({
        time: Date.now(),
        blocks: blocks,
        version: '2.31.0'
      });
      return true;
    }

    // Append mode: get current blocks, append new ones, and re-render
    const currentData = await editorInstance.save();
    const existingBlocks = currentData?.blocks || [];
    const combinedBlocks = [...existingBlocks, ...blocks];

    await editorInstance.render({
      time: Date.now(),
      blocks: combinedBlocks,
      version: '2.31.0'
    });

    return true;
  } catch (err) {
    console.error('[injectScaffoldIntoEditorJs Error]:', err);
    return false;
  }
}
