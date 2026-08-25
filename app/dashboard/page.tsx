// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { useDataService } from '@/lib/services';
import { useLanguage } from '@/components/i18n/language-context';
import { DocumentSetupModal } from '@/components/editor/document-setup-modal';
import { MinimalSidebar } from '@/components/editor/minimal-sidebar';
import type { DocumentListItem } from '@/lib/services/types';
import { IconPlus, IconFileText, IconClock, IconSearch, IconFolder, IconBook } from '@tabler/icons-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const HelpModal = dynamic(() => import('@/components/editor/help-modal').then((mod) => mod.HelpModal), { ssr: false });
const BackendSettingsModal = dynamic(() => import('@/components/editor/backend-settings-modal').then((mod) => mod.BackendSettingsModal), { ssr: false });

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const { dataService } = useDataService();
  const { t, language, setLanguage } = useLanguage();

  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isBackendSettingsOpen, setIsBackendSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user, dataService]);

  const loadDocuments = async () => {
    try {
      setIsLoadingDocs(true);
      const docs = await dataService.getDocuments(user!.id);
      setDocuments(docs || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleCreateDocument = async (setupData: any) => {
    try {
      const doc = await dataService.createDocument(user!.id, setupData.title, undefined, setupData.settings);
      if (doc) {
        setIsSetupModalOpen(false);
        router.push(`/editor/${doc.id}`);
      }
    } catch (error) {
      console.error('Failed to create document:', error);
      alert('Failed to create document. Please try again.');
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await dataService.deleteDocument(docId, user!.id);
      await loadDocuments();
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (doc.settings?.projectName && doc.settings.projectName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          <span className="text-sm text-slate-400 font-medium">Loading ScholarFlow...</span>
        </div>
      </div>
    );
  }

  const activePlanId = profile?.subscription_plan || 'free';
  const greetingName = profile?.full_name || user.email?.split('@')[0] || 'Scholar';

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Left Sidebar - Notion Style */}
      <MinimalSidebar
        isExpanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        documents={documents}
        currentDocumentId={null}
        onSelectDocument={(id) => router.push(`/editor/${id}`)}
        onCreateDocument={() => setIsSetupModalOpen(true)}
        onDeleteDocument={handleDeleteDocument}
        onSelectAdminTab={(tab) => {
          if (tab === 'billing') router.push('/billing');
          else if (tab.startsWith('admin')) router.push('/admin');
        }}
        activeDashboardTab="user"
        onOpenBackendSettings={() => setIsBackendSettingsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 overflow-y-auto ${sidebarExpanded ? 'pl-0' : 'pl-0'}`}>
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-slate-700">
                {t('navbar.dashboard')}
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

        {/* Dashboard Content */}
        <main className="max-w-6xl w-full mx-auto px-6 py-12">
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">
                {language === 'en' ? `Welcome back, ${greetingName}!` : `Selamat datang, ${greetingName}!`}
              </h2>
              <p className="text-slate-500 font-medium">
                {language === 'en' ? 'What are we researching today?' : 'Apa yang akan kita teliti hari ini?'}
              </p>
            </div>
            <button 
              onClick={() => setIsSetupModalOpen(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-indigo-200 transition-all active:scale-95"
            >
              <IconPlus className="w-5 h-5" />
              {t('setup.create')}
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder={language === 'en' ? 'Search documents...' : 'Cari dokumen...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-700 font-medium"
              />
            </div>
          </div>

          {/* Document Grid */}
          {isLoadingDocs ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-2 text-slate-400">
                <IconClock className="w-5 h-5 animate-pulse" />
                <span className="text-sm font-medium">Loading documents...</span>
              </div>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <IconFileText className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">
                {searchQuery ? (language === 'en' ? 'No documents found' : 'Dokumen tidak ditemukan') : (language === 'en' ? 'No documents yet' : 'Belum ada dokumen')}
              </h3>
              <p className="text-slate-500 text-sm max-w-sm mb-6">
                {searchQuery 
                  ? (language === 'en' ? 'Try adjusting your search query.' : 'Coba sesuaikan kata kunci pencarian Anda.')
                  : (language === 'en' ? 'Create your first academic document and let our AI assist your writing.' : 'Buat dokumen akademik pertama Anda dan biarkan AI kami membantu penulisan Anda.')
                }
              </p>
              {!searchQuery && (
                <button 
                  onClick={() => setIsSetupModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg font-semibold shadow-sm transition-all text-sm"
                >
                  <IconPlus className="w-4 h-4" />
                  {t('setup.create')}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredDocs.map(doc => (
                <Link 
                  href={`/editor/${doc.id}`} 
                  key={doc.id}
                  className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 transition-all flex flex-col h-48 relative overflow-hidden cursor-pointer"
                >
                  {/* Type Badge */}
                  <div className="absolute top-0 right-0 bg-slate-50 border-l border-b border-slate-100 px-2.5 py-1 rounded-bl-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    {doc.settings?.projectType === 'jurnal' ? <IconBook className="w-3 h-3" /> : <IconFolder className="w-3 h-3" />}
                    {doc.settings?.projectType || 'Single'}
                  </div>

                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-3">
                    <IconFileText className="w-5 h-5" />
                  </div>
                  
                  <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">
                    {doc.title || 'Untitled Document'}
                  </h3>
                  
                  {doc.settings?.projectName && (
                    <p className="text-xs font-medium text-slate-500 truncate mb-auto">
                      {doc.settings.projectName}
                    </p>
                  )}
                  
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <IconClock className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-medium">
                        {new Date(doc.updated_at).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">
                      {doc.settings?.citationStyle || 'APA'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Setup Modal */}
      <DocumentSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onSubmit={handleCreateDocument}
        documents={documents}
        activePlanId={activePlanId}
        onUpgrade={() => router.push('/billing')}
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
