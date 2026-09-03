import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchSharedDocument, updateSharedDocument, DocumentEntry } from '@/lib/api/documents';
import { fetchComments, DocumentComment } from '@/lib/api/comments';
import { fetchCitationLibrary } from '@/lib/api/citation-library';
import { updatePresence, fetchActivePresence, leavePresence, UserPresence } from '@/lib/api/presence';
import { fetchSuggestions, DocumentSuggestion } from '@/lib/api/suggestions';
import { CitationCandidate } from '@/lib/api/citations';

// Helper to reliably compare EditorJS content updates
const getContentComparisonString = (content: any) => {
  if (!content || !content.blocks) return '';
  return JSON.stringify(content.blocks.map((b: any) => ({
    id: b.id,
    type: b.type,
    text: b.data?.text,
    items: b.data?.items,
    url: b.data?.url
  })));
};

export interface UseSharedDocumentSyncOptions {
  docId: string;
  language: 'id' | 'en';
  isCoEditor: boolean;
  user: any;
  profile: any;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  editorJsRef: React.MutableRefObject<any>;
}

export function useSharedDocumentSync({
  docId,
  language,
  isCoEditor,
  user,
  profile,
  showToast,
  editorJsRef
}: UseSharedDocumentSyncOptions) {
  const [document, setDocument] = useState<DocumentEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'offline'>('saved');
  const [citationLibrary, setCitationLibrary] = useState<Record<string, CitationCandidate>>({});
  
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [suggestions, setSuggestions] = useState<DocumentSuggestion[]>([]);
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);

  const [hasPendingRemoteUpdate, setHasPendingRemoteUpdate] = useState(false);
  const [pendingRemoteContent, setPendingRemoteContent] = useState<any>(null);

  // Sync refs
  const lastSavedContentRef = useRef<string>('');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processedAcceptedSuggestionsRef = useRef<Set<string>>(new Set());
  const acceptedLocallyRef = useRef<Set<string>>(new Set());
  const suggestionsInitializedRef = useRef<boolean>(false);

  // Fetch initial document details and setup
  useEffect(() => {
    if (!docId) {
      setLoading(false);
      setError('Invalid Document ID');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const [docDetail, libData, commentsData, suggestionsData] = await Promise.all([
          fetchSharedDocument(docId),
          fetchCitationLibrary().catch(() => ({})),
          fetchComments(docId).catch(() => []),
          fetchSuggestions(docId).catch(() => [])
        ]);

        if (!docDetail) {
          setError('Document not found or share link is invalid');
        } else {
          if (docDetail.content && Array.isArray(docDetail.content.blocks)) {
            docDetail.content.blocks = docDetail.content.blocks.map((block: any) => {
              if (block.type === 'paragraph' && typeof block.data?.text === 'string') {
                const textStr = block.data.text;
                if (textStr.includes('sf-bibliography-blur') || textStr.includes('filter: blur') || textStr.includes('filter:blur')) {
                  let inner = textStr;
                  const divMatch = textStr.match(/<div[^>]*>([\s\S]*?)<\/div>/);
                  if (divMatch) {
                    inner = divMatch[1];
                  }
                  block.data.text = \`
                    <div class="sf-bibliography-fade-container" style="position: relative; max-height: 55px; overflow: hidden; user-select: none; pointer-events: none; margin-top: 15px; line-height: 1.6;">
                      <div class="sf-bibliography-blur" style="filter: blur(3px); opacity: 0.35;">
                        \${inner}
                      </div>
                      <div class="sf-fade-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; height: 45px; background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%); pointer-events: none;"></div>
                    </div>
                  \`;
                }
              }
              return block;
            });
          }
          setDocument(docDetail);
          setComments(commentsData);
          setSuggestions(suggestionsData);
          if (docDetail.settings?.alignments) {
            localStorage.setItem('scholarflow.editorjs.alignments.v1', JSON.stringify(docDetail.settings.alignments));
          }
          setCitationLibrary(libData);
          lastSavedContentRef.current = getContentComparisonString(docDetail.content);
          suggestionsData.filter((s: DocumentSuggestion) => s.status === 'accepted').forEach((s: DocumentSuggestion) => processedAcceptedSuggestionsRef.current.add(s.id));
          suggestionsInitializedRef.current = true;
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

  // Poll for updates (comments, suggestions, document)
  useEffect(() => {
    if (!docId) return;

    const syncFn = async () => {
      if (typeof window !== 'undefined' && window.document.hidden) return;
      try {
        const [newComms, newSugs, updatedDoc] = await Promise.all([
          fetchComments(docId),
          fetchSuggestions(docId),
          fetchSharedDocument(docId).catch(() => null)
        ]);

        const newlyAcceptedRemote = newSugs.find(s =>
          s.status === 'accepted' &&
          !processedAcceptedSuggestionsRef.current.has(s.id) &&
          !acceptedLocallyRef.current.has(s.id)
        );

        if (newlyAcceptedRemote && updatedDoc && updatedDoc.content) {
          newSugs.filter(s => s.status === 'accepted').forEach(s => processedAcceptedSuggestionsRef.current.add(s.id));
          setPendingRemoteContent(updatedDoc.content);
          setHasPendingRemoteUpdate(true);
        }

        setComments(prev => {
          prev.forEach(oldComm => {
            const newComm = newComms.find(c => c.id === oldComm.id);
            if (oldComm && !oldComm.resolved && newComm && newComm.resolved) {
              showToast(
                language === 'id'
                  ? \`Komentar "\${oldComm.comment_text.slice(0, 25)}\${oldComm.comment_text.length > 25 ? '...' : ''}" telah selesai ditinjau oleh pemilik!\`
                  : \`Comment "\${oldComm.comment_text.slice(0, 25)}\${oldComm.comment_text.length > 25 ? '...' : ''}" was resolved by the owner!\`,
                'info'
              );
              editorJsRef.current?.highlightAndRemoveCommentMark(oldComm.id);
            }
          });
          return newComms;
        });
        setSuggestions(newSugs);
      } catch (e) {
        console.error('Error polling data:', e);
      }
    };

    const handleVisibility = () => {
      if (typeof window !== 'undefined' && !window.document.hidden) {
        syncFn();
      }
    };

    if (typeof window !== 'undefined') {
      window.document.addEventListener('visibilitychange', handleVisibility);
    }
    const interval = setInterval(syncFn, 5000);

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.document.removeEventListener('visibilitychange', handleVisibility);
      }
    };
  }, [docId, showToast, language, editorJsRef]);

  // Presence Heartbeat Effect
  useEffect(() => {
    if (!docId) return;
    const authorName = profile?.full_name || user?.email?.split('@')[0] || (language === 'id' ? 'Tamu' : 'Guest');
    const userId = user?.id || \`co-editor-\${docId}\`;

    const updateAndFetch = async () => {
      if (typeof window !== 'undefined' && window.document.hidden) return;
      await updatePresence(docId, userId, authorName, isCoEditor ? 'co-editor' : 'reader');
      const active = await fetchActivePresence(docId);
      setActiveUsers(active);
    };
    updateAndFetch();

    const handleVisibility = () => {
      if (typeof window !== 'undefined' && !window.document.hidden) {
        updateAndFetch();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === \`scholarflow_presence_\${docId}\`) {
        fetchActivePresence(docId).then(setActiveUsers);
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      window.document.addEventListener('visibilitychange', handleVisibility);
    }

    const handleUnload = () => {
      leavePresence(docId, userId);
    };
    window.addEventListener('beforeunload', handleUnload);

    const interval = setInterval(updateAndFetch, 5000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('beforeunload', handleUnload);
      if (typeof window !== 'undefined') {
        window.document.removeEventListener('visibilitychange', handleVisibility);
      }
      leavePresence(docId, userId);
    };
  }, [docId, user?.id, profile?.full_name, user?.email, isCoEditor, language]);

  // Save document handler for Co-Editor mode
  const triggerDebouncedSave = useCallback((titleToSave: string, contentToSave: any, settingsToSave?: any) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      let alignments = {};
      try {
        alignments = JSON.parse(localStorage.getItem('scholarflow.editorjs.alignments.v1') || '{}');
      } catch (e) {
        console.warn('Failed to parse alignments from localStorage:', e);
      }

      const activeSettings = settingsToSave || document?.settings || {};
      const finalSettings = {
        ...activeSettings,
        alignments
      };

      try {
        const updates: any = {
          title: titleToSave,
          content: contentToSave,
          settings: finalSettings
        };
        const res = await updateSharedDocument(docId, updates);
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
  }, [docId, document]);

  const handleContentChange = useCallback((newContent: any) => {
    if (!document) return;
    const contentString = getContentComparisonString(newContent);
    if (contentString === lastSavedContentRef.current) {
      return;
    }
    lastSavedContentRef.current = contentString;
    setDocument((prev) => prev ? { ...prev, content: newContent } : null);
    triggerDebouncedSave(document.title, newContent, document.settings);
  }, [document, triggerDebouncedSave]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!document) return;
    const newTitle = e.target.value;
    setDocument((prev) => prev ? { ...prev, title: newTitle } : null);
    triggerDebouncedSave(newTitle, document.content, document.settings);
  }, [document, triggerDebouncedSave]);

  return {
    document,
    setDocument,
    loading,
    error,
    saveStatus,
    setSaveStatus,
    citationLibrary,
    comments,
    setComments,
    suggestions,
    setSuggestions,
    activeUsers,
    hasPendingRemoteUpdate,
    setHasPendingRemoteUpdate,
    pendingRemoteContent,
    setPendingRemoteContent,
    acceptedLocallyRef,
    handleContentChange,
    handleTitleChange,
  };
}
