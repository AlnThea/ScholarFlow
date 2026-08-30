"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useDataService, CitationCandidate } from "@/lib/services";
import { MinimalSidebar } from '@/components/editor/minimal-sidebar';

// Dynamically import ForceGraph2D with no SSR
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export default function BibliometricPage() {
  const { dataService } = useDataService();
  const [library, setLibrary] = useState<CitationCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // States for highlighting
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState<any>(null);

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

  // Generate graph data from library
  const graphData = useMemo(() => {
    if (library.length === 0) return { nodes: [], links: [] };

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

    const keywordCounts: Record<string, number> = {};
    const cooccurrences: Record<string, number> = {};
    const yearCounts: Record<string, number> = {};

    library.forEach((item) => {
      // Tally years
      if (item.year) {
        yearCounts[item.year] = (yearCounts[item.year] || 0) + 1;
      }

      const text = `${item.title} ${item.abstract || ""}`.toLowerCase().replace(/[^\w\s-]/g, " ");
      const rawWords = text.split(/\s+/).filter(w => w.length > 0);
      
      const docPhrases = new Set<string>();

      for (let i = 0; i < rawWords.length; i++) {
        const w1 = rawWords[i];
        let formedPhrase = false;
        
        // Try to form a 2-word phrase (bigram)
        if (i < rawWords.length - 1) {
          const w2 = rawWords[i + 1];
          if (!stopWords.has(w1) && !stopWords.has(w2) && w1.length > 2 && w2.length > 2) {
            docPhrases.add(`${w1} ${w2}`);
            formedPhrase = true;
            i++; // Skip the next word since it's grouped into this bigram
          }
        }
        
        // Fallback to single word (unigram)
        if (!formedPhrase && !stopWords.has(w1) && w1.length >= 4) {
          if (!genericUnigrams.has(w1)) {
            docPhrases.add(w1);
          }
        }
      }

      // Limit per document to prevent massive graphs from long abstracts
      const docWords = Array.from(docPhrases).slice(0, 15);

      docWords.forEach(w => {
        keywordCounts[w] = (keywordCounts[w] || 0) + 1;
      });

      for (let i = 0; i < docWords.length; i++) {
        for (let j = i + 1; j < docWords.length; j++) {
          const w1 = docWords[i];
          const w2 = docWords[j];
          const pair = w1 < w2 ? `${w1}__${w2}` : `${w2}__${w1}`;
          cooccurrences[pair] = (cooccurrences[pair] || 0) + 1;
        }
      }
    });

    const threshold = library.length < 5 ? 1 : 2;
    const validNodes = Object.entries(keywordCounts)
      .filter(([_, count]) => count >= threshold)
      .map(([id, val]) => ({ id, val, neighbors: [] as string[], links: [] as any[] }));

    const validNodeIds = new Set(validNodes.map(n => n.id));

    const validLinks = Object.entries(cooccurrences)
      .filter(([pair, weight]) => {
        const [source, target] = pair.split("__");
        return validNodeIds.has(source) && validNodeIds.has(target) && weight >= threshold;
      })
      .map(([pair, weight]) => {
        const [source, target] = pair.split("__");
        return { source, target, value: weight };
      });

    // Cross-link nodes for highlighting logic
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
    
    const maxYearCount = Object.keys(yearCounts).length > 0 ? Math.max(...Object.values(yearCounts)) : 1;

    return { nodes: validNodes, links: validLinks, yearCounts, maxYearCount };
  }, [library]);

  const handleNodeHover = useCallback((node: any) => {
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
    if (node) {
      const newHighlightNodes = new Set([node.id, ...node.neighbors]);
      const newHighlightLinks = new Set(node.links);
      setHighlightNodes(newHighlightNodes);
      setHighlightLinks(newHighlightLinks);
      setHoverNode(node);
    } else {
      setHoverNode(null);
    }
  }, []);

  const handleNodeDrag = useCallback((node: any) => {
    // Treat drag like hover for highlighting
    handleNodeHover(node);
  }, [handleNodeHover]);

  const fgRef = useRef<any>();

  const handleNodeDragEnd = useCallback((node: any) => {
    // Unpin node completely so d3-force releases it
    delete node.fx;
    delete node.fy;
    
    // Release hover effect after dragging
    handleNodeHover(null);
    
    // Reheat simulation so the physics engine wakes up and pulls it back
    if (fgRef.current) {
      fgRef.current.d3ReheatSimulation();
    }
  }, [handleNodeHover]);

  // Adjust physics forces safely after graph mounts
  useEffect(() => {
    if (graphData.nodes.length > 0) {
      // Small timeout to ensure ForceGraph2D has fully initialized its internal d3 engine
      const timer = setTimeout(() => {
        if (fgRef.current) {
          // Extremely weak repulsion so they don't push each other away much
          fgRef.current.d3Force('charge').strength(-10);
          // Very tight rubber bands so they always snap back together
          fgRef.current.d3Force('link').distance(20);
          
          // Re-center force to pull everything to the middle
          fgRef.current.d3Force('gravitation', (alpha: number) => {
            if (!graphData.nodes) return;
            graphData.nodes.forEach((n: any) => {
              n.vx -= n.x * alpha * 0.05;
              n.vy -= n.y * alpha * 0.05;
            });
          });
          
          // Reheat to apply the new forces
          fgRef.current.d3ReheatSimulation();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [graphData]);

  // Determine colors based on hover state
  const getNodeColor = (node: any) => {
    if (hoverNode && !highlightNodes.has(node.id)) {
      return "rgba(200, 200, 200, 0.2)"; // Grayed out
    }
    // We can use a simple hash function to assign colors to node groups
    const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
    const charCodeSum = node.id.split('').reduce((a: number, b: string) => a + b.charCodeAt(0), 0);
    return colors[charCodeSum % colors.length];
  };

  const getLinkColor = (link: any) => {
    if (hoverNode && !highlightLinks.has(link)) {
      return "rgba(200, 200, 200, 0.1)"; // Grayed out
    }
    return "rgba(156, 163, 175, 0.6)"; // Normal color
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      <MinimalSidebar
        isExpanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        documents={[]}
        currentDocumentId={null}
        activeDashboardTab="bibliometric"
      />
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col w-full p-8 min-h-full">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bibliometric Analysis
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Keyword Co-occurrence Network. Hover or drag a node to highlight its connections.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center p-10 text-gray-500">Loading your library data...</div>
        ) : library.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-10 text-center rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-2">Your library is empty</h2>
            <p className="text-gray-500">Please add citations to your library first to generate the bibliometric graph.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Publication Timeline */}
            <div className="w-full bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
              <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">Publication Timeline</h3>
              <p className="text-sm text-gray-500 mb-6">Trends of your library documents by publication year.</p>
              
              {Object.keys(graphData.yearCounts).length > 0 ? (
                <div className="flex items-end gap-2 h-40 mt-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                  {Object.entries(graphData.yearCounts)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([year, count]) => (
                    <div key={year} className="flex flex-col items-center flex-1 group h-full">
                      <div 
                        className="relative w-full flex-1 flex justify-center items-end cursor-pointer"
                        onClick={() => setSelectedYear(year)}
                      >
                        <div 
                          className="w-full max-w-[40px] bg-indigo-500 rounded-t-sm group-hover:bg-indigo-600 transition-colors relative flex justify-center"
                          style={{ height: `${(count as number / graphData.maxYearCount) * 100}%`, minHeight: '4px' }}
                        >
                          {/* Permanent Number Label */}
                          <span className="absolute -top-6 text-xs font-bold text-gray-700 dark:text-gray-200 whitespace-nowrap">
                            {count} Docs
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 mt-3">{year}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-sm h-40 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                  No publication year data available.
                </div>
              )}
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-center">
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Total Documents</p>
                  <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{library.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-center">
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Extracted Keywords</p>
                  <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{graphData.nodes.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-center">
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Connections</p>
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{graphData.links.length}</p>
              </div>
            </div>

            {/* Network Graph */}
            <div className="w-full bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-[700px] overflow-hidden relative">
              <div className="absolute top-4 left-4 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-sm font-medium">
                Keyword Network (Hover to Focus)
              </div>
              
              {/* Zoom Controls */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-1 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <button 
                  onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 1.5, 400)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300 transition-colors"
                  title="Zoom In"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                </button>
                <div className="h-px bg-gray-200 dark:bg-gray-700 w-full" />
                <button 
                  onClick={() => fgRef.current?.zoom(fgRef.current.zoom() / 1.5, 400)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300 transition-colors"
                  title="Zoom Out"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4"/></svg>
                </button>
                <div className="h-px bg-gray-200 dark:bg-gray-700 w-full" />
                <button 
                  onClick={() => fgRef.current?.zoomToFit(400, 50)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300 transition-colors"
                  title="Fit to Screen"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
                </button>
                <div className="h-px bg-gray-200 dark:bg-gray-700 w-full" />
                <button 
                  onClick={() => {
                    // Find the canvas used by ForceGraph
                    const canvas = document.querySelector('.force-graph-container canvas, canvas') as HTMLCanvasElement;
                    if (canvas) {
                      // Create a temporary canvas to add a solid white background (since original is transparent)
                      const tempCanvas = document.createElement('canvas');
                      tempCanvas.width = canvas.width;
                      tempCanvas.height = canvas.height;
                      const ctx = tempCanvas.getContext('2d');
                      if (ctx) {
                        ctx.fillStyle = '#ffffff'; // Solid white background
                        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                        ctx.drawImage(canvas, 0, 0);
                        
                        // Download as high quality JPG
                        const link = document.createElement('a');
                        link.download = 'Bibliometric-Network.jpg';
                        link.href = tempCanvas.toDataURL('image/jpeg', 1.0);
                        link.click();
                      }
                    }
                  }}
                  className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md text-indigo-600 dark:text-indigo-400 transition-colors"
                  title="Download Image (JPG)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                </button>
              </div>

              {graphData.nodes.length > 0 ? (
                <ForceGraph2D
                  ref={fgRef}
                  graphData={graphData}
                  width={1100}
                  height={680}
                  nodeCanvasObject={(node: any, ctx: any, globalScale: any) => {
                    // Node Size
                    const r = Math.max(Math.sqrt(node.val) * 4, 3);
                    
                    // Draw Circle
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                    ctx.fillStyle = getNodeColor(node);
                    ctx.fill();

                    // If a node is hovered, hide text for non-highlighted nodes to reduce visual clutter
                    if (hoverNode && !highlightNodes.has(node.id)) {
                      return;
                    }

                    // Draw Text Label
                    const label = `${node.id} (${node.val})`;
                    const fontSize = Math.max(12 / globalScale, 4); // Keep text readable when zoomed out
                    ctx.font = `${fontSize}px Sans-Serif`;
                    
                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);
                    const textY = node.y + r + (fontSize / 2) + 2; // Position below node
                    
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    // Text background for readability
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                    ctx.fillRect(node.x - bckgDimensions[0] / 2, textY - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);
                    
                    // Text color
                    ctx.fillStyle = hoverNode === node ? '#000000' : '#4b5563';
                    ctx.fillText(label, node.x, textY);
                  }}
                  nodePointerAreaPaint={(node: any, color: any, ctx: any) => {
                    const r = Math.max(Math.sqrt(node.val) * 4, 3);
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, r + 5, 0, 2 * Math.PI, false); // +5 for easier hovering
                    ctx.fill();
                  }}
                  linkColor={getLinkColor}
                  linkWidth={(link: any) => Math.sqrt(link.value)}
                  onNodeHover={handleNodeHover}
                  onNodeDrag={handleNodeDrag}
                  onNodeDragEnd={handleNodeDragEnd}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Not enough data to generate graph. Add more varied documents.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Document List Modal */}
        {selectedYear && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                  Documents from {selectedYear}
                </h3>
                <button 
                  onClick={() => setSelectedYear(null)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
                {library
                  .filter(item => String(item.year) === selectedYear)
                  .map((item, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                    <h4 className="font-semibold text-indigo-700 dark:text-indigo-400 mb-2">{item.title}</h4>
                    {item.authors && item.authors.length > 0 && (
                       <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                         <span className="font-semibold">Authors:</span> {item.authors.join(', ')}
                       </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.abstract ? item.abstract : <span className="italic text-gray-400">No abstract available.</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  );
}
