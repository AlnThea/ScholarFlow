// app/shared/[id]/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'next/navigation';
import { fetchSharedDocument, updateSharedDocument, type DocumentEntry } from '@/lib/api/documents';
import { fetchComments, addComment, createNotification, isValidUuid } from '@/lib/api/comments';
import { fetchCitationLibrary } from '@/lib/api/citation-library';
import { useSharedDocumentSync } from '@/hooks/use-shared-document-sync';
import { updatePresence, fetchActivePresence, leavePresence, type UserPresence } from '@/lib/api/presence';
import { fetchSuggestions, addSuggestion, updateSuggestionStatus, DocumentSuggestion } from '@/lib/api/suggestions';
import { formatBibliographyCandidate } from '@/lib/editor/bibliography';
import { searchCitations, type CitationCandidate } from '@/lib/api/citations';
import { improveWriting } from '@/lib/api/ai';
import { EditorJsEditor } from '@/components/editor/editorjs-editor';
import { SharedSidebar } from '@/components/editor/shared-sidebar';
import { SharedBubbleMenu } from '@/components/editor/shared-bubble-menu';
import { PricingModal } from '@/components/editor/pricing-modal';
import { SuggestionModal } from '@/components/editor/modals/suggestion-modal';
import { useSharedEditorLogic } from '@/hooks/use-shared-editor-logic';
import { CitationDetailsModal } from '@/components/editor/modals/citation-details-modal';
import { SharedToolbar } from '@/components/editor/shared-toolbar';
import { useAuth } from '@/components/auth/auth-provider';
import {
  IconLock,
  IconBook,
  IconLoader,
  IconCheck,
  IconExternalLink,
  IconWorld,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBold,
  IconItalic,
  IconUnderline,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconAlignJustified,
  IconStrikethrough,
  IconCode,
  IconSuperscript,
  IconSubscript,
  IconLink,
  IconHighlight,
  IconAt,
  IconPhoto,
  IconTable,
  IconSum,
  IconMath,
  IconCalculator,
  IconSearch,
  IconX,
  IconQuote,
  IconSparkles,
  IconLanguage,
  IconMessage,
  IconTrash,
  IconAlertCircle,
  IconInfoCircle,
  IconRefresh
} from '@tabler/icons-react';

export default function SharedDocumentPage() {
  const { user, profile } = useAuth();
  const role = profile?.role ?? 'user';
  const params = useParams();
  const rawId = params?.id as string | undefined;

  // Extract document UUID by removing 'doc-' prefix if present
  const docId = useMemo(() => {
    if (!rawId) return '';
    return rawId.startsWith('doc-') ? rawId.substring(4) : rawId;
  }, [rawId]);


  // We must define these before useSharedDocumentSync because it depends on them.
  const editorJsRef = useRef<any>(null);
  
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage({ text, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  const {
    document, setDocument, loading, error, saveStatus, setSaveStatus,
    citationLibrary, comments, setComments, suggestions, setSuggestions,
    activeUsers, setActiveUsers, hasPendingRemoteUpdate, setHasPendingRemoteUpdate,
    pendingRemoteContent, setPendingRemoteContent, acceptedLocallyRef,
    handleContentChange, handleTitleChange
  } = useSharedDocumentSync(docId, user, profile, false, 'en', editorJsRef, showToast);

  const language = document?.settings?.citationLocale?.startsWith('id') ? 'id' : 'en';
  const isCoEditor = document?.settings?.sharePermission === 'edit';

  const editorLogic = useSharedEditorLogic({
    docId, user, profile, document, setDocument, citationLibrary, comments, setComments,
    suggestions, setSuggestions, activeUsers, setActiveUsers, hasPendingRemoteUpdate,
    setHasPendingRemoteUpdate, pendingRemoteContent, setPendingRemoteContent, acceptedLocallyRef,
    editorJsRef, isCoEditor, language, showToast
  });

  const {
    activeReferenceIds, setActiveReferenceIds, isPricingOpen, setIsPricingOpen,
    currentBlockType, setCurrentBlockType, currentAlignment, setCurrentAlignment,
    currentFontSize, setCurrentFontSize, activeFormats, setActiveFormats, getBtnClass,
    mounted, setMounted, showHighlightPopover, setShowHighlightPopover,
    highlightPopoverRect, setHighlightPopoverRect, isLinkModalOpen, setIsLinkModalOpen,
    linkUrlInput, setLinkUrlInput, insertLinkCallback, setInsertLinkCallback,
    isMathModalOpen, setIsMathModalOpen, mathFormulaInput, setMathFormulaInput,
    editingMathCallback, setEditingMathCallback, handleHighlightButtonClick, handleApplyHighlight,
    handleInsertLinkConfirm, handleUnlinkConfirm, handleInsertMathConfirm,
    isImageModalOpen, setIsImageModalOpen, imageUrlInput, setImageUrlInput,
    selectedText, setSelectedText, bubbleMenuRect, setBubbleMenuRect,
    showBubbleMenu, setShowBubbleMenu, bubbleMode, setBubbleMode, bubbleSearchQuery, setBubbleSearchQuery,
    isSearchingCitations, setIsSearchingCitations, citationResults, setCitationResults,
    citationError, setCitationError, suggestionSubTab, setSuggestionSubTab,
    showCommentsSidebar, setShowCommentsSidebar, commentSubTab, setCommentSubTab,
    editorMode, setEditorMode, isSuggestionModalOpen, setIsSuggestionModalOpen,
    selectedTextForSuggestion, setSelectedTextForSuggestion, newTextForSuggestion, setNewTextForSuggestion,
    newCommentText, setNewCommentText, newCommentAuthor, setNewCommentAuthor,
    isSubmittingComment, setIsSubmittingComment, runCitationSearchForQuery,
    selectedAiModel, setSelectedAiModel, selectedAiTone, setSelectedAiTone,
    isImproving, setIsImproving, aiError, setAiError, isAiModalOpen, setIsAiModalOpen,
    aiOriginalText, setAiOriginalText, aiResultText, setAiResultText,
    handleImproveText, handleApplyAiText, aiTargetLanguage, setAiTargetLanguage,
    isAiLoading, setIsAiLoading, handleAiImprovement, activeModalCitation, setActiveModalCitation,
    isMathHelperOpen, setIsMathHelperOpen, mathSearchQuery, setMathSearchQuery,
    mathToast, setMathToast, activeMathCategory, setActiveMathCategory,
    mathHelperItems, filteredMathHelperItems, handleInsertImageConfirm,
    getContentComparisonString, lastSavedContentRef, handleAddComment
  } = editorLogic;

  // Polyfills for missing handlers
  const sidebarTab = suggestionSubTab === 'active' ? 'active' : 'history';
  const setSidebarTab = setSuggestionSubTab;
  const onResolveComment = async (id: string) => {};
  const onAcceptSuggestion = async (id: string) => {};
  const onRejectSuggestion = async (id: string) => {};
  const triggerDebouncedSave = (title: string, contentStr: string, settings: any) => {
    updateSharedDocument(docId, title, contentStr, settings);
  };

  // Render Loading Screen
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-3">
          <IconLoader className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="text-sm text-slate-500 font-medium">Loading Document Draft...</span>
        </div>
      </div>
    );
  }

  // Render Access Denied / Lock Screen
  if (error || !document || !document.settings?.shareActive) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 font-sans p-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl max-w-md w-full text-center flex flex-col items-center gap-5">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
            <IconLock className="h-10 w-10 animate-pulse" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-lg font-bold text-slate-800">
              {document?.settings?.citationLocale?.startsWith('id') ? 'Tautan Berbagi Tidak Aktif' : 'Sharing Link Inactive'}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {document?.settings?.citationLocale?.startsWith('id')
                ? 'Draf dokumen ini bersifat pribadi atau link berbagi telah dinonaktifkan oleh pemiliknya.'
                : 'This draft document is private or sharing access has been disabled by the owner.'}
            </p>
          </div>
          <a
            href="/login"
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-sm shadow-indigo-150 flex items-center justify-center gap-1.5"
          >
            <span>{document?.settings?.citationLocale?.startsWith('id') ? 'Masuk ke ScholarFlow' : 'Log in to ScholarFlow'}</span>
            <IconExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-850">

      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/50 h-14 flex items-center justify-between px-6 shadow-sm shadow-slate-100/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-200">
            <IconBook className="h-4.5 w-4.5" />
          </div>
          <span className="text-sm font-extrabold tracking-tight text-slate-900">
            Scholar<span className="text-indigo-600">Flow</span>
          </span>
        </div>

        {/* Document title (Editable if Co-Editor, static if Read-Only) */}
        <div className="hidden md:flex items-center max-w-md flex-1 px-8 justify-center">
          {isCoEditor ? (
            <input
              type="text"
              value={document.title}
              onChange={handleTitleChange}
              className="w-full text-center text-xs font-bold text-slate-800 outline-none border border-transparent hover:border-slate-200 hover:bg-slate-50 focus:border-indigo-400 focus:bg-white rounded-lg px-3 py-1.5 transition text-ellipsis"
            />
          ) : (
            <span className="text-xs font-bold text-slate-800 truncate">{document.title}</span>
          )}
        </div>

        {/* Access badge and save indicator */}
        <div className="flex items-center gap-3">
          {/* Toggle Comments & Suggestions Button */}
          <button
            type="button"
            onClick={() => {
              setShowCommentsSidebar(prev => {
                const next = !prev;
                if (next && suggestions.filter(s => s.status === 'pending').length > 0 && comments.filter(c => !c.resolved).length === 0) {
                  setCommentSubTab('suggestions' as any);
                }
                return next;
              });
            }}
            className={`p-2 rounded-xl border transition cursor-pointer relative ${showCommentsSidebar
                ? 'border-indigo-650 bg-indigo-50 text-indigo-700 shadow-sm'
                : 'border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900'
              }`}
            title={language === 'id' ? 'Tampilkan Komentar & Usulan' : 'Show Comments & Suggestions'}
          >
            <IconMessage className="h-4.5 w-4.5" />
            {(comments.filter(c => !c.resolved).length + suggestions.filter(s => s.status === 'pending').length) > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[20px] h-[20px] px-1 flex items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white border-2 border-white shadow-md shadow-rose-500/30 z-10 animate-bounce">
                {comments.filter(c => !c.resolved).length + suggestions.filter(s => s.status === 'pending').length}
              </span>
            )}
          </button>

          {/* Online Active Collaborators Presence (Owner Icon Only with Hover Tooltip for Co-Editor) */}
          {activeUsers && activeUsers.filter(u => u.user_role === 'owner').length > 0 && (
            <div className="flex items-center -space-x-1.5 overflow-hidden shrink-0">
              {activeUsers.filter(u => u.user_role === 'owner').slice(0, 4).map((u) => (
                <div
                  key={u.id}
                  className="relative inline-block cursor-pointer transition-transform hover:scale-110 hover:z-10"
                  title={`${u.user_name} (Pemilik Dokumen) • Online`}
                >
                  <div className="h-6 w-6 rounded-full text-[10px] font-extrabold flex items-center justify-center border-2 border-white text-white bg-indigo-600 shadow-xs">
                    {u.user_name ? u.user_name.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-500 ring-1.5 ring-white animate-pulse" />
                </div>
              ))}
              {activeUsers.filter(u => u.user_role === 'owner').length > 4 && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 border-2 border-white text-[9px] font-bold text-slate-600">
                  +{activeUsers.filter(u => u.user_role === 'owner').length - 4}
                </span>
              )}
            </div>
          )}

          {isCoEditor ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-slate-400">
                {saveStatus === 'saving' && (
                  <span className="flex items-center gap-1">
                    <IconLoader className="h-3 w-3 animate-spin text-slate-400" />
                    {language === 'id' ? 'Menyimpan...' : 'Saving...'}
                  </span>
                )}
                {saveStatus === 'saved' && (
                  <span className="flex items-center gap-1 text-emerald-500">
                    <IconCheck className="h-3.5 w-3.5" />
                    {language === 'id' ? 'Tersimpan' : 'Saved'}
                  </span>
                )}
                {saveStatus === 'offline' && (
                  <span className="text-amber-500">
                    {language === 'id' ? 'Disimpan Lokal' : 'Saved Locally'}
                  </span>
                )}
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/40 rounded-full">
                <IconWorld className="h-3 w-3" />
                Co-Editor
              </span>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/40 rounded-full">
              <IconLock className="h-3 w-3" />
              {language === 'id' ? 'Membaca Saja' : 'Read-Only'}
            </span>
          )}

          {/* User Authentication Login Status Indicator Badge */}
          {user ? (
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-slate-700 bg-slate-100/90 border border-slate-200/80 rounded-full shrink-0"
              title={language === 'id' ? `Login sebagai: ${user.email || profile?.full_name || 'Pengguna'}` : `Logged in as: ${user.email || profile?.full_name || 'User'}`}
            >
              <div className="h-4 w-4 rounded-full bg-indigo-600 text-white text-[9px] font-black flex items-center justify-center">
                {(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[90px] md:max-w-[120px] truncate">
                {profile?.full_name || user.email?.split('@')[0] || 'User'}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Logged In" />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200/60 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                {language === 'id' ? 'Tamu' : 'Guest'}
              </span>
              <a
                href={`/login?returnUrl=${encodeURIComponent(`/shared/${docId}`)}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-indigo-650 hover:text-white bg-indigo-50 hover:bg-indigo-600 border border-indigo-100 hover:border-indigo-600 transition rounded-full shadow-2xs"
              >
                {language === 'id' ? 'Masuk' : 'Log In'} →
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Navbar 2 Toolbar extracted */}
      <SharedToolbar
        isCoEditor={isCoEditor}
        editorMode={editorMode}
        setEditorMode={setEditorMode}
        language={language}
        editorJsRef={editorJsRef}
        currentBlockType={currentBlockType}
        currentFontSize={currentFontSize}
        setCurrentFontSize={setCurrentFontSize}
        activeFormats={activeFormats}
        getBtnClass={getBtnClass}
        handleHighlightButtonClick={handleHighlightButtonClick}
        currentAlignment={currentAlignment}
        setImageUrlInput={setImageUrlInput}
        setIsImageModalOpen={setIsImageModalOpen}
        setMathFormulaInput={setMathFormulaInput}
        selectedText={selectedText}
        setIsMathModalOpen={setIsMathModalOpen}
        isMathHelperOpen={isMathHelperOpen}
        setIsMathHelperOpen={setIsMathHelperOpen}
      />

      {/* Editor Main Content Area */}
      <div className="flex max-w-7xl mx-auto items-start gap-6 w-full px-4 md:px-6">
        <main
          className={`flex-1 min-w-0 pb-24 ${isCoEditor ? 'pt-32' : 'pt-20'}`}
          onContextMenu={(e) => {
            if (!isCoEditor) return;
            const selection = window.getSelection();
            if (selection && !selection.isCollapsed && selection.toString().trim()) {
              const holder = window.document.getElementById('editorjs-holder');
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
          <div className="max-w-3xl mx-auto bg-white border border-slate-200/80 rounded-2xl shadow-sm min-h-[60vh] overflow-hidden my-6">

            {/* Header metadata layout for public reader */}
            <div className="px-6 md:px-10 pt-8 border-b border-slate-100 pb-4">
              <h1 className="text-xl md:text-2xl font-serif font-bold text-slate-900 mb-2 leading-snug">
                {document.title}
              </h1>
              <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                <span>{language === 'id' ? 'Draf Bersama' : 'Shared Draft'}</span>
                <span>•</span>
                <span>{new Date(document.updated_at).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="py-2">
              <EditorJsEditor
                ref={editorJsRef}
                initialContent={document.content}
                readOnly={!isCoEditor}
                onCommentMarkClick={(commentId) => {
                  setShowCommentsSidebar(true);
                }}
                onContentChange={isCoEditor ? handleContentChange : undefined}
                onBlockTypeChange={setCurrentBlockType}
                onAlignmentChange={(align) => {
                  setCurrentAlignment(align);
                  if (!isCoEditor || !document) return;
                  try {
                    const alignments = JSON.parse(localStorage.getItem('scholarflow.editorjs.alignments.v1') || '{}');
                    const updatedSettings = {
                      ...document.settings,
                      alignments
                    };
                    setDocument((prev) => prev ? { ...prev, settings: updatedSettings } : null);
                    triggerDebouncedSave(document.title, document.content, updatedSettings);
                  } catch (e) {
                    console.error('Error saving alignment change:', e);
                  }
                }}
                onCitationSearchChange={(query, rect) => {
                  setBubbleMenuRect(rect);
                  setBubbleMode('citation');
                  setShowBubbleMenu(true);
                  setBubbleSearchQuery(query);
                  runCitationSearchForQuery(query);
                }}
                onCitationSearchCancel={() => {
                  editorJsRef.current?.cancelCitationSearch();
                  setShowBubbleMenu(false);
                }}
                onInsertLinkRequest={(initialUrl, onSave, onUnlink) => {
                  setLinkUrlInput(initialUrl);
                  setInsertLinkCallback({
                    save: onSave,
                    unlink: onUnlink
                  });
                  setIsLinkModalOpen(true);
                }}
                onEditInlineEquation={(formula, onSave) => {
                  setMathFormulaInput(formula);
                  setEditingMathCallback(() => onSave);
                  setIsMathModalOpen(true);
                }}
                onCiteClick={(refId, label, citedSentence) => {
                  setActiveModalCitation({ refId, label, citedSentence });
                }}
                onStatsChange={(stats) => {
                  // Read active reference IDs reported in real-time
                  if (stats.activeReferenceIds) {
                    const newIds = stats.activeReferenceIds;
                    setActiveReferenceIds((prev) => {
                      const isSame =
                        prev.length === newIds.length &&
                        prev.every((id, idx) => id === newIds[idx]);
                      return isSame ? prev : newIds;
                    });
                  }
                }}
              />
            </div>
          </div>
        </main>

        {/* Right Comments Sidebar Panel for Co-Editor (Full Height Browser Edge) */}
        <SharedSidebar 
          showCommentsSidebar={showCommentsSidebar}
          setShowCommentsSidebar={setShowCommentsSidebar}
          language={language}
          isCoEditor={isCoEditor}
          activeUsers={activeUsers}
          sidebarTab={sidebarTab}
          setSidebarTab={setSidebarTab}
          comments={comments}
          onResolveComment={onResolveComment}
          suggestions={suggestions}
          onAcceptSuggestion={onAcceptSuggestion}
          onRejectSuggestion={onRejectSuggestion}
          user={user}
        />
      </div>

      {/* Toast notification */}
      {toastMessage && (
        <div className={`fixed bottom-5 right-5 z-[9999] px-4 py-2.5 rounded-xl border shadow-lg flex items-center gap-2 animate-fade-in font-sans text-xs font-semibold ${toastMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
            toastMessage.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
              'bg-indigo-50 border-indigo-200 text-indigo-800'
          }`}>
          {toastMessage.type === 'success' && <IconCheck className="h-4 w-4 shrink-0 text-emerald-600" />}
          {toastMessage.type === 'error' && <IconAlertCircle className="h-4 w-4 shrink-0 text-rose-600" />}
          {toastMessage.type === 'info' && <IconInfoCircle className="h-4 w-4 shrink-0 text-indigo-600" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Render portals for modals & popovers */}
      {mounted && showHighlightPopover && highlightPopoverRect && typeof window !== 'undefined' && createPortal(
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => {
              setShowHighlightPopover(false);
              setHighlightPopoverRect(null);
            }}
          />
          <div
            className="fixed z-[9999] bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex items-center gap-1.5 animate-scale-in"
            style={{
              top: `${highlightPopoverRect.bottom + window.scrollY + 6}px`,
              left: `${Math.max(10, highlightPopoverRect.left + window.scrollX - 60)}px`,
            }}
          >
            <button
              onClick={() => handleApplyHighlight('yellow')}
              className="w-6 h-6 rounded bg-yellow-200 border border-yellow-350 hover:scale-105 active:scale-95 transition cursor-pointer"
              title={language === 'en' ? 'Yellow' : 'Kuning'}
            />
            <button
              onClick={() => handleApplyHighlight('green')}
              className="w-6 h-6 rounded bg-green-200 border border-green-300 hover:scale-105 active:scale-95 transition cursor-pointer"
              title={language === 'en' ? 'Green' : 'Hijau'}
            />
            <button
              onClick={() => handleApplyHighlight('blue')}
              className="w-6 h-6 rounded bg-sky-200 border border-sky-300 hover:scale-105 active:scale-95 transition cursor-pointer"
              title={language === 'en' ? 'Blue' : 'Biru'}
            />
            <button
              onClick={() => handleApplyHighlight('pink')}
              className="w-6 h-6 rounded bg-pink-200 border border-pink-300 hover:scale-105 active:scale-95 transition cursor-pointer"
              title={language === 'en' ? 'Pink' : 'Merah Muda'}
            />
            <button
              onClick={() => handleApplyHighlight('purple')}
              className="w-6 h-6 rounded bg-purple-200 border border-purple-300 hover:scale-105 active:scale-95 transition cursor-pointer"
              title={language === 'en' ? 'Purple' : 'Ungu'}
            />
            <div className="w-px h-4 bg-slate-200 mx-0.5" />
            <button
              onClick={() => handleApplyHighlight('clear')}
              className="p-1.5 rounded text-red-500 hover:bg-red-50 hover:text-red-600 transition cursor-pointer flex items-center justify-center"
              title={language === 'en' ? 'Clear Highlight' : 'Hapus Sorotan'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </>
        , window.document.body
      )}

      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => {
          setIsLinkModalOpen(false);
          setInsertLinkCallback(null);
          setLinkUrlInput('');
        }}
        linkUrlInput={linkUrlInput}
        setLinkUrlInput={setLinkUrlInput}
        onConfirm={handleInsertLinkConfirm}
        onUnlink={insertLinkCallback?.unlink ? handleUnlinkConfirm : undefined}
        isEditing={!!insertLinkCallback?.unlink}
        language={language as "en" | "id"}
      />


      <MathModal
        isOpen={isMathModalOpen}
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


      {/* Render Image Modal Portal */}
      {mounted && isImageModalOpen && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xl w-full max-w-md flex flex-col gap-5 animate-scale-in text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-800">
                Sisipkan Gambar via URL
              </h3>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-100/80 hover:text-slate-650 transition cursor-pointer"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                Masukkan alamat URL gambar (misalnya dari internet) untuk menyisipkannya langsung ke dalam dokumen Anda.
              </p>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">URL Gambar</label>
                <input
                  type="text"
                  placeholder="https://example.com/image.png"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleInsertImageConfirm();
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleInsertImageConfirm}
                disabled={!imageUrlInput.trim()}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Sisipkan Gambar
              </button>
            </div>
          </div>
        </div>,
        window.document.body
      )}

      {/* Math Helper Panel */}
      <MathHelperPanel
        isMathHelperOpen={isMathHelperOpen}
        setIsMathHelperOpen={setIsMathHelperOpen}
        language={language}
        showRightSidebar={showCommentsSidebar}
        isRightSidebarExpanded={showCommentsSidebar}
      />

      {/* Render Bubble Menu for Text Selection & Inline Citation Search */}
      <SharedBubbleMenu
        mounted={mounted}
        showBubbleMenu={showBubbleMenu}
        bubbleMenuRect={bubbleMenuRect}
        language={language}
        selectedText={selectedText}
        isCoEditor={isCoEditor}
        isAiLoading={isAiLoading}
        setShowBubbleMenu={setShowBubbleMenu}
        handleAiImprovement={handleAiImprovement}
        aiTargetLanguage={aiTargetLanguage}
        setAiTargetLanguage={setAiTargetLanguage}
        setBubbleMode={setBubbleMode}
        bubbleMode={bubbleMode}
        newCommentText={newCommentText}
        setNewCommentText={setNewCommentText}
        handleAddComment={handleAddComment}
        handleOpenSuggestionModal={() => setIsSuggestionModalOpen(true)}
      />
      {/* Citation Details Modal */}
      {/* Citation Details Modal */}
      <CitationDetailsModal 
        activeModalCitation={activeModalCitation}
        setActiveModalCitation={setActiveModalCitation}
        citationLibrary={citationLibrary}
        language={language}
      />
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />
      {/* Modal Usulan Perubahan (Mode Sugesti / Track Changes) */}
      <SuggestionModal
        isOpen={isSuggestionModalOpen}
        onClose={() => setIsSuggestionModalOpen(false)}
        selectedText={selectedTextForSuggestion}
        newText={newTextForSuggestion}
        setNewText={setNewTextForSuggestion}
        language={language}
        onConfirm={() => {
          const sugId = `sug-${Date.now()}`;
          const authorName = profile?.full_name || user?.email?.split('@')[0] || 'Collaborator';
          editorJsRef.current?.addSuggestionMark?.(sugId, selectedTextForSuggestion, newTextForSuggestion, authorName);
          if (docId) {
            addSuggestion(docId, selectedTextForSuggestion, newTextForSuggestion, authorName, sugId, user?.id);
            if (activeUsers && activeUsers.length > 0) {
              activeUsers.forEach(coUser => {
                if (coUser.user_id && coUser.user_id !== user?.id) {
                  createNotification(
                    docId,
                    coUser.user_id,
                    authorName,
                    language === 'en'
                      ? `proposed a suggestion: "${(newTextForSuggestion || selectedTextForSuggestion).slice(0, 30)}${(newTextForSuggestion || selectedTextForSuggestion).length > 30 ? '...' : ''}"`
                      : `mengusulkan perubahan: "${(newTextForSuggestion || selectedTextForSuggestion).slice(0, 30)}${(newTextForSuggestion || selectedTextForSuggestion).length > 30 ? '...' : ''}"`
                  );
                }
              });
            }
          }
          setIsSuggestionModalOpen(false);
        }}
      />
      {/* Floating Signal Banner for Remote Document Updates */}
      {hasPendingRemoteUpdate && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 bg-slate-900/95 text-white backdrop-blur-md text-xs font-semibold rounded-full shadow-2xl border border-amber-500/40 animate-pulse transition-all">
          <span className="flex items-center gap-2 text-amber-400">
            <IconSparkles className="w-4 h-4 text-amber-400" />
            <span>
              {language === 'en'
                ? 'Latest document revision has been accepted!'
                : 'Revisi usulan dokumen terbaru telah diterima!'}
            </span>
          </span>
          <button
            type="button"
            onClick={() => {
              if (pendingRemoteContent) {
                const parsed = typeof pendingRemoteContent === 'string' ? JSON.parse(pendingRemoteContent) : pendingRemoteContent;
                lastSavedContentRef.current = getContentComparisonString(pendingRemoteContent);
                setDocument(prev => prev ? { ...prev, content: JSON.stringify(pendingRemoteContent) } : prev);
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
            className="px-3.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-full transition shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <IconRefresh className="w-3.5 h-3.5" />
            {language === 'en' ? 'Update Editor' : 'Perbarui Editor'}
          </button>
        </div>
      )}
    </div>
  );
}
