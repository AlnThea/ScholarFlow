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
- components/editor/editor-sidebar.tsx: Mengekstrak 4 sub-panel (Library, Writing, Document, Comments) ke komponen modular terpisah, memangkas ukuran dari 1.446 baris menjadi ~661 baris.
- components/editor/editorjs-editor.tsx: Mengekstrak Custom EditorJS Tools dan helpers (~280 baris) ke lib/editor/editor-tools.ts.
- components/editor/scholar-editor.tsx: Mengekstrak ~150 baris fungsi utilitas murni ke lib/editor/editor-utils.tsx.
- pp/shared/[id]/page.tsx: Mengekstrak SharedSidebar dan SharedBubbleMenu ke komponen modular, mengurangi ukuran file dari 3.189 baris menjadi ~2.260 baris.
- Mengganti SuggestionModal yang duplikat dengan impor komponen yang sudah ada.
- Membuat hooks/use-shared-document-sync.ts sebagai fondasi untuk memisahkan logika sinkronisasi realtime.
- Mengekstrak **Dashboard View & Admin Panel** (>1.100 baris kode) ke dalam components/editor/dashboard-view.tsx.
- Menggantikan kode dashboard di dalam ditor-layout.tsx dengan komponen <DashboardView />.
- Memastikan semua _props_ dikirimkan dengan benar tanpa merusak fungsionalitas.
- Mengekstrak **AI History Modal** ke dalam `components/editor/modals/ai-history-modal.tsx`, memangkas ukuran `components/editor/editor-sidebar.tsx` dari 756 baris menjadi 571 baris kode.
- **Phase 23 (v0.9.9)**: Mengembangkan asisten interaktif **Chat with Paper / Literature Q&A** (`components/editor/modals/paper-chat-modal.tsx`, `app/api/v1/ai/paper-chat/route.ts`, `lib/ai/paper-chat.ts`) dengan quick question pills akademis, ekstraksi metodologi/sampel/temuan/batasan, jembatan 1-klik kutip jawaban ke editor dengan tag `<cite>`, dan tabel sinkronisasi cloud `paper_conversations` (`supabase/migrations/20261016000002_create_paper_conversations.sql`).
- **Phase 24 (v1.0.0)**: Membangun **Plagiarism & AI-Likeness Real-Time Warning Barometer (Academic Integrity Index)** (`lib/editor/academic-integrity.ts`, `components/editor/academic-integrity-barometer.tsx`, `components/editor/academic-integrity-pill.tsx`) dengan visualisasi speedometer SVG real-time, 4 sub-gauge metrik (Burstiness CV, Lexical Diversity TTR, Densitas Klise AI, Cadence Balance), penyorot kanvas heatmap interaktif, dan navigasi 1-klik ke Paraphrase Studio untuk humanisasi kalimat.
- **Phase 25 (v1.0.1)**: Mengimplementasikan **AI Peer Reviewer & Journal Readiness Audit Simulation (Reviewer #2 Simulator)** (`lib/editor/peer-reviewer.ts`, `app/api/v1/ai/peer-review/route.ts`, `components/editor/modals/peer-review-modal.tsx`) dengan persona Reviewer #2 hyper-kritis, target reputasi jurnal (Scopus Q1/Q2, SINTA 1/2), 4 kartu rubrik evaluasi saintifik mendalam, pertanyaan pembelaan kritis (Critical Inquiries), checklist kesiapan submisi, tombol akses cepat di `editor-header.tsx`, dan kartu peluncur di tab Dokumen sidebar.
- **Phase 26 (v1.1.0)**: Menghadirkan **Academic Command Palette (Ctrl+K) & Global Keyboard Shortcuts Hub** (`lib/editor/command-palette.ts`, `components/editor/modals/command-palette-modal.tsx`, `components/editor/modals/shortcuts-modal.tsx`) dengan pencarian spotlight cepat, 7 kategori aksi terorganisir, drawer tooltip penjelasan manfaat aksi real-time, cheat sheet visual pintasan keyboard (tombol `?`), tombol akses cepat di header, dan navigasi keyboard penuh.
- **Phase 27 (v1.2.0)**: Membangun **Academic LaTeX & Journal Format Package Exporter (.tex + .bib Zip)** (`lib/editor/latex-exporter.ts`, `components/editor/modals/latex-export-modal.tsx`) dengan konversi blok naskah ke sintaks LaTeX standar, 4 template jurnal ilmiah (IEEE 2-Column, Elsevier elsarticle, ACM SIGCONF, arXiv Pre-print), bundler BibTeX otomatis, live code preview, tombol salin kode, dan pengemasan arsip .zip siap kompilasi Overleaf via JSZip.
- **Phase 28 (v1.3.0)**: Mengembangkan **Drag & Drop Reference Importer (.bib, .ris, & PDF metadata)** (`lib/editor/reference-importer.ts`, `components/editor/reference-dropzone.tsx`, `components/editor/modals/reference-import-modal.tsx`) dengan dukungan ekstraksi file BibTeX Zotero/Overleaf, multi-record RIS Mendeley/EndNote, ekstraksi DOI saintifik & judul dari dokumen PDF, modal pratinjau seleksi batch paper dengan tooltip informatif, tombol "Impor Berkas" langsung di tab Pustaka sidebar, serta pintasan keyboard `Ctrl+Shift+U` dan Command Palette.

- **Phase 29 (v1.4.0)**: Menghadirkan **Live "Track Changes" / Suggesting Mode** (components/editor/suggesting-mode.tsx, components/editor/suggesting-chips.tsx, lib/editor/suggesting-engine.ts, lib/editor/methods/suggestion-methods.ts) dengan toggle mode segmented (Editing vs Suggesting), markup coretan merah <del> dan garis bawah hijau <ins>, sanitasi atribut preservasi XSS, floating chips tinjauan usulan, dropdown review batch "Terima Semua" / "Tolak Semua", serta pendaftaran aksi pintasan keyboard Ctrl+Shift+S.

- **Phase 30 (v1.5.0)**: Mengembangkan **Figure & Table Scientific Auto-Numbering Engine** (lib/editor/cross-reference.ts, lib/editor/methods/cross-reference-methods.ts, components/editor/modals/cross-reference-modal.tsx) dengan pengindeksan sekuensial otomatis Gambar & Tabel, pembaruan reaktif rujukan silang di badan teks saat posisi blok berpindah, pemetaan shorthand syntax (@fig, @tab), modal dialog pemilih rujukan, interaksi klik lompat *smooth scroll* dengan sorotan cincin animasi, dan pintasan Ctrl+Shift+B.

**Selanjutnya:**
- Mengimplementasikan pemindahan logika dan komponen React dari `editor-layout.tsx` ke file-file tersebut.
- Menyambungkan (import) komponen yang diekstrak kembali ke `editor-layout.tsx` tanpa merusak *state* atau menghapus fungsionalitas aslinya.


- **Phase 31 (v0.31.0)**: Mengembangkan **Academic Thesis/Paper Outline & Structure Generator** (`lib/editor/academic-templates.ts`, `app/api/v1/ai/generate-outline/route.ts`, `lib/editor/methods/outline-scaffold.ts`, `components/editor/modals/academic-scaffold-modal.tsx`) dengan 4 preset struktur ilmiah standar (IMRaD Scopus/WoS, 5 Bab Skripsi Dikti, PRISMA 2020 SLR, Studi Kasus), takarir panduan penulisan per sub-bab, checklist metodologi, endpoint AI personalisasi outline berbasis judul/metode riset, konversi blok EditorJS cerdas, modal interaktif dwibahasa & dark mode, serta pintasan keyboard `Ctrl + Shift + O`.

- **Phase 32 (v0.32.0)**: Mengembangkan **Smart In-Text Reference Mention (`@cite` / `@ref`) & Quick Citation Injector** (`lib/editor/mention-parser.ts`, `lib/editor/reference-search-index.ts`, `components/editor/citation-mention-dropdown.tsx`, `lib/editor/methods/mention-injector.ts`, `hooks/use-citation-mention.ts`) dengan pendeteksi token mention aktif di kursor, kalkulator koordinat kursor `getBoundingClientRect()`, pengindeks pustaka lokal berkecepatan tinggi multi-field dengan fallback pencarian awan Crossref/OpenAlex, popover dropdown mengambang berorientasi keyboard (`↑`, `↓`, `Enter`, `Esc`), injeksi tag `<cite>` non-destruktif ke EditorJS, dark mode & bilingual EN/ID, serta dokumentasi pintasan di modal shortcut (13 unit test baru, total 164/164 lulus).
