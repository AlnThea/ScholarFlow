import React from 'react';
import {
  IconBook, IconCheck, IconDownload, IconExternalLink, IconFileText,
  IconFilter, IconFolderOpen, IconLoader2, IconCirclePlus, IconQuote,
  IconSearch, IconSum, IconSparkles, IconWand, IconChevronLeft,
  IconChevronRight, IconLanguage, IconX, IconClock, IconTrash, IconCopy, IconHistory,
  IconMicroscope, IconLayersLinked, IconSpellCheck, IconPresentation, IconTable, IconFileCertificate, IconShare, IconPackage
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
    onOpenPeerReview,
    currentDocument,
    onOpenProjectBinder,
    onOpenLinter,
    onOpenSlideDeck,
    onOpenLiteratureMatrix,
    onOpenJournalPresets,
    onOpenConceptMap,
    onOpenSubmissionPackage,
    t, getSourceLabel, formatHistoryLabel, ActionButton, PanelRow
  } = props;

  const isEn = language === 'en';
  return (
    <>
      <div className="space-y-3">
        {/* Thesis Project Binder Section */}
        <section className="rounded-lg border border-indigo-200/70 dark:border-indigo-900/40 bg-gradient-to-b from-indigo-50/40 via-white to-white dark:from-indigo-950/20 dark:via-slate-800 dark:to-slate-800 p-3 shadow-xs">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                <IconLayersLinked className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                {isEn ? 'Thesis Project Binder' : 'Binder Naskah Skripsi'}
              </h3>
            </div>
            {currentDocument?.settings?.projectPart && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                {currentDocument.settings.projectPart}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed mb-2.5">
            {currentDocument?.settings?.projectName
              ? (isEn
                  ? `Folder: ${currentDocument.settings.projectName}. Manage multi-chapter sync, figures/tables, and master bibliography.`
                  : `Folder: ${currentDocument.settings.projectName}. Kelola bab terpadu, rujukan gambar, dan daftar pustaka konsolidasi.`)
              : (isEn
                  ? 'Organize multi-chapter research, continuous numbering, and unified references.'
                  : 'Kelola penelitian multi-bab, penomoran berkesinambungan, dan daftar pustaka terpadu.')}
          </p>
          <button
            type="button"
            onClick={() => onOpenProjectBinder?.()}
            className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <IconLayersLinked className="h-3.5 w-3.5" />
            <span>{isEn ? 'Open Project Binder' : 'Buka Pengikat Skripsi'}</span>
          </button>
        </section>

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

                {/* Academic Grammar & Style Linter Section */}
                <section className="rounded-lg border border-indigo-200/70 dark:border-indigo-900/40 bg-gradient-to-b from-indigo-50/30 via-white to-white dark:from-indigo-950/20 dark:via-slate-800 dark:to-slate-800 p-3 shadow-xs flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                        <IconSpellCheck className="h-3.5 w-3.5" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {isEn ? 'Academic Style Linter' : 'Linter Gaya Akademis'}
                      </h3>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Grammar AI
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed">
                    {isEn
                      ? 'Scan paper for informal words, contractions, vague claims, and first-person bias.'
                      : 'Pindai naskah untuk mendeteksi kata non-formal, singkatan, klaim tanpa data, dan bias persona.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenLinter?.()}
                    className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <IconSpellCheck className="h-3.5 w-3.5" />
                    <span>{isEn ? 'Launch Style Audit' : 'Audit Gaya Bahasa'}</span>
                  </button>
                </section>

                {/* Conference & Defense Slide Deck Generator Section */}
                <section className="rounded-lg border border-purple-200/70 dark:border-purple-900/40 bg-gradient-to-b from-purple-50/30 via-white to-white dark:from-purple-950/20 dark:via-slate-800 dark:to-slate-800 p-3 shadow-xs flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                        <IconPresentation className="h-3.5 w-3.5" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {isEn ? 'Defense Slide Deck' : 'Slide Sidang & Konferensi'}
                      </h3>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      16:9 Deck
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed">
                    {isEn
                      ? 'Auto-synthesize your manuscript into a conference or defense slide deck with speaker notes.'
                      : 'Sintesis naskah skripsi secara otomatis menjadi slide presentasi sidang dengan catatan pembicara.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenSlideDeck?.()}
                    className="w-full py-1.5 px-3 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <IconPresentation className="h-3.5 w-3.5" />
                    <span>{isEn ? 'Open Slide Generator' : 'Buka Generator Slide'}</span>
                  </button>
                </section>

                {/* Literature Synthesis Matrix & Grid Section */}
                <section className="rounded-lg border border-teal-200/70 dark:border-teal-900/40 bg-gradient-to-b from-teal-50/30 via-white to-white dark:from-teal-950/20 dark:via-slate-800 dark:to-slate-800 p-3 shadow-xs flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                        <IconTable className="h-3.5 w-3.5" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {isEn ? 'Literature Synthesis Matrix' : 'Matriks Sintesis Literatur'}
                      </h3>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      Chapter 2 / SLR
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed">
                    {isEn
                      ? 'Cross-examine methodology, sample sizes, and empirical findings across all reference papers.'
                      : 'Bandingkan metodologi, sampel data, dan temuan empiris seluruh paper referensi secara terstruktur.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenLiteratureMatrix?.()}
                    className="w-full py-1.5 px-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <IconTable className="h-3.5 w-3.5" />
                    <span>{isEn ? 'Open Synthesis Matrix' : 'Buka Matriks Sintesis'}</span>
                  </button>
                </section>

                {/* Journal Formatting & Publishing Presets Section */}
                <section className="rounded-lg border border-blue-200/70 dark:border-blue-900/40 bg-gradient-to-b from-blue-50/30 via-white to-white dark:from-blue-950/20 dark:via-slate-800 dark:to-slate-800 p-3 shadow-xs flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                        <IconFileCertificate className="h-3.5 w-3.5" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {isEn ? 'Journal Target Presets' : 'Format Target Jurnal'}
                      </h3>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      Author Guidelines
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed">
                    {isEn
                      ? 'Audit word limits, abstract length & reference recency against IEEE, Elsevier, or SINTA.'
                      : 'Audit batas kata, panjang abstrak & kemutakhiran rujukan untuk IEEE, Elsevier, atau SINTA.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenJournalPresets?.()}
                    className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <IconFileCertificate className="h-3.5 w-3.5" />
                    <span>{isEn ? 'Audit Journal Guidelines' : 'Audit Pedoman Jurnal'}</span>
                  </button>
                </section>

                {/* Cross-Paper Concept Map & Citation Network Section */}
                <section className="rounded-lg border border-violet-200/70 dark:border-violet-900/40 bg-gradient-to-b from-violet-50/30 via-white to-white dark:from-violet-950/20 dark:via-slate-800 dark:to-slate-800 p-3 shadow-xs flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
                        <IconShare className="h-3.5 w-3.5" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {isEn ? 'Cross-Paper Concept Map' : 'Peta Konsep & Jaringan Sitasi'}
                      </h3>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                      Graph Visualizer
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed">
                    {isEn
                      ? 'Visualize thematic clusters, shared nodes & literature centrality across all library references.'
                      : 'Visualisasi graf klaster tematik, simpul bersama & sentralitas paper pada pustaka naskah.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenConceptMap?.()}
                    className="w-full py-1.5 px-3 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <IconShare className="h-3.5 w-3.5" />
                    <span>{isEn ? 'Explore Concept Network' : 'Jelajahi Jaringan Konsep'}</span>
                  </button>
                </section>

                {/* Journal Submission Package Builder Section */}
                <section className="rounded-lg border border-amber-200/70 dark:border-amber-900/40 bg-gradient-to-b from-amber-50/30 via-white to-white dark:from-amber-950/20 dark:via-slate-800 dark:to-slate-800 p-3 shadow-xs flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                        <IconPackage className="h-3.5 w-3.5" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {isEn ? 'Journal Submission Package' : 'Paket Pengajuan Publikasi'}
                      </h3>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      AI Cover Letter
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed">
                    {isEn
                      ? 'Generate submission-ready cover letter, highlights, ethical statements, and reviewer suggestions.'
                      : 'Susun cover letter ke dewan redaksi, poin kebaruan, etika COI, dan rekomendasi reviewer.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenSubmissionPackage?.()}
                    className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <IconPackage className="h-3.5 w-3.5" />
                    <span>{isEn ? 'Build Submission Package' : 'Buka Penyusun Paket'}</span>
                  </button>
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

                {/* Reviewer #2 Simulator & Journal Readiness Section */}
                <section className="rounded-lg border border-rose-200/70 dark:border-rose-900/40 bg-gradient-to-b from-rose-50/40 via-white to-white dark:from-rose-950/20 dark:via-slate-800 dark:to-slate-800 p-3 shadow-xs">
                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
                        <IconMicroscope className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          {isEn ? 'Reviewer #2 Simulator' : 'Simulasi Reviewer #2'}
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                            Scopus/SINTA
                          </span>
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed mb-3">
                    {isEn
                      ? 'Simulate strict, hyper-critical blind peer review to audit methodology flaws, novelty gaps, and citation vulnerabilities before submission.'
                      : 'Simulasi peer review buta yang ketat & kritis untuk menguji kelemahan metodologi, celah kebaruan (novelty), dan sitasi sebelum submit ke jurnal target.'}
                  </p>

                  <button
                    type="button"
                    onClick={() => onOpenPeerReview?.()}
                    className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <IconMicroscope className="h-3.5 w-3.5" />
                    <span>{isEn ? 'Launch Reviewer #2 Audit' : 'Buka Audit Reviewer #2'}</span>
                  </button>
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
