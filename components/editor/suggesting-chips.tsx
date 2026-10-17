import React from 'react';
import { IconCheck, IconX, IconUser, IconClock, IconSparkles } from '@tabler/icons-react';
import type { DocumentSuggestion } from '@/lib/api/suggestions';

export type SuggestingChipsProps = {
  suggestions: DocumentSuggestion[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onScrollTo?: (id: string) => void;
  language?: 'en' | 'id';
  className?: string;
};

export const SuggestingChips = ({
  suggestions,
  onAccept,
  onReject,
  onScrollTo,
  language = 'id',
  className = '',
}: SuggestingChipsProps) => {
  const isEn = language === 'en';
  const pendingSuggestions = suggestions.filter((s) => s.status === 'pending');

  if (pendingSuggestions.length === 0) {
    return null;
  }

  return (
    <div
      className={`flex flex-col gap-2 p-2 rounded-xl bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs ${className}`}
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <IconSparkles className="h-4 w-4 text-amber-500" />
          <span>
            {isEn
              ? `Live Suggestions (${pendingSuggestions.length})`
              : `Usulan Langsung (${pendingSuggestions.length})`}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
        {pendingSuggestions.map((sug) => {
          const oldText = sug.selected_text || sug.old_text || '';
          const newText = sug.suggested_text || sug.new_text || '';
          const author = sug.author_name || sug.author || 'Reviewer';

          return (
            <div
              key={sug.id}
              onClick={() => onScrollTo?.(sug.id)}
              className="group p-2.5 rounded-lg border border-amber-200/70 dark:border-amber-900/40 bg-white dark:bg-slate-800/80 shadow-xs hover:border-amber-400 dark:hover:border-amber-700 transition cursor-pointer flex flex-col gap-1.5"
            >
              {/* Header: Author & Time */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-200">
                  <IconUser className="h-3 w-3 text-amber-500" />
                  <span className="truncate max-w-[120px]">{author}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                  <IconClock className="h-3 w-3" />
                  <span>
                    {sug.created_at ? new Date(sug.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Baru saja'}
                  </span>
                </div>
              </div>

              {/* Inline Diff Preview */}
              <div className="text-xs leading-relaxed font-sans bg-slate-50 dark:bg-slate-900/60 p-2 rounded-md border border-slate-100 dark:border-slate-800">
                {oldText && (
                  <span className="line-through text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/40 px-1 py-0.5 rounded mr-1">
                    {oldText}
                  </span>
                )}
                {newText && (
                  <span className="underline decoration-emerald-500 text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 px-1 py-0.5 rounded font-medium">
                    {newText}
                  </span>
                )}
              </div>

              {/* Action Buttons: Accept / Reject Chips */}
              <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject(sug.id);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                  title={isEn ? 'Reject this change' : 'Tolak perubahan ini'}
                >
                  <IconX className="h-3.5 w-3.5" />
                  <span>{isEn ? 'Reject' : 'Tolak'}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAccept(sug.id);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer"
                  title={isEn ? 'Accept this change' : 'Terima perubahan ini'}
                >
                  <IconCheck className="h-3.5 w-3.5" />
                  <span>{isEn ? 'Accept' : 'Terima'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
