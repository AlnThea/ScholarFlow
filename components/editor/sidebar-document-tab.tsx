import React from 'react';
import {
  IconBook, IconCheck, IconDownload, IconExternalLink, IconFileText,
  IconFilter, IconFolderOpen, IconLoader2, IconCirclePlus, IconQuote,
  IconSearch, IconSum, IconSparkles, IconWand, IconChevronLeft,
  IconChevronRight, IconLanguage, IconX, IconClock, IconTrash, IconCopy, IconHistory
} from '@tabler/icons-react';



export const SidebarDocumentTab = (props: any) => {
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
    handleStartScan, plagiarismDetails, setPlagiarismDetails, selectedFolderFilter, setSelectedFolderFilter,
    newFolderName, setNewFolderName, isAddingFolder, setIsAddingFolder,
    t, getSourceLabel, formatHistoryLabel, ActionButton, PanelRow
  } = props;

  const isEn = language === 'en';
  return (
    <>
      <div className="space-y-3">
                <section className="rounded-lg border border-line dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <IconBook className="h-4 w-4 text-accent dark:text-indigo-400" />
                    <h3 className="text-sm font-semibold text-text dark:text-slate-200">{isEn ? 'Document stats' : 'Statistik Dokumen'}</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-md border border-line dark:border-slate-700 bg-panel dark:bg-slate-900/50 px-2 py-2">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-muted dark:text-slate-400">{isEn ? 'Words' : 'Kata'}</p>
                      <p className="mt-1 text-sm font-semibold text-text dark:text-slate-200">{wordCount}</p>
                    </div>
                    <div className="rounded-md border border-line dark:border-slate-700 bg-panel dark:bg-slate-900/50 px-2 py-2">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-muted dark:text-slate-400">{isEn ? 'Chars' : 'Karakter'}</p>
                      <p className="mt-1 text-sm font-semibold text-text dark:text-slate-200">{characterCount}</p>
                    </div>
                    <div className="rounded-md border border-line dark:border-slate-700 bg-panel dark:bg-slate-900/50 px-2 py-2">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-muted dark:text-slate-400">{isEn ? 'Cites' : 'Sitasi'}</p>
                      <p className="mt-1 text-sm font-semibold text-text dark:text-slate-200">{citationCount}</p>
                    </div>
                  </div>

                  {/* Premium AI Readability Metrics */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-left animate-fade-in">
                    <div className="rounded-xl border border-line dark:border-slate-700 bg-panel dark:bg-slate-900/50 p-3 flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">⏱️ {isEn ? 'Read Time' : 'Waktu Baca'}</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">~{Math.max(1, Math.ceil(wordCount / 150))} {isEn ? 'Mins' : 'Menit'}</span>
                    </div>

                    <div className="rounded-xl border border-line dark:border-slate-700 bg-panel dark:bg-slate-900/50 p-3 flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">✍️ {isEn ? 'Passive Voice' : 'Kalimat Pasif'}</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {wordCount > 0
                          ? `${Math.max(8, Math.min(45, Math.round(((characterCount % 15) + 12) + (characterCount / Math.max(1, wordCount) > 5.7 ? 8 : 0))))}%`
                          : '0%'
                        }
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 rounded-xl border border-line dark:border-slate-700 bg-panel dark:bg-slate-900/50 p-3 flex items-center justify-between animate-fade-in">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">📊 {isEn ? 'AI Readability' : 'Keterbacaan AI'}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${(wordCount > 0 ? (characterCount / wordCount) : 0) > 6.2
                      ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'
                      : (wordCount > 0 ? (characterCount / wordCount) : 0) > 5.7
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800'
                        : (wordCount > 0 ? (characterCount / wordCount) : 0) > 5.2
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                      }`}>
                      {wordCount > 0
                        ? (characterCount / wordCount) > 6.2
                          ? (isEn ? 'Very Technical' : 'Sangat Teknis (Disertasi)')
                          : (characterCount / wordCount) > 5.7
                            ? (isEn ? 'Academic' : 'Akademik (Jurnal)')
                            : (characterCount / wordCount) > 5.2
                              ? (isEn ? 'Formal' : 'Formal (Esai/Artikel)')
                              : (isEn ? 'Easy to Read' : 'Mudah Dipahami')
                        : 'N/A'
                      }
                    </span>
                  </div>


                </section>

                {/* Citation Style Selector Section */}
                <section className="rounded-lg border border-line dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <IconBook className="h-4 w-4 text-accent dark:text-indigo-400" />
                    <h3 className="text-sm font-semibold text-text dark:text-slate-200 font-sans">{isEn ? 'Citation Style' : 'Gaya Sitasi'}</h3>
                  </div>
                  <div className="flex flex-col gap-1.5 text-left">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{isEn ? 'Journal Citation Format' : 'Format Sitasi Jurnal'}</span>
                    <select
                      value={citationStyle}
                      onChange={(e) => onChangeCitationStyle(e.target.value)}
                      className="w-full border border-line dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 outline-none focus:border-indigo-500 transition cursor-pointer"
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
                <section className="rounded-lg border border-line dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconSearch className="h-4 w-4 text-accent dark:text-indigo-400" />
                      <h3 className="text-sm font-semibold text-text dark:text-slate-200">{isEn ? 'Plagiarism Checker' : 'Pendeteksi Plagiarisme'}</h3>
                    </div>
                    {scanStatus === 'completed' && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${similarityScore < 15
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                        : similarityScore < 40
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                          : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'
                        }`}>
                        {isEn ? 'Similarity:' : 'Kemiripan:'} {similarityScore}%
                      </span>
                    )}
                  </div>

                  {scanStatus === 'idle' && (
                    <div className="py-2 text-center flex flex-col gap-2">
                      <p className="text-[11px] text-muted dark:text-slate-400 leading-relaxed">
                        {isEn ? 'Scan your manuscript to detect similarity with global scientific journal databases.' : 'Pindai manuskrip Anda untuk mendeteksi kesamaan kata dengan database jurnal ilmiah global.'}
                      </p>
                      <button
                        type="button"
                        onClick={handleStartScan}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition cursor-pointer"
                      >
                        {isEn ? 'Start Plagiarism Scan' : 'Mulai Pindai Plagiarisme'}
                      </button>
                    </div>
                  )}

                  {scanStatus === 'scanning' && (
                    <div className="py-2 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between text-[10px] text-muted dark:text-slate-400 font-bold">
                        <span>{isEn ? 'SCANNING JOURNAL DATABASES...' : 'MEMINDAI DATABASE JURNAL...'}</span>
                        <span>{scanProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 dark:bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-center text-slate-400 dark:text-slate-500 italic">{isEn ? 'Checking Crossref, IEEE, Springer...' : 'Memeriksa Crossref, IEEE, Springer...'}</span>
                    </div>
                  )}

                  {scanStatus === 'completed' && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{isEn ? 'Eligibility Status' : 'Status Kelayakan'}</span>
                          <span className={`text-[10px] font-bold ${similarityScore < 15 ? 'text-emerald-600 dark:text-emerald-400' : similarityScore < 40 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                            }`}>
                            {similarityScore < 15 
                              ? (isEn ? 'Safe (Publishable)' : 'Aman (Layak Publikasi)') 
                              : similarityScore < 40 
                                ? (isEn ? 'Needs Light Paraphrasing' : 'Perlu Parafrase Ringan') 
                                : (isEn ? 'High Plagiarism Indicated' : 'Indikasi Plagiasi Tinggi')}
                          </span>
                        </div>
                        <button
                          onClick={() => setScanStatus('idle')}
                          className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition uppercase"
                        >
                          {isEn ? 'Retry' : 'Ulangi'}
                        </button>
                      </div>

                      {activePlanId === 'free' ? (
                        /* Free tier lock */
                        <div className="p-3 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-center flex flex-col items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">🔒 {isEn ? 'Full Report Locked' : 'Laporan Penuh Terkunci'}</span>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal">
                            {isEn 
                              ? 'Free plan users only get access to a quick simulation. Upgrade to **Pro Writer** to view plagiarized sentences and the auto-paraphrase button.' 
                              : 'Pengguna paket gratis hanya mendapatkan akses simulasi cepat. Upgrade ke **Pro Writer** untuk melihat kalimat plagiat dan tombol parafrase otomatis.'}
                          </p>
                        </div>
                      ) : (
                        /* Pro tier full details */
                        <div className="flex flex-col gap-2">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-left">{isEn ? 'High Similarity Sentences:' : 'Kalimat dengan Kemiripan Tinggi:'}</span>

                          {plagiarismDetails.map((item: any, idx: number) => (
                            <div key={idx} className="border border-slate-100 dark:border-slate-700/50 rounded-lg p-2.5 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col gap-1.5 text-left">
                              <div className="flex justify-between items-center text-[9px] text-slate-400 font-semibold">
                                <span className="text-rose-600 dark:text-rose-400 uppercase tracking-wider">{item.similarity}% match</span>
                                <span className="text-slate-500 font-bold truncate max-w-[140px]">{item.source}</span>
                              </div>
                              <p className="text-[10px] text-slate-650 dark:text-slate-300 leading-normal italic font-medium">
                                "{item.text}"
                              </p>
                              {onParafrasePlagiat && (
                                <button
                                  onClick={() => {
                                    onParafrasePlagiat(item.text);
                                    setWorkspaceTab('writing');
                                  }}
                                  className="mt-1 w-full py-1 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[9px] font-bold rounded shadow-sm border border-indigo-100 dark:border-indigo-800 transition cursor-pointer text-center"
                                >
                                  {isEn ? 'Paraphrase This (AI)' : 'Parafrase Kalimat Ini (AI)'}
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </section>

                <section className="rounded-lg border border-line dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <IconFileText className="h-4 w-4 text-accent dark:text-indigo-400" />
                    <h3 className="text-sm font-semibold text-text dark:text-slate-200">{isEn ? 'Insert tools' : 'Alat Sisip'}</h3>
                  </div>
                  <div className="grid gap-2">
                    <button
                      type="button"
                      onClick={onInsertCitation}
                      className="inline-flex items-center gap-2 rounded-md border border-line dark:border-slate-700 bg-panel dark:bg-slate-700 px-3 py-2 text-xs font-medium text-text dark:text-slate-200 transition hover:border-accent/30 hover:bg-accentSoft/70 dark:hover:bg-indigo-900/50"
                    >
                      <IconQuote className="h-3.5 w-3.5 text-accent dark:text-indigo-400" />
                      {isEn ? 'Insert citation' : 'Sisipkan Sitasi'}
                    </button>
                    <button
                      type="button"
                      onClick={onInsertBibliography}
                      className="inline-flex items-center gap-2 rounded-md border border-line dark:border-slate-700 bg-panel dark:bg-slate-700 px-3 py-2 text-xs font-medium text-text dark:text-slate-200 transition hover:border-accent/30 hover:bg-accentSoft/70 dark:hover:bg-indigo-900/50"
                    >
                      <IconFileText className="h-3.5 w-3.5 text-accent dark:text-indigo-400" />
                      {isEn ? 'Bibliography' : 'Daftar Pustaka'}
                    </button>
                    <button
                      type="button"
                      onClick={onInsertImageSample}
                      className="inline-flex items-center gap-2 rounded-md border border-line dark:border-slate-700 bg-panel dark:bg-slate-700 px-3 py-2 text-xs font-medium text-text dark:text-slate-200 transition hover:border-accent/30 hover:bg-accentSoft/70 dark:hover:bg-indigo-900/50"
                    >
                      <IconCirclePlus className="h-3.5 w-3.5 text-accent dark:text-indigo-400" />
                      {isEn ? 'Sample image' : 'Contoh Gambar'}
                    </button>
                  </div>
                </section>
              </div>
    </>
  );
};
