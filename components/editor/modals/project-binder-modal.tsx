// components/editor/modals/project-binder-modal.tsx
import React, { useState, useMemo } from 'react';
import {
  IconX, IconFolder, IconBook, IconFileText, IconPhoto, IconTable,
  IconDownload, IconCopy, IconCheck, IconExternalLink, IconPlus,
  IconArrowUp, IconArrowDown, IconLayersLinked, IconSparkles
} from '@tabler/icons-react';
import {
  ProjectChapter,
  extractProjectChapters,
  calculateProjectSummary,
  extractCrossChapterFiguresAndTables,
  consolidateMasterBibliography,
  compileBinderToMarkdown
} from '@/lib/editor/project-binder';

interface ProjectBinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
  projectId?: string;
  projectName?: string;
  documents: any[];
  activeDocumentId?: string;
  onSelectDocument: (doc: any) => void;
  onCreateChapter?: (projectId: string, projectName: string, nextChapterNumber: number) => void;
}

export function ProjectBinderModal({
  isOpen,
  onClose,
  language,
  projectId,
  projectName = 'Thesis Project',
  documents,
  activeDocumentId,
  onSelectDocument,
  onCreateChapter
}: ProjectBinderModalProps) {
  const isEn = language === 'en';
  const [activeTab, setActiveTab] = useState<'chapters' | 'bib' | 'figures' | 'compile'>('chapters');
  const [copied, setCopied] = useState(false);

  const chapters = useMemo(() => {
    if (!projectId) return [];
    return extractProjectChapters(documents, projectId);
  }, [documents, projectId]);

  const summary = useMemo(() => {
    return calculateProjectSummary(projectId || '', projectName, 'skripsi', chapters);
  }, [projectId, projectName, chapters]);

  const figuresAndTables = useMemo(() => {
    return extractCrossChapterFiguresAndTables(chapters, language);
  }, [chapters, language]);

  const masterBib = useMemo(() => {
    return consolidateMasterBibliography(chapters, 'apa');
  }, [chapters]);

  if (!isOpen) return null;

  const handleCopyCompilation = () => {
    const md = compileBinderToMarkdown(chapters, { projectName, language });
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBibtex = () => {
    const lines: string[] = [];
    masterBib.forEach((item, idx) => {
      const citeKey = item.doi ? item.doi.replace(/[^a-zA-Z0-9]/g, '_') : `ref_${idx + 1}`;
      lines.push(`@article{${citeKey},`);
      lines.push(`  author = {${item.authors.join(' and ')}},`);
      lines.push(`  title = {${item.title}},`);
      lines.push(`  year = {${item.year}},`);
      if (item.journal) lines.push(`  journal = {${item.journal}},`);
      if (item.doi) lines.push(`  doi = {${item.doi}},`);
      lines.push(`  note = {Used in Chapters: ${item.usedInChapters.join(', ')}}\n}`);
      lines.push('');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_master_bibliography.bib`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <IconLayersLinked className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {isEn ? 'Thesis Project Binder' : 'Pengikat Naskah Skripsi / Tesis'}
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {summary.totalChapters} {isEn ? 'Chapters' : 'Bab'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                📁 {projectName}
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

        {/* Stats Strip */}
        <div className="grid grid-cols-4 gap-2 px-6 py-3 bg-slate-50/80 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isEn ? 'Total Words' : 'Total Kata'}</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{summary.totalWords.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isEn ? 'Read Time' : 'Waktu Baca'}</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">~{summary.estimatedReadTimeMinutes} {isEn ? 'mins' : 'menit'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isEn ? 'Figures & Tables' : 'Gambar & Tabel'}</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{summary.totalFigures} / {summary.totalTables}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isEn ? 'Unique References' : 'Pustaka Terpadu'}</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{summary.totalUniqueCitations}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('chapters')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'chapters'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {isEn ? '📚 Chapters / Sections' : '📚 Bab & Bagian'} ({chapters.length})
          </button>
          <button
            onClick={() => setActiveTab('bib')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'bib'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {isEn ? '📖 Master Bibliography' : '📖 Daftar Pustaka Terpadu'} ({masterBib.length})
          </button>
          <button
            onClick={() => setActiveTab('figures')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'figures'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {isEn ? '📊 Figures & Tables' : '📊 Indeks Gambar & Tabel'} ({figuresAndTables.length})
          </button>
          <button
            onClick={() => setActiveTab('compile')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'compile'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {isEn ? '🚀 Compile & Export' : '🚀 Kompilasi Skripsi'}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'chapters' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {isEn ? 'All chapters in this research binder are synchronized in sequence:' : 'Seluruh bab dalam binder penelitian ini terurut berkesinambungan:'}
                </span>
                {onCreateChapter && projectId && (
                  <button
                    onClick={() => onCreateChapter(projectId, projectName, chapters.length + 1)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
                  >
                    <IconPlus className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Add New Chapter' : 'Tambah Bab Baru'}</span>
                  </button>
                )}
              </div>

              {chapters.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400">
                  <p className="text-xs">{isEn ? 'No chapters found in this project folder.' : 'Belum ada dokumen bab di folder proyek ini.'}</p>
                </div>
              ) : (
                chapters.map((ch) => {
                  const isActive = ch.id === activeDocumentId;
                  return (
                    <div
                      key={ch.id}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                        isActive
                          ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 ring-1 ring-indigo-500'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                          {ch.chapterNumber}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                              {ch.chapterLabel || `Bab ${ch.chapterNumber}: ${ch.title}`}
                            </h4>
                            {isActive && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                                {isEn ? 'Active' : 'Sedang Dibuka'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5">
                            <span>📝 {ch.wordCount.toLocaleString()} {isEn ? 'words' : 'kata'}</span>
                            <span>⏱️ ~{Math.max(1, Math.ceil(ch.wordCount / 150))} {isEn ? 'mins' : 'menit'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isActive && (
                          <button
                            onClick={() => {
                              const found = documents.find((d) => d.id === ch.id);
                              if (found) {
                                onSelectDocument(found);
                                onClose();
                              }
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition cursor-pointer"
                          >
                            {isEn ? 'Open Chapter' : 'Buka Bab'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'bib' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {isEn
                    ? 'Unified references aggregated and deduplicated across all thesis chapters:'
                    : 'Pustaka rujukan terpadu yang dideduplikasi dari seluruh bab skripsi:'}
                </span>
                <button
                  onClick={handleDownloadBibtex}
                  disabled={masterBib.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
                >
                  <IconDownload className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Export .bib File' : 'Unduh Berkas .bib'}</span>
                </button>
              </div>

              {masterBib.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400">
                  <p className="text-xs">{isEn ? 'No citations found across chapters yet.' : 'Belum ada sitasi ilmiah yang disisipkan di naskah bab.'}</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  {masterBib.map((item, idx) => (
                    <div key={item.key || idx} className="p-3 bg-white dark:bg-slate-900 flex items-start justify-between gap-3 text-xs">
                      <div className="flex items-start gap-2.5">
                        <span className="text-slate-400 font-mono text-[11px] mt-0.5">{idx + 1}.</span>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-100">
                            {item.authors.join(', ')} ({item.year}). <span className="italic">{item.title}</span>. {item.journal}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                              {isEn ? 'Used in:' : 'Rujukan di:'} {isEn ? 'Chapter' : 'Bab'} {item.usedInChapters.join(', ')}
                            </span>
                            {item.doi && (
                              <span className="text-[10px] text-indigo-500 font-mono truncate max-w-xs">
                                DOI: {item.doi}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'figures' && (
            <div className="space-y-3">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {isEn
                  ? 'Sequential continuous cross-chapter figure and table numbering (e.g. Figure {Chapter}.{Index}):'
                  : 'Penomoran berkesinambungan lintas bab standar akademik Dikti (contoh: Gambar {Bab}.{Nomor}):'}
              </span>

              {figuresAndTables.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400">
                  <p className="text-xs">{isEn ? 'No figures or tables found in chapters yet.' : 'Belum ada gambar atau tabel yang disisipkan di bab naskah.'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {figuresAndTables.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${
                          item.type === 'figure'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                        }`}>
                          {item.type === 'figure' ? <IconPhoto className="w-4 h-4" /> : <IconTable className="w-4 h-4" />}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-100 block">
                            {item.formattedLabel}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[220px] block">
                            {item.caption}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'compile' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/20 flex items-start gap-3">
                <IconSparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1">
                    {isEn ? 'Consolidated Thesis Manuscript Compiler' : 'Mesin Kompilasi Naskah Skripsi Utuh'}
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    {isEn
                      ? 'Combine all sequential chapters into a single master manuscript complete with continuous figure/table numbering and unified master bibliography.'
                      : 'Gabungkan seluruh bab secara berkesinambungan menjadi satu naskah skripsi lengkap siap sidang, lengkap dengan penomoran gambar/tabel dan daftar pustaka konsolidasi.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopyCompilation}
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  {copied ? <IconCheck className="w-4 h-4 text-emerald-300" /> : <IconCopy className="w-4 h-4" />}
                  <span>{copied ? (isEn ? 'Copied to Clipboard!' : 'Tersalin ke Clipboard!') : (isEn ? 'Copy Full Markdown Manuscript' : 'Salin Naskah Utuh (Markdown)')}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs">
          <span className="text-slate-400 text-[11px]">
            {isEn ? 'ScholarFlow Thesis Binder Engine v0.33.0' : 'ScholarFlow Mesin Binder Skripsi v0.33.0'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold transition cursor-pointer"
          >
            {isEn ? 'Close' : 'Tutup'}
          </button>
        </div>
      </div>
    </div>
  );
}
