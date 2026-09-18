import re

with open('components/editor/editor-layout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the type EditorLayoutProps and findMostRelevantSentence
pattern = re.compile(r'type EditorLayoutProps = \{.*?\n\};\n\nfunction findMostRelevantSentence.*?return bestSentence;\n\}\n', re.DOTALL)
match = pattern.search(content)

if match:
    # We will replace it with imports
    imports = "import type { EditorLayoutProps } from './types';\nimport { findMostRelevantSentence } from '@/lib/editor/editor-utils';\n"
    new_content = content[:match.start()] + imports + content[match.end():]
    with open('components/editor/editor-layout.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replaced successfully!")
else:
    print("Match not found.")
