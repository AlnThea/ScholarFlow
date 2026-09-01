'use client';

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { calculateBurstiness, BurstinessMetrics } from '@/lib/editor/burstiness-engine';
import { useDebounce } from 'use-debounce';
import { useLanguage } from '../i18n/language-context';

export function BurstinessChart({ content }: { content: string }) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  // Debounce the content to prevent heavy recalculations on every keystroke
  const [debouncedContent] = useDebounce(content, 1000);

  const metrics: BurstinessMetrics = useMemo(() => {
    return calculateBurstiness(debouncedContent);
  }, [debouncedContent]);

  if (metrics.totalSentences === 0) {
    return (
      <div className="rounded-xl border border-line bg-panel p-4 text-center text-xs text-muted mt-3">
        {isEn 
          ? "Highlight/select sentences in the editor to view Burstiness analysis (AI Pattern Detection)." 
          : "Sorot / blok beberapa kalimat di editor untuk melihat analisis Burstiness (Deteksi Pola AI)."}
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'human': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'warning': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'ai': return 'text-rose-700 bg-rose-50 border-rose-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'human': return isEn ? 'High Variance (Human)' : 'Variasi Tinggi (Manusia)';
      case 'warning': return isEn ? 'Moderate Uniformity' : 'Uniformitas Sedang';
      case 'ai': return isEn ? 'Uniform Pattern (AI)' : 'Pola Seragam (AI)';
      default: return 'N/A';
    }
  };

  const barColor = metrics.status === 'human' ? '#10b981' : metrics.status === 'warning' ? '#f59e0b' : '#f43f5e';

  return (
    <div className="rounded-xl border border-line bg-panel p-3 flex flex-col gap-3 animate-fade-in shadow-sm mt-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">📈 AI Burstiness Score</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(metrics.status)}`}>
          {metrics.burstinessScore} - {getStatusLabel(metrics.status)}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white border border-slate-100 rounded-lg p-2 text-center flex flex-col justify-center">
          <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">{isEn ? 'Avg Words' : 'Rata-rata Kata'}</p>
          <p className="text-sm font-bold text-slate-700">{metrics.averageSentenceLength}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-lg p-2 text-center flex flex-col justify-center">
          <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">{isEn ? 'Std Deviation' : 'Standar Deviasi'}</p>
          <p className="text-sm font-bold text-slate-700">{metrics.standardDeviation}</p>
        </div>
      </div>

      <div className="h-32 w-full mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={metrics.sentenceData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <XAxis dataKey="index" tick={{fontSize: 9, fill: '#94a3b8'}} tickLine={false} axisLine={false} />
            <YAxis tick={{fontSize: 9, fill: '#94a3b8'}} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', fontSize: '11px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number) => [`${value} ${isEn ? 'words' : 'kata'}`, isEn ? 'Length' : 'Panjang']}
              labelFormatter={(label) => `${isEn ? 'Sentence' : 'Kalimat ke-'}${isEn ? ' ' : ''}${label}`}
            />
            <ReferenceLine y={metrics.averageSentenceLength} stroke="#cbd5e1" strokeDasharray="3 3" />
            <Bar dataKey="words" fill={barColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {metrics.status === 'ai' && (
        <div className="text-[9px] bg-rose-50 text-rose-700 p-2 rounded border border-rose-100 mt-1">
          <strong>Tips:</strong> {isEn 
            ? "Your writing exhibits highly uniform sentence lengths (AI Pattern). Combine short sentences or break up long ones to increase your Burstiness score." 
            : "Tulisan Anda terdeteksi memiliki panjang kalimat yang sangat seragam (Pola AI). Gabungkan beberapa kalimat pendek menjadi panjang, atau pecah kalimat panjang untuk menaikkan skor Burstiness."}
        </div>
      )}
    </div>
  );
}
