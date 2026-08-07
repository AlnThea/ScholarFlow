// components/editor/limit-warning-modal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IconLock, IconX } from '@tabler/icons-react';
import { useLanguage } from '../i18n/language-context';

interface LimitWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  message: string;
  title?: string;
}

export function LimitWarningModal({ 
  isOpen, 
  onClose, 
  onUpgrade, 
  message, 
  title 
}: LimitWarningModalProps) {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xl w-full max-w-md flex flex-col gap-5 animate-scale-in text-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <span className="text-indigo-600">🔒</span>
            {title || (language === 'en' ? 'Feature Locked' : 'Fitur Terkunci')}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:bg-slate-100/80 hover:text-slate-700 transition cursor-pointer"
          >
            <IconX className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-center py-4 bg-indigo-50/50 rounded-xl border border-indigo-100/40 text-indigo-600">
            <IconLock className="h-12 w-12" />
          </div>
          <p className="text-xs text-slate-650 leading-relaxed text-center font-medium">
            {message}
          </p>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 transition cursor-pointer border border-transparent"
          >
            {language === 'en' ? 'Close' : 'Tutup'}
          </button>
          <button
            onClick={() => {
              onClose();
              onUpgrade();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer shadow-sm shadow-indigo-200"
          >
            {language === 'en' ? 'See Pricing / Upgrade' : 'Lihat Paket & Upgrade'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
