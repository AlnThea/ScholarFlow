// c:/web/ScholarFlow/components/editor/scholar-editor.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { improveWriting, type ImproveWritingResponse, synthesizeLiteratureReview, generateAbstract } from '@/lib/api/ai';
import { fetchAIModels, updateAIModel, createAIModel, deleteAIModel, type AIModel } from '@/lib/api/ai-models';
import EditorJsEditor, { type EditorJsMethods } from './editorjs-editor';
import { EditorLayout } from './editor-layout';
import { searchCitations, type CitationCandidate } from '@/lib/api/citations';
import { fetchCitationLibrary, saveCitationToLibrary } from '@/lib/api/citation-library';
import { useAuth } from '@/components/auth/auth-provider';
import { useLanguage } from '../i18n/language-context';
import {
  fetchDocuments,
  fetchDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  type DocumentEntry,
  type DocumentListItem,
  type DocumentSettings
} from '@/lib/api/documents';
import { updatePresence, fetchActivePresence, leavePresence, type UserPresence } from '@/lib/api/presence';
import {
  addCitationHistoryEntry,
  type CitationHistoryEntry,
} from '@/lib/editor/citation-history';
import {
  addAiHistoryEntry,
  type AiHistoryEntry,
} from '@/lib/editor/ai-history';
import { DocumentSetupModal } from './document-setup-modal';
import { DocumentSettingsModal } from './document-settings-modal';
import { PricingModal } from './pricing-modal';
import { LimitWarningModal } from './limit-warning-modal';
import {
  serializeBibliographyText,
  formatBibliographyCandidate,
} from '@/lib/editor/bibliography';
import {
  serializeCitationCandidatesText,
} from '@/lib/editor/citation-export';
import { getTemplateBlocks } from '@/lib/templates';
import { IconLoader2, IconSparkles, IconCheck, IconAlertCircle, IconInfoCircle } from '@tabler/icons-react';
import {
  fetchComments,
  fetchNotifications,
  resolveComment,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type DocumentComment,
  type DocumentNotification
} from '@/lib/api/comments';

const STORAGE_KEY = 'scholarflow.editor.content.v1';
const CITATION_LIBRARY_KEY = 'scholarflow.editor.citation-library.v1';
const CITATION_HISTORY_KEY = 'scholarflow.editor.citation-history.v1';
const AI_HISTORY_KEY = 'scholarflow.editor.ai-history.v1';

function extractTextFromContent(content: any): string {
  if (!content || !content.blocks || !Array.isArray(content.blocks)) return '';
  const texts: string[] = [];
  for (const block of content.blocks) {
    if (block.type === 'paragraph' || block.type === 'header') {
      const txt = block.data?.text;
      if (txt) {
        // Strip HTML tags because Editor.js stores styled html
        const clean = txt.replace(/<[^>]*>/g, '').trim();
        if (clean) texts.push(clean);
      }
    } else if (block.type === 'list') {
      const items = block.data?.items;
      if (items && Array.isArray(items)) {
        for (const item of items) {
          const cleanItem = item.replace(/<[^>]*>/g, '').trim();
          if (cleanItem) texts.push(cleanItem);
        }
      }
    }
  }
  return texts.join('\n\n');
}

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

function findMostRelevantSentence(abstract: string | null | undefined, query: string): string {
  if (!abstract) return "Abstrak tidak tersedia.";
  
  // Pre-process abstract to add spaces after periods if missing (e.g. "konvensional.Sistem" -> "konvensional. Sistem")
  const cleanedAbstract = abstract.replace(/(?<=[.!?])(?=[A-Za-z])/g, " ");
  
  const sentences = cleanedAbstract.split(/(?<=[.!?])\s+/);
  if (sentences.length <= 1) return cleanedAbstract;
  const queryWords = new Set(query.toLowerCase().match(/[a-z0-9]+/g) ?? []);
  if (queryWords.size === 0) return sentences[0];
  let bestSentence = sentences[0];
  let maxOverlap = -1;
  for (const sentence of sentences) {
    const sentenceWords = new Set(sentence.toLowerCase().match(/[a-z0-9]+/g) ?? []);
    let overlap = 0;
    for (const word of sentenceWords) {
      if (queryWords.has(word)) overlap++;
    }
    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      bestSentence = sentence;
    }
  }
  return bestSentence;
}

function HighlightedAbstract({ abstract, query }: { abstract: string | null | undefined; query: string }) {
  if (!abstract) return <p className="text-slate-400 italic text-xs">Abstrak tidak tersedia.</p>;
  
  // Pre-process abstract to add spaces after periods if missing
  const cleanedAbstract = abstract.replace(/(?<=[.!?])(?=[A-Za-z])/g, " ");
  
  const sentences = cleanedAbstract.split(/(?<=[.!?])\s+/);
  if (sentences.length <= 1) {
    return <p className="text-slate-600 leading-relaxed text-xs">{cleanedAbstract}</p>;
  }
  const queryWords = new Set(query.toLowerCase().match(/[a-z0-9]+/g) ?? []);
  let bestIndex = 0;
  let maxOverlap = -1;
  sentences.forEach((sentence, idx) => {
    const sentenceWords = new Set(sentence.toLowerCase().match(/[a-z0-9]+/g) ?? []);
    let overlap = 0;
    for (const word of sentenceWords) {
      if (queryWords.has(word)) overlap++;
    }
    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      bestIndex = idx;
    }
  });
  return (
    <p className="text-slate-600 leading-relaxed text-xs">
      {sentences.map((sentence, idx) => {
        if (idx === bestIndex) {
          return (
            <mark key={idx} className="bg-indigo-50 text-indigo-950 font-semibold px-1 rounded border-b border-indigo-200">
              {sentence}{' '}
            </mark>
          );
        }
        return <span key={idx}>{sentence} </span>;
      })}
    </p>
  );
}

function findMostUniqueWord(sentence: string): string {
  if (!sentence) return "";
  const words = sentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'\[\]]/g, " ").split(/\s+/);
  const stopwords = new Set([
    'dan', 'di', 'yang', 'untuk', 'dengan', 'itu', 'ini', 'dalam', 'pada', 'dari', 'ke', 'sebagai', 'adalah',
    'oleh', 'atau', 'telah', 'bisa', 'dapat', 'akan', 'juga', 'ada', 'mereka', 'ia', 'kita', 'kami', 'saya',
    'kamu', 'dia', 'namun', 'tetapi', 'karena', 'sehingga', 'maka', 'jika', 'serta', 'seperti',
    'tersebut', 'secara', 'sebesar', 'sistem', 'metode', 'aplikasi', 'penelitian', 'peneliti', 'hasil', 'pada',
    'the', 'and', 'of', 'in', 'to', 'for', 'with', 'on', 'at', 'by', 'an', 'be', 'this', 'that', 'from', 'it', 'is', 'was', 'were', 'are', 'as'
  ]);
  let bestWord = "";
  let maxScore = -1;
  for (const word of words) {
    const cleanWord = word.trim();
    if (!cleanWord || stopwords.has(cleanWord.toLowerCase())) continue;
    let score = cleanWord.length;
    if (/[vxzyqp]/i.test(cleanWord)) score += 2;
    if (/[A-Z]/.test(cleanWord)) score += 1;
    if (/\d/.test(cleanWord)) score += 1;
    if (score > maxScore) {
      maxScore = score;
      bestWord = cleanWord;
    }
  }
  return bestWord || words[0] || "";
}

export function ScholarEditor() {
  const { language, t } = useLanguage();
  const { user, profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const activePlanId = profile?.subscription_plan || 'free';
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [improvedResult, setImprovedResult] = useState<ImproveWritingResponse | null>(null);
  const [contentBeforeApply, setContentBeforeApply] = useState<any>(null);
  const [isApplied, setIsApplied] = useState(false);
  const [selectedAiModel, setSelectedAiModel] = useState('gemini');
  const [selectedAiTone, setSelectedAiTone] = useState('academic');

  // Document system state
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [currentDocument, setCurrentDocument] = useState<DocumentEntry | null>(null);
  const [isDocLoading, setIsDocLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>(language === 'en' ? 'Saved to Cloud' : 'Tersimpan ke Cloud');
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadedDocumentIdRef = useRef<string | null>(null);
  const lastSavedContentRef = useRef<string>('');
  const [citationResults, setCitationResults] = useState<CitationCandidate[]>([]);
  const [citationLibrary, setCitationLibrary] = useState<Record<string, CitationCandidate>>({});
  const [citationHistory, setCitationHistory] = useState<CitationHistoryEntry[]>([]);
  const [aiHistory, setAiHistory] = useState<AiHistoryEntry[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [citationError, setCitationError] = useState<string | null>(null);
  const [citationNote, setCitationNote] = useState<string | null>(null);
  const [isImproving, setIsImproving] = useState(false);
  const [isSearchingCitations, setIsSearchingCitations] = useState(false);
  const citationInsertTimeoutRef = useRef<number | null>(null);
  const [activeModalCitation, setActiveModalCitation] = useState<{ refId: string; label: string; citedSentence: string } | null>(null);
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [activePdfSearchTerm, setActivePdfSearchTerm] = useState<string>('');
  const [resolvedPdfUrl, setResolvedPdfUrl] = useState<string | null>(null);
  const [isResolvingPdf, setIsResolvingPdf] = useState(false);
  const [translatedCitedSentence, setTranslatedCitedSentence] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesizedText, setSynthesizedText] = useState<string | null>(null);
  const [synthesizeError, setSynthesizeError] = useState<string | null>(null);
  const [synthesizeDisclaimer, setSynthesizeDisclaimer] = useState<string | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Comments and Notifications State
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [notifications, setNotifications] = useState<DocumentNotification[]>([]);
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'library' | 'writing' | 'document' | 'comments' | undefined>(undefined);

  // Poll comments and notifications
  useEffect(() => {
    if (!user?.id) return;

    const loadCommentsAndNotifications = async () => {
      try {
        const notifs = await fetchNotifications(user.id);
        setNotifications(notifs);
        if (currentDocument?.id) {
          const comms = await fetchComments(currentDocument.id);
          setComments(comms);
        }
      } catch (err) {
        console.error('Error fetching comments/notifications:', err);
      }
    };
    loadCommentsAndNotifications();

    const interval = setInterval(async () => {
      try {
        const notifs = await fetchNotifications(user.id);
        setNotifications(notifs);
        if (currentDocument?.id) {
          const comms = await fetchComments(currentDocument.id);
          setComments(comms);
        }
      } catch (err) {
        console.error('Error polling comments/notifications:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user?.id, currentDocument?.id]);

  // Presence Heartbeat Effect for Owner
  useEffect(() => {
    if (!currentDocument?.id || !user?.id) return;
    const authorName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Pemilik Dokumen';

    const updateAndFetch = async () => {
      await updatePresence(currentDocument.id, user.id, authorName, 'owner');
      const active = await fetchActivePresence(currentDocument.id);
      setActiveUsers(active);
    };
    updateAndFetch();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `scholarflow_presence_${currentDocument.id}`) {
        fetchActivePresence(currentDocument.id).then(setActiveUsers);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    const handleUnload = () => {
      leavePresence(currentDocument.id, user.id);
    };
    window.addEventListener('beforeunload', handleUnload);

    const interval = setInterval(updateAndFetch, 5000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('beforeunload', handleUnload);
      leavePresence(currentDocument.id, user.id);
    };
  }, [currentDocument?.id, user?.id, user?.email, user?.user_metadata?.full_name]);

  // Auto-sync comment highlights onto editor canvas whenever comments update
  useEffect(() => {
    if (comments && comments.length > 0) {
      const timer = setTimeout(() => {
        editorJsRef.current?.syncCommentMarks?.(comments);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [comments]);

  const handleMarkNotificationRead = async (id: string) => {
    try {
      const success = await markNotificationAsRead(id);
      if (success) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    if (!user?.id) return;
    try {
      const success = await markAllNotificationsAsRead(user.id);
      if (success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, read: true }))
        );
      }
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const handleResolveComment = async (id: string) => {
    try {
      const success = await resolveComment(id);
      if (success) {
        editorJsRef.current?.highlightAndRemoveCommentMark(id);
        setComments(prev =>
          prev.map(c => c.id === id ? { ...c, resolved: true } : c)
        );
      }
    } catch (err) {
      console.error('Failed to resolve comment:', err);
    }
  };

  const handleCommentClick = useCallback((c: DocumentComment) => {
    if (c.id) {
      editorJsRef.current?.scrollToCommentMark(c.id);
    }
    if (c.block_id) {
      const blockEl = window.document.querySelector(`[data-id="${c.block_id}"]`);
      if (blockEl) {
        blockEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        blockEl.classList.add('bg-indigo-50/50');
        setTimeout(() => {
          blockEl.classList.remove('bg-indigo-50/50');
        }, 2000);
      }
    }
  }, []);

  const handleNotificationClick = useCallback(async (notif: DocumentNotification) => {
    if (currentDocument?.id !== notif.document_id) {
      setIsDocLoading(true);
      router.push(`/editor/${notif.document_id}`);
    }
    
    setActiveSidebarTab('comments');
    
    try {
      const comms = await fetchComments(notif.document_id);
      setComments(comms);
      setTimeout(() => {
        if (comms.length > 0) {
          const activeComms = comms.filter(c => !c.resolved);
          if (activeComms.length > 0) {
            const lastComm = activeComms[activeComms.length - 1];
            handleCommentClick(lastComm);
          }
        }
      }, 500);
    } catch (err) {
      console.error(err);
    }
  }, [currentDocument?.id, router, handleCommentClick]);
  
  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage({ text, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  useEffect(() => {
    fetchAIModels().then(data => {
      setAiModels(data);
    }).catch(err => {
      console.error("Failed to load AI models:", err);
    });
  }, []);

  const triggerDebouncedSave = useCallback((docId: string, titleToSave: string, contentToSave: any, settingsToSave?: any) => {
    if (!user?.id) return;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      setSaveStatus(language === 'en' ? 'Saving...' : 'Menyimpan...');
      let alignments = {};
      try {
        alignments = JSON.parse(localStorage.getItem('scholarflow.editorjs.alignments.v1') || '{}');
      } catch (e) {
        console.warn('Failed to parse alignments from localStorage:', e);
      }

      const activeSettings = settingsToSave || currentDocument?.settings || {};
      const finalSettings = {
        ...activeSettings,
        alignments
      };

      const updates: any = {
        title: titleToSave,
        content: contentToSave,
        settings: finalSettings
      };
      try {
        const res = await updateDocument(docId, user.id, updates);
        if (res.success) {
          setSaveStatus(language === 'en' ? 'Saved to Cloud' : 'Tersimpan ke Cloud');
          localStorage.removeItem(`scholarflow.offline_backup.${docId}`);
          
          // Refresh list to update title/timestamps
          const list = await fetchDocuments(user.id);
          setDocuments(list);
        } else {
          localStorage.setItem(
            `scholarflow.offline_backup.${docId}`,
            JSON.stringify({ ...updates, id: docId, user_id: user.id })
          );
          setSaveStatus('Disimpan Lokal (Offline)');
        }
      } catch (err) {
        console.error('Error saving document:', err);
        localStorage.setItem(
          `scholarflow.offline_backup.${docId}`,
          JSON.stringify({ ...updates, id: docId, user_id: user.id })
        );
        setSaveStatus('Disimpan Lokal (Offline)');
      }
    }, 1500);
  }, [user, language, currentDocument]);

  useEffect(() => {
    const docId = params?.id as string | undefined;
    
    if (docId) {
      if (currentDocument?.id !== docId) {
        setIsDocLoading(true);
        fetchDocumentById(docId, user?.id || '').then(detail => {
          if (detail) {
            // Check for newer offline backup in localStorage
            const offlineKey = `scholarflow.offline_backup.${docId}`;
            const offlineRaw = localStorage.getItem(offlineKey);
            if (offlineRaw) {
              try {
                const offlineData = JSON.parse(offlineRaw);
                const merged = {
                  ...detail,
                  title: offlineData.title || detail.title,
                  content: offlineData.content || detail.content,
                  settings: offlineData.settings || detail.settings,
                };
                setCurrentDocument(merged);
                if (merged.settings?.alignments) {
                  localStorage.setItem('scholarflow.editorjs.alignments.v1', JSON.stringify(merged.settings.alignments));
                }
                lastSavedContentRef.current = JSON.stringify(merged.content || { blocks: [] });
                setSaveStatus('Menggunakan Cadangan Offline');
                
                // Try to sync to cloud if currently online
                if (typeof navigator !== 'undefined' && navigator.onLine) {
                  triggerDebouncedSave(docId, merged.title, merged.content, merged.settings);
                }
                return;
              } catch (e) {
                console.error('Failed to parse offline backup:', e);
              }
            }
            setCurrentDocument(detail);
            if (detail.settings?.alignments) {
              localStorage.setItem('scholarflow.editorjs.alignments.v1', JSON.stringify(detail.settings.alignments));
            }
            lastSavedContentRef.current = JSON.stringify(detail.content || { blocks: [] });
          }
        }).catch(err => {
          console.warn('Failed to sync document from URL path:', err);
          // If offline and fetchDocumentById fails, fallback to offline backup if available
          const offlineKey = `scholarflow.offline_backup.${docId}`;
          const offlineRaw = localStorage.getItem(offlineKey);
          if (offlineRaw) {
            try {
              const offlineData = JSON.parse(offlineRaw);
              const fallbackDoc: DocumentEntry = {
                id: docId,
                user_id: user?.id || '',
                title: offlineData.title || 'Untitled (Offline)',
                content: offlineData.content || { blocks: [] },
                settings: offlineData.settings || {},
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              setCurrentDocument(fallbackDoc);
              if (fallbackDoc.settings?.alignments) {
                localStorage.setItem('scholarflow.editorjs.alignments.v1', JSON.stringify(fallbackDoc.settings.alignments));
              }
              lastSavedContentRef.current = JSON.stringify(fallbackDoc.content || { blocks: [] });
              setSaveStatus(language === 'en' ? 'Sync Failed (Offline)' : 'Gagal Sinkronisasi (Offline)');
            } catch (e) {
              console.error('Failed to parse offline backup on failure fallback:', e);
            }
          }
        }).finally(() => {
          setIsDocLoading(false);
        });
      } else {
        setIsDocLoading(false);
      }
    } else {
      if (currentDocument) {
        setCurrentDocument(null);
      }
      setIsDocLoading(false);
    }
  }, [user?.id, params?.id, currentDocument?.id, triggerDebouncedSave, language]);

  const handleUpdateAIModel = useCallback(async (id: string, updates: Partial<AIModel>) => {
    try {
      const updated = await updateAIModel(id, updates);
      setAiModels((prev) => prev.map(m => m.id === id ? updated : m));
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  const handleCreateAIModel = useCallback(async (model: Omit<AIModel, 'updated_at'>) => {
    try {
      const created = await createAIModel(model);
      setAiModels((prev) => [...prev, created]);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  const handleDeleteAIModel = useCallback(async (id: string) => {
    try {
      await deleteAIModel(id);
      setAiModels((prev) => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  // EditorJS Ref and Stats state
  const editorJsRef = useRef<EditorJsMethods | null>(null);
  const [editorJsStats, setEditorJsStats] = useState({
    wordCount: 0,
    characterCount: 0,
    citationCount: 0
  });
  const [activeReferenceIds, setActiveReferenceIds] = useState<string[]>([]);

  // Cancel pending save on switch or unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [currentDocument?.id]);

  // Prevent closing the tab when save status is "Menyimpan..."
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'Menyimpan...' || saveStatus === 'Saving...') {
        e.preventDefault();
        e.returnValue = ''; // Standard trigger for modern browsers
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveStatus]);

  // Synchronize offline backups when internet comes back online
  useEffect(() => {
    const handleOnline = async () => {
      if (!user?.id) return;
      
      console.log('App is online. Checking for offline backups to sync...');
      setSaveStatus('Menyinkronkan...');
      
      let syncCount = 0;
      let hasError = false;
      const keysToSync: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('scholarflow.offline_backup.')) {
          keysToSync.push(key);
        }
      }
      
      for (const key of keysToSync) {
        const docId = key.replace('scholarflow.offline_backup.', '');
        try {
          const rawData = localStorage.getItem(key);
          if (rawData) {
            const data = JSON.parse(rawData);
            const updates = {
              title: data.title,
              content: data.content,
              ...(data.settings ? { settings: data.settings } : {})
            };
            const res = await updateDocument(docId, user.id, updates);
            if (res.success) {
              localStorage.removeItem(key);
              syncCount++;
            } else {
              hasError = true;
            }
          }
        } catch (e) {
          console.error('Failed to sync offline backup for key:', key, e);
          hasError = true;
        }
      }
      
      if (syncCount > 0) {
        try {
          const list = await fetchDocuments(user.id);
          setDocuments(list);
        } catch (err) {
          console.error('Failed to refresh document list after sync:', err);
        }
      }
      
      if (hasError) {
        setSaveStatus(language === 'en' ? 'Sync Failed' : 'Gagal Sinkronisasi');
      } else {
        setSaveStatus(language === 'en' ? 'Saved to Cloud' : 'Tersimpan ke Cloud');
      }
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [user]);

  // Load documents list from Supabase on start
  useEffect(() => {
    if (!hydrated || !user?.id) return;

    const loadDocs = async () => {
      try {
        const list = await fetchDocuments(user.id);
        setDocuments(list);
        
        // Do not auto-select or auto-create a document.
        // Leave currentDocument as null to show the Dashboard first.
        setCurrentDocument(null);
      } catch (err) {
        console.error('Error loading documents:', err);
      }
    };

    void loadDocs();
  }, [hydrated, user]);

  // Dynamic content renderer on switch
  useEffect(() => {
    if (!currentDocument || !editorJsRef.current) return;
    if (currentDocument.id !== loadedDocumentIdRef.current) {
      loadedDocumentIdRef.current = currentDocument.id;
      const timer = setTimeout(() => {
        if (currentDocument.content) {
          editorJsRef.current?.renderContent(currentDocument.content);
        } else {
          editorJsRef.current?.renderContent({
            time: Date.now(),
            blocks: [
              {
                id: "welcome-block-id",
                type: "header",
                data: {
                  text: currentDocument.title || "Untitled Document",
                  level: 2
                }
              },
              {
                id: "intro-block-id",
                type: "paragraph",
                data: {
                  text: "Mulai menulis draf jurnal akademik Anda di sini..."
                }
              }
            ],
            version: "2.29.0"
          });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentDocument]);

  const handleSelectDocument = useCallback(async (id: string) => {
    if (!id) {
      router.push('/dashboard');
      return;
    }
    if (id === currentDocument?.id) {
      return;
    }
    setIsDocLoading(true);
    router.push(`/editor/${id}`);
  }, [router, currentDocument]);

  const handleCreateDocument = useCallback(async (
    title: string = 'Untitled Document', 
    settings: Partial<DocumentSettings> = {}
  ) => {
    if (!user?.id) return;
    const initialBlocks = getTemplateBlocks(settings.templateId, language, title);

    setIsDocLoading(true);
    try {
      const newDoc = await createDocument(user.id, title, {
        time: Date.now(),
        blocks: initialBlocks,
        version: "2.29.0"
      }, settings);
      if (newDoc) {
        setDocuments((prev) => [newDoc, ...prev]);
        lastSavedContentRef.current = JSON.stringify(newDoc.content || { blocks: [] });
        setCurrentDocument(newDoc);
        setIsSetupModalOpen(false);
        router.push(`/editor/${newDoc.id}`);
      } else {
        setIsDocLoading(false);
      }
    } catch (err) {
      console.error('Error creating document:', err);
      setIsDocLoading(false);
    }
  }, [user, language]);

  const handleDeleteDocument = useCallback(async (id: string) => {
    if (!user?.id) return;
    try {
      const docTitle = documents.find(d => d.id === id)?.title || '';
      const res = await deleteDocument(id, user.id);
      if (res.success) {
        const updatedList = documents.filter((doc) => doc.id !== id);
        setDocuments(updatedList);

        if (currentDocument?.id === id) {
          if (updatedList.length > 0) {
            const detail = await fetchDocumentById(updatedList[0].id, user.id);
            if (detail) {
              setCurrentDocument(detail);
            }
          } else {
            setCurrentDocument(null);
          }
        }
        showToast(
          language === 'en' 
            ? `Document "${docTitle}" has been deleted.` 
            : `Dokumen "${docTitle}" berhasil dihapus.`,
          'success'
        );
      } else {
        showToast(
          language === 'en' 
            ? 'Failed to delete document.' 
            : 'Gagal menghapus dokumen.',
          'error'
        );
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      showToast(
        language === 'en' 
          ? 'Error occurred while deleting document.' 
          : 'Terjadi kesalahan saat menghapus dokumen.',
        'error'
      );
    }
  }, [user, documents, currentDocument, language, showToast]);

  const handleRenameDocument = useCallback((title: string) => {
    if (!currentDocument || !user?.id) return;
    
    const updatedDoc = { ...currentDocument, title };
    setCurrentDocument(updatedDoc);
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === currentDocument.id ? { ...doc, title } : doc))
    );

    triggerDebouncedSave(currentDocument.id, title, currentDocument.content, currentDocument.settings);
  }, [currentDocument, user, triggerDebouncedSave]);

  const handleContentChange = useCallback((content: any) => {
    if (!currentDocument || !user?.id) return;

    // Check if user has reverted the content to the state before application
    if (isApplied && contentBeforeApply) {
      const cleanNew = content?.blocks || [];
      const cleanBefore = contentBeforeApply?.blocks || [];
      if (JSON.stringify(cleanNew) === JSON.stringify(cleanBefore)) {
        setIsApplied(false);
      }
    }

    const updatedDoc = { ...currentDocument, content };
    setCurrentDocument(updatedDoc);

    // Compare content structures to avoid redundant cloud updates on load or rendering
    const contentString = JSON.stringify(content || { blocks: [] });
    if (contentString === lastSavedContentRef.current) {
      return;
    }

    lastSavedContentRef.current = contentString;
    triggerDebouncedSave(currentDocument.id, currentDocument.title, content, currentDocument.settings);
  }, [currentDocument, user, triggerDebouncedSave, isApplied, contentBeforeApply]);

  const folders = useMemo(() => {
    return currentDocument?.settings?.folders || (language === 'en'
      ? ['Introduction', 'Literature Review', 'Methodology', 'Results & Discussion']
      : ['Pendahuluan', 'Tinjauan Pustaka', 'Metodologi', 'Hasil & Diskusi']);
  }, [currentDocument, language]);

  const folderAssignments = useMemo(() => {
    return currentDocument?.settings?.folder_assignments || {};
  }, [currentDocument]);

  const handleCreateFolder = useCallback((folderName: string) => {
    if (!currentDocument) return;
    const currentFolders = currentDocument.settings?.folders || (language === 'en'
      ? ['Introduction', 'Literature Review', 'Methodology', 'Results & Discussion']
      : ['Pendahuluan', 'Tinjauan Pustaka', 'Metodologi', 'Hasil & Diskusi']);
    if (currentFolders.includes(folderName)) return;
    const updatedFolders = [...currentFolders, folderName];
    
    const updatedSettings = { ...currentDocument.settings, folders: updatedFolders };
    const updatedDoc = { ...currentDocument, settings: updatedSettings };
    setCurrentDocument(updatedDoc);
    
    triggerDebouncedSave(currentDocument.id, currentDocument.title, currentDocument.content, updatedSettings);
  }, [currentDocument, triggerDebouncedSave]);

  const handleAssignFolder = useCallback((referenceId: string, folderName: string) => {
    if (!currentDocument) return;
    const currentAssignments = currentDocument.settings?.folder_assignments || {};
    const updatedAssignments = { ...currentAssignments, [referenceId]: folderName };
    
    const updatedSettings = { ...currentDocument.settings, folder_assignments: updatedAssignments };
    const updatedDoc = { ...currentDocument, settings: updatedSettings };
    setCurrentDocument(updatedDoc);
    
    triggerDebouncedSave(currentDocument.id, currentDocument.title, currentDocument.content, updatedSettings);
  }, [currentDocument, triggerDebouncedSave]);

  const handleChangeCitationStyle = useCallback((style: string) => {
    if (!currentDocument) return;
    
    const updatedSettings = { ...currentDocument.settings, citationStyle: style };
    const updatedDoc = { ...currentDocument, settings: updatedSettings };
    setCurrentDocument(updatedDoc);
    
    triggerDebouncedSave(currentDocument.id, currentDocument.title, currentDocument.content, updatedSettings);
  }, [currentDocument, triggerDebouncedSave]);

  const handleChangeDocumentSettings = useCallback((newSettings: DocumentSettings) => {
    if (!currentDocument) return;
    
    const updatedDoc = { ...currentDocument, settings: newSettings };
    setCurrentDocument(updatedDoc);
    
    triggerDebouncedSave(currentDocument.id, currentDocument.title, currentDocument.content, newSettings);
  }, [currentDocument, triggerDebouncedSave]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Load citation library: Supabase (global) + localStorage fallback
  useEffect(() => {
    if (!hydrated) return;

    // 1. Try loading from Supabase global library first
    fetchCitationLibrary().then((supabaseLibrary) => {
      if (Object.keys(supabaseLibrary).length > 0) {
        setCitationLibrary(supabaseLibrary);
        // Sync to localStorage as local cache
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(CITATION_LIBRARY_KEY, JSON.stringify(supabaseLibrary));
        }
        return;
      }

      // 2. Fallback: load from localStorage if Supabase is empty
      if (typeof window === 'undefined') return;
      const stored = window.localStorage.getItem(CITATION_LIBRARY_KEY);
      if (!stored) return;
      try {
        const parsed = JSON.parse(stored) as Record<string, CitationCandidate>;
        setCitationLibrary(parsed);
      } catch {
        window.localStorage.removeItem(CITATION_LIBRARY_KEY);
      }
    });
  }, [hydrated]);

  // Resolving direct PDF url in background when citation modal is opened
  useEffect(() => {
    if (!activeModalCitation) {
      setResolvedPdfUrl(null);
      setIsResolvingPdf(false);
      return;
    }

    const candidate = citationLibrary[activeModalCitation.refId];
    if (!candidate) return;

    // Use existing pdf_url immediately if available
    if (candidate.pdf_url) {
      setResolvedPdfUrl(candidate.pdf_url);
    } else {
      setResolvedPdfUrl(null);
    }

    const targetUrl = candidate.url || (candidate.doi ? `https://doi.org/${candidate.doi}` : null);
    if (!targetUrl) return;

    setIsResolvingPdf(true);
    fetch(`/api/citations/resolve-pdf?url=${encodeURIComponent(targetUrl)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.pdf_url) {
          setResolvedPdfUrl(data.pdf_url);
          // Update local library cache so it resolves instantly next time
          setCitationLibrary((current) => {
            const existing = current[activeModalCitation.refId];
            if (existing && !existing.pdf_url) {
              const updated = {
                ...current,
                [activeModalCitation.refId]: { ...existing, pdf_url: data.pdf_url }
              };
              // Persist to localStorage
              if (typeof window !== 'undefined') {
                window.localStorage.setItem(CITATION_LIBRARY_KEY, JSON.stringify(updated));
              }
              return updated;
            }
            return current;
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsResolvingPdf(false);
      });
  }, [activeModalCitation, citationLibrary]);

  // Translate cited sentence in background when modal is opened for cross-lingual matching
  useEffect(() => {
    if (!activeModalCitation) {
      setTranslatedCitedSentence('');
      setIsTranslating(false);
      return;
    }

    const candidate = citationLibrary[activeModalCitation.refId];
    if (!candidate || !candidate.abstract) {
      setTranslatedCitedSentence(activeModalCitation.citedSentence);
      return;
    }

    const citedText = activeModalCitation.citedSentence;
    const abstractText = candidate.abstract;

    // Heuristic helper to check if text is English
    const detectIsEnglish = (text: string): boolean => {
      const englishWords = new Set(['the', 'of', 'and', 'to', 'for', 'is', 'with', 'that', 'this', 'by', 'in', 'on', 'at']);
      const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
      let englishCount = 0;
      for (const word of words) {
        if (englishWords.has(word)) englishCount++;
      }
      return englishCount / Math.max(words.length, 1) > 0.05 || englishCount >= 2;
    };

    const isAbstractEnglish = detectIsEnglish(abstractText);
    const isQueryEnglish = detectIsEnglish(citedText);

    if (isAbstractEnglish && !isQueryEnglish) {
      setIsTranslating(true);
      fetch(`/api/citations/translate?text=${encodeURIComponent(citedText)}&target=en`)
        .then((res) => res.json())
        .then((data) => {
          setTranslatedCitedSentence(data.translatedText || citedText);
        })
        .catch((err) => {
          console.error('Translation failed:', err);
          setTranslatedCitedSentence(citedText);
        })
        .finally(() => {
          setIsTranslating(false);
        });
    } else if (!isAbstractEnglish && isQueryEnglish) {
      setIsTranslating(true);
      fetch(`/api/citations/translate?text=${encodeURIComponent(citedText)}&target=id`)
        .then((res) => res.json())
        .then((data) => {
          setTranslatedCitedSentence(data.translatedText || citedText);
        })
        .catch((err) => {
          console.error('Translation failed:', err);
          setTranslatedCitedSentence(citedText);
        })
        .finally(() => {
          setIsTranslating(false);
        });
    } else {
      setTranslatedCitedSentence(citedText);
    }
  }, [activeModalCitation, citationLibrary]);

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

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    const storedAiHistory = window.localStorage.getItem(AI_HISTORY_KEY);
    if (!storedAiHistory) return;

    try {
      const parsed = JSON.parse(storedAiHistory) as AiHistoryEntry[];
      setAiHistory(Array.isArray(parsed) ? parsed : []);
    } catch {
      window.localStorage.removeItem(AI_HISTORY_KEY);
    }
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    window.localStorage.setItem(AI_HISTORY_KEY, JSON.stringify(aiHistory));
  }, [aiHistory, hydrated]);

  useEffect(() => {
    return () => {
      if (citationInsertTimeoutRef.current !== null) {
        window.clearTimeout(citationInsertTimeoutRef.current);
      }
    };
  }, []);

  const wordCount = editorJsStats.wordCount;
  const characterCount = editorJsStats.characterCount;
  const citationCount = editorJsStats.citationCount;

  const bibliographyEntries = useMemo(() => {
    const uniqueActiveIds = Array.from(new Set(activeReferenceIds));
    const style = currentDocument?.settings?.citationStyle || 'apa';
    const lang = currentDocument?.settings?.citationLocale || 'en-US';
    
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
  }, [citationLibrary, activeReferenceIds, currentDocument?.settings?.citationStyle, currentDocument?.settings?.citationLocale]);

  // Sync bibliography entries to EditorJS in real-time
  useEffect(() => {
    if (!hydrated) return;
    const entries = bibliographyEntries.map((e) => ({
      label: e.label,
      formatted: e.formatted,
    }));
    const timer = setTimeout(() => {
      editorJsRef.current?.upsertBibliography(entries, activePlanId === 'free');
    }, 100);
    return () => clearTimeout(timer);
  }, [bibliographyEntries, hydrated, activePlanId]);

  const insertCitation = useCallback(() => {
    editorJsRef.current?.insertCitationSearch();
  }, []);

  const insertBibliography = useCallback(() => {
    const text = bibliographyEntries.length > 0
      ? "Bibliography:\n" + bibliographyEntries.map((entry, i) => `${i + 1}. ${entry.formatted}`).join('\n')
      : "Bibliography:\nInsert verified citation candidates first, then generate the bibliography.";
    editorJsRef.current?.insertBibliographyText(text);
  }, [bibliographyEntries]);

  const insertImage = useCallback(
    (url: string) => {
      if (url) editorJsRef.current?.insertImage(url);
    },
    [],
  );

  const insertSampleImage = useCallback(() => {
    insertImage('https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80');
  }, [insertImage]);



  const exportBibliographyText = useCallback(() => {
    if (activePlanId === 'free') {
      setWarningMessage("🔒 Fitur Ekspor Daftar Pustaka (.bib, .ris, .txt, .json) khusus untuk pengguna paket Pro Writer. Silakan upgrade akun Anda di menu Pricing.");
      return;
    }
    downloadFile(
      'scholarflow-bibliography.txt',
      serializeBibliographyText(bibliographyEntries),
      'text/plain;charset=utf-8',
    );
  }, [bibliographyEntries, activePlanId]);

  const exportBibliographyJson = useCallback(() => {
    if (activePlanId === 'free') {
      setWarningMessage("🔒 Fitur Ekspor Daftar Pustaka (.bib, .ris, .txt, .json) khusus untuk pengguna paket Pro Writer. Silakan upgrade akun Anda di menu Pricing.");
      return;
    }
    downloadFile(
      'scholarflow-bibliography.json',
      JSON.stringify(bibliographyEntries, null, 2),
      'application/json;charset=utf-8',
    );
  }, [bibliographyEntries, activePlanId]);

  const exportBibliographyBibtex = useCallback(() => {
    if (activePlanId === 'free') {
      setWarningMessage("🔒 Fitur Ekspor Daftar Pustaka (.bib, .ris, .txt, .json) khusus untuk pengguna paket Pro Writer. Silakan upgrade akun Anda di menu Pricing.");
      return;
    }
    const uniqueActiveIds = Array.from(new Set(activeReferenceIds));
    let bibtexContent = '';
    uniqueActiveIds.forEach((id) => {
      const candidate = citationLibrary[id];
      if (!candidate) return;
      const key = candidate.citation_label.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
      const authors = candidate.authors.join(' and ');
      
      bibtexContent += `@article{${key},\n`;
      bibtexContent += `  author = {${authors}},\n`;
      bibtexContent += `  title = {${candidate.title}},\n`;
      bibtexContent += `  journal = {${candidate.source}},\n`;
      if (candidate.year) bibtexContent += `  year = {${candidate.year}},\n`;
      if (candidate.doi) bibtexContent += `  doi = {${candidate.doi}},\n`;
      if (candidate.url) bibtexContent += `  url = {${candidate.url}},\n`;
      bibtexContent += `}\n\n`;
    });
    
    downloadFile(
      'scholarflow-bibliography.bib',
      bibtexContent || '% No bibliography entries available.',
      'text/plain;charset=utf-8',
    );
  }, [citationLibrary, activeReferenceIds, activePlanId]);

  const exportBibliographyRis = useCallback(() => {
    if (activePlanId === 'free') {
      setWarningMessage("🔒 Fitur Ekspor Daftar Pustaka (.bib, .ris, .txt, .json) khusus untuk pengguna paket Pro Writer. Silakan upgrade akun Anda di menu Pricing.");
      return;
    }
    const uniqueActiveIds = Array.from(new Set(activeReferenceIds));
    let risContent = '';
    uniqueActiveIds.forEach((id) => {
      const candidate = citationLibrary[id];
      if (!candidate) return;
      risContent += `TY  - JOUR\n`;
      candidate.authors.forEach((author) => {
        risContent += `AU  - ${author}\n`;
      });
      risContent += `TI  - ${candidate.title}\n`;
      risContent += `JO  - ${candidate.source}\n`;
      if (candidate.year) risContent += `PY  - ${candidate.year}\n`;
      if (candidate.url) risContent += `UR  - ${candidate.url}\n`;
      if (candidate.doi) risContent += `DO  - ${candidate.doi}\n`;
      risContent += `ER  - \n\n`;
    });
    
    downloadFile(
      'scholarflow-bibliography.ris',
      risContent || '% No bibliography entries available.',
      'text/plain;charset=utf-8',
    );
  }, [citationLibrary, activeReferenceIds, activePlanId]);

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

  const handleSynthesizeReview = useCallback(async () => {
    const uniqueActiveIds = Array.from(new Set(activeReferenceIds));
    if (uniqueActiveIds.length === 0) return;
    
    setIsSynthesizing(true);
    setSynthesizeError(null);
    setSynthesizedText(null);
    setSynthesizeDisclaimer(null);
    
    try {
      const referencesData = uniqueActiveIds
        .map(id => {
          const candidate = citationLibrary[id];
          if (!candidate) return null;
          return {
            title: candidate.title,
            authors: candidate.authors,
            year: candidate.year,
            source: candidate.source,
            label: candidate.citation_label
          };
        })
        .filter(Boolean);
        
      const response = await synthesizeLiteratureReview(referencesData as any[], selectedAiModel, language);
      setSynthesizedText(response.synthesized_text);
      if (response.disclaimer) {
        setSynthesizeDisclaimer(response.disclaimer);
      }
    } catch (error: any) {
      setSynthesizeError(error.message || (language === 'en' ? 'Failed to synthesize literature review.' : 'Gagal mensintesis tinjauan pustaka.'));
    } finally {
      setIsSynthesizing(false);
    }
  }, [citationLibrary, activeReferenceIds, selectedAiModel, language]);

  const handleInsertSynthesizedText = useCallback((text: string) => {
    editorJsRef.current?.insertText(text);
    setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const statusLabel = saveStatus;

  const runImproveWriting = useCallback(async () => {
    if (!selectedText.trim()) return;

    setIsImproving(true);
    setAiError(null);

    try {
      const response = await improveWriting(selectedText, selectedAiTone, selectedAiModel, language);
      setImprovedResult(response);
      setContentBeforeApply(currentDocument?.content);
      setIsApplied(false);
      setAiHistory((current) =>
        addAiHistoryEntry(current, {
          id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
          originalText: selectedText,
          improvedText: response.improved_text,
          tone: selectedAiTone,
          model: selectedAiModel,
          savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to contact AI backend.';
      setAiError(message);
      setImprovedResult(null);
    } finally {
      setIsImproving(false);
    }
  }, [selectedText, selectedAiModel, selectedAiTone, setAiHistory, currentDocument, language]);

  const runParaphrase = useCallback(async () => {
    if (!selectedText.trim()) return;

    setIsImproving(true);
    setAiError(null);

    try {
      const response = await improveWriting(selectedText, 'paraphrase', selectedAiModel, language);
      setImprovedResult(response);
      setContentBeforeApply(currentDocument?.content);
      setIsApplied(false);
      setAiHistory((current) =>
        addAiHistoryEntry(current, {
          id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
          originalText: selectedText,
          improvedText: response.improved_text,
          tone: 'paraphrase',
          model: selectedAiModel,
          savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to contact AI backend.';
      setAiError(message);
      setImprovedResult(null);
    } finally {
      setIsImproving(false);
    }
  }, [selectedText, selectedAiModel, setAiHistory, currentDocument, language]);

  const runSummarize = useCallback(async () => {
    if (!selectedText.trim()) return;

    setIsImproving(true);
    setAiError(null);

    try {
      const response = await improveWriting(selectedText, 'summarize', selectedAiModel, language);
      setImprovedResult(response);
      setContentBeforeApply(currentDocument?.content);
      setIsApplied(false);
      setAiHistory((current) =>
        addAiHistoryEntry(current, {
          id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
          originalText: selectedText,
          improvedText: response.improved_text,
          tone: 'summarize',
          model: selectedAiModel,
          savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to contact AI backend.';
      setAiError(message);
      setImprovedResult(null);
    } finally {
      setIsImproving(false);
    }
  }, [selectedText, selectedAiModel, setAiHistory, currentDocument, language]);

  const runGenerateAbstract = useCallback(async () => {
    setIsImproving(true);
    setAiError(null);

    try {
      const fullText = extractTextFromContent(currentDocument?.content);
      if (!fullText.trim()) {
        throw new Error(language === 'en' ? 'Document is empty. Please write some content before generating abstract.' : 'Dokumen kosong. Silakan tulis isi dokumen sebelum membuat abstrak.');
      }
      const response = await generateAbstract(fullText, selectedAiModel, language);
      setImprovedResult({
        original_text: 'Document Context',
        improved_text: response.abstract_text,
        tone: 'academic',
        disclaimer: response.disclaimer || 'Abstract generated based on document context.'
      });
      setContentBeforeApply(currentDocument?.content);
      setIsApplied(false);
      setAiHistory((current) =>
        addAiHistoryEntry(current, {
          id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
          originalText: 'Document Context',
          improvedText: response.abstract_text,
          tone: 'abstract',
          model: selectedAiModel,
          savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to contact AI backend.';
      setAiError(message);
      setImprovedResult(null);
    } finally {
      setIsImproving(false);
    }
  }, [currentDocument, selectedAiModel, setAiHistory, language]);

  const handleParafrasePlagiat = useCallback(async (sentence: string) => {
    setSelectedText(sentence);
    setIsImproving(true);
    setAiError(null);

    try {
      const response = await improveWriting(sentence, selectedAiTone, selectedAiModel, language);
      setImprovedResult(response);
      setContentBeforeApply(currentDocument?.content);
      setIsApplied(false);
      setAiHistory((current) =>
        addAiHistoryEntry(current, {
          id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
          originalText: sentence,
          improvedText: response.improved_text,
          tone: selectedAiTone,
          model: selectedAiModel,
          savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to contact AI backend.';
      setAiError(message);
      setImprovedResult(null);
    } finally {
      setIsImproving(false);
    }
  }, [selectedAiModel, selectedAiTone, setAiHistory, currentDocument, language]);

  const applyImprovedText = useCallback(() => {
    if (!improvedResult) return;
    setContentBeforeApply(currentDocument?.content);
    editorJsRef.current?.insertText(improvedResult.improved_text);
    setIsApplied(true);
    setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [improvedResult, currentDocument]);

  const runCitationSearchForQuery = useCallback(async (query: string) => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return;

    setIsSearchingCitations(true);
    setCitationError(null);
    setCitationNote(null);
    setAiError(null);

    try {
      const response = await searchCitations(normalizedQuery, 15);
      
      // Apply active document setup filters to search results
      let filtered = response.results;
      if (currentDocument?.settings) {
        const settings = currentDocument.settings;

        // 1. Filter by Publish Year
        if (settings.publishYear === '5_years') {
          const currentYear = new Date().getFullYear();
          filtered = filtered.filter(
            (c) => c.year !== null && c.year >= currentYear - 5
          );
        } else if (settings.publishYear === 'custom') {
          const start = settings.publishYearStart ?? 0;
          const end = settings.publishYearEnd ?? new Date().getFullYear();
          filtered = filtered.filter(
            (c) => c.year !== null && c.year >= start && c.year <= end
          );
        }

        // 2. Filter by Impact Factor (approximated by citation count ranking)
        if (settings.impactFactor === '0.25+') {
          filtered = filtered.filter((c) => c.cited_by_count >= 2);
        } else if (settings.impactFactor === '3+') {
          filtered = filtered.filter((c) => c.cited_by_count >= 20);
        } else if (settings.impactFactor === '10+') {
          filtered = filtered.filter((c) => c.cited_by_count >= 100);
        }

        // 3. Filter by Limit Collection
        if (settings.limitCollection === 'journals') {
          filtered = filtered.filter(
            (c) => c.journal !== null && c.journal.trim() !== ''
          );
        } else if (settings.limitCollection === 'proceedings') {
          filtered = filtered.filter(
            (c) => c.journal === null || !c.journal.toLowerCase().includes('journal')
          );
        }
      }

      setCitationResults(filtered);
      setCitationNote(response.note);
      setCitationHistory((current) =>
        addCitationHistoryEntry(current, {
          query: normalizedQuery,
          resultCount: filtered.length,
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
  }, [currentDocument]);

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

  const deleteAiHistoryEntry = useCallback((id: string) => {
    setAiHistory((current) => current.filter((item) => item.id !== id));
  }, []);

  const clearAiHistory = useCallback(() => {
    setAiHistory([]);
  }, []);

  const insertCitationCandidate = useCallback(
    (candidate: CitationCandidate, skipEditorInsert = false) => {
      // 1. Selalu sisipkan label sitasi secara inline dengan referenceId jika tidak di-skip
      if (!skipEditorInsert) {
        editorJsRef.current?.insertCitation(candidate.citation_label, candidate.reference_id);
      }

      // 2. Perbarui state library
      setCitationLibrary((current) => {
        if (current[candidate.reference_id]) return current;
        return { ...current, [candidate.reference_id]: candidate };
      });

      // 4. Simpan ke Supabase global library (fire & forget)
      if (user?.id) {
        saveCitationToLibrary(candidate, user.id).catch(() => {});
      }
    },
    [user],
  );
  const isUrlDocLoading = params?.id && !currentDocument;
  if (isUrlDocLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          <span className="text-sm text-slate-400 font-medium">Loading Document...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <EditorLayout
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
        onParaphrase={runParaphrase}
        onSummarize={runSummarize}
        onGenerateAbstract={runGenerateAbstract}
        onFindCitation={runCitationSearch}
        onRepeatCitationSearch={repeatCitationSearch}
        onInsertCitation={insertCitation}
        onInsertBibliography={insertBibliography}
        onInsertImageSample={insertSampleImage}
        onExportBibliographyText={exportBibliographyText}
        onExportBibliographyJson={exportBibliographyJson}
        onExportBibliographyBibtex={exportBibliographyBibtex}
        onExportBibliographyRis={exportBibliographyRis}
        onInsertCitationCandidate={insertCitationCandidate}
        statusLabel={statusLabel}
        onSelectionChange={setSelectedText}
        documents={documents}
        currentDocument={currentDocument}
        onSelectDocument={handleSelectDocument}
        onCreateDocument={() => setIsSetupModalOpen(true)}
        onDeleteDocument={handleDeleteDocument}
        onRenameDocument={handleRenameDocument}
        onContentChange={handleContentChange}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onAlignmentChange={(align: string) => {
          if (!currentDocument) return;
          try {
            const alignments = JSON.parse(localStorage.getItem('scholarflow.editorjs.alignments.v1') || '{}');
            const updatedSettings = {
              ...currentDocument.settings,
              alignments
            };
            const updatedDoc = {
              ...currentDocument,
              settings: updatedSettings
            };
            setCurrentDocument(updatedDoc);
            triggerDebouncedSave(currentDocument.id, currentDocument.title, currentDocument.content, updatedSettings);
          } catch (e) {
            console.error('Error saving alignment change:', e);
          }
        }}
        onStatsChange={(stats: any) => {
          setEditorJsStats(stats);
          if (stats.activeReferenceIds) {
            setActiveReferenceIds((prev) => {
              const isSame =
                prev.length === stats.activeReferenceIds.length &&
                prev.every((id, idx) => id === stats.activeReferenceIds[idx]);
              return isSame ? prev : stats.activeReferenceIds;
            });
          }
        }}
        editorJsRef={editorJsRef}
        onCiteClick={(refId, label, citedSentence) => {
          setActiveModalCitation({ refId, label, citedSentence });
        }}
        activePdfUrl={activePdfUrl}
        activePdfSearchTerm={activePdfSearchTerm}
        onClosePdf={() => {
          setActivePdfUrl(null);
          setActivePdfSearchTerm('');
        }}
        selectedAiModel={selectedAiModel}
        setSelectedAiModel={setSelectedAiModel}
        selectedAiTone={selectedAiTone}
        setSelectedAiTone={setSelectedAiTone}
        aiModels={aiModels}
        onUpdateAIModel={handleUpdateAIModel}
        onCreateAIModel={handleCreateAIModel}
        onDeleteAIModel={handleDeleteAIModel}
        onParafrasePlagiat={handleParafrasePlagiat}
        isSynthesizing={isSynthesizing}
        synthesizedText={synthesizedText}
        synthesizeError={synthesizeError}
        synthesizeDisclaimer={synthesizeDisclaimer}
        onSynthesizeReview={handleSynthesizeReview}
        onInsertSynthesizedText={handleInsertSynthesizedText}
        citationStyle={currentDocument?.settings?.citationStyle || 'apa'}
        onChangeCitationStyle={handleChangeCitationStyle}
        folders={folders}
        folderAssignments={folderAssignments}
        onCreateFolder={handleCreateFolder}
        onAssignFolder={handleAssignFolder}
        aiHistory={aiHistory}
        onDeleteAiHistoryEntry={deleteAiHistoryEntry}
        onClearAiHistory={clearAiHistory}
        isApplied={isApplied}
        onSaveSettings={handleChangeDocumentSettings}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onNotificationClick={handleNotificationClick}
        comments={comments}
        activeUsers={activeUsers}
        onResolveComment={handleResolveComment}
        onCommentClick={handleCommentClick}
        activeSidebarTab={activeSidebarTab}
      />

      {/* Citation Details Modal */}
      {activeModalCitation && (() => {
        const candidate = citationLibrary[activeModalCitation.refId];
        const citedSentence = activeModalCitation.citedSentence;
        return (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col transform transition-all scale-100">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                  <h3 className="text-sm font-bold text-slate-800">Detail Sitasi Jurnal</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModalCitation(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition"
                  aria-label="Tutup"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
                {candidate ? (
                  <>
                    {/* Title */}
                    <div className="flex flex-col gap-1">
                      <h4 className="text-base font-bold text-slate-800 leading-snug">
                        {candidate.title}
                      </h4>
                      <p className="text-xs font-semibold text-slate-505 mt-1">
                        {candidate.authors.join(', ')}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {candidate.journal ? `${candidate.journal} · ` : ''}{candidate.year || 'N/A'} · Source: {candidate.source}
                      </p>
                    </div>

                    {/* Cited claim in the editor */}
                    {citedSentence && (
                      <div className="bg-slate-50 border-l-4 border-indigo-500 p-4 rounded-r-xl text-slate-650">
                        <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1.5 flex items-center gap-1">
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 2v4c0 1.25.75 2 2 2h4c0 2.5-1.75 4.5-4 5v2m14 3c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-4c-1.25 0-2 .75-2 2v4c0 1.25.75 2 2 2h4c0 2.5-1.75 4.5-4 5v2"></path>
                          </svg>
                          Klaim/Pernyataan Anda:
                        </span>
                        <p className="italic font-medium text-xs text-slate-600">"{citedSentence}"</p>
                      </div>
                    )}                    {/* Matched text in Journal */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kutipan Terkait dari Jurnal (Matching Snippet):</span>
                      <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/80 text-xs leading-relaxed text-indigo-950 font-medium italic min-h-[4rem] flex items-center justify-center">
                        {isTranslating ? (
                          <span className="text-[11px] text-slate-400 font-medium animate-pulse flex items-center gap-1.5 justify-center py-2 w-full">
                            <svg className="animate-spin h-3.5 w-3.5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Menerjemahkan & mencocokkan kutipan lintas bahasa...
                          </span>
                        ) : (
                          `"${findMostRelevantSentence(candidate.abstract, translatedCitedSentence || citedSentence || '')}"`
                        )}
                      </div>
                    </div>

                    {/* Full Abstract with Highlight */}
                    {candidate.abstract && (
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Abstrak Lengkap Jurnal:</span>
                        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                          <HighlightedAbstract abstract={candidate.abstract} query={translatedCitedSentence || citedSentence || ''} />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Informasi detail sitasi tidak ditemukan di pustaka lokal.
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModalCitation(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Tutup
                </button>
                {isResolvingPdf && !resolvedPdfUrl && (
                  <span className="text-[10px] text-slate-400 font-medium animate-pulse mr-2 flex items-center gap-1.5">
                    <svg className="animate-spin h-3.5 w-3.5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mencari PDF...
                  </span>
                )}
                {resolvedPdfUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      const relevantSentence = findMostRelevantSentence(candidate?.abstract, translatedCitedSentence || citedSentence || '');
                      const rawSearchTerm = relevantSentence || citedSentence || '';
                      
                      // Clean brackets and quotes, and limit to first 25 words to avoid PDF line wrap issues
                      let cleanSentence = rawSearchTerm
                        .replace(/[\[\]"']/g, "")
                        .replace(/\s+/g, " ")
                        .trim();
                      
                      const words = cleanSentence.split(" ");
                      if (words.length > 25) {
                        cleanSentence = words.slice(0, 25).join(" ");
                      }
                      
                      setActivePdfUrl(resolvedPdfUrl);
                      setActivePdfSearchTerm(cleanSentence);
                      setActiveModalCitation(null);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-semibold shadow-sm transition animate-fade-in"
                  >
                    Buka PDF di Sidebar
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="9" y1="3" x2="9" y2="21"></line>
                    </svg>
                  </button>
                )}
                {candidate?.url && (
                  <button
                    type="button"
                    onClick={() => window.open(candidate.url!, '_blank', 'noopener,noreferrer')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-semibold shadow-sm transition"
                  >
                    Buka Web Jurnal
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
      <DocumentSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onSubmit={handleCreateDocument}
        documents={documents}
        activePlanId={activePlanId}
        onUpgrade={() => setIsPricingOpen(true)}
      />
      {currentDocument && (
        <DocumentSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          settings={currentDocument.settings}
          onSave={handleChangeDocumentSettings}
          activePlanId={activePlanId}
        />
      )}

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />

      <LimitWarningModal
        isOpen={!!warningMessage}
        onClose={() => setWarningMessage(null)}
        onUpgrade={() => setIsPricingOpen(true)}
        message={warningMessage || ''}
      />

      {isDocLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/35 backdrop-blur-md transition-all duration-300 animate-fade-in">
          <div className="bg-white border border-slate-100/80 p-7 rounded-2xl shadow-2xl flex flex-col items-center gap-4 max-w-[240px] text-center">
            <div className="relative flex items-center justify-center h-12 w-12">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-50" />
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin" />
              <IconSparkles className="h-5 w-5 text-indigo-600 animate-pulse" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-800">
                {language === 'en' ? 'Processing Document...' : 'Memproses Dokumen...'}
              </span>
              <span className="text-[10px] text-slate-400 leading-normal">
                {language === 'en' ? 'Preparing your academic workspace' : 'Menyiapkan ruang kerja akademik Anda'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[10200] flex items-center gap-3 bg-white/95 border border-slate-100 p-4 rounded-xl shadow-xl animate-slide-up max-w-sm font-sans">
          <div className={`p-2 rounded-lg ${
            toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
            toastMessage.type === 'error' ? 'bg-red-50 text-red-600' :
            'bg-blue-50 text-blue-600'
          }`}>
            {toastMessage.type === 'success' && <IconCheck className="h-4.5 w-4.5" />}
            {toastMessage.type === 'error' && <IconAlertCircle className="h-4.5 w-4.5" />}
            {toastMessage.type === 'info' && <IconInfoCircle className="h-4.5 w-4.5" />}
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[11px] font-bold text-slate-800">
              {toastMessage.type === 'success' ? (language === 'en' ? 'Success' : 'Berhasil') :
               toastMessage.type === 'error' ? (language === 'en' ? 'Error' : 'Gagal') :
               (language === 'en' ? 'Info' : 'Informasi')}
            </span>
            <p className="text-[10px] text-slate-500 font-medium leading-tight truncate max-w-[200px]">
              {toastMessage.text}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
