import re

# 1. Update hooks/use-editor-document.ts
with open('hooks/use-editor-document.ts', 'r', encoding='utf-8') as f:
    hook_content = f.read()

# Add imports for Presence, Comments, Suggestions, Notifications
imports_to_add = """
import { fetchActivePresence, updatePresence, leavePresence, type UserPresence } from '@/lib/api/presence';
import { fetchSuggestions, updateSuggestionStatus, type DocumentSuggestion } from '@/lib/api/suggestions';
import { fetchComments, fetchNotifications, createNotification, resolveComment, markNotificationAsRead, markAllNotificationsAsRead, isValidUuid, type DocumentComment, type DocumentNotification } from '@/lib/api/comments';
"""
hook_content = hook_content.replace('import { getContentComparisonString', imports_to_add + 'import { getContentComparisonString')

# Change signature
hook_content = hook_content.replace(
    "export function useEditorDocument(showToast: (msg: string, type: 'success' | 'error' | 'info') => void, hydrated: boolean) {",
    "export function useEditorDocument(showToast: (msg: string, type: 'success' | 'error' | 'info') => void, hydrated: boolean, editorJsRef: any) {"
)

# Extract states and effects from scholar-editor
with open('components/editor/scholar-editor.tsx', 'r', encoding='utf-8') as f:
    editor_content = f.read()

states_block = re.search(r'  // Comments and Notifications State.*?const suggestionsInitializedRef = useRef<boolean>\(false\);\n', editor_content, re.DOTALL).group(0)
sync_block = re.search(r'  // Auto-sync comment highlights onto editor canvas whenever comments update.*?\}, \[comments\]\);\n', editor_content, re.DOTALL).group(0)
poll_block = re.search(r'  useEffect\(\(\) => \{\n    if \(!user\?\.id\) return;\n\n    const loadCommentsAndNotifications = async \(\) => \{.*?\}, \[user\?\.id, currentDocument\?\.id\]\);\n', editor_content, re.DOTALL).group(0)
presence_block = re.search(r'  // Presence Heartbeat Effect for Owner.*?\}, \[currentDocument\?\.id, user\?\.id, user\?\.email, user\?\.user_metadata\?\.full_name\]\);\n', editor_content, re.DOTALL).group(0)

# Inject into hook before the return statement
hook_return = re.search(r'  return \{.*?\};\n\}', hook_content, re.DOTALL).group(0)

new_hook_content = hook_content.replace(hook_return, 
    states_block + '\n' + sync_block + '\n' + poll_block + '\n' + presence_block + '\n\n' + 
    hook_return.replace('  return {', '  return {\n    comments, setComments,\n    notifications, setNotifications,\n    activeUsers, setActiveUsers,\n    suggestions, setSuggestions,\n    activeSidebarTab, setActiveSidebarTab,\n    hasPendingRemoteUpdate, setHasPendingRemoteUpdate,\n    pendingRemoteContent, setPendingRemoteContent,\n    processedAcceptedSuggestionsRef, acceptedLocallyRef, suggestionsInitializedRef,')
)

with open('hooks/use-editor-document.ts', 'w', encoding='utf-8') as f:
    f.write(new_hook_content)

# 2. Update scholar-editor.tsx
new_editor_content = editor_content.replace(states_block, '')
new_editor_content = new_editor_content.replace(sync_block, '')
new_editor_content = new_editor_content.replace(poll_block, '')
new_editor_content = new_editor_content.replace(presence_block, '')

old_hook_call = """    handleChangeCitationStyle,
    handleChangeDocumentSettings
  } = useEditorDocument(showToast, hydrated);"""

new_hook_call = """    handleChangeCitationStyle,
    handleChangeDocumentSettings,
    comments, setComments,
    notifications, setNotifications,
    activeUsers, setActiveUsers,
    suggestions, setSuggestions,
    activeSidebarTab, setActiveSidebarTab,
    hasPendingRemoteUpdate, setHasPendingRemoteUpdate,
    pendingRemoteContent, setPendingRemoteContent,
    processedAcceptedSuggestionsRef, acceptedLocallyRef, suggestionsInitializedRef
  } = useEditorDocument(showToast, hydrated, editorJsRef);"""

new_editor_content = new_editor_content.replace(old_hook_call, new_hook_call)

with open('components/editor/scholar-editor.tsx', 'w', encoding='utf-8') as f:
    f.write(new_editor_content)

print('Success!')
