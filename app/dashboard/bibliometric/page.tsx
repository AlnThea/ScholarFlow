"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useBibliometricGraph } from "@/hooks/use-bibliometric-graph";
import { NodeDetailPanel } from "@/components/dashboard/bibliometric/node-detail-panel";
import { NetworkSettingsSidebar } from "@/components/dashboard/bibliometric/network-settings-sidebar";
import { useDataService, CitationCandidate } from "@/lib/services";
import { useAuth } from "@/components/auth/auth-provider";
import { MinimalSidebar } from '@/components/editor/minimal-sidebar';
import { useRouter } from 'next/navigation';
import { 
  IconSettings, IconFilter, IconDownload, IconZoomIn, IconMaximize, 
  IconUsers, IconTags, IconChartBar, IconCalendarEvent, IconLoader2,
  IconSearch, IconX
} from '@tabler/icons-react';

// Dynamically import ForceGraph2D with no SSR
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

import { useDebounce } from 'use-debounce';

export default function BibliometricPage() {
  const router = useRouter();
  const { dataService } = useDataService();
  const { user, profile } = useAuth();
  const [library, setLibrary] = useState<CitationCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Professional Analysis States
  const [minOccurrences, setMinOccurrences] = useState(2);
  const [minLinkStrength, setMinLinkStrength] = useState(1);
  const [analysisType, setAnalysisType] = useState<'keyword' | 'author' | 'co-citation' | 'bibliographic-coupling'>('keyword');
  const [dictionary, setDictionary] = useState<string>("");
  
  // Year Filter States
  const [yearFilter, setYearFilter] = useState<'all' | 'custom'>('all');
  const [minYear, setMinYear] = useState(2000);
  const [maxYear, setMaxYear] = useState(new Date().getFullYear());
  const [isAnimating, setIsAnimating] = useState(false);

  // Time-Slicing Animation Logic
  useEffect(() => {
    let interval: any;
    if (isAnimating) {
      interval = setInterval(() => {
        setMaxYear((prev) => {
          const next = prev + 1;
          const currentYear = new Date().getFullYear();
          if (next > currentYear) {
            setIsAnimating(false);
            return currentYear;
          }
          return next;
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isAnimating]);

  const handleToggleAnimate = () => {
    if (!isAnimating) {
      setYearFilter('custom');
      setMaxYear(minYear + 1); // Start animating from minYear + 1
    }
    setIsAnimating(!isAnimating);
  };

  // Graph interaction states
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Visualization Tuning States
  const [showLabels, setShowLabels] = useState(true);
  const [nodeSizeScale, setNodeSizeScale] = useState(1.0);
  const [chargeStrength, setChargeStrength] = useState(-30);

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

  // Load Thesaurus Workspace from Profile
  useEffect(() => {
    if (profile?.preferences?.bibliometric_dictionary !== undefined) {
      setDictionary(profile.preferences.bibliometric_dictionary);
    }
  }, [profile]);

  // Auto-Save Thesaurus Workspace
  const [debouncedDictionary] = useDebounce(dictionary, 2000);
  useEffect(() => {
    if (!user?.id || !profile) return;
    
    // Prevent saving if it's identical to what's already in the profile
    if (debouncedDictionary === profile.preferences?.bibliometric_dictionary) return;
    if (debouncedDictionary === "" && !profile.preferences?.bibliometric_dictionary) return;

    const newPreferences = {
      ...(profile.preferences || {}),
      bibliometric_dictionary: debouncedDictionary
    };

    dataService.updateUserProfile(user.id, { preferences: newPreferences }).catch(e => {
      console.error("Failed to save Thesaurus Workspace:", e);
    });
  }, [debouncedDictionary, user, profile, dataService]);

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
  const graphData = useBibliometricGraph(library, minOccurrences, minLinkStrength, analysisType, yearFilter, minYear, maxYear, dictionary);

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(chargeStrength);
      fgRef.current.d3ReheatSimulation();
    }
  }, [chargeStrength]);

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

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
      return;
    }
    
    const lowerQ = query.toLowerCase();
    const matchedNode: any = graphData.nodes.find((n: any) => n.id.toLowerCase().includes(lowerQ));
    
    if (matchedNode) {
      const newHighlightNodes = new Set();
      const newHighlightLinks = new Set();
      newHighlightNodes.add(matchedNode.id);
      matchedNode.neighbors.forEach((neighbor: string) => newHighlightNodes.add(neighbor));
      matchedNode.links.forEach((link: any) => newHighlightLinks.add(link));

      setHighlightNodes(newHighlightNodes);
      setHighlightLinks(newHighlightLinks);
      
      if (fgRef.current) {
        // Move camera to node
        fgRef.current.centerAt(matchedNode.x, matchedNode.y, 1000);
        fgRef.current.zoom(3, 1000);
      }
    } else {
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
    }
  }, [graphData.nodes]);

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

  const exportNetworkSVG = () => {
    if (!graphData || graphData.nodes.length === 0) return;
    const { nodes, links } = graphData;
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach((n: any) => {
      if (n.x < minX) minX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.x > maxX) maxX = n.x;
      if (n.y > maxY) maxY = n.y;
    });
    
    minX -= 100; minY -= 100; maxX += 100; maxY += 100;
    const width = maxX - minX;
    const height = maxY - minY;

    let svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" style="background-color: ${document.documentElement.classList.contains('dark') ? '#020617' : '#ffffff'};">`;
    
    // Draw links
    svgStr += `<g stroke="${document.documentElement.classList.contains('dark') ? '#334155' : '#cbd5e1'}" stroke-opacity="0.6">`;
    links.forEach((l: any) => {
       const src = typeof l.source === 'object' ? l.source : nodes.find((n:any) => n.id === l.source);
       const tgt = typeof l.target === 'object' ? l.target : nodes.find((n:any) => n.id === l.target);
       if (src && tgt) {
         svgStr += `<line x1="${src.x}" y1="${src.y}" x2="${tgt.x}" y2="${tgt.y}" stroke-width="${Math.sqrt(l.value || 1)}"/>`;
       }
    });
    svgStr += `</g>`;

    // Draw nodes and labels
    svgStr += `<g>`;
    nodes.forEach((n: any) => {
       const color = n.color || '#6366f1';
       const r = Math.sqrt(n.val) * 3 * nodeSizeScale;
       svgStr += `<circle cx="${n.x}" cy="${n.y}" r="${r}" fill="${color}" fill-opacity="0.9" />`;
       if (showLabels) {
         const textColor = document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#334155';
         svgStr += `<text x="${n.x}" y="${n.y + r + 6}" fill="${textColor}" font-size="${4 * nodeSizeScale}px" font-family="sans-serif" text-anchor="middle" font-weight="600">${n.id}</text>`;
       }
    });
    svgStr += `</g></svg>`;

    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `ScholarFlow_Network_Vector.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const [colorMode, setColorMode] = useState<'cluster' | 'trend' | 'density'>('cluster');

  const exportNetworkImage = () => {
    const canvas = document.querySelector('.force-graph-container canvas, canvas') as HTMLCanvasElement;
    if (canvas) {
      // Create a high-res export canvas
      const scaleFactor = 3; // 3x resolution for 4K quality
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width * scaleFactor;
      tempCanvas.height = canvas.height * scaleFactor;
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        ctx.scale(scaleFactor, scaleFactor);
        ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#020617' : '#ffffff'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // We draw the existing canvas but apply image smoothing for a slightly better upscaled result
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
        
        const link = document.createElement('a');
        link.download = `ScholarFlow_Network_4K.png`;
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
      }
    }
  };

  const exportNetworkCSV = () => {
    if (graphData.nodes.length === 0) return;
    
    // Nodes CSV
    let nodesCsv = "Id,Label,Weight,Group,AvgYear\n";
    graphData.nodes.forEach((n: any) => {
      nodesCsv += `"${n.id}","${n.id}",${n.val},${n.group},${n.avgYear}\n`;
    });
    
    // Edges CSV
    let edgesCsv = "Source,Target,Type,Weight\n";
    graphData.links.forEach((l: any) => {
      const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
      const targetId = typeof l.target === 'object' ? l.target.id : l.target;
      edgesCsv += `"${sourceId}","${targetId}","Undirected",${l.value}\n`;
    });
    
    const blob = new Blob([edgesCsv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.download = `ScholarFlow_Edges_${analysisType}.csv`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const exportNetworkGraphML = () => {
    if (graphData.nodes.length === 0) return;
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<graphml xmlns="http://graphml.graphdrawing.org/xmlns">\n`;
    xml += `  <key id="d0" for="node" attr.name="weight" attr.type="double"/>\n`;
    xml += `  <key id="d1" for="node" attr.name="group" attr.type="int"/>\n`;
    xml += `  <key id="d2" for="node" attr.name="avgYear" attr.type="double"/>\n`;
    xml += `  <key id="d3" for="edge" attr.name="weight" attr.type="double"/>\n`;
    xml += `  <graph id="G" edgedefault="undirected">\n`;
    
    graphData.nodes.forEach((n: any) => {
      xml += `    <node id="${n.id}">\n`;
      xml += `      <data key="d0">${n.val}</data>\n`;
      xml += `      <data key="d1">${n.group}</data>\n`;
      xml += `      <data key="d2">${n.avgYear}</data>\n`;
      xml += `    </node>\n`;
    });
    
    graphData.links.forEach((l: any, i: number) => {
      const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
      const targetId = typeof l.target === 'object' ? l.target.id : l.target;
      xml += `    <edge id="e${i}" source="${sourceId}" target="${targetId}">\n`;
      xml += `      <data key="d3">${l.value}</data>\n`;
      xml += `    </edge>\n`;
    });
    
    xml += `  </graph>\n</graphml>`;
    
    const blob = new Blob([xml], { type: 'application/xml' });
    const link = document.createElement('a');
    link.download = `ScholarFlow_Network_${analysisType}.graphml`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#94a3b8"];
  
  // Interpolate from blue (old) to green to yellow to red (new)
  const getTrendColor = (avgYear: number) => {
    if (!avgYear || avgYear === 0) return "#94a3b8"; // grey
    const min = graphData.minAvgYear || 2000;
    const max = graphData.maxAvgYear || 2024;
    let ratio = max === min ? 0.5 : (avgYear - min) / (max - min);
    ratio = Math.max(0, Math.min(1, ratio));
    
    // Simple gradient: Blue -> Yellow -> Red
    if (ratio < 0.5) {
      // Blue to Yellow
      const rRatio = ratio * 2;
      const r = Math.round(59 + (234 - 59) * rRatio); // 3b to ea
      const g = Math.round(130 + (179 - 130) * rRatio); // 82 to b3
      const b = Math.round(246 + (8 - 246) * rRatio); // f6 to 08
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Yellow to Red
      const rRatio = (ratio - 0.5) * 2;
      const r = Math.round(234 + (239 - 234) * rRatio); // ea to ef
      const g = Math.round(179 + (68 - 179) * rRatio); // b3 to 44
      const b = Math.round(8 + (68 - 8) * rRatio); // 08 to 44
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  const getNodeColor = (node: any) => {
    if (hoverNode && !highlightNodes.has(node.id)) {
      return "rgba(200, 200, 200, 0.2)";
    }
    if (colorMode === 'trend') {
      return getTrendColor(node.avgYear);
    }
    return colors[node.group % colors.length];
  };

  const getLinkColor = (link: any) => {
    if (colorMode === 'density') return "transparent";
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
                CSV
              </button>
             <button 
                onClick={exportNetworkGraphML}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                <IconDownload className="w-4 h-4" />
                GraphML
              </button>
             <button 
                onClick={exportNetworkImage}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium transition-colors"
                title="Export High-Res PNG"
              >
                <IconDownload className="w-4 h-4" />
                PNG (4K)
              </button>
              <button 
                onClick={exportNetworkSVG}
                className="flex items-center gap-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium transition-colors"
                title="Export Scalable Vector Graphics"
              >
                <IconDownload className="w-4 h-4" />
                SVG
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
            dictionary={dictionary} setDictionary={setDictionary}
            colorMode={colorMode} setColorMode={setColorMode}
            showLabels={showLabels} setShowLabels={setShowLabels}
            nodeSizeScale={nodeSizeScale} setNodeSizeScale={setNodeSizeScale}
            chargeStrength={chargeStrength} setChargeStrength={setChargeStrength}
            isAnimating={isAnimating} onToggleAnimate={handleToggleAnimate}
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

                 {/* Top Right Floating Toolbar (Search & Controls) */}
                 <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
                   {/* Search Box */}
                   <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700 flex items-center overflow-hidden px-3 py-2 w-64 transition-all focus-within:ring-2 focus-within:ring-indigo-500/50">
                     <IconSearch className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                     <input
                       type="text"
                       placeholder="Search node..."
                       value={searchQuery}
                       onChange={(e) => handleSearch(e.target.value)}
                       className="bg-transparent border-none outline-none text-sm w-full text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                     />
                     {searchQuery && (
                       <button onClick={() => handleSearch('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 ml-1 shrink-0">
                         <IconX className="w-3.5 h-3.5" />
                       </button>
                     )}
                   </div>
                 </div>

                 <NodeDetailPanel selectedNode={selectedNode} onClose={() => setSelectedNode(null)} />

                 <ForceGraph2D
                    ref={fgRef}
                    graphData={graphData}
                    width={graphDim.width}
                    height={graphDim.height}
                    nodeCanvasObject={(node: any, ctx: any, globalScale: any) => {
                      const baseR = Math.max(Math.sqrt(node.val) * 3.5, 4);
                      const r = baseR * nodeSizeScale;
                      
                      if (colorMode === 'density') {
                        // Density Visualization Mode
                        ctx.globalCompositeOperation = 'multiply'; // or 'screen' depending on background
                        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 2.5);
                        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)'); // hot center
                        gradient.addColorStop(0.3, 'rgba(245, 158, 11, 0.2)'); // warm middle
                        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); // fade out
                        
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, r * 2.5, 0, 2 * Math.PI, false);
                        ctx.fillStyle = gradient;
                        ctx.fill();
                        ctx.globalCompositeOperation = 'source-over'; // reset
                        
                        // Optionally don't draw label unless hovered
                        if (hoverNode !== node && !highlightNodes.has(node.id) && node.val < 10) return;
                      } else {
                        // Standard Mode
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
                      }

                      if (hoverNode && !highlightNodes.has(node.id)) {
                        return;
                      }

                      if (!showLabels && hoverNode !== node && !highlightNodes.has(node.id)) {
                        return;
                      }

                      const label = `${node.id}`;
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
                      const baseR = Math.max(Math.sqrt(node.val) * 3.5, 4);
                      const r = baseR * nodeSizeScale;
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
                    onEngineStop={() => {
                      if (fgRef.current) {
                        fgRef.current.d3Force('charge').strength(chargeStrength);
                      }
                    }}
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
