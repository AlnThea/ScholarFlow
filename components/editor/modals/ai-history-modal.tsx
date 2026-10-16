'use client';

import React, { useState, useMemo } from 'react';
import {
  IconHistory,
  IconX,
  IconCopy,
  IconCheck,
  IconTrash,
  IconSparkles,
  IconSearch,
  IconDownload,
  IconFileText,
  IconNotes,
  IconCalculator,
  IconBook,
} from '@tabler/icons-react';
import type { AiHistoryEntry } from '@/lib/editor/ai-history';

export interface AiHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiHistory: AiHistoryEntry[];
  onDeleteAiHistoryEntry: (id: string) => void;
  onClearAiHistory: () => void;
  onApplyText: (text: string) => void;
  isAdmin?: boolean;
  language?: string;
}

export function AiHistoryModal({
  isOpen,
  onClose,
  aiHistory,
  onDeleteAiHistoryEntry,
  onClearAiHistory,
  onApplyText,
  isAdmin = false,
  language = 'id',
}: AiHistoryModalProps) {
  const isEn = language === 'en';
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Filter and search entries
  const filteredHistory = useMemo(() => {
    return aiHistory.filter((item) => {
      // Category filter
      if (selectedFilter === 'improve') {
        if (!['academic', 'expand', 'shorten', 'simplify'].includes(item.tone)) return false;
      } else if (selectedFilter === 'paraphrase') {
        if (item.tone !== 'paraphrase') return false;
      } else if (selectedFilter === 'abstract') {
        if (item.tone !== 'abstract') return false;
      } else if (selectedFilter === 'synthesis') {
        if (item.tone !== 'synthesis') return false;
      } else if (selectedFilter === 'stats') {
        if (item.tone !== 'statistical') return false;
      }

      // Keyword query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesOriginal = item.originalText.toLowerCase().includes(query);
        const matchesImproved = item.improvedText.toLowerCase().includes(query);
        const matchesTone = item.tone.toLowerCase().includes(query);
        if (!matchesOriginal && !matchesImproved && !matchesTone) return false;
      }

      return true;
    });
  }, [aiHistory, selectedFilter, searchQuery]);

  // Counts for tabs
  const counts = useMemo(() => {
    const res = { all: aiHistory.length, improve: 0, paraphrase: 0, abstract: 0, synthesis: 0, stats: 0 };
    aiHistory.forEach((item) => {
      if (['academic', 'expand', 'shorten', 'simplify'].includes(item.tone)) res.improve++;
      else if (item.tone === 'paraphrase') res.paraphrase++;
      else if (item.tone === 'abstract') res.abstract++;
      else if (item.tone === 'synthesis') res.synthesis++;
      else if (item.tone === 'statistical') res.stats++;
    });
    return res;
  }, [aiHistory]);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleExportDisclosure = () => {
    setIsExporting(true);
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      let md = `# ScholarFlow AI Transparency & Audit Disclosure Report\n`;
      md += `**Date:** ${new Date().toLocaleString()}\n`;
      md += `**Total Records:** ${aiHistory.length}\n`;
      md += `**Platform:** ScholarFlow Academic AI Co-Pilot\n\n`;
      md += `---\n\n`;

      aiHistory.forEach((item, idx) => {
        md += `### ${idx + 1}. [${item.tone.toUpperCase()}] at ${item.savedAt}\n`;
        md += `- **Original Draft / Context:** ${item.originalText}\n`;
        md += `- **AI Generation Result:**\n> ${item.improvedText.replace(/\n/g, '\n> ')}\n\n`;
      });

      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ScholarFlow-AI-Disclosure-${timestamp}.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export AI report:', err);
    } finally {
      setTimeout(() => setIsExporting(false), 500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in text-slate-800 dark:text-slate-100">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl w-full max-w-3xl flex flex-col gap-4 animate-scale-in max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-inner">
              <IconHistory className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  {isEn ? 'AI Generation History' : 'Riwayat Generasi AI'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                  {aiHistory.length}
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {isEn ? 'Persistent cross-session drafts & server-side logs' : 'Draf lintas sesi persisten & log server-side'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {aiHistory.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleExportDisclosure}
                  disabled={isExporting}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
                  title={isEn ? 'Export Academic AI Transparency Disclosure' : 'Unduh Laporan Transparansi AI'}
                >
                  <IconDownload className="h-3.5 w-3.5" />
                  {isEn ? 'Export Report' : 'Unduh Laporan'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(isEn ? 'Clear all AI generation history?' : 'Bersihkan seluruh riwayat generasi AI?')) {
                      onClearAiHistory();
                    }
                  }}
                  className="px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                >
                  {isEn ? 'Clear All' : 'Bersihkan'}
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
            >
              <IconX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: isEn ? 'All' : 'Semua', count: counts.all, icon: IconNotes },
              { id: 'improve', label: isEn ? 'Polish' : 'Poles', count: counts.improve, icon: IconFileText },
              { id: 'paraphrase', label: isEn ? 'Paraphrase' : 'Parafrase', count: counts.paraphrase, icon: IconSparkles },
              { id: 'abstract', label: isEn ? 'Abstract' : 'Abstrak', count: counts.abstract, icon: IconNotes },
              { id: 'synthesis', label: isEn ? 'Synthesis' : 'Sintesis', count: counts.synthesis, icon: IconBook },
              { id: 'stats', label: isEn ? 'Stats' : 'Statistik', count: counts.stats, icon: IconCalculator },
            ].map((tab) => {
              const active = selectedFilter === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedFilter(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                      active ? 'bg-indigo-500/80 text-white' : 'bg-slate-200/80 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative shrink-0 sm:w-56">
            <IconSearch className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEn ? 'Search history...' : 'Cari riwayat...'}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
        </div>

        {/* Modal Body: Cards List */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 min-h-[220px]">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 p-4 shadow-xs hover:shadow-md transition duration-200 border-l-4 border-l-indigo-500 flex flex-col gap-3"
              >
                {/* Header: Tone badge, Model, Sync state, Time, Delete */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md ${
                        item.tone === 'simplify'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40'
                          : item.tone === 'shorten'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40'
                          : item.tone === 'expand'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40'
                          : item.tone === 'paraphrase'
                          ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-200/60 dark:border-sky-900/40'
                          : item.tone === 'summarize'
                          ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-200/60 dark:border-purple-900/40'
                          : item.tone === 'abstract'
                          ? 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/40'
                          : item.tone === 'synthesis'
                          ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-200/60 dark:border-teal-900/40'
                          : item.tone === 'statistical'
                          ? 'bg-fuchsia-50 dark:bg-fuchsia-950/60 text-fuchsia-700 dark:text-fuchsia-400 border border-fuchsia-200/60 dark:border-fuchsia-900/40'
                          : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/40'
                      }`}
                    >
                      {item.tone === 'simplify'
                        ? isEn ? 'Simplify' : 'Sederhana'
                        : item.tone === 'shorten'
                        ? isEn ? 'Condense' : 'Ringkas'
                        : item.tone === 'expand'
                        ? isEn ? 'Elaborate' : 'Elaborasi'
                        : item.tone === 'paraphrase'
                        ? isEn ? 'Paraphrase' : 'Parafrase'
                        : item.tone === 'summarize'
                        ? isEn ? 'Summarize' : 'Ringkasan'
                        : item.tone === 'abstract'
                        ? isEn ? 'Abstract' : 'Abstrak'
                        : item.tone === 'synthesis'
                        ? isEn ? 'Literature Synthesis' : 'Sintesis Pustaka'
                        : item.tone === 'statistical'
                        ? isEn ? 'Statistical Analysis' : 'Analisis Statistik'
                        : isEn ? 'Academic Polish' : 'Poles Akademis'}
                    </span>

                    {/* Model Branding */}
                    {isAdmin ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 font-mono">
                        {item.model?.replace(' (Direct)', '').replace(' (Free OR)', '').replace(' (Pro OR)', '') || 'gemini'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 flex items-center gap-1.5 font-sans shadow-xs">
                        <IconSparkles className="h-3 w-3 text-indigo-500 animate-pulse shrink-0" />
                        ScholarFlow Academic AI
                      </span>
                    )}

                    {/* Cloud Sync indicator */}
                    {item.source === 'cloud' && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {isEn ? 'Cloud Synced' : 'Cloud Tersinkron'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium font-mono">{item.savedAt}</span>
                    <button
                      type="button"
                      onClick={() => onDeleteAiHistoryEntry(item.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      title={isEn ? 'Delete entry' : 'Hapus entri'}
                    >
                      <IconTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Preview: Original vs AI Result */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="flex flex-col gap-1.5 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 text-left">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                      {isEn ? 'Original Draft / Input:' : 'Draf Asli / Input:'}
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 italic leading-relaxed line-clamp-4">
                      "{item.originalText}"
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 bg-indigo-50/30 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-left">
                    <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {isEn ? 'AI Result:' : 'Hasil AI:'}
                    </span>
                    <p className="text-slate-800 dark:text-slate-100 font-medium leading-relaxed line-clamp-4">
                      "{item.improvedText}"
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 border-t border-slate-200/60 dark:border-slate-800 pt-2.5">
                  <button
                    type="button"
                    onClick={() => handleCopy(item.improvedText, item.id)}
                    className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    {copiedId === item.id ? (
                      <>
                        <IconCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400">{isEn ? 'Copied!' : 'Tersalin!'}</span>
                      </>
                    ) : (
                      <>
                        <IconCopy className="h-3.5 w-3.5" />
                        {isEn ? 'Copy' : 'Salin'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onApplyText(item.improvedText);
                      onClose();
                    }}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <IconCheck className="h-3.5 w-3.5" />
                    {isEn ? 'Apply to Canvas' : 'Terapkan ke Canvas'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
              <IconHistory className="h-10 w-10 text-slate-300 dark:text-slate-600" />
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {searchQuery || selectedFilter !== 'all'
                  ? isEn ? 'No matching history found.' : 'Tidak ada riwayat yang cocok.'
                  : isEn ? 'No AI generation history recorded yet.' : 'Belum ada riwayat perbaikan AI yang tercatat.'}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 text-center max-w-sm">
                {isEn
                  ? 'Use the AI Writing Assistant, Synthesis, or Stats Interpreter to generate drafts.'
                  : 'Gunakan Asisten Menulis AI, Sintesis Pustaka, atau Interpreter Statistik untuk membuat draf.'}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 shrink-0">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {isEn ? `Showing ${filteredHistory.length} of ${aiHistory.length} records` : `Menampilkan ${filteredHistory.length} dari ${aiHistory.length} riwayat`}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            {isEn ? 'Close' : 'Tutup'}
          </button>
        </div>
      </div>
    </div>
  );
}
