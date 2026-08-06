// components/editor/share-document-modal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { IconX, IconCopy, IconCheck, IconShare, IconLock, IconWorld } from '@tabler/icons-react';
import { useLanguage } from '../i18n/language-context';
import { DocumentSettings } from '@/lib/api/documents';

interface ShareDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId?: string;
  documentTitle?: string;
  settings?: DocumentSettings;
  onSaveSettings?: (newSettings: Partial<DocumentSettings>) => void;
}

export function ShareDocumentModal({
  isOpen,
  onClose,
  documentId,
  documentTitle,
  settings,
  onSaveSettings
}: ShareDocumentModalProps) {
  const { language } = useLanguage();
  const [isLinkActive, setIsLinkActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsLinkActive(settings?.shareActive ?? false);
      setPermission(settings?.sharePermission ?? 'view');
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const shareUrl = `${origin || 'https://scholarflow.app'}/shared/doc-${documentId || 'untitled'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleLinkActive = () => {
    const nextActive = !isLinkActive;
    setIsLinkActive(nextActive);
    if (onSaveSettings) {
      onSaveSettings({
        ...settings,
        shareActive: nextActive
      });
    }
  };

  const handlePermissionChange = (newPerm: 'view' | 'edit') => {
    setPermission(newPerm);
    if (onSaveSettings) {
      onSaveSettings({
        ...settings,
        sharePermission: newPerm
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <IconShare className="h-4.5 w-4.5 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-800">
              {language === 'en' ? 'Share Journal Draft' : 'Bagikan Draf Jurnal'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
          >
            <IconX className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold text-slate-500">
              {language === 'en' ? 'Document Title' : 'Judul Dokumen'}
            </span>
            <span className="text-xs font-bold text-slate-800 line-clamp-1">{documentTitle || 'Untitled Document'}</span>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Active toggle */}
          <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              {isLinkActive ? (
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <IconWorld className="h-4 w-4" />
                </div>
              ) : (
                <div className="p-2 bg-slate-100 text-slate-500 rounded-lg">
                  <IconLock className="h-4 w-4" />
                </div>
              )}
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-700">
                  {language === 'en' ? 'Public Share Link' : 'Tautan Berbagi Publik'}
                </span>
                <span className="text-[9px] text-slate-400">
                  {language === 'en' ? 'Anyone with this link can access.' : 'Siapa pun yang memiliki tautan ini dapat mengakses.'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleLinkActive}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition cursor-pointer ${
                isLinkActive ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${
                  isLinkActive ? 'translate-x-4.5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {isLinkActive && (
            /* Link sharing content */
            <div className="flex flex-col gap-3 animate-fade-in">
              {/* Permission select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  {language === 'en' ? 'Link Access Permission' : 'Akses Izin Tautan'}
                </label>
                <select
                  value={permission}
                  onChange={(e) => handlePermissionChange(e.target.value as 'view' | 'edit')}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 bg-white outline-none focus:border-indigo-500 transition"
                >
                  <option value="view">{language === 'en' ? 'Read-only access' : 'Dapat membaca saja (Read-only)'}</option>
                  <option value="edit">{language === 'en' ? 'Can edit draft (Co-Editor)' : 'Dapat mengedit draf (Co-Editor)'}</option>
                </select>
              </div>

              {/* URL copy bar */}
              <div className="flex gap-2">
                <div className="flex-1 border border-slate-200 rounded-xl bg-slate-50 px-3 py-2 flex items-center overflow-hidden">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="w-full text-xs text-slate-500 outline-none bg-transparent select-all"
                  />
                </div>
                <button
                  onClick={handleCopy}
                  className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <IconCheck className="h-4 w-4" />
                      <span>{language === 'en' ? 'Copied' : 'Tersalin'}</span>
                    </>
                  ) : (
                    <>
                      <IconCopy className="h-4 w-4" />
                      <span>{language === 'en' ? 'Copy' : 'Salin'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {!isLinkActive && (
            <div className="py-4 flex flex-col items-center justify-center text-center gap-2">
              <IconLock className="h-8 w-8 text-slate-300" />
              <span className="text-xs text-slate-500 font-semibold">
                {language === 'en' ? 'Link Sharing Disabled' : 'Tautan Dinonaktifkan'}
              </span>
              <span className="text-[10px] text-slate-400 max-w-[250px] leading-normal">
                {language === 'en' 
                  ? 'Only you can view and edit this draft document in your account.' 
                  : 'Hanya Anda yang dapat melihat dan menulis di draf dokumen ini di dalam akun Anda.'}
              </span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
