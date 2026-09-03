import React, { useState } from 'react';
import { 
  IconMenu, IconRefresh, IconDownload, IconChevronDown, 
  IconLoader, IconFileWord, IconFilePdf, IconFileText, 
  IconBraces, IconBook, IconDatabase, IconBell, 
  IconShare, IconCreditCard, IconLayoutSidebarRightCollapse, 
  IconSettings 
} from '@tabler/icons-react';

export type EditorHeaderProps = {
  isSidebarExpanded: boolean;
  toggleSidebar: () => void;
  currentDocument: any;
  onRenameDocument: (val: string) => void;
  backendType: 'express' | 'supabase' | string;
  language: 'en' | 'id';
  activePlanId: string;
  bibliographyEntries: any[];
  exportToWordFile: (title: string, blocks: any[], bibs: any[], lang: string, isPro: boolean) => Promise<void>;
  exportToPdfFile: (title: string, blocks: any[], bibs: any[], lang: string, isPro: boolean) => Promise<void>;
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
  activeUsers?: any[];
};

export const EditorHeader = ({
  isSidebarExpanded,
  toggleSidebar,
  currentDocument,
  onRenameDocument,
  backendType,
  language,
  activePlanId,
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
  activeUsers,
}: EditorHeaderProps) => {
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  return (
    <header className="flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-3 lg:sticky lg:top-0 z-30 backdrop-blur whitespace-nowrap">
      <div className="w-full flex items-center gap-3">
        {!isSidebarExpanded && (
          <button
            type="button"
            aria-label="Menu"
            className="p-1.5 rounded-md hover:bg-slate-100/80 transition text-slate-500 hover:text-slate-800"
            style={{ background: 'transparent' }}
            onClick={toggleSidebar}
          >
            <IconMenu className="h-5 w-5" />
          </button>
        )}
        <input
          type="text"
          placeholder="Untitled Document"
          value={currentDocument?.title || ''}
          onChange={(e) => onRenameDocument(e.target.value)}
          className="w-full border-b border-transparent focus:border-indigo-400 text-base font-semibold text-slate-800 outline-none bg-transparent px-1 py-0.5 transition"
        />
      </div>
      <div className="flex items-center gap-2">
        {/* Live Hybrid Sync Engine Status Chip */}
        <div
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/80 border border-emerald-200/80 text-emerald-700 text-[10px] font-bold cursor-help"
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

        <div className="flex items-center gap-0.5 bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/50">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              disabled={isExporting || isExportingPdf}
              onClick={() => setShowExportDropdown(prev => !prev)}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-650 hover:bg-white hover:text-slate-800 disabled:opacity-70 disabled:cursor-not-allowed transition cursor-pointer"
            >
              {isExporting || isExportingPdf ? (
                <IconLoader className="h-3.5 w-3.5 text-indigo-500 animate-spin" />
              ) : (
                <IconDownload className="h-3.5 w-3.5 text-slate-500" />
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
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200/80 bg-white py-1 shadow-[0_10px_35px_rgba(0,0,0,0.08)] z-50 animate-scale-in">
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
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-650 hover:bg-slate-50 transition cursor-pointer"
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
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-650 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <IconFilePdf className="h-4 w-4 text-red-500 shrink-0" />
                    <span>PDF Document (.pdf)</span>
                  </button>

                  {/* Divider */}
                  <div className="h-px bg-slate-100 my-1" />

                  {/* Bibliography Exporters */}
                  <div className="px-3 py-1.5 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      {language === 'en' ? 'Bibliography' : 'Daftar Pustaka'}
                    </span>
                    <span className="text-[9px] bg-slate-100 text-slate-500 font-semibold px-1.5 py-0.2 rounded-full shrink-0">
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
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-650 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-650 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-650 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-650 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <IconDatabase className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>RIS Format (.ris)</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-slate-200/80 mx-0.5" />

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationsDropdown(prev => !prev)}
              className="inline-flex items-center justify-center rounded-md p-1.5 text-slate-550 hover:bg-white hover:text-slate-800 transition cursor-pointer relative"
              title={language === 'en' ? 'Notifications' : 'Notifikasi'}
            >
              <IconBell className="h-4.5 w-4.5 text-slate-550" />
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
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white py-2 shadow-2xl z-50 animate-scale-in max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-800">
                      {language === 'en' ? 'Notifications' : 'Notifikasi'}
                    </h4>
                    {notifications.filter(n => !n.read).length > 0 && (
                      <button
                        onClick={() => {
                          onMarkAllNotificationsRead?.();
                        }}
                        className="text-[10px] font-semibold text-indigo-650 hover:underline cursor-pointer"
                      >
                        {language === 'en' ? 'Mark all as read' : 'Tandai semua dibaca'}
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-slate-50">
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
                          className={`px-4 py-3 text-left hover:bg-slate-50 transition cursor-pointer flex gap-3 items-start ${!notif.read ? 'bg-indigo-50/10' : ''}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${!notif.read ? 'bg-indigo-500' : 'bg-transparent'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-700 leading-normal whitespace-normal break-words">
                              <span className="font-semibold text-slate-850">{notif.sender_name}</span> {notif.message}
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
          <div className="h-4 w-px bg-slate-200/80 mx-0.5" />

          {/* Share Button (Hidden for Free tier) */}
          {(activePlanId !== 'free' || role === 'admin') && (
            <>
              <button
                onClick={() => setIsShareOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-650 hover:bg-white hover:text-slate-800 transition cursor-pointer"
              >
                <IconShare className="h-3.5 w-3.5 text-slate-500" />
                {language === 'en' ? 'Share' : 'Bagikan'}
              </button>

              {/* Divider */}
              <div className="h-4 w-px bg-slate-200/80 mx-0.5" />
            </>
          )}

          {/* Pricing Button */}
          <button
            onClick={() => setIsPricingOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-650 hover:bg-white hover:text-slate-800 transition cursor-pointer"
          >
            <IconCreditCard className="h-3.5 w-3.5 text-slate-500" />
            {language === 'en' ? 'Pricing' : 'Langganan'}
          </button>

          {/* Divider */}
          <div className="h-4 w-px bg-slate-200/80 mx-0.5" />

          {/* Research Assistant Button */}
          <button
            onClick={() => setShowRightSidebar(prev => !prev)}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${showRightSidebar
              ? 'bg-white text-indigo-750 shadow-sm font-bold'
              : 'text-slate-650 hover:bg-white hover:text-slate-800'
              }`}
            title={language === 'en' ? 'Toggle Research Assistant Panel' : 'Toggle Bilah Asisten Riset'}
          >
            <IconLayoutSidebarRightCollapse className={`h-3.5 w-3.5 ${showRightSidebar ? 'text-indigo-650' : 'text-slate-500'}`} />
            {language === 'en' ? 'Research Assistant' : 'Asisten Riset'}
          </button>

          {/* Settings Button */}
          {currentDocument && onOpenSettings && (
            <>
              {/* Divider */}
              <div className="h-4 w-px bg-slate-200/80 mx-0.5" />
              <button
                type="button"
                onClick={onOpenSettings}
                className="p-1.5 rounded-md hover:bg-white text-slate-500 hover:text-slate-800 transition cursor-pointer flex items-center justify-center shrink-0"
                title={language === 'en' ? 'Document & Research Settings' : 'Pengaturan Dokumen & Riset'}
              >
                <IconSettings className="h-4 w-4" />
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
