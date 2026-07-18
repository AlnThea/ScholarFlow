// lib/editor/citation-export-word.ts
// Utilitas untuk mengekspor dokumen draf EditorJS menjadi berkas MS Word (.doc) dengan pemformatan akademis

interface EditorBlock {
  type: string;
  data: {
    text?: string;
    level?: number;
    items?: string[];
    style?: string;
    content?: string[][];
  };
}

/**
 * Mengonversi EditorJS JSON blocks & daftar pustaka menjadi string HTML yang siap dibuka di Microsoft Word
 */
export function generateWordHtml(
  title: string,
  blocks: EditorBlock[],
  bibliography: string[]
): string {
  // Styles spec khusus Microsoft Word (mso-styles) untuk kertas A4, margin 1 inci, dan font Times New Roman 12pt
  const htmlHeader = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <title>${title}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page {
          size: 8.5in 11.0in; /* Letter size */
          margin: 1.0in 1.0in 1.0in 1.0in; /* 1 inch margins */
          mso-header-margin: .5in;
          mso-footer-margin: .5in;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 2.0; /* Double spacing standard akademis */
          color: #000000;
        }
        h1, h2, h3, h4 {
          font-family: 'Times New Roman', Times, serif;
          font-weight: bold;
          line-height: 1.5;
          margin-top: 12pt;
          margin-bottom: 6pt;
        }
        h1 { font-size: 16pt; text-align: center; }
        h2 { font-size: 14pt; text-align: left; }
        h3 { font-size: 12pt; text-align: left; }
        p {
          margin-bottom: 12pt;
          text-align: justify;
          text-indent: 0.5in; /* Tab indent paragraf awal */
        }
        ul, ol {
          margin-bottom: 12pt;
          padding-left: 0.5in;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 18pt;
        }
        th, td {
          border: 1px solid #000000;
          padding: 6pt;
          font-size: 10pt;
          line-height: 1.15;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        .bibliography-title {
          text-align: center;
          font-size: 14pt;
          font-weight: bold;
          margin-top: 36pt;
          margin-bottom: 18pt;
          page-break-before: always; /* Mulai di halaman baru */
        }
        .bibliography-entry {
          padding-left: 0.5in;
          text-indent: -0.5in; /* Hanging indent 0.5 inci */
          margin-bottom: 12pt;
          text-align: justify;
          font-size: 11pt;
        }
      </style>
    </head>
    <body>
  `;

  const htmlFooter = `
    </body>
    </html>
  `;

  let bodyContent = `<h1>${title}</h1>`;

  // Iterasi block EditorJS dan ubah ke tag HTML
  blocks.forEach((block) => {
    switch (block.type) {
      case 'header': {
        const level = block.data.level || 2;
        bodyContent += `<h${level}>${block.data.text || ''}</h${level}>`;
        break;
      }
      case 'list': {
        const tag = block.data.style === 'ordered' ? 'ol' : 'ul';
        bodyContent += `<${tag}>`;
        if (block.data.items) {
          block.data.items.forEach((item) => {
            bodyContent += `<li>${item}</li>`;
          });
        }
        bodyContent += `</${tag}>`;
        break;
      }
      case 'table': {
        bodyContent += '<table>';
        if (block.data.content) {
          block.data.content.forEach((row, rowIndex) => {
            bodyContent += '<tr>';
            row.forEach((cell) => {
              if (rowIndex === 0) {
                bodyContent += `<th>${cell}</th>`;
              } else {
                bodyContent += `<td>${cell}</td>`;
              }
            });
            bodyContent += '</tr>';
          });
        }
        bodyContent += '</table>';
        break;
      }
      case 'paragraph':
      default: {
        // Hapus kode tag math/LaTeX jika ada untuk ekspor bersih, atau biarkan textnya
        bodyContent += `<p>${block.data.text || ''}</p>`;
        break;
      }
    }
  });

  // Tambahkan daftar pustaka di bagian akhir dokumen
  if (bibliography && bibliography.length > 0) {
    bodyContent += `<div class="bibliography-title">DAFTAR PUSTAKA</div>`;
    bibliography.forEach((entry) => {
      // Hilangkan tag HTML jika ada pada entri sitasi
      const cleanEntry = entry.replace(/<\/?[^>]+(>|$)/g, '');
      bodyContent += `<div class="bibliography-entry">${cleanEntry}</div>`;
    });
  }

  return `${htmlHeader}${bodyContent}${htmlFooter}`;
}

/**
 * Memicu unduhan file Word langsung di browser klien
 */
export function exportToWordFile(
  title: string,
  blocks: EditorBlock[],
  bibliography: string[]
) {
  const htmlContent = generateWordHtml(title, blocks, bibliography);
  
  // Gunakan Blob dengan mimetype application/msword untuk kompatibilitas Word (.doc)
  const blob = new Blob(['\ufeff' + htmlContent], {
    type: 'application/msword;charset=utf-8'
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  // Bersihkan judul dokumen untuk nama file
  const safeFilename = title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'jurnal_draf';
  link.download = `${safeFilename}.doc`;
  
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
