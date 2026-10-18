'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  IconX,
  IconPresentation,
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconCopy,
  IconCheck,
  IconNotes,
  IconSparkles,
  IconMaximize,
  IconClock,
  IconPalette,
  IconLayersLinked
} from '@tabler/icons-react';
import {
  generateAcademicSlideDeck,
  exportToMarpMarkdown,
  exportToStandaloneHtml,
  SlideDeckProject,
  SlideItem,
} from '@/lib/editor/slide-deck-generator';

interface SlideDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  editorBlocks: any[];
  documentTitle?: string;
  authorName?: string;
  institutionName?: string;
  language?: 'en' | 'id';
}

export const SlideDeckModal: React.FC<SlideDeckModalProps> = ({
  isOpen,
  onClose,
  editorBlocks,
  documentTitle = 'Academic Research Defense',
  authorName,
  institutionName,
  language = 'id',
}) => {
  const isEn = language === 'en';

  const [activeTheme, setActiveTheme] = useState<'academic-modern' | 'classic-navy' | 'minimal-emerald'>('academic-modern');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(true);
  const [copiedMarp, setCopiedMarp] = useState(false);

  // Generate slide deck project from blocks
  const deck: SlideDeckProject = useMemo(() => {
    return generateAcademicSlideDeck(editorBlocks, documentTitle, {
      authorName,
      institutionName,
      language,
      templateTheme: activeTheme,
    });
  }, [editorBlocks, documentTitle, authorName, institutionName, language, activeTheme]);

  const activeSlide: SlideItem | undefined = deck.slides[currentSlideIndex] || deck.slides[0];

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentSlideIndex((prev) => Math.min(prev + 1, deck.slides.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, deck.slides.length, onClose]);

  if (!isOpen) return null;

  const handleCopyMarp = async () => {
    const marp = exportToMarpMarkdown(deck);
    await navigator.clipboard.writeText(marp);
    setCopiedMarp(true);
    setTimeout(() => setCopiedMarp(false), 2200);
  };

  const handleDownloadHtml = () => {
    const html = exportToStandaloneHtml(deck);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(documentTitle || 'defense-slides').toLowerCase().replace(/\s+/g, '-')}-slides.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Color theme definitions for active preview
  const themeClasses = {
    'academic-modern': {
      card: 'bg-slate-900 border-indigo-500/30 text-white',
      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      title: 'text-white',
      bullet: 'text-indigo-400',
      notes: 'bg-indigo-950/40 border-indigo-500/40 text-slate-300',
    },
    'classic-navy': {
      card: 'bg-blue-950 border-blue-400/30 text-white',
      badge: 'bg-blue-500/20 text-blue-200 border-blue-400/40',
      title: 'text-amber-100',
      bullet: 'text-amber-300',
      notes: 'bg-blue-900/40 border-amber-400/40 text-slate-300',
    },
    'minimal-emerald': {
      card: 'bg-slate-900 border-emerald-500/30 text-white',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      title: 'text-white',
      bullet: 'text-emerald-400',
      notes: 'bg-emerald-950/40 border-emerald-500/40 text-slate-300',
    },
  }[activeTheme];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-6xl h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <IconPresentation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {isEn ? 'Conference & Thesis Defense Slide Deck' : 'Generator Slide Sidang & Konferensi'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Phase 35
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn
                  ? 'Auto-synthesizes manuscript into a high-impact academic slide deck.'
                  : 'Sintesis otomatis naskah skripsi menjadi slide presentasi sidang akademik berbobot tinggi.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Selector */}
            <div className="hidden sm:flex items-center bg-slate-200/60 dark:bg-slate-800 p-1 rounded-lg border border-slate-300/50 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTheme('academic-modern')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTheme === 'academic-modern'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Modern
              </button>
              <button
                type="button"
                onClick={() => setActiveTheme('classic-navy')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTheme === 'classic-navy'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Classic
              </button>
              <button
                type="button"
                onClick={() => setActiveTheme('minimal-emerald')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTheme === 'minimal-emerald'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Emerald
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Left Thumbnails + Right Preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Thumbnails Column */}
          <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-3 overflow-y-auto hidden md:flex flex-col gap-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-1 flex items-center justify-between">
              <span>{isEn ? 'Slides Overview' : 'Daftar Slide'}</span>
              <span>{deck.slides.length}</span>
            </div>

            {deck.slides.map((s, idx) => {
              const isSelected = idx === currentSlideIndex;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">{s.category}</span>
                  </div>
                  <span className="font-semibold line-clamp-1 text-slate-900 dark:text-slate-100">
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Preview Column */}
          <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 overflow-y-auto">
            {/* Slide Stage Container */}
            <div className="flex-1 flex items-center justify-center min-h-[360px]">
              {activeSlide && (
                <div
                  className={`w-full max-w-3xl aspect-video rounded-2xl p-6 sm:p-10 border shadow-2xl flex flex-col justify-between transition-all ${themeClasses.card}`}
                >
                  {/* Slide Top */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${themeClasses.badge}`}
                      >
                        {activeSlide.category}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {currentSlideIndex + 1} / {deck.slides.length}
                      </span>
                    </div>

                    <h3
                      className={`text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight mb-2 ${themeClasses.title}`}
                    >
                      {activeSlide.title}
                    </h3>
                    {activeSlide.subtitle && (
                      <p className="text-xs sm:text-sm text-slate-400 mb-4">{activeSlide.subtitle}</p>
                    )}

                    {/* Bullet Points */}
                    {activeSlide.bulletPoints && activeSlide.bulletPoints.length > 0 && (
                      <ul className="space-y-3 mt-4 text-xs sm:text-sm text-slate-200">
                        {activeSlide.bulletPoints.map((bp, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className={`text-base leading-none font-bold ${themeClasses.bullet}`}>
                              •
                            </span>
                            <span className="leading-relaxed">{bp}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Slide Bottom Footer */}
                  <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[70%]">
                      {deck.presenter} {deck.institution ? `• ${deck.institution}` : ''}
                    </span>
                    <span>ScholarFlow Deck</span>
                  </div>
                </div>
              )}
            </div>

            {/* Speaker Notes Drawer */}
            {showNotes && activeSlide && (
              <div
                className={`mt-4 p-3.5 rounded-xl border text-xs leading-relaxed transition-all ${themeClasses.notes}`}
              >
                <div className="flex items-center gap-2 mb-1 text-indigo-400 font-semibold">
                  <IconNotes className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Speaker Notes / Narration Guide:' : 'Catatan Narasi Pembicara:'}</span>
                </div>
                <p className="italic text-slate-300">{activeSlide.speakerNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850">
          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentSlideIndex === 0}
              onClick={() => setCurrentSlideIndex((prev) => Math.max(prev - 1, 0))}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <IconChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 min-w-16 text-center">
              {currentSlideIndex + 1} / {deck.slides.length}
            </span>
            <button
              type="button"
              disabled={currentSlideIndex === deck.slides.length - 1}
              onClick={() => setCurrentSlideIndex((prev) => Math.min(prev + 1, deck.slides.length - 1))}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <IconChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className={`ml-2 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                showNotes
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <IconNotes className="w-3.5 h-3.5" />
              <span>{isEn ? 'Notes' : 'Catatan'}</span>
            </button>

            <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 ml-2">
              <IconClock className="w-3.5 h-3.5 text-slate-400" />
              <span>~{deck.estimatedMinutes} {isEn ? 'mins' : 'menit'}</span>
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMarp}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedMarp ? <IconCheck className="w-3.5 h-3.5 text-emerald-500" /> : <IconCopy className="w-3.5 h-3.5" />}
              <span>{copiedMarp ? (isEn ? 'Copied Marp!' : 'Tersalin!') : (isEn ? 'Copy Marp MD' : 'Salin Marp MD')}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHtml}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <IconDownload className="w-3.5 h-3.5" />
              <span>{isEn ? 'Download Standalone HTML Deck' : 'Unduh File Presentasi HTML'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
