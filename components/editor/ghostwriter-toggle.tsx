// components/editor/ghostwriter-toggle.tsx
'use client';

import React from 'react';
import { IconWand, IconSparkles } from '@tabler/icons-react';

export interface GhostwriterToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  language?: string;
  className?: string;
}

export function GhostwriterToggle({
  isEnabled,
  onToggle,
  isLoading = false,
  language = 'id',
  className = '',
}: GhostwriterToggleProps) {
  const isEn = language === 'en';

  return (
    <button
      type="button"
      onClick={onToggle}
      title={
        isEn
          ? `AI Ghostwriter Autocomplete (Tab to Accept) - Shortcut: Ctrl+J`
          : `AI Ghostwriter Autocomplete (Tab untuk Terapkan) - Shortcut: Ctrl+J`
      }
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer select-none border ${
        isEnabled
          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 shadow-xs'
          : 'bg-slate-100/70 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-700'
      } ${className}`}
    >
      {isLoading ? (
        <IconSparkles className="h-3.5 w-3.5 animate-spin text-indigo-500" />
      ) : isEnabled ? (
        <IconWand className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
      ) : (
        <IconWand className="h-3.5 w-3.5 text-slate-400" />
      )}
      <span className="hidden sm:inline">
        {isEn ? 'Ghostwriter:' : 'Ghostwriter:'}
      </span>
      <span
        className={`font-mono text-[10px] font-bold px-1 py-0.2 rounded ${
          isEnabled
            ? 'bg-indigo-200/70 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200'
            : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
        }`}
      >
        {isEnabled ? (isEn ? 'ON' : 'AKTIF') : (isEn ? 'OFF' : 'MATI')}
      </span>
    </button>
  );
}
