'use client';

import React, { useState, useEffect } from 'react';
import {
  IconSparkles,
  IconCheck,
  IconLoader2,
  IconFileText,
  IconBrain,
  IconBookmark,
} from '@tabler/icons-react';

interface AutoCiteProgressModalProps {
  isOpen: boolean;
  candidateCount: number;
  fileName?: string;
  language: string;
}

export const AutoCiteProgressModal: React.FC<AutoCiteProgressModalProps> = ({
  isOpen,
  candidateCount,
  fileName,
  language,
}) => {
  const isEn = language === 'en';
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(15);
  const [activeTipIndex, setActiveTipIndex] = useState<number>(0);
  const [processedCount, setProcessedCount] = useState<number>(0);

  const tips = isEn
    ? [
        'Evaluating contextual semantic overlap with manuscript claims...',
        'Matching methodology and empirical findings against imported references...',
        'Synthesizing citation confidence scores and citation keys...',
        'Ensuring attributions adhere to academic integrity standards...',
      ]
    : [
        'Mengevaluasi korelasi semantik kontekstual dengan klaim naskah...',
        'Mencocokkan metodologi dan temuan empiris dengan referensi terimpor...',
        'Menyusun skor keyakinan sitasi dan label kutipan...',
        'Memastikan atribusi sitasi memenuhi kaidah integritas akademik...',
      ];

  const steps = [
    {
      title: isEn ? 'Extracting Claims & Context' : 'Ekstraksi Kalimat & Klaim Naskah',
      desc: isEn
        ? `Scanning manuscript paragraphs • ${candidateCount} references loaded`
        : `Memindai klaim dan argumen naskah • ${candidateCount} referensi dimuat`,
      icon: IconFileText,
    },
    {
      title: isEn ? `Semantic Matching (${candidateCount} Papers)` : `Pencocokan Semantik (${candidateCount} Makalah)`,
      desc: isEn
        ? `Cross-referencing papers: ${processedCount} of ${candidateCount} analyzed`
        : `Menganalisis korelasi semantik: ${processedCount} dari ${candidateCount} paper diperiksa`,
      icon: IconBrain,
    },
    {
      title: isEn ? 'Attribution & Relevance Synthesis' : 'Sintesis Atribusi & Skor Relevansi',
      desc: isEn
        ? `Processed ${processedCount} of ${candidateCount} references • Finalizing % match scores`
        : `Selesai memproses ${processedCount} dari ${candidateCount} referensi • Menyusun skor kecocokan (%)`,
      icon: IconBookmark,
    },
  ];

  // Stage timer transitions and live counter progression
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setProgressPercent(15);
      setActiveTipIndex(0);
      setProcessedCount(0);
      return;
    }

    // Step 0 -> Step 1 after 1.4s
    const t1 = setTimeout(() => {
      setCurrentStep(1);
      setProgressPercent(55);
    }, 1400);

    // Step 1 -> Step 2 after 3.8s
    const t2 = setTimeout(() => {
      setCurrentStep(2);
      setProgressPercent(88);
    }, 3800);

    // Incremental item counter simulation towards candidateCount
    const total = Math.max(1, candidateCount);
    const stepDurationMs = 5000 / total;
    const intervalMs = Math.max(40, Math.min(120, stepDurationMs));

    const counterInterval = setInterval(() => {
      setProcessedCount((prev) => {
        if (prev >= total) return total;
        const jump = Math.max(1, Math.ceil(total / 40));
        return Math.min(total, prev + jump);
      });
    }, intervalMs);

    // Tip rotation interval
    const tipInterval = setInterval(() => {
      setActiveTipIndex((prev) => (prev + 1) % tips.length);
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(counterInterval);
      clearInterval(tipInterval);
    };
  }, [isOpen, candidateCount, tips.length]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auto-cite-progress-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden text-slate-800 dark:text-slate-100">
        {/* Subtle Decorative Ambient Background Glow */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header with Glowing Animated Icon */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 shrink-0">
            <IconSparkles className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500" />
            </span>
          </div>
          <div className="min-w-0">
            <h3 id="auto-cite-progress-title" className="text-base font-bold text-slate-900 dark:text-white truncate">
              {isEn ? 'AI Semantic Auto-Cite' : 'Auto-Sitasi Semantik AI'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {fileName
                ? (isEn ? `Analyzing ${fileName}` : `Menganalisis ${fileName}`)
                : (isEn ? 'Attributing sources to manuscript claims' : 'Menyelaraskan sumber dengan klaim naskah')}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <IconLoader2 className="w-3.5 h-3.5 animate-spin" />
              {isEn ? 'Processing Manuscript...' : 'Sedang Memproses Naskah...'}
            </span>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {processedCount}/{candidateCount} {isEn ? 'Refs' : 'Paper'}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                {progressPercent}%
              </span>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-full transition-all duration-700 ease-out shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Multi-Step Pipeline Tracker */}
        <div className="space-y-3 mb-5">
          {steps.map((s, idx) => {
            const isCompleted = currentStep > idx;
            const isCurrent = currentStep === idx;
            const StepIcon = s.icon;

            return (
              <div
                key={idx}
                className={`flex items-start gap-3 p-2.5 rounded-xl transition-all duration-300 ${
                  isCurrent
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60'
                    : isCompleted
                    ? 'bg-slate-50/50 dark:bg-slate-800/30'
                    : 'opacity-50'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                      <IconCheck className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-6 h-6 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-sm">
                      <IconLoader2 className="w-3.5 h-3.5 animate-spin" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 flex items-center justify-center text-xs font-semibold">
                      <StepIcon className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-xs font-semibold ${
                        isCurrent
                          ? 'text-indigo-900 dark:text-indigo-200'
                          : isCompleted
                          ? 'text-slate-700 dark:text-slate-300'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {s.title}
                    </h4>
                    {isCurrent && (
                      <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
                        {isEn ? 'Active' : 'Berjalan'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Academic Tip / Context Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-start gap-2">
            <span className="text-indigo-500 dark:text-indigo-400 text-xs mt-0.5">💡</span>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic transition-opacity duration-300">
              {tips[activeTipIndex]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
