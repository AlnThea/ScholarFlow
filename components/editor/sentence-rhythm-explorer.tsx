import React, { useMemo, useState } from 'react';
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
  onClose: () => void;
}) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [filter, setFilter] = useState<'all' | 'short' | 'standard' | 'long'>('all');

  const sentences = useMemo(() => extractSentences(content), [content]);

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
      case 'short': return 'bg-cyan-400';
      case 'standard': return 'bg-blue-500';
      case 'long': return 'bg-indigo-600';
      case 'complex': return 'bg-purple-600';
      default: return 'bg-slate-400';
    }
  };

  const shortCount = sentences.filter(s => s.category === 'short').length;
  const stdCount = sentences.filter(s => s.category === 'standard').length;
  const longCount = sentences.filter(s => s.category === 'long' || s.category === 'complex').length;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden w-[350px]">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex flex-col">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Sentence Rhythm Explorer</h2>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mt-0.5 tracking-wider">
            {isEn ? `Showing ${filteredSentences.length} of ${sentences.length}` : `Menampilkan ${filteredSentences.length} dari ${sentences.length}`}
          </span>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-500">
          <IconChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex flex-col gap-2">
          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Cadence Ribbon (Click to jump)</span>
          <div className="flex items-center gap-1 overflow-x-auto pb-1 thin-scroll">
            {sentences.map(s => (
              <button 
                key={s.id}
                title={`${s.wordCount} words`}
                className={`w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-sm text-[9px] font-bold text-white transition-opacity hover:opacity-80 ${getCategoryBgOnly(s.category)}`}
              >
                {s.index}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1 text-[10px] font-medium overflow-x-auto pb-1 thin-scroll">
          <button 
            onClick={() => setFilter('all')}
            className={`px-2 py-1 rounded-full border whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-slate-800 text-white border-slate-800 dark:bg-slate-200 dark:text-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}
          >
            All ({sentences.length})
          </button>
          <button 
            onClick={() => setFilter('short')}
            className={`px-2 py-1 rounded-full border whitespace-nowrap transition-colors ${filter === 'short' ? 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900/50' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}
          >
            Short ≤10w ({shortCount})
          </button>
          <button 
            onClick={() => setFilter('standard')}
            className={`px-2 py-1 rounded-full border whitespace-nowrap transition-colors ${filter === 'standard' ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}
          >
            Standard 11-24w ({stdCount})
          </button>
          <button 
            onClick={() => setFilter('long')}
            className={`px-2 py-1 rounded-full border whitespace-nowrap transition-colors ${filter === 'long' ? 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/50' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}
          >
            Long 25w+ ({longCount})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 dark:bg-slate-900/50 thin-scroll">
        {filteredSentences.length === 0 ? (
          <div className="text-center p-6 text-slate-400 text-xs italic">
            {isEn ? "No sentences found. Try selecting text in the editor." : "Tidak ada kalimat ditemukan. Blok/pilih teks di editor terlebih dahulu."}
          </div>
        ) : (
          filteredSentences.map(s => (
            <div key={s.id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg p-3 shadow-sm flex flex-col gap-2 hover:border-slate-200 dark:hover:border-slate-600 transition-colors group cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 dark:bg-slate-700 text-white text-[9px] font-bold">{s.index}</span>
                  <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${getCategoryColor(s.category)}`}>
                    {s.wordCount} words
                  </span>
                  <span className={`text-[9px] font-semibold ${s.varianceFromAvg > 0 ? 'text-indigo-500' : 'text-emerald-500'}`}>
                    {s.varianceFromAvg > 0 ? '+' : ''}{s.varianceFromAvg.toFixed(1)}w from avg
                  </span>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[9px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 px-2 py-1 rounded border border-indigo-100 dark:border-indigo-800">
                  <IconWand className="w-3 h-3" /> Paraphrase
                </button>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
                {s.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
