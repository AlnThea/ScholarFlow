"use client";

import React, { useState, useEffect } from "react";
import { MinimalSidebar } from '@/components/editor/minimal-sidebar';
import { useAuth } from "@/components/auth/auth-provider";
import { useLanguage } from '@/components/i18n/language-context';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconBuildingBank, IconUsers, IconChartLine, 
  IconSettings, IconShieldCheck, IconAlertTriangle, IconDownload, 
  IconCheck, IconMail, IconX, IconArrowLeft, IconLoader, IconChevronDown,
  IconFileText
} from '@tabler/icons-react';

import { MembersTab } from '@/components/institution/members-tab';
import { AnalyticsTab } from '@/components/institution/analytics-tab';
import { AuditTab } from '@/components/institution/audit-tab';
import { SettingsTab } from '@/components/institution/settings-tab';
import { printExecutivePdfReport } from '@/lib/institution/executive-pdf-generator';

import {
  fetchInstitutions,
  fetchInstitutionMembers,
  addInstitutionMember,
  bulkAddInstitutionMembers,
  revokeInstitutionMember,
  fetchInstitutionAuditLogs,
  addInstitutionAuditLog,
  updateInstitution,
  updateInstitutionMember,
  Institution,
  InstitutionMember,
  InstitutionAuditLog
} from '@/lib/api/institutions';

export default function InstitutionDashboard() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [currentInst, setCurrentInst] = useState<Institution | null>(null);
  const [members, setMembers] = useState<InstitutionMember[]>([]);
  const [auditLogs, setAuditLogs] = useState<InstitutionAuditLog[]>([]);

  const [activeTab, setActiveTab] = useState<'members' | 'analytics' | 'audit' | 'settings'>('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>('All');
  const [filterDepartment, setFilterDepartment] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<any>('Student');
  const [inviteDepartment, setInviteDepartment] = useState('Fakultas Ilmu Komputer');
  const [isInviting, setIsInviting] = useState(false);

  const departmentsList = [
    'Fakultas Ilmu Komputer',
    'Teknik Elektro',
    'Fakultas Kedokteran',
    'Ekonomi & Bisnis',
    'Matematika & Sains',
    'Rektorat & LPPM'
  ];

  // 1. Auth Guard
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/login');
      } else if (
        profile &&
        profile.role !== 'admin' &&
        profile.role !== ('campus_admin' as any) &&
        profile.subscription_plan !== 'institution'
      ) {
        router.replace('/dashboard');
      }
    }
  }, [user, profile, authLoading, router]);

  // 2. Load Institutions & Select Matching Institution
  const loadInstitutionsData = async () => {
    setIsLoading(true);
    try {
      const allInst = await fetchInstitutions();
      setInstitutions(allInst);

      if (allInst.length > 0) {
        // Cari institusi yang cocok dengan email user
        const matching = allInst.find((inst) => inst.admin_email.toLowerCase() === user?.email?.toLowerCase());
        const selected = matching || allInst[0];
        setCurrentInst(selected);

        // Load members & audit logs untuk institusi terpilih
        const mems = await fetchInstitutionMembers(selected.id);
        setMembers(mems);

        const logs = await fetchInstitutionAuditLogs(selected.id);
        setAuditLogs(logs);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && profile) {
      loadInstitutionsData();
    }
  }, [user, profile]);

  // Switch Institution (untuk Super Admin)
  const handleSelectInstitution = async (inst: Institution) => {
    setCurrentInst(inst);
    setIsLoading(true);
    try {
      const mems = await fetchInstitutionMembers(inst.id);
      setMembers(mems);
      const logs = await fetchInstitutionAuditLogs(inst.id);
      setAuditLogs(logs);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  };

  // Quota calculation
  const totalSeats = currentInst?.total_seats || 50;
  const usedSeats = members.length;
  const seatPercentage = Math.min(100, (usedSeats / totalSeats) * 100);

  // Actions
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !currentInst) return;

    if (usedSeats >= totalSeats) {
      alert(
        isEn
          ? 'License capacity full! Please contact the administrator to expand seat quota.'
          : 'Kapasitas lisensi telah penuh! Silakan hubungi administrator untuk menambah kuota kursi.'
      );
      return;
    }

    setIsInviting(true);
    try {
      const newMember = await addInstitutionMember(currentInst.id, {
        name: inviteName.trim() || inviteEmail.split('@')[0],
        email: inviteEmail.trim(),
        role: inviteRole,
        department: inviteDepartment,
        ai_quota_used: 0,
        ai_quota_limit: inviteRole === 'Lecturer' || inviteRole === 'Super Admin' ? 500000 : 100000,
        status: 'Invited'
      });

      setMembers([newMember, ...members]);
      await addInstitutionAuditLog(currentInst.id, {
        user: user?.email || 'Campus Admin',
        action: 'INVITE_USER',
        target: `${inviteEmail.trim()} (${inviteRole} - ${inviteDepartment})`,
        ip: 'Browser'
      });

      const updatedLogs = await fetchInstitutionAuditLogs(currentInst.id);
      setAuditLogs(updatedLogs);

      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteName('');
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateMember = async (memberId: string, updates: Partial<InstitutionMember>) => {
    if (!currentInst) return;
    const target = members.find((m) => m.id === memberId);
    if (!target) return;

    // Auto-adjust AI limit if role changes
    const quotaLimit = updates.role === 'Lecturer' || updates.role === 'Super Admin' 
      ? 500000 
      : updates.role === 'Faculty Admin' 
      ? 250000 
      : 100000;

    const mergedUpdates = { ...updates, ai_quota_limit: quotaLimit };
    await updateInstitutionMember(currentInst.id, memberId, mergedUpdates);

    setMembers(members.map((m) => m.id === memberId ? { ...m, ...mergedUpdates } : m));

    await addInstitutionAuditLog(currentInst.id, {
      user: user?.email || 'Campus Admin',
      action: 'UPDATE_ROLE',
      target: `Promoted ${target.email} to ${updates.role || target.role}`,
      ip: 'Browser'
    });

    const updatedLogs = await fetchInstitutionAuditLogs(currentInst.id);
    setAuditLogs(updatedLogs);
  };

  const handleRevoke = async (memberId: string) => {
    if (!currentInst) return;
    const targetMember = members.find((m) => m.id === memberId);
    if (!confirm(isEn ? `Revoke license for ${targetMember?.email || 'this member'}?` : `Cabut lisensi untuk ${targetMember?.email || 'anggota ini'}?`)) {
      return;
    }

    await revokeInstitutionMember(currentInst.id, memberId);
    setMembers(members.filter((m) => m.id !== memberId));

    await addInstitutionAuditLog(currentInst.id, {
      user: user?.email || 'Campus Admin',
      action: 'REVOKE_USER',
      target: targetMember?.email || memberId,
      ip: 'Browser'
    });

    const updatedLogs = await fetchInstitutionAuditLogs(currentInst.id);
    setAuditLogs(updatedLogs);
  };

  const handleBulkCSV = async (emails: string[]) => {
    if (!currentInst) return;
    const available = Math.max(0, totalSeats - usedSeats);
    if (available <= 0) {
      alert(isEn ? 'Seat quota full! Cannot add more members.' : 'Kuota lisensi penuh! Tidak dapat menambahkan anggota.');
      return;
    }

    const toAdd = emails.slice(0, available);
    const addedCount = await bulkAddInstitutionMembers(currentInst.id, toAdd);

    await addInstitutionAuditLog(currentInst.id, {
      user: user?.email || 'Campus Admin',
      action: 'BULK_IMPORT',
      target: `Imported ${addedCount} members via CSV`,
      ip: 'Browser'
    });

    const updatedMems = await fetchInstitutionMembers(currentInst.id);
    setMembers(updatedMems);
    const updatedLogs = await fetchInstitutionAuditLogs(currentInst.id);
    setAuditLogs(updatedLogs);

    alert(isEn ? `Successfully imported ${addedCount} members!` : `Berhasil menambahkan ${addedCount} anggota!`);
  };

  const handleUpdateSettings = async (updates: Partial<Institution>) => {
    if (!currentInst) return;
    await updateInstitution(currentInst.id, updates);
    setCurrentInst({ ...currentInst, ...updates });

    await addInstitutionAuditLog(currentInst.id, {
      user: user?.email || 'Campus Admin',
      action: 'UPDATE_ORG',
      target: `Updated settings for ${currentInst.name}`,
      ip: 'Browser'
    });

    const updatedLogs = await fetchInstitutionAuditLogs(currentInst.id);
    setAuditLogs(updatedLogs);
  };

  // Dynamic calculations for 4 Academic Roles
  const superAdminCount = members.filter((m) => m.role === 'Super Admin').length;
  const facultyAdminCount = members.filter((m) => m.role === 'Faculty Admin').length;
  const lecturerCount = members.filter((m) => m.role === 'Lecturer' || m.role === 'Admin').length;
  const studentCount = members.filter((m) => m.role === 'Student' || m.role === 'Member').length;

  const roleData = [
    { name: isEn ? 'Super Admin (Rektorat)' : 'Super Admin', value: Math.max(1, superAdminCount), color: '#6366f1' },
    { name: isEn ? 'Faculty Admin' : 'Admin Fakultas', value: Math.max(1, facultyAdminCount), color: '#a855f7' },
    { name: isEn ? 'Lecturers' : 'Dosen Pembimbing', value: Math.max(1, lecturerCount), color: '#10b981' },
    { name: isEn ? 'Students' : 'Mahasiswa', value: Math.max(1, studentCount), color: '#06b6d4' }
  ];

  const usageData = [
    { date: 'Wk 1', users: Math.round(usedSeats * 0.4), documents: Math.round(usedSeats * 1.5) },
    { date: 'Wk 2', users: Math.round(usedSeats * 0.6), documents: Math.round(usedSeats * 2.2) },
    { date: 'Wk 3', users: Math.round(usedSeats * 0.8), documents: Math.round(usedSeats * 3.1) },
    { date: 'Wk 4', users: usedSeats, documents: Math.round(usedSeats * 4.2) }
  ];

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  // Filtered & Paginated Members with Role and Department Support
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.department && m.department.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = filterRole === 'All' || m.role === filterRole;
    const matchesDept = filterDepartment === 'All' || m.department === filterDepartment;
    return matchesSearch && matchesRole && matchesDept;
  });

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const currentMembers = filteredMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (authLoading || (user && !profile) || (!currentInst && isLoading)) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <IconLoader className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans">
      <MinimalSidebar activeDashboardTab="admin" />

      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Dynamic Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-5 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <IconBuildingBank className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  {currentInst?.name || 'Universitas Mitra'}
                </h1>
                {profile?.role === 'admin' && institutions.length > 1 && (
                  <select
                    value={currentInst?.id}
                    onChange={(e) => {
                      const found = institutions.find((i) => i.id === e.target.value);
                      if (found) handleSelectInstitution(found);
                    }}
                    className="text-xs bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 outline-none text-slate-700 dark:text-slate-200"
                  >
                    {institutions.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {isEn ? 'Institution B2B Portal' : 'Portal Institusi B2B'} • {currentInst?.domains?.map((d) => `@${d}`).join(', ') || '@campus.ac.id'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
            >
              <IconArrowLeft className="w-4 h-4" />
              <span>{isEn ? 'Back to Workspace' : 'Kembali ke Workspace'}</span>
            </button>
            {/* Export Actions (CSV Data & Official Executive PDF) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (!currentInst) return;
                  const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Joined Date'];
                  const rows = members.map((m) => [
                    m.id,
                    `"${m.name.replace(/"/g, '""')}"`,
                    m.email,
                    m.role,
                    m.status,
                    m.joined
                  ]);
                  const summary = [
                    [],
                    ['--- INSTITUTION SUMMARY ---'],
                    ['Institution Name', `"${currentInst.name.replace(/"/g, '""')}"`],
                    ['Total Seats Quota', currentInst.total_seats],
                    ['Used Seats', members.length],
                    ['Available Seats', Math.max(0, currentInst.total_seats - members.length)],
                    ['Contract Expiry', currentInst.contract_end || 'N/A'],
                    ['Export Date', new Date().toLocaleString()]
                  ];
                  const csvContent = 'data:text/csv;charset=utf-8,' + 
                    [headers.join(','), ...rows.map(r => r.join(',')), ...summary.map(s => s.join(','))].join('\n');
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement('a');
                  link.setAttribute('href', encodedUri);
                  link.setAttribute('download', `ScholarFlow_Report_${currentInst.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-650 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                title={isEn ? "Export raw members CSV" : "Unduh data mentah CSV"}
              >
                <IconDownload className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>

              <button
                onClick={async () => {
                  if (!currentInst) return;
                  const deptSummary = [
                    { name: 'Fakultas Ilmu Komputer', drafts: 142, seats: 48 },
                    { name: 'Teknik Elektro', drafts: 98, seats: 34 },
                    { name: 'Fakultas Kedokteran', drafts: 115, seats: 39 },
                    { name: 'Ekonomi & Bisnis', drafts: 76, seats: 28 },
                    { name: 'Matematika & Sains', drafts: 64, seats: 22 },
                  ];
                  const roles = [
                    { role: 'Super Admin (Rektorat)', count: superAdminCount },
                    { role: 'Faculty Admin (Dekanat/Prodi)', count: facultyAdminCount },
                    { role: 'Dosen Pembimbing', count: lecturerCount },
                    { role: 'Mahasiswa / Peneliti', count: studentCount },
                  ];
                  await printExecutivePdfReport({
                    institutionName: currentInst.name,
                    adminEmail: currentInst.admin_email,
                    totalSeats: currentInst.total_seats,
                    usedSeats: members.length,
                    contractEnd: currentInst.contract_end || '2027',
                    adoptionRate: 89.4,
                    totalDrafts: 495,
                    tokensConsumed: '1.58M',
                    approvalRate: '94.2%',
                    departments: deptSummary,
                    roleDistribution: roles,
                    isEn
                  });
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
                title={isEn ? "Generate Executive Brief PDF for Rector" : "Cetak Laporan Eksekutif PDF untuk Rektor"}
              >
                <IconFileText className="w-4 h-4" />
                <span>{isEn ? 'Executive PDF' : 'PDF Rektorat'}</span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          {/* Dynamic KPI Cards */}
          <motion.div variants={{ show: { transition: { staggerChildren: 0.1 } } }} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                <div className={`h-full rounded-full transition-all duration-500 ${seatPercentage > 90 ? 'bg-rose-500' : 'bg-indigo-600'}`} style={{ width: `${seatPercentage}%` }}></div>
              </div>
              {seatPercentage > 90 && (
                <div className="mt-3 flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  <IconAlertTriangle className="w-4 h-4" />
                  {isEn ? 'Approaching limit. Contact Sales to expand.' : 'Mendekati batas. Hubungi Sales untuk ekspansi.'}
                </div>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <IconChartLine className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                {(usedSeats * 18).toLocaleString('id-ID')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{isEn ? 'Estimated Research Drafts' : 'Estimasi Naskah Riset Mahasiswa'}</p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                  <IconShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                {currentInst?.status === 'active' ? (isEn ? 'Active' : 'Aktif') : currentInst?.status}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn ? 'Contract Status' : 'Status Kontrak Lisensi'}
              </p>
            </motion.div>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6 gap-8">
            {[
              { id: 'members', label: isEn ? 'Members Management' : 'Kelola Anggota', icon: IconUsers },
              { id: 'analytics', label: isEn ? 'Usage Analytics' : 'Analitik Riset', icon: IconChartLine },
              { id: 'audit', label: isEn ? 'Audit Trail' : 'Log Audit', icon: IconShieldCheck },
              { id: 'settings', label: isEn ? 'Settings' : 'Pengaturan', icon: IconSettings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 pb-4 text-sm font-semibold transition relative cursor-pointer ${
                    activeTab === tab.id
                      ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'members' && (
              <MembersTab
                isEn={isEn}
                members={members}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterRole={filterRole}
                setFilterRole={setFilterRole}
                filterDepartment={filterDepartment}
                setFilterDepartment={setFilterDepartment}
                departments={departmentsList}
                isLoading={isLoading}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                itemsPerPage={itemsPerPage}
                filteredMembers={filteredMembers}
                currentMembers={currentMembers}
                totalPages={totalPages}
                setIsInviteModalOpen={setIsInviteModalOpen}
                handleRevoke={handleRevoke}
                onBulkCSV={handleBulkCSV}
                onUpdateMember={handleUpdateMember}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsTab isEn={isEn} usageData={usageData} roleData={roleData} />
            )}

            {activeTab === 'audit' && (
              <AuditTab isEn={isEn} initialAuditLogs={auditLogs} />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                isEn={isEn}
                institution={currentInst}
                onUpdateInstitution={handleUpdateSettings}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in font-sans">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl w-full max-w-md flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {isEn ? 'Invite Faculty or Student' : 'Undang Dosen atau Mahasiswa'}
              </h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="flex flex-col gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  {isEn ? 'Full Name' : 'Nama Lengkap'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isEn ? 'e.g. Andi Saputra' : 'Contoh: Andi Saputra'}
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  {isEn ? 'Email Address' : 'Alamat Email'}
                </label>
                <input
                  type="email"
                  required
                  placeholder="andi.s@student.campus.ac.id"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    {isEn ? 'Academic Role' : 'Peran Akademik'}
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white outline-none focus:border-indigo-500"
                  >
                    <option value="Student">{isEn ? 'Student / Scholar' : 'Mahasiswa'}</option>
                    <option value="Lecturer">{isEn ? 'Lecturer / Advisor' : 'Dosen Pembimbing'}</option>
                    <option value="Faculty Admin">{isEn ? 'Faculty Admin' : 'Admin Fakultas/Prodi'}</option>
                    <option value="Super Admin">{isEn ? 'Super Admin' : 'Super Admin (Rektorat)'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    {isEn ? 'Faculty / Department' : 'Fakultas / Prodi'}
                  </label>
                  <select
                    value={inviteDepartment}
                    onChange={(e) => setInviteDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white outline-none focus:border-indigo-500"
                  >
                    {departmentsList.map((dep) => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-semibold"
                >
                  {isEn ? 'Cancel' : 'Batal'}
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  {isInviting && <IconLoader className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isEn ? 'Send Invite' : 'Kirim Undangan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
