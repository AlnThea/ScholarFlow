import React from 'react';
import {
  IconChartBar, IconInfoCircle
} from '@tabler/icons-react';
import { BurstinessChart } from './burstiness-chart';


export const SidebarBurstinessTab = (props: any) => {
  const {
    language, selectedText, t
  } = props;

  const isEn = language === 'en';
  return (
    <>
      <div className="space-y-3">
        <section className="rounded-lg border border-line dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconChartBar className="h-4 w-4 text-accent dark:text-indigo-400" />
              <h3 className="text-sm font-semibold text-text dark:text-slate-200">AI Burstiness Score</h3>
            </div>
          </div>
          <div className="mb-3 flex flex-col gap-1 rounded-md border border-line dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-2.5 text-[10px] leading-4 text-muted dark:text-slate-400">
            <div className="flex items-start gap-1.5">
              <IconInfoCircle className="h-3 w-3 shrink-0 mt-0.5" />
              <span>{isEn ? "Select text in the editor to analyze its burstiness (variation in sentence length and structure). A higher burstiness score indicates more human-like writing." : "Blok/pilih teks di editor untuk menganalisis skor burstiness (variasi panjang dan struktur kalimat). Skor burstiness yang tinggi menandakan tulisan yang lebih natural/mirip manusia."}</span>
            </div>
          </div>
          <BurstinessChart content={selectedText} />
        </section>
      </div>
    </>
  );
};
