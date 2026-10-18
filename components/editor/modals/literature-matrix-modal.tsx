'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  IconX,
  IconTable,
  IconSearch,
  IconDownload,
  IconCopy,
  IconCheck,
  IconSparkles,
  IconPlus,
  IconFilter,
  IconFileText,
  IconBookOpen,
  IconArrowRight
} from '@tabler/icons-react';
import {
  extractLiteratureMatrix,
  exportMatrixToMarkdownTable,
  exportMatrixToCsv,
  exportMatrixToEditorJsTable,
  LiteratureMatrixRow,
  CitationItemForMatrix
} from '@/lib/editor/literature-matrix';

interface LiteratureMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  citationLibrary?: Record<string, CitationItemForMatrix>;
  language?: 'en' | 'id';
  onInjectTableToEditor?: (tableBlock: any) => void;
}

export const LiteratureMatrixModal: React.FC<LiteratureMatrixModalProps> = ({
  isOpen,
  onClose,
  citationLibrary = {},
  language = 'id',
  onInjectTableToEditor,
}) => {
  const isEn = language === 'en';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string>('all');
  const [matrixRows, setMatrixRows] = useState<LiteratureMatrixRow[]>([]);
  const [copiedMd, setCopiedMd] = useState(false);
  const [injectedSuccess, setInjectedSuccess] = useState(false);

  // Sync rows when library changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setMatrixRows((prev) => extractLiteratureMatrix(citationLibrary, prev, language));
    }
  }, [isOpen, citationLibrary, language]);

  // Handle cell edit
  const handleCellChange = (id: string, field: keyof LiteratureMatrixRow, value: string) => {
    setMatrixRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  // Filtered rows
  const filteredRows = useMemo(() => {
    return matrixRows.filter((row) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        row.citationKey.toLowerCase().includes(q) ||
        row.authors.toLowerCase().includes(q) ||
        row.title.toLowerCase().includes(q) ||
        row.methodology.toLowerCase().includes(q) ||
        row.keyFindings.toLowerCase().includes(q) ||
        row.synthesisNotes.toLowerCase().includes(q);

      const matchTag =
        activeTag === 'all' ||
        row.tags.some((t) => t.toLowerCase() === activeTag.toLowerCase());

      return matchQuery && matchTag;
    });
  }, [matrixRows, searchQuery, activeTag]);

  // Extract unique tags
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    matrixRows.forEach((r) => r.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [matrixRows]);

  if (!isOpen) return null;

  const handleCopyMarkdown = async () => {
    const md = exportMatrixToMarkdownTable(matrixRows, language);
    await navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2200);
  };

  const handleDownloadCsv = () => {
    const csv = exportMatrixToCsv(matrixRows, language);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `literature-matrix-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleInjectToCanvas = () => {
    if (!onInjectTableToEditor) return;
    const tableBlock = exportMatrixToEditorJsTable(filteredRows, language);
    onInjectTableToEditor(tableBlock);
    setInjectedSuccess(true);
    setTimeout(() => {
      setInjectedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-7xl h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              <IconTable className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {isEn ? 'Interactive Literature Matrix & Synthesis Grid' : 'Matriks Sintesis Literatur & Riset Terdahulu'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-900/50 text-teal-600 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  Phase 36
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn
                  ? 'Systematic cross-study comparison of methodology, sample size, empirical findings, and limitations.'
                  : 'Komparasi lintas studi sistematis untuk metodologi, sampel data, temuan empiris, dan batasan riset.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          {/* Search Input */}
          <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
            <div className="relative w-full">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isEn
                    ? 'Search study, author, method, findings...'
                    : 'Cari rujukan, penulis, metode, temuan...'
                }
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>
          </div>

          {/* Tag Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto thin-scroll py-1">
            <button
              type="button"
              onClick={() => setActiveTag('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTag === 'all'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {isEn ? 'All Studies' : 'Semua Paper'} ({matrixRows.length})
            </button>
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTag === tag
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedMd ? <IconCheck className="w-3.5 h-3.5 text-emerald-500" /> : <IconCopy className="w-3.5 h-3.5" />}
              <span>{copiedMd ? (isEn ? 'Copied Table!' : 'Tabel Tersalin!') : (isEn ? 'Copy Markdown' : 'Salin Markdown')}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <IconDownload className="w-3.5 h-3.5" />
              <span>CSV (Excel)</span>
            </button>

            {onInjectTableToEditor && (
              <button
                type="button"
                onClick={handleInjectToCanvas}
                className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {injectedSuccess ? <IconCheck className="w-3.5 h-3.5" /> : <IconPlus className="w-3.5 h-3.5" />}
                <span>
                  {injectedSuccess
                    ? (isEn ? 'Inserted to Canvas!' : 'Tersisip ke Kanvas!')
                    : (isEn ? 'Insert Table to Manuscript' : 'Sisipkan Tabel ke Naskah')}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Matrix Grid Canvas */}
        <div className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-950 p-4">
          {filteredRows.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4 border border-teal-200/60 dark:border-teal-800/40">
                <IconBookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {isEn ? 'No Research References in Library' : 'Belum Ada Paper Referensi di Pustaka'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
                {isEn
                  ? 'Add peer-reviewed citations to your manuscript library using Citation Search (Ctrl+Shift+C) or Reference Importer (Ctrl+Shift+U) to automatically synthesize your Literature Review matrix.'
                  : 'Tambahkan referensi ke naskah Anda melalui Cari Sitasi (Ctrl+Shift+C) atau Impor Referensi (Ctrl+Shift+U) untuk otomatis membangun matriks sintesis tinjauan pustaka Bab 2.'}
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm min-w-[1050px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/75 dark:bg-slate-850 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4 w-52 sticky left-0 bg-slate-100 dark:bg-slate-850 z-10 shadow-xs">
                      {isEn ? 'Study / Citation' : 'Rujukan / Sitasi'}
                    </th>
                    <th className="py-3 px-4 w-44">{isEn ? 'Methodology' : 'Metodologi'}</th>
                    <th className="py-3 px-4 w-28">{isEn ? 'Sample' : 'Sampel'}</th>
                    <th className="py-3 px-4 w-72">{isEn ? 'Key Empirical Findings' : 'Temuan Empiris Utama'}</th>
                    <th className="py-3 px-4 w-60">{isEn ? 'Limitations & Gaps' : 'Batasan & Celah Riset'}</th>
                    <th className="py-3 px-4 w-64">{isEn ? 'Synthesis / Relevance Notes' : 'Catatan Sintesis Bab 2'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-800/80">
                  {filteredRows.map((row, idx) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Sticky Study Column */}
                      <td className="py-3 px-4 sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-850 z-10 border-r border-slate-150 dark:border-slate-800 shadow-xs">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{row.citationKey}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5" title={row.title}>
                          {row.title}
                        </p>
                        {row.venue && (
                          <span className="text-[10px] text-teal-600 dark:text-teal-400 italic block mt-1">
                            {row.venue}
                          </span>
                        )}
                        {row.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {row.tags.map((t) => (
                              <span
                                key={t}
                                className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Methodology (Editable) */}
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={row.methodology}
                          onChange={(e) => handleCellChange(row.id, 'methodology', e.target.value)}
                          className="w-full bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 p-1.5 rounded border border-transparent focus:border-teal-500 text-xs text-slate-800 dark:text-slate-200 font-medium"
                        />
                      </td>

                      {/* Sample Size (Editable) */}
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={row.sampleSize}
                          onChange={(e) => handleCellChange(row.id, 'sampleSize', e.target.value)}
                          className="w-full bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 p-1.5 rounded border border-transparent focus:border-teal-500 text-xs text-slate-700 dark:text-slate-300 font-mono"
                        />
                      </td>

                      {/* Key Findings (Editable) */}
                      <td className="py-3 px-4">
                        <textarea
                          rows={2}
                          value={row.keyFindings}
                          onChange={(e) => handleCellChange(row.id, 'keyFindings', e.target.value)}
                          className="w-full bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 p-1.5 rounded border border-transparent focus:border-teal-500 text-xs text-slate-700 dark:text-slate-300 leading-relaxed resize-y"
                        />
                      </td>

                      {/* Limitations (Editable) */}
                      <td className="py-3 px-4">
                        <textarea
                          rows={2}
                          value={row.limitations}
                          onChange={(e) => handleCellChange(row.id, 'limitations', e.target.value)}
                          className="w-full bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 p-1.5 rounded border border-transparent focus:border-teal-500 text-xs text-slate-600 dark:text-slate-400 leading-relaxed resize-y"
                        />
                      </td>

                      {/* Synthesis Notes (Editable) */}
                      <td className="py-3 px-4">
                        <textarea
                          rows={2}
                          value={row.synthesisNotes}
                          onChange={(e) => handleCellChange(row.id, 'synthesisNotes', e.target.value)}
                          className="w-full bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 p-1.5 rounded border border-transparent focus:border-teal-500 text-xs text-teal-700 dark:text-teal-300 leading-relaxed resize-y font-medium"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span>
              {isEn
                ? `Showing ${filteredRows.length} of ${matrixRows.length} referenced studies`
                : `Menampilkan ${filteredRows.length} dari ${matrixRows.length} studi kepustakaan`}
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span className="hidden sm:inline">
              {isEn ? 'Click any cell to edit details inline' : 'Klik sel mana saja untuk mengedit rincian langsung'}
            </span>
          </div>

          <div className="flex items-center gap-2">
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
    </div>
  );
};
