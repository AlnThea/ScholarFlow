import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconSearch, IconUpload, IconUserPlus, IconTrash } from '@tabler/icons-react';

interface MembersTabProps {
  isEn: boolean;
  members: any[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterRole: string;
  setFilterRole: (val: string) => void;
  isLoading: boolean;
  currentPage: number;
  setCurrentPage: (val: number | ((prev: number) => number)) => void;
  itemsPerPage: number;
  filteredMembers: any[];
  currentMembers: any[];
  totalPages: number;
  setIsInviteModalOpen: (val: boolean) => void;
  handleRevoke: (id: string) => void;
}

export function MembersTab({
  isEn, members, searchQuery, setSearchQuery, filterRole, setFilterRole,
  isLoading, currentPage, setCurrentPage, itemsPerPage, filteredMembers,
  currentMembers, totalPages, setIsInviteModalOpen, handleRevoke
}: MembersTabProps) {
  return (
    <motion.div 
      key="members"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
    >
      <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={isEn ? "Search members..." : "Cari anggota..."}
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-500 dark:text-slate-200 transition"
            />
          </div>
          <select 
            value={filterRole} 
            onChange={e => { setFilterRole(e.target.value as any); setCurrentPage(1); }}
            className="w-full sm:w-auto px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-500 dark:text-slate-200 transition"
          >
            <option value="All">{isEn ? 'All Roles' : 'Semua Peran'}</option>
            <option value="Admin">Admin</option>
            <option value="Member">Member</option>
          </select>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
            <IconUpload className="w-4 h-4" />
            {isEn ? 'Bulk CSV' : 'Unggah CSV'}
          </button>
          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm transition"
          >
            <IconUserPlus className="w-4 h-4" />
            {isEn ? 'Invite' : 'Undang'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{isEn ? 'Member' : 'Anggota'}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{isEn ? 'Role' : 'Peran'}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{isEn ? 'Status' : 'Status'}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{isEn ? 'Joined' : 'Bergabung'}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{isEn ? 'Actions' : 'Aksi'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 relative min-h-[300px]">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.tr key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 w-full h-full">
                  <td colSpan={5} className="w-full h-full">
                    <div className="flex flex-col gap-4 p-6">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center justify-between w-full animate-pulse">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                            <div className="space-y-2">
                              <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                              <div className="h-2 w-24 bg-slate-100 dark:bg-slate-800 rounded"></div>
                            </div>
                          </div>
                          <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                          <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </td>
                </motion.tr>
              ) : currentMembers.length === 0 ? (
                <motion.tr key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                  <td colSpan={5}>
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700">
                        <IconSearch className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
                        {isEn ? 'No members found' : 'Anggota tidak ditemukan'}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                        {isEn ? "We couldn't find any members matching your criteria." : "Kami tidak dapat menemukan anggota yang sesuai kriteria."}
                      </p>
                    </div>
                  </td>
                </motion.tr>
              ) : (
                currentMembers.map((member) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    key={member.id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors w-full"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-xs">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">{member.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] font-bold px-2 py-1 rounded-md border ${
                        member.role === 'Admin' 
                          ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50' 
                          : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] font-bold px-2 py-1 rounded-full flex items-center w-max gap-1 ${
                        member.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {member.joined}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleRevoke(member.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition"
                        title={isEn ? "Revoke Access" : "Cabut Akses"}
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
        
        {!isLoading && filteredMembers.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {isEn ? `Showing ${((currentPage - 1) * itemsPerPage) + 1} to ${Math.min(currentPage * itemsPerPage, filteredMembers.length)} of ${filteredMembers.length} entries` 
                    : `Menampilkan ${((currentPage - 1) * itemsPerPage) + 1} sampai ${Math.min(currentPage * itemsPerPage, filteredMembers.length)} dari ${filteredMembers.length} data`}
            </div>
            <div className="flex gap-1">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isEn ? 'Previous' : 'Sebelumnya'}
              </button>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isEn ? 'Next' : 'Berikutnya'}
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
