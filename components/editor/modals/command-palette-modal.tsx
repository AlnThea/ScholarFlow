// components/editor/modals/command-palette-modal.tsx
// Academic Command Palette (Ctrl+K) with Interactive Tooltip & Explanation Preview (Phase 26)

'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  IconSearch,
  IconSparkles,
  IconBrain,
  IconMicroscope,
  IconQuote,
  IconCirclePlus,
  IconFileText,
  IconHistory,
  IconSettings,
  IconX,
  IconKeyboard,
  IconCornerDownLeft,
  IconInfoCircle,
  IconShieldCheck,
  IconArrowRight,
  IconHelpCircle
} from '@tabler/icons-react';
import {
  type CommandItem,
  type CommandCategory,
  COMMAND_CATEGORIES,
  getAvailableCommands,
  filterCommands
} from '@/lib/editor/command-palette';

export interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'id';
  onExecuteCommand: (actionId: string) => void;
}

export function CommandPaletteModal({
  isOpen,
  onClose,
  language,
  onExecuteCommand,
}: CommandPaletteModalProps) {
  const isEn = language === 'en';
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CommandCategory | 'all'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hoveredCommandId, setHoveredCommandId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const allCommands = useMemo(() => {
    return getAvailableCommands(language);
  }, [language]);

  const filteredCommands = useMemo(() => {
    return filterCommands(allCommands, searchQuery, activeCategory);
  }, [allCommands, searchQuery, activeCategory]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, activeCategory]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setActiveCategory('all');
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Keyboard navigation inside palette (ArrowUp, ArrowDown, Enter, Esc)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (filteredCommands.length > 0 ? (prev + 1) % filteredCommands.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredCommands.length > 0 ? (prev - 1 + filteredCommands.length) % filteredCommands.length : 0
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          const cmd = filteredCommands[selectedIndex];
          onExecuteCommand(cmd.actionId);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onExecuteCommand, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current && filteredCommands.length > 0) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex, filteredCommands.length]);

  if (!mounted || !isOpen) return null;

  // Active command focused for the explanation panel
  const activeCommand =
    (hoveredCommandId ? allCommands.find((c) => c.id === hoveredCommandId) : null) ||
    filteredCommands[selectedIndex] ||
    null;

  const renderCategoryIcon = (category: CommandCategory) => {
    switch (category) {
      case 'ai':
        return <IconBrain className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case 'review':
        return <IconMicroscope className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
      case 'citations':
        return <IconQuote className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case 'insert':
        return <IconCirclePlus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'formatting':
        return <IconFileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
      case 'navigation':
        return <IconHistory className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'system':
      default:
        return <IconSettings className="h-4 w-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      {/* Backdrop click */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[82vh] transition-all"
        role="dialog"
        aria-modal="true"
        aria-label={isEn ? 'Academic Command Palette' : 'Palet Perintah Akademis'}
      >
        {/* Header & Search Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 gap-3">
          <IconSearch className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isEn
                ? 'Type a command, tool, or keyword (e.g. Reviewer, APA, Math, Cite)...'
                : 'Ketik perintah, alat, atau kata kunci (misal: Reviewer, APA, Rumus, Sitasi)...'
            }
            className="w-full bg-transparent text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
              title={isEn ? 'Clear search' : 'Hapus pencarian'}
            >
              <IconX className="h-4 w-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-800 rounded-md border border-slate-300/50 dark:border-slate-700">
            ESC {isEn ? 'to close' : 'tutup'}
          </span>
        </div>

        {/* Category Pills Filter Bar */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto thin-scroll">
          {COMMAND_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-750'
                }`}
              >
                <span>{isEn ? cat.labelEn : cat.labelId}</span>
              </button>
            );
          })}
        </div>

        {/* Command List Results */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100/60 dark:divide-slate-800/60 thin-scroll min-h-[220px] max-h-[360px]"
        >
          {filteredCommands.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <IconInfoCircle className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isEn ? 'No commands found' : 'Perintah tidak ditemukan'}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                {isEn
                  ? `Try searching for "cite", "reviewer", "ghostwriter", or "apa"`
                  : `Coba cari "sitasi", "reviewer", "ghostwriter", atau "apa"`}
              </p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    onExecuteCommand(cmd.actionId);
                    onClose();
                  }}
                  onMouseEnter={() => {
                    setSelectedIndex(idx);
                    setHoveredCommandId(cmd.id);
                  }}
                  onMouseLeave={() => setHoveredCommandId(null)}
                  className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-50/90 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-100 border border-indigo-200/70 dark:border-indigo-800/60 shadow-xs'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 border border-transparent'
                  }`}
                  title={cmd.tooltip}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`p-2 rounded-lg shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-indigo-100 dark:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                      }`}
                    >
                      {renderCategoryIcon(cmd.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">
                          {cmd.title}
                        </span>
                        {cmd.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300/40 dark:border-slate-700">
                            {cmd.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {cmd.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {cmd.shortcut && (
                      <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
                        {cmd.shortcut}
                      </kbd>
                    )}
                    {isSelected && (
                      <span className="p-1 rounded text-indigo-600 dark:text-indigo-400">
                        <IconCornerDownLeft className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Active Command Tooltip & Deep Explanation Preview Drawer */}
        {activeCommand && (
          <div className="border-t border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-indigo-50/20 to-white dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 px-4 py-3 animate-fade-in">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 p-1 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 shrink-0">
                <IconInfoCircle className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {isEn ? 'Selected Action Tooltip & Explanation' : 'Penjelasan & Manfaat Aksi yang Dipilih'}
                  </span>
                  {activeCommand.shortcut && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      {isEn ? 'Shortcut:' : 'Pintasan:'} {activeCommand.shortcut}
                    </span>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                  {activeCommand.tooltip}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Quick Keys Help */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-100/70 dark:bg-slate-950/80 border-t border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono">↑</kbd>
              <kbd className="px-1 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono">↓</kbd>
              <span>{isEn ? 'to navigate' : 'navigasi'}</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono">Enter</kbd>
              <span>{isEn ? 'to select' : 'pilih'}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
            <IconKeyboard className="h-3.5 w-3.5" />
            <span>ScholarFlow Spotlight v1.1</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
