// components/editor/backend-settings-modal.tsx
'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  IconDatabase,
  IconServer,
  IconCheck,
  IconX,
  IconInfoCircle,
  IconCloudCheck,
  IconShieldLock,
  IconAlertTriangle,
  IconLock,
  IconSparkles,
} from '@tabler/icons-react';
import { useDataService, BackendType } from '@/lib/services';
import { useLanguage } from '@/components/i18n/language-context';
import { isProductionEnv, getAppEnv } from '@/lib/config/env';

interface BackendSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast?: (msg: string) => void;
}

export function BackendSettingsModal({
  isOpen,
  onClose,
  onToast,
}: BackendSettingsModalProps) {
  const { language } = useLanguage();
  const { backendType, setBackendType } = useDataService();

  const isProd = isProductionEnv();
  const currentEnv = getAppEnv();

  const [selectedBackend, setSelectedBackend] = useState<BackendType>(backendType);
  const [expressUrl, setExpressUrl] = useState<string>(
    process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:5000/api/v1'
  );

  // Safety Lock Guard States
  const [showSafetyGuard, setShowSafetyGuard] = useState(false);
  const [pendingBackendChoice, setPendingBackendChoice] = useState<BackendType | null>(null);

  if (!isOpen) return null;

  const handleCardClick = (choice: BackendType) => {
    if (choice === selectedBackend) return;

    if (isProd) {
      // In Production mode, show Production Lock Guard Notice
      const msg =
        language === 'en'
          ? '🔒 Production Mode: Backend switching is locked to server environment (.env)'
          : '🔒 Mode Production: Pengubahan backend dikunci ke konfigurasi server (.env)';
      if (onToast) onToast(msg);
      return;
    }

    // In Development mode, trigger Safety Guard Confirmation
    setPendingBackendChoice(choice);
    setShowSafetyGuard(true);
  };

  const confirmSafetySwitch = () => {
    if (pendingBackendChoice) {
      setSelectedBackend(pendingBackendChoice);
    }
    setShowSafetyGuard(false);
    setPendingBackendChoice(null);
  };

  const cancelSafetySwitch = () => {
    setShowSafetyGuard(false);
    setPendingBackendChoice(null);
  };

  const handleSave = () => {
    if (isProd) {
      onClose();
      return;
    }

    setBackendType(selectedBackend);
    const msg =
      language === 'en'
        ? `Backend provider updated to ${selectedBackend.toUpperCase()}`
        : `Provider backend berhasil diubah ke ${selectedBackend.toUpperCase()}`;
    if (onToast) onToast(msg);
    onClose();
  };

  const content = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <IconDatabase className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  {language === 'en'
                    ? 'Backend & Data Provider Architecture'
                    : 'Pengaturan Backend & Database Service'}
                </h3>
                {isProd ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    <IconLock className="w-3 h-3" />
                    PROD LOCKED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <IconSparkles className="w-3 h-3" />
                    DEV TESTING
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                {language === 'en'
                  ? `Environment Mode: ${currentEnv.toUpperCase()} | Active Provider: ${backendType.toUpperCase()}`
                  : `Mode Lingkungan: ${currentEnv.toUpperCase()} | Provider Aktif: ${backendType.toUpperCase()}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Info Banner */}
          {isProd ? (
            <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-900 flex items-start gap-3 text-xs leading-relaxed font-medium">
              <IconLock className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">
                  {language === 'en' ? 'Production Mode Active:' : 'Mode Production Aktif:'}
                </span>{' '}
                {language === 'en'
                  ? 'ScholarFlow is running in Production mode. Backend target is strictly controlled by server environment variables (.env). Direct UI switching is locked to prevent service disruption.'
                  : 'ScholarFlow berjalan dalam mode Production. Target backend dikontrol secara ketat oleh variabel lingkungan server (.env). Pengubahan langsung di UI dikunci demi mencegah gangguan layanan.'}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-100 text-indigo-900 flex items-start gap-3 text-xs leading-relaxed">
              <IconInfoCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">
                  {language === 'en' ? 'Development Mode Active:' : 'Mode Development Aktif:'}
                </span>{' '}
                {language === 'en'
                  ? 'Data Provider Pattern abstracts repository operations. You can test switching backend adapters interactively in Development.'
                  : 'Repository Pattern mengabstraksikan operasi data. Anda bebas menguji pergantian adapter backend secara interaktif di mode Development.'}
              </div>
            </div>
          )}

          {/* Backend Selector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Supabase Card */}
            <div
              onClick={() => handleCardClick('supabase')}
              className={`relative p-5 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between gap-4 ${
                isProd ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'
              } ${
                selectedBackend === 'supabase'
                  ? 'border-indigo-600 bg-indigo-50/30 shadow-md shadow-indigo-100'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <IconCloudCheck className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-sm text-slate-900">Supabase PaaS</span>
                  </div>
                  {selectedBackend === 'supabase' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                      <IconCheck className="w-3 h-3" />
                      {language === 'en' ? 'Active' : 'Aktif'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium mb-3">
                  {language === 'en'
                    ? 'Cloud Serverless PostgreSQL database with built-in Row Level Security (RLS) & Supabase Auth.'
                    : 'Database Serverless Cloud PostgreSQL dengan fitur Row Level Security (RLS) & Supabase Auth.'}
                </p>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-slate-100 text-[10px] text-slate-500 font-mono">
                <div className="flex justify-between">
                  <span>Engine:</span>
                  <span className="font-semibold text-slate-700">PostgreSQL</span>
                </div>
                <div className="flex justify-between">
                  <span>Auth:</span>
                  <span className="font-semibold text-slate-700">Supabase Auth (JWT)</span>
                </div>
              </div>
            </div>

            {/* Express.js Card */}
            <div
              onClick={() => handleCardClick('express')}
              className={`relative p-5 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between gap-4 ${
                isProd ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'
              } ${
                selectedBackend === 'express'
                  ? 'border-indigo-600 bg-indigo-50/30 shadow-md shadow-indigo-100'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <IconServer className="w-5 h-5 text-indigo-600" />
                    <span className="font-bold text-sm text-slate-900">Express.js VPS</span>
                  </div>
                  {selectedBackend === 'express' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                      <IconCheck className="w-3 h-3" />
                      {language === 'en' ? 'Active' : 'Aktif'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium mb-3">
                  {language === 'en'
                    ? 'Self-Hosted Express.js REST API server. Compatible with PostgreSQL, MySQL, and MariaDB.'
                    : 'Server Self-Hosted REST API Express.js. Kompatibel dengan PostgreSQL, MySQL, & MariaDB.'}
                </p>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-slate-100 text-[10px] text-slate-500 font-mono">
                <div className="flex justify-between">
                  <span>Engine:</span>
                  <span className="font-semibold text-slate-700">PostgreSQL / MySQL</span>
                </div>
                <div className="flex justify-between">
                  <span>Auth:</span>
                  <span className="font-semibold text-slate-700">Bearer Token Header</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Config for Express */}
          {selectedBackend === 'express' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 animate-fade-in">
              <label className="block text-xs font-bold text-slate-700">
                {language === 'en' ? 'Express API Endpoint URL' : 'URL Endpoint API Express.js'}
              </label>
              <input
                type="text"
                disabled={isProd}
                value={expressUrl}
                onChange={(e) => setExpressUrl(e.target.value)}
                placeholder="http://localhost:5000/api/v1"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
              <p className="text-[10px] text-slate-400 font-medium">
                {language === 'en'
                  ? 'Specified via process.env.NEXT_PUBLIC_EXPRESS_API_URL or local server.'
                  : 'Dapat ditentukan via process.env.NEXT_PUBLIC_EXPRESS_API_URL atau VPS lokal.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            {language === 'en' ? 'Close' : 'Tutup'}
          </button>
          {!isProd && (
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {language === 'en' ? 'Apply Backend Architecture' : 'Simpan & Terapkan Backend'}
            </button>
          )}
        </div>
      </div>

      {/* Safety Guard Confirmation Overlay for Dev Mode */}
      {showSafetyGuard && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-amber-200 overflow-hidden p-6 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-100 text-amber-600 border border-amber-200">
                <IconAlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {language === 'en'
                    ? '⚠️ Dev Testing Switch Guard'
                    : '⚠️ Konfirmasi Switch Backend (Dev)'}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  {language === 'en'
                    ? 'Confirm testing switch'
                    : 'Konfirmasi pengujian beralih adapter'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 leading-relaxed font-medium">
              {language === 'en'
                ? `You are requesting to test switching active backend adapter to [${pendingBackendChoice?.toUpperCase()}]. Do you wish to proceed?`
                : `Anda meminta untuk menguji beralih adapter backend ke [${pendingBackendChoice?.toUpperCase()}]. Apakah Anda yakin ingin melanjutkan?`}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={cancelSafetySwitch}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {language === 'en' ? 'Cancel' : 'Batal'}
              </button>
              <button
                onClick={confirmSafetySwitch}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                {language === 'en' ? 'Yes, Proceed Testing' : 'Ya, Lanjutkan Pengujian'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(content, document.body);
}
