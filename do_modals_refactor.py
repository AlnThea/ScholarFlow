import re

with open('components/editor/editor-layout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'(      <PricingModal\n.*?\n      />)\n    </div>', re.DOTALL)
match = pattern.search(content)
if not match:
    print("Could not find modals")
    exit(1)

modals_str = match.group(1)

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
  return (
    <>
''' + modals_str.replace('      ', '      ') + '''
    </>
  );
}
'''
with open('components/editor/editor-modals-wrapper.tsx', 'w', encoding='utf-8') as f:
    f.write(wrapper_code)

new_content = content[:match.start(1)] + '      <EditorModalsWrapper {...props_for_modals} />' + content[match.end(1):]

with open('components/editor/editor-layout.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Modals refactored!")
