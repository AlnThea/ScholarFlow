import type { EditorJsMethodsProps } from '@/hooks/use-editorjs-methods';

export function buildInlineMethods(props: EditorJsMethodsProps) {
  const {
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
  } = props;

  return {
    toggleInlineFormat: (format: string, color?: string) => {
          const FORMAT_CONFIG: Record<string, { cmd?: string; tags: string[]; createTag: string; defaultClass?: string }> = {
            bold: { cmd: "bold", tags: ["B", "STRONG"], createTag: "b" },
            italic: { cmd: "italic", tags: ["I", "EM"], createTag: "i" },
            underline: { cmd: "underline", tags: ["U"], createTag: "u" },
            strikethrough: { cmd: "strikeThrough", tags: ["S", "DEL", "STRIKE"], createTag: "s" },
            superscript: { cmd: "superscript", tags: ["SUP"], createTag: "sup" },
            subscript: { cmd: "subscript", tags: ["SUB"], createTag: "sub" },
            code: { tags: ["CODE"], createTag: "code", defaultClass: "bg-slate-100 dark:bg-slate-800 text-rose-600 px-1 py-0.5 rounded font-mono text-xs" }
          };

          const toggleTag = (formatKey: string) => {
            const config = FORMAT_CONFIG[formatKey];
            if (!config) return;

            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;
            const blockEl = (container.nodeType === Node.ELEMENT_NODE
              ? (container as HTMLElement)
              : container.parentElement)?.closest("[contenteditable=\"true\"]") as HTMLElement | null;

            if (blockEl && document.activeElement !== blockEl) {
              blockEl.focus();
            }

            let isActive = false;
            if (config.cmd) {
              try {
                isActive = Boolean(document.queryCommandState(config.cmd));
              } catch (e) {
                isActive = false;
              }
            }

            const matchingTags = config.tags;
            const isMatchingElement = (el: HTMLElement | null) => {
              if (!el || el.id === holderId) return false;
              if (matchingTags.includes(el.tagName)) return true;
              if (formatKey === "bold" && (el.style.fontWeight === "bold" || parseInt(el.style.fontWeight, 10) >= 600)) return true;
              if (formatKey === "italic" && el.style.fontStyle === "italic") return true;
              if (formatKey === "underline" && el.style.textDecoration && el.style.textDecoration.includes("underline")) return true;
              if (formatKey === "strikethrough" && el.style.textDecoration && el.style.textDecoration.includes("line-through")) return true;
              return false;
            };

            // 1. Check upwards from commonAncestorContainer, anchorNode, and focusNode
            let existingWrapNode: HTMLElement | null = null;
            const checkParents = [
              container.nodeType === Node.TEXT_NODE ? container.parentElement : container as HTMLElement,
              selection.anchorNode?.nodeType === Node.TEXT_NODE ? selection.anchorNode.parentElement : selection.anchorNode as HTMLElement | null,
              selection.focusNode?.nodeType === Node.TEXT_NODE ? selection.focusNode.parentElement : selection.focusNode as HTMLElement | null
            ];

            for (const startParent of checkParents) {
              let curr = startParent;
              while (curr && curr.id !== holderId && !curr.classList.contains("ce-block")) {
                if (isMatchingElement(curr)) {
                  existingWrapNode = curr;
                  isActive = true;
                  break;
                }
                curr = curr.parentElement;
              }
              if (existingWrapNode) break;
            }

            // 2. Check downwards if selection encloses or intersects matching tags
            const enclosedMatchingNodes: HTMLElement[] = [];
            if (blockEl) {
              matchingTags.forEach(tag => {
                const els = Array.from(blockEl.getElementsByTagName(tag)) as HTMLElement[];
                els.forEach(el => {
                  try {
                    if (selection.containsNode(el, true)) {
                      enclosedMatchingNodes.push(el);
                      isActive = true;
                    }
                  } catch (e) {}
                });
              });
            }

            if (isActive) {
              // UNWRAP / REMOVE FORMAT
              if (config.cmd) {
                try {
                  document.execCommand(config.cmd, false);
                } catch (e) {}
              }

              if (existingWrapNode && existingWrapNode.parentNode) {
                const fragment = document.createDocumentFragment();
                while (existingWrapNode.firstChild) {
                  fragment.appendChild(existingWrapNode.firstChild);
                }
                existingWrapNode.parentNode.replaceChild(fragment, existingWrapNode);
              }

              enclosedMatchingNodes.forEach(node => {
                if (node.parentNode) {
                  const fragment = document.createDocumentFragment();
                  while (node.firstChild) {
                    fragment.appendChild(node.firstChild);
                  }
                  node.parentNode.replaceChild(fragment, node);
                }
              });
            } else {
              // APPLY FORMAT
              let appliedViaExec = false;
              if (config.cmd && !config.defaultClass) {
                try {
                  appliedViaExec = document.execCommand(config.cmd, false);
                } catch (e) {
                  appliedViaExec = false;
                }
              }

              if (!appliedViaExec) {
                const element = document.createElement(config.createTag);
                if (config.defaultClass) {
                  element.className = config.defaultClass;
                }
                try {
                  const fragment = range.extractContents();
                  element.appendChild(fragment);
                  range.insertNode(element);

                  const newRange = document.createRange();
                  newRange.selectNodeContents(element);
                  selection.removeAllRanges();
                  selection.addRange(newRange);
                } catch (e) {
                  console.warn("Failed to wrap selection:", e);
                }
              }
            }

            // Notify EditorJS & synchronizer
            if (blockEl) {
              blockEl.dispatchEvent(new Event("input", { bubbles: true }));
            }
            if (typeof document !== "undefined") {
              document.dispatchEvent(new Event("selectionchange"));
            }
            calculateLiveStats();
            if (onContentChange && editorRef.current && saveCleanContent) {
              saveCleanContent().then(content => {
                if (content) onContentChange(content);
              }).catch(console.error);
            }
          };

          if (format === "bold") {
            toggleTag("bold");
          } else if (format === "italic") {
            toggleTag("italic");
          } else if (format === "underline") {
            toggleTag("underline");
          } else if (format === "strikethrough") {
            toggleTag("strikethrough");
          } else if (format === "superscript") {
            toggleTag("superscript");
          } else if (format === "subscript") {
            toggleTag("subscript");
          } else if (format === "code") {
            toggleTag("code");
          } else if (format === "highlight") {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
    
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;
            const blockEl = (container.nodeType === Node.ELEMENT_NODE
              ? (container as HTMLElement)
              : container.parentElement)?.closest("[contenteditable=\"true\"]") as HTMLElement | null;

            if (blockEl && document.activeElement !== blockEl) {
              blockEl.focus();
            }
    
            const getColorClass = (colorKey?: string) => {
              switch (colorKey) {
                case "green":
                  return "bg-green-200/80 text-green-900 px-1 py-0.5 rounded";
                case "blue":
                  return "bg-sky-200/80 text-sky-900 px-1 py-0.5 rounded";
                case "pink":
                  return "bg-pink-200/80 text-pink-900 px-1 py-0.5 rounded";
                case "purple":
                  return "bg-purple-200/80 text-purple-950 px-1 py-0.5 rounded";
                case "yellow":
                default:
                  return "bg-yellow-200/80 text-yellow-900 px-1 py-0.5 rounded";
              }
            };
    
            // Find closest parent that matches the holder container or tag
            let parent = range.commonAncestorContainer as HTMLElement | null;
            if (parent && parent.nodeType === Node.TEXT_NODE) {
              parent = parent.parentElement;
            }
    
            let existingMark: HTMLElement | null = null;
            let node = parent;
            while (node && node.id !== holderId && node.tagName !== "DIV") {
              if (node.tagName === "MARK") {
                existingMark = node;
                break;
              }
              node = node.parentElement;
            }
    
            // Also check if selection contains a MARK tag
            if (!existingMark) {
              try {
                const containerEl = range.commonAncestorContainer;
                const parentEl = containerEl.nodeType === Node.TEXT_NODE ? containerEl.parentElement : containerEl as HTMLElement;
                if (parentEl) {
                  const markTags = parentEl.getElementsByTagName("mark");
                  for (let i = 0; i < markTags.length; i++) {
                    if (selection.containsNode(markTags[i], true)) {
                      existingMark = markTags[i];
                      break;
                    }
                  }
                }
              } catch (e) { }
            }
    
            if (existingMark) {
              if (color === "clear") {
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
            } else if (color !== "clear") {
              // Wrap selection in a new MARK tag
              const element = document.createElement("mark");
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
                console.warn("Failed to wrap selection with mark:", e);
              }
            }

            // Notify EditorJS & synchronizer
            if (blockEl) {
              blockEl.dispatchEvent(new Event("input", { bubbles: true }));
            }
            if (typeof document !== "undefined") {
              document.dispatchEvent(new Event("selectionchange"));
            }
            calculateLiveStats();
            if (onContentChange && editorRef.current && saveCleanContent) {
              saveCleanContent().then(content => {
                if (content) onContentChange(content);
              }).catch(console.error);
            }
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
        }
,
    insertInlineEquation: (formula?: string) => {
          insertInlineEquationLocal(formula);
        }
,
    saveSelectionRange: () => {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const holder = document.getElementById(holderId);
            if (holder && holder.contains(range.commonAncestorContainer)) {
              lastSelectionRangeRef.current = range.cloneRange();
            }
          }
        }
,
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
              success = true;
            } catch (rangeErr) {
              console.error('Failed direct range replacement:', rangeErr);
            }
          }

          // Fallback: Jika execCommand & direct range gagal (misal focus berpindah ke sidebar),
          // ganti isi teks pada active block EditorJS yang sedang dipilih atau insert block baru
          if (!success && editorRef.current && editorRef.current.blocks) {
            try {
              const currentIdx = typeof activeBlockIndexRef.current === 'number' && activeBlockIndexRef.current >= 0
                ? activeBlockIndexRef.current
                : editorRef.current.blocks.getCurrentBlockIndex();

              if (currentIdx >= 0) {
                const blockHolder = document.querySelectorAll('#' + holderId + ' .ce-block')[currentIdx];
                const contentEditable = blockHolder?.querySelector('[contenteditable="true"]') as HTMLElement | null;
                if (contentEditable) {
                  contentEditable.innerText = text;
                  success = true;
                } else {
                  const targetBlock = editorRef.current.blocks.getBlockByIndex(currentIdx);
                  if (targetBlock?.id) {
                    editorRef.current.blocks.update(targetBlock.id, { text });
                  } else {
                    (editorRef.current.blocks as any).update(currentIdx, { text });
                  }
                  success = true;
                }
              } else {
                const totalBlocks = editorRef.current.blocks.getBlocksCount();
                editorRef.current.blocks.insert('paragraph', { text }, undefined, totalBlocks, true);
                success = true;
              }
            } catch (blockErr) {
              console.warn('Fallback block replacement error:', blockErr);
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
        }
,
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
        }
,
    insertHtmlAtCursor: (html: string) => {
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
          console.warn('Could not restore selection before insertHtmlAtCursor:', e);
        }
      }

      let success = false;
      try {
        success = document.execCommand('insertHTML', false, html);
      } catch (e) {
        success = false;
      }

      if (!success && targetRange) {
        try {
          targetRange.deleteContents();
          const fragment = targetRange.createContextualFragment(html);
          const lastChild = fragment.lastChild;
          targetRange.insertNode(fragment);
          if (lastChild) {
            const newRange = document.createRange();
            newRange.setStartAfter(lastChild);
            newRange.setEndAfter(lastChild);
            if (selection) {
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
            lastSelectionRangeRef.current = newRange;
            lastHighlightedRangeRef.current = null;
          }
          let container: HTMLElement | null = targetRange.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
            ? (targetRange.commonAncestorContainer as HTMLElement)
            : targetRange.commonAncestorContainer.parentElement;
          const contentEditable = container?.closest('[contenteditable="true"]') as HTMLElement | null;
          if (contentEditable) {
            contentEditable.dispatchEvent(new Event('input', { bubbles: true }));
          }
          success = true;
        } catch (rangeErr) {
          console.error('Failed direct contextual range insertion:', rangeErr);
        }
      }

      if (!success && editorRef.current && editorRef.current.blocks) {
        try {
          const currentIdx = typeof activeBlockIndexRef.current === 'number' && activeBlockIndexRef.current >= 0
            ? activeBlockIndexRef.current
            : editorRef.current.blocks.getCurrentBlockIndex();

          const holder = document.getElementById(holderId) || document.getElementById('editorjs-holder') || document.querySelector('.codex-editor');
          if (currentIdx >= 0 && holder) {
            const blockHolder = holder.querySelectorAll('.ce-block')[currentIdx];
            const contentEditable = blockHolder?.querySelector('[contenteditable="true"]') as HTMLElement | null;
            if (contentEditable) {
              contentEditable.innerHTML += (contentEditable.innerHTML ? ' ' : '') + html;
              contentEditable.dispatchEvent(new Event('input', { bubbles: true }));
              success = true;
            } else {
              editorRef.current.blocks.insert('paragraph', { text: html }, undefined, currentIdx + 1, true);
              success = true;
            }
          } else {
            const totalBlocks = editorRef.current.blocks.getBlocksCount();
            editorRef.current.blocks.insert('paragraph', { text: html }, undefined, totalBlocks, true);
            success = true;
          }
        } catch (blockErr) {
          console.warn('Fallback HTML block insertion error:', blockErr);
        }
      }

      if (saveCleanContent && onContentChange) {
        saveCleanContent().then((outputData: any) => {
          if (outputData) onContentChange(outputData);
        }).catch(console.error);
      } else if (editorRef.current && editorRef.current.save) {
        editorRef.current.save().then((outputData: any) => {
          if (onContentChange) onContentChange(outputData);
        }).catch(console.error);
      }
      calculateLiveStats();
    },
  };
}
