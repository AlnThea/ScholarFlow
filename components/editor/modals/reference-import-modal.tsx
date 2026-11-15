'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  IconFileImport,
  IconCheck,
  IconX,
  IconBook,
  IconExternalLink,
  IconFileText,
  IconUser,
  IconCalendar,
  IconInfoCircle,
  IconSparkles,
  IconArrowsSort,
} from '@tabler/icons-react';
import type { CitationCandidate } from '@/lib/api/citations';
import { calculateManuscriptRelevanceScore } from '@/lib/editor/reference-importer';

interface ReferenceImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: CitationCandidate[];
  fileName?: string;
  language: string;
  manuscriptText?: string;
  activePlanId?: string;
  onUpgrade?: () => void;
  onImport: (selected: CitationCandidate[]) => void;
  onAutoCite?: (selected: CitationCandidate[]) => void;
}

export const ReferenceImportModal: React.FC<ReferenceImportModalProps> = ({
  isOpen,
  onClose,
  candidates,
  fileName,
  language,
  manuscriptText = '',
  activePlanId = 'free',
  onUpgrade,
  onImport,
  onAutoCite,
}) => {
  const isEn = language === 'en';
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'match' | 'original'>('match');

  // Compute manuscript relevance score for each candidate
  const scoredCandidates = useMemo(() => {
    const list = (candidates || []).map((cand) => {
      const score = calculateManuscriptRelevanceScore(cand, manuscriptText);
      return { ...cand, ranking_score: score };
    });

    if (sortBy === 'match') {
      return [...list].sort((a, b) => (b.ranking_score || 0) - (a.ranking_score || 0));
    }
    return list;
  }, [candidates, manuscriptText, sortBy]);

  // Initialize selection when candidates change
  useEffect(() => {
    if (candidates && candidates.length > 0) {
      setSelectedIds(new Set(candidates.map((c) => c.reference_id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [candidates]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === candidates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(candidates.map((c) => c.reference_id)));
    }
  };

  const handleConfirmImport = () => {
    const selected = candidates.filter((c) => selectedIds.has(c.reference_id));
    if (selected.length === 0) return;
    onImport(selected);
    onClose();
  };

  const allSelected = candidates.length > 0 && selectedIds.size === candidates.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < candidates.length;

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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shadow-sm"
              title={isEn ? "Reference Import Tool" : "Alat Pengimpor Referensi"}
            >
              <IconFileImport className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isEn ? 'Import References' : 'Impor Referensi'}</span>
                {fileName && (
                  <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 truncate max-w-xs" title={fileName}>
                    {fileName}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn
                  ? `Discovered ${candidates.length} citation candidate(s) ready to import into your library`
                  : `Ditemukan ${candidates.length} calon rujukan siap diimpor ke perpustakaan naskah Anda`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={isEn ? 'Close (Esc)' : 'Tutup (Esc)'}
            aria-label="Close"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Select All & Summary */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
          <label
            className="flex items-center gap-2.5 cursor-pointer font-medium select-none"
            title={isEn ? "Select or deselect all references in this batch" : "Pilih atau batalkan semua referensi dalam berkas ini"}
          >
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

          <div className="flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => setSortBy(sortBy === 'match' ? 'original' : 'match')}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-300 dark:hover:border-indigo-600 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              title={
                isEn
                  ? "Toggle sorting between highest relevance match score or file appearance order"
                  : "Ganti urutan antara skor kecocokan tertinggi atau urutan bawaan berkas"
              }
            >
              <IconArrowsSort className="w-3.5 h-3.5 text-indigo-500" />
              <span>
                {sortBy === 'match'
                  ? (isEn ? 'Sort: Highest Match ▾' : 'Urutkan: Match Tertinggi ▾')
                  : (isEn ? 'Sort: File Order ▾' : 'Urutkan: Urutan Berkas ▾')}
              </span>
            </button>

            <span
              className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
              title={isEn ? "Number of references chosen to be imported" : "Jumlah referensi yang dipilih untuk diimpor"}
            >
              {selectedIds.size} / {candidates.length} {isEn ? 'Selected' : 'Dipilih'}
            </span>
          </div>
        </div>

        {/* Paper Candidates List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3.5 thin-scroll">
          {scoredCandidates.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500">
              <IconBook className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">
                {isEn ? 'No citation entries found in file.' : 'Tidak ditemukan entri sitasi dalam berkas.'}
              </p>
            </div>
          ) : (
            scoredCandidates.map((candidate, idx) => {
              const isSelected = selectedIds.has(candidate.reference_id);
              return (
                <div
                  key={candidate.reference_id || idx}
                  onClick={() => toggleSelect(candidate.reference_id)}
                  className={`group relative p-4 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                  title={
                    isEn
                      ? `Click to ${isSelected ? 'deselect' : 'select'} "${candidate.title}" for import`
                      : `Klik untuk ${isSelected ? 'batalkan pilihan' : 'memilih'} "${candidate.title}"`
                  }
                >
                  <div className="flex items-start gap-3.5">
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Handled by container onClick
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-700 cursor-pointer"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Top Badges */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          title={isEn ? "In-text citation label used in manuscript" : "Label sitasi yang digunakan pada naskah"}
                        >
                          {candidate.citation_label}
                        </span>

                        {/* Match Percentage Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 shadow-xs ${
                            (candidate.ranking_score || 80) >= 85
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                              : (candidate.ranking_score || 80) >= 70
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
                              : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                          }`}
                          title={
                            isEn
                              ? `Topical relevance to your active manuscript: ${candidate.ranking_score}%`
                              : `Tingkat kecocokan dengan topik naskah aktif: ${candidate.ranking_score}%`
                          }
                        >
                          <span>🟢 {candidate.ranking_score}% {isEn ? 'Match' : 'Cocok'}</span>
                        </span>

                        {candidate.year && (
                          <span
                            className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700"
                            title={isEn ? `Publication Year: ${candidate.year}` : `Tahun Publikasi: ${candidate.year}`}
                          >
                            <IconCalendar className="w-3 h-3" />
                            {candidate.year}
                          </span>
                        )}

                        {candidate.source && (
                          <span
                            className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium truncate max-w-[220px]"
                            title={isEn ? `Journal / Publication: ${candidate.source}` : `Jurnal / Wadah Publikasi: ${candidate.source}`}
                          >
                            {candidate.source}
                          </span>
                        )}

                        {candidate.doi && (
                          <a
                            href={`https://doi.org/${candidate.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono hover:underline bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800"
                            title={isEn ? `Verified Digital Object Identifier (DOI): ${candidate.doi}. Click to view original paper.` : `DOI Terverifikasi: ${candidate.doi}. Klik untuk membuka paper rujukan.`}
                          >
                            <span>DOI: {candidate.doi}</span>
                            <IconExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>

                      {/* Paper Title */}
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                        {candidate.title}
                      </h4>

                      {/* Authors */}
                      {candidate.authors && candidate.authors.length > 0 && (
                        <p
                          className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1"
                          title={isEn ? `Authors: ${candidate.authors.join(', ')}` : `Penulis: ${candidate.authors.join(', ')}`}
                        >
                          <IconUser className="w-3 h-3 shrink-0 opacity-70" />
                          <span>{candidate.authors.join(', ')}</span>
                        </p>
                      )}

                      {/* Abstract Snippet if available */}
                      {candidate.abstract && (
                        <p
                          className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic leading-relaxed"
                          title={candidate.abstract}
                        >
                          "{candidate.abstract}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <IconInfoCircle className="w-4 h-4 text-indigo-500" />
            <span>
              {isEn
                ? 'Imported items are immediately available in your library and citation autocomplete.'
                : 'Item yang diimpor akan langsung tersedia di perpustakaan referensi dan autocomplete sitasi.'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              title={isEn ? "Cancel reference import" : "Batalkan impor referensi"}
            >
              {isEn ? 'Cancel' : 'Batal'}
            </button>

            {onAutoCite && (
              <button
                type="button"
                onClick={() => {
                  if (activePlanId === 'free' && onUpgrade) {
                    onUpgrade();
                    return;
                  }
                  const selected = candidates.filter((c) => selectedIds.has(c.reference_id));
                  if (selected.length === 0) return;
                  onAutoCite(selected);
                  onClose();
                }}
                disabled={selectedIds.size === 0}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 text-white shadow-md shadow-indigo-500/20 transition cursor-pointer"
                title={
                  isEn
                    ? "Analyze active manuscript and automatically attribute citations to relevant sentences (Pro Feature)"
                    : "Analisis naskah aktif dan sematkan sitasi otomatis ke kalimat-kalimat yang relevan (Fitur Pro)"
                }
              >
                <IconSparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>{isEn ? '⚡ Auto-Cite to Manuscript' : '⚡ Auto-Cite ke Naskah'}</span>
                {activePlanId === 'free' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-black bg-amber-400 text-amber-950 uppercase tracking-wider ml-1 shadow-xs">
                    PRO
                  </span>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={selectedIds.size === 0}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white shadow-md shadow-indigo-600/20 transition cursor-pointer disabled:cursor-not-allowed"
              title={
                isEn
                  ? `Save ${selectedIds.size} selected citation(s) to your manuscript library`
                  : `Simpan ${selectedIds.size} sitasi terpilih ke perpustakaan naskah Anda`
              }
            >
              <IconCheck className="w-4 h-4" />
              <span>
                {isEn
                  ? `Import (${selectedIds.size})`
                  : `Impor (${selectedIds.size})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
