const fs = require('fs');
const lines = fs.readFileSync('app/shared/[id]/page.tsx', 'utf-8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('{/* Modal Usulan Perubahan')) {
        console.log('SuggestionModal starts at: ' + (i + 1));
    }
    if (lines[i].includes('SuggestionModal')) {
        console.log('SuggestionModal ref at: ' + (i + 1));
    }
    if (lines[i].includes('{/* Custom React Alert')) {
        console.log('AlertModal starts at: ' + (i + 1));
    }
    if (lines[i].includes('{/* AI Comparison Modal')) {
        console.log('AiModal starts at: ' + (i + 1));
    }
    if (lines[i].includes('showBubbleMenu && bubbleMenuRect')) {
        console.log('BubbleMenu starts at: ' + (i + 1));
    }
}
