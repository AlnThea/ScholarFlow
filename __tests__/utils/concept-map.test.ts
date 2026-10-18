import { describe, it, expect } from 'vitest';
import {
  extractPaperKeywords,
  assignCluster,
  buildConceptNetworkGraph,
  exportConceptMapToMermaid,
} from '@/lib/editor/concept-map';

describe('Phase 38: Cross-Paper Concept Map & Citation Network Visualizer Unit Tests', () => {
  it('extractPaperKeywords: extracts keywords while ignoring stopwords', () => {
    const title = 'A Deep Learning Approach for Renewable Power Forecasting';
    const abstract = 'We evaluate convolutional neural network models on empirical telemetry data.';

    const keywords = extractPaperKeywords(title, abstract);
    expect(keywords.length).toBeGreaterThan(0);
    const joined = keywords.join(' ').toLowerCase();
    expect(joined).toContain('deep learning' || 'learning' || 'neural' || 'renewable');
    expect(keywords).not.toContain('the');
    expect(keywords).not.toContain('and');
  });

  it('assignCluster: maps keywords to proper academic cluster', () => {
    const aiKeywords = ['neural network', 'deep learning'];
    const clusterAi = assignCluster(aiKeywords);
    expect(clusterAi.id).toBe('ai-computational');

    const surveyKeywords = ['survey', 'empirical sample'];
    const clusterEmpirical = assignCluster(surveyKeywords);
    expect(clusterEmpirical.id).toBe('methodology-empirical');
  });

  it('buildConceptNetworkGraph: builds interconnected graph with coordinates and edges', () => {
    const mockLibrary = {
      p1: {
        id: 'p1',
        title: 'Deep Learning for Smart Grid Optimization',
        authors: 'Smith, J.',
        year: 2024,
        abstract: 'Neural network architectures optimize high-voltage power networks.',
      },
      p2: {
        id: 'p2',
        title: 'Neural Network Predictions in Energy Systems',
        authors: 'Johnson, A.',
        year: 2023,
        abstract: 'Deep learning models provide real-time forecasts for electrical grids.',
      },
      p3: {
        id: 'p3',
        title: 'Qualitative Survey on Workplace Ergonomics',
        authors: 'Brown, C.',
        year: 2022,
        abstract: 'Thematic analysis of qualitative interviews regarding ergonomic chairs.',
      },
    };

    const graph = buildConceptNetworkGraph(mockLibrary, 800, 600, 'en');

    expect(graph.nodes.length).toBe(3);
    // Nodes should have coordinates within canvas boundaries
    graph.nodes.forEach((n) => {
      expect(n.x).toBeGreaterThan(0);
      expect(n.x).toBeLessThan(800);
      expect(n.y).toBeGreaterThan(0);
      expect(n.y).toBeLessThan(600);
    });

    // P1 and P2 share neural network / deep learning concepts -> should produce an edge
    const edgeP1P2 = graph.edges.find(
      (e) => (e.source === 'p1' && e.target === 'p2') || (e.source === 'p2' && e.target === 'p1')
    );
    expect(edgeP1P2).toBeDefined();

    // Centrality check
    expect(graph.mostCentralNodeId).toBeDefined();
    expect(graph.density).toBeGreaterThan(0);
  });

  it('exportConceptMapToMermaid: generates valid Mermaid flowchart syntax', () => {
    const mockLibrary = {
      p1: { id: 'p1', title: 'Paper Alpha', authors: 'Doe, J.', year: 2023 },
      p2: { id: 'p2', title: 'Paper Beta', authors: 'Lee, K.', year: 2024 },
    };

    const graph = buildConceptNetworkGraph(mockLibrary, 500, 500, 'en');
    const mermaid = exportConceptMapToMermaid(graph);

    expect(mermaid).toContain('graph TD');
    expect(mermaid).toContain('N0["Doe (2023)"]');
    expect(mermaid).toContain('N1["Lee (2024)"]');
  });

  it('buildConceptNetworkGraph: handles empty library gracefully', () => {
    const graph = buildConceptNetworkGraph({});
    expect(graph.nodes.length).toBe(0);
    expect(graph.edges.length).toBe(0);
    expect(graph.density).toBe(0);

    const mermaid = exportConceptMapToMermaid(graph);
    expect(mermaid).toContain('No reference papers available');
  });
});
