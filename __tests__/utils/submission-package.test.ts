import { describe, it, expect } from 'vitest';
import {
  extractSubmissionMetrics,
  generateSuggestedReviewers,
  synthesizeHighlights,
  buildCoverLetter,
  buildJournalSubmissionPackage,
  exportSubmissionPackageMarkdown,
} from '@/lib/editor/submission-package';

describe('Submission Package Builder & Cover Letter AI Engine', () => {
  const sampleBlocks = [
    {
      type: 'header',
      data: { text: 'Abstract', level: 2 },
    },
    {
      type: 'paragraph',
      data: { text: 'This study presents an empirical investigation of distributed consensus algorithms.' },
    },
    {
      type: 'header',
      data: { text: '1. Introduction', level: 1 },
    },
    {
      type: 'paragraph',
      data: { text: 'Academic research requires high fidelity and verifiable evidence in distributed systems.' },
    },
    {
      type: 'table',
      data: { content: [['Header 1', 'Header 2'], ['Val 1', 'Val 2']] },
    },
    {
      type: 'image',
      data: { file: { url: 'https://example.com/fig1.png' }, caption: 'System Architecture' },
    },
  ];

  const sampleBibliography = [
    {
      id: 'ref-1',
      title: 'Paxos Made Simple',
      authors: ['Leslie Lamport'],
      year: 2001,
      journal: 'ACM SIGACT News',
    },
    {
      id: 'ref-2',
      title: 'In Search of an Understandable Consensus Algorithm',
      authors: ['Diego Ongaro', 'John Ousterhout'],
      year: 2014,
      journal: 'USENIX ATC',
    },
  ];

  it('extracts submission metrics accurately from editor blocks', () => {
    const metrics = extractSubmissionMetrics(sampleBlocks, sampleBibliography);
    expect(metrics.totalWords).toBeGreaterThan(15);
    expect(metrics.abstractWords).toBeGreaterThan(5);
    expect(metrics.tableCount).toBe(1);
    expect(metrics.figureCount).toBe(1);
    expect(metrics.referenceCount).toBe(2);
  });

  it('generates suggested peer reviewers from cited bibliography while excluding the author', () => {
    const reviewers = generateSuggestedReviewers(sampleBibliography, 'Leslie Lamport');
    expect(reviewers.length).toBeGreaterThanOrEqual(3);

    // Ensure Diego Ongaro or John Ousterhout is picked
    const reviewerNames = reviewers.map((r) => r.name);
    const hasOngaro = reviewerNames.some((n) => n.includes('Ongaro') || n.includes('Ousterhout'));
    expect(hasOngaro).toBe(true);

    // Each reviewer should have valid email and rationale
    reviewers.forEach((r) => {
      expect(r.email).toContain('@');
      expect(r.reason.length).toBeGreaterThan(10);
    });
  });

  it('synthesizes concise research highlights under 85 characters each', () => {
    const highlightsEn = synthesizeHighlights(sampleBlocks, 'Distributed Consensus Framework', 'en');
    expect(highlightsEn.length).toBeGreaterThanOrEqual(3);
    highlightsEn.forEach((h) => {
      expect(h.length).toBeLessThanOrEqual(85);
    });

    const highlightsId = synthesizeHighlights(sampleBlocks, 'Kerangka Konsensus Terdistribusi', 'id');
    expect(highlightsId.length).toBeGreaterThanOrEqual(3);
    highlightsId.forEach((h) => {
      expect(h.length).toBeLessThanOrEqual(85);
    });
  });

  it('builds formal academic cover letters in both English and Indonesian', () => {
    const letterEn = buildCoverLetter({
      manuscriptTitle: 'Robust Consensus in Edge Networks',
      journalName: 'IEEE Transactions on Parallel and Distributed Systems',
      correspondingAuthorName: 'Dr. Jane Doe',
      correspondingAuthorEmail: 'jane.doe@university.edu',
      correspondingAuthorAffiliation: 'School of Computer Science, Global Tech University',
      coAuthors: ['Dr. Alan Smith'],
      noveltyStatement: 'We propose an asynchronous voting scheme that slashes network overhead by 42%.',
      language: 'en',
    });

    expect(letterEn).toContain('IEEE Transactions on Parallel and Distributed Systems');
    expect(letterEn).toContain('Robust Consensus in Edge Networks');
    expect(letterEn).toContain('Dr. Jane Doe');
    expect(letterEn).toContain('Dr. Alan Smith');
    expect(letterEn).toContain('Dear Editor-in-Chief');
    expect(letterEn).toContain('42%');

    const letterId = buildCoverLetter({
      manuscriptTitle: 'Konsensus Tangguh pada Jaringan Edge',
      journalName: 'Jurnal Teknologi Informasi dan Ilmu Komputer (JTIIK)',
      correspondingAuthorName: 'Budi Santoso, M.T.',
      correspondingAuthorEmail: 'budi@kampus.ac.id',
      correspondingAuthorAffiliation: 'Fakultas Ilmu Komputer, Universitas Terbuka',
      language: 'id',
    });

    expect(letterId).toContain('JTIIK');
    expect(letterId).toContain('Budi Santoso');
    expect(letterId).toContain('Dengan hormat');
    expect(letterId).toContain('Penulis Korespondensi');
  });

  it('builds and exports the complete journal submission package in Markdown', () => {
    const pkg = buildJournalSubmissionPackage({
      manuscriptTitle: 'Decentralized Fault Tolerance for Autonomous Swarms',
      journalName: 'Elsevier Robotics and Autonomous Systems',
      correspondingAuthorName: 'Prof. Alex Rivera',
      correspondingAuthorEmail: 'alex.rivera@robotics.mit.edu',
      correspondingAuthorAffiliation: 'MIT Robotics Laboratory',
      blocks: sampleBlocks,
      bibliographyEntries: sampleBibliography,
      language: 'en',
    });

    expect(pkg.manuscriptTitle).toBe('Decentralized Fault Tolerance for Autonomous Swarms');
    expect(pkg.metrics.totalWords).toBeGreaterThan(0);
    expect(pkg.highlights.length).toBeGreaterThanOrEqual(3);
    expect(pkg.suggestedReviewers.length).toBe(3);

    const mdEn = exportSubmissionPackageMarkdown(pkg, 'en');
    expect(mdEn).toContain('# JOURNAL SUBMISSION PACKAGE');
    expect(mdEn).toContain('## 1. COVER LETTER TO THE EDITOR-IN-CHIEF');
    expect(mdEn).toContain('## 2. RESEARCH HIGHLIGHTS');
    expect(mdEn).toContain('## 4. SUGGESTED PEER REVIEWERS');
    expect(mdEn).toContain('## 5. MANUSCRIPT INVENTORY & METRICS');
  });
});
