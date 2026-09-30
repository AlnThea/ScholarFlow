"use client";

import React, { useState, useEffect } from "react";
import { MinimalSidebar } from '@/components/editor/minimal-sidebar';
import { useAuth } from "@/components/auth/auth-provider";
import { useLanguage } from '@/components/i18n/language-context';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconBuildingBank, IconUsers, IconUserPlus, IconChartLine, 
  IconSettings, IconMail, IconTrash, IconSearch, IconUpload,
  IconShieldCheck, IconAlertTriangle, IconDownload, IconCheck, IconX
} from '@tabler/icons-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

// --- MOCK DATA ---
const usageData = [
  { date: '10/01', users: 120, documents: 340 },
  { date: '10/05', users: 150, documents: 410 },
  { date: '10/10', users: 180, documents: 520 },
  { date: '10/15', users: 210, documents: 600 },
  { date: '10/20', users: 190, documents: 580 },
  { date: '10/25', users: 240, documents: 710 },
  { date: '10/30', users: 280, documents: 890 },
];

const roleData = [
  { name: 'Lecturer/Admin', value: 15, color: '#6366f1' },
  { name: 'Students', value: 85, color: '#10b981' },
];

const initialMembers = [
  { id: '1', name: 'Prof. Dahlan', email: 'dahlan@um.ac.id', role: 'Admin', status: 'Active', joined: '2026-01-15' },
  { id: '2', name: 'Dr. Sarah', email: 'sarah@um.ac.id', role: 'Admin', status: 'Active', joined: '2026-02-10' },
  { id: '3', name: 'Budi Santoso', email: 'budi.s@student.um.ac.id', role: 'Member', status: 'Active', joined: '2026-08-01' },
  { id: '4', name: 'Siti Aminah', email: 'siti.a@student.um.ac.id', role: 'Member', status: 'Active', joined: '2026-08-02' },
  { id: '5', name: 'Andi Kusuma', email: 'andi.k@student.um.ac.id', role: 'Member', status: 'Invited', joined: '-' },
];

const initialAuditLogs = [
  { id: '101', user: 'Prof. Dahlan', action: 'INVITE_USER', target: 'andi.k@student.um.ac.id', date: '2026-09-30 14:32', ip: '114.125.x.x' },
  { id: '102', user: 'System', action: 'BULK_IMPORT', target: 'Imported 40 new students via CSV', date: '2026-09-29 09:15', ip: 'Server' },
  { id: '103', user: 'Dr. Sarah', action: 'REVOKE_USER', target: 'alumni_2025@student.um.ac.id', date: '2026-09-28 16:05', ip: '114.125.x.x' },
  { id: '104', user: 'Prof. Dahlan', action: 'UPDATE_ORG', target: 'Changed Domain Whitelisting to @um.ac.id', date: '2026-09-25 10:00', ip: '114.125.x.x' },
  { id: '105', user: 'Prof. Dahlan', action: 'EXPORT_REPORT', target: 'Downloaded Q3 Usage Analytics', date: '2026-09-20 11:22', ip: '114.125.x.x' },
];

export default function InstitutionDashboard() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [activeTab, setActiveTab] = useState<'members' | 'analytics' | 'settings' | 'audit'>('members');
  const [members, setMembers] = useState(initialMembers);
  const [searchQuery, setSearchQuery] = useState('');
  
  // NEW UX States
  const [isLoading, setIsLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<'All' | 'Admin' | 'Member'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    // Simulate initial data fetching
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [activeTab]);
  
  // Seat Management
  const totalSeats = 150;
  const usedSeats = members.length + 42; // mock simulation
  const seatPercentage = (usedSeats / totalSeats) * 100;
  
  // Modal states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  // Handle Protection (If not institution/admin, redirect or show error)
  // In a real app, this connects to Supabase RBAC. We mock it passing for demonstration.

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setMembers([{
      id: Date.now().toString(),
      name: 'Pending User',
      email: inviteEmail,
      role: 'Member',
      status: 'Invited',
      joined: '-'
    }, ...members]);
    setInviteEmail('');
    setIsInviteModalOpen(false);
  };

  const handleRevoke = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  // Pagination & Filtering Logic
  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'All' || m.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const currentMembers = filteredMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans">
      <MinimalSidebar activeDashboardTab="admin" />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 md:p-10">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg text-white">
                <IconBuildingBank className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {isEn ? 'Institution Portal' : 'Portal Institusi'}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Universitas Negeri Malang (UM)
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                <IconDownload className="w-4 h-4" />
                {isEn ? 'Audit Log' : 'Unduh Log Audit'}
              </button>
            </div>
          </motion.div>

          {/* KPI Cards */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <IconUsers className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg">
                  {isEn ? 'Active Plan' : 'Paket Aktif'}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                {usedSeats} <span className="text-lg text-slate-400 font-medium">/ {totalSeats}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                {isEn ? 'Seats Allocated' : 'Lisensi Terpakai'}
              </p>
              
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${seatPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-2 rounded-full ${seatPercentage > 90 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                ></motion.div>
              </div>
              {seatPercentage > 90 && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-2 font-medium">
                  <IconAlertTriangle className="w-3 h-3" />
                  {isEn ? 'Approaching limit. Contact Sales to upgrade.' : 'Mendekati batas. Hubungi Sales untuk upgrade.'}
                </p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <IconChartLine className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                3,842
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn ? 'Total Documents Analyzed' : 'Total Dokumen Dianalisis'}
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <IconShieldCheck className="w-32 h-32 text-indigo-500" />
              </div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                  <IconCheck className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                100%
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[80%] relative z-10">
                {isEn ? 'System Compliance & Security Uptime' : 'Kepatuhan Keamanan & Uptime Sistem'}
              </p>
            </motion.div>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700 mb-6">
            {[
              { id: 'members', label: isEn ? 'Member Management' : 'Manajemen Anggota', icon: IconUsers },
              { id: 'analytics', label: isEn ? 'Usage Analytics' : 'Analitik Penggunaan', icon: IconChartLine },
              { id: 'audit', label: isEn ? 'Audit Logs' : 'Log Aktivitas', icon: IconShieldCheck },
              { id: 'settings', label: isEn ? 'Organization Settings' : 'Pengaturan Organisasi', icon: IconSettings },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition relative ${
                  activeTab === tab.id 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" 
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'members' && (
              <motion.div 
                key="members"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
              >
                {/* Toolbar */}
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

                {/* Data Table */}
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
                                  {isEn ? "We couldn't find any members matching your criteria. Try adjusting your filters or search query." : "Kami tidak dapat menemukan anggota yang sesuai kriteria. Sesuaikan filter atau pencarian Anda."}
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
                  
                  {/* Pagination Footer */}
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
            )}

            {activeTab === 'analytics' && (
              <motion.div 
                key="analytics"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Area Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6">{isEn ? 'Platform Adoption Rate' : 'Tingkat Adopsi Platform'}</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={usageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                        <XAxis dataKey="date" tick={{fontSize: 12}} axisLine={false} tickLine={false} stroke="#94a3b8" />
                        <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} stroke="#94a3b8" />
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">{isEn ? 'Role Distribution' : 'Distribusi Peran'}</h3>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={roleData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {roleData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex gap-4 mt-4">
                      {roleData.map(role => (
                        <div key={role.name} className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }}></div>
                          {role.name} ({role.value}%)
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'audit' && (
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
            )}

            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-2xl"
              >
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-6">{isEn ? 'General Settings' : 'Pengaturan Umum'}</h3>
                
                <div className="flex flex-col gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{isEn ? 'Organization Name' : 'Nama Organisasi'}</label>
                    <input type="text" defaultValue="Universitas Negeri Malang" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-500 transition" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{isEn ? 'Domain Whitelisting' : 'Domain Whitelisting'}</label>
                    <p className="text-xs text-slate-500 mb-3">{isEn ? 'Users signing up with these domains will automatically join your organization.' : 'Pengguna yang mendaftar dengan domain ini otomatis masuk ke organisasi Anda.'}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-sm font-medium rounded-lg border border-indigo-200 dark:border-indigo-800/50 flex items-center gap-2">
                        @um.ac.id
                        <button className="hover:text-rose-500"><IconX className="w-3 h-3" /></button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input type="text" placeholder="@student.um.ac.id" className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-500 transition" />
                      <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-sm font-semibold transition">{isEn ? 'Add' : 'Tambah'}</button>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                    <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-700 transition">
                      {isEn ? 'Save Changes' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Invite Modal Overlay */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{isEn ? 'Invite Members' : 'Undang Anggota'}</h3>
                <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <IconX className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleInvite}>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{isEn ? 'Email Address' : 'Alamat Email'}</label>
                  <div className="relative">
                    <IconMail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="email" 
                      required
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      placeholder="dosen@kampus.ac.id" 
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-500 transition" 
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{isEn ? 'Assign Role' : 'Beri Peran'}</label>
                  <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-500 transition">
                    <option value="member">Member</option>
                    <option value="admin">Institution Admin</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-700 transition">
                  {isEn ? 'Send Invitation' : 'Kirim Undangan'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
