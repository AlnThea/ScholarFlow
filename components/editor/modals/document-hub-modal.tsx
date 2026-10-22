// components/editor/modals/document-hub-modal.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  IconFilter,
  IconChevronRight,
  IconCloudCheck,
  IconFolders,
  IconFileText
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
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
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

  // Filter based on search & active tab & selected project
  const displayedDocs = useMemo(() => {
    let list = documents;
    if (activeFilter === 'thesis') {
      list = selectedProjectId
        ? (projectGroups.find((g) => g.id === selectedProjectId)?.docs || [])
        : thesisDocs;
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
  }, [documents, thesisDocs, independentDocs, projectGroups, activeFilter, selectedProjectId, searchQuery, sortBy]);

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

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      {/* 1. Header Bar: Full-Width Word Backstage / History Style */}
      <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#185abd] to-blue-600 text-white shadow-md font-bold text-lg">
            📁
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                {isEn ? 'File & Document Hub' : 'Menu Berkas & Pengelola Dokumen'}
              </h2>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200 dark:bg-blue-950/80 dark:border-blue-800 dark:text-blue-300">
                {documents.length} {isEn ? 'Documents' : 'Dokumen'}
              </span>
              <span className="hidden sm:inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Word Backstage
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEn
                ? 'Browse all manuscripts, organize multi-chapter thesis projects, and create new drafts.'
                : 'Jelajahi seluruh naskah, kelola bab skripsi/tesis, dan buat dokumen ilmiah baru.'}
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#185abd] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#124999] transition cursor-pointer"
          >
            <IconFilePlus className="h-4 w-4" />
            <span>{isEn ? '+ New Document' : '+ Dokumen Baru'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
            title={isEn ? 'Return to active editor' : 'Kembali ke editor aktif'}
          >
            <span className="hidden sm:inline">{isEn ? 'Back to Editor' : 'Kembali ke Editor'}</span>
            <IconX className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* 2. Main Workspace Layout: 2-Column Expansive View */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Sidebar */}
        <aside className="w-72 lg:w-80 border-r border-slate-200 bg-slate-50/70 p-4 overflow-y-auto shrink-0 dark:border-slate-800 dark:bg-slate-900/60 flex flex-col justify-between thin-scroll">
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 block mb-2">
                {isEn ? 'Categories' : 'Kategori Dokumen'}
              </span>
              <div className="space-y-1">
                {/* All Documents */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter('all');
                    setSelectedProjectId(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeFilter === 'all' && !selectedProjectId
                      ? 'bg-[#185abd] text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconFolders className="w-4 h-4" />
                    <span>{isEn ? 'All Documents' : 'Semua Dokumen'}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    activeFilter === 'all' && !selectedProjectId
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {documents.length}
                  </span>
                </button>

                {/* Thesis Projects */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter('thesis');
                    setSelectedProjectId(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeFilter === 'thesis' && !selectedProjectId
                      ? 'bg-[#185abd] text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm">🎓</span>
                    <span>{isEn ? 'Thesis & Research' : 'Skripsi & Penelitian'}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    activeFilter === 'thesis' && !selectedProjectId
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  }`}>
                    {thesisDocs.length}
                  </span>
                </button>

                {/* Independent Documents */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter('independent');
                    setSelectedProjectId(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeFilter === 'independent'
                      ? 'bg-[#185abd] text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm">📄</span>
                    <span>{isEn ? 'Independent' : 'Naskah Mandiri'}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    activeFilter === 'independent'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {independentDocs.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Thesis Projects List (Nested folders) */}
            {projectGroups.length > 0 && (
              <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 block mb-2">
                  {isEn ? 'Thesis Binders' : 'Proyek Skripsi Aktif'}
                </span>
                <div className="space-y-1">
                  {projectGroups.map((group) => {
                    const isSelected = activeFilter === 'thesis' && selectedProjectId === group.id;
                    return (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => {
                          setActiveFilter('thesis');
                          setSelectedProjectId(group.id);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-200 font-bold border border-indigo-200 dark:border-indigo-800'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <IconFolder className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                          <span className="truncate">{group.name}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                          {group.docs.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Info Card */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/30 p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-200">
                <IconCloudCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{isEn ? 'Cloud Synchronized' : 'Tersimpan ke Cloud'}</span>
              </div>
              <p className="text-[11px] text-blue-800/70 dark:text-blue-300/70 leading-relaxed">
                {isEn
                  ? 'All manuscripts auto-save in real-time with dual local and cloud snapshots.'
                  : 'Seluruh naskah tersimpan otomatis secara real-time ke penyimpanan awan dan lokal.'}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              ← {isEn ? 'Back to Manuscript' : 'Kembali ke Naskah'}
            </button>
          </div>
        </aside>

        {/* Right Main Content Area: Spacious Document Explorer */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
          {/* Top Search & Filter Bar */}
          <div className="px-6 py-3.5 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex flex-wrap items-center justify-between gap-4 shrink-0">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEn ? 'Search documents by title or topic...' : 'Cari berkas dokumen naskah...'}
                className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#185abd] transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <IconX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills on Small Screens & Sort Dropdown */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="text-[11px] font-semibold">{isEn ? 'Sort by:' : 'Urutkan:'}</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="recent">{isEn ? 'Recently Edited' : 'Terakhir Diedit'}</option>
                  <option value="title">{isEn ? 'Title (A-Z)' : 'Judul (A-Z)'}</option>
                </select>
              </div>

              <span className="text-xs font-semibold text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-3">
                {displayedDocs.length} {isEn ? 'found' : 'ditemukan'}
              </span>
            </div>
          </div>

          {/* Document Cards Content Area */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 thin-scroll">
            {displayedDocs.length === 0 ? (
              <div className="py-24 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-3xl text-slate-400">
                  📄
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
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
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#185abd] text-white font-bold text-xs shadow-sm hover:bg-[#124999] transition cursor-pointer"
                >
                  <IconFilePlus className="w-4 h-4" />
                  <span>{isEn ? '+ Create New Document' : '+ Buat Dokumen Baru'}</span>
                </button>
              </div>
            ) : (
              <>
                {/* Thesis Projects Section (if viewing all or thesis without single project selection) */}
                {(activeFilter === 'all' || (activeFilter === 'thesis' && !selectedProjectId)) && projectGroups.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🎓</span>
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                          {isEn ? 'Thesis & Research Projects' : 'Proyek Skripsi & Tesis'}
                        </h3>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {thesisDocs.length} {isEn ? 'Chapters across' : 'Bab di'} {projectGroups.length} {isEn ? 'Projects' : 'Proyek'}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {projectGroups.map((group) => {
                        const groupDocs = searchQuery.trim()
                          ? group.docs.filter((d) => d.title.toLowerCase().includes(searchQuery.toLowerCase()))
                          : group.docs;
                        if (groupDocs.length === 0) return null;

                        return (
                          <div
                            key={group.id}
                            className="p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-white dark:bg-slate-900/90 shadow-2xs space-y-3.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                                  <IconFolder className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                    {group.name}
                                  </h4>
                                  <span className="text-[11px] text-slate-400">
                                    {groupDocs.length} {isEn ? 'manuscript chapters' : 'bab naskah'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                              {groupDocs.map((doc) => {
                                const isActive = doc.id === currentDocumentId;
                                return (
                                  <div
                                    key={doc.id}
                                    onClick={() => handleSelect(doc.id)}
                                    className={`group p-4 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between hover:shadow-md ${
                                      isActive
                                        ? 'bg-indigo-50/50 dark:bg-slate-800 border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs'
                                        : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600'
                                    }`}
                                  >
                                    <div className="space-y-2">
                                      <div className="flex items-start justify-between gap-1.5">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                            isActive
                                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                          }`}>
                                            <IconFile className="w-4 h-4" />
                                          </div>
                                          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate" title={doc.title}>
                                            {doc.title || (isEn ? 'Untitled Chapter' : 'Bab Tanpa Judul')}
                                          </h5>
                                        </div>
                                        {isActive && (
                                          <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                            {isEn ? 'Active' : 'Aktif'}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                                      <span className="flex items-center gap-1 text-[10px]">
                                        <IconClock className="w-3 h-3" />
                                        <span>{formatDate(doc.updated_at || doc.created_at)}</span>
                                      </span>
                                      <div className="flex items-center gap-1.5">
                                        {onDeleteDocument && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setDocToDelete({ id: doc.id, title: doc.title });
                                            }}
                                            className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition opacity-0 group-hover:opacity-100"
                                            title={isEn ? 'Delete chapter' : 'Hapus bab'}
                                          >
                                            <IconTrash className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                        <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
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
                  </div>
                )}

                {/* Independent Documents Section (or single project view) */}
                {(activeFilter === 'all' || activeFilter === 'independent' || (activeFilter === 'thesis' && selectedProjectId)) && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {selectedProjectId ? '🎓' : '📄'}
                        </span>
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                          {selectedProjectId
                            ? projectGroups.find((g) => g.id === selectedProjectId)?.name || (isEn ? 'Project Chapters' : 'Bab Proyek')
                            : (isEn ? 'Independent Documents' : 'Dokumen Mandiri')}
                        </h3>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {(activeFilter === 'all' ? displayedDocs.filter((d) => !d.settings?.projectId) : displayedDocs).length} {isEn ? 'Documents' : 'Dokumen'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {(activeFilter === 'all' ? displayedDocs.filter((d) => !d.settings?.projectId) : displayedDocs).map((doc) => {
                        const isActive = doc.id === currentDocumentId;
                        return (
                          <div
                            key={doc.id}
                            onClick={() => handleSelect(doc.id)}
                            className={`group p-4 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between hover:shadow-md ${
                              isActive
                                ? 'bg-blue-50/50 dark:bg-slate-800 border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                                : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-1.5">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                    isActive
                                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
                                  }`}>
                                    <IconFileText className="w-4.5 h-4.5" />
                                  </div>
                                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate" title={doc.title}>
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

                            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                              <span className="flex items-center gap-1 text-[10px]">
                                <IconCalendar className="w-3 h-3" />
                                <span>{formatDate(doc.updated_at || doc.created_at)}</span>
                              </span>
                              <div className="flex items-center gap-1.5">
                                {onDeleteDocument && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDocToDelete({ id: doc.id, title: doc.title });
                                    }}
                                    className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition opacity-0 group-hover:opacity-100"
                                    title={isEn ? 'Delete document' : 'Hapus dokumen'}
                                  >
                                    <IconTrash className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <span className="text-[#185abd] dark:text-blue-400 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
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
        </main>
      </div>

      {/* Delete Confirmation Modal Overlay */}
      {docToDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 bg-white dark:bg-slate-850 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
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
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {isEn ? 'Cancel' : 'Batal'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition cursor-pointer"
              >
                {isEn ? 'Delete' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
