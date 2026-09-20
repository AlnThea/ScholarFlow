import React, { useState } from 'react';
import { IconLoader, IconEdit } from '@tabler/icons-react';
import { Switch } from './editor-switch';

interface AdminModelsTabProps {
  isEn: boolean;
  aiModels: any[];
  handleOpenCreateProviderModal: () => void;
  handleOpenCreateModelModal: () => void;
  handleToggleModelStatus: (model: any) => void;
  handleOpenEditModelModal: (model: any) => void;
  handleDeleteModel: (id: string) => void;
  handleOpenEditProviderModal: (provider: any) => void;
  gatewaysList: any[];
  handleToggleGateway: (id: string) => void;
  togglingGatewayId: string | null;
  aiProviders: any[];
  DEFAULT_PROVIDERS: any[];
  handleDeleteProvider: (id: string) => void;
  handleTestModelConnection: (model: any) => void;
  testingModelId: string | null;
}

export function AdminModelsTab({
  isEn,
  aiModels,
  handleOpenCreateProviderModal,
  handleOpenCreateModelModal,
  handleToggleModelStatus,
  handleOpenEditModelModal,
  handleDeleteModel,
  handleOpenEditProviderModal,
  gatewaysList,
  handleToggleGateway,
  togglingGatewayId,
  aiProviders,
  DEFAULT_PROVIDERS,
  handleDeleteProvider,
  handleTestModelConnection,
  testingModelId
}: AdminModelsTabProps) {
  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in px-4 md:px-8 py-2">
      {/* Header Banner - Enterprise Rounded-XL */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-7 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 flex flex-col gap-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-md">
              AI Gateway Admin Panel
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold leading-tight text-slate-100">
            {isEn ? 'Manage AI Models & LLM Gateway' : 'Kelola Model AI & LLM Gateway'}
          </h1>
          <p className="text-xs text-slate-300 leading-normal font-normal">
            {isEn
              ? 'Configure AI models, API Model IDs (Google Gemini & OpenRouter), and set subscription access limits (Free vs Pro Writer).'
              : 'Atur model kecerdasan buatan, konfigurasi API Model ID (Google Gemini & OpenRouter), dan tentukan batasan paket langganan (Free vs Pro Writer).'}
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={handleOpenCreateProviderModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg shadow-sm transition-all duration-200 cursor-pointer"
          >
            <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.14.15-.3.3-.46.46m4.24-4.24a5 5 0 11-7.07 0 5 5 0 017.07 0z" />
            </svg>
            {isEn ? 'Manage Providers' : 'Kelola Provider AI'}
          </button>
          <button
            onClick={handleOpenCreateModelModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-200 cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {isEn ? 'Add New Model' : 'Tambah Model Baru'}
          </button>
        </div>
      </div>

      {/* Stats Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-500">{isEn ? 'Total AI Models' : 'Total Model AI'}</span>
            <span className="text-xl font-bold text-slate-900">{aiModels.length}</span>
          </div>
          <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600 font-bold text-xs">
            LLM
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-500">{isEn ? 'Free Tier Models' : 'Model Free Tier'}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl font-bold text-slate-900">
                {aiModels.filter(m => !m.is_premium).length}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                {aiModels.filter(m => !m.is_premium && m.is_enabled).length} {isEn ? 'Active' : 'Aktif'}
              </span>
            </div>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600 font-bold text-xs">
            FREE
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-500">{isEn ? 'Pro Writer Models' : 'Model Pro Writer'}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl font-bold text-slate-900">
                {aiModels.filter(m => m.is_premium).length}
              </span>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                {aiModels.filter(m => m.is_premium && m.is_enabled).length} {isEn ? 'Active' : 'Aktif'}
              </span>
            </div>
          </div>
          <div className="p-2.5 bg-amber-50 rounded-lg text-amber-600 font-bold text-xs">
            PRO
          </div>
        </div>
      </div>

      {/* Section 0: Registered AI Providers */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-md font-bold text-xs">
              🔌
            </span>
            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                {isEn ? 'Registered AI Providers & Gateways' : 'Provider AI Terdaftar & Gateway Kredensial'}
                <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
                  {(aiProviders || DEFAULT_PROVIDERS).length} {isEn ? 'Providers' : 'Provider'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                {isEn ? 'Configure API keys and endpoints once for multi-model integration.' : 'Konfigurasi API key dan base URL sekali saja untuk menghubungkan banyak model AI.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenCreateProviderModal}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition cursor-pointer self-start md:self-auto"
          >
            + {isEn ? 'Add Provider' : 'Tambah Provider AI'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200/70 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3 font-semibold min-w-[140px]">{isEn ? 'Provider ID' : 'ID Provider'}</th>
                <th className="px-6 py-3 font-semibold min-w-[200px]">{isEn ? 'Provider Name' : 'Nama Provider'}</th>
                <th className="px-6 py-3 font-semibold min-w-[140px]">{isEn ? 'Engine Type' : 'Tipe Engine'}</th>
                <th className="px-6 py-3 font-semibold min-w-[220px]">{isEn ? 'API Base URL' : 'API Base URL'}</th>
                <th className="px-6 py-3 font-semibold min-w-[160px]">{isEn ? 'API Key Status' : 'Status API Key'}</th>
                <th className="px-6 py-3 font-semibold text-center w-[140px]">{isEn ? 'Actions' : 'Aksi'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {(aiProviders || DEFAULT_PROVIDERS).map((provider) => (
                <tr key={provider.id} className="hover:bg-slate-50/60 transition-all duration-150">
                  <td className="px-6 py-4 align-middle font-mono font-bold text-slate-800">
                    {provider.id}
                  </td>
                  <td className="px-6 py-4 align-middle font-bold text-slate-900">
                    {provider.name}
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <span className="px-2 py-1 rounded-md text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                      {provider.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-middle font-mono text-[11px] text-slate-600">
                    {provider.base_url || <span className="text-slate-400 italic">Default API Endpoint</span>}
                  </td>
                  <td className="px-6 py-4 align-middle">
                    {provider.api_key ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[11px] font-bold border border-emerald-200/60">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        Key Set (...{provider.api_key.slice(-4)})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-mono text-[11px] font-bold border border-amber-200/60">
                        Global .env Key
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 align-middle text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEditProviderModal(provider)}
                        className="flex items-center justify-center p-2 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 rounded-lg transition cursor-pointer"
                        title="Edit detail provider & API Key"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                      {provider.is_built_in ? (
                        <span className="text-[10px] text-slate-400 font-bold px-1.5 py-1 bg-slate-100 rounded" title="Provider bawaan sistem tidak dapat dihapus">Built-in</span>
                      ) : (
                        <button
                          onClick={() => handleDeleteProvider(provider.id)}
                          className="flex items-center justify-center p-2 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
                          title="Hapus provider AI ini"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 1: Model Free Tier (Gratis) */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-md font-bold text-xs">
              🎁
            </span>
            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                {isEn ? 'Free Tier AI Models (Free)' : 'Model AI Free Tier (Gratis)'}
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">
                  {aiModels.filter(m => !m.is_premium).length} {isEn ? 'Models' : 'Model'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                {isEn ? 'Accessible directly by all basic account users (Free Writer).' : 'Dapat diakses langsung oleh seluruh pengguna akun dasar (Free Writer).'}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200/70 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3 font-semibold min-w-[140px]">{isEn ? 'Status & Toggle' : 'Status & Toggle'}</th>
                <th className="px-6 py-3 font-semibold min-w-[130px]">{isEn ? 'Gateway Key' : 'Gateway Key'}</th>
                <th className="px-6 py-3 font-semibold min-w-[200px]">{isEn ? 'Model Display Name' : 'Nama Tampilan Model'}</th>
                <th className="px-6 py-3 font-semibold min-w-[170px]">{isEn ? 'API Provider Type' : 'Tipe Provider API'}</th>
                <th className="px-6 py-3 font-semibold min-w-[240px]">{isEn ? 'Real API Model ID' : 'ID Model API Asli'}</th>
                <th className="px-6 py-3 font-semibold min-w-[130px]">{isEn ? 'Access Tier' : 'Hak Akses'}</th>
                <th className="px-6 py-3 font-semibold text-center w-[140px]">{isEn ? 'Actions' : 'Aksi'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {aiModels.filter(m => !m.is_premium).length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400 text-xs font-normal">
                    {isEn ? 'No Free Tier AI models added yet. Click Add New Model above.' : 'Belum ada model AI untuk Free Tier. Klik tombol Tambah Model Baru di atas.'}
                  </td>
                </tr>
              ) : (
                aiModels.filter(m => !m.is_premium).map((model) => (
                  <tr key={model.id} className="hover:bg-slate-50/60 transition-all duration-150">
                    {/* Status & Quick Toggle */}
                    <td className="px-6 py-4 align-middle">
                      <button
                        onClick={() => handleToggleModelStatus(model)}
                        className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none"
                        title={isEn ? 'Click to toggle active status' : 'Klik untuk mengubah status aktif/non-aktif'}
                      >
                        <div className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 transition-all duration-200 ease-in-out ${model.is_enabled
                          ? 'bg-emerald-500 border-emerald-600 shadow-sm shadow-emerald-500/20 ring-2 ring-emerald-500/20'
                          : 'bg-slate-300 border-slate-400/90 shadow-inner'
                          }`}>
                          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${model.is_enabled ? 'translate-x-5' : 'translate-x-0.5'
                            }`} />
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border transition-all ${model.is_enabled
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200/80'
                          : 'text-slate-600 bg-slate-100 border-slate-300'
                          }`}>
                          {model.is_enabled ? (isEn ? 'Active' : 'Aktif') : 'Off'}
                        </span>
                      </button>
                    </td>

                    {/* Gateway Key */}
                    <td className="px-6 py-4 align-middle font-bold text-slate-800 uppercase tracking-wide">
                      {model.id}
                    </td>

                    {/* Nama Tampilan Model */}
                    <td className="px-6 py-4 align-middle font-semibold text-slate-900 text-xs">
                      {model.name}
                    </td>

                    {/* Tipe Provider API */}
                    <td className="px-6 py-4 align-middle">
                      {model.provider_type === 'gemini' || model.id === 'gemini' || model.model_id.includes('gemini') ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                          Google Gemini
                        </span>
                      ) : model.provider_type === 'huggingface' ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Hugging Face
                        </span>
                      ) : model.provider_type === 'groq' ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Groq Cloud
                        </span>
                      ) : model.provider_type === 'together' ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          Together AI
                        </span>
                      ) : model.provider_type === 'custom_openai' || (model.base_url && model.base_url.trim().length > 0) ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                            Custom OpenAI
                          </span>
                          {model.base_url && (
                            <span className="text-[9px] font-mono text-slate-400 truncate max-w-[150px]" title={model.base_url}>
                              {model.base_url}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          OpenRouter
                        </span>
                      )}
                    </td>

                    {/* ID Model API Asli */}
                    <td className="px-6 py-4 align-middle font-mono text-[11px] text-slate-600">
                      {model.model_id}
                    </td>

                    {/* Akses Tier */}
                    <td className="px-6 py-4 align-middle">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-1 rounded-md uppercase tracking-wider">
                        Free Tier
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="px-6 py-4 align-middle text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Test Connection Button */}
                        <button
                          onClick={() => handleTestModelConnection(model)}
                          disabled={testingModelId === model.id}
                          className="flex items-center justify-center p-2 bg-sky-50 border border-sky-100 hover:bg-sky-100 text-sky-700 rounded-lg transition cursor-pointer disabled:opacity-50"
                          title="Uji Koneksi Model"
                        >
                          {testingModelId === model.id ? (
                            <IconLoader className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenEditModelModal(model)}
                          className="flex items-center justify-center p-2 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 rounded-lg transition cursor-pointer"
                          title="Edit detail model"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>

                        <button
                          onClick={() => handleDeleteModel(model.id)}
                          className="flex items-center justify-center p-2 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
                          title="Hapus model ini"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Model Pro Writer (Premium) */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-sm flex flex-col mb-10">
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-amber-100 text-amber-700 rounded-md font-bold text-xs">
              ⚡
            </span>
            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                {isEn ? 'Pro Writer AI Models (Premium)' : 'Model AI Pro Writer (Premium)'}
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">
                  {aiModels.filter(m => m.is_premium).length} {isEn ? 'Models' : 'Model'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                {isEn ? 'Exclusive to Pro Writer accounts (Requires active subscription via Pricing Plans).' : 'Eksklusif hanya untuk akun berbayar Pro Writer (Membutuhkan paket langganan aktif).'}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200/70 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3 font-semibold min-w-[140px]">{isEn ? 'Status & Toggle' : 'Status & Toggle'}</th>
                <th className="px-6 py-3 font-semibold min-w-[130px]">{isEn ? 'Gateway Key' : 'Gateway Key'}</th>
                <th className="px-6 py-3 font-semibold min-w-[200px]">{isEn ? 'Model Display Name' : 'Nama Tampilan Model'}</th>
                <th className="px-6 py-3 font-semibold min-w-[170px]">{isEn ? 'API Provider Type' : 'Tipe Provider API'}</th>
                <th className="px-6 py-3 font-semibold min-w-[240px]">{isEn ? 'Real API Model ID' : 'ID Model API Asli'}</th>
                <th className="px-6 py-3 font-semibold min-w-[130px]">{isEn ? 'Access Tier' : 'Hak Akses'}</th>
                <th className="px-6 py-3 font-semibold text-center w-[140px]">{isEn ? 'Actions' : 'Aksi'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {aiModels.filter(m => m.is_premium).length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400 text-xs font-normal">
                    {isEn ? 'No Pro Writer AI models added yet. Click Add New Model above and check "Pro Writer" tier.' : 'Belum ada model AI untuk Pro Writer. Klik tombol Tambah Model Baru di atas dan centang tier "Pro Writer".'}
                  </td>
                </tr>
              ) : (
                aiModels.filter(m => m.is_premium).map((model) => (
                  <tr key={model.id} className="hover:bg-slate-50/60 transition-all duration-150">
                    {/* Status & Quick Toggle */}
                    <td className="px-6 py-4 align-middle">
                      <button
                        onClick={() => handleToggleModelStatus(model)}
                        className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none"
                        title={isEn ? 'Click to toggle active status' : 'Klik untuk mengubah status aktif/non-aktif'}
                      >
                        <div className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 transition-all duration-200 ease-in-out ${model.is_enabled
                          ? 'bg-emerald-500 border-emerald-600 shadow-sm shadow-emerald-500/20 ring-2 ring-emerald-500/20'
                          : 'bg-slate-300 border-slate-400/90 shadow-inner'
                          }`}>
                          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${model.is_enabled ? 'translate-x-5' : 'translate-x-0.5'
                            }`} />
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border transition-all ${model.is_enabled
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200/80'
                          : 'text-slate-600 bg-slate-100 border-slate-300'
                          }`}>
                          {model.is_enabled ? (isEn ? 'Active' : 'Aktif') : 'Off'}
                        </span>
                      </button>
                    </td>

                    {/* Gateway Key */}
                    <td className="px-6 py-4 align-middle font-bold text-slate-800 uppercase tracking-wide">
                      {model.id}
                    </td>

                    {/* Nama Tampilan Model */}
                    <td className="px-6 py-4 align-middle font-semibold text-slate-900 text-xs">
                      {model.name}
                    </td>

                    {/* Tipe Provider API */}
                    <td className="px-6 py-4 align-middle">
                      {model.provider_type === 'gemini' || model.id === 'gemini' || model.model_id.includes('gemini') ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                          Google Gemini
                        </span>
                      ) : model.provider_type === 'huggingface' ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Hugging Face
                        </span>
                      ) : model.provider_type === 'groq' ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Groq Cloud
                        </span>
                      ) : model.provider_type === 'together' ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          Together AI
                        </span>
                      ) : model.provider_type === 'custom_openai' || (model.base_url && model.base_url.trim().length > 0) ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                            Custom OpenAI
                          </span>
                          {model.base_url && (
                            <span className="text-[9px] font-mono text-slate-400 truncate max-w-[150px]" title={model.base_url}>
                              {model.base_url}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          OpenRouter
                        </span>
                      )}
                    </td>

                    {/* ID Model API Asli */}
                    <td className="px-6 py-4 align-middle font-mono text-[11px] text-slate-600">
                      {model.model_id}
                    </td>

                    {/* Akses Tier */}
                    <td className="px-6 py-4 align-middle">
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1 w-max">
                        <IconEdit className="h-3 w-3" />
                        Pro Writer
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="px-6 py-4 align-middle text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Test Connection Button */}
                        <button
                          onClick={() => handleTestModelConnection(model)}
                          disabled={testingModelId === model.id}
                          className="flex items-center justify-center p-2 bg-sky-50 border border-sky-100 hover:bg-sky-100 text-sky-700 rounded-lg transition cursor-pointer disabled:opacity-50"
                          title="Uji Koneksi Model"
                        >
                          {testingModelId === model.id ? (
                            <IconLoader className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenEditModelModal(model)}
                          className="flex items-center justify-center p-2 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 rounded-lg transition cursor-pointer"
                          title="Edit detail model"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>

                        <button
                          onClick={() => handleDeleteModel(model.id)}
                          className="flex items-center justify-center p-2 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
                          title="Hapus model ini"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
