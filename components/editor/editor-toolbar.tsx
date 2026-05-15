'use client';

import {
  ArrowLeft,
  ArrowRight,
  Bold,
  Eraser,
  Download,
  Highlighter,
  Image as ImageIcon,
  Italic,
  List,
  ListOrdered,
  PlusSquare,
  Save,
  Quote,
  Code2,
  Table2,
  Type,
  Underline,
  Zap,
} from 'lucide-react';
import type { Editor } from '@tiptap/react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/ui';

type ToolbarProps = {
  editor: Editor | null;
  onInsertBibliography: () => void;
  onExportHtml: () => void;
  onExportJson: () => void;
  onSaveDraft: () => void;
  onInsertCitation: () => void;
  onInsertImage: (url: string) => void;
};

function ToolButton({
  active,
  disabled,
  label,
  icon: Icon,
  onClick,
}: {
  active?: boolean;
  disabled?: boolean;
  label: string;
  icon: typeof ArrowLeft;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-md border transition',
        disabled
          ? 'cursor-not-allowed border-line/60 text-muted/50'
          : active
            ? 'border-accent/30 bg-accentSoft text-accent shadow-sm'
            : 'border-line bg-panel text-text hover:border-accent/30 hover:bg-accentSoft/70',
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export function EditorToolbar({
  editor,
  onInsertBibliography,
  onExportHtml,
  onExportJson,
  onSaveDraft,
  onInsertCitation,
  onInsertImage,
}: ToolbarProps) {
  const [imageUrl, setImageUrl] = useState('');

  const canUndo = editor?.can().undo() ?? false;
  const canRedo = editor?.can().redo() ?? false;

  const headingValue = useMemo(() => {
    if (!editor) return 'paragraph';
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';
    return 'paragraph';
  }, [editor?.state.selection.from, editor?.state.selection.to]);

  const applyHeading = (value: string) => {
    if (!editor) return;
    editor.chain().focus();
    if (value === 'paragraph') {
      editor.chain().focus().setParagraph().run();
      return;
    }
    const level = Number(value.replace('h', '')) as 1 | 2 | 3;
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const addTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const addImage = () => {
    if (!imageUrl.trim()) return;
    onInsertImage(imageUrl.trim());
    setImageUrl('');
  };

  return (
    <div className="space-y-3 border-b border-line bg-panel/90 px-4 py-3 backdrop-blur">
      <div className="flex flex-wrap items-center gap-2">
        <ToolButton
          label="Undo"
          icon={ArrowLeft}
          disabled={!canUndo}
          onClick={() => editor?.chain().focus().undo().run()}
        />
        <ToolButton
          label="Redo"
          icon={ArrowRight}
          disabled={!canRedo}
          onClick={() => editor?.chain().focus().redo().run()}
        />
        <div className="mx-1 h-9 w-px bg-line" />
        <select
          aria-label="Text style"
          value={headingValue}
          onChange={(event) => applyHeading(event.target.value)}
          className="h-10 rounded-md border border-line bg-panel px-3 text-sm text-text outline-none transition focus:border-accent/40"
        >
          <option value="paragraph">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        <div className="mx-1 h-9 w-px bg-line" />
        <ToolButton
          label="Bold"
          icon={Bold}
          active={editor?.isActive('bold')}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        />
        <ToolButton
          label="Italic"
          icon={Italic}
          active={editor?.isActive('italic')}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        />
        <ToolButton
          label="Underline"
          icon={Underline}
          active={editor?.isActive('underline')}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        />
        <ToolButton
          label="Highlight"
          icon={Highlighter}
          active={editor?.isActive('highlight')}
          onClick={() => editor?.chain().focus().toggleHighlight().run()}
        />

        <div className="mx-1 h-9 w-px bg-line" />
        <ToolButton
          label="Bullet list"
          icon={List}
          active={editor?.isActive('bulletList')}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        />
        <ToolButton
          label="Numbered list"
          icon={ListOrdered}
          active={editor?.isActive('orderedList')}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        />
        <ToolButton
          label="Blockquote"
          icon={Quote}
          active={editor?.isActive('blockquote')}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        />
        <ToolButton
          label="Code block"
          icon={Type}
          active={editor?.isActive('codeBlock')}
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        />
        <ToolButton
          label="Insert table"
          icon={Table2}
          onClick={addTable}
        />
        <ToolButton
          label="Insert citation marker"
          icon={Zap}
          onClick={onInsertCitation}
        />
        <ToolButton
          label="Insert bibliography section"
          icon={PlusSquare}
          onClick={onInsertBibliography}
        />

        <div className="mx-1 h-9 w-px bg-line" />
        <ToolButton
          label="Insert image from URL"
          icon={ImageIcon}
          onClick={addImage}
        />
        <ToolButton
          label="Clear formatting"
          icon={Eraser}
          onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="image-url">
          Image URL
        </label>
        <input
          id="image-url"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="Image URL"
          className="h-10 min-w-[16rem] flex-1 rounded-md border border-line bg-panel px-3 text-sm outline-none transition placeholder:text-muted focus:border-accent/40"
        />
        <button
          type="button"
          onClick={addImage}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-panel px-3 text-sm font-medium text-text transition hover:border-accent/30 hover:bg-accentSoft/70"
        >
          <ImageIcon className="h-4 w-4" />
          Insert Image
        </button>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSaveDraft}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-accent px-3 text-sm font-medium text-white transition hover:opacity-95"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>
          <button
            type="button"
            onClick={onExportHtml}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-panel px-3 text-sm font-medium text-text transition hover:border-accent/30 hover:bg-accentSoft/70"
          >
            <Download className="h-4 w-4" />
            Export HTML
          </button>
          <button
            type="button"
            onClick={onExportJson}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-panel px-3 text-sm font-medium text-text transition hover:border-accent/30 hover:bg-accentSoft/70"
          >
            <Code2 className="h-4 w-4" />
            Export JSON
          </button>
        </div>
      </div>
    </div>
  );
}
