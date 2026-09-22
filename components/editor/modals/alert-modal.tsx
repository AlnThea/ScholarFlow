import React from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/components/i18n/language-context';

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
  const { language } = useLanguage();
  const isEn = language === 'en';

  if (!state || !state.isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[10100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xl w-full max-w-md flex flex-col gap-4 animate-scale-in text-slate-800 dark:bg-slate-900 dark:border-slate-700/80 dark:text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl text-lg font-bold ${state.type === 'success'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : state.type === 'error'
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                : state.type === 'warning'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
              }`}>
              {state.type === 'success' ? '✅' : state.type === 'error' ? '❌' : state.type === 'warning' ? '⚠️' : 'ℹ️'}
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {state.title}
              </h3>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                ScholarFlow Admin System
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Message Body */}
        <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line font-medium p-1">
          {state.message}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
          {state.isConfirm && (
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              {isEn ? 'Cancel' : 'Batal'}
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
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 dark:shadow-none'
              : state.type === 'error'
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200 dark:shadow-none'
                : state.type === 'warning'
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200 dark:shadow-none'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none'
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
