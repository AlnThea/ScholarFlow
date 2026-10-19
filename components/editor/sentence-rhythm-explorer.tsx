import React, { useMemo, useState, useEffect } from 'react';
import {
  IconFilter, IconRefresh, IconArrowRight, IconQuote, IconWand, IconChevronLeft
} from '@tabler/icons-react';
import { useLanguage } from '../i18n/language-context';

export interface SentenceToken {
  id: string;
  index: number;
  text: string;
  wordCount: number;
  varianceFromAvg: number;
  category: 'short' | 'standard' | 'long' | 'complex';
}

function extractSentences(text: string): SentenceToken[] {
  if (!text || text.trim() === '') return [];
  
  // Basic sentence boundary detection (handles ".", "!", "?", followed by space and Capital letter)
  const regex = /[^.!?\s][^.!?]*(?:[.!?](?!['"]?\s|$)[^.!?]*)*[.!?]?['"]?(?=\s|$)/g;
  const rawSentences = text.match(regex) || [];
  
  let totalWords = 0;
  const tokens = rawSentences.map((s, idx) => {
    const wordCount = s.trim().split(/\s+/).filter(w => w.length > 0).length;
    totalWords += wordCount;
    return {
      id: `s-${idx}`,
      index: idx + 1,
      text: s.trim(),
      wordCount,
    };
  });

  if (tokens.length === 0) return [];

  const avg = totalWords / tokens.length;

  return tokens.map(t => {
    const varianceFromAvg = t.wordCount - avg;
    let category: 'short' | 'standard' | 'long' | 'complex' = 'standard';
    if (t.wordCount <= 10) category = 'short';
    else if (t.wordCount <= 24) category = 'standard';
    else if (t.wordCount <= 36) category = 'long';
    else category = 'complex';

    return {
      ...t,
      varianceFromAvg,
      category
    };
  });
}

export function SentenceRhythmExplorer({ 
  content,
  onClose
}: { 
  content: string;
  onClose?: () => void;
}) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [filter, setFilter] = useState<'all' | 'short' | 'standard' | 'long'>('all');
  const [internalText, setInternalText] = useState(content || '');

  useEffect(() => {
    if (content) {
      setInternalText(content);
    }
  }, [content]);

  const handleAnalyzeEntireDoc = () => {
    const blocks = document.querySelectorAll('.ce-paragraph, .ce-header, .cdx-block');
    const texts: string[] = [];
    blocks.forEach((el) => {
      const t = el.textContent?.trim();
      if (t) texts.push(t);
    });
    const full = texts.join(' ');
    if (full.trim()) {
      setInternalText(full);
    }
  };

  const sentences = useMemo(() => extractSentences(internalText), [internalText]);

  const filteredSentences = useMemo(() => {
    if (filter === 'all') return sentences;
    if (filter === 'long') return sentences.filter(s => s.category === 'long' || s.category === 'complex');
    return sentences.filter(s => s.category === filter);
  }, [sentences, filter]);

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'short': return 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800';
      case 'standard': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'long': return 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800';
      case 'complex': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getCategoryBgOnly = (cat: string) => {
    switch(cat) {
      case 'short': return 'bg-cyan-500';
      case 'standard': return 'bg-blue-500';
      case 'long': return 'bg-indigo-600';
      case 'complex': return 'bg-purple-600';
      default: return 'bg-slate-400';
    }
  };

  const shortCount = sentences.filter(s => s.category === 'short').length;
  const stdCount = sentences.filter(s => s.category === 'standard').length;
  const longCount = sentences.filter(s => s.category === 'long' || s.category === 'complex').length;

  const handleSentenceClick = (s: SentenceToken) => {
    const blocks = document.querySelectorAll('.ce-paragraph, .ce-header');
    for (const block of Array.from(blocks)) {
      if (block.textContent?.includes(s.text)) {
        block.scrollIntoView({ behavior: 'smooth', block: 'center' });
        block.classList.add('bg-amber-100', 'dark:bg-amber-900/30', 'transition-colors', 'duration-500');
        setTimeout(() => {
          block.classList.remove('bg-amber-100', 'dark:bg-amber-900/30');
        }, 2000);
        break;
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-slate-900 overflow-hidden">
      {/* Header bar matching mockup */}
      <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-850/40">
        <div className="flex flex-col">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white">Sentence Rhythm Explorer</h2>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mt-0.5 tracking-wider">
            {isEn ? `Showing ${filteredSentences.length} of ${sentences.length}` : `Menampilkan ${filteredSentences.length} dari ${sentences.length}`}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleAnalyzeEntireDoc}
            className="text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer shadow-2xs"
            title={isEn ? "Analyze all sentences in current document" : "Analisis semua kalimat dalam naskah"}
          >
            {isEn ? 'All Doc' : 'Semua Naskah'}
          </button>
          {onClose && (
            <button 
              type="button"
              onClick={onClose} 
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              title={isEn ? "Close / Back to Documents" : "Tutup / Kembali ke Dokumen"}
            >
              <IconChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Cadence Ribbon and Filter Pills */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-850/20">
        {/* Cadence Ribbon (Click to Jump) */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
            {isEn ? 'Cadence Ribbon (Click to jump):' : 'Pita Ritme (Klik untuk lompat):'}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {sentences.length === 0 ? (
              <span className="text-[11px] text-slate-400 italic py-0.5">
                {isEn ? 'Select text or click "All Doc" to inspect rhythm...' : 'Blok teks atau klik "Semua Naskah" untuk melihat pita ritme...'}
              </span>
            ) : (
              sentences.map(s => (
                <button 
                  key={s.id}
                  type="button"
                  onClick={() => handleSentenceClick(s)}
                  title={isEn ? `Sentence ${s.index} (${s.wordCount} words - ${s.category})` : `Kalimat ${s.index} (${s.wordCount} kata - ${s.category})`}
                  className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-md text-[10px] font-bold text-white transition-all hover:scale-110 cursor-pointer shadow-xs ${getCategoryBgOnly(s.category)}`}
                >
                  {s.index}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Filter Pills with Flex-Wrap (Row Wrap) */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] font-medium">
          <button 
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-full border whitespace-nowrap transition-all cursor-pointer font-semibold shadow-2xs ${
              filter === 'all' 
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            {isEn ? `All (${sentences.length})` : `Semua (${sentences.length})`}
          </button>
          <button 
            type="button"
            onClick={() => setFilter('short')}
            className={`px-2.5 py-1 rounded-full border whitespace-nowrap transition-all cursor-pointer font-semibold shadow-2xs ${
              filter === 'short' 
                ? 'bg-cyan-500 text-white border-cyan-500 shadow-cyan-500/20' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            {isEn ? `Short ≤10w (${shortCount})` : `Pendek ≤10k (${shortCount})`}
          </button>
          <button 
            type="button"
            onClick={() => setFilter('standard')}
            className={`px-2.5 py-1 rounded-full border whitespace-nowrap transition-all cursor-pointer font-semibold shadow-2xs ${
              filter === 'standard' 
                ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/20' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            {isEn ? `Standard 11-24w (${stdCount})` : `Standar 11-24k (${stdCount})`}
          </button>
          <button 
            type="button"
            onClick={() => setFilter('long')}
            className={`px-2.5 py-1 rounded-full border whitespace-nowrap transition-all cursor-pointer font-semibold shadow-2xs ${
              filter === 'long' 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-500/20' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            {isEn ? `Long 25w+ (${longCount})` : `Panjang 25k+ (${longCount})`}
          </button>
        </div>
      </div>

      {/* Sentence Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/30 dark:bg-slate-900/50 thin-scroll">
        {filteredSentences.length === 0 ? (
          <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
            <p className="leading-relaxed">
              {isEn 
                ? "Highlight or select sentences in the editor to view sentence cadence analysis." 
                : "Blok atau pilih kalimat di editor naskah untuk melihat analisis ritme kalimat."}
            </p>
            <button
              type="button"
              onClick={handleAnalyzeEntireDoc}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900 border border-indigo-200/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition cursor-pointer shadow-2xs"
            >
              <span>📄</span> {isEn ? 'Analyze Entire Document' : 'Analisis Seluruh Naskah'}
            </button>
          </div>
        ) : (
          filteredSentences.map(s => (
            <div 
              key={s.id} 
              onClick={() => handleSentenceClick(s)} 
              className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 shadow-2xs flex flex-col gap-2 hover:border-cyan-400 dark:hover:border-cyan-500 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`w-5 h-5 flex items-center justify-center rounded text-white text-[9px] font-bold ${getCategoryBgOnly(s.category)}`}>
                    {s.index}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${getCategoryColor(s.category)}`}>
                    {s.wordCount} {isEn ? 'words' : 'kata'} ({s.category})
                  </span>
                  <span className={`text-[9px] font-semibold ${s.varianceFromAvg > 0 ? 'text-indigo-500' : 'text-emerald-500'}`}>
                    {s.varianceFromAvg > 0 ? '+' : ''}{s.varianceFromAvg.toFixed(1)}w
                  </span>
                </div>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSentenceClick(s);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[9px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800 cursor-pointer"
                >
                  <IconWand className="w-3 h-3" /> {isEn ? 'Jump' : 'Lompat'}
                </button>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-serif line-clamp-3">
                "{s.text}"
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
