// hooks/use-citation-mention.ts
// Phase 32: Custom Hook Engine for Smart In-Text Reference Mention

import { useState, useEffect, useCallback, useRef } from 'react';
import type { CitationCandidate } from '@/lib/api/citations';
import { 
  extractMentionQuery, 
  getCaretCoordinates, 
  MentionMatchResult, 
  CaretCoordinates 
} from '@/lib/editor/mention-parser';
import { 
  searchMultiSourceReferences, 
  ScoredReferenceCandidate 
} from '@/lib/editor/reference-search-index';
import { injectMentionCitationToDom } from '@/lib/editor/methods/mention-injector';

export interface UseCitationMentionProps {
  holderId?: string;
  localReferences: CitationCandidate[];
  citationStyle?: string;
  onCitationInserted?: (candidate: CitationCandidate) => void;
  language?: 'en' | 'id';
}

export function useCitationMention({
  holderId = 'editorjs-holder',
  localReferences = [],
  citationStyle = 'apa',
  onCitationInserted,
  language = 'en',
}: UseCitationMentionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [coordinates, setCoordinates] = useState<CaretCoordinates | null>(null);
  const [candidates, setCandidates] = useState<ScoredReferenceCandidate[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const activeMentionRef = useRef<MentionMatchResult | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close mention popup
  const closeMention = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setCoordinates(null);
    setCandidates([]);
    setSelectedIndex(0);
    activeMentionRef.current = null;
  }, []);

  // Update candidate search
  const performSearch = useCallback(
    async (searchQ: string) => {
      setIsLoading(true);
      try {
        const results = await searchMultiSourceReferences(searchQ, localReferences, {
          limit: 6,
          allowNetworkFallback: true,
        });
        setCandidates(results);
        setSelectedIndex(0);
      } catch (err) {
        console.warn('[useCitationMention Search Error]:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [localReferences]
  );

  // Select candidate and inject into document
  const selectCandidate = useCallback(
    (scoredItem: ScoredReferenceCandidate) => {
      const candidate = scoredItem.candidate;
      const mentionMatch = activeMentionRef.current;
      const numericIndex = localReferences.length + 1;

      const result = injectMentionCitationToDom(
        candidate,
        citationStyle,
        numericIndex,
        mentionMatch
      );

      if (result.success) {
        onCitationInserted?.(candidate);
      }

      closeMention();
    },
    [citationStyle, localReferences.length, onCitationInserted, closeMention]
  );

  // KeyUp listener: detect mention triggers
  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      // Ignore navigation keys handled in keydown
      if (['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(e.key)) {
        return;
      }

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const container = range.startContainer;

      // Ensure cursor is inside the editor container
      const editorElement =
        document.getElementById(holderId) ||
        document.getElementById('editorjs-holder') ||
        document.querySelector('.codex-editor') ||
        (container.nodeType === Node.ELEMENT_NODE
          ? (container as HTMLElement).closest('[contenteditable="true"]')
          : container.parentElement?.closest('[contenteditable="true"]'));

      if (!editorElement || !editorElement.contains(container)) {
        if (isOpen) closeMention();
        return;
      }

      if (container.nodeType === Node.TEXT_NODE) {
        const text = container.textContent || '';
        const offset = range.startOffset;
        const textBeforeCaret = text.slice(0, offset);

        const match = extractMentionQuery(textBeforeCaret);
        if (match) {
          activeMentionRef.current = match;
          setQuery(match.query);

          const coords = getCaretCoordinates();
          if (coords) {
            setCoordinates(coords);
            setIsOpen(true);

            // Debounced candidate search
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = setTimeout(() => {
              performSearch(match.query);
            }, 120);
            return;
          }
        }
      }

      if (isOpen) {
        closeMention();
      }
    },
    [holderId, isOpen, closeMention, performSearch]
  );

  // KeyDown listener: handle navigation inside mention dropdown
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen || candidates.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % candidates.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + candidates.length) % candidates.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (candidates[selectedIndex]) {
          selectCandidate(candidates[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeMention();
      }
    },
    [isOpen, candidates, selectedIndex, selectCandidate, closeMention]
  );

  // Register window listeners
  useEffect(() => {
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', handleKeyDown, true);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [handleKeyUp, handleKeyDown]);

  return {
    isOpen,
    query,
    coordinates,
    candidates,
    selectedIndex,
    isLoading,
    closeMention,
    selectCandidate,
    performSearch,
  };
}
