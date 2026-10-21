import { describe, it, expect } from 'vitest';
import {
  calculateAcademicIntegrity,
  type AcademicIntegrityReport,
} from '@/lib/editor/academic-integrity';

describe('Phase 24: Academic Integrity & AI-Likeness Barometer Engine Unit Tests', () => {
  it('returns awaiting content state for empty or whitespace text', () => {
    const report = calculateAcademicIntegrity('');
    expect(report.overallScore).toBe(100);
    expect(report.riskLevel).toBe('low');
    expect(report.metrics.totalWords).toBe(0);
    expect(report.sentences).toEqual([]);
  });

  it('evaluates highly varied human-like writing as high originality (low risk)', () => {
    const humanSample = `
      Deep learning algorithms have transformed computational biology. 
      However, interpretability remains a stubborn challenge that researchers cannot afford to ignore in high-stakes clinical diagnostics. 
      Why does this matter? 
      When a neural network recommends a cardiac intervention, clinicians require mechanistic justifications, not black-box probabilities. 
      In this paper, we propose a novel gradient-weighted attribution framework. 
      Our experiments confirm improved diagnostic fidelity across 12 hospitals.
    `;

    const report = calculateAcademicIntegrity(humanSample);
    expect(report.overallScore).toBeGreaterThanOrEqual(70);
    expect(report.riskLevel).toBe('low');
    expect(report.metrics.burstinessContribution).toBeGreaterThan(60);
    expect(report.metrics.clichéCount).toBe(0);
  });

  it('detects monotonous sentence patterns and AI clichés as elevated risk', () => {
    // Rigidly monotonous 18-word sentences filled with AI buzzwords
    const roboticSample = `
      It is crucial to delve into the intricate tapestry of modern digital transformations in global education.
      Furthermore, this multifaceted paradigm shift plays a pivotal role in fostering comprehensive synergy across diverse academic institutions.
      Moreover, the paramount importance of this transformative landscape serves as a testament to navigating unprecedented technological complexities.
      Additionally, stakeholders must harness and leverage innovative mechanisms to spearhead meaningful change within this rapidly evolving realm.
    `;

    const report = calculateAcademicIntegrity(roboticSample);
    expect(report.overallScore).toBeLessThan(65);
    expect(report.riskLevel).not.toBe('low');
    expect(report.metrics.clichéCount).toBeGreaterThanOrEqual(5);
    expect(report.metrics.clichéDensity).toBeGreaterThan(2.0);
    expect(report.highRiskSentences.length).toBeGreaterThanOrEqual(2);
  });

  it('identifies flagged sentences and provides explanatory reasons', () => {
    const mixedSample = `
      Short opener. 
      This is a sentence. 
      This is a sentence.
      This is a sentence. 
      We must delve into the intricate tapestry of crucial synergies to foster comprehensive paradigms.
    `;

    const report = calculateAcademicIntegrity(mixedSample);
    const flagged = report.highRiskSentences;
    expect(flagged.length).toBeGreaterThan(0);
    const lastFlagged = flagged[flagged.length - 1];
    expect(lastFlagged.reasons.length).toBeGreaterThan(0);
  });

  it('generates actionable recommendations when metrics are suboptimal', () => {
    const monotonousNoCliche = `
      The algorithm calculates the data accurately.
      The model processes the inputs quickly.
      The system produces the results reliably.
      The software handles the requests efficiently.
    `;

    const report = calculateAcademicIntegrity(monotonousNoCliche);
    expect(report.recommendations.length).toBeGreaterThan(0);
  });

  it('calculates lexical diversity ratio correctly', () => {
    const repetitiveText = 'data data data data analysis analysis analysis results results results.';
    const report = calculateAcademicIntegrity(repetitiveText);
    expect(report.metrics.uniqueWordRatio).toBeLessThan(0.5);
  });

  it('excludes bibliography and reference sections from academic integrity analysis', () => {
    const textWithBibliography = `
      Artificial intelligence algorithms can identify biomarkers in genomic sequences with high precision.
      These computational models assist pathologists in discovering novel oncological targets.
      
      Daftar Pustaka
      [1] Adharma, B., Pratama, R., & Wibowo, S. (2024). Deep learning paradigms in molecular biology. Nature Biotech, 12(3), 45-56.
      [2] Doe, J., & Smith, A. (2023). Neural network interpretability in clinical workflows. Lancet Digital Health, 5(2), 112-120.
    `;

    const report = calculateAcademicIntegrity(textWithBibliography);
    // References must NOT be counted as sentences or words in the manuscript analysis
    expect(report.metrics.totalSentences).toBe(2);
    expect(report.sentences.every(s => !s.text.includes('Adharma') && !s.text.includes('Lancet'))).toBe(true);
  });
});
