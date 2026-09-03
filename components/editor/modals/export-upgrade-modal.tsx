import React from 'react';
import { createPortal } from 'react-dom';
import { IconDatabase } from '@tabler/icons-react';

type ExportUpgradeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  language: 'id' | 'en';
};

export const ExportUpgradeModal = ({
  isOpen,
  onClose,
  onUpgrade,
  language,
}: ExportUpgradeModalProps) => {
  if (!isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xl w-full max-w-md flex flex-col gap-5 animate-scale-in text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <span>🔒</span>
            {language === 'en' ? 'Pro Feature Locked' : 'Fitur Pro Terkunci'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:bg-slate-100/80 hover:text-slate-650 transition cursor-pointer"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-center py-4 bg-indigo-50/50 rounded-xl border border-indigo-100/40 text-indigo-600">
            <IconDatabase className="h-12 w-12" />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed text-center">
            {language === 'en'
              ? 'Bibliography Export (.bib, .ris, .txt, .json) is exclusive to Pro Writer plans. Upgrade now to seamlessly export your references for Mendeley, Zotero, or LaTeX.'
              : 'Fitur Ekspor Daftar Pustaka (.bib, .ris, .txt, .json) khusus untuk pengguna paket Pro Writer. Upgrade akun Anda untuk mengekspor referensi secara instan untuk Mendeley, Zotero, atau LaTeX.'}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 transition cursor-pointer"
          >
            {language === 'en' ? 'Close' : 'Tutup'}
          </button>
          <button
            onClick={() => {
              onClose();
              onUpgrade();
            }}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer shadow-sm shadow-indigo-200"
          >
            {language === 'en' ? 'See Pricing / Upgrade' : 'Lihat Paket & Upgrade'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
