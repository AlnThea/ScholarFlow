'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  IconX,
  IconSend,
  IconSparkles,
  IconQuote,
  IconCopy,
  IconCheck,
  IconTrash,
  IconBook,
  IconLoader2,
  IconMicroscope,
  IconChartBar,
  IconBulb,
  IconAlertTriangle,
  IconFileText,
  IconExternalLink,
  IconCrown,
  IconBolt,
  IconArrowUpRight,
  IconKey,
} from '@tabler/icons-react';
import {
  loadPaperChatHistory,
  cacheLocalPaperChat,
  clearPaperChatHistory,
  type PaperChatMessage,
  type PaperInsights,
} from '@/lib/ai/paper-chat';
import { saveLocalQuotaState } from '@/lib/ai/token-quota';

export interface PaperChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  paper: {
    referenceId: string;
    title: string;
    authors?: string[];
    year?: number | null;
    journal?: string | null;
    abstract?: string | null;
    doi?: string | null;
    url?: string | null;
    citationLabel?: string | null;
  } | null;
  language?: 'en' | 'id';
  userId?: string;
  userPlan?: string;
  selectedAiModel?: string;
  onInsertToEditor?: (text: string, referenceId?: string, label?: string) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  onUpgradePro?: () => void;
  customApiKey?: string;
}

export function PaperChatModal({
  isOpen,
  onClose,
  paper,
  language = 'id',
  userId,
  userPlan = 'free',
  selectedAiModel,
  onInsertToEditor,
  onShowToast,
  onUpgradePro,
  customApiKey,
}: PaperChatModalProps) {
  const isEn = language === 'en';
  const isProUser = userPlan?.toLowerCase() === 'pro' || userPlan?.toLowerCase() === 'premium';
  const [messages, setMessages] = useState<PaperChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [requiresPro, setRequiresPro] = useState(false);
  const [isByokActive, setIsByokActive] = useState<boolean>(Boolean(customApiKey && customApiKey.trim().length > 5));
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [insertedId, setInsertedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'insights'>('chat');
  const [latestInsights, setLatestInsights] = useState<PaperInsights | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick prompt suggestions
  const quickPrompts = isEn
    ? [
        {
          label: 'Methodology',
          icon: IconMicroscope,
          query: 'What is the primary research methodology, design, and experimental setup used in this study?',
        },
        {
          label: 'Sample & Data',
          icon: IconChartBar,
          query: 'What is the sample size, dataset characteristics, and population studied in this research?',
        },
        {
          label: 'Key Findings',
          icon: IconBulb,
          query: 'What are the core findings, empirical discoveries, and main theoretical contributions of this paper?',
        },
        {
          label: 'Limitations',
          icon: IconAlertTriangle,
          query: 'What are the main limitations, constraints, and threats to validity documented by the authors?',
        },
        {
          label: 'Draft Synthesis',
          icon: IconQuote,
          query: 'Synthesize a 1-sentence formal scholarly statement with in-text citation suitable for my literature review.',
        },
      ]
    : [
        {
          label: 'Metodologi',
          icon: IconMicroscope,
          query: 'Apa metodologi penelitian, desain riset, dan instrumen eksperimental yang digunakan dalam paper ini?',
        },
        {
          label: 'Sampel & Data',
          icon: IconChartBar,
          query: 'Berapa ukuran sampel, karakteristik dataset, dan populasi yang diteliti dalam riset ini?',
        },
        {
          label: 'Temuan Kunci',
          icon: IconBulb,
          query: 'Apa temuan empiris utama, bukti signifikansi, dan kontribusi ilmiah terbesar dari naskah ini?',
        },
        {
          label: 'Batasan Riset',
          icon: IconAlertTriangle,
          query: 'Apa saja batasan riset (limitations) dan kelemahan metodologi yang disebutkan oleh penulis?',
        },
        {
          label: 'Sintesis Sitasi',
          icon: IconQuote,
          query: 'Buatkan 1 kalimat sintesis formal ilmiah lengkap dengan sitasi naskah yang siap disisipkan ke tinjauan pustaka saya.',
        },
      ];

  // Load chat history when paper changes
  useEffect(() => {
    if (!isOpen || !paper?.referenceId) return;

    let isMounted = true;
    loadPaperChatHistory(paper.referenceId, userId).then((history) => {
      if (!isMounted) return;
      setMessages(history);
      if (history.length > 0) {
        // Find last assistant message's suggested citation
        const lastAssistant = [...history].reverse().find((m) => m.role === 'assistant');
        if (lastAssistant?.suggestedCitationSentence) {
          setLatestInsights({
            keyFindings: lastAssistant.content.slice(0, 200) + '...',
          });
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, paper?.referenceId, userId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen || !paper) return null;

  const authorsText = paper.authors && paper.authors.length > 0 ? paper.authors.join(', ') : (isEn ? 'Unknown Authors' : 'Penulis Tidak Diketahui');
  const yearText = paper.year ? String(paper.year) : (isEn ? 'n.d.' : 't.t.');
  const labelText = paper.citationLabel || (paper.authors && paper.authors[0] ? `${paper.authors[0]}, ${yearText}` : 'Ref');

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isLoading) return;

    setInputQuery('');
    setIsLoading(true);

    // Optimistic user message
    const tempUserMsg: PaperChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    const nextConversation = [...messages, tempUserMsg];
    setMessages(nextConversation);

    try {
      const response = await fetch('/api/v1/ai/paper-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceId: paper.referenceId,
          paperTitle: paper.title,
          paperAuthors: paper.authors || [],
          paperYear: paper.year,
          paperJournal: paper.journal,
          paperAbstract: paper.abstract,
          paperDoi: paper.doi,
          paperUrl: paper.url,
          citationLabel: labelText,
          question: textToSend,
          conversationHistory: messages,
          model: selectedAiModel || 'gemini',
          language: (/[\b](yang|dan|berapa|apa|bagaimana|adalah|di|ke|pada|untuk|dari|sampel|metode|penelitian)[\b]/i.test(textToSend)) ? 'id' : (isEn ? 'en' : 'id'),
          userId,
          userPlan,
          customApiKey,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData?.quotaExceeded) {
          setQuotaExceeded(true);
        }
        if (errorData?.requiresPro) {
          setRequiresPro(true);
        }
        throw new Error(errorData.error || (isEn ? 'Failed to process question' : 'Gagal memproses pertanyaan'));
      }

      const result = await response.json();
      if (result.is_byok) {
        setIsByokActive(true);
      }
      const updatedMessages = result.conversation || nextConversation;
      setMessages(updatedMessages);

      if (result.extractedInsights) {
        setLatestInsights(result.extractedInsights);
      }

      if (typeof result.tokens_used === 'number') {
        saveLocalQuotaState(result.tokens_used, result.monthly_quota);
      }

      // Cache locally
      cacheLocalPaperChat(paper.referenceId, updatedMessages);
    } catch (err: any) {
      const errorMsg: PaperChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `⚠️ ${err.message || (isEn ? 'An error occurred while analyzing the paper.' : 'Terjadi kendala saat menganalisis paper.')}`,
        timestamp: new Date().toISOString(),
      };
      const withError = [...nextConversation, errorMsg];
      setMessages(withError);
      cacheLocalPaperChat(paper.referenceId, withError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertSentence = (text: string, msgId: string) => {
    if (!onInsertToEditor) {
      onShowToast?.(isEn ? 'Editor insertion handler not ready' : 'Handler editor belum siap', 'error');
      return;
    }

    onInsertToEditor(text, paper.referenceId, labelText);
    setInsertedId(msgId);
    setTimeout(() => setInsertedId(null), 2500);

    onShowToast?.(
      isEn
        ? 'Cited statement successfully inserted into document!'
        : 'Pernyataan berkutip berhasil disisipkan ke naskah!',
      'success'
    );
  };

  const handleCopyText = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
    onShowToast?.(isEn ? 'Copied to clipboard' : 'Berhasil disalin ke clipboard', 'info');
  };

  const handleClearChat = async () => {
    await clearPaperChatHistory(paper.referenceId, userId);
    setMessages([]);
    setLatestInsights(null);
    onShowToast?.(isEn ? 'Chat history cleared' : 'Riwayat percakapan dibersihkan', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all animate-fade-in">
      <div className="relative w-full max-w-3xl h-[85vh] max-h-[750px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                <IconSparkles className="w-3 h-3" />
                {isEn ? 'Paper Literature AI' : 'AI Asisten Paper'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                [{labelText}]
              </span>

              {isByokActive ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60" title={isEn ? "Dedicated BYOK API Key Active - Unlimited Quota" : "Kunci API BYOK Mandiri Aktif - Bebas Kuota"}>
                  <IconKey className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  BYOK UNLIMITED
                </span>
              ) : isProUser ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                  <IconCrown className="w-3 h-3 text-amber-500" />
                  PRO
                </span>
              ) : (
                <div className="inline-flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    FREE
                  </span>
                  {onUpgradePro && (
                    <button
                      type="button"
                      onClick={onUpgradePro}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white shadow-xs transition cursor-pointer"
                      title={isEn ? "Upgrade to Pro for 1,000,000 tokens & Claude 3.5 Sonnet" : "Upgrade ke Pro untuk kuota 1.000.000 token & Claude 3.5 Sonnet"}
                    >
                      <IconBolt className="w-2.5 h-2.5" />
                      <span>{isEn ? 'Upgrade Pro' : 'Upgrade Pro'}</span>
                    </button>
                  )}
                </div>
              )}

              {paper.doi && (
                <a
                  href={`https://doi.org/${paper.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  DOI <IconExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1" title={paper.title}>
              {paper.title}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {authorsText} ({yearText}) {paper.journal ? `• ${paper.journal}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClearChat}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                title={isEn ? 'Clear Conversation' : 'Hapus Percakapan'}
              >
                <IconTrash className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={isEn ? 'Close' : 'Tutup'}
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Chat vs Key Insights) */}
        <div className="flex items-center px-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`py-2.5 border-b-2 transition ${
              activeTab === 'chat'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            💬 {isEn ? 'Interactive Q&A' : 'Tanya Jawab Interaktif'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('insights')}
            className={`py-2.5 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'insights'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            🔬 {isEn ? 'Extracted Insights' : 'Wawasan & Ekstraksi'}
            {latestInsights && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* Content Body */}
        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 dark:bg-slate-950/40">
            {/* Quick Prompts Bar */}
            <div className="px-5 py-2.5 border-b border-slate-100 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1">
                {isEn ? 'Quick Inquire:' : 'Pertanyaan Cepat:'}
              </span>
              {quickPrompts.map((qp, idx) => {
                const IconComponent = qp.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSendMessage(qp.query)}
                    className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition disabled:opacity-50"
                  >
                    <IconComponent className="w-3 h-3 text-indigo-500" />
                    <span>{qp.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Chat Messages Transcript */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                    <IconBook className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? 'Ask anything about this research paper' : 'Tanyakan apa saja tentang naskah paper ini'}
                  </h4>
                  <p className="text-xs max-w-md leading-relaxed">
                    {isEn
                      ? 'Inquire about statistical datasets, methodology nuances, primary contributions, or extract ready-to-use citations for your manuscript.'
                      : 'Ketahui detail metodologi, ukuran sampel, hasil temuan, batasan riset, atau peroleh kalimat kutipan naskah dalam hitungan detik.'}
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          <IconSparkles className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                          isUser
                            ? 'bg-indigo-600 text-white rounded-tr-none'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700/70 rounded-tl-none'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.content}</div>

                        {/* Suggested In-Text Citation Card & Action Buttons for Assistant */}
                        {!isUser && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex flex-col gap-2">
                            {msg.suggestedCitationSentence && (
                              <div className="p-2.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex flex-col gap-1.5">
                                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                                  <IconQuote className="w-3 h-3" />
                                  {isEn ? 'Suggested Manuscript In-Text Citation:' : 'Kutipan Naskah Akademik:'}
                                </span>
                                <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 italic">
                                  "{msg.suggestedCitationSentence}"
                                </p>
                                <button
                                  type="button"
                                  onClick={() => handleInsertSentence(msg.suggestedCitationSentence!, msg.id)}
                                  className="mt-1 w-full py-1.5 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[11px] font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                  {insertedId === msg.id ? (
                                    <>
                                      <IconCheck className="w-3.5 h-3.5" />
                                      <span>{isEn ? 'Inserted into Editor!' : 'Tersisip ke Dokumen!'}</span>
                                    </>
                                  ) : (
                                    <>
                                      <IconQuote className="w-3.5 h-3.5" />
                                      <span>{isEn ? 'Insert Citation into Document' : 'Kutip Jawaban ke Naskah'}</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span>
                                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyText(msg.content, msg.id)}
                                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
                              >
                                {copiedId === msg.id ? (
                                  <>
                                    <IconCheck className="w-3 h-3 text-emerald-500" />
                                    <span className="text-emerald-500">{isEn ? 'Copied' : 'Disalin'}</span>
                                  </>
                                ) : (
                                  <>
                                    <IconCopy className="w-3 h-3" />
                                    <span>{isEn ? 'Copy' : 'Salin'}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {isUser && (
                        <div className="w-7 h-7 rounded-lg bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                          U
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {isLoading && (
                <div className="flex gap-3 justify-start items-center">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <IconLoader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    <span>{isEn ? 'Synthesizing paper insights...' : 'Mengekstraksi wawasan paper...'}</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quota Exceeded or Pro Feature Banner */}
            {(quotaExceeded || requiresPro) && (
              <div className="p-3 mx-3 mb-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-3 shadow-xs animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <IconCrown className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      {requiresPro
                        ? (isEn ? 'Pro Subscription Required' : 'Memerlukan Paket Pro')
                        : (isEn ? 'Monthly Token Quota Limit Reached' : 'Batas Kuota Token Bulanan Tercapai')}
                    </p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300/80">
                      {requiresPro
                        ? (isEn ? 'This advanced AI model is available on Pro. Upgrade to unlock.' : 'Model AI tingkat lanjut ini khusus untuk pelanggan Pro. Upgrade untuk membuka akses.')
                        : (isEn
                          ? 'You have used your 50,000 monthly Free tokens. Upgrade to Pro for 1,000,000 tokens/month.'
                          : 'Anda telah mencapai batas 50.000 token Free. Upgrade ke Pro untuk 1.000.000 token/bulan.')}
                    </p>
                  </div>
                </div>
                {onUpgradePro && (
                  <button
                    type="button"
                    onClick={onUpgradePro}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <span>{isEn ? 'Upgrade Now' : 'Upgrade Sekarang'}</span>
                    <IconArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={isEn ? "Ask a specific research question about this paper..." : "Tanyakan aspek spesifik dari paper ini..."}
                disabled={isLoading}
                className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold transition flex items-center justify-center shrink-0"
              >
                {isLoading ? (
                  <IconLoader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <IconSend className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Insights View */
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Methodology */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                  <IconMicroscope className="w-4 h-4" />
                  <span>{isEn ? 'Research Methodology' : 'Metodologi Penelitian'}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {latestInsights?.methodology || (isEn ? 'Ask a question in Chat to extract methodology details.' : 'Kirim pertanyaan di tab Tanya Jawab untuk mengekstraksi detail metodologi.')}
                </p>
              </div>

              {/* Sample & Data */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                  <IconChartBar className="w-4 h-4" />
                  <span>{isEn ? 'Sample Size & Dataset' : 'Ukuran Sampel & Dataset'}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {latestInsights?.sampleSize || (isEn ? 'Ask about dataset parameters to populate this insight.' : 'Tanyakan parameter dataset untuk memunculkan wawasan ini.')}
                </p>
              </div>

              {/* Key Findings */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <IconBulb className="w-4 h-4" />
                  <span>{isEn ? 'Key Findings & Contributions' : 'Temuan Utama & Kontribusi'}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {latestInsights?.keyFindings || (isEn ? 'Extract key contributions using quick prompt.' : 'Ekstraksi temuan penting menggunakan tombol pertanyaan cepat.')}
                </p>
              </div>

              {/* Limitations */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                  <IconAlertTriangle className="w-4 h-4" />
                  <span>{isEn ? 'Study Limitations' : 'Batasan Riset'}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {latestInsights?.limitations || (isEn ? 'Evaluate potential study limitations.' : 'Evaluasi potensi batasan atau kelemahan penelitian.')}
                </p>
              </div>
            </div>

            {/* Full Abstract Viewer Card */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col gap-2">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold text-xs">
                <IconFileText className="w-4 h-4 text-indigo-500" />
                <span>{isEn ? 'Indexed Abstract' : 'Abstrak Terindeks'}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic font-serif">
                {paper.abstract || (isEn ? 'No abstract available for this entry.' : 'Tidak ada abstrak yang tersimpan untuk entri ini.')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
