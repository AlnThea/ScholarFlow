'use client';

import React, { useState } from 'react';
import {
  IconSettings,
  IconChevronDown,
  IconChevronUp,
  IconBrain,
  IconLanguage,
  IconFileCertificate,
  IconAdjustments,
} from '@tabler/icons-react';
import { StatsAiSelector } from './stats-ai-selector';
import {
  StatsAnalysisConfig,
  StatsSoftware,
  StatsTestType,
  StatsLanguage,
  StatsStyle,
} from './stats-types';

interface StatsConfigPanelProps {
  config: StatsAnalysisConfig;
  onChangeConfig: (newConfig: StatsAnalysisConfig) => void;
  language: 'id' | 'en';
  disabled?: boolean;
  aiModels?: any[];
  selectedAiModel?: string;
  activePlanId?: string | null;
  onOpenPricingModal?: () => void;
}

export function StatsConfigPanel({
  config,
  onChangeConfig,
  language,
  disabled = false,
  aiModels,
  selectedAiModel,
  activePlanId,
  onOpenPricingModal,
}: StatsConfigPanelProps) {
  const isEn = language === 'en';
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateField = <K extends keyof StatsAnalysisConfig>(
    field: K,
    value: StatsAnalysisConfig[K]
  ) => {
    onChangeConfig({
      ...config,
      [field]: value,
    });
  };

  const softwareOptions: { value: StatsSoftware; label: string }[] = [
    { value: 'spss', label: 'IBM SPSS Statistics' },
    { value: 'smartpls', label: 'SmartPLS 3 / 4 (PLS-SEM)' },
    { value: 'pspp', label: 'GNU PSPP (Open Source)' },
    { value: 'r_studio', label: 'R / RStudio' },
    { value: 'generic', label: isEn ? 'Other / Generic Table' : 'Lainnya / Tabel Umum' },
  ];

  const testTypeOptions: { value: StatsTestType; label: string }[] = [
    { value: 'auto', label: isEn ? '⚡ Auto-Detect from Output' : '⚡ Deteksi Otomatis dari Tabel' },
    { value: 'ttest', label: isEn ? 'Independent / Paired T-Test' : 'Uji Beda T-Test (Indep/Paired)' },
    { value: 'anova', label: isEn ? 'ANOVA (Analysis of Variance)' : 'Uji ANOVA (One-Way/Two-Way)' },
    { value: 'regression', label: isEn ? 'Linear / Multiple Regression' : 'Regresi Linier Sederhana/Berganda' },
    { value: 'correlation', label: isEn ? 'Pearson / Spearman Correlation' : 'Korelasi Pearson / Spearman' },
    { value: 'mann_whitney', label: isEn ? 'Mann-Whitney / Kruskal-Wallis' : 'Uji Non-Parametrik (Mann-Whitney)' },
    { value: 'chi_square', label: isEn ? 'Chi-Square Test (X²)' : 'Uji Independensi Chi-Square (X²)' },
    { value: 'cronbach_alpha', label: isEn ? 'Reliability (Cronbach Alpha)' : 'Uji Reliabilitas (Cronbach Alpha)' },
    { value: 'pls_sem', label: isEn ? 'PLS-SEM (Outer/Inner Model)' : 'PLS-SEM (Outer & Inner Model)' },
  ];

  const styleOptions: { value: StatsStyle; label: string; desc: string }[] = [
    {
      value: 'skripsi',
      label: isEn ? 'Undergraduate (Skripsi/S1)' : 'Skripsi (Sarjana/S1)',
      desc: isEn ? 'Detailed hypotheses, alpha 5%, step-by-step' : 'Runtut, uji H0/Ha, taraf signifikansi 5%',
    },
    {
      value: 'thesis',
      label: isEn ? 'Graduate (Thesis/S2/S3)' : 'Tesis / Disertasi (S2/S3)',
      desc: isEn ? 'Rigorous effect sizes, critical synthesis' : 'Kritis, effect size, Cohen d, R-squared',
    },
    {
      value: 'journal',
      label: isEn ? 'Journal Article (APA 7th)' : 'Artikel Jurnal (APA 7th)',
      desc: isEn ? 'Dense, publication-ready APA 7 format' : 'Padat, siap submit jurnal bereputasi',
    },
    {
      value: 'compact',
      label: isEn ? 'Compact Executive Summary' : 'Ringkas / Poin Kunci',
      desc: isEn ? 'Bullet points of statistical facts' : 'Hanya poin angka dan kesimpulan inti',
    },
  ];

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-3.5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconAdjustments className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            {isEn ? '2. Analysis Configuration' : '2. Konfigurasi Analisis'}
          </h3>
        </div>
        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
          APA 7th Edition
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Software Select */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {isEn ? 'Software Source' : 'Sumber Software'}
          </label>
          <select
            value={config.software}
            disabled={disabled}
            onChange={(e) => updateField('software', e.target.value as StatsSoftware)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1.5 focus:ring-indigo-500 disabled:opacity-60 cursor-pointer"
          >
            {softwareOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Test Type Select */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {isEn ? 'Statistical Test' : 'Jenis Uji Statistik'}
          </label>
          <select
            value={config.testType}
            disabled={disabled}
            onChange={(e) => updateField('testType', e.target.value as StatsTestType)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1.5 focus:ring-indigo-500 disabled:opacity-60 cursor-pointer"
          >
            {testTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Language Select */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {isEn ? 'Narrative Language' : 'Bahasa Narasi'}
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              disabled={disabled}
              onClick={() => updateField('language', 'id')}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium border text-center transition ${
                config.language === 'id'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              🇮🇩 Indonesia
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => updateField('language', 'en')}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium border text-center transition ${
                config.language === 'en'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* Writing Style */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {isEn ? 'Output Academic Style' : 'Gaya Penulisan Akademik'}
          </label>
          <select
            value={config.style}
            disabled={disabled}
            onChange={(e) => updateField('style', e.target.value as StatsStyle)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1.5 focus:ring-indigo-500 disabled:opacity-60 cursor-pointer"
          >
            {styleOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* AI Provider & Multimodal Model Selector */}
      <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
        <StatsAiSelector
          config={config}
          onChangeConfig={onChangeConfig}
          language={language}
          disabled={disabled}
          aiModels={aiModels}
          selectedAiModel={selectedAiModel}
          activePlanId={activePlanId}
          onOpenPricingModal={onOpenPricingModal}
        />
      </div>

      {/* Advanced Collapsible Context / Hypothesis Input */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition"
        >
          {showAdvanced ? (
            <IconChevronUp className="h-3.5 w-3.5" />
          ) : (
            <IconChevronDown className="h-3.5 w-3.5" />
          )}
          <span>
            {isEn ? 'Research Hypothesis / Context (Optional)' : 'Hipotesis / Pertanyaan Riset (Opsional)'}
          </span>
        </button>

        {showAdvanced && (
          <div className="mt-2 space-y-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-750 bg-slate-50/70 dark:bg-slate-850">
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {isEn ? 'Research Hypothesis (H1 / Ha)' : 'Hipotesis Penelitian (H1 / Ha)'}
              </label>
              <input
                type="text"
                disabled={disabled}
                value={config.hypothesis || ''}
                onChange={(e) => updateField('hypothesis', e.target.value)}
                placeholder={
                  isEn
                    ? 'e.g. There is a significant effect of X on Y...'
                    : 'Contoh: Terdapat pengaruh signifikan antara Brand Image terhadap Keputusan Pembelian...'
                }
                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1.5 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {isEn ? 'Research Question / Variable Names' : 'Pertanyaan Penelitian / Nama Variabel'}
              </label>
              <input
                type="text"
                disabled={disabled}
                value={config.researchQuestion || ''}
                onChange={(e) => updateField('researchQuestion', e.target.value)}
                placeholder={
                  isEn
                    ? 'e.g. Variable X = Learning Motivation, Y = Academic Performance'
                    : 'Contoh: Variabel X = Motivasi Belajar, Variabel Y = Prestasi Akademik'
                }
                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1.5 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
