import os
import re

file_path = 'C:/web/ScholarFlow/components/editor/editor-layout.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Extract suggestion, share, backend modal states
states_to_extract = [
    r"  const \[isSuggestionModalOpen, setIsSuggestionModalOpen\] = useState\(false\);\n",
    r"  const \[isShareOpen, setIsShareOpen\] = useState\(false\);\n",
    r"  const \[isBackendModalOpen, setIsBackendModalOpen\] = useState\(false\);\n",
]

for pat in states_to_extract:
    content = re.sub(pat, "", content)

# 2. Identify the main block
start_marker = "  const [adminPlans, setAdminPlans] = useState<PricingPlan[]>([]);"
end_marker = "  // States to manage the custom text selection bubble menu"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Markers not found!")
    exit(1)

block = content[start_idx:end_idx]

# Split block into pieces
admin_plan_start = block.find("  const [isPlanModalOpen")

# Editor modals: Image, Math, Link, Highlight
editor_modals_start = block.find("  const [isImageModalOpen")
editor_modals_end = block.find("  const [isPlanModalOpen")

# Admin modals: Alert, Provider, Model, Gateway
admin_modals_1 = block[:editor_modals_start]

# Highlight block (belongs to editor, but let's check if it's there)
# Actually, the user wants us to extract: ImageModal, MathModal, LinkModal, ExportUpgradeModal, ShareDocumentModal, SuggestionModal, and BackendSettingsModal.

admin_modals_code = admin_modals_1 + block[admin_plan_start:]
editor_modals_code = block[editor_modals_start:admin_plan_start]

# Note: isExportUpgradeModalOpen is inside the PlanModal block
# Let's move it to editor_modals_code
export_upgrade_pat = r"  const \[isExportUpgradeModalOpen, setIsExportUpgradeModalOpen\] = useState\(false\);\n"
match = re.search(export_upgrade_pat, admin_modals_code)
if match:
    admin_modals_code = admin_modals_code.replace(match.group(0), "")
    editor_modals_code += match.group(0)

# Add the share, backend, suggestion to editor_modals
editor_modals_code += """  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState(false);
"""

# Let's craft the use-admin-modals.ts
admin_hook = f"""import {{ useState, useEffect }} from 'react';
import {{ type PricingPlan, updatePricingPlan, createPricingPlan, deletePricingPlan, fetchPricingPlans }} from '@/lib/api/pricing';
import {{ type PaymentGateway, fetchPaymentGateways, updatePaymentGatewayStatus }} from '@/lib/api/payment-gateways';
import {{ type AIModel, type AIProvider, DEFAULT_PROVIDERS }} from '@/lib/api/ai-models';

export function useAdminModals({{
  activeDashboardTab,
  aiModels,
  onUpdateAIModel,
  onCreateAIModel,
  onDeleteAIModel,
  aiProviders,
  onUpdateAIProvider,
  onCreateAIProvider,
  onDeleteAIProvider
}}: any) {{
{admin_modals_code}

  return {{
    adminPlans, setAdminPlans,
    loadingAdminPlans,
    gatewaysList,
    togglingGatewayId,
    alertModalState, showAlertModal, showConfirmModal,
    savingModelId, editModelStates,
    isModelModalOpen, setIsModelModalOpen,
    selectedModelForModal, modalModelState,
    handleOpenEditModelModal, handleOpenCreateModelModal,
    testingModelId, handleTestModelConnection,
    handleSaveModalModel, handleDeleteModel, handleToggleModelStatus,
    isProviderModalOpen, setIsProviderModalOpen,
    selectedProviderForModal, modalProviderState,
    handleOpenCreateProviderModal, handleOpenEditProviderModal,
    handleSaveModalProvider, handleDeleteProvider,
    handleToggleGateway, handleSavePlan,
    isPlanModalOpen, setIsPlanModalOpen,
    selectedPlanForModal, modalPlanState,
    handleOpenEditModal, handleOpenCreateModal,
    handleSaveModalPlan, handleDeletePlan,
    editStates, setEditStates, savingPlanId,
  }};
}}
"""

# Craft use-editor-modals.ts
editor_hook = f"""import {{ useState }} from 'react';

export function useEditorModals({{ editorJsRef }}: any) {{
{editor_modals_code}

  return {{
    isImageModalOpen, setIsImageModalOpen,
    imageUrlInput, setImageUrlInput,
    handleInsertImageConfirm,
    isMathModalOpen, setIsMathModalOpen,
    mathFormulaInput, setMathFormulaInput,
    editingMathCallback, setEditingMathCallback,
    handleInsertMathConfirm,
    isLinkModalOpen, setIsLinkModalOpen,
    linkUrlInput, setLinkUrlInput,
    insertLinkCallback, setInsertLinkCallback,
    handleInsertLinkConfirm, handleUnlinkConfirm,
    showHighlightPopover, setShowHighlightPopover,
    highlightPopoverRect, setHighlightPopoverRect,
    highlightTriggerSource, setHighlightTriggerSource,
    handleHighlightButtonClick, handleApplyHighlight,
    isExportUpgradeModalOpen, setIsExportUpgradeModalOpen,
    isSuggestionModalOpen, setIsSuggestionModalOpen,
    isShareOpen, setIsShareOpen,
    isBackendModalOpen, setIsBackendModalOpen,
  }};
}}
"""

# Now build the replacement code
replacement = """  const adminModals = useAdminModals({
    activeDashboardTab,
    aiModels,
    onUpdateAIModel,
    onCreateAIModel,
    onDeleteAIModel,
    aiProviders,
    onUpdateAIProvider,
    onCreateAIProvider,
    onDeleteAIProvider
  });

  const {
    adminPlans, setAdminPlans,
    loadingAdminPlans,
    gatewaysList,
    togglingGatewayId,
    alertModalState, showAlertModal, showConfirmModal,
    savingModelId, editModelStates,
    isModelModalOpen, setIsModelModalOpen,
    selectedModelForModal, modalModelState,
    handleOpenEditModelModal, handleOpenCreateModelModal,
    testingModelId, handleTestModelConnection,
    handleSaveModalModel, handleDeleteModel, handleToggleModelStatus,
    isProviderModalOpen, setIsProviderModalOpen,
    selectedProviderForModal, modalProviderState,
    handleOpenCreateProviderModal, handleOpenEditProviderModal,
    handleSaveModalProvider, handleDeleteProvider,
    handleToggleGateway, handleSavePlan,
    isPlanModalOpen, setIsPlanModalOpen,
    selectedPlanForModal, modalPlanState,
    handleOpenEditModal, handleOpenCreateModal,
    handleSaveModalPlan, handleDeletePlan,
    editStates, setEditStates, savingPlanId
  } = adminModals;

  const editorModals = useEditorModals({ editorJsRef });

  const {
    isImageModalOpen, setIsImageModalOpen,
    imageUrlInput, setImageUrlInput,
    handleInsertImageConfirm,
    isMathModalOpen, setIsMathModalOpen,
    mathFormulaInput, setMathFormulaInput,
    editingMathCallback, setEditingMathCallback,
    handleInsertMathConfirm,
    isLinkModalOpen, setIsLinkModalOpen,
    linkUrlInput, setLinkUrlInput,
    insertLinkCallback, setInsertLinkCallback,
    handleInsertLinkConfirm, handleUnlinkConfirm,
    showHighlightPopover, setShowHighlightPopover,
    highlightPopoverRect, setHighlightPopoverRect,
    highlightTriggerSource, setHighlightTriggerSource,
    handleHighlightButtonClick, handleApplyHighlight,
    isExportUpgradeModalOpen, setIsExportUpgradeModalOpen,
    isSuggestionModalOpen, setIsSuggestionModalOpen,
    isShareOpen, setIsShareOpen,
    isBackendModalOpen, setIsBackendModalOpen
  } = editorModals;

"""

new_content = content[:start_idx] + replacement + content[end_idx:]

# Add imports
imports = """import { useAdminModals } from '@/hooks/use-admin-modals';
import { useEditorModals } from '@/hooks/use-editor-modals';
"""
# Insert before 'export function EditorLayout'
export_idx = new_content.find('export function EditorLayout')
new_content = new_content[:export_idx] + imports + new_content[export_idx:]

os.makedirs('C:/web/ScholarFlow/hooks', exist_ok=True)
with open('C:/web/ScholarFlow/hooks/use-admin-modals.ts', 'w', encoding='utf-8') as f:
    f.write(admin_hook)

with open('C:/web/ScholarFlow/hooks/use-editor-modals.ts', 'w', encoding='utf-8') as f:
    f.write(editor_hook)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Refactor completed successfully!")
