// components/ai/token-quota-modal.tsx
'use client';

import React from 'react';
import { 
  IconX, 
  IconSparkles, 
  IconBolt, 
  IconCrown, 
  IconBuildingCommunity,
  IconCalendarTime,
  IconCheck
} from '@tabler/icons-react';

export interface TokenQuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokensUsed?: number;
  monthlyQuota?: number;
  activePlanId?: string;
  language?: string;
  onUpgrade?: () => void;
}

export function TokenQuotaModal({
  isOpen,
  onClose,
  tokensUsed = 0,
  monthlyQuota = 50000,
  activePlanId = 'free',
  language = 'en',
  onUpgrade,
}: TokenQuotaModalProps) {
  if (!isOpen) return null;

  const isEn = language === 'en';
  const isCampus = activePlanId === 'institution';
  const isPro = activePlanId === 'pro';

  const used = Math.max(0, tokensUsed);
  const quota = Math.max(1, monthlyQuota);
  const remaining = Math.max(0, quota - used);
  const percentUsed = Math.min(100, Math.round((used / quota) * 100));
  const isExhausted = percentUsed >= 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isExhausted ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400' : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'}`}>
              <IconBolt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-850 dark:text-white">
                {isEn ? 'Monthly AI Token Quota & Plan Comparison' : 'Kuota Token AI Bulanan & Perbandingan Paket'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn ? 'Compare token allowances across Free, Pro, and Campus enterprise tiers' : 'Bandingkan kapasitas kuota token antara Free, Pro, dan Lisensi Kampus'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        {/* Capacity Overview Card */}
        <div className="mt-5 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-650 dark:text-slate-300">
              {isEn ? 'Current Token Usage' : 'Pemakaian Token Saat Ini'}
            </span>
            <span className="text-xs font-bold text-slate-850 dark:text-white">
              {used.toLocaleString()} / {quota.toLocaleString()} ({percentUsed}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-3">
            <div
              className={`h-full transition-all duration-500 ${
                isExhausted
                  ? 'bg-rose-500'
                  : percentUsed >= 85
                  ? 'bg-amber-500'
                  : isCampus
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : isPro
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <IconSparkles className="h-3.5 w-3.5 text-indigo-500" />
              {isEn ? `Remaining: ${remaining.toLocaleString()} tokens` : `Sisa: ${remaining.toLocaleString()} token`}
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <IconCalendarTime className="h-3 w-3" />
              {isEn ? 'Automatic 30-day cycle reset' : 'Reset siklus otomatis setiap 30 hari'}
            </span>
          </div>
        </div>

        {/* 3-Tier Comparison Cards: Free vs Pro vs Campus */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Card 1: Free Tier */}
          <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${activePlanId === 'free' ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-xs' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40'}`}>
            <div>
              <div className="font-bold text-slate-800 dark:text-white flex items-center justify-between mb-1">
                <span>Free Tier</span>
                {activePlanId === 'free' && (
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-semibold">
                    {isEn ? 'Active' : 'Aktif'}
                  </span>
                )}
              </div>
              <div className="text-base font-extrabold text-slate-800 dark:text-white mb-1">
                50.000 <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">/ bulan</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-3 leading-relaxed">
                {isEn ? 'Standard personal draft & summary capacity' : 'Kapasitas draf tugas & ringkasan dokumen standar'}
              </p>
              <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-1.5"><IconCheck className="h-3 w-3 text-emerald-500 shrink-0" /> {isEn ? 'AI Summarize & Abstract' : 'AI Ringkas & Abstrak'}</li>
                <li className="flex items-center gap-1.5"><IconCheck className="h-3 w-3 text-emerald-500 shrink-0" /> {isEn ? '15 RPM Edge Rate Limit' : 'Batas 15 Request/Menit'}</li>
                <li className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 line-through"><span>{isEn ? 'Paraphrase Studio' : 'Paraphrase Studio'}</span></li>
              </ul>
            </div>
          </div>

          {/* Card 2: Pro Writer */}
          <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${isPro ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-xs' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40'}`}>
            <div>
              <div className="font-bold text-slate-800 dark:text-white flex items-center justify-between mb-1">
                <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                  <IconCrown className="h-3.5 w-3.5" />
                  <span>Pro Writer</span>
                </span>
                {isPro && (
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-semibold">
                    {isEn ? 'Active' : 'Aktif'}
                  </span>
                )}
              </div>
              <div className="text-base font-extrabold text-indigo-650 dark:text-indigo-300 mb-1">
                1.000.000 <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">/ bulan</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-3 leading-relaxed">
                {isEn ? 'Heavy researcher & thesis writing allowance' : 'Kapasitas riset intensif, skripsi & tesis'}
              </p>
              <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-1.5"><IconCheck className="h-3 w-3 text-indigo-500 shrink-0" /> {isEn ? 'Paraphrase Studio Unlocked' : 'Akses Penuh Paraphrase Studio'}</li>
                <li className="flex items-center gap-1.5"><IconCheck className="h-3 w-3 text-indigo-500 shrink-0" /> {isEn ? 'Citation Safe-Mode & Stylometry' : 'Citation Safe-Mode & Gaya Penulis'}</li>
                <li className="flex items-center gap-1.5"><IconCheck className="h-3 w-3 text-indigo-500 shrink-0" /> {isEn ? 'BYOK (Unlimited Custom Key)' : 'BYOK (Kunci API Mandiri Bebas)'}</li>
              </ul>
            </div>
          </div>

          {/* Card 3: B2B Campus Enterprise */}
          <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${isCampus ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-xs' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40'}`}>
            <div>
              <div className="font-bold text-slate-800 dark:text-white flex items-center justify-between mb-1">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <IconBuildingCommunity className="h-3.5 w-3.5" />
                  <span>B2B Campus</span>
                </span>
                {isCampus && (
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-semibold">
                    {isEn ? 'Active' : 'Aktif'}
                  </span>
                )}
              </div>
              <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mb-1">
                100k - 1M <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">{isEn ? 'per role' : 'per peran'}</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-3 leading-relaxed">
                {isEn ? 'Custom campus contract with 4-level RBAC' : 'Kontrak universitas dengan RBAC 4 tingkat'}
              </p>
              <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-1.5"><IconCheck className="h-3 w-3 text-emerald-500 shrink-0" /> {isEn ? 'Student: 100k / Lecturer: 500k' : 'Mhs: 100rb / Dosen: 500rb token'}</li>
                <li className="flex items-center gap-1.5"><IconCheck className="h-3 w-3 text-emerald-500 shrink-0" /> {isEn ? 'Domain Whitelist (@campus.ac.id)' : 'Domain Resmi & Google SSO'}</li>
                <li className="flex items-center gap-1.5"><IconCheck className="h-3 w-3 text-emerald-500 shrink-0" /> {isEn ? 'Executive Rector PDF Reports' : 'Laporan Eksekutif Rektorat & LPPM'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {isEn ? 'Need enterprise campus license?' : 'Butuh lisensi universitas?'} <a href="mailto:campus@scholarflow.com" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">{isEn ? 'Contact campus team' : 'Hubungi kemitraan kampus'}</a>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {isEn ? 'Close' : 'Tutup'}
            </button>
            
            {!isPro && !isCampus && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onUpgrade?.();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-sm shadow-indigo-200 dark:shadow-none transition cursor-pointer"
              >
                <IconCrown className="h-3.5 w-3.5" />
                <span>{isEn ? 'Upgrade to Pro (1M Tokens)' : 'Tingkatkan ke Pro (1 Juta Token)'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
