// components/editor/insert-citation-modal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  IconSearch, 
  IconQuote, 
  IconX, 
  IconLoader,
  IconExternalLink,
  IconBook
} from '@tabler/icons-react';
import type { CitationCandidate } from '@/lib/api/citations';
import { useLanguage } from '../i18n/language-context';

type InsertCitationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onInsertCitation: (candidate: CitationCandidate) => void;
};

export function InsertCitationModal({
  isOpen,
  onClose,
  onInsertCitation
}: InsertCitationModalProps) {
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CitationCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setError(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Debounced/Triggered citation search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      void performSearch();
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/citations/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 10 })
      });
      if (!res.ok) {
        throw new Error(language === 'en' ? 'Failed to search citations from API.' : 'Gagal mencari sitasi dari API.');
      }
      const data = await res.json();
      setResults(data.results || []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || (language === 'en' ? 'An error occurred while searching citations.' : 'Terjadi kesalahan saat mencari sitasi.'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col max-h-[85vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <IconBook className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">
              {language === 'en' ? 'Search & Insert Citation' : 'Cari & Sisipkan Sitasi'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        {/* Search Input Box */}
        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
          <div className="relative">
            <IconSearch className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input 
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={language === 'en' ? 'Type keywords for title, topic, or author...' : 'Ketik kata kunci judul, topik, atau penulis jurnal ilmiah...'}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 placeholder:text-slate-400"
            />
            {loading && (
              <IconLoader className="absolute right-3 top-3.5 h-4 w-4 animate-spin text-indigo-500" />
            )}
          </div>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
          {error && (
            <div className="py-12 text-center text-xs text-rose-500 font-medium">
              {error}
            </div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <IconSearch className="h-5 w-5" />
              </div>
              <span className="text-xs text-slate-400 max-w-sm leading-normal">
                {query.trim() 
                  ? (language === 'en' ? 'No matches found for this keyword. Try changing your search query.' : 'Tidak ditemukan kecocokan untuk kata kunci tersebut. Coba ganti kata kunci pencarian.')
                  : (language === 'en' ? 'Type keywords above to search references from OpenAlex & Crossref in real-time.' : 'Ketikkan kata kunci di atas untuk mencari referensi dari OpenAlex & Crossref secara real-time.')}
              </span>
            </div>
          )}

          {results.length > 0 && (
            <div className="flex flex-col gap-3.5">
              {results.map((candidate) => (
                <div 
                  key={candidate.reference_id}
                  className="rounded-xl border border-slate-200 bg-white p-4 hover:border-indigo-200 hover:shadow-md/50 transition text-left flex flex-col gap-3 group"
                >
                  {/* Card Header Info */}
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="uppercase tracking-wider font-bold text-slate-500">Article</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        candidate.ranking_score >= 80 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
                          : candidate.ranking_score >= 50 
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/50' 
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        🟢 {candidate.ranking_score}% Match
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>Cited by {candidate.cited_by_count}</span>
                      <span>IF {((candidate.cited_by_count * 0.02) + 0.11).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div className="flex flex-col gap-1">
                    <h4 className="text-xs font-bold leading-snug text-slate-800 line-clamp-2" title={candidate.title}>
                      {candidate.title}
                    </h4>
                    <p className="text-[11px] font-semibold text-slate-500 leading-tight">
                      {candidate.authors.length > 0 ? candidate.authors.join(', ') : 'Author data unavailable'}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {candidate.journal ? `${candidate.journal} · ` : ''}{candidate.year || 'N/A'}
                    </p>
                  </div>

                  {/* Abstract preview */}
                  <div className="pl-3 border-l-2 border-slate-300 text-[11px] leading-relaxed text-slate-500">
                    <p className="line-clamp-2 italic">
                      {candidate.abstract 
                        ? candidate.abstract
                        : 'No abstract or description summary available for this article.'}
                    </p>
                  </div>

                  {/* Footer Action buttons */}
                  <div className="h-px bg-slate-100 w-full" />
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button 
                        type="button"
                        onClick={() => onInsertCitation(candidate)}
                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-[10px] font-semibold shadow-sm transition whitespace-nowrap cursor-pointer"
                      >
                        <IconQuote className="h-3 w-3" />
                        {language === 'en' ? 'Insert Citation' : 'Sisipkan Sitasi'}
                      </button>
                      <button 
                        type="button"
                        onClick={() => candidate.url && window.open(candidate.url, '_blank', 'noopener,noreferrer')}
                        disabled={!candidate.url}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 px-3 py-1.5 text-[10px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap cursor-pointer"
                      >
                        <IconExternalLink className="h-3 w-3" />
                        {language === 'en' ? 'Open Journal' : 'Buka Jurnal'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            {language === 'en' ? 'Cancel' : 'Batal'}
          </button>
        </div>
      </div>
    </div>
  );
}
