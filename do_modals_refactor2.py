import re

with open('components/editor/editor-layout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'(      <PricingModal\n.*?\n      />)\n    </div>', re.DOTALL)
match = pattern.search(content)

modals_str = match.group(1)

# Find all variables used in props: foo={bar} or onClick={() => foo()}
# Actually it's easier to just pass everything down by destructuring all at the top of the wrapper.

props = [
  "isPricingOpen", "setIsPricingOpen", "isShareOpen", "setIsShareOpen",
  "activePlanId", "role", "currentDocument", "onSaveSettings",
  "mounted", "isExportUpgradeModalOpen", "setIsExportUpgradeModalOpen",
  "language", "isImageModalOpen", "setIsImageModalOpen", "imageUrlInput", "setImageUrlInput",
  "handleInsertImageConfirm", "isMathModalOpen", "setIsMathModalOpen",
  "setEditingMathCallback", "setMathFormulaInput", "mathFormulaInput",
  "handleInsertMathConfirm", "editingMathCallback", "isLinkModalOpen",
  "setIsLinkModalOpen", "setInsertLinkCallback", "setLinkUrlInput",
  "linkUrlInput", "handleInsertLinkConfirm", "handleUnlinkConfirm",
  "insertLinkCallback", "showHighlightPopover", "setShowHighlightPopover",
  "setHighlightPopoverRect", "setHighlightTriggerSource", "highlightPopoverRect",
  "handleApplyHighlight", "isPlanModalOpen", "setIsPlanModalOpen",
  "selectedPlanForModal", "modalPlanState", "setModalPlanState", "handleSaveModalPlan",
  "savingPlanId", "isModelModalOpen", "setIsModelModalOpen", "isEn",
  "selectedModelForModal", "modalModelState", "setModalModelState", "aiProviders",
  "DEFAULT_PROVIDERS", "handleOpenCreateProviderModal", "handleOpenEditProviderModal",
  "handleTestModelConnection", "testingModelId", "handleSaveModalModel",
  "savingModelId", "isProviderModalOpen", "setIsProviderModalOpen", "selectedProviderForModal",
  "modalProviderState", "setModalProviderState", "handleSaveModalProvider",
  "isSuggestionModalOpen", "setIsSuggestionModalOpen", "selectedTextForSuggestion",
  "newTextForSuggestion", "setNewTextForSuggestion", "profile", "user",
  "editorJsRef", "addSuggestion", "activeUsers", "createNotification",
  "alertModalState", "setAlertModalState", "isBackendModalOpen",
  "setIsBackendModalOpen", "setMathToast", "isHelpOpen", "setIsHelpOpen"
]

destructuring = "  const {\n    " + ",\n    ".join(props) + "\n  } = props;\n"

wrapper_code = '''import React from 'react';
import dynamic from 'next/dynamic';
import { ImageModal } from './modals/image-modal';
import { MathModal } from './modals/math-modal';
import { LinkModal } from './modals/link-modal';
import { HighlightPopover } from './modals/highlight-popover';
import { SuggestionModal } from './modals/suggestion-modal';
import { AlertModal } from './modals/alert-modal';
import { ProviderModal } from './modals/provider-modal';
import { ModelModal } from './modals/model-modal';
import { PlanModal } from './modals/plan-modal';
import { ExportUpgradeModal } from './modals/export-upgrade-modal';
import { addSuggestion } from '@/lib/api/suggestions';
import { createNotification } from '@/lib/api/comments';

const PricingModal = dynamic(() => import('./pricing-modal').then((mod) => mod.PricingModal), { ssr: false });
const ShareDocumentModal = dynamic(() => import('./share-document-modal').then((mod) => mod.ShareDocumentModal), { ssr: false });
const BackendSettingsModal = dynamic(() => import('./backend-settings-modal').then((mod) => mod.BackendSettingsModal), { ssr: false });
const HelpModal = dynamic(() => import('./help-modal').then((mod) => mod.HelpModal), { ssr: false });

export function EditorModalsWrapper(props: any) {
''' + destructuring + '''
  return (
    <>
''' + modals_str.replace('      ', '      ') + '''
    </>
  );
}
'''

with open('components/editor/editor-modals-wrapper.tsx', 'w', encoding='utf-8') as f:
    f.write(wrapper_code)

props_passed = "          " + "\n          ".join([f"{p}={{{p}}}" for p in props])

new_content = content[:match.start(1)] + '      <EditorModalsWrapper\n' + props_passed + '\n      />' + content[match.end(1):]

import_statement = "import { EditorModalsWrapper } from './editor-modals-wrapper';\n"
# insert import after import React
new_content = new_content.replace("import React", import_statement + "import React")

# We should also remove dynamic imports of PricingModal, ShareDocumentModal, BackendSettingsModal, HelpModal from editor-layout.tsx
new_content = re.sub(r'const PricingModal.*?\n', '', new_content)
new_content = re.sub(r'const ShareDocumentModal.*?\n', '', new_content)
new_content = re.sub(r'const BackendSettingsModal.*?\n', '', new_content)
new_content = re.sub(r'const HelpModal.*?\n', '', new_content)
new_content = re.sub(r'import { ImageModal }.*?\n', '', new_content)
new_content = re.sub(r'import { MathModal }.*?\n', '', new_content)
new_content = re.sub(r'import { LinkModal }.*?\n', '', new_content)
new_content = re.sub(r'import { HighlightPopover }.*?\n', '', new_content)
new_content = re.sub(r'import { SuggestionModal }.*?\n', '', new_content)
new_content = re.sub(r'import { AlertModal }.*?\n', '', new_content)
new_content = re.sub(r'import { ProviderModal }.*?\n', '', new_content)
new_content = re.sub(r'import { ModelModal }.*?\n', '', new_content)
new_content = re.sub(r'import { PlanModal }.*?\n', '', new_content)
new_content = re.sub(r'import { ExportUpgradeModal }.*?\n', '', new_content)


with open('components/editor/editor-layout.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Modals refactored perfectly!")
