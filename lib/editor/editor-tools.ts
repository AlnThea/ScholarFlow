// Custom LaTeX Math Block Tool for Editor.js
export class MathBlockTool {
  static get toolbox() {
    return {
      title: 'Math Block',
      icon: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h3a2 2 0 0 0 2-2V4"/><path d="M20 17h-3a2 2 0 0 0-2 2v1"/><path d="M12 4v16"/><path d="M8 12h8"/></svg>`
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  data: { formula: string };
  api: any;
  readOnly: boolean;
  container: HTMLDivElement | null;

  constructor({ data, api, readOnly }: { data: any; api: any; readOnly: boolean }) {
    this.data = data || { formula: '' };
    this.api = api;
    this.readOnly = readOnly;
    this.container = null;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'p-4 border border-slate-200 rounded-lg bg-slate-50/50 my-3 font-sans';

    const input = document.createElement('textarea');
    input.placeholder = 'Enter LaTeX formula (e.g., \\int_a^b f(x) dx = F(b) - F(a))';
    input.value = this.data.formula || '';
    input.className = 'w-full p-2.5 border border-slate-200 rounded-md font-mono text-sm bg-white outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition';
    input.style.resize = 'vertical';

    const preview = document.createElement('div');
    preview.className = 'mt-3 text-center overflow-x-auto min-h-[2.5rem] flex items-center justify-center bg-white p-2 rounded-md border border-slate-100 shadow-sm';

    const renderMath = () => {
      const formula = input.value.trim();
      if (!formula) {
        preview.innerHTML = '<span class="text-slate-400 text-xs font-normal italic">LaTeX preview will render here</span>';
        return;
      }
      try {
        import('katex').then((kateMod) => {
          const katex = kateMod.default;
          katex.render(formula, preview, { displayMode: true, throwOnError: false });
        });
      } catch (err) {
        preview.textContent = formula;
      }
    };

    input.addEventListener('input', () => {
      this.data.formula = input.value;
      renderMath();
    });

    container.appendChild(input);
    container.appendChild(preview);

    // Dynamic show/hide of textarea based on focus/readOnly state
    if (this.readOnly) {
      input.style.display = 'none';
      preview.style.cursor = 'default';
    } else {
      // Start with input hidden if we already have a formula
      if (this.data.formula) {
        input.style.display = 'none';
      } else {
        input.style.display = 'block';
      }
      preview.style.cursor = 'pointer';

      // Switch to edit mode on click
      container.addEventListener('click', (e) => {
        if (e.target !== input) {
          input.style.display = 'block';
          input.focus();
        }
      });

      // Hide input on blur if not empty
      input.addEventListener('blur', () => {
        if (this.data.formula.trim()) {
          input.style.display = 'none';
        }
      });
    }

    // Initial render
    setTimeout(renderMath, 0);

    this.container = container;
    return container;
  }

  save() {
    return {
      formula: this.data.formula || ''
    };
  }
}

// Hidden background sanitizer tools to whitelist inline math and citation attributes in Editor.js Paragraph block
export class InlineMathSanitizerTool {
  static get isInline() { return true; }
  static get isReadOnlySupported() { return true; }
  static get sanitize() {
    return {
      span: {
        class: true,
        'data-formula': true,
        contenteditable: true,
      }
    };
  }
  render() { return document.createElement('button'); }
  surround() { }
  checkState() { return false; }
}

export class CitationSanitizerTool {
  static get isInline() { return true; }
  static get isReadOnlySupported() { return true; }
  static get sanitize() {
    return {
      cite: {
        class: true,
        'data-citation': true,
        'data-ref-id': true,
      }
    };
  }
  render() { return document.createElement('button'); }
  surround() { }
  checkState() { return false; }
}

export class CustomFormatsSanitizerTool {
  static get isInline() { return true; }
  static get isReadOnlySupported() { return true; }
  static get sanitize() {
    return {
      u: {},
      strike: {},
      s: {},
      code: {
        class: true
      },
      mark: {
        class: true,
        style: true,
        'data-comment-id': true,
        'data-author': true,
        title: true,
      },
      del: {
        class: true,
        style: true,
        'data-suggestion-id': true,
        'data-author': true,
        title: true,
      },
      ins: {
        class: true,
        style: true,
        'data-suggestion-id': true,
        'data-author': true,
        title: true,
      },
      sup: {},
      sub: {},
      b: {},
      strong: {},
      i: {},
      em: {},
      a: {
        href: true,
        target: true,
        rel: true,
        class: true
      },
      div: {
        class: true,
        style: true,
        contenteditable: true
      },
      span: {
        class: true,
        style: true,
        'data-formula': true,
        contenteditable: true
      },
      button: {
        class: true,
        style: true,
        onclick: true
      }
    };
  }
  render() { return document.createElement('button'); }
  surround() { }
  checkState() { return false; }
}

// Storage keys
const STORAGE_KEY = 'scholarflow.editorjs.content.v1';
const ALIGNMENT_KEY = 'scholarflow.editorjs.alignments.v1';

export interface EditorJsMethods {
  undo: () => void;
  redo: () => void;
  setBlockType: (type: string) => void;
  toggleInlineFormat: (format: string, color?: string) => void;
  setBlockAlignment: (align: string) => void;
  insertCitation: (label?: string, referenceId?: string) => void;
  insertImage: (url: string) => void;
  insertTable: () => void;
  insertCodeBlock: () => void;
  insertMathBlock: () => void;
  insertInlineEquation: (formula?: string) => void;
  saveSelectionRange: () => void;
  insertText: (text: string) => void;
  setFontSize: (size: string) => void;
  insertBibliographyText: (text: string) => void;
  upsertBibliography: (entries: Array<{ label: string; formatted: string }>, isFreeTier?: boolean) => void;
  renderContent: (data: any) => void;
  insertCitationSearch: () => void;
  insertCitationAtSearch: (label: string, referenceId: string) => void;
  cancelCitationSearch: () => void;
  addCommentMark: (commentId: string, authorName?: string) => void;
  highlightAndRemoveCommentMark: (commentId: string) => void;
  scrollToCommentMark: (commentId: string) => void;
  syncCommentMarks?: (comments: Array<{ id: string; selected_text?: string | null; author?: string; block_id?: string | null; resolved?: boolean }>) => void;
  addSuggestionMark?: (suggestionId: string, oldText: string, newText: string, authorName?: string) => void;
  acceptSuggestion?: (suggestionId: string) => void;
  rejectSuggestion?: (suggestionId: string) => void;
}

export function scrambleHtmlText(html: string): string {
  let insideTag = false;
  let result = '';
  for (let i = 0; i < html.length; i++) {
    const char = html[i];
    if (char === '<') {
      insideTag = true;
      result += char;
    } else if (char === '>') {
      insideTag = false;
      result += char;
    } else if (insideTag) {
      result += char;
    } else if (char === '&') {
      // Check if this is an HTML entity (e.g. &nbsp;, &amp;, &lt;, &gt;)
      const semiIndex = html.indexOf(';', i);
      if (semiIndex > i && semiIndex - i < 10) {
        const entityContent = html.substring(i + 1, semiIndex);
        if (/^[a-zA-Z0-9#]+$/.test(entityContent)) {
          // It is a valid HTML entity, skip scrambling it
          result += html.substring(i, semiIndex + 1);
          i = semiIndex; // advance index to the semicolon
          continue;
        }
      }
      result += char;
    } else {
      if (/[a-zA-Z]/.test(char)) {
        result += char === char.toUpperCase() ? 'X' : 'x';
      } else if (/[0-9]/.test(char)) {
        result += '0';
      } else {
        result += char;
      }
    }
  }
  return result;
}