// c:/web/ScholarFlow/components/editor/editorjs-editor.tsx
'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import type EditorJS from '@editorjs/editorjs';
import 'katex/dist/katex.min.css';

// Custom LaTeX Math Block Tool for Editor.js
class MathBlockTool {
  static get toolbox() {
    return {
      title: 'Math Block',
      icon: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h3a2 2 0 0 0 2-2V4"/><path d="M20 17h-3a2 2 0 0 0-2 2v1"/><path d="M12 4v16"/><path d="M8 12h8"/></svg>`
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  data: { formula: string };
  api: any;
  readOnly: boolean;
  container: HTMLDivElement | null;

  constructor({ data, api, readOnly }: { data: any; api: any; readOnly: boolean }) {
    this.data = data || { formula: '' };
    this.api = api;
    this.readOnly = readOnly;
    this.container = null;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'p-4 border border-slate-200 rounded-lg bg-slate-50/50 my-3 font-sans';

    const input = document.createElement('textarea');
    input.placeholder = 'Enter LaTeX formula (e.g., \\int_a^b f(x) dx = F(b) - F(a))';
    input.value = this.data.formula || '';
    input.className = 'w-full p-2.5 border border-slate-200 rounded-md font-mono text-sm bg-white outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition';
    input.style.resize = 'vertical';

    const preview = document.createElement('div');
    preview.className = 'mt-3 text-center overflow-x-auto min-h-[2.5rem] flex items-center justify-center bg-white p-2 rounded-md border border-slate-100 shadow-sm';

    const renderMath = () => {
      const formula = input.value.trim();
      if (!formula) {
        preview.innerHTML = '<span class="text-slate-400 text-xs font-normal italic">LaTeX preview will render here</span>';
        return;
      }
      try {
        import('katex').then((kateMod) => {
          const katex = kateMod.default;
          katex.render(formula, preview, { displayMode: true, throwOnError: false });
        });
      } catch (err) {
        preview.textContent = formula;
      }
    };

    input.addEventListener('input', () => {
      this.data.formula = input.value;
      renderMath();
    });

    container.appendChild(input);
    container.appendChild(preview);

    // Dynamic show/hide of textarea based on focus/readOnly state
    if (this.readOnly) {
      input.style.display = 'none';
      preview.style.cursor = 'default';
    } else {
      // Start with input hidden if we already have a formula
      if (this.data.formula) {
        input.style.display = 'none';
      } else {
        input.style.display = 'block';
      }
      preview.style.cursor = 'pointer';

      // Switch to edit mode on click
      container.addEventListener('click', (e) => {
        if (e.target !== input) {
          input.style.display = 'block';
          input.focus();
        }
      });

      // Hide input on blur if not empty
      input.addEventListener('blur', () => {
        if (this.data.formula.trim()) {
          input.style.display = 'none';
        }
      });
    }

    // Initial render
    setTimeout(renderMath, 0);

    this.container = container;
    return container;
  }

  save() {
    return {
      formula: this.data.formula || ''
    };
  }
}

// Hidden background sanitizer tools to whitelist inline math and citation attributes in Editor.js Paragraph block
class InlineMathSanitizerTool {
  static get isInline() { return true; }
  static get isReadOnlySupported() { return true; }
  static get sanitize() {
    return {
      span: {
        class: true,
        'data-formula': true,
        contenteditable: true,
      }
    };
  }
  render() { return document.createElement('button'); }
  surround() {}
  checkState() { return false; }
}

class CitationSanitizerTool {
  static get isInline() { return true; }
  static get isReadOnlySupported() { return true; }
  static get sanitize() {
    return {
      cite: {
        class: true,
        'data-citation': true,
        'data-ref-id': true,
      }
    };
  }
  render() { return document.createElement('button'); }
  surround() {}
  checkState() { return false; }
}

class CustomFormatsSanitizerTool {
  static get isInline() { return true; }
  static get isReadOnlySupported() { return true; }
  static get sanitize() {
    return {
      u: {},
      strike: {},
      s: {},
      code: {
        class: true
      },
      mark: {
        class: true,
        style: true,
        'data-comment-id': true,
        'data-author': true,
        title: true,
      },
      del: {
        class: true,
        style: true,
        'data-suggestion-id': true,
        'data-author': true,
        title: true,
      },
      ins: {
        class: true,
        style: true,
        'data-suggestion-id': true,
        'data-author': true,
        title: true,
      },
      sup: {},
      sub: {},
      b: {},
      strong: {},
      i: {},
      em: {},
      a: {
        href: true,
        target: true,
        rel: true,
        class: true
      },
      div: {
        class: true,
        style: true,
        contenteditable: true
      },
      span: {
        class: true,
        style: true,
        'data-formula': true,
        contenteditable: true
      },
      button: {
        class: true,
        style: true,
        onclick: true
      }
    };
  }
  render() { return document.createElement('button'); }
  surround() {}
  checkState() { return false; }
}

// Storage keys
const STORAGE_KEY = 'scholarflow.editorjs.content.v1';
const ALIGNMENT_KEY = 'scholarflow.editorjs.alignments.v1';

export interface EditorJsMethods {
  undo: () => void;
  redo: () => void;
  setBlockType: (type: string) => void;
  toggleInlineFormat: (format: string, color?: string) => void;
  setBlockAlignment: (align: string) => void;
  insertCitation: (label?: string, referenceId?: string) => void;
  insertImage: (url: string) => void;
  insertTable: () => void;
  insertCodeBlock: () => void;
  insertMathBlock: () => void;
  insertInlineEquation: (formula?: string) => void;
  saveSelectionRange: () => void;
  insertText: (text: string) => void;
  setFontSize: (size: string) => void;
  insertBibliographyText: (text: string) => void;
  upsertBibliography: (entries: Array<{ label: string; formatted: string }>, isFreeTier?: boolean) => void;
  renderContent: (data: any) => void;
  insertCitationSearch: () => void;
  insertCitationAtSearch: (label: string, referenceId: string) => void;
  cancelCitationSearch: () => void;
  addCommentMark: (commentId: string, authorName?: string) => void;
  highlightAndRemoveCommentMark: (commentId: string) => void;
  scrollToCommentMark: (commentId: string) => void;
  syncCommentMarks?: (comments: Array<{ id: string; selected_text?: string | null; author?: string; block_id?: string | null; resolved?: boolean }>) => void;
  addSuggestionMark?: (suggestionId: string, oldText: string, newText: string, authorName?: string) => void;
  acceptSuggestion?: (suggestionId: string) => void;
  rejectSuggestion?: (suggestionId: string) => void;
}

function scrambleHtmlText(html: string): string {
  let insideTag = false;
  let result = '';
  for (let i = 0; i < html.length; i++) {
    const char = html[i];
    if (char === '<') {
      insideTag = true;
      result += char;
    } else if (char === '>') {
      insideTag = false;
      result += char;
    } else if (insideTag) {
      result += char;
    } else if (char === '&') {
      // Check if this is an HTML entity (e.g. &nbsp;, &amp;, &lt;, &gt;)
      const semiIndex = html.indexOf(';', i);
      if (semiIndex > i && semiIndex - i < 10) {
        const entityContent = html.substring(i + 1, semiIndex);
        if (/^[a-zA-Z0-9#]+$/.test(entityContent)) {
          // It is a valid HTML entity, skip scrambling it
          result += html.substring(i, semiIndex + 1);
          i = semiIndex; // advance index to the semicolon
          continue;
        }
      }
      result += char;
    } else {
      if (/[a-zA-Z]/.test(char)) {
        result += char === char.toUpperCase() ? 'X' : 'x';
      } else if (/[0-9]/.test(char)) {
        result += '0';
      } else {
        result += char;
      }
    }
  }
  return result;
}

interface EditorJsEditorProps {
  initialContent?: any;
  readOnly?: boolean;
  onBlockTypeChange?: (type: string) => void;
  onAlignmentChange?: (align: string) => void;
  onStatsChange?: (stats: { wordCount: number; characterCount: number; citationCount: number; activeReferenceIds?: string[] }) => void;
  onCiteClick?: (refId: string, label: string, citedSentence: string) => void;
  onCommentMarkClick?: (commentId: string) => void;
  onContentChange?: (content: any) => void;
  onCitationSearchChange?: (query: string, rect: DOMRect) => void;
  onCitationSearchCancel?: () => void;
  onEditInlineEquation?: (formula: string, onSave: (newFormula: string) => void) => void;
  onInsertLinkRequest?: (defaultUrl: string, onSave: (url: string) => void, onUnlink?: () => void) => void;
}

export const EditorJsEditor = forwardRef<EditorJsMethods, EditorJsEditorProps>(({ 
  initialContent,
  readOnly = false,
  onBlockTypeChange, 
  onAlignmentChange,
  onStatsChange,
  onCiteClick,
  onCommentMarkClick,
  onContentChange,
  onCitationSearchChange,
  onCitationSearchCancel,
  onEditInlineEquation,
  onInsertLinkRequest
}, ref) => {
  const editorRef = useRef<EditorJS | null>(null);
  const undoRef = useRef<any>(null);
  const pendingContentRef = useRef<any>(null);
  const isRenderingRef = useRef<boolean>(false);
  const holderId = 'editorjs-holder';
  const [isReady, setIsReady] = useState(false);
  const activeBlockIndexRef = useRef<number>(0);
  const lastSelectionRangeRef = useRef<Range | null>(null);
  const lastHighlightedRangeRef = useRef<Range | null>(null);
  const savedLinkRangeRef = useRef<Range | null>(null);
  // Tracks index of bibliography header block (-1 = not yet inserted)
  const bibliographyBlockIndexRef = useRef<number>(-1);

    // Adjust heights of all code textareas based on their content scrollHeight
    const adjustAllCodeTextareaHeights = () => {
      if (typeof document === 'undefined') return;
      const textareas = document.querySelectorAll('.ce-code__textarea') as NodeListOf<HTMLTextAreaElement>;
      textareas.forEach((textarea) => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      });
    };

  // Restore alignment styles to all editor blocks based on saved localStorage map
  const restoreBlockAlignments = () => {
    if (!editorRef.current || !editorRef.current.blocks) return;
    try {
      const alignments = JSON.parse(localStorage.getItem(ALIGNMENT_KEY) || '{}');
      const count = editorRef.current.blocks.getBlocksCount();
      for (let i = 0; i < count; i++) {
        const block = editorRef.current.blocks.getBlockByIndex(i);
        if (block && alignments[block.id]) {
          const contentEditable = block.holder.querySelector('[contenteditable="true"], [contenteditable="false"], .ce-paragraph, .ce-header, .cdx-block') as HTMLElement;
          if (contentEditable) {
            contentEditable.style.textAlign = alignments[block.id];
          }
        }
      }
    } catch (e) {
      console.warn('Error restoring alignments:', e);
    }
  };

  // Re-render all inline math spans on load or update
  const renderAllInlineMath = () => {
    const container = document.getElementById(holderId);
    if (!container) return;
    const mathSpans = container.querySelectorAll('.sf-inline-math');
    mathSpans.forEach((span) => {
      const formula = span.getAttribute('data-formula');
      if (formula) {
        span.setAttribute('contenteditable', 'false');
        try {
          import('katex').then((kateMod) => {
            const katex = kateMod.default;
            katex.render(formula, span as HTMLElement, { displayMode: false, throwOnError: false });
          });
        } catch (e) {
          console.error('KaTeX inline render error:', e);
        }
      }
    });
  };

  // Helper to clean HTML string (strip KaTeX rendered inner HTML inside math spans)
  const cleanHtmlContent = (html: string) => {
    if (typeof document === 'undefined') return html;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const mathSpans = tempDiv.querySelectorAll('.sf-inline-math');
    mathSpans.forEach((span) => {
      span.innerHTML = '';
    });
    const searchSpans = tempDiv.querySelectorAll('span[data-citation-search="true"]');
    searchSpans.forEach((span) => {
      const textNode = document.createTextNode(span.textContent || '');
      span.parentNode?.replaceChild(textNode, span);
    });

    // Clean premium banner and unwrap blurred bibliography
    const premiumBanner = tempDiv.querySelector('.sf-premium-banner-container');
    if (premiumBanner) {
      premiumBanner.remove();
    }
    const blurredContainer = tempDiv.querySelector('.sf-bibliography-blur');
    if (blurredContainer) {
      const fragment = document.createDocumentFragment();
      while (blurredContainer.firstChild) {
        fragment.appendChild(blurredContainer.firstChild);
      }
      blurredContainer.parentNode?.replaceChild(fragment, blurredContainer);
    }

    return tempDiv.innerHTML;
  };

  // Helper to clean saved EditorJS JSON content before writing to database
  const cleanSavedContent = (content: any) => {
    if (!content || !content.blocks) return content;
    
    // Deep clone content to avoid mutating the live state
    const cloned = JSON.parse(JSON.stringify(content));
    
    cloned.blocks.forEach((block: any) => {
      if (block.data && typeof block.data.text === 'string') {
        block.data.text = cleanHtmlContent(block.data.text);
      }
    });
    
    return cloned;
  };

  // Helper to save cleaned content (without KaTeX rendered inner HTML inside math spans)
  const saveCleanContent = async () => {
    if (!editorRef.current) return null;
    const content = await editorRef.current.save();
    return cleanSavedContent(content);
  };

  // Calculate live word, character, and citation counts directly from the editor DOM
  const calculateLiveStats = () => {
    const holder = document.getElementById(holderId);
    if (!holder) return;
    const text = holder.innerText || '';
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    
    const citationEls = Array.from(holder.querySelectorAll('cite[data-citation]'))
      .filter(el => el.textContent && el.textContent.trim().length > 0);
    const citations = citationEls.length;
    const activeReferenceIds = citationEls
      .map(el => el.getAttribute('data-ref-id'))
      .filter(Boolean) as string[];
    
    onStatsChange?.({
      wordCount: words,
      characterCount: chars,
      citationCount: citations,
      activeReferenceIds
    } as any);
  };

  // Helper to sync currently active block type and alignment back to the parent toolbar
  const syncActiveBlockType = async () => {
    if (!editorRef.current || !editorRef.current.blocks) return;
    try {
      const index = editorRef.current.blocks.getCurrentBlockIndex();
      if (index >= 0) {
        activeBlockIndexRef.current = index;
        const block = await editorRef.current.blocks.getBlockByIndex(index);
        if (block) {
          // Sync block type
          const name = block.name; // 'paragraph', 'header', etc.
          if (name === 'paragraph') {
            onBlockTypeChange?.('paragraph');
          } else if (name === 'header') {
            const data = (await block.save()) as any;
            const level = data?.data?.level || 1;
            onBlockTypeChange?.(`h${level}`);
          }

          // Sync alignment
          const contentEditable = block.holder.querySelector('[contenteditable="true"]') as HTMLElement;
          if (contentEditable) {
            const align = contentEditable.style.textAlign || 'left';
            onAlignmentChange?.(align);
          }
        }
      }
      
      // Keep alignment styles intact (EditorJS re-renders block wrappers occasionally)
      restoreBlockAlignments();
    } catch (e) {
      // Quiet fail if EditorJS is busy or uninitialized
    }
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      const holder = document.getElementById(holderId);
      if (holder && holder.contains(range.commonAncestorContainer)) {
        lastSelectionRangeRef.current = range.cloneRange();

        // Simpan range yang diblok (highlighted) jika tidak collapsed
        if (!selection.isCollapsed) {
          lastHighlightedRangeRef.current = range.cloneRange();
        }

        // Cek apakah kursor berada di dalam span pencarian sitasi
        let anchorNode = selection.anchorNode;
        let parent = anchorNode as HTMLElement | null;
        if (parent && parent.nodeType === Node.TEXT_NODE) {
          parent = parent.parentElement;
        }

        let insideSearchSpan = false;
        if (parent && parent.getAttribute && parent.getAttribute('data-citation-search') === 'true') {
          insideSearchSpan = true;
          const query = parent.textContent || '';
          const rect = parent.getBoundingClientRect();
          onCitationSearchChange?.(query, rect);
        }

        if (!insideSearchSpan) {
          onCitationSearchCancel?.();
        }
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [holderId, onCitationSearchChange, onCitationSearchCancel]);

  const insertInlineEquationLocal = (customFormula?: string) => {
    const selection = window.getSelection();
    let range: Range | null = null;

    if (selection && selection.rangeCount > 0) {
      const activeRange = selection.getRangeAt(0);
      const holder = document.getElementById(holderId);
      if (holder && holder.contains(activeRange.commonAncestorContainer)) {
        range = activeRange;
      }
    }

    if (!range && lastSelectionRangeRef.current) {
      range = lastSelectionRangeRef.current;
    }

    if (!range) {
      alert('Posisikan kursor ketik Anda di dalam dokumen teks editor terlebih dahulu sebelum menyisipkan rumus.');
      return;
    }

    const selectedText = range.toString().trim() || 'E = mc^2';

    let formula = customFormula;
    if (formula === undefined) {
      const result = prompt('Masukkan rumus LaTeX (misal: \\frac{a}{b}):', selectedText);
      if (result === null) return; // cancelled
      formula = result;
    }

    const span = document.createElement('span');
    span.className = 'sf-inline-math inline-block align-middle my-0.5 mx-1 px-1 bg-indigo-50/50 hover:bg-indigo-100/50 rounded border border-indigo-100 hover:border-indigo-200 transition cursor-pointer';
    span.setAttribute('data-formula', formula);
    span.setAttribute('contenteditable', 'false');

    try {
      import('katex').then((kateMod) => {
        const katex = kateMod.default;
        katex.render(formula!, span, { displayMode: false, throwOnError: false });
      });
    } catch (err) {
      span.textContent = `\\( ${formula} \\)`;
    }

    // 1. Focus the contenteditable block parent first
    const contentEditable = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
      ? range.commonAncestorContainer.parentElement
      : range.commonAncestorContainer as HTMLElement;
    const blockEl = contentEditable?.closest('[contenteditable="true"]') as HTMLElement | null;
    if (blockEl) {
      blockEl.focus();
    }

    // 2. Restore range selection in browser active session
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }

    // 3. Perform DOM insertion
    range.deleteContents();
    range.insertNode(span);

    // 4. Dispatch input event to let EditorJS know of changes
    if (blockEl) {
      const event = new Event('input', { bubbles: true });
      blockEl.dispatchEvent(event);
    }

    // 5. Place cursor right after the newly inserted formula span
    if (sel) {
      const newRange = document.createRange();
      newRange.setStartAfter(span);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
      lastSelectionRangeRef.current = newRange.cloneRange();
    }

    calculateLiveStats();

    // Auto save to trigger parent state update
    if (onContentChange && editorRef.current) {
      saveCleanContent().then(content => {
        if (content) onContentChange(content);
      }).catch(console.error);
    }
  };

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    undo: () => {
      if (undoRef.current) {
        undoRef.current.undo();
      }
    },
    redo: () => {
      if (undoRef.current) {
        undoRef.current.redo();
      }
    },
    setBlockType: async (type: string) => {
      if (!editorRef.current || !editorRef.current.blocks) return;
      const index = activeBlockIndexRef.current;
      if (index < 0) {
        console.warn('ScholarFlow setBlockType: No active block index found');
        return;
      }

      try {
        const block = await editorRef.current.blocks.getBlockByIndex(index);
        if (!block) {
          console.warn('ScholarFlow setBlockType: Block not found at index', index);
          return;
        }

        const data = (await block.save()) as any;
        const currentText = data?.data?.text || '';
        
        console.log('ScholarFlow setBlockType Conversion request:', {
          index,
          blockId: block.id,
          currentBlockType: block.name,
          targetType: type,
          currentText
        });

        const blocks = editorRef.current.blocks as any;
        
        // 1. Try blocks.convert() API first if supported
        if (typeof blocks.convert === 'function') {
          console.log('ScholarFlow: converting via blocks.convert with blockId:', block.id);
          const targetTool = type === 'paragraph' ? 'paragraph' : 'header';
          await blocks.convert(block.id, targetTool);
          
          // Refresh block reference and update data explicitly to preserve text and apply properties
          const updatedBlock = await editorRef.current.blocks.getBlockByIndex(index);
          if (updatedBlock) {
            if (type === 'paragraph') {
              await blocks.update(updatedBlock.id, { text: currentText });
            } else if (type.startsWith('h')) {
              const level = parseInt(type.substring(1), 10);
              await blocks.update(updatedBlock.id, { text: currentText, level });
            }
          }
        } else {
          // 2. Fallback: blocks.insert with replace: true (omitting empty config)
          console.log('ScholarFlow: replacing via blocks.insert');
          const blockType = type === 'paragraph' ? 'paragraph' : 'header';
          const blockData = type === 'paragraph' 
            ? { text: currentText } 
            : { text: currentText, level: parseInt(type.substring(1), 10) };

          await blocks.insert(blockType, blockData, undefined, index, true, true);
        }

        // Refocus caret back to the block so selection/focus is not lost
        setTimeout(() => {
          editorRef.current?.caret.setToBlock(index, 'end');
          restoreBlockAlignments();
          calculateLiveStats();
        }, 50);
      } catch (err) {
        console.error('ScholarFlow setBlockType error:', err);
      }
    },
    toggleInlineFormat: (format: string, color?: string) => {
      const toggleTag = (tagName: string, className?: string) => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
        
        const range = selection.getRangeAt(0);
        
        // Find closest parent that matches the holder container or tag
        let parent = range.commonAncestorContainer as HTMLElement | null;
        if (parent && parent.nodeType === Node.TEXT_NODE) {
          parent = parent.parentElement;
        }
        
        const targetTag = tagName.toUpperCase();
        let node: HTMLElement | null = parent;
        let isWrapped = false;
        
        while (node && node.id !== holderId && node.tagName !== 'DIV') {
          if (node.tagName === targetTag && (!className || node.classList.contains(className))) {
            isWrapped = true;
            break;
          }
          node = node.parentElement;
        }
        
        if (isWrapped && node) {
          // Unwrap: replace node with its child nodes
          const fragment = document.createDocumentFragment();
          while (node.firstChild) {
            fragment.appendChild(node.firstChild);
          }
          node.parentNode?.replaceChild(fragment, node);
        } else {
          // Wrap: wrap selection contents in a new element
          const element = document.createElement(tagName);
          if (className) {
            element.className = className;
          }
          try {
            const fragment = range.extractContents();
            element.appendChild(fragment);
            range.insertNode(element);
            
            // Re-select wrapped element
            const newRange = document.createRange();
            newRange.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(newRange);
          } catch (e) {
            console.warn('Failed to wrap selection:', e);
          }
        }
        calculateLiveStats();
      };

      if (format === 'bold') {
        toggleTag('b');
      } else if (format === 'italic') {
        toggleTag('i');
      } else if (format === 'underline') {
        toggleTag('u');
      } else if (format === 'strikethrough') {
        toggleTag('s');
      } else if (format === 'superscript') {
        toggleTag('sup');
      } else if (format === 'subscript') {
        toggleTag('sub');
      } else if (format === 'highlight') {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
        
        const range = selection.getRangeAt(0);
        
        const getColorClass = (colorKey?: string) => {
          switch (colorKey) {
            case 'green':
              return 'bg-green-200/80 text-green-900 px-1 py-0.5 rounded';
            case 'blue':
              return 'bg-sky-200/80 text-sky-900 px-1 py-0.5 rounded';
            case 'pink':
              return 'bg-pink-200/80 text-pink-900 px-1 py-0.5 rounded';
            case 'purple':
              return 'bg-purple-200/80 text-purple-950 px-1 py-0.5 rounded';
            case 'yellow':
            default:
              return 'bg-yellow-200/80 text-yellow-900 px-1 py-0.5 rounded';
          }
        };

        // Find closest parent that matches the holder container or tag
        let parent = range.commonAncestorContainer as HTMLElement | null;
        if (parent && parent.nodeType === Node.TEXT_NODE) {
          parent = parent.parentElement;
        }
        
        let existingMark: HTMLElement | null = null;
        let node = parent;
        while (node && node.id !== holderId && node.tagName !== 'DIV') {
          if (node.tagName === 'MARK') {
            existingMark = node;
            break;
          }
          node = node.parentElement;
        }

        // Also check if selection contains a MARK tag
        if (!existingMark) {
          try {
            const container = range.commonAncestorContainer;
            const parentEl = container.nodeType === Node.TEXT_NODE ? container.parentElement : container as HTMLElement;
            if (parentEl) {
              const markTags = parentEl.getElementsByTagName('mark');
              for (let i = 0; i < markTags.length; i++) {
                if (selection.containsNode(markTags[i], true)) {
                  existingMark = markTags[i];
                  break;
                }
              }
            }
          } catch (e) {}
        }

        if (existingMark) {
          if (color === 'clear') {
            // Unwrap: replace mark tag with its children
            const fragment = document.createDocumentFragment();
            while (existingMark.firstChild) {
              fragment.appendChild(existingMark.firstChild);
            }
            existingMark.parentNode?.replaceChild(fragment, existingMark);
          } else {
            // Update class name with new color
            existingMark.className = getColorClass(color);
          }
        } else if (color !== 'clear') {
          // Wrap selection in a new MARK tag
          const element = document.createElement('mark');
          element.className = getColorClass(color);
          try {
            const fragment = range.extractContents();
            element.appendChild(fragment);
            range.insertNode(element);
            
            // Re-select wrapped element
            const newRange = document.createRange();
            newRange.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(newRange);
          } catch (e) {
            console.warn('Failed to wrap selection with mark:', e);
          }
        }
      } else if (format === 'code') {
        toggleTag('code', 'bg-slate-100 dark:bg-slate-800 text-rose-600 px-1 py-0.5 rounded font-mono text-xs');
      } else if (format === 'link') {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) return;
        const range = selection.getRangeAt(0);
        let existingLink: HTMLAnchorElement | null = null;
        
        // 1. Check if anchorNode is inside an A tag
        let anchorParent = selection.anchorNode
          ? (selection.anchorNode.nodeType === Node.TEXT_NODE 
              ? selection.anchorNode.parentElement 
              : selection.anchorNode as HTMLElement)
          : null;
        let node = anchorParent;
        while (node && node.id !== holderId && node.tagName !== 'DIV') {
          if (node.tagName === 'A') {
            existingLink = node as HTMLAnchorElement;
            break;
          }
          node = node.parentElement;
        }

        // 2. Check if focusNode is inside an A tag if anchorNode didn't find one
        if (!existingLink) {
          let focusParent = selection.focusNode
            ? (selection.focusNode.nodeType === Node.TEXT_NODE 
                ? selection.focusNode.parentElement 
                : selection.focusNode as HTMLElement)
            : null;
          node = focusParent;
          while (node && node.id !== holderId && node.tagName !== 'DIV') {
            if (node.tagName === 'A') {
              existingLink = node as HTMLAnchorElement;
              break;
            }
            node = node.parentElement;
          }
        }

        // 3. Check if selection contains an A tag
        if (!existingLink) {
          try {
            const container = range.commonAncestorContainer;
            const parentEl = container.nodeType === Node.TEXT_NODE ? container.parentElement : container as HTMLElement;
            if (parentEl) {
              const aTags = parentEl.getElementsByTagName('a');
              for (let i = 0; i < aTags.length; i++) {
                if (selection.containsNode(aTags[i], true)) {
                  existingLink = aTags[i];
                  break;
                }
              }
            }
          } catch (e) {
            // ignore selection containsNode issue
          }
        }
        if (existingLink) {
          const linkEl = existingLink;
          
          const handleUpdateLink = (url: string) => {
            if (url.trim() === '') {
              handleUnlink();
            } else {
              linkEl.href = url;
              calculateLiveStats();
              if (onContentChange && editorRef.current) {
                saveCleanContent().then(content => {
                  if (content) onContentChange(content);
                }).catch(console.error);
              }
            }
          };

          const handleUnlink = () => {
            const fragment = document.createDocumentFragment();
            while (linkEl.firstChild) {
              fragment.appendChild(linkEl.firstChild);
            }
            linkEl.parentNode?.replaceChild(fragment, linkEl);
            calculateLiveStats();
            if (onContentChange && editorRef.current) {
              saveCleanContent().then(content => {
                if (content) onContentChange(content);
              }).catch(console.error);
            }
          };

          if (onInsertLinkRequest) {
            onInsertLinkRequest(linkEl.getAttribute('href') || '', handleUpdateLink, handleUnlink);
          } else {
            const url = prompt('Edit link URL:', linkEl.getAttribute('href') || '');
            if (url !== null) {
              handleUpdateLink(url);
            }
          }
        } else {
          // Save range so we can insert the link later
          savedLinkRangeRef.current = range.cloneRange();
          
          const handleSaveLink = (url: string) => {
            const savedRange = savedLinkRangeRef.current;
            if (!savedRange) return;
            
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.className = 'text-indigo-650 underline';
            
            try {
              // Restore focus to editor block first
              const contentEditable = savedRange.commonAncestorContainer.nodeType === Node.TEXT_NODE
                ? savedRange.commonAncestorContainer.parentElement
                : savedRange.commonAncestorContainer as HTMLElement;
              const blockEl = contentEditable?.closest('[contenteditable="true"]') as HTMLElement | null;
              if (blockEl) {
                blockEl.focus();
              }
              
              const sel = window.getSelection();
              if (sel) {
                sel.removeAllRanges();
                sel.addRange(savedRange);
              }
              
              const fragment = savedRange.extractContents();
              a.appendChild(fragment);
              savedRange.insertNode(a);
              
              // Trigger save
              calculateLiveStats();
              if (onContentChange && editorRef.current) {
                saveCleanContent().then(content => {
                  if (content) onContentChange(content);
                }).catch(console.error);
              }
            } catch (e) {
              console.warn('Failed to wrap selection with link:', e);
            }
            
            savedLinkRangeRef.current = null;
          };

          if (onInsertLinkRequest) {
            onInsertLinkRequest('', handleSaveLink);
          } else {
            const url = prompt('Enter link URL:');
            if (url) {
              handleSaveLink(url);
            }
          }
        }
        calculateLiveStats();
      }

      // Auto save to trigger parent state update
      if (onContentChange && editorRef.current) {
        saveCleanContent().then(content => {
          if (content) onContentChange(content);
        }).catch(console.error);
      }
    },
    setBlockAlignment: async (align: string) => {
      if (!editorRef.current || !editorRef.current.blocks) return;
      const index = activeBlockIndexRef.current;
      if (index < 0) return;

      try {
        const block = await editorRef.current.blocks.getBlockByIndex(index);
        if (block) {
          // Set element style in DOM directly
          const contentEditable = block.holder.querySelector('[contenteditable="true"]') as HTMLElement;
          if (contentEditable) {
            contentEditable.style.textAlign = align;
            
            // Save state to localStorage to persist across refreshes
            const alignments = JSON.parse(localStorage.getItem(ALIGNMENT_KEY) || '{}');
            alignments[block.id] = align;
            localStorage.setItem(ALIGNMENT_KEY, JSON.stringify(alignments));
            
            // Callback to update parent layout toolbar state
            onAlignmentChange?.(align);
          }
        }
      } catch (err) {
        console.error('ScholarFlow setBlockAlignment error:', err);
      }
    },
    insertCitation: (label?: string, referenceId?: string) => {
      const citationLabel = label || `C${Date.now()}`;
      const selection = window.getSelection();
      if (!selection) return;

      let range: Range | null = null;
      const holder = document.getElementById(holderId);
      const selectionRange = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      const isSelectionInside = holder && selectionRange && holder.contains(selectionRange.commonAncestorContainer);

      if (isSelectionInside && selectionRange && !selection.isCollapsed) {
        range = selectionRange;
      } else if (lastHighlightedRangeRef.current) {
        range = lastHighlightedRangeRef.current;
        lastHighlightedRangeRef.current = null; // clear after use
      } else if (selectionRange && isSelectionInside) {
        range = selectionRange;
      } else if (lastSelectionRangeRef.current) {
        range = lastSelectionRangeRef.current;
      }

      if (!range) return;

      // Collapse to END of selection first — citation appears AFTER the selected text
      range.collapse(false);

      const cite = document.createElement('cite');
      cite.setAttribute('data-citation', 'true');
      if (referenceId) {
        cite.setAttribute('data-ref-id', referenceId);
      }
      cite.className = 'text-indigo-600 font-semibold not-italic cursor-pointer hover:underline';
      cite.textContent = ` [${citationLabel}]`;
      range.insertNode(cite);
      
      // Move cursor to right after the inserted citation
      const newRange = document.createRange();
      newRange.setStartAfter(cite);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
      
      // Update last saved range
      lastSelectionRangeRef.current = newRange.cloneRange();
      calculateLiveStats();
    },
    insertCitationSearch: () => {
      const selection = window.getSelection();
      if (!selection) return;

      let range: Range | null = null;
      if (selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
      } else if (lastSelectionRangeRef.current) {
        range = lastSelectionRangeRef.current;
      }

      const holder = document.getElementById(holderId);
      const isInside = holder && range && holder.contains(range.commonAncestorContainer);
      if (!isInside && lastSelectionRangeRef.current) {
        range = lastSelectionRangeRef.current;
      }

      if (!range) return;

      // Collapse to END of selection first
      range.collapse(false);

      // Create search span
      const span = document.createElement('span');
      span.setAttribute('data-citation-search', 'true');
      span.className = 'sf-citation-search bg-indigo-50 border border-indigo-200 text-indigo-850 rounded px-1.5 py-0.5 mx-1 font-semibold outline-none';
      span.textContent = '\u00A0'; // non-breaking space

      range.insertNode(span);

      // Move cursor inside the span
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      selection.removeAllRanges();
      selection.addRange(newRange);

      lastSelectionRangeRef.current = newRange.cloneRange();
      calculateLiveStats();
    },
    insertCitationAtSearch: (label: string, referenceId: string) => {
      const span = document.querySelector('span[data-citation-search="true"]');
      if (span && span.parentNode) {
        const cite = document.createElement('cite');
        cite.setAttribute('data-citation', 'true');
        cite.setAttribute('data-ref-id', referenceId);
        cite.className = 'text-indigo-600 font-semibold not-italic cursor-pointer hover:underline';
        cite.textContent = ` [${label}]`;
        
        span.parentNode.replaceChild(cite, span);

        // Move cursor after the inserted citation
        const selection = window.getSelection();
        if (selection) {
          const newRange = document.createRange();
          newRange.setStartAfter(cite);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
          lastSelectionRangeRef.current = newRange.cloneRange();
        }
        
        calculateLiveStats();

        if (onContentChange && editorRef.current) {
          saveCleanContent().then(content => {
            if (content) onContentChange(content);
          }).catch(console.error);
        }
      }
    },
    cancelCitationSearch: () => {
      const span = document.querySelector('span[data-citation-search="true"]');
      if (span && span.parentNode) {
        const textNode = document.createTextNode(span.textContent || '');
        span.parentNode.replaceChild(textNode, span);
        
        // Refocus selection
        const selection = window.getSelection();
        if (selection) {
          const newRange = document.createRange();
          newRange.setStartAfter(textNode);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
          lastSelectionRangeRef.current = newRange.cloneRange();
        }
        
        calculateLiveStats();
      }
    },
    insertImage: (url: string) => {
      if (!editorRef.current || !editorRef.current.blocks) return;
      editorRef.current.blocks.insert('image', {
        file: {
          url: url
        }
      }, undefined, activeBlockIndexRef.current + 1, true);
      calculateLiveStats();
    },
    insertTable: () => {
      if (!editorRef.current || !editorRef.current.blocks) return;
      editorRef.current.blocks.insert('table', {
        stretched: false,
        withHeadings: true,
        content: [
          ['Col 1', 'Col 2'],
          ['Val 1', 'Val 2']
        ]
      }, undefined, activeBlockIndexRef.current + 1, true);
      calculateLiveStats();
    },
    insertCodeBlock: () => {
      if (!editorRef.current || !editorRef.current.blocks) return;
      editorRef.current.blocks.insert('code', {
        code: '// Write code here\n'
      }, undefined, activeBlockIndexRef.current + 1, true);
      calculateLiveStats();
    },
    insertMathBlock: () => {
      if (!editorRef.current || !editorRef.current.blocks) return;
      editorRef.current.blocks.insert('math', {
        formula: ''
      }, undefined, activeBlockIndexRef.current + 1, true);
      calculateLiveStats();
    },
    insertInlineEquation: (formula?: string) => {
      insertInlineEquationLocal(formula);
    },
    saveSelectionRange: () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const holder = document.getElementById(holderId);
        if (holder && holder.contains(range.commonAncestorContainer)) {
          lastSelectionRangeRef.current = range.cloneRange();
        }
      }
    },
    insertText: (text: string) => {
      const selection = window.getSelection();
      let targetRange = lastHighlightedRangeRef.current || lastSelectionRangeRef.current;

      if (targetRange) {
        try {
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(targetRange);
          }
          let container: HTMLElement | null = targetRange.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
            ? (targetRange.commonAncestorContainer as HTMLElement)
            : targetRange.commonAncestorContainer.parentElement;
          if (container) {
            const contentEditable = container.closest('[contenteditable="true"]') as HTMLElement;
            if (contentEditable) {
              contentEditable.focus();
            }
          }
        } catch (e) {
          console.warn('Could not restore selection before insertText:', e);
        }
      }

      let success = false;
      try {
        success = document.execCommand('insertText', false, text);
      } catch (cmdErr) {
        success = false;
      }

      if (!success && targetRange) {
        try {
          targetRange.deleteContents();
          const textNode = document.createTextNode(text);
          targetRange.insertNode(textNode);
          const newRange = document.createRange();
          newRange.setStartAfter(textNode);
          newRange.setEndAfter(textNode);
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
          lastSelectionRangeRef.current = newRange;
          lastHighlightedRangeRef.current = null;
        } catch (rangeErr) {
          console.error('Failed direct range replacement:', rangeErr);
        }
      }

      if (editorRef.current && editorRef.current.save) {
        editorRef.current.save().then((outputData: any) => {
          if (onContentChange) {
            onContentChange(outputData);
          }
        }).catch((saveErr: any) => console.error('Save error after insertText:', saveErr));
      }

      calculateLiveStats();
    },
    setFontSize: (size: string) => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      if (range.collapsed) return;

      // Find if the common ancestor is already a span with font size
      let container: HTMLElement | null = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
        ? (range.commonAncestorContainer as HTMLElement)
        : range.commonAncestorContainer.parentElement;

      // If selection is exactly matching/inside a span that already has a font-size
      if (container && container.tagName === 'SPAN' && container.style.fontSize && container.innerText === range.toString()) {
        if (!size) {
          // Reset/Clear font size
          container.style.fontSize = '';
          if (container.style.length === 0 && !container.className) {
            const parent = container.parentNode;
            if (parent) {
              while (container.firstChild) {
                parent.insertBefore(container.firstChild, container);
              }
              parent.removeChild(container);
            }
          }
        } else {
          container.style.fontSize = size;
        }
        calculateLiveStats();
        return;
      }

      // Fallback: extract contents and wrap in new span
      const documentFragment = range.extractContents();
      
      // Clean up child spans with font size to prevent endless nesting
      const childSpans = documentFragment.querySelectorAll('span');
      childSpans.forEach(span => {
        if (span.style.fontSize) {
          if (!size) {
            span.style.fontSize = '';
          } else {
            span.style.fontSize = size;
          }
        }
      });

      if (!size) {
        // Resetting / clearing size: insert cleaned fragment directly
        range.insertNode(documentFragment);
      } else {
        const wrapperSpan = document.createElement('span');
        wrapperSpan.style.fontSize = size;
        wrapperSpan.appendChild(documentFragment);
        range.insertNode(wrapperSpan);
      }
      
      calculateLiveStats();
    },
    insertBibliographyText: (text: string) => {
      if (!editorRef.current || !editorRef.current.blocks) return;
      const count = editorRef.current.blocks.getBlocksCount();
      editorRef.current.blocks.insert('paragraph', { text }, undefined, count, true);
      calculateLiveStats();
    },
    upsertBibliography: async (entries: Array<{ label: string; formatted: string }>, isFreeTier: boolean = false) => {
      if (!editorRef.current) return;
      try {
        await editorRef.current.isReady;
      } catch (e) {
        return;
      }
      if (!editorRef.current.blocks) return;
      
      const wasReadOnly = editorRef.current.readOnly.isEnabled;
      try {
        isRenderingRef.current = true;
        if (wasReadOnly) {
          await editorRef.current.readOnly.toggle(false);
        }

        // Helper to find the bibliography header block index dynamically in the DOM
        const findBibliographyBlockIndex = (): number => {
          const holder = document.getElementById(holderId);
          if (!holder) return -1;
          const ceBlocks = Array.from(holder.querySelectorAll('.ce-block'));
          return ceBlocks.findIndex(blockEl => {
            const header = blockEl.querySelector('h2, .ce-header, [contenteditable="true"]');
            return header && header.textContent?.trim() === 'Daftar Pustaka / References';
          });
        };

        // Remove all existing bibliography blocks (header + content) to clean up duplicates
        let foundIdx = findBibliographyBlockIndex();
        while (foundIdx >= 0) {
          const total = editorRef.current.blocks.getBlocksCount();
          
          // Pindahkan caret ke block sebelumnya jika caret saat ini berada di dalam block yang akan dihapus
          const currentIdx = editorRef.current.blocks.getCurrentBlockIndex();
          if (currentIdx >= foundIdx && foundIdx > 0) {
            try {
              editorRef.current.caret.setToBlock(foundIdx - 1, 'end');
            } catch (err) {
              console.warn('Gagal memindahkan caret sebelum menghapus block:', err);
            }
          }

          if (foundIdx + 2 < total) {
            const nextNextBlock = editorRef.current.blocks.getBlockByIndex(foundIdx + 2);
            if (nextNextBlock && nextNextBlock.holder.querySelector('.sf-premium-banner-container')) {
              editorRef.current.blocks.delete(foundIdx + 2);
            }
          }

          if (foundIdx + 1 < total) {
            editorRef.current.blocks.delete(foundIdx + 1); // delete content block
          }
          editorRef.current.blocks.delete(foundIdx);       // delete header block
          foundIdx = findBibliographyBlockIndex();
        }

        if (entries.length === 0) {
          calculateLiveStats();
          if (wasReadOnly) {
            await editorRef.current.readOnly.toggle(true);
          }
          return;
        }

        // Fresh block count after deletion
        const insertAt = editorRef.current.blocks.getBlocksCount();

        // Insert References header
        editorRef.current.blocks.insert(
          'header',
          { text: 'Daftar Pustaka / References', level: 2 },
          undefined,
          insertAt,
          true,
        );

        // Build labeled list as HTML paragraph
        let biblioHtml = entries
          .map(e => {
            const formatted = isFreeTier ? scrambleHtmlText(e.formatted) : e.formatted;
            return `[${e.label}] ${formatted}`;
          })
          .join('<br><br>');

        editorRef.current.blocks.insert(
          'paragraph',
          { text: biblioHtml },
          undefined,
          insertAt + 1,
          true,
        );

        if (isFreeTier) {
          // Premium lock card paragraph block
          const bannerHtml = `
            <div class="sf-premium-banner-container" contenteditable="false" style="margin-top: 15px; user-select: none;">
              <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; gap: 15px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="background-color: #6366f1; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; font-size: 14px;">
                    ⚡
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 2px; text-align: left;">
                    <span style="font-size: 13px; font-weight: 700; color: #4338ca;">References are a paid feature</span>
                    <span style="font-size: 11px; color: #6366f1; font-weight: 500;">Upgrade to view, copy, and export references.</span>
                  </div>
                </div>
                <button class="sf-upgrade-btn" style="background-color: #6366f1; color: white; border: none; border-radius: 8px; padding: 8px 16px; font-size: 11px; font-weight: 700; cursor: pointer; transition: background-color 0.2s; flex-shrink: 0;" onclick="window.dispatchEvent(new CustomEvent('sf-trigger-pricing'))">
                  See Pricing
                </button>
              </div>
            </div>
          `;
          
          editorRef.current.blocks.insert(
            'paragraph',
            { text: bannerHtml },
            undefined,
            insertAt + 2,
            true,
          );

          // Apply DOM classes directly to bypass paragraph tool sanitize stripping
          setTimeout(() => {
            try {
              const holder = document.getElementById(holderId);
              if (!holder) return;
              const ceBlocks = Array.from(holder.querySelectorAll('.ce-block'));
              const headerIdx = ceBlocks.findIndex(blockEl => {
                const header = blockEl.querySelector('h2, .ce-header');
                return header && header.textContent?.trim() === 'Daftar Pustaka / References';
              });
              if (headerIdx >= 0 && headerIdx + 1 < ceBlocks.length) {
                const contentBlockEl = ceBlocks[headerIdx + 1];
                const paragraphEl = contentBlockEl.querySelector('.ce-paragraph, [contenteditable]') as HTMLElement | null;
                if (paragraphEl) {
                  paragraphEl.classList.add('sf-bibliography-fade-container', 'sf-bibliography-blur');
                  
                  // Append the fade overlay if not present
                  let overlay = paragraphEl.querySelector('.sf-fade-overlay');
                  if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.className = 'sf-fade-overlay';
                    overlay.setAttribute('contenteditable', 'false');
                    paragraphEl.style.position = 'relative';
                    paragraphEl.appendChild(overlay);
                  }
                }
              }
            } catch (err) {
              console.warn('Error applying bibliography blur class:', err);
            }
          }, 100);
        }

        calculateLiveStats();
        if (wasReadOnly) {
          await editorRef.current.readOnly.toggle(true);
        }
      } catch (err) {
        console.error('Error upserting bibliography:', err);
      } finally {
        setTimeout(() => {
          isRenderingRef.current = false;
          adjustAllCodeTextareaHeights();
        }, 150);
      }
    },
    renderContent: (data: any) => {
      if (editorRef.current && typeof editorRef.current.render === 'function') {
        try {
          isRenderingRef.current = true;
          editorRef.current.render(data)
            .then(() => {
              if (undoRef.current && typeof undoRef.current.initialize === 'function') {
                undoRef.current.initialize(data);
              }
              renderAllInlineMath();
              setTimeout(() => {
                isRenderingRef.current = false;
                adjustAllCodeTextareaHeights();
              }, 150);
            })
            .catch((e) => {
              console.error('EditorJS renderContent promise error:', e);
              isRenderingRef.current = false;
            });
        } catch (e) {
          console.error('EditorJS renderContent error:', e);
          isRenderingRef.current = false;
        }
      } else {
        pendingContentRef.current = data;
      }
    },
    addCommentMark: (commentId: string, authorName?: string) => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const mark = document.createElement('mark');
        mark.className = 'sf-comment-mark';
        mark.setAttribute('data-comment-id', commentId);
        if (authorName) mark.setAttribute('data-author', authorName);
        mark.setAttribute('title', authorName ? `Komentar oleh ${authorName} (Klik untuk lihat)` : 'Klik untuk lihat komentar');
        try {
          range.surroundContents(mark);
        } catch (e) {
          const fragment = range.extractContents();
          mark.appendChild(fragment);
          range.insertNode(mark);
        }

        if (onContentChange && editorRef.current) {
          saveCleanContent().then(content => {
            if (content) onContentChange(content);
          }).catch(console.error);
        }
      }
    },
    highlightAndRemoveCommentMark: (commentId: string) => {
      const holder = document.getElementById(holderId);
      if (!holder) return;
      const markEls = holder.querySelectorAll(`mark[data-comment-id="${commentId}"], .sf-comment-mark[data-comment-id="${commentId}"]`);
      markEls.forEach(markEl => {
        markEl.classList.add('sf-comment-mark-resolving');
        setTimeout(() => {
          const parent = markEl.parentNode;
          if (parent) {
            while (markEl.firstChild) {
              parent.insertBefore(markEl.firstChild, markEl);
            }
            parent.removeChild(markEl);
          }
          if (onContentChange && editorRef.current) {
            saveCleanContent().then(content => {
              if (content) onContentChange(content);
            }).catch(console.error);
          }
        }, 2000);
      });
    },
    scrollToCommentMark: (commentId: string) => {
      const holder = document.getElementById(holderId);
      if (!holder) return;
      const markEl = holder.querySelector(`mark[data-comment-id="${commentId}"], .sf-comment-mark[data-comment-id="${commentId}"]`);
      if (markEl) {
        markEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        markEl.classList.remove('sf-comment-mark-active');
        void (markEl as HTMLElement).offsetWidth;
        markEl.classList.add('sf-comment-mark-active');
        setTimeout(() => {
          markEl.classList.remove('sf-comment-mark-active');
        }, 3000);
      }
    },
    syncCommentMarks: (comments: Array<{ id: string; selected_text?: string | null; author?: string; block_id?: string | null; resolved?: boolean }>) => {
      const holder = document.getElementById(holderId);
      if (!holder || !comments || !Array.isArray(comments) || comments.length === 0) return;

      const activeComments = comments.filter(c => !c.resolved && c.selected_text && c.selected_text.trim().length > 0);

      activeComments.forEach(c => {
        const commentId = c.id;
        const targetText = c.selected_text!.trim();
        const existingMark = holder.querySelector(`mark[data-comment-id="${commentId}"], .sf-comment-mark[data-comment-id="${commentId}"]`);
        
        if (existingMark) return;

        const searchScope = c.block_id 
          ? (holder.querySelector(`[data-id="${c.block_id}"]`) || holder)
          : holder;

        let applied = false;

        const treeWalker = document.createTreeWalker(searchScope, NodeFilter.SHOW_TEXT, null);
        let currentNode = treeWalker.nextNode();

        while (currentNode) {
          const parentEl = currentNode.parentNode as HTMLElement | null;
          if (parentEl && !parentEl.closest('mark[data-comment-id]')) {
            const nodeText = currentNode.nodeValue || '';
            const matchIndex = nodeText.indexOf(targetText);
            if (matchIndex !== -1) {
              try {
                const range = document.createRange();
                range.setStart(currentNode, matchIndex);
                range.setEnd(currentNode, matchIndex + targetText.length);

                const mark = document.createElement('mark');
                mark.className = 'sf-comment-mark';
                mark.setAttribute('data-comment-id', commentId);
                if (c.author) mark.setAttribute('data-author', c.author);
                mark.setAttribute('title', c.author ? `Komentar oleh ${c.author} (Klik untuk lihat)` : 'Klik untuk lihat komentar');

                range.surroundContents(mark);
                applied = true;
                break;
              } catch (e) {
                try {
                  const range = document.createRange();
                  range.setStart(currentNode, matchIndex);
                  range.setEnd(currentNode, matchIndex + targetText.length);
                  const fragment = range.extractContents();
                  const mark = document.createElement('mark');
                  mark.className = 'sf-comment-mark';
                  mark.setAttribute('data-comment-id', commentId);
                  if (c.author) mark.setAttribute('data-author', c.author);
                  mark.setAttribute('title', c.author ? `Komentar oleh ${c.author} (Klik untuk lihat)` : 'Klik untuk lihat komentar');
                  mark.appendChild(fragment);
                  range.insertNode(mark);
                  applied = true;
                  break;
                } catch (err) {
                  console.warn('Failed to wrap selection for comment:', err);
                }
              }
            }
          }
          currentNode = treeWalker.nextNode();
        }

        if (!applied) {
          const blocks = searchScope.querySelectorAll('.ce-block__content, .cdx-block, [contenteditable="true"]');
          const targetBlocks = blocks.length > 0 ? Array.from(blocks) : [searchScope];
          
          for (const blockEl of targetBlocks) {
            const html = blockEl.innerHTML;
            if (html && html.includes(targetText) && !html.includes(`data-comment-id="${commentId}"`)) {
              const authorAttr = c.author ? ` data-author="${c.author.replace(/"/g, '&quot;')}"` : '';
              const titleAttr = ` title="${(c.author ? `Komentar oleh ${c.author} (Klik untuk lihat)` : 'Klik untuk lihat komentar').replace(/"/g, '&quot;')}"`;
              blockEl.innerHTML = html.replace(
                targetText,
                `<mark class="sf-comment-mark" data-comment-id="${commentId}"${authorAttr}${titleAttr}>${targetText}</mark>`
              );
              applied = true;
              break;
            }
          }
        }
      });
    },
    addSuggestionMark: (suggestionId: string, oldText: string, newText: string, authorName?: string) => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const del = document.createElement('del');
        del.className = 'sf-suggestion-del';
        del.setAttribute('data-suggestion-id', suggestionId);
        if (authorName) del.setAttribute('data-author', authorName);
        del.setAttribute('title', authorName ? `Teks lama diusulkan dihapus oleh ${authorName}` : 'Teks lama diusulkan dihapus');
        del.textContent = oldText;

        const ins = document.createElement('ins');
        ins.className = 'sf-suggestion-ins';
        ins.setAttribute('data-suggestion-id', suggestionId);
        if (authorName) ins.setAttribute('data-author', authorName);
        ins.setAttribute('title', authorName ? `Usulan teks baru oleh ${authorName}` : 'Usulan teks baru');
        ins.textContent = newText;

        const container = document.createElement('span');
        container.className = 'sf-suggestion-wrapper';
        container.appendChild(del);
        container.appendChild(ins);

        try {
          range.deleteContents();
          range.insertNode(container);
        } catch (e) {
          console.warn('Failed to insert suggestion mark:', e);
        }

        if (onContentChange && editorRef.current) {
          saveCleanContent().then(content => {
            if (content) onContentChange(content);
          }).catch(console.error);
        }
      }
    },
    acceptSuggestion: (suggestionId: string) => {
      const holder = document.getElementById(holderId);
      if (!holder) return;
      const delEl = holder.querySelector(`del[data-suggestion-id="${suggestionId}"], .sf-suggestion-del[data-suggestion-id="${suggestionId}"]`);
      const insEl = holder.querySelector(`ins[data-suggestion-id="${suggestionId}"], .sf-suggestion-ins[data-suggestion-id="${suggestionId}"]`);
      
      if (delEl) delEl.remove();
      if (insEl) {
        const parent = insEl.parentNode;
        if (parent) {
          while (insEl.firstChild) {
            parent.insertBefore(insEl.firstChild, insEl);
          }
          parent.removeChild(insEl);
        }
      }

      if (onContentChange && editorRef.current) {
        saveCleanContent().then(content => {
          if (content) onContentChange(content);
        }).catch(console.error);
      }
    },
    rejectSuggestion: (suggestionId: string) => {
      const holder = document.getElementById(holderId);
      if (!holder) return;
      const delEl = holder.querySelector(`del[data-suggestion-id="${suggestionId}"], .sf-suggestion-del[data-suggestion-id="${suggestionId}"]`);
      const insEl = holder.querySelector(`ins[data-suggestion-id="${suggestionId}"], .sf-suggestion-ins[data-suggestion-id="${suggestionId}"]`);
      
      if (insEl) insEl.remove();
      if (delEl) {
        const parent = delEl.parentNode;
        if (parent) {
          while (delEl.firstChild) {
            parent.insertBefore(delEl.firstChild, delEl);
          }
          parent.removeChild(delEl);
        }
      }

      if (onContentChange && editorRef.current) {
        saveCleanContent().then(content => {
          if (content) onContentChange(content);
        }).catch(console.error);
      }
    },
  }));

    useEffect(() => {
      if (typeof window === 'undefined') return; // client‑side only
      if (editorRef.current) return;

      let isMounted = true;

      const handleCodeInput = (e: Event) => {
        const target = e.target as HTMLElement;
        if (target && target.classList.contains('ce-code__textarea')) {
          const textarea = target as HTMLTextAreaElement;
          textarea.style.height = 'auto';
          textarea.style.height = textarea.scrollHeight + 'px';
        }
      };
      document.addEventListener('input', handleCodeInput);

    // Dynamically import EditorJS and its plugins to prevent SSR import errors
    import('@editorjs/editorjs')
      .then(({ default: EditorJS }) =>
        Promise.all([
          import('@editorjs/header'),
          import('@editorjs/list'),
          import('@editorjs/image'),
          import('@editorjs/table'),
          import('@editorjs/code'),
          import('editorjs-undo')
        ]).then(([headerMod, listMod, imageMod, tableMod, codeMod, undoMod]) => {
          if (!isMounted) return;

          const Header = headerMod.default;
          const List = listMod.default;
          const ImageTool = imageMod.default;
          const Table = tableMod.default;
          const CodeTool = codeMod.default;
          const Undo = undoMod.default;

          // Ensure the editor container is clean before creating a new instance
          const container = document.getElementById(holderId);
          if (!container) {
            return;
          }
          container.innerHTML = '';

          const editor = new EditorJS({
            holder: holderId,
            autofocus: !readOnly,
            readOnly: readOnly,
            tools: {
              paragraph: {
                sanitize: {
                  div: {
                    class: true,
                    style: true,
                    contenteditable: true,
                  },
                  span: {
                    class: true,
                    style: true,
                  },
                  br: true,
                  a: {
                    href: true,
                    target: true,
                    rel: true,
                  },
                  b: true,
                  i: true,
                  u: true,
                  strong: true,
                  em: true,
                  code: true,
                  mark: {
                    class: true,
                    style: true,
                    'data-comment-id': true,
                    'data-author': true,
                    title: true,
                  },
                  del: {
                    class: true,
                    style: true,
                    'data-suggestion-id': true,
                    'data-author': true,
                    title: true,
                  },
                  ins: {
                    class: true,
                    style: true,
                    'data-suggestion-id': true,
                    'data-author': true,
                    title: true,
                  },
                  cite: {
                    class: true,
                    'data-citation': true,
                    'data-ref-id': true,
                  }
                }
              } as any,
              header: Header,
              list: List,
              image: {
                class: ImageTool,
                config: {
                  uploader: {
                    uploadByFile(file: File) {
                      return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          resolve({
                            success: 1,
                            file: {
                              url: e.target?.result,
                            }
                          });
                        };
                        reader.readAsDataURL(file);
                      });
                    },
                    uploadByUrl(url: string) {
                      return Promise.resolve({
                        success: 1,
                        file: {
                          url: url,
                        }
                      });
                    }
                  }
                }
              },
              table: Table,
              code: CodeTool,
              math: MathBlockTool as any,
              inlineMathSanitizer: InlineMathSanitizerTool as any,
              citationSanitizer: CitationSanitizerTool as any,
              customFormatsSanitizer: CustomFormatsSanitizerTool as any,
            },
            onReady: () => {
              if (!isMounted) return;
              setIsReady(true);
              
              // Initialize Undo/Redo manager
              undoRef.current = new Undo({ editor });

              // Render initial content if provided, otherwise render pending content
              const contentToRender = initialContent || pendingContentRef.current;
              if (contentToRender) {
                try {
                  isRenderingRef.current = true;
                  editor.render(contentToRender)
                    .then(() => {
                      if (undoRef.current && typeof undoRef.current.initialize === 'function') {
                        undoRef.current.initialize(contentToRender);
                      }
                      renderAllInlineMath();
                      setTimeout(() => {
                        isRenderingRef.current = false;
                        adjustAllCodeTextareaHeights();
                      }, 150);
                    })
                    .catch((e) => {
                      console.error('Error rendering database content promise:', e);
                      isRenderingRef.current = false;
                    });
                  pendingContentRef.current = null;
                } catch (e) {
                  console.error('Error rendering database content:', e);
                  isRenderingRef.current = false;
                }
              }

              // Apply saved block alignments on load and compute stats
              setTimeout(() => {
                restoreBlockAlignments();
                renderAllInlineMath();
                calculateLiveStats();
                adjustAllCodeTextareaHeights();
              }, 150);
            },
            onChange: async () => {
              syncActiveBlockType();
              calculateLiveStats();
              
              if (isRenderingRef.current) {
                return;
              }

              if (onContentChange && editorRef.current) {
                try {
                  const content = await saveCleanContent();
                  if (content) {
                    onContentChange(content);
                  }
                } catch (e) {
                  console.error('EditorJS onChange save error:', e);
                }
              }
            }
          });
          editorRef.current = editor;
        })
      );

    return () => {
      isMounted = false;
      document.removeEventListener('input', handleCodeInput);
      if (editorRef.current) {
        try {
          if (typeof editorRef.current.destroy === 'function') {
            editorRef.current.destroy();
          }
        } catch (e) {
          console.warn('Failed to destroy EditorJS instance:', e);
        }
        editorRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && isReady) {
      try {
        editorRef.current.readOnly.toggle(readOnly).then(() => {
          adjustAllCodeTextareaHeights();
        });
      } catch (e) {
        console.warn('Failed to toggle readOnly state:', e);
        setTimeout(() => {
          adjustAllCodeTextareaHeights();
        }, 150);
      }
    }
  }, [readOnly, isReady]);

  return (
    <div className="sf-editor flex flex-col min-h-full bg-white p-6 md:p-10 pb-32 max-w-3xl mx-auto rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] border border-slate-100">
      <div 
        id={holderId} 
        onClick={(e) => {
          const target = e.target as HTMLElement;
          
          // Handle comment mark click
          const commentMark = target.closest('mark[data-comment-id], .sf-comment-mark');
          if (commentMark) {
            const commentId = commentMark.getAttribute('data-comment-id');
            if (commentId && onCommentMarkClick) {
              onCommentMarkClick(commentId);
            }
          }

          // Handle inline math editing on click
          const mathSpan = target.closest('.sf-inline-math') as HTMLElement | null;
          if (mathSpan && !readOnly) {
            const currentFormula = mathSpan.getAttribute('data-formula') || '';
            
            const handleSaveFormula = (newFormula: string) => {
              if (newFormula.trim() === '') {
                mathSpan.remove();
              } else {
                mathSpan.setAttribute('data-formula', newFormula);
                import('katex').then((kateMod) => {
                  const katex = kateMod.default;
                  katex.render(newFormula, mathSpan, { displayMode: false, throwOnError: false });
                });
              }
              calculateLiveStats();
              if (onContentChange && editorRef.current) {
                saveCleanContent().then(content => {
                  if (content) onContentChange(content);
                }).catch(console.error);
              }
            };

            if (onEditInlineEquation) {
              onEditInlineEquation(currentFormula, handleSaveFormula);
            } else {
              const newFormula = prompt('Edit LaTeX formula:', currentFormula);
              if (newFormula !== null) {
                handleSaveFormula(newFormula);
              }
            }
            return;
          }

          const cite = target.closest('cite[data-citation]');
          if (cite) {
            const refId = cite.getAttribute('data-ref-id');
            const label = cite.textContent?.replace(/[\[\]]/g, '').trim() || '';
            
            // Get preceding text/sentence in the paragraph as context
            const paragraphText = cite.parentElement?.innerText || '';
            const citeText = cite.textContent || '';
            const textBeforeCite = paragraphText.split(citeText)[0] || '';
            const sentences = textBeforeCite.split(/(?<=[.!?])\s+/);
            const citedSentence = sentences[sentences.length - 1]?.trim() || '';
            
            if (refId && onCiteClick) {
              onCiteClick(refId, label, citedSentence);
            }
          }
        }}
        onKeyDown={(e) => {
          if (readOnly) return;
          // Keyboard shortcut for inline math (Ctrl+Shift+M or Alt+M)
          if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'm') || (e.altKey && e.key.toLowerCase() === 'm')) {
            e.preventDefault();
            insertInlineEquationLocal();
            return;
          }

          if (e.key === 'Escape') {
            const activeSearchSpan = document.querySelector('span[data-citation-search="true"]');
            if (activeSearchSpan) {
              e.preventDefault();
              onCitationSearchCancel?.();
            }
          }
          if (e.key === 'Enter') {
            const activeSearchSpan = document.querySelector('span[data-citation-search="true"]');
            if (activeSearchSpan && activeSearchSpan.contains(e.target as Node)) {
              e.preventDefault();
            }
          }
        }}
        onKeyUp={(e) => {
          if (readOnly) return;
          syncActiveBlockType();
          calculateLiveStats();

          // Double check search span typing
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const anchorNode = selection.anchorNode;
            let parent = anchorNode as HTMLElement | null;
            if (parent && parent.nodeType === Node.TEXT_NODE) {
              parent = parent.parentElement;
            }
            if (parent && parent.getAttribute && parent.getAttribute('data-citation-search') === 'true') {
              const query = parent.textContent || '';
              const rect = parent.getBoundingClientRect();
              onCitationSearchChange?.(query, rect);
            }
          }
        }}
        onMouseUp={() => {
          syncActiveBlockType();
          calculateLiveStats();
        }}
        className="flex-1 outline-none ProseMirror" 
      />
    </div>
  );
});

EditorJsEditor.displayName = 'EditorJsEditor';
export default EditorJsEditor;
