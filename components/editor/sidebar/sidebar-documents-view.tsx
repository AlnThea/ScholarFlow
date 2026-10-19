import React, { useState } from 'react';
import { IconFilePlus, IconFolder, IconFolderOpen, IconChevronDown, IconFile, IconLoader2, IconTrash, IconSearch, IconX } from '@tabler/icons-react';
import { DocumentListItem } from '@/lib/api/documents';
import { SentenceRhythmExplorer } from '../sentence-rhythm-explorer';

export interface SidebarDocumentsViewProps {
  language: 'en' | 'id';
  isDocumentEditor: boolean;
  onToggle: () => void;
  setActiveView: (view: 'main' | 'documents' | 'library' | 'settings') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCreateDocument: () => void;
  filteredDocs: DocumentListItem[];
  groupedDocs: {
    projects: { id: string; name: string; type: string; docs: DocumentListItem[] }[];
    independent: DocumentListItem[];
  };
  expandedProjects: Record<string, boolean>;
  setExpandedProjects: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  currentDocumentId?: string;
  onSelectDocument?: (id: string) => void;
  onDeleteDocument?: (id: string) => void;
  setDocumentToDelete: (doc: { id: string; title: string } | null) => void;
  selectedText?: string;
  activeSidebarTab?: string;
  onOpenFileHub?: () => void;
}

export function SidebarDocumentsView({
  language,
  isDocumentEditor,
  onToggle,
  setActiveView,
  searchQuery,
  setSearchQuery,
  onCreateDocument,
  filteredDocs,
  groupedDocs,
  expandedProjects,
  setExpandedProjects,
  currentDocumentId,
  onSelectDocument,
  onDeleteDocument,
  setDocumentToDelete,
  selectedText = '',
  activeSidebarTab,
  onOpenFileHub,
}: SidebarDocumentsViewProps) {
  const [activeTab, setActiveTab] = useState<'docs' | 'rhythm'>(
    activeSidebarTab === 'burstiness' ? 'rhythm' : 'docs'
  );
  const [loadingDoc, setLoadingDoc] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  React.useEffect(() => {
    if (activeSidebarTab === 'burstiness') {
      setActiveTab('rhythm');
    }
  }, [activeSidebarTab]);

  const handleSelect = (id: string) => {
    if (id !== currentDocumentId) {
      setLoadingDoc(id);
      onSelectDocument?.(id);
      setTimeout(() => setLoadingDoc(null), 800);
    }
  };

  const isEn = language === 'en';

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-slate-900 transition-colors">
      {/* 1. Header: Segmented Navigation Tabs (Dokumen & Sentence Rhythm) ala Image 2 */}
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850 p-1.5 text-xs font-semibold select-none shrink-0 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('docs')}
          className={`flex-1 py-1.5 px-2 text-center rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'docs'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs border border-slate-200/60 dark:border-slate-700'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>📁</span>
          <span>{isEn ? 'Documents' : 'Dokumen'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rhythm')}
          className={`flex-1 py-1.5 px-2 text-center rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'rhythm'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs border border-slate-200/60 dark:border-slate-700'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>📊</span>
          <span>Sentence Rhythm</span>
        </button>

        {isDocumentEditor && (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Collapse sidebar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
            title={isEn ? 'Collapse Sidebar' : 'Tutup Sidebar'}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        )}
      </div>

      {/* 2. TAB KONTEN 1: DOKUMEN (Tampilan Rapi & Modern ala Image 2) */}
      {activeTab === 'docs' && (
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 thin-scroll">
          {/* Quick Hub Trigger Banner */}
          {onOpenFileHub && (
            <button
              type="button"
              onClick={onOpenFileHub}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-blue-50/70 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 border border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs transition-all shadow-2xs cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">📁</span>
                <span className="truncate">{isEn ? 'Open File Manager Hub' : 'Buka Pengelola Berkas'}</span>
              </div>
              <span className="text-blue-500 group-hover:translate-x-0.5 transition-transform text-xs">↗</span>
            </button>
          )}

          {/* Baris Judul Kategori & Tombol + Baru */}
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px] px-1">
            <div className="flex items-center gap-1.5">
              <span>{isEn ? 'Thesis / Research Project' : 'Proyek Skripsi / Thesis'}</span>
              <button
                type="button"
                onClick={() => setShowSearch(prev => !prev)}
                className={`p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer ${showSearch ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}`}
                title={isEn ? 'Search Documents' : 'Cari Dokumen'}
              >
                <IconSearch className="h-3 w-3" />
              </button>
            </div>
            <button
              type="button"
              onClick={onCreateDocument}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer text-xs"
              title={isEn ? 'Create New Document' : 'Buat Dokumen Baru'}
            >
              {isEn ? '+ New' : '+ Baru'}
            </button>
          </div>

          {/* Kolom Pencarian Cepat (Bila diaktifkan) */}
          {showSearch && (
            <div className="relative flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-lg px-2.5 py-1.5 transition-all">
              <IconSearch className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder={isEn ? 'Search drafts...' : 'Cari draf...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ml-2 w-full bg-transparent text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none border-none p-0 focus:ring-0"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 transition cursor-pointer"
                >
                  <IconX className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          {/* Daftar Dokumen Proyek / Bab */}
          <div className="space-y-1.5">
            {groupedDocs.projects.length > 0 ? (
              groupedDocs.projects.map((proj) => {
                const isExpandedProject = expandedProjects[proj.id] !== false; // default expanded
                return (
                  <div key={proj.id} className="space-y-1">
                    {/* Header Folder Proyek (Bila ada lebih dari 1 proyek) */}
                    {groupedDocs.projects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setExpandedProjects(prev => ({ ...prev, [proj.id]: !isExpandedProject }))}
                        className="w-full flex items-center justify-between py-1 px-1.5 text-slate-500 dark:text-slate-400 font-semibold text-xs hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {isExpandedProject ? <IconFolderOpen className="h-3.5 w-3.5 text-indigo-500" /> : <IconFolder className="h-3.5 w-3.5" />}
                          <span className="truncate">{proj.name}</span>
                        </div>
                        <IconChevronDown className={`h-3 w-3 transition-transform ${isExpandedProject ? 'rotate-180' : ''}`} />
                      </button>
                    )}

                    {/* Dokumen-dokumen di dalam Proyek */}
                    {isExpandedProject && (
                      <div className="space-y-1">
                        {proj.docs.map((doc) => {
                          const isActive = doc.id === currentDocumentId;
                          return (
                            <div
                              key={doc.id}
                              onClick={() => handleSelect(doc.id)}
                              className={`p-2.5 rounded-xl font-medium text-xs flex items-center justify-between transition cursor-pointer group ${
                                isActive
                                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 font-bold text-indigo-700 dark:text-indigo-300 shadow-2xs'
                                  : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate mr-2">
                                {loadingDoc === doc.id ? (
                                  <IconLoader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-indigo-500" />
                                ) : (
                                  <span className="text-slate-400 dark:text-slate-500 shrink-0">📄</span>
                                )}
                                <span className="truncate">
                                  {doc.settings?.projectPart || doc.title}
                                </span>
                                {isActive && (
                                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
                                    ({isEn ? 'Active' : 'Aktif'})
                                  </span>
                                )}
                              </div>

                              {/* Tombol Hapus Dokumen pada Hover (Khusus Dokumen non-aktif) */}
                              {onDeleteDocument && !isActive && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDocumentToDelete({ id: doc.id, title: doc.title });
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer shrink-0"
                                  title={isEn ? 'Delete document' : 'Hapus dokumen'}
                                >
                                  <IconTrash className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : null}

            {/* Dokumen Mandiri (Independent Documents) */}
            {groupedDocs.independent.length > 0 && (
              <div className="pt-2 space-y-1">
                {groupedDocs.projects.length > 0 && (
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1 pt-1 pb-0.5">
                    {isEn ? 'Independent Documents' : 'Dokumen Mandiri'}
                  </div>
                )}
                {groupedDocs.independent.map((doc) => {
                  const isActive = doc.id === currentDocumentId;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleSelect(doc.id)}
                      className={`p-2.5 rounded-xl font-medium text-xs flex items-center justify-between transition cursor-pointer group ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 font-bold text-indigo-700 dark:text-indigo-300 shadow-2xs'
                          : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate mr-2">
                        {loadingDoc === doc.id ? (
                          <IconLoader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-indigo-500" />
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 shrink-0">📄</span>
                        )}
                        <span className="truncate">{doc.title}</span>
                        {isActive && (
                          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
                            ({isEn ? 'Active' : 'Aktif'})
                          </span>
                        )}
                      </div>

                      {onDeleteDocument && !isActive && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDocumentToDelete({ id: doc.id, title: doc.title });
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer shrink-0"
                          title={isEn ? 'Delete document' : 'Hapus dokumen'}
                        >
                          <IconTrash className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {filteredDocs.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
                {isEn ? 'No documents found' : 'Tidak ada dokumen'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. TAB KONTEN 2: SENTENCE RHYTHM EXPLORER */}
      {activeTab === 'rhythm' && (
        <div className="flex-1 overflow-y-auto">
          <SentenceRhythmExplorer
            content={selectedText || ''}
            onClose={onToggle}
          />
        </div>
      )}
    </div>
  );
}

