// lib/editor/citation-export-word.ts
// Utilitas untuk mengekspor dokumen draf EditorJS menjadi berkas MS Word (.doc) dengan pemformatan akademis

import { generateWordHtml, generateWordMhtml, EditorBlock } from './word-html-generator';

export type { EditorBlock };

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
