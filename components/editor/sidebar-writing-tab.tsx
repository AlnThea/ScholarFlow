import React from 'react';
import {
  IconBook, IconCheck, IconDownload, IconExternalLink, IconFileText,
  IconFilter, IconFolderOpen, IconLoader2, IconCirclePlus, IconQuote,
  IconSearch, IconSum, IconSparkles, IconWand, IconChevronLeft,
  IconChevronRight, IconLanguage, IconX, IconClock, IconTrash, IconCopy, IconHistory, IconBolt
} from '@tabler/icons-react';
import { TokenQuotaBadge } from '@/components/ai/token-quota-badge';

interface CompactToolButtonProps {
  label: string;
  description: string;
  icon: any;
  onClick: () => void;
  disabled?: boolean;
  isPro?: boolean;
  isActivePro?: boolean;
  isLoading?: boolean;
  align?: 'left' | 'right';
}

function CompactToolButton({
  label,
  description,
  icon: Icon,
  onClick,
  disabled,
  isPro,
  isActivePro,
  isLoading,
  align = 'left'
}: CompactToolButtonProps) {
  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || isLoading}
        className={`w-full p-2.5 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between h-[68px] relative ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xs cursor-pointer'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
            isPro && !isActivePro
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
              : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
          }`}>
            <Icon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </div>
          {isPro && !isActivePro && (
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
              PRO
            </span>
          )}
        </div>

        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate w-full mt-1">
          {label}
        </span>
      </button>

      {/* Hover Tooltip Popup - Aligned to avoid overflowing sidebar boundaries */}
      <div
        className={`absolute bottom-full mb-2 hidden group-hover:flex flex-col pointer-events-none z-30 transition-all duration-150 w-48 ${
          align === 'right' ? 'right-0 items-end' : 'left-0 items-start'
        }`}
      >
        <div className="bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-medium rounded-lg py-2 px-2.5 shadow-xl leading-snug border border-slate-700 text-center w-full">
          {description}
        </div>
        <div
          className={`w-2.5 h-2.5 bg-slate-900 dark:bg-slate-800 rotate-45 -mt-1 border-r border-b border-slate-700 ${
            align === 'right' ? 'mr-14' : 'ml-14'
          }`}
        />
      </div>
    </div>
  );
}

export const SidebarWritingTab = (props: any) => {
  const {
    language, activePlanId, user, selectedText, citationResults, citationHistory, wordCount, characterCount,
    citationCount, bibliographyEntries, improvedText, isImproving, isSearchingCitations,
    aiError, citationError, citationNote, onApplyImprovedText, onImproveWriting,
    onParaphrase, onSummarize, onGenerateAbstract, onFindCitation, onRepeatCitationSearch,
    setIsHistoryModalOpen, isApplied, t, ActionButton
  } = props;

  const hasImprovedText = improvedText !== null;
  const isEn = language === 'en';
  const isProUser = activePlanId === 'pro' || activePlanId === 'campus' || activePlanId === 'institution';

  const handleProAction = (actionCallback: () => void) => {
    if (!isProUser) {
      props.setIsPlanModalOpen?.(true);
      return;
    }
    actionCallback();
  };

  return (
    <>
      <div className="space-y-3">
        <section className="rounded-lg border border-line dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconSparkles className="h-4 w-4 text-accent dark:text-indigo-400" />
              <h3 className="text-sm font-semibold text-text dark:text-slate-200">
                {isEn ? 'Writing tools' : 'Alat Penulisan'}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsHistoryModalOpen(true)}
              className="text-xs font-bold text-indigo-650 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition flex items-center gap-1 cursor-pointer"
            >
              <IconHistory className="h-3.5 w-3.5" />
              <span>{t('sidebar.history')}</span>
            </button>
          </div>

          <div className="mb-3 max-h-24 overflow-y-auto rounded-md border border-dashed border-line dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-2.5 text-xs leading-5 text-muted dark:text-slate-400 thin-scroll">
            {selectedText.trim()
              ? selectedText
              : (isEn ? 'Select text in the document to enable writing tools.' : 'Pilih teks di dalam dokumen untuk mengaktifkan alat penulisan.')}
          </div>

          {/* Monthly AI Token Quota Status Card */}
          <div className="mb-3">
            <TokenQuotaBadge
              tokensUsed={props.tokensUsed}
              monthlyQuota={props.monthlyQuota}
              activePlanId={activePlanId}
              language={language}
              onClick={props.onOpenTokenQuotaModal}
              compact={false}
            />
          </div>

          {/* 2-Column Responsive Tools Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* 1. Improve Academic Writing (PRO) */}
            <CompactToolButton
              label={isImproving ? (isEn ? 'Improving...' : 'Memproses...') : (isEn ? 'Improve Style' : 'Poles Ilmiah')}
              description={isEn ? "Refine clarity, tone, and academic structure (Pro)." : "Tingkatkan kejelasan, nada bahasa, dan struktur akademis (Pro)."}
              icon={isImproving ? IconLoader2 : IconWand}
              onClick={() => handleProAction(onImproveWriting)}
              disabled={!selectedText.trim() || isImproving}
              isPro={true}
              isActivePro={isProUser}
              isLoading={isImproving}
              align="left"
            />

            {/* 2. Paraphrase (FREE) */}
            <CompactToolButton
              label={isImproving ? (isEn ? 'Paraphrasing...' : 'Memproses...') : (isEn ? 'Paraphrase' : 'Parafrase')}
              description={isEn ? "Rewrite the selected text while keeping the meaning." : "Tulis ulang teks terpilih tanpa mengubah maknanya."}
              icon={isImproving ? IconLoader2 : IconLanguage}
              onClick={onParaphrase}
              disabled={!selectedText.trim() || isImproving}
              isPro={false}
              isActivePro={isProUser}
              isLoading={isImproving}
              align="right"
            />

            {/* 3. Summarize (FREE) */}
            <CompactToolButton
              label={isImproving ? (isEn ? 'Summarizing...' : 'Memproses...') : (isEn ? 'Summarize' : 'Rangkum')}
              description={isEn ? "Condense the selected text into a shorter academic summary." : "Ringkas teks terpilih menjadi paragraf akademis yang lebih padat."}
              icon={isImproving ? IconLoader2 : IconFileText}
              onClick={onSummarize}
              disabled={!selectedText.trim() || isImproving}
              isPro={false}
              isActivePro={isProUser}
              isLoading={isImproving}
              align="left"
            />

            {/* 4. Generate Abstract (PRO) */}
            <CompactToolButton
              label={isImproving ? (isEn ? 'Generating...' : 'Memproses...') : (isEn ? 'Gen Abstract' : 'Buat Abstrak')}
              description={isEn ? "Draft an abstract from the current document context (Pro)." : "Susun abstrak otomatis berdasarkan konteks dokumen Anda (Pro)."}
              icon={isImproving ? IconLoader2 : IconBook}
              onClick={() => handleProAction(onGenerateAbstract)}
              disabled={isImproving}
              isPro={true}
              isActivePro={isProUser}
              isLoading={isImproving}
              align="right"
            />

            {/* 5. Find Citation (FREE) */}
            <CompactToolButton
              label={isSearchingCitations ? (isEn ? 'Searching...' : 'Mencari...') : (isEn ? 'Find Citation' : 'Cari Sitasi')}
              description={isEn ? "Search verified metadata for the selected claim." : "Cari data jurnal valid untuk mendukung klaim teks Anda."}
              icon={isSearchingCitations ? IconLoader2 : IconSum}
              onClick={onFindCitation}
              disabled={!selectedText.trim() || isSearchingCitations}
              isPro={false}
              isActivePro={isProUser}
              isLoading={isSearchingCitations}
              align="left"
            />

            {/* 6. Auto-Suggest Citation (PRO) */}
            <CompactToolButton
              label={isEn ? "Auto-Cite (AI)" : "Sitasi Otomatis"}
              description={isEn
                ? "Automated citation suggestions based on your statement claims (Pro)."
                : "Rekomendasi sitasi otomatis berdasarkan isi klaim kalimat Anda (Pro)."
              }
              icon={IconSparkles}
              onClick={() => {
                if (!isProUser) {
                  props.setIsPlanModalOpen?.(true);
                } else {
                  onRepeatCitationSearch(selectedText);
                }
              }}
              disabled={!selectedText.trim()}
              isPro={true}
              isActivePro={isProUser}
              align="right"
            />
          </div>

          {citationError ? (
            <div className="mt-3 rounded-md border border-rose-200 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-900/30 p-2.5 text-xs leading-5 text-rose-700 dark:text-rose-400">
              {citationError}
            </div>
          ) : citationNote ? (
            <div className="mt-3 rounded-md border border-line dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-2.5 text-xs leading-5 text-muted dark:text-slate-400">
              {citationNote}
            </div>
          ) : null}
        </section>

        {/* Improve Result Card */}
        <section className="rounded-lg border border-line dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-text dark:text-slate-200">
              {isEn ? 'Improve result' : 'Hasil Perbaikan AI'}
            </h3>
            {hasImprovedText ? (
              <button
                type="button"
                onClick={onApplyImprovedText}
                disabled={isApplied}
                className="inline-flex items-center gap-2 rounded-md border border-line dark:border-slate-600 bg-panel dark:bg-slate-700 px-3 py-1.5 text-xs font-medium text-text dark:text-slate-200 transition hover:border-accent/30 hover:bg-accentSoft/70 dark:hover:bg-indigo-900/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <IconCheck className="h-3.5 w-3.5" />
                {isApplied ? (isEn ? 'Applied' : 'Diterapkan') : (isEn ? 'Apply' : 'Terapkan')}
              </button>
            ) : null}
          </div>
          {aiError ? (
            <div className="rounded-md border border-rose-200 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-900/30 p-3 text-xs leading-5 text-rose-700 dark:text-rose-400">
              {aiError}
            </div>
          ) : hasImprovedText ? (
            <div className="space-y-3">
              <div className="rounded-md border border-line dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-3">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted dark:text-slate-500">
                  {isEn ? 'Improved Text' : 'Teks Baru'}
                </p>
                <p className="text-sm leading-6 text-text dark:text-slate-300">{improvedText?.improved_text}</p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-start gap-2 rounded-md border border-line dark:border-slate-700 bg-panel dark:bg-slate-800 p-2.5 text-xs leading-5 text-muted dark:text-slate-400 flex-1">
                  <IconSparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent dark:text-indigo-400" />
                  <span>{improvedText?.disclaimer}</span>
                </div>
                {improvedText?.is_idempotent_hit ? (
                  <div className="flex items-center gap-1.5 rounded-md border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 shrink-0">
                    <IconBolt className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{isEn ? '0 Tokens (Instant Cache)' : '0 Token (Cache Instan)'}</span>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </>
  );
};
