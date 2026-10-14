'use client';

import React, { useState, useEffect } from 'react';
import {
  IconCpu,
  IconKey,
  IconEye,
  IconEyeOff,
  IconSparkles,
  IconShieldLock,
  IconCrown,
  IconArrowUpRight,
} from '@tabler/icons-react';
import { fetchAIModels, type AIModel } from '@/lib/api/ai-models';
import { StatsAIProvider, StatsAnalysisConfig } from './stats-types';

interface StatsAiSelectorProps {
  config: StatsAnalysisConfig;
  onChangeConfig: (newConfig: StatsAnalysisConfig) => void;
  language: 'id' | 'en';
  disabled?: boolean;
  aiModels?: AIModel[];
  selectedAiModel?: string;
  activePlanId?: string | null;
  onOpenPricingModal?: () => void;
}

export function StatsAiSelector({
  config,
  onChangeConfig,
  language,
  disabled = false,
  aiModels: propModels,
  selectedAiModel,
  activePlanId = 'free',
  onOpenPricingModal,
}: StatsAiSelectorProps) {
  const isEn = language === 'en';
  const isFreePlan = activePlanId === 'free' || !activePlanId;
  const [showApiKey, setShowApiKey] = useState(false);
  const [availableModels, setAvailableModels] = useState<AIModel[]>(propModels || []);
  const [showCustomKeyInput, setShowCustomKeyInput] = useState(false);

  // Fetch registered AI models from ScholarFlow centralized registry
  useEffect(() => {
    if (propModels && propModels.length > 0) {
      setAvailableModels(propModels);
      return;
    }
    fetchAIModels().then((models) => {
      if (models && models.length > 0) {
        setAvailableModels(models);
      }
    });
  }, [propModels]);

  // Sync initial model with ScholarFlow's selected model if not set yet
  useEffect(() => {
    if (!config.aiModel && selectedAiModel) {
      const match = availableModels.find((m) => m.id === selectedAiModel || m.model_id === selectedAiModel);
      if (match) {
        const providerType: StatsAIProvider =
          match.provider_type === 'gemini'
            ? 'gemini'
            : match.provider_type === 'openrouter'
            ? 'openrouter'
            : 'openai';

        onChangeConfig({
          ...config,
          aiModel: match.model_id || match.id,
          aiProvider: providerType,
        });
      }
    }
  }, [selectedAiModel, availableModels]);

  // Fallback models if registry hasn't loaded yet
  const registeredModels: (AIModel | any)[] = availableModels.length > 0 ? availableModels : [
    { id: 'gemini', name: 'Gemini 1.5 Flash (Direct)', model_id: 'gemini-1.5-flash', provider_type: 'gemini' as const, is_enabled: true, is_premium: false, workload_category: 'all' },
    { id: 'gemini-pro', name: 'Gemini 1.5 Pro (Direct)', model_id: 'gemini-1.5-pro', provider_type: 'gemini' as const, is_enabled: true, is_premium: true, workload_category: 'all' },
    { id: 'claude', name: 'Claude 3.5 Sonnet (OpenRouter)', model_id: 'anthropic/claude-3.5-sonnet', provider_type: 'openrouter' as const, is_enabled: true, is_premium: true, workload_category: 'all' },
    { id: 'gpt-4o', name: 'GPT-4o Omni (Direct)', model_id: 'gpt-4o', provider_type: 'custom_openai' as const, is_enabled: true, is_premium: true, workload_category: 'all' },
  ];

  const isModelPremium = (model: AIModel | any): boolean => {
    if (model.is_premium) return true;
    const id = (model.model_id || model.id || '').toLowerCase();
    return id.includes('claude') || id.includes('gpt-4o') || id.includes('pro');
  };

  const handleSelectModel = (modelId: string) => {
    const selected = registeredModels.find((m) => m.model_id === modelId || m.id === modelId);
    if (!selected) return;

    let provider: StatsAIProvider = 'gemini';
    if (selected.provider_type === 'openrouter') provider = 'openrouter';
    else if (selected.provider_type === 'custom_openai') provider = 'openai';

    onChangeConfig({
      ...config,
      aiModel: selected.model_id || selected.id,
      aiProvider: provider,
    });

    // If selecting a PRO model while on free plan and without a custom key, prompt upgrade
    if (isFreePlan && isModelPremium(selected) && !config.customApiKey) {
      onOpenPricingModal?.();
    }
  };

  const handleApiKeyChange = (key: string) => {
    // SECURITY: Strictly held in React Memory / state only. Never written to localStorage.
    onChangeConfig({
      ...config,
      customApiKey: key,
    });
  };

  const currentModelId = config.aiModel || 'gemini-1.5-flash';
  const currentModelObj = registeredModels.find((m) => m.model_id === currentModelId || m.id === currentModelId);
  const isCurrentModelLocked = isFreePlan && currentModelObj && isModelPremium(currentModelObj) && !config.customApiKey;

  return (
    <div className="space-y-2.5 pt-1">
      {/* Model Selector from Centralized ScholarFlow AI Models */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <IconCpu className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{isEn ? 'AI Model' : 'Model AI'}</span>
          </label>
          <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.2 rounded-full">
            {isEn ? 'Freemium PLG' : 'Model Bertingkat'}
          </span>
        </div>

        <select
          value={currentModelId}
          disabled={disabled}
          onChange={(e) => handleSelectModel(e.target.value)}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1.5 focus:ring-indigo-500 disabled:opacity-60 cursor-pointer"
        >
          {registeredModels
            .filter((m) => m.is_enabled !== false)
            .map((m) => {
              const isPrem = isModelPremium(m);
              const tag = m.workload_category === 'text'
                ? (isEn ? ' [Text Only]' : ' [Khusus Teks]')
                : m.workload_category === 'vision'
                ? ' [Vision]'
                : '';
              return (
                <option key={m.id || m.model_id} value={m.model_id || m.id}>
                  {isPrem ? '👑 ' : ''}{m.name} {isPrem ? '(PRO)' : '(FREE)'}{tag}
                </option>
              );
            })}
        </select>

        {/* Advisory if a text-only model is selected for SPSS interpretation */}
        {currentModelObj?.workload_category === 'text' && (
          <p className="mt-1 text-[10px] text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <span>ℹ️</span>
            <span>
              {isEn
                ? 'This model is text-only. For SPSS screenshots or charts, a Multimodal/Vision model is recommended.'
                : 'Model ini khusus teks. Untuk gambar output/tangkapan layar SPSS, disarankan model Vision.'}
            </span>
          </p>
        )}

        {/* Upgrade Banner if a PRO Model is Selected on Free Plan */}
        {isCurrentModelLocked && (
          <div className="mt-2 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/80 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 flex items-center justify-between gap-2 animate-fade-in shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-amber-500 font-bold text-sm">👑</span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-amber-950 dark:text-amber-200 truncate">
                  {isEn ? 'PRO Model Selected' : 'Model Eksklusif PRO'}
                </p>
                <p className="text-[10px] text-amber-800 dark:text-amber-300">
                  {isEn ? 'Upgrade to Pro or enter your custom API key below.' : 'Upgrade ke Pro atau gunakan API key sendiri.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenPricingModal}
              className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition cursor-pointer"
            >
              <span>{isEn ? 'Upgrade' : 'Upgrade'}</span>
              <IconArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* Optional Session-Only BYOK (Zero Local Storage for Security) */}
      <div className="pt-0.5">
        <button
          type="button"
          onClick={() => setShowCustomKeyInput(!showCustomKeyInput)}
          className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
        >
          <IconKey className="h-3 w-3" />
          <span>
            {showCustomKeyInput
              ? (isEn ? 'Hide Custom Key Input' : 'Sembunyikan Input API Key Mandiri')
              : (isEn ? '+ Use Temporary Custom API Key (Session Only)' : '+ Gunakan API Key Mandiri (Bypass Kuota)')}
          </span>
        </button>

        {showCustomKeyInput && (
          <div className="mt-1.5 p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 space-y-1.5 animate-fade-in">
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                disabled={disabled}
                value={config.customApiKey || ''}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder={isEn ? 'Paste key for this session (e.g. sk-...)' : 'Masukkan API key untuk sesi ini...'}
                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-2 pr-7 py-1 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1.5 focus:ring-indigo-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showApiKey ? <IconEyeOff className="h-3 w-3" /> : <IconEye className="h-3 w-3" />}
              </button>
            </div>

            <div className="flex items-start gap-1.5 text-[9px] text-emerald-700 dark:text-emerald-400">
              <IconShieldLock className="h-3 w-3 shrink-0 mt-0.5" />
              <span>
                {isEn
                  ? 'Zero Local Storage: Key held in RAM only and never saved to browser disk (XSS Safe).'
                  : 'Zero Local Storage: Kunci hanya disimpan di RAM sementara dan tidak pernah disimpan ke disk browser (Aman dari XSS).'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
