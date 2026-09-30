import React, { useState, useMemo, useEffect } from 'react';
import {
  IconChartBar, IconInfoCircle, IconSettings, IconShieldCheck, IconAlertTriangle, IconEye, IconEyeOff
} from '@tabler/icons-react';
import { useDebounce } from 'use-debounce';
import { BurstinessChart } from './burstiness-chart';
import { ParaphraseStudio } from './paraphrase-studio';
import { extractTextFromContent } from '@/lib/editor/editor-utils';
import { calculateBurstiness, AI_BUZZWORDS } from '@/lib/editor/burstiness-engine';

export const SidebarBurstinessTab = (props: any) => {
  const {
    language, selectedText, t, currentDocument
  } = props;

  const isEn = language === 'en';
  const [analyzeAll, setAnalyzeAll] = useState(false);
  const [heatmapActive, setHeatmapActive] = useState(false);

  useEffect(() => {
    const toggleHeatmap = (active: boolean) => {
      const blocks = document.querySelectorAll('.ce-block [contenteditable="true"]');
      blocks.forEach(block => {
        // remove old highlights
        block.innerHTML = block.innerHTML.replace(/<span class="ai-heatmap-highlight[^>]*>(.*?)<\/span>/gi, '$1');
        
        if (active) {
          const regex = new RegExp(`\\b(${AI_BUZZWORDS.join('|')})\\b`, 'gi');
          // Replace text outside of HTML tags to prevent breaking formatting
          block.innerHTML = block.innerHTML.replace(/(>|^)([^<]+)(<|$)/g, (match, p1, p2, p3) => {
            return p1 + p2.replace(regex, '<span class="ai-heatmap-highlight bg-rose-200/80 dark:bg-rose-900/50 text-rose-900 dark:text-rose-200 rounded px-1 border-b-2 border-rose-400">$1</span>') + p3;
          });
        }
      });
    };

    toggleHeatmap(heatmapActive);

    // Cleanup on unmount
    return () => {
      toggleHeatmap(false);
    };
  }, [heatmapActive, currentDocument?.content]);

  const documentText = useMemo(() => {
    if (!currentDocument?.content) return '';
    return extractTextFromContent(currentDocument.content);
  }, [currentDocument?.content]);

  const activeContent = analyzeAll ? documentText : selectedText;
  const [debouncedContent] = useDebounce(activeContent, 500);
  const metrics = useMemo(() => calculateBurstiness(debouncedContent), [debouncedContent]);

  return (
    <>
      <div className="space-y-3 pb-20">
        <section className="rounded-lg border border-line dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconChartBar className="h-4 w-4 text-accent dark:text-indigo-400" />
              <h3 className="text-sm font-semibold text-text dark:text-slate-200">AI Burstiness Score</h3>
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                {isEn ? 'Entire Doc' : 'Semua Dokumen'}
              </span>
              <div className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${analyzeAll ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                <input type="checkbox" className="sr-only" checked={analyzeAll} onChange={() => setAnalyzeAll(!analyzeAll)} />
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${analyzeAll ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
              </div>
            </label>
          </div>
          <div className="mb-3 flex flex-col gap-1 rounded-md border border-line dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-2.5 text-[10px] leading-4 text-muted dark:text-slate-400">
            <div className="flex items-start gap-1.5">
              <IconInfoCircle className="h-3 w-3 shrink-0 mt-0.5" />
              <span>{isEn ? "Select text in the editor or toggle 'Entire Doc' to analyze burstiness (variation in sentence length and structure). A higher burstiness score indicates more human-like writing." : "Blok/pilih teks di editor atau nyalakan 'Semua Dokumen' untuk menganalisis skor burstiness. Skor yang tinggi menandakan tulisan yang lebih natural/mirip manusia."}</span>
            </div>
          </div>
          <BurstinessChart content={activeContent} />
        </section>

        {/* AI Lexical Analyzer (Buzzwords) */}
        {metrics.totalSentences > 0 && (
          <section className="rounded-lg border border-line dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {metrics.buzzwordCount > 0 ? (
                  <IconAlertTriangle className="h-4 w-4 text-amber-500" />
                ) : (
                  <IconShieldCheck className="h-4 w-4 text-emerald-500" />
                )}
                <h3 className="text-sm font-semibold text-text dark:text-slate-200">
                  {isEn ? 'Lexical Analyzer' : 'Analisis Leksikal'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {metrics.buzzwordCount > 0 && (
                  <button 
                    onClick={() => setHeatmapActive(!heatmapActive)}
                    className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border transition-colors ${heatmapActive ? 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/50 dark:text-rose-300 dark:border-rose-700' : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                    title={isEn ? "Highlight buzzwords in editor" : "Sorot kosakata klise di editor"}
                  >
                    {heatmapActive ? <IconEyeOff className="w-3 h-3" /> : <IconEye className="w-3 h-3" />}
                    {isEn ? 'Heatmap' : 'Sorot'}
                  </button>
                )}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border ${metrics.buzzwordCount > 0 ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800/50 dark:text-amber-400' : 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800/50 dark:text-emerald-400'}`}>
                  {metrics.buzzwordCount} {isEn ? 'Buzzwords' : 'Kata Klise'}
                </span>
              </div>
            </div>
            
            {metrics.buzzwordCount > 0 ? (
              <div className="flex flex-wrap gap-1 mt-2">
                {metrics.detectedBuzzwords.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 text-[10px] font-medium px-2 py-1 rounded text-slate-600 dark:text-slate-300">
                    <span className="text-rose-500 dark:text-rose-400 line-through">{item.word}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-[8px]">x{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                {isEn ? "Great! No overused AI buzzwords detected." : "Bagus! Tidak ada kosakata klise AI yang terdeteksi."}
              </p>
            )}
          </section>
        )}
        
        {/* Paraphrase Studio & Rekomendasi Panel */}
        <ParaphraseStudio 
          content={activeContent}
          currentDocument={props.currentDocument}
          editorJsRef={props.editorJsRef}
          onContentChange={props.onContentChange}
          activePlanId={props.activePlanId}
          setIsPlanModalOpen={props.setIsPlanModalOpen}
        />
      </div>
    </>
  );
};
