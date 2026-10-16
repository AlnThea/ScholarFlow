// hooks/use-ghostwriter.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { saveLocalQuotaState } from '@/lib/ai/token-quota';

export interface GhostwriterState {
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
  toggleEnabled: () => void;
  suggestion: string | null;
  isLoading: boolean;
  coords: { top: number; left: number } | null;
  acceptSuggestion: () => void;
  dismissSuggestion: () => void;
  onEditorInputOrSelectionChange: () => void;
  handleEditorKeyDown: (e: React.KeyboardEvent) => boolean;
}

const STORAGE_KEY = 'scholarflow.editor.ghostwriter.enabled';
const DEBOUNCE_DELAY_MS = 1300;

export function useGhostwriter({
  language = 'id',
  documentTitle,
  editorJsRef,
  onContentChange,
  setIsPlanModalOpen,
}: {
  language?: string;
  documentTitle?: string;
  editorJsRef?: any;
  onContentChange?: (content: any) => void;
  setIsPlanModalOpen?: (val: boolean) => void;
}): GhostwriterState {
  const { user, profile, refreshProfile } = useAuth();
  const [isEnabled, setIsEnabledState] = useState<boolean>(true);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeTargetNodeRef = useRef<Node | null>(null);
  const activeTargetRangeRef = useRef<Range | null>(null);

  // Hydrate preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        setIsEnabledState(saved === 'true');
      }
    } catch (_) {}
  }, []);

  const setIsEnabled = useCallback((val: boolean) => {
    setIsEnabledState(val);
    try {
      localStorage.setItem(STORAGE_KEY, String(val));
    } catch (_) {}
    if (!val) {
      setSuggestion(null);
      setCoords(null);
    }
  }, []);

  const toggleEnabled = useCallback(() => {
    setIsEnabled(!isEnabled);
  }, [isEnabled, setIsEnabled]);

  const dismissSuggestion = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setSuggestion(null);
    setCoords(null);
    setIsLoading(false);
  }, []);

  const acceptSuggestion = useCallback(() => {
    if (!suggestion) return;

    try {
      const selection = window.getSelection();
      let range = activeTargetRangeRef.current;

      // Fallback to active selection if stored range is stale
      if (!range && selection && selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
      }

      if (range) {
        // Ensure caret is at stored insertion position
        range.deleteContents();
        const textNode = document.createTextNode(suggestion);
        range.insertNode(textNode);

        // Move cursor to the end of inserted text
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }

        // Notify parent block of input event to trigger EditorJS serialization
        const parentBlock = (textNode.parentElement as HTMLElement)?.closest('.ce-block, [contenteditable="true"]') as HTMLElement | null;
        if (parentBlock) {
          parentBlock.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Force trigger editor save
        if (editorJsRef?.current && onContentChange) {
          editorJsRef.current.saveCleanContent?.().then((cleanContent: any) => {
            if (cleanContent) onContentChange(cleanContent);
          }).catch(console.error);
        }
      }
    } catch (err) {
      console.warn('[Ghostwriter] Failed to accept suggestion:', err);
    } finally {
      dismissSuggestion();
    }
  }, [suggestion, editorJsRef, onContentChange, dismissSuggestion]);

  // Listener called on keyup/selection change inside editor canvas
  const onEditorInputOrSelectionChange = useCallback(() => {
    if (!isEnabled) return;

    // Reset current active suggestion if user types or moves caret
    if (suggestion) {
      dismissSuggestion();
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const selection = window.getSelection();
    if (!selection || !selection.isCollapsed || selection.rangeCount === 0) {
      return;
    }

    const anchorNode = selection.anchorNode;
    if (!anchorNode) return;

    const el = anchorNode.nodeType === Node.TEXT_NODE ? anchorNode.parentElement : (anchorNode as HTMLElement);
    const contentEditableEl = el?.closest('[contenteditable="true"]');
    if (!contentEditableEl) return;

    // Extract text in the current paragraph preceding cursor
    const fullBlockText = (contentEditableEl as HTMLElement).innerText || '';
    if (fullBlockText.trim().length < 15) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Check if rect is valid
    if (rect.top === 0 && rect.left === 0) return;

    activeTargetNodeRef.current = anchorNode;
    activeTargetRangeRef.current = range.cloneRange();

    const caretCoords = {
      top: rect.bottom + window.scrollY,
      left: Math.max(16, rect.left + window.scrollX),
    };

    // Schedule autocomplete request
    debounceTimerRef.current = setTimeout(async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      try {
        const response = await fetch('/api/v1/ai/ghostwrite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortControllerRef.current.signal,
          body: JSON.stringify({
            prefix: fullBlockText,
            documentTitle,
            language,
            userId: user?.id,
            userPlan: profile?.subscription_plan || 'free',
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          if (errData.quotaExceeded) {
            setIsPlanModalOpen?.(true);
          }
          return;
        }

        const data = await response.json();
        if (data.suggestion && data.suggestion.trim().length > 0) {
          setSuggestion(data.suggestion);
          setCoords(caretCoords);

          if (typeof data.tokens_used === 'number') {
            saveLocalQuotaState(data.tokens_used, data.monthly_quota);
            refreshProfile?.();
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('[Ghostwriter] Autocomplete error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_DELAY_MS);
  }, [isEnabled, suggestion, documentTitle, language, user, profile, refreshProfile, dismissSuggestion, setIsPlanModalOpen]);

  // Intercept KeyDown events in editor canvas
  const handleEditorKeyDown = useCallback((e: React.KeyboardEvent): boolean => {
    if (!isEnabled) return false;

    // Quick toggle shortcut: Ctrl+J or Cmd+J
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
      e.preventDefault();
      toggleEnabled();
      return true;
    }

    if (suggestion) {
      if (e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        acceptSuggestion();
        return true;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        dismissSuggestion();
        return true;
      }
      // If user types any other key, dismiss the active suggestion
      dismissSuggestion();
    }

    return false;
  }, [isEnabled, suggestion, toggleEnabled, acceptSuggestion, dismissSuggestion]);

  return {
    isEnabled,
    setIsEnabled,
    toggleEnabled,
    suggestion,
    isLoading,
    coords,
    acceptSuggestion,
    dismissSuggestion,
    onEditorInputOrSelectionChange,
    handleEditorKeyDown,
  };
}
