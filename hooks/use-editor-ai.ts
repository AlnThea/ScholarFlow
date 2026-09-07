import { useCallback, useEffect, useState } from 'react';
import { improveWriting, type ImproveWritingResponse, synthesizeLiteratureReview, generateAbstract } from '@/lib/api/ai';
import { fetchAIModels, updateAIModel, createAIModel, deleteAIModel, type AIModel, fetchAIProviders, createAIProvider, updateAIProvider, deleteAIProvider, type AIProvider } from '@/lib/api/ai-models';
import { addAiHistoryEntry, type AiHistoryEntry } from '@/lib/editor/ai-history';
import { extractTextFromContent } from '@/lib/editor/editor-utils';

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
  hydrated: boolean
) {
  const [selectedText, setSelectedText] = useState('');
  const [improvedResult, setImprovedResult] = useState<ImproveWritingResponse | null>(null);
  const [selectedAiModel, setSelectedAiModel] = useState('gemini');
  const [selectedAiTone, setSelectedAiTone] = useState('academic');
  
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [aiProviders, setAiProviders] = useState<AIProvider[]>([]);
  
  const [aiHistory, setAiHistory] = useState<AiHistoryEntry[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isImproving, setIsImproving] = useState(false);
  
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesizedText, setSynthesizedText] = useState<string | null>(null);
  const [synthesizeError, setSynthesizeError] = useState<string | null>(null);
  const [synthesizeDisclaimer, setSynthesizeDisclaimer] = useState<string | null>(null);

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

  const runImproveWriting = useCallback(async () => {
    if (!selectedText.trim()) return;

    setActiveSidebarTab('writing');
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
  }, [selectedText, selectedAiModel, selectedAiTone, currentDocument, language, setActiveSidebarTab, setContentBeforeApply, setIsApplied]);

  const runParaphrase = useCallback(async () => {
    if (!selectedText.trim()) return;

    setActiveSidebarTab('writing');
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
  }, [selectedText, selectedAiModel, currentDocument, language, setActiveSidebarTab, setContentBeforeApply, setIsApplied]);

  const runSummarize = useCallback(async () => {
    if (!selectedText.trim()) return;

    setActiveSidebarTab('writing');
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
  }, [selectedText, selectedAiModel, currentDocument, language, setActiveSidebarTab, setContentBeforeApply, setIsApplied]);

  const runGenerateAbstract = useCallback(async () => {
    setActiveSidebarTab('writing');
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
  }, [currentDocument, selectedAiModel, language, setActiveSidebarTab, setContentBeforeApply, setIsApplied]);

  const handleParafrasePlagiat = useCallback(async (sentence: string) => {
    setActiveSidebarTab('writing');
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
  }, [selectedAiModel, selectedAiTone, currentDocument, language, setActiveSidebarTab, setContentBeforeApply, setIsApplied]);

  const applyImprovedText = useCallback(() => {
    if (!improvedResult) return;
    setContentBeforeApply(currentDocument?.content);
    editorJsRef.current?.insertText(improvedResult.improved_text);
    setIsApplied(true);
    setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [improvedResult, currentDocument, editorJsRef, setContentBeforeApply, setIsApplied, setSavedAt]);

  const deleteAiHistoryEntry = useCallback((id: string) => {
    setAiHistory((current) => current.filter((item) => item.id !== id));
  }, []);

  const clearAiHistory = useCallback(() => {
    setAiHistory([]);
  }, []);

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
    deleteAiHistoryEntry, clearAiHistory
  };
}
