import type { EditorJsMethodsProps } from '@/hooks/use-editorjs-methods';

export function buildHistoryMethods(props: EditorJsMethodsProps) {
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
    undo: () => {
          if (undoRef.current) {
            undoRef.current.undo();
          }
        }
,
    redo: () => {
          if (undoRef.current) {
            undoRef.current.redo();
          }
        }
,
  };
}
