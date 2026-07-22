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

// Storage keys
const STORAGE_KEY = 'scholarflow.editorjs.content.v1';
const ALIGNMENT_KEY = 'scholarflow.editorjs.alignments.v1';

export interface EditorJsMethods {
  undo: () => void;
  redo: () => void;
  setBlockType: (type: string) => void;
  toggleInlineFormat: (format: string) => void;
  setBlockAlignment: (align: string) => void;
  insertCitation: (label?: string, referenceId?: string) => void;
  insertImage: (url: string) => void;
  insertTable: () => void;
  insertCodeBlock: () => void;
  insertMathBlock: () => void;
  insertInlineEquation: () => void;
  insertText: (text: string) => void;
  insertBibliographyText: (text: string) => void;
  upsertBibliography: (entries: Array<{ label: string; formatted: string }>) => void;
  renderContent: (data: any) => void;
}

interface EditorJsEditorProps {
  initialContent?: any;
  onBlockTypeChange?: (type: string) => void;
  onAlignmentChange?: (align: string) => void;
  onStatsChange?: (stats: { wordCount: number; characterCount: number; citationCount: number }) => void;
  onCiteClick?: (refId: string, label: string, citedSentence: string) => void;
  onContentChange?: (content: any) => void;
}

export const EditorJsEditor = forwardRef<EditorJsMethods, EditorJsEditorProps>(({ 
  initialContent,
  onBlockTypeChange, 
  onAlignmentChange,
  onStatsChange,
  onCiteClick,
  onContentChange
}, ref) => {
  const editorRef = useRef<EditorJS | null>(null);
  const undoRef = useRef<any>(null);
  const pendingContentRef = useRef<any>(null);
  const isRenderingRef = useRef<boolean>(false);
  const holderId = 'editorjs-holder';
  const [isReady, setIsReady] = useState(false);
  const activeBlockIndexRef = useRef<number>(0);
  // Tracks index of bibliography header block (-1 = not yet inserted)
  const bibliographyBlockIndexRef = useRef<number>(-1);

  // Restore alignment styles to all editor blocks based on saved localStorage map
  const restoreBlockAlignments = () => {
    if (!editorRef.current || !editorRef.current.blocks) return;
    try {
      const alignments = JSON.parse(localStorage.getItem(ALIGNMENT_KEY) || '{}');
      const count = editorRef.current.blocks.getBlocksCount();
      for (let i = 0; i < count; i++) {
        const block = editorRef.current.blocks.getBlockByIndex(i);
        if (block && alignments[block.id]) {
          const contentEditable = block.holder.querySelector('[contenteditable="true"]') as HTMLElement;
          if (contentEditable) {
            contentEditable.style.textAlign = alignments[block.id];
          }
        }
      }
    } catch (e) {
      console.warn('Error restoring alignments:', e);
    }
  };

  // Calculate live word, character, and citation counts directly from the editor DOM
  const calculateLiveStats = () => {
    const holder = document.getElementById(holderId);
    if (!holder) return;
    const text = holder.innerText || '';
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    
    const citationEls = holder.querySelectorAll('cite[data-citation]');
    const citations = citationEls.length;
    const activeReferenceIds = Array.from(citationEls)
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
    toggleInlineFormat: (format: string) => {
      document.execCommand('styleWithCSS', false, 'false');
      if (format === 'bold') {
        document.execCommand('bold', false);
      } else if (format === 'italic') {
        document.execCommand('italic', false);
      } else if (format === 'underline') {
        document.execCommand('underline', false);
      } else if (format === 'strikethrough') {
        document.execCommand('strikeThrough', false);
      } else if (format === 'superscript') {
        document.execCommand('superscript', false);
      } else if (format === 'subscript') {
        document.execCommand('subscript', false);
      } else if (format === 'highlight') {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        const text = range.toString();
        if (!text) return;
        const mark = document.createElement('mark');
        mark.className = 'bg-yellow-200/80 px-1 py-0.5 rounded';
        mark.textContent = text;
        range.deleteContents();
        range.insertNode(mark);
      } else if (format === 'code') {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        const text = range.toString();
        if (!text) return;
        const code = document.createElement('code');
        code.className = 'bg-slate-100 dark:bg-slate-800 text-rose-600 px-1 py-0.5 rounded font-mono text-xs';
        code.textContent = text;
        range.deleteContents();
        range.insertNode(code);
      } else if (format === 'link') {
        const url = prompt('Enter link URL:');
        if (url) {
          document.execCommand('createLink', false, url);
        }
      }
      calculateLiveStats();
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
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      // Collapse to END of selection — citation appears AFTER the selected text
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
      calculateLiveStats();
    },
    insertImage: (url: string) => {
      if (!editorRef.current || !editorRef.current.blocks) return;
      editorRef.current.blocks.insert('image', { url }, undefined, activeBlockIndexRef.current + 1, true);
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
    insertInlineEquation: () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.className = 'font-mono text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded text-xs select-all';
      span.textContent = '\\( E = mc^2 \\)';
      range.insertNode(span);
      calculateLiveStats();
    },
    insertText: (text: string) => {
      document.execCommand('insertText', false, text);
      calculateLiveStats();
    },
    insertBibliographyText: (text: string) => {
      if (!editorRef.current || !editorRef.current.blocks) return;
      const count = editorRef.current.blocks.getBlocksCount();
      editorRef.current.blocks.insert('paragraph', { text }, undefined, count, true);
      calculateLiveStats();
    },
    upsertBibliography: (entries: Array<{ label: string; formatted: string }>) => {
      if (!editorRef.current || !editorRef.current.blocks) return;
      const total = editorRef.current.blocks.getBlocksCount();
      const storedIdx = bibliographyBlockIndexRef.current;

      // Remove existing bibliography blocks (header + content = 2 blocks)
      if (storedIdx >= 0 && storedIdx + 1 < total) {
        editorRef.current.blocks.delete(storedIdx + 1); // delete content block
        editorRef.current.blocks.delete(storedIdx);     // delete header block
        bibliographyBlockIndexRef.current = -1;
      }

      if (entries.length === 0) {
        calculateLiveStats();
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
      const biblioHtml = entries
        .map(e => `[${e.label}] ${e.formatted}`)
        .join('<br><br>');

      editorRef.current.blocks.insert(
        'paragraph',
        { text: biblioHtml },
        undefined,
        insertAt + 1,
        true,
      );

      // Remember the header block index for next update
      bibliographyBlockIndexRef.current = insertAt;
      calculateLiveStats();
    },
    renderContent: (data: any) => {
      if (editorRef.current) {
        try {
          isRenderingRef.current = true;
          editorRef.current.render(data)
            .then(() => {
              setTimeout(() => {
                isRenderingRef.current = false;
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
  }));

  useEffect(() => {
    if (typeof window === 'undefined') return; // client‑side only
    if (editorRef.current) return;

    let isMounted = true;

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
          if (container) {
            container.innerHTML = '';
          }

          const editor = new EditorJS({
            holder: holderId,
            autofocus: true,
            tools: {
              header: Header,
              list: List,
              image: ImageTool,
              table: Table,
              code: CodeTool,
              math: MathBlockTool as any
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
                      setTimeout(() => {
                        isRenderingRef.current = false;
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
                calculateLiveStats();
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
                  const content = await editorRef.current.save();
                  onContentChange(content);
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

  return (
    <div className="sf-editor flex flex-col min-h-full bg-white p-6 md:p-10 pb-32 max-w-3xl mx-auto rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] border border-slate-100">
      <div 
        id={holderId} 
        onClick={(e) => {
          const target = e.target as HTMLElement;
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
        onKeyUp={() => {
          syncActiveBlockType();
          calculateLiveStats();
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
