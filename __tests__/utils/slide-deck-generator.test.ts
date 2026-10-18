import { describe, it, expect } from 'vitest';
import {
  cleanHtmlText,
  generateAcademicSlideDeck,
  exportToMarpMarkdown,
  exportToStandaloneHtml,
} from '@/lib/editor/slide-deck-generator';

describe('Phase 35: Conference & Thesis Defense Slide Deck Generator Unit Tests', () => {
  it('cleanHtmlText: strips html tags, cite elements, and decodes entities', () => {
    const raw = '<p>This is a <b>vital</b> finding <cite data-citation="true">[1]</cite> with &amp; entity.</p>';
    const cleaned = cleanHtmlText(raw);
    expect(cleaned).toBe('This is a vital finding [1] with & entity.');
  });

  it('generateAcademicSlideDeck: generates full 9-slide academic deck in English', () => {
    const mockBlocks = [
      {
        id: 'b1',
        type: 'header',
        data: { text: '1. Background and Problem Statement', level: 2 },
      },
      {
        id: 'b2',
        type: 'paragraph',
        data: {
          text: 'Recent climate anomalies present unprecedented challenges to renewable grids. Existing forecasting models fail to adapt quickly under erratic atmospheric conditions.',
        },
      },
      {
        id: 'b3',
        type: 'header',
        data: { text: '2. Research Methodology', level: 2 },
      },
      {
        id: 'b4',
        type: 'list',
        data: {
          style: 'unordered',
          items: [
            'Deep Bayesian neural network model with Monte Carlo dropout.',
            'Empirical telemetry data collected from 15 high-voltage substations.',
          ],
        },
      },
    ];

    const deck = generateAcademicSlideDeck(mockBlocks, 'Neural Grid Optimization', {
      authorName: 'Dr. Jane Doe',
      institutionName: 'Stanford AI Lab',
      language: 'en',
    });

    expect(deck.title).toBe('Neural Grid Optimization');
    expect(deck.presenter).toBe('Dr. Jane Doe');
    expect(deck.slides.length).toBeGreaterThanOrEqual(8);

    // Verify title slide
    const titleSlide = deck.slides[0];
    expect(titleSlide.category).toBe('title');
    expect(titleSlide.title).toBe('Neural Grid Optimization');
    expect(titleSlide.speakerNotes).toContain('Neural Grid Optimization');

    // Verify methodology slide extracted list items
    const methodSlide = deck.slides.find((s) => s.category === 'methodology');
    expect(methodSlide).toBeDefined();
    expect(methodSlide?.bulletPoints.some((b) => b.includes('Deep Bayesian'))).toBe(true);

    // Verify estimated minutes calculated
    expect(deck.estimatedMinutes).toBeGreaterThan(10);
  });

  it('generateAcademicSlideDeck: generates Indonesian localized slide deck', () => {
    const mockBlocks = [
      {
        id: 'b1',
        type: 'header',
        data: { text: 'Bab 1: Latar Belakang dan Masalah', level: 2 },
      },
      {
        id: 'b2',
        type: 'paragraph',
        data: {
          text: 'Penerapan teknologi blockchain pada sistem rantai pasok logistik maritim masih menghadapi hambatan skalabilitas. Regulasi antar-pelabuhan belum memiliki standar sinkronisasi data yang terpadu.',
        },
      },
    ];

    const deck = generateAcademicSlideDeck(mockBlocks, 'Optimasi Logistik Maritim', {
      authorName: 'Ahmad Fauzi',
      institutionName: 'Universitas Indonesia',
      language: 'id',
    });

    expect(deck.title).toBe('Optimasi Logistik Maritim');
    expect(deck.presenter).toBe('Ahmad Fauzi');

    // Verify Indonesian titles
    const problemSlide = deck.slides.find((s) => s.category === 'problem');
    expect(problemSlide?.title).toBe('Latar Belakang & Rumusan Masalah');

    const refsSlide = deck.slides.find((s) => s.category === 'references');
    expect(refsSlide?.title).toBe('Daftar Pustaka & Penutup');
  });

  it('exportToMarpMarkdown: creates valid Marp presentation markdown format', () => {
    const mockBlocks = [
      {
        id: 'b1',
        type: 'paragraph',
        data: { text: 'Simple manuscript content for quick marp deck.' },
      },
    ];

    const deck = generateAcademicSlideDeck(mockBlocks, 'Quantum Computing Survey', {
      language: 'en',
    });

    const markdown = exportToMarpMarkdown(deck);
    expect(markdown).toContain('marp: true');
    expect(markdown).toContain('theme: default');
    expect(markdown).toContain('# Quantum Computing Survey');
    expect(markdown).toContain('<!-- _class: lead -->');
    expect(markdown).toContain('Speaker Notes:');
    expect(markdown).toContain('---');
  });

  it('exportToStandaloneHtml: creates offline interactive presentation document', () => {
    const mockBlocks = [
      {
        id: 'b1',
        type: 'paragraph',
        data: { text: 'Autonomous Vehicle Safety protocols.' },
      },
    ];

    const deck = generateAcademicSlideDeck(mockBlocks, 'Autonomous Vehicles', {
      language: 'en',
    });

    const html = exportToStandaloneHtml(deck);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('ScholarFlow Defense Deck');
    expect(html).toContain('renderSlide');
    expect(html).toContain('toggleFullscreen');
    expect(html).toContain('Autonomous Vehicles');
  });
});
