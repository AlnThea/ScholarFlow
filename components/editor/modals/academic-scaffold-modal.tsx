// components/editor/modals/academic-scaffold-modal.tsx
// Phase 31: Interactive Academic Thesis & Paper Outline Generator Modal

'use client';

import React, { useState } from 'react';
import { 
  IconSparkles, 
  IconX, 
  IconLayoutList, 
  IconBook, 
  IconCheck, 
  IconLoader2, 
  IconChevronRight, 
  IconFileText, 
  IconArrowDown,
  IconBrain
} from '@tabler/icons-react';
import { useLanguage } from '@/components/i18n/language-context';
import { 
  getAllAcademicPresets, 
  getAcademicPreset, 
  AcademicStructurePresetId, 
  convertScaffoldToEditorJsBlocks 
} from '@/lib/editor/academic-templates';
import { 
  convertTailoredAirOutlineToBlocks, 
  injectScaffoldIntoEditorJs, 
  TailoredOutlineData 
} from '@/lib/editor/methods/outline-scaffold';

interface AcademicScaffoldModalProps {
  isOpen: boolean;
  onClose: () => void;
  editorInstance?: any;
  onApplyBlocks?: (blocks: any[]) => void;
  documentTitle?: string;
  userId?: string;
  userPlan?: string;
}

export function AcademicScaffoldModal({
  isOpen,
  onClose,
  editorInstance,
  onApplyBlocks,
  documentTitle = '',
  userId,
  userPlan = 'free',
}: AcademicScaffoldModalProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const presets = getAllAcademicPresets();
  const [selectedPresetId, setSelectedPresetId] = useState<AcademicStructurePresetId>('imrad');
  const [activeTab, setActiveTab] = useState<'standard' | 'ai_custom'>('standard');
  
  // AI customization fields
  const [topic, setTopic] = useState(documentTitle || '');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [methodology, setMethodology] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [tailoredData, setTailoredData] = useState<TailoredOutlineData | null>(null);

  // Settings
  const [includePrompts, setIncludePrompts] = useState(true);
  const [includeChecklist, setIncludeChecklist] = useState(true);
  const [insertionMode, setInsertionMode] = useState<'append' | 'replace'>('append');
  const [isApplying, setIsApplying] = useState(false);

  if (!isOpen) return null;

  const currentPreset = getAcademicPreset(selectedPresetId);

  const handleGenerateAiOutline = async () => {
    if (!topic.trim()) {
      setAiError(isEn ? 'Please enter a research topic or draft title.' : 'Silakan masukkan topik atau judul draf penelitian.');
      return;
    }

    setIsGenerating(true);
    setAiError(null);

    try {
      const res = await fetch('/api/v1/ai/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          field: fieldOfStudy.trim(),
          methodology: methodology.trim(),
          presetId: selectedPresetId,
          language: isEn ? 'en' : 'id',
          userId,
          userPlan
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to generate tailored outline');
      }

      setTailoredData(json.data);
    } catch (err: any) {
      setAiError(err.message || 'Error occurred while contacting AI');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyToCanvas = async () => {
    setIsApplying(true);
    try {
      let blocks: any[] = [];

      if (activeTab === 'ai_custom' && tailoredData) {
        blocks = convertTailoredAirOutlineToBlocks(tailoredData, isEn ? 'en' : 'id', includePrompts);
      } else {
        blocks = convertScaffoldToEditorJsBlocks(currentPreset, {
          language: isEn ? 'en' : 'id',
          includePromptsAsParagraphs: includePrompts,
          includeChecklistsAsLists: includeChecklist,
          paperTitle: topic.trim() || documentTitle
        });
      }

      if (onApplyBlocks) {
        onApplyBlocks(blocks);
      } else if (editorInstance) {
        await injectScaffoldIntoEditorJs(editorInstance, blocks, insertionMode);
      }

      onClose();
    } catch (err) {
      console.error('Failed to apply scaffold:', err);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <IconLayoutList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {isEn ? 'Academic Outline & Structure Scaffolding' : 'Kerangka & Struktur Naskah Ilmiah'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn 
                  ? 'Standardized publication structure with interactive research guidance'
                  : 'Format baku penulisan ilmiah berstandar nasional dan internasional'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('standard')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'standard'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <IconBook className="w-4 h-4" />
            {isEn ? 'Standard Presets' : 'Format Standar Baku'}
          </button>
          <button
            onClick={() => setActiveTab('ai_custom')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'ai_custom'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <IconSparkles className="w-4 h-4 text-amber-500" />
            {isEn ? 'AI Tailored Scaffolding' : 'Personalisasi AI Khusus Topik'}
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Preset Cards Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              {isEn ? '1. Select Publication Framework' : '1. Pilih Kerangka Acuan Publikasi'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {presets.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedPresetId(preset.id);
                      setTailoredData(null);
                    }}
                    className={`p-3.5 text-left rounded-xl border transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm">
                        {isEn ? preset.name.en : preset.name.id}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {isEn ? preset.badge.en : preset.badge.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {isEn ? preset.description.en : preset.description.id}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Tailored Tab Options */}
          {activeTab === 'ai_custom' && (
            <div className="p-4 rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                <IconBrain className="w-4 h-4" />
                {isEn ? 'AI Research Context' : 'Konteks Riset untuk AI'}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  {isEn ? 'Research Topic / Title *' : 'Judul / Topik Penelitian *'}
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={isEn ? 'e.g., Deep Learning for Early Plant Disease Detection...' : 'Contoh: Penerapan Algoritma Naive Bayes pada Analisis Sentimen...'}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {isEn ? 'Field of Study' : 'Bidang Ilmu / Fakultas'}
                  </label>
                  <input
                    type="text"
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    placeholder={isEn ? 'e.g., Computer Science, Economics...' : 'Contoh: Ilmu Komputer, Manajemen...'}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {isEn ? 'Methodology' : 'Metodologi Penelitian'}
                  </label>
                  <input
                    type="text"
                    value={methodology}
                    onChange={(e) => setMethodology(e.target.value)}
                    placeholder={isEn ? 'e.g., Quantitative Survey, CNN...' : 'Contoh: Kuantitatif Asosiatif, Prototype...'}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {aiError && (
                <div className="text-xs text-rose-600 dark:text-rose-400 p-2 bg-rose-50 dark:bg-rose-950/30 rounded-lg">
                  {aiError}
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerateAiOutline}
                disabled={isGenerating || !topic.trim()}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                {isGenerating ? (
                  <>
                    <IconLoader2 className="w-4 h-4 animate-spin" />
                    {isEn ? 'Synthesizing Academic Outline...' : 'Menyusun Kerangka Akademis AI...'}
                  </>
                ) : (
                  <>
                    <IconSparkles className="w-4 h-4" />
                    {isEn ? 'Generate Tailored Outline with AI' : 'Hasilkan Kerangka Terpersonalisasi via AI'}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Outline Preview Section */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              {isEn ? '2. Structure Preview' : '2. Pratinjau Struktur Naskah'}
            </label>

            {activeTab === 'ai_custom' && tailoredData ? (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/60 space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <IconCheck className="w-4 h-4" />
                  {isEn ? 'AI Custom Outline Generated' : 'Kerangka AI Khusus Berhasil Disusun'}
                </div>
                {tailoredData.executiveSummary && (
                  <p className="text-xs italic text-slate-600 dark:text-slate-300">
                    "{tailoredData.executiveSummary}"
                  </p>
                )}
                <div className="space-y-2 mt-2">
                  {tailoredData.sections.map((sec, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{sec.title}</div>
                      {sec.tailoredPrompt && (
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1">
                          💡 {sec.tailoredPrompt}
                        </p>
                      )}
                      {sec.suggestedSubsections && sec.suggestedSubsections.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {sec.suggestedSubsections.map((sub, sIdx) => (
                            <span key={sIdx} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[10px] text-slate-600 dark:text-slate-300">
                              {sub}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-200 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                {currentPreset.sections.map((sec) => (
                  <div key={sec.id} className="p-3">
                    <div className="flex items-center gap-2 font-semibold text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      {isEn ? sec.title.en : sec.title.id}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-3.5">
                      {isEn ? sec.guidingPrompt.en : sec.guidingPrompt.id}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Insertion Options */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includePrompts}
                onChange={(e) => setIncludePrompts(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>{isEn ? 'Include writing prompts & guidelines' : 'Sertakan panduan penulisan di naskah'}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeChecklist}
                onChange={(e) => setIncludeChecklist(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>{isEn ? 'Include checklist items' : 'Sertakan daftar periksa (checklist)'}</span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">{isEn ? 'Insert mode:' : 'Metode sisip:'}</span>
            <select
              value={insertionMode}
              onChange={(e) => setInsertionMode(e.target.value as any)}
              className="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="append">{isEn ? 'Append to End' : 'Sisipkan di Akhir'}</option>
              <option value="replace">{isEn ? 'Replace Document' : 'Gantikan Seluruh Naskah'}</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isEn ? 'Cancel' : 'Batal'}
            </button>
            <button
              type="button"
              onClick={handleApplyToCanvas}
              disabled={isApplying}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              {isApplying ? (
                <>
                  <IconLoader2 className="w-3.5 h-3.5 animate-spin" />
                  {isEn ? 'Applying...' : 'Menerapkan...'}
                </>
              ) : (
                <>
                  <IconCheck className="w-3.5 h-3.5" />
                  {isEn ? 'Apply to Canvas' : 'Terapkan ke Naskah'}
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
