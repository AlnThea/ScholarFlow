'use client';

import {
  IconBook,
  IconCheck,
  IconDownload,
  IconLanguage,
  IconLoader2,
  IconRefresh,
  IconFileText,
  IconSum,
  IconSparkles,
  IconWand,
  IconSearch,
} from '@tabler/icons-react';
import type { ImproveWritingResponse } from '@/lib/api/ai';
import type { CitationCandidate } from '@/lib/api/citations';
import type { CitationHistoryEntry } from '@/lib/editor/citation-history';

type AiSidebarProps = {
  selectedText: string;
  improvedText: ImproveWritingResponse | null;
  citationResults: CitationCandidate[];
  isLoading: boolean;
  isSearchingCitations: boolean;
  error: string | null;
  citationError: string | null;
  citationNote: string | null;
  citationHistory: CitationHistoryEntry[];
  onImproveWriting: () => void;
  onParaphrase: () => void;
  onSummarize: () => void;
  onGenerateAbstract: () => void;
  onFindCitation: () => void;
  onRepeatCitationSearch: (query: string) => void;
  onApplyImprovedText: () => void;
  onInsertCitationCandidate: (candidate: CitationCandidate) => void;
  onExportCitationText: () => void;
  onExportCitationJson: () => void;
};

function ActionButton({
  label,
  description,
  icon: Icon,
  onClick,
  disabled,
}: {
  label: string;
  description: string;
  icon: typeof IconSparkles;
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

export function AiSidebar({
  selectedText,
  improvedText,
  citationResults,
  isLoading,
  isSearchingCitations,
  error,
  citationError,
  citationNote,
  citationHistory,
  onImproveWriting,
  onParaphrase,
  onSummarize,
  onGenerateAbstract,
  onFindCitation,
  onRepeatCitationSearch,
  onApplyImprovedText,
  onInsertCitationCandidate,
  onExportCitationText,
  onExportCitationJson,
}: AiSidebarProps) {
  const hasSelection = selectedText.trim().length > 0;
  const hasResult = improvedText !== null;
  const hasCitationResults = citationResults.length > 0;

  return (
    <aside className="sticky top-[73px] flex h-[calc(100vh-73px)] border-l border-line bg-panel/80 backdrop-blur">
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        <section className="shrink-0 rounded-xl border border-line bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <IconSparkles className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-semibold text-text">AI assistant</h2>
          </div>
          <p className="text-xs leading-5 text-muted">
            AI actions use the current selection and call the backend explicitly.
          </p>
        </section>

        <section className="shrink-0 rounded-xl border border-line bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-text">Selected text</h3>
          <div className="max-h-28 overflow-y-auto rounded-md border border-dashed border-line bg-slate-50 p-3 text-sm leading-6 text-muted">
            {hasSelection ? selectedText : 'Select a paragraph or sentence to enable AI actions.'}
          </div>
        </section>

        <section className="shrink-0 rounded-xl border border-line bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-text">Search history</h3>
            <span className="text-xs text-muted">{citationHistory.length} saved</span>
          </div>
          {citationHistory.length > 0 ? (
            <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
              {citationHistory.map((item) => (
                <button
                  key={`${item.query}-${item.savedAt}`}
                  type="button"
                  onClick={() => onRepeatCitationSearch(item.query)}
                  className="w-full rounded-md border border-line bg-white p-3 text-left transition hover:border-accent/30 hover:bg-accentSoft/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-xs font-medium leading-5 text-text">
                        {item.query}
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-muted">
                        {item.resultCount} result{item.resultCount === 1 ? '' : 's'}
                        {item.note ? ` · ${item.note}` : ''}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-muted">
                      {item.savedAt}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-6 text-muted">
              Search history appears here after you run citation lookup.
            </p>
          )}
        </section>

        <section className="shrink-0 space-y-2">
          <ActionButton
            label={isLoading ? 'Improving...' : 'Improve Academic Writing'}
            description="Refine clarity, tone, and academic structure."
            icon={isLoading ? IconLoader2 : IconWand}
            onClick={onImproveWriting}
            disabled={!hasSelection || isLoading}
          />
          <ActionButton
            label={isLoading ? 'Paraphrasing...' : 'Paraphrase'}
            description="Rewrite the selected text while keeping the meaning."
            icon={isLoading ? IconLoader2 : IconLanguage}
            onClick={onParaphrase}
            disabled={!hasSelection || isLoading}
          />
          <ActionButton
            label={isLoading ? 'Summarizing...' : 'Summarize'}
            description="Condense the selected text into a shorter academic summary."
            icon={isLoading ? IconLoader2 : IconFileText}
            onClick={onSummarize}
            disabled={!hasSelection || isLoading}
          />
          <ActionButton
            label={isLoading ? 'Generating...' : 'Generate Abstract'}
            description="Draft an abstract from the current document context."
            icon={isLoading ? IconLoader2 : IconBook}
            onClick={onGenerateAbstract}
            disabled={isLoading}
          />
          <ActionButton
            label="Find Citation"
            description="Prepare the selected claim for citation lookup."
            icon={isSearchingCitations ? IconLoader2 : IconSum}
            onClick={onFindCitation}
            disabled={!hasSelection || isSearchingCitations}
          />
        </section>

        <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-text">Result</h3>
            {hasResult ? (
              <button
                type="button"
                onClick={onApplyImprovedText}
                className="inline-flex items-center gap-2 rounded-md border border-line bg-panel px-3 py-1.5 text-xs font-medium text-text transition hover:border-accent/30 hover:bg-accentSoft/70"
              >
                <IconCheck className="h-3.5 w-3.5" />
                Apply
              </button>
            ) : null}
          </div>
          {error ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-700">
              {error}
            </div>
          ) : hasResult ? (
            <div className="space-y-3">
              <div className="rounded-md border border-line bg-slate-50 p-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                  Improved Text
                </p>
                <p className="text-sm leading-6 text-text">{improvedText?.improved_text}</p>
              </div>
              <div className="flex items-start gap-2 rounded-md border border-line bg-white p-3 text-xs leading-5 text-muted">
                <IconRefresh className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                <span>{improvedText?.disclaimer}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-6 text-muted">
              Run Improve Academic Writing to preview the backend response here.
            </p>
          )}
        </section>

        <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-text">Citation lookup</h3>
            {isSearchingCitations ? (
              <span className="inline-flex items-center gap-2 text-xs text-muted">
                <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                Searching
              </span>
            ) : null}
          </div>
          {citationError ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-700">
              {citationError}
            </div>
          ) : citationNote ? (
            <div className="rounded-md border border-line bg-slate-50 p-3 text-sm leading-6 text-muted">
              {citationNote}
            </div>
          ) : hasCitationResults ? (
            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {citationResults.map((candidate) => (
                <div key={`${candidate.source}:${candidate.reference_id}`} className="rounded-md border border-line bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                          {candidate.source}
                        </p>
                        <span className="rounded-full border border-line bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                          Score {candidate.ranking_score.toFixed(1)}
                        </span>
                      </div>
                      <h4 className="mt-1 text-sm font-semibold leading-6 text-text">
                        {candidate.title}
                      </h4>
                      <p className="mt-1 text-xs leading-5 text-muted">
                        {candidate.authors.length > 0 ? candidate.authors.join(', ') : 'Author data unavailable'}
                        {candidate.year ? ` · ${candidate.year}` : ''}
                      </p>
                      {candidate.doi ? (
                        <p className="mt-1 break-all text-xs leading-5 text-muted">
                          DOI: {candidate.doi}
                        </p>
                      ) : null}
                      {candidate.ranking_reason.length > 0 ? (
                        <p className="mt-1 text-[11px] leading-5 text-muted">
                          Ranked by {candidate.ranking_reason.join(', ')}
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => onInsertCitationCandidate(candidate)}
                      className="inline-flex shrink-0 items-center gap-2 rounded-md border border-line bg-white px-3 py-1.5 text-xs font-medium text-text transition hover:border-accent/30 hover:bg-accentSoft/70"
                    >
                      <IconCheck className="h-3.5 w-3.5" />
                      Insert
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-6 text-muted">
              {hasSelection
                ? 'Search to see verified citation candidates from OpenAlex and Crossref.'
                : 'Select a sentence or paragraph before searching for citations.'}
            </p>
          )}

          <div className="mt-3 flex items-start gap-2 rounded-md border border-line bg-white p-3 text-xs leading-5 text-muted">
            <IconSearch className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
            <span>Only verified metadata from external sources is shown here.</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onExportCitationText}
              disabled={!hasCitationResults}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-xs font-medium text-text transition hover:border-accent/30 hover:bg-accentSoft/70 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <IconDownload className="h-3.5 w-3.5" />
              TXT
            </button>
            <button
              type="button"
              onClick={onExportCitationJson}
              disabled={!hasCitationResults}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-xs font-medium text-text transition hover:border-accent/30 hover:bg-accentSoft/70 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <IconDownload className="h-3.5 w-3.5" />
              JSON
            </button>
          </div>

        </section>

        <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-text">Status</h3>
          <p className="text-sm leading-6 text-muted">
            Improve Academic Writing and citation lookup are wired to the backend. Other AI actions remain placeholders.
          </p>
        </section>
      </div>
    </aside>
  );
}
