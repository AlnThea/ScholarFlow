import React from "react";
import { IconSettings, IconTags, IconUsers, IconFilter, IconCalendarEvent } from "@tabler/icons-react";

interface NetworkSettingsSidebarProps {
  yearFilter: 'all' | 'custom';
  setYearFilter: (v: 'all' | 'custom') => void;
  minYear: number;
  setMinYear: (v: number) => void;
  maxYear: number;
  setMaxYear: (v: number) => void;
  analysisType: 'keyword' | 'author';
  setAnalysisType: (v: 'keyword' | 'author') => void;
  minOccurrences: number;
  setMinOccurrences: (v: number) => void;
  minLinkStrength: number;
  setMinLinkStrength: (v: number) => void;
  graphData: any;
  setSelectedYear: (y: string) => void;
}

export function NetworkSettingsSidebar({
  yearFilter, setYearFilter, minYear, setMinYear, maxYear, setMaxYear,
  analysisType, setAnalysisType, minOccurrences, setMinOccurrences,
  minLinkStrength, setMinLinkStrength, graphData, setSelectedYear
}: NetworkSettingsSidebarProps) {
  return (
    <>
          {/* Settings Sidebar Panel */}
          <div className="w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col shrink-0 overflow-y-auto z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                <IconSettings className="w-4 h-4" /> Network Settings
              </h2>
              
              <div className="space-y-6">
                {/* Year Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Year Range</label>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setYearFilter('all')}
                      className={`flex-1 p-2 rounded-lg border text-xs font-medium transition-all ${yearFilter === 'all' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400' : 'bg-white border-gray-200 text-gray-600'}`}
                    >All Years</button>
                    <button 
                      onClick={() => setYearFilter('custom')}
                      className={`flex-1 p-2 rounded-lg border text-xs font-medium transition-all ${yearFilter === 'custom' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400' : 'bg-white border-gray-200 text-gray-600'}`}
                    >Custom</button>
                  </div>
                  {yearFilter === 'custom' && (
                    <div className="flex items-center gap-2 mt-2">
                      <input 
                        type="number" 
                        value={minYear} 
                        onChange={(e) => setMinYear(parseInt(e.target.value) || 2000)}
                        className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-transparent"
                      />
                      <span className="text-gray-500">-</span>
                      <input 
                        type="number" 
                        value={maxYear} 
                        onChange={(e) => setMaxYear(parseInt(e.target.value) || new Date().getFullYear())}
                        className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-transparent"
                      />
                    </div>
                  )}
                </div>
                {/* Analysis Type */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Analysis Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setAnalysisType('keyword')}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-sm font-medium transition-all ${analysisType === 'keyword' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400'}`}
                    >
                      <IconTags className="w-4 h-4" /> Keywords
                    </button>
                    <button 
                      onClick={() => setAnalysisType('author')}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-sm font-medium transition-all ${analysisType === 'author' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400'}`}
                    >
                      <IconUsers className="w-4 h-4" /> Authors
                    </button>
                  </div>
                </div>

                {/* Thresholds */}
                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <IconFilter className="w-4 h-4" /> Thresholding
                  </h3>
                  
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span className="font-medium">Min. Occurrences</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50 px-2 py-0.5 rounded">{minOccurrences}</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" max="10" 
                        value={minOccurrences} 
                        onChange={(e) => setMinOccurrences(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:bg-gray-700"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span className="font-medium">Min. Link Strength</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50 px-2 py-0.5 rounded">{minLinkStrength}</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" max="10" 
                        value={minLinkStrength} 
                        onChange={(e) => setMinLinkStrength(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:bg-gray-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Network Statistics */}
            <div className="p-6">
              <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                Network Stats
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
                  <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{graphData.nodes.length}</div>
                  <div className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">Nodes</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
                  <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{graphData.links.length}</div>
                  <div className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">Edges</div>
                </div>
              </div>
            </div>

            {/* Publication Timeline Mini */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-900/20">
               <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <IconCalendarEvent className="w-4 h-4" /> Timeline
              </h2>
              <div className="flex-1 min-h-[120px] flex items-end gap-1.5">
                {Object.entries(graphData.yearCounts || {})
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([year, count]) => (
                    <div 
                      key={year} 
                      className="flex-1 flex flex-col items-center group relative cursor-pointer"
                      onClick={() => setSelectedYear(year)}
                    >
                      <div className="absolute -top-10 bg-slate-800 text-white text-xs font-medium px-2.5 py-1.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none whitespace-nowrap">
                        {year}: {count as number} docs
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                      </div>
                      <div 
                        className="w-full bg-indigo-200 hover:bg-indigo-400 dark:bg-indigo-900/50 dark:hover:bg-indigo-600 rounded-t-sm transition-all duration-300"
                        style={{ height: `${((count as number) / graphData.maxYearCount) * 100}px` }}
                      ></div>
                      <span className="text-[10px] font-medium text-slate-400 mt-2 rotate-45 origin-left truncate w-full">{year}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>


    </>
  );
}
