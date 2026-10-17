// c:/web/ScholarFlow/components/editor/editor-layout.tsx
'use client';

import { EditorModalsWrapper } from './editor-modals-wrapper';
import { OnboardingTour } from '@/components/onboarding-tour';
import { TokenQuotaModal } from '@/components/ai/token-quota-modal';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { EditorJsEditor } from './editorjs-editor';
import { EditorSidebar } from './editor-sidebar';
import { EditorHeader } from './editor-header';
import { DashboardView } from './dashboard-view';
import { MathHelperPanel } from './math-helper-panel';
import { EditorBubbleMenu } from './editor-bubble-menu';
import { EditorJsToolbar } from './editorjs-toolbar';
import { useGhostwriter } from '@/hooks/use-ghostwriter';
import { GhostwriterSuggestion } from './ghostwriter-suggestion';
import { useVersionHistory } from '@/hooks/use-version-history';
import { VersionHistoryModal } from './modals/version-history-modal';
import { PeerReviewModal } from './modals/peer-review-modal';
import { CommandPaletteModal } from './modals/command-palette-modal';
import { ShortcutsModal } from './modals/shortcuts-modal';
import { LatexExportModal } from './modals/latex-export-modal';
import { ReferenceImportModal } from './modals/reference-import-modal';
import { ReferenceDropzone } from './reference-dropzone';
import { parseReferenceFile } from '@/lib/editor/reference-importer';
import { SuggestingChips } from './suggesting-chips';
import { CrossReferenceModal } from './modals/cross-reference-modal';
import { addSuggestion } from '@/lib/api/suggestions';
import { IconSparkles } from '@tabler/icons-react';
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
import { ErrorBoundary } from '@/components/error-boundary';
import { fetchPricingPlans, updatePricingPlan, createPricingPlan, deletePricingPlan, type PricingPlan } from '@/lib/api/pricing';
import { fetchPaymentGateways, updatePaymentGatewayStatus, type PaymentGateway } from '@/lib/api/payment-gateways';
import { type AIModel, type AIProvider, createAIModel, deleteAIModel, DEFAULT_PROVIDERS, createAIProvider, updateAIProvider, deleteAIProvider } from '@/lib/api/ai-models';
import { createNotification, type DocumentNotification } from '@/lib/api/comments';
import { type UserPresence } from '@/lib/api/presence';


import type { EditorLayoutProps } from './types';
import { findMostRelevantSentence, extractTextFromContent } from '@/lib/editor/editor-utils';



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
  onBatchAcceptSuggestions,
  onBatchRejectSuggestions,
  onResolveComment,
  onCommentClick,
  activeSidebarTab, setActiveSidebarTab,
  tokensUsed,
  monthlyQuota,
  isTokenQuotaModalOpen,
  onOpenTokenQuotaModal,
  onCloseTokenQuotaModal,
  citationLibrary,
  onInsertCitationText,
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

  React.useEffect(() => {
    if (activeSidebarTab === 'burstiness') {
      setIsSidebarExpanded(true);
    }
  }, [activeSidebarTab, setIsSidebarExpanded]);

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

  const ghostwriter = useGhostwriter({
    language,
    documentTitle: currentDocument?.title,
    editorJsRef,
    onContentChange,
    setIsPlanModalOpen,
  });

  const versionHistory = useVersionHistory({
    documentId: currentDocument?.id,
    documentTitle: currentDocument?.title,
    currentContent: currentDocument?.content,
    userId: user?.id,
    authorName: profile?.full_name || user?.email,
    language,
    editorJsRef,
    onContentChange,
    showToast: (msg, type) => {
      showAlertModal(type === 'error' ? 'Notice' : 'Success', msg, type === 'error' ? 'danger' : 'info');
    },
  });

  const activeDocumentText = useMemo(() => {
    if (!currentDocument?.content) return '';
    return extractTextFromContent(currentDocument.content);
  }, [currentDocument?.content]);

  const [isPeerReviewModalOpen, setIsPeerReviewModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isLatexExportModalOpen, setIsLatexExportModalOpen] = useState(false);

  // Phase 28: Drag & Drop Reference Importer state
  const [isReferenceImportModalOpen, setIsReferenceImportModalOpen] = useState(false);
  const [importedCandidates, setImportedCandidates] = useState<CitationCandidate[]>([]);
  const [importedFileName, setImportedFileName] = useState('');
  const [isCrossReferenceModalOpen, setIsCrossReferenceModalOpen] = useState(false);
  const referenceFileInputRef = useRef<HTMLInputElement>(null);

  const handleParsedReferences = (candidates: CitationCandidate[], fileName: string) => {
    setImportedCandidates(candidates);
    setImportedFileName(fileName);
    setIsReferenceImportModalOpen(true);
  };

  const handleConfirmBatchImport = (selected: CitationCandidate[]) => {
    selected.forEach((cand) => {
      onInsertCitationCandidate?.(cand, true);
    });
    showAlertModal(
      language === 'en' ? 'References Imported' : 'Referensi Diimpor',
      language === 'en'
        ? `Successfully imported ${selected.length} citation reference(s) into your library.`
        : `Berhasil mengimpor ${selected.length} referensi kepustakaan ke perpustakaan naskah Anda.`,
      'info'
    );
  };

  // Global Keyboard Shortcuts (Phase 26)
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;

      // Ctrl + K or Cmd + K -> Command Palette Spotlight
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // If user is actively typing inside an input element, do not intercept regular keys
      if (isInput) return;

      // ? -> Shortcuts Cheat Sheet
      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(true);
        return;
      }

      // Ctrl + Shift + R -> Reviewer #2 Simulation
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setIsPeerReviewModalOpen(true);
        return;
      }

      // Ctrl + Shift + I -> Academic Integrity Barometer
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setShowRightSidebar(true);
        setIsRightSidebarExpanded(true);
        setActiveSidebarTab?.('burstiness');
        return;
      }

      // Ctrl + Shift + D -> Dark / Light Theme
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleDarkMode();
        return;
      }

      // Ctrl + Shift + C -> Search Citations
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setShowRightSidebar(true);
        setActiveSidebarTab?.('library');
        onFindCitation?.();
        return;
      }

      // Ctrl + Shift + P -> Chat with Paper
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setShowRightSidebar(true);
        setActiveSidebarTab?.('library');
        return;
      }

      // Ctrl + M -> LaTeX Math
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setIsMathModalOpen(true);
        return;
      }

      // Ctrl + H -> Version History
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        versionHistory.openVersionHistory?.();
        return;
      }

      // Ctrl + Shift + X -> LaTeX Package Exporter
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        setIsLatexExportModalOpen(true);
        return;
      }

      // Ctrl + Shift + U -> Import Reference File (.bib, .ris, .pdf)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        referenceFileInputRef.current?.click();
        return;
      }

      // Ctrl + Shift + S -> Toggle Suggesting Mode (Track Changes)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setEditorMode((prev: 'edit' | 'suggest') => (prev === 'edit' ? 'suggest' : 'edit'));
        return;
      }

      // Ctrl + Shift + B -> Insert Cross-Reference (@fig / @tab)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsCrossReferenceModalOpen(true);
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [toggleDarkMode, setActiveSidebarTab, setShowRightSidebar, setIsRightSidebarExpanded, onFindCitation, setIsMathModalOpen, versionHistory]);

  const handleExecuteCommand = (actionId: string) => {
    switch (actionId) {
      case 'open_peer_review':
        setIsPeerReviewModalOpen(true);
        break;
      case 'open_integrity_barometer':
        setShowRightSidebar(true);
        setIsRightSidebarExpanded(true);
        setActiveSidebarTab?.('burstiness');
        break;
      case 'open_paper_chat':
        setShowRightSidebar(true);
        setActiveSidebarTab?.('library');
        break;
      case 'toggle_ghostwriter':
        ghostwriter.toggleEnabled();
        break;
      case 'toggle_suggesting_mode':
        setEditorMode(editorMode === 'edit' ? 'suggest' : 'edit');
        break;
      case 'batch_accept_suggestions':
        onBatchAcceptSuggestions?.();
        break;
      case 'batch_reject_suggestions':
        onBatchRejectSuggestions?.();
        break;
      case 'improve_writing':
        onImproveWriting?.();
        break;
      case 'open_paraphrase':
        onParaphrase?.();
        break;
      case 'generate_abstract':
        onGenerateAbstract?.();
        break;
      case 'search_citation':
        setShowRightSidebar(true);
        setActiveSidebarTab?.('library');
        onFindCitation?.();
        break;
      case 'set_style_apa':
        onChangeCitationStyle?.('apa');
        break;
      case 'set_style_ieee':
        onChangeCitationStyle?.('ieee');
        break;
      case 'set_style_harvard':
        onChangeCitationStyle?.('harvard');
        break;
      case 'set_style_vancouver':
        onChangeCitationStyle?.('vancouver');
        break;
      case 'insert_math':
        setIsMathModalOpen(true);
        break;
      case 'insert_bibliography':
        onInsertBibliography?.();
        break;
      case 'insert_image':
        onInsertImageSample?.();
        break;
      case 'insert_cross_reference':
        setIsCrossReferenceModalOpen(true);
        break;
      case 'refresh_cross_references':
        editorJsRef.current?.refreshCrossReferences?.(language as 'en' | 'id');
        break;
      case 'open_version_history':
        versionHistory.openVersionHistory?.();
        break;
      case 'open_shortcuts':
        setIsShortcutsOpen(true);
        break;
      case 'export_word':
        if (currentDocument && currentDocument.content) {
          exportToWordFile(
            currentDocument.title || 'Manuscript',
            currentDocument.content.blocks || [],
            bibliographyEntries.map((b: any) => (typeof b === 'string' ? b : b.text || '')),
            language,
            activePlanId === 'pro' || activePlanId === 'enterprise'
          );
        }
        break;
      case 'export_pdf':
        if (currentDocument && currentDocument.content) {
          exportToPdfFile(
            currentDocument.title || 'Manuscript',
            currentDocument.content.blocks || [],
            bibliographyEntries.map((b: any) => (typeof b === 'string' ? b : b.text || '')),
            language,
            activePlanId === 'pro' || activePlanId === 'enterprise'
          );
        }
        break;
      case 'export_latex':
        setIsLatexExportModalOpen(true);
        break;
      case 'import_references':
        referenceFileInputRef.current?.click();
        break;
      case 'toggle_theme':
        toggleDarkMode();
        break;
      case 'toggle_language':
        setLanguage((prev: string) => (prev === 'en' ? 'id' : 'en'));
        break;
      default:
        break;
    }
  };

  return (
    <ErrorBoundary>
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
        activeSidebarTab={activeSidebarTab}
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
            tokensUsed={tokensUsed}
            monthlyQuota={monthlyQuota}
            onOpenTokenQuotaModal={onOpenTokenQuotaModal}
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
            onOpenVersionHistory={versionHistory.openVersionHistory}
            onOpenPeerReview={() => setIsPeerReviewModalOpen(true)}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onOpenShortcuts={() => setIsShortcutsOpen(true)}
            onOpenLatexExport={() => setIsLatexExportModalOpen(true)}
            activeUsers={activeUsers}
          />

          {/* Navbar 2 – Academic Formatting Toolbar */}
          <EditorJsToolbar
            language={language}
            editorMode={editorMode}
            setEditorMode={setEditorMode}
            pendingSuggestionsCount={suggestions?.filter((s: any) => s.status === 'pending').length || 0}
            onBatchAcceptSuggestions={onBatchAcceptSuggestions}
            onBatchRejectSuggestions={onBatchRejectSuggestions}
            onOpenCrossReferenceModal={() => setIsCrossReferenceModalOpen(true)}
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
            isGhostwriterEnabled={ghostwriter.isEnabled}
            onToggleGhostwriter={ghostwriter.toggleEnabled}
            isGhostwriterLoading={ghostwriter.isLoading}
            citationStyle={citationStyle || currentDocument?.settings?.citationStyle || 'apa'}
            onChangeCitationStyle={onChangeCitationStyle}
            documentContent={activeDocumentText}
            onOpenIntegrityTab={() => {
              setShowRightSidebar(true);
              setIsRightSidebarExpanded(true);
              setActiveSidebarTab?.('burstiness');
            }}
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
                  onSuggestionMarkClick={(sugId) => {
                    setShowRightSidebar(true);
                    setIsRightSidebarExpanded(true);
                    setActiveSidebarTab?.('comments');
                    editorJsRef.current?.scrollToSuggestionMark?.(sugId);
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
                  onEditorKeyDown={ghostwriter.handleEditorKeyDown}
                  onEditorKeyUp={ghostwriter.onEditorInputOrSelectionChange}
                />

                <GhostwriterSuggestion
                  suggestion={ghostwriter.suggestion}
                  isLoading={ghostwriter.isLoading}
                  coords={ghostwriter.coords}
                  onAccept={ghostwriter.acceptSuggestion}
                  onDismiss={ghostwriter.dismissSuggestion}
                  language={language}
                />

                {/* Floating Suggestion Review Chips for Live Track Changes */}
                {editorMode === 'suggest' && suggestions && suggestions.length > 0 && onAcceptSuggestion && onRejectSuggestion && (
                  <div className="fixed bottom-20 right-6 md:right-10 z-20 w-80 max-w-[calc(100vw-3rem)] animate-in fade-in slide-in-from-bottom-2">
                    <SuggestingChips
                      suggestions={suggestions}
                      onAccept={onAcceptSuggestion}
                      onReject={onRejectSuggestion}
                      onScrollTo={(id) => editorJsRef.current?.scrollToSuggestionMark?.(id)}
                      language={language as 'en' | 'id'}
                    />
                  </div>
                )}

                {/* Floating Quick Action Button with Rich Interactive Tooltip Balloon */}
                <div className="fixed bottom-6 right-6 md:right-10 z-30">
                  <div className="relative group/fab">
                    <button
                      type="button"
                      onClick={() => setIsCommandPaletteOpen(true)}
                      className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-lg hover:shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-indigo-400/40"
                      title={isEn
                        ? 'Spotlight Quick Actions (Ctrl+K): Click to search AI tools, citations, Reviewer #2, and styles.'
                        : 'Pusat Perintah Kilat (Ctrl+K): Klik untuk membuka seluruh menu AI, sitasi jurnal, Reviewer #2, dan gaya sitasi.'}
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                      </span>
                      <IconSparkles className="h-4 w-4 text-amber-300" />
                      <span className="hidden sm:inline font-bold">
                        {isEn ? 'Quick Actions' : 'Perintah Cepat'}
                      </span>
                      <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-indigo-900/60 text-indigo-100 border border-indigo-400/30">
                        Ctrl K
                      </kbd>
                    </button>

                    {/* Interactive Tooltip Balloon on Hover */}
                    <div className="pointer-events-none absolute bottom-full right-0 mb-3 w-64 rounded-xl bg-slate-900/95 dark:bg-slate-800/95 text-white p-3 text-left text-[11px] leading-relaxed shadow-xl border border-slate-700/80 opacity-0 group-hover/fab:opacity-100 transition-opacity duration-200 z-50">
                      <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
                        <span>⚡</span>
                        <span>{isEn ? 'Universal Command Center' : 'Pusat Perintah Universal'}</span>
                      </div>
                      <p className="text-slate-300 text-[10.5px]">
                        {isEn
                          ? 'Click here or press Ctrl+K to open all tools: citations, Reviewer #2, LaTeX math, and exports!'
                          : 'Klik di sini atau tekan Ctrl+K untuk membuka seluruh menu: sitasi, Reviewer #2, rumus KaTeX, dan ekspor!'}
                      </p>
                    </div>
                  </div>
                </div>
              </main>

              {/* Right Panel - Citation Results, Plagiarism Checker, & AI */}
              {showRightSidebar && (
                <EditorSidebar
                  activePlanId={activePlanId}
                  setIsPlanModalOpen={setIsPlanModalOpen}
                  currentDocument={currentDocument}
                  editorJsRef={editorJsRef}
                  onContentChange={onContentChange}
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
                  aiModels={aiModels}
                  aiProviders={aiProviders}
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
                  activeTab={activeSidebarTab} setActiveTab={setActiveSidebarTab}
                  tokensUsed={tokensUsed}
                  monthlyQuota={monthlyQuota}
                  onOpenTokenQuotaModal={onOpenTokenQuotaModal}
                  citationLibrary={citationLibrary}
                  onInsertCitationText={onInsertCitationText}
                  onOpenPeerReview={() => setIsPeerReviewModalOpen(true)}
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
      <TokenQuotaModal
        isOpen={Boolean(isTokenQuotaModalOpen)}
        onClose={onCloseTokenQuotaModal || (() => {})}
        tokensUsed={tokensUsed}
        monthlyQuota={monthlyQuota}
        activePlanId={activePlanId}
        language={language}
        onUpgrade={() => setIsPricingOpen(true)}
      />
      <VersionHistoryModal
        isOpen={versionHistory.isVersionModalOpen}
        onClose={versionHistory.closeVersionHistory}
        revisions={versionHistory.revisions}
        selectedRevision={versionHistory.selectedRevision}
        onSelectRevision={versionHistory.setSelectedRevision}
        diffChunks={versionHistory.diffChunks}
        diffStats={versionHistory.diffStats}
        activeDiffMode={versionHistory.activeDiffMode}
        onChangeDiffMode={versionHistory.setActiveDiffMode}
        onRestoreRevision={versionHistory.restoreRevision}
        onCreateManualSnapshot={versionHistory.createManualSnapshot}
        isLoading={versionHistory.isLoadingRevisions}
        isRestoring={versionHistory.isRestoring}
        language={language}
        currentContent={currentDocument?.content}
      />
      <PeerReviewModal
        isOpen={isPeerReviewModalOpen}
        onClose={() => setIsPeerReviewModalOpen(false)}
        documentId={currentDocument?.id || 'doc-default'}
        documentTitle={currentDocument?.title || (language === 'en' ? 'Untitled Manuscript' : 'Naskah Tanpa Judul')}
        documentContent={activeDocumentText}
        language={language}
        activePlanId={activePlanId}
      />
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        language={language}
        onExecuteCommand={handleExecuteCommand}
      />
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        language={language}
      />
      <LatexExportModal
        isOpen={isLatexExportModalOpen}
        onClose={() => setIsLatexExportModalOpen(false)}
        documentTitle={currentDocument?.title || (language === 'en' ? 'Untitled Manuscript' : 'Naskah Tanpa Judul')}
        documentContent={currentDocument?.content}
        citationLibrary={citationLibrary}
        bibliographyEntries={bibliographyEntries}
        language={language}
        authorName={profile?.full_name || user?.email || 'ScholarFlow Author'}
        authorEmail={user?.email || 'author@scholarflow.org'}
      />
      <input
        ref={referenceFileInputRef}
        type="file"
        multiple
        accept=".bib,.bibtex,.ris,.pdf,.txt"
        className="hidden"
        onChange={async (e) => {
          if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const all: CitationCandidate[] = [];
            for (const f of files) {
              const res = await parseReferenceFile(f);
              all.push(...res);
            }
            if (all.length > 0) {
              handleParsedReferences(all, files.length === 1 ? files[0].name : `${files.length} files`);
            }
            e.target.value = '';
          }
        }}
      />
      <ReferenceDropzone
        onParsedCandidates={handleParsedReferences}
        language={language}
        onError={(msg) => showAlertModal(language === 'en' ? 'Import Notice' : 'Pemberitahuan Impor', msg, 'danger')}
      />
      <ReferenceImportModal
        isOpen={isReferenceImportModalOpen}
        onClose={() => setIsReferenceImportModalOpen(false)}
        candidates={importedCandidates}
        fileName={importedFileName}
        language={language}
        onImport={handleConfirmBatchImport}
      />
      <CrossReferenceModal
        isOpen={isCrossReferenceModalOpen}
        onClose={() => setIsCrossReferenceModalOpen(false)}
        documentContent={currentDocument?.content}
        language={language as 'en' | 'id'}
        onInsertReference={(targetId, type, index, label) => {
          editorJsRef.current?.insertCrossReference?.(targetId, type, index, language as 'en' | 'id', label);
        }}
        onRefreshReferences={() => {
          editorJsRef.current?.refreshCrossReferences?.(language as 'en' | 'id');
        }}
      />
      <OnboardingTour />
    </div>
    </ErrorBoundary>
  );
}



