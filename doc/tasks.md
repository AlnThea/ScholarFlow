# Refactoring Tasks Tracker

Dokumen ini digunakan untuk melacak secara spesifik proses pemecahan (refactoring) komponen-komponen raksasa di proyek ScholarFlow agar kode lebih modular, mudah dikelola, dan menghindari file dengan ribuan baris kode.

> **ðŸŽ‰ STATUS UPDATE**: **Refactoring Phase Selesai!** 
> Target pemecahan komponen raksasa (seperti `page.tsx`, `editor-layout.tsx`, `use-editorjs-methods.ts`, dll) agar berukuran `< 700 baris` per file telah **TERPENUHI**.

Sesuai instruksi khusus: **Tidak boleh ada penghapusan fitur atau logika yang sedang berjalan.** Proses refactoring murni memindahkan dan merapikan kode ke file (komponen) terpisah.

---

## ðŸ”„ IN PROGRESS (SEDANG BERJALAN)

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

## ðŸš€ PHASE 2: EXTRACTING LOGIC & STATE (COMPLETED)

### 9. `components/editor/editor-layout.tsx` (Target: < 700 baris)
- [x] Ekstrak logika dan state manajemen Modal AI & Admin (Model, Provider, Plan) ke `hooks/use-admin-modals.ts`.
- [x] Ekstrak logika dan state manajemen Modal Editor (Image, Math, Link, dll) ke `hooks/use-editor-modals.ts`.
- [x] Pangkas ukuran file `editor-layout.tsx` dari 2400-an baris menjadi 1946 baris.

## ðŸš€ PHASE 3: FINAL UI EXTRACTION (COMPLETED)
- [x] Ekstrak komponen `MathHelperPanel` dari `editor-layout.tsx` (memangkas ~150 baris).
- [x] Ekstrak komponen `EditorBubbleMenu` dari `editor-layout.tsx` (memangkas ~600 baris).

## ðŸŒ… PHASE 4: FINAL PURGE (< 700 LINES TARGET) (COMPLETED)
- [x] Ekstrak definisi tipe data (seperti `EditorLayoutProps` dkk) yang memakan ~120 baris ke file `types.ts` atau file interface khusus.
- [x] Ekstrak dan bungkus 16 deklarasi Modal JSX di bagian paling bawah `editor-layout.tsx` ke dalam satu komponen `<EditorModalsWrapper />` (memangkas ~150 baris).
- [x] Finalisasi `editor-layout.tsx` agar benar-benar berada di angka 700-an baris.

## ðŸ“ TODO (BELUM DIMULAI)

### 2. `app/shared/[id]/page.tsx` (3.189 baris)
- [x] Ekstrak SharedSidebar dan SharedBubbleMenu ke komponen terpisah.
- [x] Ganti SuggestionModal inline dengan komponen modular.
- [x] Buat hooks/use-shared-document-sync.ts untuk menampung logika sinkronisasi (Tinggal dipasang menggantikan blok useEffect di page.tsx).

### 3. `components/editor/scholar-editor.tsx` (2.219 baris)
- [x] Ekstrak fungsi-fungsi helper murni (200+ baris) ke lib/editor/editor-utils.tsx.
- [x] *Ekstrak state management AI dan Dokumen ke Custom Hooks (use-editor-ai, use-editor-document).*

## ðŸ“ TODO (UNTUK SELANJUTNYA)

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

## ðŸš€ NEW: Bibliometric Analysis Professional Enhancement
Target: Meningkatkan halaman analisis bibliometrik (pp/dashboard/bibliometric/page.tsx) menjadi kelas profesional dengan fitur filtering lanjutan, pemilihan tipe analisis, dan metrik yang lebih kompleks.

### Phase 1: Professional UI/UX & Filtering (Dalam Pengerjaan)
- [x] Buat Sidebar/Panel filter untuk mengatur *Thresholding* (Minimum node occurrences, Minimum link strength).
- [x] Tambahkan opsi rentang tahun (Year Range filter).
- [x] Sediakan UI opsi tipe analisis (saat ini hanya keyword co-occurrence, siapkan toggle untuk *Author Co-occurrence* dll).
- [x] Tata ulang Layout utama agar graph lebih luas dan interaktif, mencontoh aplikasi profesional (panel kiri/kanan untuk pengaturan, tengah untuk graph).
- [x] Implementasikan state management untuk filter ke dalam fungsi generator graph.

### Phase 2: Advanced Graph & Export (COMPLETED)
- [x] Integrasikan algoritma clustering (Label Propagation Algorithm) untuk mewarnai node berdasarkan komunitas/klaster.
- [x] Tambahkan panel informasi/statistik jaringan saat sebuah node diklik (menampilkan metrik degree dan top connections).
- [x] Tingkatkan fitur *Export* (tambahkan ekspor data CSV untuk nodes & edges).
- [x] Tambahkan fitur *Dictionary/Thesaurus* sederhana untuk menggabungkan kata bersinonim sebelum masuk ke generator graph.

### Phase 3: Expert & Enterprise Enhancements (TODO)
- [x] **Node Search & Focus**: Tambahkan fitur pencarian node untuk menemukan dan menyorot node spesifik dalam graf jaringan yang padat.
- [x] **Overlay Visualization (Trend Analysis)**: Opsi pewarnaan node berdasarkan Rata-rata Tahun Publikasi (menyorot tren topik terbaru).
- [x] **Advanced Network Metrics**: Hitung dan tampilkan skor sentralitas (seperti Betweenness Centrality) di detail panel untuk mengetahui tingkat kepentingan node.
- [x] **Visualization Tuning**: Tambahkan kontrol pengaturan tampilan (toggle label teks, skala ukuran node, dan penyesuaian jarak tautan/gravitasi).

### Phase 4: Ultimate Professional Parity (VOSviewer / CiteSpace Level)
- [x] **Density Visualization (Heatmap)**: Mode visualisasi peta panas untuk merender graf sebagai area densitas tanpa garis penghubung, menonjolkan konsentrasi topik.
- [x] **Time-Slicing Animation**: Fitur pemutaran (Play/Pause) pada rentang tahun untuk melihat animasi evolusi jaringan secara dinamis dari waktu ke waktu.
- [x] **GraphML / GML Export**: Fitur ekspor graf ke standar industri (GraphML/GML) agar bisa dibaca utuh oleh Gephi, VOSviewer, atau Cytoscape.
- [x] **Co-Citation & Bibliographic Coupling Analysis**: Tambahan tipe analisis berdasarkan referensi/daftar pustaka antar dokumen.

### Phase 5: Absolute Finishing Touches (The Final Polish)
- [x] **Dynamic NLP Keyword Extraction**: Ganti ekstraksi Regex statis dengan pembacaan properti `item.keywords` bawaan abstrak, atau integrasikan library/API NLP (seperti `rake-js`) agar bisa mengekstrak kata kunci dinamis dari segala bidang keilmuan secara akurat.
- [x] **High-Resolution Image Export (PNG/SVG)**: Tambahkan fitur pengeksporan *canvas* graf menjadi format gambar 4K PNG/SVG untuk keperluan publikasi/poster akademis.
- [x] **Save/Load Thesaurus Workspace**: Hubungkan state *Dictionary* ke pengaturan profil/database Supabase, agar kamus sinonim tersimpan permanen dan tidak hilang saat pengguna melakukan *refresh*.
- [x] **Drill-Down / Click-to-View Documents**: Tingkatkan interaksi klik pada *node* dengan menampilkan daftar *scrollable* dokumen/jurnal yang aktual mendasari (menyusun) node tersebut pada Panel Kanan.

### Phase 6: Enterprise Academic Add-ons (The VOSviewer Killer)
- [x] **True Clustering Algorithm (Louvain Modularity)**: Implementasikan algoritma deteksi komunitas yang nyata (seperti Louvain atau varian pengelompokan K-Means) untuk mewarnai node berdasarkan klaster tema riset, bukan lagi pewarnaan acak/dummy.
- [x] **Global Network Metrics & Statistics**: Buat Dasbor Metrik Jaringan yang merangkum *Total Nodes, Total Edges, Network Density*, dan metrik sentralitas global lainnya yang wajib dilaporkan dalam metodologi jurnal.
- [x] **Node Search & Highlight**: Aktifkan fitur *Search Bar* yang memungkinkan pengguna mencari topik tertentu dengan cepat, diiringi efek visual *auto-zoom* dan *highlight* memudarkan node lain.
- [x] **CSV/Excel Metrics Export**: Sediakan fitur pengeksporan struktur data node dan *link* (Degree, Occurrences, Centrality) murni ke dalam format CSV agar peneliti bisa mengolahnya di *software* statistik SPSS/Excel.
- [x] **Layout Physics Switcher**: Tambahkan opsi untuk mengubah gaya algoritma tata letak fisika jaringan (misalnya Fruchterman-Reingold, Circular, atau LinLog) untuk mengatasi graf yang kusut.
