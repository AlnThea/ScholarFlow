import React, { useState, useRef } from 'react';
import {
  IconBook, IconCheck, IconDownload, IconExternalLink, IconFileText,
  IconFilter, IconFolderOpen, IconLoader2, IconCirclePlus, IconQuote,
  IconSearch, IconSum, IconSparkles, IconWand, IconChevronLeft,
  IconChevronRight, IconLanguage, IconX, IconClock, IconTrash, IconCopy, IconHistory,
  IconMessages, IconFileImport, IconChevronDown, IconChevronUp, IconTarget
} from '@tabler/icons-react';
import { BurstinessChart } from './burstiness-chart';
import { PaperChatModal } from './modals/paper-chat-modal';
import { ReferenceImportModal } from './modals/reference-import-modal';
import { parseReferenceFile } from '@/lib/editor/reference-importer';
import type { CitationCandidate } from '@/lib/api/citations';


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
    citationLibrary, onInsertCitationText,
    t, getSourceLabel, formatHistoryLabel, ActionButton, PanelRow
  } = props;

  const isEn = language === 'en';

  const [activeChatPaper, setActiveChatPaper] = useState<any>(null);
  const [isPaperChatOpen, setIsPaperChatOpen] = useState(false);
  const [isCopiedSynthesis, setIsCopiedSynthesis] = useState(false);
  const [expandedRefId, setExpandedRefId] = useState<string | null>(null);

  const handleCopySynthesis = () => {
    if (!synthesizedText) return;
    navigator.clipboard.writeText(synthesizedText);
    setIsCopiedSynthesis(true);
    setTimeout(() => setIsCopiedSynthesis(false), 2000);
  };

  const handleScrollToCitation = (referenceId: string, label?: string) => {
    if (typeof window === 'undefined') return;

    // 1. Try finding by data-ref-id in canvas
    const allCites = Array.from(document.querySelectorAll('cite'));
    let target: HTMLElement | null = null;

    for (const cite of allCites) {
      if (cite.getAttribute('data-ref-id') === referenceId) {
        target = cite as HTMLElement;
        break;
      }
    }

    // 2. Fallback: match by citation label e.g. [1] or Author Year
    if (!target && label) {
      const cleanLabel = label.replace(/[\[\]]/g, '').trim().toLowerCase();
      for (const cite of allCites) {
        const text = (cite.textContent || '').replace(/[\[\]]/g, '').trim().toLowerCase();
        if (text === cleanLabel || text.includes(cleanLabel) || cleanLabel.includes(text)) {
          target = cite as HTMLElement;
          break;
        }
      }
    }

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });

      const origTransition = target.style.transition;
      const origBg = target.style.backgroundColor;
      const origOutline = target.style.outline;
      const origBoxShadow = target.style.boxShadow;
      const origBorderRadius = target.style.borderRadius;

      target.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      target.style.backgroundColor = '#fef08a';
      target.style.outline = '2px solid #eab308';
      target.style.boxShadow = '0 0 14px rgba(234, 179, 8, 0.7)';
      target.style.borderRadius = '4px';

      setTimeout(() => {
        if (target) {
          target.style.backgroundColor = origBg;
          target.style.outline = origOutline;
          target.style.boxShadow = origBoxShadow;
          target.style.borderRadius = origBorderRadius;
          target.style.transition = origTransition;
        }
      }, 2500);
    }
  };

  const openPaperChat = (entry: any) => {
    const candidate = citationLibrary?.[entry.referenceId] || {
      reference_id: entry.referenceId,
      title: entry.label,
      authors: [],
      year: null,
      journal: null,
      abstract: null,
      citation_label: entry.label,
    };
    setActiveChatPaper({
      referenceId: candidate.reference_id || entry.referenceId,
      title: candidate.title || entry.label,
      authors: candidate.authors || [],
      year: candidate.year || null,
      journal: candidate.journal || candidate.source || null,
      abstract: candidate.abstract || null,
      doi: candidate.doi || null,
      url: candidate.url || null,
      citationLabel: candidate.citation_label || entry.label,
    });
    setIsPaperChatOpen(true);
  };

  // Phase 28: Reference File Importer
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importCandidates, setImportCandidates] = useState<CitationCandidate[]>([]);
  const [importFileName, setImportFileName] = useState('');
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsProcessingFiles(true);
    try {
      const all: CitationCandidate[] = [];
      for (const file of Array.from(files)) {
        const parsed = await parseReferenceFile(file);
        all.push(...parsed);
      }
      if (all.length > 0) {
        setImportCandidates(all);
        setImportFileName(files.length === 1 ? files[0].name : `${files.length} files`);
        setIsImportModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to parse references:', err);
    } finally {
      setIsProcessingFiles(false);
      e.target.value = '';
    }
  };

  const handleImportSelected = (selected: CitationCandidate[]) => {
    selected.forEach((cand) => {
      onInsertCitationCandidate?.(cand, true);
    });
  };

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

                {/* Import References Action Button */}
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".bib,.bibtex,.ris,.pdf,.txt"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingFiles}
                    className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg shadow-sm transition cursor-pointer flex items-center justify-center gap-2 group"
                    title={
                      isEn
                        ? "Import .bib, .ris, or .pdf files from Mendeley, Zotero, or EndNote into your manuscript library"
                        : "Impor berkas .bib, .ris, atau .pdf dari Mendeley, Zotero, atau EndNote ke perpustakaan referensi naskah Anda"
                    }
                  >
                    <IconFileImport className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                    <span>
                      {isProcessingFiles
                        ? isEn ? 'Reading Files...' : 'Membaca Berkas...'
                        : isEn ? 'Import References (.bib, .ris, .pdf)' : 'Impor Berkas (.bib, .ris, .pdf)'}
                    </span>
                  </button>
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
                          <div className="mt-1 flex items-center gap-1.5 w-full">
                            <button
                              type="button"
                              onClick={handleCopySynthesis}
                              title={isEn ? "Copy to clipboard" : "Salin ke clipboard"}
                              className="flex-1 py-1 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-[10px] font-bold rounded shadow-xs transition cursor-pointer flex items-center justify-center gap-1"
                            >
                              {isCopiedSynthesis ? (
                                <>
                                  <IconCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                  <span>{isEn ? 'Copied' : 'Tersalin'}</span>
                                </>
                              ) : (
                                <>
                                  <IconCopy className="h-3 w-3" />
                                  <span>{isEn ? 'Copy' : 'Salin'}</span>
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => onInsertSynthesizedText(synthesizedText)}
                              title={isEn ? "Insert into document canvas" : "Sisipkan ke kanvas dokumen"}
                              className="flex-1 py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded shadow-xs transition cursor-pointer flex items-center justify-center gap-1"
                            >
                              <IconCheck className="h-3 w-3" />
                              <span>{isEn ? 'Insert to Doc' : 'Sisipkan ke Naskah'}</span>
                            </button>
                          </div>
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
                    <div className="space-y-1.5">
                      {filteredCollections.map((entry: any, index: number) => {
                        const candidate = citationLibrary?.[entry.referenceId];
                        const displayTitle = candidate?.title || entry.label;
                        const isExpanded = expandedRefId === entry.referenceId;
                        const currentFolder = folderAssignments[entry.referenceId];

                        return (
                          <div
                            key={entry.referenceId}
                            className={`group rounded-lg border transition-all text-left ${
                              isExpanded
                                ? 'border-indigo-400/70 dark:border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-xs'
                            }`}
                          >
                            {/* Compact Primary Row (High Density) */}
                            <div className="flex items-center justify-between p-2 gap-2 cursor-pointer select-none">
                              {/* Left: Index badge & Metadata */}
                              <div
                                className="flex items-center gap-2 min-w-0 flex-1"
                                onClick={() => handleScrollToCitation(entry.referenceId, entry.label)}
                                title={isEn ? "Click to locate in manuscript" : "Klik untuk melihat posisi di naskah"}
                              >
                                <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/80 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                                  {index + 1}
                                </span>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                      {entry.label}
                                    </h4>
                                    {currentFolder && (
                                      <span className="shrink-0 text-[9px] font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                        📁 {currentFolder}
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 leading-tight">
                                    {displayTitle}
                                  </p>
                                </div>
                              </div>

                              {/* Right: Quick Action Buttons */}
                              <div className="flex items-center gap-0.5 shrink-0">
                                {/* Jump / Locate in Text Button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleScrollToCitation(entry.referenceId, entry.label);
                                  }}
                                  title={isEn ? "Locate citation in manuscript" : "Tunjukkan posisi sitasi di naskah"}
                                  className="p-1 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 transition cursor-pointer"
                                >
                                  <IconTarget className="w-3.5 h-3.5" />
                                </button>

                                {/* Chat Paper Button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openPaperChat(entry);
                                  }}
                                  title={isEn ? "Chat with this paper" : "Tanya jawab seputar isi paper ini"}
                                  className="p-1 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 transition cursor-pointer"
                                >
                                  <IconMessages className="w-3.5 h-3.5" />
                                </button>

                                {/* Expand / Details Toggle */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedRefId(isExpanded ? null : entry.referenceId);
                                  }}
                                  title={isEn ? "View details & folder settings" : "Lihat detail & pengaturan folder"}
                                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                                >
                                  {isExpanded ? (
                                    <IconChevronUp className="w-3.5 h-3.5" />
                                  ) : (
                                    <IconChevronDown className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Expanded Detail Tray (Clean & Foldable) */}
                            {isExpanded && (
                              <div className="px-2.5 pb-2.5 pt-1 border-t border-slate-100 dark:border-slate-700/60 text-left animate-fade-in space-y-2">
                                <div className="mt-1">
                                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    {isEn ? 'Full Citation' : 'Sitasi Lengkap'}:
                                  </span>
                                  <p className={`mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300 select-none ${activePlanId === 'free' ? 'blur-[3px] pointer-events-none' : ''}`}>
                                    {entry.formatted}
                                  </p>
                                </div>

                                {activePlanId === 'free' && (
                                  <div className="flex items-center gap-1 text-[9px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800/50 rounded px-1.5 py-0.5 max-w-max select-none">
                                    <span>🔒 {isEn ? 'Locked Reference (Free Plan)' : 'Rujukan Terkunci (Paket Free)'}</span>
                                  </div>
                                )}

                                {/* Folder assignment & Action Row */}
                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/40">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                                      {isEn ? 'Folder:' : 'Folder:'}
                                    </span>
                                    <select
                                      value={currentFolder || ''}
                                      onChange={(e: any) => onAssignFolder(entry.referenceId, e.target.value)}
                                      className="border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 outline-none cursor-pointer focus:border-indigo-500 transition max-w-[130px]"
                                    >
                                      <option value="">{isEn ? 'No Folder' : 'Tanpa Folder'}</option>
                                      {folders.map((f: any) => (
                                        <option key={f} value={f}>
                                          📁 {f}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => openPaperChat(entry)}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800 rounded transition cursor-pointer"
                                  >
                                    <IconMessages className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                                    <span>{isEn ? 'Chat Paper' : 'Tanya Paper'}</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-line dark:border-slate-700 bg-panel dark:bg-slate-800/50 p-4 text-sm leading-6 text-muted dark:text-slate-400">
                      {isEn ? 'Verified bibliography entries will appear here after citations are inserted.' : 'Entri daftar pustaka yang terverifikasi akan muncul di sini setelah sitasi disisipkan.'}
                    </div>
                  )}
                </div>
              </div>

      {isPaperChatOpen && activeChatPaper && (
        <PaperChatModal
          isOpen={isPaperChatOpen}
          onClose={() => {
            setIsPaperChatOpen(false);
            setActiveChatPaper(null);
          }}
          paper={activeChatPaper}
          language={isEn ? 'en' : 'id'}
          userId={user?.id}
          userPlan={activePlanId || 'free'}
          selectedAiModel={selectedAiModel}
          onInsertToEditor={onInsertCitationText || onInsertSynthesizedText}
        />
      )}

      {isImportModalOpen && importCandidates.length > 0 && (
        <ReferenceImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          candidates={importCandidates}
          fileName={importFileName}
          language={language}
          onImport={handleImportSelected}
        />
      )}
    </>

  );
};
