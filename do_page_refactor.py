import re

with open('app/shared/[id]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import { updatePresence", "import { useSharedDocumentSync } from '@/hooks/use-shared-document-sync';\nimport { updatePresence")

content = re.sub(r'  // Fetch document details and citation library on mount\n  useEffect\(\(\) => \{.*?  \}, \[docId\]\);\n\n', '', content, flags=re.DOTALL)
content = re.sub(r'  // Poll comments, suggestions, and document content every 5 seconds for live sync\n  useEffect\(\(\) => \{.*?  \}, \[docId, showToast, language, editorJsRef\]\);\n\n', '', content, flags=re.DOTALL)
content = re.sub(r'  // Presence Heartbeat Effect\n  useEffect\(\(\) => \{.*?  \}, \[docId, user\?\.id, profile\?\.full_name, user\?\.email, isCoEditor, language\]\);\n\n', '', content, flags=re.DOTALL)

content = re.sub(r'  // Save document handler for Co-Editor mode\n  const triggerDebouncedSave = useCallback.*?  \}, \[docId, document\]\);\n\n', '', content, flags=re.DOTALL)
content = re.sub(r'  const handleContentChange = useCallback.*?  \}, \[document, triggerDebouncedSave\]\);\n\n', '', content, flags=re.DOTALL)
content = re.sub(r'  const handleTitleChange = useCallback.*?  \}, \[document, triggerDebouncedSave\]\);\n\n', '', content, flags=re.DOTALL)

states_to_remove = [
    r"  const \[document, setDocument\] = useState<DocumentEntry \| null>\(null\);\n",
    r"  const \[loading, setLoading\] = useState\(true\);\n",
    r"  const \[error, setError\] = useState<string \| null>\(null\);\n",
    r"  const \[citationLibrary, setCitationLibrary\] = useState<Record<string, CitationCandidate>>\(\{\}\);\n",
    r"  const \[saveStatus, setSaveStatus\] = useState<'saved' \| 'saving' \| 'offline'>\('saved'\);\n",
    r"  const \[comments, setComments\] = useState<any\[\]>\(\[\]\);\n",
    r"  const \[activeUsers, setActiveUsers\] = useState<UserPresence\[\]>\(\[\]\);\n",
    r"  const \[suggestions, setSuggestions\] = useState<DocumentSuggestion\[\]>\(\[\]\);\n",
    r"  const debounceTimeoutRef = useRef<NodeJS.Timeout \| null>\(null\);\n",
    r"  const lastSavedContentRef = useRef<string \| null>\(null\);\n",
    r"  const suggestionsInitializedRef = useRef\(false\);\n",
    r"  const processedAcceptedSuggestionsRef = useRef<Set<string>>\(new Set\(\)\);\n",
    r"  const acceptedLocallyRef = useRef<Set<string>>\(new Set\(\)\);\n",
    r"  const \[hasPendingRemoteUpdate, setHasPendingRemoteUpdate\] = useState\(false\);\n",
    r"  const \[pendingRemoteContent, setPendingRemoteContent\] = useState<any>\(null\);\n",
    r"  const language = document\?\.settings\?\.citationLocale\?\.startsWith\('id'\) \? 'id' : 'en';\n"
]

for s in states_to_remove:
    content = re.sub(s, '', content)

hook_call = """
  // Hook for Document Synchronization
  const isCoEditor = role === 'admin' || role === 'super_admin' || document?.settings?.collaborators?.some((c: any) => c.email === user?.email && c.role === 'co-editor') || document?.user_id === user?.id;
  const {
    document, setDocument, loading, error, saveStatus, setSaveStatus,
    citationLibrary, comments, setComments, suggestions, setSuggestions,
    activeUsers, hasPendingRemoteUpdate, setHasPendingRemoteUpdate,
    pendingRemoteContent, setPendingRemoteContent, acceptedLocallyRef,
    handleContentChange, handleTitleChange
  } = useSharedDocumentSync(docId, user, profile, isCoEditor, 'en', editorJsRef, showToast);
  const language = document?.settings?.citationLocale?.startsWith('id') ? 'id' : 'en';

"""

content = re.sub(r'(  const \[activeReferenceIds, setActiveReferenceIds\] = useState<string\[\]>\(\[\]\);\n)', hook_call + r'\1', content)

# But wait, `isCoEditor` is defined later in the file! We need to remove the duplicate isCoEditor definition.
content = re.sub(r"  const isCoEditor = role === 'admin' \|\| role === 'super_admin' \|\| document\?\.settings\?\.collaborators\?\.some\(\(c: any\) => c\.email === user\?\.email && c\.role === 'co-editor'\) \|\| document\?\.user_id === user\?\.id;\n", '', content)


with open('app/shared/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
