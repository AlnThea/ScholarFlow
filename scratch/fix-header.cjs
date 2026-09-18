const fs = require('fs');
let content = fs.readFileSync('C:/web/ScholarFlow/components/editor/editor-header.tsx', 'utf-8');
const iconDef = `
const IconFilePdf = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={props.className} viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
    <path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4" />
    <path d="M5 18h1.5a1.5 1.5 0 0 0 0 -3h-1.5v6" />
    <path d="M17 18h-3v-3h3" />
    <path d="M14 18h3" />
    <path d="M10 15v6h1a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2h-1z" />
  </svg>
);
`;
const idx = content.indexOf('export function EditorHeader');
content = content.slice(0, idx) + iconDef + '\\n' + content.slice(idx);
fs.writeFileSync('C:/web/ScholarFlow/components/editor/editor-header.tsx', content);
console.log('Added IconFilePdf definition');
