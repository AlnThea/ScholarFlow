// components/editor/modals/academic-linter-modal.tsx
import React, { useState, useMemo } from 'react';
import {
  IconX, IconCheck, IconTextSpellcheck, IconAlertTriangle,
  IconSparkles, IconFilter, IconArrowRight
} from '@tabler/icons-react';
import {
  LintIssue,
  LintIssueType,
  lintAcademicText,
  calculateAcademicStyleScore
} from '@/lib/editor/academic-linter';

interface AcademicLinterModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentContent: any;
  language: string;
  onApplyFix?: (original: string, replacement: string) => void;
}

export function AcademicLinterModal({
  isOpen,
  onClose,
  documentContent,
  language,
  onApplyFix
}: AcademicLinterModalProps) {
  const isEn = language === 'en';
  const langKey = isEn ? 'en' : 'id';
  const [selectedFilter, setSelectedFilter] = useState<'all' | LintIssueType>('all');
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Extract plain text and word count from document content
  const { fullText, wordCount } = useMemo(() => {
    if (!documentContent) return { fullText: '', wordCount: 0 };
    let text = '';
    if (typeof documentContent === 'string') {
      try {
        if (documentContent.trim().startsWith('{')) {
          const parsed = JSON.parse(documentContent);
          if (Array.isArray(parsed.blocks)) {
            text = parsed.blocks.map((b: any) => b.data?.text || '').join('\n');
          }
        } else {
          text = documentContent;
        }
      } catch {
        text = documentContent;
      }
    } else if (Array.isArray(documentContent.blocks)) {
      text = documentContent.blocks.map((b: any) => b.data?.text || '').join('\n');
    }

    const clean = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = clean ? clean.split(/\s+/).filter(Boolean).length : 0;
    return { fullText: text, wordCount: words };
  }, [documentContent]);

  const allIssues = useMemo(() => {
    return lintAcademicText(fullText, langKey);
  }, [fullText, langKey]);

  const activeIssues = useMemo(() => {
    return allIssues.filter((i) => !dismissedIds.has(i.id));
  }, [allIssues, dismissedIds]);

  const filteredIssues = useMemo(() => {
    if (selectedFilter === 'all') return activeIssues;
    return activeIssues.filter((i) => i.type === selectedFilter);
  }, [activeIssues, selectedFilter]);

  const styleScore = useMemo(() => {
    return calculateAcademicStyleScore(activeIssues.length, wordCount);
  }, [activeIssues.length, wordCount]);

  if (!isOpen) return null;

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
  };

  const handleAcceptReplacement = (issue: LintIssue, replacement: string) => {
    onApplyFix?.(issue.matchedText, replacement);
    handleDismiss(issue.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <IconTextSpellcheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {isEn ? 'Academic Grammar & Style Linter' : 'Linter Gaya Bahasa & Formalitas Akademik'}
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  styleScore.score >= 90
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800'
                    : styleScore.score >= 75
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800'
                      : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800'
                }`}>
                  {isEn ? 'Grade' : 'Predikat'} {styleScore.grade} ({styleScore.score}/100)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn ? styleScore.labelEn : styleScore.labelId} • {activeIssues.length} {isEn ? 'style issue(s) detected' : 'masalah gaya ditemukan'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-50/80 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 text-xs overflow-x-auto">
          {[
            { id: 'all', label: isEn ? 'All' : 'Semua', count: activeIssues.length },
            { id: 'informal', label: isEn ? 'Informal Words' : 'Kata Non-Formal', count: activeIssues.filter((i) => i.type === 'informal').length },
            { id: 'contraction', label: isEn ? 'Contractions' : 'Singkatan', count: activeIssues.filter((i) => i.type === 'contraction').length },
            { id: 'vague', label: isEn ? 'Vague Claims' : 'Klaim Tanpa Data', count: activeIssues.filter((i) => i.type === 'vague').length },
            { id: 'first_person', label: isEn ? 'First Person' : 'Persona Pertama', count: activeIssues.filter((i) => i.type === 'first_person').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedFilter === tab.id ? 'bg-indigo-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Issue Cards */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredIssues.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
              <IconCheck className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {isEn ? 'Excellent Academic Tone!' : 'Gaya Bahasa Sangat Baik!'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {isEn
                  ? 'No informal words, contractions, or unsupported generalizations detected in this category.'
                  : 'Tidak ditemukan kata non-formal, singkatan percakapan, atau generalisasi tanpa rujukan dalam kategori ini.'}
              </p>
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col gap-2.5 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 font-mono text-xs font-bold line-through">
                      "{issue.matchedText}"
                    </span>
                    <IconArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {isEn ? 'Recommended Academic Replacement:' : 'Rekomendasi Baku:'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDismiss(issue.id)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-semibold cursor-pointer"
                  >
                    {isEn ? 'Dismiss' : 'Abaikan'}
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                  {isEn ? issue.reasonEn : issue.reasonId}
                </p>

                {/* Replacement Options */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {issue.suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAcceptReplacement(issue, sug)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <IconCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{sug}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs">
          <span className="text-slate-400 text-[11px]">
            {isEn ? 'ScholarFlow Academic Linter v0.34.0' : 'ScholarFlow Linter Akademik v0.34.0'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold transition cursor-pointer"
          >
            {isEn ? 'Done' : 'Selesai'}
          </button>
        </div>
      </div>
    </div>
  );
}
