import React from 'react';
import { createPortal } from 'react-dom';
import { IconX, IconCheck, IconTrash, IconSparkles, IconInfoCircle, IconRefresh, IconLanguage } from '@tabler/icons-react';

export const SharedBubbleMenu = (props: any) => {
  const {
    mounted, showBubbleMenu, bubbleMenuRect, language, selectedText,
    isCoEditor, isAiLoading, setShowBubbleMenu, handleAiImprovement,
    aiTargetLanguage, setAiTargetLanguage, setBubbleMode, bubbleMode,
    newCommentText, setNewCommentText, handleAddComment,
    handleOpenSuggestionModal
  } = props;

  return (
    <>
      {mounted && showBubbleMenu && bubbleMenuRect && typeof window !== 'undefined' && createPortal(
        <>
          {/* Overlay to dismiss menu */}
          <div
            className="fixed inset-0 z-[9997]"
            onClick={() => {
              setShowBubbleMenu(false);
              setBubbleMode('format');
              if (bubbleMode === 'citation') {
                editorJsRef.current?.cancelCitationSearch();
              }
            }}
          />
          <div
            className="fixed z-[9998] bg-white border border-slate-200/80 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] flex flex-col transition-all duration-150 backdrop-blur-sm overflow-hidden text-slate-800"
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
                  <button className={getBtnClass(activeFormats.highlight)} onMouseDown={e => e.preventDefault()} onClick={(e) => handleHighlightButtonClick(e)} title="Highlight text"><IconHighlight className="h-3.5 w-3.5" /></button>
                </div>

                {/* AI Configuration Section Header */}
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100/50 text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/40">
                  <span>{language === 'en' ? 'AI Settings' : 'Pengaturan AI'}</span>
                </div>

                {/* AI Dropdowns */}
                <div className="flex gap-2.5 px-3 py-2 border-b border-slate-100/60 bg-slate-50/10">
                  {/* Model Select */}
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <span className="text-[8px] font-bold text-slate-405 uppercase">Model</span>
                    <select
                      value={selectedAiModel}
                      onChange={(e) => setSelectedAiModel(e.target.value)}
                      className="w-full border border-slate-200 rounded px-1.5 py-1 text-[10px] text-slate-700 bg-white outline-none focus:border-indigo-500 transition cursor-pointer font-semibold"
                      title={language === 'en' ? 'Select AI Model' : 'Pilih Model AI'}
                    >
                      <option value="gemini">Gemini Flash</option>
                      <option value="llama3">Llama 3</option>
                      <option value="gemma2">Gemma 2</option>
                      <option value="claude">Claude 3.5 Sonnet</option>
                    </select>
                  </div>

                  {/* Tone Select */}
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <span className="text-[8px] font-bold text-slate-405 uppercase">{language === 'en' ? 'Tone' : 'Gaya'}</span>
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

                {/* Actions Section Header */}
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100/50 text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/40">
                  <span>{language === 'en' ? 'Assistant Actions' : 'Aksi Asisten'}</span>
                </div>

                {/* Actions List */}
                <div className="flex flex-col">
                  {/* Poles AI Button */}
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-slate-700 hover:bg-slate-50 transition font-semibold cursor-pointer border-b border-slate-100/40 disabled:opacity-50 disabled:bg-slate-50/50"
                    onMouseDown={e => e.preventDefault()}
                    disabled={isImproving}
                    onClick={() => handleImproveText('polish')}
                  >
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-650 shrink-0">
                      {isImproving ? (
                        <IconLoader className="h-4 w-4 animate-spin" />
                      ) : (
                        <IconSparkles className="h-4 w-4 text-indigo-600" />
                      )}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs text-slate-800">{language === 'en' ? 'Polish with AI' : 'Poles dengan AI'}</span>
                      <span className="text-[9px] text-slate-400 font-normal">
                        {language === 'en' ? 'Improve style and academic phrasing' : 'Tingkatkan gaya bahasa & akademis'}
                      </span>
                    </div>
                  </button>

                  {/* Parafrase Button */}
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-slate-700 hover:bg-slate-50 transition font-semibold cursor-pointer border-b border-slate-100/40 disabled:opacity-50 disabled:bg-slate-50/50"
                    onMouseDown={e => e.preventDefault()}
                    disabled={isImproving}
                    onClick={() => handleImproveText('paraphrase')}
                  >
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-605 shrink-0">
                      {isImproving ? (
                        <IconLoader className="h-4 w-4 animate-spin" />
                      ) : (
                        <IconLanguage className="h-4 w-4 text-indigo-600" />
                      )}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs text-slate-800">{language === 'en' ? 'Paraphrase Sentence' : 'Parafrase Kalimat'}</span>
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
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-slate-700 hover:bg-slate-50 transition font-semibold cursor-pointer border-b border-slate-100/40"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => {
                      setBubbleMode('citation');
                      setBubbleSearchQuery(selectedText);
                      runCitationSearchForQuery(selectedText);
                    }}
                  >
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-650 shrink-0">
                      <IconSearch className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs text-slate-800">{language === 'en' ? 'Find Citations' : 'Cari Kutipan / Sitasi'}</span>
                      <span className="text-[9px] text-slate-400 font-normal">
                        {language === 'en' ? 'Find scientific journal citations' : 'Temukan sitasi jurnal ilmiah'}
                      </span>
                    </div>
                  </button>

                  {/* Usulkan Perubahan (Mode Sugesti / Track Changes) */}
                  {editorMode === 'suggest' && (
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-slate-700 hover:bg-amber-50/60 transition font-semibold cursor-pointer border-b border-slate-100/40"
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => {
                        const sel = window.getSelection();
                        const selText = sel ? sel.toString().trim() : selectedText;
                        setSelectedTextForSuggestion(selText);
                        setNewTextForSuggestion(selText);
                        setIsSuggestionModalOpen(true);
                        setShowBubbleMenu(false);
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
                          {language === 'en' ? 'Propose text edit or deletion' : 'Usulkan pengubahan atau penghapusan teks'}
                        </span>
                      </div>
                    </button>
                  )}

                  {/* Tambah Komentar Button */}
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-slate-700 hover:bg-slate-50 transition font-semibold cursor-pointer"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => {
                      setBubbleMode('comment');
                      setNewCommentText('');
                    }}
                  >
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-650 shrink-0">
                      <IconMessage className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs text-slate-800">{language === 'en' ? 'Add Comment' : 'Tambah Komentar'}</span>
                      <span className="text-[9px] text-slate-400 font-normal">
                        {language === 'en' ? 'Leave feedback on selected text' : 'Beri masukan pada teks terpilih'}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* ── CITATION MODE ── */}
            {bubbleMode === 'citation' && (
              <div className="flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50/50">
                  <button
                    className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition flex-shrink-0 cursor-pointer"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => setBubbleMode('format')}
                    title="Back"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                  </button>
                  <IconSearch className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-700 truncate flex-1">
                    {window.document.querySelector('span[data-citation-search="true"]') ? 'Mencari Sitasi...' : `"${selectedText.slice(0, 40)}${selectedText.length > 40 ? '…' : ''}"`}
                  </span>
                  <button
                    className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition flex-shrink-0 cursor-pointer"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => { setShowBubbleMenu(false); setBubbleMode('format'); }}
                    title="Close"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>

                {/* Loading */}
                {isSearchingCitations && (
                  <div className="flex items-center justify-center gap-2 py-8 text-xs text-slate-450">
                    <svg className="h-4 w-4 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                    {language === 'en' ? 'Searching citations...' : 'Mencari sitasi...'}
                  </div>
                )}

                {/* Error */}
                {!isSearchingCitations && citationError && (
                  <div className="px-3 py-6 text-xs text-red-500 text-center font-sans">
                    {citationError}
                  </div>
                )}

                {/* No Results */}
                {!isSearchingCitations && !citationError && citationResults.length === 0 && (
                  <div className="px-3 py-6 text-xs text-slate-400 text-center italic font-sans">
                    {language === 'en' ? 'No citations found. Try different text.' : 'Kutipan tidak ditemukan. Coba pilih kata yang lain.'}
                  </div>
                )}

                {/* Results List */}
                {!isSearchingCitations && citationResults.length > 0 && (
                  <div className="flex flex-col gap-2.5 p-3 max-h-[300px] overflow-y-auto bg-slate-50/50">
                    {citationResults.map((candidate) => (
                      <div
                        key={candidate.reference_id}
                        className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col gap-2 text-left"
                      >
                        <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          <span className="text-slate-500">Jurnal</span>
                          <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                            🟢 {candidate.ranking_score}% Match
                          </span>
                        </div>

                        <div className="flex flex-col">
                          <h4 className="text-[11px] font-bold text-slate-800 leading-snug line-clamp-2">
                            {candidate.title}
                          </h4>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {candidate.authors.join(', ')} ({candidate.year || 'N/A'})
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const hasSearchSpan = !!window.document.querySelector('span[data-citation-search="true"]');
                              if (hasSearchSpan) {
                                editorJsRef.current?.insertCitationAtSearch(candidate.citation_label, candidate.reference_id);
                              } else {
                                editorJsRef.current?.insertCitation(candidate.citation_label, candidate.reference_id);
                              }
                              setCitationLibrary(prev => ({
                                ...prev,
                                [candidate.reference_id]: candidate
                              }));
                              setShowBubbleMenu(false);
                              setBubbleMode('format');
                            }}
                            className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded text-[9px] font-bold transition cursor-pointer shadow-sm shadow-indigo-100"
                          >
                            <IconQuote className="h-2.5 w-2.5" />
                            Cite
                          </button>
                          {candidate.url && (
                            <a
                              href={candidate.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-400 hover:text-slate-650 transition flex items-center gap-0.5 text-[9px] font-bold"
                            >
                              <span>View</span>
                              <IconExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── COMMENT MODE ── */}
            {bubbleMode === 'comment' && (
              <div className="flex flex-col p-4 bg-white font-sans text-slate-800">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                      onClick={() => setBubbleMode('format')}
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                    <span className="text-xs font-bold text-slate-805">
                      {language === 'en' ? 'Add Comment' : 'Tambah Komentar'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                    onClick={() => { setShowBubbleMenu(false); setBubbleMode('format'); }}
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>

                {/* Selected Text context */}
                <div className="bg-slate-50 border-l-2 border-indigo-500 px-3 py-1.5 rounded-r-md text-[10px] text-slate-500 italic mb-3 max-h-16 overflow-y-auto leading-relaxed">
                  "{selectedText}"
                </div>

                <div className="flex flex-col gap-3">
                  {/* Name Input for Guest */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      {language === 'en' ? 'Your Name' : 'Nama Anda'}
                    </label>
                    <input
                      type="text"
                      placeholder={
                        profile?.full_name ||
                        user?.email?.split('@')[0] ||
                        (language === 'en' ? 'Guest Co-Editor (optional)' : 'Guest Co-Editor (opsional)')
                      }
                      value={newCommentAuthor}
                      onChange={(e) => setNewCommentAuthor(e.target.value)}
                      className="w-full border border-slate-200/80 rounded-lg px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-indigo-400 transition"
                    />
                  </div>

                  {/* Comment Textarea */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      {language === 'en' ? 'Comment' : 'Komentar'}
                    </label>
                    <textarea
                      rows={3}
                      placeholder={language === 'en' ? 'Type your comment...' : 'Tulis komentar Anda...'}
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="w-full border border-slate-200/80 rounded-lg px-3 py-2 text-xs text-slate-700 outline-none focus:border-indigo-400 transition resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    disabled={isSubmittingComment || !newCommentText.trim()}
                    onClick={async () => {
                      if (!document || !newCommentText.trim()) return;
                      setIsSubmittingComment(true);
                      try {
                        // Find EditorJS block ID
                        let blockId: string | null = null;
                        const selection = window.getSelection();
                        if (selection && selection.rangeCount > 0) {
                          let node: Node | null = selection.anchorNode;
                          while (node && node !== window.document.body) {
                            if (node instanceof HTMLElement && node.hasAttribute('data-id')) {
                              blockId = node.getAttribute('data-id');
                              break;
                            }
                            node = node.parentNode;
                          }
                        }

                        const author = newCommentAuthor.trim() ||
                          profile?.full_name ||
                          user?.email?.split('@')[0] ||
                          'Guest Co-Editor';

                        // 1. Save comment
                        const added = await addComment(
                          document.id,
                          blockId,
                          selectedText,
                          newCommentText.trim(),
                          author
                        );

                        if (added) {
                          // Add inline comment mark highlight on editor canvas
                          editorJsRef.current?.addCommentMark(added.id, author);

                          // Update comments list
                          setComments(prev => [...prev, added]);

                          // 2. Trigger notification for owner
                          await createNotification(
                            document.id,
                            document.user_id,
                            author,
                            language === 'en'
                              ? `commented on "${selectedText.slice(0, 30)}${selectedText.length > 30 ? '...' : ''}": "${newCommentText.slice(0, 30)}${newCommentText.length > 30 ? '...' : ''}"`
                              : `mengomentari "${selectedText.slice(0, 30)}${selectedText.length > 30 ? '...' : ''}": "${newCommentText.slice(0, 30)}${newCommentText.length > 30 ? '...' : ''}"`
                          );

                          // Reset form and close
                          setNewCommentText('');
                          setShowBubbleMenu(false);
                          setBubbleMode('format');
                        }
                      } catch (e) {
                        console.error('Error submitting comment:', e);
                      } finally {
                        setIsSubmittingComment(false);
                      }
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-150"
                  >
                    {isSubmittingComment ? (
                      <>
                        <IconLoader className="h-3.5 w-3.5 animate-spin" />
                        {language === 'en' ? 'Submitting...' : 'Mengirim...'}
                      </>
                    ) : (
                      <>
                        {language === 'en' ? 'Submit Comment' : 'Kirim Komentar'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
        , window.document.body
      )}

    </>
  );
};
