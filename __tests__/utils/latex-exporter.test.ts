import { describe, it, expect } from 'vitest';
import {
  escapeLatex,
  convertHtmlToLatex,
  convertBlocksToLatex,
  generateBibtexContent,
  generateFullLatexDocument,
  buildLatexZipPackage,
  JOURNAL_TEMPLATES,
  type LatexExportOptions
} from '@/lib/editor/latex-exporter';

describe('Academic LaTeX & Journal Package Exporter Engine (Phase 27)', () => {
  describe('escapeLatex', () => {
    it('escapes reserved LaTeX symbols correctly', () => {
      const raw = 'Growth & Profit at 50% with $100 #1';
      const escaped = escapeLatex(raw);
      expect(escaped).toContain('\\&');
      expect(escaped).toContain('\\%');
      expect(escaped).toContain('\\$');
      expect(escaped).toContain('\\#');
    });

    it('decodes HTML entities like &amp; so they escape as valid LaTeX \\& without &amp;', () => {
      const raw = 'Putri &amp; Kurniawati 2026';
      const escaped = escapeLatex(raw);
      expect(escaped).toBe('Putri \\& Kurniawati 2026');
      expect(escaped).not.toContain('&amp;');
    });

    it('handles empty or null text safely', () => {
      expect(escapeLatex('')).toBe('');
    });
  });

  describe('convertHtmlToLatex', () => {
    it('converts bold and italic markup into LaTeX text commands', () => {
      const html = 'This is <b>crucial</b> and <i>imperative</i> evidence.';
      const latex = convertHtmlToLatex(html);
      expect(latex).toContain('\\textbf{crucial}');
      expect(latex).toContain('\\textit{imperative}');
    });

    it('transforms in-text citation HTML tags into LaTeX \\cite{...}', () => {
      const html = 'As proven previously <cite data-citation="true" data-ref-id="vaswani_2017">Vaswani et al., 2017</cite>, transformers excel.';
      const latex = convertHtmlToLatex(html);
      expect(latex).toContain('\\cite{vaswani_2017}');
      expect(latex).not.toContain('<cite');
    });

    it('preserves inline math formulas', () => {
      const html = 'Given equation $E = mc^2$, energy is conserved.';
      const latex = convertHtmlToLatex(html);
      expect(latex).toContain('$E = mc^2$');
    });

    it('decodes &amp; in bibliography references so it renders as \\& instead of \\&amp;', () => {
      const html = '[Putri &amp; Kurniawati 2026] Putri, A. K., &amp; Kurniawati, D. (2026).';
      const latex = convertHtmlToLatex(html);
      expect(latex).toContain('Putri \\& Kurniawati 2026');
      expect(latex).not.toContain('&amp;');
    });
  });

  describe('convertBlocksToLatex', () => {
    it('converts header blocks to appropriate section depths', () => {
      const blocks = [
        { type: 'header', data: { text: 'Introduction', level: 1 } },
        { type: 'header', data: { text: 'Methodology Design', level: 2 } },
        { type: 'header', data: { text: 'Sampling Strategy', level: 3 } },
      ];
      const latex = convertBlocksToLatex(blocks);
      expect(latex).toContain('\\section{Introduction}');
      expect(latex).toContain('\\subsection{Methodology Design}');
      expect(latex).toContain('\\subsubsection{Sampling Strategy}');
    });

    it('converts math equation blocks into LaTeX equation environment', () => {
      const blocks = [
        { type: 'math', data: { formula: '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}' } },
      ];
      const latex = convertBlocksToLatex(blocks);
      expect(latex).toContain('\\begin{equation}');
      expect(latex).toContain('\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}');
      expect(latex).toContain('\\end{equation}');
    });

    it('converts list blocks into itemize or enumerate environments', () => {
      const blocks = [
        { type: 'list', data: { style: 'unordered', items: ['First finding', 'Second finding'] } },
        { type: 'list', data: { style: 'ordered', items: ['Step 1', 'Step 2'] } },
      ];
      const latex = convertBlocksToLatex(blocks);
      expect(latex).toContain('\\begin{itemize}');
      expect(latex).toContain('\\item First finding');
      expect(latex).toContain('\\end{itemize}');
      expect(latex).toContain('\\begin{enumerate}');
      expect(latex).toContain('\\item Step 1');
      expect(latex).toContain('\\end{enumerate}');
    });

    it('converts table blocks into tabular environments', () => {
      const blocks = [
        {
          type: 'table',
          data: {
            withHeadings: true,
            caption: 'Performance Benchmarks',
            content: [
              ['Model', 'Accuracy', 'F1-Score'],
              ['Baseline', '82.5%', '0.81'],
              ['Proposed', '94.2%', '0.93'],
            ],
          },
        },
      ];
      const latex = convertBlocksToLatex(blocks);
      expect(latex).toContain('\\begin{table}[htbp]');
      expect(latex).toContain('\\begin{tabular}');
      expect(latex).toContain('Model & Accuracy & F1-Score');
      expect(latex).toContain('\\caption{Performance Benchmarks}');
      expect(latex).toContain('\\end{table}');
    });
  });

  describe('generateFullLatexDocument & Journal Templates', () => {
    const baseOptions: LatexExportOptions = {
      title: 'Attention Mechanisms in Deep Neural Architectures',
      authorName: 'Dr. Jane Smith',
      authorAffiliation: 'MIT Computer Science Department',
      authorEmail: 'jsmith@mit.edu',
      abstractText: 'We introduce a novel self-attention transformer variant.',
      keywords: ['Deep Learning', 'Transformers', 'NLP'],
      template: 'ieee',
      blocks: [
        { type: 'header', data: { text: 'Introduction', level: 1 } },
        { type: 'paragraph', data: { text: 'Deep learning has transformed NLP.' } },
      ],
      citationLibrary: {
        vaswani2017: {
          reference_id: 'vaswani2017',
          citation_label: 'Vaswani et al., 2017',
          title: 'Attention is All You Need',
          authors: ['Ashish Vaswani', 'Noam Shazeer'],
          source: 'NeurIPS',
          year: 2017,
        },
      },
    };

    it('generates IEEE template with conference documentclass and IEEEtran bibliography', () => {
      const doc = generateFullLatexDocument({ ...baseOptions, template: 'ieee' });
      expect(doc).toContain('\\documentclass[conference]{IEEEtran}');
      expect(doc).toContain('\\IEEEauthorblockN{Dr. Jane Smith}');
      expect(doc).toContain('\\bibliographystyle{IEEEtran}');
      expect(doc).toContain('\\bibliography{references}');
    });

    it('generates Elsevier template with elsarticle documentclass and frontmatter', () => {
      const doc = generateFullLatexDocument({ ...baseOptions, template: 'elsevier' });
      expect(doc).toContain('\\documentclass[preprint,12pt]{elsarticle}');
      expect(doc).toContain('\\begin{frontmatter}');
      expect(doc).toContain('\\linenumbers');
      expect(doc).toContain('\\bibliographystyle{elsarticle-num}');
    });

    it('generates ACM template with acmart documentclass', () => {
      const doc = generateFullLatexDocument({ ...baseOptions, template: 'acm' });
      expect(doc).toContain('\\documentclass[sigconf]{acmart}');
      expect(doc).toContain('\\bibliographystyle{ACM-Reference-Format}');
    });

    it('generates arXiv / standard pre-print template with a4paper geometry', () => {
      const doc = generateFullLatexDocument({ ...baseOptions, template: 'arxiv' });
      expect(doc).toContain('\\documentclass[11pt,a4paper]{article}');
      expect(doc).toContain('\\bibliographystyle{plain}');
    });
  });

  describe('generateBibtexContent', () => {
    it('creates properly structured BibTeX article entries', () => {
      const library = {
        ref_1: {
          reference_id: 'devlin2018',
          title: 'BERT: Pre-training of Deep Bidirectional Transformers',
          authors: ['Jacob Devlin', 'Ming-Wei Chang'],
          source: 'NAACL',
          year: 2018,
          doi: '10.18653/v1/N19-1423',
        },
      };
      const bib = generateBibtexContent(library);
      expect(bib).toContain('@article{devlin2018,');
      expect(bib).toContain('author = {Jacob Devlin and Ming-Wei Chang}');
      expect(bib).toContain('title = {BERT: Pre-training of Deep Bidirectional Transformers}');
      expect(bib).toContain('year = {2018}');
      expect(bib).toContain('doi = {10.18653/v1/N19-1423}');
    });
  });

  describe('buildLatexZipPackage', () => {
    it('builds an Overleaf-ready ZIP blob containing main.tex, references.bib, and README.txt', async () => {
      const options: LatexExportOptions = {
        title: 'Quantum Computing Foundations',
        template: 'ieee',
        blocks: [{ type: 'paragraph', data: { text: 'Quantum circuits operate on qubits.' } }],
        citationLibrary: {},
      };

      const zipBlob = await buildLatexZipPackage(options);
      expect(zipBlob).toBeDefined();
      expect(zipBlob.size).toBeGreaterThan(100);
      expect(zipBlob.type).toBe('application/zip');
    });
  });

  describe('JOURNAL_TEMPLATES metadata', () => {
    it('provides metadata for all 4 supported journal formats', () => {
      expect(JOURNAL_TEMPLATES.ieee).toBeDefined();
      expect(JOURNAL_TEMPLATES.elsevier).toBeDefined();
      expect(JOURNAL_TEMPLATES.acm).toBeDefined();
      expect(JOURNAL_TEMPLATES.arxiv).toBeDefined();
    });
  });
});
