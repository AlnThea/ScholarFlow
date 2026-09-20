import React from 'react';
import { createPortal } from 'react-dom';
import { IconX, IconQuote, IconExternalLink } from '@tabler/icons-react';

export function CitationDetailsModal({ activeModalCitation, setActiveModalCitation, citationLibrary, language }: any) {
  if (!activeModalCitation || typeof window === 'undefined') return null;

  const candidate = citationLibrary[activeModalCitation.refId];
  const citedSentence = activeModalCitation.citedSentence;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 font-sans text-slate-800">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col transform transition-all scale-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'id' ? 'Detail Sitasi Jurnal' : 'Journal Citation Details'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setActiveModalCitation(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-50 transition cursor-pointer"
            aria-label="Tutup"
          >
            <IconX className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {candidate ? (
            <>
              <div className="flex flex-col gap-1 text-left">
                <h4 className="text-base font-bold text-slate-800 leading-snug">
                  {candidate.title}
                </h4>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  {candidate.authors?.join(', ')}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {candidate.journal ? `${candidate.journal} · ` : ''}{candidate.year || 'N/A'} · Source: {candidate.source}
                </p>
              </div>

              {citedSentence && (
                <div className="bg-slate-50 border-l-4 border-indigo-500 p-4 rounded-r-xl text-slate-600 text-left">
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1.5 flex items-center gap-1">
                    <IconQuote className="h-3 w-3" />
                    {language === 'id' ? 'Klaim/Pernyataan Anda:' : 'Your Claim/Statement:'}
                  </span>
                  <p className="italic font-semibold text-xs text-slate-600">"{citedSentence}"</p>
                </div>
              )}

              <div className="flex flex-col gap-2 text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {language === 'id' ? 'Kutipan Terkait dari Jurnal (Matching Snippet):' : 'Matching Snippet from Journal:'}
                </span>
                <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/85 text-xs leading-relaxed text-indigo-950 font-medium italic min-h-[4rem] flex items-center justify-center">
                  "{findMostRelevantSentence(candidate.abstract, citedSentence || '')}"
                </div>
              </div>

              {candidate.abstract && (
                <div className="flex flex-col gap-2 text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {language === 'id' ? 'Abstrak Lengkap Jurnal:' : 'Full Journal Abstract:'}
                  </span>
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                    <HighlightedAbstract abstract={candidate.abstract} query={citedSentence || ''} />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs italic">
              {language === 'id' ? 'Informasi detail sitasi tidak ditemukan di pustaka lokal.' : 'Citation detail information was not found in local library.'}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setActiveModalCitation(null)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-150 transition cursor-pointer"
          >
            {language === 'id' ? 'Tutup' : 'Close'}
          </button>
          {candidate?.url && (
            <a
              href={candidate.url}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer shadow-sm shadow-indigo-100 flex items-center gap-1"
            >
              <span>View Source</span>
              <IconExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function findMostRelevantSentence(abstract: string | null | undefined, query: string): string {
  if (!abstract) return "Abstrak tidak tersedia.";

  const cleanedAbstract = abstract.replace(/(?<=[.!?])(?=[A-Za-z])/g, " ");
  const sentences = cleanedAbstract.split(/(?<=[.!?])\s+/);
  if (sentences.length <= 1) return cleanedAbstract;

  const queryWords = new Set(query.toLowerCase().match(/[a-z0-9]+/g) ?? []);
  if (queryWords.size === 0) return sentences[0];

  let bestSentence = sentences[0];
  let maxOverlap = -1;
  for (const sentence of sentences) {
    const sentenceWords = new Set(sentence.toLowerCase().match(/[a-z0-9]+/g) ?? []);
    let overlap = 0;
    for (const word of sentenceWords) {
      if (queryWords.has(word)) overlap++;
    }
    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      bestSentence = sentence;
    }
  }
  return bestSentence;
}

function HighlightedAbstract({ abstract, query }: { abstract: string | null | undefined; query: string }) {
  if (!abstract) return <p className="text-slate-400 italic text-xs">Abstrak tidak tersedia.</p>;

  const cleanedAbstract = abstract.replace(/(?<=[.!?])(?=[A-Za-z])/g, " ");
  const sentences = cleanedAbstract.split(/(?<=[.!?])\s+/);
  if (sentences.length <= 1) {
    return <p className="text-slate-650 leading-relaxed text-xs">{cleanedAbstract}</p>;
  }

  const queryWords = new Set(query.toLowerCase().match(/[a-z0-9]+/g) ?? []);
  let bestIndex = 0;
  let maxOverlap = -1;
  sentences.forEach((sentence, idx) => {
    const sentenceWords = new Set(sentence.toLowerCase().match(/[a-z0-9]+/g) ?? []);
    let overlap = 0;
    for (const word of sentenceWords) {
      if (queryWords.has(word)) overlap++;
    }
    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      bestIndex = idx;
    }
  });

  return (
    <p className="text-slate-600 leading-relaxed text-xs text-left">
      {sentences.map((sentence, idx) => {
        if (idx === bestIndex) {
          return (
            <mark key={idx} className="bg-indigo-50 text-indigo-950 font-semibold px-1 rounded border-b border-indigo-200">
              {sentence}{' '}
            </mark>
          );
        }
        return <span key={idx}>{sentence} </span>;
      })}
    </p>
  );
}

