import React, { useState, useMemo } from 'react';
import {
  IconChartBar, IconInfoCircle, IconSettings
} from '@tabler/icons-react';
import { BurstinessChart } from './burstiness-chart';
import { ParaphraseStudio } from './paraphrase-studio';
import { extractTextFromContent } from '@/lib/editor/editor-utils';

export const SidebarBurstinessTab = (props: any) => {
  const {
    language, selectedText, t, currentDocument
  } = props;

  const isEn = language === 'en';
  const [analyzeAll, setAnalyzeAll] = useState(false);

  const documentText = useMemo(() => {
    if (!currentDocument?.content) return '';
    return extractTextFromContent(currentDocument.content);
  }, [currentDocument?.content]);

  const activeContent = analyzeAll ? documentText : selectedText;

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
        
        {/* Paraphrase Studio & Rekomendasi Panel */}
        <ParaphraseStudio 
          content={activeContent}
          currentDocument={props.currentDocument}
          editorJsRef={props.editorJsRef}
          onContentChange={props.onContentChange}
        />
      </div>
    </>
  );
};
