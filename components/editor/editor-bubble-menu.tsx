import React from 'react';
import {
  IconBold, IconItalic, IconUnderline, IconStrikethrough, IconCode,
  IconLink, IconHighlight, IconSearch, IconSparkles, IconQuote, IconCheck, IconExternalLink, IconChevronDown
} from '@tabler/icons-react';

export type EditorBubbleMenuProps = {
  showBubbleMenu: boolean;
  bubbleMenuRect: DOMRect | null;
  bubbleMode: 'format' | 'citation';
  activeFormats: any;
  editorJsRef: any;
  handleHighlightButtonClick: (e: React.MouseEvent, source: string) => void;
  t: (key: string) => string;
  language: string;
  activePlanId: string;
  aiError: string | null;
  aiModels: any[];
  citationError: string | null;
  citationResults: any[];
  expandedCardId: string | null;
  findMostRelevantSentence: (abs: string | null | undefined, query: string) => string;
  isImproving: boolean;
  isSearchingCitations: boolean;
  onFindCitation: () => void;
  onImproveWriting: () => void;
  onInsertCitationCandidate: (candidate: any) => void;
  onParaphrase: () => void;
  selectedAiModel: string;
  selectedAiTone: string;
  selectedText: string;
  setBubbleMode: (mode: 'format' | 'citation') => void;
  setExpandedCardId: (id: string | null) => void;
  setIsPlanModalOpen: (open: boolean) => void;
  setIsSuggestionModalOpen: (open: boolean) => void;
  setNewTextForSuggestion: (text: string) => void;
  setSelectedAiModel: (model: string) => void;
  setSelectedAiTone: (tone: string) => void;
  setSelectedTextForSuggestion: (text: string) => void;
  setShowBubbleMenu: (show: boolean) => void;
  showAlertModal: (options: any) => void;
  editorMode: 'edit' | 'suggest';
  bubbleSearchQuery: string;
  setBubbleSearchQuery: (query: string) => void;
};

export function EditorBubbleMenu(props: EditorBubbleMenuProps) {
  const {
    showBubbleMenu, bubbleMenuRect, bubbleMode, activeFormats, editorJsRef, handleHighlightButtonClick,
    t, language, activePlanId, aiError, aiModels, citationError, citationResults, expandedCardId,
    findMostRelevantSentence, isImproving, isSearchingCitations, onFindCitation, onImproveWriting,
    onInsertCitationCandidate, onParaphrase, selectedAiModel, selectedAiTone, selectedText,
    setBubbleMode, setExpandedCardId, setIsPlanModalOpen, setIsSuggestionModalOpen, setNewTextForSuggestion,
    setSelectedAiModel, setSelectedAiTone, setSelectedTextForSuggestion, setShowBubbleMenu, showAlertModal,
    editorMode, bubbleSearchQuery, setBubbleSearchQuery
  } = props;

  const getBtnClass = (isActive: boolean) => {
    return `p-1.5 rounded transition ${isActive
      ? 'bg-indigo-100/80 text-indigo-700 font-bold'
      : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
      }`;
  };

  return (
    <>
                {showBubbleMenu && bubbleMenuRect && (      
                  <div      
                    className="fixed z-50 bg-white border border-slate-200/80 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex flex-col transition-all duration-150 backdrop-blur-sm overflow-hidden"      
                    style={(() => {      
                      const isCitation = bubbleMode === 'citation';      
                      const menuWidth = isCitation ? 480 : 310;      
                      const menuHeight = isCitation ? 390 : 310;      
                      const winH = typeof window !== 'undefined' ? window.innerHeight : 800;      
                      const winW = typeof window !== 'undefined' ? window.innerWidth : 1200;      
            
                      const anchorY = bubbleMenuRect.bottom > 0 ? bubbleMenuRect.bottom : bubbleMenuRect.top;      
                      const anchorX = bubbleMenuRect.left > 0 ? bubbleMenuRect.left : bubbleMenuRect.right;      
            
                      // Determine vertical position: pop UP if pointer is near bottom of viewport      
                      const shouldPopUp = (anchorY + menuHeight + 15 > winH) && (anchorY > menuHeight);      
                      let topPos = shouldPopUp      
                        ? anchorY - menuHeight - 10      
                        : anchorY + 10;      
            
                      // Clamp inside viewport [10, winH - menuHeight - 10]      
                      topPos = Math.max(10, Math.min(winH - menuHeight - 10, topPos));      
            
                      // Clamp left position inside viewport [10, winW - menuWidth - 10]      
                      let leftPos = bubbleMenuRect.width > 0      
                        ? bubbleMenuRect.left + bubbleMenuRect.width / 2 - menuWidth / 2      
                        : anchorX;      
            
                      if (leftPos + menuWidth > winW - 10) {      
                        leftPos = winW - menuWidth - 10;      
                      }      
                      leftPos = Math.max(10, leftPos);      
            
                      return {      
                        top: `${topPos}px`,      
                        left: `${leftPos}px`,      
                        width: `${menuWidth}px`,      
                      };      
                    })()}      
                  >      
                    {/* ── FORMAT MODE ── */}      
                    {bubbleMode === 'format' && (      
                      <div className="flex flex-col">      
                        {/* Inline format buttons */}      
                        <div className="p-2 flex items-center gap-0.5 justify-between px-3 bg-slate-50/20 border-b border-slate-100">      
                          <button className={getBtnClass(activeFormats.bold)} onMouseDown={e => e.preventDefault()} onClick={() => editorJsRef.current?.toggleInlineFormat('bold')} title="Bold"><IconBold className="h-3.5 w-3.5" /></button>      
                          <button className={getBtnClass(activeFormats.italic)} onMouseDown={e => e.preventDefault()} onClick={() => editorJsRef.current?.toggleInlineFormat('italic')} title="Italic"><IconItalic className="h-3.5 w-3.5" /></button>      
                          <button className={getBtnClass(activeFormats.underline)} onMouseDown={e => e.preventDefault()} onClick={() => editorJsRef.current?.toggleInlineFormat('underline')} title="Underline"><IconUnderline className="h-3.5 w-3.5" /></button>      
                          <button className={getBtnClass(activeFormats.strikethrough)} onMouseDown={e => e.preventDefault()} onClick={() => editorJsRef.current?.toggleInlineFormat('strikethrough')} title="Strikethrough"><IconStrikethrough className="h-3.5 w-3.5" /></button>      
                          <button className={getBtnClass(activeFormats.code)} onMouseDown={e => e.preventDefault()} onClick={() => editorJsRef.current?.toggleInlineFormat('code')} title="Code"><IconCode className="h-3.5 w-3.5" /></button>      
                          <button className={getBtnClass(activeFormats.link)} onMouseDown={e => e.preventDefault()} onClick={() => editorJsRef.current?.toggleInlineFormat('link')} title="Link"><IconLink className="h-3.5 w-3.5" /></button>      
                          <button className={getBtnClass(activeFormats.highlight)} onMouseDown={e => e.preventDefault()} onClick={(e) => handleHighlightButtonClick(e, 'bubble')} title="Highlight text"><IconHighlight className="h-3.5 w-3.5" /></button>      
                        </div>      
            
                        {/* AI Configuration Section Header */}      
                        <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100/50 text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/40">      
                          <span>{t('menu.settings')}</span>      
                        </div>      
            
                        {/* AI Dropdowns */}      
                        <div className="flex gap-2.5 px-3 py-2 border-b border-slate-100/60 bg-slate-50/10">      
                          {/* Model Select */}      
                          <div className="flex flex-col gap-1 flex-1 min-w-0">      
                            <span className="text-[8px] font-bold text-slate-400 uppercase">Model</span>      
                            <select      
                              value={selectedAiModel}      
                              onChange={(e) => setSelectedAiModel(e.target.value)}      
                              className="w-full border border-slate-200 rounded px-1.5 py-1 text-[10px] text-slate-700 bg-white outline-none focus:border-indigo-500 transition cursor-pointer font-semibold"      
                              title={language === 'en' ? 'Select AI Model' : 'Pilih Model AI'}      
                            >      
                              {aiModels && aiModels.length > 0 ? (      
                                aiModels.filter(m => m.is_enabled).map(m => {      
                                  const cleanName = m.name.replace(" (Direct)", "").replace(" (Free OR)", "").replace(" (Pro OR)", "");      
                                  const pLabel = m.provider_type === 'custom_openai' || (m.base_url && m.base_url.trim().length > 0)      
                                    ? 'Custom Proxy'      
                                    : (m.provider_type === 'gemini' || m.id === 'gemini' || m.model_id.includes('gemini'))      
                                      ? 'Gemini Direct'      
                                      : 'OpenRouter';      
                                  return (      
                                    <option key={m.id} value={m.id}>      
                                      {cleanName} [{pLabel}]      
                                    </option>      
                                  );      
                                })      
                              ) : (      
                                <>      
                                  <option value="gemini">Gemini [Gemini Direct]</option>      
                                  <option value="llama3">Llama 3 [OpenRouter]</option>      
                                  <option value="gemma2">Gemma 2 [OpenRouter]</option>      
                                  <option value="claude">Claude [OpenRouter]</option>      
                                </>      
                              )}      
                            </select>      
                          </div>      
            
                          {/* Tone Select */}      
                          <div className="flex flex-col gap-1 flex-1 min-w-0">      
                            <span className="text-[8px] font-bold text-slate-400 uppercase">{language === 'en' ? 'Tone' : 'Gaya'}</span>      
                            <select      
                              value={selectedAiTone}      
                              onChange={(e) => setSelectedAiTone(e.target.value)}      
                              className="w-full border border-slate-200 rounded px-1.5 py-1 text-[10px] text-slate-700 bg-white outline-none focus:border-indigo-500 transition cursor-pointer font-semibold"      
                              title={language === 'en' ? 'AI Polish Tone' : 'Gaya Poles AI'}      
                            >      
                              <option value="academic">{language === 'en' ? 'Academic' : 'Akademis'}</option>      
                              <option value="simplify">{language === 'en' ? 'Simplify' : 'Sederhana'}</option>      
                              <option value="shorten">{language === 'en' ? 'Condense' : 'Ringkas'}</option>      
                              <option value="expand">{language === 'en' ? 'Elaborate' : 'Elaborasi'}</option>      
                            </select>      
                          </div>      
                        </div>      
            
                        {/* Provider Engine Live Banner Indicator */}      
                        {(() => {      
                          const currentModelObj = aiModels?.find(m => m.id === selectedAiModel);      
                          const pType = currentModelObj?.provider_type || (selectedAiModel === 'gemini' ? 'gemini' : 'openrouter');      
                          const isCustom = pType === 'custom_openai' || (currentModelObj?.base_url && currentModelObj.base_url.trim().length > 0);      
                          const isGemini = pType === 'gemini' || selectedAiModel === 'gemini' || currentModelObj?.model_id?.includes('gemini');      
            
                          return (      
                            <div className="mx-3 my-1 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between text-[9px]">      
                              <span className="text-slate-400 font-bold uppercase tracking-wider">Engine Provider:</span>      
                              {isGemini ? (      
                                <span className="font-bold text-sky-700 flex items-center gap-1.5">      
                                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />      
                                  Google Gemini Direct API      
                                </span>      
                              ) : isCustom ? (      
                                <span className="font-bold text-amber-800 flex items-center gap-1.5" title={currentModelObj?.base_url || 'Custom Proxy'}>      
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />      
                                  Custom OpenAI Proxy API      
                                </span>      
                              ) : (      
                                <span className="font-bold text-purple-700 flex items-center gap-1.5">      
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />      
                                  OpenRouter API      
                                </span>      
                              )}      
                            </div>      
                          );      
                        })()}      
            
                        {/* Actions Section Header */}      
                        <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100/50 text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/40">      
                          <span>{t('menu.actions')}</span>      
                        </div>      
            
                        {/* Actions List */}      
                        <div className="flex flex-col">      
                          {/* Usulkan Perubahan (Mode Sugesti / Track Changes) */}      
                          {editorMode === 'suggest' && (      
                            <button      
                              className="w-full flex items-center gap-3 px-3 py-2 text-left text-slate-700 hover:bg-amber-50/60 transition font-semibold cursor-pointer border-b border-slate-100/40"      
                              onMouseDown={e => e.preventDefault()}      
                              onClick={() => {      
                                const sel = window.getSelection();      
                                const selText = sel ? sel.toString().trim() : '';      
                                setSelectedTextForSuggestion(selText);      
                                setNewTextForSuggestion(selText);      
                                setIsSuggestionModalOpen(true);      
                              }}      
                            >      
                              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 shrink-0">      
                                <IconSparkles className="h-4 w-4 text-amber-600" />      
                              </div>      
                              <div className="flex flex-col text-left">      
                                <span className="text-xs text-amber-900 font-bold">      
                                  💡 {language === 'en' ? 'Suggest Change (Track Changes)' : 'Usulan Perubahan (Track Changes)'}      
                                </span>      
                                <span className="text-[9px] text-amber-700 font-normal">      
                                  {language === 'en' ? 'Propose text edit or deletion as suggestion' : 'Usulkan pengubahan atau penghapusan teks'}      
                                </span>      
                              </div>      
                            </button>      
                          )}      
            
                          {/* Poles AI Button */}      
                          <button      
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-slate-700 hover:bg-slate-50 transition font-semibold cursor-pointer border-b border-slate-100/40 disabled:opacity-50 disabled:bg-slate-50/50"      
                            onMouseDown={e => e.preventDefault()}      
                            disabled={isImproving}      
                            onClick={() => {      
                              const modelObj = aiModels.find(m => m.id === selectedAiModel);      
                              const isPremium = modelObj ? modelObj.is_premium : (selectedAiModel === 'claude');      
                              if (isPremium && activePlanId === 'free') {      
                                showAlertModal(      
                                  'Akses Model Premium 🔒',      
                                  language === 'en'      
                                    ? `Model "${modelObj?.name || 'Premium'}" is exclusive to Pro Writer plans. Please upgrade your account to access this model.`      
                                    : `Model "${modelObj?.name || 'Premium'}" khusus untuk pengguna paket Pro Writer. Silakan upgrade akun Anda untuk mengakses model ini.`,      
                                  'warning',      
                                  () => setIsPlanModalOpen(true)      
                                );      
                              } else {      
                                onImproveWriting();      
                                setShowRightSidebar(true);      
                              }      
                            }}      
                          >      
                            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">      
                              {isImproving ? (      
                                <IconLoader className="h-4 w-4 animate-spin" />      
                              ) : (      
                                <IconSparkles className="h-4 w-4" />      
                              )}      
                            </div>      
                            <div className="flex flex-col text-left">      
                              <span className="text-xs text-slate-800">{t('menu.polish')}</span>      
                              <span className="text-[9px] text-slate-400 font-normal">      
                                {language === 'en' ? 'Improve style and academic phrasing' : 'Meningkatkan gaya bahasa & akademis'}      
                              </span>      
                            </div>      
                          </button>      
            
                          {/* Parafrase Button */}      
                          <button      
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-slate-700 hover:bg-slate-50 transition font-semibold cursor-pointer border-b border-slate-100/40 disabled:opacity-50 disabled:bg-slate-50/50"      
                            onMouseDown={e => e.preventDefault()}      
                            disabled={isImproving}      
                            onClick={() => {      
                              const modelObj = aiModels.find(m => m.id === selectedAiModel);      
                              const isPremium = modelObj ? modelObj.is_premium : (selectedAiModel === 'claude');      
                              if (isPremium && activePlanId === 'free') {      
                                showAlertModal(      
                                  'Akses Model Premium 🔒',      
                                  language === 'en'      
                                    ? `Model "${modelObj?.name || 'Premium'}" is exclusive to Pro Writer plans. Please upgrade your account to access this model.`      
                                    : `Model "${modelObj?.name || 'Premium'}" khusus untuk pengguna paket Pro Writer. Silakan upgrade akun Anda untuk mengakses model ini.`,      
                                  'warning',      
                                  () => setIsPlanModalOpen(true)      
                                );      
                              } else {      
                                onParaphrase();      
                                setShowRightSidebar(true);      
                              }      
                            }}      
                          >      
                            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">      
                              {isImproving ? (      
                                <IconLoader className="h-4 w-4 animate-spin" />      
                              ) : (      
                                <IconLanguage className="h-4 w-4" />      
                              )}      
                            </div>      
                            <div className="flex flex-col text-left">      
                              <span className="text-xs text-slate-800">{t('menu.paraphrase')}</span>      
                              <span className="text-[9px] text-slate-400 font-normal">      
                                {language === 'en' ? 'Rewrite selected sentence (AI)' : 'Tulis ulang kalimat terpilih (AI)'}      
                              </span>      
                            </div>      
                          </button>      
            
                          {/* Inline Math (LaTeX) Button */}      
                          <button      
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-slate-700 hover:bg-slate-50 transition font-semibold cursor-pointer border-b border-slate-100/40"      
                            onMouseDown={e => e.preventDefault()}      
                            onClick={() => {      
                              setShowBubbleMenu(false);      
                              editorJsRef.current?.insertInlineEquation();      
                            }}      
                          >      
                            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">      
                              <IconSum className="h-4 w-4 text-indigo-600" />      
                            </div>      
                            <div className="flex flex-col text-left">      
                              <span className="text-xs text-slate-800">{language === 'en' ? 'Mathematical Equation (LaTeX)' : 'Rumus Matematika (LaTeX)'}</span>      
                              <span className="text-[9px] text-slate-400 font-normal">      
                                {language === 'en' ? 'Convert selected text to equation' : 'Ubah teks terpilih menjadi rumus'}      
                              </span>      
                            </div>      
                          </button>      
            
                          {/* Sitasi Button */}      
                          <button      
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-slate-700 hover:bg-slate-50 transition font-semibold cursor-pointer"      
                            onMouseDown={e => e.preventDefault()}      
                            onClick={() => {      
                              setBubbleMode('citation');      
                              onFindCitation();      
                              setShowRightSidebar(true);      
                            }}      
                          >      
                            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">      
                              <IconSearch className="h-4 w-4" />      
                            </div>      
                            <div className="flex flex-col text-left">      
                              <span className="text-xs text-slate-800">{language === 'en' ? 'Find Citations' : 'Cari Kutipan / Sitasi'}</span>      
                              <span className="text-[9px] text-slate-400 font-normal">      
                                {language === 'en' ? 'Find scientific journal citations' : 'Temukan sitasi jurnal ilmiah'}      
                              </span>      
                            </div>      
                          </button>      
                        </div>      
            
                        {aiError && (      
                          <div className="m-2 p-2 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-[10px] leading-normal shrink-0">      
                            {aiError}      
                          </div>      
                        )}      
                      </div>      
                    )}      
            
                    {/* ── CITATION MODE ── */}      
                    {bubbleMode === 'citation' && (      
                      <div className="flex flex-col">      
                        {/* Header */}      
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">      
                          <button      
                            className="p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition flex-shrink-0"      
                            onMouseDown={e => e.preventDefault()}      
                            onClick={() => setBubbleMode('format')}      
                            title="Back"      
                          >      
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>      
                          </button>      
                          <IconSearch className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />      
                          <span className="text-xs font-semibold text-slate-700 truncate flex-1">      
                            {typeof document !== 'undefined' && document.querySelector('span[data-citation-search="true"]') ? 'Mencari Sitasi...' : `"${selectedText.slice(0, 40)}${selectedText.length > 40 ? '…' : ''}"`}      
                          </span>      
                          <button      
                            className="p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition flex-shrink-0"      
                            onMouseDown={e => e.preventDefault()}      
                            onClick={() => { setShowBubbleMenu(false); setBubbleMode('format'); }}      
                            title="Close"      
                          >      
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>      
                          </button>      
                        </div>      
            
                        {/* Loading */}      
                        {isSearchingCitations && (      
                          <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-400">      
                            <svg className="h-4 w-4 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">      
                              <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />      
                              <path d="M12 2a10 10 0 0 1 10 10" />      
                            </svg>      
                            Searching citations...      
                          </div>      
                        )}      
            
                        {/* Error */}      
                        {!isSearchingCitations && citationError && (      
                          <div className="px-3 py-4 text-xs text-red-500 text-center">      
                            {citationError}      
                          </div>      
                        )}      
            
                        {/* Results */}      
                        {!isSearchingCitations && !citationError && citationResults.length === 0 && (      
                          <div className="px-3 py-4 text-xs text-slate-400 text-center">      
                            No citations found. Try selecting different text.      
                          </div>      
                        )}      
            
                        {!isSearchingCitations && citationResults.length > 0 && (      
                          <div className="flex flex-col gap-3 p-3 max-h-[380px] overflow-y-auto bg-slate-50/50">      
                            {citationResults.map((candidate) => (      
                              <div      
                                key={candidate.reference_id}      
                                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-3 text-left"      
                              >      
                                {/* Top row: Article header details */}      
                                <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">      
                                  <div className="flex items-center gap-1.5">      
                                    <span className="uppercase tracking-wider font-bold text-slate-500">Article</span>      
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${candidate.ranking_score >= 80      
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'      
                                      : candidate.ranking_score >= 50      
                                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/50'      
                                        : 'bg-slate-100 text-slate-600 border border-slate-200'      
                                      }`}>      
                                      🟢 {candidate.ranking_score}% Match      
                                    </span>      
                                  </div>      
                                  <div className="flex items-center gap-3">      
                                    <span>Cited by {candidate.cited_by_count}</span>      
                                    <span>IF {((candidate.cited_by_count * 0.02) + 0.11).toFixed(2)}</span>      
                                  </div>      
                                </div>      
            
                                {/* Title, Authors, Journal & Year */}      
                                <div className="flex flex-col gap-1">      
                                  <h4 className="text-xs font-bold leading-snug text-slate-800 line-clamp-2" title={candidate.title}>      
                                    {candidate.title}      
                                  </h4>      
                                  <p className="text-[11px] font-semibold text-slate-500 leading-tight">      
                                    {candidate.authors.length > 0 ? candidate.authors.join(', ') : 'Author data unavailable'}      
                                  </p>      
                                  <p className="text-[10px] text-slate-400 leading-tight">      
                                    {candidate.journal ? `${candidate.journal} · ` : ''}{candidate.year || 'N/A'}      
                                  </p>      
                                </div>      
            
                                {/* Abstract text with left border line */}      
                                <div className="pl-3 border-l-2 border-slate-300 text-[11px] leading-relaxed text-slate-500">      
                                  <p className="line-clamp-2 italic">      
                                    {candidate.abstract      
                                      ? candidate.abstract      
                                      : 'No abstract or description summary available for this article.'}      
                                  </p>      
                                </div>      
            
                                {/* Divider */}      
                                <div className="h-px bg-slate-100 w-full" />      
            
                                {/* Bottom Row: Actions (Left) & Favorite/Source Icon (Right) */}      
                                <div className="flex items-center justify-between gap-4">      
                                  {/* Left: Action Buttons */}      
                                  <div className="flex items-center gap-2 flex-shrink-0">      
                                    {/* Tombol Cite */}      
                                    <button      
                                      type="button"      
                                      onClick={() => {      
                                        const hasSearchSpan = !!document.querySelector('span[data-citation-search="true"]');      
                                        if (hasSearchSpan) {      
                                          editorJsRef.current?.insertCitationAtSearch(candidate.citation_label, candidate.reference_id);      
                                          onInsertCitationCandidate(candidate, true);      
                                        } else {      
                                          onInsertCitationCandidate(candidate);      
                                        }      
                                        setShowBubbleMenu(false);      
                                        setBubbleMode('format');      
                                      }}      
                                      className="inline-flex items-center justify-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-[10px] font-semibold shadow-sm transition whitespace-nowrap"      
                                    >      
                                      <IconQuote className="h-3 w-3" />      
                                      Cite      
                                    </button>      
            
                                    {/* Tombol View */}      
                                    <button      
                                      type="button"      
                                      onClick={() => candidate.url && window.open(candidate.url, '_blank', 'noopener,noreferrer')}      
                                      disabled={!candidate.url}      
                                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 px-3 py-1.5 text-[10px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"      
                                    >      
                                      <IconExternalLink className="h-3 w-3" />      
                                      View      
                                    </button>      
            
                                    {/* Tombol Konteks (Toggle) */}      
                                    {candidate.abstract && (      
                                      <button      
                                        type="button"      
                                        onClick={() => setExpandedCardId(prev => prev === candidate.reference_id ? null : candidate.reference_id)}      
                                        className={`inline-flex items-center justify-center gap-1 rounded-lg border px-3 py-1.5 text-[10px] font-semibold transition whitespace-nowrap ${expandedCardId === candidate.reference_id      
                                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'      
                                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800'      
                                          }`}      
                                      >      
                                        {expandedCardId === candidate.reference_id ? 'Tutup Kutipan' : 'Lihat Kutipan'}      
                                      </button>      
                                    )}      
                                  </div>      
            
                                  {/* Right: Source Badge & Fav Icon */}      
                                  <div className="flex items-center gap-2 shrink-0">      
                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${candidate.source === 'OpenAlex'      
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'      
                                      : 'bg-blue-50 text-blue-700 border border-blue-200'      
                                      }`} title={`Source: ${candidate.source}`}>      
                                      {candidate.source}      
                                    </span>      
                                    <button      
                                      type="button"      
                                      className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-50 transition"      
                                      title="Add to favorites"      
                                    >      
                                      <IconHeart className="h-3.5 w-3.5" />      
                                    </button>      
                                  </div>      
                                </div>      
            
                                {/* Expanded context section */}      
                                {expandedCardId === candidate.reference_id && candidate.abstract && (      
                                  <div className="mt-3 p-3 rounded-lg bg-indigo-50/50 border border-indigo-100/80 text-[11px] leading-relaxed text-slate-700 animate-fade-in">      
                                    <span className="block text-[9px] uppercase tracking-wider text-indigo-600 font-bold mb-1">Kutipan Terkait dari Jurnal:</span>      
                                    <p className="italic font-medium text-slate-800">      
                                      "{findMostRelevantSentence(candidate.abstract, selectedText)}"      
                                    </p>      
                                  </div>      
                                )}      
                              </div>      
                            ))}      
                          </div>      
                        )}      
                      </div>      
                    )}      
                  </div>      
                )}      
    </>
  );
}