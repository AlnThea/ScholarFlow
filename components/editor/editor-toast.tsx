import React from 'react';
import { IconCheck, IconAlertCircle, IconInfoCircle } from '@tabler/icons-react';

interface EditorToastProps {
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  language: string;
}

export function EditorToast({ toastMessage, language }: EditorToastProps) {
  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[10200] flex items-center gap-3 bg-white/95 border border-slate-100 p-4 rounded-xl shadow-xl animate-slide-up max-w-sm font-sans">
      <div className={`p-2 rounded-lg ${
        toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
        toastMessage.type === 'error' ? 'bg-red-50 text-red-600' :
        'bg-blue-50 text-blue-600'
      }`}>
        {toastMessage.type === 'success' && <IconCheck className="h-4.5 w-4.5" />}
        {toastMessage.type === 'error' && <IconAlertCircle className="h-4.5 w-4.5" />}
        {toastMessage.type === 'info' && <IconInfoCircle className="h-4.5 w-4.5" />}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[11px] font-bold text-slate-800">
          {toastMessage.type === 'success' ? (language === 'en' ? 'Success' : 'Berhasil') :
           toastMessage.type === 'error' ? (language === 'en' ? 'Error' : 'Gagal') :
           (language === 'en' ? 'Info' : 'Informasi')}
        </span>
        <p className="text-[10px] text-slate-500 font-medium leading-tight truncate max-w-[200px]">
          {toastMessage.text}
        </p>
      </div>
    </div>
  );
}
