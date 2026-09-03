import React from 'react';
import { createPortal } from 'react-dom';
import { IconDeviceFloppy, IconLoader } from '@tabler/icons-react';
import { Switch } from '../editor-switch';

type ModelModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isEn: boolean;
  selectedModelForModal: any;
  modalModelState: any;
  setModalModelState: React.Dispatch<React.SetStateAction<any>>;
  aiProviders: any[];
  DEFAULT_PROVIDERS: any[];
  handleOpenCreateProviderModal: () => void;
  handleOpenEditProviderModal: (prov: any) => void;
  handleTestModelConnection: () => void;
  testingModelId: string | null;
  handleSaveModalModel: () => void;
  savingModelId: string | null;
};

export const ModelModal = ({
  isOpen,
  onClose,
  isEn,
  selectedModelForModal,
  modalModelState,
  setModalModelState,
  aiProviders,
  DEFAULT_PROVIDERS,
  handleOpenCreateProviderModal,
  handleOpenEditProviderModal,
  handleTestModelConnection,
  testingModelId,
  handleSaveModalModel,
  savingModelId,
}: ModelModalProps) => {
  if (!isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-2xl w-full max-w-lg flex flex-col gap-4 animate-scale-in text-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-sm font-bold text-slate-900">
              {selectedModelForModal
                ? (isEn ? 'Edit AI Model Details' : 'Edit Detail Model AI')
                : (isEn ? 'Add New AI Model' : 'Tambah Model AI Baru')}
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              {isEn
                ? 'Configure LLM gateway, API provider, and subscription access.'
                : 'Atur gateway LLM, provider API, dan hak akses paket.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4 text-xs">
          {/* Provider Selection */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {isEn ? 'AI Provider' : 'Pilih Provider AI'}
              </label>
              <button
                type="button"
                onClick={handleOpenCreateProviderModal}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
              >
                + {isEn ? 'Add New Provider' : 'Tambah Provider AI'}
              </button>
            </div>
            <select
              value={modalModelState.provider_id || modalModelState.provider_type || 'openrouter'}
              onChange={(e) => {
                const selectedProv = (aiProviders || DEFAULT_PROVIDERS).find(p => p.id === e.target.value);
                setModalModelState((prev: any) => ({
                  ...prev,
                  provider_id: e.target.value,
                  provider_type: selectedProv?.type || (e.target.value as any),
                  base_url: selectedProv?.base_url || prev.base_url,
                  custom_api_key: selectedProv?.api_key || prev.custom_api_key
                }));
              }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition bg-white"
            >
              {(aiProviders || DEFAULT_PROVIDERS).map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* ID Gateway / Gateway Key */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {isEn ? 'Gateway Key (Unique System ID)' : 'Gateway Key (ID Sistem Unik)'}
            </label>
            <input
              type="text"
              disabled={!!selectedModelForModal}
              placeholder={isEn ? 'Example: gemini-flash, custom-deepseek, seller-gpt4' : 'Contoh: gemini-flash, custom-deepseek, seller-gpt4'}
              value={modalModelState.id}
              onChange={(e) => setModalModelState((prev: any) => ({ ...prev, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition bg-slate-50/50 disabled:bg-slate-100 disabled:text-slate-400 font-bold"
            />
          </div>

          {/* Nama Tampilan Model */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {isEn ? 'Model Display Name' : 'Nama Tampilan Model'}
            </label>
            <input
              type="text"
              placeholder={isEn ? 'Example: DeepSeek R1 (OpenAI Proxy)' : 'Contoh: DeepSeek R1 (OpenAI Proxy)'}
              value={modalModelState.name}
              onChange={(e) => setModalModelState((prev: any) => ({ ...prev, name: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition bg-white"
            />
          </div>

          {/* ID Model API Asli */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {isEn ? 'Real API Model ID' : 'ID Model API Asli'}
            </label>
            <input
              type="text"
              placeholder={isEn ? 'Example: deepseek-reasoner, gpt-4o, or anthropic/claude-3-5-sonnet' : 'Contoh: deepseek-reasoner, gpt-4o, atau anthropic/claude-3-5-sonnet'}
              value={modalModelState.model_id}
              onChange={(e) => setModalModelState((prev: any) => ({ ...prev, model_id: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition bg-white font-mono"
            />
          </div>

          {/* Linked Provider Information */}
          {(() => {
            const currentProv = (aiProviders || DEFAULT_PROVIDERS).find(p => p.id === (modalModelState.provider_id || modalModelState.provider_type));
            if (!currentProv) return null;
            return (
              <div className="flex items-center justify-between p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-xs animate-fade-in">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase text-indigo-700 tracking-wider">
                    {isEn ? 'Linked Provider Credentials' : 'Kredensial Provider Terhubung'}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {currentProv.name} ({currentProv.type.toUpperCase()})
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {currentProv.api_key ? `API Key: ...${currentProv.api_key.slice(-6)}` : (currentProv.base_url || '.env default key')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenEditProviderModal(currentProv)}
                  className="px-2.5 py-1 text-[10px] font-bold text-indigo-600 hover:bg-indigo-100 rounded border border-indigo-200 transition cursor-pointer shrink-0"
                >
                  {isEn ? 'Edit Provider' : 'Edit Provider'}
                </button>
              </div>
            );
          })()}

          {/* Toggle Enabled */}
          <div className="flex items-center justify-between p-3 border border-slate-200/80 rounded-lg bg-slate-50/50">

            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-700">{isEn ? 'Active Status' : 'Status Keaktifan'}</span>
              <span className="text-[9px] text-slate-400 leading-tight">
                {isEn ? 'Allows users to select and use this AI model when enabled.' : 'Mengizinkan pengguna menggunakan model AI ini jika diaktifkan.'}
              </span>
            </div>
            <Switch
              checked={modalModelState.is_enabled}
              onChange={() => setModalModelState((prev: any) => ({ ...prev, is_enabled: !prev.is_enabled }))}
            />
          </div>

          {/* Toggle Premium / Pro Writer */}
          <div className="flex items-center justify-between p-3.5 border border-slate-200/60 rounded-2xl bg-slate-50/20">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-700">{isEn ? 'Model Access (Pro Writer Only)' : 'Hak Akses Model (Khusus Pro Writer)'}</span>
              <span className="text-[9px] text-slate-400 leading-tight">
                {isEn ? 'Restrict this premium AI model to Pro subscribers only.' : 'Membatasi pemakaian model AI premium ini hanya untuk pelanggan Pro.'}
              </span>
            </div>
            <Switch
              checked={modalModelState.is_premium}
              onChange={() => setModalModelState((prev: any) => ({ ...prev, is_premium: !prev.is_premium }))}
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
          <button
            type="button"
            onClick={handleTestModelConnection}
            disabled={testingModelId !== null}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl transition duration-200 cursor-pointer disabled:opacity-50 shrink-0 whitespace-nowrap"
          >
            {testingModelId === (modalModelState.id || 'modal-preview') ? (
              <IconLoader className="h-3.5 w-3.5 animate-spin text-amber-700 shrink-0" />
            ) : (
              <svg className="h-3.5 w-3.5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            )}
            <span>{isEn ? 'Test Connection' : 'Uji Koneksi'}</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition cursor-pointer shrink-0 whitespace-nowrap"
            >
              <span>{isEn ? 'Cancel' : 'Batal'}</span>
            </button>
            <button
              type="button"
              onClick={handleSaveModalModel}
              disabled={savingModelId === modalModelState.id}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-indigo-500/20 transition duration-200 cursor-pointer shrink-0 whitespace-nowrap"
            >
              {savingModelId === modalModelState.id ? (
                <IconLoader className="h-3.5 w-3.5 animate-spin shrink-0" />
              ) : (
                <IconDeviceFloppy className="h-3.5 w-3.5 shrink-0" />
              )}
              <span>{isEn ? 'Save Model' : 'Simpan Data'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
