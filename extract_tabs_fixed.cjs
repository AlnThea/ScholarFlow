const fs = require('fs');

const code = fs.readFileSync('components/editor/editor-sidebar.tsx', 'utf-8');
const lines = code.split('\n');

const libS = 356; 
const writS = 540;
const docS = 668;
const comS = 897;
const comE = 1213;

const commonImports = `import React from 'react';
import {
  IconBook, IconCheck, IconDownload, IconExternalLink, IconFileText,
  IconFilter, IconFolderOpen, IconLoader2, IconCirclePlus, IconQuote,
  IconSearch, IconSum, IconSparkles, IconWand, IconChevronLeft,
  IconChevronRight, IconLanguage, IconX, IconClock, IconTrash, IconCopy, IconHistory
} from '@tabler/icons-react';
import { BurstinessChart } from './burstiness-chart';
`;

function createComponent(name, content) {
    return `${commonImports}

export const ${name} = (props: any) => {
  const {
    selectedText, citationResults, citationHistory, wordCount, characterCount,
    citationCount, bibliographyEntries, improvedText, isImproving, isSearchingCitations,
    aiError, citationError, citationNote, onApplyImprovedText, onImproveWriting,
    onParaphrase, onSummarize, onGenerateAbstract, onFindCitation, onRepeatCitationSearch,
    onInsertCitation, onInsertBibliography, onInsertImageSample, onExportBibliographyText,
    onExportBibliographyJson, onExportBibliographyBibtex, onExportBibliographyRis,
    onInsertCitationCandidate, onParafrasePlagiat, selectedAiModel, isSynthesizing,
    synthesizedText, synthesizeError, synthesizeDisclaimer, onSynthesizeReview,
    onInsertSynthesizedText, citationStyle, onChangeCitationStyle, folders,
    folderAssignments, onCreateFolder, onAssignFolder, isExpanded, onToggleExpanded,
    onClose, aiHistory, onDeleteAiHistoryEntry, onClearAiHistory, isApplied,
    comments, suggestions, onAcceptSuggestion, onRejectSuggestion, onResolveComment,
    onCommentClick, activeTab, 
    workspaceTab, setWorkspaceTab, commentFilterTab, setCommentFilterTab,
    suggestionSubTab, setSuggestionSubTab, query, setQuery, isHistoryModalOpen,
    setIsHistoryModalOpen, localIsExpanded, setLocalIsExpanded, scanStatus,
    setScanStatus, scanProgress, setScanProgress, similarityScore, setSimilarityScore,
    plagiarismDetails, setPlagiarismDetails, selectedFolderFilter, setSelectedFolderFilter,
    newFolderName, setNewFolderName, isAddingFolder, setIsAddingFolder,
    t, getSourceLabel, formatHistoryLabel, ActionButton, PanelRow
  } = props;

  return (
    <>
${content}
    </>
  );
};
`;
}

fs.writeFileSync('components/editor/sidebar-library-tab.tsx', createComponent('SidebarLibraryTab', lines.slice(libS + 1, writS).join('\n')));
fs.writeFileSync('components/editor/sidebar-writing-tab.tsx', createComponent('SidebarWritingTab', lines.slice(writS + 1, docS).join('\n')));
fs.writeFileSync('components/editor/sidebar-document-tab.tsx', createComponent('SidebarDocumentTab', lines.slice(docS + 1, comS).join('\n')));
fs.writeFileSync('components/editor/sidebar-comments-tab.tsx', createComponent('SidebarCommentsTab', lines.slice(comS + 1, comE + 1).join('\n')));

const sharedProps = `{...props}
          workspaceTab={workspaceTab} setWorkspaceTab={setWorkspaceTab}
          commentFilterTab={commentFilterTab} setCommentFilterTab={setCommentFilterTab}
          suggestionSubTab={suggestionSubTab} setSuggestionSubTab={setSuggestionSubTab}
          query={query} setQuery={setQuery}
          isHistoryModalOpen={isHistoryModalOpen} setIsHistoryModalOpen={setIsHistoryModalOpen}
          localIsExpanded={localIsExpanded} setLocalIsExpanded={setLocalIsExpanded}
          scanStatus={scanStatus} setScanStatus={setScanStatus}
          scanProgress={scanProgress} setScanProgress={setScanProgress}
          similarityScore={similarityScore} setSimilarityScore={setSimilarityScore}
          plagiarismDetails={plagiarismDetails} setPlagiarismDetails={setPlagiarismDetails}
          selectedFolderFilter={selectedFolderFilter} setSelectedFolderFilter={setSelectedFolderFilter}
          newFolderName={newFolderName} setNewFolderName={setNewFolderName}
          isAddingFolder={isAddingFolder} setIsAddingFolder={setIsAddingFolder}
          t={t} getSourceLabel={getSourceLabel} formatHistoryLabel={formatHistoryLabel}
          ActionButton={ActionButton} PanelRow={PanelRow}`;

const newLines = [
    ...lines.slice(0, libS),
    `          {workspaceTab === 'library' ? (`,
    `            <SidebarLibraryTab ${sharedProps} />`,
    `          ) : workspaceTab === 'writing' ? (`,
    `            <SidebarWritingTab ${sharedProps} />`,
    `          ) : workspaceTab === 'document' ? (`,
    `            <SidebarDocumentTab ${sharedProps} />`,
    `          ) : workspaceTab === 'comments' ? (`,
    `            <SidebarCommentsTab ${sharedProps} />`,
    ...lines.slice(comE + 1)
];

let newCode = newLines.join('\n');

const importStr = `import { SidebarLibraryTab } from './sidebar-library-tab';
import { SidebarWritingTab } from './sidebar-writing-tab';
import { SidebarDocumentTab } from './sidebar-document-tab';
import { SidebarCommentsTab } from './sidebar-comments-tab';\n`;

newCode = newCode.replace("import { BurstinessChart } from './burstiness-chart';", importStr + "import { BurstinessChart } from './burstiness-chart';");

fs.writeFileSync('components/editor/editor-sidebar.tsx', newCode);
console.log('Extraction complete fixed!');
