'use client';

import React, { useState } from 'react';
import { IconWand, IconCheck, IconRefresh, IconAlertTriangle, IconShieldCheck } from '@tabler/icons-react';
import { useLanguage } from '../i18n/language-context';
import { calculateBurstiness } from '@/lib/editor/burstiness-engine';
import { useDebounce } from 'use-debounce';
import { improveWriting } from '@/lib/api/ai';

export function ParaphraseStudio({ 
  content,
  currentDocument,
  editorJsRef,
  onContentChange,
  activePlanId,
  setIsPlanModalOpen
}: { 
  content: string;
  currentDocument?: any;
  editorJsRef?: any;
  onContentChange?: (content: any) => void;
  activePlanId?: string | null;
  setIsPlanModalOpen?: (open: boolean) => void;
}) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [selectedSentence, setSelectedSentence] = useState('');
  const [variations, setVariations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [applyingText, setApplyingText] = useState<string | null>(null);

  const isFreePlan = activePlanId === 'free';

  // Parse sentences to suggest targets
  const [debouncedContent] = useDebounce(content, 1000);
  const metrics = calculateBurstiness(debouncedContent);
  
  // Find "Priority" sentences (e.g. exactly average length in an AI-pattern text, or extremely long)
  const prioritySentences = metrics.sentenceData
    .filter(s => {
       const isTooLong = s.words > metrics.averageSentenceLength + metrics.standardDeviation * 1.5;
       const isTooAverage = Math.abs(s.words - metrics.averageSentenceLength) < 1 && metrics.status !== 'human';
       return isTooLong || isTooAverage;
    })
    .slice(0, 3); // top 3

  const handleGenerate = async (textToParaphrase: string = selectedSentence) => {
    if (isFreePlan) {
      setIsPlanModalOpen?.(true);
      return;
    }
    if (!textToParaphrase) return;
    setSelectedSentence(textToParaphrase);
    setLoading(true);
    setVariations([]);
    
    try {
      // Citation Lock Mechanism (Safe-Mode)
      // Matches APA/Harvard: (Smith, 2020; Doe, 2021) or (see Smith, 2020, p. 12)
      // Matches IEEE: [1], [1, 2], [1-3]
      const citationMatches = textToParaphrase.match(/\([^()]*\d{4}[a-z]?[^()]*\)|\[\s*\d+(?:\s*[,-]\s*\d+)*\s*\]/g) || [];
      let safeText = textToParaphrase;
      citationMatches.forEach((cite, idx) => {
        safeText = safeText.replace(cite, `[CITE_${idx}]`);
      });

      // Extract Author's Style Reference (Rest of the document)
      const styleRef = content.replace(textToParaphrase, '').trim().substring(0, 1500);

      // Call AI for 3 variations concurrently (including Mimic My Voice)
      const [res1, res2, res3] = await Promise.all([
        improveWriting(safeText, 'paraphrase', 'gemini', language),
        improveWriting(safeText, 'simplify', 'gemini', language),
        improveWriting(safeText, 'mimic', 'gemini', language, styleRef)
      ]);

      // Restore Citations
      const restoreCitations = (text: string) => {
        let restored = text;
        citationMatches.forEach((cite, idx) => {
          restored = restored.replace(`[CITE_${idx}]`, cite);
        });
        return restored;
      };

      setVariations([
        restoreCitations(res1.improved_text),
        restoreCitations(res2.improved_text),
        restoreCitations(res3.improved_text)
      ].filter(Boolean));
    } catch (err) {
      console.error('AI generation failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (newText: string) => {
    if (!selectedSentence || !currentDocument || !editorJsRef?.current || !onContentChange) return;
    setApplyingText(newText);
    
    try {
      let rawContent = typeof currentDocument.content === 'string' 
        ? JSON.parse(currentDocument.content) 
        : currentDocument.content;
        
      let changed = false;
      if (rawContent && Array.isArray(rawContent.blocks)) {
        rawContent.blocks = rawContent.blocks.map((block: any) => {
          if (block.data && typeof block.data.text === 'string') {
            const blockText = block.data.text;
            if (blockText.includes(selectedSentence)) {
              block.data.text = blockText.replace(selectedSentence, newText);
              changed = true;
            } else {
              // Smart-replace: flexible matching ignoring HTML tags
              const escapedWords = selectedSentence
                .trim()
                .split(/\s+/)
                .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
              
              if (escapedWords.length > 0) {
                const regexPattern = escapedWords.join('(?:\\s*<[^>]+>\\s*|\\s+)');
                const regex = new RegExp(regexPattern, 'i');
                if (regex.test(blockText)) {
                  block.data.text = blockText.replace(regex, newText);
                  changed = true;
                }
              }
            }
          }
          return block;
        });
      }

      if (changed) {
        const updatedContentStr = JSON.stringify(rawContent);
        onContentChange(rawContent);
        setTimeout(() => {
          editorJsRef.current?.renderContent?.(rawContent);
          setApplyingText(null);
          setSelectedSentence('');
          setVariations([]);
        }, 100);
      } else {
        setApplyingText(null);
      }
    } catch (e) {
      console.error('Failed to apply paraphrase:', e);
      setApplyingText(null);
    }
  };

  if (!content || metrics.totalSentences === 0) return null;

  return (
    <div className="flex flex-col gap-3 mt-3 animate-fade-in">
      {/* Rekomendasi Panel */}
      {prioritySentences.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800/30 p-3 flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <IconAlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500" />
            <h4 className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
              {isEn ? 'Priority Sentences' : 'Prioritas Parafrase'}
            </h4>
          </div>
          <p className="text-[10px] text-amber-700/80 dark:text-amber-500/80 leading-tight mb-1">
            {isEn ? 'These sentences disrupt your rhythm. Rewriting them will improve your burstiness score:' : 'Kalimat ini merusak ritme. Menulis ulang kalimat ini akan meningkatkan skor burstiness:'}
          </p>
          <div className="flex flex-col gap-1.5">
            {prioritySentences.map((s, i) => (
              <div key={i} className="flex flex-col gap-1 p-2 bg-white/60 dark:bg-slate-900/50 rounded border border-amber-100 dark:border-amber-900/50 cursor-pointer hover:bg-white transition-colors" onClick={() => handleGenerate(s.text)}>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-500">{s.words} {isEn ? 'words' : 'kata'}</span>
                <span className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paraphrase Studio */}
      <div className={`rounded-xl border border-line bg-white dark:bg-slate-800 p-3 flex flex-col gap-3 shadow-sm ${isFreePlan ? 'opacity-80 relative' : ''}`}>
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
             <IconWand className="h-4 w-4 text-indigo-500" />
             <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
               {isEn ? 'Paraphrase Studio' : 'Studio Parafrase'}
             </h3>
           </div>
           <div className="flex items-center gap-2">
             <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider" title={isEn ? "Citations are locked and protected" : "Sitasi dikunci dan dilindungi"}>
               <IconShieldCheck className="w-3 h-3" /> SAFE-MODE
             </span>
             {isFreePlan && (
               <span className="text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 uppercase tracking-wider">
                 PRO
               </span>
             )}
           </div>
         </div>
         
         <textarea 
           value={selectedSentence}
           onChange={(e) => setSelectedSentence(e.target.value)}
           placeholder={isEn ? "Select a priority sentence or paste text here..." : "Pilih kalimat prioritas atau tempel teks di sini..."}
           className="w-full text-xs p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 resize-none h-16 focus:outline-none focus:border-indigo-400"
           disabled={isFreePlan}
         />

         {isFreePlan ? (
           <button 
             onClick={() => setIsPlanModalOpen?.(true)}
             className="w-full py-1.5 rounded-md bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold hover:bg-amber-100 transition-colors flex items-center justify-center gap-1 border border-amber-200 dark:border-amber-800/50"
           >
             ⭐ {isEn ? 'Upgrade to Pro to Generate' : 'Tingkatkan ke Pro untuk Menggunakan'}
           </button>
         ) : (
           <button 
             onClick={() => handleGenerate(selectedSentence)}
             disabled={loading || !selectedSentence.trim()}
             className="w-full py-1.5 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
           >
             {loading ? <IconRefresh className="w-3 h-3 animate-spin" /> : <IconWand className="w-3 h-3" />}
             {isEn ? 'Generate Variations' : 'Buat Variasi'}
           </button>
         )}

         {variations.length > 0 && (
           <div className="flex flex-col gap-2 mt-2 border-t border-slate-100 dark:border-slate-700 pt-3">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
               {isEn ? 'AI Suggestions' : 'Saran AI'}
             </span>
             {variations.map((v, i) => (
               <div key={i} className="flex flex-col gap-1.5 p-2 rounded-md border border-indigo-100 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-900/10">
                 <span className="text-xs text-slate-700 dark:text-slate-300">{v}</span>
                 <button 
                   onClick={() => handleApply(v)}
                   disabled={applyingText === v}
                   className="self-end px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-[9px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1 disabled:opacity-50"
                 >
                   {applyingText === v ? <IconRefresh className="w-3 h-3 animate-spin text-emerald-500" /> : <IconCheck className="w-3 h-3 text-emerald-500" />} 
                   {isEn ? 'Apply' : 'Terapkan'}
                 </button>
               </div>
             ))}
           </div>
         )}
      </div>
    </div>
  );
}
