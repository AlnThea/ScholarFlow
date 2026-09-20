import React from 'react';
import { 
  IconBold, IconItalic, IconUnderline, IconStrikethrough, IconCode, 
  IconLink, IconHighlight, IconSparkles, IconLoader, IconLanguage, IconSum, IconSearch
} from '@tabler/icons-react';

export type FormatMenuProps = {
  activeFormats: any;
  editorJsRef: any;
  handleHighlightButtonClick: (e: React.MouseEvent<HTMLButtonElement>, source: 'toolbar' | 'bubble') => void;
  t: (key: string) => string;
  language: string;
  selectedAiModel: string;
  setSelectedAiModel: (model: string) => void;
  aiModels: any[];
  selectedAiTone: string;
  setSelectedAiTone: (tone: string) => void;
  editorMode: 'edit' | 'suggest';
  setSelectedTextForSuggestion: (text: string) => void;
  setNewTextForSuggestion: (text: string) => void;
  setIsSuggestionModalOpen: (open: boolean) => void;
  isImproving: boolean;
  activePlanId: string;
  showAlertModal: (title: string, message: string, type: 'warning' | 'info' | 'error', callback: () => void) => void;
  setIsPlanModalOpen: (open: boolean) => void;
  onImproveWriting: () => void;
  setShowRightSidebar?: (show: boolean) => void;
  onParaphrase: () => void;
  setShowBubbleMenu: (show: boolean) => void;
  setBubbleMode: (mode: 'format' | 'citation') => void;
  onFindCitation: () => void;
  aiError: string | null;
};

export function FormatMenu({
  activeFormats, editorJsRef, handleHighlightButtonClick, t, language,
  selectedAiModel, setSelectedAiModel, aiModels, selectedAiTone, setSelectedAiTone,
  editorMode, setSelectedTextForSuggestion, setNewTextForSuggestion, setIsSuggestionModalOpen,
  isImproving, activePlanId, showAlertModal, setIsPlanModalOpen, onImproveWriting,
  setShowRightSidebar, onParaphrase, setShowBubbleMenu, setBubbleMode, onFindCitation, aiError
}: FormatMenuProps) {
  const getBtnClass = (isActive: boolean) => {
    return `p-1.5 rounded transition $`;
  };

  return (
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
      
                                setShowRightSidebar?.(true);
      
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
      
                                setShowRightSidebar?.(true);
      
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
      
                              setShowRightSidebar?.(true);
      
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
  );
}
