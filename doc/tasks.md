# Refactoring Tasks Tracker

Dokumen ini digunakan untuk melacak secara spesifik proses pemecahan (refactoring) komponen-komponen raksasa di proyek ScholarFlow agar kode lebih modular, mudah dikelola, dan menghindari file dengan ribuan baris kode.

Sesuai instruksi khusus: **Tidak boleh ada penghapusan fitur atau logika yang sedang berjalan.** Proses refactoring murni memindahkan dan merapikan kode ke file (komponen) terpisah.

---

## 🔄 IN PROGRESS (SEDANG BERJALAN)

### 1. `components/editor/editor-layout.tsx` (3.576 baris)
- [x] Analisis dan petakan blok kode yang bisa diekstrak.
- [x] Buat file `components/editor/editor-header.tsx`.
- [x] Buat file `components/editor/editor-switch.tsx`.
- [x] Buat file `components/editor/editorjs-toolbar.tsx`.
- [x] Buat file `components/editor/katex-preview.tsx`.
- [x] Buat folder `components/editor/modals/` untuk menampung modal-modal yang ada.
- [x] Pindahkan logika, props, dan state yang sesuai dari `editor-layout.tsx` ke file-file komponen baru tersebut.
- [x] Impor dan gunakan komponen-komponen baru tersebut di dalam `editor-layout.tsx` untuk memangkas jumlah baris kode.
- [ ] Verifikasi bahwa tidak ada fungsionalitas yang hilang (UI, State, Fungsi tetap berjalan normal).

---

## 📝 TODO (BELUM DIMULAI)

### 2. `app/shared/[id]/page.tsx` (3.189 baris)
- [x] Ekstrak SharedSidebar dan SharedBubbleMenu ke komponen terpisah.
- [x] Ganti SuggestionModal inline dengan komponen modular.
- [x] Buat hooks/use-shared-document-sync.ts untuk menampung logika sinkronisasi (Tinggal dipasang menggantikan blok useEffect di page.tsx).

### 3. `components/editor/scholar-editor.tsx` (2.219 baris)
- [x] Ekstrak fungsi-fungsi helper murni (200+ baris) ke lib/editor/editor-utils.tsx.
- [ ] *Ekstrak state management AI dan Dokumen ke Custom Hooks (use-editor-ai, use-editor-document).*

### 4. `components/editor/editorjs-editor.tsx` (2.136 baris)
- [x] Ekstrak Custom EditorJS Tools (MathBlockTool, SanitizerTools) ke lib/editor/editor-tools.ts.

### 5. `components/editor/editor-sidebar.tsx` (1.446 baris)
- [x] Mengekstrak 4 sub-panel (Library, Writing, Document, Comments) ke komponen modular masing-masing.

### 6. `components/editor/minimal-sidebar.tsx` (1.384 baris)
- [ ] *Ekstrak helper navigasi atau UI untuk mode Zen / mode minimalis.*

### 7. `lib/editor/citation-export-word.ts` (1.041 baris)
- [ ] *Pisahkan proses penyiapan HTML (HTML parser) dari generator MHTML/Blob final.*

### 8. `components/editor/document-setup-modal.tsx` (839 baris)
- [ ] *Pecah masing-masing "step" wizard (Step 1, Step 2, Step 3) ke dalam komponen view terpisah.*
