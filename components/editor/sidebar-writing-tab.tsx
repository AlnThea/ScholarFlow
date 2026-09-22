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
    language, activePlanId, user, selectedText, citationResults, citationHistory, wordCount, characterCount,
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

  const hasImprovedText = improvedText !== null;
  const isEn = language === 'en';
  
  return (
    <>
      <div className="space-y-3">
                <section className="rounded-lg border border-line dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconSparkles className="h-4 w-4 text-accent dark:text-indigo-400" />
                      <h3 className="text-sm font-semibold text-text dark:text-slate-200">{isEn ? 'Writing tools' : 'Alat Penulisan'}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsHistoryModalOpen(true)}
                      className="text-xs font-bold text-indigo-650 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition flex items-center gap-1 cursor-pointer"
                    >
                      <IconHistory className="h-3.5 w-3.5" />
                      <span>{t('sidebar.history')}</span>
                    </button>
                  </div>
                  <div className="mb-3 max-h-28 overflow-y-auto rounded-md border border-dashed border-line dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-3 text-xs leading-5 text-muted dark:text-slate-400">
                    {selectedText.trim()
                      ? selectedText
                      : (isEn ? 'Select text in the document to enable writing tools.' : 'Pilih teks di dalam dokumen untuk mengaktifkan alat penulisan.')}
                  </div>
                  <div className="space-y-2">
                    <ActionButton
                      label={isImproving ? (isEn ? 'Improving...' : 'Sedang Memperbaiki...') : (isEn ? 'Improve Academic Writing' : 'Perbaiki Gaya Penulisan')}
                      description={isEn ? "Refine clarity, tone, and academic structure." : "Tingkatkan kejelasan, nada bahasa, dan struktur akademis."}
                      icon={isImproving ? IconLoader2 : IconWand}
                      onClick={onImproveWriting}
                      disabled={!selectedText.trim() || isImproving}
                    />
                    <ActionButton
                      label={isImproving ? (isEn ? 'Paraphrasing...' : 'Memparafrase...') : (isEn ? 'Paraphrase' : 'Parafrase')}
                      description={isEn ? "Rewrite the selected text while keeping the meaning." : "Tulis ulang teks terpilih tanpa mengubah maknanya."}
                      icon={isImproving ? IconLoader2 : IconLanguage}
                      onClick={onParaphrase}
                      disabled={!selectedText.trim() || isImproving}
                    />
                    <ActionButton
                      label={isImproving ? (isEn ? 'Summarizing...' : 'Merangkum...') : (isEn ? 'Summarize' : 'Rangkum')}
                      description={isEn ? "Condense the selected text into a shorter academic summary." : "Ringkas teks terpilih menjadi paragraf akademis yang lebih padat."}
                      icon={isImproving ? IconLoader2 : IconFileText}
                      onClick={onSummarize}
                      disabled={!selectedText.trim() || isImproving}
                    />
                    <ActionButton
                      label={isImproving ? (isEn ? 'Generating...' : 'Membuat...') : (isEn ? 'Generate Abstract' : 'Buat Abstrak otomatis')}
                      description={isEn ? "Draft an abstract from the current document context." : "Susun abstrak otomatis berdasarkan konteks dokumen Anda."}
                      icon={isImproving ? IconLoader2 : IconBook}
                      onClick={onGenerateAbstract}
                      disabled={isImproving}
                    />
                    <ActionButton
                      label={isSearchingCitations ? (isEn ? 'Searching...' : 'Mencari...') : (isEn ? 'Find Citation' : 'Cari Sitasi')}
                      description={isEn ? "Search verified metadata for the selected claim." : "Cari data jurnal valid untuk mendukung klaim teks Anda."}
                      icon={isSearchingCitations ? IconLoader2 : IconSum}
                      onClick={onFindCitation}
                      disabled={!selectedText.trim() || isSearchingCitations}
                    />
                    <ActionButton
                      label={isEn ? "Auto-Suggest Citation (AI)" : "Rekomendasi Sitasi Otomatis (AI)"}
                      description={isEn
                        ? "✨ Automated citation suggestions based on your statement claims (Pro)."
                        : "✨ Rekomendasi sitasi otomatis berdasarkan isi klaim kalimat Anda (Pro)."
                      }
                      icon={IconSparkles}
                      onClick={() => {
                        if (activePlanId === 'free') {
                          alert(isEn
                            ? "✨ Automated AI Citation Suggestion feature is exclusive to Pro Writer plans. Please upgrade your account in the Pricing menu."
                            : "✨ Fitur Rekomendasi Sitasi AI khusus untuk pengguna paket Pro Writer. Silakan upgrade akun Anda di menu Pricing."
                          );
                        } else {
                          onRepeatCitationSearch(selectedText);
                          alert(isEn
                            ? "AI is recommending references based on your statement claims. Search results can be viewed in the 'Library' tab."
                            : "AI merekomendasikan referensi berdasarkan klaim kalimat Anda. Hasil pencarian referensi dapat dilihat di tab 'Library'."
                          );
                        }
                      }}
                      disabled={!selectedText.trim()}
                    />
                  </div>
                  {citationError ? (
                    <div className="mt-3 rounded-md border border-rose-200 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-900/30 p-3 text-xs leading-5 text-rose-700 dark:text-rose-400">
                      {citationError}
                    </div>
                  ) : citationNote ? (
                    <div className="mt-3 rounded-md border border-line dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-3 text-xs leading-5 text-muted dark:text-slate-400">
                      {citationNote}
                    </div>
                  ) : null}
                </section>

                <section className="rounded-lg border border-line dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-text dark:text-slate-200">{isEn ? 'Improve result' : 'Hasil Perbaikan AI'}</h3>
                    {hasImprovedText ? (
                      <button
                        type="button"
                        onClick={onApplyImprovedText}
                        disabled={isApplied}
                        className="inline-flex items-center gap-2 rounded-md border border-line dark:border-slate-600 bg-panel dark:bg-slate-700 px-3 py-1.5 text-xs font-medium text-text dark:text-slate-200 transition hover:border-accent/30 hover:bg-accentSoft/70 dark:hover:bg-indigo-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <IconCheck className="h-3.5 w-3.5" />
                        {isApplied ? (isEn ? 'Applied' : 'Diterapkan') : (isEn ? 'Apply' : 'Terapkan')}
                      </button>
                    ) : null}
                  </div>
                  {aiError ? (
                    <div className="rounded-md border border-rose-200 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-900/30 p-3 text-xs leading-5 text-rose-700 dark:text-rose-400">
                      {aiError}
                    </div>
                  ) : hasImprovedText ? (
                    <div className="space-y-3">
                      <div className="rounded-md border border-line dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-3">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted dark:text-slate-500">
                          {isEn ? 'Improved Text' : 'Teks Baru'}
                        </p>
                        <p className="text-sm leading-6 text-text dark:text-slate-300">{improvedText?.improved_text}</p>
                      </div>
                      <div className="flex items-start gap-2 rounded-md border border-line dark:border-slate-700 bg-panel dark:bg-slate-800 p-3 text-xs leading-5 text-muted dark:text-slate-400">
                        <IconSparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent dark:text-indigo-400" />
                        <span>{improvedText?.disclaimer}</span>
                      </div>
                    </div>
                  ) : null}
                </section>
              </div>
    </>
  );
};
