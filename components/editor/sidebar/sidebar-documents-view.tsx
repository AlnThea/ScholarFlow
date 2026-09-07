import React from 'react';
import { IconFilePlus, IconFolder, IconFolderOpen, IconChevronDown, IconFile } from '@tabler/icons-react';
import { DocumentListItem } from '@/types/document';

interface SidebarDocumentsViewProps {
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
}: SidebarDocumentsViewProps) {
  return (
    <>
      {/* Header Row */}
      <div className="flex items-center justify-between px-3 pt-5 pb-4 border-b border-slate-100/80">
        <div className="flex items-center gap-2">
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
        {isDocumentEditor && (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Collapse sidebar"
            className="bg-transparent border-0 p-1 rounded-md text-slate-400 hover:bg-slate-100/80 hover:text-slate-700 cursor-pointer flex items-center justify-center transition-all duration-200"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        )}
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
                    <div className="text-center py-2 px-3 text-xs text-slate-400">
                      {language === 'en' ? `+${groupedDocs.independent.length - 15} more` : `+${groupedDocs.independent.length - 15} lainnya`}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <IconFile className="h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-500">
              {language === 'en' ? 'No documents found' : 'Tidak ada dokumen'}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
