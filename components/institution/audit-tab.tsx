import React from 'react';
import { motion } from 'framer-motion';
import { IconShieldCheck } from '@tabler/icons-react';

interface AuditTabProps {
  isEn: boolean;
  initialAuditLogs: any[];
}

export function AuditTab({ isEn, initialAuditLogs }: AuditTabProps) {
  return (
    <motion.div 
      key="audit"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
    >
      <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <IconShieldCheck className="w-5 h-5 text-indigo-500" />
          {isEn ? 'Security & Activity Logs' : 'Log Aktivitas & Keamanan'}
        </h3>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-md">Last 30 Days</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{isEn ? 'Timestamp' : 'Waktu'}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{isEn ? 'Actor' : 'Aktor'}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{isEn ? 'Action' : 'Aksi'}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{isEn ? 'Target/Details' : 'Target/Detail'}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{isEn ? 'IP Address' : 'Alamat IP'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {initialAuditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {log.date}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{log.user}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md border uppercase tracking-wider ${
                    log.action.includes('REVOKE') || log.action.includes('DELETE')
                      ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50'
                      : log.action.includes('INVITE') || log.action.includes('IMPORT')
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/50'
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  {log.target}
                </td>
                <td className="px-6 py-4 text-right text-xs text-slate-400 font-mono">
                  {log.ip}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
