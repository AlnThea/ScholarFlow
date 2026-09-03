const fs = require('fs');

const code = fs.readFileSync('components/editor/editorjs-editor.tsx', 'utf-8');
const lines = code.split('\n');

const extractStart = 7; // line 8 (0-indexed 7)
let extractEnd = -1;

for (let i = 270; i < lines.length; i++) {
  if (lines[i].includes('interface EditorJsEditorProps')) {
    extractEnd = i - 1;
    break;
  }
}

if (extractStart !== -1 && extractEnd !== -1) {
  const toolsCode = lines.slice(extractStart, extractEnd).join('\n');
  
  const finalToolsCode = `export ` + toolsCode
    .replace('class MathBlockTool', 'export class MathBlockTool')
    .replace('class InlineMathSanitizerTool', 'export class InlineMathSanitizerTool')
    .replace('class CitationSanitizerTool', 'export class CitationSanitizerTool')
    .replace('class CustomFormatsSanitizerTool', 'export class CustomFormatsSanitizerTool')
    .replace('function scrambleHtmlText', 'export function scrambleHtmlText');

  fs.writeFileSync('lib/editor/editor-tools.ts', finalToolsCode, 'utf-8');
  
  const newLines = [
    ...lines.slice(0, extractStart),
    "import { MathBlockTool, InlineMathSanitizerTool, CitationSanitizerTool, CustomFormatsSanitizerTool, scrambleHtmlText } from '@/lib/editor/editor-tools';",
    ...lines.slice(extractEnd)
  ];
  
  fs.writeFileSync('components/editor/editorjs-editor.tsx', newLines.join('\n'), 'utf-8');
  console.log('EditorJS Tools extracted successfully!');
} else {
  console.log('Bounds not found');
}
