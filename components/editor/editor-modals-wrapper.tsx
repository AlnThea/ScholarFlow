import React from 'react';
import dynamic from 'next/dynamic';
import { ImageModal } from './modals/image-modal';
import { MathModal } from './modals/math-modal';
import { LinkModal } from './modals/link-modal';
import { HighlightPopover } from './modals/highlight-popover';
import { SuggestionModal } from './modals/suggestion-modal';
import { AlertModal } from './modals/alert-modal';
import { ProviderModal } from './modals/provider-modal';
import { ModelModal } from './modals/model-modal';
import { PlanModal } from './modals/plan-modal';
import { ExportUpgradeModal } from './modals/export-upgrade-modal';
import { addSuggestion } from '@/lib/api/suggestions';
import { createNotification } from '@/lib/api/comments';

const PricingModal = dynamic(() => import('./pricing-modal').then((mod) => mod.PricingModal), { ssr: false });
const ShareDocumentModal = dynamic(() => import('./share-document-modal').then((mod) => mod.ShareDocumentModal), { ssr: false });
const BackendSettingsModal = dynamic(() => import('./backend-settings-modal').then((mod) => mod.BackendSettingsModal), { ssr: false });
const HelpModal = dynamic(() => import('./help-modal').then((mod) => mod.HelpModal), { ssr: false });

export function EditorModalsWrapper(props: any) {
  const {
    isPricingOpen,
    setIsPricingOpen,
    isShareOpen,
    setIsShareOpen,
    activePlanId,
    role,
    currentDocument,
    onSaveSettings,
    mounted,
    isExportUpgradeModalOpen,
    setIsExportUpgradeModalOpen,
    language,
    isImageModalOpen,
    setIsImageModalOpen,
    imageUrlInput,
    setImageUrlInput,
    handleInsertImageConfirm,
    isMathModalOpen,
    setIsMathModalOpen,
    setEditingMathCallback,
    setMathFormulaInput,
    mathFormulaInput,
    handleInsertMathConfirm,
    editingMathCallback,
    isLinkModalOpen,
    setIsLinkModalOpen,
    setInsertLinkCallback,
    setLinkUrlInput,
    linkUrlInput,
    handleInsertLinkConfirm,
    handleUnlinkConfirm,
    insertLinkCallback,
    showHighlightPopover,
    setShowHighlightPopover,
    setHighlightPopoverRect,
    setHighlightTriggerSource,
    highlightPopoverRect,
    handleApplyHighlight,
    isPlanModalOpen,
    setIsPlanModalOpen,
    selectedPlanForModal,
    modalPlanState,
    setModalPlanState,
    handleSaveModalPlan,
    savingPlanId,
    isModelModalOpen,
    setIsModelModalOpen,
    isEn,
    selectedModelForModal,
    modalModelState,
    setModalModelState,
    aiProviders,
    DEFAULT_PROVIDERS,
    handleOpenCreateProviderModal,
    handleOpenEditProviderModal,
    handleTestModelConnection,
    testingModelId,
    handleSaveModalModel,
    savingModelId,
    isProviderModalOpen,
    setIsProviderModalOpen,
    selectedProviderForModal,
    modalProviderState,
    setModalProviderState,
    handleSaveModalProvider,
    isSuggestionModalOpen,
    setIsSuggestionModalOpen,
    selectedTextForSuggestion,
    newTextForSuggestion,
    setNewTextForSuggestion,
    profile,
    user,
    editorJsRef,
    addSuggestion,
    activeUsers,
    createNotification,
    alertModalState,
    setAlertModalState,
    isBackendModalOpen,
    setIsBackendModalOpen,
    setMathToast,
    isHelpOpen,
    setIsHelpOpen
  } = props;

  return (
    <>
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />
      <ShareDocumentModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        activePlanId={activePlanId}
        role={role}
        documentId={currentDocument?.id}
        documentTitle={currentDocument?.title}
        settings={currentDocument?.settings}
        onSaveSettings={onSaveSettings}
      />
      <ExportUpgradeModal
        isOpen={mounted && isExportUpgradeModalOpen}
        onClose={() => setIsExportUpgradeModalOpen(false)}
        onUpgrade={() => setIsPricingOpen(true)}
        language={language}
      />
      <ImageModal
        isOpen={mounted && isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrlInput={imageUrlInput}
        setImageUrlInput={setImageUrlInput}
        onConfirm={handleInsertImageConfirm}
      />
      <MathModal
        isOpen={mounted && isMathModalOpen}
        onClose={() => {
          setIsMathModalOpen(false);
          setEditingMathCallback(null);
          setMathFormulaInput('');
        }}
        mathFormulaInput={mathFormulaInput}
        setMathFormulaInput={setMathFormulaInput}
        onConfirm={handleInsertMathConfirm}
        isEditing={!!editingMathCallback}
      />
      <LinkModal
        isOpen={mounted && isLinkModalOpen}
        onClose={() => {
          setIsLinkModalOpen(false);
          setInsertLinkCallback(null);
          setLinkUrlInput('');
        }}
        linkUrlInput={linkUrlInput}
        setLinkUrlInput={setLinkUrlInput}
        onConfirm={handleInsertLinkConfirm}
        onUnlink={handleUnlinkConfirm}
        isEditing={!!insertLinkCallback?.unlink}
        language={language}
      />
      <HighlightPopover
        isOpen={mounted && showHighlightPopover}
        onClose={() => {
          setShowHighlightPopover(false);
          setHighlightPopoverRect(null);
          setHighlightTriggerSource(null);
        }}
        popoverRect={highlightPopoverRect}
        onApplyHighlight={handleApplyHighlight}
        language={language}
      />
      <PlanModal
        isOpen={mounted && isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        selectedPlanForModal={selectedPlanForModal}
        modalPlanState={modalPlanState}
        setModalPlanState={setModalPlanState}
        handleSaveModalPlan={handleSaveModalPlan}
        savingPlanId={savingPlanId}
      />
      <ModelModal
        isOpen={mounted && isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
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
      />
      <ProviderModal
        isOpen={mounted && isProviderModalOpen}
        onClose={() => setIsProviderModalOpen(false)}
        isEn={isEn}
        selectedProviderForModal={selectedProviderForModal}
        modalProviderState={modalProviderState}
        setModalProviderState={setModalProviderState}
        handleSaveModalProvider={handleSaveModalProvider}
      />
      {/* Modal Usulan Perubahan (Mode Sugesti / Track Changes) */}
      <SuggestionModal
        isOpen={isSuggestionModalOpen}
        onClose={() => setIsSuggestionModalOpen(false)}
        selectedText={selectedTextForSuggestion}
        newText={newTextForSuggestion}
        setNewText={setNewTextForSuggestion}
        onConfirm={() => {
          const sugId = `sug-${Date.now()}`;
          const authorName = profile?.full_name || user?.email?.split('@')[0] || 'Collaborator';
          editorJsRef.current?.addSuggestionMark?.(sugId, selectedTextForSuggestion, newTextForSuggestion, authorName);
          if (currentDocument?.id) {
            addSuggestion(currentDocument.id, selectedTextForSuggestion, newTextForSuggestion, authorName, sugId, user?.id);
            if (activeUsers && activeUsers.length > 0) {
              activeUsers.filter((u: any) => u.user_id && u.user_id !== user?.id).forEach((coUser: any) => {
                createNotification(
                  currentDocument.id,
                  coUser.user_id,
                  authorName,
                  language === 'en'
                    ? `proposed a suggestion: "${(newTextForSuggestion || selectedTextForSuggestion).slice(0, 30)}${(newTextForSuggestion || selectedTextForSuggestion).length > 30 ? '...' : ''}"`
                    : `mengusulkan perubahan: "${(newTextForSuggestion || selectedTextForSuggestion).slice(0, 30)}${(newTextForSuggestion || selectedTextForSuggestion).length > 30 ? '...' : ''}"`
                );
              });
            }
          }
          setIsSuggestionModalOpen(false);
        }}
        language={language}
      />

      {/* Custom React Alert & Confirm Modal Portal */}
      <AlertModal
        state={mounted && alertModalState && alertModalState.isOpen ? alertModalState : null}
        onClose={() => setAlertModalState(null)}
      />

      {/* Backend & Database Provider Architecture Modal */}
      <BackendSettingsModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
        onToast={(msg) => setMathToast(msg)}
      />

      {/* Interactive Help & Documentation Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </>
  );
}
