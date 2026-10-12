'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { useLanguage } from '@/components/i18n/language-context';
import { fetchInstitutions, createInstitution, updateInstitution, deleteInstitution, Institution } from '@/lib/api/institutions';
import { InstitutionsTable } from '@/components/admin/institutions-table';
import { InstitutionModal } from '@/components/admin/institution-modal';
import { IconBuildingBank, IconArrowLeft, IconLoader } from '@tabler/icons-react';
import Link from 'next/link';

export default function AdminInstitutionsPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInst, setEditingInst] = useState<Institution | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/login');
      } else if (profile && profile.role !== 'admin') {
        router.replace('/dashboard');
      }
    }
  }, [user, profile, authLoading, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchInstitutions();
      setInstitutions(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      loadData();
    }
  }, [user, profile]);

  const handleOpenCreate = () => {
    setEditingInst(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inst: Institution) => {
    setEditingInst(inst);
    setIsModalOpen(true);
  };

  const handleSave = async (payload: any) => {
    if (editingInst) {
      await updateInstitution(editingInst.id, payload);
    } else {
      await createInstitution(payload);
    }
    await loadData();
  };

  const handleDelete = async (id: string) => {
    await deleteInstitution(id);
    await loadData();
  };

  if (authLoading || (user && !profile)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <IconLoader className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans p-6 md:p-10">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Navigation Breadcrumb / Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition"
          >
            <IconArrowLeft className="h-4 w-4" />
            <span>{isEn ? 'Back to Dashboard' : 'Kembali ke Dashboard'}</span>
          </Link>
          <div className="flex items-center gap-2 text-xs">
            <Link href="/admin/pricing" className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              {isEn ? 'Pricing Plans' : 'Kelola Harga'}
            </Link>
            <Link href="/admin/gateways" className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              {isEn ? 'Payment Gateways' : 'Saluran Pembayaran'}
            </Link>
            <Link href="/admin/models" className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              {isEn ? 'AI Models' : 'Model AI'}
            </Link>
          </div>
        </div>

        {/* Top Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Enterprise B2B Management
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white">
              {isEn ? 'Campus & Institutional Partners' : 'Kelola Mitra Kampus & Institusi'}
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isEn
                ? 'Manage B2B license contracts, allocate seat quotas, configure domain whitelists, and provision university coordinator access in 30 seconds.'
                : 'Kelola kontrak lisensi B2B, alokasikan kuota kursi mahasiswa, konfigurasikan whitelist domain email kampus, dan beri hak akses PIC dalam 30 detik.'}
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition flex items-center gap-2 text-xs self-start md:self-auto cursor-pointer"
          >
            <IconBuildingBank className="h-4 w-4" />
            <span>{isEn ? '+ Register Campus' : '+ Daftarkan Kampus'}</span>
          </button>
        </div>

        {/* Main Content Table */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <IconLoader className="h-8 w-8 animate-spin text-indigo-600" />
            <span className="text-xs text-slate-400 font-semibold">
              {isEn ? 'Loading institutions data...' : 'Memuat data institusi...'}
            </span>
          </div>
        ) : (
          <InstitutionsTable
            institutions={institutions}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onOpenCreate={handleOpenCreate}
          />
        )}

        {/* Modal Component */}
        <InstitutionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          editingInstitution={editingInst}
        />
      </div>
    </div>
  );
}
