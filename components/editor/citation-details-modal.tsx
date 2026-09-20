import React from 'react';
import type { CitationCandidate } from '@/lib/api/citations';
import { findMostRelevantSentence, HighlightedAbstract } from '@/lib/editor/editor-utils';

interface CitationDetailsModalProps {
  language: string;
  activeModalCitation: { refId: string; label: string; citedSentence: string };
  candidate?: CitationCandidate;
  isTranslating: boolean;
  translatedCitedSentence: string;
  isResolvingPdf: boolean;
  resolvedPdfUrl: string | null;
  onClose: () => void;
  onOpenPdf: (url: string, searchTerm: string) => void;
}

export function CitationDetailsModal({
  language,
  activeModalCitation,
  candidate,
  isTranslating,
  translatedCitedSentence,
  isResolvingPdf,
  resolvedPdfUrl,
  onClose,
  onOpenPdf
}: CitationDetailsModalProps) {
  if (!activeModalCitation) return null;
  const citedSentence = activeModalCitation.citedSentence;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col transform transition-all scale-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
            <h3 className="text-sm font-bold text-slate-800">{language === 'en' ? 'Journal Citation Details' : 'Detail Sitasi Jurnal'}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition"
            aria-label={language === 'en' ? 'Close' : 'Tutup'}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {candidate ? (
            <>
              {/* Title */}
              <div className="flex flex-col gap-1">
                <h4 className="text-base font-bold text-slate-800 leading-snug">
                  {candidate.title}
                </h4>
                <p className="text-xs font-semibold text-slate-505 mt-1">
                  {candidate.authors.join(', ')}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {candidate.journal ? `${candidate.journal} · ` : ''}{candidate.year || 'N/A'} · Source: {candidate.source}
                </p>
              </div>

              {/* Cited claim in the editor */}
              {citedSentence && (
                <div className="bg-slate-50 border-l-4 border-indigo-500 p-4 rounded-r-xl text-slate-650">
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1.5 flex items-center gap-1">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 2v4c0 1.25.75 2 2 2h4c0 2.5-1.75 4.5-4 5v2m14 3c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-4c-1.25 0-2 .75-2 2v4c0 1.25.75 2 2 2h4c0 2.5-1.75 4.5-4 5v2"></path>
                    </svg>
                    {language === 'en' ? 'Your Claim/Statement:' : 'Klaim/Pernyataan Anda:'}
                  </span>
                  <p className="italic font-medium text-xs text-slate-600">"{citedSentence}"</p>
                </div>
              )}                    {/* Matched text in Journal */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{language === 'en' ? 'Relevant Quote from Journal (Matching Snippet):' : 'Kutipan Terkait dari Jurnal (Matching Snippet):'}</span>
                <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/80 text-xs leading-relaxed text-indigo-950 font-medium italic min-h-[4rem] flex items-center justify-center">
                  {isTranslating ? (
                    <span className="text-[11px] text-slate-400 font-medium animate-pulse flex items-center gap-1.5 justify-center py-2 w-full">
                      <svg className="animate-spin h-3.5 w-3.5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {language === 'en' ? 'Translating & matching cross-lingual quotes...' : 'Menerjemahkan & mencocokkan kutipan lintas bahasa...'}
                    </span>
                  ) : (
                    `"${findMostRelevantSentence(candidate.abstract, translatedCitedSentence || citedSentence || '')}"`
                  )}
                </div>
              </div>

              {/* Full Abstract with Highlight */}
              {candidate.abstract && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{language === 'en' ? 'Full Journal Abstract:' : 'Abstrak Lengkap Jurnal:'}</span>
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                    <HighlightedAbstract abstract={candidate.abstract} query={translatedCitedSentence || citedSentence || ''} />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              {language === 'en' ? 'Citation detail information not found in local library.' : 'Informasi detail sitasi tidak ditemukan di pustaka lokal.'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            {language === 'en' ? 'Close' : 'Tutup'}
          </button>
          {isResolvingPdf && !resolvedPdfUrl && (
            <span className="text-[10px] text-slate-400 font-medium animate-pulse mr-2 flex items-center gap-1.5">
              <svg className="animate-spin h-3.5 w-3.5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Mencari PDF...
            </span>
          )}
          {resolvedPdfUrl && (
            <button
              type="button"
              onClick={() => {
                const relevantSentence = findMostRelevantSentence(candidate?.abstract, translatedCitedSentence || citedSentence || '');
                const rawSearchTerm = relevantSentence || citedSentence || '';
                
                // Clean brackets and quotes, and limit to first 25 words to avoid PDF line wrap issues
                let cleanSentence = rawSearchTerm
                  .replace(/[\[\]"']/g, "")
                  .replace(/\s+/g, " ")
                  .trim();
                
                const words = cleanSentence.split(" ");
                if (words.length > 25) {
                  cleanSentence = words.slice(0, 25).join(" ");
                }
                
                onOpenPdf(resolvedPdfUrl, cleanSentence);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-semibold shadow-sm transition animate-fade-in"
            >
              Buka PDF di Sidebar
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
              </svg>
            </button>
          )}
          {candidate?.url && (
            <button
              type="button"
              onClick={() => window.open(candidate.url!, '_blank', 'noopener,noreferrer')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-semibold shadow-sm transition"
            >
              Buka Web Jurnal
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
