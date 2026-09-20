import React from 'react';
import { IconSearch, IconQuote, IconExternalLink, IconHeart } from '@tabler/icons-react';

export type CitationMenuProps = {
  setBubbleMode: (mode: 'format' | 'citation') => void;
  selectedText: string;
  setShowBubbleMenu: (show: boolean) => void;
  isSearchingCitations: boolean;
  citationError: string | null;
  citationResults: any[];
  editorJsRef: any;
  onInsertCitationCandidate: (candidate: any, isFromSearch?: boolean) => void;
  expandedCardId: string | null;
  setExpandedCardId: (id: string | null) => void;
  findMostRelevantSentence: (abs: string | null | undefined, query: string) => string;
};

export function CitationMenu({
  setBubbleMode, selectedText, setShowBubbleMenu, isSearchingCitations,
  citationError, citationResults, editorJsRef, onInsertCitationCandidate,
  expandedCardId, setExpandedCardId, findMostRelevantSentence
}: CitationMenuProps) {
  return (
                      <div className="flex flex-col">
      
                        {/* Header */}
      
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
      
                          <button
      
                            className="p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition flex-shrink-0"
      
                            onMouseDown={e => e.preventDefault()}
      
                            onClick={() => setBubbleMode('format')}
      
                            title="Back"
      
                          >
      
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
      
                          </button>
      
                          <IconSearch className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
      
                          <span className="text-xs font-semibold text-slate-700 truncate flex-1">
      
                            {typeof document !== 'undefined' && document.querySelector('span[data-citation-search="true"]') ? 'Mencari Sitasi...' : `"${selectedText.slice(0, 40)}${selectedText.length > 40 ? '…' : ''}"`}
      
                          </span>
      
                          <button
      
                            className="p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition flex-shrink-0"
      
                            onMouseDown={e => e.preventDefault()}
      
                            onClick={() => { setShowBubbleMenu(false); setBubbleMode('format'); }}
      
                            title="Close"
      
                          >
      
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      
                          </button>
      
                        </div>
      
      
      
                        {/* Loading */}
      
                        {isSearchingCitations && (
      
                          <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-400">
      
                            <svg className="h-4 w-4 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      
                              <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
      
                              <path d="M12 2a10 10 0 0 1 10 10" />
      
                            </svg>
      
                            Searching citations...
      
                          </div>
      
                        )}
      
      
      
                        {/* Error */}
      
                        {!isSearchingCitations && citationError && (
      
                          <div className="px-3 py-4 text-xs text-red-500 text-center">
      
                            {citationError}
      
                          </div>
      
                        )}
      
      
      
                        {/* Results */}
      
                        {!isSearchingCitations && !citationError && citationResults.length === 0 && (
      
                          <div className="px-3 py-4 text-xs text-slate-400 text-center">
      
                            No citations found. Try selecting different text.
      
                          </div>
      
                        )}
      
      
      
                        {!isSearchingCitations && citationResults.length > 0 && (
      
                          <div className="flex flex-col gap-3 p-3 max-h-[380px] overflow-y-auto bg-slate-50/50">
      
                            {citationResults.map((candidate) => (
      
                              <div
      
                                key={candidate.reference_id}
      
                                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-3 text-left"
      
                              >
      
                                {/* Top row: Article header details */}
      
                                <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
      
                                  <div className="flex items-center gap-1.5">
      
                                    <span className="uppercase tracking-wider font-bold text-slate-500">Article</span>
      
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${candidate.ranking_score >= 80
      
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
      
      
      
                                {/* Title, Authors, Journal & Year */}
      
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
      
      
      
                                {/* Abstract text with left border line */}
      
                                <div className="pl-3 border-l-2 border-slate-300 text-[11px] leading-relaxed text-slate-500">
      
                                  <p className="line-clamp-2 italic">
      
                                    {candidate.abstract
      
                                      ? candidate.abstract
      
                                      : 'No abstract or description summary available for this article.'}
      
                                  </p>
      
                                </div>
      
      
      
                                {/* Divider */}
      
                                <div className="h-px bg-slate-100 w-full" />
      
      
      
                                {/* Bottom Row: Actions (Left) & Favorite/Source Icon (Right) */}
      
                                <div className="flex items-center justify-between gap-4">
      
                                  {/* Left: Action Buttons */}
      
                                  <div className="flex items-center gap-2 flex-shrink-0">
      
                                    {/* Tombol Cite */}
      
                                    <button
      
                                      type="button"
      
                                      onClick={() => {
      
                                        const hasSearchSpan = !!document.querySelector('span[data-citation-search="true"]');
      
                                        if (hasSearchSpan) {
      
                                          editorJsRef.current?.insertCitationAtSearch(candidate.citation_label, candidate.reference_id);
      
                                          onInsertCitationCandidate(candidate, true);
      
                                        } else {
      
                                          onInsertCitationCandidate(candidate);
      
                                        }
      
                                        setShowBubbleMenu(false);
      
                                        setBubbleMode('format');
      
                                      }}
      
                                      className="inline-flex items-center justify-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-[10px] font-semibold shadow-sm transition whitespace-nowrap"
      
                                    >
      
                                      <IconQuote className="h-3 w-3" />
      
                                      Cite
      
                                    </button>
      
      
      
                                    {/* Tombol View */}
      
                                    <button
      
                                      type="button"
      
                                      onClick={() => candidate.url && window.open(candidate.url, '_blank', 'noopener,noreferrer')}
      
                                      disabled={!candidate.url}
      
                                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 px-3 py-1.5 text-[10px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
      
                                    >
      
                                      <IconExternalLink className="h-3 w-3" />
      
                                      View
      
                                    </button>
      
      
      
                                    {/* Tombol Konteks (Toggle) */}
      
                                    {candidate.abstract && (
      
                                      <button
      
                                        type="button"
      
                                        onClick={() => setExpandedCardId(expandedCardId === candidate.reference_id ? null : candidate.reference_id)}
      
                                        className={`inline-flex items-center justify-center gap-1 rounded-lg border px-3 py-1.5 text-[10px] font-semibold transition whitespace-nowrap ${expandedCardId === candidate.reference_id
      
                                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
      
                                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800'
      
                                          }`}
      
                                      >
      
                                        {expandedCardId === candidate.reference_id ? 'Tutup Kutipan' : 'Lihat Kutipan'}
      
                                      </button>
      
                                    )}
      
                                  </div>
      
      
      
                                  {/* Right: Source Badge & Fav Icon */}
      
                                  <div className="flex items-center gap-2 shrink-0">
      
                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${candidate.source === 'OpenAlex'
      
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      
                                      : 'bg-blue-50 text-blue-700 border border-blue-200'
      
                                      }`} title={`Source: ${candidate.source}`}>
      
                                      {candidate.source}
      
                                    </span>
      
                                    <button
      
                                      type="button"
      
                                      className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-50 transition"
      
                                      title="Add to favorites"
      
                                    >
      
                                      <IconHeart className="h-3.5 w-3.5" />
      
                                    </button>
      
                                  </div>
      
                                </div>
      
      
      
                                {/* Expanded context section */}
      
                                {expandedCardId === candidate.reference_id && candidate.abstract && (
      
                                  <div className="mt-3 p-3 rounded-lg bg-indigo-50/50 border border-indigo-100/80 text-[11px] leading-relaxed text-slate-700 animate-fade-in">
      
                                    <span className="block text-[9px] uppercase tracking-wider text-indigo-600 font-bold mb-1">Kutipan Terkait dari Jurnal:</span>
      
                                    <p className="italic font-medium text-slate-800">
      
                                      "{findMostRelevantSentence(candidate.abstract, selectedText)}"
      
                                    </p>
      
                                  </div>
      
                                )}
      
                              </div>
      
                            ))}
      
                          </div>
      
                        )}
      
                      </div>
      
  );
}
