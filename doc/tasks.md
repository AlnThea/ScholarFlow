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

### Editor & AI Enhancements (Current)
- [x] **AI Burstiness Tab**: Pindahkan Burstiness Chart dari tab statistik dokumen ke tab khusus baru di sidebar kanan.
- [x] **Default Burstiness Tab**: Jadikan tab Burstiness sebagai tab default saat editor dibuka.
- [x] **Editor Layout Optimization**: Ubah penjajaran canvas editor menjadi rata kiri (`mr-auto`) dan lebarkan sidebar kanan (`w-[480px]`) agar lebih lega untuk chart dan analitik lanjutan.

### Phase 7: Burstiness & Humanization Studio (Cockpit Layout)
Target: Mengimplementasikan UI/UX 3-Kolom berdasarkan desain mockup skala Enterprise untuk analisis ritme kalimat dan humanisasi AI.

#### Tahap 1: State Management & Arsitektur Layout
- [x] Buat state global atau hook khusus (misal: `useBurstinessStudio`) untuk mengatur buka-tutup otomatis panel kiri saat tab Burstiness kanan aktif.
- [x] Sesuaikan komponen `EditorLayout` dan `MinimalSidebar` (Panel Kiri) agar bisa merender mode "Rhythm Explorer" selain mode "Library/File" standar.

#### Tahap 2: Pembangunan Panel Kiri (Rhythm Explorer)
- [x] Buat komponen `SentenceRhythmExplorer.tsx` di panel kiri.
- [x] Buat fungsi ekstraktor teks untuk memecah naskah di editor menjadi array kalimat (Sentence Tokenizer).
- [x] Rancang UI "Cadence Ribbon" (navigasi lompat cepat berderet) dan filter kalimat (Short, Standard, Long).
- [x] Rancang UI *Card* per kalimat yang menampilkan jumlah kata dan simpangan rata-ratanya, serta tombol aksi *Paraphrase*.

#### Tahap 3: Pembangunan Panel Kanan (Analitik & Paraphrase Studio)
- [x] **Security Assessment Card**: Rancang card teratas untuk menampilkan skor Burstiness (CV) dan indikator visual aman/bahaya.
- [x] **Metrics Grid**: Rancang grid 4 kotak (Total Words, Sentences, Avg Length, Std Dev).
- [x] **Paraphrase Studio**: Rancang area interaktif (Dropdown pilihan kalimat + 3 Opsi Rekonstruksi dari AI + tombol Terapkan).
- [x] **Sentence Cadence Chart**: Tingkatkan `BurstinessChart` menjadi grafik *bar* warna-warni yang memetakan panjang setiap kalimat secara sekuensial.
- [x] **Rekomendasi Panel**: Rancang panel pintar di bawah untuk menyorot "Kalimat Prioritas" yang merusak ritme dan perlu segera diparafrase.

#### Tahap 4: Integrasi Fungsi & AI
- [x] Hubungkan logika klik pada panel kiri (Rhythm Explorer) agar otomatis *scroll* dan menyorot teks terkait di EditorJS (Tengah).
- [x] Hubungkan *Paraphrase Studio* di panel kanan dengan API AI untuk menghasilkan variasi kalimat (Rhythmic Variance, Clause Split, Scholarly Flow).
- [x] Pastikan fungsi "Terapkan ke Naskah" bekerja sinkron mengubah teks di kanvas editor secara real-time.

### Phase 7.5: Burstiness Technical Enhancements (Refinement)
- [x] **1. Koneksi ke API Gemini Asli**: Menghapus simulasi `setTimeout` dan menghubungkan fungsi variasi di Paraphrase Studio dengan endpoint `/api/v1/ai/improve` (concurrent 3 variations).
- [x] **2. Keamanan Format HTML**: Mengembangkan fungsi *smart-replace* agar penimpaan teks tidak menghapus elemen HTML (seperti tag `<b>`, `<i>`, atau `<cite>`) di dalam blok EditorJS.
- [x] **3. Auto-Scroll & Canvas Highlight**: Mengimplementasikan logika DOM traversal untuk mencari elemen `<p>` yang mengandung teks terkait dan melakukan `scrollIntoView` beserta efek *highlight* kuning temporer saat panel Rhythm Explorer diklik.
- [x] **4. Toggle Analisis Seluruh Dokumen**: Menambahkan opsi sakelar agar diagram Burstiness dapat merender metrik untuk seluruh dokumen secara utuh, bukan hanya teks yang di-blok (*selected text*).
- [x] **5. Skema Monetisasi (PLG Paywall)**: Mengunci modul *Paraphrase Studio* menggunakan `activePlanId === 'free'` sehingga UI *disable* dan *user* diarahkan ke Modal *Upgrade/Pricing* saat tombol Generate diklik.

### Phase 8: Enterprise Professional Standards (Upcoming)
*(Panduan Evaluasi Lengkap Kini Tersedia di: `doc/ENTERPRISE_STANDARDS_CHECKLIST.md`)*
- [x] **1. Error Boundaries & Crash Recovery**: Membungkus komponen utama dengan `<ErrorBoundary>` untuk mencegah layar putih (Blank Screen of Death) jika komponen *child* mengalami kegagalan *render*.
- [x] **2. Keamanan XSS (Cross-Site Scripting)**: Menambahkan pustaka `DOMPurify` untuk mensterilkan (*sanitize*) *input/output* format HTML dari dan ke *database* sebelum dimasukkan ke `dangerouslySetInnerHTML` atau EditorJS.
- [x] **3. Automated Testing (Unit & E2E)**: Menulis *Unit Tests* (menggunakan `Vitest`/`Jest`) untuk fungsi utilitas (*Burstiness Engine*, ekstraksi regex) dan *E2E Tests* (menggunakan `Playwright`) untuk alur klik *user*.
- [x] **4. Interactive Onboarding & a11y**: Menambahkan *Onboarding Tour* (misal dengan `Shepherd.js`) untuk memandu *user* baru menggunakan panel kompleks, serta meningkatkan navigasi ARIA dan *keyboard* (Aksesibilitas).
