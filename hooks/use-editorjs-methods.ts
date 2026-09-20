import { MutableRefObject } from 'react';
import type EditorJS from '@editorjs/editorjs';
import { buildHistoryMethods } from '@/lib/editor/methods/history-methods';
import { buildBlockMethods } from '@/lib/editor/methods/block-methods';
import { buildInlineMethods } from '@/lib/editor/methods/inline-methods';
import { buildCitationMethods } from '@/lib/editor/methods/citation-methods';
import { buildCommentMethods } from '@/lib/editor/methods/comment-methods';

export interface EditorJsMethodsProps {
  editorRef: MutableRefObject<EditorJS | null>;
  undoRef: MutableRefObject<any>;
  holderId: string;
  activeBlockIndexRef: MutableRefObject<number>;
  lastSelectionRangeRef: MutableRefObject<Range | null>;
  lastHighlightedRangeRef: MutableRefObject<Range | null>;
  savedLinkRangeRef: MutableRefObject<Range | null>;
  isRenderingRef: MutableRefObject<boolean>;
  pendingContentRef: MutableRefObject<any>;
  onContentChange?: (content: any) => void;
  onBlockTypeChange?: (type: string) => void;
  onAlignmentChange?: (align: string) => void;
  onStatsChange?: (stats: any) => void;
  onInsertLinkRequest?: (defaultUrl: string, onSave: (url: string) => void, onUnlink?: () => void) => void;
  restoreBlockAlignments: () => void;
  calculateLiveStats: () => void;
  saveCleanContent: () => Promise<any>;
  renderAllInlineMath: () => void;
  adjustAllCodeTextareaHeights: () => void;
  insertInlineEquationLocal: (customFormula?: string) => void;
}

export function buildEditorJsMethods(props: EditorJsMethodsProps) {
  return {
    ...buildHistoryMethods(props),
    ...buildBlockMethods(props),
    ...buildInlineMethods(props),
    ...buildCitationMethods(props),
    ...buildCommentMethods(props),
  };
}
