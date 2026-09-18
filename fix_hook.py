with open('hooks/use-shared-document-sync.ts', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\\`', '`').replace('\\${', '${')
with open('hooks/use-shared-document-sync.ts', 'w', encoding='utf-8') as f:
    f.write(c)
