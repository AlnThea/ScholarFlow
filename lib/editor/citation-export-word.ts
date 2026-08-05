// lib/editor/citation-export-word.ts
// Utilitas untuk mengekspor dokumen draf EditorJS menjadi berkas MS Word (.doc) dengan pemformatan akademis

interface EditorBlock {
  id?: string;
  type: string;
  data: {
    text?: string;
    level?: number;
    items?: string[];
    style?: string;
    content?: string[][];
    url?: string;
    file?: {
      url?: string;
    };
    caption?: string;
    formula?: string;
    code?: string;
  };
}

/**
 * Helper to process HTML and replace inline math spans with standard text formatting
 */
function processTextHtml(html: string): string {
  if (!html) return '';
  if (typeof document === 'undefined') return html;
  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const mathSpans = tempDiv.querySelectorAll('.sf-inline-math');
    mathSpans.forEach((span) => {
      const formula = span.getAttribute('data-formula') || '';
      const encodedFormula = encodeURIComponent(formula);
      const url = `https://latex.codecogs.com/png.image?\\dpi{110}\\bg{white}${encodedFormula}`;
      
      const imgNode = document.createElement('img');
      imgNode.setAttribute('src', url);
      imgNode.setAttribute('alt', formula);
      imgNode.setAttribute('style', 'vertical-align: middle; margin: 0 2px;');
      imgNode.setAttribute('class', 'inline-math-img');
      
      span.parentNode?.replaceChild(imgNode, span);
    });
    
    const markElements = tempDiv.querySelectorAll('mark');
    markElements.forEach((mark) => {
      let bgColor = '#fef08a'; // default yellow
      const className = mark.className || '';
      if (className.includes('bg-green-200')) {
        bgColor = '#bbf7d0';
      } else if (className.includes('bg-sky-200')) {
        bgColor = '#bae6fd';
      } else if (className.includes('bg-pink-200')) {
        bgColor = '#fbcfe8';
      } else if (className.includes('bg-purple-200')) {
        bgColor = '#e9d5ff';
      }
      
      const spanEl = document.createElement('span');
      spanEl.setAttribute('style', `background-color: ${bgColor};`);
      
      // Transfer children
      while (mark.firstChild) {
        spanEl.appendChild(mark.firstChild);
      }
      
      mark.parentNode?.replaceChild(spanEl, mark);
    });

    return tempDiv.innerHTML;
  } catch (e) {
    return html;
  }
}

/**
 * Extracts image dimensions (width/height) from a base64 string
 * by parsing binary headers of PNG, JPEG, and GIF files.
 */
function getImageDimensions(base64Data: string, mimeType: string): { width: number; height: number } | null {
  try {
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    if (mimeType === 'image/png') {
      // PNG dimensions are at offset 16 (width) and 20 (height) as 32-bit big-endian integers
      if (len >= 24) {
        const width = (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19];
        const height = (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];
        return { width, height };
      }
    } else if (mimeType === 'image/jpeg') {
      // JPEG SOI marker FF D8 check
      if (len >= 4 && bytes[0] === 0xFF && bytes[1] === 0xD8) {
        let offset = 2;
        while (offset < len) {
          if (offset + 3 >= len) break;
          if (bytes[offset] !== 0xFF) break;
          
          const marker = bytes[offset + 1];
          if (marker === 0xD9 || marker === 0xDA) break; // EOI or SOS
          
          const segmentLength = (bytes[offset + 2] << 8) | bytes[offset + 3];
          
          // SOF0 (0xC0) to SOF3 (0xC3), SOF5 (0xC5) to SOF7 (0xC7), SOF9 (0xC9) to SOF11 (0xCB), SOF13 (0xD5) to SOF15 (0xCF)
          const isSOF = (marker >= 0xC0 && marker <= 0xC3) || 
                        (marker >= 0xC5 && marker <= 0xC7) || 
                        (marker >= 0xC9 && marker <= 0xCB) || 
                        (marker >= 0xCD && marker <= 0xCF);
                        
          if (isSOF) {
            if (offset + 8 < len) {
              const height = (bytes[offset + 5] << 8) | bytes[offset + 6];
              const width = (bytes[offset + 7] << 8) | bytes[offset + 8];
              return { width, height };
            }
            break;
          }
          offset += 2 + segmentLength;
        }
      }
    } else if (mimeType === 'image/gif') {
      // GIF dimensions are at offset 6 (width) and 8 (height) as 16-bit little-endian integers
      if (len >= 10) {
        const width = bytes[6] | (bytes[7] << 8);
        const height = bytes[8] | (bytes[9] << 8);
        return { width, height };
      }
    }
    return null;
  } catch (e) {
    console.error('Failed to parse image dimensions from base64:', e);
    return null;
  }
}

/**
 * Mengonversi EditorJS JSON blocks & daftar pustaka menjadi string HTML yang siap dibuka di Microsoft Word
 */
export function generateWordHtml(
  title: string,
  blocks: EditorBlock[],
  bibliography: string[],
  language: 'en' | 'id' = 'en',
  isPro: boolean = true
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
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
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
        cite {
          font-style: normal;
          color: #000000;
          text-decoration: none;
        }
        .document-image-container {
          text-align: center;
          margin-top: 12pt;
          margin-bottom: 12pt;
          page-break-inside: avoid;
        }
        .document-image {
          max-width: 100%;
          height: auto;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
        .image-caption {
          font-size: 10pt;
          font-style: italic;
          text-align: center;
          margin-top: 6pt;
          line-height: 1.15;
        }
        .math-block {
          text-align: center;
          font-family: 'Courier New', Courier, monospace;
          margin-top: 12pt;
          margin-bottom: 12pt;
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

  const ALIGNMENT_KEY = 'scholarflow.editorjs.alignments.v1';
  let alignments: Record<string, string> = {};
  if (typeof window !== 'undefined') {
    try {
      alignments = JSON.parse(localStorage.getItem(ALIGNMENT_KEY) || '{}');
    } catch (e) {
      console.error('Failed to parse alignments from localStorage:', e);
    }
  }

  let bodyContent = `<h1>${title}</h1>`;

  // Filter out editor-inserted bibliography blocks to prevent duplicates
  const cleanedBlocks: EditorBlock[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    
    // Strip HTML tags to check header text content cleanly (case-insensitive)
    const cleanText = (block.data?.text || '').replace(/<[^>]*>/g, '').toLowerCase().trim();
    const isBibHeader = block.type === 'header' && cleanText.length < 50 && (
      cleanText.includes('daftar pustaka') || 
      cleanText.includes('references')
    );
    
    if (isBibHeader) {
      if (!isPro) {
        // Discard references section entirely for free plan
        break;
      }
      i++; // Skip the next block (which is the bibliography content block)
      continue;
    }
    
    // Also explicitly skip any paragraphs containing bibliography classes
    const textStr = block.data?.text || '';
    if (block.type === 'paragraph' && (
      textStr.includes('sf-bibliography-blur') ||
      textStr.includes('sf-premium-banner-container')
    )) {
      continue;
    }
    
    cleanedBlocks.push(block);
  }

  // Iterasi block EditorJS dan ubah ke tag HTML
  cleanedBlocks.forEach((block) => {
    switch (block.type) {
      case 'header': {
        const level = block.data.level || 2;
        let alignStyle = '';
        if (block.id && alignments[block.id]) {
          alignStyle = ` style="text-align: ${alignments[block.id]};"`;
        }
        bodyContent += `<h${level}${alignStyle}>${processTextHtml(block.data.text || '')}</h${level}>`;
        break;
      }
      case 'list': {
        const tag = block.data.style === 'ordered' ? 'ol' : 'ul';
        bodyContent += `<${tag}>`;
        if (block.data.items) {
          block.data.items.forEach((item) => {
            bodyContent += `<li>${processTextHtml(item)}</li>`;
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
                bodyContent += `<th>${processTextHtml(cell)}</th>`;
              } else {
                bodyContent += `<td>${processTextHtml(cell)}</td>`;
              }
            });
            bodyContent += '</tr>';
          });
        }
        bodyContent += '</table>';
        break;
      }
      case 'image': {
        const url = block.data.file?.url || block.data.url || '';
        const caption = block.data.caption || '';
        if (url) {
          let heightAttr = '';
          if (url.startsWith('data:')) {
            const match = url.match(/^data:([^;]+);base64,(.+)$/);
            if (match) {
              const mimeType = match[1];
              const base64Data = match[2];
              const dims = getImageDimensions(base64Data, mimeType);
              if (dims && dims.width > 0) {
                const calculatedHeight = Math.round(576 * (dims.height / dims.width));
                heightAttr = `height="${calculatedHeight}"`;
              }
            }
          }
          bodyContent += `
            <div class="document-image-container">
              <img class="document-image" src="${url}" alt="${caption}" width="576" ${heightAttr} style="max-width: 100%; height: auto;" />
              ${caption ? `<div class="image-caption">${caption}</div>` : ''}
            </div>
          `;
        }
        break;
      }
      case 'code': {
        const codeText = block.data.code || '';
        if (codeText) {
          const escapedCode = codeText
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          bodyContent += `
            <pre style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-left: 4px solid #6c757d; padding: 10px; font-family: 'Courier New', Courier, monospace; font-size: 10pt; line-height: 1.2; white-space: pre-wrap; margin-top: 12pt; margin-bottom: 12pt;">${escapedCode}</pre>
          `;
        }
        break;
      }
      case 'math': {
        const formula = block.data.formula || '';
        if (formula) {
          const encodedFormula = encodeURIComponent(formula);
          const url = `https://latex.codecogs.com/png.image?\\dpi{150}\\bg{white}${encodedFormula}`;
          bodyContent += `
            <div class="math-block" style="text-align: center; margin: 12pt 0;">
              <img src="${url}" alt="${formula}" />
            </div>
          `;
        }
        break;
      }
      case 'paragraph':
      default: {
        let alignStyle = '';
        if (block.id && alignments[block.id]) {
          alignStyle = ` style="text-align: ${alignments[block.id]};"`;
        }
        bodyContent += `<p${alignStyle}>${processTextHtml(block.data.text || '')}</p>`;
        break;
      }
    }
  });

  // Tambahkan daftar pustaka di bagian akhir dokumen
  if (bibliography && bibliography.length > 0) {
    const bibTitle = language === 'en' ? 'REFERENCES' : 'DAFTAR PUSTAKA';
    bodyContent += `<div class="bibliography-title">${bibTitle}</div>`;
    bibliography.forEach((entry) => {
      // Hilangkan tag HTML selain formatting italic if ada
      const cleanEntry = entry.replace(/<\/?(?!i\b)[^>]+(>|$)/g, '');
      bodyContent += `<div class="bibliography-entry">${cleanEntry}</div>`;
    });
  }

  return `${htmlHeader}${bodyContent}${htmlFooter}`;
}

/**
 * Helper to fetch a URL (or parse base64) and return its MIME type and base64 string
 */
async function getBase64FromUrl(url: string): Promise<{ mimeType: string; base64Data: string } | null> {
  if (!url) return null;
  
  // Jika URL berupa base64 Data URL
  if (url.startsWith('data:')) {
    const match = url.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      return {
        mimeType: match[1],
        base64Data: match[2]
      };
    }
    return null;
  }

  // Jika URL berupa blob URL atau URL relatif/eksternal, unduh data gambarnya
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const match = result.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          resolve({
            mimeType: match[1],
            base64Data: match[2]
          });
        } else {
          resolve(null);
        }
      };
      reader.onerror = () => {
        resolve(null);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to convert image URL to base64 for Word export:', url, error);
    return null;
  }
}

/**
 * Mengonversi EditorJS JSON blocks & daftar pustaka menjadi format MHTML (multipart/related)
 * untuk penyematan gambar base64 yang didukung penuh oleh Microsoft Word secara offline
 */
export async function generateWordMhtml(
  title: string,
  blocks: EditorBlock[],
  bibliography: string[],
  language: 'en' | 'id' = 'en',
  isPro: boolean = true
): Promise<string> {
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
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
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
        cite {
          font-style: normal;
          color: #000000;
          text-decoration: none;
        }
        .document-image-container {
          text-align: center;
          margin-top: 12pt;
          margin-bottom: 12pt;
          page-break-inside: avoid;
        }
        .document-image {
          max-width: 100%;
          height: auto;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
        .image-caption {
          font-size: 10pt;
          font-style: italic;
          text-align: center;
          margin-top: 6pt;
          line-height: 1.15;
        }
        .math-block {
          text-align: center;
          font-family: 'Courier New', Courier, monospace;
          margin-top: 12pt;
          margin-bottom: 12pt;
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

  const ALIGNMENT_KEY = 'scholarflow.editorjs.alignments.v1';
  let alignments: Record<string, string> = {};
  if (typeof window !== 'undefined') {
    try {
      alignments = JSON.parse(localStorage.getItem(ALIGNMENT_KEY) || '{}');
    } catch (e) {
      console.error('Failed to parse alignments from localStorage:', e);
    }
  }

  let bodyContent = `<h1>${title}</h1>`;
  
  const attachedImages: Array<{
    location: string;
    mimeType: string;
    base64Data: string;
  }> = [];

  let imageCounter = 0;

  // Helper to process inline HTML and embed any inline math formulas as local images
  const processTextHtmlMhtml = async (html: string): Promise<string> => {
    if (!html) return '';
    if (typeof document === 'undefined') return html;
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      const mathSpans = tempDiv.querySelectorAll('.sf-inline-math');
      for (const span of Array.from(mathSpans)) {
        const formula = span.getAttribute('data-formula') || '';
        const encodedFormula = encodeURIComponent(formula);
        const url = `https://latex.codecogs.com/png.image?\\dpi{110}\\bg{white}${encodedFormula}`;
        
        const imgData = await getBase64FromUrl(url);
        if (imgData) {
          const ext = 'png';
          const location = `file:///C:/inline_math_${imageCounter}.${ext}`;
          attachedImages.push({
            location,
            mimeType: imgData.mimeType,
            base64Data: imgData.base64Data
          });
          imageCounter++;
          
          const imgNode = document.createElement('img');
          imgNode.setAttribute('src', location);
          imgNode.setAttribute('alt', formula);
          imgNode.setAttribute('style', 'vertical-align: middle; margin: 0 2px;');
          imgNode.setAttribute('class', 'inline-math-img');
          
          span.parentNode?.replaceChild(imgNode, span);
        } else {
          // Fallback to online url if fetching fails
          const imgNode = document.createElement('img');
          imgNode.setAttribute('src', url);
          imgNode.setAttribute('alt', formula);
          imgNode.setAttribute('style', 'vertical-align: middle; margin: 0 2px;');
          imgNode.setAttribute('class', 'inline-math-img');
          span.parentNode?.replaceChild(imgNode, span);
        }
      }
      const markElements = tempDiv.querySelectorAll('mark');
      for (const mark of Array.from(markElements)) {
        let bgColor = '#fef08a'; // default yellow
        const className = mark.className || '';
        if (className.includes('bg-green-200')) {
          bgColor = '#bbf7d0';
        } else if (className.includes('bg-sky-200')) {
          bgColor = '#bae6fd';
        } else if (className.includes('bg-pink-200')) {
          bgColor = '#fbcfe8';
        } else if (className.includes('bg-purple-200')) {
          bgColor = '#e9d5ff';
        }
        
        const spanEl = document.createElement('span');
        spanEl.setAttribute('style', `background-color: ${bgColor};`);
        
        // Transfer children
        while (mark.firstChild) {
          spanEl.appendChild(mark.firstChild);
        }
        
        mark.parentNode?.replaceChild(spanEl, mark);
      }

      return tempDiv.innerHTML;
    } catch (e) {
      return html;
    }
  };

  // Filter out editor-inserted bibliography blocks to prevent duplicates
  const cleanedBlocks: EditorBlock[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    
    // Strip HTML tags to check header text content cleanly (case-insensitive)
    const cleanText = (block.data?.text || '').replace(/<[^>]*>/g, '').toLowerCase().trim();
    const isBibHeader = block.type === 'header' && cleanText.length < 50 && (
      cleanText.includes('daftar pustaka') || 
      cleanText.includes('references')
    );
    
    if (isBibHeader) {
      if (!isPro) {
        // Discard references section entirely for free plan
        break;
      }
      i++; // Skip the next block (which is the bibliography content block)
      continue;
    }
    
    // Also explicitly skip any paragraphs containing bibliography classes
    const textStr = block.data?.text || '';
    if (block.type === 'paragraph' && (
      textStr.includes('sf-bibliography-blur') ||
      textStr.includes('sf-premium-banner-container')
    )) {
      continue;
    }
    
    cleanedBlocks.push(block);
  }

  // Memproses blocks secara sekuensial agar konversi gambar asinkron berjalan lancar
  for (const block of cleanedBlocks) {
    switch (block.type) {
      case 'header': {
        const level = block.data.level || 2;
        let alignStyle = '';
        if (block.id && alignments[block.id]) {
          alignStyle = ` style="text-align: ${alignments[block.id]};"`;
        }
        bodyContent += `<h${level}${alignStyle}>${await processTextHtmlMhtml(block.data.text || '')}</h${level}>`;
        break;
      }
      case 'list': {
        const tag = block.data.style === 'ordered' ? 'ol' : 'ul';
        bodyContent += `<${tag}>`;
        if (block.data.items) {
          for (const item of block.data.items) {
            bodyContent += `<li>${await processTextHtmlMhtml(item)}</li>`;
          }
        }
        bodyContent += `</${tag}>`;
        break;
      }
      case 'table': {
        bodyContent += '<table>';
        if (block.data.content) {
          for (let rIndex = 0; rIndex < block.data.content.length; rIndex++) {
            const row = block.data.content[rIndex];
            bodyContent += '<tr>';
            for (const cell of row) {
              const cleanCell = await processTextHtmlMhtml(cell);
              if (rIndex === 0) {
                bodyContent += `<th>${cleanCell}</th>`;
              } else {
                bodyContent += `<td>${cleanCell}</td>`;
              }
            }
            bodyContent += '</tr>';
          }
        }
        bodyContent += '</table>';
        break;
      }
      case 'image': {
        const url = block.data.file?.url || block.data.url || '';
        const caption = block.data.caption || '';
        if (url) {
          const imgData = await getBase64FromUrl(url);
          if (imgData) {
            const ext = imgData.mimeType.split('/')[1] || 'png';
            const location = `file:///C:/image_${imageCounter}.${ext}`;
            attachedImages.push({
              location,
              mimeType: imgData.mimeType,
              base64Data: imgData.base64Data
            });
            imageCounter++;

            let heightAttr = '';
            const dims = getImageDimensions(imgData.base64Data, imgData.mimeType);
            if (dims && dims.width > 0) {
              const calculatedHeight = Math.round(576 * (dims.height / dims.width));
              heightAttr = `height="${calculatedHeight}"`;
            }

            bodyContent += `
              <div class="document-image-container">
                <img class="document-image" src="${location}" alt="${caption}" width="576" ${heightAttr} style="max-width: 100%; height: auto;" />
                ${caption ? `<div class="image-caption">${caption}</div>` : ''}
              </div>
            `;
          } else {
            // Fallback ke url asli jika gagal konversi
            let heightAttr = '';
            if (url.startsWith('data:')) {
              const match = url.match(/^data:([^;]+);base64,(.+)$/);
              if (match) {
                const mimeType = match[1];
                const base64Data = match[2];
                const dims = getImageDimensions(base64Data, mimeType);
                if (dims && dims.width > 0) {
                  const calculatedHeight = Math.round(576 * (dims.height / dims.width));
                  heightAttr = `height="${calculatedHeight}"`;
                }
              }
            }
            bodyContent += `
              <div class="document-image-container">
                <img class="document-image" src="${url}" alt="${caption}" width="576" ${heightAttr} style="max-width: 100%; height: auto;" />
                ${caption ? `<div class="image-caption">${caption}</div>` : ''}
              </div>
            `;
          }
        }
        break;
      }
      case 'code': {
        const codeText = block.data.code || '';
        if (codeText) {
          const escapedCode = codeText
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          bodyContent += `
            <pre style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-left: 4px solid #6c757d; padding: 10px; font-family: 'Courier New', Courier, monospace; font-size: 10pt; line-height: 1.2; white-space: pre-wrap; margin-top: 12pt; margin-bottom: 12pt;">${escapedCode}</pre>
          `;
        }
        break;
      }
      case 'math': {
        const formula = block.data.formula || '';
        if (formula) {
          const encodedFormula = encodeURIComponent(formula);
          const url = `https://latex.codecogs.com/png.image?\\dpi{150}\\bg{white}${encodedFormula}`;
          
          const imgData = await getBase64FromUrl(url);
          if (imgData) {
            const ext = 'png';
            const location = `file:///C:/math_${imageCounter}.${ext}`;
            attachedImages.push({
              location,
              mimeType: imgData.mimeType,
              base64Data: imgData.base64Data
            });
            imageCounter++;

            let heightAttr = '';
            const dims = getImageDimensions(imgData.base64Data, imgData.mimeType);
            if (dims && dims.width > 0) {
              const width = Math.min(dims.width, 576);
              const height = Math.round(width * (dims.height / dims.width));
              bodyContent += `
                <div class="math-block" style="text-align: center; margin: 12pt 0;">
                  <img src="${location}" width="${width}" height="${height}" alt="${formula}" />
                </div>
              `;
            } else {
              bodyContent += `
                <div class="math-block" style="text-align: center; margin: 12pt 0;">
                  <img src="${location}" alt="${formula}" />
                </div>
              `;
            }
          } else {
            // Fallback ke url asli jika gagal konversi
            bodyContent += `
              <div class="math-block" style="text-align: center; margin: 12pt 0;">
                <img src="${url}" alt="${formula}" />
              </div>
            `;
          }
        }
        break;
      }
      case 'paragraph':
      default: {
        let alignStyle = '';
        if (block.id && alignments[block.id]) {
          alignStyle = ` style="text-align: ${alignments[block.id]};"`;
        }
        bodyContent += `<p${alignStyle}>${await processTextHtmlMhtml(block.data.text || '')}</p>`;
        break;
      }
    }
  }

  // Tambahkan daftar pustaka di bagian akhir dokumen
  if (bibliography && bibliography.length > 0) {
    const bibTitle = language === 'en' ? 'REFERENCES' : 'DAFTAR PUSTAKA';
    bodyContent += `<div class="bibliography-title">${bibTitle}</div>`;
    for (const entry of bibliography) {
      const cleanEntry = entry.replace(/<\/?(?!i\b)[^>]+(>|$)/g, '');
      const formattedEntry = await processTextHtmlMhtml(cleanEntry);
      bodyContent += `<div class="bibliography-entry">${formattedEntry}</div>`;
    }
  }

  const htmlContent = `${htmlHeader}${bodyContent}${htmlFooter}`;
  
  // Konstruksi MHTML multipart
  const boundary = '----=_NextPart_ScholarFlow_Draft';
  let mhtml = `MIME-Version: 1.0\r\n`;
  mhtml += `Content-Type: multipart/related; boundary="${boundary}"; type="text/html"\r\n\r\n`;

  // Bagian HTML Utama
  mhtml += `--${boundary}\r\n`;
  mhtml += `Content-Type: text/html; charset="utf-8"\r\n`;
  mhtml += `Content-Location: file:///C:/document.html\r\n\r\n`;
  mhtml += htmlContent + `\r\n\r\n`;

  // Bagian Lampiran Gambar
  for (const img of attachedImages) {
    mhtml += `--${boundary}\r\n`;
    mhtml += `Content-Type: ${img.mimeType}\r\n`;
    mhtml += `Content-Transfer-Encoding: base64\r\n`;
    mhtml += `Content-Location: ${img.location}\r\n\r\n`;
    mhtml += img.base64Data + `\r\n\r\n`;
  }

  mhtml += `--${boundary}--\r\n`;

  return mhtml;
}

/**
 * Memicu unduhan file Word langsung di browser klien (MHTML .doc format)
 */
export async function exportToWordFile(
  title: string,
  blocks: EditorBlock[],
  bibliography: string[],
  language: 'en' | 'id' = 'en',
  isPro: boolean = true
): Promise<void> {
  try {
    const mhtmlContent = await generateWordMhtml(title, blocks, bibliography, language, isPro);
    
    // Gunakan Blob dengan mimetype application/msword untuk kompatibilitas Word (.doc)
    const blob = new Blob(['\ufeff' + mhtmlContent], {
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
  } catch (error) {
    console.error('Failed to export document to Word:', error);
  }
}

/**
 * Memicu cetak/ekspor dokumen ke PDF menggunakan print iframe
 */
export async function exportToPdfFile(
  title: string,
  blocks: EditorBlock[],
  bibliography: string[],
  language: 'en' | 'id' = 'en',
  isPro: boolean = true
): Promise<void> {
  try {
    // Generate clean Word-style HTML
    const htmlContent = generateWordHtml(title, blocks, bibliography, language, isPro);
    
    // Create an iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      throw new Error('Could not access iframe document');
    }
    
    doc.open();
    doc.write(htmlContent);
    doc.close();
    
    // Wait for images to load
    const images = Array.from(doc.getElementsByTagName('img'));
    const loadPromises = images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve(); // continue printing even if an image fails
      });
    });
    
    await Promise.all(loadPromises);
    
    // Trigger print
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    
    // Cleanup after a short delay to let the print dialog open
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  } catch (error) {
    console.error('Failed to export document to PDF:', error);
  }
}
