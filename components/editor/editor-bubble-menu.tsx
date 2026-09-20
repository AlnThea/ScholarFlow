import React from 'react';
import { FormatMenu } from './bubble-menu/format-menu';
import { CitationMenu } from './bubble-menu/citation-menu';
import { IconBold, IconItalic, IconUnderline, IconStrikethrough, IconCode, 
  IconLink, IconHighlight, IconSearch, IconSparkles, IconQuote, IconCheck, IconExternalLink, IconChevronDown,
  IconLoader, IconLanguage, IconSum, IconHeart
} from '@tabler/icons-react';

export type EditorBubbleMenuProps = {
  showBubbleMenu: boolean;
  bubbleMenuRect: DOMRect | null;
  bubbleMode: 'format' | 'citation';
  activeFormats: any;
  editorJsRef: any;
  handleHighlightButtonClick: (e: React.MouseEvent<HTMLButtonElement>, source: 'toolbar' | 'bubble') => void;
  t: (key: string) => string;
  language: string;
  activePlanId: string;
  aiError: string | null;
  aiModels: any[];
  citationError: string | null;
  citationResults: any[];
  expandedCardId: string | null;
  findMostRelevantSentence: (abs: string | null | undefined, query: string) => string;
  isImproving: boolean;
  isSearchingCitations: boolean;
  onFindCitation: () => void;
  onImproveWriting: () => void;
  onInsertCitationCandidate: (candidate: any, isFromSearch?: boolean) => void;
  onParaphrase: () => void;
  selectedAiModel: string;
  selectedAiTone: string;
  selectedText: string;
  setBubbleMode: (mode: 'format' | 'citation') => void;
  setExpandedCardId: (id: string | null) => void;
  setIsPlanModalOpen: (open: boolean) => void;
  setIsSuggestionModalOpen: (open: boolean) => void;
  setNewTextForSuggestion: (text: string) => void;
  setSelectedAiModel: (model: string) => void;
  setSelectedAiTone: (tone: string) => void;
  setSelectedTextForSuggestion: (text: string) => void;
  setShowBubbleMenu: (show: boolean) => void;
  showAlertModal: (title: string, message: string, type: 'warning' | 'info' | 'error', callback: () => void) => void;
  editorMode: 'edit' | 'suggest';
  bubbleSearchQuery: string;
  setBubbleSearchQuery: (query: string) => void;
  setShowRightSidebar?: (show: boolean) => void;
};

export function EditorBubbleMenu(props: EditorBubbleMenuProps) {
  const {
    showBubbleMenu, bubbleMenuRect, bubbleMode, activeFormats, editorJsRef, handleHighlightButtonClick,
    t, language, activePlanId, aiError, aiModels, citationError, citationResults, expandedCardId,
    findMostRelevantSentence, isImproving, isSearchingCitations, onFindCitation, onImproveWriting,
    onInsertCitationCandidate, onParaphrase, selectedAiModel, selectedAiTone, selectedText,
    setBubbleMode, setExpandedCardId, setIsPlanModalOpen, setIsSuggestionModalOpen, setNewTextForSuggestion,
    setSelectedAiModel, setSelectedAiTone, setSelectedTextForSuggestion, setShowBubbleMenu, showAlertModal,
    editorMode, bubbleSearchQuery, setBubbleSearchQuery, setShowRightSidebar
  } = props;

  const getBtnClass = (isActive: boolean) => {
    return `p-1.5 rounded transition ${isActive
      ? 'bg-indigo-100/80 text-indigo-700 font-bold'
      : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
      }`;
  };

  return (
    <>
                {showBubbleMenu && bubbleMenuRect && (
      
                  <div
      
                    className="fixed z-50 bg-white border border-slate-200/80 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex flex-col transition-all duration-150 backdrop-blur-sm overflow-hidden"
      
                    style={(() => {
      
                      const isCitation = bubbleMode === 'citation';
      
                      const menuWidth = isCitation ? 480 : 310;
      
                      const menuHeight = isCitation ? 390 : 310;
      
                      const winH = typeof window !== 'undefined' ? window.innerHeight : 800;
      
                      const winW = typeof window !== 'undefined' ? window.innerWidth : 1200;
      
      
      
                      const anchorY = bubbleMenuRect.bottom > 0 ? bubbleMenuRect.bottom : bubbleMenuRect.top;
      
                      const anchorX = bubbleMenuRect.left > 0 ? bubbleMenuRect.left : bubbleMenuRect.right;
      
      
      
                      // Determine vertical position: pop UP if pointer is near bottom of viewport
      
                      const shouldPopUp = (anchorY + menuHeight + 15 > winH) && (anchorY > menuHeight);
      
                      let topPos = shouldPopUp
      
                        ? anchorY - menuHeight - 10
      
                        : anchorY + 10;
      
      
      
                      // Clamp inside viewport [10, winH - menuHeight - 10]
      
                      topPos = Math.max(10, Math.min(winH - menuHeight - 10, topPos));
      
      
      
                      // Clamp left position inside viewport [10, winW - menuWidth - 10]
      
                      let leftPos = bubbleMenuRect.width > 0
      
                        ? bubbleMenuRect.left + bubbleMenuRect.width / 2 - menuWidth / 2
      
                        : anchorX;
      
      
      
                      if (leftPos + menuWidth > winW - 10) {
      
                        leftPos = winW - menuWidth - 10;
      
                      }
      
                      leftPos = Math.max(10, leftPos);
      
      
      
                      return {
      
                        top: `${topPos}px`,
      
                        left: `${leftPos}px`,
      
                        width: `${menuWidth}px`,
      
                      };
      
                    })()}
      
                  >
      
                    {/* ── FORMAT MODE ── */}                    {bubbleMode === 'format' && (
                      <FormatMenu
                        activeFormats={activeFormats}
                        editorJsRef={editorJsRef}
                        handleHighlightButtonClick={handleHighlightButtonClick}
                        t={t}
                        language={language}
                        selectedAiModel={selectedAiModel}
                        setSelectedAiModel={setSelectedAiModel}
                        aiModels={aiModels}
                        selectedAiTone={selectedAiTone}
                        setSelectedAiTone={setSelectedAiTone}
                        editorMode={editorMode}
                        setSelectedTextForSuggestion={setSelectedTextForSuggestion}
                        setNewTextForSuggestion={setNewTextForSuggestion}
                        setIsSuggestionModalOpen={setIsSuggestionModalOpen}
                        isImproving={isImproving}
                        activePlanId={activePlanId}
                        showAlertModal={showAlertModal}
                        setIsPlanModalOpen={setIsPlanModalOpen}
                        onImproveWriting={onImproveWriting}
                        setShowRightSidebar={setShowRightSidebar}
                        onParaphrase={onParaphrase}
                        setShowBubbleMenu={setShowBubbleMenu}
                        setBubbleMode={setBubbleMode}
                        onFindCitation={onFindCitation}
                        aiError={aiError}
                      />
                    )}

                    {bubbleMode === 'citation' && (
                      <CitationMenu
                        setBubbleMode={setBubbleMode}
                        selectedText={selectedText}
                        setShowBubbleMenu={setShowBubbleMenu}
                        isSearchingCitations={isSearchingCitations}
                        citationError={citationError}
                        citationResults={citationResults}
                        editorJsRef={editorJsRef}
                        onInsertCitationCandidate={onInsertCitationCandidate}
                        expandedCardId={expandedCardId}
                        setExpandedCardId={setExpandedCardId}
                        findMostRelevantSentence={findMostRelevantSentence}
                      />
                    )}
                  </div>
      
                )}
      
    </>
  );
}

import { FormatMenu } from './bubble-menu/format-menu';
import { CitationMenu } from './bubble-menu/citation-menu';

