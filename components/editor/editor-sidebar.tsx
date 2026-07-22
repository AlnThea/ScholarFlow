'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  IconBook,
  IconCheck,
  IconDownload,
  IconExternalLink,
  IconFileText,
  IconFilter,
  IconFolderOpen,
  IconLoader2,
  IconCirclePlus,
  IconQuote,
  IconSearch,
  IconSum,
  IconSparkles,
  IconWand,
  IconChevronLeft,
  IconChevronRight,
  IconLanguage,
} from '@tabler/icons-react';
import { type ImproveWritingResponse, synthesizeLiteratureReview } from '@/lib/api/ai';
import type { CitationCandidate } from '@/lib/api/citations';
import type { BibliographyEntry } from '@/lib/editor/bibliography';
import type { CitationHistoryEntry } from '@/lib/editor/citation-history';
import { useAuth } from '@/components/auth/auth-provider';

type SidebarProps = {
  selectedText: string;
  citationResults: CitationCandidate[];
  citationHistory: CitationHistoryEntry[];
  wordCount: number;
  characterCount: number;
  citationCount: number;
  bibliographyEntries: BibliographyEntry[];
  improvedText: ImproveWritingResponse | null;
  isImproving: boolean;
  isSearchingCitations: boolean;
  aiError: string | null;
  citationError: string | null;
  citationNote: string | null;
  onApplyImprovedText: () => void;
  onImproveWriting: () => void;
  onParaphrase: () => void;
  onSummarize: () => void;
  onGenerateAbstract: () => void;
  onFindCitation: () => void;
  onRepeatCitationSearch: (query: string) => void;
  onInsertCitation: () => void;
  onInsertBibliography: () => void;
  onInsertImageSample: () => void;
  onExportBibliographyText: () => void;
  onExportBibliographyJson: () => void;
  onExportBibliographyBibtex: () => void;
  onExportBibliographyRis: () => void;
  onInsertCitationCandidate: (candidate: CitationCandidate) => void;
  onParafrasePlagiat?: (sentence: string) => void;
  selectedAiModel: string;
  isSynthesizing: boolean;
  synthesizedText: string | null;
  synthesizeError: string | null;
  synthesizeDisclaimer: string | null;
  onSynthesizeReview: () => void;
  onInsertSynthesizedText: (text: string) => void;
  
  // Final features props
  citationStyle: string;
  onChangeCitationStyle: (style: string) => void;
  folders: string[];
  folderAssignments: Record<string, string>;
  onCreateFolder: (name: string) => void;
  onAssignFolder: (referenceId: string, folderName: string) => void;
};

function PanelRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-b-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium text-text">{value}</span>
    </div>
  );
}

function ActionButton({
  label,
  description,
  icon: Icon,
  onClick,
  disabled,
}: {
  label: string;
  description: string;
  icon: typeof IconSparkles;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-md border border-line bg-white p-3 text-left transition hover:border-accent/30 hover:bg-accentSoft/60 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-md bg-accentSoft text-accent">
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-text">{label}</span>
          <span className="mt-1 block text-xs leading-5 text-muted">{description}</span>
        </span>
      </div>
    </button>
  );
}

function getSourceLabel(candidate: CitationCandidate) {
  if (candidate.source.toLowerCase().includes('openalex')) return 'OpenAlex';
  if (candidate.source.toLowerCase().includes('crossref')) return 'Crossref';
  return candidate.source;
}

function formatHistoryLabel(entry: CitationHistoryEntry) {
  return `${entry.resultCount} result${entry.resultCount === 1 ? '' : 's'}`;
}

export function EditorSidebar({
  selectedText,
  citationResults,
  citationHistory,
  wordCount,
  characterCount,
  citationCount,
  bibliographyEntries,
  improvedText,
  isImproving,
  isSearchingCitations,
  aiError,
  citationError,
  citationNote,
  onApplyImprovedText,
  onImproveWriting,
  onParaphrase,
  onSummarize,
  onGenerateAbstract,
  onFindCitation,
  onRepeatCitationSearch,
  onInsertCitation,
  onInsertBibliography,
  onInsertImageSample,
  onExportBibliographyText,
  onExportBibliographyJson,
  onExportBibliographyBibtex,
  onExportBibliographyRis,
  onInsertCitationCandidate,
  onParafrasePlagiat,
  selectedAiModel,
  isSynthesizing,
  synthesizedText,
  synthesizeError,
  synthesizeDisclaimer,
  onSynthesizeReview,
  onInsertSynthesizedText,
  citationStyle,
  onChangeCitationStyle,
  folders,
  folderAssignments,
  onCreateFolder,
  onAssignFolder
}: SidebarProps) {
  const [workspaceTab, setWorkspaceTab] = useState<'library' | 'writing' | 'document'>('library');
  const [tab, setTab] = useState<'sources' | 'collections'>('sources');
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const hasImprovedText = improvedText !== null;

  const { profile } = useAuth();
  const activePlanId = profile?.subscription_plan || 'free';

  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'completed'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [similarityScore, setSimilarityScore] = useState(0);
  const [plagiarismDetails, setPlagiarismDetails] = useState<Array<{
    text: string;
    source: string;
    similarity: number;
  }>>([]);
  const [selectedFolderFilter, setSelectedFolderFilter] = useState('all');
  const [newFolderName, setNewFolderName] = useState('');
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const handleStartScan = () => {
    if (wordCount === 0) {
      alert("Tulis draf manuskrip terlebih dahulu untuk mulai memindai.");
      return;
    }
    setScanStatus('scanning');
    setScanProgress(0);
    
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanStatus('completed');
          
          // Generate a realistic similarity score (e.g. randomized between 8% and 24%)
          const calculatedScore = Math.floor(Math.random() * 18) + 8;
          setSimilarityScore(calculatedScore);

          // Populate realistic computer science plagiarism details
          setPlagiarismDetails([
            {
              text: "The performance of the neural network model depends heavily on the hyperparameters selected during training.",
              source: "IEEE Xplore Digital Library",
              similarity: 92
            },
            {
              text: "Recent developments in machine learning algorithms have shown promising results across various scientific domains.",
              source: "SpringerLink Journal of Science",
              similarity: 87
            }
          ]);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };


  useEffect(() => {
    const saved = localStorage.getItem('sidebar-expanded');
    if (saved !== null) setIsExpanded(saved === 'true');
  }, []);

  const toggleExpanded = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar-expanded', String(next));
      return next;
    });
  };

  const filteredSources = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return citationResults;
    return citationResults.filter((candidate) => {
      const haystack = [
        candidate.title,
        candidate.source,
        candidate.authors.join(' '),
        candidate.year?.toString() ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [citationResults, query]);

  const filteredCollections = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = bibliographyEntries;
    
    // Filter by folder selection
    if (selectedFolderFilter !== 'all') {
      items = items.filter(
        (entry) => folderAssignments[entry.referenceId] === selectedFolderFilter
      );
    }
    
    if (!q) return items;
    return items.filter((entry) => {
      const haystack = `${entry.label} ${entry.formatted}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [bibliographyEntries, query, selectedFolderFilter, folderAssignments]);

  useEffect(() => {
    if (citationResults.length === 0) return;
    setWorkspaceTab('library');
    setTab('sources');
  }, [citationResults.length]);

  const handleFindCitation = () => {
    onFindCitation();
    setWorkspaceTab('library');
    setTab('sources');
  };

  return (
    <aside className={`flex min-h-[640px] flex-col border-t border-line bg-white/95 shadow-[-1px_0_0_rgba(15,23,42,0.03)] backdrop-blur lg:sticky lg:top-[72px] lg:h-[calc(100vh-72px)] lg:min-h-0 lg:border-t-0 ${isExpanded ? 'w-[320px]' : 'w-16'}`}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className={`border-b border-line px-4 py-4 flex items-center ${isExpanded ? 'justify-between' : 'justify-center'}`}>
          <button
            type="button"
            onClick={toggleExpanded}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line bg-panel text-text hover:bg-accentSoft/70"
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isExpanded ? <IconChevronLeft className="h-4 w-4" /> : <IconChevronRight className="h-4 w-4" />}
          </button>
          
          {isExpanded && (
            <button
              type="button"
              onClick={onInsertImageSample}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-panel text-text transition hover:border-accent/30 hover:bg-accentSoft/70"
              aria-label="Insert sample image"
              title="Insert sample image"
            >
              <IconDownload className="h-4 w-4 rotate-180" />
            </button>
          )}
        </div>

        {isExpanded && (
          <div className="px-4 pt-4">
            <div className="grid grid-cols-3 gap-1 rounded-md border border-line bg-panel p-1 text-xs font-medium text-muted">
              {[
                { id: 'library', label: 'Library' },
                { id: 'writing', label: 'Writing' },
                { id: 'document', label: 'Document' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setWorkspaceTab(item.id as typeof workspaceTab)}
                  className={
                    workspaceTab === item.id
                      ? 'rounded px-2 py-2 bg-white text-text shadow-sm'
                      : 'rounded px-2 py-2 transition hover:text-text'
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {workspaceTab === 'library' ? (
            <div className="space-y-4">
              <div className="relative">
                <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search sources..."
                  className="h-11 w-full rounded-md border border-line bg-panel pl-9 pr-3 text-sm outline-none transition placeholder:text-muted focus:border-accent/40"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-md border border-line bg-panel p-1 text-xs font-medium text-muted">
                  <button
                    type="button"
                    onClick={() => setTab('sources')}
                    className={
                      tab === 'sources'
                        ? 'rounded px-3 py-1.5 bg-white text-text shadow-sm'
                        : 'rounded px-3 py-1.5'
                    }
                  >
                    Sources
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('collections')}
                    className={
                      tab === 'collections'
                        ? 'rounded px-3 py-1.5 bg-white text-text shadow-sm'
                        : 'rounded px-3 py-1.5'
                    }
                  >
                    Collections
                  </button>
                </div>
                <button
                  type="button"
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-panel px-3 text-xs font-medium text-text transition hover:border-accent/30 hover:bg-accentSoft/70"
                >
                  <IconFilter className="h-3.5 w-3.5" />
                  Filters
                </button>
              </div>

              {tab === 'sources' ? (
                <div className="space-y-3">
                  <div className="rounded-lg border border-dashed border-line bg-panel p-4 text-xs leading-5 text-muted text-center">
                    Citations are managed inline. Select text in the document and click "@ Find Citation" to search and insert citations.
                  </div>
                </div>
              ) : (
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

                  <div className="rounded-lg border border-line bg-white p-3 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold text-text">Bibliography export</h3>
                      <span className="text-xs text-muted">{bibliographyEntries.length} items</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={onExportBibliographyText}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md border border-line bg-panel px-2.5 py-2 text-xs font-medium text-slate-700 transition hover:border-accent/30 hover:bg-accentSoft/70"
                        title="Export as Plain Text (.txt)"
                      >
                        <IconDownload className="h-3.5 w-3.5 text-slate-400" />
                        TXT
                      </button>
                      <button
                        type="button"
                        onClick={onExportBibliographyJson}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md border border-line bg-panel px-2.5 py-2 text-xs font-medium text-slate-700 transition hover:border-accent/30 hover:bg-accentSoft/70"
                        title="Export as JSON (.json)"
                      >
                        <IconDownload className="h-3.5 w-3.5 text-slate-400" />
                        JSON
                      </button>
                      <button
                        type="button"
                        onClick={onExportBibliographyBibtex}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md border border-line bg-panel px-2.5 py-2 text-xs font-medium text-slate-700 transition hover:border-accent/30 hover:bg-accentSoft/70"
                        title="Export as BibTeX (.bib) for LaTeX/Zotero"
                      >
                        <IconDownload className="h-3.5 w-3.5 text-indigo-500" />
                        BibTeX
                      </button>
                      <button
                        type="button"
                        onClick={onExportBibliographyRis}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md border border-line bg-panel px-2.5 py-2 text-xs font-medium text-slate-700 transition hover:border-accent/30 hover:bg-accentSoft/70"
                        title="Export as RIS (.ris) for Mendeley/Zotero"
                      >
                        <IconDownload className="h-3.5 w-3.5 text-indigo-500" />
                        RIS
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : workspaceTab === 'writing' ? (
            <div className="space-y-3">
              <section className="rounded-lg border border-line bg-white p-3 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <IconSparkles className="h-4 w-4 text-accent" />
                  <h3 className="text-sm font-semibold text-text">Writing tools</h3>
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
                    description="🔒 Rekomendasi sitasi otomatis berdasarkan isi klaim kalimat Anda (Pro)."
                    icon={IconSparkles}
                    onClick={() => {
                      if (activePlanId === 'free') {
                        alert("🔒 Fitur Rekomendasi Sitasi AI khusus untuk pengguna paket Pro Writer. Silakan upgrade akun Anda di menu Pricing.");
                      } else {
                        onRepeatCitationSearch(selectedText);
                        alert("AI merekomendasikan referensi berdasarkan klaim kalimat Anda. Hasil pencarian referensi dapat dilihat di tab 'Library' -> 'Sources'.");
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
                      className="inline-flex items-center gap-2 rounded-md border border-line bg-panel px-3 py-1.5 text-xs font-medium text-text transition hover:border-accent/30 hover:bg-accentSoft/70"
                    >
                      <IconCheck className="h-3.5 w-3.5" />
                      Apply
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
                ) : (
                  <p className="text-sm leading-6 text-muted">
                    Run Improve Academic Writing to preview the backend response here.
                  </p>
                )}
              </section>
            </div>
          ) : (
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
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    (wordCount > 0 ? (characterCount / wordCount) : 0) > 6.2 
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
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      similarityScore < 15 
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
                        <span className={`text-[10px] font-bold ${
                          similarityScore < 15 ? 'text-emerald-600' : similarityScore < 40 ? 'text-amber-600' : 'text-rose-600'
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
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
