import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

interface AnalyticsTabProps {
  isEn: boolean;
  usageData: any[];
  roleData: any[];
}

export function AnalyticsTab({ isEn, usageData, roleData }: AnalyticsTabProps) {
  return (
    <motion.div 
      key="analytics"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6">
          {isEn ? 'Platform Adoption Rate' : 'Tingkat Adopsi Platform'}
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={usageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="date" tick={{fontSize: 12}} axisLine={false} tickLine={false} stroke="#94a3b8" />
              <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} stroke="#94a3b8" />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">
          {isEn ? 'Role Distribution' : 'Distribusi Peran'}
        </h3>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-4">
            {roleData.map(role => (
              <div key={role.name} className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }}></div>
                {role.name} ({role.value}%)
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
