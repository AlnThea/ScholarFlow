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
        try {
          if (typeof undoRef.current.canUndo === 'function' && !undoRef.current.canUndo()) {
            return;
          }
          undoRef.current.undo();
        } catch (err) {
          console.warn('[ScholarFlow Undo] Batas riwayat tercapai atau tidak ada perubahan yang bisa di-undo:', err);
        }
      }
    },
    redo: () => {
      if (undoRef.current) {
        try {
          if (typeof undoRef.current.canRedo === 'function' && !undoRef.current.canRedo()) {
            return;
          }
          undoRef.current.redo();
        } catch (err) {
          console.warn('[ScholarFlow Redo] Batas riwayat tercapai atau tidak ada perubahan yang bisa di-redo:', err);
        }
      }
    },
  };
}
