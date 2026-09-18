with open('doc/tasks.md', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("## ?? TODO (BELUM DIMULAI)", "## ✅ PHASE 5: SHARED PAGE & EDITOR REFACTOR (COMPLETED)")

content = content.replace("### 4. `components/editor/editorjs-editor.tsx`", "## 📝 TODO (UNTUK SELANJUTNYA)\n\n### 4. `components/editor/editorjs-editor.tsx`")

# Also untick the remaining tasks
content = content.replace("- [x] Ekstrak Custom EditorJS Tools (MathBlockTool, SanitizerTools) ke lib/editor/editor-tools.ts.", "- [ ] Ekstrak Custom EditorJS Tools (MathBlockTool, SanitizerTools) ke lib/editor/editor-tools.ts.")
content = content.replace("- [x] Mengekstrak 4 sub-panel (Library, Writing, Document, Comments) ke komponen modular masing-masing.", "- [ ] Mengekstrak 4 sub-panel (Library, Writing, Document, Comments) ke komponen modular masing-masing.")
content = content.replace("- [x] *Ekstrak helper navigasi atau UI untuk mode Zen / mode minimalis.*", "- [ ] *Ekstrak helper navigasi atau UI untuk mode Zen / mode minimalis.*")
content = content.replace("- [x] *Pisahkan proses penyiapan HTML (HTML parser) dari generator MHTML/Blob final.*", "- [ ] *Pisahkan proses penyiapan HTML (HTML parser) dari generator MHTML/Blob final.*")
content = content.replace("- [x] *Pecah masing-masing \"step\" wizard (Step 1, Step 2, Step 3) ke dalam komponen view terpisah.*", "- [ ] *Pecah masing-masing \"step\" wizard (Step 1, Step 2, Step 3) ke dalam komponen view terpisah.*")

with open('doc/tasks.md', 'w', encoding='utf-8') as f:
    f.write(content)
