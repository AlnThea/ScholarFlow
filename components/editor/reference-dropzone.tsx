'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  IconFileText,
  IconFileUpload,
  IconBook,
  IconSparkles,
  IconInfoCircle,
} from '@tabler/icons-react';
import { parseReferenceFile } from '@/lib/editor/reference-importer';
import type { CitationCandidate } from '@/lib/api/citations';

interface ReferenceDropzoneProps {
  onParsedCandidates: (candidates: CitationCandidate[], fileName: string) => void;
  language: string;
  onError?: (message: string) => void;
}

export const ReferenceDropzone: React.FC<ReferenceDropzoneProps> = ({
  onParsedCandidates,
  language,
  onError,
}) => {
  const isEn = language === 'en';
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const supportedFiles = fileArray.filter((file) => {
        const name = file.name.toLowerCase();
        return (
          name.endsWith('.bib') ||
          name.endsWith('.bibtex') ||
          name.endsWith('.ris') ||
          name.endsWith('.pdf') ||
          name.endsWith('.txt')
        );
      });

      if (supportedFiles.length === 0) {
        if (onError) {
          onError(
            isEn
              ? 'Unsupported file format. Please drop .bib, .ris, or .pdf files.'
              : 'Format file tidak didukung. Silakan tarik berkas .bib, .ris, atau .pdf.'
          );
        }
        return;
      }

      setIsProcessing(true);
      try {
        const allCandidates: CitationCandidate[] = [];
        let primaryName = supportedFiles[0].name;
        if (supportedFiles.length > 1) {
          primaryName = `${supportedFiles.length} files (${supportedFiles[0].name}, ...)`;
        }

        for (const file of supportedFiles) {
          const parsed = await parseReferenceFile(file);
          allCandidates.push(...parsed);
        }

        if (allCandidates.length === 0) {
          if (onError) {
            onError(
              isEn
                ? 'No valid citation records could be extracted from the file.'
                : 'Tidak ada entri kepustakaan valid yang dapat diekstrak dari berkas tersebut.'
            );
          }
        } else {
          onParsedCandidates(allCandidates, primaryName);
        }
      } catch (err: any) {
        console.error('[ReferenceDropzone] Error processing files:', err);
        if (onError) {
          onError(
            isEn
              ? `Failed to parse reference file: ${err?.message || 'Unknown error'}`
              : `Gagal memproses berkas referensi: ${err?.message || 'Kesalahan tidak diketahui'}`
          );
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [isEn, onError, onParsedCandidates]
  );

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current += 1;
      if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current -= 1;
      if (dragCounter.current <= 0) {
        dragCounter.current = 0;
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDragging(false);

      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        await handleFiles(e.dataTransfer.files);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [handleFiles]);

  return (
    <>
      {/* Hidden file input for file picker trigger */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".bib,.bibtex,.ris,.pdf,.txt"
        className="hidden"
        onChange={async (e) => {
          if (e.target.files) {
            await handleFiles(e.target.files);
            e.target.value = ''; // Reset for re-selection
          }
        }}
      />

      {/* Drag & Drop Visual Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-indigo-950/75 dark:bg-slate-950/85 backdrop-blur-md animate-fade-in pointer-events-none select-none">
          <div className="max-w-lg w-full p-8 rounded-3xl border-2 border-dashed border-indigo-400 dark:border-indigo-500 bg-white/95 dark:bg-slate-900/95 shadow-2xl flex flex-col items-center text-center transform scale-102 transition-transform">
            <div className="relative mb-4 flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 animate-bounce">
              <IconFileUpload className="w-10 h-10" />
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-md">
                <IconSparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {isEn ? 'Drop Reference Files to Import' : 'Lepaskan Berkas Referensi di Sini'}
            </h3>

            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 max-w-sm leading-relaxed">
              {isEn
                ? 'Drop your .bib, .ris, or .pdf files directly to parse citations and auto-populate your manuscript library.'
                : 'Lepaskan berkas .bib, .ris, atau .pdf Anda untuk otomatis mengekstrak metadata sitasi ke pustaka referensi naskah.'}
            </p>

            {/* Supported Badges with Tooltips */}
            <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                title={isEn ? "BibTeX format (.bib) from Zotero, Overleaf, or Mendeley" : "Format BibTeX (.bib) dari Zotero, Overleaf, atau Mendeley"}
              >
                .BIB (BibTeX)
              </span>
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                title={isEn ? "Research Information Systems (.ris) from EndNote or ScienceDirect" : "Format RIS (.ris) dari EndNote, Mendeley, atau ScienceDirect"}
              >
                .RIS (Mendeley / EndNote)
              </span>
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                title={isEn ? "Academic PDF papers with embedded DOI or title metadata" : "Dokumen PDF jurnal ilmiah dengan DOI & judul metadata"}
              >
                .PDF (Paper Metadata)
              </span>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
              <IconInfoCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {isEn
                  ? 'All parsing runs locally and securely in your browser.'
                  : 'Seluruh parsing diproses secara aman & lokal di peramban Anda.'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Processing Indicator if reading large file */}
      {isProcessing && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900/90 text-white shadow-xl backdrop-blur-sm border border-slate-700 text-xs animate-fade-in">
          <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <span>{isEn ? 'Parsing bibliographic metadata...' : 'Mengekstrak metadata kepustakaan...'}</span>
        </div>
      )}
    </>
  );
};
