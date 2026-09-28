import { describe, it, expect } from 'vitest';
import { sanitizeHtml, sanitizeEditorContent } from '@/lib/utils/sanitize';

describe('Sanitization Utils', () => {
  describe('sanitizeHtml', () => {
    it('should strip malicious scripts', () => {
      const maliciousHtml = '<p>Hello <script>alert("xss")</script></p>';
      const sanitized = sanitizeHtml(maliciousHtml);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('<p>Hello </p>');
    });

    it('should allow custom attributes for EditorJS integration', () => {
      const customHtml = '<span data-citation-search="true" data-formula="E=mc^2" contenteditable="false">Math</span>';
      const sanitized = sanitizeHtml(customHtml);
      expect(sanitized).toContain('data-citation-search="true"');
      expect(sanitized).toContain('data-formula="E=mc^2"');
      expect(sanitized).toContain('contenteditable="false"');
    });

    it('should allow <cite> tags with custom attributes', () => {
      const citeHtml = '<cite data-citation="true" data-ref-id="123">Reference</cite>';
      const sanitized = sanitizeHtml(citeHtml);
      expect(sanitized).toContain('<cite');
      expect(sanitized).toContain('data-citation="true"');
      expect(sanitized).toContain('data-ref-id="123"');
    });
  });

  describe('sanitizeEditorContent', () => {
    it('should sanitize block texts', () => {
      const editorData = {
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: 'Normal text <img src="x" onerror="alert(1)">'
            }
          }
        ]
      };
      
      const sanitizedData = sanitizeEditorContent(editorData);
      expect(sanitizedData.blocks[0].data.text).not.toContain('onerror');
      expect(sanitizedData.blocks[0].data.text).toContain('<img src="x">');
    });
  });
});
