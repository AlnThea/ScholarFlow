import React, { useState } from "react";
import { IconSettings, IconTags, IconUsers, IconFilter, IconCalendarEvent, IconBook, IconInfoCircle, IconX } from "@tabler/icons-react";
import { useLanguage } from "@/components/i18n/language-context";

interface NetworkSettingsSidebarProps {
  yearFilter: 'all' | 'custom';
  setYearFilter: (v: 'all' | 'custom') => void;
  minYear: number;
  setMinYear: (v: number) => void;
  maxYear: number;
  setMaxYear: (v: number) => void;
  analysisType: 'keyword' | 'author' | 'co-citation' | 'bibliographic-coupling';
  setAnalysisType: (v: 'keyword' | 'author' | 'co-citation' | 'bibliographic-coupling') => void;
  minOccurrences: number;
  setMinOccurrences: (v: number) => void;
  minLinkStrength: number;
  setMinLinkStrength: (v: number) => void;
  graphData: any;
  setSelectedYear: (y: string) => void;
  dictionary: string;
  setDictionary: (v: string) => void;
  colorMode: 'cluster' | 'trend' | 'density';
  setColorMode: (v: 'cluster' | 'trend' | 'density') => void;
  showLabels: boolean;
  setShowLabels: (v: boolean) => void;
  nodeSizeScale: number;
  setNodeSizeScale: (v: number) => void;
  chargeStrength: number;
  setChargeStrength: (v: number) => void;
  layoutMode: 'force' | 'circular' | 'grid' | 'freeze';
  setLayoutMode: (v: 'force' | 'circular' | 'grid' | 'freeze') => void;
  isAnimating: boolean;
  onToggleAnimate: () => void;
}

export function NetworkSettingsSidebar({
  yearFilter, setYearFilter, minYear, setMinYear, maxYear, setMaxYear,
  analysisType, setAnalysisType, minOccurrences, setMinOccurrences,
  minLinkStrength, setMinLinkStrength, graphData, setSelectedYear,
  dictionary, setDictionary, colorMode, setColorMode,
  showLabels, setShowLabels, nodeSizeScale, setNodeSizeScale, chargeStrength, setChargeStrength,
  layoutMode, setLayoutMode, isAnimating, onToggleAnimate
}: NetworkSettingsSidebarProps) {
  const [showDictHelper, setShowDictHelper] = useState(false);
  const { language } = useLanguage();
  const isEn = language === 'en';

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
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex items-center gap-2">
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
                      <button 
                        onClick={onToggleAnimate}
                        id="play-animation-btn"
                        className="flex items-center justify-center gap-1.5 p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-300 rounded-md text-xs font-medium transition-colors"
                      >
                        {isAnimating ? (
                          <>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            Stop Animation
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                            Animate Time Slice
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                {/* Analysis Type */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Analysis Type</label>
                  <select 
                    value={analysisType}
                    onChange={(e) => setAnalysisType(e.target.value as any)}
                    className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="keyword">Keyword Co-occurrence</option>
                    <option value="author">Author Co-occurrence</option>
                    <option value="co-citation">Co-Citation</option>
                    <option value="bibliographic-coupling">Bibliographic Coupling</option>
                  </select>
                </div>

                {/* Physics Switcher / Layout Algorithm */}
                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {isEn ? 'Network Layout (Physics)' : 'Tata Letak Jaringan (Fisika)'}
                  </label>
                  <select 
                    value={layoutMode}
                    onChange={(e) => setLayoutMode(e.target.value as any)}
                    className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="force">{isEn ? 'Force-Directed (Repulsion)' : 'Tarik-Menarik (Repulsion)'}</option>
                    <option value="circular">{isEn ? 'Circular (Radial)' : 'Lingkaran (Radial)'}</option>
                    <option value="grid">{isEn ? 'Grid / Matrix' : 'Grid / Matriks'}</option>
                    <option value="freeze">{isEn ? 'Freeze (No Physics)' : 'Bekukan (Tanpa Animasi)'}</option>
                  </select>
                </div>

                {/* Color Mode */}
                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Node Coloring</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => setColorMode('cluster')}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[10px] font-medium transition-all ${colorMode === 'cluster' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400'}`}
                    >
                      Community
                    </button>
                    <button 
                      onClick={() => setColorMode('trend')}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[10px] font-medium transition-all ${colorMode === 'trend' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400'}`}
                    >
                      Trend Year
                    </button>
                    <button 
                      onClick={() => setColorMode('density')}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[10px] font-medium transition-all ${colorMode === 'density' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400'}`}
                    >
                      Density
                    </button>
                  </div>
                  {colorMode === 'trend' && (
                    <div className="flex justify-between items-center text-[10px] text-gray-500 bg-gray-50 dark:bg-gray-900/50 p-2 rounded border border-gray-200 dark:border-gray-800">
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Older</span>
                      <span className="flex items-center gap-1">Newer <div className="w-2 h-2 rounded-full bg-red-500"></div></span>
                    </div>
                  )}
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

                {/* Visualization Tuning */}
                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg> 
                    Visual Tuning
                  </h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative">
                        <input type="checkbox" className="sr-only" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${showLabels ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showLabels ? 'translate-x-4' : ''}`}></div>
                      </div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-100">Show Node Labels</span>
                    </label>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span className="font-medium">Node Size</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50 px-2 py-0.5 rounded">{nodeSizeScale.toFixed(1)}x</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.5" max="3" step="0.1"
                        value={nodeSizeScale} 
                        onChange={(e) => setNodeSizeScale(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:bg-gray-700"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span className="font-medium">Link Distance (Gravity)</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50 px-2 py-0.5 rounded">{Math.abs(chargeStrength)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="-200" max="-10" step="10"
                        value={chargeStrength} 
                        onChange={(e) => setChargeStrength(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:bg-gray-700"
                        style={{ direction: 'rtl' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Thesaurus */}
                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800 relative">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <IconBook className="w-4 h-4" /> Dictionary / Thesaurus
                    </label>
                    <button 
                      onClick={() => setShowDictHelper(true)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
                      title="Cara Penggunaan"
                    >
                      <IconInfoCircle className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-tight">Format: <code>word1, word2 -&gt; target</code></p>
                  <textarea
                    value={dictionary}
                    onChange={(e) => setDictionary(e.target.value)}
                    className="w-full p-2 text-xs border border-gray-200 dark:border-gray-700 rounded-md bg-transparent h-20 resize-none font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                    placeholder="ai, artificial intelligence -> artificial intelligence&#10;machine learning, ml -> machine learning"
                  />

                  {showDictHelper && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                          <h4 className="font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <IconBook className="w-5 h-5 text-indigo-500" />
                            {language === 'id' ? 'Cara Pakai Thesaurus' : 'How to use Thesaurus'}
                          </h4>
                          <button onClick={() => setShowDictHelper(false)} className="p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                            <IconX className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="p-5 text-sm text-slate-600 dark:text-slate-300 space-y-4">
                          {language === 'id' ? (
                            <>
                              <p>Fitur ini digunakan untuk <strong>menggabungkan beberapa topik yang maknanya sama</strong> menjadi 1 node (bulatan) besar.</p>
                              <p>Anda bisa memasukkan <strong>banyak aturan sekaligus</strong> dengan memisahkannya menggunakan <strong>baris baru (Enter)</strong>. Contoh:</p>
                              <div className="bg-slate-900 text-indigo-300 p-3 rounded-lg font-mono text-xs shadow-inner whitespace-pre-wrap">
                                ai, a.i. -&gt; artificial intelligence
                                <br />ml, machine learning -&gt; machine learning
                                <br />penggunaan, bertujuan -&gt; 
                              </div>
                              <p>Aturan di atas akan meleburkan node "ai" menjadi "artificial intelligence", "ml" menjadi "machine learning", dan seterusnya secara serentak. Graf Anda akan menjadi jauh lebih rapi dan bebas duplikasi.</p>
                              <p className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded border border-amber-200 dark:border-amber-800 text-xs">
                                💡 <strong>Tips:</strong> Kosongkan sisi kanan tanda panah (seperti <code>penggunaan -&gt; </code>) untuk <strong>menghapus/menyembunyikan</strong> kata yang tidak relevan dari graf!
                              </p>
                            </>
                          ) : (
                            <>
                              <p>This feature is used to <strong>merge multiple identical topics</strong> into 1 large node.</p>
                              <p>You can add <strong>multiple rules at once</strong> by separating them with a <strong>new line (Enter)</strong>. Example:</p>
                              <div className="bg-slate-900 text-indigo-300 p-3 rounded-lg font-mono text-xs shadow-inner whitespace-pre-wrap">
                                ai, a.i. -&gt; artificial intelligence
                                <br />ml, machine learning -&gt; machine learning
                                <br />usage, aimed -&gt; 
                              </div>
                              <p>The rule above will merge "ai" into "artificial intelligence", "ml" into "machine learning", and so on simultaneously. Your graph will be much cleaner and free of duplicates.</p>
                              <p className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded border border-amber-200 dark:border-amber-800 text-xs">
                                💡 <strong>Tip:</strong> Leave the right side of the arrow empty (like <code>usage -&gt; </code>) to <strong>delete/hide</strong> irrelevant words from the graph completely!
                              </p>
                            </>
                          )}
                        </div>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-900/50">
                          <button 
                            onClick={() => setShowDictHelper(false)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            {language === 'id' ? 'Mengerti' : 'Got it'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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
