import React from 'react';
import {
  IconBook, IconCheck, IconDownload, IconExternalLink, IconFileText,
  IconFilter, IconFolderOpen, IconLoader2, IconCirclePlus, IconQuote,
  IconSearch, IconSum, IconSparkles, IconWand, IconChevronLeft,
  IconChevronRight, IconLanguage, IconX, IconClock, IconTrash, IconCopy, IconHistory
} from '@tabler/icons-react';
import { BurstinessChart } from './burstiness-chart';


export const SidebarWritingTab = (props: any) => {
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
            ) : workspaceTab === 'writing' ? (
              <div className="space-y-3">
                <section className="rounded-lg border border-line bg-white p-3 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconSparkles className="h-4 w-4 text-accent" />
                      <h3 className="text-sm font-semibold text-text">Writing tools</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsHistoryModalOpen(true)}
                      className="text-xs font-bold text-indigo-650 hover:text-indigo-800 transition flex items-center gap-1 cursor-pointer"
                    >
                      <IconHistory className="h-3.5 w-3.5" />
                      <span>{t('sidebar.history')}</span>
                    </button>
                  </div>
                  <div className="mb-3 max-h-28 overflow-y-auto rounded-md border border-dashed border-line bg-slate-50 p-3 text-xs leading-5 text-muted">
                    {selectedText.trim()
                      ? selectedText
                      : 'Select text in the document to enable writing tools.'}
                  </div>
                  <div className="space-y-2">
                    <ActionButton
                      label={isImproving ? 'Improving...' : 'Improve Academic Writing'}
                      description="Refine clarity, tone, and academic structure."
                      icon={isImproving ? IconLoader2 : IconWand}
                      onClick={onImproveWriting}
                      disabled={!selectedText.trim() || isImproving}
                    />
                    <ActionButton
                      label={isImproving ? 'Paraphrasing...' : 'Paraphrase'}
                      description="Rewrite the selected text while keeping the meaning."
                      icon={isImproving ? IconLoader2 : IconLanguage}
                      onClick={onParaphrase}
                      disabled={!selectedText.trim() || isImproving}
                    />
                    <ActionButton
                      label={isImproving ? 'Summarizing...' : 'Summarize'}
                      description="Condense the selected text into a shorter academic summary."
                      icon={isImproving ? IconLoader2 : IconFileText}
                      onClick={onSummarize}
                      disabled={!selectedText.trim() || isImproving}
                    />
                    <ActionButton
                      label={isImproving ? 'Generating...' : 'Generate Abstract'}
                      description="Draft an abstract from the current document context."
                      icon={isImproving ? IconLoader2 : IconBook}
                      onClick={onGenerateAbstract}
                      disabled={isImproving}
                    />
                    <ActionButton
                      label={isSearchingCitations ? 'Searching...' : 'Find Citation'}
                      description="Search verified metadata for the selected claim."
                      icon={isSearchingCitations ? IconLoader2 : IconSum}
                      onClick={handleFindCitation}
                      disabled={!selectedText.trim() || isSearchingCitations}
                    />
                    <ActionButton
                      label="Auto-Suggest Citation (AI)"
                      description={language === 'en'
                        ? "🔒 Automated citation suggestions based on your statement claims (Pro)."
                        : "🔒 Rekomendasi sitasi otomatis berdasarkan isi klaim kalimat Anda (Pro)."
                      }
                      icon={IconSparkles}
                      onClick={() => {
                        if (activePlanId === 'free') {
                          alert(language === 'en'
                            ? "🔒 Automated AI Citation Suggestion feature is exclusive to Pro Writer plans. Please upgrade your account in the Pricing menu."
                            : "🔒 Fitur Rekomendasi Sitasi AI khusus untuk pengguna paket Pro Writer. Silakan upgrade akun Anda di menu Pricing."
                          );
                        } else {
                          onRepeatCitationSearch(selectedText);
                          alert(language === 'en'
                            ? "AI is recommending references based on your statement claims. Search results can be viewed in the 'Library' tab."
                            : "AI merekomendasikan referensi berdasarkan klaim kalimat Anda. Hasil pencarian referensi dapat dilihat di tab 'Library' -> 'Sources'."
                          );
                        }
                      }}
                      disabled={!selectedText.trim()}
                    />
                  </div>
                  {citationError ? (
                    <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-700">
                      {citationError}
                    </div>
                  ) : citationNote ? (
                    <div className="mt-3 rounded-md border border-line bg-slate-50 p-3 text-xs leading-5 text-muted">
                      {citationNote}
                    </div>
                  ) : null}
                </section>

                <section className="rounded-lg border border-line bg-white p-3 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-text">Improve result</h3>
                    {hasImprovedText ? (
                      <button
                        type="button"
                        onClick={onApplyImprovedText}
                        disabled={isApplied}
                        className="inline-flex items-center gap-2 rounded-md border border-line bg-panel px-3 py-1.5 text-xs font-medium text-text transition hover:border-accent/30 hover:bg-accentSoft/70 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <IconCheck className="h-3.5 w-3.5" />
                        {isApplied ? 'Applied' : 'Apply'}
                      </button>
                    ) : null}
                  </div>
                  {aiError ? (
                    <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-700">
                      {aiError}
                    </div>
                  ) : hasImprovedText ? (
                    <div className="space-y-3">
                      <div className="rounded-md border border-line bg-slate-50 p-3">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                          Improved Text
                        </p>
                        <p className="text-sm leading-6 text-text">{improvedText?.improved_text}</p>
                      </div>
                      <div className="flex items-start gap-2 rounded-md border border-line bg-panel p-3 text-xs leading-5 text-muted">
                        <IconSparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                        <span>{improvedText?.disclaimer}</span>
                      </div>
                    </div>
                  ) : null}
                </section>
    </>
  );
};
