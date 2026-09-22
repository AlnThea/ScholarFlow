import React from 'react';
import {
  IconBook, IconCheck, IconDownload, IconExternalLink, IconFileText,
  IconFilter, IconFolderOpen, IconLoader2, IconCirclePlus, IconQuote,
  IconSearch, IconSum, IconSparkles, IconWand, IconChevronLeft,
  IconChevronRight, IconLanguage, IconX, IconClock, IconTrash, IconCopy, IconHistory
} from '@tabler/icons-react';
import { BurstinessChart } from './burstiness-chart';


export const SidebarLibraryTab = (props: any) => {
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

  const isEn = language === 'en';

  const filteredCollections = React.useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    let items = bibliographyEntries || [];

    if (selectedFolderFilter !== 'all') {
      items = items.filter(
        (entry: any) => folderAssignments && folderAssignments[entry.referenceId] === selectedFolderFilter
      );
    }

    if (!q) return items;
    return items.filter((entry: any) => {
      const haystack = `${entry.label} ${entry.formatted}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [bibliographyEntries, query, selectedFolderFilter, folderAssignments]);

  return (
    <>
      <div className="space-y-4">
                <div className="relative">
                  <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={isEn ? "Search collections..." : "Cari referensi..."}
                    className="h-11 w-full rounded-md border border-line bg-panel pl-9 pr-3 text-sm outline-none transition placeholder:text-muted focus:border-accent/40 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                  />
                </div>

                <div className="space-y-3">
                  {/* AI Literature Review Synthesizer Card */}
                  {bibliographyEntries.length > 0 && (
                    <div className="rounded-lg border border-line dark:border-slate-700 bg-gradient-to-br from-indigo-50/20 to-violet-50/20 dark:from-indigo-900/10 dark:to-violet-900/10 p-3 shadow-sm flex flex-col gap-2.5 border-l-4 border-l-indigo-500">
                      <div className="flex items-center gap-2">
                        <IconSparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{isEn ? 'AI Literature Review' : 'Tinjauan Pustaka AI'}</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                        {isEn 
                          ? `Synthesize the contribution of ${bibliographyEntries.length} active reference papers below into one draft academic literature paragraph.`
                          : `Sintesis kontribusi ${bibliographyEntries.length} paper rujukan aktif di bawah menjadi satu draf paragraf literatur akademis.`}
                      </p>

                      <button
                        type="button"
                        onClick={onSynthesizeReview}
                        disabled={isSynthesizing}
                        className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-900 text-white text-xs font-bold rounded-lg shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {isSynthesizing ? (
                          <>
                            <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>{isEn ? 'Synthesizing...' : 'Mensintesis...'}</span>
                          </>
                        ) : (
                          <>
                            <IconSparkles className="h-3.5 w-3.5" />
                            <span>{isEn ? 'Synthesize Literature Review' : 'Sintesis Tinjauan Pustaka'}</span>
                          </>
                        )}
                      </button>

                      {synthesizedText && (
                        <div className="flex flex-col gap-2 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg animate-fade-in text-left">
                          <span className="text-[9px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">{isEn ? 'Synthesis Result:' : 'Hasil Sintesis:'}</span>
                          <p className="text-[10px] text-slate-650 dark:text-slate-300 leading-relaxed italic font-medium font-sans">
                            "{synthesizedText}"
                          </p>
                          {synthesizeDisclaimer && (
                            <span className="text-[8px] text-slate-400 italic">⚠️ {synthesizeDisclaimer}</span>
                          )}
                          <button
                            type="button"
                            onClick={() => onInsertSynthesizedText(synthesizedText)}
                            className="mt-1 w-full py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold rounded shadow-sm transition cursor-pointer"
                          >
                            {isEn ? 'Insert into Document' : 'Sisipkan ke Dokumen'}
                          </button>
                        </div>
                      )}

                      {synthesizeError && (
                        <div className="p-2 bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800/50 rounded-lg text-rose-700 dark:text-rose-400 text-[10px] leading-normal text-left">
                          {synthesizeError}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Folder Management controls */}
                  {bibliographyEntries.length > 0 && (
                    <div className="rounded-lg border border-line dark:border-slate-700 bg-panel dark:bg-slate-800 p-2.5 shadow-sm flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{isEn ? 'Folder Filter' : 'Filter Folder'}</label>
                        <button
                          type="button"
                          onClick={() => setIsAddingFolder(!isAddingFolder)}
                          className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold transition cursor-pointer"
                        >
                          {isAddingFolder ? (isEn ? 'Cancel' : 'Batal') : '+ Folder'}
                        </button>
                      </div>

                      {isAddingFolder && (
                        <div className="flex gap-1.5 animate-fade-in">
                          <input
                            type="text"
                            value={newFolderName}
                            onChange={(e: any) => setNewFolderName(e.target.value)}
                            placeholder={isEn ? "New folder name..." : "Nama folder baru..."}
                            className="flex-1 px-2 py-1 text-xs border border-line dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-200 rounded-md outline-none focus:border-indigo-500 transition"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const name = newFolderName.trim();
                              if (name) {
                                onCreateFolder(name);
                                setNewFolderName('');
                                setIsAddingFolder(false);
                              }
                            }}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-md transition cursor-pointer"
                          >
                            {isEn ? 'Add' : 'Tambah'}
                          </button>
                        </div>
                      )}

                      <select
                        value={selectedFolderFilter}
                        onChange={(e: any) => setSelectedFolderFilter(e.target.value)}
                        className="w-full border border-line dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 outline-none focus:border-indigo-500 transition cursor-pointer"
                      >
                        <option value="all">{isEn ? 'All References' : 'Semua Referensi'} ({bibliographyEntries.length})</option>
                        {folders.map((f: any) => {
                          const count = bibliographyEntries.filter(
                            (e: any) => folderAssignments[e.referenceId] === f
                          ).length;
                          return (
                            <option key={f} value={f}>
                              📁 {f} ({count})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}

                  {filteredCollections.length > 0 ? (
                    filteredCollections.map((entry: any, index: number) => (
                      <article
                        key={entry.referenceId}
                        className="rounded-lg border border-line dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <IconFolderOpen className="h-4 w-4 text-accent dark:text-indigo-400" />
                              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted dark:text-slate-400">
                                Collection {index + 1}
                              </span>
                            </div>
                            <h3 className="mt-2 text-sm font-semibold leading-6 text-text dark:text-slate-200">
                              {entry.label}
                            </h3>
                            <p className={`mt-1 text-xs leading-5 text-muted dark:text-slate-400 select-none ${activePlanId === 'free' ? 'blur-[3px] pointer-events-none' : ''}`}>
                              {entry.formatted}
                            </p>

                            {activePlanId === 'free' && (
                              <div className="mt-1.5 flex items-center gap-1 text-[9px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800/50 rounded px-1.5 py-0.5 max-w-max select-none">
                                <span>🔒 {isEn ? 'Locked Reference (Free Plan)' : 'Rujukan Terkunci (Paket Free)'}</span>
                              </div>
                            )}

                            {/* Folder assignment dropdown */}
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-50 dark:border-slate-700/50">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Folder:</span>
                              <select
                                value={folderAssignments[entry.referenceId] || ''}
                                onChange={(e: any) => onAssignFolder(entry.referenceId, e.target.value)}
                                className="border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 outline-none cursor-pointer focus:border-indigo-500 transition max-w-[150px]"
                              >
                                <option value="">{isEn ? 'No Folder' : 'Tanpa Folder'}</option>
                                {folders.map((f: any) => (
                                  <option key={f} value={f}>
                                    📁 {f}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-line dark:border-slate-700 bg-panel dark:bg-slate-800/50 p-4 text-sm leading-6 text-muted dark:text-slate-400">
                      {isEn ? 'Verified bibliography entries will appear here after citations are inserted.' : 'Entri daftar pustaka yang terverifikasi akan muncul di sini setelah sitasi disisipkan.'}
                    </div>
                  )}
                </div>
              </div>
    </>
  );
};
