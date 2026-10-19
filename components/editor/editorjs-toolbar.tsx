import React, { useState } from 'react';
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconCode,
  IconSuperscript,
  IconSubscript,
  IconLink,
  IconHighlight,
  IconPhoto,
  IconTable,
  IconMath,
  IconSum,
  IconAt,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconAlignJustified,
  IconCalculator,
  IconBookmark
} from '@tabler/icons-react';
import type { EditorJsMethods } from '@/hooks/use-editorjs-methods';
import { GhostwriterToggle } from './ghostwriter-toggle';
import { CitationStyleSelector } from './citation-style-selector';
import { AcademicIntegrityPill } from './academic-integrity-pill';
import { SuggestingModeControl } from './suggesting-mode';

export type EditorToolbarProps = {
  documentContent?: string;
  onOpenIntegrityTab?: () => void;
  onOpenCrossReferenceModal?: () => void;
  language: string;
  editorMode: 'edit' | 'suggest';
  setEditorMode: (mode: 'edit' | 'suggest') => void;
  pendingSuggestionsCount?: number;
  onBatchAcceptSuggestions?: () => void;
  onBatchRejectSuggestions?: () => void;
  editorJsRef: React.RefObject<EditorJsMethods | null>;
  currentBlockType: string;
  currentFontSize: string;
  setCurrentFontSize: (size: string) => void;
  activeFormats: Record<string, boolean>;
  getBtnClass: (isActive: boolean) => string;
  currentAlignment: string;
  onInsertCitation: () => void;
  setImageUrlInput: (val: string) => void;
  setIsImageModalOpen: (val: boolean) => void;
  handleHighlightButtonClick: (e: React.MouseEvent<HTMLButtonElement>, source: 'toolbar' | 'bubble') => void;
  setMathFormulaInput: (val: string) => void;
  selectedText: string;
  setIsMathModalOpen: (val: boolean) => void;
  isMathHelperOpen: boolean;
  setIsMathHelperOpen: React.Dispatch<React.SetStateAction<boolean>>;
  statusLabel: string;
  isGhostwriterEnabled?: boolean;
  onToggleGhostwriter?: () => void;
  isGhostwriterLoading?: boolean;
  citationStyle?: string;
  onChangeCitationStyle?: (style: any) => void;
};

type RibbonTabKey = 'beranda' | 'sisipkan' | 'referensi' | 'tinjauan';

export const EditorJsToolbar = ({
  language,
  editorMode,
  setEditorMode,
  pendingSuggestionsCount,
  onBatchAcceptSuggestions,
  onBatchRejectSuggestions,
  editorJsRef,
  currentBlockType,
  currentFontSize,
  setCurrentFontSize,
  activeFormats,
  getBtnClass,
  currentAlignment,
  onInsertCitation,
  citationStyle,
  onChangeCitationStyle,
  setImageUrlInput,
  setIsImageModalOpen,
  handleHighlightButtonClick,
  setMathFormulaInput,
  selectedText,
  setIsMathModalOpen,
  isMathHelperOpen,
  setIsMathHelperOpen,
  statusLabel,
  isGhostwriterEnabled,
  onToggleGhostwriter,
  isGhostwriterLoading,
  documentContent,
  onOpenIntegrityTab,
  onOpenCrossReferenceModal,
}: EditorToolbarProps) => {
  const [activeRibbonTab, setActiveRibbonTab] = useState<RibbonTabKey>('beranda');

  const ribbonTabs: { key: RibbonTabKey; labelEn: string; labelId: string; subtitleEn: string; subtitleId: string }[] = [
    {
      key: 'beranda',
      labelEn: 'Home',
      labelId: 'Beranda',
      subtitleEn: 'Text & Formats',
      subtitleId: 'Teks & Format'
    },
    {
      key: 'sisipkan',
      labelEn: 'Insert',
      labelId: 'Sisipkan',
      subtitleEn: 'Tables, Media & LaTeX',
      subtitleId: 'Tabel, Gambar & Rumus'
    },
    {
      key: 'referensi',
      labelEn: 'References',
      labelId: 'Referensi',
      subtitleEn: 'Citations & Styles',
      subtitleId: 'Sitasi & Bibliografi'
    },
    {
      key: 'tinjauan',
      labelEn: 'Review & AI',
      labelId: 'Tinjauan & AI',
      subtitleEn: 'Ghostwriter & Integrity',
      subtitleId: 'Ghostwriter & Integritas'
    }
  ];

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 lg:sticky lg:top-[57px] z-10 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-colors">
      {/* 1. Baris Tab Ribbon ala Modern Microsoft Word */}
      <div className="flex items-center justify-between px-6 border-b border-slate-150 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 select-none overflow-x-auto scrollbar-none">
        <nav className="flex items-center gap-1 -mb-px">
          {ribbonTabs.map((tab) => {
            const isActive = activeRibbonTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveRibbonTab(tab.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
                  isActive
                    ? 'border-[#185abd] text-[#185abd] dark:text-blue-400 dark:border-blue-400 font-bold bg-white dark:bg-slate-900 rounded-t shadow-2xs'
                    : 'border-transparent text-slate-650 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium hover:bg-slate-100/60 dark:hover:bg-slate-800/40 rounded-t'
                }`}
                title={language === 'en' ? tab.subtitleEn : tab.subtitleId}
              >
                <span>{language === 'en' ? tab.labelEn : tab.labelId}</span>
              </button>
            );
          })}
        </nav>

        {/* Status Indikator di Ujung Kanan Baris Tab */}
        <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{language === 'en' ? 'Ribbon Bar Active' : 'Bilah Ribbon Aktif'}</span>
        </div>
      </div>

      {/* 2. Isi Bilah Ribbon Sesuai Tab Aktif */}
      <div className="flex flex-wrap items-center gap-2 px-6 py-2 min-h-[48px] overflow-x-auto">
        {/* ============================================================== */}
        {/* TAB 1: BERANDA (HOME) - Teks & Pemformatan Dokumen Inti       */}
        {/* ============================================================== */}
        {activeRibbonTab === 'beranda' && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Mode Switcher Toggle (Edit Langsung vs Mode Sugesti) */}
            <SuggestingModeControl
              editorMode={editorMode}
              setEditorMode={setEditorMode}
              pendingCount={pendingSuggestionsCount}
              onBatchAcceptAll={onBatchAcceptSuggestions}
              onBatchRejectAll={onBatchRejectSuggestions}
              language={language as 'en' | 'id'}
              className="mr-1 shrink-0"
            />

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

            {/* Undo / Redo */}
            <div data-tour="toolbar-undo-redo" className="flex items-center gap-0.5">
              <button
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                title={language === 'en' ? 'Undo (Ctrl+Z)' : 'Urungkan (Ctrl+Z)'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editorJsRef.current?.undo()}
              >
                <IconArrowBackUp className="h-4 w-4" />
              </button>
              <button
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                title={language === 'en' ? 'Redo (Ctrl+Y)' : 'Ulangi (Ctrl+Y)'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editorJsRef.current?.redo()}
              >
                <IconArrowForwardUp className="h-4 w-4" />
              </button>
            </div>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* Block Type Selection */}
            <select
              aria-label="Text style"
              value={currentBlockType}
              onChange={(e) => editorJsRef.current?.setBlockType(e.target.value)}
              className="h-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 cursor-pointer"
            >
              <option value="paragraph">{language === 'en' ? 'Paragraph / Text' : 'Paragraf / Teks'}</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="h4">Heading 4</option>
              <option value="h5">Heading 5</option>
              <option value="h6">Heading 6</option>
            </select>

            {/* Font Size Selection */}
            <select
              aria-label="Font size"
              value={currentFontSize}
              onChange={(e) => {
                editorJsRef.current?.setFontSize(e.target.value);
                setCurrentFontSize(e.target.value);
              }}
              className="h-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 cursor-pointer"
            >
              <option value="">{language === 'en' ? 'Font Size (Default)' : 'Ukuran Font (Default)'}</option>
              <option value="12px">12px</option>
              <option value="14px">14px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
              <option value="20px">20px</option>
              <option value="24px">24px</option>
              <option value="32px">32px</option>
            </select>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* Inline Formats Cluster */}
            <div className="flex items-center gap-0.5">
              <button
                className={getBtnClass(activeFormats.bold)}
                title="Bold (Ctrl+B)"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editorJsRef.current?.toggleInlineFormat('bold')}
              >
                <IconBold className="h-4 w-4" />
              </button>
              <button
                className={getBtnClass(activeFormats.italic)}
                title="Italic (Ctrl+I)"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editorJsRef.current?.toggleInlineFormat('italic')}
              >
                <IconItalic className="h-4 w-4" />
              </button>
              <button
                className={getBtnClass(activeFormats.underline)}
                title="Underline (Ctrl+U)"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editorJsRef.current?.toggleInlineFormat('underline')}
              >
                <IconUnderline className="h-4 w-4" />
              </button>
              <button
                className={getBtnClass(activeFormats.strikethrough)}
                title="Strikethrough"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editorJsRef.current?.toggleInlineFormat('strikethrough')}
              >
                <IconStrikethrough className="h-4 w-4" />
              </button>
              <button
                className={getBtnClass(activeFormats.code)}
                title="Inline Code"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editorJsRef.current?.toggleInlineFormat('code')}
              >
                <IconCode className="h-4 w-4" />
              </button>
              <button
                className={getBtnClass(activeFormats.superscript)}
                title="Superscript"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editorJsRef.current?.toggleInlineFormat('superscript')}
              >
                <IconSuperscript className="h-4 w-4" />
              </button>
              <button
                className={getBtnClass(activeFormats.subscript)}
                title="Subscript"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editorJsRef.current?.toggleInlineFormat('subscript')}
              >
                <IconSubscript className="h-4 w-4" />
              </button>
              <button
                className={getBtnClass(activeFormats.link)}
                title="Insert Link"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editorJsRef.current?.toggleInlineFormat('link')}
              >
                <IconLink className="h-4 w-4" />
              </button>
              <button
                className={getBtnClass(activeFormats.highlight)}
                title={language === 'en' ? 'Highlight text' : 'Sorot Warna (Stabilo)'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleHighlightButtonClick(e, 'toolbar')}
              >
                <IconHighlight className="h-4 w-4" />
              </button>
            </div>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* Paragraph Alignment Cluster */}
            <div className="flex items-center gap-0.5">
              <button
                className={getBtnClass(currentAlignment === 'left')}
                title={language === 'en' ? 'Align Left' : 'Rata Kiri'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editorJsRef.current?.setBlockAlignment('left')}
              >
                <IconAlignLeft className="h-4 w-4" />
              </button>
              <button
                className={getBtnClass(currentAlignment === 'center')}
                title={language === 'en' ? 'Align Center' : 'Rata Tengah'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editorJsRef.current?.setBlockAlignment('center')}
              >
                <IconAlignCenter className="h-4 w-4" />
              </button>
              <button
                className={getBtnClass(currentAlignment === 'right')}
                title={language === 'en' ? 'Align Right' : 'Rata Kanan'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editorJsRef.current?.setBlockAlignment('right')}
              >
                <IconAlignRight className="h-4 w-4" />
              </button>
              <button
                className={getBtnClass(currentAlignment === 'justify')}
                title={language === 'en' ? 'Justify' : 'Rata Kanan-Kiri'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editorJsRef.current?.setBlockAlignment('justify')}
              >
                <IconAlignJustified className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: SISIPKAN (INSERT) - Tabel, Gambar, Kode & Rumus         */}
        {/* ============================================================== */}
        {activeRibbonTab === 'sisipkan' && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Visual Media & Tables Group */}
            <div className="flex items-center gap-1 bg-slate-100/70 dark:bg-slate-800/60 p-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                title={language === 'en' ? 'Insert Picture / Image' : 'Sisipkan Gambar / Foto'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setImageUrlInput('');
                  setIsImageModalOpen(true);
                }}
              >
                <IconPhoto className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>{language === 'en' ? 'Picture' : 'Gambar'}</span>
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                title={language === 'en' ? 'Insert Academic Table' : 'Sisipkan Tabel Akademik'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editorJsRef.current?.insertTable()}
              >
                <IconTable className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>{language === 'en' ? 'Table' : 'Tabel'}</span>
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                title={language === 'en' ? 'Insert Code Block' : 'Sisipkan Blok Kode'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editorJsRef.current?.insertCodeBlock()}
              >
                <IconCode className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>{language === 'en' ? 'Code Block' : 'Blok Kode'}</span>
              </button>

              {onOpenCrossReferenceModal && (
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                  title={language === 'id' ? 'Sisipkan Rujukan Gambar/Tabel (@fig, @tab)' : 'Insert Figure/Table Cross-Reference (@fig, @tab)'}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={onOpenCrossReferenceModal}
                >
                  <IconBookmark className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>{language === 'en' ? 'Cross-Ref' : 'Rujukan Silang'}</span>
                </button>
              )}
            </div>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

            {/* Formula & Mathematics Group */}
            <div className="flex items-center gap-1 bg-slate-100/70 dark:bg-slate-800/60 p-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                title={language === 'en' ? 'Insert Inline KaTeX Equation' : 'Sisipkan Rumus Inline KaTeX'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  editorJsRef.current?.saveSelectionRange();
                  setMathFormulaInput(selectedText || '');
                  setIsMathModalOpen(true);
                }}
              >
                <IconSum className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>{language === 'en' ? 'Inline Equation' : 'Rumus Inline'}</span>
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                title={language === 'en' ? 'Insert LaTeX Math Block' : 'Sisipkan Blok Rumus LaTeX'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editorJsRef.current?.insertMathBlock()}
              >
                <IconMath className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>{language === 'en' ? 'Math Block' : 'Blok Rumus'}</span>
              </button>

              <button
                type="button"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${isMathHelperOpen
                  ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700'
                  }`}
                title={language === 'en' ? 'Toggle LaTeX Formula Helper Panel' : 'Panel Bantuan Rumus LaTeX'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setIsMathHelperOpen(prev => !prev)}
              >
                <IconCalculator className="h-4 w-4 text-indigo-500" />
                <span>{language === 'en' ? 'Math Helper' : 'Bantuan Rumus'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: REFERENSI (REFERENCES) - Sitasi, Pustaka & Gaya Sitasi  */}
        {/* ============================================================== */}
        {activeRibbonTab === 'referensi' && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Citation Insertion Button */}
            <button
              type="button"
              data-tour="toolbar-citation"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              title={language === 'en' ? 'Insert Citation from Library or DOI (@)' : 'Sisipkan Sitasi dari Pustaka atau DOI (@)'}
              onMouseDown={(e) => e.preventDefault()}
              onClick={onInsertCitation}
            >
              <IconAt className="h-4 w-4" />
              <span>{language === 'en' ? 'Insert Citation' : 'Sisipkan Sitasi'}</span>
            </button>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

            {/* Citation Style Selector Dropdown */}
            {onChangeCitationStyle && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 hidden sm:inline">
                  {language === 'en' ? 'Citation Style:' : 'Gaya Sitasi:'}
                </span>
                <CitationStyleSelector
                  currentStyle={citationStyle || 'apa'}
                  onChangeStyle={onChangeCitationStyle}
                  language={language as 'en' | 'id'}
                  compact={true}
                />
              </div>
            )}

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

            {/* Cross References for Figures & Tables */}
            {onOpenCrossReferenceModal && (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                title={language === 'id' ? 'Sisipkan Rujukan Gambar/Tabel (@fig, @tab)' : 'Insert Figure/Table Cross-Reference (@fig, @tab)'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={onOpenCrossReferenceModal}
              >
                <IconBookmark className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>{language === 'en' ? 'Cross-Reference (@fig, @tab)' : 'Rujukan Silang (@fig, @tab)'}</span>
              </button>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: TINJAUAN & AI (REVIEW & AI) - Ghostwriter & Integritas  */}
        {/* ============================================================== */}
        {activeRibbonTab === 'tinjauan' && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Academic Integrity Barometer */}
            {documentContent && (
              <AcademicIntegrityPill
                content={documentContent}
                language={language as any}
                onClick={onOpenIntegrityTab}
              />
            )}

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

            {/* Ghostwriter AI Assistant */}
            {onToggleGhostwriter && (
              <GhostwriterToggle
                isEnabled={!!isGhostwriterEnabled}
                onToggle={onToggleGhostwriter}
                isLoading={isGhostwriterLoading}
                language={language}
              />
            )}

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

            {/* Mode Sugesti Switcher & Review Controls */}
            <SuggestingModeControl
              editorMode={editorMode}
              setEditorMode={setEditorMode}
              pendingCount={pendingSuggestionsCount}
              onBatchAcceptAll={onBatchAcceptSuggestions}
              onBatchRejectAll={onBatchRejectSuggestions}
              language={language as 'en' | 'id'}
              className="shrink-0"
            />
          </div>
        )}

        {/* ============================================================== */}
        {/* SISI KANAN RIBBON (PINNED) - Integritas, Ghostwriter & Status  */}
        {/* ============================================================== */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          {/* Tampilkan Quick Integrity & Ghostwriter saat berada di tab selain Tinjauan */}
          {activeRibbonTab !== 'tinjauan' && (
            <>
              {documentContent && (
                <AcademicIntegrityPill
                  content={documentContent}
                  language={language as any}
                  onClick={onOpenIntegrityTab}
                />
              )}
              {onToggleGhostwriter && (
                <GhostwriterToggle
                  isEnabled={!!isGhostwriterEnabled}
                  onToggle={onToggleGhostwriter}
                  isLoading={isGhostwriterLoading}
                  language={language}
                />
              )}
            </>
          )}

          {/* Label Status Dokumen */}
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/70 px-2.5 py-1 rounded border border-slate-200/50 dark:border-slate-700/50">
            {statusLabel}
          </div>
        </div>
      </div>
    </div>
  );
};

