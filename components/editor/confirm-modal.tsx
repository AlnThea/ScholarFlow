import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IconAlertTriangle, IconX } from '@tabler/icons-react';
import { useLanguage } from '../i18n/language-context';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = 'info'
}: ConfirmModalProps) {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const isDanger = type === 'danger';

  return createPortal(
    <div className="fixed inset-0 z-[10100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xl w-full max-w-md flex flex-col gap-5 animate-scale-in text-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <span className={isDanger ? 'text-red-500' : 'text-indigo-600'}>
              <IconAlertTriangle className="h-4.5 w-4.5" />
            </span>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:bg-slate-100/80 hover:text-slate-700 transition cursor-pointer"
          >
            <IconX className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-3">
          <p className="text-xs text-slate-650 leading-relaxed font-medium">
            {message}
          </p>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 transition cursor-pointer border border-transparent"
          >
            {cancelText || (language === 'en' ? 'Cancel' : 'Batal')}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition cursor-pointer shadow-sm ${
              isDanger 
                ? 'bg-red-600 hover:bg-red-700 shadow-red-100' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
            }`}
          >
            {confirmText || (language === 'en' ? 'Confirm' : 'Konfirmasi')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
