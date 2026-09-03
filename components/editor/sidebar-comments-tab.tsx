import React from 'react';
import {
  IconBook, IconCheck, IconDownload, IconExternalLink, IconFileText,
  IconFilter, IconFolderOpen, IconLoader2, IconCirclePlus, IconQuote,
  IconSearch, IconSum, IconSparkles, IconWand, IconChevronLeft,
  IconChevronRight, IconLanguage, IconX, IconClock, IconTrash, IconCopy, IconHistory
} from '@tabler/icons-react';
import { BurstinessChart } from './burstiness-chart';


export const SidebarCommentsTab = (props: any) => {
  const {
    selectedText, citationResults, citationHistory, wordCount, characterCount,
    citationCount, bibliographyEntries, improvedText, isImproving, isSearchingCitations,
    aiError, citationError, citationNote, onApplyImprovedText, onImproveWriting,
    onParaphrase, onSummarize, onGenerateAbstract, onFindCitation, onRepeatCitationSearch,
    onInsertCitation, onInsertBibliography, onInsertImageSample, onExportBibliographyText,
    onExportBibliographyJson, onExportBibliographyBibtex, onExportBibliographyRis,
    onInsertCitationCandidate, onParafrasePlagiat, selectedAiModel, isSynthesizing,
    synthesizedText, synthesizeError, synthesizeDisclaimer, onSynthesizeReview,
    onInsertSynthesizedText, citationStyle, onChangeCitationStyle, folders,
    folderAssignments, onCreateFolder, onAssignFolder, isExpanded, onToggleExpanded,
    onClose, aiHistory, onDeleteAiHistoryEntry, onClearAiHistory, isApplied,
    comments, suggestions, onAcceptSuggestion, onRejectSuggestion, onResolveComment,
    onCommentClick, activeTab, 
    workspaceTab, setWorkspaceTab, commentFilterTab, setCommentFilterTab,
    suggestionSubTab, setSuggestionSubTab, query, setQuery, isHistoryModalOpen,
    setIsHistoryModalOpen, localIsExpanded, setLocalIsExpanded, scanStatus,
    setScanStatus, scanProgress, setScanProgress, similarityScore, setSimilarityScore,
    plagiarismDetails, setPlagiarismDetails, selectedFolderFilter, setSelectedFolderFilter,
    newFolderName, setNewFolderName, isAddingFolder, setIsAddingFolder,
    t, getSourceLabel, formatHistoryLabel, ActionButton, PanelRow
  } = props;

  return (
    <>
            ) : workspaceTab === 'comments' ? (
              <div className="space-y-4 animate-fade-in font-sans text-slate-800">
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {language === 'en' ? 'Document Comments' : 'Komentar Dokumen'}
                  </span>
                  <p className="text-[11px] text-slate-500 leading-normal font-medium">
                    {language === 'en'
                      ? 'Review feedback left by co-editors and collaborators.'
                      : 'Tinjau masukan yang diberikan oleh co-editor dan kolaborator.'}
                  </p>
                </div>

                {/* Active vs Suggestions vs Resolved Sub-tabs */}
                <div className="flex items-center gap-1 p-1 bg-slate-100/70 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setCommentFilterTab('active')}
                    className={`flex-1 py-1.5 px-1.5 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${commentFilterTab === 'active'
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    <span>{language === 'en' ? 'Active' : 'Komentar'}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${commentFilterTab === 'active' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200/60 text-slate-600'
                      }`}>
                      {comments.filter(c => !c.resolved).length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCommentFilterTab('suggestions')}
                    className={`flex-1 py-1.5 px-1.5 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${commentFilterTab === 'suggestions'
                      ? 'bg-white text-amber-700 shadow-sm border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    <span>💡 {language === 'en' ? 'Suggestions' : 'Usulan'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCommentFilterTab('resolved')}
                    className={`flex-1 py-1.5 px-1.5 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${commentFilterTab === 'resolved'
                      ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    <span>{language === 'en' ? 'Resolved' : 'Selesai'}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${commentFilterTab === 'resolved' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200/60 text-slate-600'
                      }`}>
                      {comments.filter(c => c.resolved).length}
                    </span>
                  </button>
                </div>

                {/* Sub-Filter Toggle for Suggestions: Active vs History */}
                {commentFilterTab === 'suggestions' && (
                  <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setSuggestionSubTab('active')}
                      className={`flex-1 py-1 px-2 rounded-md transition flex items-center justify-center gap-1 cursor-pointer ${suggestionSubTab === 'active'
                        ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60 font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                      <span>💡 {language === 'en' ? 'Active' : 'Aktif'}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${suggestionSubTab === 'active' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'bg-slate-200/60 text-slate-600'
                        }`}>
                        {suggestions.filter(s => s.status === 'pending').length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSuggestionSubTab('history')}
                      className={`flex-1 py-1 px-2 rounded-md transition flex items-center justify-center gap-1 cursor-pointer ${suggestionSubTab === 'history'
                        ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60 font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                      <span>📜 {language === 'en' ? 'History' : 'Riwayat'}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${suggestionSubTab === 'history' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'bg-slate-200/60 text-slate-600'
                        }`}>
                        {suggestions.filter(s => s.status === 'accepted' || s.status === 'rejected').length}
                      </span>
                    </button>
                  </div>
                )}

                <div className="flex flex-col gap-3 max-h-[calc(100vh-360px)] overflow-y-auto pr-1">
                  {commentFilterTab === 'active' ? (
                    comments.filter(c => !c.resolved).length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-slate-200 bg-slate-50/50 rounded-xl text-xs text-slate-400 font-medium italic">
                        {language === 'en' ? 'No active comments' : 'Tidak ada komentar aktif'}
                      </div>
                    ) : (
                      comments.filter(c => !c.resolved).map((c) => (
                        <div
                          key={c.id}
                          onClick={() => onCommentClick?.(c)}
                          className="border border-slate-200 hover:border-indigo-300 bg-slate-50/20 hover:bg-indigo-50/5 transition rounded-xl p-3 flex flex-col gap-2 text-left cursor-pointer shadow-sm shadow-slate-100/10"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold text-slate-800 truncate max-w-[130px]">
                              {c.author_name}
                            </span>
                            <span className="text-[8px] text-slate-400">
                              {new Date(c.created_at).toLocaleTimeString(language === 'en' ? 'en-US' : 'id-ID', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          {c.selected_text && (
                            <div className="bg-slate-100/60 border-l-2 border-indigo-400 px-2 py-1 rounded text-[9px] text-slate-600 italic truncate">
                              "{c.selected_text}"
                            </div>
                          )}

                          <p className="text-xs text-slate-700 leading-normal font-medium whitespace-pre-line">
                            {c.comment_text}
                          </p>

                          <div className="flex justify-end pt-1 border-t border-slate-100 mt-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onResolveComment) {
                                  onResolveComment(c.id);
                                }
                              }}
                              className="px-2.5 py-1 text-[9px] font-extrabold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 transition rounded-lg border border-indigo-100 shadow-sm cursor-pointer"
                            >
                              Resolve
                            </button>
                          </div>
                        </div>
                      ))
                    )
                  ) : commentFilterTab === 'suggestions' ? (
                    (() => {
                      const allSugList = suggestions && suggestions.length > 0
                        ? suggestions
                        : (() => {
                          const holder = typeof window !== 'undefined' ? window.document.getElementById('editorjs-holder') : null;
                          const sugList: Array<DocumentSuggestion> = [];
                          if (holder) {
                            const map = new Map<string, DocumentSuggestion>();
                            holder.querySelectorAll('del[data-suggestion-id], .sf-suggestion-del').forEach((del) => {
                              const sugId = del.getAttribute('data-suggestion-id') || 'sug';
                              const author = del.getAttribute('data-author') || 'Collaborator';
                              const oldText = del.textContent || '';
                              map.set(sugId, { id: sugId, document_id: '', author_name: author, selected_text: oldText, suggested_text: '', status: 'pending', created_at: new Date().toISOString() });
                            });
                            holder.querySelectorAll('ins[data-suggestion-id], .sf-suggestion-ins').forEach((ins) => {
                              const sugId = ins.getAttribute('data-suggestion-id') || 'sug';
                              const author = ins.getAttribute('data-author') || 'Collaborator';
                              const newText = ins.textContent || '';
                              if (map.has(sugId)) {
                                map.get(sugId)!.suggested_text = newText;
                              } else {
                                map.set(sugId, { id: sugId, document_id: '', author_name: author, selected_text: '', suggested_text: newText, status: 'pending', created_at: new Date().toISOString() });
                              }
                            });
                            sugList.push(...Array.from(map.values()));
                          }
                          return sugList;
                        })();

                      const filteredSugList = suggestionSubTab === 'active'
                        ? allSugList.filter(s => s.status === 'pending')
                        : allSugList.filter(s => s.status === 'accepted' || s.status === 'rejected');

                      if (filteredSugList.length === 0) {
                        return (
                          <div className="text-center py-12 border border-dashed border-slate-200 bg-slate-50/50 rounded-xl text-xs text-slate-400 font-medium italic font-sans">
                            {suggestionSubTab === 'active'
                              ? (language === 'en' ? 'No active track changes suggestions found' : 'Belum ada usulan revisi aktif pada dokumen')
                              : (language === 'en' ? 'No completed suggestion history' : 'Belum ada riwayat usulan selesai')}
                          </div>
                        );
                      }

                      return filteredSugList.map((sug) => {
                        const authorName = sug.author_name || sug.author || (language === 'en' ? 'Collaborator' : 'Kolaborator');
                        const deletedText = sug.selected_text || sug.old_text;
                        const replacementText = sug.suggested_text || sug.new_text;
                        const currentUserName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
                        const isCreatedByMe = (user?.id && sug.user_id && user.id === sug.user_id) || (sug.author_name && currentUserName && sug.author_name.toLowerCase() === currentUserName.toLowerCase());

                        const isAccepted = sug.status === 'accepted';
                        const isRejected = sug.status === 'rejected';
                        const isPending = sug.status === 'pending';

                        const containerStyle = isAccepted
                          ? 'border border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/50 transition rounded-xl p-3 flex flex-col gap-2 text-left shadow-xs font-sans'
                          : isRejected
                            ? 'border border-rose-200 bg-rose-50/30 hover:bg-rose-50/50 transition rounded-xl p-3 flex flex-col gap-2 text-left shadow-xs font-sans'
                            : 'border border-amber-200 bg-amber-50/20 hover:bg-amber-50/40 transition rounded-xl p-3 flex flex-col gap-2 text-left shadow-xs font-sans';

                        const badgeStyle = isAccepted
                          ? 'text-[8px] bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold px-1.5 py-0.5 rounded-full'
                          : isRejected
                            ? 'text-[8px] bg-rose-100 text-rose-800 border border-rose-200 font-bold px-1.5 py-0.5 rounded-full'
                            : 'text-[8px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full';

                        const statusBadgeText = isAccepted
                          ? `✓ ${language === 'en' ? 'Accepted' : 'Diterima'}`
                          : isRejected
                            ? `✕ ${language === 'en' ? 'Rejected' : 'Ditolak'}`
                            : `⏳ ${language === 'en' ? 'Pending' : 'Menunggu'}`;

                        return (
                          <div
                            key={sug.id}
                            className={containerStyle}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold text-slate-800 truncate">
                                💡 {language === 'en' ? 'Suggestion by' : 'Usulan oleh'} {authorName}
                              </span>
                              <span className={badgeStyle}>
                                {statusBadgeText}
                              </span>
                            </div>

                            {deletedText && (
                              <div className="bg-rose-50 border-l-2 border-rose-400 px-2 py-1 rounded text-[9px] text-rose-800 line-through leading-relaxed">
                                {language === 'en' ? 'Deleted:' : 'Dihapus:'} "{deletedText}"
                              </div>
                            )}

                            {replacementText && (
                              <div className="bg-emerald-50 border-l-2 border-emerald-400 px-2 py-1 rounded text-[9px] text-emerald-800 font-bold leading-relaxed">
                                {language === 'en' ? 'Replacement:' : 'Pengganti:'} "{replacementText}"
                              </div>
                            )}

                            {isPending && (
                              <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-amber-100 mt-1">
                                {isCreatedByMe ? (
                                  <span className="text-[9px] text-slate-500 font-medium italic">
                                    ⏳ {language === 'en' ? 'Pending Review' : 'Menunggu Peninjauan'}
                                  </span>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onRejectSuggestion?.(sug.id);
                                      }}
                                      className="px-2.5 py-1 text-[9px] font-bold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 transition rounded-lg border border-rose-200 cursor-pointer"
                                    >
                                      ✕ {language === 'en' ? 'Reject' : 'Tolak'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onAcceptSuggestion?.(sug.id);
                                      }}
                                      className="px-3 py-1 text-[9px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition rounded-lg shadow-xs cursor-pointer"
                                    >
                                      ✓ {language === 'en' ? 'Accept' : 'Terima'}
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
                      <div className="text-center py-12 border border-dashed border-slate-200 bg-slate-50/50 rounded-xl text-xs text-slate-400 font-medium italic">
                        {language === 'en' ? 'No resolved comments' : 'Belum ada komentar selesai'}
                      </div>
                    ) : (
                      comments.filter(c => c.resolved).map((c) => (
                        <div
                          key={c.id}
                          onClick={() => onCommentClick?.(c)}
                          className="border border-slate-200/80 hover:border-emerald-300 bg-emerald-50/10 hover:bg-emerald-50/20 transition rounded-xl p-3 flex flex-col gap-2 text-left cursor-pointer shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold text-slate-800 truncate max-w-[120px]">
                              {c.author_name}
                            </span>
                            <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                              ✓ {language === 'en' ? 'Resolved' : 'Selesai'}
                            </span>
                          </div>

                          {c.selected_text && (
                            <div className="bg-emerald-50/50 border-l-2 border-emerald-400 px-2 py-1 rounded text-[9px] text-emerald-800 italic truncate">
                              "{c.selected_text}"
                            </div>
                          )}

                          <p className="text-xs text-slate-600 leading-normal font-medium whitespace-pre-line">
                            {c.comment_text}
                          </p>
                        </div>
                      ))
                    )
                  )}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">Error Tab</div>
            )}
    </>
  );
};
