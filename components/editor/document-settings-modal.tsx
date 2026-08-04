// components/editor/document-settings-modal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  IconCalendar, 
  IconSettings, 
  IconSparkles, 
  IconDatabase,
  IconBookmark,
  IconPageBreak,
  IconInfoCircle,
  IconX 
} from '@tabler/icons-react';
import { CitationStyleModal } from './citation-style-modal';
import { useLanguage } from '../i18n/language-context';
import type { DocumentSettings } from '@/lib/api/documents';

interface DocumentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DocumentSettings;
  onSave: (settings: DocumentSettings) => void;
  activePlanId?: string;
}

export function DocumentSettingsModal({ 
  isOpen, 
  onClose, 
  settings, 
  onSave, 
  activePlanId = 'free' 
}: DocumentSettingsModalProps) {
  const { language, t } = useLanguage();
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);

  // States
  const [publishYear, setPublishYear] = useState<'all' | '5_years' | 'custom'>('all');
  const [publishYearStart, setPublishYearStart] = useState<number>(2000);
  const [publishYearEnd, setPublishYearEnd] = useState<number>(new Date().getFullYear());
  const [impactFactor, setImpactFactor] = useState<'all' | '0.25+' | '3+' | '10+'>('all');
  const [considerExternal, setConsiderExternal] = useState<boolean>(true);
  const [considerLibrary, setConsiderLibrary] = useState<boolean>(true);
  const [limitCollection, setLimitCollection] = useState<string>('all');
  const [citationStyle, setCitationStyle] = useState<string>('apa');
  const [citationLocale, setCitationLocale] = useState<string>('en-US');
  const [showPageNumber, setShowPageNumber] = useState<boolean>(true);

  // Sync state when modal is opened or settings change
  useEffect(() => {
    if (isOpen && settings) {
      setPublishYear(settings.publishYear || 'all');
      setPublishYearStart(settings.publishYearStart ?? 2000);
      setPublishYearEnd(settings.publishYearEnd ?? new Date().getFullYear());
      setImpactFactor(settings.impactFactor || 'all');
      setConsiderExternal(settings.considerExternal ?? true);
      setConsiderLibrary(settings.considerLibrary ?? true);
      setLimitCollection(settings.limitCollection || 'all');
      setCitationStyle(settings.citationStyle || 'apa');
      setCitationLocale(settings.citationLocale || 'en-US');
      setShowPageNumber(settings.showPageNumber ?? true);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const getStyleDisplayName = (styleId: string) => {
    switch (styleId) {
      case 'apa': return 'APA (7th ed.)';
      case 'chicago-author-date': return 'Chicago (17th ed.)';
      case 'harvard1': return 'Harvard';
      case 'ieee': return 'IEEE';
      case 'mla': return 'MLA (9th ed.)';
      case 'vancouver': return 'Vancouver';
      case 'nature': return 'Nature';
      default: return 'APA (7th ed.)';
    }
  };

  const getLocaleDisplayName = (localeId: string) => {
    switch (localeId) {
      case 'en-US': return 'American English';
      case 'en-GB': return 'British English';
      case 'id-ID': return 'Indonesian';
      case 'ar': return 'Arabic';
      case 'es-ES': return 'Spanish';
      case 'fr-FR': return 'French';
      default: return 'American English';
    }
  };

  const handleSave = () => {
    const updatedSettings: DocumentSettings = {
      ...settings,
      publishYear,
      publishYearStart: publishYear === 'custom' ? publishYearStart : null,
      publishYearEnd: publishYear === 'custom' ? publishYearEnd : null,
      impactFactor,
      considerExternal,
      considerLibrary,
      limitCollection,
      citationStyle,
      citationLocale,
      showPageNumber
    };
    onSave(updatedSettings);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col transform transition-all scale-100 animate-fade-in text-left">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
              <h3 className="text-sm font-bold text-slate-800">
                {language === 'en' ? 'Document & Research Settings' : 'Pengaturan Dokumen & Riset'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <IconX className="h-5 w-5" />
            </button>
          </div>

          {/* Form Scroll Area */}
          <div className="p-6 overflow-y-auto flex flex-col gap-6 max-h-[calc(85vh-120px)] bg-white text-left">
            {/* 1. Publish Year Settings */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <IconCalendar className="h-4 w-4 text-slate-400" />
                <span>{language === 'en' ? 'Filter Publication Year' : 'Filter Tahun Terbit (Publish Year)'}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'all', label: language === 'en' ? 'All Years' : 'Semua Tahun' },
                  { id: '5_years', label: language === 'en' ? 'Last 5 Years' : '5 Tahun Terakhir' },
                  { id: 'custom', label: language === 'en' ? 'Custom Year' : 'Tahun Kustom' }
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPublishYear(option.id as any)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium text-center transition duration-150 cursor-pointer ${
                      publishYear === option.id
                        ? 'text-indigo-700 bg-indigo-50/70 border-indigo-200 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {publishYear === 'custom' && (
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100 animate-slide-down">
                  <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-[10px] font-semibold text-slate-400">{language === 'en' ? 'From:' : 'Dari:'}</span>
                    <input
                      type="number"
                      value={publishYearStart}
                      onChange={(e) => setPublishYearStart(parseInt(e.target.value) || 2000)}
                      className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 text-center outline-none bg-white focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-[10px] font-semibold text-slate-400">{language === 'en' ? 'To:' : 'Sampai:'}</span>
                    <input
                      type="number"
                      value={publishYearEnd}
                      onChange={(e) => setPublishYearEnd(parseInt(e.target.value) || new Date().getFullYear())}
                      className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 text-center outline-none bg-white focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Impact Factor Settings */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <IconSettings className="h-4 w-4 text-slate-400" />
                <span>{language === 'en' ? 'Journal Impact Factor Limit' : 'Batas Impact Factor Jurnal'}</span>
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { id: 'all', label: language === 'en' ? 'All Journals' : 'Semua Jurnal' },
                  { id: '0.25+', label: '0.25+' },
                  { id: '3+', label: '3+' },
                  { id: '10+', label: '10+' }
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setImpactFactor(option.id as any)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-medium text-center transition duration-150 cursor-pointer ${
                      impactFactor === option.id
                        ? 'text-indigo-700 bg-indigo-50/70 border-indigo-200 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. External Sources, Library Sources, & Limit Collection Toggles */}
            <div className="flex flex-col gap-4 bg-slate-50/80 rounded-2xl p-4 border border-slate-100/50">
              {/* External Sources Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 text-left">
                    <IconSparkles className="h-3.5 w-3.5 text-indigo-500" />
                    {language === 'en' ? 'Consider External Sources' : 'Pertimbangkan Sumber Eksternal'}
                  </span>
                  <span className="text-[10px] text-slate-400 text-left">
                    {language === 'en' ? 'Enable searching and referencing from external web sources' : 'Aktifkan pencarian dan rujukan dari web luar'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={considerExternal}
                    onChange={(e) => setConsiderExternal(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="h-px bg-slate-200/50 w-full" />

              {/* Library Sources Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 text-left">
                    <IconDatabase className="h-3.5 w-3.5 text-indigo-500" />
                    {language === 'en' ? 'Consider Library Sources' : 'Pertimbangkan Sumber Pustaka'}
                  </span>
                  <span className="text-[10px] text-slate-400 text-left">
                    {language === 'en' ? 'Use uploaded PDFs as AI citation context' : 'Gunakan PDF yang di-upload sebagai konteks sitasi AI'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={considerLibrary}
                    onChange={(e) => setConsiderLibrary(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="h-px bg-slate-200/50 w-full" />

              {/* Limit Collection Dropdown */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 text-left">
                    <IconBookmark className="h-3.5 w-3.5 text-indigo-500" />
                    {language === 'en' ? 'Limit to a Collection' : 'Batasi pada Koleksi'}
                  </span>
                  <span className="text-[10px] text-slate-400 text-left">
                    {language === 'en' ? 'Limit search to a specific collection' : 'Batasi pencarian hanya pada koleksi tertentu'}
                  </span>
                </div>
                <select
                  value={limitCollection}
                  onChange={(e) => setLimitCollection(e.target.value)}
                  className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 outline-none transition focus:border-indigo-400 cursor-pointer"
                >
                  <option value="all">{language === 'en' ? 'All Collections' : 'Semua Koleksi (All Sources)'}</option>
                  <option value="journals">{language === 'en' ? 'Internal Journal' : 'Jurnal Internal'}</option>
                  <option value="proceedings">{language === 'en' ? 'Donated Proceedings' : 'Prosiding Donasi'}</option>
                </select>
              </div>
            </div>

            {/* 4. Citation Style Selector */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-700">{t('setup.citation_style')}</span>
              
              <div className="flex items-center justify-between border border-slate-200 rounded-xl p-3 bg-white shadow-sm">
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="text-xs font-bold text-slate-800">{getStyleDisplayName(citationStyle)}</span>
                  <span className="text-[10px] text-slate-400">
                    {language === 'en' ? 'Localization Language: ' : 'Bahasa Lokalisasi: '}{getLocaleDisplayName(citationLocale)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStyleModalOpen(true)}
                  className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-indigo-600 hover:text-indigo-700 text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
                >
                  {language === 'en' ? 'Select Citation Style' : 'Pilih Gaya Sitasi'}
                </button>
              </div>
            </div>

            {/* 5. Page Numbers Toggle */}
            <div className="flex items-center justify-between border border-slate-200/50 rounded-2xl p-4 bg-slate-50/40">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 text-left">
                  <IconPageBreak className="h-3.5 w-3.5 text-indigo-500" />
                  {language === 'en' ? 'Show Page Number in Citation' : 'Tampilkan Nomor Halaman di Sitasi'}
                </span>
                <span className="text-[10px] text-slate-400 text-left">
                  {language === 'en' ? 'Include page numbers when inserting citations' : 'Sertakan nomor halaman saat menyisipkan sitasi'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showPageNumber}
                  onChange={(e) => setShowPageNumber(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Hint Note */}
            <div className="flex items-start gap-2 bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5">
              <IconInfoCircle className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-indigo-800 leading-normal text-left">
                {language === 'en' 
                  ? 'The changes will be saved to the database and applied immediately to AI referencing and exports of this document.'
                  : 'Perubahan akan disimpan ke database dan langsung diterapkan pada rujukan AI serta ekspor dokumen ini.'
                }
              </p>
            </div>
          </div>

          {/* Footer Area */}
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 bg-white border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-transparent text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-xl transition cursor-pointer"
            >
              {t('setup.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition cursor-pointer"
            >
              {language === 'en' ? 'Save Changes' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </div>

      {/* Style & Localization Selection Popup */}
      <CitationStyleModal
        isOpen={isStyleModalOpen}
        onClose={() => setIsStyleModalOpen(false)}
        selectedStyle={citationStyle}
        selectedLocale={citationLocale}
        showPageNumber={showPageNumber}
        onSelect={(style, locale) => {
          setCitationStyle(style);
          setCitationLocale(locale);
        }}
      />
    </>
  );
}
