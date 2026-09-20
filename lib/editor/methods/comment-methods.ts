import type { EditorJsMethodsProps } from '@/hooks/use-editorjs-methods';

export function buildCommentMethods(props: EditorJsMethodsProps) {
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
        }
,
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
        }
,
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
        }
,
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
        }
,
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
        }
,
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
        }
,
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
        }
,
  };
}
