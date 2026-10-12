import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, Legend
} from 'recharts';
import { 
  IconChartBar, IconChartAreaLine, IconChartPie, 
  IconSparkles, IconFileText, IconTrendingUp, IconAward
} from '@tabler/icons-react';

interface AnalyticsTabProps {
  isEn: boolean;
  usageData: any[];
  roleData: any[];
  departmentData?: any[];
  aiConsumptionData?: any[];
}

export function AnalyticsTab({ 
  isEn, 
  usageData, 
  roleData,
  departmentData = [
    { department: 'Ilmu Komputer', papers: 142, activeUsers: 48, aiTokensK: 480 },
    { department: 'Teknik Elektro', papers: 98, activeUsers: 34, aiTokensK: 310 },
    { department: 'Kedokteran', papers: 115, activeUsers: 39, aiTokensK: 395 },
    { department: 'Ekonomi & Bisnis', papers: 76, activeUsers: 28, aiTokensK: 215 },
    { department: 'MIPA & Sains', papers: 64, activeUsers: 22, aiTokensK: 180 },
  ],
  aiConsumptionData = [
    { name: isEn ? 'AI Polish & Grammar' : 'Penyempurnaan Bahasa AI', value: 45, color: '#6366f1' },
    { name: isEn ? 'Citation & Synthesis' : 'Sintesis Sitasi Ilmiah', value: 30, color: '#06b6d4' },
    { name: isEn ? 'Abstract & Outline' : 'Draf Abstrak & Struktur', value: 15, color: '#10b981' },
    { name: isEn ? 'Math & LaTeX Helper' : 'Asisten Formula LaTeX', value: 10, color: '#f59e0b' },
  ]
}: AnalyticsTabProps) {
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area');
  const [metricView, setMetricView] = useState<'users' | 'documents'>('users');

  return (
    <motion.div 
      key="analytics"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-8"
    >
      {/* 4 Executive KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <IconTrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isEn ? 'Monthly Active Ratio' : 'Rasio Keaktifan Bulanan'}
            </p>
            <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">89.4%</h4>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              +12.8% {isEn ? 'vs last month' : 'dibanding bln lalu'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <IconFileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isEn ? 'Total Research Papers' : 'Total Naskah & Tesis'}
            </p>
            <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">495 {isEn ? 'Drafts' : 'Draf'}</h4>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {isEn ? 'Across 5 Faculties' : 'Dari 5 Fakultas'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <IconSparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isEn ? 'AI Tokens Consumed' : 'Konsumsi Token AI Kampus'}
            </p>
            <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">1.58M</h4>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
              {isEn ? 'Within Safety Limit' : 'Dalam Batas Aman'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <IconAward className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isEn ? 'Advisor Acceptance' : 'Persetujuan Pembimbing'}
            </p>
            <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">94.2%</h4>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {isEn ? 'SINTA/Scopus Ready' : 'Siap Jurnal Terakreditasi'}
            </span>
          </div>
        </div>
      </div>

      {/* Row 1: Interactive Adoption Trends + Role Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                {isEn ? 'Campus Adoption & Productivity Velocity' : 'Kecepatan Adopsi & Produktivitas Kampus'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isEn ? 'Weekly trajectory of active researchers and papers produced' : 'Tren mingguan peneliti aktif dan draf yang dihasilkan'}
              </p>
            </div>
            
            {/* Interactive Chart Type Controls */}
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setMetricView('users')}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    metricView === 'users' 
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {isEn ? 'Active Users' : 'Pengguna'}
                </button>
                <button
                  type="button"
                  onClick={() => setMetricView('documents')}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    metricView === 'documents' 
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {isEn ? 'Papers' : 'Naskah'}
                </button>
              </div>

              <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setChartType('area')}
                  title="Area Chart"
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    chartType === 'area' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <IconChartAreaLine className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('bar')}
                  title="Bar Chart"
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    chartType === 'bar' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <IconChartBar className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('line')}
                  title="Line Chart"
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    chartType === 'line' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <IconTrendingUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={usageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsersMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDocsMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="date" tick={{fontSize: 12}} axisLine={false} tickLine={false} stroke="#94a3b8" />
                  <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} stroke="#94a3b8" />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area 
                    type="monotone" 
                    dataKey={metricView} 
                    stroke={metricView === 'users' ? '#6366f1' : '#10b981'} 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill={metricView === 'users' ? 'url(#colorUsersMetric)' : 'url(#colorDocsMetric)'} 
                  />
                </AreaChart>
              ) : chartType === 'bar' ? (
                <BarChart data={usageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="date" tick={{fontSize: 12}} axisLine={false} tickLine={false} stroke="#94a3b8" />
                  <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} stroke="#94a3b8" />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Bar 
                    dataKey={metricView} 
                    fill={metricView === 'users' ? '#6366f1' : '#10b981'} 
                    radius={[6, 6, 0, 0]} 
                  />
                </BarChart>
              ) : (
                <LineChart data={usageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="date" tick={{fontSize: 12}} axisLine={false} tickLine={false} stroke="#94a3b8" />
                  <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} stroke="#94a3b8" />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Line 
                    type="monotone" 
                    dataKey={metricView} 
                    stroke={metricView === 'users' ? '#6366f1' : '#10b981'} 
                    strokeWidth={3} 
                    dot={{ r: 5 }} 
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Role Breakdown Donut Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1">
              {isEn ? 'Academic Role Breakdown' : 'Distribusi Peran Civitas'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {isEn ? 'Active seat assignments across academic levels' : 'Alokasi kursi lisensi di setiap tingkatan'}
            </p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleData} cx="50%" cy="50%" innerRadius={55} outerRadius={78} paddingAngle={4} dataKey="value">
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
            {roleData.map((role) => (
              <div key={role.name} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: role.color }}></div>
                <span className="truncate">{role.name}</span>
                <span className="ml-auto text-slate-400 font-normal">({role.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Department Output Comparison & AI Feature Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Output */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                {isEn ? 'Research Output by Faculty/Prodi' : 'Produktivitas Riset per Fakultas/Prodi'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isEn ? 'Comparison of research papers drafted by faculties' : 'Perbandingan jumlah naskah yang disusun oleh tiap fakultas'}
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis type="number" tick={{fontSize: 11}} axisLine={false} tickLine={false} stroke="#94a3b8" />
                <YAxis dataKey="department" type="category" tick={{fontSize: 11}} axisLine={false} tickLine={false} stroke="#94a3b8" width={110} />
                <RechartsTooltip contentStyle={{ borderRadius: '10px', border: 'none' }} />
                <Bar dataKey="papers" fill="#6366f1" radius={[0, 6, 6, 0]} name={isEn ? 'Papers Drafted' : 'Naskah Draf'} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Consumption Breakdown */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                {isEn ? 'AI Assistance Feature Utilization' : 'Pemanfaatan Fitur Asisten AI'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isEn ? 'Which research tools give highest value to scholars' : 'Fitur mana yang paling banyak membantu mahasiswa & dosen'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {aiConsumptionData.map((feat) => (
              <div key={feat.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: feat.color }}></span>
                    {feat.name}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">{feat.value}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-700" 
                    style={{ width: `${feat.value}%`, backgroundColor: feat.color }}
                  ></div>
                </div>
              </div>
            ))}

            <div className="mt-6 p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-3 text-xs text-indigo-900 dark:text-indigo-200">
              <IconSparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <span>
                {isEn 
                  ? 'All AI interactions are processed through ScholarFlow Academic Sandbox under Zero Data Retention agreement.' 
                  : 'Seluruh interaksi AI diproses melalui ScholarFlow Academic Sandbox dengan jaminan naskah tidak disimpan/dilatih.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

