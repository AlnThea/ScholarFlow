import React from 'react';
import { IconSparkles, IconRefresh } from '@tabler/icons-react';

interface RemoteUpdateBannerProps {
  hasPendingRemoteUpdate: boolean;
  language: string;
  onUpdate: () => void;
}

export function RemoteUpdateBanner({
  hasPendingRemoteUpdate,
  language,
  onUpdate
}: RemoteUpdateBannerProps) {
  if (!hasPendingRemoteUpdate) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 bg-slate-900/95 text-white backdrop-blur-md text-xs font-semibold rounded-full shadow-2xl border border-amber-500/40 animate-pulse transition-all">
      <span className="flex items-center gap-2 text-amber-400">
        <IconSparkles className="w-4 h-4 text-amber-400" />
        <span>
          {language === 'en'
            ? 'Latest document revision has been accepted!'
            : 'Revisi usulan dokumen terbaru telah diterima!'}
        </span>
      </span>
      <button
        type="button"
        onClick={onUpdate}
        className="px-3.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-full transition shadow-xs cursor-pointer flex items-center gap-1.5"
      >
        <IconRefresh className="w-3.5 h-3.5" />
        {language === 'en' ? 'Update Editor' : 'Perbarui Editor'}
      </button>
    </div>
  );
}
