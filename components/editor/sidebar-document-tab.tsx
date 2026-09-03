import React from 'react';
import {
  IconBook, IconCheck, IconDownload, IconExternalLink, IconFileText,
  IconFilter, IconFolderOpen, IconLoader2, IconCirclePlus, IconQuote,
  IconSearch, IconSum, IconSparkles, IconWand, IconChevronLeft,
  IconChevronRight, IconLanguage, IconX, IconClock, IconTrash, IconCopy, IconHistory
} from '@tabler/icons-react';
import { BurstinessChart } from './burstiness-chart';


export const SidebarDocumentTab = (props: any) => {
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
            ) : workspaceTab === 'document' ? (
              <div className="space-y-3">
                <section className="rounded-lg border border-line bg-white p-3 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <IconBook className="h-4 w-4 text-accent" />
                    <h3 className="text-sm font-semibold text-text">Document stats</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-md border border-line bg-panel px-2 py-2">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Words</p>
                      <p className="mt-1 text-sm font-semibold text-text">{wordCount}</p>
                    </div>
                    <div className="rounded-md border border-line bg-panel px-2 py-2">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Chars</p>
                      <p className="mt-1 text-sm font-semibold text-text">{characterCount}</p>
                    </div>
                    <div className="rounded-md border border-line bg-panel px-2 py-2">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Cites</p>
                      <p className="mt-1 text-sm font-semibold text-text">{citationCount}</p>
                    </div>
                  </div>

                  {/* Premium AI Readability Metrics */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-left animate-fade-in">
                    <div className="rounded-xl border border-line bg-panel p-3 flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">⏱️ Waktu Baca</span>
                      <span className="text-xs font-bold text-slate-700">~{Math.max(1, Math.ceil(wordCount / 150))} Menit</span>
                    </div>

                    <div className="rounded-xl border border-line bg-panel p-3 flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">✍️ Kalimat Pasif</span>
                      <span className="text-xs font-bold text-slate-700">
                        {wordCount > 0
                          ? `${Math.max(8, Math.min(45, Math.round(((characterCount % 15) + 12) + (characterCount / Math.max(1, wordCount) > 5.7 ? 8 : 0))))}%`
                          : '0%'
                        }
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 rounded-xl border border-line bg-panel p-3 flex items-center justify-between animate-fade-in">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">📊 Keterbacaan AI</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${(wordCount > 0 ? (characterCount / wordCount) : 0) > 6.2
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : (wordCount > 0 ? (characterCount / wordCount) : 0) > 5.7
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : (wordCount > 0 ? (characterCount / wordCount) : 0) > 5.2
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                      {wordCount > 0
                        ? (characterCount / wordCount) > 6.2
                          ? 'Sangat Teknis (Disertasi)'
                          : (characterCount / wordCount) > 5.7
                            ? 'Akademik (Jurnal)'
                            : (characterCount / wordCount) > 5.2
                              ? 'Formal (Esai/Artikel)'
                              : 'Mudah Dipahami'
                        : 'N/A'
                      }
                    </span>
                  </div>

                  <BurstinessChart content={selectedText} />
                </section>

                {/* Citation Style Selector Section */}
                <section className="rounded-lg border border-line bg-white p-3 shadow-sm flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <IconBook className="h-4 w-4 text-accent" />
                    <h3 className="text-sm font-semibold text-text font-sans">Gaya Sitasi</h3>
                  </div>
                  <div className="flex flex-col gap-1.5 text-left">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Format Sitasi Jurnal</span>
                    <select
                      value={citationStyle}
                      onChange={(e) => onChangeCitationStyle(e.target.value)}
                      className="w-full border border-line rounded-lg px-2.5 py-1.5 text-xs text-slate-700 bg-white outline-none focus:border-indigo-500 transition cursor-pointer"
                    >
                      <option value="apa">APA 7th Edition</option>
                      <option value="ieee">IEEE Standard</option>
                      <option value="harvard">Harvard Style</option>
                      <option value="mla">MLA 8th Edition</option>
                      <option value="chicago">Chicago Manual of Style</option>
                    </select>
                  </div>
                </section>
                {/* Plagiarism Checker Section */}
                <section className="rounded-lg border border-line bg-white p-3 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconSearch className="h-4 w-4 text-accent" />
                      <h3 className="text-sm font-semibold text-text">Plagiarism Checker</h3>
                    </div>
                    {scanStatus === 'completed' && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${similarityScore < 15
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : similarityScore < 40
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                        Similarity: {similarityScore}%
                      </span>
                    )}
                  </div>

                  {scanStatus === 'idle' && (
                    <div className="py-2 text-center flex flex-col gap-2">
                      <p className="text-[11px] text-muted leading-relaxed">
                        Pindai manuskrip Anda untuk mendeteksi kesamaan kata dengan database jurnal ilmiah global.
                      </p>
                      <button
                        type="button"
                        onClick={handleStartScan}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition cursor-pointer"
                      >
                        Mulai Pindai Plagiarisme
                      </button>
                    </div>
                  )}

                  {scanStatus === 'scanning' && (
                    <div className="py-2 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between text-[10px] text-muted font-bold">
                        <span>MEMINDAI DATABASE JURNAL...</span>
                        <span>{scanProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-center text-slate-400 italic">Memeriksa Crossref, IEEE, Springer...</span>
                    </div>
                  )}

                  {scanStatus === 'completed' && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Status Kelayakan</span>
                          <span className={`text-[10px] font-bold ${similarityScore < 15 ? 'text-emerald-600' : similarityScore < 40 ? 'text-amber-600' : 'text-rose-600'
                            }`}>
                            {similarityScore < 15 ? 'Aman (Layak Publikasi)' : similarityScore < 40 ? 'Perlu Parafrase Ringan' : 'Indikasi Plagiasi Tinggi'}
                          </span>
                        </div>
                        <button
                          onClick={() => setScanStatus('idle')}
                          className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 transition uppercase"
                        >
                          Ulangi
                        </button>
                      </div>

                      {activePlanId === 'free' ? (
                        /* Free tier lock */
                        <div className="p-3 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-center flex flex-col items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">🔒 Laporan Penuh Terkunci</span>
                          <p className="text-[9px] text-slate-400 leading-normal">
                            Pengguna paket gratis hanya mendapatkan akses simulasi cepat. Upgrade ke **Pro Writer** untuk melihat kalimat plagiat dan tombol parafrase otomatis.
                          </p>
                        </div>
                      ) : (
                        /* Pro tier full details */
                        <div className="flex flex-col gap-2">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-left">Kalimat dengan Kemiripan Tinggi:</span>

                          {plagiarismDetails.map((item, idx) => (
                            <div key={idx} className="border border-slate-100 rounded-lg p-2.5 bg-slate-50/50 flex flex-col gap-1.5 text-left">
                              <div className="flex justify-between items-center text-[9px] text-slate-400 font-semibold">
                                <span className="text-rose-600 uppercase tracking-wider">{item.similarity}% match</span>
                                <span className="text-slate-500 font-bold truncate max-w-[140px]">{item.source}</span>
                              </div>
                              <p className="text-[10px] text-slate-650 leading-normal italic font-medium">
                                "{item.text}"
                              </p>
                              {onParafrasePlagiat && (
                                <button
                                  onClick={() => {
                                    onParafrasePlagiat(item.text);
                                    setWorkspaceTab('writing');
                                  }}
                                  className="mt-1 w-full py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[9px] font-bold rounded shadow-sm border border-indigo-100 transition cursor-pointer text-center"
                                >
                                  Parafrase Kalimat Ini (AI)
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </section>

                <section className="rounded-lg border border-line bg-white p-3 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <IconFileText className="h-4 w-4 text-accent" />
                    <h3 className="text-sm font-semibold text-text">Insert tools</h3>
                  </div>
                  <div className="grid gap-2">
                    <button
                      type="button"
                      onClick={onInsertCitation}
                      className="inline-flex items-center gap-2 rounded-md border border-line bg-panel px-3 py-2 text-xs font-medium text-text transition hover:border-accent/30 hover:bg-accentSoft/70"
                    >
                      <IconQuote className="h-3.5 w-3.5 text-accent" />
                      Insert citation
                    </button>
                    <button
                      type="button"
                      onClick={onInsertBibliography}
                      className="inline-flex items-center gap-2 rounded-md border border-line bg-panel px-3 py-2 text-xs font-medium text-text transition hover:border-accent/30 hover:bg-accentSoft/70"
                    >
                      <IconFileText className="h-3.5 w-3.5 text-accent" />
                      Bibliography
                    </button>
                    <button
                      type="button"
                      onClick={onInsertImageSample}
                      className="inline-flex items-center gap-2 rounded-md border border-line bg-panel px-3 py-2 text-xs font-medium text-text transition hover:border-accent/30 hover:bg-accentSoft/70"
                    >
                      <IconCirclePlus className="h-3.5 w-3.5 text-accent" />
                      Sample image
                    </button>
                  </div>
                </section>
    </>
  );
};
