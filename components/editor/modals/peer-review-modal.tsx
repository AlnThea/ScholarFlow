'use client';

import React, { useState, useEffect } from 'react';
import {
  IconX,
  IconMicroscope,
  IconSparkles,
  IconCheck,
  IconAlertTriangle,
  IconAlertOctagon,
  IconLoader2,
  IconRefresh,
  IconBulb,
  IconBook,
  IconFileText,
  IconChevronDown,
  IconChevronUp,
  IconArrowRight,
  IconCheckbox,
  IconSquare,
} from '@tabler/icons-react';
import {
  loadCachedPeerReviewAudit,
  saveCachedPeerReviewAudit,
  generateLocalFallbackAudit,
  type PeerReviewAuditReport,
  type PeerReviewVerdict,
} from '@/lib/editor/peer-reviewer';

export interface PeerReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId?: string;
  documentTitle?: string;
  documentContent?: string;
  wordCount?: number;
  citationCount?: number;
  language?: 'en' | 'id';
  userId?: string;
  userPlan?: string;
  onNavigateToSection?: (section: string) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  onTokensUpdated?: (tokensUsed: number, monthlyQuota?: number) => void;
}

export function PeerReviewModal({
  isOpen,
  onClose,
  documentId = 'doc-active',
  documentTitle = 'Academic Manuscript',
  documentContent = '',
  wordCount = 0,
  citationCount = 0,
  language = 'id',
  userId,
  userPlan = 'free',
  onNavigateToSection,
  onShowToast,
  onTokensUpdated,
}: PeerReviewModalProps) {
  const isEn = language === 'en';
  const [report, setReport] = useState<PeerReviewAuditReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [targetTier, setTargetTier] = useState<string>('scopus_q2');
  const [expandedRubric, setExpandedRubric] = useState<string | null>('methodology');
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});

  // Load cached audit on open (language-aware)
  useEffect(() => {
    if (!isOpen) return;

    const cached = loadCachedPeerReviewAudit(documentId, language);
    if (cached) {
      setReport(cached);
    } else {
      // Auto run simulation on first open or when switching language
      handleRunAudit();
    }
  }, [isOpen, documentId, language]);

  if (!isOpen) return null;

  const handleRunAudit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/ai/peer-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          documentTitle,
          documentContent,
          wordCount,
          citationCount,
          targetTier,
          language: isEn ? 'en' : 'id',
          userId,
          userPlan,
        }),
      });

      if (!res.ok) {
        throw new Error(isEn ? 'Failed to generate review audit' : 'Gagal menghasilkan audit reviewer');
      }

      const data: any = await res.json();
      setReport(data);
      saveCachedPeerReviewAudit(documentId, data, language);

      // Instantly trigger reactive token update without requiring page reload
      if (typeof data.tokens_used === 'number') {
        onTokensUpdated?.(data.tokens_used, data.monthly_quota);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('scholarflow:tokens-updated', {
              detail: {
                tokensUsed: data.tokens_used,
                monthlyQuota: data.monthly_quota,
              },
            })
          );
        }
      }

      onShowToast?.(
        isEn ? 'Peer review simulation completed!' : 'Simulasi Reviewer #2 selesai!',
        'success'
      );
    } catch (err: any) {
      console.warn('[PeerReviewModal] Fallback generated due to:', err.message);
      const fallback = generateLocalFallbackAudit({
        documentId,
        documentTitle,
        wordCount,
        citationCount,
        language: isEn ? 'en' : 'id',
      });
      setReport(fallback);
      saveCachedPeerReviewAudit(documentId, fallback, language);
      onShowToast?.(
        isEn ? 'Audit simulation completed (standard mode).' : 'Audit simulasi selesai (mode standar).',
        'info'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChecklistItem = (id: string) => {
    setChecklistState((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getVerdictBadge = (verdict: PeerReviewVerdict) => {
    switch (verdict) {
      case 'ACCEPT':
        return {
          label: isEn ? 'ACCEPT (Ready for Submission)' : 'ACCEPT (Siap Submisi)',
          bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        };
      case 'MINOR_REVISION':
        return {
          label: isEn ? 'MINOR REVISION' : 'REVISI MINOR (Perbaikan Ringan)',
          bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800',
        };
      case 'MAJOR_REVISION':
        return {
          label: isEn ? 'MAJOR REVISION' : 'REVISI MAYOR (Butuh Perbaikan Metodologi)',
          bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        };
      case 'REJECT':
      default:
        return {
          label: isEn ? 'REJECT (Insufficient Evidence)' : 'REJECT (Bukti Belum Memadai)',
          bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800',
        };
    }
  };

  const verdictInfo = report ? getVerdictBadge(report.overallVerdict) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all animate-fade-in">
      <div className="relative w-full max-w-4xl h-[90vh] max-h-[820px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                <IconMicroscope className="w-3.5 h-3.5" />
                {isEn ? 'AI Peer Reviewer (Reviewer #2)' : 'Simulasi Reviewer #2 Jurnal'}
              </span>

              {verdictInfo && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${verdictInfo.bg}`}>
                  {verdictInfo.label}
                </span>
              )}

              <select
                value={targetTier}
                onChange={(e) => setTargetTier(e.target.value)}
                className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5 font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
              >
                <option value="scopus_q1">Scopus Q1 (Nature / IEEE)</option>
                <option value="scopus_q2">Scopus Q2 / Elsevier</option>
                <option value="sinta_1_2">SINTA 1 & 2 (Nasional)</option>
                <option value="general">General Peer-Reviewed Journal</option>
              </select>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
              {documentTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {wordCount} {isEn ? 'words' : 'kata'} • {citationCount} {isEn ? 'citations indexed' : 'sitasi terindeks'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleRunAudit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <IconRefresh className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? (isEn ? 'Auditing...' : 'Mengaudit...') : (isEn ? 'Re-Audit' : 'Audit Ulang')}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/40">
          {isLoading && !report ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 text-slate-400">
              <IconLoader2 className="w-10 h-10 animate-spin text-indigo-500 mb-3" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isEn ? 'Reviewer #2 is reading your manuscript...' : 'Reviewer #2 sedang membedah naskah Anda...'}
              </h4>
              <p className="text-xs max-w-sm">
                {isEn
                  ? 'Analyzing methodological rigor, empirical validity, and argumentation coherence.'
                  : 'Memeriksa ketajaman metodologi, validitas empiris, dan koherensi argumen.'}
              </p>
            </div>
          ) : report ? (
            <>
              {/* Executive Readiness Card */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
                <div className="flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mb-1">
                    <IconSparkles className="w-3.5 h-3.5" />
                    {isEn ? "Reviewer #2 Executive Summary" : "Ringkasan Eksekutif Reviewer #2"}
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-serif italic">
                    "{report.executiveSummary}"
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 shrink-0 min-w-[130px]">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {report.readinessScore}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                    {isEn ? 'Journal Readiness' : 'Kesiapan Jurnal'}
                  </span>
                </div>
              </div>

              {/* 4 Rubric Accordion Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  {isEn ? 'Peer-Review Evaluation Rubric' : 'Rubrik Evaluasi Peer-Review'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* 1. Methodology */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                        🔬 {isEn ? 'Methodology & Rigor' : 'Metodologi & Ketelitian'}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {report.rubric.methodology.score}%
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full"
                        style={{ width: `${report.rubric.methodology.score}%` }}
                      />
                    </div>
                    <div className="text-[11px] space-y-1 mt-1 text-slate-600 dark:text-slate-300">
                      {report.rubric.methodology.strengths.map((s, i) => (
                        <div key={i} className="flex items-start gap-1 text-emerald-600 dark:text-emerald-400">
                          <IconCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </div>
                      ))}
                      {report.rubric.methodology.vulnerabilities.map((v, i) => (
                        <div key={i} className="flex items-start gap-1 text-amber-600 dark:text-amber-400">
                          <IconAlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Significance & Novelty */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                        💡 {isEn ? 'Significance & Novelty' : 'Kebaruan & Kontribusi'}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {report.rubric.significanceAndNovelty.score}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full"
                        style={{ width: `${report.rubric.significanceAndNovelty.score}%` }}
                      />
                    </div>
                    <div className="text-[11px] space-y-1 mt-1 text-slate-600 dark:text-slate-300">
                      {report.rubric.significanceAndNovelty.strengths.map((s, i) => (
                        <div key={i} className="flex items-start gap-1 text-emerald-600 dark:text-emerald-400">
                          <IconCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </div>
                      ))}
                      {report.rubric.significanceAndNovelty.vulnerabilities.map((v, i) => (
                        <div key={i} className="flex items-start gap-1 text-amber-600 dark:text-amber-400">
                          <IconAlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Argument Coherence */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                        📐 {isEn ? 'Argument Coherence' : 'Koherensi Argumen'}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {report.rubric.argumentCoherence.score}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full"
                        style={{ width: `${report.rubric.argumentCoherence.score}%` }}
                      />
                    </div>
                    <div className="text-[11px] space-y-1 mt-1 text-slate-600 dark:text-slate-300">
                      {report.rubric.argumentCoherence.strengths.map((s, i) => (
                        <div key={i} className="flex items-start gap-1 text-emerald-600 dark:text-emerald-400">
                          <IconCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </div>
                      ))}
                      {report.rubric.argumentCoherence.vulnerabilities.map((v, i) => (
                        <div key={i} className="flex items-start gap-1 text-amber-600 dark:text-amber-400">
                          <IconAlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Citation Adequacy */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                        📚 {isEn ? 'Citation Adequacy' : 'Kecukupan Sitasi'}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {report.rubric.citationAdequacy.score}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full"
                        style={{ width: `${report.rubric.citationAdequacy.score}%` }}
                      />
                    </div>
                    <div className="text-[11px] space-y-1 mt-1 text-slate-600 dark:text-slate-300">
                      {report.rubric.citationAdequacy.strengths.map((s, i) => (
                        <div key={i} className="flex items-start gap-1 text-emerald-600 dark:text-emerald-400">
                          <IconCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </div>
                      ))}
                      {report.rubric.citationAdequacy.vulnerabilities.map((v, i) => (
                        <div key={i} className="flex items-start gap-1 text-amber-600 dark:text-amber-400">
                          <IconAlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviewer #2 Critical Defense Questions */}
              {report.criticalInquiries.length > 0 && (
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300">
                      <IconAlertOctagon className="w-4 h-4" />
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {isEn ? 'Reviewer #2 Critical Defense Questions' : 'Pertanyaan Kritis Khas Reviewer #2'}
                    </h4>
                  </div>

                  <div className="space-y-3">
                    {report.criticalInquiries.map((inq) => (
                      <div
                        key={inq.id}
                        className="p-3.5 rounded-xl border border-rose-100 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                            📌 {inq.section}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                            {inq.importance === 'critical' ? (isEn ? 'Must Defend' : 'Wajib Dijawab') : (isEn ? 'Recommended' : 'Disarankan')}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          "{inq.question}"
                        </p>

                        <div className="pt-2 border-t border-rose-100 dark:border-rose-900/40 text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                          <IconBulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <span><strong>{isEn ? 'Remedy:' : 'Solusi Penulis:'}</strong> {inq.suggestedRemedy}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable Submission Readiness Checklist */}
              {report.actionableChecklist.length > 0 && (
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <IconFileText className="w-4 h-4 text-indigo-500" />
                      <span>{isEn ? 'Journal Submission Readiness Checklist' : 'Checklist Kesiapan Submisi Jurnal'}</span>
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400">
                      {Object.values(checklistState).filter(Boolean).length} / {report.actionableChecklist.length} {isEn ? 'Completed' : 'Selesai'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {report.actionableChecklist.map((item) => {
                      const isChecked = Boolean(checklistState[item.id]);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleChecklistItem(item.id)}
                          className={`p-3 rounded-xl border text-xs flex items-center justify-between transition cursor-pointer ${
                            isChecked
                              ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-400'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {isChecked ? (
                              <IconCheckbox className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <IconSquare className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <span className="font-medium">{item.task}</span>
                          </div>

                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {item.priority}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
