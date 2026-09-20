const fs = require('fs');
const file = 'components/editor/sidebar-comments-tab.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix 1: onCommentClick?.(c: any)
content = content.replace(/onCommentClick\?\.\(c: any\)/g, "onCommentClick?.(c)");

// Fix 2: Array<DocumentSuggestion>
content = content.replace(/Array<DocumentSuggestion>/g, "DocumentSuggestion[]");
content = content.replace(/Map<string, DocumentSuggestion>/g, "Map<string, any>");

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed syntax errors');
