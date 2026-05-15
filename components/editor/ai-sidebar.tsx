'use client';

import { BookOpenText, Languages, ScrollText, Sigma, Sparkles, Wand2 } from 'lucide-react';

type AiSidebarProps = {
  selectedText: string;
  onUseSelection: (action: string) => void;
};

function ActionButton({
  label,
  description,
  icon: Icon,
  onClick,
}: {
  label: string;
  description: string;
  icon: typeof Sparkles;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-md border border-line bg-white p-3 text-left transition hover:border-accent/30 hover:bg-accentSoft/60"
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

export function AiSidebar({ selectedText, onUseSelection }: AiSidebarProps) {
  const hasSelection = selectedText.trim().length > 0;

  return (
    <aside className="h-full border-l border-line bg-panel/80 p-4 backdrop-blur">
      <div className="space-y-4">
        <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-semibold text-text">AI assistant</h2>
          </div>
          <p className="text-sm leading-6 text-muted">
            AI actions will use the current selection when connected to backend services.
          </p>
        </section>

        <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-text">Selected text</h3>
          <div className="rounded-md border border-dashed border-line bg-slate-50 p-3 text-sm leading-6 text-muted">
            {hasSelection ? selectedText : 'Select a paragraph or sentence to enable AI actions.'}
          </div>
        </section>

        <section className="space-y-2">
          <ActionButton
            label="Improve Academic Writing"
            description="Refine clarity, tone, and academic structure."
            icon={Wand2}
            onClick={() => onUseSelection('improve-writing')}
          />
          <ActionButton
            label="Paraphrase"
            description="Rewrite the selected text while keeping the meaning."
            icon={Languages}
            onClick={() => onUseSelection('paraphrase')}
          />
          <ActionButton
            label="Summarize"
            description="Condense the selected text into a shorter academic summary."
            icon={ScrollText}
            onClick={() => onUseSelection('summarize')}
          />
          <ActionButton
            label="Generate Abstract"
            description="Draft an abstract from the current document context."
            icon={BookOpenText}
            onClick={() => onUseSelection('generate-abstract')}
          />
          <ActionButton
            label="Find Citation"
            description="Prepare the selected claim for citation lookup."
            icon={Sigma}
            onClick={() => onUseSelection('find-citation')}
          />
        </section>

        <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-text">Status</h3>
          <p className="text-sm leading-6 text-muted">
            Placeholder only. No AI calls are wired yet. This keeps the workflow aligned with the current MVP stage.
          </p>
        </section>
      </div>
    </aside>
  );
}
