'use client';

import React, { useState, useMemo } from 'react';
import {
  IconX,
  IconBookmark,
  IconCheck,
  IconAlertTriangle,
  IconAlertCircle,
  IconSparkles,
  IconFileCertificate,
  IconBook,
  IconAdjustments,
  IconExternalLink
} from '@tabler/icons-react';
import {
  STANDARD_JOURNAL_PRESETS,
  auditJournalReadiness,
  JournalPreset,
  JournalAuditResult
} from '@/lib/editor/journal-presets';

interface JournalPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  editorBlocks: any[];
  bibliographyEntries: any[];
  activeCitationStyle?: string;
  language?: 'en' | 'id';
  onSwitchCitationStyle?: (style: string) => void;
}

export const JournalPresetsModal: React.FC<JournalPresetsModalProps> = ({
  isOpen,
  onClose,
  editorBlocks = [],
  bibliographyEntries = [],
  activeCitationStyle = 'apa',
  language = 'id',
  onSwitchCitationStyle,
}) => {
  const isEn = language === 'en';

  const [selectedPresetId, setSelectedPresetId] = useState<string>('ieee-transactions');

  // Perform real-time audit
  const auditResult: JournalAuditResult = useMemo(() => {
    return auditJournalReadiness(
      editorBlocks,
      bibliographyEntries,
      selectedPresetId,
      activeCitationStyle
    );
  }, [editorBlocks, bibliographyEntries, selectedPresetId, activeCitationStyle]);

  if (!isOpen) return null;

  const activePreset = auditResult.preset;
  const isStyleMatched =
    activeCitationStyle.toLowerCase() === activePreset.requiredCitationStyle.toLowerCase();

  const getScoreBadge = (score: number) => {
    if (score >= 80) {
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
        labelEn: 'Submission Ready',
        labelId: 'Siap Submit Jurnal',
        icon: IconCheck,
      };
    }
    if (score >= 60) {
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300',
        labelEn: 'Needs Minor Adjustments',
        labelId: 'Perlu Penyesuaian Ringan',
        icon: IconAlertTriangle,
      };
    }
    return {
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300',
      labelEn: 'Substantial Revisions Needed',
      labelId: 'Perlu Revisi Substansial',
      icon: IconAlertCircle,
    };
  };

  const badge = getScoreBadge(auditResult.readinessScore);
  const StatusIcon = badge.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-5xl h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <IconFileCertificate className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {isEn ? 'Journal Formatting & Publishing Presets' : 'Preset Format Publikasi & Pedoman Penulis'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Phase 37
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn
                  ? 'Audit manuscript compliance against authoritative publisher guidelines (IEEE, Elsevier, Springer, SINTA).'
                  : 'Audit kepatuhan naskah terhadap pedoman penulisan jurnal bereputasi (IEEE, Elsevier, Springer, SINTA).'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Preset Selection Cards */}
          <div className="w-full md:w-80 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-4 overflow-y-auto space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 mb-2">
              {isEn ? 'Target Journal Preset' : 'Pilih Target Jurnal'}
            </div>

            {STANDARD_JOURNAL_PRESETS.map((p) => {
              const isSelected = p.id === selectedPresetId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPresetId(p.id)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{p.name}</span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                      {p.requiredCitationStyle}
                    </span>
                  </div>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">{p.publisher}</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {isEn ? p.descriptionEn : p.descriptionId}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Column: Audit Scorecard & Checklist */}
          <div className="flex-1 flex flex-col p-5 sm:p-6 overflow-y-auto bg-slate-100/60 dark:bg-slate-950">
            {/* Scorecard Hero Banner */}
            <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 shadow-xs ${badge.bg}`}>
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 shadow-xs">
                  <StatusIcon className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-extrabold">{auditResult.readinessScore}%</span>
                    <span className="text-xs font-bold uppercase tracking-wide">
                      {isEn ? badge.labelEn : badge.labelId}
                    </span>
                  </div>
                  <p className="text-xs opacity-90 mt-0.5">
                    {isEn
                      ? `Author guidelines compliance for ${activePreset.name}`
                      : `Tingkat kepatuhan panduan penulis untuk ${activePreset.name}`}
                  </p>
                </div>
              </div>

              {!isStyleMatched && onSwitchCitationStyle && (
                <button
                  type="button"
                  onClick={() => onSwitchCitationStyle(activePreset.requiredCitationStyle)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <IconSparkles className="w-4 h-4" />
                  <span>
                    {isEn
                      ? `Switch to ${activePreset.requiredCitationStyle.toUpperCase()} Style`
                      : `Terapkan Format ${activePreset.requiredCitationStyle.toUpperCase()}`}
                  </span>
                </button>
              )}
            </div>

            {/* Checklist Items Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isEn ? 'Publisher Guidelines Audit Breakdown' : 'Rincian Audit Pedoman Penerbit'}
              </h3>

              <div className="space-y-2.5">
                {auditResult.items.map((item) => {
                  const isPass = item.status === 'pass';
                  const isWarning = item.status === 'warning';

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-1.5 rounded-lg mt-0.5 shrink-0 ${
                            isPass
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : isWarning
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                          }`}
                        >
                          {isPass ? (
                            <IconCheck className="w-4 h-4" />
                          ) : isWarning ? (
                            <IconAlertTriangle className="w-4 h-4" />
                          ) : (
                            <IconAlertCircle className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {isEn ? item.titleEn : item.titleId}
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {isEn ? item.messageEn : item.messageId}
                          </p>
                        </div>
                      </div>

                      {/* Values Target Pill */}
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 block">
                          {item.currentValue}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {isEn ? 'Target: ' : 'Standar: '} {item.targetValue}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Required Sections Pill List */}
            {activePreset.requiredSections && activePreset.requiredSections.length > 0 && (
              <div className="mt-5 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  {isEn ? 'Recommended Manuscript Structure:' : 'Struktur Naskah yang Direkomendasikan:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activePreset.requiredSections.map((sec, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {sec}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {isEn
              ? `Auditing ${editorBlocks.length} content blocks and ${bibliographyEntries.length} bibliography references.`
              : `Mengaudit ${editorBlocks.length} blok naskah dan ${bibliographyEntries.length} referensi kepustakaan.`}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            {isEn ? 'Close' : 'Tutup'}
          </button>
        </div>
      </div>
    </div>
  );
};
