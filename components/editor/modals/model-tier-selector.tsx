import React from 'react';

interface ModelTierSelectorProps {
  isEn: boolean;
  modalModelState: any;
  setModalModelState: React.Dispatch<React.SetStateAction<any>>;
}

export const ModelTierSelector: React.FC<ModelTierSelectorProps> = ({
  isEn,
  modalModelState,
  setModalModelState,
}) => {
  const currentWorkload = modalModelState.workload_category || 'all';

  return (
    <>
      {/* 3-Tier Access Level Selection */}
      <div className="flex flex-col gap-2 p-3.5 border border-slate-200/80 dark:border-slate-700/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {isEn ? 'Access Tier Category' : 'Kategori Hak Akses Paket'}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
            {isEn
              ? 'Choose who can access this AI model across Free, Pro, and Institutional Campus plans.'
              : 'Tentukan siapa yang dapat mengakses model ini (Gratis, Pro Writer, atau Khusus Kampus/Institusi).'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-1">
          {/* Option 1: Free */}
          <button
            type="button"
            onClick={() => setModalModelState((prev: any) => ({ ...prev, is_premium: false, access_tier: 'free' }))}
            className={`py-2 px-2.5 rounded-lg border text-center transition cursor-pointer flex flex-col items-center gap-0.5 ${
              !modalModelState.is_premium && modalModelState.access_tier !== 'institution'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium'
            }`}
          >
            <span className="text-xs">🎁 {isEn ? 'Free Tier' : 'Gratis'}</span>
            <span className="text-[8px] text-slate-400 dark:text-slate-500">{isEn ? 'All users' : 'Semua user'}</span>
          </button>

          {/* Option 2: Pro Writer */}
          <button
            type="button"
            onClick={() => setModalModelState((prev: any) => ({ ...prev, is_premium: true, access_tier: 'pro' }))}
            className={`py-2 px-2.5 rounded-lg border text-center transition cursor-pointer flex flex-col items-center gap-0.5 ${
              modalModelState.is_premium && modalModelState.access_tier !== 'institution'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-800 dark:text-indigo-300 font-bold shadow-xs'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium'
            }`}
          >
            <span className="text-xs">⚡ {isEn ? 'Pro Writer' : 'Pro Writer'}</span>
            <span className="text-[8px] text-slate-400 dark:text-slate-500">{isEn ? 'Personal paid' : 'Berbayar'}</span>
          </button>

          {/* Option 3: Institutional Campus */}
          <button
            type="button"
            onClick={() => setModalModelState((prev: any) => ({ ...prev, is_premium: true, access_tier: 'institution' }))}
            className={`py-2 px-2.5 rounded-lg border text-center transition cursor-pointer flex flex-col items-center gap-0.5 ${
              modalModelState.access_tier === 'institution'
                ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-300 font-bold shadow-xs'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium'
            }`}
          >
            <span className="text-xs">🏛️ {isEn ? 'Campus / B2B' : 'Institusi'}</span>
            <span className="text-[8px] text-slate-400 dark:text-slate-500">{isEn ? 'Campus license' : 'Lisensi kampus'}</span>
          </button>
        </div>
      </div>

      {/* Workload Capability (Text vs Vision vs All-Rounder) */}
      <div className="flex flex-col gap-2 p-3.5 border border-slate-200/80 dark:border-slate-700/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {isEn ? 'Workload Capability (Text vs Vision)' : 'Kategori Beban Kerja AI (Teks vs Vision)'}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
            {isEn
              ? 'Segment model workloads to optimize cost and prevent rate limit exhaustion.'
              : 'Pisahkan jalur beban kerja untuk mencegah error limit kuota bersama.'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-1">
          {/* Option 1: All-Rounder */}
          <button
            type="button"
            onClick={() => setModalModelState((prev: any) => ({ ...prev, workload_category: 'all' }))}
            className={`py-2 px-2 rounded-lg border text-center transition cursor-pointer flex flex-col items-center gap-0.5 ${
              currentWorkload === 'all'
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300 font-bold shadow-xs'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium'
            }`}
          >
            <span className="text-xs">🌐 {isEn ? 'All-Rounder' : 'Serba Bisa'}</span>
            <span className="text-[8px] text-slate-400 dark:text-slate-500">{isEn ? 'Text + Vision' : 'Teks & Visual'}</span>
          </button>

          {/* Option 2: Text Only */}
          <button
            type="button"
            onClick={() => setModalModelState((prev: any) => ({ ...prev, workload_category: 'text' }))}
            className={`py-2 px-2 rounded-lg border text-center transition cursor-pointer flex flex-col items-center gap-0.5 ${
              currentWorkload === 'text'
                ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-300 font-bold shadow-xs'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium'
            }`}
          >
            <span className="text-xs">✍️ {isEn ? 'Text Only' : 'Khusus Teks'}</span>
            <span className="text-[8px] text-slate-400 dark:text-slate-500">{isEn ? 'NLP & Writing' : 'Parafrase & Teks'}</span>
          </button>

          {/* Option 3: Vision Only */}
          <button
            type="button"
            onClick={() => setModalModelState((prev: any) => ({ ...prev, workload_category: 'vision' }))}
            className={`py-2 px-2 rounded-lg border text-center transition cursor-pointer flex flex-col items-center gap-0.5 ${
              currentWorkload === 'vision'
                ? 'bg-violet-50 dark:bg-violet-950/60 border-violet-300 dark:border-violet-700 text-violet-800 dark:text-violet-300 font-bold shadow-xs'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium'
            }`}
          >
            <span className="text-xs">🖼️ {isEn ? 'Vision Only' : 'Khusus Vision'}</span>
            <span className="text-[8px] text-slate-400 dark:text-slate-500">{isEn ? 'SPSS & Charts' : 'SPSS & Gambar'}</span>
          </button>
        </div>
      </div>
    </>
  );
};
