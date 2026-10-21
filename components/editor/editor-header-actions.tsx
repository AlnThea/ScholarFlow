'use client';

import React, { useState } from 'react';
import { 
  IconDownload, IconChevronDown, 
  IconLoader, IconFileWord, 
  IconBraces, IconBook, IconDatabase, IconBell, 
  IconShare, IconCreditCard, IconLayoutSidebarRightCollapse, 
  IconSettings, IconHistory, IconMicroscope, IconKeyboard, IconCode
} from '@tabler/icons-react';
import { TokenQuotaBadge } from '@/components/ai/token-quota-badge';

export type EditorHeaderActionsProps = {
  currentDocument: any;
  language: 'en' | 'id';
  activePlanId: string;
  tokensUsed?: number;
  monthlyQuota?: number;
  onOpenTokenQuotaModal?: () => void;
  bibliographyEntries: any[];
  exportToWordFile: (title: string, blocks: any[], bibliography: string[], language?: 'en' | 'id', isPro?: boolean) => Promise<void>;
  exportToPdfFile: (title: string, blocks: any[], bibliography: string[], language?: 'en' | 'id', isPro?: boolean) => Promise<void>;
  onExportBibliographyText: () => void;
  onExportBibliographyJson: () => void;
  onExportBibliographyBibtex: () => void;
  onExportBibliographyRis: () => void;
  setIsExportUpgradeModalOpen: (val: boolean) => void;
  notifications: any[];
  onMarkAllNotificationsRead?: () => void;
  onMarkNotificationRead?: (id: string) => void;
  onNotificationClick?: (notif: any) => void;
  role?: string;
  setIsShareOpen: (val: boolean) => void;
  setIsPricingOpen: (val: boolean) => void;
  showRightSidebar: boolean;
  setShowRightSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenSettings?: () => void;
  onOpenVersionHistory?: () => void;
  onOpenPeerReview?: () => void;
  onOpenShortcuts?: () => void;
  onOpenLatexExport?: () => void;
  activeUsers?: any[];
  className?: string;
};

export const EditorHeaderActions = ({
  currentDocument,
  language,
  activePlanId,
  tokensUsed,
  monthlyQuota,
  onOpenTokenQuotaModal,
  bibliographyEntries,
  exportToWordFile,
  exportToPdfFile,
  onExportBibliographyText,
  onExportBibliographyJson,
  onExportBibliographyBibtex,
  onExportBibliographyRis,
  setIsExportUpgradeModalOpen,
  notifications,
  onMarkAllNotificationsRead,
  onMarkNotificationRead,
  onNotificationClick,
  role,
  setIsShareOpen,
  setIsPricingOpen,
  showRightSidebar,
  setShowRightSidebar,
  onOpenSettings,
  onOpenVersionHistory,
  onOpenPeerReview,
  onOpenShortcuts,
  onOpenLatexExport,
  activeUsers,
  className = '',
}: EditorHeaderActionsProps) => {
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  return (
    <div className={`flex items-center gap-0.5 bg-slate-100/80 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 ${className}`}>
      {/* Export Dropdown */}
      <div className="relative" data-tour="header-export">
        <button
          disabled={isExporting || isExportingPdf}
          onClick={() => setShowExportDropdown(prev => !prev)}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-650 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white disabled:opacity-70 disabled:cursor-not-allowed transition cursor-pointer"
        >
          {isExporting || isExportingPdf ? (
            <IconLoader className="h-3.5 w-3.5 text-indigo-500 animate-spin" />
          ) : (
            <IconDownload className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
          )}
          {isExporting || isExportingPdf ? (
            language === 'en' ? 'Exporting...' : 'Mengekspor...'
          ) : (
            language === 'en' ? 'Export' : 'Ekspor'
          )}
          <IconChevronDown className="h-3 w-3 text-slate-400" />
        </button>

        {showExportDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowExportDropdown(false)} />
            <div className="absolute left-0 mt-2 w-56 rounded-lg border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 py-1 shadow-[0_10px_35px_rgba(0,0,0,0.15)] z-50 animate-scale-in">
              {/* Document Exporters */}
              <div className="px-3 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                {language === 'en' ? 'Document' : 'Dokumen'}
              </div>
              <button
                onClick={async () => {
                  setShowExportDropdown(false);
                  setIsExporting(true);
                  try {
                    const title = currentDocument?.title || 'Untitled Document';
                    const docContent = currentDocument?.content;
                    let bList: any[] = [];
                    if (docContent) {
                      try {
                        const parsed = typeof docContent === 'string' ? JSON.parse(docContent) : docContent;
                        bList = parsed.blocks || [];
                      } catch (e) {
                        console.error(e);
                      }
                    }
                    const isPro = activePlanId !== 'free';
                    const bibs = isPro ? bibliographyEntries.map(e => e.formatted) : [];
                    await exportToWordFile(title, bList, bibs, language, isPro);
                  } catch (err) {
                    console.error('Export failed:', err);
                  } finally {
                    setIsExporting(false);
                  }
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-650 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition cursor-pointer"
              >
                <IconFileWord className="h-4 w-4 text-blue-500 shrink-0" />
                <span>Microsoft Word (.docx)</span>
              </button>
              <button
                onClick={async () => {
                  setShowExportDropdown(false);
                  setIsExportingPdf(true);
                  try {
                    const title = currentDocument?.title || 'Untitled Document';
                    const docContent = currentDocument?.content;
                    let bList: any[] = [];
                    if (docContent) {
                      try {
                        const parsed = typeof docContent === 'string' ? JSON.parse(docContent) : docContent;
                        bList = parsed.blocks || [];
                      } catch (e) {
                        console.error(e);
                      }
                    }
                    const isPro = activePlanId !== 'free';
                    const bibs = isPro ? bibliographyEntries.map(e => e.formatted) : [];
                    await exportToPdfFile(title, bList, bibs, language, isPro);
                  } catch (err) {
                    console.error('Export PDF failed:', err);
                  } finally {
                    setIsExportingPdf(false);
                  }
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-650 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition cursor-pointer"
              >
                <IconFilePdf className="h-4 w-4 text-rose-500 shrink-0" />
                <span>PDF Document (.pdf)</span>
              </button>

              {/* LaTeX & Journal Package (.tex + .bib Zip) */}
              {onOpenLatexExport && (
                <button
                  onClick={() => {
                    setShowExportDropdown(false);
                    onOpenLatexExport();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer group"
                  title={language === 'en' 
                    ? 'LaTeX & Journal Package: Export manuscript to .tex + .bib zip package with IEEE, Elsevier, or ACM templates for Overleaf.' 
                    : 'Paket LaTeX & Jurnal: Ekspor naskah menjadi paket .tex + .bib zip siap kompilasi Overleaf standar IEEE, Elsevier, atau ACM.'}
                >
                  <div className="flex items-center gap-2">
                    <IconCode className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>LaTeX Package (.tex + .bib)</span>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Overleaf / Zip
                  </span>
                </button>
              )}

              {/* Divider */}
              <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />

              {/* Bibliography Exporters */}
              <div className="px-3 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                {language === 'en' ? 'Bibliography' : 'Daftar Pustaka'}
              </div>
              <button
                onClick={() => {
                  setShowExportDropdown(false);
                  onExportBibliographyText();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-650 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition cursor-pointer"
              >
                <IconBook className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Text / Markdown (.txt)</span>
              </button>
              <button
                onClick={() => {
                  setShowExportDropdown(false);
                  onExportBibliographyBibtex();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-650 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition cursor-pointer"
              >
                <IconBraces className="h-4 w-4 text-amber-500 shrink-0" />
                <span>BibTeX Format (.bib)</span>
              </button>
              <button
                onClick={() => {
                  setShowExportDropdown(false);
                  onExportBibliographyRis();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-650 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition cursor-pointer"
              >
                <IconDatabase className="h-4 w-4 text-purple-500 shrink-0" />
                <span>RIS Format (.ris)</span>
              </button>
              <button
                onClick={() => {
                  setShowExportDropdown(false);
                  onExportBibliographyJson();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-650 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition cursor-pointer"
              >
                <IconBraces className="h-4 w-4 text-slate-500 shrink-0" />
                <span>JSON Format (.json)</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Divider */}
      {(activePlanId !== 'free' || role === 'admin') && (
        <>
          <div className="h-4 w-px bg-slate-200/80 dark:bg-slate-700 mx-0.5" />
          {/* Share Button (Hidden for Free tier) */}
          <button
            data-tour="header-share"
            onClick={() => setIsShareOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-650 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
          >
            <IconShare className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            {language === 'en' ? 'Share' : 'Bagikan'}
          </button>
        </>
      )}

      {/* Divider */}
      <div className="h-4 w-px bg-slate-200/80 dark:bg-slate-700 mx-0.5" />

      {/* AI Token Quota Badge */}
      <TokenQuotaBadge
        tokensUsed={tokensUsed}
        monthlyQuota={monthlyQuota}
        activePlanId={activePlanId}
        language={language}
        onClick={onOpenTokenQuotaModal}
        compact={true}
      />

      {/* Settings Button */}
      {currentDocument && onOpenSettings && (
        <>
          {/* Divider */}
          <div className="h-4 w-px bg-slate-200/80 dark:bg-slate-700 mx-0.5" />
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer flex items-center justify-center shrink-0"
            title={language === 'en' ? 'Document & Research Settings' : 'Pengaturan Dokumen & Riset'}
          >
            <IconSettings className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
};

const IconFilePdf = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={props.className} viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
    <path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4" />
    <path d="M5 18h1.5a1.5 1.5 0 0 0 0 -3h-1.5v6" />
    <path d="M17 18h-3v-3h3" />
    <path d="M14 18h3" />
    <path d="M10 15v6h1a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2h-1z" />
  </svg>
);
