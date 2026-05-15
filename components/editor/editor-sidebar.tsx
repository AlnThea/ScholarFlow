'use client';

import { useMemo, useState } from 'react';
import {
  BookOpen,
  Check,
  Download,
  ExternalLink,
  FileText,
  Filter,
  FolderOpen,
  Loader2,
  PlusCircle,
  Quote,
  Search,
  Sigma,
  Sparkles,
  Wand2,
} from 'lucide-react';
import type { ImproveWritingResponse } from '@/lib/api/ai';
import type { CitationCandidate } from '@/lib/api/citations';
import type { BibliographyEntry } from '@/lib/editor/bibliography';
import type { CitationHistoryEntry } from '@/lib/editor/citation-history';

type SidebarProps = {
  selectedText: string;
  citationResults: CitationCandidate[];
  citationHistory: CitationHistoryEntry[];
  wordCount: number;
  characterCount: number;
  citationCount: number;
  bibliographyEntries: BibliographyEntry[];
  improvedText: ImproveWritingResponse | null;
  isImproving: boolean;
  isSearchingCitations: boolean;
  aiError: string | null;
  citationError: string | null;
  citationNote: string | null;
  onApplyImprovedText: () => void;
  onImproveWriting: () => void;
  onFindCitation: () => void;
  onRepeatCitationSearch: (query: string) => void;
  onInsertCitation: () => void;
  onInsertBibliography: () => void;
  onInsertImageSample: () => void;
  onExportBibliographyText: () => void;
  onExportBibliographyJson: () => void;
  onInsertCitationCandidate: (candidate: CitationCandidate) => void;
};

function PanelRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-b-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium text-text">{value}</span>
    </div>
  );
}

function ActionButton({
  label,
  description,
  icon: Icon,
  onClick,
  disabled,
}: {
  label: string;
  description: string;
  icon: typeof Sparkles;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-md border border-line bg-white p-3 text-left transition hover:border-accent/30 hover:bg-accentSoft/60 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-md bg-accentSoft text-accent">
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-text">{label}</span>
          <span className="mt-1 block text-xs leading-5 text-muted">{description}</span>
        </span>
      </div>
    </button>
  );
}

function getSourceLabel(candidate: CitationCandidate) {
  if (candidate.source.toLowerCase().includes('openalex')) return 'OpenAlex';
  if (candidate.source.toLowerCase().includes('crossref')) return 'Crossref';
  return candidate.source;
}

function formatHistoryLabel(entry: CitationHistoryEntry) {
  return `${entry.resultCount} result${entry.resultCount === 1 ? '' : 's'}`;
}

export function EditorSidebar({
  selectedText,
  citationResults,
  citationHistory,
  wordCount,
  characterCount,
  citationCount,
  bibliographyEntries,
  improvedText,
  isImproving,
  isSearchingCitations,
  aiError,
  citationError,
  citationNote,
  onApplyImprovedText,
  onImproveWriting,
  onFindCitation,
  onRepeatCitationSearch,
  onInsertCitation,
  onInsertBibliography,
  onInsertImageSample,
  onExportBibliographyText,
  onExportBibliographyJson,
  onInsertCitationCandidate,
}: SidebarProps) {
  const [tab, setTab] = useState<'sources' | 'collections'>('sources');
  const [query, setQuery] = useState('');
  const hasImprovedText = improvedText !== null;

  const filteredSources = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return citationResults;
    return citationResults.filter((candidate) => {
      const haystack = [
        candidate.title,
        candidate.source,
        candidate.authors.join(' '),
        candidate.year?.toString() ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [citationResults, query]);

  const filteredCollections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bibliographyEntries;
    return bibliographyEntries.filter((entry) => {
      const haystack = `${entry.label} ${entry.formatted}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [bibliographyEntries, query]);

  return (
    <aside className="sticky top-[72px] flex h-[calc(100vh-72px)] flex-col border-r border-line bg-white/95 shadow-[1px_0_0_rgba(15,23,42,0.03)] backdrop-blur">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-line px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Library
              </p>
              <h2 className="text-sm font-semibold text-text">Sources and collections</h2>
            </div>
            <button
              type="button"
              onClick={onInsertImageSample}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-panel text-text transition hover:border-accent/30 hover:bg-accentSoft/70"
              aria-label="Insert sample image"
              title="Insert sample image"
            >
              <Download className="h-4 w-4 rotate-180" />
            </button>
          </div>

          <div className="mt-3 relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search sources..."
              className="h-11 w-full rounded-md border border-line bg-panel pl-9 pr-3 text-sm outline-none transition placeholder:text-muted focus:border-accent/40"
            />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="inline-flex rounded-md border border-line bg-panel p-1 text-xs font-medium text-muted">
              <button
                type="button"
                onClick={() => setTab('sources')}
                className={
                  tab === 'sources'
                    ? 'rounded px-3 py-1.5 bg-white text-text shadow-sm'
                    : 'rounded px-3 py-1.5'
                }
              >
                Sources
              </button>
              <button
                type="button"
                onClick={() => setTab('collections')}
                className={
                  tab === 'collections'
                    ? 'rounded px-3 py-1.5 bg-white text-text shadow-sm'
                    : 'rounded px-3 py-1.5'
                }
              >
                Collections
              </button>
            </div>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-panel px-3 text-xs font-medium text-text transition hover:border-accent/30 hover:bg-accentSoft/70"
            >
              <Filter className="h-3.5 w-3.5" />
              Filters
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {tab === 'sources' ? (
            <div className="space-y-3">
              {filteredSources.length > 0 ? (
                filteredSources.map((candidate) => (
                  <article
                    key={`${candidate.source}:${candidate.reference_id}`}
                    className="rounded-lg border border-line bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-full border border-line bg-panel px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                            {getSourceLabel(candidate)}
                          </span>
                          <span className="inline-flex items-center rounded-full border border-line bg-accentSoft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent">
                            Score {candidate.ranking_score.toFixed(1)}
                          </span>
                        </div>
                        <h3 className="mt-2 text-sm font-semibold leading-6 text-text">
                          {candidate.title}
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-muted">
                          {candidate.authors.length > 0
                            ? candidate.authors.join(', ')
                            : 'Author data unavailable'}
                          {candidate.year ? ` · ${candidate.year}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onInsertCitationCandidate(candidate)}
                        className="inline-flex items-center gap-2 rounded-md border border-line bg-panel px-3 py-1.5 text-xs font-medium text-text transition hover:border-accent/30 hover:bg-accentSoft/70"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Cite
                      </button>
                      <button
                        type="button"
                        onClick={() => candidate.url && window.open(candidate.url, '_blank', 'noopener,noreferrer')}
                        disabled={!candidate.url}
                        className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-1.5 text-xs font-medium text-text transition hover:border-accent/30 hover:bg-accentSoft/70 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Details
                      </button>
                    </div>
                  </article>
                ))
              ) : citationHistory.length > 0 ? (
                citationHistory.map((entry) => (
                  <button
                    key={`${entry.query}-${entry.savedAt}`}
                    type="button"
                    onClick={() => onRepeatCitationSearch(entry.query)}
                    className="w-full rounded-lg border border-line bg-white p-3 text-left shadow-sm transition hover:border-accent/30 hover:bg-accentSoft/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-5 text-text">{entry.query}</p>
                        <p className="mt-1 text-xs leading-5 text-muted">
                          {formatHistoryLabel(entry)}
                          {entry.note ? ` · ${entry.note}` : ''}
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-muted">
                        {entry.savedAt}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-line bg-panel p-4 text-sm leading-6 text-muted">
                  Search citation sources to populate this library.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCollections.length > 0 ? (
                filteredCollections.map((entry, index) => (
                  <article
                    key={entry.referenceId}
                    className="rounded-lg border border-line bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-accent" />
                          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                            Collection {index + 1}
                          </span>
                        </div>
                        <h3 className="mt-2 text-sm font-semibold leading-6 text-text">
                          {entry.label}
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-muted">{entry.formatted}</p>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-line bg-panel p-4 text-sm leading-6 text-muted">
                  Verified bibliography entries will appear here after citations are inserted.
                </div>
              )}

              <div className="rounded-lg border border-line bg-white p-3 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-text">Bibliography export</h3>
                  <span className="text-xs text-muted">{bibliographyEntries.length} items</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={onExportBibliographyText}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-panel px-3 py-2 text-xs font-medium text-text transition hover:border-accent/30 hover:bg-accentSoft/70"
                  >
                    <Download className="h-3.5 w-3.5" />
                    TXT
                  </button>
                  <button
                    type="button"
                    onClick={onExportBibliographyJson}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-panel px-3 py-2 text-xs font-medium text-text transition hover:border-accent/30 hover:bg-accentSoft/70"
                  >
                    <Download className="h-3.5 w-3.5" />
                    JSON
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-line px-4 py-4">
          <section className="rounded-lg border border-line bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <h3 className="text-sm font-semibold text-text">Writing tools</h3>
            </div>
            <div className="mb-3 max-h-24 overflow-y-auto rounded-md border border-dashed border-line bg-slate-50 p-3 text-xs leading-5 text-muted">
              {selectedText.trim()
                ? selectedText
                : 'Select text in the document to enable writing tools.'}
            </div>
            <div className="space-y-2">
              <ActionButton
                label={isImproving ? 'Improving...' : 'Improve Academic Writing'}
                description="Refine clarity, tone, and academic structure."
                icon={isImproving ? Loader2 : Wand2}
                onClick={onImproveWriting}
                disabled={!selectedText.trim() || isImproving}
              />
              <ActionButton
                label={isSearchingCitations ? 'Searching...' : 'Find Citation'}
                description="Search verified metadata for the selected claim."
                icon={isSearchingCitations ? Loader2 : Sigma}
                onClick={onFindCitation}
                disabled={!selectedText.trim() || isSearchingCitations}
              />
            </div>
            {aiError ? (
              <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-700">
                {aiError}
              </div>
            ) : null}
            {citationError ? (
              <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-700">
                {citationError}
              </div>
            ) : citationNote ? (
              <div className="mt-3 rounded-md border border-line bg-slate-50 p-3 text-xs leading-5 text-muted">
                {citationNote}
              </div>
            ) : null}
          </section>

          <div className="mt-3 rounded-lg border border-line bg-white p-3 shadow-sm">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md border border-line bg-panel px-2 py-2">
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Words</p>
                <p className="mt-1 text-sm font-semibold text-text">{wordCount}</p>
              </div>
              <div className="rounded-md border border-line bg-panel px-2 py-2">
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Chars</p>
                <p className="mt-1 text-sm font-semibold text-text">{characterCount}</p>
              </div>
              <div className="rounded-md border border-line bg-panel px-2 py-2">
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Cites</p>
                <p className="mt-1 text-sm font-semibold text-text">{citationCount}</p>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-line bg-white p-3 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onInsertCitation}
                className="inline-flex items-center gap-2 rounded-md border border-line bg-panel px-3 py-2 text-xs font-medium text-text transition hover:border-accent/30 hover:bg-accentSoft/70"
              >
                <Quote className="h-3.5 w-3.5 text-accent" />
                Insert citation
              </button>
              <button
                type="button"
                onClick={onInsertBibliography}
                className="inline-flex items-center gap-2 rounded-md border border-line bg-panel px-3 py-2 text-xs font-medium text-text transition hover:border-accent/30 hover:bg-accentSoft/70"
              >
                <FileText className="h-3.5 w-3.5 text-accent" />
                Bibliography
              </button>
              <button
                type="button"
                onClick={onInsertImageSample}
                className="inline-flex items-center gap-2 rounded-md border border-line bg-panel px-3 py-2 text-xs font-medium text-text transition hover:border-accent/30 hover:bg-accentSoft/70"
              >
                <PlusCircle className="h-3.5 w-3.5 text-accent" />
                Sample image
              </button>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-line bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-text">Improve result</h3>
              {hasImprovedText ? (
                <button
                  type="button"
                  onClick={onApplyImprovedText}
                  className="inline-flex items-center gap-2 rounded-md border border-line bg-panel px-3 py-1.5 text-xs font-medium text-text transition hover:border-accent/30 hover:bg-accentSoft/70"
                >
                  <Check className="h-3.5 w-3.5" />
                  Apply
                </button>
              ) : null}
            </div>
            {aiError ? (
              <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-700">
                {aiError}
              </div>
            ) : hasImprovedText ? (
              <div className="space-y-3">
                <div className="rounded-md border border-line bg-slate-50 p-3">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                    Improved Text
                  </p>
                  <p className="text-sm leading-6 text-text">{improvedText?.improved_text}</p>
                </div>
                <div className="flex items-start gap-2 rounded-md border border-line bg-panel p-3 text-xs leading-5 text-muted">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                  <span>{improvedText?.disclaimer}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-6 text-muted">
                Run Improve Academic Writing to preview the backend response here.
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
