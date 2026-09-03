import React from 'react';
import { createPortal } from 'react-dom';

export type AlertModalState = {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  isConfirm?: boolean;
  confirmText?: string;
  onConfirm?: () => void;
} | null;

type AlertModalProps = {
  state: AlertModalState;
  onClose: () => void;
};

export const AlertModal = ({ state, onClose }: AlertModalProps) => {
  if (!state || !state.isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[10100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xl w-full max-w-md flex flex-col gap-4 animate-scale-in text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl text-lg font-bold ${state.type === 'success'
              ? 'bg-emerald-100 text-emerald-700'
              : state.type === 'error'
                ? 'bg-rose-100 text-rose-700'
                : state.type === 'warning'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-indigo-100 text-indigo-700'
              }`}>
              {state.type === 'success' ? '✅' : state.type === 'error' ? '❌' : state.type === 'warning' ? '⚠️' : 'ℹ️'}
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-slate-900">
                {state.title}
              </h3>
              <span className="text-[10px] text-slate-400">
                ScholarFlow Admin System
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Message Body */}
        <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line font-medium p-1">
          {state.message}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          {state.isConfirm && (
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
          )}
          <button
            onClick={() => {
              if (state.onConfirm) {
                state.onConfirm();
              }
              onClose();
            }}
            className={`px-6 py-2 min-w-[84px] text-center text-white text-xs font-extrabold rounded-xl shadow-md transition duration-200 cursor-pointer ${state.type === 'success'
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
              : state.type === 'error'
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                : state.type === 'warning'
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
              }`}
          >
            {state.confirmText || 'OK'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
