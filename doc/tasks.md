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
- [x] Verifikasi bahwa tidak ada fungsionalitas yang hilang (UI, State, Fungsi tetap berjalan normal).

---

## 🚀 PHASE 2: EXTRACTING LOGIC & STATE (COMPLETED)

### 9. `components/editor/editor-layout.tsx` (Target: < 700 baris)
- [x] Ekstrak logika dan state manajemen Modal AI & Admin (Model, Provider, Plan) ke `hooks/use-admin-modals.ts`.
- [x] Ekstrak logika dan state manajemen Modal Editor (Image, Math, Link, dll) ke `hooks/use-editor-modals.ts`.
- [x] Pangkas ukuran file `editor-layout.tsx` dari 2400-an baris menjadi 1946 baris.

## 🚀 PHASE 3: FINAL UI EXTRACTION (COMPLETED)
- [x] Ekstrak komponen `MathHelperPanel` dari `editor-layout.tsx` (memangkas ~150 baris).
- [x] Ekstrak komponen `EditorBubbleMenu` dari `editor-layout.tsx` (memangkas ~600 baris).

## 🌅 PHASE 4: FINAL PURGE (< 700 LINES TARGET) (UNTUK BESOK)
- [ ] Ekstrak definisi tipe data (seperti `EditorLayoutProps` dkk) yang memakan ~120 baris ke file `types.ts` atau file interface khusus.
- [ ] Ekstrak dan bungkus 16 deklarasi Modal JSX di bagian paling bawah `editor-layout.tsx` ke dalam satu komponen `<EditorModalsWrapper />` (memangkas ~150 baris).
- [ ] Finalisasi `editor-layout.tsx` agar benar-benar berada di angka 700-an baris.

## 📝 TODO (BELUM DIMULAI)

### 2. `app/shared/[id]/page.tsx` (3.189 baris)
- [x] Ekstrak SharedSidebar dan SharedBubbleMenu ke komponen terpisah.
- [x] Ganti SuggestionModal inline dengan komponen modular.
- [x] Buat hooks/use-shared-document-sync.ts untuk menampung logika sinkronisasi (Tinggal dipasang menggantikan blok useEffect di page.tsx).

### 3. `components/editor/scholar-editor.tsx` (2.219 baris)
- [x] Ekstrak fungsi-fungsi helper murni (200+ baris) ke lib/editor/editor-utils.tsx.
- [x] *Ekstrak state management AI dan Dokumen ke Custom Hooks (use-editor-ai, use-editor-document).*

### 4. `components/editor/editorjs-editor.tsx` (2.136 baris)
- [x] Ekstrak Custom EditorJS Tools (MathBlockTool, SanitizerTools) ke lib/editor/editor-tools.ts.

### 5. `components/editor/editor-sidebar.tsx` (1.446 baris)
- [x] Mengekstrak 4 sub-panel (Library, Writing, Document, Comments) ke komponen modular masing-masing.


### 6. `components/editor/minimal-sidebar.tsx` (1.384 baris)
- [x] *Ekstrak helper navigasi atau UI untuk mode Zen / mode minimalis.*

### 7. `lib/editor/citation-export-word.ts` (1.041 baris)
- [x] *Pisahkan proses penyiapan HTML (HTML parser) dari generator MHTML/Blob final.*

### 8. `components/editor/document-setup-modal.tsx` (839 baris)
- [x] *Pecah masing-masing "step" wizard (Step 1, Step 2, Step 3) ke dalam komponen view terpisah.*
