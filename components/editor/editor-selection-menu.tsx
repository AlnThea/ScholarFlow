// c:/web/ScholarFlow/components/editor/editor-selection-menu.tsx
// NOTE: EditorSelectionMenu (TipTap BubbleMenu) is NOT used in the current EditorJS-based layout.
// The EditorJS path uses a custom DOM-based bubble menu built inside editor-layout.tsx instead.
// This file is kept for reference only. TipTap (@tiptap/react) has been uninstalled.

/*
'use client';

import { BubbleMenu, type Editor } from '@tiptap/react';
import {
  IconBold,
  IconHighlight,
  IconItalic,
  IconLoader2,
  IconQuote,
  IconSearch,
  IconUnderline,
} from '@tabler/icons-react';
import { cn } from '@/lib/ui';

type EditorSelectionMenuProps = {
  editor: Editor | null;
  isInsertingCitation: boolean;
  isSearchingCitations: boolean;
  onInsertCitation: () => void;
  onFindCitation: () => void;
};

function SelectionButton({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active?: boolean;
  label: string;
  icon: typeof IconBold;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm transition',
        active
          ? 'border-accent/30 bg-accentSoft text-accent'
          : 'border-transparent bg-white text-text hover:border-line hover:bg-slate-50',
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function ActionButton({
  busy,
  label,
  icon: Icon,
  onClick,
}: {
  busy?: boolean;
  label: string;
  icon: typeof IconQuote | typeof IconLoader2;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={cn(
        'inline-flex h-8 items-center gap-2 rounded-md border border-line bg-white px-2.5 text-xs font-medium text-text transition hover:bg-slate-50',
        busy && 'cursor-wait opacity-75',
      )}
    >
      <Icon className={cn('h-3.5 w-3.5', busy && 'animate-spin')} />
      {label}
    </button>
  );
}

export function EditorSelectionMenu({
  editor,
  isInsertingCitation,
  isSearchingCitations,
  onInsertCitation,
  onFindCitation,
}: EditorSelectionMenuProps) {
  if (!editor) return null;

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor: currentEditor, state }) => {
        const { from, to } = state.selection;
        if (from === to) return false;
        if (!currentEditor.isEditable) return false;
        return currentEditor.state.doc.textBetween(from, to, ' ').trim().length > 0;
      }}
      tippyOptions={{
        duration: 120,
        placement: 'top',
        offset: [0, 10],
        maxWidth: 420,
        theme: 'scholarflow-bubble',
      }}
    >
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-line bg-white p-2 shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
        <SelectionButton
          label="Bold"
          icon={IconBold}
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <SelectionButton
          label="Italic"
          icon={IconItalic}
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <SelectionButton
          label="Underline"
          icon={IconUnderline}
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <SelectionButton
          label="Highlight"
          icon={IconHighlight}
          active={editor.isActive('highlight')}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        />
        <div className="mx-1 h-5 w-px bg-line" />
        <ActionButton
          busy={isInsertingCitation}
          label={isInsertingCitation ? 'Inserting...' : 'Cite'}
          icon={isInsertingCitation ? IconLoader2 : IconQuote}
          onClick={() => {
            editor.chain().focus().run();
            onInsertCitation();
          }}
        />
        <ActionButton
          busy={isSearchingCitations}
          label={isSearchingCitations ? 'Searching...' : 'Find Citation'}
          icon={isSearchingCitations ? IconLoader2 : IconSearch}
          onClick={() => {
            editor.chain().focus().run();
            onFindCitation();
          }}
        />
      </div>
    </BubbleMenu>
  );
}
*/
