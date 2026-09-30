import React from 'react';
import { motion } from 'framer-motion';
import { IconX } from '@tabler/icons-react';

interface SettingsTabProps {
  isEn: boolean;
}

export function SettingsTab({ isEn }: SettingsTabProps) {
  return (
    <motion.div 
      key="settings"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-2xl"
    >
      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-6">
        {isEn ? 'General Settings' : 'Pengaturan Umum'}
      </h3>
      
      <div className="flex flex-col gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {isEn ? 'Organization Name' : 'Nama Organisasi'}
          </label>
          <input type="text" defaultValue="Universitas Negeri Malang" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-500 transition" />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {isEn ? 'Domain Whitelisting' : 'Domain Whitelisting'}
          </label>
          <p className="text-xs text-slate-500 mb-3">
            {isEn ? 'Users signing up with these domains will automatically join your organization.' : 'Pengguna yang mendaftar dengan domain ini otomatis masuk ke organisasi Anda.'}
          </p>
          <div className="flex items-center gap-2 mb-2">
            <div className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-sm font-medium rounded-lg border border-indigo-200 dark:border-indigo-800/50 flex items-center gap-2">
              @um.ac.id
              <button className="hover:text-rose-500"><IconX className="w-3 h-3" /></button>
            </div>
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="@student.um.ac.id" className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-500 transition" />
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-sm font-semibold transition">
              {isEn ? 'Add' : 'Tambah'}
            </button>
          </div>
        </div>
        
        <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
          <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-700 transition">
            {isEn ? 'Save Changes' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
