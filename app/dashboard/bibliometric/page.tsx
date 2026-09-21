"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useDataService, CitationCandidate } from "@/lib/services";
import { MinimalSidebar } from '@/components/editor/minimal-sidebar';
import { useRouter } from 'next/navigation';
import { 
  IconSettings, IconFilter, IconDownload, IconZoomIn, IconMaximize, 
  IconUsers, IconTags, IconChartBar, IconCalendarEvent, IconLoader2
} from '@tabler/icons-react';

// Dynamically import ForceGraph2D with no SSR
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export default function BibliometricPage() {
  const router = useRouter();
  const { dataService } = useDataService();
  const [library, setLibrary] = useState<CitationCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Professional Analysis States
  const [minOccurrences, setMinOccurrences] = useState(2);
  const [minLinkStrength, setMinLinkStrength] = useState(1);
  const [analysisType, setAnalysisType] = useState<'keyword' | 'author'>('keyword');
  
  // Year Filter States
  const [yearFilter, setYearFilter] = useState<'all' | 'custom'>('all');
  const [minYear, setMinYear] = useState(2000);
  const [maxYear, setMaxYear] = useState(new Date().getFullYear());

  // Graph interaction states
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  
  const fgRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [graphDim, setGraphDim] = useState({ width: 800, height: 600 });

  // Load user's library on mount
  useEffect(() => {
    const loadLibrary = async () => {
      setIsLoading(true);
      try {
        const data = await dataService.getCitationLibrary();
        setLibrary(Object.values(data));
      } catch (error) {
        console.error("Failed to load library:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadLibrary();
  }, [dataService]);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setGraphDim({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    // Wait for flex layout to settle
    const timer = setTimeout(updateSize, 100);
    
    const observer = new ResizeObserver(() => {
      window.requestAnimationFrame(updateSize);
    });
    observer.observe(containerRef.current);
    
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  // Generate graph data from library based on settings
  const graphData = useMemo(() => {
    if (library.length === 0) return { nodes: [], links: [], yearCounts: {}, maxYearCount: 1 };

    const stopWords = new Set([
      "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "he",
      "in", "is", "it", "its", "of", "on", "that", "the", "to", "was", "were", "will", "with", "this", "we", "which", "their",
      "dan", "di", "yang", "untuk", "dengan", "itu", "ini", "dalam", "pada", "dari", "ke",
      "sebagai", "adalah", "oleh", "atau", "telah", "bisa", "dapat", "akan", "juga", "terhadap", "menggunakan"
    ]);

    const genericUnigrams = new Set([
      "sistem", "aplikasi", "rancang", "bangun", "penelitian", "studi", "analisis", 
      "pengembangan", "implementasi", "metode", "berbasis", "evaluasi", "pengaruh", 
      "penerapan", "kasus", "hasil", "suatu", "sebuah", "karena", "kualitas", "tingkat",
      "research", "study", "analysis", "method", "based", "using", "proposed", "paper", "results"
    ]);

    const entityCounts: Record<string, number> = {};
    const cooccurrences: Record<string, number> = {};
    const yearCounts: Record<string, number> = {};

    library.forEach((item) => {
      // Apply Year Filter
      const itemYear = item.year ? parseInt(String(item.year)) : null;
      if (yearFilter === 'custom' && itemYear) {
        if (itemYear < minYear || itemYear > maxYear) return;
      }

      // Tally years
      if (item.year) {
        yearCounts[item.year] = (yearCounts[item.year] || 0) + 1;
      }

      let docEntities: string[] = [];

      if (analysisType === 'keyword') {
        const text = `${item.title} ${item.abstract || ""}`.toLowerCase().replace(/[^\w\s-]/g, " ");
        const rawWords = text.split(/\s+/).filter(w => w.length > 0);
        const docPhrases = new Set<string>();

        for (let i = 0; i < rawWords.length; i++) {
          const w1 = rawWords[i];
          let formedPhrase = false;
          
          if (i < rawWords.length - 1) {
            const w2 = rawWords[i + 1];
            if (!stopWords.has(w1) && !stopWords.has(w2) && w1.length > 2 && w2.length > 2) {
              docPhrases.add(`${w1} ${w2}`);
              formedPhrase = true;
              i++;
            }
          }
          
          if (!formedPhrase && !stopWords.has(w1) && w1.length >= 4) {
            if (!genericUnigrams.has(w1)) {
              docPhrases.add(w1);
            }
          }
        }
        // Limit per doc to prevent massive hubs
        docEntities = Array.from(docPhrases).slice(0, 15);
      } else if (analysisType === 'author') {
        if (item.authors && item.authors.length > 0) {
          // Normalize author names
          docEntities = item.authors.map(a => a.trim()).filter(a => a.length > 0);
        }
      }

      docEntities.forEach(w => {
        entityCounts[w] = (entityCounts[w] || 0) + 1;
      });

      for (let i = 0; i < docEntities.length; i++) {
        for (let j = i + 1; j < docEntities.length; j++) {
          const w1 = docEntities[i];
          const w2 = docEntities[j];
          const pair = w1 < w2 ? `${w1}__${w2}` : `${w2}__${w1}`;
          cooccurrences[pair] = (cooccurrences[pair] || 0) + 1;
        }
      }
    });

    // Apply Thresholds
    const validNodes = Object.entries(entityCounts)
      .filter(([_, count]) => count >= minOccurrences)
      .map(([id, val]) => ({ id, val, neighbors: [] as string[], links: [] as any[], group: 0 }));

    const validNodeIds = new Set(validNodes.map(n => n.id));

    const validLinks = Object.entries(cooccurrences)
      .filter(([pair, weight]) => {
        const [source, target] = pair.split("__");
        return validNodeIds.has(source) && validNodeIds.has(target) && weight >= minLinkStrength;
      })
      .map(([pair, weight]) => {
        const [source, target] = pair.split("__");
        return { source, target, value: weight };
      });

    // Cross-link nodes for highlighting logic and simple clustering simulation
    validLinks.forEach(link => {
      const a = validNodes.find(n => n.id === link.source);
      const b = validNodes.find(n => n.id === link.target);
      if (a && b) {
        a.neighbors.push(b.id);
        b.neighbors.push(a.id);
        a.links.push(link);
        b.links.push(link);
      }
    });

    // Assign simple communities (groups) based on strongest links
    // Run Label Propagation Algorithm for Clustering
    validNodes.forEach((node, i) => {
        node.group = i; // Initial group is their own index
    });

    for (let iter = 0; iter < 5; iter++) {
        let changed = false;
        // Deterministic shuffle for consistency between renders if data doesn't change
        const shuffledNodes = [...validNodes].sort((a, b) => a.id.localeCompare(b.id));
        
        shuffledNodes.forEach(node => {
            if (node.links.length === 0) return;
            
            const groupWeights: Record<number, number> = {};
            node.links.forEach((link: any) => {
                const neighborId = link.source === node.id ? link.target : link.source;
                const neighbor = validNodes.find(n => n.id === neighborId);
                if (neighbor) {
                    groupWeights[neighbor.group] = (groupWeights[neighbor.group] || 0) + link.value;
                }
            });
            
            if (Object.keys(groupWeights).length > 0) {
                let maxGroup = node.group;
                let maxWeight = -1;
                for (const [gStr, w] of Object.entries(groupWeights)) {
                    const g = parseInt(gStr);
                    if (w > maxWeight) {
                        maxWeight = w;
                        maxGroup = g;
                    }
                }
                
                if (node.group !== maxGroup) {
                    node.group = maxGroup;
                    changed = true;
                }
            }
        });
        if (!changed) break;
    }
    
    // re-index groups to be 0,1,2... to map cleanly to colors
    const uniqueGroups = Array.from(new Set(validNodes.map(n => n.group)));
    validNodes.forEach(node => {
        node.group = uniqueGroups.indexOf(node.group);
    });
    
    const maxYearCount = Object.keys(yearCounts).length > 0 ? Math.max(...Object.values(yearCounts)) : 1;

    return { nodes: validNodes, links: validLinks, yearCounts, maxYearCount };
  }, [library, minOccurrences, minLinkStrength, analysisType, yearFilter, minYear, maxYear]);

  const handleNodeHover = useCallback((node: any) => {
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
    if (node) {
      const newHighlightNodes = new Set();
      const newHighlightLinks = new Set();
      
      newHighlightNodes.add(node.id);
      node.neighbors.forEach((neighbor: string) => newHighlightNodes.add(neighbor));
      node.links.forEach((link: any) => newHighlightLinks.add(link));

      setHighlightNodes(newHighlightNodes);
      setHighlightLinks(newHighlightLinks);
    }
    setHoverNode(node || null);
  }, []);

  const handleNodeClick = useCallback((node: any) => {
    console.log("Node clicked!", node);
    setSelectedNode(node || null);
  }, []);

  const handleNodeDrag = useCallback((node: any) => {
    if (node) {
      node.fx = node.x;
      node.fy = node.y;
    }
  }, []);

  const handleNodeDragEnd = useCallback((node: any) => {
    if (node) {
      node.fx = null;
      node.fy = null;
    }
  }, []);

  const exportNetworkImage = () => {
    const canvas = document.querySelector('.force-graph-container canvas, canvas') as HTMLCanvasElement;
    if (canvas) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff'; 
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        ctx.drawImage(canvas, 0, 0);
        
        const link = document.createElement('a');
        link.download = `ScholarFlow_Network_${analysisType}.jpg`;
        link.href = tempCanvas.toDataURL('image/jpeg', 1.0);
        link.click();
      }
    }
  };

  const exportNetworkCSV = () => {
    if (graphData.nodes.length === 0) return;
    
    // Nodes CSV
    let nodesCsv = "Id,Label,Weight,Group\n";
    graphData.nodes.forEach((n: any) => {
      nodesCsv += `"${n.id}","${n.id}",${n.val},${n.group}\n`;
    });
    
    // Edges CSV
    let edgesCsv = "Source,Target,Type,Weight\n";
    graphData.links.forEach((l: any) => {
      // l.source and l.target could be objects if ForceGraph already mutated them, or strings
      const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
      const targetId = typeof l.target === 'object' ? l.target.id : l.target;
      edgesCsv += `"${sourceId}","${targetId}","Undirected",${l.value}\n`;
    });
    
    // Download zip conceptually or just edges
    // For simplicity, download edges as CSV
    const blob = new Blob([edgesCsv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.download = `ScholarFlow_Edges_${analysisType}.csv`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#94a3b8"];
  
  const getNodeColor = (node: any) => {
    if (hoverNode && !highlightNodes.has(node.id)) {
      return "rgba(200, 200, 200, 0.2)";
    }
    return colors[node.group % colors.length];
  };

  const getLinkColor = (link: any) => {
    if (hoverNode && !highlightLinks.has(link)) {
      return "rgba(200, 200, 200, 0.1)";
    }
    return "rgba(156, 163, 175, 0.4)";
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans">
      <MinimalSidebar
        isExpanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        documents={[]}
        currentDocumentId={null}
        activeDashboardTab="bibliometric"
        onSelectDocument={(id) => {
          if (!id) router.push('/dashboard');
          else router.push(`/editor/${id}`);
        }}
        onSelectAdminTab={(tab) => {
          if (tab === 'billing') router.push('/billing');
          else if (tab.startsWith('admin')) router.push('/admin');
        }}
      />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center">
              <IconChartBar className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Bibliometric Workspace</h1>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={exportNetworkCSV}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                <IconDownload className="w-4 h-4" />
                Export CSV
              </button>
             <button 
                onClick={exportNetworkImage}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium transition-colors"
              >
                <IconDownload className="w-4 h-4" />
                Export Map
              </button>
          </div>
        </header>

        {/* Main Content Layout */}
        <div className="flex flex-1 overflow-hidden min-w-0 min-h-0">
          
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

          {/* Graph Area */}
          <div ref={containerRef} className="flex-1 bg-[#f8fafc] dark:bg-gray-950 relative flex flex-col shadow-inner min-w-0 min-h-0">
            {isLoading ? (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
                  <IconLoader2 className="w-10 h-10 animate-spin text-indigo-500" />
                  <p className="font-medium">Building network graph...</p>
               </div>
            ) : graphData.nodes.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4 p-8">
                  <div className="w-20 h-20 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center mb-2">
                     <IconChartBar className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="font-semibold text-xl text-slate-700 dark:text-slate-200">No Network Data</h3>
                  <p className="text-sm max-w-md text-center leading-relaxed">Lower your threshold settings on the left panel or add more documents to your library to generate a network graph.</p>
               </div>
            ) : (
               <div className="flex-1 relative force-graph-container overflow-hidden w-full h-full">
                 {/* Floating Toolbar */}
                 <div className="absolute bottom-6 right-6 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700 flex flex-col overflow-hidden">
                   <button 
                     onClick={() => fgRef.current?.zoomToFit(400, 50)}
                     className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors tooltip-left"
                     title="Fit to Screen"
                   >
                     <IconMaximize className="w-5 h-5" />
                   </button>
                 </div>

                 {/* Node Detail Panel */}
                 {selectedNode && (
                   <div className="absolute top-6 right-6 z-20 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/60 dark:border-slate-700 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                     <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/50">
                       <div>
                         <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-1">
                           Node Details
                         </div>
                         <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 capitalize leading-tight">
                           {selectedNode.id}
                         </h3>
                       </div>
                       <button 
                         onClick={() => setSelectedNode(null)}
                         className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600 transition-colors shadow-sm border border-slate-200 dark:border-slate-700"
                       >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                       </button>
                     </div>
                     
                     <div className="p-5 space-y-5">
                       <div className="grid grid-cols-2 gap-3">
                         <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                           <div className="text-2xl font-bold text-slate-700 dark:text-slate-200">{selectedNode.val}</div>
                           <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1">Occurrences</div>
                         </div>
                         <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                           <div className="text-2xl font-bold text-slate-700 dark:text-slate-200">{selectedNode.links?.length || 0}</div>
                           <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1">Degree (Links)</div>
                         </div>
                       </div>
                       
                       {selectedNode.neighbors && selectedNode.neighbors.length > 0 && (
                         <div>
                           <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider flex items-center gap-1">
                             <IconTags className="w-3.5 h-3.5 text-slate-400" />
                             Top Connections
                           </h4>
                           <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                             {selectedNode.neighbors.slice(0, 15).map((neighbor: string, idx: number) => (
                               <span key={idx} className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 shadow-sm">
                                 {neighbor}
                               </span>
                             ))}
                             {selectedNode.neighbors.length > 15 && (
                               <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-md text-xs font-medium text-slate-500">
                                 +{selectedNode.neighbors.length - 15} more
                               </span>
                             )}
                           </div>
                         </div>
                       )}
                       
                       <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[selectedNode.group % colors.length] }}></div>
                         <span className="text-xs font-medium text-slate-500">Cluster Group {selectedNode.group}</span>
                       </div>
                     </div>
                   </div>
                 )}

                 <ForceGraph2D
                    ref={fgRef}
                    graphData={graphData}
                    width={graphDim.width}
                    height={graphDim.height}
                    nodeCanvasObject={(node: any, ctx: any, globalScale: any) => {
                      const r = Math.max(Math.sqrt(node.val) * 3.5, 4);
                      
                      ctx.beginPath();
                      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                      ctx.fillStyle = getNodeColor(node);
                      ctx.fill();

                      // Ring for hovered/highlighted
                      if (highlightNodes.has(node.id) || hoverNode === node) {
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, r + 3, 0, 2 * Math.PI, false);
                        ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                      }

                      if (hoverNode && !highlightNodes.has(node.id)) {
                        return;
                      }

                      const label = `${node.id} (${node.val})`;
                      const fontSize = Math.max(12 / globalScale, 4.5);
                      ctx.font = `500 ${fontSize}px Inter, system-ui, sans-serif`;
                      
                      const textWidth = ctx.measureText(label).width;
                      const paddingX = fontSize * 0.6;
                      const paddingY = fontSize * 0.4;
                      const bckgDimensions = [textWidth + paddingX * 2, fontSize + paddingY * 2];
                      const textY = node.y + r + (fontSize / 2) + 4;
                      
                      ctx.textAlign = 'center';
                      ctx.textBaseline = 'middle';
                      
                      // Draw pill background
                      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                      ctx.beginPath();
                      ctx.roundRect(node.x - bckgDimensions[0] / 2, textY - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1], 4);
                      ctx.fill();
                      
                      // Border for pill
                      ctx.strokeStyle = 'rgba(0,0,0,0.05)';
                      ctx.lineWidth = 1 / globalScale;
                      ctx.stroke();
                      
                      ctx.fillStyle = hoverNode === node ? '#0f172a' : '#334155';
                      ctx.fillText(label, node.x, textY);
                    }}
                    nodePointerAreaPaint={(node: any, color: any, ctx: any) => {
                      const r = Math.max(Math.sqrt(node.val) * 3.5, 4);
                      ctx.fillStyle = color;
                      ctx.beginPath();
                      ctx.arc(node.x, node.y, r + 8, 0, 2 * Math.PI, false);
                      ctx.fill();
                    }}
                    linkColor={getLinkColor}
                    linkWidth={(link: any) => Math.sqrt(link.value) * 1.5}
                    onNodeHover={handleNodeHover}
                    onNodeClick={handleNodeClick}
                    onNodeDrag={handleNodeDrag}
                    onNodeDragEnd={handleNodeDragEnd}
                    cooldownTicks={150}
                    d3AlphaDecay={0.015}
                    d3VelocityDecay={0.2}
                  />
               </div>
            )}
          </div>
        </div>

        {/* Document List Modal Overlay */}
        {selectedYear && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200 border border-slate-200/50 dark:border-slate-800">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 rounded-t-2xl">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <IconCalendarEvent className="w-5 h-5 text-indigo-500" /> Documents from {selectedYear}
                </h3>
                <button 
                  onClick={() => setSelectedYear(null)}
                  className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 transition-colors shadow-sm border border-slate-200 dark:border-slate-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 bg-white dark:bg-gray-900 rounded-b-2xl">
                {library
                  .filter(item => String(item.year) === selectedYear)
                  .map((item, idx) => (
                  <div key={idx} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.title}</h4>
                    {item.authors && item.authors.length > 0 && (
                       <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3 bg-white dark:bg-slate-800 inline-block px-2.5 py-1 rounded-md border border-slate-100 dark:border-slate-700">
                         <IconUsers className="w-3 h-3 inline mr-1 text-slate-400" />
                         {item.authors.join(', ')}
                       </p>
                    )}
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                      {item.abstract ? item.abstract : <span className="italic text-slate-400">No abstract available.</span>}
                    </p>
                  </div>
                ))}
                {library.filter(item => String(item.year) === selectedYear).length === 0 && (
                   <div className="text-center p-10 text-slate-500">No documents found for this year.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
