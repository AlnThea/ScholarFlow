// components/ai/token-quota-badge.tsx
'use client';

import React from 'react';
import { IconSparkles, IconBolt, IconAlertTriangle } from '@tabler/icons-react';

export interface TokenQuotaBadgeProps {
  tokensUsed?: number;
  monthlyQuota?: number;
  activePlanId?: string;
  language?: string;
  onClick?: () => void;
  compact?: boolean;
}

export function TokenQuotaBadge({
  tokensUsed = 0,
  monthlyQuota = 50000,
  activePlanId = 'free',
  language = 'en',
  onClick,
  compact = false,
}: TokenQuotaBadgeProps) {
  const isEn = language === 'en';
  const isPro = activePlanId === 'pro' || activePlanId === 'institution';

  const used = Math.max(0, tokensUsed);
  const quota = Math.max(1, monthlyQuota);
  const remaining = Math.max(0, quota - used);
  const percentUsed = Math.min(100, Math.round((used / quota) * 100));
  const isNearLimit = percentUsed >= 85;
  const isExhausted = percentUsed >= 100;

  // Format large numbers (e.g. 12.5k, 1.0M)
  const formatTokens = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return val.toLocaleString();
  };

  const getBarColor = () => {
    if (isExhausted) return 'bg-rose-500';
    if (isNearLimit) return 'bg-amber-500';
    return isPro ? 'bg-indigo-500' : 'bg-emerald-500';
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={
          isEn
            ? `AI Tokens: ${formatTokens(used)} / ${formatTokens(quota)} (${formatTokens(remaining)} remaining)`
            : `Token AI: ${formatTokens(used)} / ${formatTokens(quota)} (Sisa ${formatTokens(remaining)})`
        }
        className={`group inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition cursor-pointer border ${
          isExhausted
            ? 'border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
            : isNearLimit
            ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-750 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600'
        }`}
      >
        <IconBolt
          className={`h-3 w-3 ${
            isExhausted
              ? 'text-rose-500 animate-pulse'
              : isNearLimit
              ? 'text-amber-500'
              : isPro
              ? 'text-indigo-500 dark:text-indigo-400'
              : 'text-emerald-500 dark:text-emerald-400'
          }`}
        />
        <span>{formatTokens(remaining)}</span>
      </button>
    );
  }

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`relative flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition ${
        onClick ? 'cursor-pointer hover:shadow-xs' : ''
      } ${
        isExhausted
          ? 'border-rose-300 dark:border-rose-700 bg-rose-50/70 dark:bg-rose-950/30'
          : isNearLimit
          ? 'border-amber-300 dark:border-amber-700 bg-amber-50/70 dark:bg-amber-950/30'
          : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90'
      }`}
    >
      <div className="flex items-center gap-1.5 shrink-0">
        {isExhausted ? (
          <IconAlertTriangle className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
        ) : (
          <IconSparkles
            className={`h-3.5 w-3.5 ${
              isPro ? 'text-indigo-500 dark:text-indigo-400' : 'text-emerald-500 dark:text-emerald-400'
            }`}
          />
        )}
        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
          {isEn ? 'AI Quota' : 'Kuota AI'}
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
        <div
          className={`h-full transition-all duration-300 ${getBarColor()}`}
          style={{ width: `${percentUsed}%` }}
        />
      </div>

      {/* Status Text */}
      <span
        className={`text-[10px] font-medium shrink-0 ${
          isExhausted
            ? 'text-rose-600 dark:text-rose-400 font-bold'
            : isNearLimit
            ? 'text-amber-600 dark:text-amber-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        {isExhausted
          ? (isEn ? 'Exhausted' : 'Habis')
          : `${formatTokens(remaining)}`}
      </span>
    </div>
  );
}
