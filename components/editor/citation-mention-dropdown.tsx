// components/editor/citation-mention-dropdown.tsx
// Phase 32: Floating In-Text Mention Overlay Dropdown Component

'use client';

import React, { useEffect, useRef } from 'react';
import { 
  IconBook, 
  IconWorld, 
  IconCornerDownLeft, 
  IconSparkles,
  IconLoader2,
  IconX
} from '@tabler/icons-react';
import type { ScoredReferenceCandidate } from '@/lib/editor/reference-search-index';
import type { CaretCoordinates } from '@/lib/editor/mention-parser';

export interface CitationMentionDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  coordinates: CaretCoordinates | null;
  query: string;
  candidates: ScoredReferenceCandidate[];
  selectedIndex: number;
  onSelectCandidate: (candidate: ScoredReferenceCandidate) => void;
  onSearchGlobal?: () => void;
  isLoading?: boolean;
  language: 'en' | 'id';
}

export function CitationMentionDropdown({
  isOpen,
  onClose,
  coordinates,
  query,
  candidates,
  selectedIndex,
  onSelectCandidate,
  onSearchGlobal,
  isLoading = false,
  language = 'en',
}: CitationMentionDropdownProps) {
  const isEn = language === 'en';
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-mention-item="true"]');
    if (items[selectedIndex]) {
      items[selectedIndex].scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen || !coordinates) {
    return null;
  }

  // Position calculation (ensure it doesn't overflow viewport edges)
  const top = Math.min(coordinates.bottom + 6, window.innerHeight - 320);
  const left = Math.min(Math.max(coordinates.left, 16), window.innerWidth - 380);

  return (
    <div
      style={{ top: `${top}px`, left: `${left}px` }}
      className="fixed z-50 w-80 sm:w-96 max-h-80 flex flex-col bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 animate-scale-in"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
          <IconBook className="w-3.5 h-3.5" />
          <span>{isEn ? 'Insert In-Text Citation' : 'Sisipkan Sitasi Ilmiah'}</span>
          {query && (
            <span className="text-slate-400 font-normal">
              "{query}"
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          {isLoading && <IconLoader2 className="w-3 h-3 animate-spin text-indigo-500" />}
          <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">Esc</kbd>
        </div>
      </div>

      {/* Candidate List */}
      <div ref={listRef} className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1">
        {candidates.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400 space-y-2">
            <p>{isEn ? 'No local reference matches found.' : 'Tidak ada referensi lokal yang cocok.'}</p>
            {onSearchGlobal && (
              <button
                type="button"
                onClick={onSearchGlobal}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors font-semibold"
              >
                <IconWorld className="w-3.5 h-3.5" />
                {isEn ? 'Search Crossref & OpenAlex' : 'Cari di Crossref & OpenAlex'}
              </button>
            )}
          </div>
        ) : (
          candidates.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            const cand = item.candidate;
            const firstAuthor = cand.authors?.[0] || 'Unknown Author';
            const authorText = cand.authors && cand.authors.length > 1 
              ? `${firstAuthor} et al.` 
              : firstAuthor;

            return (
              <div
                key={cand.reference_id || idx}
                data-mention-item="true"
                onClick={() => onSelectCandidate(item)}
                className={`p-2.5 rounded-lg cursor-pointer transition-all text-left ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-100 ring-1 ring-indigo-500/30'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-bold text-xs truncate">
                      {authorText}
                    </span>
                    {cand.year && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                        {cand.year}
                      </span>
                    )}
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider shrink-0 ${
                    item.sourceType === 'local_library'
                      ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                      : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {item.sourceType === 'local_library' ? (isEn ? 'Library' : 'Pustaka') : 'Global'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {cand.title}
                </p>

                {cand.journal && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-0.5 truncate">
                    {cand.journal}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer shortcut tips */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <kbd className="px-1 rounded bg-slate-200 dark:bg-slate-700">↑↓</kbd>
          {isEn ? 'Navigate' : 'Pilih'}
        </span>
        <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
          <kbd className="px-1 rounded bg-slate-200 dark:bg-slate-700">↵ Enter</kbd>
          {isEn ? 'Insert' : 'Sisipkan'}
        </span>
      </div>
    </div>
  );
}
