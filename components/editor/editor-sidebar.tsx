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
  IconHistory, IconChartBar, IconCalculator,
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
import { SidebarBurstinessTab } from './sidebar-burstiness-tab';
import { SidebarStatsTab } from './sidebar-stats-tab';
import { AiHistoryModal } from './modals/ai-history-modal';

type SidebarProps = {
  activePlanId?: string | null;
  setIsPlanModalOpen?: (open: boolean) => void;
  currentDocument?: any;
  editorJsRef?: any;
  onContentChange?: (content: any) => void;
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
  aiModels?: any[];
  aiProviders?: any[];
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
  activeTab?: 'library' | 'writing' | 'document' | 'comments' | 'burstiness' | 'stats';
  setActiveTab?: (tab: 'library' | 'writing' | 'document' | 'comments' | 'burstiness' | 'stats') => void;
  tokensUsed?: number;
  monthlyQuota?: number;
  isTokenQuotaModalOpen?: boolean;
  onOpenTokenQuotaModal?: () => void;
  onCloseTokenQuotaModal?: () => void;
  citationLibrary?: Record<string, CitationCandidate>;
  onInsertCitationText?: (text: string, referenceId?: string, label?: string) => void;
  onOpenPeerReview?: () => void;
  onOpenProjectBinder?: () => void;
  onOpenLinter?: () => void;
  onOpenSlideDeck?: () => void;
  onOpenLiteratureMatrix?: () => void;
  onOpenJournalPresets?: () => void;
  onOpenConceptMap?: () => void;
  onOpenSubmissionPackage?: () => void;
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
      className="w-full rounded-md border border-line dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-left transition hover:border-accent/30 hover:bg-accentSoft/60 dark:hover:bg-slate-700/60 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-md bg-accentSoft dark:bg-indigo-950/60 text-accent dark:text-indigo-400">
          <Icon className={`h-4 w-4 ${Icon === IconLoader2 ? 'animate-spin' : ''}`} />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-text dark:text-slate-200">{label}</span>
          <span className="mt-1 block text-xs leading-5 text-muted dark:text-slate-400">{description}</span>
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

export function EditorSidebar(props: SidebarProps) {
  const {
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
  activeTab, setActiveTab
} = props;
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [workspaceTab, setWorkspaceTab] = useState<'library' | 'writing' | 'document' | 'comments' | 'burstiness' | 'stats'>('burstiness');
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
  const isAdmin = profile?.role === 'admin';

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
      <aside className={`relative h-full flex flex-row border-l border-slate-100 bg-transparent overflow-hidden transition-all duration-300 ${isExpanded ? 'w-[480px]' : 'w-12'} shrink-0 z-20`}>
        {/* Main Content Area */}
        <div className={`flex min-h-0 flex-col transition-all duration-300 overflow-hidden bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 ${isExpanded ? 'flex-1 opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}>
          <div className="border-b border-slate-100 dark:border-slate-800 px-4 py-4 flex items-center justify-between min-h-[65px] bg-slate-50/50 dark:bg-slate-900/80">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-tight">
                {workspaceTab === 'burstiness' 
                  ? (language === 'en' ? 'AI Rhythm & Burstiness' : 'Ritme & Burstiness AI') 
                  : workspaceTab === 'library' 
                  ? (language === 'en' ? 'Citations & Library' : 'Sitasi & Perpustakaan') 
                  : workspaceTab === 'writing' 
                  ? (language === 'en' ? 'AI Writing Assistant' : 'Asisten Penulisan AI') 
                  : workspaceTab === 'document' 
                  ? (language === 'en' ? 'Document Stats & Scan' : 'Statistik & Pemindaian Dokumen') 
                  : workspaceTab === 'stats' 
                  ? (language === 'en' ? 'SPSS & Stats Interpreter' : 'Interpretasi Data SPSS / PSPP') 
                  : (language === 'en' ? 'Review Comments' : 'Komentar & Catatan Review')}
              </span>
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-100/80 dark:border-indigo-800/60">
              {workspaceTab === 'burstiness' ? 'Engine' : workspaceTab === 'stats' ? 'Phase 11' : 'Workspace'}
            </span>
          </div>

          {workspaceTab === 'burstiness' ? (
            <div className="flex-1 overflow-y-auto p-4 thin-scroll">
              <SidebarBurstinessTab {...props} language={language} />
            </div>
          ) : workspaceTab === 'library' ? (
            <div className="flex-1 overflow-y-auto p-4 thin-scroll">
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
                language={language} activePlanId={activePlanId} user={user} t={t} getSourceLabel={getSourceLabel} formatHistoryLabel={formatHistoryLabel}
                ActionButton={ActionButton} PanelRow={PanelRow} />
            </div>
          ) : workspaceTab === 'writing' ? (
            <div className="flex-1 overflow-y-auto p-4 thin-scroll">
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
                language={language} activePlanId={activePlanId} user={user} t={t} getSourceLabel={getSourceLabel} formatHistoryLabel={formatHistoryLabel}
                ActionButton={ActionButton} PanelRow={PanelRow} />
            </div>
          ) : workspaceTab === 'document' ? (
            <div className="flex-1 overflow-y-auto p-4 thin-scroll">
              <SidebarDocumentTab {...props} handleStartScan={handleStartScan}
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
                language={language} activePlanId={activePlanId} user={user} t={t} getSourceLabel={getSourceLabel} formatHistoryLabel={formatHistoryLabel}
                ActionButton={ActionButton} PanelRow={PanelRow} />
            </div>
          ) : workspaceTab === 'comments' ? (
            <div className="flex-1 overflow-y-auto p-4 thin-scroll">
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
                language={language} activePlanId={activePlanId} user={user} t={t} getSourceLabel={getSourceLabel} formatHistoryLabel={formatHistoryLabel}
                ActionButton={ActionButton} PanelRow={PanelRow} />
            </div>
          ) : workspaceTab === 'stats' ? (
            <div className="flex-1 overflow-y-auto p-4 thin-scroll">
              <SidebarStatsTab
                {...props}
                language={language}
                activePlanId={activePlanId}
                editorJsRef={props.editorJsRef}
                onContentChange={props.onContentChange}
                setIsPlanModalOpen={props.setIsPlanModalOpen}
              />
            </div>
          ) : null}
        </div>

        {/* Vertical Tabs Bar on the Right */}
        <div className="w-12 shrink-0 flex flex-col items-center py-4 border-l border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/90 gap-3 overflow-hidden">
          {/* Toggle Button */}
          <button
            type="button"
            onClick={toggleExpanded}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition shadow-xs"
            aria-label={isExpanded ? (language === 'en' ? 'Collapse sidebar' : 'Tutup panel') : (language === 'en' ? 'Expand sidebar' : 'Buka panel')}
            title={isExpanded ? (language === 'en' ? 'Collapse Panel' : 'Tutup Panel') : (language === 'en' ? 'Expand Panel' : 'Buka Panel')}
          >
            {isExpanded ? <IconChevronRight className="h-4 w-4" /> : <IconChevronLeft className="h-4 w-4" />}
          </button>

          {/* Vertical Tabs */}
          <div className="flex flex-col gap-1.5 w-full px-1.5 flex-1 items-center">
            {[
              { 
                id: 'burstiness', 
                label: language === 'en' ? 'AI Rhythm' : 'Ritme AI', 
                tooltip: language === 'en' ? 'AI Rhythm & Burstiness' : 'Analisis Ritme & Humanizer AI',
                icon: <IconChartBar className="h-4 w-4" /> 
              },
              { 
                id: 'writing', 
                label: language === 'en' ? 'AI Writer' : 'Penulis AI', 
                tooltip: language === 'en' ? 'AI Writing Assistant & Paraphraser' : 'Asisten Penulisan & Parafrase AI',
                icon: <IconWand className="h-4 w-4" /> 
              },
              { 
                id: 'library', 
                label: language === 'en' ? 'Citations' : 'Sitasi', 
                tooltip: language === 'en' ? 'Citation Search & Library' : 'Pencarian Sitasi & Referensi',
                icon: <IconBook className="h-4 w-4" /> 
              },
              { 
                id: 'stats', 
                label: language === 'en' ? 'SPSS / Stats' : 'Data SPSS', 
                tooltip: language === 'en' ? 'SPSS & Stats Output Interpreter (Phase 11)' : 'Interpretasi Output SPSS / PSPP (Phase 11)',
                icon: <IconCalculator className="h-4 w-4" /> 
              },
              { 
                id: 'document', 
                label: language === 'en' ? 'Doc Stats' : 'Statistik', 
                tooltip: language === 'en' ? 'Document Statistics & Plagiarism Scan' : 'Statistik Dokumen & Cek Plagiasi',
                icon: <IconFileText className="h-4 w-4" /> 
              },
              ...(comments ? [{ 
                id: 'comments', 
                label: language === 'en' ? 'Notes' : 'Catatan', 
                tooltip: language === 'en' ? 'Review Comments & Suggestions' : 'Catatan Review & Kolaborasi',
                icon: <IconQuote className="h-4 w-4" /> 
              }] : [])
            ].map((item) => {
              const isActive = workspaceTab === item.id && isExpanded;
              return (
                <button
                  key={item.id}
                  data-tour={`sidebar-tab-${item.id}`}
                  type="button"
                  onClick={() => {
                    setWorkspaceTab(item.id as typeof workspaceTab); 
                    if(setActiveTab) setActiveTab(item.id as typeof workspaceTab);
                    if (!isExpanded) toggleExpanded(); // Auto-expand when a tab is clicked
                  }}
                  className={`w-full py-2.5 flex flex-col items-center justify-center gap-1 rounded-lg transition-all duration-200 relative group cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                      : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                  title={item.tooltip}
                >
                  {item.icon}

                  {/* Accessible Hover Tooltip Floating Preview */}
                  <span className="pointer-events-none absolute right-full mr-2.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-900 dark:bg-slate-800 dark:border dark:border-slate-700 rounded-md whitespace-nowrap shadow-lg z-50 animate-fade-in">
                    {item.tooltip}
                    <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900 dark:border-l-slate-800" />
                  </span>

                  {isActive && (
                    <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-indigo-500 rounded-r-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* AI History Modal popup */}
      <AiHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        aiHistory={aiHistory}
        onDeleteAiHistoryEntry={onDeleteAiHistoryEntry}
        onClearAiHistory={onClearAiHistory}
        onApplyText={onInsertSynthesizedText}
        isAdmin={isAdmin}
        language={language}
      />
    </>
  );
}
