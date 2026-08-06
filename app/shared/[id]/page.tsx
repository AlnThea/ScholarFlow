// app/shared/[id]/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { fetchSharedDocument, updateSharedDocument, type DocumentEntry } from '@/lib/api/documents';
import { fetchCitationLibrary } from '@/lib/api/citation-library';
import { formatBibliographyCandidate } from '@/lib/editor/bibliography';
import type { CitationCandidate } from '@/lib/api/citations';
import { EditorJsEditor } from '@/components/editor/editorjs-editor';
import { IconLock, IconBook, IconLoader, IconCheck, IconExternalLink, IconWorld } from '@tabler/icons-react';

export default function SharedDocumentPage() {
  const params = useParams();
  const rawId = params?.id as string | undefined;
  
  // Extract document UUID by removing 'doc-' prefix if present
  const docId = useMemo(() => {
    if (!rawId) return '';
    return rawId.startsWith('doc-') ? rawId.substring(4) : rawId;
  }, [rawId]);

  const [document, setDocument] = useState<DocumentEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editor states
  const [activeReferenceIds, setActiveReferenceIds] = useState<string[]>([]);
  const [citationLibrary, setCitationLibrary] = useState<Record<string, CitationCandidate>>({});
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'offline'>('saved');

  const editorJsRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch document details and citation library on mount
  useEffect(() => {
    if (!docId) {
      setLoading(false);
      setError('Invalid Document ID');
      return;
    }

    const loadData = async () => {
      try {
        const [docDetail, libData] = await Promise.all([
          fetchSharedDocument(docId),
          fetchCitationLibrary().catch(() => ({}))
        ]);

        if (!docDetail) {
          setError('Access Denied');
        } else {
          setDocument(docDetail);
          setCitationLibrary(libData);
        }
      } catch (err) {
        console.error('Failed to load shared document:', err);
        setError('Error Loading Document');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [docId]);

  // Save document handler for Co-Editor mode
  const triggerDebouncedSave = useCallback((titleToSave: string, contentToSave: any) => {
    setSaveStatus('saving');

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await updateSharedDocument(docId, {
          title: titleToSave,
          content: contentToSave
        });
        if (res.success) {
          setSaveStatus('saved');
        } else {
          setSaveStatus('offline');
        }
      } catch (err) {
        console.error('Failed to save document:', err);
        setSaveStatus('offline');
      }
    }, 1500);
  }, [docId]);

  const handleContentChange = useCallback((newContent: any) => {
    if (!document) return;
    setDocument((prev) => prev ? { ...prev, content: newContent } : null);
    triggerDebouncedSave(document.title, newContent);
  }, [document, triggerDebouncedSave]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!document) return;
    const newTitle = e.target.value;
    setDocument((prev) => prev ? { ...prev, title: newTitle } : null);
    triggerDebouncedSave(newTitle, document.content);
  }, [document, triggerDebouncedSave]);

  // Compute references based on active IDs reported by the editor
  const bibliographyEntries = useMemo(() => {
    const uniqueActiveIds = Array.from(new Set(activeReferenceIds));
    const style = document?.settings?.citationStyle || 'apa';
    const lang = document?.settings?.citationLocale || 'en-US';

    return uniqueActiveIds
      .map((id) => {
        const candidate = citationLibrary[id];
        if (!candidate) return null;
        return {
          referenceId: id,
          label: candidate.citation_label,
          formatted: formatBibliographyCandidate(candidate, style, lang)
        };
      })
      .filter(Boolean) as Array<{ referenceId: string; label: string; formatted: string }>;
  }, [citationLibrary, activeReferenceIds, document?.settings?.citationStyle, document?.settings?.citationLocale]);

  // Rerender bibliography block inside editor
  useEffect(() => {
    const entries = bibliographyEntries.map((e) => ({
      label: e.label,
      formatted: e.formatted
    }));
    const timer = setTimeout(() => {
      editorJsRef.current?.upsertBibliography(entries, false);
    }, 100);
    return () => clearTimeout(timer);
  }, [bibliographyEntries]);

  // Render Loading Screen
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-3">
          <IconLoader className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="text-sm text-slate-500 font-medium">Loading Document Draft...</span>
        </div>
      </div>
    );
  }

  // Render Access Denied / Lock Screen
  if (error || !document || !document.settings?.shareActive) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 font-sans p-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl max-w-md w-full text-center flex flex-col items-center gap-5">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
            <IconLock className="h-10 w-10 animate-pulse" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-lg font-bold text-slate-800">
              {document?.settings?.citationLocale?.startsWith('id') ? 'Tautan Berbagi Tidak Aktif' : 'Sharing Link Inactive'}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {document?.settings?.citationLocale?.startsWith('id')
                ? 'Draf dokumen ini bersifat pribadi atau link berbagi telah dinonaktifkan oleh pemiliknya.'
                : 'This draft document is private or sharing access has been disabled by the owner.'}
            </p>
          </div>
          <a
            href="/login"
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-sm shadow-indigo-150 flex items-center justify-center gap-1.5"
          >
            <span>{document?.settings?.citationLocale?.startsWith('id') ? 'Masuk ke ScholarFlow' : 'Log in to ScholarFlow'}</span>
            <IconExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    );
  }

  const isCoEditor = document.settings.sharePermission === 'edit';
  const language = document.settings.citationLocale?.startsWith('id') ? 'id' : 'en';

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-850">
      
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/50 h-14 flex items-center justify-between px-6 shadow-sm shadow-slate-100/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-200">
            <IconBook className="h-4.5 w-4.5" />
          </div>
          <span className="text-sm font-extrabold tracking-tight text-slate-900">
            Scholar<span className="text-indigo-600">Flow</span>
          </span>
        </div>

        {/* Document title (Editable if Co-Editor, static if Read-Only) */}
        <div className="hidden md:flex items-center max-w-md flex-1 px-8 justify-center">
          {isCoEditor ? (
            <input
              type="text"
              value={document.title}
              onChange={handleTitleChange}
              className="w-full text-center text-xs font-bold text-slate-800 outline-none border border-transparent hover:border-slate-200 hover:bg-slate-50 focus:border-indigo-400 focus:bg-white rounded-lg px-3 py-1.5 transition text-ellipsis"
            />
          ) : (
            <span className="text-xs font-bold text-slate-800 truncate">{document.title}</span>
          )}
        </div>

        {/* Access badge and save indicator */}
        <div className="flex items-center gap-3">
          {isCoEditor ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-slate-400">
                {saveStatus === 'saving' && (
                  <span className="flex items-center gap-1">
                    <IconLoader className="h-3 w-3 animate-spin text-slate-400" />
                    {language === 'id' ? 'Menyimpan...' : 'Saving...'}
                  </span>
                )}
                {saveStatus === 'saved' && (
                  <span className="flex items-center gap-1 text-emerald-500">
                    <IconCheck className="h-3.5 w-3.5" />
                    {language === 'id' ? 'Tersimpan' : 'Saved'}
                  </span>
                )}
                {saveStatus === 'offline' && (
                  <span className="text-amber-500">
                    {language === 'id' ? 'Disimpan Lokal' : 'Saved Locally'}
                  </span>
                )}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/40 rounded-full">
                <IconWorld className="h-3 w-3" />
                Co-Editor
              </span>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/40 rounded-full">
              <IconLock className="h-3 w-3" />
              {language === 'id' ? 'Membaca Saja' : 'Read-Only'}
            </span>
          )}
        </div>
      </header>

      {/* Editor Main Content Area */}
      <main className="pt-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto bg-white border border-slate-200/80 rounded-2xl shadow-sm min-h-[60vh] overflow-hidden my-6">
          
          {/* Header metadata layout for public reader */}
          <div className="px-6 md:px-10 pt-8 border-b border-slate-100 pb-4">
            <h1 className="text-xl md:text-2xl font-serif font-bold text-slate-900 mb-2 leading-snug">
              {document.title}
            </h1>
            <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              <span>{language === 'id' ? 'Draf Bersama' : 'Shared Draft'}</span>
              <span>•</span>
              <span>{new Date(document.updated_at).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          <div className="py-2">
            <EditorJsEditor
              ref={editorJsRef}
              initialContent={document.content}
              readOnly={!isCoEditor}
              onContentChange={isCoEditor ? handleContentChange : undefined}
              onStatsChange={(stats) => {
                // Read active reference IDs reported in real-time
                if (stats.activeReferenceIds) {
                  setActiveReferenceIds(stats.activeReferenceIds as any);
                }
              }}
            />
          </div>
        </div>

        {/* Formatted References Block */}
        {bibliographyEntries.length > 0 && (
          <div className="max-w-3xl mx-auto mt-8 mb-24 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 md:p-10">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
              {language === 'id' ? 'Daftar Pustaka' : 'Bibliography'}
            </h2>
            <ol className="list-decimal list-inside space-y-3.5 text-xs text-slate-650 leading-relaxed font-serif">
              {bibliographyEntries.map((entry) => (
                <li key={entry.referenceId} className="pl-1">
                  <span className="font-semibold text-slate-700 mr-1.5 font-sans">[{entry.label}]</span>
                  <span dangerouslySetInnerHTML={{ __html: entry.formatted }} />
                </li>
              ))}
            </ol>
          </div>
        )}
      </main>
    </div>
  );
}
