"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useBibliometricGraph } from "@/hooks/use-bibliometric-graph";
import { NodeDetailPanel } from "@/components/dashboard/bibliometric/node-detail-panel";
import { NetworkSettingsSidebar } from "@/components/dashboard/bibliometric/network-settings-sidebar";
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
  
  const fgRef = useRef<any>(null);
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
  const graphData = useBibliometricGraph(library, minOccurrences, minLinkStrength, analysisType, yearFilter, minYear, maxYear);

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
          
          <NetworkSettingsSidebar 
            yearFilter={yearFilter} setYearFilter={setYearFilter}
            minYear={minYear} setMinYear={setMinYear}
            maxYear={maxYear} setMaxYear={setMaxYear}
            analysisType={analysisType} setAnalysisType={setAnalysisType}
            minOccurrences={minOccurrences} setMinOccurrences={setMinOccurrences}
            minLinkStrength={minLinkStrength} setMinLinkStrength={setMinLinkStrength}
            graphData={graphData} setSelectedYear={setSelectedYear}
          />
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

                 <NodeDetailPanel selectedNode={selectedNode} onClose={() => setSelectedNode(null)} />

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
