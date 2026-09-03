const fs = require('fs');
let code = fs.readFileSync('app/shared/[id]/page.tsx', 'utf-8');
const lines = code.split('\n');

let sugStart = -1, sugEnd = -1;
for(let i=0; i<lines.length; i++) {
    if(lines[i].includes('{/* Modal Usulan Perubahan')) {
        sugStart = i;
    }
    if(sugStart !== -1 && lines[i].includes('{/* Floating Signal Banner')) {
        sugEnd = i - 1;
        break;
    }
}

if(sugStart !== -1 && sugEnd !== -1) {
    const replacement = `      {/* Modal Usulan Perubahan (Mode Sugesti / Track Changes) */}
      <SuggestionModal
        isOpen={isSuggestionModalOpen}
        onClose={() => setIsSuggestionModalOpen(false)}
        selectedText={selectedTextForSuggestion}
        newText={newTextForSuggestion}
        setNewText={setNewTextForSuggestion}
        language={language}
        onConfirm={() => {
          const sugId = \`sug-\${Date.now()}\`;
          const authorName = profile?.full_name || user?.email?.split('@')[0] || 'Collaborator';
          editorJsRef.current?.addSuggestionMark?.(sugId, selectedTextForSuggestion, newTextForSuggestion, authorName);
          if (docId) {
            addSuggestion(docId, selectedTextForSuggestion, newTextForSuggestion, authorName, sugId, user?.id);
            if (activeUsers && activeUsers.length > 0) {
              activeUsers.forEach(coUser => {
                if (coUser.user_id && coUser.user_id !== user?.id) {
                  createNotification(
                    docId,
                    coUser.user_id,
                    authorName,
                    language === 'en'
                      ? \`proposed a suggestion: "\${(newTextForSuggestion || selectedTextForSuggestion).slice(0, 30)}\${(newTextForSuggestion || selectedTextForSuggestion).length > 30 ? '...' : ''}"\`
                      : \`mengusulkan perubahan: "\${(newTextForSuggestion || selectedTextForSuggestion).slice(0, 30)}\${(newTextForSuggestion || selectedTextForSuggestion).length > 30 ? '...' : ''}"\`
                  );
                }
              });
            }
          }
          setIsSuggestionModalOpen(false);
        }}
      />`;
    
    const newLines = [
        ...lines.slice(0, sugStart),
        replacement,
        ...lines.slice(sugEnd + 1)
    ];
    let newCode = newLines.join('\n');
    
    if(!newCode.includes('import { SuggestionModal }')) {
        newCode = newCode.replace("import { PricingModal } from '@/components/editor/pricing-modal';", "import { PricingModal } from '@/components/editor/pricing-modal';\nimport { SuggestionModal } from '@/components/editor/modals/suggestion-modal';");
    }
    
    fs.writeFileSync('app/shared/[id]/page.tsx', newCode, 'utf-8');
    console.log('SuggestionModal updated!');
} else {
    console.log('SuggestionModal bounds not found:', sugStart, sugEnd);
}
