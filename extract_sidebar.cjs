const fs = require('fs');

const code = fs.readFileSync('app/shared/[id]/page.tsx', 'utf-8');
const lines = code.split('\n');

const sidebarStart = 1477; // 0-indexed
const sidebarEnd = 1866; // 0-indexed

const sidebarLines = lines.slice(sidebarStart, sidebarEnd + 1);

const componentCode = `import React from 'react';
import { IconX, IconMessage, IconCheck, IconTrash, IconSparkles } from '@tabler/icons-react';

export const SharedSidebar = (props: any) => {
  const {
    showCommentsSidebar, setShowCommentsSidebar, language, isCoEditor, activeUsers,
    sidebarTab, setSidebarTab, comments, onResolveComment, suggestions,
    onAcceptSuggestion, onRejectSuggestion, user
  } = props;

  return (
    <>
${sidebarLines.join('\n')}
    </>
  );
};
`;

fs.writeFileSync('components/editor/shared-sidebar.tsx', componentCode, 'utf-8');

const newLayoutLines = [
  ...lines.slice(0, sidebarStart),
  `        <SharedSidebar 
          showCommentsSidebar={showCommentsSidebar}
          setShowCommentsSidebar={setShowCommentsSidebar}
          language={language}
          isCoEditor={isCoEditor}
          activeUsers={activeUsers}
          sidebarTab={sidebarTab}
          setSidebarTab={setSidebarTab}
          comments={comments}
          onResolveComment={onResolveComment}
          suggestions={suggestions}
          onAcceptSuggestion={onAcceptSuggestion}
          onRejectSuggestion={onRejectSuggestion}
          user={user}
        />`,
  ...lines.slice(sidebarEnd + 1)
];

let newLayoutCode = newLayoutLines.join('\n');
if (!newLayoutCode.includes('import { SharedSidebar }')) {
    newLayoutCode = newLayoutCode.replace("import { EditorJsEditor } from '@/components/editor/editorjs-editor';", "import { EditorJsEditor } from '@/components/editor/editorjs-editor';\nimport { SharedSidebar } from '@/components/editor/shared-sidebar';")
}

fs.writeFileSync('app/shared/[id]/page.tsx', newLayoutCode, 'utf-8');

console.log('Sidebar extracted successfully!');
