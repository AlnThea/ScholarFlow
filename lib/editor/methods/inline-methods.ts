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
              if (node.tagName === targetTag && (!className || className.split(' ').every(c => node.classList.contains(c)))) {
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
              } catch (e) { }
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
  };
}
