// components/editor/modals/version-history-modal.tsx
'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  IconHistory,
  IconX,
  IconArrowBackUp,
  IconCopy,
  IconCheck,
  IconPlus,
  IconClock,
  IconFileText,
  IconColumns,
  IconLayoutList,
  IconSparkles,
  IconAlertCircle,
  IconLoader2,
} from '@tabler/icons-react';
import { DocumentRevision } from '@/lib/editor/version-history';
import { DiffChunk, DiffStats, formatRelativeTime, extractPlainTextFromEditorJs } from '@/lib/editor/diff-engine';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  revisions: DocumentRevision[];
  selectedRevision: DocumentRevision | null;
  onSelectRevision: (revision: DocumentRevision) => void;
  diffChunks: DiffChunk[];
  diffStats: DiffStats | null;
  activeDiffMode: 'unified' | 'split';
  onChangeDiffMode: (mode: 'unified' | 'split') => void;
  onRestoreRevision: (revision: DocumentRevision) => void;
  onCreateManualSnapshot: (summary: string) => Promise<any>;
  isLoading: boolean;
  isRestoring: boolean;
  language: 'en' | 'id';
  currentContent: any;
}

export function VersionHistoryModal({
  isOpen,
  onClose,
  revisions,
  selectedRevision,
  onSelectRevision,
  diffChunks,
  diffStats,
  activeDiffMode,
  onChangeDiffMode,
  onRestoreRevision,
  onCreateManualSnapshot,
  isLoading,
  isRestoring,
  language,
  currentContent,
}: VersionHistoryModalProps) {
  const [copied, setCopied] = useState(false);
  const [isConfirmRestoreOpen, setIsConfirmRestoreOpen] = useState(false);
  const [isCreateSnapshotOpen, setIsCreateSnapshotOpen] = useState(false);
  const [snapshotSummaryInput, setSnapshotSummaryInput] = useState('');
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);

  if (!isOpen) return null;

  const isEn = language === 'en';

  const handleCopyText = () => {
    if (!selectedRevision) return;
    const text = extractPlainTextFromEditorJs(selectedRevision.content);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmRestore = () => {
    if (selectedRevision) {
      setIsConfirmRestoreOpen(false);
      onRestoreRevision(selectedRevision);
    }
  };

  const handleSaveSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotSummaryInput.trim()) return;

    setIsCreatingSnapshot(true);
    try {
      await onCreateManualSnapshot(snapshotSummaryInput.trim());
      setSnapshotSummaryInput('');
      setIsCreateSnapshotOpen(false);
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  const currentCanvasPlainText = extractPlainTextFromEditorJs(currentContent);
  const selectedRevisionPlainText = selectedRevision ? extractPlainTextFromEditorJs(selectedRevision.content) : '';

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      {/* Header Bar */}
      <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <IconHistory className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              {isEn ? 'Document Version History' : 'Riwayat Versi Dokumen'}
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Time Machine
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEn
                ? 'Browse past revisions, view visual diffs, and restore previous drafts safely.'
                : 'Jelajahi revisi masa lalu, tinjau perbedaan visual, dan pulihkan draf sebelumnya dengan aman.'}
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCreateSnapshotOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
          >
            <IconPlus className="h-3.5 w-3.5 text-indigo-500" />
            {isEn ? 'Create Snapshot' : 'Buat Snapshot'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title={isEn ? 'Close Version History' : 'Tutup Riwayat Versi'}
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Revisions Timeline List */}
        <aside className="w-80 border-r border-slate-200 bg-slate-50/70 p-4 overflow-y-auto shrink-0 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {isEn ? 'Timeline Revisions' : 'Garis Waktu Revisi'} ({revisions.length})
            </span>
            {isLoading && (
              <IconLoader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
            )}
          </div>

          {revisions.length === 0 && !isLoading ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center dark:border-slate-800">
              <IconClock className="mx-auto h-8 w-8 text-slate-350 dark:text-slate-600 mb-2" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {isEn ? 'No revisions recorded yet.' : 'Belum ada revisi tercatat.'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 dark:text-slate-500">
                {isEn
                  ? 'Snapshots are automatically created during typing pauses or manually.'
                  : 'Snapshot dibuat secara otomatis saat mengetik atau dapat disimpan manual.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {revisions.map((rev) => {
                const isSelected = selectedRevision?.id === rev.id;
                const relTime = formatRelativeTime(rev.created_at, language);

                return (
                  <button
                    key={rev.id}
                    type="button"
                    onClick={() => onSelectRevision(rev)}
                    className={`w-full text-left rounded-xl p-3 border transition cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-white shadow-md ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-slate-800'
                        : 'border-slate-200/90 bg-white/70 hover:bg-white hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-850 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                          rev.is_auto_saved
                            ? 'bg-slate-150 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                            : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300'
                        }`}
                      >
                        {rev.is_auto_saved
                          ? (isEn ? 'Auto-save' : 'Auto-save')
                          : (isEn ? 'Checkpoint' : 'Manual')}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                        {relTime}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate mb-1">
                      {rev.change_summary || (isEn ? 'Version Snapshot' : 'Snapshot Versi')}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{rev.word_count.toLocaleString()} {isEn ? 'words' : 'kata'}</span>
                      <span>
                        {new Date(rev.created_at).toLocaleTimeString(isEn ? 'en-US' : 'id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* Right Main Panel: Visual Diff & Inspection */}
        <main className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-slate-950">
          {selectedRevision ? (
            <>
              {/* Revision Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/50 px-6 py-3 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      {selectedRevision.change_summary || (isEn ? 'Snapshot Version' : 'Versi Snapshot')}
                      {selectedRevision.is_auto_saved && (
                        <span className="rounded bg-slate-200/70 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {isEn ? 'Auto-saved' : 'Otomatis'}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(selectedRevision.created_at).toLocaleString(isEn ? 'en-US' : 'id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })} • {selectedRevision.author_name || 'Author'}
                    </p>
                  </div>

                  {/* Diff Stats Badges */}
                  {diffStats && (
                    <div className="flex items-center gap-1.5 ml-2">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        +{diffStats.addedWords} {isEn ? 'words' : 'kata'}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                        -{diffStats.removedWords} {isEn ? 'words' : 'kata'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Diff Mode Switcher */}
                  <div className="flex items-center rounded-lg bg-slate-200/70 p-0.5 dark:bg-slate-800">
                    <button
                      type="button"
                      onClick={() => onChangeDiffMode('unified')}
                      className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                        activeDiffMode === 'unified'
                          ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-slate-100 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                      }`}
                    >
                      <IconLayoutList className="h-3.5 w-3.5" />
                      {isEn ? 'Unified Diff' : 'Tampilan Terpadu'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeDiffMode('split')}
                      className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                        activeDiffMode === 'split'
                          ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-slate-100 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                      }`}
                    >
                      <IconColumns className="h-3.5 w-3.5" />
                      {isEn ? 'Side-by-Side' : 'Berdampingan'}
                    </button>
                  </div>

                  {/* Copy Text Button */}
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
                  >
                    {copied ? (
                      <>
                        <IconCheck className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-emerald-600 font-semibold dark:text-emerald-400">
                          {isEn ? 'Copied!' : 'Tersalin!'}
                        </span>
                      </>
                    ) : (
                      <>
                        <IconCopy className="h-3.5 w-3.5 text-slate-400" />
                        <span>{isEn ? 'Copy Text' : 'Salin Teks'}</span>
                      </>
                    )}
                  </button>

                  {/* Restore Version Button */}
                  <button
                    type="button"
                    onClick={() => setIsConfirmRestoreOpen(true)}
                    disabled={isRestoring}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    {isRestoring ? (
                      <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <IconArrowBackUp className="h-3.5 w-3.5" />
                    )}
                    {isEn ? 'Restore This Version' : 'Pulihkan Versi Ini'}
                  </button>
                </div>
              </div>

              {/* Diff Viewer Body */}
              <div className="flex-1 overflow-y-auto p-8">
                {activeDiffMode === 'unified' ? (
                  /* Unified Visual Diff */
                  <div className="max-w-4xl mx-auto rounded-xl border border-slate-200 bg-white p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 text-xs text-slate-400 dark:border-slate-800">
                      <span>
                        {isEn
                          ? 'Showing changes between selected snapshot and current canvas'
                          : 'Menampilkan perubahan antara snapshot terpilih dan naskah kanvas saat ini'}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" /> {isEn ? 'Added' : 'Ditambahkan'}
                        </span>
                        <span className="flex items-center gap-1 text-rose-700 dark:text-rose-400 font-medium">
                          <span className="h-2 w-2 rounded-full bg-rose-500" /> {isEn ? 'Removed' : 'Dihapus'}
                        </span>
                      </div>
                    </div>

                    <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap font-serif">
                      {diffChunks.length === 0 ? (
                        <p className="text-slate-400 italic">
                          {isEn ? 'No text differences detected.' : 'Tidak terdeteksi perbedaan teks.'}
                        </p>
                      ) : (
                        diffChunks.map((chunk, index) => {
                          if (chunk.type === 'added') {
                            return (
                              <mark
                                key={index}
                                className="bg-emerald-100 text-emerald-900 rounded px-1 py-0.5 mx-0.5 font-medium dark:bg-emerald-950/80 dark:text-emerald-200"
                              >
                                {chunk.value}
                              </mark>
                            );
                          }
                          if (chunk.type === 'removed') {
                            return (
                              <del
                                key={index}
                                className="bg-rose-100 text-rose-800 line-through rounded px-1 py-0.5 mx-0.5 opacity-80 dark:bg-rose-950/80 dark:text-rose-300"
                              >
                                {chunk.value}
                              </del>
                            );
                          }
                          return <span key={index}>{chunk.value}</span>;
                        })
                      )}
                    </div>
                  </div>
                ) : (
                  /* Side-by-Side Split View */
                  <div className="grid grid-cols-2 gap-6 max-w-6xl mx-auto h-full">
                    {/* Left: Snapshot Version */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 text-xs font-bold text-slate-700 dark:border-slate-800 dark:text-slate-300">
                        <span>{isEn ? 'Snapshot Version' : 'Versi Snapshot Terpilih'}</span>
                        <span className="text-slate-400 font-normal">
                          {selectedRevision.word_count} {isEn ? 'words' : 'kata'}
                        </span>
                      </div>
                      <div className="flex-1 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap font-serif text-slate-800 dark:text-slate-200">
                        {selectedRevisionPlainText || (
                          <span className="text-slate-400 italic">
                            {isEn ? 'Empty document content.' : 'Konten dokumen kosong.'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Current Active Canvas */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 text-xs font-bold text-slate-700 dark:border-slate-800 dark:text-slate-300">
                        <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                          {isEn ? 'Current Active Canvas' : 'Naskah Aktif Saat Ini'}
                        </span>
                        <span className="text-slate-400 font-normal">
                          {(currentCanvasPlainText.match(/\S+/g) || []).length} {isEn ? 'words' : 'kata'}
                        </span>
                      </div>
                      <div className="flex-1 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap font-serif text-slate-800 dark:text-slate-200">
                        {currentCanvasPlainText || (
                          <span className="text-slate-400 italic">
                            {isEn ? 'Empty canvas.' : 'Kanvas kosong.'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <IconHistory className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {isEn ? 'Select a revision from the timeline' : 'Pilih revisi dari garis waktu'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                {isEn
                  ? 'Click any snapshot on the left panel to inspect the visual diff and restore options.'
                  : 'Klik snapshot mana pun di panel kiri untuk memeriksa perbedaan visual dan opsi pemulihan.'}
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Confirmation Modal for Restore (Custom React Modal, never native alert!) */}
      {isConfirmRestoreOpen && selectedRevision && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <IconAlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {isEn ? 'Restore this version?' : 'Pulihkan versi ini?'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedRevision.change_summary || (isEn ? 'Selected Snapshot' : 'Snapshot Terpilih')}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed dark:text-slate-300 mb-4">
              {isEn
                ? 'Your current editor content will be replaced by this previous snapshot. A safety backup of your current canvas will be created automatically so you will not lose any recent progress.'
                : 'Konten editor saat ini akan digantikan oleh snapshot sebelumnya. Cadangan keselamatan naskah saat ini akan otomatis dibuat sehingga Anda tidak akan kehilangan kemajuan apa pun.'}
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsConfirmRestoreOpen(false)}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750"
              >
                {isEn ? 'Cancel' : 'Batal'}
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                {isEn ? 'Yes, Restore Version' : 'Ya, Pulihkan Versi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Creating Manual Snapshot */}
      {isCreateSnapshotOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <form
            onSubmit={handleSaveSnapshot}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <IconSparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {isEn ? 'Create Version Snapshot' : 'Buat Snapshot Versi'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isEn ? 'Save a milestone checkpoint of your draft.' : 'Simpan titik tonggak penting dari naskah Anda.'}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isEn ? 'Snapshot Description / Change Note' : 'Deskripsi Snapshot / Catatan Perubahan'}
              </label>
              <input
                type="text"
                value={snapshotSummaryInput}
                onChange={(e) => setSnapshotSummaryInput(e.target.value)}
                placeholder={isEn ? 'e.g. Completed Chapter 3 methodology draft' : 'cth. Selesai draf metodologi Bab 3'}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                autoFocus
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsCreateSnapshotOpen(false)}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750"
              >
                {isEn ? 'Cancel' : 'Batal'}
              </button>
              <button
                type="submit"
                disabled={isCreatingSnapshot || !snapshotSummaryInput.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                {isCreatingSnapshot && <IconLoader2 className="h-3.5 w-3.5 animate-spin" />}
                {isEn ? 'Save Snapshot' : 'Simpan Snapshot'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>,
    document.body
  );
}
