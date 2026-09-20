import type { EditorJsMethodsProps } from '@/hooks/use-editorjs-methods';

export function buildCitationMethods(props: EditorJsMethodsProps) {
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
        }
,
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
        }
,
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
        }
,
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
        }
,
  };
}
