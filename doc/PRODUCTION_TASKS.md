# ScholarFlow Production-Ready Master Task & Roadmap Checklist

Dokumen ini berisi daftar lengkap status fitur yang telah diselesaikan (*Completed Features*) dan Roadmap Refactoring Arsitektur **ScholarFlow** (AI Academic & Research Co-pilot) menuju Production-Ready, Hybrid Sync, dan Multi-Backend / Multi-Database Agnostic.

---

## 🚀 Overview Arsitektur
- **Frontend Framework**: Next.js (App Router), TypeScript Strict Mode, Tailwind CSS, Tiptap / Editor.js, KaTeX.
- **Backend Options (`BACKEND_TYPE`)**:
  - `supabase`: Serverless PaaS (Vercel / Cloudflare + Supabase Auth & DB PostgreSQL).
  - `express`: Self-Hosted VPS (Express.js REST API + PostgreSQL / MySQL / MariaDB via Docker / aaPanel).
- **Sync Engine**: Hybrid Engine (Supabase Realtime WebSocket dengan Fallback Otomatis 3x Failover ke HTTP Polling dengan Page Visibility Guard).
- **AI Integration**: Google Gemini 2.0 Flash API (Streaming Response & Edge Rate Limiting 15 RPM).

---

## ✅ BAGIAN A: FITUR & PERBAIKAN YANG TELAH SELESAI (COMPLETED SPRINT TASKS)

### 1. Document Export & Media Formatting
- [x] **1.1 MS Word MHTML Export** - Transisi ekspor Word (`.doc`) dari HTML biasa ke MHTML (multipart/related) untuk menyematkan gambar base64, blob, dan eksternal secara sempurna.
- [x] **1.2 High-Fidelity PDF Export** - Implementasi ekspor PDF sisi klien dengan dynamic print iframe.
- [x] **1.3 Highlight Background & Alignment Mapping** - Pemetaan warna highlight teks ke inline `background-color` span tags dan alignment paragraf untuk Word export.
- [x] **1.4 Direct Export & Consolidated Menu** - Penggabungan tombol ekspor Word dan PDF ke dalam satu dropdown 'Export' di header layout tanpa popup konfirmasi berlebih.
- [x] **1.5 Free Tier Bibliography Restriction** - Penguncian ekspor daftar pustaka untuk paket Free Tier dengan modal kustom React portal upgrade lock.

### 2. Internationalization (i18n) & Localization
- [x] **2.1 Bilingual Context Provider** - Implementasi `LanguageProvider` dan hook `useLanguage` untuk mendukung Bahasa Indonesia dan Bahasa Inggris secara dinamis.
- [x] **2.2 UI Localization** - Lokalialisasi penuh komponen editor layout, sidebar, modal konfirmasi, setup wizard, checkout Stripe/Midtrans, dan LaTeX Math Helper.
- [x] **2.3 AI Backend Localization** - Penyesuaian sintesis, penyuntingan, dan pembuatan abstrak AI agar merespons sesuai bahasa target dokumen.
- [x] **2.4 Template Localization Guide** - Panduan teknis pengesetkan templat akademik kustom & i18n di `doc/TEMPLATE_LOCALIZATION_GUIDE.md`.

### 3. UI/UX & Navigation Redesign
- [x] **3.1 Settings & Navigation Menu Redesign** - Redesain sidebar pengaturan admin, menu utama, dan bantuan menjadi tampilan menu-list terkelompok dengan sub-judul deskriptif.
- [x] **3.2 My Documents File Explorer Tree** - Redesain panel My Documents menjadi struktur file explorer tree premium dan pembatasan 15 item independen untuk mencegah kekacauan visual.
- [x] **3.3 Centralized Document Creation** - Pemindahan dan pemusatan aksi 'Create New Document' ke dalam panel My Documents.

### 4. Custom React Portals & Interactive Modals
- [x] **4.1 Inline Math Equation Modal** - Penggantian prompt bawaan browser saat mengedit rumus inline dengan React Math Modal custom.
- [x] **4.2 Hyperlink Portal Modal** - Modal custom untuk menyisipkan, mengedit URL, dan menghapus tautan (*unlink*) beserta deteksi status aktif tombol toolbar.
- [x] **4.3 Color Picker Popover** - Popover pemilih warna highlight berbentuk blok persegi dengan dukungan unhighlighting.
- [x] **4.4 Interactive Help & Documentation Modal** - Jendela bantuan interaktif (`HelpModal`) 4 modul (Templat, AI Co-Pilot, Sitasi PDF/RIS, Multi-Backend) yang terhubung ke sidebar navigasi.

### 5. Collaboration & History Management
- [x] **5.1 Public Document Sharing (`/shared/[id]`)** - Moda Read-Only dan Co-Editor untuk kolaborasi dokumen publik.
- [x] **5.2 Suggestions History Sub-tabs** - Sub-tab riwayat usulan diterima & ditolak (Accepted & Rejected Suggestions) dengan dukungan i18n.
- [x] **5.3 Header Badge & User Auth Chip** - Indikator status login pengguna (Logged In vs Guest) serta badge notifikasi aktif untuk komentar dan usulan.
- [x] **5.4 Page Visibility API Integration** - Penggunaan `document.visibilityState` untuk menghentikan sementara polling latar belakang saat tab browser tidak aktif.

### 6. Admin AI Gateway & Custom Provider Integration
- [x] **6.1 Admin AI Models 2-Section Redesign** - Redesain tampilan `/admin/models` menjadi 2 kelompok kartu (Free Tier vs Pro Writer) dengan gaya enterprise `rounded-xl`, stats overview bar, dan tombol toggle status 1-click.
- [x] **6.2 Custom OpenAI-Compatible Provider Support** - Dukungan integrasi penjual API key pihak ketiga, proxy LLM kustom (OneAPI, NewAPI, Groq, Together, LM Studio, Ollama), serta input Base URL kustom dan API Key kustom di modal Admin.


---

## 📋 BAGIAN B: ROADMAP PRODUCTION-READY & HYBRID MULTI-BACKEND (EPIC 1 - 5)

### 📋 EPIC 1: Database & Backend Abstraction (Repository / Data Provider Pattern)
- [x] **1.1 Interface Abstraksi `DataService`**
  - [x] Buat contract interface `IDataService` unified untuk CRUD Dokumen, Profil User, Citations, dan Catalog Pricing di `@/lib/services/types.ts`.
  - [x] Implementasikan Data Types strict tanpa mengandalkan tipe bawaan Supabase SDK murni.
- [x] **1.2 Adapter `SupabaseDataService`**
  - [x] Implementasikan `IDataService` menggunakan Client Supabase Auth & Database (`@supabase/supabase-js`).
  - [x] Dukungan Row Level Security (RLS) dan penanganan token session secara transparan.
- [x] **1.3 Adapter `ExpressDataService`**
  - [x] Implementasikan `IDataService` menggunakan HTTP Client (`fetch`/`axios`) yang terhubung ke API Express.js.
  - [x] Tambahkan handling JWT Auth Header (`Authorization: Bearer <token>`).
  - [x] Garansi skema kompatibel untuk PostgreSQL, MySQL, dan MariaDB.
- [x] **1.4 Service Factory & Injector (`@/lib/services/index.ts`)**
  - [x] Implementasikan Factory Pattern berdasarkan variabel lingkungan `process.env.NEXT_PUBLIC_BACKEND_TYPE` (`supabase` vs `express`).
  - [x] Sediakan React Context Provider (`DataProvider`) untuk kemudahan injeksi service ke seluruh komponen Next.js.


---

### 🌐 EPIC 2: Multi-Hosting Adapters (Deployment Flexibility)
- [x] **2.1 Vercel & Edge Runtime Adapter**
  - [x] Pastikan seluruh API Route Next.js aman dijalankan di Vercel Edge Runtime.
  - [x] Hilangkan dependensi modul Node.js murni (seperti `fs`, `path`, `child_process`) pada handler client-side dan edge routes.
- [x] **2.2 Cloudflare Pages / Workers Compatibility Layer**
  - [x] Konfigurasi `next.config.mjs` & runtime target agar siap untuk Cloudflare OpenNext / static export / edge adapters.
- [x] **2.3 VPS / Docker Containerization (Express.js Backend)**
  - [x] Sediakan `Dockerfile` & `docker-compose.yml` untuk REST API Express.js backend (siap deploy di aaPanel / VPS).
  - [x] Sediakan contoh konfigurasi Nginx Reverse Proxy & SSL (HTTPS/WSS) untuk server Express.js.


---

### ⚡ EPIC 3: Hybrid Realtime & Polling Sync Engine
- [x] **3.1 Hybrid Sync Manager Core**
  - [x] Buat modul `HybridSyncEngine` yang mengelola koneksi dokumen real-time.
- [x] **3.2 Supabase WebSocket Realtime Channel**
  - [x] Langganan perubahan dokumen via WebSocket Supabase Realtime channel (`postgres_changes`).
- [x] **3.3 Express.js Smart HTTP Polling Engine**
  - [x] Polling adaptif dengan interval dinamis (misal: 3 detik saat aktif, 15 detik saat idle).
- [x] **3.4 Auto-Fallback & Recovery System**
  - [x] Deteksi terputusnya koneksi WebSocket 3 kali berturut-turut -> otomatis beralih (*failover*) ke HTTP Polling.
  - [x] Percobaan rekonfigurasi (*re-connect*) WebSocket di latar belakang secara periodik.
- [x] **3.5 Page Visibility Guard**
  - [x] Integrasi `document.visibilityState` untuk menjeda (*pause*) polling & WebSocket heartbeat saat tab browser tidak aktif demi menghemat memori & kuota server.


---

### 🧠 EPIC 4: AI Engine & Performance Optimization
- [x] **4.1 Gemini 2.0 Flash Streaming Integration**
  - [x] Upgrade API route `/api/v1/ai/improve` dan `/api/v1/ai/abstract` untuk mendukung **Server-Sent Events (SSE) / Streaming** Gemini 2.0 Flash API.
- [x] **4.2 Edge Rate Limiting & Queueing**
  - [x] Implementasikan Rate Limiter 15 Request Per Minute (RPM) berbasis Token Bucket / Sliding Window (kompatibel Vercel KV / In-Memory).
- [x] **4.3 Lazy Loading & Bundle Splitting**
  - [x] Dynamic import untuk Tiptap Extension, KaTeX Math Block, dan PDF.js viewer untuk mempercepat First Contentful Paint (FCP).
- [x] **4.4 Edge-Safe API Routes Guard**
  - [x] Refactor endpoint PDF parsing / RIS parsing agar menggunakan parser berbasis In-Memory TypedArray yang aman di lingkungan Serverless & Edge.


---

### 🛡️ EPIC 5: Testing & Production Readiness
- [x] **5.1 Multi-DB Schema & Migration Guide**
  - [x] Buat `prisma/schema.prisma` atau SQL Schema DDL yang identik untuk PostgreSQL dan MySQL.
- [x] **5.2 Security & RLS Audit**
  - [x] Audit RLS Supabase & middleware autentikasi Express.js untuk memastikan akses dokumen tersertifikasi secara ketat (`user_id` validation).
- [x] **5.3 Resilience & Failure Recovery Testing**
  - [x] Uji skenario offline/online, failover sync, error handling API fallback, dan validasi data Pydantic/Zod.


---

### 📊 EPIC 6: Bibliometric Analysis & Research Discovery
- [x] **6.1 Bibliometric Dashboard UI**
  - [x] Halaman utama pencarian bibliometrik di `/app/dashboard/bibliometric/page.tsx`.
- [x] **6.2 OpenAlex Metadata Fetcher API**
  - [x] Endpoint API `/api/bibliometric/search` untuk menarik metadata literatur.
- [x] **6.3 Network & Trend Visualization**
  - [x] Integrasi `echarts-for-react` (Keyword Network) dan `recharts` (Timeline).
- [x] **6.4 Editor Export Bridge**
  - [x] Fitur "Export Insight to Editor" (AI Summary) & Save to Library.

---

### 📚 EPIC 7: Centralized Library Management ("My Library")
- [x] **7.1 Library Dashboard UI**
  - [x] Halaman utama manajemen pustaka di `/app/dashboard/library/page.tsx` dengan layout tabel/list modern.
- [x] **7.2 CRUD Operations & Metadata Sync**
  - [x] Fitur Edit, Delete, dan pengelompokan referensi.
- [x] **7.3 Bulk Import & PDF Upload**
  - [x] Integrasi import file `.ris` / `BibTeX` dan upload PDF untuk ekstraksi metadata otomatis.

---

### ✍️ EPIC 8: Next-Gen Academic Writing & Document Intelligence (Phases 20 - 24)
- [x] **8.1 Real-Time Inline AI Ghostwriter (Tab to Accept ala Jenni AI)**
  - [x] Debounced completion engine (1.3s typing pause) dengan pemotongan konteks cerdas.
  - [x] Non-destructive Ghost Text visual render di kursor kanvas.
  - [x] Interaksi tombol keyboard: `Tab` (accept all), `Esc` (dismiss), `Ctrl+J` (toggle).
- [x] **8.2 Document Version History & Time-Machine Snapshot (Diff & Rollback)**
  - [x] Skema database/storage `document_revisions` untuk snapshot berkala & manual.
  - [x] Slide-over Version History panel dengan Visual Diff Viewer (penambahan hijau, penghapusan merah).
  - [x] 1-klik restore version mengembalikan naskah kanvas ke kondisi revisi yang dipilih.
- [x] **8.3 Bidirectional In-Text Citation Style Transformer (APA ↔ IEEE ↔ Harvard ↔ Vancouver)**
  - [x] AST & regex transformer mengubah penanda sitasi di dalam teks kanvas secara dinamis.
  - [x] Re-indexing & re-ordering otomatis daftar pustaka (Bibliography) mengikuti urutan sitasi numerik.
  - [x] Switcher dropdown di toolbar editor mendukung APA, IEEE, Harvard, Vancouver, dan MLA.
- [x] **8.4 Interactive Library Paper Q&A Assistant ("Chat with Papers")**
  - [x] Sub-panel tanya-jawab literatur di dalam `SidebarLibraryTab`.
  - [x] Ekstraksi metodologi, temuan kunci, dan limitasi dari paper referensi PDF/metadata.
  - [x] Tombol aksi "Kutip Jawaban ke Editor" menyertakan sitasi ilmiah otomatis.
- [x] **8.5 Plagiarism & AI-Likeness Real-Time Warning Barometer (Academic Integrity Index)**
  - [x] Mesin kalkulasi komposit: Burstiness, Perplexity, Lexical Repetition, dan klise AI.
  - [x] UI Barometer / Gauge Meter di sudut kanvas editor (0-100% orisinalitas).
  - [x] Heatmap sorotan interaktif memandu ke kalimat berisiko tinggi dengan parafrase instan.

---

### 🔬 EPIC 9: Peer Review & Scientific Publication Engine (Phases 25 - 29)
- [x] **9.1 AI Peer Reviewer & Journal Readiness Audit Simulation (Reviewer #2 Simulator)**
  - [x] Evaluasi metodologi, klaim kebaruan, koherensi alur argumen, checklist kesiapan submit Scopus/SINTA.
- [x] **9.2 Academic Command Palette (Ctrl+K) & Shortcuts Hub**
  - [x] Spotlight search 18+ perintah akademis, visual cheat sheet pintasan (`?`), dan drawer penjelasan manfaat aksi.
- [x] **9.3 Academic LaTeX & Journal Format Package Exporter (.tex + .bib Zip)**
  - [x] Serializer blok ke LaTeX standar IEEE, Elsevier, ACM, arXiv, bundler BibTeX otomatis, dan zip generator Overleaf.
- [x] **9.4 Drag & Drop Reference Importer (.bib, .ris, & PDF metadata)**
  - [x] Parser BibTeX & RIS, regex ekstraksi DOI PDF, dan modal import seleksi batch.
- [x] **9.5 Live "Track Changes" / Suggesting Mode**
  - [x] Mode beralih Direct Edit vs Suggesting, visual diff markup `<del>` (merah) & `<ins>` (hijau), floating action chips, tombol batch Accept/Reject All, dan shortcut `Ctrl+Shift+S`.
- [x] **9.6 Figure & Table Scientific Auto-Numbering Engine (Phase 30)**
  - [x] Pengindeksan sekuensial gambar & tabel, pembaruan reaktif rujukan silang di badan teks, shorthand `@fig`/`@tab`, modal dialog pemilih rujukan, interaksi jump *smooth scroll* dengan sorotan cincin animasi, dan shortcut `Ctrl+Shift+B`.

---

### 🏛️ EPIC 10: Academic Scaffolding, Fast Mentions & Multi-Chapter Project Binder (Phases 31 - 33)
- [x] **10.1 Interactive Academic Thesis/Paper Outline & Structure Generator (Phase 31)**
  - [x] Pembuat kerangka naskah terstruktur berbasis IMRaD dan standar 5 Bab Skripsi/Tesis Dikti dengan AI research guiding prompts.
  - [x] Generator blok EditorJS cerdas dengan checklist kepatuhan penulisan di setiap sub-bab.
- [x] **10.2 Smart In-Text Reference Mention (`@cite` / `@ref`) & Quick Citation Injector (Phase 32)**
  - [x] Auto-complete popup saat mengetik `@cite:`, `@ref:`, atau `@` di kanvas EditorJS untuk mencari paper dari koleksi pustaka (*My Library*) dan menyisipkan sitasi `<cite>` secara instan.
  - [x] Mesin pengindeksan referensi multi-field in-memory dengan fallback query Crossref/OpenAlex.
  - [x] Floating dropdown overlay dengan navigasi keyboard (`↑`, `↓`, `Enter`, `Esc`), Dark Mode, dan bilingual (EN ↔ ID).
  - [x] Penggantian token mention non-destruktif dengan tag `<cite>` dan sinkronisasi reaktif daftar pustaka.
- [x] **10.3 Multi-Chapter Thesis & Dissertation Project Binder (Phase 33)**
  - [x] Manajemen proyek skripsi multi-dokumen (Bab 1 s.d. Bab 5) dengan penomoran gambar/tabel berkesinambungan dan konsolidasi daftar pustaka bersama.

---

### 🖋️ EPIC 11: Advanced Language Rigour & Synthesis Tools (Phases 34 - 36)
- [x] **11.1 Academic Grammar, Formality & Style Linter (Phase 34)**
  - [x] Mesin pendeteksi anti-pattern penulisan saintifik (slang/informal, kontraksi percakapan, klaim generalisasi tanpa rujukan, bias persona pertama) dengan kamus aturan linguistik dwibahasa (EN / ID).
  - [x] Modal audit gaya naskah interaktif dengan visualisasi skor formalitas akademik (Grade A s.d. D), filter kategori, dan tombol 1-klik penggantian teks resmi.
- [x] **11.2 Conference & Thesis Defense Slide Deck Generator (Phase 35)**
  - [x] Sintesis sekuensial blok naskah EditorJS menjadi 9 slide presentasi sidang akademik standar (Judul, Masalah, Tujuan, Teori, Metodologi, Temuan, Pembahasan, Kesimpulan, Rujukan).
  - [x] Modal preview slide interaktif rasio 16:9 dengan carousel tombol / keyboard, drawer catatan pembicara (*Speaker Notes*), 3 pilihan tema desain visual, ekspor Marp Markdown, dan unduh berkas presentasi HTML offline mandiri.
- [x] **11.3 Interactive Literature Matrix & Synthesis Grid (Phase 36)**
  - [x] Ekstraksi dan tabelisasi otomatis paper referensi ke dalam format matriks komparasi saintifik standar (Studi/Sitasi, Judul, Metodologi, Ukuran Sampel, Temuan Empiris Utama, Batasan Riset, dan Catatan Sintesis).
  - [x] Modal grid interaktif dengan pengeditan sel langsung (*inline editing*), filter pencarian & kategori tag (SLR, Kuantitatif, Kualitatif, Machine Learning), ekspor Markdown Table, unduh berkas CSV (RFC 4180), dan injeksi blok tabel langsung ke kanvas naskah Bab 2 EditorJS.

---

### 📚 EPIC 12: Journal Publishing Prep & Visual Concept Mapping (Phases 37 - 39)
- [x] **12.1 Journal Formatting & Publishing Presets Configurator (Phase 37)**
  - [x] Basis data preset kepatuhan penerbit ilmiah otoritatif (IEEE Transactions, Elsevier ScienceDirect, Springer Nature, SINTA 1 & 2 Dikti, PLOS ONE).
  - [x] Mesin audit kesiapan naskah real-time mengevaluasi batas kata total, batas panjang abstrak, kuota gambar/tabel, persentase kemutakhiran rujukan (< 5 tahun), dan format gaya sitasi aktif.
  - [x] Modal scorecard kepatuhan publikasi dengan predikat status visual (*Submission Ready*, *Minor Adjustments*, *Substantial Revisions*), tombol penerapan gaya sitasi 1-klik, kartu peluncur di tab Dokumen sidebar, dan shortcut `Ctrl + Shift + J`.
- [x] **12.2 Cross-Paper Concept Map & Citation Network Visualizer (Phase 38)**
  - [x] Ekstraksi kata kunci konsep akademik otomatis (pembersihan stopword multi-bahasa EN & ID, frekuensi kemunculan kata), klasifikasi kluster tematik (Metodologi, Teori, Empiris, Komputasi, Domain Aplikasi), dan penentuan nodus sentral (*Degree Centrality* & densitas graf).
  - [x] Deteksi tautan konsep antar-paper referensi pustaka (*Jaccard Similarity* & irisan kata kunci riset) serta penempatan koordinat tata letak radial SVG 2D.
  - [x] Modal visualisasi graf jaringan interaktif dengan bobot ukuran nodus dinamis, sorotan animasi cincin (*pulse ring*) pada paper sentral, penyorotan tetangga (*neighbor highlighting*) saat hover/klik, drawer laci inspeksi detail sitasi, filter pil kluster, ekspor diagram Mermaid, peluncur kartu tab Dokumen sidebar, command palette `cmd_concept_map`, dan shortcut `Ctrl + Shift + N`.
- [x] **12.3 Automated Journal Submission Package Builder & Cover Letter AI (Phase 39)**
  - [x] Sintesis surat pengantar resmi (*Cover Letter AI*) ke Editor-in-Chief dengan takarir kebaruan riset, keselarasan ruang lingkup jurnal, dan jaminan orisinalitas dalam dwibahasa (EN / ID).
  - [x] Penyusun deklarasi etika publikasi: bebas konflik kepentingan (*Conflict of Interest*), sumber pendanaan hibah (*Funding Disclosure*), dan ketersediaan data riset (*Data Availability Statement*).
  - [x] Generator rekomendasi mitra bestari (*Suggested Peer Reviewers*) independen yang disaring secara otomatis dari pustaka sitasi.
  - [x] Ekstraksi poin kebaruan utama (*Research Highlights*) ringkas (≤ 85 karakter) standar Elsevier / IEEE dan ringkasan inventarisasi naskah (kata total, abstrak, tabel, gambar, referensi).
  - [x] Modal interaktif paket pengajuan jurnal, ekspor Markdown lengkap, unduh berkas .txt/.md, kartu peluncur tab Dokumen sidebar, command palette `cmd_submission_package`, dan shortcut `Ctrl + Shift + Y`.

---

### 🛡️ EPIC 13: Canvas & Document Editor Interaction Hardening & Data Flow Reliability (Phase 40)
- [x] **13.1 Smart In-Text Mention (`@cite` / `@ref`) Holder ID Synchronization**
  - [x] Perbaikan `holderId` di `useCitationMention` dan `editor-layout.tsx` dari `scholarflow-editor` ke `editorjs-holder` dengan fallback selektor `.codex-editor` agar pengetikan `@cite:` atau `@` selalu berhasil memicu popup kandidat referensi pada kanvas aktif.
- [x] **13.2 Literature Matrix Canvas Table Injection Bridge**
  - [x] Memperbaiki `onInjectTableToEditor` pada `LiteratureMatrixModal` agar menggunakan `editorJsRef.current?.insertBlocks([tableBlock])` menggantikan `editorJsRef?.current?.blocks?.insert` yang tidak terdefinisi pada wrapper, sehingga tabel komparasi matriks Bab 2 langsung muncul di kanvas aktif.
- [x] **13.3 Academic Scaffold Outline Persistence & Auto-Save Sync**
  - [x] Memastikan `onApplyBlocks` pada `AcademicScaffoldModal` memanggil `onContentChange(newDocContent)` segera setelah memuat blok outline baru ke DOM, mencegah hilangnya draf kerangka naskah saat refresh browser atau autosave.
- [x] **13.4 Academic Linter 1-Click Fix DOM Target & Autosave Synchronization**
  - [x] Memperbarui selektor DOM pada `AcademicLinterModal.onApplyFix` ke `#editorjs-holder` dan menyinkronkan perubahan kata langsung ke `onContentChange` agar perbaikan gaya bahasa tersimpan secara persisten.
- [x] **13.5 Resilient Citation Insertion Fallback on Library Action**
  - [x] Menambahkan fallback cerdas pada `insertCitation` di `citation-methods.ts`: jika pengguna mengklik "Sisipkan Sitasi" dari sidebar tanpa seleksi kursor yang aktif, sitasi disisipkan pada akhir blok aktif atau blok paragraf terakhir tanpa kegagalan hening (*silent failure*).

---

### ⚡ EPIC 14: Editor Canvas Lifecycle, Block Persistence & Rich Content Bridge (Phase 41)
- [x] **14.1 Unified `render` and `renderContent` Method Interface**
  - [x] Menambahkan method alias `render` pada wrapper `buildBlockMethods` dan menyelaraskan pemanggilan `renderContent` di `hooks/use-editor-document.ts` dan `hooks/use-version-history.ts`, sehingga perubahan gaya sitasi (APA ↔ IEEE ↔ Vancouver) dan pemulihan snapshot versi langsung me-render ulang kanvas naskah.
- [x] **14.2 AI History Studio Text Insertion Bridge (`handleInsertSynthesizedText`)**
  - [x] Memperbarui `handleInsertSynthesizedText` di `components/editor/scholar-editor.tsx` agar menerima parameter `customText?: string`, sehingga tombol "Apply to Canvas" di modal riwayat AI berhasil menyisipkan teks yang dipilih ke dokumen pengguna.
- [x] **14.3 Rich HTML Contextual Insertion Bridge (`insertHtmlAtCursor`)**
  - [x] Memperkuat `insertHtmlAtCursor` di `lib/editor/methods/inline-methods.ts` dengan pemulihan rentang kursor aktif (`targetRange`), penyisipan kontekstual via `createContextualFragment(html)` tanpa memangkas tag `<cite>`, dispatch event `input`, dan auto-save ke `onContentChange`.
- [x] **14.4 Toolbar & Menu Block Auto-Save Persistence**
  - [x] Menyambungkan pemicu `saveCleanContent().then(onContentChange)` pada seluruh aksi penyisipan blok di `lib/editor/methods/block-methods.ts` (`insertImage`, `insertTable`, `insertCodeBlock`, `insertMathBlock`, `insertBibliographyText`, dan `setBlockType`) agar perubahan tersimpan otomatis ke database.
- [x] **14.5 Safe Suggestion Text Replacement & DOM Event Dispatching**
  - [x] Memperbaiki `addSuggestionMark` di `lib/editor/methods/suggestion-methods.ts` agar menggantikan teks target (`oldText`) dengan markup usulan alih-alih menduplikasi teks, serta menambahkan dispatching event `input` pada seluruh aksi tinjauan usulan.

---

### 🛡️ EPIC 15: Latent Compilation, Icon Import, API Key Pool & Scoping Resilience Audit (Phase 42)
- [x] **15.1 Tabler Icons Import Resolution**
  - [x] Mengoreksi impor ikon yang salah atau tidak terdaftar (`IconSpellCheck` -> `IconTextSpellcheck` pada `AcademicLinterModal` & `SidebarDocumentTab`; `IconBookOpen` -> `IconBook` pada `ConceptMapModal` & `LiteratureMatrixModal`).
- [x] **15.2 Component Props & Quota Fallback Destructuring**
  - [x] Mendestrukturkan prop `externalTargetSentence` pada `ParaphraseStudio` dan menambahkan fallback `latestResult.monthly_quota || 0` saat memanggil `saveLocalQuotaState`.
  - [x] Menambahkan kolom `institution?: string | null` pada `UserProfile` (`components/auth/auth-provider.tsx`).
- [x] **15.3 Editor Layout & Modal Props Hardening**
  - [x] Mengganti `currentUser?.id` menjadi `user?.id` pada `AcademicScaffoldModal` di `editor-layout.tsx`.
  - [x] Menyelaraskan alert modal type dari `'danger'` ke `'error'` pada notifikasi impor dan version history.
  - [x] Memperbarui prop `PeerReviewModal` caller (`userId={user?.id}`, `userPlan={activePlanId || 'free'}`).
  - [x] Menambahkan type cast aman `(editorJsRef.current as any)?.saveCleanContent`.
- [x] **15.4 AI Key Pool & Background Generation Logging Scoping**
  - [x] Mengangkat deklarasi `let aiGenerationId: string | null = null;` ke luar blok `try` pada `interpret-stats/route.ts` sehingga error catch block dapat mencatat kegagalan generasi ke Supabase.
  - [x] Mengoreksi signature panggilan `geminiKeyPool.execute<string>` (`customApiKey` alih-alih `{ customKey }`), memetakan `tenantKeyRes.customKey`, serta merestrukturisasi payload `completeAiGeneration`.
  - [x] Memodernisasi `generate-outline/route.ts` agar memanfaatkan multi-key rotation and failover otomatis via `geminiKeyPool.execute`.
- [x] **15.5 Complete Static Type Check & Vitest Verification**
  - [x] Memverifikasi kelulusan penuh `npx tsc --noEmit` dengan **0 error**, serta **218/218 pengujian Vitest lulus pada 27 berkas**.

---

### ⚡ EPIC 16: Autosave Debounce, DOM Mutation Shielding & Loop Resolution (Phase 43)
- [x] **16.1 EditorJS Mount & Mutation Shielding**
  - [x] Mengonsolidasikan aksi pasca-render DOM ke dalam `editor.render().then(...)` dan menahan flag `isRenderingRef` selama 400ms untuk mencegah mutasi KaTeX & textarea memicu `onChange`.
- [x] **16.2 Symmetric Block Content Normalization**
  - [x] Mengimplementasikan `normalizeBlockDataForComparison` di `getContentComparisonString` untuk menstandarkan data blok, membersihkan spasi `&nbsp;`, dan mengabaikan perbedaan ID blok ephemeral.
- [x] **16.3 State Referential Equality & Fast Check Guard**
  - [x] Menambahkan fast dirty check guard di `triggerDebouncedSave` untuk membatalkan simpan redundan dan mempertahankan referensi state `currentDocument` jika tidak ada perubahan nilai.

---

### 🎯 EPIC 17: Editor.js Toolbar Vertical Alignment & Heading Typography Normalization (Phase 44)
- [x] **17.1 Heading Baseline & Padding Normalization**
  - [x] Mengganti padding default `@editorjs/header` menjadi `padding-top: 2px !important; padding-bottom: 4px !important; margin: 0 !important;` agar kalkulasi `Toolbar.moveAndOpen()` menempatkan tombol aksi `+ ::` tepat di tengah baris judul tanpa melorot.
- [x] **17.2 Academic Typography Scale & Section Separation**
  - [x] Menstandarkan hierarki heading `h1` (1.875rem), `h2` (1.45rem), `h3` (1.2rem), dan `h4-h6` (1.05rem) serta spasi antar-blok via `.ce-block:not(:first-child):has(.ce-header)`.
- [x] **17.3 Dark Mode Compatibility for Editor Controls**
  - [x] Menyediakan dukungan tema gelap penuh untuk tombol aksi toolbar, toolbox popover, dan panel pencarian blok.
- [x] **17.4 Next.js App Router Route Typing Modularization**
  - [x] Memisahkan fungsi `buildGhostwritePrompt` ke `lib/ai/ghostwrite-helper.ts` demi memenuhi standar ekspor route module Next.js.
