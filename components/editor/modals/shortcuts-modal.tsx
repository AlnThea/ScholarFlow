// components/editor/modals/shortcuts-modal.tsx
// Global Keyboard Shortcuts Cheat Sheet Modal with Tooltips (Phase 26)

'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  IconKeyboard,
  IconX,
  IconSearch,
  IconSparkles,
  IconInfoCircle,
  IconCheck,
  IconCommand
} from '@tabler/icons-react';

export interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'id';
}

interface ShortcutItem {
  keys: string[];
  actionEn: string;
  actionId: string;
  tooltipEn: string;
  tooltipId: string;
  category: 'global' | 'ai' | 'editor' | 'citations';
}

export function ShortcutsModal({ isOpen, onClose, language }: ShortcutsModalProps) {
  const isEn = language === 'en';
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const shortcuts: ShortcutItem[] = [
    // Global & Spotlight
    {
      keys: ['Ctrl', 'K'],
      actionEn: 'Open Command Palette',
      actionId: 'Buka Palet Perintah (Spotlight)',
      tooltipEn: 'Search and launch any tool, action, or setting instantly without touching the mouse.',
      tooltipId: 'Cari dan jalankan alat, aksi, atau pengaturan apapun seketika tanpa perlu menggunakan mouse.',
      category: 'global',
    },
    {
      keys: ['?'],
      actionEn: 'Open Shortcuts Cheat Sheet',
      actionId: 'Buka Panduan Pintasan Keyboard',
      tooltipEn: 'Displays this quick visual reference guide of all productivity shortcuts.',
      tooltipId: 'Menampilkan panduan visual pintasan keyboard ini untuk meningkatkan kecepatan menulis.',
      category: 'global',
    },
    {
      keys: ['Ctrl', 'H'],
      actionEn: 'Open Version History & Time Machine',
      actionId: 'Buka Riwayat Versi & Time Machine',
      tooltipEn: 'View historical document snapshots, compare changes word-by-word, and restore previous versions.',
      tooltipId: 'Melihat snapshot naskah sebelumnya, membandingkan teks kata-per-kata, dan memulihkan draf terdahulu.',
      category: 'global',
    },
    {
      keys: ['Ctrl', 'Shift', 'D'],
      actionEn: 'Toggle Dark / Light Mode',
      actionId: 'Ganti Tema Gelap / Terang',
      tooltipEn: 'Instantly toggle between high-contrast dark mode and clean daylight theme.',
      tooltipId: 'Beralih instan antara mode gelap untuk kenyamanan mata dan mode terang yang jernih.',
      category: 'global',
    },
    {
      keys: ['Ctrl', 'Shift', 'E'],
      actionEn: 'Conference & Thesis Defense Slide Deck',
      actionId: 'Generator Slide Sidang & Konferensi',
      tooltipEn: 'Synthesize manuscript sections into 16:9 defense slides, standalone HTML deck, and Marp markdown.',
      tooltipId: 'Sintesis naskah menjadi slide sidang 16:9, berkas penampil HTML offline, dan format Marp.',
      category: 'global',
    },

    // AI & Reviewer
    {
      keys: ['Ctrl', 'Shift', 'R'],
      actionEn: 'Simulate Reviewer #2 Audit',
      actionId: 'Simulasi Audit Reviewer #2',
      tooltipEn: 'Perform harsh peer review simulation evaluating methodology, novelty, and citation gaps.',
      tooltipId: 'Lakukan simulasi peer review kritis yang mengevaluasi kelemahan metodologi, kebaruan, dan sitasi.',
      category: 'ai',
    },
    {
      keys: ['Ctrl', 'Shift', 'I'],
      actionEn: 'Academic Integrity Barometer',
      actionId: 'Barometer Integritas & Deteksi AI',
      tooltipEn: 'Inspect real-time originality speedometer, burstiness variance, and AI cliché density.',
      tooltipId: 'Periksa speedometer orisinalitas naskah real-time, variasi burstiness, dan kata klise AI.',
      category: 'ai',
    },
    {
      keys: ['Ctrl', 'Shift', 'L'],
      actionEn: 'Academic Grammar & Style Linter',
      actionId: 'Linter Gaya Bahasa & Formalitas Akademik',
      tooltipEn: 'Scan paper for informal words, contractions, vague claims, and first-person bias.',
      tooltipId: 'Pindai naskah untuk mendeteksi kata non-formal, singkatan, klaim tanpa data, dan bias persona.',
      category: 'ai',
    },
    {
      keys: ['Ctrl', 'Shift', 'G'],
      actionEn: 'Toggle Ghostwriter Copilot',
      actionId: 'Toggle Ghostwriter AI Prediktif',
      tooltipEn: 'Turn on/off inline predictive sentence completion while typing.',
      tooltipId: 'Aktifkan atau matikan saran kalimat akademis abu-abu prediktif saat mengetik naskah.',
      category: 'ai',
    },
    {
      keys: ['Ctrl', 'Shift', 'S'],
      actionEn: 'Toggle Track Changes (Suggesting Mode)',
      actionId: 'Toggle Mode Sugesti / Track Changes',
      tooltipEn: 'Switch between direct editing and proposing tracked edits with red strikethrough & green underline.',
      tooltipId: 'Beralih antara mode sunting langsung dan mode saran dengan coretan merah & garis bawah hijau.',
      category: 'ai',
    },
    {
      keys: ['Tab'],
      actionEn: 'Accept Ghostwriter Suggestion',
      actionId: 'Terima Saran Kalimat Ghostwriter',
      tooltipEn: 'Inserts the active gray predicted sentence completion directly into your paragraph.',
      tooltipId: 'Memasukkan saran kalimat prediktif abu-abu langsung ke paragraf naskah Anda.',
      category: 'ai',
    },

    // Citations & Literature
    {
      keys: ['Ctrl', 'Shift', 'U'],
      actionEn: 'Import Reference File (.bib, .ris, .pdf)',
      actionId: 'Impor Berkas Referensi (.bib, .ris, .pdf)',
      tooltipEn: 'Drag & drop or upload BibTeX, RIS, or PDF files to auto-populate library citations.',
      tooltipId: 'Tarik & lepas atau unggah file BibTeX, RIS, atau PDF untuk otomatis mengisi sitasi perpustakaan naskah.',
      category: 'citations',
    },
    {
      keys: ['Ctrl', 'Shift', 'C'],
      actionEn: 'Search & Insert Citations',
      actionId: 'Cari & Sisipkan Sitasi',
      tooltipEn: 'Query Crossref and OpenAlex bibliographic databases by paper title or author.',
      tooltipId: 'Cari database Crossref dan OpenAlex berdasarkan judul paper atau nama penulis.',
      category: 'citations',
    },
    {
      keys: ['Ctrl', 'Shift', 'P'],
      actionEn: 'Chat with Paper / Literature Q&A',
      actionId: 'Tanya Paper / Literature Q&A',
      tooltipEn: 'Interactive dialogue to interrogate findings, methodology, and limitations of library references.',
      tooltipId: 'Dialog interaktif untuk menggali temuan, metodologi, dan batasan paper referensi di perpustakaan.',
      category: 'citations',
    },
    {
      keys: ['@cite:', 'or', '@'],
      actionEn: 'Smart In-Text Reference Mention',
      actionId: 'Panggil Sitasi Cepat (@cite / @)',
      tooltipEn: 'Type @cite: or @ while typing to search library references and insert formatted in-text citations instantly.',
      tooltipId: 'Ketik @cite: atau @ saat menulis untuk mencari referensi pustaka dan menyisipkan sitasi ilmiah secara instan.',
      category: 'citations',
    },

    // Editor Formatting & Math
    {
      keys: ['Ctrl', 'Shift', 'O'],
      actionEn: 'Academic Outline & Scaffolding Generator',
      actionId: 'Generator Kerangka & Struktur Naskah Ilmiah',
      tooltipEn: 'Generates standardized publication structures (IMRaD, 5-Chapter Thesis) with guiding research prompts.',
      tooltipId: 'Menyusun kerangka naskah baku (IMRaD, Skripsi 5 Bab) lengkap dengan takarir panduan riset interaktif.',
      category: 'editor',
    },
    {
      keys: ['Ctrl', 'Shift', 'M'],
      actionEn: 'Thesis Project Binder & Multi-Chapter Hub',
      actionId: 'Pengikat Naskah Skripsi & Bab Terpadu',
      tooltipEn: 'Manage multi-chapter thesis, cross-chapter continuous figure/table numbering, and consolidated master bibliography.',
      tooltipId: 'Kelola skripsi multi-bab (Bab 1 s.d. Bab 5), penomoran gambar berkesinambungan, dan daftar pustaka terpadu.',
      category: 'editor',
    },
    {
      keys: ['Ctrl', 'Shift', 'B'],
      actionEn: 'Insert Figure / Table Cross-Reference',
      actionId: 'Sisipkan Rujukan Gambar / Tabel',
      tooltipEn: 'Opens cross-reference picker to cite figures or tables with auto-numbering (@fig, @tab).',
      tooltipId: 'Buka pemilih rujukan silang untuk mengutip gambar atau tabel dengan penomoran otomatis (@fig, @tab).',
      category: 'citations',
    },
    {
      keys: ['Ctrl', 'M'],
      actionEn: 'Insert LaTeX Math Formula',
      actionId: 'Sisipkan Rumus Matematika LaTeX',
      tooltipEn: 'Opens the KaTeX math formula composer for equations, matrices, and scientific symbols.',
      tooltipId: 'Membuka editor rumus matematika KaTeX untuk persamaan, matriks, dan simbol ilmiah.',
      category: 'editor',
    },
    {
      keys: ['Ctrl', 'B'],
      actionEn: 'Bold Text',
      actionId: 'Teks Tebal (Bold)',
      tooltipEn: 'Toggles bold emphasis on currently selected text.',
      tooltipId: 'Membuat teks yang dipilih menjadi tebal.',
      category: 'editor',
    },
    {
      keys: ['Ctrl', 'I'],
      actionEn: 'Italic Text',
      actionId: 'Teks Miring (Italic)',
      tooltipEn: 'Toggles italic emphasis (useful for scientific Latin terms and variables).',
      tooltipId: 'Membuat teks miring (berguna untuk istilah latin dan variabel matematika).',
      category: 'editor',
    },
    {
      keys: ['Ctrl', 'Z'],
      actionEn: 'Undo Last Action',
      actionId: 'Batalkan Aksi Terakhir (Undo)',
      tooltipEn: 'Reverts your most recent edit or block change in the document.',
      tooltipId: 'Membatalkan perubahan teks atau blok paling terakhir di naskah.',
      category: 'editor',
    },
    {
      keys: ['Ctrl', 'Y'],
      actionEn: 'Redo Action',
      actionId: 'Ulangi Aksi (Redo)',
      tooltipEn: 'Reapplies previously undone changes.',
      tooltipId: 'Menerapkan kembali perubahan naskah yang sebelumnya dibatalkan.',
      category: 'editor',
    },
  ];

  const filteredShortcuts = shortcuts.filter((sc) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      sc.keys.some((k) => k.toLowerCase().includes(q)) ||
      sc.actionEn.toLowerCase().includes(q) ||
      sc.actionId.toLowerCase().includes(q) ||
      sc.tooltipEn.toLowerCase().includes(q) ||
      sc.tooltipId.toLowerCase().includes(q)
    );
  });

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]"
        role="dialog"
        aria-modal="true"
        aria-label={isEn ? 'Keyboard Shortcuts Cheat Sheet' : 'Daftar Pintasan Keyboard'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-400">
              <IconKeyboard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {isEn ? 'Keyboard Shortcuts Cheat Sheet' : 'Panduan Pintasan Keyboard'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isEn
                  ? 'Master these keybindings to supercharge your writing velocity'
                  : 'Gunakan tombol pintasan untuk mempercepat penulisan naskah Anda'}
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

        {/* Search Bar */}
        <div className="px-6 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2.5">
          <IconSearch className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEn ? 'Filter shortcuts (e.g. Ctrl, Reviewer, Math)...' : 'Cari pintasan (misal: Ctrl, Reviewer, Rumus)...'}
            className="w-full bg-transparent text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <IconX className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Shortcuts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 thin-scroll">
          {filteredShortcuts.map((sc, i) => (
            <div
              key={i}
              className="group flex items-start justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 hover:border-indigo-200/60 dark:hover:border-indigo-800/50 transition-colors"
              title={isEn ? sc.tooltipEn : sc.tooltipId}
            >
              <div className="min-w-0 pr-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isEn ? sc.actionEn : sc.actionId}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                  {isEn ? sc.tooltipEn : sc.tooltipId}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0 pt-0.5">
                {sc.keys.map((k, ki) => (
                  <kbd
                    key={ki}
                    className="px-2 py-1 text-[11px] font-mono font-bold rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-50/80 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <IconCommand className="h-3.5 w-3.5 text-indigo-500" />
            <span>{isEn ? 'Press Ctrl+K anytime for instant Spotlight search' : 'Tekan Ctrl+K kapan saja untuk pencarian Spotlight instan'}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-md bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition cursor-pointer"
          >
            {isEn ? 'Got it' : 'Tutup'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
