# Refactoring Changelog

Dokumen ini mencatat riwayat perubahan (*changelog*) secara spesifik yang berkaitan dengan upaya merapikan (refactoring) komponen-komponen berukuran raksasa di dalam ScholarFlow.

---

## [Unreleased] / Work In Progress

### 🔄 Refactoring `components/editor/editor-layout.tsx`
*Status: Dalam pengerjaan (In Progress)*

**Perubahan yang telah dilakukan:**
- Menyiapkan kerangka file baru untuk memecah `editor-layout.tsx` (yang awalnya memiliki 3.576 baris kode).
- Membuat file `components/editor/editor-header.tsx` (belum diintegrasikan penuh).
- Membuat file `components/editor/editor-switch.tsx` (belum diintegrasikan penuh).
- Membuat file `components/editor/editorjs-toolbar.tsx` (belum diintegrasikan penuh).
- Membuat file `components/editor/katex-preview.tsx` (belum diintegrasikan penuh).
- Membuat direktori `components/editor/modals/` untuk memecah komponen modal portal.

**Perubahan terbaru:**
- pp/shared/[id]/page.tsx: Mengekstrak SharedSidebar dan SharedBubbleMenu ke komponen modular, mengurangi ukuran file dari 3.189 baris menjadi ~2.260 baris.
- Mengganti SuggestionModal yang duplikat dengan impor komponen yang sudah ada.
- Membuat hooks/use-shared-document-sync.ts sebagai fondasi untuk memisahkan logika sinkronisasi realtime.
- Mengekstrak **Dashboard View & Admin Panel** (>1.100 baris kode) ke dalam components/editor/dashboard-view.tsx.
- Menggantikan kode dashboard di dalam ditor-layout.tsx dengan komponen <DashboardView />.
- Memastikan semua _props_ dikirimkan dengan benar tanpa merusak fungsionalitas.

**Selanjutnya:**
- Mengimplementasikan pemindahan logika dan komponen React dari `editor-layout.tsx` ke file-file tersebut.
- Menyambungkan (import) komponen yang diekstrak kembali ke `editor-layout.tsx` tanpa merusak *state* atau menghapus fungsionalitas aslinya.
