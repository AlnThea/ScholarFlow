// c:/web/ScholarFlow/components/editor/editor-layout.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { EditorJsEditor, type EditorJsMethods } from './editorjs-editor';
import { EditorSidebar } from './editor-sidebar';
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
  IconDeviceFloppy,
  IconShare,
  IconFileWord,
  IconLayoutSidebarRightCollapse
} from '@tabler/icons-react';
import { MinimalSidebar } from './minimal-sidebar';
import type { ImproveWritingResponse } from '@/lib/api/ai';
import type { CitationCandidate } from '@/lib/api/citations';
import type { CitationHistoryEntry } from '@/lib/editor/citation-history';
import type { BibliographyEntry } from '@/lib/editor/bibliography';
import type { DocumentListItem, DocumentEntry } from '@/lib/api/documents';
import { PricingModal } from './pricing-modal';
import { ShareDocumentModal } from './share-document-modal';
import { exportToWordFile } from '@/lib/editor/citation-export-word';
import { useAuth } from '@/components/auth/auth-provider';
import { fetchPricingPlans, updatePricingPlan, type PricingPlan } from '@/lib/api/pricing';
import { fetchPaymentGateways, updatePaymentGatewayStatus, type PaymentGateway } from '@/lib/api/payment-gateways';
import { type AIModel } from '@/lib/api/ai-models';

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
  onFindCitation: () => void;
  onRepeatCitationSearch: (query: string) => void;
  onInsertCitation: () => void;
  onInsertBibliography: () => void;
  onInsertImageSample: () => void;
  onExportBibliographyText: () => void;
  onExportBibliographyJson: () => void;
  onInsertCitationCandidate: (candidate: CitationCandidate) => void;
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
  aiModels: AIModel[];
  onUpdateAIModel: (id: string, updates: Partial<AIModel>) => Promise<void>;
  onParafrasePlagiat?: (sentence: string) => void;
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
  onInsertCitationCandidate,
  onRepeatCitationSearch,
  onInsertCitation,
  onFindCitation,
  onImproveWriting,
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
  aiModels,
  onUpdateAIModel,
  onParafrasePlagiat
}: EditorLayoutProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [currentBlockType, setCurrentBlockType] = useState('paragraph');
  const [currentAlignment, setCurrentAlignment] = useState('left');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const { profile, user } = useAuth();
  const role = profile?.role ?? 'user';
  const activePlanId = profile?.subscription_plan || 'free';
  const [activeDashboardTab, setActiveDashboardTab] = useState<'user' | 'admin' | 'billing'>('user');
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

  const handleSaveModel = async (id: string) => {
    const state = editModelStates[id];
    if (!state) return;
    setSavingModelId(id);
    try {
      await onUpdateAIModel(id, state);
      alert(`Model AI "${state.name}" berhasil diperbarui!`);
    } catch (e: any) {
      alert(`Gagal memperbarui model: ${e.message || e}`);
    } finally {
      setSavingModelId(null);
    }
  };

  useEffect(() => {
    if (activeDashboardTab === 'admin') {
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
  });

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-expanded');
    if (saved !== null) setIsSidebarExpanded(saved === 'true');

    // Selection change handler to sync toolbar states and show bubble menu
    const handleSelectionChange = () => {
      // 1. Sync format active states
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikethrough: document.queryCommandState('strikeThrough'),
        code: document.queryCommandState('insertHTML'),
        superscript: document.queryCommandState('superscript'),
        subscript: document.queryCommandState('subscript'),
      });

      // 2. Display custom bubble menu if text selection is active inside EditorJS
      const selection = window.getSelection();
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
      setShowBubbleMenu(true);
      // Reset to format mode whenever a new selection is made
      setBubbleMode('format');
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
    return `p-1.5 rounded transition ${
      isActive 
        ? 'bg-indigo-100/80 text-indigo-700 font-bold' 
        : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
    }`;
  };

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
      />

      {/* If no document is selected, render the Dashboard View */}
      {!currentDocument ? (
        <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50/50 p-6 md:p-10 font-sans">
          <header className="flex items-center justify-between pb-5 border-b border-slate-200/60 mb-8">
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

            {/* Multi-role Dashboard selector */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setActiveDashboardTab('user')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition cursor-pointer ${
                  activeDashboardTab === 'user'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Dashboard User
              </button>
              
              {role === 'admin' && (
                <button
                  onClick={() => setActiveDashboardTab('admin')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition cursor-pointer ${
                    activeDashboardTab === 'admin'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Panel Admin Pricing
                </button>
              )}

              <button
                onClick={() => setActiveDashboardTab('billing')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition cursor-pointer ${
                  activeDashboardTab === 'billing'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Akun & Billing
              </button>
            </div>
          </header>

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
                    documents.map((doc) => (
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
                    ))
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
          ) : activeDashboardTab === 'admin' ? (
            /* Admin Pricing Dashboard View */
            <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 animate-fade-in">
              <div className="bg-gradient-to-r from-violet-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 flex flex-col gap-2 max-w-lg">
                  <h1 className="text-xl md:text-2xl font-bold leading-tight flex items-center gap-2">
                    Dasbor Pengelola Harga Langganan
                  </h1>
                  <p className="text-xs md:text-sm text-indigo-100/90 leading-normal">
                    Ganti harga paket, tambahkan teks promo dadakan, deskripsi, atau ubah fitur-fitur paket secara dinamis. Perubahan akan langsung tersimpan ke Supabase database.
                  </p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12 h-64 w-64 rounded-full border-[20px] border-white" />
              </div>

              {loadingAdminPlans ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <IconLoader className="h-8 w-8 text-indigo-600 animate-spin" />
                  <span className="text-xs text-slate-400 font-semibold">Memuat data paket pricing...</span>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-6">
                  {adminPlans.map((plan) => {
                    const state = editStates[plan.id];
                    if (!state) return null;

                    return (
                      <div key={plan.id} className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col gap-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <span className="text-sm font-bold text-slate-800">{plan.name} ({plan.id})</span>
                          <button
                            onClick={() => handleSavePlan(plan.id)}
                            disabled={savingPlanId === plan.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
                          >
                            {savingPlanId === plan.id ? (
                              <IconLoader className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <IconDeviceFloppy className="h-3.5 w-3.5" />
                            )}
                            Simpan Perubahan
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Price input */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Harga (Rp)</label>
                            <input
                              type="number"
                              disabled={plan.id === 'institution'}
                              value={state.price}
                              onChange={(e) => setEditStates((prev) => ({
                                ...prev,
                                [plan.id]: { ...prev[plan.id], price: parseInt(e.target.value) || 0 }
                              }))}
                              className="border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-500 transition bg-slate-50/30 disabled:bg-slate-100/50"
                            />
                          </div>

                          {/* Period input */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Periode Harga</label>
                            <input
                              type="text"
                              value={state.price_period}
                              onChange={(e) => setEditStates((prev) => ({
                                ...prev,
                                [plan.id]: { ...prev[plan.id], price_period: e.target.value }
                              }))}
                              className="border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-500 transition bg-slate-50/30"
                            />
                          </div>

                          {/* Promo Text input */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Promo Text (Kosongkan jika tidak ada)</label>
                            <input
                              type="text"
                              placeholder="Contoh: MERDEKA 50%!"
                              value={state.promo_text}
                              onChange={(e) => setEditStates((prev) => ({
                                ...prev,
                                [plan.id]: { ...prev[plan.id], promo_text: e.target.value }
                              }))}
                              className="border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-500 transition bg-slate-50/30"
                            />
                          </div>
                        </div>

                        {/* Description textarea */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Deskripsi Paket</label>
                          <textarea
                            rows={2}
                            value={state.description}
                            onChange={(e) => setEditStates((prev) => ({
                              ...prev,
                              [plan.id]: { ...prev[plan.id], description: e.target.value }
                            }))}
                            className="border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-500 transition bg-slate-50/30 resize-none"
                          />
                        </div>

                        {/* Features textarea */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fitur Paket (Pisahkan tiap baris)</label>
                          <textarea
                            rows={4}
                            value={state.features}
                            onChange={(e) => setEditStates((prev) => ({
                              ...prev,
                              [plan.id]: { ...prev[plan.id], features: e.target.value }
                            }))}
                            className="border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-500 transition bg-slate-50/30 font-sans"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Payment Gateways Config */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col gap-4 mt-6">
                  <span className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Konfigurasi Payment Gateway</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {gatewaysList.map((g) => (
                      <div key={g.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-slate-700">{g.name}</span>
                          <span className="text-[10px] text-slate-400">Jalur pembayaran via {g.id === 'stripe' ? 'kartu internasional' : 'e-wallet & bank lokal'}.</span>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => handleToggleGateway(g.id, !g.is_enabled)}
                          disabled={togglingGatewayId === g.id}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer ${
                            g.is_enabled ? 'bg-indigo-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                              g.is_enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Models Config */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col gap-4 mt-6">
                  <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-800">Manajemen Model AI (Google Gemini & OpenRouter)</span>
                    <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">AI GATEWAY CONFIG</span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {aiModels.map((model) => {
                      const state = editModelStates[model.id];
                      if (!state) return null;

                      return (
                        <div key={model.id} className="border border-slate-100 rounded-xl p-4 md:p-5 bg-slate-50/50 flex flex-col gap-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">{model.id} settings</span>
                            </div>
                            
                            <button
                              onClick={() => handleSaveModel(model.id)}
                              disabled={savingModelId === model.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-[10px] font-bold rounded-lg shadow-sm transition cursor-pointer self-start md:self-auto"
                            >
                              {savingModelId === model.id ? (
                                <IconLoader className="h-3 w-3 animate-spin" />
                              ) : (
                                <IconDeviceFloppy className="h-3 w-3" />
                              )}
                              Simpan Model
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Model Display Name */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Tampilan Model</label>
                              <input
                                type="text"
                                value={state.name}
                                onChange={(e) => setEditModelStates((prev) => ({
                                  ...prev,
                                  [model.id]: { ...prev[model.id], name: e.target.value }
                                }))}
                                className="border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-indigo-500 transition bg-white"
                              />
                            </div>

                            {/* API Model ID */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ID Model API Asli</label>
                              <input
                                type="text"
                                value={state.model_id}
                                onChange={(e) => setEditModelStates((prev) => ({
                                  ...prev,
                                  [model.id]: { ...prev[model.id], model_id: e.target.value }
                                }))}
                                className="border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-indigo-500 transition bg-white font-mono"
                              />
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-6">
                            {/* Toggle is_enabled */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setEditModelStates((prev) => ({
                                  ...prev,
                                  [model.id]: { ...prev[model.id], is_enabled: !prev[model.id].is_enabled }
                                }))}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition cursor-pointer ${
                                  state.is_enabled ? 'bg-indigo-600' : 'bg-slate-300'
                                }`}
                              >
                                <span
                                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${
                                    state.is_enabled ? 'translate-x-4.5' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                              <span className="text-[10px] font-bold text-slate-600 uppercase">Aktifkan Model</span>
                            </div>

                            {/* Toggle is_premium */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setEditModelStates((prev) => ({
                                  ...prev,
                                  [model.id]: { ...prev[model.id], is_premium: !prev[model.id].is_premium }
                                }))}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition cursor-pointer ${
                                  state.is_premium ? 'bg-indigo-600' : 'bg-slate-300'
                                }`}
                              >
                                <span
                                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${
                                    state.is_premium ? 'translate-x-4.5' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                              <span className="text-[10px] font-bold text-slate-600 uppercase">Khusus Akun Pro</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                </>
              )}
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
                    <span className={`px-2.5 py-0.5 border rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      activePlanId === 'pro'
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
      ) : (
        /* Main content area */
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Navbar 1 – Document title and actions */}
        <header className="flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-3 lg:sticky lg:top-0 z-10 backdrop-blur">
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
            <input
              type="text"
              placeholder="Untitled Document"
              value={currentDocument?.title || ''}
              onChange={(e) => onRenameDocument(e.target.value)}
              className="border-b border-transparent focus:border-indigo-400 text-base font-semibold text-slate-800 outline-none bg-transparent px-1 py-0.5 transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                if (role !== 'admin' && activePlanId === 'free') {
                  alert("🔒 Fitur Ekspor Microsoft Word (.doc) khusus untuk pengguna paket Pro Writer. Silakan upgrade akun Anda.");
                } else {
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
                  const bibs = bibliographyEntries.map(e => e.formatted);
                  exportToWordFile(title, bList, bibs);
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition shadow-sm cursor-pointer"
            >
              <IconFileWord className="h-4 w-4 text-slate-400" />
              Export Word
            </button>
            
            <button 
              onClick={() => setIsShareOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition shadow-sm cursor-pointer"
            >
              <IconShare className="h-4 w-4 text-slate-400" />
              Share
            </button>

            <button 
              onClick={() => setIsPricingOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition shadow-sm cursor-pointer"
            >
              <IconCreditCard className="h-4 w-4 text-slate-400" />
              Pricing
            </button>

            <button 
              onClick={() => setShowRightSidebar(prev => !prev)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition shadow-sm cursor-pointer ${
                showRightSidebar 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' 
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
              title="Toggle Bilah Asisten Riset"
            >
              <IconLayoutSidebarRightCollapse className={`h-4 w-4 ${showRightSidebar ? 'text-indigo-600' : 'text-slate-400'}`} />
              Asisten Riset
            </button>
            <button className="p-2 rounded-md hover:bg-slate-100 transition text-slate-400 hover:text-slate-700" aria-label="More options">
              <IconDots className="h-5 w-5" />
            </button>
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
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition" 
            title="Insert Link"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editorJsRef.current?.toggleInlineFormat('link')}
          >
            <IconLink className="h-4 w-4" />
          </button>
          <button 
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition" 
            title="Highlight text"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editorJsRef.current?.toggleInlineFormat('highlight')}
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
            onClick={() => editorJsRef.current?.insertCitation()}
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
              const url = prompt('Enter image URL:');
              if (url) editorJsRef.current?.insertImage(url);
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
            onClick={() => editorJsRef.current?.insertInlineEquation()}
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

          <div className="ml-auto text-xs font-medium text-slate-400 bg-slate-100/50 px-2 py-1 rounded">
            {statusLabel}
          </div>
        </div>

        {/* Custom Rich Text Selection Bubble Menu */}
        {showBubbleMenu && bubbleMenuRect && (
          <div
            className="fixed z-50 bg-white border border-slate-200/80 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex flex-col transition-all duration-150 backdrop-blur-sm overflow-hidden"
            style={{
              top: `${bubbleMenuRect.bottom + 10}px`,
              left: `${Math.max(10, bubbleMenuRect.left + bubbleMenuRect.width / 2 - (bubbleMode === 'citation' ? 240 : 140))}px`,
              width: bubbleMode === 'citation' ? '480px' : '280px',
            }}
          >
            {/* ── FORMAT MODE ── */}
            {bubbleMode === 'format' && (
              <div className="p-2 flex flex-col gap-1.5">
                {/* Inline format buttons */}
                <div className="flex items-center gap-0.5 justify-between px-1">
                  <button className={getBtnClass(activeFormats.bold)} onMouseDown={e => e.preventDefault()} onClick={() => editorJsRef.current?.toggleInlineFormat('bold')} title="Bold"><IconBold className="h-3.5 w-3.5" /></button>
                  <button className={getBtnClass(activeFormats.italic)} onMouseDown={e => e.preventDefault()} onClick={() => editorJsRef.current?.toggleInlineFormat('italic')} title="Italic"><IconItalic className="h-3.5 w-3.5" /></button>
                  <button className={getBtnClass(activeFormats.underline)} onMouseDown={e => e.preventDefault()} onClick={() => editorJsRef.current?.toggleInlineFormat('underline')} title="Underline"><IconUnderline className="h-3.5 w-3.5" /></button>
                  <button className={getBtnClass(activeFormats.strikethrough)} onMouseDown={e => e.preventDefault()} onClick={() => editorJsRef.current?.toggleInlineFormat('strikethrough')} title="Strikethrough"><IconStrikethrough className="h-3.5 w-3.5" /></button>
                  <button className={getBtnClass(activeFormats.code)} onMouseDown={e => e.preventDefault()} onClick={() => editorJsRef.current?.toggleInlineFormat('code')} title="Code"><IconCode className="h-3.5 w-3.5" /></button>
                  <button className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition" onMouseDown={e => e.preventDefault()} onClick={() => editorJsRef.current?.toggleInlineFormat('link')} title="Link"><IconLink className="h-3.5 w-3.5" /></button>
                  <button className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition" onMouseDown={e => e.preventDefault()} onClick={() => editorJsRef.current?.toggleInlineFormat('highlight')} title="Highlight"><IconHighlight className="h-3.5 w-3.5" /></button>
                </div>
                <div className="h-px bg-slate-100 w-full" />
                {/* Action buttons */}
                <div className="flex flex-col gap-0.5">
                  <button
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-left rounded-md text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 transition text-xs font-semibold"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => {
                      setBubbleMode('citation');
                      onFindCitation(); // trigger search with selected text
                    }}
                  >
                    <IconSearch className="h-3.5 w-3.5 text-indigo-500" />
                    @ Find Citation
                  </button>
                  
                  <div className="flex gap-1.5 mt-0.5">
                    <select
                      value={selectedAiModel}
                      onChange={(e) => setSelectedAiModel(e.target.value)}
                      className="border border-slate-200 rounded-lg px-2 py-1 text-[10px] text-slate-600 bg-white outline-none focus:border-indigo-500 transition shrink-0 max-w-[125px] cursor-pointer"
                    >
                      {aiModels && aiModels.length > 0 ? (
                        aiModels.filter(m => m.is_enabled).map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="gemini">Gemini (Direct)</option>
                          <option value="llama3">Llama 3 (Free)</option>
                          <option value="gemma2">Gemma 2 (Free)</option>
                          <option value="claude">Claude 3.5 (Pro)</option>
                        </>
                      )}
                    </select>

                    <button
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition text-[10px] cursor-pointer disabled:bg-indigo-400"
                      onMouseDown={e => e.preventDefault()}
                      disabled={isImproving}
                      onClick={() => {
                        const modelObj = aiModels.find(m => m.id === selectedAiModel);
                        const isPremium = modelObj ? modelObj.is_premium : (selectedAiModel === 'claude');
                        if (isPremium && activePlanId === 'free') {
                          alert(`🔒 Model "${modelObj?.name || 'Premium'}" khusus untuk pengguna paket Pro Writer. Silakan upgrade akun Anda.`);
                        } else {
                          onImproveWriting();
                        }
                      }}
                    >
                      {isImproving ? (
                        <>
                          <IconLoader className="h-3 w-3 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <IconSparkles className="h-3 w-3" />
                          <span>Poles dengan AI</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* AI Result display directly inside bubble menu if loaded */}
                {improvedText && !isImproving && (
                  <div className="flex flex-col gap-1.5 p-2 bg-indigo-50/50 border border-indigo-100 rounded-lg mt-1 text-[10px] animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-700 uppercase tracking-wider text-[8px]">Hasil Poles AI:</span>
                      {selectedAiModel !== 'gemini' && (
                        <span className="text-[8px] bg-indigo-100 text-indigo-800 font-bold px-1 rounded">OpenRouter</span>
                      )}
                    </div>
                    <p className="text-slate-700 leading-normal italic font-medium">
                      "{improvedText.improved_text}"
                    </p>
                    <button
                      onClick={() => {
                        onApplyImprovedText();
                        // Hide bubble menu after apply by clearing selection
                        onSelectionChange?.('');
                      }}
                      className="mt-1 w-full py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md shadow-sm transition cursor-pointer text-center text-[9px]"
                    >
                      Terapkan Perubahan Kalimat
                    </button>
                  </div>
                )}

                {aiError && (
                  <div className="p-2 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-[10px] mt-1 leading-normal">
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
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <IconSearch className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-700 truncate flex-1">
                    &ldquo;{selectedText.slice(0, 40)}{selectedText.length > 40 ? '…' : ''}&rdquo;
                  </span>
                  <button
                    className="p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition flex-shrink-0"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => { setShowBubbleMenu(false); setBubbleMode('format'); }}
                    title="Close"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>

                {/* Loading */}
                {isSearchingCitations && (
                  <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-400">
                    <svg className="h-4 w-4 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/>
                      <path d="M12 2a10 10 0 0 1 10 10"/>
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
                          <span className="uppercase tracking-wider font-bold text-slate-500">Article</span>
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
                                onInsertCitationCandidate(candidate);
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
                                className={`inline-flex items-center justify-center gap-1 rounded-lg border px-3 py-1.5 text-[10px] font-semibold transition whitespace-nowrap ${
                                  expandedCardId === candidate.reference_id
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
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              candidate.source === 'OpenAlex'
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
          <main className="w-full flex-1 p-6 md:p-10 overflow-y-auto">
            <EditorJsEditor 
              ref={editorJsRef} 
              onBlockTypeChange={setCurrentBlockType} 
              onAlignmentChange={setCurrentAlignment} 
              onStatsChange={onStatsChange}
              onCiteClick={onCiteClick}
              onContentChange={onContentChange}
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
              onFindCitation={onFindCitation}
              onRepeatCitationSearch={onRepeatCitationSearch}
              onInsertCitation={onInsertCitation}
              onInsertBibliography={onInsertBibliography}
              onInsertImageSample={onInsertImageSample}
              onExportBibliographyText={onExportBibliographyText}
              onExportBibliographyJson={onExportBibliographyJson}
              onInsertCitationCandidate={onInsertCitationCandidate}
              onParafrasePlagiat={onParafrasePlagiat}
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
    />
  </div>
);
}
