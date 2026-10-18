// lib/editor/methods/suggestion-methods.ts
// EditorJS DOM methods for Live Track Changes and Suggesting Mode

import type { EditorJsMethodsProps } from '@/hooks/use-editorjs-methods';
import {
  createSuggestionMarkup,
  applyAcceptSuggestionToHtml,
  applyRejectSuggestionToHtml,
} from '../suggesting-engine';

export function buildSuggestionMethods(props: EditorJsMethodsProps) {
  const {
    editorRef,
    holderId,
    onContentChange,
    saveCleanContent,
  } = props;

  return {
    /**
     * Inserts an inline suggestion markup with <del> (old text) and <ins> (new text)
     */
    addSuggestionMark: (
      suggestionId: string,
      oldText: string,
      newText: string,
      authorName: string = 'Reviewer'
    ) => {
      const selection = window.getSelection();
      const markup = createSuggestionMarkup(suggestionId, oldText, newText, authorName);

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
        // Fallback: search for block containing oldText and replace safely, or append to active block
        const holder = document.getElementById(holderId) || document.getElementById('editorjs-holder') || document.querySelector('.codex-editor');
        if (holder) {
          const editables = Array.from(holder.querySelectorAll('[contenteditable="true"]'));
          let replaced = false;
          if (oldText && oldText.trim()) {
            for (const el of editables) {
              if (el.innerHTML.includes(oldText)) {
                el.innerHTML = el.innerHTML.replace(oldText, markup);
                el.dispatchEvent(new Event('input', { bubbles: true }));
                replaced = true;
                break;
              }
            }
          }
          if (!replaced) {
            const activeBlock = holder.querySelector('.ce-block--selected [contenteditable="true"]') ||
                                holder.querySelector('[contenteditable="true"]:focus') ||
                                holder.querySelector('.ce-block:last-child [contenteditable="true"]') ||
                                holder.querySelector('[contenteditable="true"]');
            if (activeBlock) {
              activeBlock.innerHTML += (activeBlock.innerHTML ? ' ' : '') + markup;
              activeBlock.dispatchEvent(new Event('input', { bubbles: true }));
            }
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
     * Accepts a suggestion by removing deleted tags and unwrapping inserted tags
     */
    acceptSuggestion: (suggestionId: string) => {
      const holder = document.getElementById(holderId) || document.getElementById('editorjs-holder') || document.querySelector('.codex-editor');
      if (!holder) return;

      const wrappers = holder.querySelectorAll(
        `span.sf-suggestion-wrapper[data-suggestion-id="${suggestionId}"], .sf-suggestion-del[data-suggestion-id="${suggestionId}"], .sf-suggestion-ins[data-suggestion-id="${suggestionId}"]`
      );

      wrappers.forEach((el) => {
        const parentBlock = el.closest('[contenteditable="true"]');
        if (parentBlock) {
          parentBlock.innerHTML = applyAcceptSuggestionToHtml(parentBlock.innerHTML, suggestionId);
          parentBlock.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });

      if (onContentChange && editorRef.current) {
        saveCleanContent()
          .then((content) => {
            if (content) onContentChange(content);
          })
          .catch(console.error);
      }
    },

    /**
     * Rejects a suggestion by removing inserted tags and restoring deleted text
     */
    rejectSuggestion: (suggestionId: string) => {
      const holder = document.getElementById(holderId) || document.getElementById('editorjs-holder') || document.querySelector('.codex-editor');
      if (!holder) return;

      const wrappers = holder.querySelectorAll(
        `span.sf-suggestion-wrapper[data-suggestion-id="${suggestionId}"], .sf-suggestion-del[data-suggestion-id="${suggestionId}"], .sf-suggestion-ins[data-suggestion-id="${suggestionId}"]`
      );

      wrappers.forEach((el) => {
        const parentBlock = el.closest('[contenteditable="true"]');
        if (parentBlock) {
          parentBlock.innerHTML = applyRejectSuggestionToHtml(parentBlock.innerHTML, suggestionId);
          parentBlock.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });

      if (onContentChange && editorRef.current) {
        saveCleanContent()
          .then((content) => {
            if (content) onContentChange(content);
          })
          .catch(console.error);
      }
    },

    /**
     * Accepts all active suggestions in the editor canvas
     */
    batchAcceptAllSuggestions: () => {
      const holder = document.getElementById(holderId) || document.getElementById('editorjs-holder') || document.querySelector('.codex-editor');
      if (!holder) return;

      const blocks = holder.querySelectorAll('[contenteditable="true"]');
      blocks.forEach((block) => {
        if (block.innerHTML.includes('sf-suggestion-wrapper') || block.innerHTML.includes('<del') || block.innerHTML.includes('<ins')) {
          block.innerHTML = applyAcceptSuggestionToHtml(block.innerHTML);
          block.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });

      if (onContentChange && editorRef.current) {
        saveCleanContent()
          .then((content) => {
            if (content) onContentChange(content);
          })
          .catch(console.error);
      }
    },

    /**
     * Rejects all active suggestions in the editor canvas
     */
    batchRejectAllSuggestions: () => {
      const holder = document.getElementById(holderId) || document.getElementById('editorjs-holder') || document.querySelector('.codex-editor');
      if (!holder) return;

      const blocks = holder.querySelectorAll('[contenteditable="true"]');
      blocks.forEach((block) => {
        if (block.innerHTML.includes('sf-suggestion-wrapper') || block.innerHTML.includes('<del') || block.innerHTML.includes('<ins')) {
          block.innerHTML = applyRejectSuggestionToHtml(block.innerHTML);
          block.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });

      if (onContentChange && editorRef.current) {
        saveCleanContent()
          .then((content) => {
            if (content) onContentChange(content);
          })
          .catch(console.error);
      }
    },

    /**
     * Smoothly scrolls the canvas to a specific suggestion mark
     */
    scrollToSuggestionMark: (suggestionId: string) => {
      const holder = document.getElementById(holderId);
      if (!holder) return;

      const targetEl = holder.querySelector(
        `[data-suggestion-id="${suggestionId}"]`
      ) as HTMLElement | null;

      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetEl.classList.add('ring-2', 'ring-amber-400', 'animate-pulse');
        setTimeout(() => {
          targetEl.classList.remove('ring-2', 'ring-amber-400', 'animate-pulse');
        }, 2000);
      }
    },
  };
}
