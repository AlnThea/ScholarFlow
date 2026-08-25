// app/billing/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { useLanguage } from '@/components/i18n/language-context';
import { MinimalSidebar } from '@/components/editor/minimal-sidebar';
import { PricingModal } from '@/components/editor/pricing-modal';
import { IconCreditCard, IconSparkles, IconCheck, IconCrown, IconHistory, IconArrowRight, IconSettings } from '@tabler/icons-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const HelpModal = dynamic(() => import('@/components/editor/help-modal').then((mod) => mod.HelpModal), { ssr: false });
const BackendSettingsModal = dynamic(() => import('@/components/editor/backend-settings-modal').then((mod) => mod.BackendSettingsModal), { ssr: false });

export default function BillingPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();

  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isBackendSettingsOpen, setIsBackendSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          <span className="text-sm text-slate-400 font-medium">Loading Billing...</span>
        </div>
      </div>
    );
  }

  const activePlanId = profile.subscription_plan || 'free';
  const isPro = activePlanId.toLowerCase() !== 'free';
  const greetingName = profile.full_name || user.email?.split('@')[0] || 'Scholar';

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Left Sidebar - Notion Style */}
      <MinimalSidebar
        isExpanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        documents={[]}
        currentDocumentId={null}
        onSelectDocument={(id) => router.push(`/editor/${id}`)}
        onCreateDocument={() => router.push('/dashboard')}
        onDeleteDocument={() => {}}
        onSelectAdminTab={(tab) => {
          if (tab === 'user') router.push('/dashboard');
          else if (tab.startsWith('admin')) router.push('/admin');
        }}
        activeDashboardTab="billing"
        onOpenBackendSettings={() => setIsBackendSettingsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 overflow-y-auto ${sidebarExpanded ? 'pl-0' : 'pl-0'}`}>
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-slate-700">
                {t('navbar.billing')}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition border border-slate-200"
              >
                {language === 'en' ? 'EN' : 'ID'}
              </button>
              <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-bold">
                {greetingName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Billing Content */}
        <main className="max-w-4xl w-full mx-auto px-6 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
              {language === 'en' ? 'Subscription & Billing' : 'Langganan & Tagihan'}
            </h2>
            <p className="text-slate-500 mt-2">
              {language === 'en' ? 'Manage your active plan, quotas, and billing history.' : 'Kelola paket aktif, kuota, dan riwayat tagihan Anda.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Current Plan Card (Span 2 cols on large screens) */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden">
              {/* Background Decoration */}
              <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none -translate-y-1/2 translate-x-1/2 ${isPro ? 'bg-indigo-500' : 'bg-slate-400'}`}></div>
              
              <div className="flex items-start justify-between relative z-10 mb-8">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider mb-3">
                    {language === 'en' ? 'Current Plan' : 'Paket Saat Ini'}
                  </span>
                  <div className="flex items-center gap-3">
                    {isPro ? (
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm border border-indigo-200">
                        <IconCrown className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center shadow-sm border border-slate-200">
                        <IconCreditCard className="w-6 h-6" />
                      </div>
                    )}
                    <h3 className="text-2xl font-extrabold text-slate-800">
                      {isPro ? (language === 'en' ? 'Pro Writer' : 'Pro Writer') : (language === 'en' ? 'Free Tier' : 'Gratis (Free)')}
                    </h3>
                  </div>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  profile.subscription_status === 'active' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {profile.subscription_status === 'active' 
                    ? (language === 'en' ? 'Active' : 'Aktif') 
                    : (language === 'en' ? 'Inactive' : 'Tidak Aktif')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    {language === 'en' ? 'Project Quota' : 'Kuota Proyek'}
                  </span>
                  <span className="text-lg font-bold text-slate-700">
                    {isPro ? (language === 'en' ? 'Unlimited' : 'Tanpa Batas') : '1 Proyek / 3 Bab'}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    {language === 'en' ? 'AI Assistant' : 'Asisten AI'}
                  </span>
                  <span className="text-lg font-bold text-slate-700">
                    {isPro ? 'Gemini 2.0 Pro' : 'Gemini 1.5 Flash'}
                  </span>
                </div>
              </div>

              <div className="mt-auto border-t border-slate-100 pt-6 relative z-10 flex items-center justify-between">
                <div>
                  {isPro && profile.subscription_end && (
                    <p className="text-xs text-slate-500 font-medium">
                      {language === 'en' ? 'Renews on:' : 'Diperbarui pada:'} <span className="font-bold text-slate-700">{new Date(profile.subscription_end).toLocaleDateString()}</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setIsPricingOpen(true)}
                  className={`px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2 ${
                    isPro 
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                  }`}
                >
                  {isPro ? (language === 'en' ? 'Change Plan' : 'Ubah Paket') : (language === 'en' ? 'Upgrade to Pro' : 'Upgrade ke Pro')}
                  <IconSparkles className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Benefits Sidebar */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <IconCrown className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <h4 className="font-bold text-lg mb-4 text-indigo-50">
                  {language === 'en' ? 'Pro Writer Benefits' : 'Keuntungan Pro Writer'}
                </h4>
                <ul className="space-y-3">
                  {[
                    language === 'en' ? 'Unlimited Document Projects' : 'Proyek Dokumen Tanpa Batas',
                    language === 'en' ? 'Export Bibliography to Word/PDF' : 'Ekspor Daftar Pustaka ke Word/PDF',
                    language === 'en' ? 'Priority AI Processing Speed' : 'Prioritas Kecepatan Proses AI',
                    language === 'en' ? 'No Co-Editor Limit' : 'Tanpa Batasan Co-Editor'
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-indigo-100/80">
                      <IconCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8 relative z-10">
                {!isPro && (
                  <button 
                    onClick={() => setIsPricingOpen(true)}
                    className="w-full py-3 bg-white text-indigo-900 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-50 transition"
                  >
                    {language === 'en' ? 'View Pricing Plans' : 'Lihat Daftar Harga'}
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Billing History Section */}
          <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <IconHistory className="w-5 h-5 text-slate-400" />
                <h3 className="text-lg font-bold text-slate-800">
                  {language === 'en' ? 'Billing History' : 'Riwayat Tagihan'}
                </h3>
              </div>
              <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                {language === 'en' ? 'Download Invoices' : 'Unduh Invoice'}
                <IconArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center py-12 text-center">
              <IconCreditCard className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium text-sm">
                {language === 'en' ? 'No billing history found.' : 'Belum ada riwayat transaksi tagihan.'}
              </p>
              <p className="text-slate-400 text-xs mt-1">
                {language === 'en' ? 'Your future payments will appear here.' : 'Pembayaran Anda di masa depan akan muncul di sini.'}
              </p>
            </div>
          </div>
        </main>
      </div>

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />

      <BackendSettingsModal
        isOpen={isBackendSettingsOpen}
        onClose={() => setIsBackendSettingsOpen(false)}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
