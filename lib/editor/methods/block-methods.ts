import type { EditorJsMethodsProps } from '@/hooks/use-editorjs-methods';
import { scrambleHtmlText } from '@/lib/editor/editor-tools';
import { sanitizeEditorContent } from '@/lib/utils/sanitize';
import { getCaretCharacterOffsetWithin, setCaretCharacterOffsetWithin, isBibliographyHeaderText } from '@/lib/editor/editor-utils';

export function buildBlockMethods(props: EditorJsMethodsProps) {
  const {
    editorRef,
    undoRef,
    holderId,
    activeBlockIndexRef,
    lastSelectionRangeRef,
    lastHighlightedRangeRef,
    savedLinkRangeRef,
    isRenderingRef,
    isProgrammaticSystemUpdateRef,
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
  } = props;

  const ALIGNMENT_KEY = 'scholarflow.editorjs.alignments.v1';

  return {
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
              if (onContentChange && saveCleanContent) {
                saveCleanContent().then((content) => {
                  if (content) onContentChange(content);
                }).catch(console.error);
              }
            }, 50);
          } catch (err) {
            console.error('ScholarFlow setBlockType error:', err);
          }
        }
,
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

                // Notify EditorJS & trigger save
                contentEditable.dispatchEvent(new Event('input', { bubbles: true }));
                calculateLiveStats();
                if (onContentChange && saveCleanContent) {
                  saveCleanContent().then((content) => {
                    if (content) onContentChange(content);
                  }).catch(console.error);
                }
              }
            }
          } catch (err) {
            console.error('ScholarFlow setBlockAlignment error:', err);
          }
        }
,
    insertImage: (url: string) => {
          if (!editorRef.current || !editorRef.current.blocks) return;
          editorRef.current.blocks.insert('image', {
            file: {
              url: url
            }
          }, undefined, activeBlockIndexRef.current + 1, true);
          calculateLiveStats();
          if (onContentChange && saveCleanContent) {
            saveCleanContent().then((content) => {
              if (content) onContentChange(content);
            }).catch(console.error);
          }
        }
,
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
          if (onContentChange && saveCleanContent) {
            saveCleanContent().then((content) => {
              if (content) onContentChange(content);
            }).catch(console.error);
          }
        }
,
    insertCodeBlock: () => {
          if (!editorRef.current || !editorRef.current.blocks) return;
          editorRef.current.blocks.insert('code', {
            code: '// Write code here\n'
          }, undefined, activeBlockIndexRef.current + 1, true);
          calculateLiveStats();
          if (onContentChange && saveCleanContent) {
            saveCleanContent().then((content) => {
              if (content) onContentChange(content);
            }).catch(console.error);
          }
        }
,
    insertMathBlock: () => {
          if (!editorRef.current || !editorRef.current.blocks) return;
          editorRef.current.blocks.insert('math', {
            formula: ''
          }, undefined, activeBlockIndexRef.current + 1, true);
          calculateLiveStats();
          if (onContentChange && saveCleanContent) {
            saveCleanContent().then((content) => {
              if (content) onContentChange(content);
            }).catch(console.error);
          }
        }
,
    insertBibliographyText: (text: string) => {
          if (!editorRef.current || !editorRef.current.blocks) return;
          const count = editorRef.current.blocks.getBlocksCount();
          editorRef.current.blocks.insert('paragraph', { text }, undefined, count, true);
          calculateLiveStats();
          if (onContentChange && saveCleanContent) {
            saveCleanContent().then((content) => {
              if (content) onContentChange(content);
            }).catch(console.error);
          }
        }
,
    upsertBibliography: async (
          entries: Array<{ label: string; formatted: string }>,
          isFreeTier: boolean = false,
          language: 'en' | 'id' = 'id'
        ): Promise<boolean> => {
          if (!editorRef.current) return false;
          try {
            await editorRef.current.isReady;
          } catch (e) {
            return false;
          }
          if (!editorRef.current.blocks) return false;
    
          const wasReadOnly = editorRef.current.readOnly.isEnabled;
          const biblioTitle = language === 'en' ? 'References' : 'Daftar Pustaka';

          try {
            if (isProgrammaticSystemUpdateRef) {
              isProgrammaticSystemUpdateRef.current = true;
            }
            isRenderingRef.current = true;
            if (wasReadOnly) {
              await editorRef.current.readOnly.toggle(false);
            }
    
            // Save active caret position inside user's editing block so typing is never jumped or interrupted
            let activeCaretInfo: { element: HTMLElement; offset: number } | null = null;
            let biblioHtml = '';
            if (typeof window !== 'undefined') {
              const sel = window.getSelection();
              if (sel && sel.rangeCount > 0) {
                const anchorNode = sel.anchorNode;
                const editableEl = anchorNode?.nodeType === Node.TEXT_NODE
                  ? (anchorNode.parentElement?.closest('[contenteditable="true"]') as HTMLElement | null)
                  : ((anchorNode as HTMLElement | null)?.closest('[contenteditable="true"]') as HTMLElement | null);
                if (editableEl) {
                  const isInsideBiblio = Boolean(
                    editableEl.closest('.sf-bibliography-blur, .sf-premium-banner-container') ||
                    isBibliographyHeaderText(editableEl.textContent)
                  );
                  if (!isInsideBiblio) {
                    activeCaretInfo = {
                      element: editableEl,
                      offset: getCaretCharacterOffsetWithin(editableEl)
                    };
                  }
                }
              }
            }

            // Helper to locate the bibliography header index strictly at the bottom of the document.
            // Since bibliography is always at the end, scan backwards only the last 4 blocks.
            // This strictly protects all previous body/chapter blocks from ever being touched.
            const findBibliographyHeaderIndex = (): number => {
              if (!editorRef.current || !editorRef.current.blocks) return -1;
              const total = editorRef.current.blocks.getBlocksCount();
              if (total === 0) return -1;

              const searchLimit = Math.max(0, total - 4);
              for (let i = total - 1; i >= searchLimit; i--) {
                const block = editorRef.current.blocks.getBlockByIndex(i);
                if (!block || !block.holder) continue;

                // Match only actual headings (h1..h6) or .ce-header class
                const headerEl = block.holder.querySelector('h1, h2, h3, h4, h5, h6, .ce-header');
                if (headerEl && isBibliographyHeaderText(headerEl.textContent)) {
                  return i;
                }
              }
              return -1;
            };

            // Safely delete ONLY the bibliography blocks located at the bottom of the canvas
            const deleteExistingBibliographyBlocks = () => {
              if (!editorRef.current || !editorRef.current.blocks) return;
              const total = editorRef.current.blocks.getBlocksCount();
              const headerIdx = findBibliographyHeaderIndex();
              if (headerIdx === -1) return;

              // Delete strictly from total - 1 down to headerIdx (only the bottom bibliography blocks)
              for (let i = total - 1; i >= headerIdx; i--) {
                const currentIdx = editorRef.current.blocks.getCurrentBlockIndex();
                if (!activeCaretInfo && typeof currentIdx === 'number' && currentIdx === i && i > 0) {
                  try {
                    editorRef.current.caret.setToBlock(i - 1, 'end');
                  } catch (err) {
                    console.warn('Gagal memindahkan caret sebelum menghapus block:', err);
                  }
                }
                try {
                  editorRef.current.blocks.delete(i);
                } catch (err) {
                  console.warn('Gagal menghapus block bibliography:', err);
                }
              }
            };

            // When no citations exist, purge only the bottom bibliography if present and persist
            if (entries.length === 0) {
              const hadBiblio = findBibliographyHeaderIndex() !== -1;
              if (hadBiblio) {
                deleteExistingBibliographyBlocks();
                calculateLiveStats();
                if (onContentChange && editorRef.current) {
                  saveCleanContent().then((cleanData) => {
                    if (cleanData) onContentChange(cleanData);
                  }).catch(console.error);
                }
              }
              if (wasReadOnly) {
                await editorRef.current.readOnly.toggle(true);
              }
              if (activeCaretInfo && activeCaretInfo.element.isConnected) {
                try {
                  setCaretCharacterOffsetWithin(activeCaretInfo.element, activeCaretInfo.offset);
                } catch (e) {
                  // safe fallback
                }
              }
              return true;
            }

            // Build labeled list as HTML paragraph
            biblioHtml = entries
              .map(e => {
                const formatted = isFreeTier ? scrambleHtmlText(e.formatted) : e.formatted;
                return `[${e.label}] ${formatted}`;
              })
              .join('<br><br>');

            // Fast check: if existing bibliography already exists at bottom with identical content & title, avoid disruptive re-insertion
            const existingHeaderIdx = findBibliographyHeaderIndex();
            const totalBlocks = editorRef.current.blocks.getBlocksCount();
            if (existingHeaderIdx !== -1 && existingHeaderIdx + 1 < totalBlocks) {
              const headerBlock = editorRef.current.blocks.getBlockByIndex(existingHeaderIdx);
              const contentBlock = editorRef.current.blocks.getBlockByIndex(existingHeaderIdx + 1);
              const currentHeader = headerBlock?.holder?.querySelector('h1, h2, h3, h4, h5, h6, .ce-header')?.textContent?.trim();
              const currentContent = contentBlock?.holder?.querySelector('.ce-paragraph, [contenteditable]')?.innerHTML || '';
              const hasBannerIfFree = !isFreeTier || (existingHeaderIdx + 2 < totalBlocks && Boolean(editorRef.current.blocks.getBlockByIndex(existingHeaderIdx + 2)?.holder?.querySelector('.sf-premium-banner-container')));

              if (currentHeader === biblioTitle && currentContent === biblioHtml && hasBannerIfFree) {
                if (wasReadOnly) {
                  await editorRef.current.readOnly.toggle(true);
                }
                return true;
              }
            }

            // Delete old bibliography blocks from the bottom before inserting fresh ones
            deleteExistingBibliographyBlocks();
    
            // Fresh block count after deletion
            const insertAt = editorRef.current.blocks.getBlocksCount();
    
            // Insert localized References / Daftar Pustaka header
            editorRef.current.blocks.insert(
              'header',
              { text: biblioTitle, level: 2 },
              undefined,
              insertAt,
              false,
            );
    
            // Build labeled list as HTML paragraph
            biblioHtml = entries
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
              false,
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
                      Upgrade Now
                    </button>
                  </div>
                </div>
              `;
    
              editorRef.current.blocks.insert(
                'paragraph',
                { text: bannerHtml },
                undefined,
                insertAt + 2,
                false,
              );
    
              // Apply DOM classes and locking attributes directly
              const applyBlurClasses = () => {
                try {
                  const holder = document.getElementById(holderId);
                  if (!holder) return;
                  const ceBlocks = Array.from(holder.querySelectorAll('.ce-block'));
                  const headerIdx = ceBlocks.findIndex(blockEl => {
                    const header = blockEl.querySelector('h2, .ce-header, [contenteditable]');
                    return header && isBibliographyHeaderText(header.textContent);
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
                        if (isFreeTier) {
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
                    if (isFreeTier && headerIdx + 2 < ceBlocks.length) {
                      const bannerBlockEl = ceBlocks[headerIdx + 2];
                      bannerBlockEl.classList.add('sf-system-locked-block');
                    }
                  }
                } catch (err) {
                  console.warn('Error applying bibliography blur and lock classes:', err);
                }
              };
              applyBlurClasses();
              setTimeout(applyBlurClasses, 50);
              setTimeout(applyBlurClasses, 200);
            }
    
            // Restore active caret position so typing is never jumped or interrupted
            if (activeCaretInfo && activeCaretInfo.element.isConnected) {
              try {
                setCaretCharacterOffsetWithin(activeCaretInfo.element, activeCaretInfo.offset);
              } catch (e) {
                // safe fallback
              }
            }

            calculateLiveStats();
            if (wasReadOnly) {
              await editorRef.current.readOnly.toggle(true);
            }
            if (onContentChange && editorRef.current) {
              saveCleanContent().then((cleanData) => {
                if (cleanData) onContentChange(cleanData);
              }).catch(console.error);
            }
            return true;
          } catch (err) {
            console.error('Error upserting bibliography:', err);
            return false;
          } finally {
            if (isProgrammaticSystemUpdateRef) {
              isProgrammaticSystemUpdateRef.current = false;
            }
            setTimeout(() => {
              isRenderingRef.current = false;
              adjustAllCodeTextareaHeights();
            }, 150);
          }
        }
,
    renderContent: (data: any) => {
          if (editorRef.current && typeof editorRef.current.render === 'function') {
            try {
              isRenderingRef.current = true;
              const sanitizedData = sanitizeEditorContent(data);
              editorRef.current.render(sanitizedData)
                .then(() => {
                  if (undoRef.current && typeof undoRef.current.initialize === 'function') {
                    undoRef.current.initialize(sanitizedData);
                  }
                  renderAllInlineMath();
                  calculateLiveStats();

                  // Auto-purge leftover bibliography blocks if restored snapshot has 0 in-text citations
                  try {
                    const holder = document.getElementById(holderId);
                    const activeCites = holder ? holder.querySelectorAll('cite[data-citation]') : [];
                    const hasInTextCitations = Array.from(activeCites).some(el => el.textContent && el.textContent.trim().length > 0);

                    if (!hasInTextCitations && editorRef.current && editorRef.current.blocks) {
                      const total = editorRef.current.blocks.getBlocksCount();
                      const searchLimit = Math.max(0, total - 4);
                      let bibHeaderIdx = -1;
                      for (let i = total - 1; i >= searchLimit; i--) {
                        const block = editorRef.current.blocks.getBlockByIndex(i);
                        if (!block || !block.holder) continue;
                        const headerEl = block.holder.querySelector('h1, h2, h3, h4, h5, h6, .ce-header');
                        if (headerEl && isBibliographyHeaderText(headerEl.textContent)) {
                          bibHeaderIdx = i;
                          break;
                        }
                      }

                      if (bibHeaderIdx !== -1) {
                        if (isProgrammaticSystemUpdateRef) {
                          isProgrammaticSystemUpdateRef.current = true;
                        }
                        for (let i = total - 1; i >= bibHeaderIdx; i--) {
                          try {
                            editorRef.current.blocks.delete(i);
                          } catch (_) {}
                        }
                        if (isProgrammaticSystemUpdateRef) {
                          isProgrammaticSystemUpdateRef.current = false;
                        }
                        calculateLiveStats();
                        if (onContentChange) {
                          saveCleanContent().then(cleanData => {
                            if (cleanData) onContentChange(cleanData);
                          }).catch(console.error);
                        }
                      }
                    }
                  } catch (e) {
                    console.warn('Auto-cleanup of restored bibliography error:', e);
                  }

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
        }
,
    render: async (data: any) => {
          if (editorRef.current && typeof editorRef.current.render === 'function') {
            try {
              isRenderingRef.current = true;
              const sanitizedData = sanitizeEditorContent(data);
              await editorRef.current.render(sanitizedData);
              if (undoRef.current && typeof undoRef.current.initialize === 'function') {
                undoRef.current.initialize(sanitizedData);
              }
              renderAllInlineMath();
              setTimeout(() => {
                isRenderingRef.current = false;
                adjustAllCodeTextareaHeights();
              }, 150);
            calculateLiveStats();
            } catch (e) {
              console.error('EditorJS render promise error:', e);
              isRenderingRef.current = false;
            }
          } else {
            pendingContentRef.current = data;
          }
        }
,
    insertBlocks: async (newBlocks: Array<{ type: string; data: any }>) => {
      if (!editorRef.current || !editorRef.current.blocks) return;
      try {
        const currentCount = editorRef.current.blocks.getBlocksCount();
        const currentIdx = typeof activeBlockIndexRef.current === 'number' && activeBlockIndexRef.current >= 0
          ? activeBlockIndexRef.current + 1
          : currentCount;

        for (let i = 0; i < newBlocks.length; i++) {
          const blk = newBlocks[i];
          await editorRef.current.blocks.insert(blk.type, blk.data, undefined, currentIdx + i, true);
        }

        if (editorRef.current.save) {
          const outputData = await editorRef.current.save();
          if (onContentChange) {
            onContentChange(outputData);
          }
        }
        calculateLiveStats();
      } catch (err) {
        console.error('Failed to insert blocks into EditorJS:', err);
      }
    },
  };
}
