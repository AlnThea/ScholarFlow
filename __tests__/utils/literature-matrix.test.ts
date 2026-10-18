import { describe, it, expect } from 'vitest';
import {
  inferMatrixFieldsFromAbstract,
  extractLiteratureMatrix,
  exportMatrixToMarkdownTable,
  exportMatrixToCsv,
  exportMatrixToEditorJsTable,
  LiteratureMatrixRow,
} from '@/lib/editor/literature-matrix';

describe('Phase 36: Interactive Literature Matrix & Synthesis Grid Unit Tests', () => {
  it('inferMatrixFieldsFromAbstract: detects methodology and sample size', () => {
    const abstract = 'We conducted a quantitative survey with a sample of 350 university students to evaluate AI adoption.';
    const title = 'Generative AI Acceptance Factors';

    const inferred = inferMatrixFieldsFromAbstract(abstract, title, 'en');
    expect(inferred.methodology).toBe('Quantitative Survey');
    expect(inferred.sampleSize).toBe('N = 350');
    expect(inferred.tags).toContain('Quantitative');
  });

  it('inferMatrixFieldsFromAbstract: detects machine learning and limitations', () => {
    const abstract = 'A deep learning convolutional model was evaluated. However, limitations include lack of cross-dataset generalization.';
    const title = 'Deep Neural Segmentation';

    const inferred = inferMatrixFieldsFromAbstract(abstract, title, 'en');
    expect(inferred.methodology).toBe('Computational / Machine Learning');
    expect(inferred.tags).toContain('Machine Learning');
    expect(inferred.limitations.toLowerCase()).toContain('limitations include');
  });

  it('extractLiteratureMatrix: converts citationLibrary records into matrix rows', () => {
    const mockLibrary = {
      ref1: {
        id: 'ref1',
        title: 'Blockchain for Maritime Supply Chain',
        authors: 'Doe, J., & Smith, A.',
        year: 2024,
        journal: 'IEEE Transactions on Engineering',
        abstract: 'This paper proposes a systematic literature review following PRISMA guidelines.',
      },
      ref2: {
        id: 'ref2',
        title: 'Qualitative Assessment of Remote Work',
        authors: 'Pratama, B.',
        year: 2023,
        venue: 'Jurnal Manajemen',
        abstract: 'Wawancara mendalam dilakukan dengan n = 25 manajer.',
      },
    };

    const rows = extractLiteratureMatrix(mockLibrary, [], 'id');
    expect(rows.length).toBe(2);

    const row1 = rows.find((r) => r.referenceId === 'ref1');
    expect(row1).toBeDefined();
    expect(row1?.title).toBe('Blockchain for Maritime Supply Chain');
    expect(row1?.methodology).toBe('Systematic Literature Review (SLR)');

    const row2 = rows.find((r) => r.referenceId === 'ref2');
    expect(row2).toBeDefined();
    expect(row2?.sampleSize).toBe('N = 25');
  });

  it('extractLiteratureMatrix: preserves existing edited rows', () => {
    const mockLibrary = {
      ref1: {
        id: 'ref1',
        title: 'Original Title',
        authors: 'Smith, J.',
        year: 2022,
      },
    };

    const existingRows: LiteratureMatrixRow[] = [
      {
        id: 'custom-row-1',
        referenceId: 'ref1',
        citationKey: '(Smith, 2022)',
        authors: 'Smith, J.',
        year: 2022,
        title: 'Original Title',
        methodology: 'Custom User Edited Method',
        sampleSize: 'N = 1,000',
        keyFindings: 'Custom findings',
        limitations: 'Custom limitation',
        synthesisNotes: 'Highly vital for hypothesis 3',
        tags: ['Custom'],
      },
    ];

    const rows = extractLiteratureMatrix(mockLibrary, existingRows, 'en');
    expect(rows.length).toBe(1);
    expect(rows[0].methodology).toBe('Custom User Edited Method');
    expect(rows[0].synthesisNotes).toBe('Highly vital for hypothesis 3');
  });

  it('exportMatrixToMarkdownTable: formats valid Markdown table with pipe escaping', () => {
    const rows: LiteratureMatrixRow[] = [
      {
        id: 'row-1',
        referenceId: 'r1',
        citationKey: '(Doe, 2024)',
        authors: 'Doe, J.',
        year: 2024,
        title: 'Study on AI | LLMs',
        venue: 'Nature Machine Intelligence',
        methodology: 'Empirical',
        sampleSize: 'N = 100',
        keyFindings: 'Significant boost',
        limitations: 'Small sample',
        synthesisNotes: 'Core pillar',
        tags: [],
      },
    ];

    const md = exportMatrixToMarkdownTable(rows, 'en');
    expect(md).toContain('| No | Study / Citation |');
    expect(md).toContain('| (Doe, 2024) |');
    expect(md).toContain('Study on AI \\| LLMs');
  });

  it('exportMatrixToCsv: handles RFC 4180 quotes and commas correctly', () => {
    const rows: LiteratureMatrixRow[] = [
      {
        id: 'row-1',
        referenceId: 'r1',
        citationKey: '(Doe, 2024)',
        authors: 'Doe, J., & Smith, A.',
        year: 2024,
        title: 'AI, Ethics, and Society',
        venue: 'ACM FAccT',
        methodology: 'Qualitative',
        sampleSize: 'N = 50',
        keyFindings: 'Ethical concerns "high"',
        limitations: 'Narrow',
        synthesisNotes: 'Crucial',
        tags: [],
      },
    ];

    const csv = exportMatrixToCsv(rows, 'en');
    expect(csv).toContain('"Doe, J., & Smith, A."');
    expect(csv).toContain('"Ethical concerns ""high"""');
  });

  it('exportMatrixToEditorJsTable: creates valid EditorJS Table block', () => {
    const rows: LiteratureMatrixRow[] = [
      {
        id: 'row-1',
        referenceId: 'r1',
        citationKey: '(Tanaka, 2023)',
        authors: 'Tanaka, H.',
        year: 2023,
        title: 'Robotics',
        methodology: 'Experimental',
        sampleSize: 'N = 10',
        keyFindings: 'High precision',
        limitations: 'Hardware latency',
        synthesisNotes: 'Benchmark',
        tags: [],
      },
    ];

    const block = exportMatrixToEditorJsTable(rows, 'en');
    expect(block.type).toBe('table');
    expect(block.data.withHeadings).toBe(true);
    expect(block.data.content.length).toBe(2);
    expect(block.data.content[0]).toEqual(['Study', 'Methodology', 'Sample', 'Key Findings', 'Synthesis Notes']);
    expect(block.data.content[1][0]).toContain('(Tanaka, 2023)');
  });
});
