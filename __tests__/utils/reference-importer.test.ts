import { describe, it, expect } from 'vitest';
import {
  parseBibtexFile,
  parseRisFile,
  cleanBibtexValue,
  parseBibtexAuthors,
  normalizeDoi,
  generateCitationLabel,
  generateReferenceId,
  extractDoiFromText,
  parseReferenceFile,
} from '@/lib/editor/reference-importer';

describe('Phase 28: Reference Importer (.bib, .ris, and PDF metadata)', () => {
  describe('normalizeDoi', () => {
    it('normalizes various DOI URL formats and strips trailing punctuation', () => {
      expect(normalizeDoi('https://doi.org/10.1145/3295222.3295349')).toBe('10.1145/3295222.3295349');
      expect(normalizeDoi('http://dx.doi.org/10.1016/j.procs.2023.01.002.')).toBe('10.1016/j.procs.2023.01.002');
      expect(normalizeDoi('doi: 10.1038/s41586-020-2649-2;')).toBe('10.1038/s41586-020-2649-2');
      expect(normalizeDoi('')).toBeNull();
      expect(normalizeDoi(undefined)).toBeNull();
    });
  });

  describe('generateCitationLabel', () => {
    it('generates standard academic labels for single, dual, and multiple authors', () => {
      expect(generateCitationLabel(['Vaswani, Ashish'], 2017)).toBe('[Vaswani, 2017]');
      expect(generateCitationLabel(['Goodfellow, Ian', 'Bengio, Yoshua'], 2014)).toBe('[Goodfellow & Bengio, 2014]');
      expect(generateCitationLabel(['Devlin, Jacob', 'Chang, Ming-Wei', 'Lee, Kenton'], 2019)).toBe('[Devlin et al., 2019]');
      expect(generateCitationLabel([], 2020, 'mycite')).toBe('[mycite, 2020]');
    });
  });

  describe('cleanBibtexValue & parseBibtexAuthors', () => {
    it('strips braces, quotes, and unescapes LaTeX symbols', () => {
      expect(cleanBibtexValue('{Deep Residual Learning for Image Recognition}')).toBe('Deep Residual Learning for Image Recognition');
      expect(cleanBibtexValue('"Attention \\& Transformers: A Review"')).toBe('Attention & Transformers: A Review');
      expect(cleanBibtexValue('{Preserving {DNA} Sequences}')).toBe('Preserving DNA Sequences');
    });

    it('splits multiple authors properly on "and"', () => {
      const parsed = parseBibtexAuthors('Vaswani, Ashish and Shazeer, Noam and Parmar, Niki');
      expect(parsed).toEqual(['Vaswani, Ashish', 'Shazeer, Noam', 'Parmar, Niki']);
    });
  });

  describe('parseBibtexFile', () => {
    it('correctly parses standard @article BibTeX entry', () => {
      const bibtex = `
@article{vaswani2017attention,
  title = {Attention Is All You Need},
  author = {Vaswani, Ashish and Shazeer, Noam and Parmar, Niki and Uszkoreit, Jakob},
  journal = {Advances in Neural Information Processing Systems},
  volume = {30},
  year = {2017},
  doi = {10.5555/3295222.3295349},
  url = {https://arxiv.org/abs/1706.03762},
  abstract = {The dominant sequence transduction models are based on complex recurrent or convolutional neural networks.}
}
      `;

      const results = parseBibtexFile(bibtex);
      expect(results).toHaveLength(1);
      const entry = results[0];
      expect(entry.reference_id).toBe('vaswani2017attention');
      expect(entry.title).toBe('Attention Is All You Need');
      expect(entry.authors).toHaveLength(4);
      expect(entry.authors[0]).toBe('Vaswani, Ashish');
      expect(entry.year).toBe(2017);
      expect(entry.journal).toBe('Advances in Neural Information Processing Systems');
      expect(entry.doi).toBe('10.5555/3295222.3295349');
      expect(entry.citation_label).toBe('[Vaswani et al., 2017]');
      expect(entry.abstract).toContain('dominant sequence transduction models');
    });

    it('correctly parses multiple BibTeX entries with different types (@book, @inproceedings)', () => {
      const bibtex = `
@book{goodfellow2016deep,
  title={Deep Learning},
  author={Goodfellow, Ian and Bengio, Yoshua and Courville, Aaron},
  publisher={MIT Press},
  year={2016}
}

@inproceedings{he2016deep,
  author = "He, Kaiming and Zhang, Xiangyu and Ren, Shaoqing and Sun, Jian",
  title = "Deep Residual Learning for Image Recognition",
  booktitle = "CVPR",
  year = 2016,
  doi = "10.1109/CVPR.2016.90"
}
      `;

      const results = parseBibtexFile(bibtex);
      expect(results).toHaveLength(2);

      expect(results[0].title).toBe('Deep Learning');
      expect(results[0].year).toBe(2016);
      expect(results[0].source).toBe('MIT Press');

      expect(results[1].title).toBe('Deep Residual Learning for Image Recognition');
      expect(results[1].doi).toBe('10.1109/CVPR.2016.90');
      expect(results[1].citation_label).toBe('[He et al., 2016]');
    });

    it('ignores @comment or @string and handles empty input gracefully', () => {
      const bibtex = `
@comment{Some notes about references}
@string{IEEE = "Institute of Electrical and Electronics Engineers"}
      `;
      expect(parseBibtexFile(bibtex)).toEqual([]);
      expect(parseBibtexFile('')).toEqual([]);
    });
  });

  describe('parseRisFile', () => {
    it('correctly parses single and multi-entry RIS files exported from Mendeley / Zotero', () => {
      const risContent = `
TY  - JOUR
TI  - Scikit-learn: Machine Learning in Python
AU  - Pedregosa, Fabian
AU  - Varoquaux, Gael
AU  - Gramfort, Alexandre
AU  - Michel, Vincent
JO  - Journal of Machine Learning Research
PY  - 2011
VL  - 12
SP  - 2825
EP  - 2830
DO  - 10.5555/1953048.2078195
UR  - http://jmlr.org/papers/v12/pedregosa11a.html
AB  - Scikit-learn is a Python module integrating a wide range of state-of-the-art machine learning algorithms.
ER  - 

TY  - CONF
TI  - BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding
AU  - Devlin, Jacob
AU  - Chang, Ming-Wei
AU  - Lee, Kenton
AU  - Toutanova, Kristina
JO  - NAACL-HLT
PY  - 2019
DO  - 10.18653/v1/N19-1423
ER  - 
      `;

      const results = parseRisFile(risContent);
      expect(results).toHaveLength(2);

      const paper1 = results[0];
      expect(paper1.title).toBe('Scikit-learn: Machine Learning in Python');
      expect(paper1.authors).toHaveLength(4);
      expect(paper1.authors[0]).toBe('Pedregosa, Fabian');
      expect(paper1.year).toBe(2011);
      expect(paper1.journal).toBe('Journal of Machine Learning Research');
      expect(paper1.doi).toBe('10.5555/1953048.2078195');
      expect(paper1.abstract).toContain('Scikit-learn is a Python module');

      const paper2 = results[1];
      expect(paper2.title).toBe('BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding');
      expect(paper2.authors[0]).toBe('Devlin, Jacob');
      expect(paper2.year).toBe(2019);
      expect(paper2.citation_label).toBe('[Devlin et al., 2019]');
    });

    it('returns empty array when content has no valid records', () => {
      expect(parseRisFile('')).toEqual([]);
      expect(parseRisFile('Random string without tags')).toEqual([]);
    });
  });

  describe('extractDoiFromText', () => {
    it('extracts DOI pattern from plain text or raw stream', () => {
      const text = 'Published in Nature 2021. Available at https://doi.org/10.1038/s41586-021-03819-2. All rights reserved.';
      expect(extractDoiFromText(text)).toBe('10.1038/s41586-021-03819-2');
    });

    it('returns null if no DOI is found', () => {
      expect(extractDoiFromText('No DOI present in this manuscript text.')).toBeNull();
    });
  });

  describe('parseReferenceFile router', () => {
    it('routes .bib file through BibTeX parser', async () => {
      const bibFile = new File([`
@article{test2024,
  title={Advanced Agentic Coding},
  author={Ernst, Alexander},
  year={2024}
}
      `], 'references.bib', { type: 'text/plain' });

      const results = await parseReferenceFile(bibFile);
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Advanced Agentic Coding');
      expect(results[0].year).toBe(2024);
    });

    it('routes .ris file through RIS parser', async () => {
      const risFile = new File([`
TY  - JOUR
TI  - Quantum Computing Advancements
AU  - Preskill, John
PY  - 2022
ER  - 
      `], 'citations.ris', { type: 'text/plain' });

      const results = await parseReferenceFile(risFile);
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Quantum Computing Advancements');
      expect(results[0].year).toBe(2022);
    });
  });
});
