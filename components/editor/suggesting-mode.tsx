import React, { useState } from 'react';
import {
  IconCheck,
  IconX,
  IconSparkles,
  IconEdit,
  IconChevronDown,
  IconChecklist,
  IconHistory
} from '@tabler/icons-react';

export type SuggestingModeControlProps = {
  editorMode: 'edit' | 'suggest';
  setEditorMode: (mode: 'edit' | 'suggest') => void;
  pendingCount?: number;
  onBatchAcceptAll?: () => void;
  onBatchRejectAll?: () => void;
  language?: 'en' | 'id';
  className?: string;
};

export const SuggestingModeControl = ({
  editorMode,
  setEditorMode,
  pendingCount = 0,
  onBatchAcceptAll,
  onBatchRejectAll,
  language = 'id',
  className = '',
}: SuggestingModeControlProps) => {
  const [showBatchDropdown, setShowBatchDropdown] = useState(false);
  const isEn = language === 'en';

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
      {/* Segmented Mode Button */}
      <div
        data-tour="toolbar-modes"
        className="inline-flex items-center rounded-lg bg-slate-100/90 dark:bg-slate-800/90 p-0.5 border border-slate-200/80 dark:border-slate-700 shadow-xs"
      >
        <button
          type="button"
          onClick={() => setEditorMode('edit')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
            editorMode === 'edit'
              ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs ring-1 ring-slate-200/50 dark:ring-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title={isEn ? 'Direct Edit Mode (Normal typing)' : 'Mode Edit Langsung (Mengetik biasa)'}
        >
          <IconEdit className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
          <span className="hidden sm:inline">
            {isEn ? 'Editing' : 'Sunting'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setEditorMode('suggest')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
            editorMode === 'suggest'
              ? 'bg-amber-500 text-white shadow-xs ring-1 ring-amber-600'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title={isEn ? 'Suggesting Mode (Track Changes)' : 'Mode Sugesti (Lacak Perubahan)'}
        >
          <IconSparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">
            {isEn ? 'Suggesting' : 'Menyarankan'}
          </span>
          {pendingCount > 0 && (
            <span
              className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                editorMode === 'suggest'
                  ? 'bg-amber-700 text-white'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
              }`}
            >
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Batch Actions Dropdown (Only visible if there are pending suggestions) */}
      {pendingCount > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowBatchDropdown(!showBatchDropdown)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border border-amber-300 dark:border-amber-700/70 bg-amber-50/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition shadow-xs cursor-pointer"
            title={isEn ? 'Batch suggestion actions' : 'Tindakan usulan massal'}
          >
            <IconChecklist className="h-3.5 w-3.5" />
            <span className="hidden md:inline">
              {isEn ? 'Review All' : 'Tinjau Semua'}
            </span>
            <IconChevronDown className="h-3 w-3" />
          </button>

          {showBatchDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowBatchDropdown(false)}
              />
              <div className="absolute right-0 mt-1 w-52 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-1">
                  {isEn ? `${pendingCount} Suggestions Pending` : `${pendingCount} Usulan Tertunda`}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowBatchDropdown(false);
                    onBatchAcceptAll?.();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition cursor-pointer font-medium"
                >
                  <IconCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{isEn ? 'Accept All Suggestions' : 'Terima Semua Usulan'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowBatchDropdown(false);
                    onBatchRejectAll?.();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer font-medium"
                >
                  <IconX className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  <span>{isEn ? 'Reject All Suggestions' : 'Tolak Semua Usulan'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
