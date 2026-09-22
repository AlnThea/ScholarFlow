import React from 'react';
import { IconFilePlus, IconBook, IconFolderOpen, IconFolder, IconChevronDown, IconFile } from '@tabler/icons-react';

interface UserDashboardTabProps {
  onCreateDocument: () => void;
  showAlertModal: (title: string, message: string, type: 'info' | 'warning' | 'error' | 'success') => void;
  language: string;
  documents: any[];
  groupedDocs: any;
  dashboardExpandedProjects: Record<string, boolean>;
  setDashboardExpandedProjects: (val: any) => void;
  onSelectDocument: (id: string) => void;
}

export function UserDashboardTab({
  onCreateDocument,
  showAlertModal,
  language,
  documents,
  groupedDocs,
  dashboardExpandedProjects,
  setDashboardExpandedProjects,
  onSelectDocument
}: UserDashboardTabProps) {
  const isEn = language === 'en';

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-2 max-w-lg">
          <h1 className="text-xl md:text-2xl font-bold leading-tight">
            {isEn ? 'Welcome back to ScholarFlow!' : 'Selamat datang kembali di ScholarFlow!'}
          </h1>
          <p className="text-xs md:text-sm text-indigo-100/90 leading-normal">
            {isEn 
              ? 'Your scientific writing assistant platform. Manage academic journal drafts and PDF references in one place.' 
              : 'Platform asisten penulisan karya ilmiah Anda. Kelola draf jurnal akademik dan referensi PDF dalam satu tempat.'}
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12 h-64 w-64 rounded-full border-[20px] border-white" />
      </div>

      {/* Quick Actions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={onCreateDocument}
          className="flex items-start gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md rounded-2xl text-left cursor-pointer transition group"
        >
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:scale-105 transition">
            <IconFilePlus className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {isEn ? 'Create New Document' : 'Buat Dokumen Baru'}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 leading-normal">
              {isEn 
                ? 'Start writing a new academic journal draft with CSL citation formatting guidelines.' 
                : 'Mulai menulis draf jurnal akademik baru dengan panduan format sitasi CSL.'}
            </span>
          </div>
        </button>

        <button
          onClick={() => {
            showAlertModal(
              isEn ? 'Manage PDF References' : 'Kelola Rujukan PDF',
              isEn
                ? "Please click the 'Library' menu in the left sidebar to manage your PDF references."
                : "Silakan klik menu 'Library' di sidebar kiri untuk mengelola rujukan PDF Anda.",
              'info'
            );
          }}
          className="flex items-start gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md rounded-2xl text-left cursor-pointer transition group"
        >
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:scale-105 transition">
            <IconBook className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {isEn ? 'Manage Journal Collection (Library)' : 'Kelola Koleksi Jurnal (Library)'}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 leading-normal">
              {isEn 
                ? 'Upload your PDF / RIS files to be used as references by the AI assistant.' 
                : 'Unggah berkas PDF / RIS Anda untuk dijadikan rujukan asisten AI.'}
            </span>
          </div>
        </button>
      </div>

      {/* Recent Documents list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col gap-4">
        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
          {isEn ? 'Your Document List' : 'Daftar Dokumen Anda'}
        </span>

        <div className="flex flex-col gap-1.5">
          {documents.length > 0 ? (
            <div className="flex flex-col gap-3">
              {/* 1. Project Folders */}
              {groupedDocs?.projects?.map((proj: any) => {
                const isExpandedProject = !!dashboardExpandedProjects[proj.id];

                return (
                  <div key={proj.id} className="flex flex-col gap-1 border border-slate-100 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-800/10 rounded-2xl p-3 shadow-sm">
                    {/* Project Header Row */}
                    <button
                      type="button"
                      onClick={() => setDashboardExpandedProjects((prev: any) => ({ ...prev, [proj.id]: !isExpandedProject }))}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-left transition hover:bg-slate-100/50 dark:hover:bg-slate-800/50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 truncate">
                        {isExpandedProject ? (
                          <IconFolderOpen className="h-5 w-5 text-indigo-500 shrink-0" />
                        ) : (
                          <IconFolder className="h-5 w-5 text-slate-400 dark:text-slate-500 shrink-0" />
                        )}
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{proj.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize shrink-0">
                          {proj.type}
                        </span>
                      </div>
                      <IconChevronDown className={`h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform ${isExpandedProject ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Project Sub Documents */}
                    {isExpandedProject && (
                      <div className="flex flex-col gap-1.5 pl-4 border-l-2 border-slate-100 dark:border-slate-800 ml-4.5 mt-1 animate-slide-in-top">
                        {proj.docs.map((doc: any) => (
                          <button
                            key={doc.id}
                            onClick={() => onSelectDocument?.(doc.id)}
                            className="w-full flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900/50 hover:bg-indigo-50/10 dark:hover:bg-indigo-900/20 rounded-xl text-left transition cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <IconFile className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                📄 {doc.settings?.projectPart || doc.title}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                              {isEn ? 'Updated: ' : 'Diperbarui: '}{new Date(doc.updated_at).toLocaleDateString()}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 2. Independent / Single Documents */}
              {groupedDocs?.independent?.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-1">
                    {isEn ? 'Independent Documents' : 'Dokumen Mandiri'}
                  </span>
                  {groupedDocs.independent.map((doc: any) => (
                    <button
                      key={doc.id}
                      onClick={() => onSelectDocument?.(doc.id)}
                      className="w-full flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900/50 hover:bg-indigo-50/10 dark:hover:bg-indigo-900/20 rounded-xl text-left transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <IconFile className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{doc.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {isEn ? 'Updated: ' : 'Diperbarui: '}{new Date(doc.updated_at).toLocaleDateString()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 flex flex-col items-center justify-center gap-2">
              <IconFile className="h-10 w-10 text-slate-300 dark:text-slate-600" />
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {isEn ? 'No documents created yet.' : 'Belum ada dokumen yang dibuat.'}
              </span>
              <button
                onClick={onCreateDocument}
                className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
              >
                {isEn ? 'Create Document Now' : 'Buat Dokumen Sekarang'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
