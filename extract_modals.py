import re

with open('components/editor/editor-layout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern_modals = re.compile(r'      <PricingModal.*?<HelpModal.*?/>\n', re.DOTALL)
match = pattern_modals.search(content)

if match:
    modals_code = match.group(0)
    with open('modals_code.txt', 'w', encoding='utf-8') as out:
        out.write(modals_code)
    print("Found modals, written to modals_code.txt")
else:
    print("Could not find modals")
