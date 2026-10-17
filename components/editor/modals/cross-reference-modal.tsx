'use client';

import React, { useState, useMemo } from 'react';
import {
  IconPhoto,
  IconTable,
  IconSearch,
  IconX,
  IconArrowRight,
  IconLink,
  IconRefresh,
  IconSparkles
} from '@tabler/icons-react';
import {
  type ScientificItem,
  type ScientificItemType,
  extractScientificItems
} from '@/lib/editor/cross-reference';

export interface CrossReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentContent: any;
  language?: 'en' | 'id';
  onInsertReference: (targetId: string, type: ScientificItemType, index: number, label: string) => void;
  onRefreshReferences?: () => void;
}

export const CrossReferenceModal = ({
  isOpen,
  onClose,
  documentContent,
  language = 'id',
  onInsertReference,
  onRefreshReferences,
}: CrossReferenceModalProps) => {
  const isEn = language === 'en';
  const [activeTab, setActiveTab] = useState<'all' | 'figure' | 'table'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract figures and tables from document content
  const { figures, tables } = useMemo(() => {
    if (!documentContent) return { figures: [], tables: [] };
    const blocks =
      typeof documentContent === 'string'
        ? (() => {
            try {
              return JSON.parse(documentContent).blocks || [];
            } catch {
              return [];
            }
          })()
        : documentContent.blocks || [];
    return extractScientificItems(blocks, language);
  }, [documentContent, language]);

  const allItems = useMemo(() => {
    return [...figures, ...tables].sort((a, b) => a.index - b.index);
  }, [figures, tables]);

  const filteredItems = useMemo(() => {
    let items = activeTab === 'all' ? allItems : activeTab === 'figure' ? figures : tables;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.caption.toLowerCase().includes(q) ||
          (item.previewSnippet && item.previewSnippet.toLowerCase().includes(q))
      );
    }

    return items;
  }, [allItems, figures, tables, activeTab, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <IconLink className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isEn ? 'Insert Figure / Table Cross-Reference' : 'Sisipkan Rujukan Gambar / Tabel'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn
                  ? 'Auto-numbered in-text scientific citation (@fig / @tab)'
                  : 'Penomoran otomatis rujukan ilmiah di dalam teks naskah'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        {/* Toolbar: Search & Filter Tabs */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-2.5 bg-white dark:bg-slate-900">
          <div className="relative w-full sm:flex-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={isEn ? 'Search caption or title...' : 'Cari keterangan atau judul...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg shrink-0 w-full sm:w-auto justify-center">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {isEn ? `All (${allItems.length})` : `Semua (${allItems.length})`}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('figure')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition flex items-center gap-1 ${
                activeTab === 'figure'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <IconPhoto className="h-3 w-3" />
              <span>{isEn ? `Figures (${figures.length})` : `Gambar (${figures.length})`}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition flex items-center gap-1 ${
                activeTab === 'table'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <IconTable className="h-3 w-3" />
              <span>{isEn ? `Tables (${tables.length})` : `Tabel (${tables.length})`}</span>
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-2.5 max-h-[50vh]">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
              <IconSparkles className="h-8 w-8 mx-auto mb-2 opacity-50 text-indigo-400" />
              <p>
                {allItems.length === 0
                  ? isEn
                    ? 'No figures or tables found in this manuscript yet. Insert an image or table first!'
                    : 'Belum ada gambar atau tabel dalam naskah ini. Silakan sisipkan gambar atau tabel terlebih dahulu!'
                  : isEn
                  ? 'No matching figures or tables found for this query.'
                  : 'Tidak ada gambar atau tabel yang sesuai dengan pencarian.'}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-indigo-300 dark:hover:border-indigo-600 transition group shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      item.type === 'figure'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {item.type === 'figure' ? <IconPhoto className="h-5 w-5" /> : <IconTable className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.label}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                        ({item.blockId})
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-sm">
                      {item.caption}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onInsertReference(item.id, item.type, item.index, item.label);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition cursor-pointer shrink-0"
                >
                  <span>{isEn ? 'Insert' : 'Sisipkan'}</span>
                  <IconArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer with Refresh Re-indexing Button */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <span>💡</span>
            <span>
              {isEn
                ? 'Tip: Type @fig:1 or @tab:1 directly in your paragraph'
                : 'Tips: Ketik @fig:1 atau @tab:1 langsung di dalam paragraf'}
            </span>
          </div>
          {onRefreshReferences && (
            <button
              type="button"
              onClick={onRefreshReferences}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
              title={isEn ? 'Recalculate order numbers' : 'Hitung ulang nomor urut'}
            >
              <IconRefresh className="h-3.5 w-3.5" />
              <span>{isEn ? 'Re-index Numbers' : 'Urutkan Ulang'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
