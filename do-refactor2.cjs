const fs = require('fs');
const path = require('path');

const filePath = 'C:/web/ScholarFlow/components/editor/editor-layout.tsx';
let content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

const data = {"mathToastLine":336,"activeMathCategoryLine":351,"mathSearchQueryLine":352,"mathHelperItemsStart":354,"mathHelperItemsEnd":459,"filteredMathHelperItemsStart":461,"filteredMathHelperItemsEnd":473,"mathPanelStart":999,"mathPanelEndExact":1140,"bubbleStart":1143,"bubbleEndExact":1631};

// 1. Math states block
const mathStatesStart = data.mathToastLine;
const mathStatesEnd = data.filteredMathHelperItemsEnd;
const mathStatesLines = lines.slice(mathStatesStart, mathStatesEnd + 1).join('\n');

// 2. Math Panel UI
const mathPanelUI = lines.slice(data.mathPanelStart, data.mathPanelEndExact + 1).join('\n');

// 3. Bubble Menu UI
const bubbleUI = lines.slice(data.bubbleStart, data.bubbleEndExact + 1).join('\n');

// Create math-helper-panel.tsx
const mathHelperCode = `
import React, { useState, useMemo } from 'react';
import { IconCheck, IconX, IconSearch } from '@tabler/icons-react';
import { KatexPreview } from './katex-preview';

export type MathHelperPanelProps = {
  isMathHelperOpen: boolean;
  setIsMathHelperOpen: (open: boolean) => void;
  language: string;
  showRightSidebar: boolean;
  isRightSidebarExpanded: boolean;
};

export function MathHelperPanel({
  isMathHelperOpen,
  setIsMathHelperOpen,
  language,
  showRightSidebar,
  isRightSidebarExpanded
}: MathHelperPanelProps) {
${mathStatesLines.replace(/^/gm, '  ')}

  return (
    <>
${mathPanelUI.replace(/^/gm, '      ')}
    </>
  );
}
`;
fs.writeFileSync('C:/web/ScholarFlow/components/editor/math-helper-panel.tsx', mathHelperCode.trim());

// Create editor-bubble-menu.tsx
const bubbleMenuCode = `
import React from 'react';
import {
  IconBold, IconItalic, IconUnderline, IconStrikethrough, IconCode,
  IconLink, IconHighlight, IconSearch, IconSparkles, IconQuote, IconCheck, IconExternalLink, IconChevronDown
} from '@tabler/icons-react';

export type EditorBubbleMenuProps = {
  showBubbleMenu: boolean;
  bubbleMenuRect: DOMRect | null;
  bubbleMode: 'format' | 'citation';
  activeFormats: any;
  editorJsRef: any;
  handleHighlightButtonClick: (e: React.MouseEvent, source: string) => void;
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
  onInsertCitationCandidate: (candidate: any) => void;
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
  showAlertModal: (options: any) => void;
  editorMode: 'edit' | 'suggest';
  bubbleSearchQuery: string;
  setBubbleSearchQuery: (query: string) => void;
};

export function EditorBubbleMenu(props: EditorBubbleMenuProps) {
  const {
    showBubbleMenu, bubbleMenuRect, bubbleMode, activeFormats, editorJsRef, handleHighlightButtonClick,
    t, language, activePlanId, aiError, aiModels, citationError, citationResults, expandedCardId,
    findMostRelevantSentence, isImproving, isSearchingCitations, onFindCitation, onImproveWriting,
    onInsertCitationCandidate, onParaphrase, selectedAiModel, selectedAiTone, selectedText,
    setBubbleMode, setExpandedCardId, setIsPlanModalOpen, setIsSuggestionModalOpen, setNewTextForSuggestion,
    setSelectedAiModel, setSelectedAiTone, setSelectedTextForSuggestion, setShowBubbleMenu, showAlertModal,
    editorMode, bubbleSearchQuery, setBubbleSearchQuery
  } = props;

  const getBtnClass = (isActive: boolean) => {
    return \`p-1.5 rounded transition \${isActive
      ? 'bg-indigo-100/80 text-indigo-700 font-bold'
      : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
      }\`;
  };

  return (
    <>
${bubbleUI.replace(/^/gm, '      ')}
    </>
  );
}
`;
fs.writeFileSync('C:/web/ScholarFlow/components/editor/editor-bubble-menu.tsx', bubbleMenuCode.trim());

// Now modify editor-layout.tsx
let newLines = [];
let i = 0;
while(i < lines.length) {
  if (i === mathStatesStart) {
    i = mathStatesEnd + 1;
    continue;
  }
  
  if (i === data.mathPanelStart) {
    newLines.push(`          <MathHelperPanel
            isMathHelperOpen={isMathHelperOpen}
            setIsMathHelperOpen={setIsMathHelperOpen}
            language={language}
            showRightSidebar={showRightSidebar}
            isRightSidebarExpanded={isRightSidebarExpanded}
          />`);
    i = data.mathPanelEndExact + 1;
    continue;
  }

  if (i === data.bubbleStart) {
    newLines.push(`          <EditorBubbleMenu
            showBubbleMenu={showBubbleMenu}
            bubbleMenuRect={bubbleMenuRect}
            bubbleMode={bubbleMode}
            activeFormats={activeFormats}
            editorJsRef={editorJsRef}
            handleHighlightButtonClick={handleHighlightButtonClick}
            t={t}
            language={language}
            activePlanId={activePlanId}
            aiError={aiError}
            aiModels={aiModels}
            citationError={citationError}
            citationResults={citationResults}
            expandedCardId={expandedCardId}
            findMostRelevantSentence={findMostRelevantSentence}
            isImproving={isImproving}
            isSearchingCitations={isSearchingCitations}
            onFindCitation={onFindCitation}
            onImproveWriting={onImproveWriting}
            onInsertCitationCandidate={onInsertCitationCandidate}
            onParaphrase={onParaphrase}
            selectedAiModel={selectedAiModel}
            selectedAiTone={selectedAiTone}
            selectedText={selectedText}
            setBubbleMode={setBubbleMode}
            setExpandedCardId={setExpandedCardId}
            setIsPlanModalOpen={setIsPlanModalOpen}
            setIsSuggestionModalOpen={setIsSuggestionModalOpen}
            setNewTextForSuggestion={setNewTextForSuggestion}
            setSelectedAiModel={setSelectedAiModel}
            setSelectedAiTone={setSelectedAiTone}
            setSelectedTextForSuggestion={setSelectedTextForSuggestion}
            setShowBubbleMenu={setShowBubbleMenu}
            showAlertModal={showAlertModal}
            editorMode={editorMode}
            bubbleSearchQuery={bubbleSearchQuery}
            setBubbleSearchQuery={setBubbleSearchQuery}
          />`);
    i = data.bubbleEndExact + 1;
    continue;
  }

  newLines.push(lines[i]);
  i++;
}

// Add imports
const importMath = "import { MathHelperPanel } from './math-helper-panel';";
const importBubble = "import { EditorBubbleMenu } from './editor-bubble-menu';";

const importIdx = newLines.findIndex(l => l.includes("import { EditorJsToolbar }"));
if (importIdx !== -1) {
  newLines.splice(importIdx, 0, importMath, importBubble);
} else {
  newLines.unshift(importMath, importBubble);
}

fs.writeFileSync(filePath, newLines.join('\n'));
console.log("Refactoring complete!");
