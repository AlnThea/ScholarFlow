import React from 'react';
import { IconX, IconMessage, IconCheck, IconTrash, IconSparkles } from '@tabler/icons-react';

export const SharedSidebar = (props: any) => {
  const {
    showCommentsSidebar, setShowCommentsSidebar, language, isCoEditor, activeUsers,
    sidebarTab, setSidebarTab, comments, onResolveComment, suggestions,
    onAcceptSuggestion, onRejectSuggestion, user
  } = props;

  return (
    <>
        {showCommentsSidebar && (
          <aside className="fixed top-0 right-0 h-screen w-80 md:w-96 bg-white border-l border-slate-200 z-[99] shadow-2xl flex flex-col font-sans text-slate-800 transition-all duration-300 animate-slide-in">

            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <IconMessage className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-none">
                    {language === 'id' ? 'Komentar Dokumen' : 'Document Comments'}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {language === 'id' ? 'Diskusi & Masukan Co-Editor' : 'Co-Editor Feedback & Discussion'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCommentsSidebar(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title={language === 'id' ? 'Tutup Sidebar' : 'Close Sidebar'}
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            {/* Sub-Tabs: Komentar vs Usulan vs Selesai */}
            <div className="px-4 pt-3 pb-2 border-b border-slate-100 bg-white">
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100/80 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setCommentSubTab('active')}
                  className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer text-[10px] ${commentSubTab === 'active'
                      ? 'bg-white text-indigo-600 shadow-sm font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <span>{language === 'id' ? 'Komentar' : 'Comments'}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${commentSubTab === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                    {comments.filter(c => !c.resolved).length}
                  </span>
                </button>

                <button
                  onClick={() => setCommentSubTab('suggestions' as any)}
                  className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer text-[10px] ${(commentSubTab as string) === 'suggestions'
                      ? 'bg-white text-amber-700 shadow-sm font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <span>💡 {language === 'en' ? 'Suggestions' : 'Usulan'}</span>
                </button>

                <button
                  onClick={() => setCommentSubTab('resolved')}
                  className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer text-[10px] ${commentSubTab === 'resolved'
                      ? 'bg-white text-emerald-600 shadow-sm font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <span>{language === 'id' ? 'Selesai' : 'Resolved'}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${commentSubTab === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                    ✓ {comments.filter(c => c.resolved).length}
                  </span>
                </button>
              </div>

              {/* Sub-Filter Toggle for Suggestions in Shared/Co-Editor mode */}
              {(commentSubTab as string) === 'suggestions' && (
                <div className="flex items-center gap-1 mt-2 p-1 bg-slate-100/80 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setSuggestionSubTab('active')}
                    className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer text-[10px] ${suggestionSubTab === 'active'
                        ? 'bg-white text-indigo-700 shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    <span>💡 {language === 'id' ? 'Aktif' : 'Active'}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${suggestionSubTab === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                      }`}>
                      {suggestions.filter(s => s.status === 'pending').length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSuggestionSubTab('history')}
                    className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer text-[10px] ${suggestionSubTab === 'history'
                        ? 'bg-white text-indigo-700 shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    <span>📜 {language === 'id' ? 'Riwayat' : 'History'}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${suggestionSubTab === 'history' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                      }`}>
                      {suggestions.filter(s => s.status === 'accepted' || s.status === 'rejected').length}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 bg-slate-50/30">
              {commentSubTab === 'active' ? (
                comments.filter(c => !c.resolved).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-400 mb-3">
                      <IconMessage className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-semibold text-slate-600">
                      {language === 'id' ? 'Tidak ada komentar aktif' : 'No active comments'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                      {language === 'id' ? 'Blok teks pada editor untuk menambahkan komentar baru.' : 'Highlight text in the editor to add a new comment.'}
                    </p>
                  </div>
                ) : (
                  comments.filter(c => !c.resolved).map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        editorJsRef.current?.scrollToCommentMark(c.id);
                      }}
                      className="group border border-slate-200/80 hover:border-indigo-300 bg-white hover:bg-indigo-50/20 transition-all duration-200 rounded-2xl p-3.5 flex flex-col gap-2.5 text-left cursor-pointer shadow-sm hover:shadow-md hover:shadow-indigo-500/5 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-extrabold flex items-center justify-center shrink-0">
                            {c.author_name ? c.author_name.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <span className="text-xs font-bold text-slate-800 truncate">{c.author_name}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-medium shrink-0">
                          {new Date(c.created_at).toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {c.selected_text && (
                        <div className="bg-amber-50/60 border-l-2 border-amber-400 px-2.5 py-1.5 rounded-r-lg text-[10px] text-amber-900 font-medium italic truncate">
                          "{c.selected_text}"
                        </div>
                      )}

                      <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                        {c.comment_text}
                      </p>

                      <div className="pt-1 flex items-center justify-between text-[9px] text-indigo-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>{language === 'id' ? 'Klik untuk sorot di canvas' : 'Click to highlight in canvas'} →</span>
                      </div>
                    </div>
                  ))
                )
              ) : (commentSubTab as string) === 'suggestions' ? (
                (() => {
                  const filteredSugList = suggestionSubTab === 'active'
                    ? suggestions.filter(s => s.status === 'pending')
                    : suggestions.filter(s => s.status === 'accepted' || s.status === 'rejected');

                  if (filteredSugList.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-16 px-4 text-center font-sans">
                        <div className="p-3 rounded-2xl bg-amber-50 text-amber-500 mb-3">
                          <IconSparkles className="h-6 w-6" />
                        </div>
                        <p className="text-xs font-semibold text-slate-600">
                          {suggestionSubTab === 'active'
                            ? (language === 'id' ? 'Belum ada usulan revisi aktif' : 'No active suggestions yet')
                            : (language === 'id' ? 'Belum ada riwayat usulan selesai' : 'No suggestion history yet')}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                          {suggestionSubTab === 'active'
                            ? (language === 'id' ? 'Aktifkan Mode Sugesti atau blok teks untuk mengusulkan perubahan.' : 'Toggle Suggesting mode to propose edits.')
                            : (language === 'id' ? 'Usulan yang telah diterima atau ditolak akan muncul di sini.' : 'Accepted or rejected suggestions will appear here.')}
                        </p>
                      </div>
                    );
                  }

                  return filteredSugList.map((sug) => {
                    const authorName = sug.author_name || sug.author || (language === 'id' ? 'Kolaborator' : 'Collaborator');
                    const deletedText = sug.selected_text || sug.old_text;
                    const replacementText = sug.suggested_text || sug.new_text;
                    const currentUserName = user?.user_metadata?.full_name || profile?.full_name || user?.email?.split('@')[0] || '';
                    const isCreatedByMe = (user?.id && sug.user_id && user.id === sug.user_id) || (sug.author_name && currentUserName && sug.author_name.toLowerCase() === currentUserName.toLowerCase());

                    const isAccepted = sug.status === 'accepted';
                    const isRejected = sug.status === 'rejected';
                    const isPending = sug.status === 'pending';

                    const containerStyle = isAccepted
                      ? 'border border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/50 transition rounded-2xl p-3.5 flex flex-col gap-2.5 text-left shadow-xs font-sans'
                      : isRejected
                        ? 'border border-rose-200 bg-rose-50/30 hover:bg-rose-50/50 transition rounded-2xl p-3.5 flex flex-col gap-2.5 text-left shadow-xs font-sans'
                        : 'border border-amber-200/90 bg-amber-50/20 hover:bg-amber-50/40 transition rounded-2xl p-3.5 flex flex-col gap-2.5 text-left shadow-xs font-sans';

                    const badgeStyle = isAccepted
                      ? 'text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200'
                      : isRejected
                        ? 'text-[9px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full border border-rose-200'
                        : 'text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200/60';

                    const statusBadgeText = isAccepted
                      ? `✓ ${language === 'id' ? 'Diterima' : 'Accepted'}`
                      : isRejected
                        ? `✕ ${language === 'id' ? 'Ditolak' : 'Rejected'}`
                        : `⏳ ${language === 'id' ? 'Menunggu' : 'Pending'}`;

                    return (
                      <div
                        key={sug.id}
                        className={containerStyle}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-slate-800 truncate">
                            💡 {language === 'id' ? 'Usulan oleh' : 'Suggestion by'} {authorName}
                          </span>
                          <span className={badgeStyle}>
                            {statusBadgeText}
                          </span>
                        </div>

                        {deletedText && (
                          <div className="bg-rose-50 border-l-2 border-rose-400 px-2.5 py-1.5 rounded-r-lg text-[10px] text-rose-900 line-through leading-relaxed">
                            {language === 'id' ? 'Dihapus:' : 'Deleted:'} "{deletedText}"
                          </div>
                        )}

                        {replacementText && (
                          <div className="bg-emerald-50 border-l-2 border-emerald-400 px-2.5 py-1.5 rounded-r-lg text-[10px] text-emerald-900 font-bold leading-relaxed">
                            {language === 'id' ? 'Pengganti:' : 'Replacement:'} "{replacementText}"
                          </div>
                        )}

                        {isPending && (
                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-100 mt-1">
                            {isCreatedByMe ? (
                              <span className="text-[10px] text-slate-500 font-medium italic">
                                ⏳ {language === 'id' ? 'Menunggu Peninjauan Pemilik' : 'Pending Review by Owner'}
                              </span>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (sug && document?.user_id) {
                                      const recipientId = (sug.user_id && isValidUuid(sug.user_id) && sug.user_id !== user?.id) ? sug.user_id : document.user_id;
                                      const myName = profile?.full_name || user?.email?.split('@')[0] || (language === 'id' ? 'Tamu' : 'Guest');
                                      createNotification(
                                        docId,
                                        recipientId,
                                        myName,
                                        language === 'en'
                                          ? `rejected the suggestion: "${(sug.suggested_text || sug.selected_text || sug.new_text || sug.old_text || '').slice(0, 30)}..."`
                                          : `menolak usulan: "${(sug.suggested_text || sug.selected_text || sug.new_text || sug.old_text || '').slice(0, 30)}..."`
                                      );
                                    }
                                    updateSuggestionStatus(docId, sug.id, 'rejected').then(() => fetchSuggestions(docId).then(setSuggestions));
                                  }}
                                  className="px-3 py-1.5 text-[10px] font-bold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 transition rounded-xl border border-rose-200 cursor-pointer"
                                >
                                  ✕ {language === 'id' ? 'Tolak' : 'Reject'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    acceptedLocallyRef.current.add(sug.id);
                                    processedAcceptedSuggestionsRef.current.add(sug.id);
                                    editorJsRef.current?.acceptSuggestion?.(sug.id);
                                    if (sug && document?.content) {
                                      try {
                                        let rawContent = typeof document.content === 'string'
                                          ? JSON.parse(document.content)
                                          : document.content;

                                        let changed = false;
                                        if (rawContent && Array.isArray(rawContent.blocks)) {
                                          rawContent.blocks = rawContent.blocks.map((block: any) => {
                                            if (block.data && typeof block.data.text === 'string') {
                                              let text = block.data.text;
                                              if (text.includes('<del') || text.includes('<ins')) {
                                                text = text.replace(/<del[^>]*>.*?<\/del>/gi, '').replace(/<ins[^>]*>(.*?)<\/ins>/gi, '$1');
                                                changed = true;
                                              }
                                              const targetText = sug.selected_text ? sug.selected_text.trim() : (sug.old_text ? sug.old_text.trim() : '');
                                              if (targetText && text.toLowerCase().includes(targetText.toLowerCase())) {
                                                const regex = new RegExp(targetText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                                                text = text.replace(regex, sug.suggested_text ? sug.suggested_text.trim() : (sug.new_text ? sug.new_text.trim() : ''));
                                                changed = true;
                                              }
                                              block.data.text = text;
                                            }
                                            return block;
                                          });
                                        }

                                        if (changed) {
                                          const updatedContentStr = JSON.stringify(rawContent);
                                          lastSavedContentRef.current = getContentComparisonString(rawContent);
                                          setDocument(prev => prev ? { ...prev, content: updatedContentStr } : prev);
                                          updateSharedDocument(docId, { title: document.title || 'Untitled', content: updatedContentStr, settings: document.settings });
                                          setTimeout(() => {
                                            editorJsRef.current?.renderContent?.(rawContent);
                                          }, 100);
                                        }
                                      } catch (e) {
                                        console.error('Failed smart suggestion replacement:', e);
                                      }
                                    }
                                    if (sug && document?.user_id) {
                                      const recipientId = (sug.user_id && isValidUuid(sug.user_id) && sug.user_id !== user?.id) ? sug.user_id : document.user_id;
                                      const myName = profile?.full_name || user?.email?.split('@')[0] || (language === 'id' ? 'Tamu' : 'Guest');
                                      createNotification(
                                        docId,
                                        recipientId,
                                        myName,
                                        language === 'en'
                                          ? `accepted the suggestion: "${(sug.suggested_text || sug.selected_text || sug.new_text || sug.old_text || '').slice(0, 30)}..."`
                                          : `menerima usulan: "${(sug.suggested_text || sug.selected_text || sug.new_text || sug.old_text || '').slice(0, 30)}..."`
                                      );
                                    }
                                    updateSuggestionStatus(docId, sug.id, 'accepted').then(() => fetchSuggestions(docId).then(setSuggestions));
                                  }}
                                  className="px-3.5 py-1.5 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition rounded-xl shadow-xs cursor-pointer"
                                >
                                  ✓ {language === 'id' ? 'Terima' : 'Accept'}
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()
              ) : (
                comments.filter(c => c.resolved).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-400 mb-3">
                      <IconCheck className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-semibold text-slate-600">
                      {language === 'id' ? 'Belum ada komentar selesai' : 'No resolved comments yet'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                      {language === 'id' ? 'Komentar yang telah diselesaikan oleh pemilik akan tersimpan di sini.' : 'Comments resolved by the owner will be archived here.'}
                    </p>
                  </div>
                ) : (
                  comments.filter(c => c.resolved).map((c) => (
                    <div
                      key={c.id}
                      className="border border-slate-200/60 bg-white/70 rounded-2xl p-3.5 flex flex-col gap-2 text-left opacity-80 hover:opacity-100 transition shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold flex items-center justify-center shrink-0">
                            {c.author_name ? c.author_name.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <span className="text-xs font-bold text-slate-700 truncate">{c.author_name}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-bold border border-emerald-200">
                          <IconCheck className="h-2.5 w-2.5" />
                          {language === 'id' ? 'Selesai' : 'Resolved'}
                        </span>
                      </div>

                      {c.selected_text && (
                        <div className="bg-slate-100/70 border-l-2 border-slate-300 px-2.5 py-1 rounded-r-lg text-[10px] text-slate-500 italic truncate">
                          "{c.selected_text}"
                        </div>
                      )}

                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                        {c.comment_text}
                      </p>
                    </div>
                  ))
                )
              )}
            </div>
          </aside>
        )}
    </>
  );
};
