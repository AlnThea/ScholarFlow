const fs = require('fs');

const code = fs.readFileSync('components/editor/scholar-editor.tsx', 'utf-8');
const lines = code.split('\n');

const helpersStart = 62; // 0-indexed, where `function extractTextFromContent` starts
let helpersEnd = -1;

for (let i = 62; i < lines.length; i++) {
  if (lines[i].includes('export function ScholarEditor() {')) {
    helpersEnd = i - 1;
    break;
  }
}

if (helpersStart !== -1 && helpersEnd !== -1) {
  const helpersCode = lines.slice(helpersStart, helpersEnd + 1).join('\n');
  
  const utilsCode = "import React from 'react';\n\n" + helpersCode;
  
  if (!fs.existsSync('lib/editor')) fs.mkdirSync('lib/editor', { recursive: true });
  fs.writeFileSync('lib/editor/editor-utils.tsx', utilsCode, 'utf-8');
  
  const newLines = [
    ...lines.slice(0, helpersStart),
    "import { extractTextFromContent, countWords, downloadFile, findMostRelevantSentence, HighlightedAbstract, findMostUniqueWord, getContentComparisonString } from '@/lib/editor/editor-utils';",
    ...lines.slice(helpersEnd + 1)
  ];
  
  fs.writeFileSync('components/editor/scholar-editor.tsx', newLines.join('\n'), 'utf-8');
  console.log('Helpers extracted successfully!');
} else {
  console.log('Could not find helpers boundaries.');
}
