'use client';

import React, { useState } from 'react';
import { IconKey, IconEye, IconEyeOff, IconShieldLock } from '@tabler/icons-react';

interface InstitutionAiKeysPanelProps {
  isEn: boolean;
  campusTextKey: string;
  onChangeCampusTextKey: (val: string) => void;
  campusVisionKey: string;
  onChangeCampusVisionKey: (val: string) => void;
}

export function InstitutionAiKeysPanel({
  isEn,
  campusTextKey,
  onChangeCampusTextKey,
  campusVisionKey,
  onChangeCampusVisionKey,
}: InstitutionAiKeysPanelProps) {
  const [showTextKey, setShowTextKey] = useState(false);
  const [showVisionKey, setShowVisionKey] = useState(false);

  return (
    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-1">
        <IconKey className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {isEn
            ? 'Campus Dedicated AI Keys (Multi-Tenant BYOK)'
            : 'Kredensial API Key AI Kampus (Isolasi Multi-Tenant)'}
        </label>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3.5">
        {isEn
          ? 'Segregate Text and Vision workloads with dedicated enterprise keys for your institution. If left empty, requests automatically use the server campus pool.'
          : 'Pisahkan jalur beban kerja Teks dan Vision dengan API key enterprise khusus universitas. Jika dikosongkan, sistem memakai server pool kampus bawaan.'}
      </p>

      <div className="space-y-3">
        {/* 1. Campus Text Key */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>✍️</span>
              <span>{isEn ? 'Campus Text AI Key' : 'API Key Teks Kampus'}</span>
            </span>
            <span className="text-[10px] text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-1.5 py-0.5 rounded font-semibold">
              {isEn ? 'Drafting & Paraphrase' : 'Teks & Parafrase'}
            </span>
          </div>
          <div className="relative">
            <input
              type={showTextKey ? 'text' : 'password'}
              value={campusTextKey}
              onChange={(e) => onChangeCampusTextKey(e.target.value)}
              placeholder={isEn ? 'Enter campus text key (e.g. AIzaSy... or sk-...)' : 'Masukkan key teks kampus...'}
              className="w-full pl-3 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 transition"
            />
            <button
              type="button"
              onClick={() => setShowTextKey(!showTextKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              {showTextKey ? <IconEyeOff className="h-3.5 w-3.5" /> : <IconEye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* 2. Campus Vision Key */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>🖼️</span>
              <span>{isEn ? 'Campus Vision AI Key' : 'API Key Vision Kampus'}</span>
            </span>
            <span className="text-[10px] text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 px-1.5 py-0.5 rounded font-semibold">
              {isEn ? 'SPSS & Multimodal' : 'SPSS & Visual'}
            </span>
          </div>
          <div className="relative">
            <input
              type={showVisionKey ? 'text' : 'password'}
              value={campusVisionKey}
              onChange={(e) => onChangeCampusVisionKey(e.target.value)}
              placeholder={isEn ? 'Enter campus vision key (e.g. AIzaSy... or sk-...)' : 'Masukkan key vision kampus...'}
              className="w-full pl-3 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 transition"
            />
            <button
              type="button"
              onClick={() => setShowVisionKey(!showVisionKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              {showVisionKey ? <IconEyeOff className="h-3.5 w-3.5" /> : <IconEye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-2 p-2.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl text-[11px] text-indigo-800 dark:text-indigo-300">
          <IconShieldLock className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
          <span>
            {isEn
              ? 'Multi-Tenant Isolation: Segregated keys prevent cross-tier quota collisions between text generation and SPSS image interpretation.'
              : 'Isolasi Multi-Tenant: Pemisahan key mencegah konflik limit kuota antara tugas penulisan teks dan pembacaan visual SPSS.'}
          </span>
        </div>
      </div>
    </div>
  );
}
