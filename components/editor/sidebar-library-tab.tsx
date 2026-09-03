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
            {workspaceTab === 'library' ? (
              <div className="space-y-4">
                <div className="relative">
                  <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search collections..."
                    className="h-11 w-full rounded-md border border-line bg-panel pl-9 pr-3 text-sm outline-none transition placeholder:text-muted focus:border-accent/40"
                  />
                </div>

                <div className="space-y-3">
                  {/* AI Literature Review Synthesizer Card */}
                  {bibliographyEntries.length > 0 && (
                    <div className="rounded-lg border border-line bg-gradient-to-br from-indigo-50/20 to-violet-50/20 p-3 shadow-sm flex flex-col gap-2.5 border-l-4 border-l-indigo-500">
                      <div className="flex items-center gap-2">
                        <IconSparkles className="h-4 w-4 text-indigo-600" />
                        <h4 className="text-xs font-bold text-slate-800">Tinjauan Pustaka AI</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Sintesis kontribusi {bibliographyEntries.length} paper rujukan aktif di bawah menjadi satu draf paragraf literatur akademis.
                      </p>

                      <button
                        type="button"
                        onClick={onSynthesizeReview}
                        disabled={isSynthesizing}
                        className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-lg shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {isSynthesizing ? (
                          <>
                            <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Mensintesis...</span>
                          </>
                        ) : (
                          <>
                            <IconSparkles className="h-3.5 w-3.5" />
                            <span>Sintesis Tinjauan Pustaka</span>
                          </>
                        )}
                      </button>

                      {synthesizedText && (
                        <div className="flex flex-col gap-2 p-2.5 bg-slate-50 border border-slate-100 rounded-lg animate-fade-in text-left">
                          <span className="text-[9px] font-bold text-indigo-700 uppercase tracking-wider">Hasil Sintesis:</span>
                          <p className="text-[10px] text-slate-650 leading-relaxed italic font-medium font-sans">
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
                            Sisipkan ke Dokumen
                          </button>
                        </div>
                      )}

                      {synthesizeError && (
                        <div className="p-2 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-[10px] leading-normal text-left">
                          {synthesizeError}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Folder Management controls */}
                  {bibliographyEntries.length > 0 && (
                    <div className="rounded-lg border border-line bg-panel p-2.5 shadow-sm flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Filter Folder</label>
                        <button
                          type="button"
                          onClick={() => setIsAddingFolder(!isAddingFolder)}
                          className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold transition cursor-pointer"
                        >
                          {isAddingFolder ? 'Batal' : '+ Folder'}
                        </button>
                      </div>

                      {isAddingFolder && (
                        <div className="flex gap-1.5 animate-fade-in">
                          <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Nama folder baru..."
                            className="flex-1 px-2 py-1 text-xs border border-line bg-white rounded-md outline-none focus:border-indigo-500 transition"
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
                            Tambah
                          </button>
                        </div>
                      )}

                      <select
                        value={selectedFolderFilter}
                        onChange={(e) => setSelectedFolderFilter(e.target.value)}
                        className="w-full border border-line rounded-lg px-2.5 py-1.5 text-xs text-slate-700 bg-white outline-none focus:border-indigo-500 transition cursor-pointer"
                      >
                        <option value="all">Semua Referensi ({bibliographyEntries.length})</option>
                        {folders.map((f) => {
                          const count = bibliographyEntries.filter(
                            (e) => folderAssignments[e.referenceId] === f
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
                    filteredCollections.map((entry, index) => (
                      <article
                        key={entry.referenceId}
                        className="rounded-lg border border-line bg-white p-3 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <IconFolderOpen className="h-4 w-4 text-accent" />
                              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                                Collection {index + 1}
                              </span>
                            </div>
                            <h3 className="mt-2 text-sm font-semibold leading-6 text-text">
                              {entry.label}
                            </h3>
                            <p className={`mt-1 text-xs leading-5 text-muted select-none ${activePlanId === 'free' ? 'blur-[3px] pointer-events-none' : ''}`}>
                              {entry.formatted}
                            </p>

                            {activePlanId === 'free' && (
                              <div className="mt-1.5 flex items-center gap-1 text-[9px] text-amber-600 font-bold bg-amber-50 border border-amber-100 rounded px-1.5 py-0.5 max-w-max select-none">
                                <span>🔒 Rujukan Terkunci (Paket Free)</span>
                              </div>
                            )}

                            {/* Folder assignment dropdown */}
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-50">
                              <span className="text-[10px] text-slate-500 font-bold">Folder:</span>
                              <select
                                value={folderAssignments[entry.referenceId] || ''}
                                onChange={(e) => onAssignFolder(entry.referenceId, e.target.value)}
                                className="border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-600 bg-white outline-none cursor-pointer focus:border-indigo-500 transition max-w-[150px]"
                              >
                                <option value="">Tanpa Folder</option>
                                {folders.map((f) => (
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
                    <div className="rounded-lg border border-dashed border-line bg-panel p-4 text-sm leading-6 text-muted">
                      Verified bibliography entries will appear here after citations are inserted.
                    </div>
                  )}
                </div>
    </>
  );
};
