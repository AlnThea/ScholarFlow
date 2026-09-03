const fs = require('fs');

const code = fs.readFileSync('components/editor/editor-sidebar.tsx', 'utf-8');
const lines = code.split('\n');

// Helper to get boundaries
function findBoundary(startStr, endStr, startLine = 0) {
    let s = -1;
    let e = -1;
    let count = 0;
    for (let i = startLine; i < lines.length; i++) {
        if (s === -1 && lines[i].includes(startStr)) {
            s = i;
            // Count parens/braces if needed, but since we are at top level ternary:
        }
        if (s !== -1 && lines[i].includes(endStr)) {
            e = i - 1; // line before endStr
            break;
        }
    }
    return [s, e];
}

const [libS, libE] = findBoundary("workspaceTab === 'library' ? (", ") : workspaceTab === 'writing' ? (");
const [writS, writE] = findBoundary(") : workspaceTab === 'writing' ? (", ") : workspaceTab === 'document' ? (", libE);
const [docS, docE] = findBoundary(") : workspaceTab === 'document' ? (", ") : workspaceTab === 'comments' ? (", writE);
const [comS, comE] = findBoundary(") : workspaceTab === 'comments' ? (", ")}", docE); // Ends at `)}` for the whole block

console.log('Library:', libS, libE);
console.log('Writing:', writS, writE);
console.log('Document:', docS, docE);
console.log('Comments:', comS, comE);

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
    // Generate an overly permissive props type to avoid TS errors
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
    // Local states
    workspaceTab, setWorkspaceTab, commentFilterTab, setCommentFilterTab,
    suggestionSubTab, setSuggestionSubTab, query, setQuery, isHistoryModalOpen,
    setIsHistoryModalOpen, localIsExpanded, setLocalIsExpanded, scanStatus,
    setScanStatus, scanProgress, setScanProgress, similarityScore, setSimilarityScore,
    plagiarismDetails, setPlagiarismDetails, selectedFolderFilter, setSelectedFolderFilter,
    newFolderName, setNewFolderName, isAddingFolder, setIsAddingFolder,
    // Utilities
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

if (libS !== -1 && writS !== -1 && docS !== -1 && comS !== -1) {
    fs.writeFileSync('components/editor/sidebar-library-tab.tsx', createComponent('SidebarLibraryTab', lines.slice(libS + 1, libE + 1).join('\n')));
    fs.writeFileSync('components/editor/sidebar-writing-tab.tsx', createComponent('SidebarWritingTab', lines.slice(writS + 1, writE + 1).join('\n')));
    fs.writeFileSync('components/editor/sidebar-document-tab.tsx', createComponent('SidebarDocumentTab', lines.slice(docS + 1, docE + 1).join('\n')));
    // For comments, we need to find the correct end bracket.
    // Let's assume comE is correct for now, or comE - 1 if it includes `)}`
    let finalComE = comE;
    while(lines[finalComE].includes(')}')) finalComE--;
    fs.writeFileSync('components/editor/sidebar-comments-tab.tsx', createComponent('SidebarCommentsTab', lines.slice(comS + 1, finalComE + 1).join('\n')));

    // Now replace the content in editor-sidebar.tsx
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
        `          ) : null}`,
        ...lines.slice(comE + 1)
    ];

    let newCode = newLines.join('\n');
    
    // Add imports
    const importStr = `import { SidebarLibraryTab } from './sidebar-library-tab';
import { SidebarWritingTab } from './sidebar-writing-tab';
import { SidebarDocumentTab } from './sidebar-document-tab';
import { SidebarCommentsTab } from './sidebar-comments-tab';\n`;
    
    newCode = newCode.replace("import { BurstinessChart } from './burstiness-chart';", importStr + "import { BurstinessChart } from './burstiness-chart';");

    fs.writeFileSync('components/editor/editor-sidebar.tsx', newCode);
    console.log('Extraction complete!');
} else {
    console.log('Could not find boundaries.');
}

