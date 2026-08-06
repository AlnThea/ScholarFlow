// c:/web/ScholarFlow/components/editor/editor-layout.tsx
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { EditorJsEditor, type EditorJsMethods } from './editorjs-editor';
import { EditorSidebar } from './editor-sidebar';
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
  IconSettings
} from '@tabler/icons-react';
import { MinimalSidebar } from './minimal-sidebar';
import { useLanguage } from '../i18n/language-context';
import type { ImproveWritingResponse } from '@/lib/api/ai';
import type { CitationCandidate } from '@/lib/api/citations';
import type { CitationHistoryEntry } from '@/lib/editor/citation-history';
import type { AiHistoryEntry } from '@/lib/editor/ai-history';
import type { BibliographyEntry } from '@/lib/editor/bibliography';
import type { DocumentListItem, DocumentEntry } from '@/lib/api/documents';
import { PricingModal } from './pricing-modal';
import { ShareDocumentModal } from './share-document-modal';
import { exportToWordFile, exportToPdfFile } from '@/lib/editor/citation-export-word';
import { useAuth } from '@/components/auth/auth-provider';
import { fetchPricingPlans, updatePricingPlan, createPricingPlan, deletePricingPlan, type PricingPlan } from '@/lib/api/pricing';
import { fetchPaymentGateways, updatePaymentGatewayStatus, type PaymentGateway } from '@/lib/api/payment-gateways';
import { type AIModel, createAIModel, deleteAIModel } from '@/lib/api/ai-models';

type SwitchProps = {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
};

const Switch = ({ checked, onChange, disabled }: SwitchProps) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-5.5 w-10 items-center rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${checked ? 'bg-indigo-650' : 'bg-slate-200'
        }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-all duration-200 ${checked ? 'translate-x-5' : 'translate-x-1.5'
          }`}
      />
    </button>
  );
};

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

const KatexPreview = ({ formula }: { formula: string }) => {
  const containerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    try {
      import('katex').then((kateMod) => {
        const katex = kateMod.default;
        if (containerRef.current) {
          katex.render(formula, containerRef.current, {
            displayMode: false,
            throwOnError: false
          });
        }
      });
    } catch (e) {
      if (containerRef.current) {
        containerRef.current.textContent = formula;
      }
    }
  }, [formula]);

  return <span ref={containerRef} className="text-slate-800 text-[11px] font-serif inline-block" />;
};

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
  onSaveSettings
}: EditorLayoutProps) {
  const { language, setLanguage, t } = useLanguage();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [currentBlockType, setCurrentBlockType] = useState('paragraph');
  const [currentAlignment, setCurrentAlignment] = useState('left');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isMathHelperOpen, setIsMathHelperOpen] = useState(false);
  const [mathToast, setMathToast] = useState<string | null>(null);
  const [dashboardExpandedProjects, setDashboardExpandedProjects] = useState<Record<string, boolean>>({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    is_enabled: true,
    is_premium: false
  });

  const handleOpenEditModelModal = (model: AIModel) => {
    setSelectedModelForModal(model);
    setModalModelState({
      id: model.id,
      name: model.name,
      model_id: model.model_id,
      is_enabled: model.is_enabled,
      is_premium: model.is_premium
    });
    setIsModelModalOpen(true);
  };

  const handleOpenCreateModelModal = () => {
    setSelectedModelForModal(null);
    setModalModelState({
      id: '',
      name: '',
      model_id: '',
      is_enabled: true,
      is_premium: false
    });
    setIsModelModalOpen(true);
  };

  const handleSaveModalModel = async () => {
    if (!modalModelState.id.trim() || !modalModelState.name.trim() || !modalModelState.model_id.trim()) {
      alert('ID Gateway, Nama Model, dan ID Model API harus diisi.');
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
          is_premium: modalModelState.is_premium
        });
        alert('Model AI berhasil diperbarui!');
        setIsModelModalOpen(false);
      } else {
        // Create mode
        await onCreateAIModel(modalModelState);
        alert('Model AI baru berhasil ditambahkan!');
        setIsModelModalOpen(false);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Gagal menyimpan model AI: ${err.message || err}`);
    } finally {
      setSavingModelId(null);
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus model AI "${modelId}"?`)) return;
    setSavingModelId(modelId);
    try {
      await onDeleteAIModel(modelId);
      alert('Model AI berhasil dihapus!');
    } catch (err: any) {
      console.error(err);
      alert(`Gagal menghapus model AI: ${err.message || err}`);
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
        setGatewaysList((prev) =>
          prev.map((g) => (g.id === gatewayId ? { ...g, is_enabled: isEnabled } : g))
        );
      } else {
        alert(`Gagal mengubah status gateway: ${res.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengubah status.');
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
        alert('Paket harga berhasil diperbarui!');
      } else {
        alert(`Gagal memperbarui paket: ${res.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan perubahan.');
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
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
    <path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4" />
    <path d="M5 18h1.5a1.5 1.5 0 0 0 0 -3h-1.5v6" />
    <path d="M17 18h-3v-3h3" />
    <path d="M14 18h3" />
    <path d="M10 15v6h1a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2h-1z" />
  </svg>
);

  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

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

  useEffect(() => {
    if (bubbleMode === 'citation') {
      setBubbleSearchQuery(selectedText);
    }
  }, [bubbleMode, selectedText]);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-expanded');
    if (saved !== null) setIsSidebarExpanded(saved === 'true');

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
      />

      {/* If no document is selected, render the Dashboard View */}
      {!currentDocument ? (
        <div className={`flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50 font-sans ${isAnyModalOpen ? 'select-none pointer-events-none' : ''}`}>
          <header className="flex items-center justify-between border-b border-slate-200/60 bg-white/95 px-6 py-3 sticky top-0 z-10 backdrop-blur">
            <div className="flex items-center gap-3">
              {!isSidebarExpanded && (
                <button
                  type="button"
                  aria-label="Menu"
                  className="p-1.5 rounded-md hover:bg-slate-100/80 transition text-slate-500 hover:text-slate-800"
                  style={{ background: 'transparent' }}
                  onClick={toggleSidebar}
                >
                  <IconMenu className="h-5 w-5" />
                </button>
              )}
              <span className="text-base font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                ScholarFlow Dashboard
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPricingOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition shadow-sm cursor-pointer"
              >
                <IconCreditCard className="h-4 w-4 text-slate-400" />
                Pricing
              </button>

              <button
                onClick={toggleDarkMode}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition shadow-sm cursor-pointer"
                title="Toggle Mode Gelap/Terang"
              >
                {isDarkMode ? (
                  <>
                    <IconSun className="h-4 w-4 text-amber-500" />
                    <span>Terang</span>
                  </>
                ) : (
                  <>
                    <IconMoon className="h-4 w-4 text-indigo-500" />
                    <span>Gelap</span>
                  </>
                )}
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 md:p-10">

            {activeDashboardTab === 'user' ? (
              <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 animate-fade-in">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
                  <div className="relative z-10 flex flex-col gap-2 max-w-lg">
                    <h1 className="text-xl md:text-2xl font-bold leading-tight">
                      Selamat datang kembali di ScholarFlow!
                    </h1>
                    <p className="text-xs md:text-sm text-indigo-100/90 leading-normal">
                      Platform asisten penulisan karya ilmiah Anda. Kelola draf jurnal akademik dan referensi PDF dalam satu tempat.
                    </p>
                  </div>
                  <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12 h-64 w-64 rounded-full border-[20px] border-white" />
                </div>

                {/* Quick Actions Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={onCreateDocument}
                    className="flex items-start gap-4 p-5 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md rounded-2xl text-left cursor-pointer transition group"
                  >
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-105 transition">
                      <IconFilePlus className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-slate-800">Buat Dokumen Baru</span>
                      <span className="text-xs text-slate-400 leading-normal">Mulai menulis draf jurnal akademik baru dengan panduan format sitasi CSL.</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      alert("Silakan klik menu 'Library' di sidebar kiri untuk mengelola rujukan PDF Anda.");
                    }}
                    className="flex items-start gap-4 p-5 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md rounded-2xl text-left cursor-pointer transition group"
                  >
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-105 transition">
                      <IconBook className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-slate-800">Kelola Koleksi Jurnal (Library)</span>
                      <span className="text-xs text-slate-400 leading-normal">Unggah berkas PDF / RIS Anda untuk dijadikan rujukan asisten AI.</span>
                    </div>
                  </button>
                </div>

                {/* Recent Documents list */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col gap-4">
                  <span className="text-sm font-bold text-slate-800">Daftar Dokumen Anda</span>

                  <div className="flex flex-col gap-1.5">
                    {documents.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {/* 1. Project Folders */}
                        {groupedDocs.projects.map((proj) => {
                          const isExpandedProject = !!dashboardExpandedProjects[proj.id];

                          return (
                            <div key={proj.id} className="flex flex-col gap-1 border border-slate-100 bg-slate-50/10 rounded-2xl p-3 shadow-sm">
                              {/* Project Header Row */}
                              <button
                                type="button"
                                onClick={() => setDashboardExpandedProjects(prev => ({ ...prev, [proj.id]: !isExpandedProject }))}
                                className="w-full flex items-center justify-between p-2 rounded-xl text-left transition hover:bg-slate-100/50 cursor-pointer"
                              >
                                <div className="flex items-center gap-3 truncate">
                                  {isExpandedProject ? (
                                    <IconFolderOpen className="h-5 w-5 text-indigo-500 shrink-0" />
                                  ) : (
                                    <IconFolder className="h-5 w-5 text-slate-400 shrink-0" />
                                  )}
                                  <span className="text-sm font-bold text-slate-800 truncate">{proj.name}</span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize shrink-0">
                                    {proj.type}
                                  </span>
                                </div>
                                <IconChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isExpandedProject ? 'rotate-180' : ''}`} />
                              </button>

                              {/* Project Sub Documents */}
                              {isExpandedProject && (
                                <div className="flex flex-col gap-1.5 pl-4 border-l-2 border-slate-100 ml-4.5 mt-1 animate-slide-in-top">
                                  {proj.docs.map((doc) => (
                                    <button
                                      key={doc.id}
                                      onClick={() => onSelectDocument?.(doc.id)}
                                      className="w-full flex items-center justify-between p-3 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/10 rounded-xl text-left transition cursor-pointer"
                                    >
                                      <div className="flex items-center gap-3">
                                        <IconFile className="h-4.5 w-4.5 text-slate-400" />
                                        <span className="text-xs font-semibold text-slate-700">
                                          📄 {doc.settings?.projectPart || doc.title}
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-slate-400">
                                        Diperbarui: {new Date(doc.updated_at).toLocaleDateString()}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* 2. Independent / Single Documents */}
                        {groupedDocs.independent.length > 0 && (
                          <div className="flex flex-col gap-1.5">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-1">Dokumen Mandiri</span>
                            {groupedDocs.independent.map((doc) => (
                              <button
                                key={doc.id}
                                onClick={() => onSelectDocument?.(doc.id)}
                                className="w-full flex items-center justify-between p-3 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/10 rounded-xl text-left transition cursor-pointer"
                              >
                                <div className="flex items-center gap-3">
                                  <IconFile className="h-4.5 w-4.5 text-slate-400" />
                                  <span className="text-xs font-semibold text-slate-700">{doc.title}</span>
                                </div>
                                <span className="text-[10px] text-slate-400">
                                  Diperbarui: {new Date(doc.updated_at).toLocaleDateString()}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 flex flex-col items-center justify-center gap-2">
                        <IconFile className="h-10 w-10 text-slate-300" />
                        <span className="text-xs text-slate-400">Belum ada dokumen yang dibuat.</span>
                        <button
                          onClick={onCreateDocument}
                          className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
                        >
                          Buat Dokumen Sekarang
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : activeDashboardTab === 'admin-pricing' ? (
              /* Admin Pricing Dashboard View */
              <div className="w-full flex flex-col gap-8 animate-fade-in px-4 md:px-8 py-2">
                <div className="bg-gradient-to-r from-violet-600 via-indigo-700 to-indigo-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="relative z-10 flex flex-col gap-2 max-w-lg">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full self-start backdrop-blur-sm">
                      Pricing Control Panel
                    </span>
                    <h1 className="text-xl md:text-2xl font-extrabold leading-tight flex items-center gap-2">
                      Kelola Paket Harga & Layanan
                    </h1>
                    <p className="text-xs md:text-sm text-indigo-100/90 leading-normal font-medium">
                      Atur harga paket langganan secara dinamis, berikan teks promosi musiman, ubah daftar fitur unggulan, dan kelola CRUD data paket.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenCreateModal}
                    className="relative z-10 flex items-center gap-2 px-5 py-3 bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-black rounded-xl shadow-lg transition-all duration-200 cursor-pointer self-start md:self-auto"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Tambah Paket Baru
                  </button>
                  <div className="absolute right-0 bottom-0 opacity-15 translate-x-12 translate-y-12 h-64 w-64 rounded-full border-[20px] border-white" />
                </div>

                {loadingAdminPlans ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200/80 rounded-3xl shadow-sm">
                    <IconLoader className="h-8 w-8 text-indigo-600 animate-spin" />
                    <span className="text-xs text-slate-400 font-semibold">Memuat data paket pricing...</span>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200/85 rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            <th className="px-6 py-4.5 font-bold w-[120px]">ID Paket</th>
                            <th className="px-6 py-4.5 font-bold min-w-[180px]">Nama Paket</th>
                            <th className="px-6 py-4.5 font-bold min-w-[160px]">Harga (Rp)</th>
                            <th className="px-6 py-4.5 font-bold min-w-[120px]">Periode</th>
                            <th className="px-6 py-4.5 font-bold min-w-[165px]">Promo Tagline</th>
                            <th className="px-6 py-4.5 font-bold text-center w-[160px]">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80 text-xs">
                          {adminPlans.map((plan) => {
                            return (
                              <tr key={plan.id} className="hover:bg-slate-50/30 transition-all duration-150">
                                {/* ID Paket */}
                                <td className="px-6 py-5.5 align-middle">
                                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                                    {plan.id}
                                  </span>
                                </td>

                                {/* Nama Paket */}
                                <td className="px-6 py-5.5 align-middle">
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-slate-800 text-sm">{plan.name}</span>
                                    {plan.is_popular && (
                                      <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-600">
                                        Terpopuler
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Harga */}
                                <td className="px-6 py-5.5 align-middle font-bold text-slate-800 text-sm">
                                  {plan.price === 0 ? (
                                    <span className="text-emerald-600 font-extrabold uppercase text-xs">Gratis</span>
                                  ) : (
                                    `Rp ${plan.price.toLocaleString('id-ID')}`
                                  )}
                                </td>

                                {/* Periode */}
                                <td className="px-6 py-5.5 align-middle text-slate-500 font-bold">
                                  {plan.price_period}
                                </td>

                                {/* Promo Tagline */}
                                <td className="px-6 py-5.5 align-middle">
                                  {plan.promo_text ? (
                                    <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 text-[10px]">
                                      {plan.promo_text}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 italic text-[10px]">Tidak ada</span>
                                  )}
                                </td>

                                {/* Aksi */}
                                <td className="px-6 py-5.5 align-middle text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => handleOpenEditModal(plan)}
                                      className="flex items-center justify-center p-2.5 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 rounded-xl transition cursor-pointer"
                                      title="Edit detail & fitur paket"
                                    >
                                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                      </svg>
                                    </button>

                                    <button
                                      onClick={() => handleDeletePlan(plan.id)}
                                      className="flex items-center justify-center p-2.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-650 rounded-xl transition cursor-pointer"
                                      title="Hapus paket langganan"
                                    >
                                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                      </svg>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : activeDashboardTab === 'admin-models' ? (
              /* Admin AI Models Dashboard View */
              <div className="w-full flex flex-col gap-8 animate-fade-in px-4 md:px-8 py-2">
                <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="relative z-10 flex flex-col gap-2 max-w-lg">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full self-start backdrop-blur-sm">
                      AI Gateway Admin Panel
                    </span>
                    <h1 className="text-xl md:text-2xl font-extrabold leading-tight flex items-center gap-2">
                      Kelola Model AI & LLM Gateway
                    </h1>
                    <p className="text-xs md:text-sm text-indigo-100/90 leading-normal font-medium">
                      Atur model kecerdasan buatan, ubah ID model API (Google Gemini / OpenRouter), dan batasi hak akses model khusus untuk pengguna premium (Pro Writer).
                    </p>
                  </div>
                  <button
                    onClick={handleOpenCreateModelModal}
                    className="relative z-10 flex items-center gap-2 px-5 py-3 bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-black rounded-xl shadow-lg transition-all duration-200 cursor-pointer self-start md:self-auto"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Tambah Model Baru
                  </button>
                  <div className="absolute right-0 bottom-0 opacity-15 translate-x-12 translate-y-12 h-64 w-64 rounded-full border-[20px] border-white" />
                </div>

                <div className="bg-white border border-slate-200/85 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          <th className="px-6 py-4.5 font-bold min-w-[120px]">Status</th>
                          <th className="px-6 py-4.5 font-bold min-w-[120px]">Gateway Key</th>
                          <th className="px-6 py-4.5 font-bold min-w-[200px]">Nama Tampilan Model</th>
                          <th className="px-6 py-4.5 font-bold min-w-[240px]">ID Model API Asli</th>
                          <th className="px-6 py-4.5 font-bold min-w-[160px]">Hak Akses</th>
                          <th className="px-6 py-4.5 font-bold text-center w-[160px]">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/80 text-xs">
                        {aiModels.map((model) => {
                          return (
                            <tr key={model.id} className="hover:bg-slate-50/30 transition-all duration-150">
                              {/* Status */}
                              <td className="px-6 py-5.5 align-middle">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${model.is_enabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                  <span className={`text-[10px] font-bold uppercase ${model.is_enabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {model.is_enabled ? 'Aktif' : 'Off'}
                                  </span>
                                </div>
                              </td>

                              {/* Gateway Key */}
                              <td className="px-6 py-5.5 align-middle font-black text-slate-700 uppercase tracking-wide">
                                {model.id}
                              </td>

                              {/* Nama Tampilan Model */}
                              <td className="px-6 py-5.5 align-middle font-bold text-slate-800 text-sm">
                                {model.name}
                              </td>

                              {/* ID Model API Asli */}
                              <td className="px-6 py-5.5 align-middle font-mono text-slate-600 text-xs">
                                {model.model_id}
                              </td>

                              {/* Hak Akses */}
                              <td className="px-6 py-5.5 align-middle">
                                <span className={`text-[9px] font-black uppercase ${model.is_premium
                                  ? 'text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100'
                                  : 'text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/40'
                                  }`}>
                                  {model.is_premium ? 'Pro Writer' : 'Free Tier'}
                                </span>
                              </td>

                              {/* Aksi */}
                              <td className="px-6 py-5.5 align-middle text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleOpenEditModelModal(model)}
                                    className="flex items-center justify-center p-2.5 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 rounded-xl transition cursor-pointer"
                                    title="Edit detail & API ID model"
                                  >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                    </svg>
                                  </button>

                                  <button
                                    onClick={() => handleDeleteModel(model.id)}
                                    className="flex items-center justify-center p-2.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-650 rounded-xl transition cursor-pointer"
                                    title="Hapus model AI"
                                  >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : activeDashboardTab === 'admin-gateways' ? (
              /* Admin Payment Gateways Dashboard View */
              <div className="w-full flex flex-col gap-8 animate-fade-in px-4 md:px-8 py-2">
                <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                  <div className="relative z-10 flex flex-col gap-2 max-w-lg">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full self-start backdrop-blur-sm">
                      Payment Gateway Config
                    </span>
                    <h1 className="text-xl md:text-2xl font-extrabold leading-tight flex items-center gap-2">
                      Kelola Saluran Pembayaran
                    </h1>
                    <p className="text-xs md:text-sm text-indigo-100/90 leading-normal font-medium">
                      Konfigurasikan metode pembayaran Stripe dan Midtrans, atur API Merchant Key, dan aktifkan integrasi transaksi tagihan langganan otomatis.
                    </p>
                  </div>
                  <div className="absolute right-0 bottom-0 opacity-15 translate-x-12 translate-y-12 h-64 w-64 rounded-full border-[20px] border-white" />
                </div>

                <div className="bg-white border border-slate-200/85 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          <th className="px-6 py-4.5 font-bold min-w-[140px]">Status</th>
                          <th className="px-6 py-4.5 font-bold min-w-[160px]">Platform Gateway</th>
                          <th className="px-6 py-4.5 font-bold min-w-[260px]">Client Key / Publishable Key</th>
                          <th className="px-6 py-4.5 font-bold min-w-[260px]">Server Key / Secret Key</th>
                          <th className="px-6 py-4.5 font-bold text-center w-[100px]">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/80 text-xs">
                        {gatewaysList.map((g) => (
                          <tr key={g.id} className="hover:bg-slate-50/30 transition-all duration-150">
                            {/* Status */}
                            <td className="px-6 py-5.5 align-middle">
                              <div className="flex items-center gap-3">
                                <Switch
                                  checked={g.is_enabled}
                                  onChange={() => handleToggleGateway(g.id, !g.is_enabled)}
                                  disabled={togglingGatewayId === g.id}
                                />
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-2 h-2 rounded-full ${g.is_enabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                  <span className="text-[10px] text-slate-500 font-bold uppercase">{g.is_enabled ? 'Aktif' : 'Off'}</span>
                                </div>
                              </div>
                            </td>

                            {/* Platform Gateway */}
                            <td className="px-6 py-5.5 align-middle">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-extrabold text-slate-800 text-sm">{g.name}</span>
                                <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">
                                  {g.id === 'stripe' ? 'Internasional' : 'Lokal / Bank'}
                                </span>
                              </div>
                            </td>

                            {/* Client/Publishable Key */}
                            <td className="px-6 py-5.5 align-middle">
                              <input
                                type="text"
                                value={g.id === 'stripe' ? 'pk_test_51NxM2aGS9r89123891789' : 'SB-Mid-client-8aHs12Hsa'}
                                disabled
                                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 outline-none transition bg-slate-100/50 font-mono select-all"
                              />
                            </td>

                            {/* Server/Secret Key */}
                            <td className="px-6 py-5.5 align-middle">
                              <input
                                type="password"
                                value="••••••••••••••••••••••••••••••••••••"
                                disabled
                                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 outline-none transition bg-slate-100/50 font-mono"
                              />
                            </td>

                            {/* Aksi */}
                            <td className="px-6 py-5.5 align-middle text-center">
                              <button
                                disabled
                                className="inline-flex items-center justify-center p-3 bg-slate-100 border border-slate-200 text-slate-400 rounded-xl transition-all duration-200 cursor-not-allowed"
                                title="API credentials terkunci secara default"
                              >
                                <IconDeviceFloppy className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              /* Billing & Account View */
              <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 animate-fade-in">
                {/* Account profile card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
                  <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-2xl font-extrabold text-indigo-700">
                    {profile?.full_name?.slice(0, 2).toUpperCase() || 'SF'}
                  </div>
                  <div className="flex-1 flex flex-col gap-1 text-center md:text-left">
                    <span className="text-base font-bold text-slate-800">{profile?.full_name || 'User ScholarFlow'}</span>
                    <span className="text-xs text-slate-400">{user?.email || 'email@scholarflow.app'}</span>
                    <div className="mt-2 flex flex-wrap gap-2 items-center justify-center md:justify-start">
                      <span className="px-2.5 py-0.5 bg-slate-100 border border-slate-200/80 rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Role: {role}
                      </span>
                      <span className={`px-2.5 py-0.5 border rounded-md text-[10px] font-bold uppercase tracking-wider ${activePlanId === 'pro'
                        ? 'bg-indigo-50 border-indigo-100 text-indigo-700'
                        : 'bg-slate-100 border-slate-200/80 text-slate-500'
                        }`}>
                        Paket: {activePlanId === 'pro' ? 'Pro Writer' : 'Free Plan'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Billing Status & Expiration info */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                  <span className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Status Langganan</span>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-500">Masa Aktif Layanan</span>
                      {activePlanId === 'pro' ? (
                        <span className="text-xs font-semibold text-slate-700">
                          Aktif sampai dengan: <span className="text-indigo-600 font-bold">{profile?.subscription_end ? new Date(profile.subscription_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Anda saat ini menggunakan paket gratis dengan fitur terbatas.
                        </span>
                      )}
                    </div>
                    {activePlanId !== 'pro' && (
                      <button
                        onClick={() => setIsPricingOpen(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
                      >
                        Upgrade ke Pro Writer
                      </button>
                    )}
                  </div>
                </div>

                {/* Transaction History & printable receipt */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                  <span className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Riwayat Transaksi</span>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="pb-2 font-bold">No. Invoice</th>
                          <th className="pb-2 font-bold">Tanggal</th>
                          <th className="pb-2 font-bold">Nominal</th>
                          <th className="pb-2 font-bold">Metode</th>
                          <th className="pb-2 font-bold">Status</th>
                          <th className="pb-2 text-right font-bold">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        {activePlanId === 'pro' ? (
                          <tr>
                            <td className="py-3 font-semibold text-slate-700">INV-SF-90342</td>
                            <td className="py-3">Hari Ini</td>
                            <td className="py-3 font-bold text-slate-800">Rp 149.000</td>
                            <td className="py-3">Simulated Checkout</td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold rounded text-[9px] uppercase">
                                Lunas
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => {
                                  const w = window.open('', '_blank');
                                  if (w) {
                                    w.document.write(`
                                    <html>
                                      <head>
                                        <title>Invoice INV-SF-90342</title>
                                        <style>
                                          body { font-family: sans-serif; padding: 40px; color: #333; }
                                          .invoice-box { max-w: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); }
                                          table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; }
                                          table td { padding: 5px; vertical-align: top; }
                                          table tr td:nth-child(2) { text-align: right; }
                                          table tr.top table td { padding-bottom: 20px; }
                                          table tr.top table td.title { font-size: 45px; line-height: 45px; color: #333; font-weight: bold; }
                                          table tr.information table td { padding-bottom: 40px; }
                                          table tr.heading td { background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; }
                                          table tr.details td { padding-bottom: 20px; }
                                          table tr.item td { border-bottom: 1px solid #eee; }
                                          table tr.item.last td { border-bottom: none; }
                                          table tr.total td:nth-child(2) { border-top: 2px solid #eee; font-weight: bold; }
                                        </style>
                                      </head>
                                      <body>
                                        <div class="invoice-box">
                                          <table>
                                            <tr class="top">
                                              <td colspan="2">
                                                <table>
                                                  <tr>
                                                    <td class="title">ScholarFlow</td>
                                                    <td>
                                                      Invoice #: INV-SF-90342<br>
                                                      Tanggal: ${new Date().toLocaleDateString('id-ID')}<br>
                                                      Jatuh Tempo: LUNAS
                                                    </td>
                                                  </tr>
                                                </table>
                                              </td>
                                            </tr>
                                            <tr class="information">
                                              <td colspan="2">
                                                <table>
                                                  <tr>
                                                    <td>
                                                      ScholarFlow Indonesia Inc.<br>
                                                      support@scholarflow.app
                                                    </td>
                                                    <td>
                                                      ${profile?.full_name || 'User ScholarFlow'}<br>
                                                      ${user?.email || 'email@scholarflow.app'}
                                                    </td>
                                                  </tr>
                                                </table>
                                              </td>
                                            </tr>
                                            <tr class="heading">
                                              <td>Metode Pembayaran</td>
                                              <td>Jumlah</td>
                                            </tr>
                                            <tr class="details">
                                              <td>Global Gateway Simulation</td>
                                              <td>Rp 149.000</td>
                                            </tr>
                                            <tr class="heading">
                                              <td>Item Paket</td>
                                              <td>Harga</td>
                                            </tr>
                                            <tr class="item last">
                                              <td>Langganan Paket Pro Writer (30 Hari)</td>
                                              <td>Rp 149.000</td>
                                            </tr>
                                            <tr class="total">
                                              <td></td>
                                              <td>Total: Rp 149.000</td>
                                            </tr>
                                          </table>
                                        </div>
                                        <script>window.print();</script>
                                      </body>
                                    </html>
                                  `);
                                    w.document.close();
                                  }
                                }}
                                className="text-xs text-indigo-600 hover:text-indigo-850 font-bold transition cursor-pointer"
                              >
                                Cetak Struk
                              </button>
                            </td>
                          </tr>
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-slate-400">
                              Belum ada riwayat transaksi pembayaran.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Main content area */
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Navbar 1 – Document title and actions */}
          <header className="flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-3 lg:sticky lg:top-0 z-30 backdrop-blur whitespace-nowrap">
            <div className="w-full flex items-center gap-3">
              {!isSidebarExpanded && (
                <button
                  type="button"
                  aria-label="Menu"
                  className="p-1.5 rounded-md hover:bg-slate-100/80 transition text-slate-500 hover:text-slate-800"
                  style={{ background: 'transparent' }}
                  onClick={toggleSidebar}
                >
                  <IconMenu className="h-5 w-5" />
                </button>
              )}
              <input
                type="text"
                placeholder="Untitled Document"
                value={currentDocument?.title || ''}
                onChange={(e) => onRenameDocument(e.target.value)}
                className="w-full border-b border-transparent focus:border-indigo-400 text-base font-semibold text-slate-800 outline-none bg-transparent px-1 py-0.5 transition"
              />

            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/50">
                {/* Export Dropdown */}
                <div className="relative">
                  <button
                    disabled={isExporting || isExportingPdf}
                    onClick={() => setShowExportDropdown(prev => !prev)}
                    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-650 hover:bg-white hover:text-slate-800 disabled:opacity-70 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    {isExporting || isExportingPdf ? (
                      <IconLoader className="h-3.5 w-3.5 text-indigo-500 animate-spin" />
                    ) : (
                      <IconDownload className="h-3.5 w-3.5 text-slate-500" />
                    )}
                    {isExporting || isExportingPdf ? (
                      language === 'en' ? 'Exporting...' : 'Mengekspor...'
                    ) : (
                      language === 'en' ? 'Export' : 'Ekspor'
                    )}
                    <IconChevronDown className="h-3 w-3 text-slate-400" />
                  </button>

                  {showExportDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowExportDropdown(false)} />
                      <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200/80 bg-white py-1 shadow-[0_10px_35px_rgba(0,0,0,0.08)] z-50 animate-scale-in">
                        {/* Document Exporters */}
                        <div className="px-3 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          {language === 'en' ? 'Document' : 'Dokumen'}
                        </div>
                        <button
                          onClick={async () => {
                            setShowExportDropdown(false);
                            setIsExporting(true);
                            try {
                              const title = currentDocument?.title || 'Untitled Document';
                              const docContent = currentDocument?.content;
                              let bList: any[] = [];
                              if (docContent) {
                                try {
                                  const parsed = typeof docContent === 'string' ? JSON.parse(docContent) : docContent;
                                  bList = parsed.blocks || [];
                                } catch (e) {
                                  console.error(e);
                                }
                              }
                              const isPro = activePlanId !== 'free';
                              const bibs = isPro ? bibliographyEntries.map(e => e.formatted) : [];
                              await exportToWordFile(title, bList, bibs, language, isPro);
                            } catch (err) {
                              console.error('Export failed:', err);
                            } finally {
                              setIsExporting(false);
                            }
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-650 hover:bg-slate-50 transition cursor-pointer"
                        >
                          <IconFileWord className="h-4 w-4 text-blue-500 shrink-0" />
                          <span>Microsoft Word (.docx)</span>
                        </button>
                        <button
                          onClick={async () => {
                            setShowExportDropdown(false);
                            setIsExportingPdf(true);
                            try {
                              const title = currentDocument?.title || 'Untitled Document';
                              const docContent = currentDocument?.content;
                              let bList: any[] = [];
                              if (docContent) {
                                try {
                                  const parsed = typeof docContent === 'string' ? JSON.parse(docContent) : docContent;
                                  bList = parsed.blocks || [];
                                } catch (e) {
                                  console.error(e);
                                }
                              }
                              const isPro = activePlanId !== 'free';
                              const bibs = isPro ? bibliographyEntries.map(e => e.formatted) : [];
                              await exportToPdfFile(title, bList, bibs, language, isPro);
                            } catch (err) {
                              console.error('Export PDF failed:', err);
                            } finally {
                              setIsExportingPdf(false);
                            }
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-650 hover:bg-slate-50 transition cursor-pointer"
                        >
                          <IconFilePdf className="h-4 w-4 text-red-500 shrink-0" />
                          <span>PDF Document (.pdf)</span>
                        </button>

                        {/* Divider */}
                        <div className="h-px bg-slate-100 my-1" />

                        {/* Bibliography Exporters */}
                        <div className="px-3 py-1.5 flex items-center justify-between">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            {language === 'en' ? 'Bibliography' : 'Daftar Pustaka'}
                          </span>
                          <span className="text-[9px] bg-slate-100 text-slate-500 font-semibold px-1.5 py-0.2 rounded-full shrink-0">
                            {bibliographyEntries.length}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setShowExportDropdown(false);
                            if (activePlanId === 'free') {
                              setIsExportUpgradeModalOpen(true);
                            } else {
                              onExportBibliographyText();
                            }
                          }}
                          disabled={bibliographyEntries.length === 0}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-650 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <IconFileText className="h-4 w-4 text-slate-500 shrink-0" />
                          <span>Plain Text (.txt)</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowExportDropdown(false);
                            if (activePlanId === 'free') {
                              setIsExportUpgradeModalOpen(true);
                            } else {
                              onExportBibliographyJson();
                            }
                          }}
                          disabled={bibliographyEntries.length === 0}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-650 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <IconBraces className="h-4 w-4 text-amber-500 shrink-0" />
                          <span>JSON Format (.json)</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowExportDropdown(false);
                            if (activePlanId === 'free') {
                              setIsExportUpgradeModalOpen(true);
                            } else {
                              onExportBibliographyBibtex();
                            }
                          }}
                          disabled={bibliographyEntries.length === 0}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-650 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <IconBook className="h-4 w-4 text-indigo-500 shrink-0" />
                          <span>BibTeX Format (.bib)</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowExportDropdown(false);
                            if (activePlanId === 'free') {
                              setIsExportUpgradeModalOpen(true);
                            } else {
                              onExportBibliographyRis();
                            }
                          }}
                          disabled={bibliographyEntries.length === 0}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-650 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <IconDatabase className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>RIS Format (.ris)</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Divider */}
                <div className="h-4 w-px bg-slate-200/80 mx-0.5" />

                {/* Share Button */}
                <button
                  onClick={() => setIsShareOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-650 hover:bg-white hover:text-slate-800 transition cursor-pointer"
                >
                  <IconShare className="h-3.5 w-3.5 text-slate-500" />
                  {language === 'en' ? 'Share' : 'Bagikan'}
                </button>

                {/* Divider */}
                <div className="h-4 w-px bg-slate-200/80 mx-0.5" />

                {/* Pricing Button */}
                <button
                  onClick={() => setIsPricingOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-650 hover:bg-white hover:text-slate-800 transition cursor-pointer"
                >
                  <IconCreditCard className="h-3.5 w-3.5 text-slate-500" />
                  {language === 'en' ? 'Pricing' : 'Langganan'}
                </button>

                {/* Divider */}
                <div className="h-4 w-px bg-slate-200/80 mx-0.5" />

                {/* Research Assistant Button */}
                <button
                  onClick={() => setShowRightSidebar(prev => !prev)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    showRightSidebar
                      ? 'bg-white text-indigo-750 shadow-sm font-bold'
                      : 'text-slate-650 hover:bg-white hover:text-slate-800'
                  }`}
                  title={language === 'en' ? 'Toggle Research Assistant Panel' : 'Toggle Bilah Asisten Riset'}
                >
                  <IconLayoutSidebarRightCollapse className={`h-3.5 w-3.5 ${showRightSidebar ? 'text-indigo-650' : 'text-slate-500'}`} />
                  {language === 'en' ? 'Research Assistant' : 'Asisten Riset'}
                </button>

                {/* Settings Button */}
                {currentDocument && onOpenSettings && (
                  <>
                    {/* Divider */}
                    <div className="h-4 w-px bg-slate-200/80 mx-0.5" />
                    <button
                      type="button"
                      onClick={onOpenSettings}
                      className="p-1.5 rounded-md hover:bg-white text-slate-500 hover:text-slate-800 transition cursor-pointer flex items-center justify-center shrink-0"
                      title={language === 'en' ? 'Document & Research Settings' : 'Pengaturan Dokumen & Riset'}
                    >
                      <IconSettings className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Navbar 2 – Academic Formatting Toolbar */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 bg-white px-6 py-2.5 lg:sticky lg:top-[57px] z-10 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
            {/* Undo / Redo */}
            <button
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
              title="Undo"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editorJsRef.current?.undo()}
            >
              <IconArrowBackUp className="h-4 w-4" />
            </button>
            <button
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
              title="Redo"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editorJsRef.current?.redo()}
            >
              <IconArrowForwardUp className="h-4 w-4" />
            </button>

            <div className="h-5 w-px bg-slate-200 mx-1" />

            {/* Block Selection */}
            <select
              aria-label="Text style"
              value={currentBlockType}
              onChange={(e) => editorJsRef.current?.setBlockType(e.target.value)}
              className="h-8 rounded border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            >
              <option value="paragraph">Paragraph / Text</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="h4">Heading 4</option>
              <option value="h5">Heading 5</option>
              <option value="h6">Heading 6</option>
            </select>

            {/* Font Size Selection */}
            <select
              aria-label="Font size"
              value={currentFontSize}
              onChange={(e) => {
                editorJsRef.current?.setFontSize(e.target.value);
                setCurrentFontSize(e.target.value);
              }}
              className="h-8 rounded border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 cursor-pointer"
            >
              <option value="">Font Size (Default)</option>
              <option value="12px">12px</option>
              <option value="14px">14px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
              <option value="20px">20px</option>
              <option value="24px">24px</option>
              <option value="32px">32px</option>
            </select>

            <div className="h-5 w-px bg-slate-200 mx-1" />

            {/* Inline Formats */}
            <button
              className={getBtnClass(activeFormats.bold)}
              title="Bold"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editorJsRef.current?.toggleInlineFormat('bold')}
            >
              <IconBold className="h-4 w-4" />
            </button>
            <button
              className={getBtnClass(activeFormats.italic)}
              title="Italic"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editorJsRef.current?.toggleInlineFormat('italic')}
            >
              <IconItalic className="h-4 w-4" />
            </button>
            <button
              className={getBtnClass(activeFormats.underline)}
              title="Underline"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editorJsRef.current?.toggleInlineFormat('underline')}
            >
              <IconUnderline className="h-4 w-4" />
            </button>
            <button
              className={getBtnClass(activeFormats.strikethrough)}
              title="Strikethrough"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editorJsRef.current?.toggleInlineFormat('strikethrough')}
            >
              <IconStrikethrough className="h-4 w-4" />
            </button>
            <button
              className={getBtnClass(activeFormats.code)}
              title="Inline Code"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editorJsRef.current?.toggleInlineFormat('code')}
            >
              <IconCode className="h-4 w-4" />
            </button>
            <button
              className={getBtnClass(activeFormats.superscript)}
              title="Superscript"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editorJsRef.current?.toggleInlineFormat('superscript')}
            >
              <IconSuperscript className="h-4 w-4" />
            </button>
            <button
              className={getBtnClass(activeFormats.subscript)}
              title="Subscript"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editorJsRef.current?.toggleInlineFormat('subscript')}
            >
              <IconSubscript className="h-4 w-4" />
            </button>
            <button
              className={getBtnClass(activeFormats.link)}
              title="Insert Link"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editorJsRef.current?.toggleInlineFormat('link')}
            >
              <IconLink className="h-4 w-4" />
            </button>
            <button
              className={getBtnClass(activeFormats.highlight)}
              title="Highlight text"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => handleHighlightButtonClick(e, 'toolbar')}
            >
              <IconHighlight className="h-4 w-4" />
            </button>

            {/* Alignment Buttons */}
            <div className="h-5 w-px bg-slate-200 mx-1" />
            <button
              className={getBtnClass(currentAlignment === 'left')}
              title="Align Left"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editorJsRef.current?.setBlockAlignment('left')}
            >
              <IconAlignLeft className="h-4 w-4" />
            </button>
            <button
              className={getBtnClass(currentAlignment === 'center')}
              title="Align Center"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editorJsRef.current?.setBlockAlignment('center')}
            >
              <IconAlignCenter className="h-4 w-4" />
            </button>
            <button
              className={getBtnClass(currentAlignment === 'right')}
              title="Align Right"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editorJsRef.current?.setBlockAlignment('right')}
            >
              <IconAlignRight className="h-4 w-4" />
            </button>
            <button
              className={getBtnClass(currentAlignment === 'justify')}
              title="Justify"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editorJsRef.current?.setBlockAlignment('justify')}
            >
              <IconAlignJustified className="h-4 w-4" />
            </button>

            <div className="h-5 w-px bg-slate-200 mx-1" />

            {/* Citation Button */}
            <button
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-indigo-50 hover:bg-indigo-100/80 text-xs font-semibold text-indigo-700 transition"
              title="Insert Inline Citation"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onInsertCitation}
            >
              <IconAt className="h-4 w-4" />
              Citation
            </button>

            <div className="h-5 w-px bg-slate-200 mx-1" />

            {/* Blocks & Math insertions */}
            <button
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
              title="Insert Image Block"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setImageUrlInput('');
                setIsImageModalOpen(true);
              }}
            >
              <IconPhoto className="h-4 w-4" />
            </button>
            <button
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
              title="Insert Table Block"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editorJsRef.current?.insertTable()}
            >
              <IconTable className="h-4 w-4" />
            </button>
            <button
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
              title="Insert Code Block"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editorJsRef.current?.insertCodeBlock()}
            >
              <IconCode className="h-4 w-4 text-indigo-600" />
            </button>

            <div className="h-5 w-px bg-slate-200 mx-1" />

            {/* Math Tools - Just Icons */}
            <button
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
              title="Insert Inline Equation"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                editorJsRef.current?.saveSelectionRange();
                setMathFormulaInput(selectedText || '');
                setIsMathModalOpen(true);
              }}
            >
              <IconSum className="h-4 w-4 text-indigo-600" />
            </button>
            <button
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
              title="Insert Math Block (LaTeX)"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editorJsRef.current?.insertMathBlock()}
            >
              <IconMath className="h-4 w-4 text-indigo-600" />
            </button>
            <button
              className={`p-1.5 rounded transition ${isMathHelperOpen
                ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              title="Bantuan Rumus LaTeX (Math Helper)"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setIsMathHelperOpen(prev => !prev)}
            >
              <IconCalculator className="h-4 w-4 text-indigo-500" />
            </button>

            <div className="ml-auto text-xs font-medium text-slate-400 bg-slate-100/50 px-2 py-1 rounded">
              {statusLabel}
            </div>
          </div>

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
              style={{
                top: `${bubbleMenuRect.bottom + 10}px`,
                left: `${Math.max(10, bubbleMenuRect.left + bubbleMenuRect.width / 2 - (bubbleMode === 'citation' ? 240 : 155))}px`,
                width: bubbleMode === 'citation' ? '480px' : '310px',
              }}
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
                          aiModels.filter(m => m.is_enabled).map(m => (
                            <option key={m.id} value={m.id}>
                              {m.name.replace(" (Direct)", "").replace(" (Free OR)", "").replace(" (Pro OR)", "")}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="gemini">Gemini</option>
                            <option value="llama3">Llama 3</option>
                            <option value="gemma2">Gemma 2</option>
                            <option value="claude">Claude</option>
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

                  {/* Actions Section Header */}
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100/50 text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/40">
                    <span>{t('menu.actions')}</span>
                  </div>

                  {/* Actions List */}
                  <div className="flex flex-col">
                    {/* Poles AI Button */}
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-slate-700 hover:bg-slate-50 transition font-semibold cursor-pointer border-b border-slate-100/40 disabled:opacity-50 disabled:bg-slate-50/50"
                      onMouseDown={e => e.preventDefault()}
                      disabled={isImproving}
                      onClick={() => {
                        const modelObj = aiModels.find(m => m.id === selectedAiModel);
                        const isPremium = modelObj ? modelObj.is_premium : (selectedAiModel === 'claude');
                        if (isPremium && activePlanId === 'free') {
                          alert(language === 'en'
                            ? `🔒 Model "${modelObj?.name || 'Premium'}" is exclusive to Pro Writer plans. Please upgrade your account.`
                            : `🔒 Model "${modelObj?.name || 'Premium'}" khusus untuk pengguna paket Pro Writer. Silakan upgrade akun Anda.`
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
                          alert(language === 'en'
                            ? `🔒 Model "${modelObj?.name || 'Premium'}" is exclusive to Pro Writer plans. Please upgrade your account.`
                            : `🔒 Model "${modelObj?.name || 'Premium'}" khusus untuk pengguna paket Pro Writer. Silakan upgrade akun Anda.`
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
          <div className="flex flex-1 overflow-hidden">
            <main
              className="w-full flex-1 p-6 md:p-10 overflow-y-auto"
              onContextMenu={(e) => {
                const selection = window.getSelection();
                if (selection && !selection.isCollapsed && selection.toString().trim()) {
                  const holder = document.getElementById('editorjs-holder');
                  if (holder && holder.contains(selection.anchorNode)) {
                    e.preventDefault();
                    const range = selection.getRangeAt(0);
                    setBubbleMenuRect(range.getBoundingClientRect());
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
                onAlignmentChange={setCurrentAlignment}
                onStatsChange={onStatsChange}
                onCiteClick={onCiteClick}
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

            {/* Spacer layout to prevent overlapping the canvas on large screens */}
            {showRightSidebar && (
              <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${isRightSidebarExpanded ? 'w-[360px]' : 'w-16'}`} />
            )}

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
              />
            )}

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
        documentId={currentDocument?.id}
        documentTitle={currentDocument?.title}
        settings={currentDocument?.settings}
        onSaveSettings={onSaveSettings}
      />
      {mounted && isExportUpgradeModalOpen && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xl w-full max-w-md flex flex-col gap-5 animate-scale-in text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <span>🔒</span>
                {language === 'en' ? 'Pro Feature Locked' : 'Fitur Pro Terkunci'}
              </h3>
              <button
                onClick={() => setIsExportUpgradeModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-100/80 hover:text-slate-650 transition cursor-pointer"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-center py-4 bg-indigo-50/50 rounded-xl border border-indigo-100/40 text-indigo-600">
                <IconDatabase className="h-12 w-12" />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed text-center">
                {language === 'en'
                  ? 'Bibliography Export (.bib, .ris, .txt, .json) is exclusive to Pro Writer plans. Upgrade now to seamlessly export your references for Mendeley, Zotero, or LaTeX.'
                  : 'Fitur Ekspor Daftar Pustaka (.bib, .ris, .txt, .json) khusus untuk pengguna paket Pro Writer. Upgrade akun Anda untuk mengekspor referensi secara instan untuk Mendeley, Zotero, atau LaTeX.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => setIsExportUpgradeModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 transition cursor-pointer"
              >
                {language === 'en' ? 'Close' : 'Tutup'}
              </button>
              <button
                onClick={() => {
                  setIsExportUpgradeModalOpen(false);
                  setIsPricingOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer shadow-sm shadow-indigo-200"
              >
                {language === 'en' ? 'See Pricing / Upgrade' : 'Lihat Paket & Upgrade'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {mounted && isImageModalOpen && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xl w-full max-w-md flex flex-col gap-5 animate-scale-in text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-800">
                Sisipkan Gambar via URL
              </h3>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-100/80 hover:text-slate-650 transition cursor-pointer"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                Masukkan alamat URL gambar (misalnya dari internet) untuk menyisipkannya langsung ke dalam dokumen Anda.
              </p>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">URL Gambar</label>
                <input
                  type="text"
                  placeholder="https://example.com/image.png"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleInsertImageConfirm();
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleInsertImageConfirm}
                disabled={!imageUrlInput.trim()}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Sisipkan Gambar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {mounted && isMathModalOpen && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xl w-full max-w-md flex flex-col gap-5 animate-scale-in text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-800">
                {editingMathCallback ? 'Edit Rumus Matematika (LaTeX)' : 'Sisipkan Rumus Matematika (LaTeX)'}
              </h3>
              <button
                onClick={() => {
                  setIsMathModalOpen(false);
                  setEditingMathCallback(null);
                  setMathFormulaInput('');
                }}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-100/80 hover:text-slate-650 transition cursor-pointer"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                Masukkan kode LaTeX untuk rumus matematika yang ingin disisipkan (seperti: <code>{`\\frac{a}{b}`}</code> atau <code>{`\\sum x^2`}</code>).
              </p>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Formula LaTeX</label>
                <input
                  type="text"
                  placeholder="E = mc^2"
                  value={mathFormulaInput}
                  onChange={(e) => setMathFormulaInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleInsertMathConfirm();
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsMathModalOpen(false);
                  setEditingMathCallback(null);
                  setMathFormulaInput('');
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleInsertMathConfirm}
                disabled={!mathFormulaInput.trim()}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                {editingMathCallback ? 'Simpan Perubahan' : 'Sisipkan Rumus'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {mounted && isLinkModalOpen && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xl w-full max-w-md flex flex-col gap-5 animate-scale-in text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-800">
                {insertLinkCallback?.unlink
                  ? (language === 'en' ? 'Edit Link URL' : 'Ubah Tautan URL')
                  : (language === 'en' ? 'Insert Link URL' : 'Sisipkan Tautan URL')}
              </h3>
              <button
                onClick={() => {
                  setIsLinkModalOpen(false);
                  setInsertLinkCallback(null);
                  setLinkUrlInput('');
                }}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-100/80 hover:text-slate-650 transition cursor-pointer"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                {language === 'en' 
                  ? 'Enter the URL destination for the selected text (e.g. https://example.com).'
                  : 'Masukkan alamat URL tujuan untuk teks yang dipilih (misal: https://example.com).'}
              </p>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">URL Tautan</label>
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={linkUrlInput}
                  onChange={(e) => setLinkUrlInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleInsertLinkConfirm();
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              {insertLinkCallback?.unlink && (
                <button
                  type="button"
                  onClick={handleUnlinkConfirm}
                  className="mr-auto px-3.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition cursor-pointer"
                >
                  {language === 'en' ? 'Remove Link' : 'Hapus Tautan'}
                </button>
              )}
              <button
                onClick={() => {
                  setIsLinkModalOpen(false);
                  setInsertLinkCallback(null);
                  setLinkUrlInput('');
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
              >
                {language === 'en' ? 'Cancel' : 'Batal'}
              </button>
              <button
                onClick={handleInsertLinkConfirm}
                disabled={!linkUrlInput.trim()}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                {insertLinkCallback?.unlink
                  ? (language === 'en' ? 'Save Changes' : 'Simpan Perubahan')
                  : (language === 'en' ? 'Insert Link' : 'Sisipkan Tautan')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {mounted && showHighlightPopover && highlightPopoverRect && typeof window !== 'undefined' && createPortal(
        <>
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => {
              setShowHighlightPopover(false);
              setHighlightPopoverRect(null);
              setHighlightTriggerSource(null);
            }} 
          />
          <div
            className="fixed z-[9999] bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex items-center gap-1.5 animate-scale-in"
            style={{
              top: `${highlightPopoverRect.bottom + window.scrollY + 6}px`,
              left: `${Math.max(10, highlightPopoverRect.left + window.scrollX - 60)}px`,
            }}
          >
            <button
              onClick={() => handleApplyHighlight('yellow')}
              className="w-6 h-6 rounded bg-yellow-200 border border-yellow-350 hover:scale-105 active:scale-95 transition cursor-pointer"
              title={language === 'en' ? 'Yellow' : 'Kuning'}
            />
            <button
              onClick={() => handleApplyHighlight('green')}
              className="w-6 h-6 rounded bg-green-200 border border-green-300 hover:scale-105 active:scale-95 transition cursor-pointer"
              title={language === 'en' ? 'Green' : 'Hijau'}
            />
            <button
              onClick={() => handleApplyHighlight('blue')}
              className="w-6 h-6 rounded bg-sky-200 border border-sky-300 hover:scale-105 active:scale-95 transition cursor-pointer"
              title={language === 'en' ? 'Blue' : 'Biru'}
            />
            <button
              onClick={() => handleApplyHighlight('pink')}
              className="w-6 h-6 rounded bg-pink-200 border border-pink-300 hover:scale-105 active:scale-95 transition cursor-pointer"
              title={language === 'en' ? 'Pink' : 'Merah Muda'}
            />
            <button
              onClick={() => handleApplyHighlight('purple')}
              className="w-6 h-6 rounded bg-purple-200 border border-purple-300 hover:scale-105 active:scale-95 transition cursor-pointer"
              title={language === 'en' ? 'Purple' : 'Ungu'}
            />
            <div className="w-px h-4 bg-slate-200 mx-0.5" />
            <button
              onClick={() => handleApplyHighlight('clear')}
              className="p-1.5 rounded text-red-500 hover:bg-red-50 hover:text-red-600 transition cursor-pointer flex items-center justify-center"
              title={language === 'en' ? 'Clear Highlight' : 'Hapus Sorotan'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </>
        , document.body
      )}
      {mounted && isPlanModalOpen && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xl w-full max-w-lg flex flex-col gap-5 animate-scale-in text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-800">
                {selectedPlanForModal ? 'Edit Detail Paket Langganan' : 'Tambah Paket Baru'}
              </h3>
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-100/80 hover:text-slate-650 transition cursor-pointer"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto max-h-[65vh] pr-1">
              {/* ID Paket */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">ID Paket (Sistem)</label>
                <input
                  type="text"
                  disabled={!!selectedPlanForModal}
                  placeholder="Contoh: basic, pro, ultra"
                  value={modalPlanState.id}
                  onChange={(e) => setModalPlanState(prev => ({ ...prev, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') }))}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition bg-slate-50/10 disabled:bg-slate-100/60 disabled:text-slate-400 font-bold"
                />
              </div>

              {/* Nama Paket */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Nama Paket</label>
                <input
                  type="text"
                  placeholder="Contoh: Premium Writer"
                  value={modalPlanState.name}
                  onChange={(e) => setModalPlanState(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-bold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition bg-slate-50/10"
                />
              </div>

              {/* Harga & Periode */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Harga (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                    <input
                      type="number"
                      value={modalPlanState.price}
                      onChange={(e) => setModalPlanState(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                      className="w-full border border-slate-200 rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition bg-slate-50/10"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Periode</label>
                  <input
                    type="text"
                    placeholder="Contoh: /bulan, /tahun"
                    value={modalPlanState.price_period}
                    onChange={(e) => setModalPlanState(prev => ({ ...prev, price_period: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition bg-slate-50/10"
                  />
                </div>
              </div>

              {/* Promo Tagline */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Promo Tagline</label>
                <input
                  type="text"
                  placeholder="Contoh: DISKON 30%"
                  value={modalPlanState.promo_text || ''}
                  onChange={(e) => setModalPlanState(prev => ({ ...prev, promo_text: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-emerald-600 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition bg-slate-50/10"
                />
              </div>

              {/* Deskripsi */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Deskripsi ringkas mengenai peruntukan paket..."
                  value={modalPlanState.description || ''}
                  onChange={(e) => setModalPlanState(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-650 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition bg-slate-50/10 resize-none font-medium"
                />
              </div>

              {/* Fitur Layanan */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Fitur Layanan (Satu baris = satu fitur)</label>
                <textarea
                  rows={4}
                  placeholder="Contoh:&#10;Upload PDF referensi tak terbatas&#10;Akses premium AI model&#10;Ekspor format Word (.doc)"
                  value={modalPlanState.features.join('\n')}
                  onChange={(e) => setModalPlanState(prev => ({ ...prev, features: e.target.value.split('\n') }))}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-650 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition bg-slate-50/10 font-sans resize-y"
                />
              </div>

              {/* Toggle Popular */}
              <div className="flex items-center justify-between p-3.5 border border-slate-200/60 rounded-2xl bg-slate-50/20">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-700">Tandai sebagai Terpopuler</span>
                  <span className="text-[9px] text-slate-400 leading-tight">Menampilkan lencana khusus pada pilihan pricing paket.</span>
                </div>
                <Switch
                  checked={modalPlanState.is_popular}
                  onChange={() => setModalPlanState(prev => ({ ...prev, is_popular: !prev.is_popular }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveModalPlan}
                disabled={savingPlanId === modalPlanState.id}
                className="flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-indigo-200 transition duration-200 cursor-pointer"
              >
                {savingPlanId === modalPlanState.id ? (
                  <IconLoader className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <IconDeviceFloppy className="h-3.5 w-3.5" />
                )}
                Simpan Data
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {mounted && isModelModalOpen && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xl w-full max-w-lg flex flex-col gap-5 animate-scale-in text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-800">
                {selectedModelForModal ? 'Edit Detail Model AI' : 'Tambah Model AI Baru'}
              </h3>
              <button
                onClick={() => setIsModelModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-100/80 hover:text-slate-650 transition cursor-pointer"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* ID Gateway / Gateway Key */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Gateway Key (ID Sistem)</label>
                <input
                  type="text"
                  disabled={!!selectedModelForModal}
                  placeholder="Contoh: gemini-flash, claude-sonnet"
                  value={modalModelState.id}
                  onChange={(e) => setModalModelState(prev => ({ ...prev, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') }))}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition bg-slate-50/10 disabled:bg-slate-100/60 disabled:text-slate-400 font-bold"
                />
              </div>

              {/* Nama Tampilan Model */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Nama Tampilan Model</label>
                <input
                  type="text"
                  placeholder="Contoh: Gemini Flash (Direct)"
                  value={modalModelState.name}
                  onChange={(e) => setModalModelState(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-bold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition bg-slate-50/10"
                />
              </div>

              {/* ID Model API Asli */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">ID Model API Asli</label>
                <input
                  type="text"
                  placeholder="Contoh: gemini-1.5-flash atau anthropic/claude-3-5-sonnet"
                  value={modalModelState.model_id}
                  onChange={(e) => setModalModelState(prev => ({ ...prev, model_id: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition bg-slate-50/10 font-mono"
                />
              </div>

              {/* Toggle Enabled */}
              <div className="flex items-center justify-between p-3.5 border border-slate-200/60 rounded-2xl bg-slate-50/20">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-700">Status Keaktifan</span>
                  <span className="text-[9px] text-slate-400 leading-tight">Mengizinkan pengguna menggunakan model AI ini jika diaktifkan.</span>
                </div>
                <Switch
                  checked={modalModelState.is_enabled}
                  onChange={() => setModalModelState(prev => ({ ...prev, is_enabled: !prev.is_enabled }))}
                />
              </div>

              {/* Toggle Premium / Pro Writer */}
              <div className="flex items-center justify-between p-3.5 border border-slate-200/60 rounded-2xl bg-slate-50/20">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-700">Hak Akses Model (Khusus Pro Writer)</span>
                  <span className="text-[9px] text-slate-400 leading-tight">Membatasi pemakaian model AI premium ini hanya untuk pelanggan Pro.</span>
                </div>
                <Switch
                  checked={modalModelState.is_premium}
                  onChange={() => setModalModelState(prev => ({ ...prev, is_premium: !prev.is_premium }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => setIsModelModalOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveModalModel}
                disabled={savingModelId === modalModelState.id}
                className="flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-indigo-200 transition duration-200 cursor-pointer"
              >
                {savingModelId === modalModelState.id ? (
                  <IconLoader className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <IconDeviceFloppy className="h-3.5 w-3.5" />
                )}
                Simpan Data
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
