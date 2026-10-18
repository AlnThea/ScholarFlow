// hooks/use-version-history.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  DocumentRevision,
  fetchDocumentRevisions,
  createDocumentRevision,
  countWordsFromContent,
} from '@/lib/editor/version-history';
import {
  computeWordDiff,
  calculateDiffStats,
  extractPlainTextFromEditorJs,
  DiffChunk,
  DiffStats,
} from '@/lib/editor/diff-engine';

interface UseVersionHistoryProps {
  documentId?: string;
  documentTitle?: string;
  currentContent?: any;
  userId?: string;
  authorName?: string;
  language: 'en' | 'id';
  editorJsRef?: any;
  onContentChange?: (content: any) => void;
  showToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export function useVersionHistory({
  documentId,
  documentTitle,
  currentContent,
  userId,
  authorName,
  language,
  editorJsRef,
  onContentChange,
  showToast,
}: UseVersionHistoryProps) {
  const [revisions, setRevisions] = useState<DocumentRevision[]>([]);
  const [isLoadingRevisions, setIsLoadingRevisions] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState<DocumentRevision | null>(null);
  const [diffChunks, setDiffChunks] = useState<DiffChunk[]>([]);
  const [diffStats, setDiffStats] = useState<DiffStats | null>(null);
  const [activeDiffMode, setActiveDiffMode] = useState<'unified' | 'split'>('unified');
  const [isRestoring, setIsRestoring] = useState(false);

  // Tracks word count of the last saved snapshot to trigger auto-snapshot on major edits
  const lastSnapshotWordCountRef = useRef<number>(0);
  const lastSnapshotTimestampRef = useRef<number>(Date.now());
  const currentContentRef = useRef<any>(currentContent);
  currentContentRef.current = currentContent;

  const isEn = language === 'en';

  /**
   * Refreshes revisions list from cloud / local storage
   */
  const loadRevisions = useCallback(async () => {
    if (!documentId) return;
    setIsLoadingRevisions(true);
    try {
      const data = await fetchDocumentRevisions(documentId);
      setRevisions(data);
      if (data.length > 0 && !selectedRevision) {
        setSelectedRevision(data[0]);
      }
    } catch (err) {
      console.error('Failed to load revisions:', err);
    } finally {
      setIsLoadingRevisions(false);
    }
  }, [documentId, selectedRevision]);

  /**
   * Compute visual diff whenever selectedRevision changes
   */
  useEffect(() => {
    if (!selectedRevision) {
      setDiffChunks([]);
      setDiffStats(null);
      return;
    }

    try {
      const selectedText = extractPlainTextFromEditorJs(selectedRevision.content);
      const activeText = extractPlainTextFromEditorJs(currentContentRef.current);

      // Diff comparing Selected Revision -> Current Canvas
      const chunks = computeWordDiff(selectedText, activeText);
      const stats = calculateDiffStats(chunks);

      setDiffChunks(chunks);
      setDiffStats(stats);
    } catch (err) {
      console.error('Error computing diff:', err);
    }
  }, [selectedRevision, isVersionModalOpen]);

  /**
   * Open Version History modal & initialize selection
   */
  const openVersionHistory = useCallback(async () => {
    setIsVersionModalOpen(true);
    if (!documentId) return;

    setIsLoadingRevisions(true);
    try {
      const data = await fetchDocumentRevisions(documentId);
      setRevisions(data);
      if (data.length > 0) {
        setSelectedRevision(data[0]);
      }
    } catch (err) {
      console.error('Failed to open version history:', err);
    } finally {
      setIsLoadingRevisions(false);
    }
  }, [documentId]);

  /**
   * Close modal
   */
  const closeVersionHistory = useCallback(() => {
    setIsVersionModalOpen(false);
  }, []);

  /**
   * Create a manual snapshot checkpoint
   */
  const createManualSnapshot = useCallback(
    async (changeSummary?: string) => {
      if (!documentId) return;

      const summaryText =
        changeSummary?.trim() ||
        (isEn ? 'Manual checkpoint' : 'Titik simpan manual');

      try {
        const newRev = await createDocumentRevision(documentId, {
          userId: userId || 'anon',
          title: documentTitle || 'Untitled Document',
          content: currentContentRef.current,
          changeSummary: summaryText,
          isAutoSaved: false,
          authorName: authorName || (isEn ? 'Author' : 'Penulis'),
        });

        setRevisions(prev => [newRev, ...prev.filter(r => r.id !== newRev.id)]);
        setSelectedRevision(newRev);
        lastSnapshotWordCountRef.current = newRev.word_count;
        lastSnapshotTimestampRef.current = Date.now();

        if (showToast) {
          showToast(
            isEn ? 'Version snapshot created successfully.' : 'Versi dokumen berhasil disimpan.',
            'success'
          );
        }
        return newRev;
      } catch (err) {
        console.error('Failed to create manual snapshot:', err);
        if (showToast) {
          showToast(
            isEn ? 'Failed to create version snapshot.' : 'Gagal membuat versi dokumen.',
            'error'
          );
        }
      }
    },
    [documentId, userId, documentTitle, authorName, isEn, showToast]
  );

  /**
   * Restore document to the selected revision
   */
  const restoreRevision = useCallback(
    async (revisionToRestore: DocumentRevision) => {
      if (!documentId || !revisionToRestore) return;

      setIsRestoring(true);
      try {
        // 1. Safety First: Create an automatic pre-restore backup of current canvas
        const currentWords = countWordsFromContent(currentContentRef.current);
        if (currentWords > 0) {
          await createDocumentRevision(documentId, {
            userId: userId || 'anon',
            title: documentTitle || 'Untitled Document',
            content: currentContentRef.current,
            changeSummary: isEn
              ? `Safety snapshot before restoring to "${revisionToRestore.change_summary || 'Checkpoint'}"`
              : `Cadangan keselamatan sebelum pemulihan ke "${revisionToRestore.change_summary || 'Versi'}"`,
            isAutoSaved: true,
            authorName: authorName || (isEn ? 'System' : 'Sistem'),
          });
        }

        // 2. Render revision content into EditorJS instance
        if (editorJsRef?.current && revisionToRestore.content) {
          if (editorJsRef.current.renderContent) {
            editorJsRef.current.renderContent(revisionToRestore.content);
          } else if (editorJsRef.current.render) {
            await editorJsRef.current.render(revisionToRestore.content);
          }
        }

        // 3. Inform parent document hook of the restoration
        if (onContentChange) {
          onContentChange(revisionToRestore.content);
        }

        // 4. Update local state
        setIsVersionModalOpen(false);
        if (showToast) {
          showToast(
            isEn
              ? `Document restored to version from ${new Date(revisionToRestore.created_at).toLocaleTimeString()}`
              : `Dokumen berhasil dipulihkan ke versi ${new Date(revisionToRestore.created_at).toLocaleTimeString()}`,
            'success'
          );
        }
      } catch (err) {
        console.error('Failed to restore revision:', err);
        if (showToast) {
          showToast(
            isEn ? 'Failed to restore selected version.' : 'Gagal memulihkan versi terpilih.',
            'error'
          );
        }
      } finally {
        setIsRestoring(false);
      }
    },
    [documentId, userId, documentTitle, authorName, isEn, editorJsRef, onContentChange, showToast]
  );

  /**
   * Smart periodic auto-snapshot (every 15 minutes of active writing, or when >= 80 words changed)
   */
  useEffect(() => {
    if (!documentId) return;

    const intervalId = setInterval(() => {
      const currentWords = countWordsFromContent(currentContentRef.current);
      if (currentWords === 0) return;

      const wordsDelta = Math.abs(currentWords - lastSnapshotWordCountRef.current);
      const timeSinceLast = Date.now() - lastSnapshotTimestampRef.current;
      const fifteenMinutes = 15 * 60 * 1000;

      // Auto-save if 15 minutes passed AND at least 25 words changed, OR if >= 80 words changed
      if ((timeSinceLast >= fifteenMinutes && wordsDelta >= 25) || wordsDelta >= 80) {
        createDocumentRevision(documentId, {
          userId: userId || 'anon',
          title: documentTitle || 'Untitled Document',
          content: currentContentRef.current,
          changeSummary: isEn ? 'Auto-saved snapshot' : 'Snapshot tersimpan otomatis',
          isAutoSaved: true,
          authorName: authorName || (isEn ? 'Auto-save' : 'Auto-save'),
        }).then(newRev => {
          setRevisions(prev => [newRev, ...prev.filter(r => r.id !== newRev.id)]);
          lastSnapshotWordCountRef.current = currentWords;
          lastSnapshotTimestampRef.current = Date.now();
        }).catch(err => console.warn('Auto-snapshot error:', err));
      }
    }, 60000); // Check every 1 minute

    return () => clearInterval(intervalId);
  }, [documentId, userId, documentTitle, authorName, isEn]);

  return {
    revisions,
    isLoadingRevisions,
    isVersionModalOpen,
    setIsVersionModalOpen,
    openVersionHistory,
    closeVersionHistory,
    selectedRevision,
    setSelectedRevision,
    diffChunks,
    diffStats,
    activeDiffMode,
    setActiveDiffMode,
    createManualSnapshot,
    restoreRevision,
    isRestoring,
    loadRevisions,
  };
}
