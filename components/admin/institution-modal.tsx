'use client';

import React, { useState, useEffect } from 'react';
import { IconX, IconBuildingBank, IconMail, IconUsers, IconCalendar, IconWorld, IconCheck, IconLoader } from '@tabler/icons-react';
import { Institution } from '@/lib/api/institutions';
import { useLanguage } from '@/components/i18n/language-context';

interface InstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
  editingInstitution?: Institution | null;
}

export function InstitutionModal({
  isOpen,
  onClose,
  onSave,
  editingInstitution
}: InstitutionModalProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [name, setName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [domainsInput, setDomainsInput] = useState('');
  const [totalSeats, setTotalSeats] = useState(50);
  const [contractStart, setContractStart] = useState('');
  const [contractEnd, setContractEnd] = useState('');
  const [status, setStatus] = useState<'active' | 'suspended' | 'expired'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingInstitution) {
      setName(editingInstitution.name);
      setAdminEmail(editingInstitution.admin_email);
      setDomainsInput(editingInstitution.domains.join(', '));
      setTotalSeats(editingInstitution.total_seats);
      setContractStart(editingInstitution.contract_start ? editingInstitution.contract_start.slice(0, 10) : '');
      setContractEnd(editingInstitution.contract_end ? editingInstitution.contract_end.slice(0, 10) : '');
      setStatus(editingInstitution.status);
    } else {
      setName('');
      setAdminEmail('');
      setDomainsInput('');
      setTotalSeats(100);
      const now = new Date();
      setContractStart(now.toISOString().slice(0, 10));
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      setContractEnd(nextYear.toISOString().slice(0, 10));
      setStatus('active');
    }
  }, [editingInstitution, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !adminEmail.trim()) return;

    setIsSubmitting(true);
    try {
      const parsedDomains = domainsInput
        .split(',')
        .map((d) => d.trim().replace(/^@/, ''))
        .filter((d) => d.length > 0);

      await onSave({
        name: name.trim(),
        admin_email: adminEmail.trim(),
        domains: parsedDomains,
        total_seats: Number(totalSeats) || 50,
        contract_start: new Date(contractStart).toISOString(),
        contract_end: new Date(contractEnd).toISOString(),
        status
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-800/60 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <IconBuildingBank className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {editingInstitution 
                  ? (isEn ? 'Edit Campus Partner' : 'Ubah Data Mitra Kampus') 
                  : (isEn ? 'Register New Campus Partner' : 'Daftarkan Mitra Kampus Baru')}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isEn ? 'Set up B2B licenses, email domain whitelist & quotas' : 'Atur lisensi B2B, whitelist domain email & kuota kursi'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <IconX className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-4 text-xs">
          {/* Nama Kampus */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <IconBuildingBank className="h-3.5 w-3.5 text-slate-400" />
              {isEn ? 'Institution / University Name' : 'Nama Institusi / Universitas'} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isEn ? 'e.g. Universitas Gadjah Mada' : 'Contoh: Universitas Gadjah Mada'}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Email PIC */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <IconMail className="h-3.5 w-3.5 text-slate-400" />
              {isEn ? 'Campus Admin / PIC Email' : 'Email PIC / Admin Kampus'} *
            </label>
            <input
              type="email"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="dekan.akademik@ugm.ac.id"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Kuota Kursi & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <IconUsers className="h-3.5 w-3.5 text-slate-400" />
                {isEn ? 'Seat Quota (Licenses)' : 'Kuota Lisensi (Kursi)'}
              </label>
              <input
                type="number"
                min={1}
                required
                value={totalSeats}
                onChange={(e) => setTotalSeats(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-200">
                {isEn ? 'Status' : 'Status Akun'}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="active">{isEn ? 'Active' : 'Aktif'}</option>
                <option value="suspended">{isEn ? 'Suspended' : 'Ditangguhkan'}</option>
                <option value="expired">{isEn ? 'Expired' : 'Kadaluarsa'}</option>
              </select>
            </div>
          </div>

          {/* Whitelisted Domain */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <IconWorld className="h-3.5 w-3.5 text-slate-400" />
              {isEn ? 'Whitelisted Domains (comma-separated)' : 'Domain Whitelist (pisahkan koma)'}
            </label>
            <input
              type="text"
              value={domainsInput}
              onChange={(e) => setDomainsInput(e.target.value)}
              placeholder="ugm.ac.id, mail.ugm.ac.id"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              {isEn ? 'Students registering with these domains will auto-join this license.' : 'Mahasiswa ber-email domain ini akan otomatis masuk ke lisensi kampus.'}
            </p>
          </div>

          {/* Masa Berlaku Kontrak */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <IconCalendar className="h-3.5 w-3.5 text-slate-400" />
                {isEn ? 'Start Date' : 'Tanggal Mulai'}
              </label>
              <input
                type="date"
                required
                value={contractStart}
                onChange={(e) => setContractStart(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <IconCalendar className="h-3.5 w-3.5 text-slate-400" />
                {isEn ? 'End Date' : 'Tanggal Berakhir'}
              </label>
              <input
                type="date"
                required
                value={contractEnd}
                onChange={(e) => setContractEnd(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold rounded-xl transition"
            >
              {isEn ? 'Cancel' : 'Batal'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <IconLoader className="h-4 w-4 animate-spin" />
                  <span>{isEn ? 'Saving...' : 'Menyimpan...'}</span>
                </>
              ) : (
                <>
                  <IconCheck className="h-4 w-4" />
                  <span>{isEn ? 'Save Institution' : 'Simpan Data'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
