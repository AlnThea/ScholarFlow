'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IconX, IconCheck, IconLoader } from '@tabler/icons-react';
import { Institution } from '@/lib/api/institutions';

interface SettingsTabProps {
  isEn: boolean;
  institution?: Institution | null;
  onUpdateInstitution?: (updates: Partial<Institution>) => Promise<void>;
}

export function SettingsTab({ isEn, institution, onUpdateInstitution }: SettingsTabProps) {
  const [name, setName] = useState(institution?.name || 'Universitas Negeri Malang');
  const [domains, setDomains] = useState<string[]>(institution?.domains || ['um.ac.id']);
  const [newDomain, setNewDomain] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (institution) {
      setName(institution.name);
      setDomains(institution.domains || []);
    }
  }, [institution]);

  const handleAddDomain = () => {
    const clean = newDomain.trim().replace(/^@/, '');
    if (clean && !domains.includes(clean)) {
      setDomains([...domains, clean]);
      setNewDomain('');
    }
  };

  const handleRemoveDomain = (d: string) => {
    setDomains(domains.filter((item) => item !== d));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateInstitution) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onUpdateInstitution({
        name: name.trim(),
        domains
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      key="settings"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-2xl font-sans"
    >
      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-6">
        {isEn ? 'Campus Organization Settings' : 'Pengaturan Organisasi Kampus'}
      </h3>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {isEn ? 'Organization / University Name' : 'Nama Organisasi / Universitas'}
          </label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-500 dark:text-slate-100 transition" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {isEn ? 'Domain Whitelisting' : 'Domain Whitelisting'}
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            {isEn 
              ? 'Students and faculty signing up with these domains will automatically join your organization.' 
              : 'Mahasiswa dan dosen yang mendaftar dengan domain email ini otomatis bergabung ke lisensi kampus.'}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {domains.map((d) => (
              <div 
                key={d}
                className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-lg border border-indigo-200 dark:border-indigo-800 flex items-center gap-2"
              >
                <span>@{d}</span>
                <button 
                  type="button"
                  onClick={() => handleRemoveDomain(d)}
                  className="hover:text-rose-500 transition cursor-pointer"
                >
                  <IconX className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="e.g. student.campus.ac.id" 
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddDomain();
                }
              }}
              className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-500 dark:text-slate-100 transition" 
            />
            <button 
              type="button"
              onClick={handleAddDomain}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition cursor-pointer"
            >
              {isEn ? 'Add' : 'Tambah'}
            </button>
          </div>
        </div>
        
        <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <button 
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition cursor-pointer flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <IconLoader className="w-4 h-4 animate-spin" />
                <span>{isEn ? 'Saving...' : 'Menyimpan...'}</span>
              </>
            ) : (
              <span>{isEn ? 'Save Changes' : 'Simpan Perubahan'}</span>
            )}
          </button>
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <IconCheck className="w-4 h-4" />
              <span>{isEn ? 'Settings updated successfully!' : 'Pengaturan berhasil disimpan!'}</span>
            </span>
          )}
        </div>
      </form>
    </motion.div>
  );
}
