import os

for root, dirs, files in os.walk('.'):
    if 'node_modules' in root or '.next' in root or '.git' in root:
        continue
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    lines = len(f.readlines())
                    if lines > 400:
                        print(f"{lines} lines: {path}")
            except Exception as e:
                pass
