const fs = require('fs');
const path = require('path');

const filePath = 'C:/web/ScholarFlow/components/editor/editor-layout.tsx';
let content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

const mathToastLine = lines.findIndex(l => l.includes('const [mathToast, setMathToast]'));
const activeMathCategoryLine = lines.findIndex(l => l.includes('const [activeMathCategory, setActiveMathCategory]'));
const mathSearchQueryLine = lines.findIndex(l => l.includes('const [mathSearchQuery, setMathSearchQuery]'));
const mathHelperItemsStart = lines.findIndex(l => l.includes('const mathHelperItems = useMemo(() => ['));
const mathHelperItemsEnd = lines.findIndex((l, i) => i > mathHelperItemsStart && l.includes('], [language]);'));
const filteredMathHelperItemsStart = lines.findIndex(l => l.includes('const filteredMathHelperItems = useMemo(() => {'));
const filteredMathHelperItemsEnd = lines.findIndex((l, i) => i > filteredMathHelperItemsStart && l.includes('}, [mathHelperItems, activeMathCategory, mathSearchQuery]);'));

const mathPanelStart = lines.findIndex(l => l.includes('{isMathHelperOpen && ('));
let mathPanelEndExact = -1;
let braces1 = 0, parens1 = 0, started1 = false;
for(let i = mathPanelStart; i < lines.length; i++) {
  const l = lines[i];
  for(let c of l) {
    if(c==='{') braces1++; if(c==='}') braces1--;
    if(c==='(') parens1++; if(c===')') parens1--;
  }
  if (!started1 && (braces1 > 0 || parens1 > 0)) started1 = true;
  if (started1 && braces1 === 0 && parens1 === 0) {
    mathPanelEndExact = i; break;
  }
}

const bubbleStart = lines.findIndex(l => l.includes('{showBubbleMenu && bubbleMenuRect && ('));
let bubbleEndExact = -1;
let braces2 = 0, parens2 = 0, started2 = false;
for(let i = bubbleStart; i < lines.length; i++) {
  const l = lines[i];
  for(let c of l) {
    if(c==='{') braces2++; if(c==='}') braces2--;
    if(c==='(') parens2++; if(c===')') parens2--;
  }
  if (!started2 && (braces2 > 0 || parens2 > 0)) started2 = true;
  if (started2 && braces2 === 0 && parens2 === 0) {
    bubbleEndExact = i; break;
  }
}

console.log(JSON.stringify({
  mathToastLine,
  activeMathCategoryLine,
  mathSearchQueryLine,
  mathHelperItemsStart,
  mathHelperItemsEnd,
  filteredMathHelperItemsStart,
  filteredMathHelperItemsEnd,
  mathPanelStart,
  mathPanelEndExact,
  bubbleStart,
  bubbleEndExact
}));
