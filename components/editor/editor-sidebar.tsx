'use client';

import { BookOpen, FileText, ListChecks, PlusCircle, Quote } from 'lucide-react';

type SidebarProps = {
  wordCount: number;
  characterCount: number;
  citationCount: number;
  onInsertCitation: () => void;
  onInsertBibliography: () => void;
  onInsertImageSample: () => void;
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

export function EditorSidebar({
  wordCount,
  characterCount,
  citationCount,
  onInsertCitation,
  onInsertBibliography,
  onInsertImageSample,
}: SidebarProps) {
  return (
    <aside className="h-full border-l border-line bg-panel/80 p-4 backdrop-blur">
      <div className="space-y-4">
        <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-semibold text-text">Document stats</h2>
          </div>
          <PanelRow label="Words" value={wordCount} />
          <PanelRow label="Characters" value={characterCount} />
          <PanelRow label="Citations" value={citationCount} />
        </section>

        <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <PlusCircle className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-semibold text-text">Quick insert</h2>
          </div>
          <div className="space-y-2">
            <button
              type="button"
              onClick={onInsertCitation}
              className="flex w-full items-center gap-2 rounded-md border border-line px-3 py-2 text-left text-sm text-text transition hover:border-accent/30 hover:bg-accentSoft/70"
            >
              <Quote className="h-4 w-4 text-accent" />
              Insert citation marker
            </button>
            <button
              type="button"
              onClick={onInsertBibliography}
              className="flex w-full items-center gap-2 rounded-md border border-line px-3 py-2 text-left text-sm text-text transition hover:border-accent/30 hover:bg-accentSoft/70"
            >
              <FileText className="h-4 w-4 text-accent" />
              Insert bibliography section
            </button>
            <button
              type="button"
              onClick={onInsertImageSample}
              className="flex w-full items-center gap-2 rounded-md border border-line px-3 py-2 text-left text-sm text-text transition hover:border-accent/30 hover:bg-accentSoft/70"
            >
              <ListChecks className="h-4 w-4 text-accent" />
              Insert sample image
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-text">Workflow</h2>
          <ul className="space-y-2 text-sm text-muted">
            <li>Draft the argument in the main editor.</li>
            <li>Place citation markers where evidence is needed.</li>
            <li>Keep the bibliography section synchronized manually for now.</li>
          </ul>
        </section>
      </div>
    </aside>
  );
}
