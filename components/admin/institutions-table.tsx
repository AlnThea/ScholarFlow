'use client';

import React, { useState } from 'react';
import { 
  IconBuildingBank, IconUsers, IconSearch, IconEdit, IconTrash, 
  IconWorld, IconCheck, IconAlertTriangle, IconClock
} from '@tabler/icons-react';
import { Institution } from '@/lib/api/institutions';
import { useLanguage } from '@/components/i18n/language-context';

interface InstitutionsTableProps {
  institutions: Institution[];
  onEdit: (inst: Institution) => void;
  onDelete: (id: string) => void;
  onOpenCreate: () => void;
}

export function InstitutionsTable({
  institutions,
  onEdit,
  onDelete,
  onOpenCreate
}: InstitutionsTableProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [search, setSearch] = useState('');

  const filtered = institutions.filter((inst) =>
    inst.name.toLowerCase().includes(search.toLowerCase()) ||
    inst.admin_email.toLowerCase().includes(search.toLowerCase()) ||
    inst.domains.some((d) => d.toLowerCase().includes(search.toLowerCase()))
  );

  const totalSeats = institutions.reduce((acc, curr) => acc + curr.total_seats, 0);
  const totalUsed = institutions.reduce((acc, curr) => acc + curr.used_seats, 0);
  const activeCount = institutions.filter((inst) => inst.status === 'active').length;

  return (
    <div className="flex flex-col gap-6 text-xs">
      {/* 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {isEn ? 'Total Campus Partners' : 'Total Mitra Kampus'}
            </span>
            <span className="text-2xl font-black text-slate-800 dark:text-white">
              {institutions.length}
            </span>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <IconBuildingBank className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {isEn ? 'Allocated Seats' : 'Alokasi Kursi Lisensi'}
            </span>
            <span className="text-2xl font-black text-slate-800 dark:text-white">
              {totalUsed} <span className="text-xs font-normal text-slate-400">/ {totalSeats}</span>
            </span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <IconUsers className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {isEn ? 'Active Contracts' : 'Kontrak Berjalan'}
            </span>
            <span className="text-2xl font-black text-slate-800 dark:text-white">
              {activeCount}
            </span>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
            <IconClock className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Action Bar & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isEn ? 'Search campus, domain, or PIC...' : 'Cari kampus, domain, atau PIC...'}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={onOpenCreate}
          className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <IconBuildingBank className="h-4 w-4" />
          <span>{isEn ? '+ Register Institution' : '+ Daftarkan Institusi Baru'}</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                <th className="px-5 py-3.5">{isEn ? 'Institution / University' : 'Institusi / Universitas'}</th>
                <th className="px-5 py-3.5">{isEn ? 'PIC & Domains' : 'PIC & Domain Whitelist'}</th>
                <th className="px-5 py-3.5">{isEn ? 'Seat Capacity' : 'Kapasitas Kursi'}</th>
                <th className="px-5 py-3.5">{isEn ? 'Contract Period' : 'Masa Kontrak'}</th>
                <th className="px-5 py-3.5">{isEn ? 'Status' : 'Status'}</th>
                <th className="px-5 py-3.5 text-center">{isEn ? 'Action' : 'Aksi'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500">
                    {isEn ? 'No campus partners found.' : 'Tidak ada data mitra kampus.'}
                  </td>
                </tr>
              ) : (
                filtered.map((inst) => {
                  const percent = Math.round((inst.used_seats / (inst.total_seats || 1)) * 100);
                  return (
                    <tr key={inst.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4 align-top">
                        <div className="font-bold text-slate-800 dark:text-white">{inst.name}</div>
                        <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">ID: {inst.id}</span>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="text-slate-700 dark:text-slate-300 font-medium">{inst.admin_email}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {inst.domains.map((d, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] border border-indigo-200/50 dark:border-indigo-800/50">
                              <IconWorld className="h-2.5 w-2.5" />
                              @{d}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top min-w-[140px]">
                        <div className="flex items-center justify-between mb-1 text-[11px]">
                          <span className="font-bold text-slate-700 dark:text-slate-300">{inst.used_seats} / {inst.total_seats}</span>
                          <span className="text-slate-400">{percent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${percent > 90 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, percent)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top text-slate-600 dark:text-slate-400">
                        <div>s/d {new Date(inst.contract_end).toLocaleDateString()}</div>
                      </td>
                      <td className="px-5 py-4 align-top">
                        {inst.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] border border-emerald-200 dark:border-emerald-800">
                            <IconCheck className="h-3 w-3" />
                            {isEn ? 'Active' : 'Aktif'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold text-[10px] border border-amber-200 dark:border-amber-800">
                            <IconAlertTriangle className="h-3 w-3" />
                            {inst.status}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 align-top text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEdit(inst)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition"
                            title={isEn ? 'Edit' : 'Ubah'}
                          >
                            <IconEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(isEn ? `Delete ${inst.name}?` : `Hapus ${inst.name}?`)) {
                                onDelete(inst.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition"
                            title={isEn ? 'Delete' : 'Hapus'}
                          >
                            <IconTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
