import { useState } from 'react';

export function useEditorModals({ editorJsRef }: any) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const handleInsertImageConfirm = () => {
    if (imageUrlInput.trim()) {
      editorJsRef.current?.insertImage(imageUrlInput.trim());
      setIsImageModalOpen(false);
      setImageUrlInput('');
    }
  };

  const [isMathModalOpen, setIsMathModalOpen] = useState(false);
  const [mathFormulaInput, setMathFormulaInput] = useState('');
  const [editingMathCallback, setEditingMathCallback] = useState<{ save: (formula: string) => void } | null>(null);

  const handleInsertMathConfirm = () => {
    if (mathFormulaInput.trim()) {
      if (editingMathCallback) {
        editingMathCallback.save(mathFormulaInput.trim());
        setEditingMathCallback(null);
      } else {
        editorJsRef.current?.insertInlineEquation(mathFormulaInput.trim());
      }
      setIsMathModalOpen(false);
      setMathFormulaInput('');
    }
  };

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrlInput, setLinkUrlInput] = useState('');
  const [insertLinkCallback, setInsertLinkCallback] = useState<{
    save: (url: string) => void;
    unlink?: () => void;
  } | null>(null);

  const handleInsertLinkConfirm = () => {
    if (linkUrlInput.trim()) {
      if (insertLinkCallback) {
        insertLinkCallback.save(linkUrlInput.trim());
        setInsertLinkCallback(null);
      }
      setIsLinkModalOpen(false);
      setLinkUrlInput('');
    }
  };

  const handleUnlinkConfirm = () => {
    if (insertLinkCallback?.unlink) {
      insertLinkCallback.unlink();
      setInsertLinkCallback(null);
    }
    setIsLinkModalOpen(false);
    setLinkUrlInput('');
  };



  const [showHighlightPopover, setShowHighlightPopover] = useState(false);
  const [highlightPopoverRect, setHighlightPopoverRect] = useState<DOMRect | null>(null);
  const [highlightTriggerSource, setHighlightTriggerSource] = useState<'toolbar' | 'bubble' | null>(null);

  const handleHighlightButtonClick = (e: React.MouseEvent<HTMLButtonElement>, source: 'toolbar' | 'bubble') => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setHighlightPopoverRect(rect);
    setHighlightTriggerSource(source);
    setShowHighlightPopover(prev => !prev);
  };

  const handleApplyHighlight = (color: string) => {
    editorJsRef.current?.toggleInlineFormat('highlight', color);
    setShowHighlightPopover(false);
    setHighlightPopoverRect(null);
    setHighlightTriggerSource(null);
  };

  const [isExportUpgradeModalOpen, setIsExportUpgradeModalOpen] = useState(false);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState(false);


  return {
    isImageModalOpen, setIsImageModalOpen,
    imageUrlInput, setImageUrlInput,
    handleInsertImageConfirm,
    isMathModalOpen, setIsMathModalOpen,
    mathFormulaInput, setMathFormulaInput,
    editingMathCallback, setEditingMathCallback,
    handleInsertMathConfirm,
    isLinkModalOpen, setIsLinkModalOpen,
    linkUrlInput, setLinkUrlInput,
    insertLinkCallback, setInsertLinkCallback,
    handleInsertLinkConfirm, handleUnlinkConfirm,
    showHighlightPopover, setShowHighlightPopover,
    highlightPopoverRect, setHighlightPopoverRect,
    highlightTriggerSource, setHighlightTriggerSource,
    handleHighlightButtonClick, handleApplyHighlight,
    isExportUpgradeModalOpen, setIsExportUpgradeModalOpen,
    isSuggestionModalOpen, setIsSuggestionModalOpen,
    isShareOpen, setIsShareOpen,
    isBackendModalOpen, setIsBackendModalOpen,
  };
}
