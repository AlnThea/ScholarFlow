// lib/editor/methods/cross-reference-methods.ts
// EditorJS DOM methods for Figure & Table scientific cross-referencing and auto-numbering

import type { EditorJsMethodsProps } from '@/hooks/use-editorjs-methods';
import {
  createCrossReferenceMarkup,
  reindexContentCrossReferences,
} from '../cross-reference';

export function buildCrossReferenceMethods(props: EditorJsMethodsProps) {
  const {
    editorRef,
    holderId,
    onContentChange,
    saveCleanContent,
  } = props;

  return {
    /**
     * Inserts an interactive cross-reference anchor into the active cursor position
     */
    insertCrossReference: (
      targetId: string,
      type: 'figure' | 'table',
      index: number,
      language: 'en' | 'id' = 'id',
      customText?: string
    ) => {
      const markup = createCrossReferenceMarkup(targetId, type, index, language, customText);
      const selection = window.getSelection();

      if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        range.deleteContents();

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = markup;
        const frag = document.createDocumentFragment();
        let node;
        while ((node = tempDiv.firstChild)) {
          frag.appendChild(node);
        }
        range.insertNode(frag);
        selection.removeAllRanges();
      } else {
        // Fallback: append to currently focused contenteditable
        const holder = document.getElementById(holderId) || document.getElementById('editorjs-holder') || document.querySelector('.codex-editor');
        if (holder) {
          const activeBlock =
            holder.querySelector('.ce-block--selected [contenteditable="true"]') ||
            holder.querySelector('[contenteditable="true"]:focus') ||
            holder.querySelector('.ce-block:last-child [contenteditable="true"]') ||
            holder.querySelector('[contenteditable="true"]');
          if (activeBlock) {
            activeBlock.innerHTML += ` ${markup} `;
            activeBlock.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      }

      if (onContentChange && editorRef.current) {
        saveCleanContent()
          .then((content) => {
            if (content) onContentChange(content);
          })
          .catch(console.error);
      }
    },

    /**
     * Smoothly scrolls the canvas to a specific scientific Figure or Table block and highlights it
     */
    scrollToScientificItem: (targetId: string) => {
      const holder = document.getElementById(holderId);
      if (!holder) return;

      // Find block by data-id attribute or inner element
      let targetBlock = holder.querySelector(`[data-id="${targetId}"]`) as HTMLElement | null;

      if (!targetBlock) {
        // Fallback: search by class or id match
        targetBlock = (holder.querySelector(`#${targetId}`) ||
                       holder.querySelector(`[data-block-id="${targetId}"]`)) as HTMLElement | null;
      }

      if (targetBlock) {
        targetBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetBlock.classList.add('ring-4', 'ring-indigo-500', 'shadow-2xl', 'rounded-2xl', 'transition-all', 'duration-300');
        setTimeout(() => {
          targetBlock?.classList.remove('ring-4', 'ring-indigo-500', 'shadow-2xl', 'rounded-2xl', 'transition-all', 'duration-300');
        }, 2500);
      }
    },

    /**
     * Re-indexes in-text cross references throughout the entire active manuscript
     */
    refreshCrossReferences: async (language: 'en' | 'id' = 'id') => {
      if (!editorRef.current) return;
      try {
        const currentData = await saveCleanContent();
        if (currentData) {
          const { updatedContent, count } = reindexContentCrossReferences(currentData, language);
          if (count > 0) {
            await editorRef.current.render(updatedContent);
            if (onContentChange) {
              onContentChange(updatedContent);
            }
          }
        }
      } catch (err) {
        console.error('Failed to refresh cross references:', err);
      }
    },
  };
}
