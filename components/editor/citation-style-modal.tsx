// components/editor/citation-style-modal.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { 
  IconSearch, 
  IconCheck, 
  IconGlobe, 
  IconBook,
  IconX 
} from '@tabler/icons-react';
import { useLanguage } from '../i18n/language-context';

export type CitationStyleOption = {
  id: string;
  name: string;
  desc: string;
  inTextMock: string;
  inTextMockPage: string;
  bibMock: string;
  popular: boolean;
};

const STYLES_DATA: CitationStyleOption[] = [
  {
    id: 'apa',
    name: 'APA (7th ed.)',
    desc: 'American Psychological Association style is widely used in the social sciences, education, business, and psychology.',
    inTextMock: '(Zain & Putri, 2025)',
    inTextMockPage: '(Zain & Putri, 2025, p. 15)',
    bibMock: 'Zain, M. M., & Putri, M. (2025). Rancang Bangun Sistem Informasi Donasi Berbasis Hybrid. Indonesian Journal of Informatic Research and Software Engineering, 4(1), 12-25.',
    popular: true,
  },
  {
    id: 'chicago-author-date',
    name: 'Chicago Manual of Style 17th ed. (Author-Date)',
    desc: 'Chicago author-date style is used primarily in the physical, natural, and social sciences, preferring parenthetical citations.',
    inTextMock: '(Zain and Putri 2025)',
    inTextMockPage: '(Zain and Putri 2025, 15)',
    bibMock: 'Zain, Muhammad Mahrus, and Milenia Putri. 2025. "Rancang Bangun Sistem Informasi Donasi Berbasis Hybrid." Indonesian Journal of Informatic Research and Software Engineering 4 (1): 12-25.',
    popular: true,
  },
  {
    id: 'harvard1',
    name: 'Harvard',
    desc: 'Harvard style uses an author-date system for inline citations, commonly used in humanities, social sciences, and engineering in Europe and Australia.',
    inTextMock: '(Zain & Putri, 2025)',
    inTextMockPage: '(Zain & Putri, 2025:15)',
    bibMock: 'Zain, M. M. & Putri, M., 2025. Rancang Bangun Sistem Informasi Donasi Berbasis Hybrid. Indonesian Journal of Informatic Research and Software Engineering, 4(1), pp. 12-25.',
    popular: true,
  },
  {
    id: 'ieee',
    name: 'IEEE',
    desc: 'IEEE (Institute of Electrical and Electronics Engineers) style uses a numeric system, standard in engineering, computer science, and IT fields.',
    inTextMock: '[1]',
    inTextMockPage: '[1, p. 15]',
    bibMock: '[1] M. M. Zain and M. Putri, "Rancang Bangun Sistem Informasi Donasi Berbasis Hybrid," Indonesian Journal of Informatic Research and Software Engineering, vol. 4, no. 1, pp. 12-25, 2025.',
    popular: true,
  },
  {
    id: 'mla',
    name: 'MLA (9th ed.)',
    desc: 'MLA (Modern Language Association) style is standard in humanities, literature, arts, and cultural studies.',
    inTextMock: '(Zain and Putri)',
    inTextMockPage: '(Zain and Putri 15)',
    bibMock: 'Zain, Muhammad Mahrus, and Milenia Putri. "Rancang Bangun Sistem Informasi Donasi Berbasis Hybrid." Indonesian Journal of Informatic Research and Software Engineering, vol. 4, no. 1, 2025, pp. 12-25.',
    popular: true,
  },
  // Extra styles shown when "See More" is clicked
  {
    id: 'vancouver',
    name: 'Vancouver',
    desc: 'Vancouver style is a numeric system used in medicine, clinical sciences, and health biology.',
    inTextMock: '(1)',
    inTextMockPage: '(1, p. 15)',
    bibMock: '1. Zain MM, Putri M. Rancang Bangun Sistem Informasi Donasi Berbasis Hybrid. Indonesian Journal of Informatic Research and Software Engineering. 2025;4(1):12-25.',
    popular: false,
  },
  {
    id: 'nature',
    name: 'Nature',
    desc: 'Nature style is used in biological and physical sciences journals, utilizing superscript numeric inline citations.',
    inTextMock: '¹',
    inTextMockPage: '¹(p. 15)',
    bibMock: '1. Zain, M. M. & Putri, M. Rancang Bangun Sistem Informasi Donasi Berbasis Hybrid. Indonesian Journal of Informatic Research and Software Engineering 4, 12-25 (2025).',
    popular: false,
  }
];

type LocaleOption = {
  id: string;
  name: string;
};

const LOCALES_DATA: LocaleOption[] = [
  { id: 'en-US', name: 'Default (American English)' },
  { id: 'en-GB', name: 'British English' },
  { id: 'id-ID', name: 'Indonesian' },
  { id: 'ar', name: 'Arabic' },
  { id: 'es-ES', name: 'Spanish' },
  { id: 'fr-FR', name: 'French' },
];

interface CitationStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStyle: string;
  selectedLocale: string;
  showPageNumber: boolean;
  onSelect: (style: string, locale: string) => void;
}

export function CitationStyleModal({
  isOpen,
  onClose,
  selectedStyle,
  selectedLocale,
  showPageNumber,
  onSelect
}: CitationStyleModalProps) {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllStyles, setShowAllStyles] = useState(false);
  const [activeStyle, setActiveStyle] = useState(selectedStyle);
  const [activeLocale, setActiveLocale] = useState(selectedLocale);
  const [previewTab, setPreviewTab] = useState<'in-text' | 'bibliography'>('in-text');

  const filteredStyles = useMemo(() => {
    return STYLES_DATA.filter((style) => {
      const matchSearch = style.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPopularity = showAllStyles ? true : style.popular;
      return matchSearch && matchPopularity;
    });
  }, [searchQuery, showAllStyles]);

  const activeStyleObj = useMemo(() => {
    return STYLES_DATA.find((s) => s.id === activeStyle) || STYLES_DATA[0];
  }, [activeStyle]);

  // Adjust preview text to simulate localized formatting strings
  const localizedPreviewText = useMemo(() => {
    let rawText = previewTab === 'in-text' 
      ? (showPageNumber ? activeStyleObj.inTextMockPage : activeStyleObj.inTextMock)
      : activeStyleObj.bibMock;

    if (activeLocale === 'id-ID') {
      // replace English abbreviations/conjunctions with Indonesian
      rawText = rawText
        .replace(/ and /g, ' dan ')
        .replace(/ & /g, ' & ')
        .replace(/, p\. /g, ', hlm. ')
        .replace(/, pp\. /g, ', hlm. ')
        .replace(/ vol\. /g, ' vol. ')
        .replace(/ no\. /g, ' no. ');
    } else if (activeLocale === 'ar') {
      rawText = rawText
        .replace(/ and /g, ' و ')
        .replace(/ & /g, ' و ')
        .replace(/, p\. /g, '، ص ')
        .replace(/, pp\. /g, '، ص ');
    }
    return rawText;
  }, [activeStyleObj, activeLocale, previewTab, showPageNumber]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col w-full max-w-4xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <IconBook className="h-5 w-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-800">{t('style.title')}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        {/* Content Panel (2-column layout) */}
        <div className="flex flex-1 overflow-hidden min-h-[350px]">
          {/* Left Column: Styles selection */}
          <div className="w-1/2 border-r border-slate-100 p-5 flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{language === 'en' ? 'Select Style (Citation Style)' : 'Pilih Gaya (Citation Style)'}</h3>
            
            {/* Search Input */}
            <div className="relative flex items-center bg-slate-100 hover:bg-slate-200/50 rounded-xl px-3 py-2 transition duration-150">
              <IconSearch className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={t('style.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ml-2 w-full bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-none border-none p-0 focus:ring-0"
              />
            </div>

            {/* List of Styles */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1.5 max-h-[250px]">
              {filteredStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setActiveStyle(style.id)}
                  className={`w-full flex items-center justify-between text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition duration-150 ${
                    activeStyle === style.id
                      ? 'text-indigo-700 bg-indigo-50/70 border border-indigo-100'
                      : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <span>{style.name}</span>
                  {activeStyle === style.id && <IconCheck className="h-4 w-4 text-indigo-600" />}
                </button>
              ))}

              {!showAllStyles && (
                <button
                  onClick={() => setShowAllStyles(true)}
                  className="w-full text-center py-2 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 transition mt-1"
                >
                  {language === 'en' ? 'View More Styles...' : 'Lihat Gaya Lainnya...'}
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Localizations selection */}
          <div className="w-1/2 p-5 flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('style.lang')}</h3>
            
            <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1.5 max-h-[300px]">
              {LOCALES_DATA.map((locale) => (
                <button
                  key={locale.id}
                  onClick={() => setActiveLocale(locale.id)}
                  className={`w-full flex items-center justify-between text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition duration-150 ${
                    activeLocale === locale.id
                      ? 'text-indigo-700 bg-indigo-50/70 border border-indigo-100'
                      : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <IconGlobe className="h-3.5 w-3.5 text-slate-400" />
                    <span>{locale.name}</span>
                  </div>
                  {activeLocale === locale.id && <IconCheck className="h-4 w-4 text-indigo-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Area: Description & Live Preview Box */}
        <div className="border-t border-slate-100 bg-slate-50 p-5 flex flex-col gap-4">
          {/* Style Description */}
          <div className="flex flex-col gap-1">
            <h4 className="text-xs font-bold text-slate-700">{activeStyleObj.name}</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">{activeStyleObj.desc}</p>
          </div>

          {/* Live Preview Container */}
          <div className="border border-slate-200/80 bg-white rounded-xl p-4 flex flex-col gap-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Preview format:</span>
              
              {/* Segmented Controller Tab */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setPreviewTab('in-text')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${
                    previewTab === 'in-text'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  In-text
                </button>
                <button
                  onClick={() => setPreviewTab('bibliography')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${
                    previewTab === 'bibliography'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Bibliography
                </button>
              </div>
            </div>

            {/* Preview Output */}
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-[11px] font-mono text-slate-700 min-h-[45px] flex items-center select-all">
              {localizedPreviewText}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition shadow-sm"
            >
              {t('setup.cancel')}
            </button>
            <button
              onClick={() => {
                onSelect(activeStyle, activeLocale);
                onClose();
              }}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              {t('style.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
