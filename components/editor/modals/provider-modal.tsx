import React from 'react';
import { createPortal } from 'react-dom';
import { IconDeviceFloppy } from '@tabler/icons-react';

type ProviderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isEn: boolean;
  selectedProviderForModal: any;
  modalProviderState: any;
  setModalProviderState: React.Dispatch<React.SetStateAction<any>>;
  handleSaveModalProvider: () => void;
};

export const ProviderModal = ({
  isOpen,
  onClose,
  isEn,
  selectedProviderForModal,
  modalProviderState,
  setModalProviderState,
  handleSaveModalProvider,
}: ProviderModalProps) => {
  if (!isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-2xl w-full max-w-md flex flex-col gap-4 animate-scale-in text-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-sm font-bold text-slate-900">
              {selectedProviderForModal
                ? (isEn ? 'Edit AI Provider' : 'Edit Provider AI')
                : (isEn ? 'Add New AI Provider' : 'Tambah Provider AI Baru')}
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              {isEn ? 'Configure API Key and Base URL once for all models under this provider.' : 'Konfigurasi API Key & Base URL sekali saja untuk semua model.'}
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
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {isEn ? 'Provider ID (Unique Key)' : 'ID Provider (Kunci Unik)'}
            </label>
            <input
              type="text"
              disabled={!!selectedProviderForModal}
              placeholder="Contoh: huggingface-prod, groq-main, my-seller-proxy"
              value={modalProviderState.id}
              onChange={(e) => setModalProviderState((prev: any) => ({ ...prev, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none font-bold bg-slate-50/50 disabled:bg-slate-100 disabled:text-slate-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {isEn ? 'Provider Display Name' : 'Nama Provider'}
            </label>
            <input
              type="text"
              placeholder="Contoh: Hugging Face Production Hub, Groq LPU Cloud"
              value={modalProviderState.name}
              onChange={(e) => setModalProviderState((prev: any) => ({ ...prev, name: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold outline-none bg-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {isEn ? 'Provider API Engine Type' : 'Tipe Engine Provider'}
            </label>
            <select
              value={modalProviderState.type}
              onChange={(e) => setModalProviderState((prev: any) => ({ ...prev, type: e.target.value as any }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold outline-none bg-white"
            >
              <option value="huggingface">Hugging Face Inference & Router API</option>
              <option value="groq">Groq Cloud API</option>
              <option value="together">Together AI API</option>
              <option value="custom_openai">Custom OpenAI-Compatible API</option>
              <option value="openrouter">OpenRouter API</option>
              <option value="gemini">Google Gemini Direct API</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
              {isEn ? 'API Base URL (Optional)' : 'API Base URL (Opsional)'}
            </label>
            <input
              type="text"
              placeholder="Default: https://router.huggingface.co/v1 atau https://api.groq.com/openai/v1"
              value={modalProviderState.base_url || ''}
              onChange={(e) => setModalProviderState((prev: any) => ({ ...prev, base_url: e.target.value }))}
              className="w-full border border-indigo-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono outline-none bg-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
              {isEn ? 'API Key (Input Once Here!)' : 'API Key (Input Sekali di Sini!)'}
            </label>
            <input
              type="password"
              placeholder="hf_xxxx / gsk_xxxx / tgp_xxxx / sk-xxxx..."
              value={modalProviderState.api_key || ''}
              onChange={(e) => setModalProviderState((prev: any) => ({ ...prev, api_key: e.target.value }))}
              className="w-full border border-indigo-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono outline-none bg-white"
            />
            <span className="text-[9px] text-slate-400">
              {isEn ? 'All models linked to this provider will automatically use this API key.' : 'Semua model yang terhubung ke provider ini akan otomatis memakai API key ini.'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition cursor-pointer shrink-0 whitespace-nowrap"
          >
            <span>{isEn ? 'Cancel' : 'Batal'}</span>
          </button>
          <button
            type="button"
            onClick={handleSaveModalProvider}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-indigo-500/20 transition duration-200 cursor-pointer shrink-0 whitespace-nowrap"
          >
            <IconDeviceFloppy className="h-3.5 w-3.5 shrink-0" />
            <span>{isEn ? 'Save Provider' : 'Simpan Provider'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
