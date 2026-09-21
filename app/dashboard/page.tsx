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
import { 
  IconPlus, IconFileText, IconClock, IconSearch, IconFolder, 
  IconBook, IconChartBar, IconBooks, IconDotsVertical, 
  IconSparkles, IconActivity, IconFileDescription, IconLoader2
} from '@tabler/icons-react';
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
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleNavigate = (path: string, actionName: string) => {
    setLoadingAction(actionName);
    router.push(path);
    setTimeout(() => setLoadingAction(null), 800);
  };

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

  // Metrics Logic
  const totalDocs = documents.length;
  const activeProjects = new Set(documents.filter(d => d.settings?.projectName).map(d => d.settings?.projectName)).size;
  const lastEdited = documents.length > 0 
    ? new Date(Math.max(...documents.map(d => new Date(d.updated_at).getTime()))).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric' }) 
    : '-';

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Left Sidebar - Notion Style */}
      <MinimalSidebar
        isExpanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        documents={documents}
        currentDocumentId={null}
        onSelectDocument={(id) => {
          if (id) {
            router.push(`/editor/${id}`);
          }
        }}
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
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 overflow-y-auto ${sidebarExpanded ? 'pl-0' : 'pl-0'} bg-gradient-to-br from-slate-50 to-slate-100/50`}>
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm transition-all duration-300">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
                {t('navbar.dashboard')}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white rounded-md transition-all duration-300 border border-slate-200 hover:shadow-sm"
              >
                {language === 'en' ? 'EN' : 'ID'}
              </button>
              <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:scale-105 transition-transform">
                {greetingName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="max-w-6xl w-full mx-auto px-6 py-10 transition-all duration-300">
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight flex items-center gap-2">
                {language === 'en' ? `Welcome back, ${greetingName}` : `Selamat datang, ${greetingName}`}
                <span className="text-2xl animate-wave origin-[70%_70%] inline-block">👋</span>
              </h2>
              <p className="text-slate-500 font-medium text-sm md:text-base">
                {language === 'en' ? 'Ready to accelerate your academic research today?' : 'Siap untuk mempercepat riset akademik Anda hari ini?'}
              </p>
            </div>
          </div>

          {/* Statistics/Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            <div className="bg-white/80 backdrop-blur-md border border-white/40 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl p-6 flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <IconFileDescription className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-0.5">Total Documents</p>
                <h4 className="text-2xl font-bold text-slate-800">{isLoadingDocs ? '-' : totalDocs}</h4>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-md border border-white/40 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl p-6 flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <IconFolder className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-0.5">Active Projects</p>
                <h4 className="text-2xl font-bold text-slate-800">{isLoadingDocs ? '-' : activeProjects}</h4>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-md border border-white/40 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl p-6 flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <IconActivity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-0.5">Last Edited</p>
                <h4 className="text-xl font-bold text-slate-800">{isLoadingDocs ? '-' : lastEdited}</h4>
              </div>
            </div>
          </div>

          {/* Quick Action Links */}
          <div className="mb-10">
            <h3 className="text-base font-bold text-slate-800 mb-4 px-1">Quick Access</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button 
                onClick={() => setIsSetupModalOpen(true)}
                className="group flex flex-col p-5 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <IconPlus className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                  {language === 'en' ? 'New Document' : 'Mulai Dokumen Baru'}
                </span>
                <span className="text-xs text-slate-500">
                  {language === 'en' ? 'Start a new research paper or article' : 'Mulai jurnal atau artikel baru'}
                </span>
              </button>

              <button 
                onClick={() => handleNavigate('/dashboard/library', 'library')}
                className="group flex flex-col p-5 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 border border-blue-100">
                  {loadingAction === 'library' ? <IconLoader2 className="w-5 h-5 animate-spin" /> : <IconBooks className="w-5 h-5" />}
                </div>
                <span className="font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                  {language === 'en' ? 'My Library' : 'Buka My Library'}
                </span>
                <span className="text-xs text-slate-500">
                  {language === 'en' ? 'Manage your references and sources' : 'Kelola referensi dan sumber'}
                </span>
              </button>

              <button 
                onClick={() => handleNavigate('/dashboard/bibliometric', 'bibliometric')}
                className="group flex flex-col p-5 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 border border-purple-100">
                  {loadingAction === 'bibliometric' ? <IconLoader2 className="w-5 h-5 animate-spin" /> : <IconChartBar className="w-5 h-5" />}
                </div>
                <span className="font-bold text-slate-800 mb-1 group-hover:text-purple-600 transition-colors">
                  {language === 'en' ? 'Bibliometric Analysis' : 'Analisis Bibliometrik'}
                </span>
                <span className="text-xs text-slate-500">
                  {language === 'en' ? 'Discover trends and insights' : 'Temukan tren dan wawasan riset'}
                </span>
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 px-1">
            <h3 className="text-base font-bold text-slate-800">Recent Documents</h3>
            <div className="relative w-full md:w-auto md:min-w-[300px]">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder={language === 'en' ? 'Search documents...' : 'Cari dokumen...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-700 font-medium shadow-sm hover:border-slate-300"
              />
            </div>
          </div>

          {/* Document Grid */}
          {isLoadingDocs ? (
            <div className="flex items-center justify-center py-20 bg-white/50 rounded-2xl border border-slate-200/60 border-dashed">
              <div className="flex items-center gap-3 text-slate-400">
                <IconActivity className="w-5 h-5 animate-pulse text-indigo-500" />
                <span className="text-sm font-medium">Loading documents...</span>
              </div>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-md border border-slate-200 border-dashed rounded-3xl p-14 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-5 border border-indigo-100">
                <IconSparkles className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {searchQuery ? (language === 'en' ? 'No documents found' : 'Dokumen tidak ditemukan') : (language === 'en' ? 'No documents yet' : 'Belum ada dokumen')}
              </h3>
              <p className="text-slate-500 text-sm max-w-md mb-8">
                {searchQuery 
                  ? (language === 'en' ? 'Try adjusting your search query.' : 'Coba sesuaikan kata kunci pencarian Anda.')
                  : (language === 'en' ? 'Create your first academic document and let our AI assist your writing.' : 'Buat dokumen akademik pertama Anda dan biarkan AI kami membantu penulisan Anda.')
                }
              </p>
              {!searchQuery && (
                <button 
                  onClick={() => setIsSetupModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md shadow-indigo-200 transition-all active:scale-95"
                >
                  <IconPlus className="w-5 h-5" />
                  {t('setup.create')}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredDocs.map(doc => (
                <div key={doc.id} className="group relative">
                  <button 
                    onClick={() => handleNavigate(`/editor/${doc.id}`, `doc_${doc.id}`)}
                    className="w-full text-left block bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl p-5 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col h-[210px] overflow-hidden"
                  >
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-slate-200/60 shadow-sm">
                        Draft
                      </span>
                    </div>

                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-indigo-100/50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-indigo-100/50">
                      {loadingAction === `doc_${doc.id}` ? (
                        <IconLoader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        doc.settings?.projectType === 'jurnal' ? <IconBook className="w-6 h-6" /> : <IconFileText className="w-6 h-6" />
                      )}
                    </div>
                    
                    <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">
                      {doc.title || 'Untitled Document'}
                    </h3>
                    
                    {doc.settings?.projectName && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 truncate mb-auto mt-1">
                        <IconFolder className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{doc.settings.projectName}</span>
                      </div>
                    )}
                    
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        <IconClock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">
                          {new Date(doc.updated_at).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="text-[10px] font-extrabold text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100/50 uppercase tracking-widest shadow-sm">
                        {doc.settings?.citationStyle || 'APA'}
                      </div>
                    </div>
                  </button>
                </div>
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
