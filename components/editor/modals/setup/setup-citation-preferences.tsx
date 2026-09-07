import React from 'react';
import { IconPageBreak } from '@tabler/icons-react';

interface SetupCitationPreferencesProps {
  language: string;
  t: (key: string) => string;
  citationStyle: string;
  citationLocale: string;
  getStyleDisplayName: (styleId: string) => string;
  getLocaleDisplayName: (localeId: string) => string;
  setIsStyleModalOpen: (val: boolean) => void;
  showPageNumber: boolean;
  setShowPageNumber: (val: boolean) => void;
}

export function SetupCitationPreferences({
  language,
  t,
  citationStyle,
  citationLocale,
  getStyleDisplayName,
  getLocaleDisplayName,
  setIsStyleModalOpen,
  showPageNumber,
  setShowPageNumber,
}: SetupCitationPreferencesProps) {
  return (
    <>
      {/* 5. Citation Style Selector */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-bold text-slate-700">{t('setup.citation_style')}</span>
        
        <div className="flex items-center justify-between border border-slate-200 rounded-xl p-3 bg-white shadow-sm">
          <div className="flex flex-col gap-0.5">
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

      {/* 6. Page Numbers Toggle */}
      <div className="flex items-center justify-between border border-slate-200/50 rounded-2xl p-4 bg-slate-50/40">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <IconPageBreak className="h-3.5 w-3.5 text-indigo-500" />
            {language === 'en' ? 'Show Page Number in Citation' : 'Tampilkan Nomor Halaman di Sitasi'}
          </span>
          <span className="text-[10px] text-slate-400">
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
    </>
  );
}
