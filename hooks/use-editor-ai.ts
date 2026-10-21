import { useCallback, useEffect, useState } from 'react';
import { improveWriting, type ImproveWritingResponse, synthesizeLiteratureReview, generateAbstract, fetchCloudAiHistory, deleteCloudAiHistory } from '@/lib/api/ai';
import { fetchAIModels, updateAIModel, createAIModel, deleteAIModel, type AIModel, fetchAIProviders, createAIProvider, updateAIProvider, deleteAIProvider, type AIProvider } from '@/lib/api/ai-models';
import { addAiHistoryEntry, loadAiHistory, saveAiHistory, mergeAiHistories, type AiHistoryEntry } from '@/lib/editor/ai-history';
import { extractTextFromContent } from '@/lib/editor/editor-utils';
import { useAuth } from '@/components/auth/auth-provider';
import { getLocalQuotaState, saveLocalQuotaState } from '@/lib/ai/token-quota';

export function useEditorAi(
  language: string,
  currentDocument: any,
  citationLibrary: any,
  activeReferenceIds: string[],
  setActiveSidebarTab: (tab: 'writing' | 'library' | 'document' | 'comments' | undefined) => void,
  editorJsRef: any,
  setContentBeforeApply: (content: any) => void,
  setIsApplied: (val: boolean) => void,
  setSavedAt: (val: string) => void,
  hydrated: boolean,
  externalSelectedText?: string,
  externalSetSelectedText?: (text: string) => void
) {
  const { user, profile, refreshProfile } = useAuth();
  const [tokensUsed, setTokensUsed] = useState<number>(0);
  const [monthlyQuota, setMonthlyQuota] = useState<number>(50000);
  const [isTokenQuotaModalOpen, setIsTokenQuotaModalOpen] = useState(false);

  const updateQuotaState = useCallback((used?: number, limit?: number) => {
    if (typeof used === 'number') {
      setTokensUsed(used);
      if (typeof limit === 'number') {
        setMonthlyQuota(limit);
        saveLocalQuotaState(used, limit);
      }
      refreshProfile?.();
    }
  }, [refreshProfile]);

  const [internalSelectedText, setInternalSelectedText] = useState('');
  const selectedText = externalSelectedText !== undefined ? externalSelectedText : internalSelectedText;
  const setSelectedText = externalSetSelectedText || setInternalSelectedText;
  const [improvedResult, setImprovedResult] = useState<ImproveWritingResponse | null>(null);
  const [selectedAiModel, setSelectedAiModel] = useState('gemini');
  const [selectedAiTone, setSelectedAiTone] = useState('academic');
  
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [aiProviders, setAiProviders] = useState<AIProvider[]>([]);
  
  const [aiHistory, setAiHistory] = useState<AiHistoryEntry[]>([]);
  
  // Hydrate AI History from localStorage and Cloud Supabase on client mount / user login
  useEffect(() => {
    const saved = loadAiHistory();
    if (saved && saved.length > 0) {
      setAiHistory(saved);
    }

    if (user?.id) {
      fetchCloudAiHistory(user.id).then((cloudRecords) => {
        if (cloudRecords && cloudRecords.length > 0) {
          setAiHistory((current) => mergeAiHistories(current, cloudRecords));
        }
      }).catch((err) => {
        console.warn('[useEditorAi] Cloud AI history fetch ignored:', err);
      });
    }
  }, [user?.id]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isImproving, setIsImproving] = useState(false);
  
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesizedText, setSynthesizedText] = useState<string | null>(null);
  const [synthesizeError, setSynthesizeError] = useState<string | null>(null);
  const [synthesizeDisclaimer, setSynthesizeDisclaimer] = useState<string | null>(null);

  // Browser safety guard: prevent accidental tab close / page refresh while AI is generating
  useEffect(() => {
    if (!isImproving && !isSynthesizing) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isImproving, isSynthesizing]);

  // Reactive cross-component token quota synchronization
  useEffect(() => {
    const handleTokensUpdated = (e: any) => {
      if (typeof e.detail?.tokensUsed === 'number') {
        setTokensUsed(e.detail.tokensUsed);
      }
      if (typeof e.detail?.monthlyQuota === 'number') {
        setMonthlyQuota(e.detail.monthlyQuota);
      }
      refreshProfile?.();
    };

    window.addEventListener('scholarflow:tokens-updated', handleTokensUpdated);
    return () => {
      window.removeEventListener('scholarflow:tokens-updated', handleTokensUpdated);
    };
  }, [refreshProfile]);

  useEffect(() => {
    if (profile) {
      setTokensUsed(typeof profile.ai_tokens_used === 'number' ? profile.ai_tokens_used : 0);
      setMonthlyQuota(typeof profile.ai_monthly_quota === 'number' ? profile.ai_monthly_quota : (profile.subscription_plan === 'pro' ? 1000000 : 50000));
    } else {
      const local = getLocalQuotaState('free');
      setTokensUsed(local.used);
      setMonthlyQuota(local.limit);
    }
  }, [profile]);

  useEffect(() => {
    fetchAIModels().then(data => {
      setAiModels(data);
    }).catch(err => {
      console.error("Failed to load AI models:", err);
    });
    fetchAIProviders().then(data => {
      setAiProviders(data);
    }).catch(err => {
      console.error("Failed to load AI providers:", err);
    });
  }, []);

  const handleUpdateAIModel = useCallback(async (id: string, updates: Partial<AIModel>) => {
    try {
      const updated = await updateAIModel(id, updates);
      setAiModels((prev) => prev.map(m => m.id === id ? (updated || { ...m, ...updates }) : m));
    } catch (err) {
      console.warn('AI Model DB update failed, using local state:', err);
      setAiModels((prev) => prev.map(m => m.id === id ? { ...m, ...updates, updated_at: new Date().toISOString() } : m));
    }
  }, []);

  const handleCreateAIModel = useCallback(async (model: Omit<AIModel, 'updated_at'>) => {
    try {
      const created = await createAIModel(model);
      setAiModels((prev) => [...prev, created || { ...model, updated_at: new Date().toISOString() }]);
    } catch (err) {
      console.warn('AI Model DB create failed, using local state:', err);
      setAiModels((prev) => [...prev, { ...model, updated_at: new Date().toISOString() }]);
    }
  }, []);

  const handleDeleteAIModel = useCallback(async (id: string) => {
    try {
      await deleteAIModel(id);
      setAiModels((prev) => prev.filter(m => m.id !== id));
    } catch (err) {
      console.warn('AI Model DB delete failed, using local state:', err);
      setAiModels((prev) => prev.filter(m => m.id !== id));
    }
  }, []);

  const handleUpdateAIProvider = useCallback(async (id: string, updates: Partial<AIProvider>) => {
    try {
      const updated = await updateAIProvider(id, updates);
      setAiProviders((prev) => prev.map(p => p.id === id ? (updated || { ...p, ...updates }) : p));
    } catch (err) {
      console.warn('AI Provider DB update failed, using local state:', err);
      setAiProviders((prev) => prev.map(p => p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p));
    }
  }, []);

  const handleCreateAIProvider = useCallback(async (provider: Omit<AIProvider, 'updated_at'>) => {
    try {
      const created = await createAIProvider(provider);
      setAiProviders((prev) => [...prev, created || { ...provider, updated_at: new Date().toISOString() }]);
    } catch (err) {
      console.warn('AI Provider DB create failed, using local state:', err);
      setAiProviders((prev) => [...prev, { ...provider, updated_at: new Date().toISOString() }]);
    }
  }, []);

  const handleDeleteAIProvider = useCallback(async (id: string) => {
    try {
      await deleteAIProvider(id);
      setAiProviders((prev) => prev.filter(p => p.id !== id));
    } catch (err) {
      console.warn('AI Provider DB delete failed, using local state:', err);
      setAiProviders((prev) => prev.filter(p => p.id !== id));
    }
  }, []);

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
        
      const response = await synthesizeLiteratureReview(
        referencesData as any[],
        selectedAiModel,
        language,
        user?.id,
        profile?.subscription_plan || 'free'
      );
      setSynthesizedText(response.synthesized_text);
      if (response.disclaimer) {
        setSynthesizeDisclaimer(response.disclaimer);
      }
      updateQuotaState(response.tokens_used, response.monthly_quota);

      const refSummary = (referencesData as any[]).map((r: any) => `[${r.label || 'Ref'}] ${r.title}`).join('; ');
      setAiHistory((current) =>
        addAiHistoryEntry(current, {
          id: (response as any).generation_id || (Math.random().toString(36).substring(2, 9) + Date.now().toString(36)),
          originalText: refSummary || (language === 'en' ? 'Synthesized Literature Review' : 'Sintesis Tinjauan Pustaka'),
          improvedText: response.synthesized_text,
          tone: 'synthesis',
          model: selectedAiModel,
          savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: (response as any).generation_id ? 'cloud' : 'local',
        })
      );
    } catch (error: any) {
      const message = error.message || (language === 'en' ? 'Failed to synthesize literature review.' : 'Gagal mensintesis tinjauan pustaka.');
      if (message.toLowerCase().includes('quota') || message.toLowerCase().includes('kuota')) {
        setIsTokenQuotaModalOpen(true);
      }
      setSynthesizeError(message);
    } finally {
      setIsSynthesizing(false);
    }
  }, [citationLibrary, activeReferenceIds, selectedAiModel, language, user, profile, updateQuotaState]);

  const runImproveWriting = useCallback(async () => {
    if (!selectedText.trim()) return;

    setActiveSidebarTab('writing');
    setIsImproving(true);
    setAiError(null);

    try {
      const response = await improveWriting(selectedText, selectedAiTone, selectedAiModel, language, undefined, user?.id, profile?.subscription_plan || 'free');
      updateQuotaState(response.tokens_used, response.monthly_quota);
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
      if (message.toLowerCase().includes('quota') || message.toLowerCase().includes('kuota')) {
        setIsTokenQuotaModalOpen(true);
      }
      setAiError(message);
      setImprovedResult(null);
    } finally {
      setIsImproving(false);
    }
  }, [selectedText, selectedAiModel, selectedAiTone, currentDocument, language, setActiveSidebarTab, setContentBeforeApply, setIsApplied, user, profile, updateQuotaState]);

  const runParaphrase = useCallback(async () => {
    if (!selectedText.trim()) return;

    setActiveSidebarTab('writing');
    setIsImproving(true);
    setAiError(null);

    try {
      const response = await improveWriting(selectedText, 'paraphrase', selectedAiModel, language, undefined, user?.id, profile?.subscription_plan || 'free');
      updateQuotaState(response.tokens_used, response.monthly_quota);
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
      if (message.toLowerCase().includes('quota') || message.toLowerCase().includes('kuota')) {
        setIsTokenQuotaModalOpen(true);
      }
      setAiError(message);
      setImprovedResult(null);
    } finally {
      setIsImproving(false);
    }
  }, [selectedText, selectedAiModel, currentDocument, language, setActiveSidebarTab, setContentBeforeApply, setIsApplied, user, profile, updateQuotaState]);

  const runSummarize = useCallback(async () => {
    if (!selectedText.trim()) return;

    setActiveSidebarTab('writing');
    setIsImproving(true);
    setAiError(null);

    try {
      const response = await improveWriting(selectedText, 'summarize', selectedAiModel, language, undefined, user?.id, profile?.subscription_plan || 'free');
      updateQuotaState(response.tokens_used, response.monthly_quota);
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
      if (message.toLowerCase().includes('quota') || message.toLowerCase().includes('kuota')) {
        setIsTokenQuotaModalOpen(true);
      }
      setAiError(message);
      setImprovedResult(null);
    } finally {
      setIsImproving(false);
    }
  }, [selectedText, selectedAiModel, currentDocument, language, setActiveSidebarTab, setContentBeforeApply, setIsApplied, user, profile, updateQuotaState]);

  const runGenerateAbstract = useCallback(async () => {
    setActiveSidebarTab('writing');
    setIsImproving(true);
    setAiError(null);

    try {
      const fullText = extractTextFromContent(currentDocument?.content);
      if (!fullText.trim()) {
        throw new Error(language === 'en' ? 'Document is empty. Please write some content before generating abstract.' : 'Dokumen kosong. Silakan tulis isi dokumen sebelum membuat abstrak.');
      }
      const response = await generateAbstract(fullText, selectedAiModel, language, user?.id, profile?.subscription_plan || 'free');
      updateQuotaState(response.tokens_used, response.monthly_quota);
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
      if (message.toLowerCase().includes('quota') || message.toLowerCase().includes('kuota')) {
        setIsTokenQuotaModalOpen(true);
      }
      setAiError(message);
      setImprovedResult(null);
    } finally {
      setIsImproving(false);
    }
  }, [currentDocument, selectedAiModel, language, setActiveSidebarTab, setContentBeforeApply, setIsApplied, user, profile, updateQuotaState]);

  const handleParafrasePlagiat = useCallback(async (sentence: string) => {
    setActiveSidebarTab('writing');
    setSelectedText(sentence);
    setIsImproving(true);
    setAiError(null);

    try {
      const response = await improveWriting(sentence, selectedAiTone, selectedAiModel, language, undefined, user?.id, profile?.subscription_plan || 'free');
      updateQuotaState(response.tokens_used, response.monthly_quota);
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
      if (message.toLowerCase().includes('quota') || message.toLowerCase().includes('kuota')) {
        setIsTokenQuotaModalOpen(true);
      }
      setAiError(message);
      setImprovedResult(null);
    } finally {
      setIsImproving(false);
    }
  }, [selectedAiModel, selectedAiTone, currentDocument, language, setActiveSidebarTab, setContentBeforeApply, setIsApplied, user, profile, updateQuotaState]);

  const applyImprovedText = useCallback(() => {
    if (!improvedResult) return;
    setContentBeforeApply(currentDocument?.content);
    editorJsRef.current?.insertText(improvedResult.improved_text);
    setIsApplied(true);
    setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [improvedResult, currentDocument, editorJsRef, setContentBeforeApply, setIsApplied, setSavedAt]);

  const deleteAiHistoryEntry = useCallback((id: string) => {
    setAiHistory((current) => {
      const next = current.filter((item) => item.id !== id);
      saveAiHistory(next);
      return next;
    });
    if (user?.id) {
      deleteCloudAiHistory(user.id, id).catch(() => {});
    }
  }, [user?.id]);

  const clearAiHistory = useCallback(() => {
    saveAiHistory([]);
    setAiHistory([]);
    if (user?.id) {
      deleteCloudAiHistory(user.id, undefined, true).catch(() => {});
    }
  }, [user?.id]);

  return {
    selectedText, setSelectedText,
    improvedResult, setImprovedResult,
    selectedAiModel, setSelectedAiModel,
    selectedAiTone, setSelectedAiTone,
    aiModels, setAiModels,
    aiProviders, setAiProviders,
    aiHistory, setAiHistory,
    aiError, setAiError,
    isImproving, setIsImproving,
    isSynthesizing, setIsSynthesizing,
    synthesizedText, setSynthesizedText,
    synthesizeError, setSynthesizeError,
    synthesizeDisclaimer, setSynthesizeDisclaimer,
    
    handleUpdateAIModel, handleCreateAIModel, handleDeleteAIModel,
    handleUpdateAIProvider, handleCreateAIProvider, handleDeleteAIProvider,
    handleSynthesizeReview,
    runImproveWriting, runParaphrase, runSummarize, runGenerateAbstract,
    handleParafrasePlagiat, applyImprovedText,
    deleteAiHistoryEntry, clearAiHistory,

    // Token Quota states
    tokensUsed, setTokensUsed,
    monthlyQuota, setMonthlyQuota,
    isTokenQuotaModalOpen, setIsTokenQuotaModalOpen
  };
}
