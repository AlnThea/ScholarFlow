import React from 'react';
import { IconSparkles, IconDatabase, IconCreditCard } from '@tabler/icons-react';

interface SidebarSettingsViewProps {
  language: 'en' | 'id';
  setActiveView: (view: 'main' | 'documents' | 'library' | 'settings') => void;
  onSelectDocument?: (id: string) => void;
  onSelectAdminTab?: (tab: string) => void;
  activeDashboardTab?: string;
  onOpenBackendSettings?: () => void;
}

export function SidebarSettingsView({
  language,
  setActiveView,
  onSelectDocument,
  onSelectAdminTab,
  activeDashboardTab,
  onOpenBackendSettings,
}: SidebarSettingsViewProps) {
  return (
    <>
      {/* Header row */}
      <div className="flex items-center justify-between px-3 pt-5 pb-2 border-b border-slate-100/80">
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            type="button"
            onClick={() => setActiveView('main')}
            className="p-1 rounded-md text-slate-400 hover:bg-slate-100/80 hover:text-slate-700 transition cursor-pointer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <span className="text-xs font-bold text-slate-800 tracking-tight truncate">
            {language === 'en' ? 'Settings' : 'Pengaturan'}
          </span>
        </div>
      </div>

      {/* Settings list */}
      <div className="flex-1 overflow-y-auto min-h-0 px-2 py-4 flex flex-col gap-4">
        
        {/* Group 1: AI & System */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
            {language === 'en' ? 'AI & System' : 'AI & Sistem'}
          </span>
          
          <button
            onClick={() => {
              onSelectDocument?.(''); // exit editor to dashboard
              onSelectAdminTab?.('admin-models'); // switch dashboard tab to admin-models
            }}
            className={`flex items-start gap-2.5 w-full px-3 py-2 rounded-lg text-left cursor-pointer transition-all duration-200 group ${
              activeDashboardTab === 'admin-models'
                ? 'text-indigo-700 bg-indigo-50/70 font-semibold'
                : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
            }`}
          >
            <IconSparkles className={`h-[18px] w-[18px] mt-0.5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${
              activeDashboardTab === 'admin-models' ? 'text-indigo-600' : 'text-slate-400'
            }`} />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold">
                {language === 'en' ? 'Manage AI Models' : 'Kelola Model AI'}
              </span>
              <span className="text-[8px] text-slate-400 leading-tight font-medium mt-0.5">
                {language === 'en' ? 'Enable/disable LLM models' : 'Aktifkan/nonaktifkan model LLM'}
              </span>
            </div>
          </button>

          <button
            onClick={() => {
              if (onOpenBackendSettings) {
                onOpenBackendSettings();
              }
            }}
            className="flex items-start gap-2.5 w-full px-3 py-2 rounded-lg text-left cursor-pointer transition-all duration-200 group text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
          >
            <IconDatabase className="h-[18px] w-[18px] mt-0.5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105 text-slate-400" />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold">
                  {language === 'en' ? 'Manage Backend Architecture' : 'Kelola Backend & Database'}
                </span>
              </div>
              <span className="text-[8px] text-slate-400 leading-tight font-medium mt-0.5">
                {language === 'en' ? 'PaaS Supabase vs VPS Express REST' : 'PaaS Supabase vs VPS Express REST'}
              </span>
            </div>
          </button>
        </div>


        {/* Group 2: Billing & Finance */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
            {language === 'en' ? 'Billing & Monetization' : 'Billing & Monetisasi'}
          </span>
          
          <button
            onClick={() => {
              onSelectDocument?.(''); // exit editor to dashboard
              onSelectAdminTab?.('admin-pricing'); // switch dashboard tab to admin-pricing
            }}
            className={`flex items-start gap-2.5 w-full px-3 py-2 rounded-lg text-left cursor-pointer transition-all duration-200 group ${
              activeDashboardTab === 'admin-pricing'
                ? 'text-indigo-700 bg-indigo-50/70 font-semibold'
                : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
            }`}
          >
            <IconCreditCard className={`h-[18px] w-[18px] mt-0.5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${
              activeDashboardTab === 'admin-pricing' ? 'text-indigo-600' : 'text-slate-400'
            }`} />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold">
                {language === 'en' ? 'Manage Pricing Plans' : 'Kelola Paket Harga'}
              </span>
              <span className="text-[8px] text-slate-400 leading-tight font-medium mt-0.5">
                {language === 'en' ? 'Edit subscription details & prices' : 'Ubah detail & harga paket langganan'}
              </span>
            </div>
          </button>

          <button
            onClick={() => {
              onSelectDocument?.(''); // exit editor to dashboard
              onSelectAdminTab?.('admin-gateways'); // switch dashboard tab to admin-gateways
            }}
            className={`flex items-start gap-2.5 w-full px-3 py-2 rounded-lg text-left cursor-pointer transition-all duration-200 group ${
              activeDashboardTab === 'admin-gateways'
                ? 'text-indigo-700 bg-indigo-50/70 font-semibold'
                : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
            }`}
          >
            <svg className={`h-[18px] w-[18px] mt-0.5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${
              activeDashboardTab === 'admin-gateways' ? 'text-indigo-600' : 'text-slate-400'
            }`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold">
                {language === 'en' ? 'Payment Gateways' : 'Saluran Pembayaran'}
              </span>
              <span className="text-[8px] text-slate-400 leading-tight font-medium mt-0.5">
                {language === 'en' ? 'Configure Stripe & Midtrans gateways' : 'Atur Stripe & Midtrans gateway'}
              </span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
