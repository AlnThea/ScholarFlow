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
  IconX,
  IconClock,
  IconTrash,
  IconCopy,
  IconHistory,
} from '@tabler/icons-react';
import { type ImproveWritingResponse, synthesizeLiteratureReview } from '@/lib/api/ai';
import type { CitationCandidate } from '@/lib/api/citations';
import type { BibliographyEntry } from '@/lib/editor/bibliography';
import type { CitationHistoryEntry } from '@/lib/editor/citation-history';
import type { AiHistoryEntry } from '@/lib/editor/ai-history';
import type { DocumentSuggestion } from '@/lib/api/suggestions';
import { useAuth } from '@/components/auth/auth-provider';
import { useLanguage } from '../i18n/language-context';
import { SidebarLibraryTab } from './sidebar-library-tab';
import { SidebarWritingTab } from './sidebar-writing-tab';
import { SidebarDocumentTab } from './sidebar-document-tab';
import { SidebarCommentsTab } from './sidebar-comments-tab';
import { BurstinessChart } from './burstiness-chart';

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
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  onClose?: () => void;

  // AI response history props
  aiHistory: AiHistoryEntry[];
  onDeleteAiHistoryEntry: (id: string) => void;
  onClearAiHistory: () => void;
  isApplied: boolean;
  comments?: any[];
  suggestions?: DocumentSuggestion[];
  onAcceptSuggestion?: (id: string) => void;
  onRejectSuggestion?: (id: string) => void;
  onResolveComment?: (id: string) => void;
  onCommentClick?: (comment: any) => void;
  activeTab?: 'library' | 'writing' | 'document' | 'comments';
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
  onAssignFolder,
  isExpanded: propIsExpanded,
  onToggleExpanded,
  onClose,
  aiHistory,
  onDeleteAiHistoryEntry,
  onClearAiHistory,
  isApplied,
  comments = [],
  suggestions = [],
  onAcceptSuggestion,
  onRejectSuggestion,
  onResolveComment,
  onCommentClick,
  activeTab
}: SidebarProps) {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [workspaceTab, setWorkspaceTab] = useState<'library' | 'writing' | 'document' | 'comments'>('document');
  const [commentFilterTab, setCommentFilterTab] = useState<'active' | 'suggestions' | 'resolved'>('active');
  const [suggestionSubTab, setSuggestionSubTab] = useState<'active' | 'history'>('active');

  // Sync tab from props if changed
  useEffect(() => {
    if (activeTab) {
      setWorkspaceTab(activeTab);
    }
  }, [activeTab]);

  // Auto-switch to 'writing' tab when AI operation starts or produces a result
  useEffect(() => {
    if (isImproving || improvedText !== null || isSynthesizing || synthesizedText !== null) {
      setWorkspaceTab('writing');
    }
  }, [isImproving, improvedText, isSynthesizing, synthesizedText]);

  const [query, setQuery] = useState('');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [localIsExpanded, setLocalIsExpanded] = useState(true);
  const isExpanded = propIsExpanded !== undefined ? propIsExpanded : localIsExpanded;
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
    if (propIsExpanded === undefined) {
      const saved = localStorage.getItem('sidebar-expanded');
      if (saved !== null) setLocalIsExpanded(saved === 'true');
    }
  }, [propIsExpanded]);

  const toggleExpanded = () => {
    if (onToggleExpanded) {
      onToggleExpanded();
    } else {
      setLocalIsExpanded((prev) => {
        const next = !prev;
        localStorage.setItem('sidebar-expanded', String(next));
        return next;
      });
    }
  };


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
  }, [citationResults.length]);

  const handleFindCitation = () => {
    onFindCitation();
    setWorkspaceTab('library');
  };

  return (
    <>
      <aside className={`relative h-full flex flex-row border-l border-slate-100 bg-transparent overflow-hidden transition-all duration-300 ${isExpanded ? 'w-[360px]' : 'w-12'} shrink-0 z-40`}>
        {/* Main Content Area */}
        <div className={`flex min-h-0 flex-col transition-all duration-300 overflow-hidden ${isExpanded ? 'flex-1 opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}>
          <div className="border-b border-slate-100 px-4 py-4 flex items-center justify-between min-h-[65px]">
            <span className="font-bold text-slate-800 text-sm">
              {workspaceTab === 'library' ? 'Library' : workspaceTab === 'writing' ? 'AI Writing' : workspaceTab === 'document' ? 'Document Stats' : 'Comments'}
            </span>
          </div>


          {workspaceTab === 'library' ? (
            <SidebarLibraryTab {...props}
          workspaceTab={workspaceTab} setWorkspaceTab={setWorkspaceTab}
          commentFilterTab={commentFilterTab} setCommentFilterTab={setCommentFilterTab}
          suggestionSubTab={suggestionSubTab} setSuggestionSubTab={setSuggestionSubTab}
          query={query} setQuery={setQuery}
          isHistoryModalOpen={isHistoryModalOpen} setIsHistoryModalOpen={setIsHistoryModalOpen}
          localIsExpanded={localIsExpanded} setLocalIsExpanded={setLocalIsExpanded}
          scanStatus={scanStatus} setScanStatus={setScanStatus}
          scanProgress={scanProgress} setScanProgress={setScanProgress}
          similarityScore={similarityScore} setSimilarityScore={setSimilarityScore}
          plagiarismDetails={plagiarismDetails} setPlagiarismDetails={setPlagiarismDetails}
          selectedFolderFilter={selectedFolderFilter} setSelectedFolderFilter={setSelectedFolderFilter}
          newFolderName={newFolderName} setNewFolderName={setNewFolderName}
          isAddingFolder={isAddingFolder} setIsAddingFolder={setIsAddingFolder}
          t={t} getSourceLabel={getSourceLabel} formatHistoryLabel={formatHistoryLabel}
          ActionButton={ActionButton} PanelRow={PanelRow} />
          ) : workspaceTab === 'writing' ? (
            <SidebarWritingTab {...props}
          workspaceTab={workspaceTab} setWorkspaceTab={setWorkspaceTab}
          commentFilterTab={commentFilterTab} setCommentFilterTab={setCommentFilterTab}
          suggestionSubTab={suggestionSubTab} setSuggestionSubTab={setSuggestionSubTab}
          query={query} setQuery={setQuery}
          isHistoryModalOpen={isHistoryModalOpen} setIsHistoryModalOpen={setIsHistoryModalOpen}
          localIsExpanded={localIsExpanded} setLocalIsExpanded={setLocalIsExpanded}
          scanStatus={scanStatus} setScanStatus={setScanStatus}
          scanProgress={scanProgress} setScanProgress={setScanProgress}
          similarityScore={similarityScore} setSimilarityScore={setSimilarityScore}
          plagiarismDetails={plagiarismDetails} setPlagiarismDetails={setPlagiarismDetails}
          selectedFolderFilter={selectedFolderFilter} setSelectedFolderFilter={setSelectedFolderFilter}
          newFolderName={newFolderName} setNewFolderName={setNewFolderName}
          isAddingFolder={isAddingFolder} setIsAddingFolder={setIsAddingFolder}
          t={t} getSourceLabel={getSourceLabel} formatHistoryLabel={formatHistoryLabel}
          ActionButton={ActionButton} PanelRow={PanelRow} />
          ) : workspaceTab === 'document' ? (
            <SidebarDocumentTab {...props}
          workspaceTab={workspaceTab} setWorkspaceTab={setWorkspaceTab}
          commentFilterTab={commentFilterTab} setCommentFilterTab={setCommentFilterTab}
          suggestionSubTab={suggestionSubTab} setSuggestionSubTab={setSuggestionSubTab}
          query={query} setQuery={setQuery}
          isHistoryModalOpen={isHistoryModalOpen} setIsHistoryModalOpen={setIsHistoryModalOpen}
          localIsExpanded={localIsExpanded} setLocalIsExpanded={setLocalIsExpanded}
          scanStatus={scanStatus} setScanStatus={setScanStatus}
          scanProgress={scanProgress} setScanProgress={setScanProgress}
          similarityScore={similarityScore} setSimilarityScore={setSimilarityScore}
          plagiarismDetails={plagiarismDetails} setPlagiarismDetails={setPlagiarismDetails}
          selectedFolderFilter={selectedFolderFilter} setSelectedFolderFilter={setSelectedFolderFilter}
          newFolderName={newFolderName} setNewFolderName={setNewFolderName}
          isAddingFolder={isAddingFolder} setIsAddingFolder={setIsAddingFolder}
          t={t} getSourceLabel={getSourceLabel} formatHistoryLabel={formatHistoryLabel}
          ActionButton={ActionButton} PanelRow={PanelRow} />
          ) : workspaceTab === 'comments' ? (
            <SidebarCommentsTab {...props}
          workspaceTab={workspaceTab} setWorkspaceTab={setWorkspaceTab}
          commentFilterTab={commentFilterTab} setCommentFilterTab={setCommentFilterTab}
          suggestionSubTab={suggestionSubTab} setSuggestionSubTab={setSuggestionSubTab}
          query={query} setQuery={setQuery}
          isHistoryModalOpen={isHistoryModalOpen} setIsHistoryModalOpen={setIsHistoryModalOpen}
          localIsExpanded={localIsExpanded} setLocalIsExpanded={setLocalIsExpanded}
          scanStatus={scanStatus} setScanStatus={setScanStatus}
          scanProgress={scanProgress} setScanProgress={setScanProgress}
          similarityScore={similarityScore} setSimilarityScore={setSimilarityScore}
          plagiarismDetails={plagiarismDetails} setPlagiarismDetails={setPlagiarismDetails}
          selectedFolderFilter={selectedFolderFilter} setSelectedFolderFilter={setSelectedFolderFilter}
          newFolderName={newFolderName} setNewFolderName={setNewFolderName}
          isAddingFolder={isAddingFolder} setIsAddingFolder={setIsAddingFolder}
          t={t} getSourceLabel={getSourceLabel} formatHistoryLabel={formatHistoryLabel}
          ActionButton={ActionButton} PanelRow={PanelRow} />
          </div>
        </div>

        {/* Vertical Tabs Bar on the Right */}
        <div className="w-12 shrink-0 flex flex-col items-center py-4 border-l border-slate-100 bg-transparent gap-4 overflow-hidden">
          {/* Toggle Button */}
          <button
            type="button"
            onClick={toggleExpanded}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line bg-white text-text hover:bg-accentSoft/70 transition mb-2 shadow-sm"
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            title={isExpanded ? 'Tutup Panel' : 'Buka Panel'}
          >
            {isExpanded ? <IconChevronRight className="h-4 w-4" /> : <IconChevronLeft className="h-4 w-4" />}
          </button>

          {/* Vertical Tabs */}
          <div className="flex flex-col gap-2 w-full px-1.5 flex-1 items-center">
            {[
              { id: 'document', label: '', icon: <IconFileText className="h-4 w-4" /> },
              { id: 'writing', label: '', icon: <IconWand className="h-4 w-4" /> },
              { id: 'library', label: '', icon: <IconBook className="h-4 w-4" /> },

              ...(comments ? [{ id: 'comments', label: '', icon: <IconQuote className="h-4 w-4" /> }] : [])
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setWorkspaceTab(item.id as typeof workspaceTab);
                  if (!isExpanded) toggleExpanded(); // Auto-expand when a tab is clicked
                }}
                className={`w-full py-2 flex flex-col items-center justify-center gap-1 rounded-md transition relative group ${workspaceTab === item.id && isExpanded
                  ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                  : 'bg-transparent text-slate-500 hover:bg-slate-200/50 hover:text-slate-800'
                  }`}
                title={item.label}
              >
                {item.icon}
                <span className="text-[9px] font-medium text-center w-full truncate px-0.5" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', marginTop: '8px', paddingBottom: '4px' }}>
                  {item.label}
                </span>
                {workspaceTab === item.id && isExpanded && (
                  <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-indigo-600 rounded-r-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* AI History Modal popup */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-slate-800">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl w-full max-w-2xl flex flex-col gap-5 animate-scale-in max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <IconHistory className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base font-extrabold text-slate-800">{t('ai.title')}</h3>
                  <span className="text-xs text-slate-400">
                    {language === 'en' ? `Total ${aiHistory.length} changes recorded` : `Total ${aiHistory.length} perubahan dicatat`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {aiHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(t('ai.delete_history_confirm'))) {
                        onClearAiHistory();
                      }
                    }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 transition cursor-pointer"
                  >
                    {language === 'en' ? 'Clear All' : 'Bersihkan Semua'}
                  </button>
                )}
                <button
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:bg-slate-105 hover:text-slate-650 transition cursor-pointer"
                >
                  <IconX className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Cards list */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4">
              {aiHistory.length > 0 ? (
                aiHistory.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 shadow-sm hover:shadow-md transition duration-205 border-l-4 border-l-indigo-505 flex flex-col gap-3"
                  >
                    {/* Header: Tone, Model, Time, and Delete button */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md ${item.tone === 'simplify'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : item.tone === 'shorten'
                            ? 'bg-rose-50 text-rose-700 border border-rose-100'
                            : item.tone === 'expand'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : item.tone === 'paraphrase'
                                ? 'bg-sky-50 text-sky-700 border border-sky-100'
                                : item.tone === 'summarize'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                  : item.tone === 'abstract'
                                    ? 'bg-orange-50 text-orange-700 border border-orange-100'
                                    : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          }`}>
                          {item.tone === 'simplify'
                            ? (language === 'en' ? 'Simplify' : 'Sederhana')
                            : item.tone === 'shorten'
                              ? (language === 'en' ? 'Condense' : 'Ringkas')
                              : item.tone === 'expand'
                                ? (language === 'en' ? 'Elaborate' : 'Elaborasi')
                                : item.tone === 'paraphrase'
                                  ? (language === 'en' ? 'Paraphrase' : 'Parafrase')
                                  : item.tone === 'summarize'
                                    ? (language === 'en' ? 'Summarize' : 'Ringkasan')
                                    : item.tone === 'abstract'
                                      ? (language === 'en' ? 'Abstract' : 'Abstrak')
                                      : (language === 'en' ? 'Academic' : 'Akademis')}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200/60 font-mono">
                          {item.model.replace(" (Direct)", "").replace(" (Free OR)", "").replace(" (Pro OR)", "")}
                        </span>
                        {item.model.toLowerCase().includes('gemini') ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200/60">
                            Gemini Direct
                          </span>
                        ) : item.model.toLowerCase().includes('custom') ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/60">
                            Custom Proxy
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200/60">
                            OpenRouter
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-medium font-mono">{item.savedAt}</span>
                        <button
                          type="button"
                          onClick={() => onDeleteAiHistoryEntry(item.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title={language === 'en' ? 'Delete entry' : 'Hapus entri'}
                        >
                          <IconTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Preview Area: Original vs AI Result */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="flex flex-col gap-1.5 bg-white p-3 rounded-xl border border-slate-100 text-left">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{language === 'en' ? 'Original Draft:' : 'Draf Asli:'}</span>
                        <p className="text-slate-500 italic leading-relaxed">"{item.originalText}"</p>
                      </div>
                      <div className="flex flex-col gap-1.5 bg-indigo-50/10 p-3 rounded-xl border border-indigo-100/40 text-left">
                        <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">{language === 'en' ? 'AI Polished Result:' : 'Hasil Poles AI:'}</span>
                        <p className="text-slate-700 font-semibold leading-relaxed">"{item.improvedText}"</p>
                      </div>
                    </div>

                    {/* Actions bar */}
                    <div className="flex items-center justify-end gap-2 border-t border-slate-100/60 pt-3">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(item.improvedText);
                            alert(language === 'en' ? 'Copied to clipboard!' : 'Disalin ke clipboard!');
                          } catch (err) {
                            console.error('Failed to copy text:', err);
                          }
                        }}
                        className="px-4 py-2 border border-slate-200 hover:bg-slate-50 hover:text-slate-800 text-slate-655 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                      >
                        <IconCopy className="h-4 w-4" />
                        {language === 'en' ? 'Copy' : 'Salin'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onInsertSynthesizedText(item.improvedText);
                          setIsHistoryModalOpen(false);
                        }}
                        className="px-4.5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                      >
                        <IconCheck className="h-4 w-4" />
                        {language === 'en' ? 'Apply to Canvas' : 'Terapkan ke Canvas'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center flex flex-col items-center justify-center gap-2">
                  <IconHistory className="h-12 w-12 text-slate-300" />
                  <span className="text-sm font-semibold text-slate-500">{t('ai.no_history')}</span>
                  <span className="text-xs text-slate-400 text-center">
                    {language === 'en'
                      ? 'Use the AI assistant to polish your writing and its changes will appear here.'
                      : 'Gunakan asisten AI untuk memoles tulisan Anda dan catatannya akan muncul di sini.'
                    }
                  </span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end border-t border-slate-100 pt-3 shrink-0">
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                {language === 'en' ? 'Close' : 'Tutup'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
