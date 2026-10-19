import React, { useState } from 'react';
import { 
  IconMenu, IconRefresh, IconDownload, IconChevronDown, 
  IconLoader, IconFileWord, IconFileText, 
  IconBraces, IconBook, IconDatabase, IconBell, 
  IconShare, IconCreditCard, IconLayoutSidebarRightCollapse, 
  IconSettings, IconHistory, IconMicroscope, IconSearch, IconKeyboard, IconCode
} from '@tabler/icons-react';
import { TokenQuotaBadge } from '@/components/ai/token-quota-badge';

export type EditorHeaderProps = {
  isSidebarExpanded: boolean;
  toggleSidebar: () => void;
  currentDocument: any;
  onRenameDocument: (val: string) => void;
  backendType: 'express' | 'supabase' | string;
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
  onOpenCommandPalette?: () => void;
  onOpenShortcuts?: () => void;
  onOpenLatexExport?: () => void;
  activeUsers?: any[];
  statusLabel?: string;
};

export const EditorHeader = ({
  isSidebarExpanded,
  toggleSidebar,
  currentDocument,
  onRenameDocument,
  backendType,
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
  onOpenCommandPalette,
  onOpenShortcuts,
  onOpenLatexExport,
  activeUsers,
  statusLabel,
}: EditorHeaderProps) => {
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  return (
    <header className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-6 py-2.5 lg:sticky lg:top-0 z-30 backdrop-blur whitespace-nowrap transition-colors">
      <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-4">
        <button
          type="button"
          aria-label="Menu"
          className="p-1.5 rounded-md hover:bg-slate-100/80 dark:hover:bg-slate-800 transition text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white shrink-0 cursor-pointer"
          style={{ background: 'transparent' }}
          onClick={toggleSidebar}
          title={language === 'en' ? 'Toggle Sidebar' : 'Buka/Tutup Sidebar'}
        >
          <IconMenu className="h-5 w-5" />
        </button>

        {/* Icon Dokumen Microsoft Word [W] */}
        <div className="w-7 h-7 rounded bg-[#185abd] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs select-none" title="Word Document">
          W
        </div>

        {/* Container 2 Tingkat: Judul Naskah (Atas) & Status Cloud (Bawah) */}
        <div className="flex flex-col min-w-0 flex-1">
          {/* Baris 1: Judul Naskah Utama & Chip Status Realtime WS */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={language === 'en' ? 'Untitled Document' : 'Dokumen Tanpa Judul'}
              value={currentDocument?.title || ''}
              onChange={(e) => onRenameDocument(e.target.value)}
              className="w-full min-w-[180px] sm:min-w-[220px] max-w-xl border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-400 text-sm font-bold text-slate-900 dark:text-white outline-none bg-transparent px-1 py-0.5 transition truncate"
              title={language === 'en' ? 'Click to rename document' : 'Klik untuk mengubah judul dokumen'}
            />

            {/* Live Hybrid Sync Engine Status Chip */}
            <div
              data-tour="header-sync-status"
              className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold cursor-help shrink-0"
              title={
                backendType === 'express'
                  ? (language === 'en' ? 'Sync Engine: Express Smart HTTP Polling (3s/15s adaptive) • Page Visibility active' : 'Sync Engine: Express Smart HTTP Polling (3s/15s adaptif) • Page Visibility aktif')
                  : (language === 'en' ? 'Sync Engine: Supabase Realtime WebSocket • Auto-failover 3x ready • Page Visibility active' : 'Sync Engine: Supabase Realtime WebSocket • Auto-failover 3x aktif • Page Visibility aktif')
              }
            >
              {backendType === 'express' ? (
                <>
                  <IconRefresh className="h-3 w-3 text-emerald-600 animate-spin-slow" />
                  <span>{language === 'en' ? 'Smart Polling' : 'Smart Polling'}</span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>{language === 'en' ? 'Realtime WS' : 'Realtime WS'}</span>
                </>
              )}
            </div>
          </div>

          {/* Baris 2: Tulisan Kecil di Bawah Judul (Status Simpan Cloud & Terakhir Diedit) */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 px-1 pt-0.5 select-none">
            <span
              className={`flex items-center gap-1 font-medium transition-colors ${
                statusLabel?.toLowerCase().includes('menyimpan') || statusLabel?.toLowerCase().includes('saving')
                  ? 'text-amber-600 dark:text-amber-400'
                  : statusLabel?.toLowerCase().includes('gagal') || statusLabel?.toLowerCase().includes('fail')
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {statusLabel?.toLowerCase().includes('menyimpan') || statusLabel?.toLowerCase().includes('saving') ? (
                <IconLoader className="h-3 w-3 animate-spin text-amber-500" />
              ) : statusLabel?.toLowerCase().includes('gagal') || statusLabel?.toLowerCase().includes('fail') ? (
                <span>⚠️</span>
              ) : (
                <span>☁️</span>
              )}
              <span>{statusLabel || (language === 'en' ? 'Saved to Cloud' : 'Tersimpan otomatis ke Cloud')}</span>
            </span>
            <span>•</span>
            <span className="text-slate-400 dark:text-slate-500">
              {statusLabel?.toLowerCase().includes('menyimpan') || statusLabel?.toLowerCase().includes('saving')
                ? (language === 'en' ? 'Syncing...' : 'Menyelaraskan...')
                : currentDocument?.updated_at
                ? `${language === 'en' ? 'Saved' : 'Disimpan'} ${new Date(currentDocument.updated_at).toLocaleTimeString(language === 'en' ? 'en-US' : 'id-ID', { hour: '2-digit', minute: '2-digit' })}`
                : (language === 'en' ? 'Last edited just now' : 'Terakhir diedit baru saja')}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">

        {/* Academic Command Palette (Ctrl+K) Quick Search Button with Rich Tooltip */}
        {onOpenCommandPalette && (
          <div className="relative group/search">
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/90 hover:bg-slate-200/90 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
              title={language === 'en' 
                ? 'Spotlight Command Palette (Ctrl+K): Click to search and launch any tool, citation, Reviewer #2, or setting.' 
                : 'Palet Perintah Spotlight (Ctrl+K): Klik untuk mencari dan membuka fitur apapun, sitasi, Reviewer #2, atau pengaturan.'}
            >
              <IconSearch className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="hidden xl:inline text-[11px] font-medium text-slate-600 dark:text-slate-350">
                {language === 'en' ? 'Search features, AI, citations...' : 'Cari fitur, AI, sitasi...'}
              </span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 border border-slate-300/60 dark:border-slate-600 shadow-2xs">
                Ctrl K
              </kbd>
            </button>

            {/* Hover Tooltip Popup Balloon */}
            <div className="pointer-events-none absolute top-full left-0 mt-2 w-72 rounded-xl bg-slate-900/95 dark:bg-slate-800/95 text-white p-3 text-left text-[11px] leading-relaxed shadow-xl border border-slate-700/80 opacity-0 group-hover/search:opacity-100 transition-opacity duration-200 z-50">
              <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
                <span>⚡</span>
                <span>{language === 'en' ? 'Spotlight Quick Search' : 'Pencarian Perintah Kilat'}</span>
              </div>
              <p className="text-slate-300 text-[10.5px]">
                {language === 'en'
                  ? 'Click here or press Ctrl+K to open all tools: citations, Reviewer #2, LaTeX math, and exports!'
                  : 'Klik di sini atau tekan Ctrl+K untuk membuka seluruh menu: sitasi, Reviewer #2, rumus KaTeX, dan ekspor!'}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-0.5 bg-slate-100/80 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
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
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 py-1 shadow-[0_10px_35px_rgba(0,0,0,0.15)] z-50 animate-scale-in">
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
                    <IconFilePdf className="h-4 w-4 text-red-500 shrink-0" />
                    <span>PDF Document (.pdf)</span>
                  </button>

                  {/* LaTeX & Journal Package (.tex + .bib Zip) */}
                  {onOpenLatexExport && (
                    <button
                      onClick={() => {
                        setShowExportDropdown(false);
                        onOpenLatexExport();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition cursor-pointer group"
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
                  <div className="px-3 py-1.5 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      {language === 'en' ? 'Bibliography' : 'Daftar Pustaka'}
                    </span>
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-semibold px-1.5 py-0.2 rounded-full shrink-0">
                      {bibliographyEntries.length}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowExportDropdown(false);
                      if (activePlanId === 'free') {
                        setIsExportUpgradeModalOpen(true);
                      } else {
                        onExportBibliographyText();
                      }
                    }}
                    disabled={bibliographyEntries.length === 0}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-650 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <IconFileText className="h-4 w-4 text-slate-500 shrink-0" />
                    <span>Plain Text (.txt)</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowExportDropdown(false);
                      if (activePlanId === 'free') {
                        setIsExportUpgradeModalOpen(true);
                      } else {
                        onExportBibliographyJson();
                      }
                    }}
                    disabled={bibliographyEntries.length === 0}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-650 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <IconBraces className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>JSON Format (.json)</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowExportDropdown(false);
                      if (activePlanId === 'free') {
                        setIsExportUpgradeModalOpen(true);
                      } else {
                        onExportBibliographyBibtex();
                      }
                    }}
                    disabled={bibliographyEntries.length === 0}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-650 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <IconBook className="h-4 w-4 text-indigo-500 shrink-0" />
                    <span>BibTeX Format (.bib)</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowExportDropdown(false);
                      if (activePlanId === 'free') {
                        setIsExportUpgradeModalOpen(true);
                      } else {
                        onExportBibliographyRis();
                      }
                    }}
                    disabled={bibliographyEntries.length === 0}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-650 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <IconDatabase className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>RIS Format (.ris)</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-slate-200/80 dark:bg-slate-700 mx-0.5" />

          {/* Notification Bell */}
          <div className="relative">
            <button
              data-tour="header-notifications"
              onClick={() => setShowNotificationsDropdown(prev => !prev)}
              className="inline-flex items-center justify-center rounded-md p-1.5 text-slate-550 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition cursor-pointer relative"
              title={language === 'en' ? 'Notifications' : 'Notifikasi'}
            >
              <IconBell className="h-4.5 w-4.5 text-slate-550 dark:text-slate-400" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </button>

            {showNotificationsDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotificationsDropdown(false)} />
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 shadow-2xl z-50 animate-scale-in max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                      {language === 'en' ? 'Notifications' : 'Notifikasi'}
                    </h4>
                    {notifications.filter(n => !n.read).length > 0 && (
                      <button
                        onClick={() => {
                          onMarkAllNotificationsRead?.();
                        }}
                        className="text-[10px] font-semibold text-indigo-650 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        {language === 'en' ? 'Mark all as read' : 'Tandai semua dibaca'}
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-slate-50 dark:divide-slate-700">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-xs text-slate-400">
                        {language === 'en' ? 'No new notifications' : 'Tidak ada notifikasi baru'}
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            onMarkNotificationRead?.(notif.id);
                            onNotificationClick?.(notif);
                            setShowNotificationsDropdown(false);
                          }}
                          className={`px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/60 transition cursor-pointer flex gap-3 items-start ${!notif.read ? 'bg-indigo-50/10 dark:bg-indigo-950/20' : ''}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${!notif.read ? 'bg-indigo-500' : 'bg-transparent'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-700 dark:text-slate-200 leading-normal whitespace-normal break-words">
                              <span className="font-semibold text-slate-850 dark:text-white">{notif.sender_name}</span> {notif.message}
                            </p>
                            <span className="text-[9px] text-slate-400 mt-1 block">
                              {new Date(notif.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-slate-200/80 dark:bg-slate-700 mx-0.5" />

          {/* Share Button (Hidden for Free tier) */}
          {(activePlanId !== 'free' || role === 'admin') && (
            <>
              <button
                data-tour="header-share"
                onClick={() => setIsShareOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-650 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
              >
                <IconShare className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                {language === 'en' ? 'Share' : 'Bagikan'}
              </button>

              {/* Divider */}
              <div className="h-4 w-px bg-slate-200/80 dark:bg-slate-700 mx-0.5" />
            </>
          )}

          {/* AI Token Quota Badge */}
          <TokenQuotaBadge
            tokensUsed={tokensUsed}
            monthlyQuota={monthlyQuota}
            activePlanId={activePlanId}
            language={language}
            onClick={onOpenTokenQuotaModal}
            compact={true}
          />

          {/* Divider */}
          <div className="h-4 w-px bg-slate-200/80 dark:bg-slate-700 mx-0.5" />

          {/* Pricing Button */}
          <button
            onClick={() => setIsPricingOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-650 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
          >
            <IconCreditCard className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            {language === 'en' ? 'Pricing' : 'Langganan'}
          </button>

          {/* Divider */}
          <div className="h-4 w-px bg-slate-200/80 dark:bg-slate-700 mx-0.5" />

          {/* Research Assistant Button */}
          <button
            data-tour="header-research-assistant"
            onClick={() => setShowRightSidebar(prev => !prev)}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${showRightSidebar
              ? 'bg-white dark:bg-slate-700 text-indigo-750 dark:text-indigo-400 shadow-sm font-bold'
              : 'text-slate-650 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white'
              }`}
            title={language === 'en' ? 'Toggle Research Assistant Panel' : 'Toggle Bilah Asisten Riset'}
          >
            <IconLayoutSidebarRightCollapse className={`h-3.5 w-3.5 ${showRightSidebar ? 'text-indigo-650 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`} />
            {language === 'en' ? 'Research Assistant' : 'Asisten Riset'}
          </button>

          {/* Version History Button */}
          {currentDocument && onOpenVersionHistory && (
            <>
              {/* Divider */}
              <div className="h-4 w-px bg-slate-200/80 dark:bg-slate-750 mx-0.5" />
              <button
                type="button"
                onClick={onOpenVersionHistory}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold text-slate-650 hover:bg-white hover:text-slate-800 transition cursor-pointer dark:text-slate-350 dark:hover:bg-slate-800 dark:hover:text-white"
                title={language === 'en' ? 'Version History & Time Machine' : 'Riwayat Versi & Time Machine'}
              >
                <IconHistory className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                <span className="hidden sm:inline">{language === 'en' ? 'History' : 'Riwayat'}</span>
              </button>
            </>
          )}

          {/* Peer Reviewer #2 Simulation Button */}
          {currentDocument && onOpenPeerReview && (
            <>
              {/* Divider */}
              <div className="h-4 w-px bg-slate-200/80 dark:bg-slate-750 mx-0.5" />
              <button
                type="button"
                onClick={onOpenPeerReview}
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 hover:text-rose-800 transition cursor-pointer dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60 border border-rose-200/80 dark:border-rose-800/80 shadow-xs"
                title={language === 'en' ? 'Reviewer #2 Simulator & Journal Readiness Audit' : 'Simulasi Reviewer #2 & Audit Kesiapan Jurnal'}
              >
                <IconMicroscope className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                <span className="hidden sm:inline">{language === 'en' ? 'Reviewer #2' : 'Reviewer #2'}</span>
              </button>
            </>
          )}

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

          {/* Keyboard Shortcuts Cheat Sheet Button */}
          {onOpenShortcuts && (
            <>
              {/* Divider */}
              <div className="h-4 w-px bg-slate-200/80 dark:bg-slate-700 mx-0.5" />
              <button
                type="button"
                onClick={onOpenShortcuts}
                className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer flex items-center justify-center shrink-0"
                title={language === 'en' ? 'Keyboard Shortcuts Cheat Sheet (?)' : 'Panduan Pintasan Keyboard (?)'}
              >
                <IconKeyboard className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Online Active Collaborators Presence (Co-Editors Icon Only with Hover Tooltip) */}
          {activeUsers && activeUsers.filter(u => u.user_role !== 'owner').length > 0 && (
            <>
              <div className="h-4 w-px bg-slate-200/80 mx-1" />
              <div className="flex items-center -space-x-1.5 overflow-hidden shrink-0">
                {activeUsers.filter(u => u.user_role !== 'owner').slice(0, 4).map((u) => (
                  <div
                    key={u.id}
                    className="relative inline-block cursor-pointer transition-transform hover:scale-110 hover:z-10"
                    title={u.user_name.toLowerCase().includes('co-editor') ? `${u.user_name} • Online` : `${u.user_name} (Co-Editor) • Online`}
                  >
                    <div className="h-6 w-6 rounded-full text-[10px] font-extrabold flex items-center justify-center border-2 border-white text-white bg-emerald-600 shadow-xs">
                      {u.user_name ? u.user_name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-500 ring-1.5 ring-white animate-pulse" />
                  </div>
                ))}
                {activeUsers.filter(u => u.user_role !== 'owner').length > 4 && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 border-2 border-white text-[9px] font-bold text-slate-600">
                    +{activeUsers.filter(u => u.user_role !== 'owner').length - 4}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
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


