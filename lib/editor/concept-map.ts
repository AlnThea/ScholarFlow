/**
 * concept-map.ts
 *
 * Cross-Paper Concept Map & Citation Network Visualizer Engine.
 * Extracts conceptual keywords and shared thematic nodes across research papers in citation libraries.
 * Builds interconnected network graphs (nodes & edges), radial coordinates for interactive SVG rendering,
 * and generates Mermaid diagram representations.
 */

import { cleanHtmlText } from './slide-deck-generator';

export interface ConceptNode {
  id: string;
  label: string; // e.g. "Smith (2024)"
  title: string;
  authors: string;
  year: string | number;
  cluster: string;
  weight: number; // centrality degree
  x: number;
  y: number;
  keywords: string[];
}

export interface ConceptEdge {
  id: string;
  source: string;
  target: string;
  sharedConcept: string;
  similarityWeight: number; // 0 to 1
}

export interface ConceptCluster {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface ConceptNetworkGraph {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  clusters: ConceptCluster[];
  mostCentralNodeId?: string;
  density: number;
}

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'this', 'that', 'these', 'those',
  'we', 'our', 'study', 'paper', 'results', 'research', 'analysis', 'using', 'based', 'approach',
  'dan', 'atau', 'di', 'ke', 'dari', 'pada', 'untuk', 'dengan', 'adalah', 'ini', 'itu', 'yang',
  'penelitian', 'studi', 'hasil', 'metode', 'analisis', 'terhadap', 'secara', 'dapat'
]);

const CLUSTER_PALETTES = [
  { id: 'ai-computational', nameEn: 'AI & Computational', nameId: 'AI & Komputasional', color: '#6366f1' }, // Indigo
  { id: 'methodology-empirical', nameEn: 'Empirical & Data', nameId: 'Empiris & Data', color: '#06b6d4' }, // Cyan
  { id: 'theoretical-foundations', nameEn: 'Theoretical Models', nameId: 'Model Teoretis', color: '#10b981' }, // Emerald
  { id: 'optimization-systems', nameEn: 'Systems & Optimization', nameId: 'Sistem & Optimasi', color: '#f59e0b' }, // Amber
  { id: 'general-multidisciplinary', nameEn: 'General Domain', nameId: 'Domain Umum', color: '#ec4899' }, // Pink
];

/**
 * Extracts salient academic keywords from paper title and abstract
 */
export function extractPaperKeywords(title = '', abstract = '', maxKeywords = 5): string[] {
  const combined = cleanHtmlText(`${title} ${abstract}`).toLowerCase();
  // Strip non-alphanumeric except hyphen
  const words = combined.replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/);

  const freq = new Map<string, number>();

  // Single word frequencies
  for (const w of words) {
    if (w.length > 3 && !STOPWORDS.has(w)) {
      freq.set(w, (freq.get(w) || 0) + 1);
    }
  }

  // Key academic phrases (bigrams)
  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i];
    const w2 = words[i + 1];
    if (w1.length > 2 && w2.length > 2 && !STOPWORDS.has(w1) && !STOPWORDS.has(w2)) {
      const phrase = `${w1} ${w2}`;
      freq.set(phrase, (freq.get(phrase) || 0) + 2);
    }
  }

  // Sort by frequency
  const sorted = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .map((e) => e[0]);

  // Return top unique keywords
  const result: string[] = [];
  for (const k of sorted) {
    if (!result.some((r) => r.includes(k) || k.includes(r))) {
      result.push(k);
    }
    if (result.length >= maxKeywords) break;
  }

  return result.length > 0 ? result : ['research', 'methodology'];
}

/**
 * Assigns a thematic cluster based on paper keywords
 */
export function assignCluster(keywords: string[]): { id: string; nameEn: string; nameId: string; color: string } {
  const kwStr = keywords.join(' ').toLowerCase();

  if (kwStr.includes('ai') || kwStr.includes('learning') || kwStr.includes('neural') || kwStr.includes('algorithm') || kwStr.includes('model') || kwStr.includes('computational')) {
    return CLUSTER_PALETTES[0];
  }
  if (kwStr.includes('data') || kwStr.includes('survey') || kwStr.includes('sample') || kwStr.includes('empirical') || kwStr.includes('experiment')) {
    return CLUSTER_PALETTES[1];
  }
  if (kwStr.includes('theory') || kwStr.includes('framework') || kwStr.includes('literature') || kwStr.includes('review') || kwStr.includes('slr')) {
    return CLUSTER_PALETTES[2];
  }
  if (kwStr.includes('system') || kwStr.includes('performance') || kwStr.includes('optimization') || kwStr.includes('network') || kwStr.includes('process')) {
    return CLUSTER_PALETTES[3];
  }

  return CLUSTER_PALETTES[4];
}

/**
 * Builds the Concept Network Graph from a Citation Library record.
 * Generates 2D radial layout coordinates and inter-paper concept edges.
 */
export function buildConceptNetworkGraph(
  citationLibrary: Record<string, any> = {},
  canvasWidth = 800,
  canvasHeight = 500,
  language: 'en' | 'id' = 'en'
): ConceptNetworkGraph {
  const items = Object.entries(citationLibrary);
  const isEn = language === 'en';

  if (items.length === 0) {
    return {
      nodes: [],
      edges: [],
      clusters: [],
      density: 0,
    };
  }

  const nodes: ConceptNode[] = [];
  const edges: ConceptEdge[] = [];
  const clusterCounts = new Map<string, number>();

  // Center coordinate of canvas
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const baseRadius = Math.min(canvasWidth, canvasHeight) * 0.36;

  // 1. Create nodes with initial keywords
  items.forEach(([key, item], idx) => {
    const id = item.id || key || `node-${idx}`;
    const title = cleanHtmlText(item.title || 'Untitled Research');
    const authorsRaw = Array.isArray(item.authors) ? item.authors.join(', ') : item.authors || 'Unknown';
    const year = item.year || 'n.d.';

    // Label: First author surname + year
    const firstAuthor = authorsRaw.split(',')[0].trim().split(' ').pop() || 'Study';
    const label = `${firstAuthor} (${year})`;

    const keywords = extractPaperKeywords(title, item.abstract);
    const cluster = assignCluster(keywords);
    clusterCounts.set(cluster.id, (clusterCounts.get(cluster.id) || 0) + 1);

    // Radial layout positioning around center
    const angle = (idx / items.length) * 2 * Math.PI - Math.PI / 2;
    // Add slight radial variation to prevent rigid circles
    const radiusVariance = (idx % 2 === 0 ? 0.92 : 1.08) * baseRadius;
    const x = Math.round(centerX + Math.cos(angle) * radiusVariance);
    const y = Math.round(centerY + Math.sin(angle) * radiusVariance);

    nodes.push({
      id,
      label,
      title,
      authors: authorsRaw,
      year,
      cluster: cluster.id,
      weight: 1, // updated after edge calculation
      x,
      y,
      keywords,
    });
  });

  // 2. Discover conceptual edges between nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const nodeA = nodes[i];
      const nodeB = nodes[j];

      // Find shared keywords
      const shared = nodeA.keywords.filter((k) =>
        nodeB.keywords.some((kb) => kb.includes(k) || k.includes(kb))
      );

      // Same cluster bonus
      const sameCluster = nodeA.cluster === nodeB.cluster;

      if (shared.length > 0 || (sameCluster && nodes.length <= 6)) {
        const sharedLabel = shared.length > 0 ? shared[0] : (isEn ? 'Thematic Domain' : 'Domain Tematik');
        const weight = Math.min(1, 0.4 + shared.length * 0.3);

        edges.push({
          id: `edge-${nodeA.id}-${nodeB.id}`,
          source: nodeA.id,
          target: nodeB.id,
          sharedConcept: sharedLabel,
          similarityWeight: weight,
        });

        nodeA.weight++;
        nodeB.weight++;
      }
    }
  }

  // 3. Find most central node
  let mostCentralNodeId: string | undefined;
  let maxWeight = 0;
  for (const n of nodes) {
    if (n.weight > maxWeight) {
      maxWeight = n.weight;
      mostCentralNodeId = n.id;
    }
  }

  // 4. Build clusters list
  const clusters: ConceptCluster[] = CLUSTER_PALETTES.map((c) => ({
    id: c.id,
    name: isEn ? c.nameEn : c.nameId,
    color: c.color,
    count: clusterCounts.get(c.id) || 0,
  })).filter((c) => c.count > 0);

  // Network density: 2 * |E| / (|V| * (|V| - 1))
  const maxEdges = (nodes.length * (nodes.length - 1)) / 2;
  const density = maxEdges > 0 ? Math.round((edges.length / maxEdges) * 100) : 0;

  return {
    nodes,
    edges,
    clusters,
    mostCentralNodeId,
    density,
  };
}

/**
 * Converts a ConceptNetworkGraph into a Mermaid diagram syntax (`graph TD` or `graph LR`)
 */
export function exportConceptMapToMermaid(graph: ConceptNetworkGraph): string {
  if (graph.nodes.length === 0) {
    return 'graph TD\n  Empty["No reference papers available"]\n';
  }

  const lines: string[] = ['graph TD'];

  // Define nodes with cluster styling
  graph.nodes.forEach((n, idx) => {
    const safeLabel = n.label.replace(/"/g, "'");
    lines.push(`  N${idx}["${safeLabel}"]`);
  });

  // Map node ID to index
  const idMap = new Map<string, number>();
  graph.nodes.forEach((n, idx) => idMap.set(n.id, idx));

  // Define edges
  graph.edges.forEach((e) => {
    const srcIdx = idMap.get(e.source);
    const tgtIdx = idMap.get(e.target);
    if (srcIdx !== undefined && tgtIdx !== undefined) {
      const safeConcept = e.sharedConcept.replace(/["()]/g, '');
      lines.push(`  N${srcIdx} ---|"${safeConcept}"| N${tgtIdx}`);
    }
  });

  return lines.join('\n') + '\n';
}
