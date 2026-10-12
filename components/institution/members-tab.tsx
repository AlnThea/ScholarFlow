import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconSearch, IconUpload, IconUserPlus, IconTrash, 
  IconSchool, IconUserCheck, IconSparkles, IconEdit
} from '@tabler/icons-react';

interface MembersTabProps {
  isEn: boolean;
  members: any[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterRole: string;
  setFilterRole: (val: string) => void;
  filterDepartment?: string;
  setFilterDepartment?: (val: string) => void;
  departments?: string[];
  isLoading: boolean;
  currentPage: number;
  setCurrentPage: (val: number | ((prev: number) => number)) => void;
  itemsPerPage: number;
  filteredMembers: any[];
  currentMembers: any[];
  totalPages: number;
  setIsInviteModalOpen: (val: boolean) => void;
  handleRevoke: (id: string) => void;
  onBulkCSV?: (emails: string[]) => void;
  onUpdateMember?: (id: string, updates: any) => void;
}

export function MembersTab({
  isEn, members, searchQuery, setSearchQuery, filterRole, setFilterRole,
  filterDepartment = 'All', setFilterDepartment,
  departments = ['Fakultas Ilmu Komputer', 'Teknik Elektro', 'Fakultas Kedokteran', 'Ekonomi & Bisnis', 'Matematika & Sains', 'Rektorat & LPPM'],
  isLoading, currentPage, setCurrentPage, itemsPerPage, filteredMembers,
  currentMembers, totalPages, setIsInviteModalOpen, handleRevoke, onBulkCSV,
  onUpdateMember
}: MembersTabProps) {
  const [editingMemberId, setEditingMemberId] = React.useState<string | null>(null);

  return (
    <motion.div 
      key="members"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
    >
      <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-56">
            <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={isEn ? "Search members..." : "Cari nama / email..."}
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-500 dark:text-slate-200 transition"
            />
          </div>

          {/* Academic Role Filter */}
          <select 
            value={filterRole} 
            onChange={e => { setFilterRole(e.target.value); setCurrentPage(1); }}
            className="px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-500 dark:text-slate-200 transition"
          >
            <option value="All">{isEn ? 'All Roles' : 'Semua Peran'}</option>
            <option value="Super Admin">Super Admin (Rektorat)</option>
            <option value="Faculty Admin">Faculty Admin (Dekanat)</option>
            <option value="Lecturer">{isEn ? 'Lecturer / Advisor' : 'Dosen Pembimbing'}</option>
            <option value="Student">{isEn ? 'Student / Scholar' : 'Mahasiswa'}</option>
          </select>

          {/* Department Filter */}
          {setFilterDepartment && (
            <select 
              value={filterDepartment} 
              onChange={e => { setFilterDepartment(e.target.value); setCurrentPage(1); }}
              className="px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-500 dark:text-slate-200 transition"
            >
              <option value="All">{isEn ? 'All Faculties' : 'Semua Fakultas'}</option>
              {departments.map((dep) => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
          )}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer">
            <IconUpload className="w-4 h-4" />
            <span>{isEn ? 'Bulk CSV' : 'Unggah CSV'}</span>
            <input
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  const content = event.target?.result as string;
                  if (!content) return;
                  const emails = content
                    .split(/[\r\n,;]+/)
                    .map((item) => item.trim())
                    .filter((item) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item));
                  if (emails.length > 0 && onBulkCSV) {
                    onBulkCSV(emails);
                  } else {
                    alert(isEn ? 'No valid email addresses found in file.' : 'Tidak ditemukan format email yang valid di file.');
                  }
                };
                reader.readAsText(file);
                e.target.value = '';
              }}
            />
          </label>

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
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{isEn ? 'Civitas Member' : 'Anggota Civitas'}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{isEn ? 'Faculty / Dept' : 'Fakultas / Prodi'}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{isEn ? 'Academic Role' : 'Peran Akademik'}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{isEn ? 'AI Quota Usage' : 'Kuota AI Riset'}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{isEn ? 'Status' : 'Status'}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{isEn ? 'Actions' : 'Aksi'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 relative min-h-[300px]">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.tr key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 w-full h-full">
                  <td colSpan={6} className="w-full h-full">
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
                          <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded"></div>
                          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                          <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </td>
                </motion.tr>
              ) : currentMembers.length === 0 ? (
                <motion.tr key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                  <td colSpan={6}>
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
                currentMembers.map((member) => {
                  const usedTokens = member.ai_quota_used || 25000;
                  const limitTokens = member.ai_quota_limit || 100000;
                  const percentUsed = Math.min(100, Math.round((usedTokens / limitTokens) * 100));

                  return (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      key={member.id} 
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors w-full"
                    >
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-xs shrink-0">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">{member.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{member.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <IconSchool className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{member.department || (isEn ? 'General Academic' : 'Akademik Umum')}</span>
                        </span>
                      </td>

                      {/* Academic Role Changer */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={member.role}
                            onChange={(e) => {
                              if (onUpdateMember) {
                                onUpdateMember(member.id, { role: e.target.value });
                              }
                            }}
                            className={`text-xs font-bold px-2.5 py-1 rounded-lg border outline-none cursor-pointer transition ${
                              member.role === 'Super Admin'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
                                : member.role === 'Faculty Admin'
                                ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
                                : member.role === 'Lecturer'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/60 dark:text-slate-200 dark:border-slate-600'
                            }`}
                          >
                            <option value="Student">{isEn ? 'Student / Scholar' : 'Mahasiswa'}</option>
                            <option value="Lecturer">{isEn ? 'Lecturer / Advisor' : 'Dosen Pembimbing'}</option>
                            <option value="Faculty Admin">{isEn ? 'Faculty Admin' : 'Admin Fakultas/Prodi'}</option>
                            <option value="Super Admin">{isEn ? 'Super Admin' : 'Super Admin (Rektorat)'}</option>
                          </select>
                        </div>
                      </td>

                      {/* AI Quota Meter */}
                      <td className="px-6 py-4">
                        <div className="w-36 space-y-1">
                          <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                            <span>{(usedTokens / 1000).toFixed(0)}k</span>
                            <span>{(limitTokens / 1000).toFixed(0)}k tkn</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${percentUsed > 85 ? 'bg-rose-500' : 'bg-indigo-600'}`} 
                              style={{ width: `${percentUsed}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
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

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleRevoke(member.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition cursor-pointer"
                          title={isEn ? "Revoke Access" : "Cabut Akses"}
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
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
