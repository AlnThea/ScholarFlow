// components/editor/document-setup-modal.tsx
'use client';

import React, { useState } from 'react';
import { 
  IconFilePlus, 
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
import type { DocumentSettings } from '@/lib/api/documents';

interface DocumentSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, settings: DocumentSettings) => void;
}

export function DocumentSetupModal({ isOpen, onClose, onSubmit }: DocumentSetupModalProps) {
  const [title, setTitle] = useState('');
  
  // Document configurations
  const [publishYear, setPublishYear] = useState<'all' | '5_years' | 'custom'>('all');
  const [publishYearStart, setPublishYearStart] = useState<number>(2020);
  const [publishYearEnd, setPublishYearEnd] = useState<number>(new Date().getFullYear());
  
  const [impactFactor, setImpactFactor] = useState<'all' | '0.25+' | '3+' | '10+'>('all');
  
  const [considerExternal, setConsiderExternal] = useState(false);
  const [considerLibrary, setConsiderLibrary] = useState(false);
  const [limitCollection, setLimitCollection] = useState('all');
  
  const [citationStyle, setCitationStyle] = useState('apa');
  const [citationLocale, setCitationLocale] = useState('en-US');
  const [showPageNumber, setShowPageNumber] = useState(false);

  // Citation Style Selection modal visibility
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);

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

  const handleCreate = () => {
    const finalTitle = title.trim() || 'Untitled Document';
    const settings: DocumentSettings = {
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
    onSubmit(finalTitle, settings);
  };

  const handleSkip = () => {
    const finalTitle = title.trim() || 'Untitled Document';
    const defaultSettings: DocumentSettings = {
      publishYear: 'all',
      publishYearStart: null,
      publishYearEnd: null,
      impactFactor: 'all',
      considerExternal: false,
      considerLibrary: false,
      limitCollection: 'all',
      citationStyle: 'apa',
      citationLocale: 'en-US',
      showPageNumber: false
    };
    onSubmit(finalTitle, defaultSettings);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all animate-fade-in">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-2">
              <IconFilePlus className="h-5 w-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-800">Buat Dokumen Akademik Baru</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <IconX className="h-5 w-5" />
            </button>
          </div>

          {/* Form Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-h-[60vh]">
            
            {/* 1. Document Title Input */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="doc-title" className="text-xs font-bold text-slate-700">Judul Dokumen / Artikel</label>
              <input
                id="doc-title"
                type="text"
                placeholder="Rancang Bangun Sistem Informasi Donasi Berbasis Hybrid..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>

            <div className="h-px bg-slate-100 w-full" />

            {/* 2. Publish Year Settings */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <IconCalendar className="h-4 w-4 text-slate-400" />
                <span>Filter Tahun Terbit (Publish Year)</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'all', label: 'Semua Tahun' },
                  { id: '5_years', label: '5 Tahun Terakhir' },
                  { id: 'custom', label: 'Tahun Kustom' }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setPublishYear(option.id as any)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium text-center transition duration-150 ${
                      publishYear === option.id
                        ? 'text-indigo-700 bg-indigo-50/70 border-indigo-200'
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
                    <span className="text-[10px] font-semibold text-slate-400">Dari:</span>
                    <input
                      type="number"
                      value={publishYearStart}
                      onChange={(e) => setPublishYearStart(parseInt(e.target.value) || 2000)}
                      className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 text-center outline-none bg-white focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-[10px] font-semibold text-slate-400">Sampai:</span>
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

            {/* 3. Impact Factor Settings */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <IconSettings className="h-4 w-4 text-slate-400" />
                <span>Batas Impact Factor Jurnal</span>
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { id: 'all', label: 'Semua Jurnal' },
                  { id: '0.25+', label: '0.25+' },
                  { id: '3+', label: '3+' },
                  { id: '10+', label: '10+' }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setImpactFactor(option.id as any)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-medium text-center transition duration-150 ${
                      impactFactor === option.id
                        ? 'text-indigo-700 bg-indigo-50/70 border-indigo-200'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. External Sources, Library Sources, & Limit Collection Toggles */}
            <div className="flex flex-col gap-4 bg-slate-50/80 rounded-2xl p-4 border border-slate-100/50">
              
              {/* External Sources Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <IconSparkles className="h-3.5 w-3.5 text-indigo-500" />
                    Consider External Sources
                  </span>
                  <span className="text-[10px] text-slate-400">Aktifkan pencarian dan rujukan dari web luar</span>
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
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <IconDatabase className="h-3.5 w-3.5 text-indigo-500" />
                    Consider Library Sources
                  </span>
                  <span className="text-[10px] text-slate-400">Gunakan PDF yang di-upload sebagai konteks sitasi AI</span>
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
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <IconBookmark className="h-3.5 w-3.5 text-indigo-500" />
                    Limit to a Collection
                  </span>
                  <span className="text-[10px] text-slate-400">Batasi pencarian hanya pada koleksi tertentu</span>
                </div>
                <select
                  value={limitCollection}
                  onChange={(e) => setLimitCollection(e.target.value)}
                  className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 outline-none transition focus:border-indigo-400"
                >
                  <option value="all">Semua Koleksi (All Sources)</option>
                  <option value="journals">Jurnal Internal</option>
                  <option value="proceedings">Prosiding Donasi</option>
                </select>
              </div>
            </div>

            {/* 5. Citation Style Selector */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-700">Gaya Sitasi Dokumen (Citation Style)</span>
              
              <div className="flex items-center justify-between border border-slate-200 rounded-xl p-3 bg-white shadow-sm">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-800">{getStyleDisplayName(citationStyle)}</span>
                  <span className="text-[10px] text-slate-400">Bahasa Lokalisasi: {getLocaleDisplayName(citationLocale)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStyleModalOpen(true)}
                  className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-indigo-600 hover:text-indigo-700 text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
                >
                  Pilih Gaya Sitasi
                </button>
              </div>
            </div>

            {/* 6. Page Numbers Toggle */}
            <div className="flex items-center justify-between border border-slate-200/50 rounded-2xl p-4 bg-slate-50/40">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <IconPageBreak className="h-3.5 w-3.5 text-indigo-500" />
                  Show Page Number in Citation
                </span>
                <span className="text-[10px] text-slate-400">Sertakan nomor halaman saat menyisipkan sitasi</span>
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
              <IconInfoCircle className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-indigo-800 leading-normal">
                Preferensi pencarian dan gaya sitasi di atas akan disimpan dan diterapkan khusus pada draf dokumen yang baru dibuat ini.
              </p>
            </div>
          </div>

          {/* Footer Area */}
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="px-4 py-2 border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition shadow-sm cursor-pointer"
            >
              Lewati (Skip Setup)
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-transparent text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-xl transition"
              >
                Batal
              </button>
              <button
                onClick={handleCreate}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition cursor-pointer"
              >
                Buat Dokumen
              </button>
            </div>
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
