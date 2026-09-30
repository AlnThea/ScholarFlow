"use client";

import React, { useState, useEffect } from "react";
import { MinimalSidebar } from '@/components/editor/minimal-sidebar';
import { useAuth } from "@/components/auth/auth-provider";
import { useLanguage } from '@/components/i18n/language-context';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconBuildingBank, IconUsers, IconChartLine, 
  IconSettings, IconShieldCheck, IconAlertTriangle, IconDownload, IconCheck, IconMail, IconX
} from '@tabler/icons-react';

import { MembersTab } from '@/components/institution/members-tab';
import { AnalyticsTab } from '@/components/institution/analytics-tab';
import { AuditTab } from '@/components/institution/audit-tab';
import { SettingsTab } from '@/components/institution/settings-tab';

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

  const [activeTab, setActiveTab] = useState<'members' | 'analytics' | 'audit' | 'settings'>('members');
  const [members, setMembers] = useState(initialMembers);
  const [searchQuery, setSearchQuery] = useState('');
  
  // NEW UX States
  const [isLoading, setIsLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<'All' | 'Admin' | 'Member'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [activeTab]);
  
  // Seat Management
  const totalSeats = 150;
  const usedSeats = members.length + 42; 
  const seatPercentage = (usedSeats / totalSeats) * 100;
  
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

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
    setIsInviteModalOpen(false);
    setInviteEmail('');
  };

  const handleRevoke = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  // Pagination Logic
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
      
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-5 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <IconBuildingBank className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
                Universitas Negeri Malang
              </h1>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {isEn ? 'Institution Portal' : 'Portal Institusi'}
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
            <IconDownload className="w-4 h-4" />
            {isEn ? 'Export Report' : 'Unduh Laporan'}
          </button>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          {/* KPI Cards */}
          <motion.div variants={{show: {transition: {staggerChildren: 0.1}}}} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <IconUsers className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${seatPercentage > 90 ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                  {usedSeats} / {totalSeats} {isEn ? 'Seats' : 'Kursi'}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                {seatPercentage.toFixed(1)}%
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                {isEn ? 'License Quota Allocated' : 'Kuota Lisensi Terpakai'}
              </p>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${seatPercentage > 90 ? 'bg-rose-500' : 'bg-indigo-600'}`} style={{ width: `${seatPercentage}%` }}></div>
              </div>
              {seatPercentage > 90 && (
                <div className="mt-3 flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  <IconAlertTriangle className="w-4 h-4" />
                  {isEn ? 'Approaching limit. Contact Sales.' : 'Mendekati batas. Hubungi Sales.'}
                </div>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <IconChartLine className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">3,842</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{isEn ? 'Total Documents Analyzed' : 'Total Dokumen Dianalisis'}</p>
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
              <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">100%</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[80%] relative z-10">{isEn ? 'System Compliance & Security Uptime' : 'Kepatuhan Keamanan & Uptime Sistem'}</p>
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

          {/* Tab Content Components */}
          <AnimatePresence mode="wait">
            {activeTab === 'members' && (
              <MembersTab 
                isEn={isEn} members={members} searchQuery={searchQuery} setSearchQuery={setSearchQuery} 
                filterRole={filterRole} setFilterRole={setFilterRole} isLoading={isLoading} 
                currentPage={currentPage} setCurrentPage={setCurrentPage} itemsPerPage={itemsPerPage} 
                filteredMembers={filteredMembers} currentMembers={currentMembers} totalPages={totalPages} 
                setIsInviteModalOpen={setIsInviteModalOpen} handleRevoke={handleRevoke} 
              />
            )}
            {activeTab === 'analytics' && <AnalyticsTab isEn={isEn} usageData={usageData} roleData={roleData} />}
            {activeTab === 'audit' && <AuditTab isEn={isEn} initialAuditLogs={initialAuditLogs} />}
            {activeTab === 'settings' && <SettingsTab isEn={isEn} />}
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
