'use client';

import React, { useState } from 'react';
import {
  IconFileText,
  IconCheck,
  IconCopy,
  IconCirclePlus,
  IconRotate,
  IconTable,
  IconSparkles,
  IconAlertCircle,
  IconChecklist,
} from '@tabler/icons-react';
import { StatsInterpretationResult } from './stats-types';

interface StatsResultViewProps {
  result: StatsInterpretationResult | null;
  isLoading: boolean;
  error: string | null;
  language: 'id' | 'en';
  onInsertToDocument: (result: StatsInterpretationResult) => void;
  onReset: () => void;
}

export function StatsResultView({
  result,
  isLoading,
  error,
  language,
  onInsertToDocument,
  onReset,
}: StatsResultViewProps) {
  const isEn = language === 'en';
  const [copied, setCopied] = useState(false);
  const [inserted, setInserted] = useState(false);

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `${result.title}\n\n${result.narrativeAPA}\n\n${
      result.apaTableMarkdown ? `APA Table:\n${result.apaTableMarkdown}\n\n` : ''
    }${result.recommendation ? `Discussion / Recommendation:\n${result.recommendation}` : ''}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    if (!result) return;
    onInsertToDocument(result);
    setInserted(true);
    setTimeout(() => setInserted(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4 text-center">
        <div className="relative mx-auto w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-950 border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
          <IconSparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
            {isEn ? 'AI Data Analyst is interpreting output...' : 'AI Data Analyst sedang menganalisis output...'}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
            {isEn
              ? 'Reading degrees of freedom, calculating p-values, and drafting APA 7th Edition narrative...'
              : 'Membaca derajat kebebasan (df), mengekstrak p-value/sig, dan menyusun narasi standar APA Edisi ke-7...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/40 p-4 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xs">
          <IconAlertCircle className="h-4 w-4 shrink-0" />
          <span>{isEn ? 'Analysis Failed' : 'Gagal Menganalisis Output'}</span>
        </div>
        <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">{error}</p>
        <button
          type="button"
          onClick={onReset}
          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition"
        >
          <IconRotate className="h-3.5 w-3.5" />
          <span>{isEn ? 'Try Again' : 'Coba Lagi'}</span>
        </button>
      </div>
    );
  }

  if (!result) return null;

  return (
    <section className="rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3.5 animate-fade-in">
      {/* Title & Badge */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {result.testType}
            </span>
            {result.modelUsed && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {result.modelUsed}
              </span>
            )}
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate mt-0.5">
            {result.title}
          </h4>
        </div>
        <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
          {result.software}
        </span>
      </div>

      {/* High-Level Summary Card */}
      {result.summary && (
        <div className="rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 p-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong className="text-indigo-900 dark:text-indigo-200 font-semibold block text-[11px] mb-0.5">
            {isEn ? 'Key Finding Summary:' : 'Ringkasan Temuan Utama:'}
          </strong>
          {result.summary}
        </div>
      )}

      {/* Key Statistical Findings Badges */}
      {result.statisticalFindings && result.statisticalFindings.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {result.statisticalFindings.map((finding, idx) => (
            <div
              key={idx}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850"
            >
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                <span className="truncate">{finding.statisticName}</span>
                <span
                  className={`px-1 rounded text-[9px] ${
                    finding.isSignificant
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {finding.isSignificant
                    ? isEn ? 'Sig.' : 'Signifikan'
                    : isEn ? 'Not Sig.' : 'Tdk Sig.'}
                </span>
              </div>
              <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                {finding.value}{' '}
                {finding.degreesOfFreedom && (
                  <span className="text-[10px] text-slate-500 font-normal">
                    (df={finding.degreesOfFreedom})
                  </span>
                )}
              </p>
              {finding.pValue && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  <em>p</em> = {finding.pValue}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Narrative APA Interpretation */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <IconFileText className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{isEn ? 'APA 7th Edition Narrative' : 'Narasi Format APA Edisi ke-7'}</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition"
          >
            {copied ? <IconCheck className="h-3 w-3 text-emerald-600" /> : <IconCopy className="h-3 w-3" />}
            <span>{copied ? (isEn ? 'Copied!' : 'Tersalin!') : (isEn ? 'Copy' : 'Salin')}</span>
          </button>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 p-3 max-h-56 overflow-y-auto text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-line thin-scroll select-text">
          {result.narrativeAPA}
        </div>
      </div>

      {/* APA Table Markdown (if present) */}
      {result.apaTableMarkdown && (
        <details className="text-xs group">
          <summary className="cursor-pointer font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
            <IconTable className="h-3.5 w-3.5" />
            <span>{isEn ? 'View APA Table Matrix (Markdown)' : 'Lihat Matriks Tabel APA (Markdown)'}</span>
          </summary>
          <div className="mt-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 overflow-x-auto font-mono text-[10px] text-slate-700 dark:text-slate-300 whitespace-pre">
            {result.apaTableMarkdown}
          </div>
        </details>
      )}

      {/* Discussion & Recommendation */}
      {result.recommendation && (
        <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/60 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          <strong className="text-slate-700 dark:text-slate-300 font-semibold block mb-0.5">
            {isEn ? 'Discussion Insight:' : 'Catatan Pembahasan:'}
          </strong>
          {result.recommendation}
        </div>
      )}

      {/* Primary Action Buttons: Insert to Document */}
      <div className="pt-2 flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={handleInsert}
          disabled={inserted}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
            inserted
              ? 'bg-emerald-600 text-white cursor-default'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 active:scale-[0.99] cursor-pointer'
          }`}
        >
          {inserted ? <IconCheck className="h-4 w-4" /> : <IconCirclePlus className="h-4 w-4" />}
          <span>
            {inserted
              ? isEn ? 'Inserted into Document!' : 'Berhasil Disisipkan ke Naskah!'
              : isEn ? 'Insert to Document' : 'Sisipkan ke Dokumen'}
          </span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-center"
        >
          {isEn ? 'New Analysis' : 'Uji Baru'}
        </button>
      </div>
    </section>
  );
}
