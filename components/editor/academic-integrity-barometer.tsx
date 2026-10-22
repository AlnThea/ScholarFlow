'use client';

import React, { useState } from 'react';
import {
  IconShieldCheck,
  IconAlertTriangle,
  IconAlertOctagon,
  IconFlame,
  IconWand,
  IconChevronRight,
  IconInfoCircle,
  IconCheck,
  IconEye,
  IconEyeOff,
  IconRefresh,
} from '@tabler/icons-react';
import {
  calculateAcademicIntegrity,
  type AcademicIntegrityReport,
  type SentenceIntegrity,
} from '@/lib/editor/academic-integrity';
import { useLanguage } from '../i18n/language-context';

export interface AcademicIntegrityBarometerProps {
  content: string;
  language?: 'en' | 'id';
  onSelectSentenceForParaphrase?: (sentence: string) => void;
  isHeatmapActive?: boolean;
  onToggleHeatmap?: () => void;
  className?: string;
}

/**
 * Accurately selects a specific sentence across text nodes inside a contenteditable block.
 */
function selectTextInElement(element: HTMLElement, targetText: string): boolean {
  const normalizedTarget = targetText.replace(/&nbsp;/gi, ' ').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
  if (!normalizedTarget || typeof window === 'undefined') return false;

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let fullText = '';
  const textNodes: Text[] = [];
  const nodeStartOffsets: number[] = [];

  let currentNode = walker.nextNode() as Text | null;
  while (currentNode) {
    nodeStartOffsets.push(fullText.length);
    textNodes.push(currentNode);
    fullText += (currentNode.textContent || '').replace(/\u00A0/g, ' ');
    currentNode = walker.nextNode() as Text | null;
  }

  // Find index of target in full text
  let startIndex = fullText.indexOf(normalizedTarget);
  let matchLength = normalizedTarget.length;

  if (startIndex === -1 && normalizedTarget.length > 25) {
    const sub = normalizedTarget.slice(0, 25);
    startIndex = fullText.indexOf(sub);
    if (startIndex !== -1) {
      matchLength = Math.min(normalizedTarget.length, fullText.length - startIndex);
    }
  }

  if (startIndex === -1) return false;

  const endIndex = startIndex + matchLength;

  let startNode: Text | null = null;
  let startOffset = 0;
  let endNode: Text | null = null;
  let endOffset = 0;

  for (let i = 0; i < textNodes.length; i++) {
    const nodeStart = nodeStartOffsets[i];
    const nodeEnd = nodeStart + (textNodes[i].textContent || '').length;

    if (!startNode && startIndex >= nodeStart && startIndex < nodeEnd) {
      startNode = textNodes[i];
      startOffset = startIndex - nodeStart;
    }
    if (!endNode && endIndex > nodeStart && endIndex <= nodeEnd) {
      endNode = textNodes[i];
      endOffset = endIndex - nodeStart;
    }
  }

  if (startNode && endNode) {
    const selection = window.getSelection();
    if (selection) {
      const range = document.createRange();
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);
      selection.removeAllRanges();
      selection.addRange(range);

      const parentEl = startNode.parentElement || element;
      parentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return true;
    }
  }

  return false;
}

export function AcademicIntegrityBarometer({
  content,
  language,
  onSelectSentenceForParaphrase,
  isHeatmapActive = false,
  onToggleHeatmap,
  className = '',
}: AcademicIntegrityBarometerProps) {
  const { language: ctxLanguage } = useLanguage();
  const activeLang = language || ctxLanguage || 'id';
  const isEn = activeLang === 'en';
  const report: AcademicIntegrityReport = React.useMemo(() => {
    return calculateAcademicIntegrity(content);
  }, [content]);

  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number | null>(null);
  const [loadedSentenceIndex, setLoadedSentenceIndex] = useState<number | null>(null);

  const hasText = report.metrics.totalWords > 0;
  // Speedometer Needle Angle calculation (-90 deg = 0%, 0 deg = 50%, +90 deg = 100%)
  const needleAngle = !hasText ? -90 : (-90 + (report.overallScore / 100) * 180);

  // Status colors & icons
  const isGreen = hasText && report.riskLevel === 'low';
  const isYellow = hasText && report.riskLevel === 'medium';
  const isRed = hasText && report.riskLevel === 'high';
  const isWaiting = !hasText;

  const statusBg = isWaiting
    ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
    : isGreen
    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
    : isYellow
    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200';

  const handleSentenceClick = (sentence: SentenceIntegrity) => {
    setSelectedSentenceIndex(sentence.index);
    setLoadedSentenceIndex(sentence.index);
    setTimeout(() => {
      setLoadedSentenceIndex((prev) => (prev === sentence.index ? null : prev));
    }, 2500);

    // Accurately select and highlight ONLY the specific sentence in the editor DOM
    try {
      const blocks = document.querySelectorAll('.ce-block [contenteditable="true"]');
      let found = false;
      const target = sentence.text.trim();
      const normalizedTarget = target.replace(/&nbsp;/gi, ' ').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ');

      for (const block of Array.from(blocks)) {
        const el = block as HTMLElement;
        const textContent = (el.textContent || '').replace(/&nbsp;/gi, ' ').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ');
        
        if (
          textContent.includes(normalizedTarget) ||
          (normalizedTarget.length > 25 && textContent.includes(normalizedTarget.slice(0, 25))) ||
          (normalizedTarget.length > 15 && textContent.includes(normalizedTarget.slice(0, 15)))
        ) {
          found = selectTextInElement(el, target);
          if (found) break;
        }
      }

      // Fallback: if range selection failed, smooth scroll to the containing paragraph block
      if (!found) {
        for (const block of Array.from(blocks)) {
          const textContent = (block.textContent || '').replace(/&nbsp;/gi, ' ').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ');
          if (
            (normalizedTarget.length > 25 && textContent.includes(normalizedTarget.slice(0, 25))) ||
            (normalizedTarget.length > 15 && textContent.includes(normalizedTarget.slice(0, 15)))
          ) {
            block.scrollIntoView({ behavior: 'smooth', block: 'center' });
            break;
          }
        }
      }
    } catch (err) {
      console.warn('[IntegrityBarometer] Failed to select sentence in DOM:', err);
    }

    const cleanText = sentence.text.replace(/&nbsp;/gi, ' ').replace(/\u00A0/g, ' ').trim();
    if (onSelectSentenceForParaphrase) {
      onSelectSentenceForParaphrase(cleanText);
    }

    // Trigger instant custom event & smooth scroll sidebar to Paraphrase Studio
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('scholarflow:load-paraphrase-studio', {
          detail: { sentence: cleanText },
        })
      );
      setTimeout(() => {
        const studioCard = document.getElementById('paraphrase-studio-card');
        if (studioCard) {
          studioCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 60);
    }
  };

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4 text-slate-800 dark:text-slate-100 transition flex flex-col gap-4 ${className}`}
    >
      {/* Header Barometer Row */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg ${
              isGreen
                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300'
                : isYellow
                ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300'
                : 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300'
            }`}
          >
            {isGreen ? (
              <IconShieldCheck className="w-5 h-5" />
            ) : isYellow ? (
              <IconAlertTriangle className="w-5 h-5" />
            ) : (
              <IconAlertOctagon className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {isEn ? 'Academic Integrity Barometer' : 'Barometer Integritas Akademik'}
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              {isEn ? 'Real-time AI-likeness & originality index' : 'Indeks orisinalitas & deteksi pola AI'}
            </p>
          </div>
        </div>

        {onToggleHeatmap && (
          <button
            type="button"
            onClick={onToggleHeatmap}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
              isHeatmapActive
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
            title={isEn ? 'Toggle Canvas Heatmap Highlighting' : 'Sorot Kalimat Berisiko di Kanvas'}
          >
            {isHeatmapActive ? <IconEyeOff className="w-3.5 h-3.5" /> : <IconEye className="w-3.5 h-3.5" />}
            <span>{isEn ? 'Canvas Heatmap' : 'Heatmap Kanvas'}</span>
          </button>
        )}
      </div>

      {/* Speedometer Gauge Visualizer */}
      <div className="flex flex-col items-center justify-center pt-2 pb-2">
        <div className="relative w-52 h-28 flex items-end justify-center">
          {/* SVG Semicircle Arc Gauge */}
          <svg className="w-52 h-28" viewBox="0 0 200 110">
            {/* Background Arc */}
            <path
              d="M 25 100 A 75 75 0 0 1 175 100"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="12"
              strokeLinecap="round"
              className="dark:stroke-slate-800"
            />
            {/* Red Zone (0 - 45%: High AI Risk / Low Originality) */}
            <path
              d="M 25 100 A 75 75 0 0 1 88.27 25.92"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Yellow / Amber Zone (45 - 75%: Moderate / Needs Review) */}
            <path
              d="M 88.27 25.92 A 75 75 0 0 1 153.03 46.97"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="12"
            />
            {/* Green Zone (75 - 100%: Strong Human / High Originality) */}
            <path
              d="M 153.03 46.97 A 75 75 0 0 1 175 100"
              fill="none"
              stroke="#10b981"
              strokeWidth="12"
              strokeLinecap="round"
            />
          </svg>

          {/* Needle Indicator */}
          <div
            className="absolute bottom-[10px] w-1.5 h-[68px] bg-slate-800 dark:bg-white rounded-full origin-bottom transition-transform duration-700 ease-out shadow-md"
            style={{ transform: `rotate(${needleAngle}deg)` }}
          />

          {/* Center Pivot Circle */}
          <div className="absolute bottom-[2px] w-4 h-4 rounded-full bg-slate-900 dark:bg-white border-2 border-white dark:border-slate-900 shadow-md" />
        </div>

        {/* Big Score Display & Status Badge */}
        <div className="flex flex-col items-center mt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {hasText ? `${report.overallScore}%` : '—'}
            </span>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
              {isEn ? 'Originality' : 'Orisinalitas'}
            </span>
          </div>

          <div className={`mt-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${statusBg}`}>
            {hasText
              ? (isEn ? report.riskLabel.en : report.riskLabel.id)
              : (isEn ? 'Awaiting Text in Editor' : 'Menunggu Naskah di Editor')}
          </div>
        </div>
      </div>

      {/* 4 Composite Metric Sub-Gauges */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Burstiness (Sentence Length Variance) */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {isEn ? 'Sentence Burstiness' : 'Variasi Kalimat'}
          </span>
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {report.metrics.burstinessScore} CV
            </span>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                report.metrics.burstinessContribution >= 75
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
              }`}
            >
              {report.metrics.burstinessContribution}%
            </span>
          </div>
        </div>

        {/* Lexical Diversity */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {isEn ? 'Lexical Diversity' : 'Variasi Kata (TTR)'}
          </span>
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {report.metrics.lexicalDiversityScore}%
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {report.metrics.uniqueWordRatio * 100}% unik
            </span>
          </div>
        </div>

        {/* AI Cliché Density */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {isEn ? 'AI Cliché Density' : 'Kata Klise AI'}
          </span>
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {report.metrics.clichéCount} kata
            </span>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                report.metrics.clichéDensity <= 1.0
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              }`}
            >
              {report.metrics.clichéDensity}%
            </span>
          </div>
        </div>

        {/* Cadence Balance */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {isEn ? 'Average Length' : 'Rata-rata Kalimat'}
          </span>
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {report.metrics.averageSentenceLength} kata
            </span>
            <span className="text-[10px] text-slate-400">
              ±{report.metrics.standardDeviation} SD
            </span>
          </div>
        </div>
      </div>

      {/* Priority Sentences for Humanization */}
      {report.highRiskSentences.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <IconFlame className="w-3.5 h-3.5 text-rose-500" />
              <span>{isEn ? 'Flagged Sentences (AI-Likeness)' : 'Kalimat Berisiko Perlu Penyesuaian'}</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {report.highRiskSentences.length}
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 thin-scroll">
            {report.highRiskSentences.map((s) => (
              <div
                key={s.index}
                onClick={() => handleSentenceClick(s)}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1.5 ${
                  selectedSentenceIndex === s.index
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                    : s.riskLevel === 'high'
                    ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 hover:border-rose-400'
                    : 'border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-400'
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-slate-500 dark:text-slate-400">
                    #{s.index} • {s.words} {isEn ? 'words' : 'kata'}
                  </span>
                  <span
                    className={`font-bold px-1.5 py-0.5 rounded text-[9px] ${
                      s.riskLevel === 'high'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                    }`}
                  >
                    {s.riskLevel === 'high'
                      ? isEn
                        ? 'High AI-Risk'
                        : 'Risiko Tinggi'
                      : isEn
                      ? 'Moderate'
                      : 'Perlu Variasi'}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 italic font-serif">
                  "{s.text}"
                </p>

                {s.reasons.length > 0 && (
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 leading-tight">
                    ⚠️ {s.reasons[0]}
                  </span>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                  {loadedSentenceIndex === s.index ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 animate-in fade-in">
                      <IconCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{isEn ? 'Loaded! Opening Studio...' : 'Dimuat! Membuka Studio...'}</span>
                    </span>
                  ) : (
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 group-hover:text-indigo-700">
                      <IconWand className="w-3 h-3" />
                      <span>{isEn ? 'Load into Paraphrase Studio' : 'Buka di Paraphrase Studio'}</span>
                    </span>
                  )}
                  <IconChevronRight className={`w-3.5 h-3.5 transition-transform ${
                    loadedSentenceIndex === s.index ? 'text-emerald-500 translate-x-0.5' : 'text-slate-400'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Box */}
      {report.recommendations.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          <IconInfoCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <span>{isEn ? report.recommendations[0].en : report.recommendations[0].id}</span>
        </div>
      )}
    </div>
  );
}
