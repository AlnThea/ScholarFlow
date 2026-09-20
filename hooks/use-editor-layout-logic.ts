import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/components/i18n/language-context';
import { useDataService } from '@/lib/services';
import { useAuth } from '@/components/auth/auth-provider';
import type { DocumentListItem, DocumentEntry } from '@/lib/api/documents';

interface UseEditorLayoutLogicProps {
  currentDocument?: DocumentEntry | null;
  documents: DocumentListItem[];
  selectedText: string;
  onSelectionChange?: (text: string) => void;
}

export function useEditorLayoutLogic({
  currentDocument,
  documents,
  selectedText,
  onSelectionChange,
}: UseEditorLayoutLogicProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dashboardExpandedProjects, setDashboardExpandedProjects] = useState<string[]>([]);
  const { language, setLanguage, t } = useLanguage();
  const isEn = language === 'en';
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(!currentDocument);
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [currentBlockType, setCurrentBlockType] = useState('paragraph');
  const [currentAlignment, setCurrentAlignment] = useState('left');
  const [editorMode, setEditorMode] = useState<'edit' | 'suggest'>('edit');
  const [selectedTextForSuggestion, setSelectedTextForSuggestion] = useState('');
  const [newTextForSuggestion, setNewTextForSuggestion] = useState('');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [mathToast, setMathToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const { backendType } = useDataService();
  const [isMathHelperOpen, setIsMathHelperOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Theme loading
    const localTheme = window.localStorage.getItem('sf-theme');
    if (localTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    // Trigger pricing modal from locked bibliography banner click
    const handleTriggerPricing = () => {
      setIsPricingOpen(true);
    };
    window.addEventListener('sf-trigger-pricing', handleTriggerPricing);
    return () => {
      window.removeEventListener('sf-trigger-pricing', handleTriggerPricing);
    };
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      window.localStorage.setItem('sf-theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      window.localStorage.setItem('sf-theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const groupedDocs = React.useMemo(() => {
    const projects: Record<string, { id: string; name: string; type: string; docs: DocumentListItem[] }> = {};
    const independent: DocumentListItem[] = [];

    documents.forEach((doc) => {
      const settings = doc.settings;
      if (settings?.projectId && settings?.projectName) {
        const pId = settings.projectId;
        if (!projects[pId]) {
          projects[pId] = {
            id: pId,
            name: settings.projectName,
            type: settings.projectType || 'independent',
            docs: []
          };
        }
        projects[pId].docs.push(doc);
      } else {
        independent.push(doc);
      }
    });

    return {
      projects: Object.values(projects),
      independent
    };
  }, [documents]);

  const { profile, user } = useAuth();
  const role = profile?.role ?? 'user';
  const activePlanId = profile?.subscription_plan || 'free';
  const pathname = usePathname();
  const router = useRouter();

  const activeDashboardTab = useMemo(() => {
    if (pathname === '/billing') return 'billing';
    if (pathname === '/admin/pricing') return 'admin-pricing';
    if (pathname === '/admin/models') return 'admin-models';
    if (pathname === '/admin/gateways') return 'admin-gateways';
    return 'user';
  }, [pathname]);

  const handleSetDashboardTab = (tab: 'user' | 'admin' | 'billing' | 'admin-pricing' | 'admin-models' | 'admin-gateways') => {
    if (tab === 'billing') {
      router.push('/billing');
    } else if (tab === 'admin' || tab === 'admin-pricing') {
      router.push('/admin/pricing');
    } else if (tab === 'admin-models') {
      router.push('/admin/models');
    } else if (tab === 'admin-gateways') {
      router.push('/admin/gateways');
    } else {
      router.push('/dashboard');
    }
  };

  // States to manage the custom text selection bubble menu
  const [bubbleMenuRect, setBubbleMenuRect] = useState<DOMRect | null>(null);
  const [showBubbleMenu, setShowBubbleMenu] = useState(false);
  // 'format' = default mode, 'citation' = showing citation results inline
  const [bubbleMode, setBubbleMode] = useState<'format' | 'citation'>('format');
  const bubbleModeRef = useRef(bubbleMode);
  useEffect(() => {
    bubbleModeRef.current = bubbleMode;
  }, [bubbleMode]);

  // Active state for inline formatting commands (e.g. bold, italic)
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    code: false,
    superscript: false,
    subscript: false,
    link: false,
    highlight: false,
  });
  const [currentFontSize, setCurrentFontSize] = useState<string>('');

  const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rightSaved = localStorage.getItem('right-sidebar-expanded');
      if (rightSaved !== null) {
        setIsRightSidebarExpanded(rightSaved === 'true');
      }
    }
  }, []);

  const handleToggleRightSidebarExpanded = () => {
    setIsRightSidebarExpanded(prev => {
      const next = !prev;
      localStorage.setItem('right-sidebar-expanded', String(next));
      return next;
    });
  };

  const [bubbleSearchQuery, setBubbleSearchQuery] = useState('');

  // Auto-collapse sidebar (Zen Mode) when entering a document
  useEffect(() => {
    if (currentDocument) {
      setIsSidebarExpanded(false);
    } else {
      setIsSidebarExpanded(true); // Auto-expand in dashboard
    }
  }, [currentDocument?.id]);

  useEffect(() => {
    if (bubbleMode === 'citation') {
      setBubbleSearchQuery(selectedText);
    }
  }, [bubbleMode, selectedText]);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-expanded');
    if (saved !== null && !currentDocument) {
      setIsSidebarExpanded(saved === 'true');
    }

    // Selection change handler to sync toolbar states and show bubble menu
    const handleSelectionChange = () => {
      let hasLink = false;
      let hasHighlight = false;
      let hasCode = false;
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const editorContainer = document.getElementById('editorjs-holder');

        // 1. Check anchorNode parent
        let anchorParent = selection.anchorNode
          ? (selection.anchorNode.nodeType === Node.TEXT_NODE
            ? selection.anchorNode.parentElement
            : selection.anchorNode as HTMLElement)
          : null;
        let node = anchorParent;
        while (node && editorContainer && editorContainer.contains(node)) {
          if (node.tagName === 'A') {
            hasLink = true;
          }
          if (node.tagName === 'MARK') {
            hasHighlight = true;
          }
          if (node.tagName === 'CODE') {
            hasCode = true;
          }
          if (hasLink && hasHighlight && hasCode) break;
          node = node.parentElement;
        }

        // 2. Check focusNode parent if anchorNode didn't find all
        if (!hasLink || !hasHighlight || !hasCode) {
          let focusParent = selection.focusNode
            ? (selection.focusNode.nodeType === Node.TEXT_NODE
              ? selection.focusNode.parentElement
              : selection.focusNode as HTMLElement)
            : null;
          node = focusParent;
          while (node && editorContainer && editorContainer.contains(node)) {
            if (node.tagName === 'A') {
              hasLink = true;
            }
            if (node.tagName === 'MARK') {
              hasHighlight = true;
            }
            if (node.tagName === 'CODE') {
              hasCode = true;
            }
            if (hasLink && hasHighlight && hasCode) break;
            node = node.parentElement;
          }
        }

        // 3. Check if selection range spans across/encloses tags
        if (!hasLink || !hasHighlight || !hasCode) {
          try {
            const range = selection.getRangeAt(0);
            const fragment = range.cloneContents();
            const tempDiv = document.createElement('div');
            tempDiv.appendChild(fragment);
            if (!hasLink && tempDiv.querySelector('a')) {
              hasLink = true;
            }
            if (!hasHighlight && tempDiv.querySelector('mark')) {
              hasHighlight = true;
            }
            if (!hasCode && tempDiv.querySelector('code')) {
              hasCode = true;
            }
          } catch (e) {
            // ignore range extraction issues
          }
        }
      }

      // 1. Sync format active states
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikethrough: document.queryCommandState('strikeThrough'),
        code: hasCode,
        superscript: document.queryCommandState('superscript'),
        subscript: document.queryCommandState('subscript'),
        link: hasLink,
        highlight: hasHighlight,
      });

      // 2. Display custom bubble menu if text selection is active inside EditorJS

      // Sync active font size state
      if (selection && selection.anchorNode) {
        const parentEl = selection.anchorNode.nodeType === Node.ELEMENT_NODE
          ? (selection.anchorNode as HTMLElement)
          : selection.anchorNode.parentElement;
        if (parentEl) {
          let currentEl: HTMLElement | null = parentEl;
          let foundSize = '';
          const editorContainer = document.getElementById('editorjs-holder');
          while (currentEl && editorContainer && editorContainer.contains(currentEl)) {
            if (currentEl.style.fontSize) {
              foundSize = currentEl.style.fontSize;
              break;
            }
            currentEl = currentEl.parentElement;
          }
          setCurrentFontSize(foundSize);
        }
      } else {
        setCurrentFontSize('');
      }

      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        if (bubbleModeRef.current === 'citation') return;
        setShowBubbleMenu(false);
        onSelectionChange?.('');
        return;
      }

      const anchorNode = selection.anchorNode;
      if (!anchorNode) return;
      const editorContainer = document.getElementById('editorjs-holder');
      if (!editorContainer || !editorContainer.contains(anchorNode)) {
        if (bubbleModeRef.current === 'citation') return;
        setShowBubbleMenu(false);
        onSelectionChange?.('');
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const text = selection.toString().trim();
      setBubbleMenuRect(rect);
      onSelectionChange?.(text);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [onSelectionChange]);

  const toggleSidebar = () => {
    setIsSidebarExpanded(prev => {
      const next = !prev;
      localStorage.setItem('sidebar-expanded', String(next));
      return next;
    });
  };

  // Class helper to apply clean active/inactive formatting toolbar button states
  const getBtnClass = (isActive: boolean) => {
    return `p-1.5 rounded transition ${isActive
      ? 'bg-indigo-100/80 text-indigo-700 font-bold'
      : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
      }`;
  };

  return {
    mounted,
    setMounted,
    isDarkMode,
    setIsDarkMode,
    toggleDarkMode,
    dashboardExpandedProjects,
    setDashboardExpandedProjects,
    language,
    setLanguage,
    t,
    isEn,
    isSidebarExpanded,
    setIsSidebarExpanded,
    toggleSidebar,
    showRightSidebar,
    setShowRightSidebar,
    expandedCardId,
    setExpandedCardId,
    currentBlockType,
    setCurrentBlockType,
    currentAlignment,
    setCurrentAlignment,
    editorMode,
    setEditorMode,
    selectedTextForSuggestion,
    setSelectedTextForSuggestion,
    newTextForSuggestion,
    setNewTextForSuggestion,
    isPricingOpen,
    setIsPricingOpen,
    isHelpOpen,
    setIsHelpOpen,
    mathToast,
    setMathToast,
    backendType,
    isMathHelperOpen,
    setIsMathHelperOpen,
    groupedDocs,
    profile,
    user,
    role,
    activePlanId,
    pathname,
    router,
    activeDashboardTab,
    handleSetDashboardTab,
    bubbleMenuRect,
    setBubbleMenuRect,
    showBubbleMenu,
    setShowBubbleMenu,
    bubbleMode,
    setBubbleMode,
    activeFormats,
    setActiveFormats,
    currentFontSize,
    setCurrentFontSize,
    isRightSidebarExpanded,
    setIsRightSidebarExpanded,
    handleToggleRightSidebarExpanded,
    bubbleSearchQuery,
    setBubbleSearchQuery,
    getBtnClass
  };
}
