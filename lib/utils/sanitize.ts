import DOMPurify from 'dompurify';

const ALLOWED_ATTRIBUTES = [
  'data-citation-search',
  'data-formula',
  'data-ref-id',
  'data-citation',
  'contenteditable',
  'target',
  'rel'
];

/**
 * Sanitizes an HTML string to prevent XSS attacks while preserving
 * necessary custom attributes used by the ScholarFlow editor.
 */
export const sanitizeHtml = (html: string): string => {
  if (typeof window === 'undefined') {
    // DOMPurify needs a DOM to work; on the server side it returns the string as is 
    // or requires jsdom. Since we usually render/save in the browser, we check this.
    // If needed on server, we'd use isomorphic-dompurify.
    return html;
  }
  
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ALLOWED_ATTRIBUTES,
    ADD_TAGS: ['cite'], // Ensure <cite> is allowed
  });
};

/**
 * Sanitizes the EditorJS JSON content block by block.
 */
export const sanitizeEditorContent = (content: any): any => {
  if (!content || !content.blocks || !Array.isArray(content.blocks)) {
    return content;
  }

  // Deep clone to avoid mutating the original reference
  const sanitized = JSON.parse(JSON.stringify(content));

  sanitized.blocks = sanitized.blocks.map((block: any) => {
    if (block?.data) {
      // Sanitize standard text fields in paragraphs, headings, quotes, etc.
      if (typeof block.data.text === 'string') {
        block.data.text = sanitizeHtml(block.data.text);
      }
      // Sanitize lists
      if (Array.isArray(block.data.items)) {
        block.data.items = block.data.items.map((item: any) => {
          if (typeof item === 'string') return sanitizeHtml(item);
          if (item?.content) {
            item.content = sanitizeHtml(item.content);
          }
          return item;
        });
      }
      // Sanitize tables
      if (Array.isArray(block.data.content)) {
        block.data.content = block.data.content.map((row: any) => {
          if (Array.isArray(row)) {
            return row.map((cell: string) => sanitizeHtml(cell));
          }
          return row;
        });
      }
      // Sanitize math blocks
      if (typeof block.data.formula === 'string') {
        // Formula is plain text, but we sanitize just in case
        block.data.formula = sanitizeHtml(block.data.formula);
      }
    }
    return block;
  });

  return sanitized;
};
