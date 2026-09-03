import React from 'react';
import { IconCheck, IconSparkles, IconX } from '@tabler/icons-react';

type SuggestionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string | null;
  newText: string;
  setNewText: (val: string) => void;
  onConfirm: () => void;
  language: 'en' | 'id';
};

export const SuggestionModal = ({
  isOpen,
  onClose,
  selectedText,
  newText,
  setNewText,
  onConfirm,
  language,
}: SuggestionModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-4 font-sans text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <IconSparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'id' ? '💡 Usulkan Perubahan Teks' : '💡 Propose Text Suggestion'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {language === 'id' ? 'Mode Track Changes (Dapat diterima / ditolak oleh pemilik)' : 'Track Changes Mode (Can be accepted or rejected)'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        {selectedText && (
          <div className="flex flex-col gap-1 p-3 bg-rose-50/60 border border-rose-100 rounded-xl">
            <span className="text-[9px] font-bold text-rose-700 uppercase tracking-wider">
              {language === 'id' ? 'Teks Asli (Dihapus):' : 'Original Text (Deleted):'}
            </span>
            <p className="text-xs text-rose-900 line-through font-medium leading-relaxed">
              "{selectedText}"
            </p>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">
            {language === 'id' ? 'Usulan Teks Baru:' : 'Proposed New Text:'}
          </label>
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder={language === 'id' ? 'Ketik usulan teks baru (biarkan kosong jika mengusulkan penghapusan)...' : 'Type proposed new text...'}
            className="w-full h-24 text-xs p-3 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition font-sans text-slate-800"
          />
          <span className="text-[9px] text-slate-400 italic">
            * {language === 'id' ? 'Kosongkan jika hanya ingin mengusulkan penghapusan teks.' : 'Leave blank to propose text deletion.'}
          </span>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            {language === 'id' ? 'Batal' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
          >
            <IconCheck className="h-4 w-4" />
            {language === 'id' ? 'Kirim Usulan' : 'Submit Suggestion'}
          </button>
        </div>
      </div>
    </div>
  );
};
