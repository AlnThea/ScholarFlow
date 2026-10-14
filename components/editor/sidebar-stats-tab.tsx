'use client';

import React, { useState, useEffect } from 'react';
import {
  IconCalculator,
  IconSparkles,
  IconShieldCheck,
  IconInfoCircle,
  IconLoader2,
  IconWand,
} from '@tabler/icons-react';
import { StatsDropzone } from './stats-interpreter/stats-dropzone';
import { StatsConfigPanel } from './stats-interpreter/stats-config-panel';
import { StatsResultView } from './stats-interpreter/stats-result-view';
import {
  StatsInputData,
  StatsAnalysisConfig,
  StatsInterpretationResult,
} from './stats-interpreter/stats-types';

interface SidebarStatsTabProps {
  language?: 'id' | 'en';
  activePlanId?: string | null;
  setIsPlanModalOpen?: (open: boolean) => void;
  editorJsRef?: any;
  onContentChange?: (content: any) => void;
  [key: string]: any;
}

export function SidebarStatsTab({
  language = 'id',
  activePlanId = 'free',
  setIsPlanModalOpen,
  editorJsRef,
  onContentChange,
  aiModels,
  selectedAiModel,
}: SidebarStatsTabProps) {
  const isEn = language === 'en';

  const [inputData, setInputData] = useState<StatsInputData | null>(null);
  const [config, setConfig] = useState<StatsAnalysisConfig>({
    software: 'spss',
    testType: 'auto',
    language: language === 'en' ? 'en' : 'id',
    style: 'thesis',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StatsInterpretationResult | null>(null);

  // Restore latest result from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sf_latest_stats_result');
      if (saved) {
        setResult(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load cached stats result:', e);
    }
  }, []);

  // Update language in config when UI language switches
  useEffect(() => {
    setConfig((prev) => ({
      ...prev,
      language: language === 'en' ? 'en' : 'id',
    }));
  }, [language]);

  const handleInterpret = async () => {
    if (!inputData) return;

    // Freemium Pro Model Check: Prompt PricingModal if on Free Plan using Pro model without custom key
    const isFree = activePlanId === 'free' || !activePlanId;
    const modelId = (config.aiModel || '').toLowerCase();
    const isProModel = modelId.includes('claude') || modelId.includes('gpt-4o') || modelId.includes('pro');
    if (isFree && isProModel && !config.customApiKey) {
      setIsPlanModalOpen?.(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/ai/interpret-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: inputData,
          config,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || (isEn ? 'Failed to interpret statistical data.' : 'Gagal menginterpretasikan output statistik.'));
      }

      setResult(data.result);
      try {
        localStorage.setItem('sf_latest_stats_result', JSON.stringify(data.result));
      } catch (err) {
        console.warn('Could not cache stats result to localStorage:', err);
      }
    } catch (err: any) {
      console.error('Stats interpretation error:', err);
      setError(err.message || (isEn ? 'An unexpected error occurred.' : 'Terjadi kesalahan sistem.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertToDocument = async (res: StatsInterpretationResult) => {
    if (!editorJsRef?.current) return;

    // Build structured EditorJS blocks
    const newBlocks: Array<{ type: string; data: any }> = [];

    // 1. Heading Block
    newBlocks.push({
      type: 'header',
      data: {
        text: res.title,
        level: 3,
      },
    });

    // 2. Narrative Paragraphs
    const paragraphs = res.narrativeAPA.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    paragraphs.forEach((para) => {
      newBlocks.push({
        type: 'paragraph',
        data: {
          text: para.trim(),
        },
      });
    });

    // 3. Discussion/Recommendation if present
    if (res.recommendation) {
      newBlocks.push({
        type: 'paragraph',
        data: {
          text: `<em>${isEn ? 'Discussion Note' : 'Catatan Pembahasan'}: ${res.recommendation}</em>`,
        },
      });
    }

    if (typeof editorJsRef.current.insertBlocks === 'function') {
      await editorJsRef.current.insertBlocks(newBlocks);
    } else if (typeof editorJsRef.current.insertText === 'function') {
      const fullText = `${res.title}\n\n${res.narrativeAPA}\n\n${res.recommendation || ''}`;
      editorJsRef.current.insertText(fullText);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 p-3.5 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm">
            <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
              <IconCalculator className="h-4 w-4" />
            </div>
            <span>
              {isEn ? 'SPSS / PSPP Data Interpreter' : 'Interpretasi Data SPSS / PSPP'}
            </span>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-xs">
            Phase 11
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {isEn
            ? 'Multimodal AI Data Analyst for SPSS, SmartPLS & PSPP. Automatically interprets output tables into APA 7th Edition academic narratives.'
            : 'Asisten AI Multimodal untuk output SPSS, SmartPLS & PSPP. Mengubah tabel output statistik menjadi narasi ilmiah standar APA Edisi ke-7.'}
        </p>
      </div>

      {/* Result View or Input & Configuration */}
      {result || isLoading || error ? (
        <StatsResultView
          result={result}
          isLoading={isLoading}
          error={error}
          language={language}
          onInsertToDocument={handleInsertToDocument}
          onReset={handleReset}
        />
      ) : (
        <>
          {/* Step 1: Upload or Paste Dropzone */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-3.5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconSparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  {isEn ? '1. Upload or Paste Output' : '1. Unggah atau Tempel Output'}
                </h3>
              </div>
              {inputData && (
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                  {isEn ? 'Data Ready' : 'Data Siap'}
                </span>
              )}
            </div>

            <StatsDropzone
              inputData={inputData}
              onDataLoaded={setInputData}
              language={language}
              disabled={isLoading}
            />
          </section>

          {/* Step 2: Configuration Panel */}
          <StatsConfigPanel
            config={config}
            onChangeConfig={setConfig}
            language={language}
            disabled={isLoading}
            aiModels={aiModels}
            selectedAiModel={selectedAiModel}
            activePlanId={activePlanId}
            onOpenPricingModal={() => setIsPlanModalOpen?.(true)}
          />

          {/* Generate Button */}
          <button
            type="button"
            disabled={!inputData || isLoading}
            onClick={handleInterpret}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <IconLoader2 className="h-4 w-4 animate-spin" />
                <span>{isEn ? 'Analyzing Statistical Output...' : 'Menganalisis Output Statistik...'}</span>
              </>
            ) : (
              <>
                <IconWand className="h-4 w-4" />
                <span>{isEn ? 'Interpret Output (APA 7th Edition)' : 'Interpretasikan Output (Format APA 7th)'}</span>
              </>
            )}
          </button>
        </>
      )}

      {/* Privacy Safeguard Card */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 p-2.5 flex items-start gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
        <IconShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-700 dark:text-slate-300 font-semibold">
            {isEn ? 'Data Privacy Guaranteed: ' : 'Kerahasiaan Data Terjamin: '}
          </strong>
          {isEn
            ? 'Output data is processed ephemerally for interpretation and never used to train public models. Avoid uploading sensitive personally identifiable information (PII).'
            : 'Data statistik Anda hanya diproses sementara untuk interpretasi dan tidak digunakan untuk melatih model umum. Hindari mengunggah identitas pribadi (PII) responden.'}
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-lg border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 p-2.5 flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-400">
        <IconInfoCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          {isEn ? (
            <span>
              <strong>Tip:</strong> In SPSS or PSPP, copy the output table or take a screenshot (<kbd className="px-1 py-0.5 rounded bg-white dark:bg-slate-800 border text-[10px]">Win+Shift+S</kbd>), then simply press <kbd className="px-1 py-0.5 rounded bg-white dark:bg-slate-800 border text-[10px]">Ctrl+V</kbd> here.
            </span>
          ) : (
            <span>
              <strong>Tips:</strong> Di SPSS atau PSPP, salin tabel output atau ambil tangkapan layar (<kbd className="px-1 py-0.5 rounded bg-white dark:bg-slate-800 border text-[10px]">Win+Shift+S</kbd>), lalu cukup tekan <kbd className="px-1 py-0.5 rounded bg-white dark:bg-slate-800 border text-[10px]">Ctrl+V</kbd> di halaman ini.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
