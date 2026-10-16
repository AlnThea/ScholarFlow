// components/editor/modals/latex-export-modal.tsx
// Academic LaTeX & Journal Package Exporter Modal (Phase 27)

'use client';

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  IconX,
  IconDownload,
  IconCopy,
  IconCheck,
  IconCode,
  IconFileText,
  IconPackage,
  IconSparkles,
  IconInfoCircle,
  IconLayersLinked,
  IconBook,
  IconExternalLink
} from '@tabler/icons-react';
import {
  type JournalTemplate,
  JOURNAL_TEMPLATES,
  generateFullLatexDocument,
  generateBibtexContent,
  downloadLatexZipPackage,
  type LatexExportOptions
} from '@/lib/editor/latex-exporter';

export interface LatexExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  documentContent: any;
  citationLibrary?: Record<string, any>;
  bibliographyEntries?: any[];
  language: 'en' | 'id';
  authorName?: string;
  authorEmail?: string;
}

export function LatexExportModal({
  isOpen,
  onClose,
  documentTitle,
  documentContent,
  citationLibrary = {},
  bibliographyEntries = [],
  language,
  authorName = 'ScholarFlow Author',
  authorEmail = 'author@scholarflow.org'
}: LatexExportModalProps) {
  const isEn = language === 'en';
  const [selectedTemplate, setSelectedTemplate] = useState<JournalTemplate>('ieee');
  const [activeTab, setActiveTab] = useState<'tex' | 'bib' | 'readme'>('tex');
  const [authorState, setAuthorState] = useState(authorName);
  const [affilState, setAffilState] = useState('Faculty of Science & Technology, University');
  const [emailState, setEmailState] = useState(authorEmail);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [copied, setCopied] = useState(false);

  // Extract blocks from content safely
  const blocks = useMemo(() => {
    if (!documentContent) return [];
    if (typeof documentContent === 'string') {
      try {
        const parsed = JSON.parse(documentContent);
        return parsed.blocks || [];
      } catch {
        return [];
      }
    }
    return documentContent.blocks || [];
  }, [documentContent]);

  // Extract abstract if any
  const abstractText = useMemo(() => {
    const abstractBlock = blocks.find((b: any) => {
      const text = (b.data?.text || '').toLowerCase();
      return b.type === 'paragraph' && (text.includes('abstract') || text.includes('abstrak'));
    });
    return abstractBlock?.data?.text || '';
  }, [blocks]);

  const exportOptions: LatexExportOptions = useMemo(() => {
    return {
      title: documentTitle || (isEn ? 'Untitled Research Paper' : 'Naskah Riset Tanpa Judul'),
      authorName: authorState,
      authorAffiliation: affilState,
      authorEmail: emailState,
      abstractText,
      template: selectedTemplate,
      blocks,
      citationLibrary,
      bibliographyEntries,
      language,
    };
  }, [documentTitle, authorState, affilState, emailState, abstractText, selectedTemplate, blocks, citationLibrary, bibliographyEntries, language, isEn]);

  const fullLatexCode = useMemo(() => {
    return generateFullLatexDocument(exportOptions);
  }, [exportOptions]);

  const bibtexCode = useMemo(() => {
    return generateBibtexContent(citationLibrary);
  }, [citationLibrary]);

  const handleCopyCode = async () => {
    const targetCode = activeTab === 'tex' ? fullLatexCode : bibtexCode;
    try {
      await navigator.clipboard.writeText(targetCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy LaTeX code:', err);
    }
  };

  const handleDownloadZip = async () => {
    setIsExportingZip(true);
    try {
      await downloadLatexZipPackage(exportOptions);
    } catch (err) {
      console.error('Failed to download zip:', err);
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleDownloadTexOnly = () => {
    const blob = new Blob([fullLatexCode], { type: 'application/x-tex;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = (documentTitle || 'manuscript').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${safeTitle}_${selectedTemplate}.tex`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] transition-all"
        role="dialog"
        aria-modal="true"
        aria-label={isEn ? 'LaTeX & Journal Package Exporter' : 'Ekspor Paket LaTeX & Jurnal'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400">
              <IconCode className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>{isEn ? 'LaTeX & Journal Package Exporter' : 'Ekspor Paket LaTeX & Template Jurnal'}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Overleaf Ready
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isEn
                  ? 'Compile your manuscript into standardized IEEE, Elsevier, or ACM packages (.tex + .bib)'
                  : 'Kompilasi naskah Anda ke dalam paket standar publikasi IEEE, Elsevier, atau ACM siap Overleaf'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 thin-scroll">
          {/* Step 1: Select Journal Template */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              {isEn ? '1. Select Publication Target & Journal Template' : '1. Pilih Target Publikasi & Template Jurnal'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {(Object.keys(JOURNAL_TEMPLATES) as JournalTemplate[]).map((tmplKey) => {
                const tmpl = JOURNAL_TEMPLATES[tmplKey];
                const isSelected = selectedTemplate === tmplKey;
                return (
                  <button
                    key={tmplKey}
                    type="button"
                    onClick={() => setSelectedTemplate(tmplKey)}
                    className={`relative p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 text-slate-900 dark:text-white shadow-xs ring-1 ring-emerald-500'
                        : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350'
                    }`}
                    title={isEn ? tmpl.descriptionEn : tmpl.descriptionId}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {tmpl.badge}
                        </span>
                        {isSelected && <IconCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                      </div>
                      <h4 className="text-xs font-bold leading-tight mt-1">{tmpl.name}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {isEn ? tmpl.descriptionEn : tmpl.descriptionId}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Author & Affiliation Details (Accordion or Compact Grid) */}
          <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              {isEn ? '2. Author Metadata for Preamble' : '2. Metadata Penulis untuk Preamble LaTeX'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">
                  {isEn ? 'Author Name' : 'Nama Penulis'}
                </label>
                <input
                  type="text"
                  value={authorState}
                  onChange={(e) => setAuthorState(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">
                  {isEn ? 'Affiliation / Department' : 'Institusi / Afiliasi'}
                </label>
                <input
                  type="text"
                  value={affilState}
                  onChange={(e) => setAffilState(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">
                  {isEn ? 'Author Email' : 'Email Penulis'}
                </label>
                <input
                  type="text"
                  value={emailState}
                  onChange={(e) => setEmailState(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Interactive Code Inspector & Tabbed Viewer */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('tex')}
                  className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'tex'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title={isEn ? 'Inspect generated main.tex file' : 'Lihat berkas utama main.tex'}
                >
                  <IconFileText className="h-3.5 w-3.5" />
                  <span>main.tex</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('bib')}
                  className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'bib'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title={isEn ? 'Inspect references.bib file' : 'Lihat basis data pustaka references.bib'}
                >
                  <IconBook className="h-3.5 w-3.5" />
                  <span>references.bib ({Object.keys(citationLibrary).length})</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                title={isEn ? 'Copy active file code to clipboard' : 'Salin kode berkas aktif ke clipboard'}
              >
                {copied ? <IconCheck className="h-3.5 w-3.5 text-emerald-500" /> : <IconCopy className="h-3.5 w-3.5" />}
                <span>{copied ? (isEn ? 'Copied!' : 'Tersalin!') : (isEn ? 'Copy Code' : 'Salin Kode')}</span>
              </button>
            </div>

            {/* Code Block Container */}
            <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-200 p-4 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[220px] thin-scroll selection:bg-emerald-500 selection:text-black">
              <pre className="whitespace-pre">
                {activeTab === 'tex' ? fullLatexCode : bibtexCode}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
            <IconPackage className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              {isEn
                ? 'Package includes main.tex, references.bib, and Overleaf quick-upload guide.'
                : 'Paket .zip mencakup main.tex, references.bib, & panduan Overleaf.'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDownloadTexOnly}
              className="flex-1 sm:flex-none px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer"
              title={isEn ? 'Download standalone main.tex file only' : 'Unduh hanya berkas main.tex saja'}
            >
              {isEn ? 'Download .tex Only' : 'Unduh .tex Saja'}
            </button>
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={isExportingZip}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm transition cursor-pointer disabled:opacity-60"
              title={isEn ? 'Download complete ZIP package ready for Overleaf upload' : 'Unduh paket ZIP lengkap siap upload ke Overleaf'}
            >
              <IconDownload className="h-4 w-4" />
              <span>
                {isExportingZip
                  ? (isEn ? 'Packing ZIP...' : 'Mengemas ZIP...')
                  : (isEn ? 'Download Overleaf Package (.zip)' : 'Unduh Paket Overleaf (.zip)')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
