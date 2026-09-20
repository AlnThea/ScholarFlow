import React from 'react';
import {
  IconArrowBackUp, IconArrowForwardUp, IconBold, IconItalic, IconUnderline,
  IconAlignLeft, IconAlignCenter, IconAlignRight, IconAlignJustified,
  IconStrikethrough, IconCode, IconSuperscript, IconSubscript, IconLink,
  IconHighlight, IconAt, IconPhoto, IconTable, IconSum, IconMath, IconCalculator
} from '@tabler/icons-react';

export function SharedToolbar({
  isCoEditor, editorMode, setEditorMode, language, editorJsRef, currentBlockType,
  currentFontSize, setCurrentFontSize, activeFormats, getBtnClass, handleHighlightButtonClick,
  currentAlignment, setImageUrlInput, setIsImageModalOpen, setMathFormulaInput, selectedText,
  setIsMathModalOpen, isMathHelperOpen, setIsMathHelperOpen
}: any) {
  return (
    <>
      {/* Navbar 2 – Academic Formatting Toolbar (Visible in Co-Editor mode only) */}
      {isCoEditor && (
        <div className="fixed top-14 left-0 right-0 z-30 flex flex-wrap items-center gap-1.5 border-b border-slate-200/50 bg-white px-6 py-2 shadow-sm shadow-slate-100/10 min-h-12 overflow-x-auto">
          {/* Mode Switcher Toggle (Edit Langsung vs Mode Sugesti) */}
          <div className="flex items-center rounded-lg bg-slate-100/90 p-0.5 border border-slate-200/80 mr-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setEditorMode('edit')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition cursor-pointer ${editorMode === 'edit'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
              title={language === 'id' ? 'Mode Edit Langsung' : 'Direct Edit Mode'}
            >
              <span>✍️</span>
              <span className="hidden sm:inline">{language === 'id' ? 'Edit Langsung' : 'Direct Edit'}</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('suggest')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition cursor-pointer ${editorMode === 'suggest'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
              title={language === 'id' ? 'Mode Sugesti / Track Changes' : 'Suggesting Mode'}
            >
              <span>💡</span>
              <span className="hidden sm:inline">{language === 'id' ? 'Mode Sugesti' : 'Suggesting'}</span>
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Undo / Redo */}
          <button
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
            title="Undo"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editorJsRef.current?.undo()}
          >
            <IconArrowBackUp className="h-4 w-4" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
            title="Redo"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editorJsRef.current?.redo()}
          >
            <IconArrowForwardUp className="h-4 w-4" />
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* Block Selection */}
          <select
            aria-label="Text style"
            value={currentBlockType}
            onChange={(e) => editorJsRef.current?.setBlockType(e.target.value)}
            className="h-8 rounded border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 cursor-pointer"
          >
            <option value="paragraph">Paragraph / Text</option>
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
            className="h-8 rounded border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 cursor-pointer"
          >
            <option value="">Font Size (Default)</option>
            <option value="12px">12px</option>
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
            <option value="24px">24px</option>
            <option value="32px">32px</option>
          </select>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* Inline Formats */}
          <button
            className={getBtnClass(activeFormats.bold)}
            title="Bold"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editorJsRef.current?.toggleInlineFormat('bold')}
          >
            <IconBold className="h-4 w-4" />
          </button>
          <button
            className={getBtnClass(activeFormats.italic)}
            title="Italic"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editorJsRef.current?.toggleInlineFormat('italic')}
          >
            <IconItalic className="h-4 w-4" />
          </button>
          <button
            className={getBtnClass(activeFormats.underline)}
            title="Underline"
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
            title="Highlight text"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleHighlightButtonClick}
          >
            <IconHighlight className="h-4 w-4" />
          </button>

          {/* Alignment Buttons */}
          <div className="h-5 w-px bg-slate-200 mx-1" />
          <button
            className={getBtnClass(currentAlignment === 'left')}
            title="Align Left"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editorJsRef.current?.setBlockAlignment('left')}
          >
            <IconAlignLeft className="h-4 w-4" />
          </button>
          <button
            className={getBtnClass(currentAlignment === 'center')}
            title="Align Center"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editorJsRef.current?.setBlockAlignment('center')}
          >
            <IconAlignCenter className="h-4 w-4" />
          </button>
          <button
            className={getBtnClass(currentAlignment === 'right')}
            title="Align Right"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editorJsRef.current?.setBlockAlignment('right')}
          >
            <IconAlignRight className="h-4 w-4" />
          </button>
          <button
            className={getBtnClass(currentAlignment === 'justify')}
            title="Justify"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editorJsRef.current?.setBlockAlignment('justify')}
          >
            <IconAlignJustified className="h-4 w-4" />
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* Citation Button */}
          <button
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-indigo-50 hover:bg-indigo-100/80 text-xs font-semibold text-indigo-700 transition cursor-pointer"
            title="Insert Inline Citation"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editorJsRef.current?.insertCitationSearch()}
          >
            <IconAt className="h-4 w-4" />
            Citation
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* Blocks & Math insertions */}
          <button
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer"
            title="Insert Image Block"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setImageUrlInput('');
              setIsImageModalOpen(true);
            }}
          >
            <IconPhoto className="h-4 w-4" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer"
            title="Insert Table Block"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editorJsRef.current?.insertTable()}
          >
            <IconTable className="h-4 w-4" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer"
            title="Insert Code Block"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editorJsRef.current?.insertCodeBlock()}
          >
            <IconCode className="h-4 w-4 text-indigo-600" />
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* Math Tools - Just Icons */}
          <button
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer"
            title="Insert Inline Equation"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              editorJsRef.current?.saveSelectionRange();
              setMathFormulaInput(selectedText || '');
              setIsMathModalOpen(true);
            }}
          >
            <IconSum className="h-4 w-4 text-indigo-600" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer"
            title="Insert Math Block (LaTeX)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editorJsRef.current?.insertMathBlock()}
          >
            <IconMath className="h-4 w-4 text-indigo-600" />
          </button>
          <button
            className={`p-1.5 rounded transition cursor-pointer ${isMathHelperOpen
              ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            title="Bantuan Rumus LaTeX (Math Helper)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setIsMathHelperOpen(prev => !prev)}
          >
            <IconCalculator className="h-4 w-4 text-indigo-500" />
          </button>
        </div>
      )}
    </>
  );
}
