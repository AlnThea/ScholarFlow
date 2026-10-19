// components/editor/modals/document-hub-modal.tsx
import React, { useState, useMemo } from 'react';
import {
  IconX,
  IconFolder,
  IconFile,
  IconFilePlus,
  IconSearch,
  IconTrash,
  IconCalendar,
  IconClock,
  IconCheck,
  IconArrowRight,
  IconExternalLink,
  IconFilter
} from '@tabler/icons-react';
import type { DocumentListItem } from '@/lib/api/documents';

export interface DocumentHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
  documents: DocumentListItem[];
  currentDocumentId?: string | null;
  onSelectDocument?: (id: string) => void;
  onCreateDocument?: () => void;
  onDeleteDocument?: (id: string) => void;
}

export function DocumentHubModal({
  isOpen,
  onClose,
  language,
  documents = [],
  currentDocumentId,
  onSelectDocument,
  onCreateDocument,
  onDeleteDocument
}: DocumentHubModalProps) {
  const isEn = language === 'en';
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'thesis' | 'independent'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'title'>('recent');
  const [docToDelete, setDocToDelete] = useState<{ id: string; title: string } | null>(null);

  // Group into thesis projects & independent
  const { thesisDocs, independentDocs, projectGroups } = useMemo(() => {
    const thesis: DocumentListItem[] = [];
    const independent: DocumentListItem[] = [];
    const groups: Record<string, { id: string; name: string; docs: DocumentListItem[] }> = {};

    documents.forEach((doc) => {
      const pId = doc.settings?.projectId;
      const pName = doc.settings?.projectName;
      if (pId && pName) {
        thesis.push(doc);
        if (!groups[pId]) {
          groups[pId] = { id: pId, name: pName, docs: [] };
        }
        groups[pId].docs.push(doc);
      } else {
        independent.push(doc);
      }
    });

    return {
      thesisDocs: thesis,
      independentDocs: independent,
      projectGroups: Object.values(groups)
    };
  }, [documents]);

  // Filter based on search & active tab
  const displayedDocs = useMemo(() => {
    let list = documents;
    if (activeFilter === 'thesis') {
      list = thesisDocs;
    } else if (activeFilter === 'independent') {
      list = independentDocs;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((doc) => doc.title.toLowerCase().includes(q));
    }

    const sorted = [...list];
    if (sortBy === 'title') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      sorted.sort((a, b) => {
        const timeA = new Date(a.updated_at || a.created_at || 0).getTime();
        const timeB = new Date(b.updated_at || b.created_at || 0).getTime();
        return timeB - timeA;
      });
    }

    return sorted;
  }, [documents, thesisDocs, independentDocs, activeFilter, searchQuery, sortBy]);

  if (!isOpen) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return isEn ? 'Recently' : 'Baru saja';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(isEn ? 'en-US' : 'id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const handleSelect = (id: string) => {
    onSelectDocument?.(id);
    onClose();
  };

  const handleCreate = () => {
    onCreateDocument?.();
    onClose();
  };

  const handleConfirmDelete = () => {
    if (docToDelete && onDeleteDocument) {
      onDeleteDocument(docToDelete.id);
      setDocToDelete(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header Bar: Word Backstage Style */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#185abd] to-blue-600 flex items-center justify-center text-white shadow-md font-bold text-lg">
              📁
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {isEn ? 'File & Document Manager' : 'Menu Berkas & Pengelola Dokumen'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {documents.length} {isEn ? 'Files' : 'Berkas'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isEn 
                  ? 'Switch documents, organize thesis chapters, and manage independent manuscripts.' 
                  : 'Beralih dokumen, kelola bab skripsi/tesis, dan naskah independen Anda.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCreate}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#185abd] hover:bg-[#124999] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <IconFilePlus className="w-4 h-4" />
              <span>{isEn ? '+ New Document' : '+ Dokumen Baru'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title={isEn ? 'Close' : 'Tutup'}
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Search, Filter Pills & Sort Bar */}
        <div className="px-6 py-3 border-b border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEn ? 'Search documents by title...' : 'Cari berkas dokumen...'}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <IconX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isEn ? `All (${documents.length})` : `Semua (${documents.length})`}
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('thesis')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition cursor-pointer ${
                activeFilter === 'thesis'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🎓</span>
              <span>{isEn ? `Thesis (${thesisDocs.length})` : `Skripsi (${thesisDocs.length})`}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('independent')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition cursor-pointer ${
                activeFilter === 'independent'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>📄</span>
              <span>{isEn ? `Independent (${independentDocs.length})` : `Mandiri (${independentDocs.length})`}</span>
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold">{isEn ? 'Sort:' : 'Urut:'}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="recent">{isEn ? 'Recently Edited' : 'Terakhir Diedit'}</option>
              <option value="title">{isEn ? 'Title (A-Z)' : 'Judul (A-Z)'}</option>
            </select>
          </div>
        </div>

        {/* 3. Document Cards Content (Scrollable Grid) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 thin-scroll bg-slate-50/40 dark:bg-slate-900/40">
          {displayedDocs.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-2xl text-slate-400">
                📄
              </div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {isEn ? 'No documents found' : 'Tidak ada dokumen yang sesuai'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? (isEn ? `No documents match "${searchQuery}".` : `Tidak ada dokumen yang cocok dengan "${searchQuery}".`)
                  : (isEn ? 'Start by creating your first document.' : 'Mulai dengan membuat dokumen pertama Anda.')}
              </p>
              <button
                type="button"
                onClick={handleCreate}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#185abd] text-white font-bold text-xs shadow-sm hover:bg-[#124999] transition cursor-pointer"
              >
                <IconFilePlus className="w-4 h-4" />
                <span>{isEn ? '+ Create New Document' : '+ Buat Dokumen Baru'}</span>
              </button>
            </div>
          ) : (
            <>
              {/* Thesis Section if in 'all' or 'thesis' */}
              {(activeFilter === 'all' || activeFilter === 'thesis') && projectGroups.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🎓</span>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        {isEn ? 'Thesis / Research Projects' : 'Proyek Skripsi / Thesis'}
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {thesisDocs.length} {isEn ? 'Chapters' : 'Bab'}
                    </span>
                  </div>

                  {projectGroups.map((group) => {
                    // Filter group docs by search query if any
                    const groupDocs = searchQuery.trim()
                      ? group.docs.filter((d) => d.title.toLowerCase().includes(searchQuery.toLowerCase()))
                      : group.docs;
                    if (groupDocs.length === 0) return null;

                    return (
                      <div key={group.id} className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                            <IconFolder className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span>{group.name}</span>
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                            {groupDocs.length} {isEn ? 'files' : 'berkas'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {groupDocs.map((doc) => {
                            const isActive = doc.id === currentDocumentId;
                            return (
                              <div
                                key={doc.id}
                                onClick={() => handleSelect(doc.id)}
                                className={`group p-3 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                                  isActive
                                    ? 'bg-white dark:bg-slate-800 border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20 shadow-sm'
                                    : 'bg-white dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-xs'
                                }`}
                              >
                                <div className="space-y-1.5">
                                  <div className="flex items-start justify-between gap-1">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <IconFile className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                        {doc.title || (isEn ? 'Untitled Document' : 'Dokumen Tanpa Judul')}
                                      </h4>
                                    </div>
                                    {isActive && (
                                      <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                        {isEn ? 'Active' : 'Aktif'}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-700/60 text-[10px] text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <IconClock className="w-3 h-3" />
                                    <span>{formatDate(doc.updated_at || doc.created_at)}</span>
                                  </span>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {onDeleteDocument && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDocToDelete({ id: doc.id, title: doc.title });
                                        }}
                                        className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                                        title={isEn ? 'Delete chapter' : 'Hapus bab'}
                                      >
                                        <IconTrash className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-0.5">
                                      {isEn ? 'Open' : 'Buka'} →
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Independent Documents Section */}
              {(activeFilter === 'all' || activeFilter === 'independent') && independentDocs.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📄</span>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        {isEn ? 'Independent Documents' : 'Dokumen Mandiri'}
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {independentDocs.length} {isEn ? 'Documents' : 'Dokumen'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {(activeFilter === 'all' ? displayedDocs.filter((d) => !d.settings?.projectId) : displayedDocs).map((doc) => {
                      const isActive = doc.id === currentDocumentId;
                      return (
                        <div
                          key={doc.id}
                          onClick={() => handleSelect(doc.id)}
                          className={`group p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                            isActive
                              ? 'bg-white dark:bg-slate-800 border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20 shadow-sm'
                              : 'bg-white dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between gap-1">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                  isActive ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
                                }`}>
                                  <IconFile className="w-4 h-4" />
                                </div>
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                  {doc.title || (isEn ? 'Untitled Document' : 'Dokumen Tanpa Judul')}
                                </h4>
                              </div>
                              {isActive && (
                                <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                  {isEn ? 'Active' : 'Aktif'}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2.5 mt-3 border-t border-slate-100 dark:border-slate-700/60 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <IconCalendar className="w-3 h-3" />
                              <span>{formatDate(doc.updated_at || doc.created_at)}</span>
                            </span>
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {onDeleteDocument && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDocToDelete({ id: doc.id, title: doc.title });
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                                  title={isEn ? 'Delete document' : 'Hapus dokumen'}
                                >
                                  <IconTrash className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <span className="text-[#185abd] dark:text-blue-400 font-bold flex items-center gap-0.5">
                                {isEn ? 'Open' : 'Buka'} →
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 4. Footer Summary Bar */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>💡</span>
            <span>
              {isEn 
                ? 'Tip: You can quickly access this menu anytime from the File button in the top ribbon.' 
                : 'Tips: Anda dapat membuka menu ini kapan saja melalui tombol File di pita ribbon atas.'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer"
          >
            {isEn ? 'Close' : 'Tutup'}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal Overlay */}
      {docToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {isEn ? 'Delete Document?' : 'Hapus Dokumen?'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {isEn
                ? `Are you sure you want to permanently delete "${docToDelete.title}"? This action cannot be undone.`
                : `Apakah Anda yakin ingin menghapus "${docToDelete.title}" secara permanen? Tindakan ini tidak dapat dibatalkan.`}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                {isEn ? 'Cancel' : 'Batal'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition"
              >
                {isEn ? 'Delete' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
