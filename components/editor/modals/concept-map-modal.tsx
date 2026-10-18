'use client';

import React, { useState, useMemo } from 'react';
import {
  IconX,
  IconShare,
  IconCopy,
  IconCheck,
  IconSparkles,
  IconRefresh,
  IconBook,
  IconZoomIn,
  IconInfoCircle,
  IconLayersLinked
} from '@tabler/icons-react';
import {
  buildConceptNetworkGraph,
  exportConceptMapToMermaid,
  ConceptNetworkGraph,
  ConceptNode
} from '@/lib/editor/concept-map';

interface ConceptMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  citationLibrary?: Record<string, any>;
  language?: 'en' | 'id';
}

export const ConceptMapModal: React.FC<ConceptMapModalProps> = ({
  isOpen,
  onClose,
  citationLibrary = {},
  language = 'id',
}) => {
  const isEn = language === 'en';

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeClusterFilter, setActiveClusterFilter] = useState<string>('all');
  const [copiedMermaid, setCopiedMermaid] = useState(false);

  // Canvas dimensions
  const canvasWidth = 720;
  const canvasHeight = 480;

  // Build network graph
  const graph: ConceptNetworkGraph = useMemo(() => {
    return buildConceptNetworkGraph(citationLibrary, canvasWidth, canvasHeight, language);
  }, [citationLibrary, canvasWidth, canvasHeight, language]);

  const selectedNode = useMemo(() => {
    return graph.nodes.find((n) => n.id === selectedNodeId) || null;
  }, [graph.nodes, selectedNodeId]);

  // Connected nodes to the selected node
  const connectedNodeIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const set = new Set<string>();
    graph.edges.forEach((e) => {
      if (e.source === selectedNodeId) set.add(e.target);
      if (e.target === selectedNodeId) set.add(e.source);
    });
    return set;
  }, [graph.edges, selectedNodeId]);

  if (!isOpen) return null;

  const handleCopyMermaid = async () => {
    const mermaidCode = exportConceptMapToMermaid(graph);
    await navigator.clipboard.writeText(mermaidCode);
    setCopiedMermaid(true);
    setTimeout(() => setCopiedMermaid(false), 2200);
  };

  const getClusterColor = (clusterId: string) => {
    const cluster = graph.clusters.find((c) => c.id === clusterId);
    return cluster ? cluster.color : '#6366f1';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-6xl h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
              <IconShare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {isEn ? 'Cross-Paper Concept Map & Citation Network' : 'Peta Konsep & Jaringan Sitasi Antar-Paper'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                  Phase 38
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn
                  ? 'Visualizes thematic clusters, shared conceptual nodes, and literature centrality.'
                  : 'Visualisasi graf klaster tematik, simpul konsep bersama, dan sentralitas literatur naskah.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMermaid}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedMermaid ? <IconCheck className="w-3.5 h-3.5 text-emerald-500" /> : <IconCopy className="w-3.5 h-3.5" />}
              <span>{copiedMermaid ? (isEn ? 'Copied Mermaid!' : 'Tersalin!') : (isEn ? 'Copy Mermaid Code' : 'Salin Kode Mermaid')}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/60 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto thin-scroll">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">
              {isEn ? 'Thematic Clusters:' : 'Klaster Topik:'}
            </span>
            <button
              type="button"
              onClick={() => setActiveClusterFilter('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeClusterFilter === 'all'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {isEn ? 'All Clusters' : 'Semua Klaster'} ({graph.nodes.length})
            </button>
            {graph.clusters.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveClusterFilter(c.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeClusterFilter === c.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                <span>{c.name}</span>
                <span className="text-[10px] opacity-70 font-mono">({c.count})</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              {isEn ? 'Graph Density: ' : 'Kepadatan Graf: '}
              <strong className="text-slate-800 dark:text-slate-200">{graph.density}%</strong>
            </span>
            <span>
              {isEn ? 'Total Connections: ' : 'Total Relasi: '}
              <strong className="text-slate-800 dark:text-slate-200">{graph.edges.length}</strong>
            </span>
          </div>
        </div>

        {/* Main Body: Interactive SVG Viewport + Right Inspector */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-100 dark:bg-slate-950">
          {/* SVG Canvas Area */}
          <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
            {graph.nodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4 border border-violet-200/60 dark:border-violet-800/40">
                  <IconBook className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {isEn ? 'No Citation Papers in Library' : 'Belum Ada Paper Referensi di Pustaka'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                  {isEn
                    ? 'Add research citations to your library via Citation Search (Ctrl+Shift+C) or Reference Importer (Ctrl+Shift+U) to generate the concept graph.'
                    : 'Tambahkan referensi ke perpustakaan naskah untuk menghasilkan grafik koneksi konsep dan relasi sitasi antar-paper.'}
                </p>
              </div>
            ) : (
              <svg
                viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
                className="w-full max-w-3xl aspect-[3/2] select-none"
              >
                <defs>
                  <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.35" />
                  </filter>
                </defs>

                {/* Render Edges */}
                {graph.edges.map((edge) => {
                  const src = graph.nodes.find((n) => n.id === edge.source);
                  const tgt = graph.nodes.find((n) => n.id === edge.target);
                  if (!src || !tgt) return null;

                  const isHighlighted =
                    selectedNodeId &&
                    (edge.source === selectedNodeId || edge.target === selectedNodeId);
                  const isDimmed = selectedNodeId && !isHighlighted;

                  return (
                    <g key={edge.id} className="transition-opacity duration-300">
                      <line
                        x1={src.x}
                        y1={src.y}
                        x2={tgt.x}
                        y2={tgt.y}
                        stroke={isHighlighted ? '#8b5cf6' : '#94a3b8'}
                        strokeWidth={isHighlighted ? 3 : 1.5}
                        strokeDasharray={edge.similarityWeight > 0.7 ? undefined : '4 2'}
                        opacity={isDimmed ? 0.15 : isHighlighted ? 0.9 : 0.4}
                      />
                      {/* Midpoint Concept Chip */}
                      {(isHighlighted || graph.edges.length <= 8) && (
                        <text
                          x={(src.x + tgt.x) / 2}
                          y={(src.y + tgt.y) / 2 - 4}
                          textAnchor="middle"
                          className="text-[9px] fill-slate-500 dark:fill-slate-400 font-mono font-medium pointer-events-none"
                        >
                          {edge.sharedConcept}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Render Nodes */}
                {graph.nodes.map((node) => {
                  const isFiltered =
                    activeClusterFilter !== 'all' && node.cluster !== activeClusterFilter;
                  const isSelected = selectedNodeId === node.id;
                  const isConnected = connectedNodeIds.has(node.id);
                  const isDimmed =
                    isFiltered ||
                    (selectedNodeId && !isSelected && !isConnected);

                  const radius = 18 + Math.min(14, node.weight * 3);
                  const nodeColor = getClusterColor(node.cluster);

                  return (
                    <g
                      key={node.id}
                      onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                      className="cursor-pointer transition-transform duration-200 hover:scale-105"
                      style={{ opacity: isDimmed ? 0.2 : 1 }}
                    >
                      {/* Outer pulse ring if central */}
                      {node.id === graph.mostCentralNodeId && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={radius + 6}
                          fill="none"
                          stroke={nodeColor}
                          strokeWidth="2"
                          strokeDasharray="4 3"
                          className="animate-spin-slow opacity-60"
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={radius}
                        fill={nodeColor}
                        filter="url(#nodeShadow)"
                        stroke={isSelected ? '#ffffff' : 'rgba(255,255,255,0.4)'}
                        strokeWidth={isSelected ? 3.5 : 2}
                      />

                      {/* Node Label Text */}
                      <text
                        x={node.x}
                        y={node.y + radius + 14}
                        textAnchor="middle"
                        className={`text-[11px] font-bold ${
                          isSelected
                            ? 'fill-violet-600 dark:fill-violet-400 font-extrabold'
                            : 'fill-slate-800 dark:fill-slate-200'
                        }`}
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>

          {/* Right Inspector Panel */}
          <div className="w-full lg:w-88 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 overflow-y-auto flex flex-col justify-between">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: getClusterColor(selectedNode.cluster) }}
                  >
                    {graph.clusters.find((c) => c.id === selectedNode.cluster)?.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedNodeId(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {isEn ? 'Deselect' : 'Batal Pilih'}
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {selectedNode.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {selectedNode.authors} ({selectedNode.year})
                  </p>
                </div>

                {/* Node Degree / Connectivity */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>{isEn ? 'Thematic Connections:' : 'Koneksi Tematik:'}</span>
                    <strong className="text-violet-600 dark:text-violet-400 font-mono">
                      {connectedNodeIds.size} {isEn ? 'papers' : 'paper'}
                    </strong>
                  </div>
                  {selectedNode.id === graph.mostCentralNodeId && (
                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold pt-1">
                      <IconSparkles className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Core Central Anchor Paper' : 'Paper Fondasi Inti Pustaka'}</span>
                    </div>
                  )}
                </div>

                {/* Keywords Cloud */}
                <div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    {isEn ? 'Primary Concept Keywords:' : 'Kata Kunci Konsep Utama:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 font-medium"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
                <IconInfoCircle className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs leading-relaxed max-w-xs">
                  {isEn
                    ? 'Click any circular paper node on the canvas to inspect its conceptual connections, shared themes, and literature centrality.'
                    : 'Klik simpul lingkaran paper pada kanvas untuk memeriksa relasi konsep, tema bersama, dan sentralitas literatur.'}
                </p>
              </div>
            )}

            {/* Bottom Tip */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>ScholarFlow Concept Map</span>
              <span>{graph.nodes.length} {isEn ? 'nodes' : 'simpul'}</span>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {isEn
              ? 'Tip: Copy Mermaid diagram to render live network flowcharts inside your thesis methodology.'
              : 'Tips: Salin kode Mermaid untuk menyertakan diagram jejaring tema ke dalam bab metodologi Anda.'}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            {isEn ? 'Close' : 'Tutup'}
          </button>
        </div>
      </div>
    </div>
  );
};
