import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { fetchComments, addComment, createNotification } from '@/lib/api/comments';
import { fetchSuggestions, addSuggestion } from '@/lib/api/suggestions';
import { fetchSharedDocument } from '@/lib/api/documents';
import { updatePresence, fetchActivePresence, leavePresence } from '@/lib/api/presence';
import { formatBibliographyCandidate } from '@/lib/editor/bibliography';
import { searchCitations, type CitationCandidate } from '@/lib/api/citations';
import { improveWriting } from '@/lib/api/ai';

export function useSharedEditorLogic({
  docId,
  user,
  profile,
  document,
  setDocument,
  citationLibrary,
  comments,
  setComments,
  suggestions,
  setSuggestions,
  activeUsers,
  setActiveUsers,
  hasPendingRemoteUpdate,
  setHasPendingRemoteUpdate,
  pendingRemoteContent,
  setPendingRemoteContent,
  acceptedLocallyRef,
  editorJsRef,
  isCoEditor,
  language,
  showToast
}: any) {

  const [activeReferenceIds, setActiveReferenceIds] = useState<string[]>([]);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

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
    return `p-1.5 rounded transition ${isActive
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
  const [bubbleMode, setBubbleMode] = useState<'format' | 'citation' | 'comment'>('format');
  const [bubbleSearchQuery, setBubbleSearchQuery] = useState('');
  const [isSearchingCitations, setIsSearchingCitations] = useState(false);
  const [citationResults, setCitationResults] = useState<CitationCandidate[]>([]);
  const [citationError, setCitationError] = useState<string | null>(null);

  // Comments & Presence & Suggestion States
  const [suggestionSubTab, setSuggestionSubTab] = useState<'active' | 'history'>('active');
  const [showCommentsSidebar, setShowCommentsSidebar] = useState(false);
  const [commentSubTab, setCommentSubTab] = useState<'active' | 'resolved'>('active');
  const [editorMode, setEditorMode] = useState<'edit' | 'suggest'>('edit');
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [selectedTextForSuggestion, setSelectedTextForSuggestion] = useState('');
  const [newTextForSuggestion, setNewTextForSuggestion] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentAuthor, setNewCommentAuthor] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Initialize comment author name from user profile
  useEffect(() => {
    if (profile?.full_name) {
      setNewCommentAuthor(profile.full_name);
    } else if (user?.email) {
      setNewCommentAuthor(user.email.split('@')[0]);
    }
  }, [user, profile]);

  const bubbleModeRef = useRef<any>(bubbleMode);
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
            (c: any) => c.year !== null && c.year >= currentYear - 5
          );
        } else if (settings.publishYear === 'custom') {
          const start = settings.publishYearStart ?? 0;
          const end = settings.publishYearEnd ?? new Date().getFullYear();
          filtered = filtered.filter(
            (c: any) => c.year !== null && c.year >= start && c.year <= end
          );
        }

        if (settings.impactFactor === '0.25+') {
          filtered = filtered.filter((c: any) => c.cited_by_count >= 2);
        } else if (settings.impactFactor === '3+') {
          filtered = filtered.filter((c: any) => c.cited_by_count >= 20);
        } else if (settings.impactFactor === '10+') {
          filtered = filtered.filter((c: any) => c.cited_by_count >= 100);
        }

        if (settings.limitCollection === 'journals') {
          filtered = filtered.filter(
            (c: any) => c.journal !== null && c.journal.trim() !== ''
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
  
  // aiTargetLanguage missing fix
  const [aiTargetLanguage, setAiTargetLanguage] = useState(language === 'id' ? 'id' : 'en');
  const [isAiLoading, setIsAiLoading] = useState(false);

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
  
  const handleAiImprovement = handleImproveText; // alias

  const handleApplyAiText = () => {
    if (aiResultText.trim()) {
      editorJsRef.current?.insertText(aiResultText.trim());
      setIsAiModalOpen(false);
      setAiOriginalText('');
      setAiResultText('');
    }
  };

  // Citation details modal state
  const [activeModalCitation, setActiveModalCitation] = useState<{ refId: string; label: string; citedSentence: string } | null>(null);

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

  const getContentComparisonString = (content: any): string => {
    if (!content) return JSON.stringify([]);
    let parsed = content;
    if (typeof content === 'string') {
      try {
        parsed = JSON.parse(content);
      } catch (e) {
        return content;
      }
    }
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
      return JSON.stringify(parsed.blocks);
    }
    return JSON.stringify(parsed);
  };

  const processedAcceptedSuggestionsRef = useRef<Set<string>>(new Set());
  const lastSavedContentRef = useRef<string>('');

  // Poll comments, suggestions, and document content every 5 seconds for live sync
  useEffect(() => {
    if (!docId) return;

    const syncFn = async () => {
      if (typeof window !== 'undefined' && window.document.hidden) return;
      try {
        const [newComms, newSugs, updatedDoc] = await Promise.all([
          fetchComments(docId),
          fetchSuggestions(docId),
          fetchSharedDocument(docId).catch(() => null)
        ]);

        const newlyAcceptedRemote = newSugs.find(s =>
          s.status === 'accepted' &&
          !processedAcceptedSuggestionsRef.current.has(s.id) &&
          !acceptedLocallyRef.current.has(s.id)
        );

        if (newlyAcceptedRemote && updatedDoc && updatedDoc.content) {
          newSugs.filter(s => s.status === 'accepted').forEach(s => processedAcceptedSuggestionsRef.current.add(s.id));
          setPendingRemoteContent(updatedDoc.content);
          setHasPendingRemoteUpdate(true);
        }

        setComments((prev: any) => {
          prev.forEach((oldComm: any) => {
            const newComm = newComms.find(c => c.id === oldComm.id);
            if (oldComm && !oldComm.resolved && newComm && newComm.resolved) {
              showToast(
                language === 'id'
                  ? `Komentar "${oldComm.comment_text.slice(0, 25)}${oldComm.comment_text.length > 25 ? '...' : ''}" telah selesai ditinjau oleh pemilik!`
                  : `Comment "${oldComm.comment_text.slice(0, 25)}${oldComm.comment_text.length > 25 ? '...' : ''}" was resolved by the owner!`,
                'info'
              );
              editorJsRef.current?.highlightAndRemoveCommentMark(oldComm.id);
            }
          });
          return newComms;
        });
        setSuggestions(newSugs);
      } catch (e) {
        console.error('Error polling data:', e);
      }
    };

    const handleVisibility = () => {
      if (typeof window !== 'undefined' && !window.document.hidden) {
        syncFn();
      }
    };

    if (typeof window !== 'undefined') {
      window.document.addEventListener('visibilitychange', handleVisibility);
    }
    const interval = setInterval(syncFn, 5000);

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.document.removeEventListener('visibilitychange', handleVisibility);
      }
    };
  }, [docId, showToast, language]);

  // Auto-sync comment highlights onto editor canvas whenever comments update
  useEffect(() => {
    if (comments && comments.length > 0) {
      const timer = setTimeout(() => {
        editorJsRef.current?.syncCommentMarks?.(comments);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [comments]);

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

  // Presence Heartbeat Effect
  useEffect(() => {
    if (!docId) return;
    const authorName = profile?.full_name || user?.email?.split('@')[0] || (language === 'id' ? 'Tamu' : 'Guest');
    const userId = user?.id || `co-editor-${docId}`;

    const updateAndFetch = async () => {
      if (typeof window !== 'undefined' && window.document.hidden) return;
      await updatePresence(docId, userId, authorName, isCoEditor ? 'co-editor' : 'reader');
      const active = await fetchActivePresence(docId);
      setActiveUsers(active);
    };
    updateAndFetch();

    const handleVisibility = () => {
      if (typeof window !== 'undefined' && !window.document.hidden) {
        updateAndFetch();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `scholarflow_presence_${docId}`) {
        fetchActivePresence(docId).then(setActiveUsers);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    if (typeof window !== 'undefined') {
      window.document.addEventListener('visibilitychange', handleVisibility);
    }

    const handleUnload = () => {
      leavePresence(docId, userId);
    };
    window.addEventListener('beforeunload', handleUnload);

    const interval = setInterval(updateAndFetch, 5000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('beforeunload', handleUnload);
      if (typeof window !== 'undefined') {
        window.document.removeEventListener('visibilitychange', handleVisibility);
      }
      leavePresence(docId, userId);
    };
  }, [docId, user?.id, profile?.full_name, user?.email, isCoEditor]);

  useEffect(() => {
    if (!document) return;

    const entries = bibliographyEntries.map((e) => ({
      label: e.label,
      formatted: e.formatted
    }));

    if (activeReferenceIds.length > 0 && entries.length === 0) {
      return;
    }

    const isFree = ownerPlanSetting === 'free';
    const timer = setTimeout(() => {
      editorJsRef.current?.upsertBibliography(entries, isFree);
    }, 100);
    return () => clearTimeout(timer);
  }, [bibliographyEntries, styleSetting, localeSetting, ownerPlanSetting, activeReferenceIds]);

  // Trigger pricing modal from locked bibliography banner click
  useEffect(() => {
    const handleTriggerPricing = () => {
      setIsPricingOpen(true);
    };
    window.addEventListener('sf-trigger-pricing', handleTriggerPricing);
    return () => {
      window.removeEventListener('sf-trigger-pricing', handleTriggerPricing);
    };
  }, []);

  // Sync format states in Co-Editor mode
  useEffect(() => {
    if (!isCoEditor) return;

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const editorContainer = window.document.getElementById('editorjs-holder');

        const text = selection.toString().trim();

        if (!text || selection.isCollapsed) {
          if (bubbleModeRef.current !== 'citation' && bubbleModeRef.current !== 'comment') {
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
            if (bubbleModeRef.current !== 'citation' && bubbleModeRef.current !== 'comment') {
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
          } catch (e) { }
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

  const handleAddComment = async () => {
    if (!newCommentText.trim() || !docId) return;

    setIsSubmittingComment(true);
    editorJsRef.current?.saveSelectionRange();

    try {
      const commentId = `comm-${Date.now()}`;
      editorJsRef.current?.addCommentMark?.(commentId);

      const added = await addComment(docId, null, selectedText, newCommentText, newCommentAuthor);

      setComments((prev: any) => [...prev, added]);

      if (activeUsers && activeUsers.length > 0) {
        activeUsers.forEach((coUser: any) => {
          if (coUser.user_id && coUser.user_id !== user?.id) {
            createNotification(
              docId,
              coUser.user_id,
              newCommentAuthor,
              language === 'en'
                ? `added a comment: "${newCommentText.slice(0, 30)}${newCommentText.length > 30 ? '...' : ''}"`
                : `menambahkan komentar: "${newCommentText.slice(0, 30)}${newCommentText.length > 30 ? '...' : ''}"`
            );
          }
        });
      }

      setNewCommentText('');
      setShowBubbleMenu(false);
      setShowCommentsSidebar(true);
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  // We'll return everything the component needs
  return {
    activeReferenceIds, setActiveReferenceIds,
    isPricingOpen, setIsPricingOpen,
    currentBlockType, setCurrentBlockType,
    currentAlignment, setCurrentAlignment,
    currentFontSize, setCurrentFontSize,
    activeFormats, setActiveFormats,
    getBtnClass,
    mounted, setMounted,
    showHighlightPopover, setShowHighlightPopover,
    highlightPopoverRect, setHighlightPopoverRect,
    isLinkModalOpen, setIsLinkModalOpen,
    linkUrlInput, setLinkUrlInput,
    insertLinkCallback, setInsertLinkCallback,
    isMathModalOpen, setIsMathModalOpen,
    mathFormulaInput, setMathFormulaInput,
    editingMathCallback, setEditingMathCallback,
    handleHighlightButtonClick, handleApplyHighlight,
    handleInsertLinkConfirm, handleUnlinkConfirm, handleInsertMathConfirm,
    isImageModalOpen, setIsImageModalOpen,
    imageUrlInput, setImageUrlInput,
    selectedText, setSelectedText,
    bubbleMenuRect, setBubbleMenuRect,
    showBubbleMenu, setShowBubbleMenu,
    bubbleMode, setBubbleMode,
    bubbleSearchQuery, setBubbleSearchQuery,
    isSearchingCitations, setIsSearchingCitations,
    citationResults, setCitationResults,
    citationError, setCitationError,
    suggestionSubTab, setSuggestionSubTab,
    showCommentsSidebar, setShowCommentsSidebar,
    commentSubTab, setCommentSubTab,
    editorMode, setEditorMode,
    isSuggestionModalOpen, setIsSuggestionModalOpen,
    selectedTextForSuggestion, setSelectedTextForSuggestion,
    newTextForSuggestion, setNewTextForSuggestion,
    newCommentText, setNewCommentText,
    newCommentAuthor, setNewCommentAuthor,
    isSubmittingComment, setIsSubmittingComment,
    runCitationSearchForQuery,
    selectedAiModel, setSelectedAiModel,
    selectedAiTone, setSelectedAiTone,
    isImproving, setIsImproving,
    aiError, setAiError,
    isAiModalOpen, setIsAiModalOpen,
    aiOriginalText, setAiOriginalText,
    aiResultText, setAiResultText,
    handleImproveText, handleApplyAiText,
    aiTargetLanguage, setAiTargetLanguage,
    isAiLoading, setIsAiLoading,
    handleAiImprovement,
    activeModalCitation, setActiveModalCitation,
    isMathHelperOpen, setIsMathHelperOpen,
    mathSearchQuery, setMathSearchQuery,
    mathToast, setMathToast,
    activeMathCategory, setActiveMathCategory,
    mathHelperItems, filteredMathHelperItems,
    handleInsertImageConfirm,
    getContentComparisonString,
    lastSavedContentRef,
    handleAddComment
  };
}
