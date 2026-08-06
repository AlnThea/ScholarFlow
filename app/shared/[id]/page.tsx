// app/shared/[id]/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'next/navigation';
import { fetchSharedDocument, updateSharedDocument, type DocumentEntry } from '@/lib/api/documents';
import { fetchCitationLibrary } from '@/lib/api/citation-library';
import { formatBibliographyCandidate } from '@/lib/editor/bibliography';
import { searchCitations, type CitationCandidate } from '@/lib/api/citations';
import { improveWriting } from '@/lib/api/ai';
import { EditorJsEditor } from '@/components/editor/editorjs-editor';
import {
  IconLock,
  IconBook,
  IconLoader,
  IconCheck,
  IconExternalLink,
  IconWorld,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBold,
  IconItalic,
  IconUnderline,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconAlignJustified,
  IconStrikethrough,
  IconCode,
  IconSuperscript,
  IconSubscript,
  IconLink,
  IconHighlight,
  IconAt,
  IconPhoto,
  IconTable,
  IconSum,
  IconMath,
  IconCalculator,
  IconSearch,
  IconX,
  IconQuote,
  IconSparkles,
  IconLanguage
} from '@tabler/icons-react';

export default function SharedDocumentPage() {
  const params = useParams();
  const rawId = params?.id as string | undefined;
  
  // Extract document UUID by removing 'doc-' prefix if present
  const docId = useMemo(() => {
    if (!rawId) return '';
    return rawId.startsWith('doc-') ? rawId.substring(4) : rawId;
  }, [rawId]);

  const [document, setDocument] = useState<DocumentEntry | null>(null);
  const language = document?.settings?.citationLocale?.startsWith('id') ? 'id' : 'en';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editor states
  const [activeReferenceIds, setActiveReferenceIds] = useState<string[]>([]);
  const [citationLibrary, setCitationLibrary] = useState<Record<string, CitationCandidate>>({});
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'offline'>('saved');

  // Toolbar & Format states
  const [currentBlockType, setCurrentBlockType] = useState<string>('paragraph');
  const [currentAlignment, setCurrentAlignment] = useState<string>('left');
  const [currentFontSize, setCurrentFontSize] = useState<string>('');
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

  const getBtnClass = (isActive: boolean) => {
    return `p-1.5 rounded transition ${
      isActive
        ? 'bg-indigo-50 text-indigo-600 font-semibold'
        : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
    }`;
  };

  // Custom Modals & Popovers States
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Highlight Popover
  const [showHighlightPopover, setShowHighlightPopover] = useState(false);
  const [highlightPopoverRect, setHighlightPopoverRect] = useState<DOMRect | null>(null);

  // Link Modal
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrlInput, setLinkUrlInput] = useState('');
  const [insertLinkCallback, setInsertLinkCallback] = useState<{
    save: (url: string) => void;
    unlink?: () => void;
  } | null>(null);

  // Math Modal
  const [isMathModalOpen, setIsMathModalOpen] = useState(false);
  const [mathFormulaInput, setMathFormulaInput] = useState('');
  const [editingMathCallback, setEditingMathCallback] = useState<((formula: string) => void) | null>(null);

  const handleHighlightButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setHighlightPopoverRect(rect);
    setShowHighlightPopover(prev => !prev);
  };

  const handleApplyHighlight = (color: string) => {
    editorJsRef.current?.toggleInlineFormat('highlight', color);
    setShowHighlightPopover(false);
    setHighlightPopoverRect(null);
  };

  const handleInsertLinkConfirm = () => {
    if (insertLinkCallback) {
      insertLinkCallback.save(linkUrlInput);
      setIsLinkModalOpen(false);
      setInsertLinkCallback(null);
      setLinkUrlInput('');
    }
  };

  const handleUnlinkConfirm = () => {
    if (insertLinkCallback?.unlink) {
      insertLinkCallback.unlink();
      setIsLinkModalOpen(false);
      setInsertLinkCallback(null);
      setLinkUrlInput('');
    }
  };

  const handleInsertMathConfirm = () => {
    if (mathFormulaInput.trim()) {
      if (editingMathCallback) {
        editingMathCallback(mathFormulaInput.trim());
        setEditingMathCallback(null);
      } else {
        editorJsRef.current?.insertInlineEquation(mathFormulaInput.trim());
      }
      setIsMathModalOpen(false);
      setMathFormulaInput('');
    }
  };

  // Image Modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Selected Text State
  const [selectedText, setSelectedText] = useState('');

  // Bubble Menu States
  const [bubbleMenuRect, setBubbleMenuRect] = useState<DOMRect | null>(null);
  const [showBubbleMenu, setShowBubbleMenu] = useState(false);
  const [bubbleMode, setBubbleMode] = useState<'format' | 'citation'>('format');
  const [bubbleSearchQuery, setBubbleSearchQuery] = useState('');
  const [isSearchingCitations, setIsSearchingCitations] = useState(false);
  const [citationResults, setCitationResults] = useState<CitationCandidate[]>([]);
  const [citationError, setCitationError] = useState<string | null>(null);

  const bubbleModeRef = useRef(bubbleMode);
  useEffect(() => {
    bubbleModeRef.current = bubbleMode;
  }, [bubbleMode]);

  const runCitationSearchForQuery = useCallback(async (query: string) => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return;

    setIsSearchingCitations(true);
    setCitationError(null);

    try {
      const response = await searchCitations(normalizedQuery, 15);
      
      let filtered = response.results;
      if (document?.settings) {
        const settings = document.settings;

        if (settings.publishYear === '5_years') {
          const currentYear = new Date().getFullYear();
          filtered = filtered.filter(
            (c) => c.year !== null && c.year >= currentYear - 5
          );
        } else if (settings.publishYear === 'custom') {
          const start = settings.publishYearStart ?? 0;
          const end = settings.publishYearEnd ?? new Date().getFullYear();
          filtered = filtered.filter(
            (c) => c.year !== null && c.year >= start && c.year <= end
          );
        }

        if (settings.impactFactor === '0.25+') {
          filtered = filtered.filter((c) => c.cited_by_count >= 2);
        } else if (settings.impactFactor === '3+') {
          filtered = filtered.filter((c) => c.cited_by_count >= 20);
        } else if (settings.impactFactor === '10+') {
          filtered = filtered.filter((c) => c.cited_by_count >= 100);
        }

        if (settings.limitCollection === 'journals') {
          filtered = filtered.filter(
            (c) => c.journal !== null && c.journal.trim() !== ''
          );
        }
      }

      setCitationResults(filtered);
    } catch (err: any) {
      console.error('Error searching citations:', err);
      setCitationError(err.message || 'Failed to search citations.');
    } finally {
      setIsSearchingCitations(false);
    }
  }, [document]);

  // AI States & Handlers
  const [selectedAiModel, setSelectedAiModel] = useState('gemini');
  const [selectedAiTone, setSelectedAiTone] = useState('academic');
  const [isImproving, setIsImproving] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiOriginalText, setAiOriginalText] = useState('');
  const [aiResultText, setAiResultText] = useState('');

  const handleImproveText = async (actionType: 'polish' | 'paraphrase') => {
    if (!selectedText.trim()) return;

    setIsImproving(true);
    setAiError(null);
    
    // Save selection range in editor
    editorJsRef.current?.saveSelectionRange();

    try {
      const toneValue = actionType === 'paraphrase' ? 'academic' : selectedAiTone; 
      const response = await improveWriting(
        selectedText,
        toneValue,
        selectedAiModel,
        language
      );

      setAiOriginalText(selectedText);
      setAiResultText(response.improved_text);
      setIsAiModalOpen(true);
      setShowBubbleMenu(false);
    } catch (err: any) {
      console.error('Error processing AI request:', err);
      setAiError(err.message || 'Failed to process AI request.');
    } finally {
      setIsImproving(false);
    }
  };

  const handleApplyAiText = () => {
    if (aiResultText.trim()) {
      editorJsRef.current?.insertText(aiResultText.trim());
      setIsAiModalOpen(false);
      setAiOriginalText('');
      setAiResultText('');
    }
  };

  // Math Helper States
  const [isMathHelperOpen, setIsMathHelperOpen] = useState(false);
  const [mathSearchQuery, setMathSearchQuery] = useState('');
  const [mathToast, setMathToast] = useState<string | null>(null);
  const [activeMathCategory, setActiveMathCategory] = useState<'all' | 'general' | 'greek' | 'operators' | 'advanced' | 'structures'>('general');

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
    if (activeMathCategory !== 'all') {
      items = items.filter(item => item.category === activeMathCategory);
    }
    if (mathSearchQuery.trim()) {
      const q = mathSearchQuery.toLowerCase();
      items = items.filter(item =>
        item.label.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q)
      );
    }
    return items;
  }, [mathHelperItems, activeMathCategory, mathSearchQuery]);

  const handleInsertImageConfirm = () => {
    if (imageUrlInput.trim()) {
      editorJsRef.current?.insertImage(imageUrlInput.trim());
      setIsImageModalOpen(false);
      setImageUrlInput('');
    }
  };

  const editorJsRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef<string>('');

  // Fetch document details and citation library on mount
  useEffect(() => {
    if (!docId) {
      setLoading(false);
      setError('Invalid Document ID');
      return;
    }

    const loadData = async () => {
      try {
        const [docDetail, libData] = await Promise.all([
          fetchSharedDocument(docId),
          fetchCitationLibrary().catch(() => ({}))
        ]);

        if (!docDetail) {
          setError('Access Denied');
        } else {
          // Pre-sanitize the content to replace old blur styling with our new style to avoid flash of blur
          if (docDetail.content && Array.isArray(docDetail.content.blocks)) {
            docDetail.content.blocks = docDetail.content.blocks.map((block: any) => {
              if (block.type === 'paragraph' && typeof block.data?.text === 'string') {
                const textStr = block.data.text;
                if (textStr.includes('sf-bibliography-blur') || textStr.includes('filter: blur') || textStr.includes('filter:blur')) {
                  // Extract inner bibliography text if wrapped in old div
                  let inner = textStr;
                  const divMatch = textStr.match(/<div[^>]*>([\s\S]*?)<\/div>/);
                  if (divMatch) {
                    inner = divMatch[1];
                  }
                  
                  // Re-wrap in the new blurred + fade-out visual lock container
                  block.data.text = `
                    <div class="sf-bibliography-fade-container" style="position: relative; max-height: 55px; overflow: hidden; user-select: none; pointer-events: none; margin-top: 15px; line-height: 1.6;">
                      <div class="sf-bibliography-blur" style="filter: blur(3px); opacity: 0.35;">
                        ${inner}
                      </div>
                      <div class="sf-fade-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; height: 45px; background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%); pointer-events: none;"></div>
                    </div>
                  `;
                }
              }
              return block;
            });
          }
          setDocument(docDetail);
          setCitationLibrary(libData);
          lastSavedContentRef.current = JSON.stringify(docDetail.content || { blocks: [] });
        }
      } catch (err) {
        console.error('Failed to load shared document:', err);
        setError('Error Loading Document');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [docId]);

  // Save document handler for Co-Editor mode
  const triggerDebouncedSave = useCallback((titleToSave: string, contentToSave: any) => {
    setSaveStatus('saving');

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await updateSharedDocument(docId, {
          title: titleToSave,
          content: contentToSave
        });
        if (res.success) {
          setSaveStatus('saved');
        } else {
          setSaveStatus('offline');
        }
      } catch (err) {
        console.error('Failed to save document:', err);
        setSaveStatus('offline');
      }
    }, 1500);
  }, [docId]);

  const handleContentChange = useCallback((newContent: any) => {
    if (!document) return;

    // Compare content structures to avoid infinite loop or redundant saves
    const contentString = JSON.stringify(newContent || { blocks: [] });
    if (contentString === lastSavedContentRef.current) {
      return;
    }

    lastSavedContentRef.current = contentString;
    setDocument((prev) => prev ? { ...prev, content: newContent } : null);
    triggerDebouncedSave(document.title, newContent);
  }, [document, triggerDebouncedSave]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!document) return;
    const newTitle = e.target.value;
    setDocument((prev) => prev ? { ...prev, title: newTitle } : null);
    triggerDebouncedSave(newTitle, document.content);
  }, [document, triggerDebouncedSave]);

  // Compute references based on active IDs reported by the editor
  const bibliographyEntries = useMemo(() => {
    const uniqueActiveIds = Array.from(new Set(activeReferenceIds));
    const style = document?.settings?.citationStyle || 'apa';
    const lang = document?.settings?.citationLocale || 'en-US';

    return uniqueActiveIds
      .map((id) => {
        const candidate = citationLibrary[id];
        if (!candidate) return null;
        return {
          referenceId: id,
          label: candidate.citation_label,
          formatted: formatBibliographyCandidate(candidate, style, lang)
        };
      })
      .filter(Boolean) as Array<{ referenceId: string; label: string; formatted: string }>;
  }, [citationLibrary, activeReferenceIds, document?.settings?.citationStyle, document?.settings?.citationLocale]);

  // Rerender bibliography block inside editor (locked if owner's plan is free)
  const styleSetting = document?.settings?.citationStyle;
  const localeSetting = document?.settings?.citationLocale;
  const ownerPlanSetting = document?.ownerPlan;
  const isCoEditor = document?.settings?.sharePermission === 'edit';

  useEffect(() => {
    if (!document) return;

    const entries = bibliographyEntries.map((e) => ({
      label: e.label,
      formatted: e.formatted
    }));
    const isFree = ownerPlanSetting === 'free';
    const timer = setTimeout(() => {
      editorJsRef.current?.upsertBibliography(entries, isFree);
    }, 100);
    return () => clearTimeout(timer);
  }, [bibliographyEntries, styleSetting, localeSetting, ownerPlanSetting]);

  // Sync format states in Co-Editor mode
  useEffect(() => {
    if (!isCoEditor) return;

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const editorContainer = window.document.getElementById('editorjs-holder');
        
        const text = selection.toString().trim();
        
        if (!text || selection.isCollapsed) {
          if (bubbleModeRef.current !== 'citation') {
            setShowBubbleMenu(false);
            setSelectedText('');
          }
        } else {
          const anchorNode = selection.anchorNode;
          if (anchorNode && editorContainer && editorContainer.contains(anchorNode)) {
            const range = selection.getRangeAt(0);
            setBubbleMenuRect(range.getBoundingClientRect());
            setSelectedText(text);
          } else {
            if (bubbleModeRef.current !== 'citation') {
              setShowBubbleMenu(false);
              setSelectedText('');
            }
          }
        }

        let hasLink = false;
        let hasHighlight = false;
        let hasCode = false;

        let node = selection.anchorNode
          ? (selection.anchorNode.nodeType === Node.TEXT_NODE 
              ? selection.anchorNode.parentElement 
              : selection.anchorNode as HTMLElement)
          : null;

        while (node && editorContainer && editorContainer.contains(node)) {
          const tag = node.tagName;
          if (tag === 'A') hasLink = true;
          if (tag === 'MARK') hasHighlight = true;
          if (tag === 'CODE') hasCode = true;
          node = node.parentElement;
        }

        // Check if selection range spans across an A or MARK tag
        if (!hasLink || !hasHighlight) {
          try {
            const range = selection.getRangeAt(0);
            const fragment = range.cloneContents();
            const tempDiv = window.document.createElement('div');
            tempDiv.appendChild(fragment);
            if (!hasLink && tempDiv.querySelector('a')) hasLink = true;
            if (!hasHighlight && tempDiv.querySelector('mark')) hasHighlight = true;
          } catch (e) {}
        }

        setActiveFormats({
          bold: window.document.queryCommandState('bold'),
          italic: window.document.queryCommandState('italic'),
          underline: window.document.queryCommandState('underline'),
          strikethrough: window.document.queryCommandState('strikeThrough'),
          code: hasCode,
          superscript: window.document.queryCommandState('superscript'),
          subscript: window.document.queryCommandState('subscript'),
          link: hasLink,
          highlight: hasHighlight,
        });

        // Sync active font size state
        if (selection.anchorNode) {
          const parentEl = selection.anchorNode.nodeType === Node.ELEMENT_NODE
            ? (selection.anchorNode as HTMLElement)
            : selection.anchorNode.parentElement;
          if (parentEl) {
            let currentEl: HTMLElement | null = parentEl;
            let foundSize = '';
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
      } else {
        if (bubbleModeRef.current !== 'citation') {
          setShowBubbleMenu(false);
          setSelectedText('');
        }
      }
    };

    window.document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      window.document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [isCoEditor]);

  // Render Loading Screen
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-3">
          <IconLoader className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="text-sm text-slate-500 font-medium">Loading Document Draft...</span>
        </div>
      </div>
    );
  }

  // Render Access Denied / Lock Screen
  if (error || !document || !document.settings?.shareActive) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 font-sans p-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl max-w-md w-full text-center flex flex-col items-center gap-5">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
            <IconLock className="h-10 w-10 animate-pulse" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-lg font-bold text-slate-800">
              {document?.settings?.citationLocale?.startsWith('id') ? 'Tautan Berbagi Tidak Aktif' : 'Sharing Link Inactive'}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {document?.settings?.citationLocale?.startsWith('id')
                ? 'Draf dokumen ini bersifat pribadi atau link berbagi telah dinonaktifkan oleh pemiliknya.'
                : 'This draft document is private or sharing access has been disabled by the owner.'}
            </p>
          </div>
          <a
            href="/login"
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-sm shadow-indigo-150 flex items-center justify-center gap-1.5"
          >
            <span>{document?.settings?.citationLocale?.startsWith('id') ? 'Masuk ke ScholarFlow' : 'Log in to ScholarFlow'}</span>
            <IconExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-850">
      
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/50 h-14 flex items-center justify-between px-6 shadow-sm shadow-slate-100/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-200">
            <IconBook className="h-4.5 w-4.5" />
          </div>
          <span className="text-sm font-extrabold tracking-tight text-slate-900">
            Scholar<span className="text-indigo-600">Flow</span>
          </span>
        </div>

        {/* Document title (Editable if Co-Editor, static if Read-Only) */}
        <div className="hidden md:flex items-center max-w-md flex-1 px-8 justify-center">
          {isCoEditor ? (
            <input
              type="text"
              value={document.title}
              onChange={handleTitleChange}
              className="w-full text-center text-xs font-bold text-slate-800 outline-none border border-transparent hover:border-slate-200 hover:bg-slate-50 focus:border-indigo-400 focus:bg-white rounded-lg px-3 py-1.5 transition text-ellipsis"
            />
          ) : (
            <span className="text-xs font-bold text-slate-800 truncate">{document.title}</span>
          )}
        </div>

        {/* Access badge and save indicator */}
        <div className="flex items-center gap-3">
          {isCoEditor ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-slate-400">
                {saveStatus === 'saving' && (
                  <span className="flex items-center gap-1">
                    <IconLoader className="h-3 w-3 animate-spin text-slate-400" />
                    {language === 'id' ? 'Menyimpan...' : 'Saving...'}
                  </span>
                )}
                {saveStatus === 'saved' && (
                  <span className="flex items-center gap-1 text-emerald-500">
                    <IconCheck className="h-3.5 w-3.5" />
                    {language === 'id' ? 'Tersimpan' : 'Saved'}
                  </span>
                )}
                {saveStatus === 'offline' && (
                  <span className="text-amber-500">
                    {language === 'id' ? 'Disimpan Lokal' : 'Saved Locally'}
                  </span>
                )}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/40 rounded-full">
                <IconWorld className="h-3 w-3" />
                Co-Editor
              </span>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/40 rounded-full">
              <IconLock className="h-3 w-3" />
              {language === 'id' ? 'Membaca Saja' : 'Read-Only'}
            </span>
          )}
        </div>
      </header>

      {/* Navbar 2 – Academic Formatting Toolbar (Visible in Co-Editor mode only) */}
      {isCoEditor && (
        <div className="fixed top-14 left-0 right-0 z-30 flex flex-wrap items-center gap-1.5 border-b border-slate-200/50 bg-white px-6 py-2 shadow-sm shadow-slate-100/10 min-h-12 overflow-x-auto">
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
            className="h-8 rounded border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 cursor-pointer"
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
            onClick={handleHighlightButtonClick}
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
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-indigo-50 hover:bg-indigo-100/80 text-xs font-semibold text-indigo-700 transition cursor-pointer"
            title="Insert Inline Citation"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editorJsRef.current?.insertCitationSearch()}
          >
            <IconAt className="h-4 w-4" />
            Citation
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* Blocks & Math insertions */}
          <button
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer"
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
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer"
            title="Insert Table Block"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editorJsRef.current?.insertTable()}
          >
            <IconTable className="h-4 w-4" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer"
            title="Insert Code Block"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editorJsRef.current?.insertCodeBlock()}
          >
            <IconCode className="h-4 w-4 text-indigo-600" />
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* Math Tools - Just Icons */}
          <button
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer"
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
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer"
            title="Insert Math Block (LaTeX)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editorJsRef.current?.insertMathBlock()}
          >
            <IconMath className="h-4 w-4 text-indigo-600" />
          </button>
          <button
            className={`p-1.5 rounded transition cursor-pointer ${isMathHelperOpen
              ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            title="Bantuan Rumus LaTeX (Math Helper)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setIsMathHelperOpen(prev => !prev)}
          >
            <IconCalculator className="h-4 w-4 text-indigo-500" />
          </button>
        </div>
      )}

      {/* Editor Main Content Area */}
      <main 
        className={`px-4 md:px-6 pb-24 ${isCoEditor ? 'pt-32' : 'pt-20'}`}
        onContextMenu={(e) => {
          if (!isCoEditor) return;
          const selection = window.getSelection();
          if (selection && !selection.isCollapsed && selection.toString().trim()) {
            const holder = window.document.getElementById('editorjs-holder');
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
        <div className="max-w-3xl mx-auto bg-white border border-slate-200/80 rounded-2xl shadow-sm min-h-[60vh] overflow-hidden my-6">
          
          {/* Header metadata layout for public reader */}
          <div className="px-6 md:px-10 pt-8 border-b border-slate-100 pb-4">
            <h1 className="text-xl md:text-2xl font-serif font-bold text-slate-900 mb-2 leading-snug">
              {document.title}
            </h1>
            <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              <span>{language === 'id' ? 'Draf Bersama' : 'Shared Draft'}</span>
              <span>•</span>
              <span>{new Date(document.updated_at).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          <div className="py-2">
            <EditorJsEditor
              ref={editorJsRef}
              initialContent={document.content}
              readOnly={!isCoEditor}
              onContentChange={isCoEditor ? handleContentChange : undefined}
              onBlockTypeChange={setCurrentBlockType}
              onAlignmentChange={setCurrentAlignment}
              onCitationSearchChange={(query, rect) => {
                setBubbleMenuRect(rect);
                setBubbleMode('citation');
                setShowBubbleMenu(true);
                setBubbleSearchQuery(query);
                runCitationSearchForQuery(query);
              }}
              onCitationSearchCancel={() => {
                editorJsRef.current?.cancelCitationSearch();
                setShowBubbleMenu(false);
              }}
              onInsertLinkRequest={(initialUrl, onSave, onUnlink) => {
                setLinkUrlInput(initialUrl);
                setInsertLinkCallback({
                  save: onSave,
                  unlink: onUnlink
                });
                setIsLinkModalOpen(true);
              }}
              onEditInlineEquation={(formula, onSave) => {
                setMathFormulaInput(formula);
                setEditingMathCallback(() => onSave);
                setIsMathModalOpen(true);
              }}
              onStatsChange={(stats) => {
                // Read active reference IDs reported in real-time
                if (stats.activeReferenceIds) {
                  const newIds = stats.activeReferenceIds;
                  setActiveReferenceIds((prev) => {
                    const isSame =
                      prev.length === newIds.length &&
                      prev.every((id, idx) => id === newIds[idx]);
                    return isSame ? prev : newIds;
                  });
                }
              }}
            />
          </div>
        </div>
      </main>

      {/* Render portals for modals & popovers */}
      {mounted && showHighlightPopover && highlightPopoverRect && typeof window !== 'undefined' && createPortal(
        <>
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => {
              setShowHighlightPopover(false);
              setHighlightPopoverRect(null);
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
        , window.document.body
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
        window.document.body
      )}

      {mounted && isMathModalOpen && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xl w-full max-w-md flex flex-col gap-5 animate-scale-in text-slate-850 font-sans">
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
        window.document.body
      )}

      {/* Render Image Modal Portal */}
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
        window.document.body
      )}

      {/* Math Helper Panel */}
      {isMathHelperOpen && (
        <div
          className="fixed right-4 top-40 w-80 bg-white/95 border border-slate-200/80 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] z-40 p-4 flex flex-col gap-3 h-[500px] max-h-[60vh] animate-fade-in font-sans"
        >
          {/* Math Helper Toast notification inside the helper panel */}
          {mathToast && (
            <div className="absolute top-2 right-4 bg-slate-800 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-md animate-fade-in flex items-center gap-1 z-20">
              <IconCheck className="h-3 w-3 text-emerald-400" />
              <span>{mathToast}</span>
            </div>
          )}

          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex flex-col text-slate-850">
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
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 text-[10px] font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs (Horizontal Scrollable) */}
          {!mathSearchQuery && (
            <div
              className="flex flex-wrap items-center gap-1 py-1.5 border-b border-slate-100 text-xs font-semibold text-slate-500 font-sans"
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
                <div className="col-span-2 text-center py-6 text-slate-400 italic font-sans">
                  {language === 'en' ? 'No matching symbols.' : 'Tidak ada simbol yang cocok.'}
                </div>
              ) : (
                filteredMathHelperItems.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()} // Prevents losing editor focus
                    onClick={async () => {
                      const activeEl = window.document.activeElement as HTMLElement | null;
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
                      <span className="font-mono text-indigo-600 truncate text-[9px] mt-0.5">{item.code}</span>
                    </div>
                    <span className="font-serif text-slate-700 text-xs shrink-0 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                      {item.code}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Render Bubble Menu for Text Selection & Inline Citation Search */}
      {mounted && showBubbleMenu && bubbleMenuRect && typeof window !== 'undefined' && createPortal(
        <>
          {/* Overlay to dismiss menu */}
          <div 
            className="fixed inset-0 z-[9997]" 
            onClick={() => {
              setShowBubbleMenu(false);
              setBubbleMode('format');
              if (bubbleMode === 'citation') {
                editorJsRef.current?.cancelCitationSearch();
              }
            }} 
          />
          <div
            className="fixed z-[9998] bg-white border border-slate-200/80 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] flex flex-col transition-all duration-150 backdrop-blur-sm overflow-hidden text-slate-800"
            style={{
              top: `${bubbleMenuRect.bottom + window.scrollY + 10}px`,
              left: `${Math.max(10, bubbleMenuRect.left + window.scrollX + bubbleMenuRect.width / 2 - (bubbleMode === 'citation' ? 240 : 155))}px`,
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
                  <button className={getBtnClass(activeFormats.highlight)} onMouseDown={e => e.preventDefault()} onClick={(e) => handleHighlightButtonClick(e)} title="Highlight text"><IconHighlight className="h-3.5 w-3.5" /></button>
                </div>

                {/* AI Configuration Section Header */}
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100/50 text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/40">
                  <span>{language === 'en' ? 'AI Settings' : 'Pengaturan AI'}</span>
                </div>

                {/* AI Dropdowns */}
                <div className="flex gap-2.5 px-3 py-2 border-b border-slate-100/60 bg-slate-50/10">
                  {/* Model Select */}
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <span className="text-[8px] font-bold text-slate-405 uppercase">Model</span>
                    <select
                      value={selectedAiModel}
                      onChange={(e) => setSelectedAiModel(e.target.value)}
                      className="w-full border border-slate-200 rounded px-1.5 py-1 text-[10px] text-slate-700 bg-white outline-none focus:border-indigo-500 transition cursor-pointer font-semibold"
                      title={language === 'en' ? 'Select AI Model' : 'Pilih Model AI'}
                    >
                      <option value="gemini">Gemini Flash</option>
                      <option value="llama3">Llama 3</option>
                      <option value="gemma2">Gemma 2</option>
                      <option value="claude">Claude 3.5 Sonnet</option>
                    </select>
                  </div>

                  {/* Tone Select */}
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <span className="text-[8px] font-bold text-slate-405 uppercase">{language === 'en' ? 'Tone' : 'Gaya'}</span>
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
                  <span>{language === 'en' ? 'Assistant Actions' : 'Aksi Asisten'}</span>
                </div>

                {/* Actions List */}
                <div className="flex flex-col">
                  {/* Poles AI Button */}
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-slate-700 hover:bg-slate-50 transition font-semibold cursor-pointer border-b border-slate-100/40 disabled:opacity-50 disabled:bg-slate-50/50"
                    onMouseDown={e => e.preventDefault()}
                    disabled={isImproving}
                    onClick={() => handleImproveText('polish')}
                  >
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-650 shrink-0">
                      {isImproving ? (
                        <IconLoader className="h-4 w-4 animate-spin" />
                      ) : (
                        <IconSparkles className="h-4 w-4 text-indigo-600" />
                      )}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs text-slate-800">{language === 'en' ? 'Polish with AI' : 'Poles dengan AI'}</span>
                      <span className="text-[9px] text-slate-400 font-normal">
                        {language === 'en' ? 'Improve style and academic phrasing' : 'Tingkatkan gaya bahasa & akademis'}
                      </span>
                    </div>
                  </button>

                  {/* Parafrase Button */}
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-slate-700 hover:bg-slate-50 transition font-semibold cursor-pointer border-b border-slate-100/40 disabled:opacity-50 disabled:bg-slate-50/50"
                    onMouseDown={e => e.preventDefault()}
                    disabled={isImproving}
                    onClick={() => handleImproveText('paraphrase')}
                  >
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-605 shrink-0">
                      {isImproving ? (
                        <IconLoader className="h-4 w-4 animate-spin" />
                      ) : (
                        <IconLanguage className="h-4 w-4 text-indigo-600" />
                      )}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs text-slate-800">{language === 'en' ? 'Paraphrase Sentence' : 'Parafrase Kalimat'}</span>
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
                      setBubbleSearchQuery(selectedText);
                      runCitationSearchForQuery(selectedText);
                    }}
                  >
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-650 shrink-0">
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
              </div>
            )}

            {/* ── CITATION MODE ── */}
            {bubbleMode === 'citation' && (
              <div className="flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50/50">
                  <button
                    className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition flex-shrink-0 cursor-pointer"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => setBubbleMode('format')}
                    title="Back"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                  </button>
                  <IconSearch className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-700 truncate flex-1">
                    {window.document.querySelector('span[data-citation-search="true"]') ? 'Mencari Sitasi...' : `"${selectedText.slice(0, 40)}${selectedText.length > 40 ? '…' : ''}"`}
                  </span>
                  <button
                    className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition flex-shrink-0 cursor-pointer"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => { setShowBubbleMenu(false); setBubbleMode('format'); }}
                    title="Close"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>

                {/* Loading */}
                {isSearchingCitations && (
                  <div className="flex items-center justify-center gap-2 py-8 text-xs text-slate-450">
                    <svg className="h-4 w-4 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                    {language === 'en' ? 'Searching citations...' : 'Mencari sitasi...'}
                  </div>
                )}

                {/* Error */}
                {!isSearchingCitations && citationError && (
                  <div className="px-3 py-6 text-xs text-red-500 text-center font-sans">
                    {citationError}
                  </div>
                )}

                {/* No Results */}
                {!isSearchingCitations && !citationError && citationResults.length === 0 && (
                  <div className="px-3 py-6 text-xs text-slate-400 text-center italic font-sans">
                    {language === 'en' ? 'No citations found. Try different text.' : 'Kutipan tidak ditemukan. Coba pilih kata yang lain.'}
                  </div>
                )}

                {/* Results List */}
                {!isSearchingCitations && citationResults.length > 0 && (
                  <div className="flex flex-col gap-2.5 p-3 max-h-[300px] overflow-y-auto bg-slate-50/50">
                    {citationResults.map((candidate) => (
                      <div
                        key={candidate.reference_id}
                        className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col gap-2 text-left"
                      >
                        <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          <span className="text-slate-500">Jurnal</span>
                          <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                            🟢 {candidate.ranking_score}% Match
                          </span>
                        </div>

                        <div className="flex flex-col">
                          <h4 className="text-[11px] font-bold text-slate-800 leading-snug line-clamp-2">
                            {candidate.title}
                          </h4>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {candidate.authors.join(', ')} ({candidate.year || 'N/A'})
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const hasSearchSpan = !!window.document.querySelector('span[data-citation-search="true"]');
                              if (hasSearchSpan) {
                                editorJsRef.current?.insertCitationAtSearch(candidate.citation_label, candidate.reference_id);
                              } else {
                                editorJsRef.current?.insertCitation(candidate.citation_label, candidate.reference_id);
                              }
                              setCitationLibrary(prev => ({
                                ...prev,
                                [candidate.reference_id]: candidate
                              }));
                              setShowBubbleMenu(false);
                              setBubbleMode('format');
                            }}
                            className="inline-flex items-center gap-1 bg-indigo-650 hover:bg-indigo-700 text-white px-2.5 py-1 rounded text-[9px] font-bold transition cursor-pointer shadow-sm shadow-indigo-100"
                          >
                            <IconQuote className="h-2.5 w-2.5" />
                            Cite
                          </button>
                          {candidate.url && (
                            <a
                              href={candidate.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-400 hover:text-slate-650 transition flex items-center gap-0.5 text-[9px] font-bold"
                            >
                              <span>View</span>
                              <IconExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
        , window.document.body
      )}

      {/* AI Comparison Modal for applying polished/paraphrased text */}
      {isAiModalOpen && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 font-sans text-slate-800">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <IconSparkles className="h-4 w-4 text-indigo-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'en' ? 'AI Writing Assistant Result' : 'Hasil Asisten Penulisan AI'}
                </h3>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-650 transition cursor-pointer"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Original Text */}
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {language === 'en' ? 'Original Text' : 'Teks Asli'}
                  </span>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs leading-relaxed text-slate-600 h-48 overflow-y-auto italic">
                    "{aiOriginalText}"
                  </div>
                </div>

                {/* AI Result Text */}
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                    {language === 'en' ? 'AI Improved Text' : 'Hasil Perbaikan AI'}
                    <span className="bg-indigo-50 text-indigo-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                      {selectedAiModel}
                    </span>
                  </span>
                  <textarea
                    value={aiResultText}
                    onChange={(e) => setAiResultText(e.target.value)}
                    className="p-3 bg-indigo-50/10 border border-indigo-100 rounded-xl text-xs leading-relaxed text-slate-800 h-48 overflow-y-auto focus:outline-none focus:border-indigo-400 transition"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-150 transition cursor-pointer"
              >
                {language === 'en' ? 'Cancel' : 'Batal'}
              </button>
              <button
                onClick={handleApplyAiText}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer shadow-sm shadow-indigo-150"
              >
                {language === 'en' ? 'Apply & Replace' : 'Terapkan & Ganti'}
              </button>
            </div>
          </div>
        </div>
        , window.document.body
      )}
    </div>
  );
}
