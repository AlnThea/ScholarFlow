import React from 'react';
import { createPortal } from 'react-dom';
import { IconDeviceFloppy, IconLoader } from '@tabler/icons-react';
import { Switch } from '../editor-switch';

type PlanModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedPlanForModal: any;
  modalPlanState: any;
  setModalPlanState: React.Dispatch<React.SetStateAction<any>>;
  handleSaveModalPlan: () => void;
  savingPlanId: string | null;
};

export const PlanModal = ({
  isOpen,
  onClose,
  selectedPlanForModal,
  modalPlanState,
  setModalPlanState,
  handleSaveModalPlan,
  savingPlanId,
}: PlanModalProps) => {
  if (!isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-lg flex flex-col gap-5 animate-scale-in text-slate-800 dark:text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
            {selectedPlanForModal ? 'Edit Detail Paket Langganan' : 'Tambah Paket Baru'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-slate-650 transition cursor-pointer"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto max-h-[65vh] pr-1">
          {/* ID Paket */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">ID Paket (Sistem)</label>
            <input
              type="text"
              disabled={!!selectedPlanForModal}
              placeholder="Contoh: basic, pro, ultra"
              value={modalPlanState.id}
              onChange={(e) => setModalPlanState((prev: any) => ({ ...prev, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') }))}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition bg-slate-50/10 disabled:bg-slate-100/60 disabled:text-slate-400 font-bold"
            />
          </div>

          {/* Nama Paket */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Nama Paket</label>
            <input
              type="text"
              placeholder="Contoh: Premium Writer"
              value={modalPlanState.name}
              onChange={(e) => setModalPlanState((prev: any) => ({ ...prev, name: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-bold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition bg-slate-50/10"
            />
          </div>

          {/* Harga & Periode */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Harga (IDR / Rp)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400 dark:text-slate-500">Rp</span>
                <input
                  type="number"
                  value={modalPlanState.price}
                  onChange={(e) => {
                    const idrVal = parseInt(e.target.value) || 0;
                    setModalPlanState((prev: any) => ({
                      ...prev,
                      price: idrVal,
                      // Otomatis sarankan harga USD jika belum diisi khusus
                      price_usd: prev.price_usd ? prev.price_usd : (idrVal > 0 ? Number((idrVal / 16000).toFixed(2)) : null)
                    }));
                  }}
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800/80 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition bg-slate-50/10"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">Harga (USD / $)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-indigo-400 dark:text-indigo-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 9.99"
                  value={modalPlanState.price_usd ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : parseFloat(e.target.value);
                    setModalPlanState((prev: any) => ({ ...prev, price_usd: val }));
                  }}
                  className="w-full border border-indigo-200 dark:border-indigo-800/70 dark:bg-slate-800/80 rounded-xl pl-7 pr-3 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition bg-indigo-50/20"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Periode</label>
              <input
                type="text"
                placeholder="Contoh: /bulan, /tahun"
                value={modalPlanState.price_period}
                onChange={(e) => setModalPlanState((prev: any) => ({ ...prev, price_period: e.target.value }))}
                className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition bg-slate-50/10"
              />
            </div>
          </div>

          {/* Promo Tagline */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Promo Tagline</label>
            <input
              type="text"
              placeholder="Contoh: DISKON 30%"
              value={modalPlanState.promo_text || ''}
              onChange={(e) => setModalPlanState((prev: any) => ({ ...prev, promo_text: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-emerald-600 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition bg-slate-50/10"
            />
          </div>

          {/* Deskripsi */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Deskripsi Singkat</label>
            <textarea
              rows={2}
              placeholder="Deskripsi ringkas mengenai peruntukan paket..."
              value={modalPlanState.description || ''}
              onChange={(e) => setModalPlanState((prev: any) => ({ ...prev, description: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-650 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition bg-slate-50/10 resize-none font-medium"
            />
          </div>

          {/* Fitur Layanan */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Fitur Layanan (Satu baris = satu fitur)</label>
            <textarea
              rows={4}
              placeholder="Contoh:&#10;Upload PDF referensi tak terbatas&#10;Akses premium AI model&#10;Ekspor format Word (.doc)"
              value={modalPlanState.features.join('\n')}
              onChange={(e) => setModalPlanState((prev: any) => ({ ...prev, features: e.target.value.split('\n') }))}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-650 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition bg-slate-50/10 font-sans resize-y"
            />
          </div>

          {/* Toggle Popular */}
          <div className="flex items-center justify-between p-3.5 border border-slate-200/60 rounded-2xl bg-slate-50/20">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-700">Tandai sebagai Terpopuler</span>
              <span className="text-[9px] text-slate-400 leading-tight">Menampilkan lencana khusus pada pilihan pricing paket.</span>
            </div>
            <Switch
              checked={modalPlanState.is_popular}
              onChange={() => setModalPlanState((prev: any) => ({ ...prev, is_popular: !prev.is_popular }))}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleSaveModalPlan}
            disabled={savingPlanId === modalPlanState.id}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-indigo-200 transition duration-200 cursor-pointer"
          >
            {savingPlanId === modalPlanState.id ? (
              <IconLoader className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <IconDeviceFloppy className="h-3.5 w-3.5" />
            )}
            Simpan Data
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
