// components/editor/ghostwriter-suggestion.tsx
'use client';

import React from 'react';
import { IconSparkles, IconX, IconCheck, IconCornerDownLeft } from '@tabler/icons-react';

export interface GhostwriterSuggestionProps {
  suggestion: string | null;
  isLoading: boolean;
  coords: { top: number; left: number } | null;
  onAccept: () => void;
  onDismiss: () => void;
  language?: string;
}

export function GhostwriterSuggestion({
  suggestion,
  isLoading,
  coords,
  onAccept,
  onDismiss,
  language = 'id',
}: GhostwriterSuggestionProps) {
  const isEn = language === 'en';

  if (!coords) return null;

  // Loading indicator pill near cursor
  if (isLoading && !suggestion) {
    return (
      <div
        style={{
          position: 'absolute',
          top: `${coords.top + 6}px`,
          left: `${coords.left}px`,
        }}
        className="z-50 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 border border-indigo-200 dark:border-indigo-800/80 shadow-md backdrop-blur-xs animate-fade-in text-[11px] font-medium text-indigo-600 dark:text-indigo-400"
      >
        <IconSparkles className="h-3 w-3 animate-spin text-indigo-500" />
        <span className="animate-pulse">{isEn ? 'Predicting scholarly flow...' : 'Memprediksi alur tulisan...'}</span>
      </div>
    );
  }

  if (!suggestion) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: `${coords.top + 8}px`,
        left: `${Math.min(coords.left, typeof window !== 'undefined' ? window.innerWidth - 380 : coords.left)}px`,
      }}
      className="z-50 flex flex-col gap-2 p-3 bg-white/95 dark:bg-slate-900/95 border border-indigo-200/90 dark:border-indigo-800/80 rounded-2xl shadow-xl backdrop-blur-md max-w-sm sm:max-w-md animate-scale-in text-slate-800 dark:text-slate-100"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <IconSparkles className="h-3.5 w-3.5 animate-pulse" />
          </div>
          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            {isEn ? 'Ghostwriter Suggestion' : 'Saran Kelanjutan AI'}
          </span>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          title={isEn ? 'Dismiss (Esc)' : 'Abaikan (Esc)'}
        >
          <IconX className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Suggested Text Preview */}
      <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 italic leading-relaxed font-serif pl-1 border-l-2 border-indigo-500/60 dark:border-indigo-400/60 py-0.5">
        "{suggestion.trim()}"
      </div>

      {/* Action Keys Bar */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAccept}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-xs cursor-pointer"
          >
            <kbd className="px-1 py-0.2 rounded bg-indigo-500/80 text-[9px] font-mono">Tab</kbd>
            <span>{isEn ? 'Accept' : 'Terapkan'}</span>
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition cursor-pointer"
          >
            <kbd className="px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-[9px] font-mono">Esc</kbd>
            <span>{isEn ? 'Dismiss' : 'Abaikan'}</span>
          </button>
        </div>

        <span className="hidden sm:inline text-slate-400 dark:text-slate-500 font-mono text-[9px]">
          ScholarFlow Copilot
        </span>
      </div>
    </div>
  );
}
