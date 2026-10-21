// c:/web/ScholarFlow/components/editor/editorjs-editor.tsx
'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import type EditorJS from '@editorjs/editorjs';
import 'katex/dist/katex.min.css';

import { MathBlockTool, InlineMathSanitizerTool, CitationSanitizerTool, CustomFormatsSanitizerTool, scrambleHtmlText } from '@/lib/editor/editor-tools';
import type { EditorJsMethods } from '@/lib/editor/editor-tools';
import { buildEditorJsMethods } from '@/hooks/use-editorjs-methods';
import { sanitizeHtml, sanitizeEditorContent } from '@/lib/utils/sanitize';

const ALIGNMENT_KEY = 'scholarflow.editorjs.alignments.v1';

interface EditorJsEditorProps {
  initialContent?: any;
  readOnly?: boolean;
  onBlockTypeChange?: (type: string) => void;
  onAlignmentChange?: (align: string) => void;
  onStatsChange?: (stats: { wordCount: number; characterCount: number; citationCount: number; activeReferenceIds?: string[] }) => void;
  onCiteClick?: (refId: string, label: string, citedSentence: string) => void;
  onCommentMarkClick?: (commentId: string) => void;
  onSuggestionMarkClick?: (suggestionId: string) => void;
  onContentChange?: (content: any) => void;
  onCitationSearchChange?: (query: string, rect: DOMRect) => void;
  onCitationSearchCancel?: () => void;
  onEditInlineEquation?: (formula: string, onSave: (newFormula: string) => void) => void;
  onInsertLinkRequest?: (defaultUrl: string, onSave: (url: string) => void, onUnlink?: () => void) => void;
  onEditorKeyDown?: (e: React.KeyboardEvent) => boolean;
  onEditorKeyUp?: (e: React.KeyboardEvent) => void;
}

export const EditorJsEditor = forwardRef<EditorJsMethods, EditorJsEditorProps>(({
  initialContent,
  readOnly = false,
  onBlockTypeChange,
  onAlignmentChange,
  onStatsChange,
  onCiteClick,
  onCommentMarkClick,
  onSuggestionMarkClick,
  onContentChange,
  onCitationSearchChange,
  onCitationSearchCancel,
  onEditInlineEquation,
  onInsertLinkRequest,
  onEditorKeyDown,
  onEditorKeyUp,
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
      textarea.style.height = '0px'; // Reset height first to get accurate scrollHeight
      const borderHeight = textarea.offsetHeight - textarea.clientHeight;
      textarea.style.height = (textarea.scrollHeight + borderHeight) + 'px';
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
          if (contentEditable && contentEditable.style.textAlign !== alignments[block.id]) {
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
    tempDiv.innerHTML = sanitizeHtml(html);
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

    // Clean up empty ghost cite tags that the browser may leave behind when user deletes text
    Array.from(holder.querySelectorAll('cite[data-citation]')).forEach((el) => {
      if (!el.textContent || el.textContent.trim().length === 0) {
        el.remove();
      }
    });

    // Clean up empty ghost cite tags that the browser may leave behind when user deletes text
    Array.from(holder.querySelectorAll('cite[data-citation]')).forEach((el) => {
      if (!el.textContent || el.textContent.trim().length === 0) {
        el.remove();
      }
    });

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

  const liveStatsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedCalculateLiveStats = () => {
    if (liveStatsTimerRef.current) {
      clearTimeout(liveStatsTimerRef.current);
    }
    liveStatsTimerRef.current = setTimeout(() => {
      calculateLiveStats();
    }, 400);
  };

  const lastSyncedBlockTypeRef = useRef<string>('');
  const lastSyncedAlignmentRef = useRef<string>('');

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
            if (lastSyncedBlockTypeRef.current !== 'paragraph') {
              lastSyncedBlockTypeRef.current = 'paragraph';
              onBlockTypeChange?.('paragraph');
            }
          } else if (name === 'header') {
            const data = (await block.save()) as any;
            const level = data?.data?.level || 1;
            const hType = `h${level}`;
            if (lastSyncedBlockTypeRef.current !== hType) {
              lastSyncedBlockTypeRef.current = hType;
              onBlockTypeChange?.(hType);
            }
          }

          // Sync alignment
          const contentEditable = block.holder.querySelector('[contenteditable="true"]') as HTMLElement;
          if (contentEditable) {
            const align = contentEditable.style.textAlign || 'left';
            if (lastSyncedAlignmentRef.current !== align) {
              lastSyncedAlignmentRef.current = align;
              onAlignmentChange?.(align);
            }
          }
        }
      }
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
  useImperativeHandle(ref, () => buildEditorJsMethods({
    editorRef,
    undoRef,
    holderId,
    activeBlockIndexRef,
    lastSelectionRangeRef,
    lastHighlightedRangeRef,
    savedLinkRangeRef,
    isRenderingRef,
    pendingContentRef,
    onContentChange,
    onBlockTypeChange,
    onAlignmentChange,
    onStatsChange,
    onInsertLinkRequest,
    restoreBlockAlignments,
    calculateLiveStats,
    saveCleanContent,
    renderAllInlineMath,
    adjustAllCodeTextareaHeights,
    insertInlineEquationLocal
  }));

  useEffect(() => {
    if (typeof window === 'undefined') return; // client‑side only
    if (editorRef.current) return;

    let isMounted = true;

    const handleCodeInput = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target && target.classList.contains('ce-code__textarea')) {
        const textarea = target as HTMLTextAreaElement;
        textarea.style.height = '0px';
        const borderHeight = textarea.offsetHeight - textarea.clientHeight;
        textarea.style.height = (textarea.scrollHeight + borderHeight) + 'px';
      }
    };
    document.addEventListener('input', handleCodeInput);

    // Hide EditorJS floating block toolbar (+ and ::) when hovering over system-locked blocks
    const handleEditorMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const lockedBlock = target.closest('.sf-system-locked-block, .sf-bibliography-fade-container, .sf-bibliography-blur, .sf-premium-banner-container');
      const toolbar = document.querySelector('#' + holderId + ' .ce-toolbar') as HTMLElement | null;
      if (lockedBlock) {
        if (toolbar) {
          toolbar.style.opacity = '0';
          toolbar.style.pointerEvents = 'none';
        }
      } else if (toolbar && toolbar.style.pointerEvents === 'none') {
        toolbar.style.opacity = '';
        toolbar.style.pointerEvents = '';
      }
    };
    document.addEventListener('mouseover', handleEditorMouseOver, true);

    // Dynamically import EditorJS and its plugins to prevent SSR import errors
    import('@editorjs/editorjs')
      .then(({ default: EditorJS }) =>
        Promise.all([
          import('@editorjs/header'),
          import('@editorjs/list'),
          import('@editorjs/image'),
          import('@editorjs/table'),
          import('@editorjs/code'),
          // @ts-ignore
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

              // Intercept and prevent deletion of system-locked blocks (Daftar Pustaka & Premium Banner)
              const originalDelete = editor.blocks.delete.bind(editor.blocks);
              editor.blocks.delete = (index?: number) => {
                if (!isRenderingRef.current) {
                  const currentIdx = typeof index === 'number' ? index : editor.blocks.getCurrentBlockIndex();
                  if (currentIdx >= 0) {
                    const blockHolder = document.querySelectorAll('#' + holderId + ' .ce-block')[currentIdx];
                    if (blockHolder && (
                      blockHolder.classList.contains('sf-system-locked-block') ||
                      blockHolder.querySelector('.sf-system-locked-block, .sf-bibliography-blur, .sf-premium-banner-container') ||
                      blockHolder.textContent?.trim() === 'Daftar Pustaka / References'
                    )) {
                      console.warn('ScholarFlow: Blocked deletion of system-locked bibliography block');
                      return;
                    }
                  }
                }
                return originalDelete(index);
              };

              // Intercept Toolbar module to prevent opening toolbar next to system-locked blocks
              const toolbarModule = (editor as any).moduleInstances?.Toolbar;
              if (toolbarModule && typeof toolbarModule.moveAndOpen === 'function') {
                const originalMoveAndOpen = toolbarModule.moveAndOpen.bind(toolbarModule);
                toolbarModule.moveAndOpen = (block: any) => {
                  const targetBlock = block || (editor as any).moduleInstances?.BlockManager?.currentBlock;
                  if (targetBlock && targetBlock.holder) {
                    const holderEl = targetBlock.holder as HTMLElement;
                    if (
                      holderEl.classList.contains('sf-system-locked-block') ||
                      holderEl.querySelector('.sf-system-locked-block, .sf-bibliography-blur, .sf-premium-banner-container, [data-sf-system-locked="true"]') ||
                      holderEl.textContent?.trim() === 'Daftar Pustaka / References'
                    ) {
                      try {
                        toolbarModule.close();
                      } catch (_) {}
                      return;
                    }
                  }
                  return originalMoveAndOpen(block);
                };
              }

              // Intercept BlockSettings module to prevent tunes settings popover on system-locked blocks
              const blockSettingsModule = (editor as any).moduleInstances?.BlockSettings;
              if (blockSettingsModule && typeof blockSettingsModule.open === 'function') {
                const origSettingsOpen = blockSettingsModule.open.bind(blockSettingsModule);
                blockSettingsModule.open = (targetBlock: any) => {
                  const b = targetBlock || (editor as any).moduleInstances?.BlockManager?.currentBlock;
                  if (b && b.holder) {
                    const holderEl = b.holder as HTMLElement;
                    if (
                      holderEl.classList.contains('sf-system-locked-block') ||
                      holderEl.querySelector('.sf-system-locked-block, .sf-bibliography-blur, .sf-premium-banner-container, [data-sf-system-locked="true"]') ||
                      holderEl.textContent?.trim() === 'Daftar Pustaka / References'
                    ) {
                      return;
                    }
                  }
                  return origSettingsOpen(targetBlock);
                };
              }

              // Render initial content if provided, otherwise render pending content
              const contentToRender = sanitizeEditorContent(initialContent || pendingContentRef.current);
              if (contentToRender) {
                try {
                  isRenderingRef.current = true;
                  editor.render(contentToRender)
                    .then(() => {
                      if (undoRef.current && typeof undoRef.current.initialize === 'function') {
                        undoRef.current.initialize(contentToRender);
                      }
                      restoreBlockAlignments();
                      renderAllInlineMath();
                      calculateLiveStats();
                      adjustAllCodeTextareaHeights();
                      try {
                        const holder = document.getElementById(holderId);
                        if (holder) {
                          const ceBlocks = Array.from(holder.querySelectorAll('.ce-block'));
                          const headerIdx = ceBlocks.findIndex(blockEl => {
                            const header = blockEl.querySelector('h2, .ce-header, [contenteditable]');
                            return header && header.textContent?.trim() === 'Daftar Pustaka / References';
                          });
                          if (headerIdx >= 0) {
                            const headerBlockEl = ceBlocks[headerIdx];
                            const header = headerBlockEl.querySelector('h2, .ce-header, [contenteditable]');
                            if (header) {
                              header.setAttribute('contenteditable', 'false');
                              header.setAttribute('data-sf-system-locked', 'true');
                              headerBlockEl.classList.add('sf-system-locked-block');
                            }
                            if (headerIdx + 1 < ceBlocks.length) {
                              const contentBlockEl = ceBlocks[headerIdx + 1];
                              const paragraphEl = contentBlockEl.querySelector('.ce-paragraph, [contenteditable]') as HTMLElement | null;
                              if (paragraphEl) {
                                paragraphEl.setAttribute('contenteditable', 'false');
                                paragraphEl.setAttribute('data-sf-system-locked', 'true');
                                contentBlockEl.classList.add('sf-system-locked-block');
                                if (paragraphEl.textContent && paragraphEl.textContent.includes('Xxxxx')) {
                                  paragraphEl.classList.add('sf-bibliography-fade-container', 'sf-bibliography-blur');
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
                            }
                            if (headerIdx + 2 < ceBlocks.length && ceBlocks[headerIdx + 2].querySelector('.sf-premium-banner-container')) {
                              ceBlocks[headerIdx + 2].classList.add('sf-system-locked-block');
                            }
                          }
                        }
                      } catch (e) {}
                      setTimeout(() => {
                        isRenderingRef.current = false;
                      }, 400);
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
              } else {
                isRenderingRef.current = true;
                setTimeout(() => {
                  restoreBlockAlignments();
                  renderAllInlineMath();
                  calculateLiveStats();
                  adjustAllCodeTextareaHeights();
                  setTimeout(() => {
                    isRenderingRef.current = false;
                  }, 400);
                }, 150);
              }
            },
            onChange: async () => {
              syncActiveBlockType();
              debouncedCalculateLiveStats();

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
      document.removeEventListener('mouseover', handleEditorMouseOver, true);
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
    <div className="sf-editor flex flex-col min-h-full w-full max-w-3xl mr-auto pb-8 relative">
      <div
        id={holderId}
        onMouseMove={(e) => {
          const holder = e.currentTarget;
          const lockedBlocks = holder.querySelectorAll('.sf-system-locked-block, .sf-bibliography-blur, .sf-premium-banner-container');
          if (!lockedBlocks.length) return;
          const clientY = e.clientY;
          let isOverLocked = false;
          for (let i = 0; i < lockedBlocks.length; i++) {
            const rect = lockedBlocks[i].getBoundingClientRect();
            if (clientY >= rect.top - 6 && clientY <= rect.bottom + 6) {
              isOverLocked = true;
              break;
            }
          }
          const toolbar = holder.querySelector('.ce-toolbar') as HTMLElement | null;
          if (toolbar) {
            if (isOverLocked) {
              toolbar.style.opacity = '0';
              toolbar.style.pointerEvents = 'none';
              toolbar.style.visibility = 'hidden';
              toolbar.classList.remove('ce-toolbar--opened');
              try {
                editorRef.current?.toolbar?.close();
              } catch (_) {}
            } else if (toolbar.style.visibility === 'hidden') {
              toolbar.style.opacity = '';
              toolbar.style.pointerEvents = '';
              toolbar.style.visibility = '';
            }
          }
        }}
        onMouseDownCapture={(e) => {
          const target = e.target as HTMLElement;
          const toolbarAction = target.closest('.ce-toolbar__actions, .ce-toolbar__settings-btn, .ce-toolbar__plus, .ce-settings, .ce-popover');
          if (toolbarAction) {
            const holder = e.currentTarget;
            const lockedBlocks = holder.querySelectorAll('.sf-system-locked-block, .sf-bibliography-blur, .sf-premium-banner-container');
            const clientY = e.clientY;
            for (let i = 0; i < lockedBlocks.length; i++) {
              const rect = lockedBlocks[i].getBoundingClientRect();
              if (clientY >= rect.top - 6 && clientY <= rect.bottom + 6) {
                e.preventDefault();
                e.stopPropagation();
                try {
                  editorRef.current?.toolbar?.close();
                } catch (_) {}
                return;
              }
            }
          }
        }}
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

          // Handle suggestion mark click (Track Changes)
          const suggestionMark = target.closest('.sf-suggestion-wrapper, .sf-suggestion-del, .sf-suggestion-ins');
          if (suggestionMark) {
            const sugId = suggestionMark.getAttribute('data-suggestion-id');
            if (sugId && onSuggestionMarkClick) {
              onSuggestionMarkClick(sugId);
            }
          }

          // Handle scientific cross-reference click (jump to figure/table)
          const crossRefLink = target.closest('.sf-cross-ref, [data-cross-ref="true"]');
          if (crossRefLink) {
            e.preventDefault();
            const targetId = crossRefLink.getAttribute('data-target-id');
            const holderEl = document.getElementById(holderId);
            if (targetId && holderEl) {
              const targetBlock = (holderEl.querySelector(`[data-id="${targetId}"]`) ||
                                   holderEl.querySelector(`#${targetId}`) ||
                                   holderEl.querySelector(`[data-block-id="${targetId}"]`)) as HTMLElement | null;
              if (targetBlock) {
                targetBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetBlock.classList.add('ring-4', 'ring-indigo-500', 'shadow-2xl', 'rounded-2xl', 'transition-all', 'duration-300');
                setTimeout(() => {
                  targetBlock?.classList.remove('ring-4', 'ring-indigo-500', 'shadow-2xl', 'rounded-2xl', 'transition-all', 'duration-300');
                }, 2500);
              }
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

          // Check if external editor keydown handler (e.g. Ghostwriter autocomplete) handles the event
          if (onEditorKeyDown && onEditorKeyDown(e)) {
            return;
          }

          // Guard against deleting or backspacing system-locked blocks (Daftar Pustaka & Premium Banner)
          if (e.key === 'Backspace' || e.key === 'Delete') {
            const sel = window.getSelection();
            if (sel && sel.anchorNode) {
              const anchorEl = sel.anchorNode.nodeType === Node.TEXT_NODE
                ? sel.anchorNode.parentElement
                : (sel.anchorNode as HTMLElement);
              if (anchorEl) {
                const lockedEl = anchorEl.closest('.sf-bibliography-blur, .sf-bibliography-fade-container, .sf-premium-banner-container, .sf-system-locked-block, [data-sf-system-locked="true"]');
                if (lockedEl) {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                if (e.key === 'Backspace') {
                  const currentBlock = anchorEl.closest('.ce-block');
                  if (currentBlock && (!anchorEl.textContent || anchorEl.textContent.trim() === '')) {
                    const prevBlock = currentBlock.previousElementSibling;
                    if (prevBlock && (prevBlock.classList.contains('sf-system-locked-block') || prevBlock.querySelector('.sf-system-locked-block, .sf-premium-banner-container'))) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                  }
                }
              }
            }
          }

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
          onEditorKeyUp?.(e);

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
        onInput={() => {
          debouncedCalculateLiveStats();
        }}
        onCut={() => {
          setTimeout(calculateLiveStats, 50);
        }}
        className="flex-1 outline-none ProseMirror"
      />
    </div>
  );
});

EditorJsEditor.displayName = 'EditorJsEditor';
export default EditorJsEditor;
