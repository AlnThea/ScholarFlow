import React from 'react';
import { createPortal } from 'react-dom';

type MathModalProps = {
  isOpen: boolean;
  onClose: () => void;
  mathFormulaInput: string;
  setMathFormulaInput: (val: string) => void;
  onConfirm: () => void;
  isEditing: boolean;
};

export const MathModal = ({
  isOpen,
  onClose,
  mathFormulaInput,
  setMathFormulaInput,
  onConfirm,
  isEditing,
}: MathModalProps) => {
  if (!isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xl w-full max-w-md flex flex-col gap-5 animate-scale-in text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-extrabold text-slate-800">
            {isEditing ? 'Edit Rumus Matematika (LaTeX)' : 'Sisipkan Rumus Matematika (LaTeX)'}
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

        <div className="flex flex-col gap-3">
          <p className="text-xs text-slate-500 leading-relaxed">
            Masukkan kode LaTeX untuk rumus matematika yang ingin disisipkan (seperti: <code>{`\\frac{a}{b}`}</code> atau <code>{`\\sum x^2`}</code>).
          </p>
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Formula LaTeX</label>
            <input
              type="text"
              placeholder="E = mc^2"
              value={mathFormulaInput}
              onChange={(e) => setMathFormulaInput(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onConfirm();
                }
              }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={!mathFormulaInput.trim()}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          >
            {isEditing ? 'Simpan Perubahan' : 'Sisipkan Rumus'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
