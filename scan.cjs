const fs = require('fs');
const path = require('path');

const dirsToScan = ['C:/web/ScholarFlow/app', 'C:/web/ScholarFlow/components'];

function scanDir(dir, fileList) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath, fileList);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
            fileList.push(fullPath);
        }
    }
}

const files = [];
dirsToScan.forEach(dir => scanDir(dir, files));

const report = {};

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    let hasHardcoded = false;
    let examples = [];

    // Simple regex to find text between JSX tags that are not expressions or just whitespace
    // Matches > Text <, ignoring cases where it's entirely an expression >{...}<
    const jsxTextRegex = />\s*([^<>{]+?)\s*</g;
    
    let match;
    while ((match = jsxTextRegex.exec(content)) !== null) {
        const text = match[1].trim();
        // Ignore if empty, single character, or just numbers/symbols
        if (text.length > 2 && /[a-zA-Z]/.test(text) && !text.includes('isEn') && !text.includes('language')) {
            // Might be hardcoded
            hasHardcoded = true;
            if (examples.length < 3) examples.push(text);
        }
    }

    if (hasHardcoded) {
        report[file.replace(/\\/g, '/')] = examples;
    }
});

console.log(JSON.stringify(report, null, 2));
