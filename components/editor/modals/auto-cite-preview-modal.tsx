'use client';

import React, { useState, useEffect } from 'react';
import {
  IconSparkles,
  IconCheck,
  IconX,
  IconQuote,
  IconBook,
  IconUser,
  IconCalendar,
  IconInfoCircle,
  IconArrowRight,
} from '@tabler/icons-react';
import type { AutoCiteMatch } from '@/lib/api/auto-cite';

interface AutoCitePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: AutoCiteMatch[];
  language: string;
  fileName?: string;
  onApplyMatches: (selectedMatches: AutoCiteMatch[]) => void;
}

export const AutoCitePreviewModal: React.FC<AutoCitePreviewModalProps> = ({
  isOpen,
  onClose,
  matches,
  language,
  fileName,
  onApplyMatches,
}) => {
  const isEn = language === 'en';
  const [selectedMatchIds, setSelectedMatchIds] = useState<Set<string>>(new Set());

  // Default to selecting all matches so user can fast-track with 1-click
  useEffect(() => {
    if (matches && matches.length > 0) {
      setSelectedMatchIds(new Set(matches.map((m) => m.matchId)));
    } else {
      setSelectedMatchIds(new Set());
    }
  }, [matches]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedMatchIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedMatchIds.size === matches.length) {
      setSelectedMatchIds(new Set());
    } else {
      setSelectedMatchIds(new Set(matches.map((m) => m.matchId)));
    }
  };

  const handleApplySelected = () => {
    const selected = matches.filter((m) => selectedMatchIds.has(m.matchId));
    if (selected.length === 0) return;
    onApplyMatches(selected);
    onClose();
  };

  const handleApplyAll = () => {
    if (matches.length === 0) return;
    onApplyMatches(matches);
    onClose();
  };

  const allSelected = matches.length > 0 && selectedMatchIds.size === matches.length;
  const someSelected = selectedMatchIds.size > 0 && selectedMatchIds.size < matches.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-violet-50/70 via-indigo-50/70 to-slate-50/70 dark:from-violet-950/30 dark:via-indigo-950/30 dark:to-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <IconSparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isEn ? 'AI Auto-Citation Attribution' : 'Atribusi Auto-Sitasi AI'}</span>
                {fileName && (
                  <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 truncate max-w-xs">
                    {fileName}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn
                  ? `Identified ${matches.length} sentence-paper match(es) in your manuscript`
                  : `Ditemukan ${matches.length} kalimat di naskah yang cocok dengan referensi Anda`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={isEn ? 'Close (Esc)' : 'Tutup (Esc)'}
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Select All & Summary */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-100/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
          <label className="flex items-center gap-2.5 cursor-pointer font-medium select-none">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected;
              }}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-700 cursor-pointer"
            />
            <span>
              {allSelected
                ? isEn ? 'Deselect All' : 'Batalkan Semua'
                : isEn ? 'Select All' : 'Pilih Semua'}
            </span>
          </label>

          <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-semibold">
            {selectedMatchIds.size} / {matches.length} {isEn ? 'Selected' : 'Dipilih'}
          </span>
        </div>

        {/* Matches List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 thin-scroll">
          {matches.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500">
              <IconQuote className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">
                {isEn
                  ? 'No citation matches identified for this manuscript section.'
                  : 'Tidak ditemukan kalimat yang membutuhkan sitasi dari berkas ini.'}
              </p>
            </div>
          ) : (
            matches.map((match) => {
              const isSelected = selectedMatchIds.has(match.matchId);
              const confidencePercent = Math.round((match.confidence || 0.9) * 100);

              return (
                <div
                  key={match.matchId}
                  onClick={() => toggleSelect(match.matchId)}
                  className={`group relative p-4 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-700 cursor-pointer"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            {match.citationLabel}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              confidencePercent >= 85
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                            }`}
                          >
                            {confidencePercent}% {isEn ? 'Match' : 'Kesesuaian'}
                          </span>
                        </div>
                      </div>

                      {/* Manuscript Sentence Quote */}
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                        <span className="text-indigo-500 font-bold mr-1">“</span>
                        {match.sentenceText}
                        <span className="text-indigo-500 font-bold ml-1">”</span>
                        <span className="ml-2 inline-flex items-center font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100/70 dark:bg-indigo-900/40 px-1.5 py-0.2 rounded text-[11px]">
                          + {match.citationLabel}
                        </span>
                      </div>

                      {/* Matched Reference Details */}
                      <div className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2 pt-0.5">
                        <IconBook className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {match.referenceTitle || match.referenceId}
                          </p>
                          {match.referenceAuthors && match.referenceAuthors.length > 0 && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                              <IconUser className="w-3 h-3 opacity-70" />
                              <span>{match.referenceAuthors.join(', ')}</span>
                              {match.referenceYear && (
                                <>
                                  <span>•</span>
                                  <IconCalendar className="w-3 h-3 opacity-70" />
                                  <span>{match.referenceYear}</span>
                                </>
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* AI Rationale */}
                      {match.rationale && (
                        <p className="text-[11px] text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 px-2 py-1 rounded border border-indigo-100 dark:border-indigo-900/50 italic">
                          💡 {match.rationale}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions with Fast-Track Button */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 hidden sm:flex">
            <IconInfoCircle className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              {isEn
                ? 'Citations will be injected at matched positions & bibliography updated.'
                : 'Sitasi akan disisipkan di posisi kalimat & Daftar Pustaka otomatis diperbarui.'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {isEn ? 'Cancel' : 'Batal'}
            </button>

            {someSelected && (
              <button
                type="button"
                onClick={handleApplySelected}
                disabled={selectedMatchIds.size === 0}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-indigo-300 dark:border-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 transition cursor-pointer"
              >
                {isEn
                  ? `Apply Selected (${selectedMatchIds.size})`
                  : `Terapkan Terpilih (${selectedMatchIds.size})`}
              </button>
            )}

            <button
              type="button"
              onClick={handleApplyAll}
              disabled={matches.length === 0}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800 disabled:opacity-50 text-white shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              <IconCheck className="w-4 h-4" />
              <span>
                {isEn
                  ? `✓ Apply All (${matches.length})`
                  : `✓ Terapkan Semua (${matches.length})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
