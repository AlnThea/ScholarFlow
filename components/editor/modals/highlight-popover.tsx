import React from 'react';
import { createPortal } from 'react-dom';

type HighlightPopoverProps = {
  isOpen: boolean;
  onClose: () => void;
  popoverRect: DOMRect | null;
  onApplyHighlight: (color: string) => void;
  language: 'en' | 'id';
};

export const HighlightPopover = ({
  isOpen,
  onClose,
  popoverRect,
  onApplyHighlight,
  language,
}: HighlightPopoverProps) => {
  if (!isOpen || !popoverRect || typeof window === 'undefined') return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[9998]"
        onClick={onClose}
      />
      <div
        className="fixed z-[9999] bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex items-center gap-1.5 animate-scale-in"
        style={{
          top: `${popoverRect.bottom + window.scrollY + 6}px`,
          left: `${Math.max(10, popoverRect.left + window.scrollX - 60)}px`,
        }}
      >
        <button
          onClick={() => onApplyHighlight('yellow')}
          className="w-6 h-6 rounded bg-yellow-200 border border-yellow-350 hover:scale-105 active:scale-95 transition cursor-pointer"
          title={language === 'en' ? 'Yellow' : 'Kuning'}
        />
        <button
          onClick={() => onApplyHighlight('green')}
          className="w-6 h-6 rounded bg-green-200 border border-green-300 hover:scale-105 active:scale-95 transition cursor-pointer"
          title={language === 'en' ? 'Green' : 'Hijau'}
        />
        <button
          onClick={() => onApplyHighlight('blue')}
          className="w-6 h-6 rounded bg-sky-200 border border-sky-300 hover:scale-105 active:scale-95 transition cursor-pointer"
          title={language === 'en' ? 'Blue' : 'Biru'}
        />
        <button
          onClick={() => onApplyHighlight('pink')}
          className="w-6 h-6 rounded bg-pink-200 border border-pink-300 hover:scale-105 active:scale-95 transition cursor-pointer"
          title={language === 'en' ? 'Pink' : 'Merah Muda'}
        />
        <button
          onClick={() => onApplyHighlight('purple')}
          className="w-6 h-6 rounded bg-purple-200 border border-purple-300 hover:scale-105 active:scale-95 transition cursor-pointer"
          title={language === 'en' ? 'Purple' : 'Ungu'}
        />
        <div className="w-px h-4 bg-slate-200 mx-0.5" />
        <button
          onClick={() => onApplyHighlight('clear')}
          className="p-1.5 rounded text-red-500 hover:bg-red-50 hover:text-red-600 transition cursor-pointer flex items-center justify-center"
          title={language === 'en' ? 'Clear Highlight' : 'Hapus Sorotan'}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </>,
    document.body
  );
};
