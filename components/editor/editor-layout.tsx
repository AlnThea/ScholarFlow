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
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [selectedTextForSuggestion, setSelectedTextForSuggestion] = useState('');
  const [newTextForSuggestion, setNewTextForSuggestion] = useState('');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { backendType } = useDataService();
  const [isMathHelperOpen, setIsMathHelperOpen] = useState(false);


  const [mathToast, setMathToast] = useState<string | null>(null);
  const [dashboardExpandedProjects, setDashboardExpandedProjects] = useState<Record<string, boolean>>({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activeSidebarTab) {
      setShowRightSidebar(true);
    }
  }, [activeSidebarTab]);

  const [activeMathCategory, setActiveMathCategory] = useState<'all' | 'general' | 'greek' | 'operators' | 'advanced' | 'structures'>('general');
  const [mathSearchQuery, setMathSearchQuery] = useState('');

  const mathHelperItems = useMemo(() => [
    // 1. General
    { label: language === 'en' ? 'Fraction' : 'Pecahan', code: '\\frac{a}{b}', category: 'general', isLong: false },
    { label: language === 'en' ? 'Square Root' : 'Akar Kuadrat', code: '\\sqrt{x}', category: 'general', isLong: false },
    { label: language === 'en' ? 'N-th Root' : 'Akar Pangkat N', code: '\\sqrt[n]{x}', category: 'general', isLong: false },
    { label: language === 'en' ? 'Brackets' : 'Kurung Kunci', code: '\\left( x \\right)', category: 'general', isLong: true },
    { label: language === 'en' ? 'Subscript' : 'Subskrip', code: 'x_{i}', category: 'general', isLong: false },
    { label: language === 'en' ? 'Superscript' : 'Superskrip', code: 'x^{2}', category: 'general', isLong: false },
    { label: language === 'en' ? 'Sub & Super' : 'Sub & Super', code: 'x_{i}^{2}', category: 'general', isLong: true },
    { label: language === 'en' ? 'Vector' : 'Vektor', code: '\\vec{x}', category: 'general', isLong: false },
    { label: language === 'en' ? 'Hat' : 'Hat', code: '\\hat{x}', category: 'general', isLong: false },
    { label: language === 'en' ? 'Average (Bar)' : 'Rata-rata', code: '\\bar{x}', category: 'general', isLong: false },
    { label: language === 'en' ? 'Regular Text' : 'Teks Biasa', code: '\\text{teks}', category: 'general', isLong: false },
    { label: language === 'en' ? 'Bold Text' : 'Teks Tebal (Bold)', code: '\\mathbf{x}', category: 'general', isLong: false },
    { label: language === 'en' ? 'Calligraphic (Cal)' : 'Kaligrafi (Cal)', code: '\\mathcal{L}', category: 'general', isLong: false },
    { label: language === 'en' ? 'Real Numbers (R)' : 'Bilangan Riil (R)', code: '\\mathbb{R}', category: 'general', isLong: false },
    { label: language === 'en' ? 'Integers (Z)' : 'Bilangan Bulat (Z)', code: '\\mathbb{Z}', category: 'general', isLong: false },
    { label: language === 'en' ? 'Complex Numbers (C)' : 'Bilangan Kompleks (C)', code: '\\mathbb{C}', category: 'general', isLong: false },
    { label: language === 'en' ? 'Natural Numbers (N)' : 'Bilangan Asli (N)', code: '\\mathbb{N}', category: 'general', isLong: false },

    // 2. Greek
    { label: 'Alpha (α)', code: '\\alpha', category: 'greek', isLong: false },
    { label: 'Beta (β)', code: '\\beta', category: 'greek', isLong: false },
    { label: 'Gamma (γ)', code: '\\gamma', category: 'greek', isLong: false },
    { label: 'Delta (δ)', code: '\\delta', category: 'greek', isLong: false },
    { label: 'Delta (Δ)', code: '\\Delta', category: 'greek', isLong: false },
    { label: 'Theta (θ)', code: '\\theta', category: 'greek', isLong: false },
    { label: 'Theta (Θ)', code: '\\Theta', category: 'greek', isLong: false },
    { label: 'Lambda (λ)', code: '\\lambda', category: 'greek', isLong: false },
    { label: 'Lambda (Λ)', code: '\\Lambda', category: 'greek', isLong: false },
    { label: 'Sigma (σ)', code: '\\sigma', category: 'greek', isLong: false },
    { label: 'Sigma (Σ)', code: '\\Sigma', category: 'greek', isLong: false },
    { label: 'Pi (π)', code: '\\pi', category: 'greek', isLong: false },
    { label: 'Phi (φ)', code: '\\phi', category: 'greek', isLong: false },
    { label: 'Phi (Φ)', code: '\\Phi', category: 'greek', isLong: false },
    { label: 'Omega (ω)', code: '\\omega', category: 'greek', isLong: false },
    { label: 'Omega (Ω)', code: '\\Omega', category: 'greek', isLong: false },
    { label: 'Mu (μ)', code: '\\mu', category: 'greek', isLong: false },
    { label: 'Epsilon (ε)', code: '\\epsilon', category: 'greek', isLong: false },
    { label: 'Rho (ρ)', code: '\\rho', category: 'greek', isLong: false },
    { label: 'Tau (τ)', code: '\\tau', category: 'greek', isLong: false },
    { label: 'Psi (ψ)', code: '\\psi', category: 'greek', isLong: false },
    { label: 'Psi (Ψ)', code: '\\Psi', category: 'greek', isLong: false },
    { label: 'Eta (η)', code: '\\eta', category: 'greek', isLong: false },
    { label: 'Kappa (κ)', code: '\\kappa', category: 'greek', isLong: false },

    // 3. Operators & Logic
    { label: language === 'en' ? 'Plus-Minus (±)' : 'Kurang Lebih (±)', code: '\\pm', category: 'operators', isLong: false },
    { label: language === 'en' ? 'Multiply (Dot ·)' : 'Kali (Dot ·)', code: '\\cdot', category: 'operators', isLong: false },
    { label: language === 'en' ? 'Multiply (Cross ×)' : 'Kali (Cross ×)', code: '\\times', category: 'operators', isLong: false },
    { label: language === 'en' ? 'Not Equal To (≠)' : 'Tidak Sama Dengan (≠)', code: '\\neq', category: 'operators', isLong: false },
    { label: language === 'en' ? 'Approximately (≈)' : 'Mendekati (≈)', code: '\\approx', category: 'operators', isLong: false },
    { label: language === 'en' ? 'Less Than or Equal (≤)' : 'Kurang Dari (≤)', code: '\\le', category: 'operators', isLong: false },
    { label: language === 'en' ? 'Greater Than or Equal (≥)' : 'Lebih Dari (≥)', code: '\\ge', category: 'operators', isLong: false },
    { label: language === 'en' ? 'Proportional (∝)' : 'Proporsional (∝)', code: '\\propto', category: 'operators', isLong: false },
    { label: language === 'en' ? 'For All (∀)' : 'Untuk Semua (∀)', code: '\\forall', category: 'operators', isLong: false },
    { label: language === 'en' ? 'Exists (∃)' : 'Ada (∃)', code: '\\exists', category: 'operators', isLong: false },
    { label: language === 'en' ? 'Element Of (∈)' : 'Anggota Dari (∈)', code: '\\in', category: 'operators', isLong: false },
    { label: language === 'en' ? 'Not Element Of (∉)' : 'Bukan Anggota (∉)', code: '\\notin', category: 'operators', isLong: false },
    { label: language === 'en' ? 'Infinity (∞)' : 'Tak Terhingga (∞)', code: '\\infty', category: 'operators', isLong: false },
    { label: language === 'en' ? 'Right Arrow (→)' : 'Panah Kanan (→)', code: '\\to', category: 'operators', isLong: false },
    { label: language === 'en' ? 'Left Arrow (←)' : 'Panah Kiri (←)', code: '\\gets', category: 'operators', isLong: false },
    { label: language === 'en' ? 'Double Arrow (⇒)' : 'Panah Ganda (⇒)', code: '\\Rightarrow', category: 'operators', isLong: false },
    { label: language === 'en' ? 'Double Left-Right Arrow (⇔)' : 'Panah Ganda Kiri-Kanan (⇔)', code: '\\Leftrightarrow', category: 'operators', isLong: true },
    { label: language === 'en' ? 'Union (∪)' : 'Gabungan (Union ∪)', code: '\\cup', category: 'operators', isLong: false },
    { label: language === 'en' ? 'Intersection (∩)' : 'Irisan (Intersect ∩)', code: '\\cap', category: 'operators', isLong: false },
    { label: language === 'en' ? 'Empty Set (Ø)' : 'Himpunan Kosong (Ø)', code: '\\emptyset', category: 'operators', isLong: false },
    { label: language === 'en' ? 'Equivalent (≡)' : 'Ekuivalen (≡)', code: '\\equiv', category: 'operators', isLong: false },
    { label: language === 'en' ? 'Tensor Product (⊗)' : 'Kali Tensor (⊗)', code: '\\otimes', category: 'operators', isLong: false },
    { label: language === 'en' ? 'Direct Sum (⊕)' : 'Tambah Langsung (⊕)', code: '\\oplus', category: 'operators', isLong: false },
    { label: language === 'en' ? 'Subset Of (⊆)' : 'Bagian Dari (⊆)', code: '\\subseteq', category: 'operators', isLong: false },
    { label: language === 'en' ? 'Logical AND (∧)' : 'Logika DAN (∧)', code: '\\land', category: 'operators', isLong: false },
    { label: language === 'en' ? 'Logical OR (∨)' : 'Logika ATAU (∨)', code: '\\lor', category: 'operators', isLong: false },
    { label: language === 'en' ? 'Negation (¬)' : 'Negasi (¬)', code: '\\neg', category: 'operators', isLong: false },

    // 4. Advanced Math
    { label: 'Integral', code: '\\int_{a}^{b} f(x) dx', category: 'advanced', isLong: true },
    { label: language === 'en' ? 'Double Integral' : 'Integral Ganda', code: '\\iint_{D} f(x,y) dA', category: 'advanced', isLong: true },
    { label: language === 'en' ? 'Triple Integral' : 'Integral Lipat Tiga', code: '\\iiint_{V} f(x,y,z) dV', category: 'advanced', isLong: true },
    { label: language === 'en' ? 'Contour Integral' : 'Integral Lintasan (O)', code: '\\oint_{C} f(z) dz', category: 'advanced', isLong: true },
    { label: language === 'en' ? 'Summation (Sigma)' : 'Sigma (Sum)', code: '\\sum_{i=1}^{n} x_i', category: 'advanced', isLong: true },
    { label: language === 'en' ? 'Product' : 'Produk (Product)', code: '\\prod_{i=1}^{n} x_i', category: 'advanced', isLong: true },
    { label: 'Limit', code: '\\lim_{x \\to \\infty}', category: 'advanced', isLong: true },
    { label: language === 'en' ? 'Partial Derivative' : 'Turunan Parsial', code: '\\partial', category: 'advanced', isLong: false },
    { label: language === 'en' ? 'Nabla / Gradient' : 'Nabla/Gradien', code: '\\nabla', category: 'advanced', isLong: false },
    { label: language === 'en' ? 'Logarithm' : 'Logaritma', code: '\\log_{b}(x)', category: 'advanced', isLong: false },
    { label: language === 'en' ? 'Natural Logarithm' : 'Logaritma Natural', code: '\\ln(x)', category: 'advanced', isLong: false },
    { label: language === 'en' ? 'Derivative Fraction' : 'Turunan Pecahan', code: '\\frac{dy}{dx}', category: 'advanced', isLong: false },
    { label: language === 'en' ? 'Partial Derivative Fraction' : 'Turunan Parsial Pecahan', code: '\\frac{\\partial y}{\\partial x}', category: 'advanced', isLong: true },
    { label: language === 'en' ? 'Second Derivative Fraction' : 'Turunan Kedua Pecahan', code: '\\frac{d^2 y}{dx^2}', category: 'advanced', isLong: true },
    { label: language === 'en' ? 'Sine (sin)' : 'Sinus (sin)', code: '\\sin(x)', category: 'advanced', isLong: false },
    { label: language === 'en' ? 'Cosine (cos)' : 'Kosinus (cos)', code: '\\cos(x)', category: 'advanced', isLong: false },
    { label: language === 'en' ? 'Tangent (tan)' : 'Tangen (tan)', code: '\\tan(x)', category: 'advanced', isLong: false },
    { label: language === 'en' ? 'Arcsine (arcsin)' : 'Arc Sinus (arcsin)', code: '\\arcsin(x)', category: 'advanced', isLong: false },
    { label: language === 'en' ? 'Arccosine (arccos)' : 'Arc Kosinus (arccos)', code: '\\arccos(x)', category: 'advanced', isLong: false },
    { label: language === 'en' ? 'Arctangent (arctan)' : 'Arc Tangen (arctan)', code: '\\arctan(x)', category: 'advanced', isLong: false },
    { label: language === 'en' ? 'Divergence' : 'Divergensi', code: '\\nabla \\cdot \\vec{F}', category: 'advanced', isLong: false },
    { label: language === 'en' ? 'Curl (Rotation)' : 'Curl (Rotasi)', code: '\\nabla \\times \\vec{F}', category: 'advanced', isLong: false },
    { label: 'Laplacian', code: '\\nabla^2 f', category: 'advanced', isLong: false },

    // 5. Structures
    { label: language === 'en' ? '2x2 Matrix' : 'Matriks 2x2', code: '\\begin{matrix} a & b \\\\ c & d \\end{matrix}', category: 'structures', isLong: true },
    { label: language === 'en' ? '3x3 Matrix' : 'Matriks 3x3', code: '\\begin{matrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{matrix}', category: 'structures', isLong: true },
    { label: language === 'en' ? 'Parenthesized Matrix' : 'Matriks Tanda Kurung', code: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', category: 'structures', isLong: true },
    { label: language === 'en' ? 'System of Equations (Cases)' : 'Sistem Persamaan (Cases)', code: 'f(x) = \\begin{cases} x & x \\ge 0 \\\\ -x & x < 0 \\end{cases}', category: 'structures', isLong: true }
  ], [language]);

  const filteredMathHelperItems = useMemo(() => {
    let items = mathHelperItems;
    if (mathSearchQuery.trim()) {
      const q = mathSearchQuery.toLowerCase();
      items = items.filter(item =>
        item.label.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q)
      );
    } else if (activeMathCategory !== 'all') {
      items = items.filter(item => item.category === activeMathCategory);
    }
    return items;
  }, [mathHelperItems, activeMathCategory, mathSearchQuery]);

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
  const [adminPlans, setAdminPlans] = useState<PricingPlan[]>([]);
  const [loadingAdminPlans, setLoadingAdminPlans] = useState(false);
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);
  const [editStates, setEditStates] = useState<Record<string, {
    price: number;
    price_period: string;
    promo_text: string;
    description: string;
    features: string;
  }>>({});

  const [gatewaysList, setGatewaysList] = useState<PaymentGateway[]>([]);
  const [togglingGatewayId, setTogglingGatewayId] = useState<string | null>(null);

  const [alertModalState, setAlertModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    isConfirm?: boolean;
  } | null>(null);

  const showAlertModal = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    onConfirm?: () => void
  ) => {
    setAlertModalState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      isConfirm: false,
    });
  };

  const showConfirmModal = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'danger' | 'warning' | 'info' = 'warning',
    confirmText?: string
  ) => {
    setAlertModalState({
      isOpen: true,
      title,
      message,
      type: type === 'danger' ? 'error' : (type as any),
      onConfirm,
      isConfirm: true,
      confirmText,
    });
  };

  const [savingModelId, setSavingModelId] = useState<string | null>(null);
  const [editModelStates, setEditModelStates] = useState<Record<string, {
    name: string;
    model_id: string;
    is_enabled: boolean;
    is_premium: boolean;
  }>>({});

  useEffect(() => {
    if (aiModels && aiModels.length > 0) {
      const initial: Record<string, any> = {};
      aiModels.forEach((m) => {
        initial[m.id] = {
          name: m.name,
          model_id: m.model_id,
          is_enabled: m.is_enabled,
          is_premium: m.is_premium
        };
      });
      setEditModelStates(initial);
    }
  }, [aiModels]);

  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [selectedModelForModal, setSelectedModelForModal] = useState<AIModel | null>(null);
  const [modalModelState, setModalModelState] = useState<Omit<AIModel, 'updated_at'>>({
    id: '',
    name: '',
    model_id: '',
    provider_id: 'openrouter',
    is_enabled: true,
    is_premium: false,
    provider_type: 'openrouter',
    base_url: '',
    custom_api_key: ''
  });

  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [selectedProviderForModal, setSelectedProviderForModal] = useState<AIProvider | null>(null);
  const [modalProviderState, setModalProviderState] = useState<Omit<AIProvider, 'updated_at'>>({
    id: '',
    name: '',
    type: 'custom_openai',
    base_url: '',
    api_key: ''
  });

  const handleOpenEditModelModal = (model: AIModel) => {
    setSelectedModelForModal(model);
    setModalModelState({
      id: model.id,
      name: model.name,
      model_id: model.model_id,
      provider_id: model.provider_id || model.provider_type || 'openrouter',
      is_enabled: model.is_enabled,
      is_premium: model.is_premium,
      provider_type: model.provider_type || (model.id === 'gemini' || model.model_id.includes('gemini') ? 'gemini' : 'openrouter'),
      base_url: model.base_url || '',
      custom_api_key: model.custom_api_key || ''
    });
    setIsModelModalOpen(true);
  };

  const handleOpenCreateModelModal = () => {
    const firstProv = (aiProviders && aiProviders.length > 0) ? aiProviders[0] : DEFAULT_PROVIDERS[0];
    setSelectedModelForModal(null);
    setModalModelState({
      id: '',
      name: '',
      model_id: '',
      provider_id: firstProv.id,
      is_enabled: true,
      is_premium: false,
      provider_type: firstProv.type,
      base_url: firstProv.base_url || '',
      custom_api_key: firstProv.api_key || ''
    });
    setIsModelModalOpen(true);
  };

  const handleOpenCreateProviderModal = () => {
    setSelectedProviderForModal(null);
    setModalProviderState({
      id: '',
      name: '',
      type: 'custom_openai',
      base_url: '',
      api_key: ''
    });
    setIsProviderModalOpen(true);
  };

  const handleOpenEditProviderModal = (provider: AIProvider) => {
    setSelectedProviderForModal(provider);
    setModalProviderState({
      id: provider.id,
      name: provider.name,
      type: provider.type,
      base_url: provider.base_url || '',
      api_key: provider.api_key || '',
      is_built_in: provider.is_built_in
    });
    setIsProviderModalOpen(true);
  };

  const handleSaveModalProvider = async () => {
    if (!modalProviderState.id.trim() || !modalProviderState.name.trim()) {
      showAlertModal('Input Tidak Lengkap', 'Mohon isi ID Provider dan Nama Provider.', 'warning');
      return;
    }

    try {
      if (selectedProviderForModal) {
        await onUpdateAIProvider?.(modalProviderState.id, {
          name: modalProviderState.name,
          type: modalProviderState.type,
          base_url: modalProviderState.base_url,
          api_key: modalProviderState.api_key
        });
        showAlertModal('Berhasil', `Provider ${modalProviderState.name} berhasil diperbarui.`, 'success');
      } else {
        await onCreateAIProvider?.(modalProviderState);
        showAlertModal('Berhasil', `Provider baru ${modalProviderState.name} berhasil ditambahkan.`, 'success');
      }
      setIsProviderModalOpen(false);
    } catch (err: any) {
      showAlertModal('Gagal Menyimpan Provider', err.message || 'Terjadi kesalahan.', 'error');
    }
  };

  const handleDeleteProvider = (id: string) => {
    showConfirmModal(
      'Hapus Provider AI',
      'Apakah Anda yakin ingin menghapus Provider AI ini? Model AI yang terhubung ke provider ini mungkin akan terpengaruh.',
      async () => {
        try {
          await onDeleteAIProvider?.(id);
          showAlertModal('Berhasil', 'Provider AI berhasil dihapus.', 'success');
        } catch (err: any) {
          showAlertModal('Gagal Menghapus', err.message || 'Terjadi kesalahan.', 'error');
        }
      },
      'danger'
    );
  };

  const [testingModelId, setTestingModelId] = useState<string | null>(null);

  const handleTestModelConnection = async (targetModel?: {
    id: string;
    model_id: string;
    provider_type?: string;
    base_url?: string;
    custom_api_key?: string;
  }) => {
    const modelToTest = targetModel || {
      id: modalModelState.id || 'modal-preview',
      model_id: modalModelState.model_id,
      provider_type: modalModelState.provider_type,
      base_url: modalModelState.base_url,
      custom_api_key: modalModelState.custom_api_key,
    };

    if (!modelToTest.model_id || !modelToTest.model_id.trim()) {
      showAlertModal('Perhatian', 'ID Model API (model_id) harus diisi sebelum menguji koneksi.', 'warning');
      return;
    }

    setTestingModelId(modelToTest.id);

    try {
      const res = await fetch('/api/v1/ai/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_type: modelToTest.provider_type || 'openrouter',
          model_id: modelToTest.model_id,
          base_url: modelToTest.base_url,
          custom_api_key: modelToTest.custom_api_key,
        }),
      });

      const data = await res.json();

      if (data.success) {
        showAlertModal('Koneksi Berhasil', `${data.message}\n\nRespon Uji Provider: "${data.sample_response}"`, 'success');
      } else {
        showAlertModal('Gagal Terhubung', `Tidak dapat terhubung ke Provider AI:\n\n${data.message}`, 'error');
      }
    } catch (err: any) {
      showAlertModal('Kendala Jaringan', `Terjadi kendala koneksi:\n${err.message}`, 'error');
    } finally {
      setTestingModelId(null);
    }
  };

  const handleSaveModalModel = async () => {
    if (!modalModelState.id.trim() || !modalModelState.name.trim() || !modalModelState.model_id.trim()) {
      showAlertModal('Perhatian', 'ID Gateway, Nama Model, dan ID Model API harus diisi.', 'warning');
      return;
    }

    if (modalModelState.provider_type === 'custom_openai' && (!modalModelState.base_url || !modalModelState.base_url.trim())) {
      showAlertModal('Perhatian', 'Custom API Base URL wajib diisi untuk provider Custom OpenAI-Compatible.', 'warning');
      return;
    }

    setSavingModelId(modalModelState.id);
    try {
      if (selectedModelForModal) {
        // Edit mode
        await onUpdateAIModel(selectedModelForModal.id, {
          name: modalModelState.name,
          model_id: modalModelState.model_id,
          is_enabled: modalModelState.is_enabled,
          is_premium: modalModelState.is_premium,
          provider_type: modalModelState.provider_type,
          base_url: modalModelState.base_url,
          custom_api_key: modalModelState.custom_api_key
        });
        showAlertModal('Berhasil', 'Model AI berhasil diperbarui!', 'success');
        setIsModelModalOpen(false);
      } else {
        // Create mode
        await onCreateAIModel(modalModelState);
        showAlertModal('Berhasil', 'Model AI baru berhasil ditambahkan!', 'success');
        setIsModelModalOpen(false);
      }
    } catch (err: any) {
      console.error(err);
      showAlertModal('Gagal Menyimpan', `Gagal menyimpan model AI: ${err.message || err}`, 'error');
    } finally {
      setSavingModelId(null);
    }
  };

  const handleDeleteModel = (modelId: string) => {
    showConfirmModal(
      'Hapus Model AI',
      `Apakah Anda yakin ingin menghapus model AI "${modelId}" dari sistem?`,
      async () => {
        setSavingModelId(modelId);
        try {
          await onDeleteAIModel(modelId);
          showAlertModal('Berhasil Hapus', `Model AI "${modelId}" berhasil dihapus!`, 'success');
        } catch (err: any) {
          console.error(err);
          showAlertModal('Gagal Hapus', `Gagal menghapus model AI: ${err.message || err}`, 'error');
        } finally {
          setSavingModelId(null);
        }
      },
      'danger',
      'Hapus Model'
    );
  };

  const handleToggleModelStatus = async (model: AIModel) => {
    setSavingModelId(model.id);
    try {
      await onUpdateAIModel(model.id, {
        is_enabled: !model.is_enabled,
      });
      showAlertModal(
        'Status Model AI',
        `Model "${model.name}" berhasil di${!model.is_enabled ? 'aktifkan' : 'non-aktifkan'}!`,
        'success'
      );
    } catch (err: any) {
      console.error(err);
      showAlertModal('Gagal', `Gagal mengubah status model AI: ${err.message || err}`, 'error');
    } finally {
      setSavingModelId(null);
    }
  };


  useEffect(() => {
    if (activeDashboardTab === 'admin-pricing' || activeDashboardTab === 'admin-gateways') {
      setLoadingAdminPlans(true);
      Promise.all([fetchPricingPlans(), fetchPaymentGateways()])
        .then(([plansData, gatewaysData]) => {
          setAdminPlans(plansData);
          setGatewaysList(gatewaysData);

          const states: typeof editStates = {};
          plansData.forEach((p) => {
            states[p.id] = {
              price: p.price,
              price_period: p.price_period,
              promo_text: p.promo_text || '',
              description: p.description || '',
              features: p.features.join('\n')
            };
          });
          setEditStates(states);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoadingAdminPlans(false));
    }
  }, [activeDashboardTab]);

  const handleToggleGateway = async (gatewayId: string, isEnabled: boolean) => {
    setTogglingGatewayId(gatewayId);
    try {
      const res = await updatePaymentGatewayStatus(gatewayId, isEnabled);
      if (res.success) {
        showAlertModal('Gateway Pembayaran', `Status gateway "${gatewayId}" berhasil diubah!`, 'success');
      } else {
        showAlertModal('Gagal', `Gagal mengubah status gateway: ${res.error}`, 'error');
      }
    } catch (err) {
      console.error(err);
      showAlertModal('Error', 'Terjadi kesalahan saat mengubah status gateway.', 'error');
    } finally {
      setTogglingGatewayId(null);
    }
  };

  const handleSavePlan = async (planId: string) => {
    const state = editStates[planId];
    if (!state) return;

    setSavingPlanId(planId);
    try {
      const res = await updatePricingPlan(planId, {
        price: Number(state.price),
        price_period: state.price_period,
        promo_text: state.promo_text || null,
        description: state.description,
        features: state.features.split('\n').map(f => f.trim()).filter(Boolean)
      });

      if (res.success) {
        showAlertModal('Paket Harga', 'Paket harga berhasil diperbarui!', 'success');
      } else {
        showAlertModal('Gagal', `Gagal memperbarui paket: ${res.error}`, 'error');
      }
    } catch (err) {
      console.error(err);
      showAlertModal('Error', 'Terjadi kesalahan saat menyimpan perubahan.', 'error');
    } finally {
      setSavingPlanId(null);
    }
  };

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const handleInsertImageConfirm = () => {
    if (imageUrlInput.trim()) {
      editorJsRef.current?.insertImage(imageUrlInput.trim());
      setIsImageModalOpen(false);
      setImageUrlInput('');
    }
  };

  const [isMathModalOpen, setIsMathModalOpen] = useState(false);
  const [mathFormulaInput, setMathFormulaInput] = useState('');
  const [editingMathCallback, setEditingMathCallback] = useState<{ save: (formula: string) => void } | null>(null);

  const handleInsertMathConfirm = () => {
    if (mathFormulaInput.trim()) {
      if (editingMathCallback) {
        editingMathCallback.save(mathFormulaInput.trim());
        setEditingMathCallback(null);
      } else {
        editorJsRef.current?.insertInlineEquation(mathFormulaInput.trim());
      }
      setIsMathModalOpen(false);
      setMathFormulaInput('');
    }
  };

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrlInput, setLinkUrlInput] = useState('');
  const [insertLinkCallback, setInsertLinkCallback] = useState<{
    save: (url: string) => void;
    unlink?: () => void;
  } | null>(null);

  const handleInsertLinkConfirm = () => {
    if (linkUrlInput.trim()) {
      if (insertLinkCallback) {
        insertLinkCallback.save(linkUrlInput.trim());
        setInsertLinkCallback(null);
      }
      setIsLinkModalOpen(false);
      setLinkUrlInput('');
    }
  };

  const handleUnlinkConfirm = () => {
    if (insertLinkCallback?.unlink) {
      insertLinkCallback.unlink();
      setInsertLinkCallback(null);
    }
    setIsLinkModalOpen(false);
    setLinkUrlInput('');
  };

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

  const [showHighlightPopover, setShowHighlightPopover] = useState(false);
  const [highlightPopoverRect, setHighlightPopoverRect] = useState<DOMRect | null>(null);
  const [highlightTriggerSource, setHighlightTriggerSource] = useState<'toolbar' | 'bubble' | null>(null);

  const handleHighlightButtonClick = (e: React.MouseEvent<HTMLButtonElement>, source: 'toolbar' | 'bubble') => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setHighlightPopoverRect(rect);
    setHighlightTriggerSource(source);
    setShowHighlightPopover(prev => !prev);
  };

  const handleApplyHighlight = (color: string) => {
    editorJsRef.current?.toggleInlineFormat('highlight', color);
    setShowHighlightPopover(false);
    setHighlightPopoverRect(null);
    setHighlightTriggerSource(null);
  };

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isExportUpgradeModalOpen, setIsExportUpgradeModalOpen] = useState(false);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<PricingPlan | null>(null);
  const [modalPlanState, setModalPlanState] = useState<Omit<PricingPlan, 'updated_at'>>({
    id: '',
    name: '',
    price: 0,
    price_period: '/bulan',
    description: '',
    features: [],
    is_popular: false,
    promo_text: ''
  });

  const handleOpenEditModal = (plan: PricingPlan) => {
    setSelectedPlanForModal(plan);
    setModalPlanState({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      price_period: plan.price_period,
      description: plan.description || '',
      features: plan.features || [],
      is_popular: plan.is_popular || false,
      promo_text: plan.promo_text || ''
    });
    setIsPlanModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setSelectedPlanForModal(null);
    setModalPlanState({
      id: '',
      name: '',
      price: 0,
      price_period: '/bulan',
      description: '',
      features: [],
      is_popular: false,
      promo_text: ''
    });
    setIsPlanModalOpen(true);
  };

  const handleSaveModalPlan = async () => {
    if (!modalPlanState.id.trim() || !modalPlanState.name.trim()) {
      alert('ID Paket dan Nama Paket harus diisi.');
      return;
    }
    setSavingPlanId(modalPlanState.id);
    try {
      if (selectedPlanForModal) {
        // Edit mode
        const res = await updatePricingPlan(selectedPlanForModal.id, {
          name: modalPlanState.name,
          price: Number(modalPlanState.price),
          price_period: modalPlanState.price_period,
          promo_text: modalPlanState.promo_text || null,
          description: modalPlanState.description || null,
          features: modalPlanState.features,
          is_popular: modalPlanState.is_popular
        });
        if (res.success) {
          alert('Paket berhasil diperbarui!');
          setIsPlanModalOpen(false);
          // reload plans
          const plansData = await fetchPricingPlans();
          setAdminPlans(plansData);
        } else {
          alert(`Gagal memperbarui paket: ${res.error}`);
        }
      } else {
        // Create mode
        const res = await createPricingPlan(modalPlanState);
        if (res.success) {
          alert('Paket baru berhasil ditambahkan!');
          setIsPlanModalOpen(false);
          // reload plans
          const plansData = await fetchPricingPlans();
          setAdminPlans(plansData);
        } else {
          alert(`Gagal menambahkan paket baru: ${res.error}`);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan data.');
    } finally {
      setSavingPlanId(null);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus paket "${planId}"?`)) return;
    setSavingPlanId(planId);
    try {
      const res = await deletePricingPlan(planId);
      if (res.success) {
        alert('Paket berhasil dihapus!');
        const plansData = await fetchPricingPlans();
        setAdminPlans(plansData);
      } else {
        alert(`Gagal menghapus paket: ${res.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menghapus paket.');
    } finally {
      setSavingPlanId(null);
    }
  };

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
          if (hasLink && hasHighlight) break;
          node = node.parentElement;
        }

        // 2. Check focusNode parent if anchorNode didn't find both
        if (!hasLink || !hasHighlight) {
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
            if (hasLink && hasHighlight) break;
            node = node.parentElement;
          }
        }

        // 3. Check if selection range spans across/encloses an A or MARK tag
        if (!hasLink || !hasHighlight) {
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
        code: document.queryCommandState('insertHTML'),
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
          {isMathHelperOpen && (
            <div
              className={`fixed ${showRightSidebar ? (isRightSidebarExpanded ? 'right-[380px]' : 'right-20') : 'right-4'} top-40 w-80 bg-white/95 border border-slate-200/80 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] z-40 p-4 flex flex-col gap-3 h-[500px] max-h-[60vh] animate-fade-in`}
            >
              {/* Math Helper Toast notification inside the helper panel */}
              {mathToast && (
                <div className="absolute top-2 right-4 bg-slate-800 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-md animate-fade-in flex items-center gap-1 z-20">
                  <IconCheck className="h-3 w-3 text-emerald-400" />
                  <span>{mathToast}</span>
                </div>
              )}

              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">LaTeX Math Helper</span>
                  <span className="text-[9px] text-slate-400 italic">
                    {language === 'en' ? 'Quick Formula Shortcuts' : 'Pintasan Rumus Cepat'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMathHelperOpen(false)}
                  className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  title={language === 'en' ? 'Close Panel' : 'Tutup Panel'}
                >
                  <IconX className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Search Input Box */}
              <div className="relative">
                <input
                  type="text"
                  value={mathSearchQuery}
                  onChange={(e) => setMathSearchQuery(e.target.value)}
                  placeholder={language === 'en' ? 'Search symbol (e.g. sigma, integral)...' : 'Cari simbol (misal: sigma, integral)...'}
                  className="w-full pl-8 pr-3 py-1.5 text-[10px] border border-slate-200 rounded-lg outline-none focus:border-indigo-500 transition font-sans text-slate-800"
                />
                <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                {mathSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setMathSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Category Tabs (Horizontal Scrollable) */}
              {!mathSearchQuery && (
                <div
                  className="flex flex-wrap items-center gap-1 py-1.5 border-b border-slate-100 text-xs font-semibold text-slate-500"
                >
                  {[
                    { id: 'general', label: language === 'en' ? 'General' : 'Umum' },
                    { id: 'greek', label: language === 'en' ? 'Greek' : 'Yunani' },
                    { id: 'operators', label: language === 'en' ? 'Operators' : 'Operator' },
                    { id: 'advanced', label: language === 'en' ? 'Calculus' : 'Kalkulus' },
                    { id: 'structures', label: language === 'en' ? 'Structures' : 'Struktur' },
                    { id: 'all', label: language === 'en' ? 'All' : 'Semua' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setActiveMathCategory(tab.id as any)}
                      className={`px-2 py-1 rounded transition shrink-0 cursor-pointer ${activeMathCategory === tab.id
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'hover:bg-slate-100 hover:text-slate-700'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="overflow-y-auto flex-1 pr-1">
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                  <div className="col-span-2 text-[9px] bg-slate-50/50 p-2 rounded border border-slate-100 leading-normal mb-1">
                    {language === 'en' ? (
                      <>📌 <strong className="text-slate-600">Info:</strong> If the formula input box is active, clicking a formula will insert it directly. Otherwise, it will be copied to clipboard.</>
                    ) : (
                      <>📌 <strong className="text-slate-600">Info:</strong> Jika kotak input rumus aktif, mengklik rumus akan langsung menyisipkannya. Jika tidak, rumus disalin ke clipboard.</>
                    )}
                  </div>
                  {filteredMathHelperItems.length === 0 ? (
                    <div className="col-span-2 text-center py-6 text-slate-400 italic">
                      {language === 'en' ? 'No matching symbols.' : 'Tidak ada simbol yang cocok.'}
                    </div>
                  ) : (
                    filteredMathHelperItems.map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()} // Prevents losing editor focus
                        onClick={async () => {
                          const activeEl = document.activeElement as HTMLElement | null;
                          const isMathTextarea = activeEl &&
                            activeEl.tagName === 'TEXTAREA' &&
                            (activeEl as HTMLTextAreaElement).placeholder?.includes('LaTeX formula');

                          if (isMathTextarea) {
                            const txtEl = activeEl as HTMLTextAreaElement;
                            const start = txtEl.selectionStart;
                            const end = txtEl.selectionEnd;
                            const textVal = txtEl.value;
                            txtEl.value = textVal.substring(0, start) + item.code + textVal.substring(end);
                            txtEl.selectionStart = txtEl.selectionEnd = start + item.code.length;
                            txtEl.dispatchEvent(new InputEvent('input', { bubbles: true }));

                            setMathToast(language === 'en' ? 'Inserted!' : 'Disisipkan!');
                            setTimeout(() => setMathToast(null), 2000);
                          } else {
                            try {
                              await navigator.clipboard.writeText(item.code);
                              setMathToast(language === 'en' ? 'Copied!' : 'Disalin!');
                              setTimeout(() => setMathToast(null), 2000);
                            } catch (err) {
                              console.error('Failed to copy text:', err);
                            }
                          }
                        }}
                        className={`p-2.5 rounded border border-slate-200/80 hover:border-indigo-300 bg-white hover:bg-indigo-50/40 text-left transition cursor-pointer flex items-center justify-between gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-sm ${item.isLong ? 'col-span-2' : 'col-span-1'}`}
                        title={item.code}
                      >
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-semibold text-slate-750 text-[10px]">{item.label}</span>
                          <span className="font-mono text-[8.5px] text-slate-400 truncate w-full mt-0.5">{item.code}</span>
                        </div>
                        <div className="flex-shrink-0 bg-slate-50 border border-slate-100/70 rounded px-1.5 py-1 min-h-[26px] flex items-center justify-center min-w-[36px]">
                          <KatexPreview formula={item.code} />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Custom Rich Text Selection Bubble Menu */}
          {showBubbleMenu && bubbleMenuRect && (
            <div
              className="fixed z-50 bg-white border border-slate-200/80 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex flex-col transition-all duration-150 backdrop-blur-sm overflow-hidden"
              style={(() => {
                const isCitation = bubbleMode === 'citation';
                const menuWidth = isCitation ? 480 : 310;
                const menuHeight = isCitation ? 390 : 310;
                const winH = typeof window !== 'undefined' ? window.innerHeight : 800;
                const winW = typeof window !== 'undefined' ? window.innerWidth : 1200;

                const anchorY = bubbleMenuRect.bottom > 0 ? bubbleMenuRect.bottom : bubbleMenuRect.top;
                const anchorX = bubbleMenuRect.left > 0 ? bubbleMenuRect.left : bubbleMenuRect.right;

                // Determine vertical position: pop UP if pointer is near bottom of viewport
                const shouldPopUp = (anchorY + menuHeight + 15 > winH) && (anchorY > menuHeight);
                let topPos = shouldPopUp
                  ? anchorY - menuHeight - 10
                  : anchorY + 10;

                // Clamp inside viewport [10, winH - menuHeight - 10]
                topPos = Math.max(10, Math.min(winH - menuHeight - 10, topPos));

                // Clamp left position inside viewport [10, winW - menuWidth - 10]
                let leftPos = bubbleMenuRect.width > 0
                  ? bubbleMenuRect.left + bubbleMenuRect.width / 2 - menuWidth / 2
                  : anchorX;

                if (leftPos + menuWidth > winW - 10) {
                  leftPos = winW - menuWidth - 10;
                }
                leftPos = Math.max(10, leftPos);

                return {
                  top: `${topPos}px`,
                  left: `${leftPos}px`,
                  width: `${menuWidth}px`,
                };
              })()}
            >
              {/* ── FORMAT MODE ── */}
              {bubbleMode === 'format' && (
                <div className="flex flex-col">
                  {/* Inline format buttons */}
                  <div className="p-2 flex items-center gap-0.5 justify-between px-3 bg-slate-50/20 border-b border-slate-100">
                    <button className={getBtnClass(activeFormats.bold)} onMouseDown={e => e.preventDefault()} onClick={() => editorJsRef.current?.toggleInlineFormat('bold')} title="Bold"><IconBold className="h-3.5 w-3.5" /></button>
                    <button className={getBtnClass(activeFormats.italic)} onMouseDown={e => e.preventDefault()} onClick={() => editorJsRef.current?.toggleInlineFormat('italic')} title="Italic"><IconItalic className="h-3.5 w-3.5" /></button>
                    <button className={getBtnClass(activeFormats.underline)} onMouseDown={e => e.preventDefault()} onClick={() => editorJsRef.current?.toggleInlineFormat('underline')} title="Underline"><IconUnderline className="h-3.5 w-3.5" /></button>
                    <button className={getBtnClass(activeFormats.strikethrough)} onMouseDown={e => e.preventDefault()} onClick={() => editorJsRef.current?.toggleInlineFormat('strikethrough')} title="Strikethrough"><IconStrikethrough className="h-3.5 w-3.5" /></button>
                    <button className={getBtnClass(activeFormats.code)} onMouseDown={e => e.preventDefault()} onClick={() => editorJsRef.current?.toggleInlineFormat('code')} title="Code"><IconCode className="h-3.5 w-3.5" /></button>
                    <button className={getBtnClass(activeFormats.link)} onMouseDown={e => e.preventDefault()} onClick={() => editorJsRef.current?.toggleInlineFormat('link')} title="Link"><IconLink className="h-3.5 w-3.5" /></button>
                    <button className={getBtnClass(activeFormats.highlight)} onMouseDown={e => e.preventDefault()} onClick={(e) => handleHighlightButtonClick(e, 'bubble')} title="Highlight text"><IconHighlight className="h-3.5 w-3.5" /></button>
                  </div>

                  {/* AI Configuration Section Header */}
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100/50 text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/40">
                    <span>{t('menu.settings')}</span>
                  </div>

                  {/* AI Dropdowns */}
                  <div className="flex gap-2.5 px-3 py-2 border-b border-slate-100/60 bg-slate-50/10">
                    {/* Model Select */}
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <span className="text-[8px] font-bold text-slate-400 uppercase">Model</span>
                      <select
                        value={selectedAiModel}
                        onChange={(e) => setSelectedAiModel(e.target.value)}
                        className="w-full border border-slate-200 rounded px-1.5 py-1 text-[10px] text-slate-700 bg-white outline-none focus:border-indigo-500 transition cursor-pointer font-semibold"
                        title={language === 'en' ? 'Select AI Model' : 'Pilih Model AI'}
                      >
                        {aiModels && aiModels.length > 0 ? (
                          aiModels.filter(m => m.is_enabled).map(m => {
                            const cleanName = m.name.replace(" (Direct)", "").replace(" (Free OR)", "").replace(" (Pro OR)", "");
                            const pLabel = m.provider_type === 'custom_openai' || (m.base_url && m.base_url.trim().length > 0)
                              ? 'Custom Proxy'
                              : (m.provider_type === 'gemini' || m.id === 'gemini' || m.model_id.includes('gemini'))
                                ? 'Gemini Direct'
                                : 'OpenRouter';
                            return (
                              <option key={m.id} value={m.id}>
                                {cleanName} [{pLabel}]
                              </option>
                            );
                          })
                        ) : (
                          <>
                            <option value="gemini">Gemini [Gemini Direct]</option>
                            <option value="llama3">Llama 3 [OpenRouter]</option>
                            <option value="gemma2">Gemma 2 [OpenRouter]</option>
                            <option value="claude">Claude [OpenRouter]</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* Tone Select */}
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <span className="text-[8px] font-bold text-slate-400 uppercase">{language === 'en' ? 'Tone' : 'Gaya'}</span>
                      <select
                        value={selectedAiTone}
                        onChange={(e) => setSelectedAiTone(e.target.value)}
                        className="w-full border border-slate-200 rounded px-1.5 py-1 text-[10px] text-slate-700 bg-white outline-none focus:border-indigo-500 transition cursor-pointer font-semibold"
                        title={language === 'en' ? 'AI Polish Tone' : 'Gaya Poles AI'}
                      >
                        <option value="academic">{language === 'en' ? 'Academic' : 'Akademis'}</option>
                        <option value="simplify">{language === 'en' ? 'Simplify' : 'Sederhana'}</option>
                        <option value="shorten">{language === 'en' ? 'Condense' : 'Ringkas'}</option>
                        <option value="expand">{language === 'en' ? 'Elaborate' : 'Elaborasi'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Provider Engine Live Banner Indicator */}
                  {(() => {
                    const currentModelObj = aiModels?.find(m => m.id === selectedAiModel);
                    const pType = currentModelObj?.provider_type || (selectedAiModel === 'gemini' ? 'gemini' : 'openrouter');
                    const isCustom = pType === 'custom_openai' || (currentModelObj?.base_url && currentModelObj.base_url.trim().length > 0);
                    const isGemini = pType === 'gemini' || selectedAiModel === 'gemini' || currentModelObj?.model_id?.includes('gemini');

                    return (
                      <div className="mx-3 my-1 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between text-[9px]">
                        <span className="text-slate-400 font-bold uppercase tracking-wider">Engine Provider:</span>
                        {isGemini ? (
                          <span className="font-bold text-sky-700 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                            Google Gemini Direct API
                          </span>
                        ) : isCustom ? (
                          <span className="font-bold text-amber-800 flex items-center gap-1.5" title={currentModelObj?.base_url || 'Custom Proxy'}>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Custom OpenAI Proxy API
                          </span>
                        ) : (
                          <span className="font-bold text-purple-700 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                            OpenRouter API
                          </span>
                        )}
                      </div>
                    );
                  })()}

                  {/* Actions Section Header */}
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100/50 text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/40">
                    <span>{t('menu.actions')}</span>
                  </div>

                  {/* Actions List */}
                  <div className="flex flex-col">
                    {/* Usulkan Perubahan (Mode Sugesti / Track Changes) */}
                    {editorMode === 'suggest' && (
                      <button
                        className="w-full flex items-center gap-3 px-3 py-2 text-left text-slate-700 hover:bg-amber-50/60 transition font-semibold cursor-pointer border-b border-slate-100/40"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => {
                          const sel = window.getSelection();
                          const selText = sel ? sel.toString().trim() : '';
                          setSelectedTextForSuggestion(selText);
                          setNewTextForSuggestion(selText);
                          setIsSuggestionModalOpen(true);
                        }}
                      >
                        <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                          <IconSparkles className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-xs text-amber-900 font-bold">
                            💡 {language === 'en' ? 'Suggest Change (Track Changes)' : 'Usulan Perubahan (Track Changes)'}
                          </span>
                          <span className="text-[9px] text-amber-700 font-normal">
                            {language === 'en' ? 'Propose text edit or deletion as suggestion' : 'Usulkan pengubahan atau penghapusan teks'}
                          </span>
                        </div>
                      </button>
                    )}

                    {/* Poles AI Button */}
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-slate-700 hover:bg-slate-50 transition font-semibold cursor-pointer border-b border-slate-100/40 disabled:opacity-50 disabled:bg-slate-50/50"
                      onMouseDown={e => e.preventDefault()}
                      disabled={isImproving}
                      onClick={() => {
                        const modelObj = aiModels.find(m => m.id === selectedAiModel);
                        const isPremium = modelObj ? modelObj.is_premium : (selectedAiModel === 'claude');
                        if (isPremium && activePlanId === 'free') {
                          showAlertModal(
                            'Akses Model Premium 🔒',
                            language === 'en'
                              ? `Model "${modelObj?.name || 'Premium'}" is exclusive to Pro Writer plans. Please upgrade your account to access this model.`
                              : `Model "${modelObj?.name || 'Premium'}" khusus untuk pengguna paket Pro Writer. Silakan upgrade akun Anda untuk mengakses model ini.`,
                            'warning',
                            () => setIsPlanModalOpen(true)
                          );
                        } else {
                          onImproveWriting();
                          setShowRightSidebar(true);
                        }
                      }}
                    >
                      <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                        {isImproving ? (
                          <IconLoader className="h-4 w-4 animate-spin" />
                        ) : (
                          <IconSparkles className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs text-slate-800">{t('menu.polish')}</span>
                        <span className="text-[9px] text-slate-400 font-normal">
                          {language === 'en' ? 'Improve style and academic phrasing' : 'Meningkatkan gaya bahasa & akademis'}
                        </span>
                      </div>
                    </button>

                    {/* Parafrase Button */}
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-slate-700 hover:bg-slate-50 transition font-semibold cursor-pointer border-b border-slate-100/40 disabled:opacity-50 disabled:bg-slate-50/50"
                      onMouseDown={e => e.preventDefault()}
                      disabled={isImproving}
                      onClick={() => {
                        const modelObj = aiModels.find(m => m.id === selectedAiModel);
                        const isPremium = modelObj ? modelObj.is_premium : (selectedAiModel === 'claude');
                        if (isPremium && activePlanId === 'free') {
                          showAlertModal(
                            'Akses Model Premium 🔒',
                            language === 'en'
                              ? `Model "${modelObj?.name || 'Premium'}" is exclusive to Pro Writer plans. Please upgrade your account to access this model.`
                              : `Model "${modelObj?.name || 'Premium'}" khusus untuk pengguna paket Pro Writer. Silakan upgrade akun Anda untuk mengakses model ini.`,
                            'warning',
                            () => setIsPlanModalOpen(true)
                          );
                        } else {
                          onParaphrase();
                          setShowRightSidebar(true);
                        }
                      }}
                    >
                      <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                        {isImproving ? (
                          <IconLoader className="h-4 w-4 animate-spin" />
                        ) : (
                          <IconLanguage className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs text-slate-800">{t('menu.paraphrase')}</span>
                        <span className="text-[9px] text-slate-400 font-normal">
                          {language === 'en' ? 'Rewrite selected sentence (AI)' : 'Tulis ulang kalimat terpilih (AI)'}
                        </span>
                      </div>
                    </button>

                    {/* Inline Math (LaTeX) Button */}
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-slate-700 hover:bg-slate-50 transition font-semibold cursor-pointer border-b border-slate-100/40"
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => {
                        setShowBubbleMenu(false);
                        editorJsRef.current?.insertInlineEquation();
                      }}
                    >
                      <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                        <IconSum className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs text-slate-800">{language === 'en' ? 'Mathematical Equation (LaTeX)' : 'Rumus Matematika (LaTeX)'}</span>
                        <span className="text-[9px] text-slate-400 font-normal">
                          {language === 'en' ? 'Convert selected text to equation' : 'Ubah teks terpilih menjadi rumus'}
                        </span>
                      </div>
                    </button>

                    {/* Sitasi Button */}
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-slate-700 hover:bg-slate-50 transition font-semibold cursor-pointer"
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => {
                        setBubbleMode('citation');
                        onFindCitation();
                        setShowRightSidebar(true);
                      }}
                    >
                      <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                        <IconSearch className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs text-slate-800">{language === 'en' ? 'Find Citations' : 'Cari Kutipan / Sitasi'}</span>
                        <span className="text-[9px] text-slate-400 font-normal">
                          {language === 'en' ? 'Find scientific journal citations' : 'Temukan sitasi jurnal ilmiah'}
                        </span>
                      </div>
                    </button>
                  </div>

                  {aiError && (
                    <div className="m-2 p-2 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-[10px] leading-normal shrink-0">
                      {aiError}
                    </div>
                  )}
                </div>
              )}

              {/* ── CITATION MODE ── */}
              {bubbleMode === 'citation' && (
                <div className="flex flex-col">
                  {/* Header */}
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
                    <button
                      className="p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition flex-shrink-0"
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => setBubbleMode('format')}
                      title="Back"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                    <IconSearch className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                    <span className="text-xs font-semibold text-slate-700 truncate flex-1">
                      {typeof document !== 'undefined' && document.querySelector('span[data-citation-search="true"]') ? 'Mencari Sitasi...' : `"${selectedText.slice(0, 40)}${selectedText.length > 40 ? '…' : ''}"`}
                    </span>
                    <button
                      className="p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition flex-shrink-0"
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => { setShowBubbleMenu(false); setBubbleMode('format'); }}
                      title="Close"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>

                  {/* Loading */}
                  {isSearchingCitations && (
                    <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-400">
                      <svg className="h-4 w-4 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
                        <path d="M12 2a10 10 0 0 1 10 10" />
                      </svg>
                      Searching citations...
                    </div>
                  )}

                  {/* Error */}
                  {!isSearchingCitations && citationError && (
                    <div className="px-3 py-4 text-xs text-red-500 text-center">
                      {citationError}
                    </div>
                  )}

                  {/* Results */}
                  {!isSearchingCitations && !citationError && citationResults.length === 0 && (
                    <div className="px-3 py-4 text-xs text-slate-400 text-center">
                      No citations found. Try selecting different text.
                    </div>
                  )}

                  {!isSearchingCitations && citationResults.length > 0 && (
                    <div className="flex flex-col gap-3 p-3 max-h-[380px] overflow-y-auto bg-slate-50/50">
                      {citationResults.map((candidate) => (
                        <div
                          key={candidate.reference_id}
                          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-3 text-left"
                        >
                          {/* Top row: Article header details */}
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                            <div className="flex items-center gap-1.5">
                              <span className="uppercase tracking-wider font-bold text-slate-500">Article</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${candidate.ranking_score >= 80
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                                : candidate.ranking_score >= 50
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/50'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}>
                                🟢 {candidate.ranking_score}% Match
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span>Cited by {candidate.cited_by_count}</span>
                              <span>IF {((candidate.cited_by_count * 0.02) + 0.11).toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Title, Authors, Journal & Year */}
                          <div className="flex flex-col gap-1">
                            <h4 className="text-xs font-bold leading-snug text-slate-800 line-clamp-2" title={candidate.title}>
                              {candidate.title}
                            </h4>
                            <p className="text-[11px] font-semibold text-slate-500 leading-tight">
                              {candidate.authors.length > 0 ? candidate.authors.join(', ') : 'Author data unavailable'}
                            </p>
                            <p className="text-[10px] text-slate-400 leading-tight">
                              {candidate.journal ? `${candidate.journal} · ` : ''}{candidate.year || 'N/A'}
                            </p>
                          </div>

                          {/* Abstract text with left border line */}
                          <div className="pl-3 border-l-2 border-slate-300 text-[11px] leading-relaxed text-slate-500">
                            <p className="line-clamp-2 italic">
                              {candidate.abstract
                                ? candidate.abstract
                                : 'No abstract or description summary available for this article.'}
                            </p>
                          </div>

                          {/* Divider */}
                          <div className="h-px bg-slate-100 w-full" />

                          {/* Bottom Row: Actions (Left) & Favorite/Source Icon (Right) */}
                          <div className="flex items-center justify-between gap-4">
                            {/* Left: Action Buttons */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {/* Tombol Cite */}
                              <button
                                type="button"
                                onClick={() => {
                                  const hasSearchSpan = !!document.querySelector('span[data-citation-search="true"]');
                                  if (hasSearchSpan) {
                                    editorJsRef.current?.insertCitationAtSearch(candidate.citation_label, candidate.reference_id);
                                    onInsertCitationCandidate(candidate, true);
                                  } else {
                                    onInsertCitationCandidate(candidate);
                                  }
                                  setShowBubbleMenu(false);
                                  setBubbleMode('format');
                                }}
                                className="inline-flex items-center justify-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-[10px] font-semibold shadow-sm transition whitespace-nowrap"
                              >
                                <IconQuote className="h-3 w-3" />
                                Cite
                              </button>

                              {/* Tombol View */}
                              <button
                                type="button"
                                onClick={() => candidate.url && window.open(candidate.url, '_blank', 'noopener,noreferrer')}
                                disabled={!candidate.url}
                                className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 px-3 py-1.5 text-[10px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
                              >
                                <IconExternalLink className="h-3 w-3" />
                                View
                              </button>

                              {/* Tombol Konteks (Toggle) */}
                              {candidate.abstract && (
                                <button
                                  type="button"
                                  onClick={() => setExpandedCardId(prev => prev === candidate.reference_id ? null : candidate.reference_id)}
                                  className={`inline-flex items-center justify-center gap-1 rounded-lg border px-3 py-1.5 text-[10px] font-semibold transition whitespace-nowrap ${expandedCardId === candidate.reference_id
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                                    }`}
                                >
                                  {expandedCardId === candidate.reference_id ? 'Tutup Kutipan' : 'Lihat Kutipan'}
                                </button>
                              )}
                            </div>

                            {/* Right: Source Badge & Fav Icon */}
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${candidate.source === 'OpenAlex'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`} title={`Source: ${candidate.source}`}>
                                {candidate.source}
                              </span>
                              <button
                                type="button"
                                className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-50 transition"
                                title="Add to favorites"
                              >
                                <IconHeart className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Expanded context section */}
                          {expandedCardId === candidate.reference_id && candidate.abstract && (
                            <div className="mt-3 p-3 rounded-lg bg-indigo-50/50 border border-indigo-100/80 text-[11px] leading-relaxed text-slate-700 animate-fade-in">
                              <span className="block text-[9px] uppercase tracking-wider text-indigo-600 font-bold mb-1">Kutipan Terkait dari Jurnal:</span>
                              <p className="italic font-medium text-slate-800">
                                "{findMostRelevantSentence(candidate.abstract, selectedText)}"
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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



