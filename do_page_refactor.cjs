const fs = require('fs');

let content = fs.readFileSync('app/shared/[id]/page.tsx', 'utf8');

// The states that are returned by the hook
const statesToRemove = [
  'const [document, setDocument] = useState<DocumentEntry | null>(null);',
  'const [loading, setLoading] = useState(true);',
  'const [error, setError] = useState<string | null>(null);',
  'const [saveStatus, setSaveStatus] = useState<\\'saved\\' | \\'saving\\' | \\'offline\\'>(\\'saved\\');',
  'const [citationLibrary, setCitationLibrary] = useState<Record<string, CitationCandidate>>({});',
  'const [comments, setComments] = useState<any[]>([]);',
  'const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);',
  'const [suggestions, setSuggestions] = useState<DocumentSuggestion[]>([]);'
];

for (const state of statesToRemove) {
    content = content.replace(state, '');
}

// And the refs
const refsToRemove = [
  'const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);',
  'const lastSavedContentRef = useRef<string | null>(null);',
  'const suggestionsInitializedRef = useRef(false);',
  'const processedAcceptedSuggestionsRef = useRef<Set<string>>(new Set());',
  'const acceptedLocallyRef = useRef<Set<string>>(new Set());',
  'const [hasPendingRemoteUpdate, setHasPendingRemoteUpdate] = useState(false);',
  'const [pendingRemoteContent, setPendingRemoteContent] = useState<any>(null);'
];

for (const ref of refsToRemove) {
    content = content.replace(ref, '');
}

fs.writeFileSync('app/shared/[id]/page.tsx', content);
console.log('States and refs removed.');
