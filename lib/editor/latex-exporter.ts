// lib/editor/latex-exporter.ts
// Academic LaTeX & Journal Format Package Exporter (Phase 27)

import JSZip from 'jszip';

export type JournalTemplate = 'ieee' | 'elsevier' | 'acm' | 'arxiv';

export interface JournalTemplateMeta {
  id: JournalTemplate;
  name: string;
  organization: string;
  descriptionEn: string;
  descriptionId: string;
  docClass: string;
  bibStyle: string;
  badge: string;
  columnLayout: '2-column' | '1-column';
}

export const JOURNAL_TEMPLATES: Record<JournalTemplate, JournalTemplateMeta> = {
  ieee: {
    id: 'ieee',
    name: 'IEEE Conference / Transactions',
    organization: 'Institute of Electrical and Electronics Engineers',
    descriptionEn: 'Standard 2-column format for IEEE conferences, transactions, and computer science papers.',
    descriptionId: 'Format standar 2-kolom resmi untuk konferensi IEEE, jurnal keteknikan, dan ilmu komputer.',
    docClass: '\\documentclass[conference]{IEEEtran}',
    bibStyle: 'IEEEtran',
    badge: 'IEEE 2-Column',
    columnLayout: '2-column',
  },
  elsevier: {
    id: 'elsevier',
    name: 'Elsevier ScienceDirect',
    organization: 'Elsevier / ScienceDirect Journals',
    descriptionEn: 'Standard elsarticle template with line numbering enabled for rigorous double-blind peer review.',
    descriptionId: 'Template naskah resmi elsarticle dengan penomoran baris otomatis untuk proses peer review.',
    docClass: '\\documentclass[preprint,12pt]{elsarticle}',
    bibStyle: 'elsarticle-num',
    badge: 'Elsevier Peer-Review',
    columnLayout: '1-column',
  },
  acm: {
    id: 'acm',
    name: 'ACM Primary Article (SIGCONF)',
    organization: 'Association for Computing Machinery',
    descriptionEn: 'Official acmart two-column layout for ACM proceedings, conferences, and SIGCHI publications.',
    descriptionId: 'Tata letak 2-kolom resmi acmart untuk prosiding ACM, SIGCHI, dan publikasi sistem komputasi.',
    docClass: '\\documentclass[sigconf]{acmart}',
    bibStyle: 'ACM-Reference-Format',
    badge: 'ACM SIGCONF',
    columnLayout: '2-column',
  },
  arxiv: {
    id: 'arxiv',
    name: 'arXiv / Standard Pre-print',
    organization: 'arXiv & General Academic Publication',
    descriptionEn: 'Clean, elegant single-column pre-print article format with 1-inch margins and clear typography.',
    descriptionId: 'Format naskah pra-cetak (pre-print) 1-kolom yang bersih dan universal untuk arXiv atau repositori.',
    docClass: '\\documentclass[11pt,a4paper]{article}',
    bibStyle: 'plain',
    badge: 'arXiv Universal',
    columnLayout: '1-column',
  },
};

export interface LatexExportOptions {
  title: string;
  authorName?: string;
  authorAffiliation?: string;
  authorEmail?: string;
  abstractText?: string;
  keywords?: string[];
  template: JournalTemplate;
  blocks: any[];
  citationLibrary?: Record<string, any>;
  bibliographyEntries?: any[];
  language?: 'en' | 'id';
}

/**
 * Escapes characters that have special meaning in LaTeX
 */
export function escapeLatex(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([&%$#_{}])/g, '\\$1')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

/**
 * Converts inline HTML formatting (b, i, u, code, cite tags, math) to LaTeX
 */
export function convertHtmlToLatex(html: string): string {
  if (!html) return '';

  let output = html;

  // 1. Preserve math segments
  const mathSegments: string[] = [];
  output = output.replace(/\$\$([\s\S]*?)\$\$/g, (_match, formula) => {
    const idx = mathSegments.length;
    mathSegments.push(`\\[ ${formula.trim()} \\]`);
    return `@@MATHSEG${idx}@@`;
  });
  output = output.replace(/\$([^\$]+)\$/g, (_match, formula) => {
    const idx = mathSegments.length;
    mathSegments.push(`$${formula.trim()}$`);
    return `@@MATHSEG${idx}@@`;
  });

  // 2. Preserve in-text citation tags
  const citationSegments: string[] = [];
  output = output.replace(/<cite[^>]*data-ref-id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/cite>/gi, (_match, refId) => {
    const cleanKey = refId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const idx = citationSegments.length;
    citationSegments.push(`\\cite{${cleanKey}}`);
    return `@@CITESEG${idx}@@`;
  });

  // 3. Convert bold, italic, underline, code, hyperlinks
  output = output.replace(/<(?:b|strong)[^>]*>([\s\S]*?)<\/(?:b|strong)>/gi, (_match, content) => {
    return `\\textbf{${content}}`;
  });
  output = output.replace(/<(?:i|em)[^>]*>([\s\S]*?)<\/(?:i|em)>/gi, (_match, content) => {
    return `\\textit{${content}}`;
  });
  output = output.replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, (_match, content) => {
    return `\\underline{${content}}`;
  });
  output = output.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_match, content) => {
    return `\\texttt{${content}}`;
  });
  output = output.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_match, url, text) => {
    return `\\href{${url}}{${text}}`;
  });

  // 4. Strip remaining HTML tags
  output = output.replace(/<\/?[a-z][^>]*>/gi, '');

  // 5. Escape LaTeX characters outside preserved segments
  output = output
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_');

  // 6. Restore preserved citations and math
  citationSegments.forEach((segment, idx) => {
    output = output.replace(`@@CITESEG${idx}@@`, segment);
  });
  mathSegments.forEach((segment, idx) => {
    output = output.replace(`@@MATHSEG${idx}@@`, segment);
  });

  return output.trim();
}

/**
 * Converts EditorJS blocks into LaTeX body content
 */
export function convertBlocksToLatex(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return '';

  const latexParts: string[] = [];

  for (const block of blocks) {
    const type = block.type || '';
    const data = block.data || {};

    switch (type) {
      case 'header': {
        const level = data.level || 2;
        const text = convertHtmlToLatex(data.text || '');
        if (level === 1) {
          latexParts.push(`\\section{${text}}\n`);
        } else if (level === 2) {
          latexParts.push(`\\subsection{${text}}\n`);
        } else if (level >= 3) {
          latexParts.push(`\\subsubsection{${text}}\n`);
        }
        break;
      }

      case 'paragraph': {
        const text = convertHtmlToLatex(data.text || '');
        if (text) {
          latexParts.push(`${text}\n\n`);
        }
        break;
      }

      case 'math': {
        const formula = (data.formula || data.text || '').trim();
        if (formula) {
          latexParts.push(`\\begin{equation}\n  ${formula}\n\\end{equation}\n\n`);
        }
        break;
      }

      case 'list': {
        const items = data.items || [];
        const isOrdered = data.style === 'ordered';
        const env = isOrdered ? 'enumerate' : 'itemize';
        if (items.length > 0) {
          latexParts.push(`\\begin{${env}}\n`);
          for (const item of items) {
            const itemText = typeof item === 'string' ? item : item.content || '';
            latexParts.push(`  \\item ${convertHtmlToLatex(itemText)}\n`);
          }
          latexParts.push(`\\end{${env}}\n\n`);
        }
        break;
      }

      case 'table': {
        const content = data.content || [];
        if (content.length > 0) {
          const colCount = content[0]?.length || 1;
          const colFormat = Array(colCount).fill('l').join(' | ');
          latexParts.push(`\\begin{table}[htbp]\n\\centering\n\\begin{tabular}{| ${colFormat} |}\n\\hline\n`);
          content.forEach((row: string[], rIdx: number) => {
            const rowCells = row.map((cell) => convertHtmlToLatex(cell)).join(' & ');
            latexParts.push(`  ${rowCells} \\\\\n\\hline\n`);
            if (rIdx === 0 && data.withHeadings) {
              latexParts.push(`\\hline\n`);
            }
          });
          latexParts.push(`\\end{tabular}\n\\caption{${data.caption ? escapeLatex(data.caption) : 'Table of Results'}}\n\\end{table}\n\n`);
        }
        break;
      }

      case 'image': {
        const url = data.file?.url || data.url || 'figure.png';
        const caption = data.caption ? convertHtmlToLatex(data.caption) : 'Research Figure';
        latexParts.push(
          `\\begin{figure}[htbp]\n\\centering\n% \\includegraphics[width=0.85\\linewidth]{${url}}\n\\caption{${caption}}\n\\label{fig:diagram}\n\\end{figure}\n\n`
        );
        break;
      }

      case 'quote': {
        const text = convertHtmlToLatex(data.text || '');
        const caption = data.caption ? convertHtmlToLatex(data.caption) : '';
        latexParts.push(`\\begin{quote}\n${text}${caption ? `\n\\par\\raggedleft--- \\textit{${caption}}` : ''}\n\\end{quote}\n\n`);
        break;
      }

      case 'code': {
        const code = data.code || '';
        latexParts.push(`\\begin{verbatim}\n${code}\n\\end{verbatim}\n\n`);
        break;
      }

      case 'delimiter': {
        latexParts.push(`\\bigskip\\hrule\\bigskip\n\n`);
        break;
      }

      default:
        if (data.text) {
          latexParts.push(`${convertHtmlToLatex(data.text)}\n\n`);
        }
        break;
    }
  }

  return latexParts.join('');
}

/**
 * Builds clean BibTeX file content from cited references
 */
export function generateBibtexContent(citationLibrary: Record<string, any> = {}): string {
  const entries = Object.values(citationLibrary);
  if (entries.length === 0) {
    return `% References BibTeX database generated by ScholarFlow\n% Add your BibTeX citations here\n`;
  }

  return entries
    .map((candidate) => {
      const key = (candidate.reference_id || candidate.citation_label || 'ref')
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      const authorList = Array.isArray(candidate.authors)
        ? candidate.authors.join(' and ')
        : candidate.authors || 'Author, Unknown';
      const title = candidate.title || 'Untitled Publication';
      const journal = candidate.source || candidate.journal || 'Academic Journal';
      const year = candidate.year || new Date().getFullYear();
      const doi = candidate.doi ? `,\n  doi = {${candidate.doi}}` : '';
      const url = candidate.url ? `,\n  url = {${candidate.url}}` : '';

      return `@article{${key},\n  author = {${authorList}},\n  title = {${title}},\n  journal = {${journal}},\n  year = {${year}}${doi}${url}\n}`;
    })
    .join('\n\n');
}

/**
 * Compiles complete LaTeX document (.tex) with standard journal preamble
 */
export function generateFullLatexDocument(options: LatexExportOptions): string {
  const meta = JOURNAL_TEMPLATES[options.template] || JOURNAL_TEMPLATES.arxiv;
  const title = options.title || 'Academic Research Manuscript';
  const authorName = options.authorName || 'Author Name';
  const authorAffil = options.authorAffiliation || 'Department of Research, University of Science';
  const authorEmail = options.authorEmail || 'author@university.edu';
  const abstractText = options.abstractText || '';
  const keywords = options.keywords || ['Research', 'Methodology', 'ScholarFlow'];

  let preamble = '';
  let titleBlock = '';

  switch (options.template) {
    case 'ieee':
      preamble = `${meta.docClass}
\\IEEEoverridecommandlockouts
\\usepackage{cite}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{algorithmic}
\\usepackage{graphicx}
\\usepackage{textcomp}
\\usepackage{xcolor}
\\usepackage{hyperref}
\\def\\BibTeX{{\\rm B\\kern-.05em{\\sc i\\kern-.025em b}\\kern-.08em
    T\\kern-.1667em\\lower.7ex\\hbox{E}\\kern-.125emX}}`;

      titleBlock = `\\title{${escapeLatex(title)}}

\\author{\\IEEEauthorblockN{${escapeLatex(authorName)}}
\\IEEEauthorblockA{\\textit{${escapeLatex(authorAffil)}} \\\\
\\textit{Email: ${escapeLatex(authorEmail)}}}}

\\maketitle`;
      break;

    case 'elsevier':
      preamble = `${meta.docClass}
\\usepackage{amssymb}
\\usepackage{amsmath}
\\usepackage{lineno}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\journal{Journal of Academic Research}`;

      titleBlock = `\\begin{frontmatter}
\\title{${escapeLatex(title)}}

\\author{${escapeLatex(authorName)}}
\\address{${escapeLatex(authorAffil)}}
\\ead{${escapeLatex(authorEmail)}}`;
      break;

    case 'acm':
      preamble = `${meta.docClass}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\AtBeginDocument{%
  \\providecommand\\BibTeX{{%
    \\normalfont B\\kern-0.5em{\\scshape i\\kern-0.25em b}\\kern-0.8em\\TeX}}}
\\setcopyright{acmcopyright}`;

      titleBlock = `\\title{${escapeLatex(title)}}

\\author{${escapeLatex(authorName)}}
\\affiliation{%
  \\institution{${escapeLatex(authorAffil)}}
  \\country{Global}
}
\\email{${escapeLatex(authorEmail)}}`;
      break;

    case 'arxiv':
    default:
      preamble = `${meta.docClass}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath,amssymb}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage[margin=1in]{geometry}
\\usepackage{cite}`;

      titleBlock = `\\title{\\textbf{${escapeLatex(title)}}}
\\author{${escapeLatex(authorName)} \\\\ \\small ${escapeLatex(authorAffil)} \\\\ \\small \\texttt{${escapeLatex(authorEmail)}}}
\\date{\\today}
\\maketitle`;
      break;
  }

  // Abstract and Keywords block
  let abstractBlock = '';
  if (abstractText) {
    if (options.template === 'elsevier') {
      abstractBlock = `\\begin{abstract}\n${convertHtmlToLatex(abstractText)}\n\\end{abstract}\n\n\\begin{keyword}\n${keywords.join(' \\sep ')}\n\\end{keyword}\n\\end{frontmatter}\n\\linenumbers\n\n`;
    } else {
      abstractBlock = `\\begin{abstract}\n${convertHtmlToLatex(abstractText)}\n\\end{abstract}\n\n\\textbf{Keywords:} ${keywords.join(', ')}\n\n`;
    }
  } else if (options.template === 'elsevier') {
    abstractBlock = `\\end{frontmatter}\n\\linenumbers\n\n`;
  }

  // Document body from EditorJS blocks
  const bodyContent = convertBlocksToLatex(options.blocks);

  // Bibliography footer
  const bibFooter = `
\\bibliographystyle{${meta.bibStyle}}
\\bibliography{references}

\\end{document}`;

  return `${preamble}

\\begin{document}

${titleBlock}

${abstractBlock}
${bodyContent}
${bibFooter}
`;
}

/**
 * Generates an Overleaf-ready ZIP package containing main.tex, references.bib, and README.txt
 */
export async function buildLatexZipPackage(options: LatexExportOptions): Promise<Blob> {
  const zip = new JSZip();

  const texContent = generateFullLatexDocument(options);
  const bibContent = generateBibtexContent(options.citationLibrary || {});

  const isEn = options.language === 'en';
  const readmeContent = `========================================================================
 ScholarFlow LaTeX Manuscript Package (Overleaf Ready)
 Template: ${JOURNAL_TEMPLATES[options.template]?.name || 'Standard'}
 Exported on: ${new Date().toISOString()}
========================================================================

HOW TO COMPILE ON OVERLEAF:
1. Go to https://www.overleaf.com and log into your account.
2. Click "New Project" -> "Upload Project".
3. Upload this .zip file directly without extracting it.
4. Overleaf will automatically detect 'main.tex' and compile using pdfLaTeX or XeLaTeX.

PACKAGE CONTENTS:
- main.tex        : Primary LaTeX document with pre-configured journal preamble
- references.bib  : Synchronized BibTeX references cited in the manuscript
- README.txt      : Quick setup and compilation guide

SUPPORTED TEMPLATES:
- IEEE Conference/Transactions (ieeetran)
- Elsevier ScienceDirect (elsarticle)
- ACM SIGCONF Primary Article (acmart)
- arXiv / Standard Pre-print (article)

Generated with love by ScholarFlow Academic Writing Platform.
`;

  zip.file('main.tex', texContent);
  zip.file('references.bib', bibContent);
  zip.file('README.txt', readmeContent);

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
}

/**
 * Downloads the Overleaf ZIP package directly in the browser
 */
export async function downloadLatexZipPackage(options: LatexExportOptions): Promise<void> {
  const blob = await buildLatexZipPackage(options);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  const safeTitle = (options.title || 'manuscript')
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_');

  link.download = `${safeTitle}_${options.template}_package.zip`;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
