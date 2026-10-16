// components/editor/citation-style-selector.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  IconQuote,
  IconChevronDown,
  IconCheck,
  IconSparkles,
  IconHash,
  IconCalendar,
} from '@tabler/icons-react';
import {
  SUPPORTED_CITATION_STYLES,
  CitationStyleOption,
  CitationStyleType,
} from '@/lib/editor/citation-transformer';

interface CitationStyleSelectorProps {
  currentStyle: string;
  onChangeStyle: (style: CitationStyleType) => void;
  language: 'en' | 'id';
  compact?: boolean;
}

export function CitationStyleSelector({
  currentStyle = 'apa',
  onChangeStyle,
  language = 'en',
  compact = false,
}: CitationStyleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isEn = language === 'en';
  const cleanCurrentStyle = (currentStyle || 'apa').toLowerCase() as CitationStyleType;

  const currentOption =
    SUPPORTED_CITATION_STYLES.find((s) => s.id === cleanCurrentStyle) ||
    SUPPORTED_CITATION_STYLES[0];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: CitationStyleOption) => {
    setIsOpen(false);
    if (option.id !== cleanCurrentStyle) {
      onChangeStyle(option.id);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white font-medium text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 ${
          compact ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-xs'
        }`}
        title={isEn ? 'Change Citation Style & Auto-reindex' : 'Ubah Gaya Sitasi & Re-index Otomatis'}
      >
        <IconQuote className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
        <span className="font-semibold">{currentOption.label.split(' ')[0]}</span>
        <span className="rounded bg-slate-100 px-1 py-0.2 text-[10px] font-mono text-slate-500 dark:bg-slate-700 dark:text-slate-300">
          {currentOption.sample}
        </span>
        <IconChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-1.5 w-72 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100 dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {isEn ? 'Citation Style Transformer' : 'Transformasi Format Sitasi'}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <IconSparkles className="h-2.5 w-2.5" /> Reactive
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {isEn
                ? 'Automatically converts in-text tags & re-indexes bibliography.'
                : 'Otomatis mengubah tag sitasi & menata ulang daftar pustaka.'}
            </p>
          </div>

          <div className="max-h-72 overflow-y-auto p-1 space-y-1">
            {SUPPORTED_CITATION_STYLES.map((style) => {
              const isSelected = style.id === cleanCurrentStyle;

              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => handleSelect(style)}
                  className={`w-full rounded-lg p-2 text-left transition cursor-pointer flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-indigo-50/80 text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {style.category === 'numeric' ? (
                        <IconHash className="h-3 w-3 text-emerald-500 shrink-0" />
                      ) : (
                        <IconCalendar className="h-3 w-3 text-indigo-500 shrink-0" />
                      )}
                      <span className="text-xs font-bold leading-none">{style.label}</span>
                      <span className="rounded bg-slate-100 px-1 py-0.2 text-[9px] font-mono text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                        {style.sample}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                      {style.description[language] || style.description.en}
                    </p>
                  </div>

                  {isSelected && (
                    <IconCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
