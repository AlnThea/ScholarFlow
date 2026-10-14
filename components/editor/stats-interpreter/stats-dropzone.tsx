'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  IconUpload,
  IconPhoto,
  IconFileSpreadsheet,
  IconFileText,
  IconTrash,
  IconClipboard,
  IconCheck,
  IconAlertCircle,
  IconSparkles,
  IconEye,
  IconX,
} from '@tabler/icons-react';
import { StatsInputData } from './stats-types';

interface StatsDropzoneProps {
  inputData: StatsInputData | null;
  onDataLoaded: (data: StatsInputData | null) => void;
  language: 'id' | 'en';
  disabled?: boolean;
}

export function StatsDropzone({
  inputData,
  onDataLoaded,
  language,
  disabled = false,
}: StatsDropzoneProps) {
  const isEn = language === 'en';
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File validator and processor
  const processFile = useCallback((file: File) => {
    setErrorMsg(null);
    const maxSize = 12 * 1024 * 1024; // 12MB limit

    if (file.size > maxSize) {
      setErrorMsg(isEn ? 'File size exceeds 12MB limit.' : 'Ukuran file melebihi batas 12MB.');
      return;
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        onDataLoaded({
          type: 'image',
          fileName: file.name || `screenshot-${Date.now()}.png`,
          fileSize: file.size,
          mimeType: file.type || 'image/png',
          previewUrl: result,
          base64Data: base64,
        });
      };
      reader.onerror = () => {
        setErrorMsg(isEn ? 'Failed to read image file.' : 'Gagal membaca file gambar.');
      };
      reader.readAsDataURL(file);
    } else if (file.name.endsWith('.csv') || file.type.includes('csv') || file.name.endsWith('.txt') || file.type.includes('text')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(Boolean).length;
        onDataLoaded({
          type: file.name.endsWith('.csv') ? 'csv' : 'text',
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || 'text/plain',
          rawText: text,
          lineCount: lines,
        });
      };
      reader.onerror = () => {
        setErrorMsg(isEn ? 'Failed to read data file.' : 'Gagal membaca file data teks.');
      };
      reader.readAsText(file);
    } else {
      setErrorMsg(
        isEn
          ? 'Unsupported format. Please upload .png, .jpg, .csv, or .txt.'
          : 'Format tidak didukung. Harap unggah .png, .jpg, .csv, atau .txt.'
      );
    }
  }, [isEn, onDataLoaded]);

  // Global Ctrl+V clipboard paste listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;
      const target = e.target as HTMLElement | null;
      const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) {
            processFile(new File([file], `spss-paste-${Date.now()}.png`, { type: file.type }));
          }
          return;
        }
      }

      // If user pasted text into the dropzone (and not inside an input box)
      if (!isInput) {
        const text = e.clipboardData?.getData('text/plain');
        if (text && (text.includes('\t') || text.includes(',') || text.includes('\n'))) {
          e.preventDefault();
          const lines = text.split('\n').filter(Boolean).length;
          onDataLoaded({
            type: text.includes(',') ? 'csv' : 'text',
            fileName: `clipboard-table-${Date.now()}.txt`,
            fileSize: new Blob([text]).size,
            mimeType: 'text/plain',
            rawText: text,
            lineCount: lines,
          });
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [disabled, onDataLoaded, processFile]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const loadSampleData = () => {
    const sampleCsv = `Variable,Mean,StdDev,t_value,df,p_value
Pre-Test,64.30,8.42,-6.18,48,< .001
Post-Test,82.75,7.15,-6.18,48,< .001
Independent Samples Test: Levene's Test F=0.84 (p=.364), t(48)=-6.18, p=0.000, Mean Difference=-18.45`;

    onDataLoaded({
      type: 'csv',
      fileName: 'sample-spss-t-test.csv',
      fileSize: new Blob([sampleCsv]).size,
      mimeType: 'text/csv',
      rawText: sampleCsv,
      lineCount: 4,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".png,.jpg,.jpeg,.webp,.csv,.txt"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
          }
        }}
        disabled={disabled}
      />

      {/* Dropzone Container or Preview */}
      {!inputData ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer select-none ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 scale-[0.99]'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 hover:border-indigo-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <IconUpload className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                {isEn ? 'Drop SPSS output image or file here' : 'Tarik & lepas tangkapan layar SPSS di sini'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isEn ? 'Supports PNG, JPG, CSV, TXT (Max 12MB)' : 'Mendukung PNG, JPG, CSV, TXT (Maks 12MB)'}
              </p>
            </div>

            {/* Ctrl+V Hint Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-[10px] font-medium text-indigo-700 dark:text-indigo-300">
              <IconClipboard className="h-3 w-3" />
              <span>{isEn ? 'Paste ready: Press Ctrl+V anytime' : 'Bisa langsung Ctrl+V tangkapan layar'}</span>
            </div>
          </div>
        </div>
      ) : (
        /* Preview Card */
        <div className="rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-white dark:bg-slate-800/90 p-3 shadow-xs">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                {inputData.type === 'image' ? (
                  <IconPhoto className="h-5 w-5" />
                ) : inputData.type === 'csv' ? (
                  <IconFileSpreadsheet className="h-5 w-5" />
                ) : (
                  <IconFileText className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {inputData.fileName}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                  <span>{formatFileSize(inputData.fileSize)}</span>
                  <span>•</span>
                  <span className="uppercase font-mono text-[9px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {inputData.type}
                  </span>
                  {inputData.lineCount && <span>({inputData.lineCount} lines)</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {inputData.previewUrl && (
                <button
                  type="button"
                  onClick={() => setShowImageModal(true)}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  title={isEn ? 'View Image' : 'Lihat Gambar'}
                >
                  <IconEye className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onDataLoaded(null)}
                className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                title={isEn ? 'Remove file' : 'Hapus data'}
              >
                <IconTrash className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Image Thumbnail Preview */}
          {inputData.previewUrl && (
            <div className="mt-2.5 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 max-h-40 bg-slate-100 dark:bg-slate-900 flex items-center justify-center group relative cursor-pointer" onClick={() => setShowImageModal(true)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={inputData.previewUrl}
                alt={inputData.fileName}
                className="max-h-40 w-auto object-contain mx-auto transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-medium gap-1">
                <IconEye className="h-4 w-4" />
                <span>{isEn ? 'Click to enlarge' : 'Perbesar gambar'}</span>
              </div>
            </div>
          )}

          {/* Text/CSV Preview Snippet */}
          {inputData.rawText && (
            <div className="mt-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-2 max-h-32 overflow-y-auto font-mono text-[10px] text-slate-700 dark:text-slate-300 whitespace-pre leading-relaxed thin-scroll">
              {inputData.rawText.slice(0, 500)}
              {inputData.rawText.length > 500 && '...'}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-xs text-red-600 dark:text-red-400">
          <IconAlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Quick Action: Try Sample Data */}
      {!inputData && (
        <div className="flex items-center justify-between text-[11px] pt-0.5">
          <span className="text-slate-400 dark:text-slate-500">
            {isEn ? 'Need a quick test?' : 'Ingin uji coba cepat?'}
          </span>
          <button
            type="button"
            onClick={loadSampleData}
            className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline"
          >
            <IconSparkles className="h-3 w-3" />
            <span>{isEn ? 'Load Sample SPSS Output' : 'Gunakan Contoh Output SPSS'}</span>
          </button>
        </div>
      )}

      {/* Modal for Full-Size Image Preview */}
      {showImageModal && inputData?.previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-fade-in"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {inputData.fileName}
              </span>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>
            <div className="p-2 overflow-auto max-h-[80vh] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={inputData.previewUrl}
                alt={inputData.fileName}
                className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
