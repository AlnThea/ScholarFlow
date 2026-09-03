const fs = require('fs');

const code = fs.readFileSync('app/shared/[id]/page.tsx', 'utf-8');
const lines = code.split('\n');

const bubbleStart = 1919;
let bubbleEnd = 2432;
for(let i=bubbleStart; i<lines.length; i++) {
    if(lines[i].includes('{/* AI Comparison Modal')) {
        bubbleEnd = i - 1;
        break;
    }
}

const bubbleLines = lines.slice(bubbleStart, bubbleEnd + 1);

const componentCode = `import React from 'react';
import { createPortal } from 'react-dom';
import { IconX, IconCheck, IconTrash, IconSparkles, IconInfoCircle, IconRefresh, IconLanguage } from '@tabler/icons-react';

export const SharedBubbleMenu = (props: any) => {
  const {
    mounted, showBubbleMenu, bubbleMenuRect, language, selectedText,
    isCoEditor, isAiLoading, setShowBubbleMenu, handleAiImprovement,
    aiTargetLanguage, setAiTargetLanguage, setBubbleMode, bubbleMode,
    newCommentText, setNewCommentText, handleAddComment,
    handleOpenSuggestionModal
  } = props;

  return (
    <>
${bubbleLines.join('\n')}
    </>
  );
};
`;

fs.writeFileSync('components/editor/shared-bubble-menu.tsx', componentCode, 'utf-8');

// Also construct SuggestionModal import
let newLayoutCode = code;

// Remove bubble menu inline
const newLines = [
  ...lines.slice(0, bubbleStart),
  `      <SharedBubbleMenu
        mounted={mounted}
        showBubbleMenu={showBubbleMenu}
        bubbleMenuRect={bubbleMenuRect}
        language={language}
        selectedText={selectedText}
        isCoEditor={isCoEditor}
        isAiLoading={isAiLoading}
        setShowBubbleMenu={setShowBubbleMenu}
        handleAiImprovement={handleAiImprovement}
        aiTargetLanguage={aiTargetLanguage}
        setAiTargetLanguage={setAiTargetLanguage}
        setBubbleMode={setBubbleMode}
        bubbleMode={bubbleMode}
        newCommentText={newCommentText}
        setNewCommentText={setNewCommentText}
        handleAddComment={handleAddComment}
        handleOpenSuggestionModal={() => setIsSuggestionModalOpen(true)}
      />`,
  ...lines.slice(bubbleEnd + 1)
];

newLayoutCode = newLines.join('\n');
if (!newLayoutCode.includes('import { SharedBubbleMenu }')) {
    newLayoutCode = newLayoutCode.replace("import { SharedSidebar } from '@/components/editor/shared-sidebar';", "import { SharedSidebar } from '@/components/editor/shared-sidebar';\nimport { SharedBubbleMenu } from '@/components/editor/shared-bubble-menu';");
}

fs.writeFileSync('app/shared/[id]/page.tsx', newLayoutCode, 'utf-8');
console.log('SharedBubbleMenu extracted!');
