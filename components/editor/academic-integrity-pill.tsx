'use client';

import React from 'react';
import { IconShieldCheck, IconAlertTriangle, IconAlertOctagon } from '@tabler/icons-react';
import { calculateAcademicIntegrity } from '@/lib/editor/academic-integrity';

export interface AcademicIntegrityPillProps {
  content: string;
  language?: 'en' | 'id';
  onClick?: () => void;
  className?: string;
}

export function AcademicIntegrityPill({
  content,
  language = 'id',
  onClick,
  className = '',
}: AcademicIntegrityPillProps) {
  const isEn = language === 'en';
  const report = React.useMemo(() => {
    return calculateAcademicIntegrity(content);
  }, [content]);

  if (!content || report.metrics.totalWords === 0) return null;

  const isGreen = report.riskLevel === 'low';
  const isYellow = report.riskLevel === 'medium';
  const isRed = report.riskLevel === 'high';

  const badgeColor = isGreen
    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    : isYellow
    ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 dark:text-rose-300 border-rose-200 dark:border-rose-800 animate-pulse';

  const IconComponent = isGreen ? IconShieldCheck : isYellow ? IconAlertTriangle : IconAlertOctagon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer shadow-xs ${badgeColor} ${className}`}
      title={
        isEn
          ? `Originality Score: ${report.overallScore}% (${report.riskLabel.en}). Click to open Integrity Barometer.`
          : `Skor Orisinalitas: ${report.overallScore}% (${report.riskLabel.id}). Klik untuk membuka Barometer Integritas.`
      }
    >
      <IconComponent className="w-3.5 h-3.5 shrink-0" />
      <span>{report.overallScore}% {isEn ? 'Originality' : 'Orisinalitas'}</span>
    </button>
  );
}
