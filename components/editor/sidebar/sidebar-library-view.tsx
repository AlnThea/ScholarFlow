import React from 'react';
import { CitationCandidate } from '@/lib/api/citations';

interface SidebarLibraryViewProps {
  language: 'en' | 'id';
  setActiveView: (view: 'main' | 'documents' | 'library' | 'settings') => void;
  handleUploadFile: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  isUploadingPdf: boolean;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  uploadError: string | null;
  librarySearchQuery: string;
  setLibrarySearchQuery: (query: string) => void;
  filteredLibraryItems: [string, CitationCandidate][];
  handleDeleteLibraryItem: (refId: string) => Promise<void>;
}

export function SidebarLibraryView({
  language,
  setActiveView,
  handleUploadFile,
  isUploadingPdf,
  uploadStatus,
  uploadError,
  librarySearchQuery,
  setLibrarySearchQuery,
  filteredLibraryItems,
  handleDeleteLibraryItem,
}: SidebarLibraryViewProps) {
  return (
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
  );
}
