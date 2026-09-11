// c:/web/ScholarFlow/components/editor/editor-layout.tsx
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { EditorJsEditor, type EditorJsMethods } from './editorjs-editor';
import { EditorSidebar } from './editor-sidebar';
import { Switch } from './editor-switch';
import { KatexPreview } from './katex-preview';
import { EditorHeader } from './editor-header';
import { DashboardView } from './dashboard-view';
import { MathHelperPanel } from './math-helper-panel';
import { EditorBubbleMenu } from './editor-bubble-menu';
import { EditorJsToolbar } from './editorjs-toolbar';
import { ImageModal } from './modals/image-modal';
import { MathModal } from './modals/math-modal';
import { LinkModal } from './modals/link-modal';
import { HighlightPopover } from './modals/highlight-popover';
import { SuggestionModal } from './modals/suggestion-modal';
import { AlertModal } from './modals/alert-modal';
import { ProviderModal } from './modals/provider-modal';
import { ModelModal } from './modals/model-modal';
import { PlanModal } from './modals/plan-modal';
import { ExportUpgradeModal } from './modals/export-upgrade-modal';
import { addSuggestion } from '@/lib/api/suggestions';
import 'katex/dist/katex.min.css';
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconDots,
  IconCreditCard,
  IconMenu,
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconCode,
  IconSuperscript,
  IconSubscript,
  IconLink,
  IconHighlight,
  IconPhoto,
  IconTable,
  IconMath,
  IconSum,
  IconAt,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconAlignJustified,
  IconSearch,
  IconSparkles,
  IconCheck,
  IconExternalLink,
  IconQuote,
  IconHeart,
  IconFile,
  IconFilePlus,
  IconBook,
  IconLoader,
  IconLanguage,
  IconDeviceFloppy,
  IconShare,
  IconFileWord,
  IconLayoutSidebarRightCollapse,
  IconCalculator,
  IconFolder,
  IconFolderOpen,
  IconChevronDown,
  IconDownload,
  IconFileText,
  IconBraces,
  IconDatabase,
  IconSun,
  IconMoon,
  IconX,
  IconSettings,
  IconBell,
  IconWifi,
  IconRefresh,
  IconWifiOff
} from '@tabler/icons-react';
import { useDataService } from '@/lib/services';

import { MinimalSidebar } from './minimal-sidebar';
import { useLanguage } from '../i18n/language-context';
import type { ImproveWritingResponse } from '@/lib/api/ai';
import type { CitationCandidate } from '@/lib/api/citations';
import type { CitationHistoryEntry } from '@/lib/editor/citation-history';
import type { AiHistoryEntry } from '@/lib/editor/ai-history';
import type { BibliographyEntry } from '@/lib/editor/bibliography';
import type { DocumentListItem, DocumentEntry } from '@/lib/api/documents';
import dynamic from 'next/dynamic';

const PricingModal = dynamic(() => import('./pricing-modal').then((mod) => mod.PricingModal), { ssr: false });
const ShareDocumentModal = dynamic(() => import('./share-document-modal').then((mod) => mod.ShareDocumentModal), { ssr: false });
const BackendSettingsModal = dynamic(() => import('./backend-settings-modal').then((mod) => mod.BackendSettingsModal), { ssr: false });
const HelpModal = dynamic(() => import('./help-modal').then((mod) => mod.HelpModal), { ssr: false });
import { exportToWordFile, exportToPdfFile } from '@/lib/editor/citation-export-word';


import { useAuth } from '@/components/auth/auth-provider';
import { fetchPricingPlans, updatePricingPlan, createPricingPlan, deletePricingPlan, type PricingPlan } from '@/lib/api/pricing';
import { fetchPaymentGateways, updatePaymentGatewayStatus, type PaymentGateway } from '@/lib/api/payment-gateways';
import { type AIModel, type AIProvider, createAIModel, deleteAIModel, DEFAULT_PROVIDERS, createAIProvider, updateAIProvider, deleteAIProvider } from '@/lib/api/ai-models';
import { createNotification, type DocumentNotification } from '@/lib/api/comments';
import { type UserPresence } from '@/lib/api/presence';


type EditorLayoutProps = {
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
  onInsertCitationCandidate: (candidate: CitationCandidate, skipEditorInsert?: boolean) => void;
  statusLabel: string;
  onSelectionChange?: (text: string) => void;
  onStatsChange?: (stats: { wordCount: number; characterCount: number; citationCount: number }) => void;
  editorJsRef: React.RefObject<EditorJsMethods | null>;
  onCiteClick?: (refId: string, label: string, citedSentence: string) => void;
  activePdfUrl: string | null;
  activePdfSearchTerm: string;
  onClosePdf: () => void;

  // Document system props
  documents: DocumentListItem[];
  currentDocument: DocumentEntry | null;
  onSelectDocument: (id: string) => void;
  onCreateDocument: () => void;
  onDeleteDocument: (id: string) => void;
  onRenameDocument: (title: string) => void;
  onContentChange?: (content: any) => void;
  selectedAiModel: string;
  setSelectedAiModel: (model: string) => void;
  selectedAiTone: string;
  setSelectedAiTone: (tone: string) => void;
  aiModels: AIModel[];
  onUpdateAIModel: (id: string, updates: Partial<AIModel>) => Promise<void>;
  onCreateAIModel: (model: Omit<AIModel, 'updated_at'>) => Promise<void>;
  onDeleteAIModel: (id: string) => Promise<void>;
  aiProviders?: AIProvider[];
  onUpdateAIProvider?: (id: string, updates: Partial<AIProvider>) => Promise<void>;
  onCreateAIProvider?: (provider: Omit<AIProvider, 'updated_at'>) => Promise<void>;
  onDeleteAIProvider?: (id: string) => Promise<void>;
  onParafrasePlagiat?: (sentence: string) => void;
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

  // AI response history props
  aiHistory: AiHistoryEntry[];
  onDeleteAiHistoryEntry: (id: string) => void;
  onClearAiHistory: () => void;
  isApplied: boolean;
  onOpenSettings?: () => void;
  onSaveSettings?: (settings: any) => void;
  onAlignmentChange?: (align: string) => void;
  notifications?: DocumentNotification[];
  onMarkNotificationRead?: (id: string) => void;
  onMarkAllNotificationsRead?: () => void;
  onNotificationClick?: (notif: DocumentNotification) => void;
  comments?: any[];
  suggestions?: any[];
  activeUsers?: UserPresence[];
  onAcceptSuggestion?: (id: string) => void;
  onRejectSuggestion?: (id: string) => void;
  onResolveComment?: (id: string) => void;
  onCommentClick?: (comment: any) => void;
  activeSidebarTab?: 'library' | 'writing' | 'document' | 'comments';
};

function findMostRelevantSentence(abstract: string | null | undefined, query: string): string {
  if (!abstract) return "Abstrak tidak tersedia.";
  const sentences = abstract.split(/(?<=[.!?])\s+/);
  if (sentences.length <= 1) return abstract;
  const queryWords = new Set(query.toLowerCase().match(/[a-z0-9]+/g) ?? []);
  if (queryWords.size === 0) return sentences[0];
  let bestSentence = sentences[0];
  let maxOverlap = -1;
  for (const sentence of sentences) {
    const sentenceWords = new Set(sentence.toLowerCase().match(/[a-z0-9]+/g) ?? []);
    let overlap = 0;
    for (const word of sentenceWords) {
      if (queryWords.has(word)) overlap++;
    }
    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      bestSentence = sentence;
    }
  }
  return bestSentence;
}



import { useAdminModals } from '@/hooks/use-admin-modals';
import { useEditorModals } from '@/hooks/use-editor-modals';
export function EditorLayout({
  statusLabel,
  selectedText,
  wordCount,
  characterCount,
  citationCount,
  citationResults,
  citationHistory,
  bibliographyEntries,
  improvedText,
  isImproving,
  isSearchingCitations,
  aiError,
  citationError,
  citationNote,
  onApplyImprovedText,
  onInsertBibliography,
  onInsertImageSample,
  onExportBibliographyText,
  onExportBibliographyJson,
  onExportBibliographyBibtex,
  onExportBibliographyRis,
  onInsertCitationCandidate,
  onRepeatCitationSearch,
  onInsertCitation,
  onFindCitation,
  onImproveWriting,
  onParaphrase,
  onSummarize,
  onGenerateAbstract,
  onSelectionChange,
  onStatsChange,
  editorJsRef,
  onCiteClick,
  activePdfUrl,
  activePdfSearchTerm,
  onClosePdf,
  documents,
  currentDocument,
  onSelectDocument,
  onCreateDocument,
  onDeleteDocument,
  onRenameDocument,
  onContentChange,
  selectedAiModel,
  setSelectedAiModel,
  selectedAiTone,
  setSelectedAiTone,
  aiModels,
  onUpdateAIModel,
  onCreateAIModel,
  onDeleteAIModel,
  aiProviders = DEFAULT_PROVIDERS,
  onUpdateAIProvider,
  onCreateAIProvider,
  onDeleteAIProvider,
  onParafrasePlagiat,
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
  aiHistory,
  onDeleteAiHistoryEntry,
  onClearAiHistory,
  isApplied,
  onOpenSettings,
  onSaveSettings,
  onAlignmentChange,
  notifications = [],
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onNotificationClick,
  comments = [],
  suggestions = [],
  activeUsers = [],
  onAcceptSuggestion,
  onRejectSuggestion,
  onResolveComment,
  onCommentClick,
  activeSidebarTab
}: EditorLayoutProps) {
  const { language, setLanguage, t } = useLanguage();
  const isEn = language === 'en';
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(!currentDocument);
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [currentBlockType, setCurrentBlockType] = useState('paragraph');
  const [currentAlignment, setCurrentAlignment] = useState('left');
  const [editorMode, setEditorMode] = useState<'edit' | 'suggest'>('edit');
  const [selectedTextForSuggestion, setSelectedTextForSuggestion] = useState('');
  const [newTextForSuggestion, setNewTextForSuggestion] = useState('');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { backendType } = useDataService();
  const [isMathHelperOpen, setIsMathHelperOpen] = useState(false);



  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Theme loading
    const localTheme = window.localStorage.getItem('sf-theme');
    if (localTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    // Trigger pricing modal from locked bibliography banner click
    const handleTriggerPricing = () => {
      setIsPricingOpen(true);
    };
    window.addEventListener('sf-trigger-pricing', handleTriggerPricing);
    return () => {
      window.removeEventListener('sf-trigger-pricing', handleTriggerPricing);
    };
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      window.localStorage.setItem('sf-theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      window.localStorage.setItem('sf-theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const groupedDocs = React.useMemo(() => {
    const projects: Record<string, { id: string; name: string; type: string; docs: DocumentListItem[] }> = {};
    const independent: DocumentListItem[] = [];

    documents.forEach((doc) => {
      const settings = doc.settings;
      if (settings?.projectId && settings?.projectName) {
        const pId = settings.projectId;
        if (!projects[pId]) {
          projects[pId] = {
            id: pId,
            name: settings.projectName,
            type: settings.projectType || 'independent',
            docs: []
          };
        }
        projects[pId].docs.push(doc);
      } else {
        independent.push(doc);
      }
    });

    return {
      projects: Object.values(projects),
      independent
    };
  }, [documents]);

  const { profile, user } = useAuth();
  const role = profile?.role ?? 'user';
  const activePlanId = profile?.subscription_plan || 'free';
  const pathname = usePathname();
  const router = useRouter();

  const activeDashboardTab = useMemo(() => {
    if (pathname === '/billing') return 'billing';
    if (pathname === '/admin/pricing') return 'admin-pricing';
    if (pathname === '/admin/models') return 'admin-models';
    if (pathname === '/admin/gateways') return 'admin-gateways';
    return 'user';
  }, [pathname]);

  const handleSetDashboardTab = (tab: 'user' | 'admin' | 'billing' | 'admin-pricing' | 'admin-models' | 'admin-gateways') => {
    if (tab === 'billing') {
      router.push('/billing');
    } else if (tab === 'admin' || tab === 'admin-pricing') {
      router.push('/admin/pricing');
    } else if (tab === 'admin-models') {
      router.push('/admin/models');
    } else if (tab === 'admin-gateways') {
      router.push('/admin/gateways');
    } else {
      router.push('/dashboard');
    }
  };
  const adminModals = useAdminModals({
    activeDashboardTab,
    aiModels,
    onUpdateAIModel,
    onCreateAIModel,
    onDeleteAIModel,
    aiProviders,
    onUpdateAIProvider,
    onCreateAIProvider,
    onDeleteAIProvider
  });

  const {
    adminPlans, setAdminPlans,
    loadingAdminPlans,
    gatewaysList,
    togglingGatewayId,
    alertModalState, showAlertModal, showConfirmModal,
    savingModelId, editModelStates,
    isModelModalOpen, setIsModelModalOpen,
    selectedModelForModal, modalModelState,
    handleOpenEditModelModal, handleOpenCreateModelModal,
    testingModelId, handleTestModelConnection,
    handleSaveModalModel, handleDeleteModel, handleToggleModelStatus,
    isProviderModalOpen, setIsProviderModalOpen,
    selectedProviderForModal, modalProviderState,
    handleOpenCreateProviderModal, handleOpenEditProviderModal,
    handleSaveModalProvider, handleDeleteProvider,
    handleToggleGateway, handleSavePlan,
    isPlanModalOpen, setIsPlanModalOpen,
    selectedPlanForModal, modalPlanState,
    handleOpenEditModal, handleOpenCreateModal,
    handleSaveModalPlan, handleDeletePlan,
    editStates, setEditStates, savingPlanId
  } = adminModals;

    const IconFilePdf = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4" />
      <path d="M5 18h1.5a1.5 1.5 0 0 0 0 -3h-1.5v6" />
      <path d="M17 18h-3v-3h3" />
      <path d="M14 18h3" />
      <path d="M10 15v6h1a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2h-1z" />
    </svg>
  );

  const editorModals = useEditorModals({ editorJsRef });

  const {
    isImageModalOpen, setIsImageModalOpen,
    imageUrlInput, setImageUrlInput,
    handleInsertImageConfirm,
    isMathModalOpen, setIsMathModalOpen,
    mathFormulaInput, setMathFormulaInput,
    editingMathCallback, setEditingMathCallback,
    handleInsertMathConfirm,
    isLinkModalOpen, setIsLinkModalOpen,
    linkUrlInput, setLinkUrlInput,
    insertLinkCallback, setInsertLinkCallback,
    handleInsertLinkConfirm, handleUnlinkConfirm,
    showHighlightPopover, setShowHighlightPopover,
    highlightPopoverRect, setHighlightPopoverRect,
    highlightTriggerSource, setHighlightTriggerSource,
    handleHighlightButtonClick, handleApplyHighlight,
    isExportUpgradeModalOpen, setIsExportUpgradeModalOpen,
    isSuggestionModalOpen, setIsSuggestionModalOpen,
    isShareOpen, setIsShareOpen,
    isBackendModalOpen, setIsBackendModalOpen
  } = editorModals;

  // States to manage the custom text selection bubble menu
  const [bubbleMenuRect, setBubbleMenuRect] = useState<DOMRect | null>(null);
  const [showBubbleMenu, setShowBubbleMenu] = useState(false);
  // 'format' = default mode, 'citation' = showing citation results inline
  const [bubbleMode, setBubbleMode] = useState<'format' | 'citation'>('format');
  const bubbleModeRef = useRef(bubbleMode);
  useEffect(() => {
    bubbleModeRef.current = bubbleMode;
  }, [bubbleMode]);

  // Active state for inline formatting commands (e.g. bold, italic)
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    code: false,
    superscript: false,
    subscript: false,
    link: false,
    highlight: false,
  });
  const [currentFontSize, setCurrentFontSize] = useState<string>('');

  const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rightSaved = localStorage.getItem('right-sidebar-expanded');
      if (rightSaved !== null) {
        setIsRightSidebarExpanded(rightSaved === 'true');
      }
    }
  }, []);

  const handleToggleRightSidebarExpanded = () => {
    setIsRightSidebarExpanded(prev => {
      const next = !prev;
      localStorage.setItem('right-sidebar-expanded', String(next));
      return next;
    });
  };

  const [bubbleSearchQuery, setBubbleSearchQuery] = useState('');

  // Auto-collapse sidebar (Zen Mode) when entering a document
  useEffect(() => {
    if (currentDocument) {
      setIsSidebarExpanded(false);
    } else {
      setIsSidebarExpanded(true); // Auto-expand in dashboard
    }
  }, [currentDocument?.id]);

  useEffect(() => {
    if (bubbleMode === 'citation') {
      setBubbleSearchQuery(selectedText);
    }
  }, [bubbleMode, selectedText]);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-expanded');
    if (saved !== null && !currentDocument) {
      setIsSidebarExpanded(saved === 'true');
    }

    // Selection change handler to sync toolbar states and show bubble menu
    const handleSelectionChange = () => {
      let hasLink = false;
      let hasHighlight = false;
      let hasCode = false;
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const editorContainer = document.getElementById('editorjs-holder');

        // 1. Check anchorNode parent
        let anchorParent = selection.anchorNode
          ? (selection.anchorNode.nodeType === Node.TEXT_NODE
            ? selection.anchorNode.parentElement
            : selection.anchorNode as HTMLElement)
          : null;
        let node = anchorParent;
        while (node && editorContainer && editorContainer.contains(node)) {
          if (node.tagName === 'A') {
            hasLink = true;
          }
          if (node.tagName === 'MARK') {
            hasHighlight = true;
          }
          if (node.tagName === 'CODE') {
            hasCode = true;
          }
          if (hasLink && hasHighlight && hasCode) break;
          node = node.parentElement;
        }

        // 2. Check focusNode parent if anchorNode didn't find all
        if (!hasLink || !hasHighlight || !hasCode) {
          let focusParent = selection.focusNode
            ? (selection.focusNode.nodeType === Node.TEXT_NODE
              ? selection.focusNode.parentElement
              : selection.focusNode as HTMLElement)
            : null;
          node = focusParent;
          while (node && editorContainer && editorContainer.contains(node)) {
            if (node.tagName === 'A') {
              hasLink = true;
            }
            if (node.tagName === 'MARK') {
              hasHighlight = true;
            }
            if (node.tagName === 'CODE') {
              hasCode = true;
            }
            if (hasLink && hasHighlight && hasCode) break;
            node = node.parentElement;
          }
        }

        // 3. Check if selection range spans across/encloses tags
        if (!hasLink || !hasHighlight || !hasCode) {
          try {
            const range = selection.getRangeAt(0);
            const fragment = range.cloneContents();
            const tempDiv = document.createElement('div');
            tempDiv.appendChild(fragment);
            if (!hasLink && tempDiv.querySelector('a')) {
              hasLink = true;
            }
            if (!hasHighlight && tempDiv.querySelector('mark')) {
              hasHighlight = true;
            }
            if (!hasCode && tempDiv.querySelector('code')) {
              hasCode = true;
            }
          } catch (e) {
            // ignore range extraction issues
          }
        }
      }

      // 1. Sync format active states
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikethrough: document.queryCommandState('strikeThrough'),
        code: hasCode,
        superscript: document.queryCommandState('superscript'),
        subscript: document.queryCommandState('subscript'),
        link: hasLink,
        highlight: hasHighlight,
      });

      // 2. Display custom bubble menu if text selection is active inside EditorJS

      // Sync active font size state
      if (selection && selection.anchorNode) {
        const parentEl = selection.anchorNode.nodeType === Node.ELEMENT_NODE
          ? (selection.anchorNode as HTMLElement)
          : selection.anchorNode.parentElement;
        if (parentEl) {
          let currentEl: HTMLElement | null = parentEl;
          let foundSize = '';
          const editorContainer = document.getElementById('editorjs-holder');
          while (currentEl && editorContainer && editorContainer.contains(currentEl)) {
            if (currentEl.style.fontSize) {
              foundSize = currentEl.style.fontSize;
              break;
            }
            currentEl = currentEl.parentElement;
          }
          setCurrentFontSize(foundSize);
        }
      } else {
        setCurrentFontSize('');
      }

      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        if (bubbleModeRef.current === 'citation') return;
        setShowBubbleMenu(false);
        onSelectionChange?.('');
        return;
      }

      const anchorNode = selection.anchorNode;
      if (!anchorNode) return;
      const editorContainer = document.getElementById('editorjs-holder');
      if (!editorContainer || !editorContainer.contains(anchorNode)) {
        if (bubbleModeRef.current === 'citation') return;
        setShowBubbleMenu(false);
        onSelectionChange?.('');
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const text = selection.toString().trim();
      setBubbleMenuRect(rect);
      onSelectionChange?.(text);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [onSelectionChange]);

  const toggleSidebar = () => {
    setIsSidebarExpanded(prev => {
      const next = !prev;
      localStorage.setItem('sidebar-expanded', String(next));
      return next;
    });
  };

  // Class helper to apply clean active/inactive formatting toolbar button states
  const getBtnClass = (isActive: boolean) => {
    return `p-1.5 rounded transition ${isActive
      ? 'bg-indigo-100/80 text-indigo-700 font-bold'
      : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
      }`;
  };

  const isAnyModalOpen = isPlanModalOpen || isModelModalOpen || isImageModalOpen || isMathModalOpen;

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Hide native EditorJS inline toolbar to avoid overlaps */}
      <style>{`
        .ce-inline-toolbar {
          display: none !important;
        }
      `}</style>

      {/* Left sidebar with app name */}
      <MinimalSidebar
        isExpanded={isSidebarExpanded}
        onToggle={toggleSidebar}
        documents={documents}
        currentDocumentId={currentDocument?.id}
        onSelectDocument={onSelectDocument}
        onCreateDocument={onCreateDocument}
        onDeleteDocument={onDeleteDocument}
        onSelectAdminTab={handleSetDashboardTab}
        activeDashboardTab={activeDashboardTab}
        className={isAnyModalOpen ? 'select-none pointer-events-none' : ''}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenBackendSettings={() => setIsBackendModalOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />


      {/* If no document is selected, render the Dashboard View */}
      {!currentDocument ? (
        <DashboardView
          isAnyModalOpen={isAnyModalOpen}
          setIsPricingOpen={setIsPricingOpen}
          toggleDarkMode={toggleDarkMode}
          isDarkMode={isDarkMode}
          activeDashboardTab={activeDashboardTab}
          onCreateDocument={onCreateDocument}
          showAlertModal={showAlertModal}
          language={language}
          documents={documents}
          groupedDocs={groupedDocs}
          dashboardExpandedProjects={dashboardExpandedProjects}
          setDashboardExpandedProjects={setDashboardExpandedProjects}
          onSelectDocument={onSelectDocument}
          loadingAdminPlans={loadingAdminPlans}
          adminPlans={adminPlans}
          handleOpenCreateModal={handleOpenCreateModal}
          handleOpenEditModal={handleOpenEditModal}
          handleDeletePlan={handleDeletePlan}
          isEn={isEn}
          aiModels={aiModels}
          handleOpenCreateProviderModal={handleOpenCreateProviderModal}
          handleOpenCreateModelModal={handleOpenCreateModelModal}
          handleToggleModelStatus={handleToggleModelStatus}
          handleOpenEditModelModal={handleOpenEditModelModal}
          handleDeleteModel={handleDeleteModel}
          handleOpenEditProviderModal={handleOpenEditProviderModal}
          gatewaysList={gatewaysList}
          handleToggleGateway={handleToggleGateway}
          togglingGatewayId={togglingGatewayId}
          profile={profile}
          user={user}
          role={role}
          activePlanId={activePlanId}
          DEFAULT_PROVIDERS={DEFAULT_PROVIDERS}
          aiProviders={aiProviders}
          handleDeleteProvider={handleDeleteProvider}
          handleTestModelConnection={handleTestModelConnection}
          testingModelId={testingModelId}
        />
      ) : (
        /* Main content area */
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Navbar 1 – Document title and actions */}
          <EditorHeader
            isSidebarExpanded={isSidebarExpanded}
            toggleSidebar={toggleSidebar}
            currentDocument={currentDocument}
            onRenameDocument={onRenameDocument}
            backendType={backendType}
            language={language}
            activePlanId={activePlanId}
            bibliographyEntries={bibliographyEntries}
            exportToWordFile={exportToWordFile}
            exportToPdfFile={exportToPdfFile}
            onExportBibliographyText={onExportBibliographyText}
            onExportBibliographyJson={onExportBibliographyJson}
            onExportBibliographyBibtex={onExportBibliographyBibtex}
            onExportBibliographyRis={onExportBibliographyRis}
            setIsExportUpgradeModalOpen={setIsExportUpgradeModalOpen}
            notifications={notifications}
            onMarkAllNotificationsRead={onMarkAllNotificationsRead}
            onMarkNotificationRead={onMarkNotificationRead}
            onNotificationClick={onNotificationClick}
            role={role}
            setIsShareOpen={setIsShareOpen}
            setIsPricingOpen={setIsPricingOpen}
            showRightSidebar={showRightSidebar}
            setShowRightSidebar={setShowRightSidebar}
            onOpenSettings={onOpenSettings}
            activeUsers={activeUsers}
          />

          {/* Navbar 2 – Academic Formatting Toolbar */}
          <EditorJsToolbar
            language={language}
            editorMode={editorMode}
            setEditorMode={setEditorMode}
            editorJsRef={editorJsRef}
            currentBlockType={currentBlockType}
            currentFontSize={currentFontSize}
            setCurrentFontSize={setCurrentFontSize}
            activeFormats={activeFormats}
            getBtnClass={getBtnClass}
            currentAlignment={currentAlignment}
            onInsertCitation={onInsertCitation}
            setImageUrlInput={setImageUrlInput}
            setIsImageModalOpen={setIsImageModalOpen}
            handleHighlightButtonClick={handleHighlightButtonClick}
            setMathFormulaInput={setMathFormulaInput}
            selectedText={selectedText}
            setIsMathModalOpen={setIsMathModalOpen}
            isMathHelperOpen={isMathHelperOpen}
            setIsMathHelperOpen={setIsMathHelperOpen}
            statusLabel={statusLabel}
          />
          {/* LaTeX Math Helper Panel */}
          <MathHelperPanel
            isMathHelperOpen={isMathHelperOpen}
            setIsMathHelperOpen={setIsMathHelperOpen}
            language={language}
            showRightSidebar={showRightSidebar}
            isRightSidebarExpanded={isRightSidebarExpanded}
          />

          {/* Custom Rich Text Selection Bubble Menu */}
          <EditorBubbleMenu
            showBubbleMenu={showBubbleMenu}
            bubbleMenuRect={bubbleMenuRect}
            bubbleMode={bubbleMode}
            activeFormats={activeFormats}
            editorJsRef={editorJsRef}
            handleHighlightButtonClick={handleHighlightButtonClick}
            t={t}
            language={language}
            activePlanId={activePlanId}
            aiError={aiError}
            aiModels={aiModels}
            citationError={citationError}
            citationResults={citationResults}
            expandedCardId={expandedCardId}
            findMostRelevantSentence={findMostRelevantSentence}
            isImproving={isImproving}
            isSearchingCitations={isSearchingCitations}
            onFindCitation={onFindCitation}
            onImproveWriting={onImproveWriting}
            onInsertCitationCandidate={onInsertCitationCandidate}
            onParaphrase={onParaphrase}
            selectedAiModel={selectedAiModel}
            selectedAiTone={selectedAiTone}
            selectedText={selectedText}
            setBubbleMode={setBubbleMode}
            setExpandedCardId={setExpandedCardId}
            setIsPlanModalOpen={setIsPlanModalOpen}
            setIsSuggestionModalOpen={setIsSuggestionModalOpen}
            setNewTextForSuggestion={setNewTextForSuggestion}
            setSelectedAiModel={setSelectedAiModel}
            setSelectedAiTone={setSelectedAiTone}
            setSelectedTextForSuggestion={setSelectedTextForSuggestion}
            setShowBubbleMenu={setShowBubbleMenu}
            showAlertModal={showAlertModal}
            editorMode={editorMode}
            bubbleSearchQuery={bubbleSearchQuery}
            setBubbleSearchQuery={setBubbleSearchQuery}
          />

          {/* Editor canvas area + Right sidebar */}
          <div className="flex flex-1 overflow-hidden justify-center bg-slate-50/50 pt-6 md:pt-2">
            <div className="flex w-full max-w-[1200px] h-full relative bg-white shadow-sm border  border-slate-400/60 overflow-hidden">
              <main
                className="flex-1 p-6 md:p-10 overflow-y-auto thin-scroll"
                onContextMenu={(e) => {
                  const selection = window.getSelection();
                  if (selection && !selection.isCollapsed && selection.toString().trim()) {
                    const holder = document.getElementById('editorjs-holder');
                    const anchorEl = selection.anchorNode?.nodeType === Node.TEXT_NODE
                      ? selection.anchorNode.parentElement
                      : (selection.anchorNode as HTMLElement);

                    if (holder && anchorEl && holder.contains(anchorEl)) {
                      e.preventDefault();
                      setBubbleMenuRect(new DOMRect(e.clientX, e.clientY, 0, 0));
                      setBubbleMode('format');
                      setShowBubbleMenu(true);
                    }
                  }
                }}
              >
                <EditorJsEditor
                  ref={editorJsRef}
                  initialContent={currentDocument?.content}
                  onBlockTypeChange={setCurrentBlockType}
                  onAlignmentChange={(align) => {
                    setCurrentAlignment(align);
                    onAlignmentChange?.(align);
                  }}
                  onStatsChange={onStatsChange}
                  onCiteClick={onCiteClick}
                  onCommentMarkClick={(commentId) => {
                    setShowRightSidebar(true);
                    setIsRightSidebarExpanded(true);
                  }}
                  onContentChange={onContentChange}
                  onCitationSearchChange={(query, rect) => {
                    setBubbleMenuRect(rect);
                    setBubbleMode('citation');
                    setShowBubbleMenu(true);
                    setBubbleSearchQuery(query);
                    onRepeatCitationSearch(query);
                  }}
                  onCitationSearchCancel={() => {
                    editorJsRef.current?.cancelCitationSearch();
                    setShowBubbleMenu(false);
                  }}
                  onEditInlineEquation={(formula, onSave) => {
                    setMathFormulaInput(formula);
                    setEditingMathCallback({ save: onSave });
                    setIsMathModalOpen(true);
                  }}
                  onInsertLinkRequest={(defaultUrl, onSave, onUnlink) => {
                    setLinkUrlInput(defaultUrl);
                    setInsertLinkCallback({ save: onSave, unlink: onUnlink });
                    setIsLinkModalOpen(true);
                  }}
                />
              </main>

              {/* Right Panel — Citation Results, Plagiarism Checker, & AI */}
              {showRightSidebar && (
                <EditorSidebar
                  selectedText={selectedText}
                  citationResults={citationResults}
                  citationHistory={citationHistory}
                  wordCount={wordCount}
                  characterCount={characterCount}
                  citationCount={citationCount}
                  bibliographyEntries={bibliographyEntries}
                  improvedText={improvedText}
                  isImproving={isImproving}
                  isSearchingCitations={isSearchingCitations}
                  aiError={aiError}
                  citationError={citationError}
                  citationNote={citationNote}
                  onApplyImprovedText={onApplyImprovedText}
                  onImproveWriting={onImproveWriting}
                  onParaphrase={onParaphrase}
                  onSummarize={onSummarize}
                  onGenerateAbstract={onGenerateAbstract}
                  onFindCitation={onFindCitation}
                  onRepeatCitationSearch={onRepeatCitationSearch}
                  onInsertCitation={onInsertCitation}
                  onInsertBibliography={onInsertBibliography}
                  onInsertImageSample={onInsertImageSample}
                  onExportBibliographyText={onExportBibliographyText}
                  onExportBibliographyJson={onExportBibliographyJson}
                  onExportBibliographyBibtex={onExportBibliographyBibtex}
                  onExportBibliographyRis={onExportBibliographyRis}
                  onInsertCitationCandidate={onInsertCitationCandidate}
                  onParafrasePlagiat={onParafrasePlagiat}
                  selectedAiModel={selectedAiModel}
                  isSynthesizing={isSynthesizing}
                  synthesizedText={synthesizedText}
                  synthesizeError={synthesizeError}
                  synthesizeDisclaimer={synthesizeDisclaimer}
                  onSynthesizeReview={onSynthesizeReview}
                  onInsertSynthesizedText={onInsertSynthesizedText}
                  citationStyle={citationStyle}
                  onChangeCitationStyle={onChangeCitationStyle}
                  folders={folders}
                  folderAssignments={folderAssignments}
                  onCreateFolder={onCreateFolder}
                  onAssignFolder={onAssignFolder}
                  aiHistory={aiHistory}
                  onDeleteAiHistoryEntry={onDeleteAiHistoryEntry}
                  onClearAiHistory={onClearAiHistory}
                  isApplied={isApplied}
                  isExpanded={isRightSidebarExpanded}
                  onToggleExpanded={handleToggleRightSidebarExpanded}
                  onClose={() => setShowRightSidebar(false)}
                  comments={comments}
                  suggestions={suggestions}
                  onAcceptSuggestion={onAcceptSuggestion}
                  onRejectSuggestion={onRejectSuggestion}
                  onResolveComment={onResolveComment}
                  onCommentClick={onCommentClick}
                  activeTab={activeSidebarTab}
                />
              )}
            </div>

            {/* New Right PDF Viewer Sidebar */}
            {activePdfUrl && (
              <aside className="w-[550px] border-l border-slate-200 bg-white flex flex-col h-full z-20 animate-slide-in-right shrink-0">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">PDF Viewer</span>
                  </div>
                  <button
                    type="button"
                    onClick={onClosePdf}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                    aria-label="Tutup PDF"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>

                {/* Iframe displaying PDF */}
                <div className="flex-1 bg-slate-100">
                  <iframe
                    src={`/pdfjs/web/viewer.html?file=${encodeURIComponent(`/api/citations/view-pdf?url=${encodeURIComponent(activePdfUrl)}`)}#search=${encodeURIComponent(activePdfSearchTerm)}&phrase=true`}
                    className="w-full h-full border-0"
                    title="Jurnal PDF"
                  />
                </div>
              </aside>
            )}
          </div>
        </div>
      )}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />
      <ShareDocumentModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        activePlanId={activePlanId}
        role={role}
        documentId={currentDocument?.id}
        documentTitle={currentDocument?.title}
        settings={currentDocument?.settings}
        onSaveSettings={onSaveSettings}
      />
      <ExportUpgradeModal
        isOpen={mounted && isExportUpgradeModalOpen}
        onClose={() => setIsExportUpgradeModalOpen(false)}
        onUpgrade={() => setIsPricingOpen(true)}
        language={language}
      />
      <ImageModal
        isOpen={mounted && isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrlInput={imageUrlInput}
        setImageUrlInput={setImageUrlInput}
        onConfirm={handleInsertImageConfirm}
      />
      <MathModal
        isOpen={mounted && isMathModalOpen}
        onClose={() => {
          setIsMathModalOpen(false);
          setEditingMathCallback(null);
          setMathFormulaInput('');
        }}
        mathFormulaInput={mathFormulaInput}
        setMathFormulaInput={setMathFormulaInput}
        onConfirm={handleInsertMathConfirm}
        isEditing={!!editingMathCallback}
      />
      <LinkModal
        isOpen={mounted && isLinkModalOpen}
        onClose={() => {
          setIsLinkModalOpen(false);
          setInsertLinkCallback(null);
          setLinkUrlInput('');
        }}
        linkUrlInput={linkUrlInput}
        setLinkUrlInput={setLinkUrlInput}
        onConfirm={handleInsertLinkConfirm}
        onUnlink={handleUnlinkConfirm}
        isEditing={!!insertLinkCallback?.unlink}
        language={language}
      />
      <HighlightPopover
        isOpen={mounted && showHighlightPopover}
        onClose={() => {
          setShowHighlightPopover(false);
          setHighlightPopoverRect(null);
          setHighlightTriggerSource(null);
        }}
        popoverRect={highlightPopoverRect}
        onApplyHighlight={handleApplyHighlight}
        language={language}
      />
      <PlanModal
        isOpen={mounted && isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        selectedPlanForModal={selectedPlanForModal}
        modalPlanState={modalPlanState}
        setModalPlanState={setModalPlanState}
        handleSaveModalPlan={handleSaveModalPlan}
        savingPlanId={savingPlanId}
      />
      <ModelModal
        isOpen={mounted && isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        isEn={isEn}
        selectedModelForModal={selectedModelForModal}
        modalModelState={modalModelState}
        setModalModelState={setModalModelState}
        aiProviders={aiProviders}
        DEFAULT_PROVIDERS={DEFAULT_PROVIDERS}
        handleOpenCreateProviderModal={handleOpenCreateProviderModal}
        handleOpenEditProviderModal={handleOpenEditProviderModal}
        handleTestModelConnection={handleTestModelConnection}
        testingModelId={testingModelId}
        handleSaveModalModel={handleSaveModalModel}
        savingModelId={savingModelId}
      />
      <ProviderModal
        isOpen={mounted && isProviderModalOpen}
        onClose={() => setIsProviderModalOpen(false)}
        isEn={isEn}
        selectedProviderForModal={selectedProviderForModal}
        modalProviderState={modalProviderState}
        setModalProviderState={setModalProviderState}
        handleSaveModalProvider={handleSaveModalProvider}
      />
      {/* Modal Usulan Perubahan (Mode Sugesti / Track Changes) */}
      <SuggestionModal
        isOpen={isSuggestionModalOpen}
        onClose={() => setIsSuggestionModalOpen(false)}
        selectedText={selectedTextForSuggestion}
        newText={newTextForSuggestion}
        setNewText={setNewTextForSuggestion}
        onConfirm={() => {
          const sugId = `sug-${Date.now()}`;
          const authorName = profile?.full_name || user?.email?.split('@')[0] || 'Collaborator';
          editorJsRef.current?.addSuggestionMark?.(sugId, selectedTextForSuggestion, newTextForSuggestion, authorName);
          if (currentDocument?.id) {
            addSuggestion(currentDocument.id, selectedTextForSuggestion, newTextForSuggestion, authorName, sugId, user?.id);
            if (activeUsers && activeUsers.length > 0) {
              activeUsers.filter(u => u.user_id && u.user_id !== user?.id).forEach(coUser => {
                createNotification(
                  currentDocument.id,
                  coUser.user_id,
                  authorName,
                  language === 'en'
                    ? `proposed a suggestion: "${(newTextForSuggestion || selectedTextForSuggestion).slice(0, 30)}${(newTextForSuggestion || selectedTextForSuggestion).length > 30 ? '...' : ''}"`
                    : `mengusulkan perubahan: "${(newTextForSuggestion || selectedTextForSuggestion).slice(0, 30)}${(newTextForSuggestion || selectedTextForSuggestion).length > 30 ? '...' : ''}"`
                );
              });
            }
          }
          setIsSuggestionModalOpen(false);
        }}
        language={language}
      />

      {/* Custom React Alert & Confirm Modal Portal */}
      <AlertModal
        state={mounted && alertModalState && alertModalState.isOpen ? alertModalState : null}
        onClose={() => setAlertModalState(null)}
      />

      {/* Backend & Database Provider Architecture Modal */}
      <BackendSettingsModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
        onToast={(msg) => setMathToast(msg)}
      />

      {/* Interactive Help & Documentation Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}



