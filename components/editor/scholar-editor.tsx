'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  EditorContent,
  useEditor,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import Focus from '@tiptap/extension-focus';
import { CitationMarker } from '@/lib/editor/citation-extension';
import { SAMPLE_EDITOR_CONTENT } from '@/lib/editor/sample-content';
import { improveWriting, type ImproveWritingResponse } from '@/lib/api/ai';
import { searchCitations, type CitationCandidate } from '@/lib/api/citations';
import { AiSidebar } from './ai-sidebar';
import { EditorToolbar } from './editor-toolbar';
import { EditorSidebar } from './editor-sidebar';

const STORAGE_KEY = 'scholarflow.editor.content.v1';

function countWords(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ScholarEditor() {
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ from: number; to: number } | null>(
    null,
  );
  const [improvedResult, setImprovedResult] = useState<ImproveWritingResponse | null>(null);
  const [citationResults, setCitationResults] = useState<CitationCandidate[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [citationError, setCitationError] = useState<string | null>(null);
  const [citationNote, setCitationNote] = useState<string | null>(null);
  const [isImproving, setIsImproving] = useState(false);
  const [isSearchingCitations, setIsSearchingCitations] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const initialContent = useMemo(() => {
    if (!hydrated || typeof window === 'undefined') {
      return SAMPLE_EDITOR_CONTENT;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ?? SAMPLE_EDITOR_CONTENT;
  }, [hydrated]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'sf-code-block',
          },
        },
      }),
      Underline,
      TextStyle,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-accent underline underline-offset-2',
        },
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-xl border border-line',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') return 'Write a section heading...';
          return 'Start drafting your academic text...';
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Focus.configure({
        className: 'is-focused',
      }),
      CitationMarker,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          'sf-editor min-h-[32rem] px-6 py-6 focus:outline-none lg:px-10 lg:py-8',
      },
    },
    onSelectionUpdate({ editor }) {
      const { from, to } = editor.state.selection;
      setSelectionRange(from === to ? null : { from, to });
      setSelectedText(editor.state.doc.textBetween(from, to, ' ').trim());
      setImprovedResult(null);
      setAiError(null);
      setCitationResults([]);
      setCitationError(null);
      setCitationNote(null);
    },
    onUpdate({ editor }) {
      if (!hydrated) return;
      window.localStorage.setItem(STORAGE_KEY, editor.getHTML());
      setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    },
  });

  useEffect(() => {
    if (!editor || !hydrated) return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      editor.commands.setContent(stored, false);
    }
  }, [editor, hydrated]);

  const textContent = editor?.getText() ?? '';
  const wordCount = countWords(textContent);
  const characterCount = textContent.length;
  const citationCount = editor?.getHTML().match(/data-citation="true"/g)?.length ?? 0;

  const insertCitation = useCallback(() => {
    if (!editor) return;
    const nextLabel = String(citationCount + 1);
    editor
      .chain()
      .focus()
      .insertCitationMarker({
        label: nextLabel,
        referenceId: `ref-${nextLabel}`,
      })
      .run();
  }, [editor, citationCount]);

  const insertBibliography = useCallback(() => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertContent([
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Bibliography' }],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Add verified references here.' }],
                },
              ],
            },
          ],
        },
      ])
      .run();
  }, [editor]);

  const insertImage = useCallback(
    (url: string) => {
      if (!editor || !url) return;
      editor.chain().focus().setImage({ src: url, alt: 'Inserted image' }).run();
    },
    [editor],
  );

  const insertSampleImage = useCallback(() => {
    insertImage('https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80');
  }, [insertImage]);

  const saveDraft = useCallback(() => {
    if (!editor) return;
    window.localStorage.setItem(STORAGE_KEY, editor.getHTML());
    setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [editor]);

  const exportHtml = useCallback(() => {
    if (!editor) return;
    downloadFile('scholarflow-draft.html', editor.getHTML(), 'text/html;charset=utf-8');
  }, [editor]);

  const exportJson = useCallback(() => {
    if (!editor) return;
    downloadFile('scholarflow-draft.json', JSON.stringify(editor.getJSON(), null, 2), 'application/json;charset=utf-8');
  }, [editor]);

  const statusLabel = savedAt ? `Saved at ${savedAt}` : 'Draft stored locally';
  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api/v1').replace(/\/$/, '');

  const runImproveWriting = useCallback(async () => {
    if (!editor || !selectedText.trim()) return;

    setIsImproving(true);
    setAiError(null);

    try {
      const response = await improveWriting(apiBaseUrl, selectedText);
      setImprovedResult(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to contact AI backend.';
      setAiError(message);
      setImprovedResult(null);
    } finally {
      setIsImproving(false);
    }
  }, [apiBaseUrl, editor, selectedText]);

  const applyImprovedText = useCallback(() => {
    if (!editor || !improvedResult || !selectionRange) return;

    editor
      .chain()
      .focus()
      .insertContentAt(selectionRange, improvedResult.improved_text)
      .run();

    setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [editor, improvedResult, selectionRange]);

  const runCitationSearch = useCallback(async () => {
    if (!selectedText.trim()) return;

    setIsSearchingCitations(true);
    setCitationError(null);
    setCitationNote(null);
    setAiError(null);

    try {
      const response = await searchCitations(apiBaseUrl, selectedText, 5);
      setCitationResults(response.results);
      setCitationNote(response.note);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to search citations.';
      setCitationError(message);
      setCitationResults([]);
      setCitationNote(null);
    } finally {
      setIsSearchingCitations(false);
    }
  }, [apiBaseUrl, selectedText]);

  const insertCitationCandidate = useCallback(
    (candidate: CitationCandidate) => {
      if (!editor) return;

      const position = selectionRange?.to ?? editor.state.selection.to;
      editor
        .chain()
        .focus()
        .insertContentAt(position, {
          type: 'citationMarker',
          attrs: {
            label: candidate.citation_label,
            referenceId: candidate.reference_id,
          },
          content: [{ type: 'text', text: `[${candidate.citation_label}]` }],
        })
        .run();
    },
    [editor, selectionRange],
  );

  return (
    <div className="min-h-screen bg-transparent">
      <header className="border-b border-line bg-panel/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 lg:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              ScholarFlow
            </p>
            <h1 className="text-2xl font-semibold text-text">Academic editor</h1>
          </div>
          <div className="hidden items-center gap-3 rounded-full border border-line bg-white px-4 py-2 text-sm text-muted lg:flex">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            {statusLabel}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-0 lg:grid-cols-[minmax(0,1fr)_320px_320px]">
        <main className="min-h-[calc(100vh-73px)] bg-panel/70">
          <div className="border-b border-line bg-white/70 px-4 py-3 text-sm text-muted lg:px-6">
            Production-ready TipTap workspace with structured drafting tools and citation placeholders.
          </div>

          <EditorToolbar
            editor={editor}
            onInsertBibliography={insertBibliography}
            onExportHtml={exportHtml}
            onExportJson={exportJson}
            onSaveDraft={saveDraft}
            onInsertCitation={insertCitation}
            onInsertImage={insertImage}
          />

          <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8">
            <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
              <EditorContent editor={editor} />
            </div>
          </div>
        </main>

        <EditorSidebar
          wordCount={wordCount}
          characterCount={characterCount}
          citationCount={citationCount}
          onInsertCitation={insertCitation}
          onInsertBibliography={insertBibliography}
          onInsertImageSample={insertSampleImage}
        />

          <AiSidebar
            selectedText={selectedText}
            improvedText={improvedResult}
            citationResults={citationResults}
            isLoading={isImproving}
            isSearchingCitations={isSearchingCitations}
            error={aiError}
            citationError={citationError}
            citationNote={citationNote}
            onImproveWriting={runImproveWriting}
            onFindCitation={runCitationSearch}
            onApplyImprovedText={applyImprovedText}
            onInsertCitationCandidate={insertCitationCandidate}
          />
      </div>
    </div>
  );
}
