'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { improveWriting, type ImproveWritingResponse, synthesizeLiteratureReview, generateAbstract } from '@/lib/api/ai';
import { fetchAIModels, updateAIModel, createAIModel, deleteAIModel, type AIModel, fetchAIProviders, createAIProvider, updateAIProvider, deleteAIProvider, type AIProvider } from '@/lib/api/ai-models';
import EditorJsEditor from './editorjs-editor';
import type { EditorJsMethods } from '@/lib/editor/editor-tools';
import { EditorLayout } from './editor-layout';
import { searchCitations, type CitationCandidate } from '@/lib/api/citations';
import { fetchCitationLibrary, saveCitationToLibrary } from '@/lib/api/citation-library';
import { useAuth } from '@/components/auth/auth-provider';
import { useLanguage } from '../i18n/language-context';
import {
  fetchDocuments,
  fetchDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  type DocumentEntry,
  type DocumentListItem,
  type DocumentSettings
} from '@/lib/api/documents';
import { fetchActivePresence, updatePresence, leavePresence, type UserPresence } from '@/lib/api/presence';
import { fetchSuggestions, updateSuggestionStatus, DocumentSuggestion } from '@/lib/api/suggestions';
import {
  addCitationHistoryEntry,
  type CitationHistoryEntry,
} from '@/lib/editor/citation-history';
import {
  addAiHistoryEntry,
  type AiHistoryEntry,
} from '@/lib/editor/ai-history';
import { DocumentSetupModal } from './document-setup-modal';
import { DocumentSettingsModal } from './document-settings-modal';
import { PricingModal } from './pricing-modal';
import { LimitWarningModal } from './limit-warning-modal';
import {
  serializeBibliographyText,
  formatBibliographyCandidate,
} from '@/lib/editor/bibliography';
import {
  serializeCitationCandidatesText,
} from '@/lib/editor/citation-export';
import { getTemplateBlocks } from '@/lib/templates';
import { IconLoader2, IconSparkles, IconCheck, IconAlertCircle, IconInfoCircle, IconRefresh } from '@tabler/icons-react';
import {
  fetchComments,
  fetchNotifications,
  createNotification,
  resolveComment,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  isValidUuid,
  type DocumentComment,
  type DocumentNotification
} from '@/lib/api/comments';

const STORAGE_KEY = 'scholarflow.editor.content.v1';
const CITATION_LIBRARY_KEY = 'scholarflow.editor.citation-library.v1';
const CITATION_HISTORY_KEY = 'scholarflow.editor.citation-history.v1';
const AI_HISTORY_KEY = 'scholarflow.editor.ai-history.v1';
import { useEditorDocument } from '@/hooks/use-editor-document';
import { useEditorAi } from '@/hooks/use-editor-ai';
import { useEditorCitation } from '@/hooks/use-editor-citation';
import { extractTextFromContent, countWords, downloadFile, findMostRelevantSentence, HighlightedAbstract, findMostUniqueWord, getContentComparisonString } from '@/lib/editor/editor-utils';
import { CitationDetailsModal } from './citation-details-modal';
import { EditorToast } from './editor-toast';
import { RemoteUpdateBanner } from './remote-update-banner';
export function ScholarEditor() {
  const { language, t } = useLanguage();
  const { user, profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const activePlanId = profile?.subscription_plan || 'free';
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [contentBeforeApply, setContentBeforeApply] = useState<any>(null);
  const [isApplied, setIsApplied] = useState(false);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage({ text, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  const editorJsRef = useRef<EditorJsMethods | null>(null);
  const [editorJsStats, setEditorJsStats] = useState({
    wordCount: 0,
    characterCount: 0,
    citationCount: 0
  });
  const [activeReferenceIds, setActiveReferenceIds] = useState<string[]>([]);

  const {
    documents,
    currentDocument,
    setCurrentDocument,
    isDocLoading,
    saveStatus,
    isSetupModalOpen,
    setIsSetupModalOpen,
    loadedDocumentIdRef,
    lastSavedContentRef,
    triggerDebouncedSave,
    handleSelectDocument,
    handleCreateDocument,
    handleDeleteDocument,
    handleRenameDocument,
    handleCreateFolder,
    handleAssignFolder,
    handleChangeCitationStyle,
    handleChangeDocumentSettings,
    comments, setComments,
    notifications, setNotifications,
    activeUsers, setActiveUsers,
    suggestions, setSuggestions,
    activeSidebarTab, setActiveSidebarTab,
    hasPendingRemoteUpdate, setHasPendingRemoteUpdate,
    pendingRemoteContent, setPendingRemoteContent,
    processedAcceptedSuggestionsRef, acceptedLocallyRef, suggestionsInitializedRef
  } = useEditorDocument(showToast, hydrated, editorJsRef);






  const handleMarkNotificationRead = async (id: string) => {
    try {
      const success = await markNotificationAsRead(id);
      if (success) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    if (!user?.id) return;
    try {
      const success = await markAllNotificationsAsRead(user.id);
      if (success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, read: true }))
        );
      }
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const handleResolveComment = async (id: string) => {
    try {
      const success = await resolveComment(id);
      if (success) {
        editorJsRef.current?.highlightAndRemoveCommentMark(id);
        setComments(prev =>
          prev.map(c => c.id === id ? { ...c, resolved: true } : c)
        );
      }
    } catch (err) {
      console.error('Failed to resolve comment:', err);
    }
  };

  const handleCommentClick = useCallback((c: DocumentComment) => {
    if (c.id) {
      editorJsRef.current?.scrollToCommentMark(c.id);
    }
    if (c.block_id) {
      const blockEl = window.document.querySelector(`[data-id="${c.block_id}"]`);
      if (blockEl) {
        blockEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        blockEl.classList.add('bg-indigo-50/50');
        setTimeout(() => {
          blockEl.classList.remove('bg-indigo-50/50');
        }, 2000);
      }
    }
  }, []);

  const handleNotificationClick = useCallback(async (notif: DocumentNotification) => {
    if (currentDocument?.id !== notif.document_id) {
      
      router.push(`/editor/${notif.document_id}`);
    }
    
    setActiveSidebarTab('comments');
    
    try {
      const comms = await fetchComments(notif.document_id);
      setComments(comms);
      setTimeout(() => {
        if (comms.length > 0) {
          const activeComms = comms.filter(c => !c.resolved);
          if (activeComms.length > 0) {
            const lastComm = activeComms[activeComms.length - 1];
            handleCommentClick(lastComm);
          }
        }
      }, 500);
    } catch (err) {
      console.error(err);
    }
  }, [currentDocument?.id, router, handleCommentClick]);
  


  useEffect(() => {
    fetchAIModels().then(data => {
      setAiModels(data);
    }).catch(err => {
      console.error("Failed to load AI models:", err);
    });
    fetchAIProviders().then(data => {
      setAiProviders(data);
    }).catch(err => {
      console.error("Failed to load AI providers:", err);
    });
  }, []);











  const setAiErrorRef = useRef<(msg: string | null) => void>(() => {});
  
  const {
    citationResults,
    citationLibrary,
    citationHistory,
    citationError,
    citationNote,
    isSearchingCitations,
    activeModalCitation,
    setActiveModalCitation,
    activePdfUrl,
    setActivePdfUrl,
    activePdfSearchTerm,
    setActivePdfSearchTerm,
    resolvedPdfUrl,
    isResolvingPdf,
    translatedCitedSentence,
    isTranslating,
    bibliographyEntries,
    insertCitation,
    insertBibliography,
    exportBibliographyText,
    exportBibliographyJson,
    exportBibliographyBibtex,
    exportBibliographyRis,
    exportCitationText,
    exportCitationJson,
    runCitationSearch,
    repeatCitationSearch,
    insertCitationCandidate
  } = useEditorCitation(
    user,
    hydrated,
    currentDocument,
    activeReferenceIds,
    activePlanId,
    editorJsRef as any,
    setWarningMessage,
    (msg) => setAiErrorRef.current(msg),
    '' // selectedText will be passed as empty initially
  );

  const {
    selectedText, setSelectedText,
    improvedResult, setImprovedResult,
    selectedAiModel, setSelectedAiModel,
    selectedAiTone, setSelectedAiTone,
    aiModels, setAiModels,
    aiProviders, setAiProviders,
    aiHistory, setAiHistory,
    aiError, setAiError,
    isImproving, setIsImproving,
    isSynthesizing, setIsSynthesizing,
    synthesizedText, setSynthesizedText,
    synthesizeError, setSynthesizeError,
    synthesizeDisclaimer, setSynthesizeDisclaimer,
    handleUpdateAIModel, handleCreateAIModel, handleDeleteAIModel,
    handleUpdateAIProvider, handleCreateAIProvider, handleDeleteAIProvider,
    handleSynthesizeReview,
    runImproveWriting, runParaphrase, runSummarize, runGenerateAbstract,
    handleParafrasePlagiat, applyImprovedText,
    deleteAiHistoryEntry, clearAiHistory
  } = useEditorAi(
    language,
    currentDocument,
    citationLibrary,
    activeReferenceIds,
    setActiveSidebarTab,
    editorJsRef,
    setContentBeforeApply,
    setIsApplied,
    setSavedAt,
    hydrated
  );
  setAiErrorRef.current = setAiError;








  useEffect(() => {
    if (!currentDocument || !editorJsRef.current) return;
    if (currentDocument.id !== loadedDocumentIdRef.current) {
      loadedDocumentIdRef.current = currentDocument.id;
      const timer = setTimeout(() => {
        if (currentDocument.content) {
          editorJsRef.current?.renderContent(currentDocument.content);
        } else {
          editorJsRef.current?.renderContent({
            time: Date.now(),
            blocks: [
              {
                id: "welcome-block-id",
                type: "header",
                data: {
                  text: currentDocument.title || "Untitled Document",
                  level: 2
                }
              },
              {
                id: "intro-block-id",
                type: "paragraph",
                data: {
                  text: "Mulai menulis draf jurnal akademik Anda di sini..."
                }
              }
            ],
            version: "2.29.0"
          });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentDocument]);





  const handleContentChange = useCallback((content: any) => {
    if (!currentDocument || !user?.id) return;

    if (isApplied && contentBeforeApply) {
      const cleanNew = content?.blocks || [];
      const cleanBefore = contentBeforeApply?.blocks || [];
      if (JSON.stringify(cleanNew) === JSON.stringify(cleanBefore)) {
        setIsApplied(false);
      }
    }

    const updatedDoc = { ...currentDocument, content };
    setCurrentDocument(updatedDoc);

    const contentString = getContentComparisonString(content);
    if (contentString === lastSavedContentRef.current) {
      return;
    }

    lastSavedContentRef.current = contentString;
    triggerDebouncedSave(currentDocument.id, currentDocument.title, content, currentDocument.settings);
  }, [currentDocument, user, triggerDebouncedSave, isApplied, contentBeforeApply]);

  const folders = useMemo(() => {
    return currentDocument?.settings?.folders || (language === 'en'
      ? ['Introduction', 'Literature Review', 'Methodology', 'Results & Discussion']
      : ['Pendahuluan', 'Tinjauan Pustaka', 'Metodologi', 'Hasil & Diskusi']);
  }, [currentDocument, language]);

  const folderAssignments = useMemo(() => {
    return currentDocument?.settings?.folder_assignments || {};
  }, [currentDocument]);





  useEffect(() => {
    setHydrated(true);
  }, []);


  const isUrlDocLoading = params?.id && !currentDocument;
  if (isUrlDocLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          <span className="text-sm text-slate-400 font-medium">Loading Document...</span>
        </div>
      </div>
    );
  }

  const wordCount = editorJsStats.wordCount;
  const characterCount = editorJsStats.characterCount;
  const citationCount = editorJsStats.citationCount;
  const statusLabel = saveStatus;

  const insertSampleImage = () => {
    // Implement sample image insertion if needed
  };

  const handleInsertSynthesizedText = () => {
    if (synthesizedText && editorJsRef.current) {
      (editorJsRef.current as any).insertHtmlAtCursor?.(synthesizedText);
    }
  };

  return (
    <>
      <EditorLayout
        selectedText={selectedText}
        citationResults={citationResults}
        citationHistory={citationHistory}
        wordCount={wordCount}
        characterCount={characterCount}
        citationCount={citationCount}
        bibliographyEntries={bibliographyEntries}
        improvedText={improvedResult}
        isImproving={isImproving}
        isSearchingCitations={isSearchingCitations}
        aiError={aiError}
        citationError={citationError}
        citationNote={citationNote}
        onApplyImprovedText={applyImprovedText}
        onImproveWriting={runImproveWriting}
        onParaphrase={runParaphrase}
        onSummarize={runSummarize}
        onGenerateAbstract={runGenerateAbstract}
        onFindCitation={runCitationSearch}
        onRepeatCitationSearch={repeatCitationSearch}
        onInsertCitation={insertCitation}
        onInsertBibliography={insertBibliography}
        onInsertImageSample={insertSampleImage}
        onExportBibliographyText={exportBibliographyText}
        onExportBibliographyJson={exportBibliographyJson}
        onExportBibliographyBibtex={exportBibliographyBibtex}
        onExportBibliographyRis={exportBibliographyRis}
        onInsertCitationCandidate={insertCitationCandidate}
        statusLabel={statusLabel}
        onSelectionChange={setSelectedText}
        documents={documents}
        currentDocument={currentDocument}
        onSelectDocument={handleSelectDocument}
        onCreateDocument={() => setIsSetupModalOpen(true)}
        onDeleteDocument={handleDeleteDocument}
        onRenameDocument={handleRenameDocument}
        onContentChange={handleContentChange}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onAlignmentChange={(align: string) => {
          if (!currentDocument) return;
          try {
            const alignments = JSON.parse(localStorage.getItem('scholarflow.editorjs.alignments.v1') || '{}');
            const updatedSettings = {
              ...currentDocument.settings,
              alignments
            };
            const updatedDoc = {
              ...currentDocument,
              settings: updatedSettings
            };
            setCurrentDocument(updatedDoc);
            triggerDebouncedSave(currentDocument.id, currentDocument.title, currentDocument.content, updatedSettings);
          } catch (e) {
            console.error('Error saving alignment change:', e);
          }
        }}
        onStatsChange={(stats: any) => {
          setEditorJsStats(stats);
          if (stats.activeReferenceIds) {
            setActiveReferenceIds((prev) => {
              const isSame =
                prev.length === stats.activeReferenceIds.length &&
                prev.every((id, idx) => id === stats.activeReferenceIds[idx]);
              return isSame ? prev : stats.activeReferenceIds;
            });
          }
        }}
        editorJsRef={editorJsRef as any}
        onCiteClick={(refId, label, citedSentence) => {
          setActiveModalCitation({ refId, label, citedSentence });
        }}
        activePdfUrl={activePdfUrl}
        activePdfSearchTerm={activePdfSearchTerm}
        onClosePdf={() => {
          setActivePdfUrl(null);
          setActivePdfSearchTerm('');
        }}
        selectedAiModel={selectedAiModel}
        setSelectedAiModel={setSelectedAiModel}
        selectedAiTone={selectedAiTone}
        setSelectedAiTone={setSelectedAiTone}
        aiModels={aiModels}
        onUpdateAIModel={handleUpdateAIModel}
        onCreateAIModel={handleCreateAIModel}
        onDeleteAIModel={handleDeleteAIModel}
        aiProviders={aiProviders}
        onUpdateAIProvider={handleUpdateAIProvider}
        onCreateAIProvider={handleCreateAIProvider}
        onDeleteAIProvider={handleDeleteAIProvider}
        onParafrasePlagiat={handleParafrasePlagiat}
        isSynthesizing={isSynthesizing}
        synthesizedText={synthesizedText}
        synthesizeError={synthesizeError}
        synthesizeDisclaimer={synthesizeDisclaimer}
        onSynthesizeReview={handleSynthesizeReview}
        onInsertSynthesizedText={handleInsertSynthesizedText}
        citationStyle={currentDocument?.settings?.citationStyle || 'apa'}
        onChangeCitationStyle={handleChangeCitationStyle}
        folders={folders}
        folderAssignments={folderAssignments}
        onCreateFolder={handleCreateFolder}
        onAssignFolder={handleAssignFolder}
        aiHistory={aiHistory}
        onDeleteAiHistoryEntry={deleteAiHistoryEntry}
        onClearAiHistory={clearAiHistory}
        isApplied={isApplied}
        onSaveSettings={handleChangeDocumentSettings}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onNotificationClick={handleNotificationClick}
        comments={comments}
        suggestions={suggestions}
        activeUsers={activeUsers}
        onAcceptSuggestion={(id) => {
          if (!currentDocument?.id) return;
          acceptedLocallyRef.current.add(id);
          processedAcceptedSuggestionsRef.current.add(id);
          const sug = suggestions.find(s => s.id === id);
          editorJsRef.current?.acceptSuggestion?.(id);

          if (sug && currentDocument.content) {
            try {
              let rawContent = typeof currentDocument.content === 'string'
                ? JSON.parse(currentDocument.content)
                : currentDocument.content;
              
              let changed = false;
              if (rawContent && Array.isArray(rawContent.blocks)) {
                rawContent.blocks = rawContent.blocks.map((block: any) => {
                  if (block.data && typeof block.data.text === 'string') {
                    let text = block.data.text;
                    if (text.includes('<del') || text.includes('<ins')) {
                      text = text.replace(/<del[^>]*>.*?<\/del>/gi, '').replace(/<ins[^>]*>(.*?)<\/ins>/gi, '$1');
                      changed = true;
                    }
                    const targetText = sug.selected_text ? sug.selected_text.trim() : '';
                    if (targetText && text.toLowerCase().includes(targetText.toLowerCase())) {
                      const regex = new RegExp(targetText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                      text = text.replace(regex, sug.suggested_text ? sug.suggested_text.trim() : '');
                      changed = true;
                    }
                    block.data.text = text;
                  }
                  return block;
                });
              }

              if (changed) {
                const updatedContentStr = JSON.stringify(rawContent);
                lastSavedContentRef.current = getContentComparisonString(rawContent);
                setCurrentDocument(prev => prev ? { ...prev, content: updatedContentStr } : prev);
                triggerDebouncedSave(currentDocument.id, currentDocument.title, updatedContentStr, currentDocument.settings);
                setTimeout(() => {
                  editorJsRef.current?.renderContent?.(rawContent);
                }, 100);
              }
            } catch (e) {
              console.error('Failed smart suggestion replacement:', e);
            }
          }

          updateSuggestionStatus(currentDocument.id, id, 'accepted').then(() => {
            fetchSuggestions(currentDocument.id).then(setSuggestions);
            if (sug && sug.user_id && isValidUuid(sug.user_id) && sug.user_id !== user?.id) {
              const myName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Pemilik Dokumen';
              createNotification(
                currentDocument.id,
                sug.user_id,
                myName,
                language === 'en'
                  ? `accepted your suggestion: "${(sug.suggested_text || sug.selected_text).slice(0, 30)}${(sug.suggested_text || sug.selected_text).length > 30 ? '...' : ''}"`
                  : `menerima usulan Anda: "${(sug.suggested_text || sug.selected_text).slice(0, 30)}${(sug.suggested_text || sug.selected_text).length > 30 ? '...' : ''}"`
              );
            }
          });
        }}
        onRejectSuggestion={(id) => {
          if (!currentDocument?.id) return;
          const sug = suggestions.find(s => s.id === id);
          editorJsRef.current?.rejectSuggestion?.(id);
          if (sug && sug.user_id && isValidUuid(sug.user_id) && sug.user_id !== user?.id) {
            const myName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Pemilik Dokumen';
            createNotification(
              currentDocument.id,
              sug.user_id,
              myName,
              language === 'en'
                ? `rejected your suggestion: "${(sug.suggested_text || sug.selected_text).slice(0, 30)}${(sug.suggested_text || sug.selected_text).length > 30 ? '...' : ''}"`
                : `menolak usulan Anda: "${(sug.suggested_text || sug.selected_text).slice(0, 30)}${(sug.suggested_text || sug.selected_text).length > 30 ? '...' : ''}"`
            );
          }
          updateSuggestionStatus(currentDocument.id, id, 'rejected').then(() => {
            fetchSuggestions(currentDocument.id).then(setSuggestions);
          });
        }}
        onResolveComment={handleResolveComment}
        onCommentClick={handleCommentClick}
        activeSidebarTab={activeSidebarTab}
      />

      <RemoteUpdateBanner
        hasPendingRemoteUpdate={hasPendingRemoteUpdate}
        language={language}
        onUpdate={() => {
          if (pendingRemoteContent) {
            const parsed = typeof pendingRemoteContent === 'string' ? JSON.parse(pendingRemoteContent) : pendingRemoteContent;
            lastSavedContentRef.current = getContentComparisonString(pendingRemoteContent);
            setCurrentDocument(prev => prev ? { ...prev, content: JSON.stringify(pendingRemoteContent) } : prev);
            editorJsRef.current?.renderContent?.(parsed);
            setHasPendingRemoteUpdate(false);
            setPendingRemoteContent(null);
            showToast(
              language === 'en'
                ? 'Canvas editor successfully updated to latest version!'
                : 'Canvas editor berhasil diperbarui ke versi terbaru!',
              'success'
            );
          }
        }}
      />

      <CitationDetailsModal
        language={language}
        activeModalCitation={activeModalCitation as any}
        candidate={activeModalCitation ? citationLibrary[activeModalCitation.refId] : undefined}
        isTranslating={isTranslating}
        translatedCitedSentence={translatedCitedSentence}
        isResolvingPdf={isResolvingPdf}
        resolvedPdfUrl={resolvedPdfUrl}
        onClose={() => setActiveModalCitation(null)}
        onOpenPdf={(url, term) => {
          setActivePdfUrl(url);
          setActivePdfSearchTerm(term);
          setActiveModalCitation(null);
        }}
      />
      <DocumentSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onSubmit={handleCreateDocument}
        documents={documents}
        activePlanId={activePlanId}
        onUpgrade={() => setIsPricingOpen(true)}
      />
      {currentDocument && (
        <DocumentSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          settings={currentDocument.settings}
          onSave={handleChangeDocumentSettings}
          activePlanId={activePlanId}
        />
      )}

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />

      <LimitWarningModal
        isOpen={!!warningMessage}
        onClose={() => setWarningMessage(null)}
        onUpgrade={() => setIsPricingOpen(true)}
        message={warningMessage || ''}
      />

      {isDocLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/35 backdrop-blur-md transition-all duration-300 animate-fade-in">
          <div className="bg-white border border-slate-100/80 p-7 rounded-2xl shadow-2xl flex flex-col items-center gap-4 max-w-[240px] text-center">
            <div className="relative flex items-center justify-center h-12 w-12">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-50" />
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin" />
              <IconSparkles className="h-5 w-5 text-indigo-600 animate-pulse" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-800">
                {language === 'en' ? 'Processing Document...' : 'Memproses Dokumen...'}
              </span>
              <span className="text-[10px] text-slate-400 leading-normal">
                {language === 'en' ? 'Preparing your academic workspace' : 'Menyiapkan ruang kerja akademik Anda'}
              </span>
            </div>
          </div>
        </div>
      )}

      <EditorToast toastMessage={toastMessage} language={language} />
    </>
  );
}
