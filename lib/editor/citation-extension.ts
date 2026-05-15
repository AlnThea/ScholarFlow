import { mergeAttributes, Node } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    citationMarker: {
      insertCitationMarker: (attrs: { label: string; referenceId?: string }) => ReturnType;
    };
  }
}

export const CitationMarker = Node.create({
  name: 'citationMarker',
  inline: true,
  group: 'inline',
  content: 'text*',
  marks: '',
  selectable: false,
  isolating: true,

  addAttributes() {
    return {
      label: {
        default: '1',
      },
      referenceId: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'cite[data-citation]',
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false;
          return {
            label: element.getAttribute('data-label') ?? element.textContent?.replace(/[\[\]]/g, '') ?? '1',
            referenceId: element.getAttribute('data-reference-id'),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['cite', mergeAttributes(HTMLAttributes, { 'data-citation': 'true' }), 0];
  },

  addCommands() {
    return {
      insertCitationMarker:
        (attrs) =>
        ({ chain }) =>
          chain()
            .insertContent({
              type: this.name,
              attrs,
              content: [{ type: 'text', text: `[${attrs.label}]` }],
            })
            .run(),
    };
  },
});
