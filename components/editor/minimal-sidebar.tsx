// c:/web/ScholarFlow/components/editor/minimal-sidebar.tsx
'use client';

import React, { useState } from 'react';
import { 
  IconChevronLeft, 
  IconChevronRight,
  IconFile, 
  IconBook, 
  IconSettings, 
  IconHelpCircle, 
  IconFilePlus, 
  IconChevronDown,
  IconLogout,
  IconFolder,
  IconFolderOpen,
  IconCreditCard,
  IconSparkles,
  IconDatabase,
  IconLayoutDashboard,

  IconLanguage,
  IconSun,
  IconMoon
} from '@tabler/icons-react';
import { useAuth } from '@/components/auth/auth-provider';
import { useLanguage } from '../i18n/language-context';
import { signOut } from '@/lib/auth';
import { getUserDisplayName, getUserInitials } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { fetchCitationLibrary, deleteCitationFromLibrary, saveCitationToLibrary } from '@/lib/api/citation-library';
import type { CitationCandidate } from '@/lib/api/citations';
import type { DocumentListItem } from '@/lib/api/documents';
import { ConfirmModal } from './confirm-modal';

/**
 * Minimal sidebar that shows the application logo and a collapse/expand control.
 * Styled entirely using pure Tailwind CSS utility classes.
 */
export function MinimalSidebar({ 
  isExpanded, 
  onToggle,
  documents = [],
  currentDocumentId = null,
  onSelectDocument,
  onCreateDocument,
  onDeleteDocument,
  onSelectAdminTab,
  activeDashboardTab,
  className,
  isDarkMode = false,
  onToggleDarkMode,
  onOpenBackendSettings,
  onOpenHelp
}: { 
  isExpanded: boolean; 
  onToggle: () => void;
  documents?: DocumentListItem[];
  currentDocumentId?: string | null;
  onSelectDocument?: (id: string) => void;
  onCreateDocument?: () => void;
  onDeleteDocument?: (id: string) => void;
  onSelectAdminTab?: (tab: 'user' | 'admin' | 'billing' | 'admin-pricing' | 'admin-models' | 'admin-gateways') => void;
  activeDashboardTab?: 'user' | 'admin' | 'billing' | 'admin-pricing' | 'admin-models' | 'admin-gateways';
  className?: string;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenBackendSettings?: () => void;
  onOpenHelp?: () => void;
}) {
  const { language, setLanguage, t } = useLanguage();
  const { user, profile } = useAuth();
  const activePlanId = profile?.subscription_plan || 'free';
  const [openSubmenu, setOpenSubmenu] = React.useState<string | null>(null);
  const [activeView, setActiveView] = React.useState<'main' | 'documents' | 'library' | 'settings'>('main');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        setActiveView('settings');
      } else if (path.startsWith('/editor')) {
        setActiveView('documents');
      } else {
        // default back to main if navigating to general dashboard
        setActiveView('main');
      }
    }
  }, [activeDashboardTab, currentDocumentId]);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [expandedProjects, setExpandedProjects] = React.useState<Record<string, boolean>>({});
  
  // Library States
  const [libraryEntries, setLibraryEntries] = React.useState<Record<string, CitationCandidate>>({});
  const [librarySearchQuery, setLibrarySearchQuery] = React.useState('');
  const [isUploadingPdf, setIsUploadingPdf] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [documentToDelete, setDocumentToDelete] = React.useState<{ id: string; title: string } | null>(null);

  React.useEffect(() => {
    if (activeView === 'library') {
      fetchCitationLibrary()
        .then((entries) => {
          setLibraryEntries(entries);
        })
        .catch((err) => {
          console.error('Error fetching library:', err);
        });
    }
  }, [activeView]);

  const parseRISContent = (text: string): Partial<CitationCandidate> => {
    const lines = text.split(/\r?\n/);
    let title = '';
    const authors: string[] = [];
    let journal = '';
    let year: number | null = null;
    let doi: string | null = null;
    let url: string | null = null;

    for (const line of lines) {
      const match = line.match(/^([A-Z0-9]{2})\s*-\s*(.*)$/);
      if (!match) continue;
      const tag = match[1];
      const val = match[2].trim();

      switch (tag) {
        case 'TI':
        case 'T1':
          title = val;
          break;
        case 'AU':
        case 'A1':
          authors.push(val);
          break;
        case 'JO':
        case 'T2':
        case 'JF':
          journal = val;
          break;
        case 'PY':
        case 'Y1':
          const yrMatch = val.match(/\b(19|20)\d{2}\b/);
          if (yrMatch) year = parseInt(yrMatch[0]);
          break;
        case 'DO':
          doi = val;
          break;
        case 'UR':
          url = val;
          break;
      }
    }

    if (doi && doi.includes('doi.org/')) {
      doi = doi.split('doi.org/')[1];
    }

    return {
      title: title || 'Untitled RIS Import',
      authors: authors.length > 0 ? authors : ['Unknown Author'],
      year: year || new Date().getFullYear(),
      doi: doi || null,
      url: url || null,
      journal: journal || null,
    };
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isRis = file.name.endsWith('.ris');

    if (!isPdf && !isRis) {
      setUploadError(language === 'en' ? 'Only PDF or RIS files are supported.' : 'Hanya file PDF atau RIS yang didukung.');
      setUploadStatus('error');
      return;
    }

    // Check plan limits: Free users can only upload up to 5 PDFs/RIS references
    const entriesCount = Object.keys(libraryEntries).length;
    if (activePlanId === 'free' && entriesCount >= 5) {
      setUploadError(language === 'en'
        ? '🔒 Free plan users are limited to a maximum of 5 PDF/RIS references. Please upgrade to the Pro Writer plan in the Pricing menu for unlimited uploads!'
        : '🔒 Pengguna paket Free terbatas hanya bisa mengunggah maksimal 5 referensi PDF/RIS. Silakan upgrade ke paket Pro Writer di menu Pricing untuk unggahan tanpa batas!'
      );
      setUploadStatus('error');
      return;
    }

    setIsUploadingPdf(true);
    setUploadStatus('uploading');
    setUploadError(null);

    if (isPdf) {
      const formData = new FormData();
      formData.append('file', file);
      if (user?.id) {
        formData.append('userId', user.id);
      }

      try {
        const res = await fetch('/api/library/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || (language === 'en' ? 'Failed to upload PDF.' : 'Gagal mengunggah PDF.'));
        }

        const data = await res.json();
        setUploadStatus('success');
        
        setLibraryEntries((prev) => ({
          ...prev,
          [data.candidate.reference_id]: data.candidate,
        }));
      } catch (err: any) {
        console.error(err);
        setUploadError(err.message || (language === 'en' ? 'Failed to process PDF.' : 'Gagal memproses PDF.'));
        setUploadStatus('error');
      } finally {
        setIsUploadingPdf(false);
      }
    } else {
      try {
        const text = await file.text();
        const parsed = parseRISContent(text);
        
        const referenceId = parsed.doi ? parsed.doi.toLowerCase() : `ris-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const shortTitle = parsed.title!.split(' ').slice(0, 2).join(' ');
        const citationLabel = `[${shortTitle} ${parsed.year}]`;

        const candidate: CitationCandidate = {
          source: 'RIS Import',
          title: parsed.title!,
          authors: parsed.authors!,
          year: parsed.year!,
          doi: parsed.doi!,
          url: parsed.url!,
          reference_id: referenceId,
          citation_label: citationLabel,
          ranking_score: 0,
          ranking_reason: ['Imported from RIS file'],
          abstract: `RIS Entry details: Journal: ${parsed.journal || 'N/A'}. URL: ${parsed.url || 'N/A'}.`,
          journal: parsed.journal!,
          cited_by_count: 0,
          pdf_url: null
        };

        if (!user?.id) throw new Error(language === 'en' ? 'User not authenticated.' : 'Pengguna tidak terautentikasi.');
        
        const res = await saveCitationToLibrary(candidate, user.id);
        if (!res.success) {
          throw new Error(res.error || (language === 'en' ? 'Failed to save RIS citation to database.' : 'Gagal menyimpan sitasi RIS ke database.'));
        }

        setUploadStatus('success');
        setLibraryEntries((prev) => ({
          ...prev,
          [referenceId]: candidate,
        }));
      } catch (err: any) {
        console.error(err);
        setUploadError(err.message || (language === 'en' ? 'Failed to process RIS file.' : 'Gagal memproses file RIS.'));
        setUploadStatus('error');
      } finally {
        setIsUploadingPdf(false);
      }
    }

    e.target.value = '';
  };

  const handleDeleteLibraryItem = async (refId: string) => {
    if (!confirm(language === 'en' ? 'Delete this PDF reference from your library?' : 'Hapus rujukan PDF ini dari library Anda?')) return;
    try {
      const res = await deleteCitationFromLibrary(refId);
      if (res.success) {
        setLibraryEntries((prev) => {
          const next = { ...prev };
          delete next[refId];
          return next;
        });
      } else {
        alert(res.error || (language === 'en' ? 'Failed to delete reference.' : 'Gagal menghapus rujukan.'));
      }
    } catch (err) {
      console.error(err);
      alert(language === 'en' ? 'An error occurred while deleting reference.' : 'Terjadi kesalahan saat menghapus rujukan.');
    }
  };

  const filteredLibraryItems = React.useMemo(() => {
    return Object.entries(libraryEntries).filter(([_, candidate]) =>
      candidate.title.toLowerCase().includes(librarySearchQuery.toLowerCase())
    );
  }, [libraryEntries, librarySearchQuery]);
  const router = useRouter();
  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);
  const role = profile?.role ?? 'user';

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  const isEffectiveExpanded = isExpanded || activeView === 'documents' || activeView === 'library' || activeView === 'settings';

  const filteredDocs = React.useMemo(() => {
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [documents, searchQuery]);

  const groupedDocs = React.useMemo(() => {
    const projects: Record<string, { id: string; name: string; type: string; docs: DocumentListItem[] }> = {};
    const independent: DocumentListItem[] = [];
    
    filteredDocs.forEach((doc) => {
      const settings = doc.settings;
      if (settings?.projectId && settings?.projectName) {
        const pId = settings.projectId;
        if (!projects[pId]) {
          projects[pId] = {
            id: pId,
            name: settings.projectName,
            type: settings.projectType || 'independent',
            docs: []
          };
        }
        projects[pId].docs.push(doc);
      } else {
        independent.push(doc);
      }
    });
    
    return {
      projects: Object.values(projects),
      independent
    };
  }, [filteredDocs]);
  
  // Simple inline SVG logo for Scholar Flow
  const Logo = () => (
    <svg
      className="h-8 w-8 flex-shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6a11cb" />
          <stop offset="100%" stopColor="#2575fc" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#logoGradient)" />
      <text
        x="12"
        y="15.5"
        textAnchor="middle"
        fontFamily="system-ui, sans-serif"
        fontWeight="bold"
        fontSize="9"
        fill="white"
      >
        SF
      </text>
    </svg>
  );

  return (
    <aside
      className={`bg-slate-50 border-r border-slate-200/80 shadow-[2px_0_12px_rgba(0,0,0,0.015)] transition-all duration-300 ease-in-out ${
        isEffectiveExpanded ? 'w-60' : 'w-16'
      } flex flex-col h-screen sticky top-0 z-30 font-sans ${className || ''}`}
    >
      {/* 1. DOCUMENTS VIEW HEADER & CONTENT */}
      {activeView === 'documents' && (
        <>
          {/* Header Row */}
          <div className="flex items-center gap-2 px-3 pt-5 pb-4 border-b border-slate-100/80">
            <button
              type="button"
              onClick={() => setActiveView('main')}
              className="bg-transparent border-0 p-1.5 rounded-md text-slate-400 hover:bg-slate-100/80 hover:text-slate-700 cursor-pointer flex items-center justify-center transition-all duration-200"
              title={language === 'en' ? 'Back to Main Menu' : 'Kembali ke Menu Utama'}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <span className="text-[14px] font-semibold text-slate-800 tracking-tight whitespace-nowrap truncate">
              {language === 'en' ? 'My Documents' : 'Dokumen Saya'}
            </span>
          </div>

          {/* Search bar */}
          <div className="px-3 pt-3 pb-2">
            <div className="relative flex items-center bg-white border border-slate-200/80 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-50/50 transition-all duration-200">
              <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder={language === 'en' ? 'Search drafts...' : 'Cari draf...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ml-2 w-full bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-none border-none p-0 focus:ring-0"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-600 p-0.5 transition cursor-pointer"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Create Button */}
          <div className="px-2 py-1 border-b border-slate-100/80 pb-2.5 mb-1">
            <button
              onClick={onCreateDocument}
              className="flex items-start gap-2.5 w-full px-3 py-2 rounded-lg text-left text-slate-650 hover:bg-slate-100/80 hover:text-slate-900 cursor-pointer transition-all duration-200 group"
            >
              <IconFilePlus className="h-[18px] w-[18px] mt-0.5 text-slate-405 flex-shrink-0 transition-transform duration-200 group-hover:scale-105" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-700 group-hover:text-slate-950">
                  {language === 'en' ? 'Create New Document' : 'Buat Dokumen Baru'}
                </span>
                <span className="text-[8px] text-slate-400 leading-tight font-medium mt-0.5">
                  {language === 'en' ? 'Start a new academic manuscript' : 'Mulai draf manuskrip baru'}
                </span>
              </div>
            </button>
          </div>

          {/* Documents list */}
          <div className="flex-1 overflow-y-auto px-2 mt-2 flex flex-col gap-1 max-h-[calc(100vh-220px)]">
            {filteredDocs.length > 0 ? (
              <div className="flex flex-col gap-3">
                {/* 1. Project Folders */}
                {groupedDocs.projects.map((proj) => {
                  const isExpandedProject = !!expandedProjects[proj.id];
                  const hasActiveDoc = proj.docs.some(d => d.id === currentDocumentId);
                  
                  return (
                    <div key={proj.id} className="flex flex-col gap-0.5 px-1 py-0.5">
                      {/* Project Header Row */}
                      <button
                        type="button"
                        onClick={() => setExpandedProjects(prev => ({ ...prev, [proj.id]: !isExpandedProject }))}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition duration-200 text-xs font-bold group cursor-pointer ${
                          hasActiveDoc ? 'text-indigo-700 bg-indigo-50/20' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {isExpandedProject ? (
                            <IconFolderOpen className="h-4 w-4 text-indigo-500 shrink-0 transition-transform group-hover:scale-105" />
                          ) : (
                            <IconFolder className="h-4 w-4 text-slate-400 shrink-0 transition-transform group-hover:scale-105" />
                          )}
                          <span className="truncate">{proj.name}</span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase border shrink-0 ${
                            proj.type.toLowerCase() === 'thesis' || proj.type.toLowerCase() === 'skripsi'
                              ? 'bg-violet-50 text-violet-700 border-violet-100/50'
                              : proj.type.toLowerCase() === 'independent' || proj.type.toLowerCase() === 'mandiri'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50'
                              : 'bg-slate-100 text-slate-600 border-slate-200/50'
                          }`}>
                            {proj.type}
                          </span>
                        </div>
                        <IconChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${isExpandedProject ? 'rotate-180 text-indigo-500' : ''}`} />
                      </button>

                      {/* Project Sub Documents */}
                      {isExpandedProject && (
                        <div className="flex flex-col gap-0.5 pl-3 border-l border-slate-100 ml-3.5 mt-1 animate-slide-in-top">
                          {proj.docs.map((doc) => (
                            <div
                              key={doc.id}
                              className={`group flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition duration-200 ${
                                doc.id === currentDocumentId
                                  ? 'text-indigo-700 bg-indigo-50/70 font-semibold border-l-2 border-indigo-600 rounded-l-none'
                                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                              }`}
                            >
                              <button
                                onClick={() => doc.id !== currentDocumentId && onSelectDocument?.(doc.id)}
                                className={`flex-1 flex items-center gap-2 text-left truncate mr-2 font-medium ${
                                  doc.id === currentDocumentId ? 'cursor-default' : 'cursor-pointer'
                                }`}
                                title={doc.title}
                              >
                                <IconFile className={`h-3.5 w-3.5 shrink-0 ${doc.id === currentDocumentId ? 'text-indigo-600' : 'text-slate-400'}`} />
                                <span className="truncate">{doc.settings?.projectPart || doc.title}</span>
                              </button>
                              {onDeleteDocument && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (doc.id !== currentDocumentId) {
                                      setDocumentToDelete({ id: doc.id, title: doc.title });
                                    }
                                  }}
                                  disabled={doc.id === currentDocumentId}
                                  className={`p-1 rounded transition-all duration-200 ${
                                    doc.id === currentDocumentId
                                      ? 'opacity-20 cursor-not-allowed text-slate-300'
                                      : 'opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 text-slate-400 cursor-pointer'
                                  }`}
                                  title={
                                    doc.id === currentDocumentId
                                      ? (language === 'en' ? 'Active document cannot be deleted' : 'Dokumen aktif tidak dapat dihapus')
                                      : (language === 'en' ? 'Delete Document' : 'Hapus Dokumen')
                                  }
                                >
                                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                  </svg>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* 2. Independent / Single Documents */}
                {groupedDocs.independent.length > 0 && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
                      {language === 'en' ? 'Independent Documents' : 'Dokumen Mandiri'}
                    </span>
                    <div className="flex flex-col gap-1 px-1">
                      {groupedDocs.independent.slice(0, 15).map((doc) => (
                        <div
                          key={doc.id}
                          className={`group flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition duration-200 ${
                            doc.id === currentDocumentId
                              ? 'text-indigo-700 bg-indigo-50/70 font-semibold border-l-2 border-indigo-600 rounded-l-none'
                              : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <button
                            onClick={() => doc.id !== currentDocumentId && onSelectDocument?.(doc.id)}
                            className={`flex-1 flex items-center gap-2 text-left truncate mr-2 font-medium ${
                              doc.id === currentDocumentId ? 'cursor-default' : 'cursor-pointer'
                            }`}
                            title={doc.title}
                          >
                            <IconFile className={`h-3.5 w-3.5 shrink-0 ${doc.id === currentDocumentId ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <span className="truncate">{doc.title}</span>
                          </button>
                          {onDeleteDocument && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (doc.id !== currentDocumentId) {
                                  setDocumentToDelete({ id: doc.id, title: doc.title });
                                }
                              }}
                              disabled={doc.id === currentDocumentId}
                              className={`p-1 rounded transition-all duration-200 ${
                                doc.id === currentDocumentId
                                  ? 'opacity-20 cursor-not-allowed text-slate-300'
                                  : 'opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 text-slate-400 cursor-pointer'
                              }`}
                              title={
                                doc.id === currentDocumentId
                                  ? (language === 'en' ? 'Active document cannot be deleted' : 'Dokumen aktif tidak dapat dihapus')
                                  : (language === 'en' ? 'Delete Document' : 'Hapus Dokumen')
                              }
                            >
                              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                      {groupedDocs.independent.length > 15 && (
                        <div className="text-center py-2 text-[10px] font-semibold text-slate-400/80">
                          {language === 'en' 
                            ? `+ ${groupedDocs.independent.length - 15} more drafts (use search)` 
                            : `+ ${groupedDocs.independent.length - 15} draf lagi (gunakan pencarian)`}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-xs font-medium text-slate-400/80">
                {language === 'en' ? 'Documents not found' : 'Dokumen tidak ditemukan'}
              </div>
            )}
          </div>
        </>
      )}

      {/* 2. LIBRARY VIEW HEADER & CONTENT */}
      {activeView === 'library' && (
        <>
          {/* Header Row */}
          <div className="flex items-center gap-2 px-3 pt-5 pb-4 border-b border-slate-100/80">
            <button
              type="button"
              onClick={() => setActiveView('main')}
              className="bg-transparent border-0 p-1.5 rounded-md text-slate-400 hover:bg-slate-100/80 hover:text-slate-700 cursor-pointer flex items-center justify-center transition-all duration-200"
              title={language === 'en' ? 'Back to Main Menu' : 'Kembali ke Menu Utama'}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <span className="text-[14px] font-semibold text-slate-800 tracking-tight whitespace-nowrap truncate">
              {language === 'en' ? 'Journal Collection (PDF/RIS)' : 'Koleksi Jurnal (PDF/RIS)'}
            </span>
          </div>

          {/* Upload PDF Section */}
          <div className="px-3 pt-3 pb-2 flex flex-col gap-2">
            <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/10 rounded-xl p-3.5 cursor-pointer transition text-center group">
              <input
                type="file"
                accept="application/pdf,.ris"
                className="hidden"
                onChange={handleUploadFile}
                disabled={isUploadingPdf}
              />
              <svg className="h-5 w-5 text-indigo-500 mb-1 group-hover:scale-105 transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span className="text-[10px] font-bold text-slate-700">{language === 'en' ? 'Upload PDF / RIS' : 'Unggah PDF / RIS'}</span>
              <span className="text-[9px] text-slate-400 mt-0.5">{language === 'en' ? 'Extract reference to AI' : 'Ekstrak rujukan ke AI'}</span>
            </label>

            {/* Upload alerts */}
            {uploadStatus === 'uploading' && (
              <div className="text-[9px] font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg py-1 px-2.5 flex items-center gap-1.5 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-ping" />
                {language === 'en' ? 'Processing file...' : 'Memproses berkas...'}
              </div>
            )}
            {uploadStatus === 'success' && (
              <div className="text-[9px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg py-1 px-2.5">
                {language === 'en' ? 'Successfully uploaded!' : 'Berhasil diunggah!'}
              </div>
            )}
            {uploadStatus === 'error' && (
              <div className="text-[9px] font-medium text-rose-600 bg-rose-50 border border-rose-100 rounded-lg py-1 px-2.5 leading-normal">
                {uploadError || (language === 'en' ? 'Failed to process file.' : 'Gagal memproses file.')}
              </div>
            )}
          </div>

          {/* Search bar */}
          <div className="px-3 py-1">
            <div className="relative flex items-center bg-slate-200/40 hover:bg-slate-200/60 rounded-lg px-2.5 py-1.5 transition duration-150">
              <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder={language === 'en' ? 'Search references...' : 'Cari rujukan...'}
                value={librarySearchQuery}
                onChange={(e) => setLibrarySearchQuery(e.target.value)}
                className="ml-2 w-full bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-none border-none p-0"
              />
              {librarySearchQuery && (
                <button
                  onClick={() => setLibrarySearchQuery('')}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Library list */}
          <div className="flex-1 overflow-y-auto px-2 mt-2 flex flex-col gap-1 max-h-[calc(100vh-270px)]">
            {filteredLibraryItems.length > 0 ? (
              filteredLibraryItems.map(([refId, candidate]) => (
                <div
                  key={refId}
                  className="group flex items-center justify-between rounded-lg px-2 py-1.5 text-[11px] text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition duration-150"
                >
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="font-semibold truncate text-slate-700" title={candidate.title}>
                      {candidate.title}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5 truncate">
                      {candidate.citation_label} • PDF
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteLibraryItem(refId)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-50 hover:text-red-600 text-slate-400 transition cursor-pointer"
                    title={language === 'en' ? 'Delete Reference' : 'Hapus Rujukan'}
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                {language === 'en' ? 'Library is empty' : 'Library kosong'}
              </div>
            )}
          </div>
        </>
      )}

      {/* 3. MAIN CATEGORIES VIEW */}
      {activeView === 'main' && (
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
                      className="flex items-start gap-2.5 w-full px-3 py-2 rounded-lg text-left text-slate-650 hover:bg-slate-100/80 hover:text-slate-900 cursor-pointer transition-all duration-200 group"
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
                      <IconBook className="h-[18px] w-[18px] mt-0.5 text-slate-400 flex-shrink-0 transition-transform duration-200 group-hover:scale-105" />
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
      )}

      {/* 4. SETTINGS VIEW HEADER & CONTENT */}
      {activeView === 'settings' && (
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
      )}

      {/* Row of Settings (Admin only) + Language + Dark Mode toggles */}
      <div className="px-3 py-2 border-t border-slate-200/40">
        {isEffectiveExpanded ? (
          <div className="flex items-center gap-2 w-full">
            {role === 'admin' && (
              <button
                type="button"
                onClick={() => setActiveView('settings')}
                className={`flex items-center justify-center flex-1 py-2 px-1 rounded-lg border border-slate-200/85 text-xs font-bold transition-all duration-200 group cursor-pointer ${
                  activeView === 'settings' || ['admin-pricing', 'admin-models', 'admin-gateways'].includes(activeDashboardTab || '')
                    ? 'text-indigo-700 bg-indigo-50/70 border-indigo-200/80'
                    : 'text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900'
                }`}
                title={language === 'en' ? 'Admin Settings' : 'Pengaturan Admin'}
              >
                <IconSettings className="h-[15px] w-[15px] text-slate-500 shrink-0" />
                <span className="ml-1 text-[10px] truncate leading-none">
                  {language === 'en' ? 'Admin' : 'Admin'}
                </span>
              </button>
            )}

            {/* Language toggle */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
              className="flex items-center justify-center flex-1 py-2 px-1 rounded-lg border border-slate-200/85 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 group cursor-pointer text-xs font-bold"
              title={language === 'en' ? 'Switch to Indonesian' : 'Ubah ke Bahasa Indonesia'}
            >
              <IconLanguage className="h-[15px] w-[15px] text-slate-500 shrink-0" />
              <span className="ml-1 text-[10px] leading-none">
                {language === 'en' ? 'EN' : 'ID'}
              </span>
            </button>

            {/* Dark Mode toggle */}
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="flex items-center justify-center flex-1 py-2 px-1 rounded-lg border border-slate-200/85 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 group cursor-pointer text-xs font-bold"
              title={language === 'en' ? 'Toggle Theme' : 'Ubah Tema'}
            >
              {isDarkMode ? (
                <>
                  <IconSun className="h-[15px] w-[15px] text-amber-500 shrink-0" />
                  <span className="ml-1 text-[10px] leading-none">{language === 'en' ? 'Light' : 'Terang'}</span>
                </>
              ) : (
                <>
                  <IconMoon className="h-[15px] w-[15px] text-indigo-500 shrink-0" />
                  <span className="ml-1 text-[10px] leading-none">{language === 'en' ? 'Dark' : 'Gelap'}</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Collapsed state row stack */
          <div className="flex flex-col items-center gap-2.5">
            {role === 'admin' && (
              <button
                onClick={() => {
                  setActiveView('settings');
                  onToggle(); // expand sidebar if collapsed to see settings list
                }}
                className={`flex items-center justify-center w-full aspect-square rounded-lg transition-all duration-200 relative group cursor-pointer ${
                  activeView === 'settings' || ['admin-pricing', 'admin-models', 'admin-gateways'].includes(activeDashboardTab || '')
                    ? 'text-indigo-700 bg-indigo-50/70'
                    : 'text-slate-400 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
                title={language === 'en' ? 'Settings' : 'Pengaturan'}
              >
                <IconSettings className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
              </button>
            )}

            {/* Language toggle (collapsed) */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
              className="flex items-center justify-center w-full aspect-square rounded-lg bg-transparent text-slate-400 hover:bg-slate-100/80 hover:text-slate-900 cursor-pointer transition-all duration-200 relative group"
              title={language === 'en' ? 'Switch to Indonesian' : 'Ubah ke Bahasa Indonesia'}
            >
              <IconLanguage className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
            </button>

            {/* Dark Mode toggle (collapsed) */}
            <button
              onClick={onToggleDarkMode}
              className="flex items-center justify-center w-full aspect-square rounded-lg bg-transparent text-slate-400 hover:bg-slate-100/80 hover:text-slate-900 cursor-pointer transition-all duration-200 relative group"
              title={language === 'en' ? 'Toggle Theme' : 'Ubah Tema'}
            >
              {isDarkMode ? (
                <IconSun className="h-5 w-5 text-amber-500 transition-transform duration-200 group-hover:scale-105" />
              ) : (
                <IconMoon className="h-5 w-5 text-indigo-500 transition-transform duration-200 group-hover:scale-105" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* User profile + logout at the bottom */}
      <div className="border-t border-slate-200/60 p-3">
        {isEffectiveExpanded ? (
          <div className="flex items-center gap-2.5">
            {/* Avatar & Info (Clickable to Settings) */}
            <button 
              onClick={() => router.push('/settings')}
              className="flex-1 flex items-center gap-2.5 min-w-0 text-left hover:bg-slate-100/50 p-1.5 rounded-lg transition-colors cursor-pointer"
              title={language === 'en' ? 'Account Settings' : 'Pengaturan Akun'}
            >
              {/* Avatar */}
              <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {initials}
              </div>
              {/* Name + email + role badge */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-slate-700 truncate">{displayName}</p>
                  <span className={`flex-shrink-0 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                    role === 'admin'
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {role}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </button>
            {/* Logout button */}
            <button
              type="button"
              title="Sign out"
              aria-label="Sign out"
              onClick={handleLogout}
              className="p-1.5 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors duration-200 flex-shrink-0 cursor-pointer"
            >
              <IconLogout className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {/* Avatar (Clickable to Settings) */}
            <button
              onClick={() => router.push('/settings')}
              title={language === 'en' ? 'Account Settings' : 'Pengaturan Akun'}
              className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all"
            >
              {initials}
            </button>
            {/* Logout button (collapsed) */}
            <button
              type="button"
              title="Sign out"
              aria-label="Sign out"
              onClick={handleLogout}
              className="p-1.5 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors duration-200 cursor-pointer"
            >
              <IconLogout className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      {/* Document Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!documentToDelete}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={() => {
          if (documentToDelete && onDeleteDocument) {
            onDeleteDocument(documentToDelete.id);
          }
        }}
        title={language === 'en' ? 'Delete Document' : 'Hapus Dokumen'}
        message={
          language === 'en'
            ? `Are you sure you want to permanently delete document "${documentToDelete?.title}"? This action cannot be undone.`
            : `Apakah Anda yakin ingin menghapus dokumen "${documentToDelete?.title}" secara permanen? Tindakan ini tidak dapat dibatalkan.`
        }
        confirmText={language === 'en' ? 'Delete' : 'Hapus'}
        cancelText={language === 'en' ? 'Cancel' : 'Batal'}
        type="danger"
      />
    </aside>
  );
}
