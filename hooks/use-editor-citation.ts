import { useState, useEffect, useMemo, useCallback } from 'react';
import { searchCitations, type CitationCandidate } from '@/lib/api/citations';
import { fetchCitationLibrary, saveCitationToLibrary } from '@/lib/api/citation-library';
import { addCitationHistoryEntry, type CitationHistoryEntry } from '@/lib/editor/citation-history';
import { formatBibliographyCandidate, serializeBibliographyText } from '@/lib/editor/bibliography';
import { serializeCitationCandidatesText } from '@/lib/editor/citation-export';
import { downloadFile } from '@/lib/editor/editor-utils';
import type { EditorJsMethods } from '@/hooks/use-editorjs-methods';
import type { DocumentEntry } from '@/lib/api/documents';

const CITATION_LIBRARY_KEY = 'scholarflow.editor.citation-library.v1';
const CITATION_HISTORY_KEY = 'scholarflow.editor.citation-history.v1';

export function useEditorCitation(
  user: any,
  hydrated: boolean,
  currentDocument: DocumentEntry | null,
  activeReferenceIds: string[],
  activePlanId: string,
  editorJsRef: React.MutableRefObject<EditorJsMethods | null>,
  setWarningMessage: (msg: string) => void,
  setAiError: (msg: string | null) => void,
  selectedText: string
) {
  const [citationResults, setCitationResults] = useState<CitationCandidate[]>([]);
  const [citationLibrary, setCitationLibrary] = useState<Record<string, CitationCandidate>>({});
  const [citationHistory, setCitationHistory] = useState<CitationHistoryEntry[]>([]);
  const [citationError, setCitationError] = useState<string | null>(null);
  const [citationNote, setCitationNote] = useState<string | null>(null);
  const [isSearchingCitations, setIsSearchingCitations] = useState(false);
  const [activeModalCitation, setActiveModalCitation] = useState<{ refId: string; label: string; citedSentence: string } | null>(null);
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [activePdfSearchTerm, setActivePdfSearchTerm] = useState<string>('');
  const [resolvedPdfUrl, setResolvedPdfUrl] = useState<string | null>(null);
  const [isResolvingPdf, setIsResolvingPdf] = useState(false);
  const [translatedCitedSentence, setTranslatedCitedSentence] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);

  // Load citation library: Supabase (global) + localStorage fallback
  useEffect(() => {
    if (!hydrated || !user?.id) return;
    fetchCitationLibrary(user.id).then((supabaseLibrary) => {
      if (Object.keys(supabaseLibrary).length > 0) {
        setCitationLibrary(supabaseLibrary);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(CITATION_LIBRARY_KEY, JSON.stringify(supabaseLibrary));
        }
        return;
      }
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
  }, [hydrated, user?.id]);

  // Sync to local storage
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

  // Resolving direct PDF url in background
  useEffect(() => {
    if (!activeModalCitation) {
      setResolvedPdfUrl(null);
      setIsResolvingPdf(false);
      return;
    }
    const candidate = citationLibrary[activeModalCitation.refId];
    if (!candidate) return;

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
          setCitationLibrary((current) => {
            const existing = current[activeModalCitation.refId];
            if (existing && !existing.pdf_url) {
              const updated = {
                ...current,
                [activeModalCitation.refId]: { ...existing, pdf_url: data.pdf_url }
              };
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
      .finally(() => setIsResolvingPdf(false));
  }, [activeModalCitation, citationLibrary]);

  // Translate cited sentence
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
        .then((data) => setTranslatedCitedSentence(data.translatedText || citedText))
        .catch(() => setTranslatedCitedSentence(citedText))
        .finally(() => setIsTranslating(false));
    } else if (!isAbstractEnglish && isQueryEnglish) {
      setIsTranslating(true);
      fetch(`/api/citations/translate?text=${encodeURIComponent(citedText)}&target=id`)
        .then((res) => res.json())
        .then((data) => setTranslatedCitedSentence(data.translatedText || citedText))
        .catch(() => setTranslatedCitedSentence(citedText))
        .finally(() => setIsTranslating(false));
    } else {
      setTranslatedCitedSentence(citedText);
    }
  }, [activeModalCitation, citationLibrary]);

  // Bibliography Entries
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
  }, [bibliographyEntries, hydrated, activePlanId, editorJsRef]);

  // Editor Actions
  const insertCitation = useCallback(() => {
    editorJsRef.current?.insertCitationSearch();
  }, [editorJsRef]);

  const insertBibliography = useCallback(() => {
    const text = bibliographyEntries.length > 0
      ? "Bibliography:\n" + bibliographyEntries.map((entry, i) => `${i + 1}. ${entry.formatted}`).join('\n')
      : "Bibliography:\nInsert verified citation candidates first, then generate the bibliography.";
    editorJsRef.current?.insertBibliographyText(text);
  }, [bibliographyEntries, editorJsRef]);

  // Export functions
  const exportBibliographyText = useCallback(() => {
    if (activePlanId === 'free') {
      setWarningMessage("🔒 Fitur Ekspor Daftar Pustaka (.bib, .ris, .txt, .json) khusus untuk pengguna paket Pro Writer. Silakan upgrade akun Anda di menu Pricing.");
      return;
    }
    downloadFile('scholarflow-bibliography.txt', serializeBibliographyText(bibliographyEntries), 'text/plain;charset=utf-8');
  }, [bibliographyEntries, activePlanId, setWarningMessage]);

  const exportBibliographyJson = useCallback(() => {
    if (activePlanId === 'free') {
      setWarningMessage("🔒 Fitur Ekspor Daftar Pustaka (.bib, .ris, .txt, .json) khusus untuk pengguna paket Pro Writer. Silakan upgrade akun Anda di menu Pricing.");
      return;
    }
    downloadFile('scholarflow-bibliography.json', JSON.stringify(bibliographyEntries, null, 2), 'application/json;charset=utf-8');
  }, [bibliographyEntries, activePlanId, setWarningMessage]);

  const exportBibliographyBibtex = useCallback(() => {
    if (activePlanId === 'free') {
      setWarningMessage("🔒 Fitur Ekspor Daftar Pustaka khusus untuk pengguna paket Pro Writer.");
      return;
    }
    const uniqueActiveIds = Array.from(new Set(activeReferenceIds));
    let bibtexContent = '';
    uniqueActiveIds.forEach((id) => {
      const candidate = citationLibrary[id];
      if (!candidate) return;
      const key = candidate.citation_label.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
      const authors = candidate.authors.join(' and ');
      bibtexContent += `@article{${key},\n  author = {${authors}},\n  title = {${candidate.title}},\n  journal = {${candidate.source}},\n`;
      if (candidate.year) bibtexContent += `  year = {${candidate.year}},\n`;
      if (candidate.doi) bibtexContent += `  doi = {${candidate.doi}},\n`;
      if (candidate.url) bibtexContent += `  url = {${candidate.url}},\n`;
      bibtexContent += `}\n\n`;
    });
    downloadFile('scholarflow-bibliography.bib', bibtexContent || '% No bibliography entries available.', 'text/plain;charset=utf-8');
  }, [citationLibrary, activeReferenceIds, activePlanId, setWarningMessage]);

  const exportBibliographyRis = useCallback(() => {
    if (activePlanId === 'free') {
      setWarningMessage("🔒 Fitur Ekspor Daftar Pustaka khusus untuk pengguna paket Pro Writer.");
      return;
    }
    const uniqueActiveIds = Array.from(new Set(activeReferenceIds));
    let risContent = '';
    uniqueActiveIds.forEach((id) => {
      const candidate = citationLibrary[id];
      if (!candidate) return;
      risContent += `TY  - JOUR\n`;
      candidate.authors.forEach((author) => { risContent += `AU  - ${author}\n`; });
      risContent += `TI  - ${candidate.title}\nJO  - ${candidate.source}\n`;
      if (candidate.year) risContent += `PY  - ${candidate.year}\n`;
      if (candidate.url) risContent += `UR  - ${candidate.url}\n`;
      if (candidate.doi) risContent += `DO  - ${candidate.doi}\n`;
      risContent += `ER  - \n\n`;
    });
    downloadFile('scholarflow-bibliography.ris', risContent || '% No bibliography entries available.', 'text/plain;charset=utf-8');
  }, [citationLibrary, activeReferenceIds, activePlanId, setWarningMessage]);

  const exportCitationText = useCallback(() => {
    downloadFile('scholarflow-citations.txt', serializeCitationCandidatesText(citationResults), 'text/plain;charset=utf-8');
  }, [citationResults]);

  const exportCitationJson = useCallback(() => {
    downloadFile('scholarflow-citations.json', JSON.stringify(citationResults, null, 2), 'application/json;charset=utf-8');
  }, [citationResults]);

  // Search logic
  const runCitationSearchForQuery = useCallback(async (query: string) => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return;

    setIsSearchingCitations(true);
    setCitationError(null);
    setCitationNote(null);
    setAiError(null);

    try {
      const response = await searchCitations(normalizedQuery, 15);
      
      let filtered = response.results;
      if (currentDocument?.settings) {
        const settings = currentDocument.settings;
        if (settings.publishYear === '5_years') {
          const currentYear = new Date().getFullYear();
          filtered = filtered.filter((c) => c.year !== null && c.year >= currentYear - 5);
        } else if (settings.publishYear === 'custom') {
          const start = settings.publishYearStart ?? 0;
          const end = settings.publishYearEnd ?? new Date().getFullYear();
          filtered = filtered.filter((c) => c.year !== null && c.year >= start && c.year <= end);
        }
        if (settings.impactFactor === '0.25+') filtered = filtered.filter((c) => c.cited_by_count >= 2);
        else if (settings.impactFactor === '3+') filtered = filtered.filter((c) => c.cited_by_count >= 20);
        else if (settings.impactFactor === '10+') filtered = filtered.filter((c) => c.cited_by_count >= 100);

        if (settings.limitCollection === 'journals') filtered = filtered.filter((c) => c.journal !== null && c.journal.trim() !== '');
        else if (settings.limitCollection === 'proceedings') filtered = filtered.filter((c) => c.journal === null || !c.journal.toLowerCase().includes('journal'));
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
      setCitationError(error instanceof Error ? error.message : 'Unable to search citations.');
      setCitationResults([]);
      setCitationNote(null);
    } finally {
      setIsSearchingCitations(false);
    }
  }, [currentDocument, setAiError]);

  const runCitationSearch = useCallback(async () => {
    if (!selectedText.trim()) return;
    await runCitationSearchForQuery(selectedText);
  }, [runCitationSearchForQuery, selectedText]);

  const repeatCitationSearch = useCallback((query: string) => {
    void runCitationSearchForQuery(query);
  }, [runCitationSearchForQuery]);

  const insertCitationCandidate = useCallback(
    (candidate: CitationCandidate, skipEditorInsert = false) => {
      if (!skipEditorInsert) {
        editorJsRef.current?.insertCitation(candidate.citation_label, candidate.reference_id);
      }
      setCitationLibrary((current) => {
        if (current[candidate.reference_id]) return current;
        const newLibrary = { ...current, [candidate.reference_id]: candidate };
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('scholarflow_citation_library', JSON.stringify(newLibrary));
        }
        return newLibrary;
      });
      if (user?.id) {
        saveCitationToLibrary(candidate, user.id).catch(() => {});
      }
    },
    [user, editorJsRef],
  );

  return {
    citationResults,
    citationLibrary,
    citationHistory,
    citationError,
    citationNote,
    isSearchingCitations,
    activeModalCitation,
    setActiveModalCitation,
    activePdfUrl,
    setActivePdfUrl,
    activePdfSearchTerm,
    setActivePdfSearchTerm,
    resolvedPdfUrl,
    isResolvingPdf,
    translatedCitedSentence,
    isTranslating,
    bibliographyEntries,
    insertCitation,
    insertBibliography,
    exportBibliographyText,
    exportBibliographyJson,
    exportBibliographyBibtex,
    exportBibliographyRis,
    exportCitationText,
    exportCitationJson,
    runCitationSearch,
    repeatCitationSearch,
    insertCitationCandidate
  };
}
