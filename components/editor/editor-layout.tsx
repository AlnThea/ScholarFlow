// c:/web/ScholarFlow/components/editor/editor-layout.tsx
'use client';

import { EditorModalsWrapper } from './editor-modals-wrapper';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { EditorJsEditor } from './editorjs-editor';
import { EditorSidebar } from './editor-sidebar';
import { Switch } from './editor-switch';
import { KatexPreview } from './katex-preview';
import { EditorHeader } from './editor-header';
import { DashboardView } from './dashboard-view';
import { MathHelperPanel } from './math-helper-panel';
import { EditorBubbleMenu } from './editor-bubble-menu';
import { EditorJsToolbar } from './editorjs-toolbar';
import { addSuggestion } from '@/lib/api/suggestions';
import 'katex/dist/katex.min.css';

import { useDataService } from '@/lib/services';

import { MinimalSidebar } from './minimal-sidebar';
import { useLanguage } from '../i18n/language-context';
import type { ImproveWritingResponse } from '@/lib/api/ai';
import type { CitationCandidate } from '@/lib/api/citations';
import type { CitationHistoryEntry } from '@/lib/editor/citation-history';
import type { AiHistoryEntry } from '@/lib/editor/ai-history';
import type { BibliographyEntry } from '@/lib/editor/bibliography';
import type { DocumentListItem, DocumentEntry } from '@/lib/api/documents';
import dynamic from 'next/dynamic';

import { exportToWordFile, exportToPdfFile } from '@/lib/editor/citation-export-word';


import { useAuth } from '@/components/auth/auth-provider';
import { fetchPricingPlans, updatePricingPlan, createPricingPlan, deletePricingPlan, type PricingPlan } from '@/lib/api/pricing';
import { fetchPaymentGateways, updatePaymentGatewayStatus, type PaymentGateway } from '@/lib/api/payment-gateways';
import { type AIModel, type AIProvider, createAIModel, deleteAIModel, DEFAULT_PROVIDERS, createAIProvider, updateAIProvider, deleteAIProvider } from '@/lib/api/ai-models';
import { createNotification, type DocumentNotification } from '@/lib/api/comments';
import { type UserPresence } from '@/lib/api/presence';


import type { EditorLayoutProps } from './types';
import { findMostRelevantSentence } from '@/lib/editor/editor-utils';



import { useAdminModals } from '@/hooks/use-admin-modals';
import { useEditorModals } from '@/hooks/use-editor-modals';
import { useEditorLayoutLogic } from '@/hooks/use-editor-layout-logic';
export function EditorLayout({
  statusLabel,
  selectedText,
  wordCount,
  characterCount,
  citationCount,
  citationResults,
  citationHistory,
  bibliographyEntries,
  improvedText,
  isImproving,
  isSearchingCitations,
  aiError,
  citationError,
  citationNote,
  onApplyImprovedText,
  onInsertBibliography,
  onInsertImageSample,
  onExportBibliographyText,
  onExportBibliographyJson,
  onExportBibliographyBibtex,
  onExportBibliographyRis,
  onInsertCitationCandidate,
  onRepeatCitationSearch,
  onInsertCitation,
  onFindCitation,
  onImproveWriting,
  onParaphrase,
  onSummarize,
  onGenerateAbstract,
  onSelectionChange,
  onStatsChange,
  editorJsRef,
  onCiteClick,
  activePdfUrl,
  activePdfSearchTerm,
  onClosePdf,
  documents,
  currentDocument,
  onSelectDocument,
  onCreateDocument,
  onDeleteDocument,
  onRenameDocument,
  onContentChange,
  selectedAiModel,
  setSelectedAiModel,
  selectedAiTone,
  setSelectedAiTone,
  aiModels,
  onUpdateAIModel,
  onCreateAIModel,
  onDeleteAIModel,
  aiProviders = DEFAULT_PROVIDERS,
  onUpdateAIProvider,
  onCreateAIProvider,
  onDeleteAIProvider,
  onParafrasePlagiat,
  isSynthesizing,
  synthesizedText,
  synthesizeError,
  synthesizeDisclaimer,
  onSynthesizeReview,
  onInsertSynthesizedText,
  citationStyle,
  onChangeCitationStyle,
  folders,
  folderAssignments,
  onCreateFolder,
  onAssignFolder,
  aiHistory,
  onDeleteAiHistoryEntry,
  onClearAiHistory,
  isApplied,
  onOpenSettings,
  onSaveSettings,
  onAlignmentChange,
  notifications = [],
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onNotificationClick,
  comments = [],
  suggestions = [],
  activeUsers = [],
  onAcceptSuggestion,
  onRejectSuggestion,
  onResolveComment,
  onCommentClick,
  activeSidebarTab
}: EditorLayoutProps) {
  const {
    mounted,
    setMounted,
    isDarkMode,
    setIsDarkMode,
    toggleDarkMode,
    dashboardExpandedProjects,
    setDashboardExpandedProjects,
    language,
    setLanguage,
    t,
    isEn,
    isSidebarExpanded,
    setIsSidebarExpanded,
    toggleSidebar,
    showRightSidebar,
    setShowRightSidebar,
    expandedCardId,
    setExpandedCardId,
    currentBlockType,
    setCurrentBlockType,
    currentAlignment,
    setCurrentAlignment,
    editorMode,
    setEditorMode,
    selectedTextForSuggestion,
    setSelectedTextForSuggestion,
    newTextForSuggestion,
    setNewTextForSuggestion,
    isPricingOpen,
    setIsPricingOpen,
    isHelpOpen,
    setIsHelpOpen,
    mathToast,
    setMathToast,
    backendType,
    isMathHelperOpen,
    setIsMathHelperOpen,
    groupedDocs,
    profile,
    user,
    role,
    activePlanId,
    pathname,
    router,
    activeDashboardTab,
    handleSetDashboardTab,
    bubbleMenuRect,
    setBubbleMenuRect,
    showBubbleMenu,
    setShowBubbleMenu,
    bubbleMode,
    setBubbleMode,
    activeFormats,
    setActiveFormats,
    currentFontSize,
    setCurrentFontSize,
    isRightSidebarExpanded,
    setIsRightSidebarExpanded,
    handleToggleRightSidebarExpanded,
    bubbleSearchQuery,
    setBubbleSearchQuery,
    getBtnClass
  } = useEditorLayoutLogic({
    currentDocument,
    documents,
    selectedText,
    onSelectionChange,
  });

  const adminModals = useAdminModals({
    activeDashboardTab,
    aiModels,
    onUpdateAIModel,
    onCreateAIModel,
    onDeleteAIModel,
    aiProviders,
    onUpdateAIProvider,
    onCreateAIProvider,
    onDeleteAIProvider
  });

  const {
    adminPlans, setAdminPlans,
    loadingAdminPlans,
    gatewaysList,
    togglingGatewayId,
    alertModalState, setAlertModalState, showAlertModal, showConfirmModal,
    savingModelId, editModelStates,
    isModelModalOpen, setIsModelModalOpen,
    selectedModelForModal, modalModelState, setModalModelState,
    handleOpenEditModelModal, handleOpenCreateModelModal,
    testingModelId, handleTestModelConnection,
    handleSaveModalModel, handleDeleteModel, handleToggleModelStatus,
    isProviderModalOpen, setIsProviderModalOpen,
    selectedProviderForModal, modalProviderState, setModalProviderState,
    handleOpenCreateProviderModal, handleOpenEditProviderModal,
    handleSaveModalProvider, handleDeleteProvider,
    handleToggleGateway, handleSavePlan,
    isPlanModalOpen, setIsPlanModalOpen,
    selectedPlanForModal, modalPlanState, setModalPlanState,
    handleOpenEditModal, handleOpenCreateModal,
    handleSaveModalPlan, handleDeletePlan,
    editStates, setEditStates, savingPlanId
  } = adminModals;



  const editorModals = useEditorModals({ editorJsRef });

  const {
    isImageModalOpen, setIsImageModalOpen,
    imageUrlInput, setImageUrlInput,
    handleInsertImageConfirm,
    isMathModalOpen, setIsMathModalOpen,
    mathFormulaInput, setMathFormulaInput,
    editingMathCallback, setEditingMathCallback,
    handleInsertMathConfirm,
    isLinkModalOpen, setIsLinkModalOpen,
    linkUrlInput, setLinkUrlInput,
    insertLinkCallback, setInsertLinkCallback,
    handleInsertLinkConfirm, handleUnlinkConfirm,
    showHighlightPopover, setShowHighlightPopover,
    highlightPopoverRect, setHighlightPopoverRect,
    highlightTriggerSource, setHighlightTriggerSource,
    handleHighlightButtonClick, handleApplyHighlight,
    isExportUpgradeModalOpen, setIsExportUpgradeModalOpen,
    isSuggestionModalOpen, setIsSuggestionModalOpen,
    isShareOpen, setIsShareOpen,
    isBackendModalOpen, setIsBackendModalOpen
  } = editorModals;

  const isAnyModalOpen = isPlanModalOpen || isModelModalOpen || isImageModalOpen || isMathModalOpen;

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Hide native EditorJS inline toolbar to avoid overlaps */}
      <style>{`
        .ce-inline-toolbar {
          display: none !important;
        }
      `}</style>

      {/* Left sidebar with app name */}
      <MinimalSidebar
        isExpanded={isSidebarExpanded}
        onToggle={toggleSidebar}
        documents={documents}
        currentDocumentId={currentDocument?.id}
        onSelectDocument={onSelectDocument}
        onCreateDocument={onCreateDocument}
        onDeleteDocument={onDeleteDocument}
        onSelectAdminTab={handleSetDashboardTab as any}
        activeDashboardTab={activeDashboardTab as any}
        className={isAnyModalOpen ? 'select-none pointer-events-none' : ''}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenBackendSettings={() => setIsBackendModalOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />


      {/* If no document is selected, render the Dashboard View */}
      {!currentDocument ? (
        <DashboardView
          isAnyModalOpen={isAnyModalOpen}
          setIsPricingOpen={setIsPricingOpen}
          toggleDarkMode={toggleDarkMode}
          isDarkMode={isDarkMode}
          activeDashboardTab={activeDashboardTab}
          onCreateDocument={onCreateDocument}
          showAlertModal={showAlertModal}
          language={language}
          documents={documents}
          groupedDocs={groupedDocs}
          dashboardExpandedProjects={dashboardExpandedProjects}
          setDashboardExpandedProjects={setDashboardExpandedProjects}
          onSelectDocument={onSelectDocument}
          loadingAdminPlans={loadingAdminPlans}
          adminPlans={adminPlans}
          handleOpenCreateModal={handleOpenCreateModal}
          handleOpenEditModal={handleOpenEditModal}
          handleDeletePlan={handleDeletePlan}
          isEn={isEn}
          aiModels={aiModels}
          handleOpenCreateProviderModal={handleOpenCreateProviderModal}
          handleOpenCreateModelModal={handleOpenCreateModelModal}
          handleToggleModelStatus={handleToggleModelStatus}
          handleOpenEditModelModal={handleOpenEditModelModal}
          handleDeleteModel={handleDeleteModel}
          handleOpenEditProviderModal={handleOpenEditProviderModal}
          gatewaysList={gatewaysList}
          handleToggleGateway={handleToggleGateway}
          togglingGatewayId={togglingGatewayId}
          profile={profile}
          user={user}
          role={role}
          activePlanId={activePlanId}
          DEFAULT_PROVIDERS={DEFAULT_PROVIDERS}
          aiProviders={aiProviders}
          handleDeleteProvider={handleDeleteProvider}
          handleTestModelConnection={handleTestModelConnection}
          testingModelId={testingModelId}
        />
      ) : (
        /* Main content area */
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Navbar 1 – Document title and actions */}
          <EditorHeader
            isSidebarExpanded={isSidebarExpanded}
            toggleSidebar={toggleSidebar}
            currentDocument={currentDocument}
            onRenameDocument={onRenameDocument}
            backendType={backendType}
            language={language}
            activePlanId={activePlanId}
            bibliographyEntries={bibliographyEntries}
            exportToWordFile={exportToWordFile}
            exportToPdfFile={exportToPdfFile}
            onExportBibliographyText={onExportBibliographyText}
            onExportBibliographyJson={onExportBibliographyJson}
            onExportBibliographyBibtex={onExportBibliographyBibtex}
            onExportBibliographyRis={onExportBibliographyRis}
            setIsExportUpgradeModalOpen={setIsExportUpgradeModalOpen}
            notifications={notifications}
            onMarkAllNotificationsRead={onMarkAllNotificationsRead}
            onMarkNotificationRead={onMarkNotificationRead}
            onNotificationClick={onNotificationClick}
            role={role}
            setIsShareOpen={setIsShareOpen}
            setIsPricingOpen={setIsPricingOpen}
            showRightSidebar={showRightSidebar}
            setShowRightSidebar={setShowRightSidebar}
            onOpenSettings={onOpenSettings}
            activeUsers={activeUsers}
          />

          {/* Navbar 2 – Academic Formatting Toolbar */}
          <EditorJsToolbar
            language={language}
            editorMode={editorMode}
            setEditorMode={setEditorMode}
            editorJsRef={editorJsRef}
            currentBlockType={currentBlockType}
            currentFontSize={currentFontSize}
            setCurrentFontSize={setCurrentFontSize}
            activeFormats={activeFormats}
            getBtnClass={getBtnClass}
            currentAlignment={currentAlignment}
            onInsertCitation={onInsertCitation}
            setImageUrlInput={setImageUrlInput}
            setIsImageModalOpen={setIsImageModalOpen}
            handleHighlightButtonClick={handleHighlightButtonClick}
            setMathFormulaInput={setMathFormulaInput}
            selectedText={selectedText}
            setIsMathModalOpen={setIsMathModalOpen}
            isMathHelperOpen={isMathHelperOpen}
            setIsMathHelperOpen={setIsMathHelperOpen}
            statusLabel={statusLabel}
          />
          {/* LaTeX Math Helper Panel */}
          <MathHelperPanel
            isMathHelperOpen={isMathHelperOpen}
            setIsMathHelperOpen={setIsMathHelperOpen}
            language={language}
            showRightSidebar={showRightSidebar}
            isRightSidebarExpanded={isRightSidebarExpanded}
          />

          {/* Custom Rich Text Selection Bubble Menu */}
          <EditorBubbleMenu
            showBubbleMenu={showBubbleMenu}
            bubbleMenuRect={bubbleMenuRect}
            bubbleMode={bubbleMode}
            activeFormats={activeFormats}
            editorJsRef={editorJsRef}
            handleHighlightButtonClick={handleHighlightButtonClick}
            t={t as any}
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
          />

          {/* Editor canvas area + Right sidebar */}
          <div className="flex flex-1 overflow-hidden items-left bg-slate-50/50 pt-6 md:pt-2">
            <div className="flex w-full h-full relative bg-white shadow-sm border  border-slate-400/60 overflow-hidden">
              <main
                className="flex-1 p-6 md:p-10 overflow-y-auto thin-scroll"
                onContextMenu={(e) => {
                  const selection = window.getSelection();
                  if (selection && !selection.isCollapsed && selection.toString().trim()) {
                    const holder = document.getElementById('editorjs-holder');
                    const anchorEl = selection.anchorNode?.nodeType === Node.TEXT_NODE
                      ? selection.anchorNode.parentElement
                      : (selection.anchorNode as HTMLElement);

                    if (holder && anchorEl && holder.contains(anchorEl)) {
                      e.preventDefault();
                      setBubbleMenuRect(new DOMRect(e.clientX, e.clientY, 0, 0));
                      setBubbleMode('format');
                      setShowBubbleMenu(true);
                    }
                  }
                }}
              >
                <EditorJsEditor
                  ref={editorJsRef}
                  initialContent={currentDocument?.content}
                  onBlockTypeChange={setCurrentBlockType}
                  onAlignmentChange={(align) => {
                    setCurrentAlignment(align);
                    onAlignmentChange?.(align);
                  }}
                  onStatsChange={onStatsChange}
                  onCiteClick={onCiteClick}
                  onCommentMarkClick={(commentId) => {
                    setShowRightSidebar(true);
                    setIsRightSidebarExpanded(true);
                  }}
                  onContentChange={onContentChange}
                  onCitationSearchChange={(query, rect) => {
                    setBubbleMenuRect(rect);
                    setBubbleMode('citation');
                    setShowBubbleMenu(true);
                    setBubbleSearchQuery(query);
                    onRepeatCitationSearch(query);
                  }}
                  onCitationSearchCancel={() => {
                    editorJsRef.current?.cancelCitationSearch();
                    setShowBubbleMenu(false);
                  }}
                  onEditInlineEquation={(formula, onSave) => {
                    setMathFormulaInput(formula);
                    setEditingMathCallback({ save: onSave });
                    setIsMathModalOpen(true);
                  }}
                  onInsertLinkRequest={(defaultUrl, onSave, onUnlink) => {
                    setLinkUrlInput(defaultUrl);
                    setInsertLinkCallback({ save: onSave, unlink: onUnlink });
                    setIsLinkModalOpen(true);
                  }}
                />
              </main>

              {/* Right Panel — Citation Results, Plagiarism Checker, & AI */}
              {showRightSidebar && (
                <EditorSidebar
                  selectedText={selectedText}
                  citationResults={citationResults}
                  citationHistory={citationHistory}
                  wordCount={wordCount}
                  characterCount={characterCount}
                  citationCount={citationCount}
                  bibliographyEntries={bibliographyEntries}
                  improvedText={improvedText}
                  isImproving={isImproving}
                  isSearchingCitations={isSearchingCitations}
                  aiError={aiError}
                  citationError={citationError}
                  citationNote={citationNote}
                  onApplyImprovedText={onApplyImprovedText}
                  onImproveWriting={onImproveWriting}
                  onParaphrase={onParaphrase}
                  onSummarize={onSummarize}
                  onGenerateAbstract={onGenerateAbstract}
                  onFindCitation={onFindCitation}
                  onRepeatCitationSearch={onRepeatCitationSearch}
                  onInsertCitation={onInsertCitation}
                  onInsertBibliography={onInsertBibliography}
                  onInsertImageSample={onInsertImageSample}
                  onExportBibliographyText={onExportBibliographyText}
                  onExportBibliographyJson={onExportBibliographyJson}
                  onExportBibliographyBibtex={onExportBibliographyBibtex}
                  onExportBibliographyRis={onExportBibliographyRis}
                  onInsertCitationCandidate={onInsertCitationCandidate}
                  onParafrasePlagiat={onParafrasePlagiat}
                  selectedAiModel={selectedAiModel}
                  isSynthesizing={isSynthesizing}
                  synthesizedText={synthesizedText}
                  synthesizeError={synthesizeError}
                  synthesizeDisclaimer={synthesizeDisclaimer}
                  onSynthesizeReview={onSynthesizeReview}
                  onInsertSynthesizedText={onInsertSynthesizedText}
                  citationStyle={citationStyle}
                  onChangeCitationStyle={onChangeCitationStyle}
                  folders={folders}
                  folderAssignments={folderAssignments}
                  onCreateFolder={onCreateFolder}
                  onAssignFolder={onAssignFolder}
                  aiHistory={aiHistory}
                  onDeleteAiHistoryEntry={onDeleteAiHistoryEntry}
                  onClearAiHistory={onClearAiHistory}
                  isApplied={isApplied}
                  isExpanded={isRightSidebarExpanded}
                  onToggleExpanded={handleToggleRightSidebarExpanded}
                  onClose={() => setShowRightSidebar(false)}
                  comments={comments}
                  suggestions={suggestions}
                  onAcceptSuggestion={onAcceptSuggestion}
                  onRejectSuggestion={onRejectSuggestion}
                  onResolveComment={onResolveComment}
                  onCommentClick={onCommentClick}
                  activeTab={activeSidebarTab}
                />
              )}
            </div>

            {/* New Right PDF Viewer Sidebar */}
            {activePdfUrl && (
              <aside className="w-[550px] border-l border-slate-200 bg-white flex flex-col h-full z-20 animate-slide-in-right shrink-0">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">PDF Viewer</span>
                  </div>
                  <button
                    type="button"
                    onClick={onClosePdf}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                    aria-label="Tutup PDF"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>

                {/* Iframe displaying PDF */}
                <div className="flex-1 bg-slate-100">
                  <iframe
                    src={`/pdfjs/web/viewer.html?file=${encodeURIComponent(`/api/citations/view-pdf?url=${encodeURIComponent(activePdfUrl)}`)}#search=${encodeURIComponent(activePdfSearchTerm)}&phrase=true`}
                    className="w-full h-full border-0"
                    title="Jurnal PDF"
                  />
                </div>
              </aside>
            )}
          </div>
        </div>
      )}
      <EditorModalsWrapper
        isPricingOpen={isPricingOpen}
        setIsPricingOpen={setIsPricingOpen}
        isShareOpen={isShareOpen}
        setIsShareOpen={setIsShareOpen}
        activePlanId={activePlanId}
        role={role}
        currentDocument={currentDocument}
        onSaveSettings={onSaveSettings}
        mounted={mounted}
        isExportUpgradeModalOpen={isExportUpgradeModalOpen}
        setIsExportUpgradeModalOpen={setIsExportUpgradeModalOpen}
        language={language}
        isImageModalOpen={isImageModalOpen}
        setIsImageModalOpen={setIsImageModalOpen}
        imageUrlInput={imageUrlInput}
        setImageUrlInput={setImageUrlInput}
        handleInsertImageConfirm={handleInsertImageConfirm}
        isMathModalOpen={isMathModalOpen}
        setIsMathModalOpen={setIsMathModalOpen}
        setEditingMathCallback={setEditingMathCallback}
        setMathFormulaInput={setMathFormulaInput}
        mathFormulaInput={mathFormulaInput}
        handleInsertMathConfirm={handleInsertMathConfirm}
        editingMathCallback={editingMathCallback}
        isLinkModalOpen={isLinkModalOpen}
        setIsLinkModalOpen={setIsLinkModalOpen}
        setInsertLinkCallback={setInsertLinkCallback}
        setLinkUrlInput={setLinkUrlInput}
        linkUrlInput={linkUrlInput}
        handleInsertLinkConfirm={handleInsertLinkConfirm}
        handleUnlinkConfirm={handleUnlinkConfirm}
        insertLinkCallback={insertLinkCallback}
        showHighlightPopover={showHighlightPopover}
        setShowHighlightPopover={setShowHighlightPopover}
        setHighlightPopoverRect={setHighlightPopoverRect}
        setHighlightTriggerSource={setHighlightTriggerSource}
        highlightPopoverRect={highlightPopoverRect}
        handleApplyHighlight={handleApplyHighlight}
        isPlanModalOpen={isPlanModalOpen}
        setIsPlanModalOpen={setIsPlanModalOpen}
        selectedPlanForModal={selectedPlanForModal}
        modalPlanState={modalPlanState}
        setModalPlanState={setModalPlanState}
        handleSaveModalPlan={handleSaveModalPlan}
        savingPlanId={savingPlanId}
        isModelModalOpen={isModelModalOpen}
        setIsModelModalOpen={setIsModelModalOpen}
        isEn={isEn}
        selectedModelForModal={selectedModelForModal}
        modalModelState={modalModelState}
        setModalModelState={setModalModelState}
        aiProviders={aiProviders}
        DEFAULT_PROVIDERS={DEFAULT_PROVIDERS}
        handleOpenCreateProviderModal={handleOpenCreateProviderModal}
        handleOpenEditProviderModal={handleOpenEditProviderModal}
        handleTestModelConnection={handleTestModelConnection}
        testingModelId={testingModelId}
        handleSaveModalModel={handleSaveModalModel}
        savingModelId={savingModelId}
        isProviderModalOpen={isProviderModalOpen}
        setIsProviderModalOpen={setIsProviderModalOpen}
        selectedProviderForModal={selectedProviderForModal}
        modalProviderState={modalProviderState}
        setModalProviderState={setModalProviderState}
        handleSaveModalProvider={handleSaveModalProvider}
        isSuggestionModalOpen={isSuggestionModalOpen}
        setIsSuggestionModalOpen={setIsSuggestionModalOpen}
        selectedTextForSuggestion={selectedTextForSuggestion}
        newTextForSuggestion={newTextForSuggestion}
        setNewTextForSuggestion={setNewTextForSuggestion}
        profile={profile}
        user={user}
        editorJsRef={editorJsRef}
        addSuggestion={addSuggestion}
        activeUsers={activeUsers}
        createNotification={createNotification}
        alertModalState={alertModalState}
        setAlertModalState={setAlertModalState}
        isBackendModalOpen={isBackendModalOpen}
        setIsBackendModalOpen={setIsBackendModalOpen}
        setMathToast={setMathToast}
        isHelpOpen={isHelpOpen}
        setIsHelpOpen={setIsHelpOpen}
      />
    </div>
  );
}



