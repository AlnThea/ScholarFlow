import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { useLanguage } from '@/components/i18n/language-context';
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
import { getTemplateBlocks } from '@/lib/templates';
import { getContentComparisonString } from '@/lib/editor/editor-utils';

export function useEditorDocument(showToast: (msg: string, type: 'success' | 'error' | 'info') => void, hydrated: boolean) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();

  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [currentDocument, setCurrentDocument] = useState<DocumentEntry | null>(null);
  const [isDocLoading, setIsDocLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>(language === 'en' ? 'Saved to Cloud' : 'Tersimpan ke Cloud');
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadedDocumentIdRef = useRef<string | null>(null);
  const lastSavedContentRef = useRef<string>('');

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
                lastSavedContentRef.current = getContentComparisonString(merged.content);
                setSaveStatus('Menggunakan Cadangan Offline');
                
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
            lastSavedContentRef.current = getContentComparisonString(detail.content);
          }
        }).catch(err => {
          console.warn('Failed to sync document from URL path:', err);
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
              lastSavedContentRef.current = getContentComparisonString(fallbackDoc.content);
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

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [currentDocument?.id]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'Menyimpan...' || saveStatus === 'Saving...') {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveStatus]);

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
  }, [user, language]);

  useEffect(() => {
    if (!hydrated || !user?.id) return;

    const loadDocs = async () => {
      try {
        const list = await fetchDocuments(user.id);
        setDocuments(list);
        setCurrentDocument(null);
      } catch (err) {
        console.error('Error loading documents:', err);
      }
    };

    void loadDocs();
  }, [hydrated, user]);

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
        lastSavedContentRef.current = getContentComparisonString(newDoc.content);
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
  }, [user, language, router]);

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
  }, [currentDocument, triggerDebouncedSave, language]);

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

  return {
    documents,
    currentDocument,
    setCurrentDocument,
    isDocLoading,
    saveStatus,
    isSetupModalOpen,
    setIsSetupModalOpen,
    loadedDocumentIdRef,
    lastSavedContentRef,
    triggerDebouncedSave,
    handleSelectDocument,
    handleCreateDocument,
    handleDeleteDocument,
    handleRenameDocument,
    handleCreateFolder,
    handleAssignFolder,
    handleChangeCitationStyle,
    handleChangeDocumentSettings
  };
}
