import React from 'react';
import { 
  IconChevronLeft, 
  IconChevronRight,
  IconFile, 
  IconBook, 
  IconHelpCircle, 
  IconCreditCard,
  IconSparkles,
  IconLayoutDashboard
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { SidebarLogo } from './sidebar-logo';

export function SidebarMainView({
  language,
  isEffectiveExpanded,
  onToggle,
  currentDocumentId,
  activeDashboardTab,
  onSelectDocument,
  onSelectAdminTab,
  setActiveView,
  onOpenHelp
}: {
  language: string;
  isEffectiveExpanded: boolean;
  onToggle: () => void;
  currentDocumentId?: string | null;
  activeDashboardTab?: string;
  onSelectDocument?: (id: string) => void;
  onSelectAdminTab?: (tab: 'user' | 'admin' | 'billing' | 'admin-pricing' | 'admin-models' | 'admin-gateways') => void;
  setActiveView: (view: 'main' | 'documents' | 'library' | 'settings') => void;
  onOpenHelp?: () => void;
}) {
  const router = useRouter();
  const Logo = () => <SidebarLogo />;

  return (
    <>
      {/* Header row */}
      {isEffectiveExpanded ? (
        <div className="flex items-center justify-between px-3 pt-5 pb-4 border-b border-slate-100/80">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-[14px] font-semibold text-slate-800 tracking-tight whitespace-nowrap">
              Scholar Flow
            </span>
          </div>
          <button
            type="button"
            onClick={onToggle}
            aria-label="Collapse sidebar"
            className="bg-transparent border-0 p-1.5 rounded-md text-slate-400 hover:bg-slate-100/80 hover:text-slate-700 cursor-pointer flex items-center justify-center transition-all duration-200"
          >
            <IconChevronLeft className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div 
          onClick={onToggle}
          title="Expand sidebar"
          className="flex flex-col items-center gap-2 px-2 pt-5 pb-4 border-b border-slate-100/80 cursor-pointer group"
        >
          <div className="transition-transform duration-250 group-hover:scale-110">
            <Logo />
          </div>
        </div>
      )}

      {/* Navigation items */}
      <div className="flex-1 mt-2">
        {isEffectiveExpanded ? (
          /* Expanded state layout */
          <nav className="flex flex-col gap-4">
            {/* Group 1: Workspace */}
            <div className="flex flex-col gap-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400/90 px-3 pb-1">
                {language === 'en' ? 'Workspace' : 'Ruang Kerja'}
              </div>
              <div className="flex flex-col gap-1 px-1">
                {/* Dashboard */}
                <button
                  className={`flex items-start gap-2.5 w-full px-3 py-2 rounded-lg text-left transition-all duration-200 group cursor-pointer ${
                    !currentDocumentId && activeDashboardTab === 'user'
                      ? 'text-indigo-700 bg-indigo-50/70 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                  onClick={() => {
                    onSelectDocument?.('');
                    onSelectAdminTab?.('user');
                    setActiveView('main');
                  }}
                >
                  <IconLayoutDashboard className={`h-[18px] w-[18px] mt-0.5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                    !currentDocumentId && activeDashboardTab === 'user' ? 'text-indigo-600' : 'text-slate-400'
                  }`} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold">
                      {language === 'en' ? 'Dashboard' : 'Dasbor'}
                    </span>
                    <span className="text-[8px] text-slate-400 leading-tight font-medium mt-0.5">
                      {language === 'en' ? 'Overview of your papers & stats' : 'Ringkasan artikel & statistik Anda'}
                    </span>
                  </div>
                </button>

                {/* Documents list sub-menu trigger */}
                <button
                  className={`flex items-start gap-2.5 w-full px-3 py-2 rounded-lg text-left transition-all duration-200 group cursor-pointer ${!currentDocumentId && activeDashboardTab === "library" ? "text-indigo-700 bg-indigo-50/70 font-semibold" : "text-slate-650 hover:bg-slate-100/80 hover:text-slate-900"}`}
                  onClick={() => {
                    onSelectDocument?.(''); // exit editor to dashboard
                    onSelectAdminTab?.('user'); // switch dashboard tab to user documents list
                    setActiveView('documents'); // show documents sidebar
                  }}
                >
                  <IconFile className="h-[18px] w-[18px] mt-0.5 text-slate-400 flex-shrink-0 transition-transform duration-200 group-hover:scale-105" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-bold">
                      {language === 'en' ? 'My Documents' : 'Dokumen Saya'}
                    </span>
                    <span className="text-[8px] text-slate-400 leading-tight font-medium mt-0.5">
                      {language === 'en' ? 'Manage your saved drafts & writings' : 'Kelola draf & tulisan tersimpan'}
                    </span>
                  </div>
                  <IconChevronRight className="ml-auto h-3.5 w-3.5 text-slate-400 self-center flex-shrink-0" />
                </button>
              </div>
            </div>

            {/* Group 2: Sources & References */}
            <div className="flex flex-col gap-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400/90 px-3 pb-1">
                {language === 'en' ? 'Sources & References' : 'Sumber & Pustaka'}
              </div>
              <div className="flex flex-col gap-1 px-1">
                {/* Library */}
                <button 
                  className="flex items-start gap-2.5 w-full px-3 py-2 rounded-lg text-left text-slate-650 hover:bg-slate-100/80 hover:text-slate-900 cursor-pointer transition-all duration-200 group"
                  onClick={() => setActiveView('library')}
                >
                  <IconBook className={`h-[18px] w-[18px] mt-0.5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${!currentDocumentId && activeDashboardTab === "library" ? "text-indigo-600" : "text-slate-400"}`} />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-bold">
                      {language === 'en' ? 'Library' : 'Perpustakaan'}
                    </span>
                    <span className="text-[8px] text-slate-400 leading-tight font-medium mt-0.5">
                      {language === 'en' ? 'Manage cited papers & sources' : 'Kelola jurnal sitasi & sumber'}
                    </span>
                  </div>
                  <IconChevronRight className="ml-auto h-3.5 w-3.5 text-slate-400 self-center flex-shrink-0" />
                </button>

                {/* Bibliometric Analysis */}
                <button 
                  className={`flex items-start gap-2.5 w-full px-3 py-2 rounded-lg text-left transition-all duration-200 group cursor-pointer ${
                    !currentDocumentId && activeDashboardTab === 'bibliometric'
                      ? 'text-indigo-700 bg-indigo-50/70 font-semibold'
                      : 'text-slate-650 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                  onClick={() => {
                    router.push('/dashboard/bibliometric');
                  }}
                >
                  <IconSparkles className={`h-[18px] w-[18px] mt-0.5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                    !currentDocumentId && activeDashboardTab === 'bibliometric' ? 'text-indigo-600' : 'text-slate-400'
                  }`} />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-bold">
                      {language === 'en' ? 'Bibliometric Analysis' : 'Analisis Bibliometrik'}
                    </span>
                    <span className="text-[8px] text-slate-400 leading-tight font-medium mt-0.5">
                      {language === 'en' ? 'Explore keyword network' : 'Jelajahi jaringan kata kunci'}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Group 3: Account & Settings */}
            <div className="flex flex-col gap-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400/90 px-3 pb-1">
                {language === 'en' ? 'Account & Settings' : 'Akun & Pengaturan'}
              </div>
              <div className="flex flex-col gap-1 px-1">
                {/* Akun & Billing */}
                <button
                  className={`flex items-start gap-2.5 w-full px-3 py-2 rounded-lg text-left transition-all duration-200 group cursor-pointer ${
                    !currentDocumentId && activeDashboardTab === 'billing'
                      ? 'text-indigo-700 bg-indigo-50/70 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                  onClick={() => {
                    onSelectDocument?.('');
                    onSelectAdminTab?.('billing');
                    setActiveView('main');
                  }}
                >
                  <IconCreditCard className={`h-[18px] w-[18px] mt-0.5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                    !currentDocumentId && activeDashboardTab === 'billing' ? 'text-indigo-600' : 'text-slate-400'
                  }`} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold">
                      {language === 'en' ? 'Account & Billing' : 'Akun & Billing'}
                    </span>
                    <span className="text-[8px] text-slate-400 leading-tight font-medium mt-0.5">
                      {language === 'en' ? 'Subscription plans & payments' : 'Paket langganan & pembayaran'}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Group 4: Support */}
            <div className="flex flex-col gap-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400/90 px-3 pb-1">
                {language === 'en' ? 'Support' : 'Bantuan'}
              </div>
              <div className="flex flex-col gap-1 px-1">
                {/* Help */}
                <button 
                  type="button"
                  onClick={onOpenHelp}
                  className="flex items-start gap-2.5 w-full px-3 py-2 rounded-lg text-left text-slate-600 bg-transparent hover:bg-slate-100/80 hover:text-slate-900 cursor-pointer transition-all duration-200 group"
                >
                  <IconHelpCircle className="h-[18px] w-[18px] mt-0.5 text-slate-400 flex-shrink-0 transition-transform duration-200 group-hover:scale-105" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold">
                      {language === 'en' ? 'Help' : 'Bantuan'}
                    </span>
                    <span className="text-[8px] text-slate-400 leading-tight font-medium mt-0.5">
                      {language === 'en' ? 'Guides & documentation' : 'Panduan & bantuan'}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </nav>
        ) : (
          /* Collapsed state layout */
          <nav className="flex flex-col items-center gap-2 px-2">
            {/* Dasbor (collapsed) */}
            <button
              className={`flex items-center justify-center w-full aspect-square rounded-lg transition-all duration-200 relative group cursor-pointer ${
                !currentDocumentId && activeDashboardTab === 'user'
                  ? 'text-indigo-700 bg-indigo-50/70'
                  : 'text-slate-400 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
              title={language === 'en' ? 'Dashboard' : 'Dasbor'}
              aria-label={language === 'en' ? 'Dashboard' : 'Dasbor'}
              onClick={() => {
                onSelectDocument?.('');
                onSelectAdminTab?.('user');
                setActiveView('main');
              }}
            >
              <IconLayoutDashboard className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
            </button>



            {/* Documents Button (collapsed) */}
            <button
              className="flex items-center justify-center w-full aspect-square rounded-lg bg-transparent text-slate-400 hover:bg-slate-100/80 hover:text-slate-900 cursor-pointer transition-all duration-200 relative group"
              title={language === 'en' ? 'My Documents' : 'Dokumen Saya'}
              aria-label={language === 'en' ? 'My Documents' : 'Dokumen Saya'}
              onClick={() => {
                onSelectDocument?.('');
                onSelectAdminTab?.('user');
                setActiveView('documents');
                onToggle(); // expand sidebar if collapsed to see documents list
              }}
            >
              <IconFile className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
            </button>

            {/* Library Button (collapsed) */}
            <button
              className="flex items-center justify-center w-full aspect-square rounded-lg bg-transparent text-slate-400 hover:bg-slate-100/80 hover:text-slate-900 cursor-pointer transition-all duration-200 relative group"
              title={language === 'en' ? 'Library' : 'Perpustakaan'}
              aria-label={language === 'en' ? 'Library' : 'Perpustakaan'}
              onClick={() => setActiveView('library')}
            >
              <IconBook className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
            </button>

            {/* Bibliometric Button (collapsed) */}
            <button
              className={`flex items-center justify-center w-full aspect-square rounded-lg transition-all duration-200 relative group cursor-pointer ${
                !currentDocumentId && activeDashboardTab === 'bibliometric'
                  ? 'text-indigo-700 bg-indigo-50/70'
                  : 'text-slate-400 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
              title={language === 'en' ? 'Bibliometric Analysis' : 'Analisis Bibliometrik'}
              aria-label={language === 'en' ? 'Bibliometric Analysis' : 'Analisis Bibliometrik'}
              onClick={() => router.push('/dashboard/bibliometric')}
            >
              <IconSparkles className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
            </button>

            {/* Akun & Billing Button (collapsed) */}
            <button
              className={`flex items-center justify-center w-full aspect-square rounded-lg transition-all duration-200 relative group cursor-pointer ${
                !currentDocumentId && activeDashboardTab === 'billing'
                  ? 'text-indigo-700 bg-indigo-50/70'
                  : 'text-slate-400 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
              title={language === 'en' ? 'Account & Billing' : 'Akun & Billing'}
              aria-label={language === 'en' ? 'Account & Billing' : 'Akun & Billing'}
              onClick={() => {
                onSelectDocument?.('');
                onSelectAdminTab?.('billing');
                setActiveView('main');
              }}
            >
              <IconCreditCard className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
            </button>

            {/* Help Button (collapsed) */}
            <button
              type="button"
              onClick={onOpenHelp}
              className="flex items-center justify-center w-full aspect-square rounded-lg bg-transparent text-slate-400 hover:bg-slate-100/80 hover:text-slate-900 cursor-pointer transition-all duration-200 relative group"
              title="Help"
              aria-label="Help"
            >
              <IconHelpCircle className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
            </button>
          </nav>
        )}
      </div>
    </>
  );
}
