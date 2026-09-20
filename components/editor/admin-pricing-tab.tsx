import React from 'react';
import { IconLoader } from '@tabler/icons-react';

interface AdminPricingTabProps {
  handleOpenCreateModal: () => void;
  loadingAdminPlans: boolean;
  adminPlans: any[];
  handleOpenEditModal: (plan: any) => void;
  handleDeletePlan: (id: string) => void;
}

export function AdminPricingTab({
  handleOpenCreateModal,
  loadingAdminPlans,
  adminPlans,
  handleOpenEditModal,
  handleDeletePlan
}: AdminPricingTabProps) {
  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in px-4 md:px-8 py-2">
      {/* Header Banner - Enterprise Rounded-XL */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-7 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 flex flex-col gap-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-md">
              Pricing Control Panel
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold leading-tight text-slate-100">
            Kelola Paket Harga & Layanan
          </h1>
          <p className="text-xs text-slate-300 leading-normal font-normal">
            Atur harga paket langganan secara dinamis, berikan teks promosi musiman, ubah daftar fitur unggulan, dan kelola CRUD data paket.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="relative z-10 flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow-lg transition-all duration-200 cursor-pointer self-start md:self-auto"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Paket Baru
        </button>
      </div>

      {loadingAdminPlans ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200/90 rounded-xl shadow-sm">
          <IconLoader className="h-8 w-8 text-indigo-600 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Memuat data paket pricing...</span>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200/70 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3 font-semibold min-w-[140px]">ID Paket</th>
                  <th className="px-6 py-3 font-semibold min-w-[200px]">Nama Paket</th>
                  <th className="px-6 py-3 font-semibold min-w-[160px]">Harga (Rp)</th>
                  <th className="px-6 py-3 font-semibold min-w-[120px]">Periode</th>
                  <th className="px-6 py-3 font-semibold min-w-[220px]">Promo Tagline</th>
                  <th className="px-6 py-3 font-semibold text-center w-[140px]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {adminPlans.map((plan) => {
                  return (
                    <tr key={plan.id} className="hover:bg-slate-50/60 transition-all duration-150">
                      {/* ID Paket */}
                      <td className="px-6 py-4 align-middle font-mono font-bold text-slate-800">
                        {plan.id}
                      </td>

                      {/* Nama Paket */}
                      <td className="px-6 py-4 align-middle font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          {plan.name}
                          {plan.is_popular && (
                            <span className="text-[9px] font-bold text-amber-700 uppercase bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                              Terpopuler
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Harga */}
                      <td className="px-6 py-4 align-middle">
                        {plan.price === 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[11px] font-bold border border-emerald-200/60">
                            Gratis
                          </span>
                        ) : plan.price < 0 ? (
                          <span className="text-slate-500 font-medium">Custom (Hubungi Kami)</span>
                        ) : (
                          <span className="font-mono text-slate-700 font-medium text-[11px]">Rp {plan.price.toLocaleString('id-ID')}</span>
                        )}
                      </td>

                      {/* Periode */}
                      <td className="px-6 py-4 align-middle text-slate-600 capitalize">
                        {plan.price < 0 ? '-' : `/${plan.price_period}`}
                      </td>

                      {/* Promo Tagline */}
                      <td className="px-6 py-4 align-middle">
                        {plan.promo_text ? (
                          <span className="text-slate-600">{plan.promo_text}</span>
                        ) : (
                          <span className="text-slate-300 italic text-[11px]">- Kosong -</span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="px-6 py-4 align-middle text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(plan)}
                            className="flex items-center justify-center p-2 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 rounded-lg transition cursor-pointer"
                            title="Edit detail & fitur paket"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>

                          <button
                            onClick={() => handleDeletePlan(plan.id)}
                            className="flex items-center justify-center p-2.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-650 rounded-xl transition cursor-pointer"
                            title="Hapus paket langganan"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
