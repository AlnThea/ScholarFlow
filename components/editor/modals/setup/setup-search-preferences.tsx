import React from 'react';
import { IconCalendar, IconSettings, IconSparkles, IconDatabase, IconBookmark } from '@tabler/icons-react';

interface SetupSearchPreferencesProps {
  language: string;
  publishYear: 'all' | '5_years' | 'custom';
  setPublishYear: (val: 'all' | '5_years' | 'custom') => void;
  publishYearStart: number;
  setPublishYearStart: (val: number) => void;
  publishYearEnd: number;
  setPublishYearEnd: (val: number) => void;
  impactFactor: 'all' | '0.25+' | '3+' | '10+';
  setImpactFactor: (val: 'all' | '0.25+' | '3+' | '10+') => void;
  considerExternal: boolean;
  setConsiderExternal: (val: boolean) => void;
  considerLibrary: boolean;
  setConsiderLibrary: (val: boolean) => void;
  limitCollection: string;
  setLimitCollection: (val: string) => void;
}

export function SetupSearchPreferences({
  language,
  publishYear,
  setPublishYear,
  publishYearStart,
  setPublishYearStart,
  publishYearEnd,
  setPublishYearEnd,
  impactFactor,
  setImpactFactor,
  considerExternal,
  setConsiderExternal,
  considerLibrary,
  setConsiderLibrary,
  limitCollection,
  setLimitCollection,
}: SetupSearchPreferencesProps) {
  return (
    <>
      {/* 2. Publish Year Settings */}
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

      {/* 3. Impact Factor Settings */}
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
              {language === 'en' ? 'Consider External Sources' : 'Pertimbangkan Sumber Eksternal'}
            </span>
            <span className="text-[10px] text-slate-400">
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
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <IconDatabase className="h-3.5 w-3.5 text-indigo-500" />
              {language === 'en' ? 'Consider Library Sources' : 'Pertimbangkan Sumber Pustaka'}
            </span>
            <span className="text-[10px] text-slate-400">
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
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <IconBookmark className="h-3.5 w-3.5 text-indigo-500" />
              {language === 'en' ? 'Limit to a Collection' : 'Batasi pada Koleksi'}
            </span>
            <span className="text-[10px] text-slate-400">
              {language === 'en' ? 'Limit search to a specific collection' : 'Batasi pencarian hanya pada koleksi tertentu'}
            </span>
          </div>
          <select
            value={limitCollection}
            onChange={(e) => setLimitCollection(e.target.value)}
            className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 outline-none transition focus:border-indigo-400"
          >
            <option value="all">{language === 'en' ? 'All Collections' : 'Semua Koleksi (All Sources)'}</option>
            <option value="journals">{language === 'en' ? 'Internal Journal' : 'Jurnal Internal'}</option>
            <option value="proceedings">{language === 'en' ? 'Donated Proceedings' : 'Prosiding Donasi'}</option>
          </select>
        </div>
      </div>
    </>
  );
}
