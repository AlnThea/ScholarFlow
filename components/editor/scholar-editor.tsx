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
import type { JSONContent } from '@tiptap/core';
import { CitationMarker } from '@/lib/editor/citation-extension';
import { SAMPLE_EDITOR_CONTENT } from '@/lib/editor/sample-content';
import { improveWriting, type ImproveWritingResponse } from '@/lib/api/ai';
import { searchCitations, type CitationCandidate } from '@/lib/api/citations';
import {
  addCitationHistoryEntry,
  type CitationHistoryEntry,
} from '@/lib/editor/citation-history';
import {
  buildBibliographyEntries,
  serializeBibliographyText,
} from '@/lib/editor/bibliography';
import {
  serializeCitationCandidatesText,
} from '@/lib/editor/citation-export';
import { EditorToolbar } from './editor-toolbar';
import { EditorSidebar } from './editor-sidebar';

const STORAGE_KEY = 'scholarflow.editor.content.v1';
const CITATION_LIBRARY_KEY = 'scholarflow.editor.citation-library.v1';
const CITATION_HISTORY_KEY = 'scholarflow.editor.citation-history.v1';

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
  const [documentJson, setDocumentJson] = useState<JSONContent | null>(null);
  const [improvedResult, setImprovedResult] = useState<ImproveWritingResponse | null>(null);
  const [citationResults, setCitationResults] = useState<CitationCandidate[]>([]);
  const [citationLibrary, setCitationLibrary] = useState<Record<string, CitationCandidate>>({});
  const [citationHistory, setCitationHistory] = useState<CitationHistoryEntry[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [citationError, setCitationError] = useState<string | null>(null);
  const [citationNote, setCitationNote] = useState<string | null>(null);
  const [isImproving, setIsImproving] = useState(false);
  const [isSearchingCitations, setIsSearchingCitations] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    const storedLibrary = window.localStorage.getItem(CITATION_LIBRARY_KEY);
    if (!storedLibrary) return;

    try {
      const parsed = JSON.parse(storedLibrary) as Record<string, CitationCandidate>;
      setCitationLibrary(parsed);
    } catch {
      window.localStorage.removeItem(CITATION_LIBRARY_KEY);
    }
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    const storedHistory = window.localStorage.getItem(CITATION_HISTORY_KEY);
    if (!storedHistory) return;

    try {
      const parsed = JSON.parse(storedHistory) as CitationHistoryEntry[];
      setCitationHistory(Array.isArray(parsed) ? parsed : []);
    } catch {
      window.localStorage.removeItem(CITATION_HISTORY_KEY);
    }
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    window.localStorage.setItem(CITATION_LIBRARY_KEY, JSON.stringify(citationLibrary));
  }, [citationLibrary, hydrated]);

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    window.localStorage.setItem(CITATION_HISTORY_KEY, JSON.stringify(citationHistory));
  }, [citationHistory, hydrated]);

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
      setDocumentJson(editor.getJSON());
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
    setDocumentJson(editor.getJSON());
  }, [editor, hydrated]);

  const textContent = editor?.getText() ?? '';
  const wordCount = countWords(textContent);
  const characterCount = textContent.length;
  const citationCount = editor?.getHTML().match(/data-citation="true"/g)?.length ?? 0;
  const bibliographyEntries = useMemo(
    () => buildBibliographyEntries(documentJson, citationLibrary),
    [documentJson, citationLibrary],
  );

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

    const bibliographyItems = bibliographyEntries;
    editor
      .chain()
      .focus()
      .insertContent(
        bibliographyItems.length > 0
          ? [
              {
                type: 'heading',
                attrs: { level: 2 },
                content: [{ type: 'text', text: 'Bibliography' }],
              },
              {
                type: 'orderedList',
                content: bibliographyItems.map((entry) => ({
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: entry.formatted }],
                    },
                  ],
                })),
              },
            ]
          : [
              {
                type: 'heading',
                attrs: { level: 2 },
                content: [{ type: 'text', text: 'Bibliography' }],
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Insert verified citation candidates first, then generate the bibliography.',
                  },
                ],
              },
            ],
      )
      .run();
  }, [editor, bibliographyEntries]);

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

  const exportBibliographyText = useCallback(() => {
    downloadFile(
      'scholarflow-bibliography.txt',
      serializeBibliographyText(bibliographyEntries),
      'text/plain;charset=utf-8',
    );
  }, [bibliographyEntries]);

  const exportBibliographyJson = useCallback(() => {
    downloadFile(
      'scholarflow-bibliography.json',
      JSON.stringify(bibliographyEntries, null, 2),
      'application/json;charset=utf-8',
    );
  }, [bibliographyEntries]);

  const exportCitationText = useCallback(() => {
    downloadFile(
      'scholarflow-citations.txt',
      serializeCitationCandidatesText(citationResults),
      'text/plain;charset=utf-8',
    );
  }, [citationResults]);

  const exportCitationJson = useCallback(() => {
    downloadFile(
      'scholarflow-citations.json',
      JSON.stringify(citationResults, null, 2),
      'application/json;charset=utf-8',
    );
  }, [citationResults]);

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

  const runCitationSearchForQuery = useCallback(async (query: string) => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return;

    setIsSearchingCitations(true);
    setCitationError(null);
    setCitationNote(null);
    setAiError(null);

    try {
      const response = await searchCitations(apiBaseUrl, normalizedQuery, 5);
      setCitationResults(response.results);
      setCitationNote(response.note);
      setCitationHistory((current) =>
        addCitationHistoryEntry(current, {
          query: normalizedQuery,
          resultCount: response.results.length,
          note: response.note,
          savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to search citations.';
      setCitationError(message);
      setCitationResults([]);
      setCitationNote(null);
    } finally {
      setIsSearchingCitations(false);
    }
  }, [apiBaseUrl]);

  const runCitationSearch = useCallback(async () => {
    if (!selectedText.trim()) return;

    await runCitationSearchForQuery(selectedText);
  }, [runCitationSearchForQuery, selectedText]);

  const repeatCitationSearch = useCallback(
    (query: string) => {
      void runCitationSearchForQuery(query);
    },
    [runCitationSearchForQuery],
  );

  const insertCitationCandidate = useCallback(
    (candidate: CitationCandidate) => {
      if (!editor) return;

      setCitationLibrary((current) => {
        if (current[candidate.reference_id]) {
          return current;
        }

        return {
          ...current,
          [candidate.reference_id]: candidate,
        };
      });

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
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-panel/90 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1600px] items-center justify-between gap-4 px-4 lg:px-6">
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

      <div className="mx-auto grid w-full flex-1 min-h-0 max-w-[1600px] gap-0 lg:grid-cols-[320px_minmax(0,1fr)]">
        <main className="min-h-0 bg-panel/70">
          <div className="border-b border-line bg-white/70 px-4 py-3 text-sm text-muted lg:px-6">
            Production-ready TipTap workspace with structured drafting tools and citation placeholders.
          </div>

          <div className="flex h-[calc(100vh-72px-41px)] min-h-0 flex-col">
            <div className="shrink-0 border-b border-line bg-white/80 px-4 py-3 lg:px-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    Document
                  </p>
                  <h2 className="truncate text-lg font-semibold text-text">Academic draft</h2>
                </div>
                <div className="rounded-full border border-line bg-panel px-3 py-1 text-xs text-muted">
                  {statusLabel}
                </div>
              </div>
            </div>

            <div className="shrink-0 border-b border-line bg-panel/90">
              <EditorToolbar
                editor={editor}
                onInsertBibliography={insertBibliography}
                onExportHtml={exportHtml}
                onExportJson={exportJson}
                onSaveDraft={saveDraft}
                onInsertCitation={insertCitation}
                onInsertImage={insertImage}
              />
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5 lg:px-8">
              <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>
        </main>

        <EditorSidebar
          selectedText={selectedText}
          citationResults={citationResults}
          citationHistory={citationHistory}
          wordCount={wordCount}
          characterCount={characterCount}
          citationCount={citationCount}
          bibliographyEntries={bibliographyEntries}
          improvedText={improvedResult}
          isImproving={isImproving}
          isSearchingCitations={isSearchingCitations}
          aiError={aiError}
          citationError={citationError}
          citationNote={citationNote}
          onApplyImprovedText={applyImprovedText}
          onImproveWriting={runImproveWriting}
          onFindCitation={runCitationSearch}
          onRepeatCitationSearch={repeatCitationSearch}
          onInsertCitation={insertCitation}
          onInsertBibliography={insertBibliography}
          onInsertImageSample={insertSampleImage}
          onExportBibliographyText={exportBibliographyText}
          onExportBibliographyJson={exportBibliographyJson}
          onInsertCitationCandidate={insertCitationCandidate}
        />
      </div>
    </div>
  );
}
