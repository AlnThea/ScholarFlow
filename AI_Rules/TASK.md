# ScholarFlow Tasks

## Current Sprint Goal
Phase 31 & Next-Gen Academic Research Co-Pilot: Smart Academic Scaffolding, Fast In-Text Mentions, and Multi-Chapter Thesis Integration.

## Current Task
v0.43.5 (Navbar Layout Optimization: Relocated Research Assistant, History & Reviewer to Ribbon Bar, 227/227 tests passing).

## Next Tasks (Master Roadmap - `doc/PRODUCTION_TASKS.md`)
- [x] Phase 31: Interactive Academic Thesis/Paper Outline & Structure Generator (IMRaD & Standar Skripsi Dikti).
- [x] Phase 32: Smart In-Text Reference Mention (`@cite` / `@ref`) & Quick Citation Injector.
- [x] Phase 33: Multi-Chapter Thesis & Dissertation Project Binder.
- [x] Phase 34: Academic Grammar & Style Linter.
- [x] Phase 35: Conference & Thesis Defense Slide Deck Generator.
- [x] Phase 36: Interactive Literature Matrix & Synthesis Grid.
- [x] Phase 37: Journal Formatting & Publishing Presets Configurator.
- [x] Phase 38: Cross-Paper Concept Map & Citation Network Visualizer.
- [x] Phase 39: Automated Journal Submission Package Builder & Cover Letter AI.
- [x] Phase 40: Canvas & Document Editor Interaction Hardening & Data Flow Reliability.
- [x] Phase 41: Editor Canvas Lifecycle, Block Persistence & Rich Content Bridge.
- [x] Phase 42: Persistent Inline Formatting Bidirectional Toggle & Post-Reload DOM Unwrapping.
- [x] Phase 43: Free Tier Bibliography Visual Blur & Editor.js Toolbar Deletion Guard Hardening.
- [x] Phase 44: Right-Click Context Menu & Bubble Menu Citation Search Synchronization.
- [x] Phase 45: Dynamic In-Text Citation Deletion & Real-Time Bibliography Synchronization.
- [x] Phase 46: Zero-Citation Canvas Purge, Bilingual Header & Academic Integrity Barometer Exclusion.
- [x] Phase 47: Bottom-Anchored Bibliography Isolation Protecting Manuscript Body.
- [x] Phase 48: Auto-Purge Leftover Bibliography on Version History Restore & Zero-Citation Canvas Load.
- [x] Phase 49: Strict Paragraph & Heading Isolation in Academic Integrity & Flagged Sentences.
- [x] Phase 50: HTML Entity & Non-Breaking Space Normalization & Save Persistence.
- [x] Phase 51: Navbar Layout Optimization: Relocated Research Assistant, History & Reviewer to Ribbon Bar.

## Completed Sprint Archive
1. [Completed] Transition Word export (.doc) from plain HTML to MHTML (multipart/related) to correctly embed base64/blob/external images.
2. [Completed] Implement dynamic bilingual (i18n) context provider.
3. [Completed] Localize editor layout, sidebars, and setup modals.
4. [Completed] Localize checkout (Stripe/Midtrans), sharing, and citation modals.
5. [Completed] Localize LaTeX Math Helper category tabs and quick formula library.
6. [Completed] Adapt AI backend routing (lang parameter) to synthesize, improve, and generate abstracts in the target language.
7. [Completed] Localize MS Word document export bibliography headers.
8. [Completed] Redesign admin settings sidebar layout into a grouped menu-list layout.
9. [Completed] Redesign main menu and help sidebar items with descriptive subtitles and grouped structures to align with the settings menu style.
10. [Completed] Redesign the My Documents sidebar panel layout into a premium file explorer tree structure.
11. [Completed] Link My Documents tab to exit active editor, switch dashboard tabs, and style project/independent lists flatly to match the provided layout.
12. [Completed] Remove the redundant Create New button from the main navigation, centralizing it inside the My Documents view.
13. [Completed] Redesign the Create New Document action in the documents panel to match the clean menu-list style.
14. [Completed] Limit the displayed list of Independent Documents to 15 items in the sidebar panel to prevent vertical clutter.
15. [Completed] Replace the native browser prompt when editing inline equations with the same custom React math modal.
16. [Completed] Replace the native browser prompt when inserting hyperlinks with a custom React link modal portal.
17. [Completed] Enable editing and unlinking of existing hyperlink elements inside the custom React link modal.
18. [Completed] Implement active state tracking for hyperlink formats and highlight the Link toolbar buttons when the text selection is inside an anchor element.
19. [Completed] Upgrade selection-link matching logic to check anchorNode, focusNode, and range contents for robust active toolbar highlighting.
20. [Completed] Upgrade existingLink matching logic inside toggleInlineFormat to support anchorNode, focusNode, and range fragment matching, enabling the "Edit Link URL" modal to correctly open when clicking Link buttons.
21. [Completed] Fix Link Modal button visibility by correcting Tailwind background and text color class names.
22. [Completed] Implement non-nesting highlighting logic with multi-color support and unhighlighting.
23. [Completed] Add highlight active state tracking to the editor toolbar buttons.
24. [Completed] Develop a floating round-card color picker popover for selecting highlight colors.
25. [Completed] Map text highlights to inline background-color styled span tags for Word export.
26. [Completed] Restyle highlight color choices from circles into proper square blocks.
27. [Completed] Implement text alignment mapping support during MS Word exports.
28. [Completed] Add a loading spinner indicator during MS Word exports.
29. [Completed] Implement high-fidelity client-side PDF export with dynamic print iframe.
30. [Completed] Condition bibliography/reference list inclusion during Word and PDF exports based on the user's plan.
31. [Completed] Refactor bibliography filtering in exports to strip HTML formatting and drop Free tier warning banners.
32. [Completed] Remove admin role bypass from Word/PDF export restrictions to allow testing plan limits.
33. [Completed] Implement case-insensitive keyword checks and early loop breaking for robust bibliography exclusion in Free plan.
34. [Completed] Remove warning popup confirmations for direct, seamless exports on both free and pro tiers.
35. [Completed] Group Word and PDF export actions into a single consolidated 'Export' dropdown button in the header layout.
36. [Completed] Relocate bibliography export options from the Library sidebar to the main Header Export dropdown menu.
37. [Completed] Replace native browser alerts with a custom premium React portal modal for the Free tier bibliography export upgrade lock.
38. [Completed] Implement public document sharing and collaboration with Read-Only and Co-Editor modes at `/shared/[id]` route.
39. [Completed] Implement Accepted & Rejected Suggestions History sub-tabs, card styling, and bilingual (i18n) support in editor sidebars.
40. [Completed] Add Co-Editor header message icon active notification badge counting comments and suggestions.
41. [Completed] Add User Authentication Status Indicator Badge (Logged In vs Guest) with direct login button in Co-Editor header.
42. [Completed] Implement Page Visibility API (`window.document.hidden`) to pause background polling when tabs are inactive.
43. [Completed] Redesign Admin AI Models Panel (`/admin/models`) into 2 grouped sections (Free Tier vs Pro Writer) with professional rounded-xl enterprise styling, stats bar, and 1-click status toggles.
44. [Completed] Implement Custom OpenAI-Compatible Provider support (third-party API key sellers, custom proxies, private LLMs) with Base URL & API Key input fields in Admin AI Models Modal.
45. [Completed] Add detailed user & developer guides for localizing custom templates (doc/TEMPLATE_LOCALIZATION_GUIDE.md) and interactive UI Help & Documentation modal.
46. [Completed] Upgrade Admin AI Model active toggle switch contrast (border-2, dark knob, emerald Free / indigo Pro) and add AI Gateway Test Connection API (/api/v1/ai/test-connection).
47. [Completed] Upgrade document selection apply logic to restore saved highlight ranges and refocus contenteditable elements when applying AI results.
48. [Completed] Enable automatic switching of right sidebar to Writing tab ('writing') when executing AI Polish, Paraphrase, Summarize, or Generate Abstract.
49. [Completed] Implement LocalStorage Dual-Persistence fallback for AI Models (scholarflow.ai_models.v1) to prevent custom models from disappearing on page refresh.
50. [Completed] Create SQL schema migration file (supabase/migrations/20260811000002_update_ai_models_provider_fields.sql) and update Prisma schema for custom LLM provider fields.
51. [Completed] Upgrade Admin AI Models view and modals to 100% bilingual i18n (en/id) and create mandatory UI i18n rule file (.agents/rules/ui_i18n.md).
52. [Completed] Implement Gemini Multi-API Key Rotation & Failover Pool (lib/ai/gemini-key-pool.ts) to automatically cycle across multiple API keys when quota (HTTP 429) is exceeded.

## Current Task
v0.7.0-enterprise-standards: Memulai pengerjaan Phase 8 (Enterprise Professional Standards) yang mencakup Error Boundaries, XSS Security (DOMPurify), Automated Testing, dan Interactive Onboarding.

## Next Tasks
- [x] **1. Error Boundaries & Crash Recovery**: Membungkus komponen utama dengan `<ErrorBoundary>`.
- [x] **2. Keamanan XSS (Cross-Site Scripting)**: Implementasi `DOMPurify` untuk sanitasi HTML.
- [x] **3. Automated Testing (Unit & E2E)**: Setup `Vitest`/`Jest` dan `Playwright`.
- [x] **4. Interactive Onboarding & a11y**: Setup `Shepherd.js` dan peningkatan ARIA.
- [x] **5. Phase 12: Xendit Animated Payments & B2B Campus Admin (Fitur Kunci Penjualan Universitas)**:
  - [x] **Super Admin Institutions Management (`/admin/institutions`)**: Onboarding mitra kampus baru (Nama, Email PIC, Kuota Kursi, Domain Whitelist, Tanggal Kontrak) dengan Dual-Persistence fallback.
  - [x] **Admin Khusus Kampus Portal (`/dashboard/institution`)**:
    - [x] *Member Management & Bulk CSV*: Mengundang dosen/mahasiswa satu per satu atau impor CSV ratusan mahasiswa sekaligus.
    - [x] *Revoke Access (Daur Ulang Lisensi)*: Mencabut lisensi mahasiswa yang lulus/wisuda agar kursinya bisa dipakai angkatan baru tanpa biaya tambahan.
    - [x] *Seat & Quota Meter*: Progress bar visual kapasitas lisensi (contoh: 47/150 Seats Used) dengan indikator limit.
    - [x] *Usage Analytics & Adoption Report*: Grafik statistik keaktifan riset (Recharts Area & Pie Chart) sebagai bukti ROI kampus.
    - [x] *Domain Whitelisting*: Penyetelan domain resmi kampus (`@kampus.ac.id`) untuk auto-join mahasiswa baru.
    - [x] *Audit Trail*: Log rekam jejak kepatuhan akademik (siapa mengundang siapa, IP address, waktu).
  - [x] **Navigasi End-to-End**: Tombol menu "Portal Kampus" dinamis di sidebar untuk role admin/campus_admin dan tombol aksi "Buka Portal" di tabel Super Admin.
  - [x] **Xendit Animated Payments**: Invoice creation, webhook auto-upgrade, in-app checkout modal dengan 4 animasi (Pulse Loader, Radar Scanner Timer, Live Status Polling, dan Selebrasi Konfeti Upgrade).
  - [x] **Database & Keamanan RLS**: Tabel `institutions`, model Prisma `InstitutionEntry`, dan penguncian RLS penuh pada tabel `ai_providers`.
- [x] **6. Phase 13: Enterprise B2B Campus Standards & Production Readiness**:
  - [x] **Sub-phase 1: Granular Role-Based Access Control (RBAC) & Departemen**:
    - [x] Perluas peran akademik menjadi 4 tingkat: *Super Admin (Rektorat)*, *Faculty Admin (Dekanat/Prodi)*, *Lecturer (Dosen Pembimbing)*, dan *Student (Mahasiswa)* di `lib/api/institutions.ts`.
    - [x] Tambahkan field `department`/fakultas pada data anggota institusi (contoh: *Fakultas Teknik*, *Fakultas Kedokteran*).
    - [x] Fitur *Change Role & Department* langsung di tabel anggota (`components/institution/members-tab.tsx`) dengan modal/inline switcher.
    - [x] Filter anggota berdasarkan Fakultas/Departemen dan Peran di tab keanggotaan.
    - [x] Donut Chart analitik menampilkan distribusi 4 peran secara dinamis.
  - [x] **Sub-phase 2: Keamanan & Autentikasi (Enterprise Security & Google SSO)**:
    - [x] Tombol resmi "Continue with Google / Akun Kampus" di halaman login (`app/(auth)/login/page.tsx`).
    - [x] Auto-Enrollment Domain Whitelist: deteksi domain kampus saat login Google, auto-assign lisensi kampus dengan default role *Student*, siap di-promote oleh Admin.
    - [x] Banner jaminan privasi data akademik ("Zero Data Retention Guarantee for Campus AI").
  - [x] **Sub-phase 3: Manajemen Kuota & Resource Policy**:
    - [x] Per-Member AI Token/Credit Quota policy (mahasiswa capped, dosen prioritas).
    - [x] Department-level seat quota allocation (pembagian jatah kursi per fakultas).
  - [x] **Sub-phase 4: Otomasi Siklus Hidup Akun (Lifecycle & Offboarding)**:
    - [x] Shareable Campus Join Link bertoken (`/join/[token]`) khusus email domain resmi kampus.
    - [x] Fitur tanggal kedaluwarsa lisensi otomatis berdasarkan tahun kelulusan/wisuda angkatan.
  - [x] **Sub-phase 5: Pelaporan Eksekutif & Stabilitas Operasional**:
    - [x] Executive PDF Summary satu lembar bertanda tangan/kop resmi untuk laporan ke Rektorat.
    - [x] Granular backup naskah dan filter audit log terperinci.
- [x] **7. Personal AI Token Quota & Fair Usage Policy Guard (Non-Campus Free & Pro)**:
  - [x] Database migration & Prisma schema: `ai_tokens_used`, `ai_monthly_quota`, and `ai_quota_reset_at` columns on `profiles` table (`supabase/migrations/20261013000001_add_user_ai_token_quota.sql`).
  - [x] Engine & Heuristics (`lib/ai/token-quota.ts`): NLP token estimation, 50.000 Free & 1.000.000 Pro monthly caps, 30-day auto-reset cycle, and dual-persistence with localStorage.
  - [x] API Quota Protection: Hard guard on `/api/v1/ai/improve`, `/api/v1/ai/abstract`, `/api/v1/ai/synthesize`, and query endpoint `/api/v1/ai/user-quota`.
  - [x] UI Components: `TokenQuotaBadge` (responsive progress bar meter) and `TokenQuotaModal` (detailed tier comparison & 1-click upgrade).
  - [x] Editor Integration: Header Editor and Sidebar Writing Tab integration with automatic quota exhaustion modal trigger.
  - [x] Unit Testing: Vitest test suite in `__tests__/utils/token-quota.test.ts` (11/11 tests passing).
- [x] **8. Phase 14: Multi-Tenant Campus Dedicated AI Key Resolver & Super Admin Key Config**:
  - [x] **Engine & Resolver (`lib/ai/tenant-key-resolver.ts`)**: Resolusi cerdas API Key per-kampus (`campus_text_key` vs `campus_vision_key`) dengan in-memory caching dan failover pool.
  - [x] **AI API Routes Integration**: Integrasi resolver ke `/api/v1/ai/improve`, `/api/v1/ai/abstract`, `/api/v1/ai/synthesize`, dan `/api/v1/ai/interpret-stats`.
  - [x] **Super Admin Modal Integration (`components/admin/institution-modal.tsx`)**: Form input `campus_text_key` & `campus_vision_key` dengan dark mode & bilingual i18n.
  - [x] **Client Stats Tab Bridge (`components/editor/sidebar-stats-tab.tsx`)**: Meneruskan kredensial tenant saat interpretasi data statistik.
  - [x] **Automated Unit Testing**: Unit test di `__tests__/utils/tenant-key-resolver.test.ts` (9/9 tests passing).
- [x] **9. Full App-Wide AI Token Consumption & Realtime Quota Synchronization**:
  - [x] **Server-side Service Role Bypass (`lib/supabase-admin.ts`)**: Inisialisasi Supabase client dengan `SUPABASE_SERVICE_KEY` untuk bypass RLS pada tabel `profiles` saat update saldo token.
  - [x] **Quota Deduction Update (`lib/ai/token-quota.ts`)**: Menggunakan `supabaseAdmin || supabase` pada `checkPersonalQuota` dan `recordPersonalTokenConsumption`.
  - [x] **Paraphrase Studio User Context (`components/editor/paraphrase-studio.tsx`)**: Mengirim `userId` dan `currentPlan` pada 3 panggilan concurrent `improveWriting` (`paraphrase`, `simplify`, `mimic`), sinkronisasi sisa kuota ke `localStorage`, dan `refreshProfile()`.
  - [x] **Editor AI Hook Token Sync (`hooks/use-editor-ai.ts`)**: Sinkronisasi reaktif saldo token (`tokensUsed`, `monthlyQuota`) dan cache lokal via `saveLocalQuotaState` di semua aksi AI (`runImproveWriting`, `runParaphrase`, `runSummarize`, `runGenerateAbstract`, `handleParafrasePlagiat`).
  - [x] **Literature Review Synthesis Token Sync (`app/api/v1/ai/synthesize/route.ts` & `lib/api/ai.ts`)**: Menambahkan `checkPersonalQuota` guard, kalkulasi konsumsi token, dan sinkronisasi `updateQuotaState` pada `handleSynthesizeLiterature`.
  - [x] **SPSS / PSPP Statistical Interpreter Token Sync (`app/api/v1/ai/interpret-stats/route.ts` & `components/editor/sidebar-stats-tab.tsx`)**: Menambahkan `checkPersonalQuota` guard, kalkulasi multimodal vision token, dan sinkronisasi realtime `saveLocalQuotaState` & `refreshProfile()`.
- [x] **10. Resilient AI Transaction & Zero-Waste Token Guard**:
  - [x] **Smart Idempotency Cache (`lib/ai/idempotency-cache.ts`)**: In-memory cache 5 menit dengan algoritma double-pass FNV-1a 64-bit deterministic hash untuk mendeduplikasi request yang identik.
  - [x] **Zero-Waste Token Deduplication**: Terintegrasi ke 4 API AI (`/api/v1/ai/improve`, `/api/v1/ai/abstract`, `/api/v1/ai/synthesize`, `/api/v1/ai/interpret-stats`). Saat request identik terulang dalam 5 menit, hasil langsung dikembalikan instan dan **0 token dipotong**.
  - [x] **Browser Unload Guard (`window.onbeforeunload`)**: Proteksi pencegahan refresh / close tab yang tidak disengaja di `useEditorAi`, `ParaphraseStudio`, dan `SidebarStatsTab`.
  - [x] **Micro-UX Cache Hit Badges**: Badge `⚡ 0 Token (Cache Instan)` di `SidebarWritingTab` dan `ParaphraseStudio` yang responsif terhadap dark mode dan bilingual.
  - [x] **Unit Testing**: Vitest test suite di `__tests__/utils/idempotency-cache.test.ts` (5/5 tests passing, total 25/25 tests passing).
- [x] **12. Server-Side AI History Engine & Architectural Documentation Suite**:
  - [x] **Supabase SQL Migration (`supabase/migrations/20261015000001_create_ai_generations_history.sql`)**: Tabel `ai_generations` dengan RLS granular dan index kronologi.
  - [x] **Prisma Schema Update (`prisma/schema.prisma`)**: Model `AiGenerationEntry` dengan relasi ke `UserProfile`.
  - [x] **Server-Side AI Logger (`lib/ai/server-ai-logger.ts`)**: Fungsi pencatatan background `createPendingAiGeneration`, `completeAiGeneration`, `failAiGeneration`, dan `fetchUserAiHistory` menggunakan service role bypass.
  - [x] **History API Route (`app/api/v1/ai/history/route.ts`)**: Endpoint `GET` dan `DELETE` riwayat generasi AI.
  - [x] **AI Route Handlers Integration**: Integrasi pencatatan server-side ke `/api/v1/ai/improve` dan `/api/v1/ai/abstract`.
  - [x] **Client-Cloud Dual Sync**: Hidrasi otomatis di `useEditorAi`, badge status `Cloud Synced` di modal, dan penghapusan tersinkron.
  - [x] **Architecture Documentation Suite (`doc/architecture/`)**: 4 dokumen terperinci lengkap dengan Mermaid Sequence Diagrams (`01-server-side-ai-history.md`, `02-smart-idempotency-cache.md`, `03-token-quota-synchronization.md`, `04-multi-tenant-campus-keys.md`).
- [x] **13. Full App-Wide Server-Side AI History Parity & Modular History Studio (`AiHistoryModal`)**:
  - [x] **Synthesize & Stats Routes**: Integrasi `createPendingAiGeneration`, `completeAiGeneration`, dan `failAiGeneration` ke `/api/v1/ai/synthesize` dan `/api/v1/ai/interpret-stats`.
  - [x] **Client-Cloud Dual Sync**: Menyambungkan `handleSynthesizeReview` di `useEditorAi` dan `handleInterpret` di `SidebarStatsTab` ke `addAiHistoryEntry` dan cloud records.
  - [x] **Modular Studio Component (`components/editor/modals/ai-history-modal.tsx`)**: Mengekstrak modal inline keluar dari `editor-sidebar.tsx` (memangkas file dari 756 menjadi 571 baris kode).
  - [x] **Filter Kategori & Live Search**: Tab filter (All, Poles, Parafrase, Abstrak, Sintesis, Statistik) dengan badge jumlah dinamis dan search bar keyword.
  - [x] **Academic AI Disclosure Export**: Fitur unduh Laporan Transparansi AI (.md) untuk kepatuhan etika riset jurnal & kampus.
  - [x] **Automated Testing**: 28/28 test cases passing pada Vitest (`__tests__/utils/ai-history.test.ts`).
- [x] **14. Real-Time Inline AI Ghostwriter (Tab-to-Accept ala Jenni AI)**:
  - [x] **Backend Prediction Route (`app/api/v1/ai/ghostwrite/route.ts`)**: Route POST prediktif dengan idempotency cache 5 menit, validasi personal token quota, multi-tenant campus key resolver, server-side tracking, dan Gemini Key Pool failover.
  - [x] **Ghostwriter Hook Engine (`hooks/use-ghostwriter.ts`)**: Deteksi *typing pause* (debounced 1.3 detik), kalkulasi koordinat kursor `getBoundingClientRect()`, manipulasi DOM non-destruktif berbasis synthetic input event, dan toggle shortcut `Ctrl+J` / `Cmd+J`.
  - [x] **Floating Suggestion UI (`components/editor/ghostwriter-suggestion.tsx`)**: Glassmorphism floating pill di samping caret kursor dengan badge `<kbd>Tab</kbd>` Accept dan `<kbd>Esc</kbd>` Dismiss, dark mode, dan bilingual EN/ID.
  - [x] **Toolbar Control Switch (`components/editor/ghostwriter-toggle.tsx`)**: Tombol toggle ON/OFF langsung pada EditorJS Toolbar dengan loading spinner dan tooltip shortcut.
  - [x] **Automated Unit Testing (`__tests__/utils/ghostwriter.test.ts`)**: 8/8 tests passing (total 36/36 tests passing pada test suite Vitest).
- [x] **15. Time-Machine Document Snapshot & Version History (Rollback & Visual Diff)**:
  - [x] **Database & Prisma Schema (`document_revisions`)**: Tabel revisi PostgreSQL/Supabase dengan RLS dan index `(document_id, created_at DESC)`, serta model Prisma `DocumentRevision`.
  - [x] **LCS Word-Level Diff Engine (`lib/editor/diff-engine.ts`)**: Komputasi diff presisi kata per kata dengan Longest Common Subsequence (LCS), ekstraksi teks EditorJS, dan kalkulasi statistik perubahan (`+X kata`, `-Y kata`).
  - [x] **Dual Storage & Revisions API (`lib/editor/version-history.ts` & `app/api/v1/documents/[id]/revisions/route.ts`)**: Auto-fallback ke localStorage saat offline dengan FIFO capacity limit 30 item.
  - [x] **Custom Hook Engine (`hooks/use-version-history.ts`)**: Auto-snapshot interval 15 menit penulisan aktif / delta >= 80 kata, tombol manual checkpoint, dan *Safety Backup* pre-restore.
  - [x] **Time-Machine Modal UI (`components/editor/modals/version-history-modal.tsx`)**: Fullscreen slide-over drawer dengan garis waktu revisi, toggle Unified Diff vs Split Side-by-Side, modal konfirmasi kustom, Dark Mode, dan bilingual EN/ID.
  - [x] **Header Navigation Integration (`components/editor/editor-header.tsx`)**: Tombol "History / Riwayat" di header editor.
  - [x] **Automated Testing**: 11/11 tests passing pada `__tests__/utils/version-history.test.ts` (total 47/47 tests passing pada test suite).
- [x] **16. Bidirectional Reactive In-Text Citation Style Transformer (APA ↔ IEEE ↔ Harvard ↔ Vancouver)**:
  - [x] **AST & In-Text Citation Transformer (`lib/editor/citation-transformer.ts`)**: Transformasi dua arah dinamis antara format Author-Year (`(Smith et al., 2021)`) dan Numerik (`[1]` / `(1)`).
  - [x] **Reactive Bibliography Re-indexing**: Pengurutan ulang otomatis daftar pustaka (Numeric: *order of appearance* di naskah; Author-Year: alfabetis A-Z nama belakang penulis).
  - [x] **Reactive Hook Engine (`hooks/use-editor-document.ts` & `hooks/use-editor-citation.ts`)**: Transformasi instan naskah EditorJS dan pembaruan `bibliographyEntries` memo secara mulus.
  - [x] **Toolbar Citation Selector UI (`components/editor/citation-style-selector.tsx`)**: Dropdown pemilih gaya sitasi di toolbar dengan preview sample (`[1]` vs `(Vaswani et al., 2017)`), Dark Mode, dan bilingual EN/ID.
  - [x] **Automated Unit Testing (`__tests__/utils/citation-transformer.test.ts`)**: 13/13 tests passing (total 60/60 tests passing pada test suite).
- [x] **17. Interactive "Chat with Paper / Literature" Assistant (Library Q&A)**:
  - [x] Sub-panel interaktif "Tanya Paper" di dalam `SidebarLibraryTab` untuk mengeksplorasi referensi yang tersimpan.
  - [x] RAG ekstraksi intisari metodologi, hipotesis, dan temuan utama dari dokumen paper PDF/metadata.
  - [x] Tombol aksi 1-klik "Kutip Jawaban ke Editor" dengan sitasi rujukan otomatis `<cite>` dan unit test 6/6 passing.
- [x] **18. Plagiarism & AI-Likeness Real-Time Warning Barometer (Pre-Submission Readiness Score)**:
  - [x] Kalkulator terpadu mengukur skor orisinalitas (0-100%) berbasis gabungan Burstiness CV, TTR, dan densitas klise AI.
  - [x] UI Speedometer SVG di toolbar editor dengan color coding adaptif (Hijau, Kuning, Merah).
  - [x] Heatmap sorotan interaktif yang memandu peneliti ke kalimat monoton berisiko tinggi dengan navigasi 1-klik ke Paraphrase Studio (6/6 unit tests).
- [x] **19. AI Peer Reviewer #2 & Journal Readiness Simulation**:
  - [x] Audit metodologi, kebaruan (*novelty claim*), alur argumen, checklist kesiapan submisi Scopus/SINTA, dan slide-over modal persona Reviewer #2 (6/6 tests).
- [x] **20. Academic Command Palette (Ctrl+K) & Shortcuts Hub**:
  - [x] Spotlight search 18+ perintah akademis, drawer preview penjelasan aksi, visual cheat sheet pintasan (tombol `?`), dan navigasi keyboard (10/10 tests).
- [x] **21. Academic LaTeX & Journal Package Exporter (.tex + .bib Zip)**:
  - [x] Serializer blok ke LaTeX standar IEEE, Elsevier, ACM, arXiv, bundler BibTeX otomatis, dan zip generator Overleaf (16/16 tests).
- [x] **22. Drag & Drop Reference Importer (.bib, .ris, & PDF metadata)**:
  - [x] Parser BibTeX & RIS, regex ekstraksi DOI PDF, dan modal import seleksi batch (13/13 tests).
- [x] **23. Live "Track Changes" / Suggesting Mode**:
  - [x] Mode beralih Direct Edit vs Suggesting, visual diff markup `<del>` (merah) & `<ins>` (hijau), floating action chips, tombol batch Accept/Reject All, dan shortcut `Ctrl+Shift+S` (12/12 tests).
- [x] **24. Figure & Table Scientific Auto-Numbering Engine**:
  - [x] Pengindeksan sekuensial gambar & tabel, pembaruan reaktif rujukan silang (`updateHtmlCrossReferences`, `reindexContentCrossReferences`), shorthand `@fig`/`@tab`, modal dialog pemilih rujukan, interaksi jump *smooth scroll* dengan sorotan cincin animasi, dan shortcut `Ctrl+Shift+B` (11/11 tests).
- [x] **25. Phase 31: Interactive Academic Thesis/Paper Outline & Structure Generator (IMRaD & Standar Skripsi Dikti)**:
  - [x] AI prompt generator untuk membedah topik penelitian menjadi outline bab hierarkis (IMRaD / Bab 1-5 Skripsi).
  - [x] Generator blok EditorJS dengan panduan pertanyaan riset (*guiding research prompts*) di tiap sub-bab.
  - [x] Template selector dialog di modal dokumen baru (`academic-scaffold-modal.tsx`) dengan Dark Mode dan bilingual EN/ID.
- [x] **26. Phase 32: Smart In-Text Reference Mention (@cite / @ref) & Quick Citation Injector**:
  - [x] Parser deteksi token mention `@cite:`, `@ref:`, atau `@` di posisi caret kursor aktif (`lib/editor/mention-parser.ts`).
  - [x] In-memory reference search indexer (multi-field search: author, title, year, journal, label) dengan fallback Crossref/OpenAlex (`lib/editor/reference-search-index.ts`).
  - [x] Floating mention overlay dropdown dengan navigasi keyboard (`↑`, `↓`, `Enter`, `Esc`), Dark Mode, dan bilingual EN/ID (`components/editor/citation-mention-dropdown.tsx`).
  - [x] In-text citation injector non-destruktif menggantikan token mention dengan tag `<cite>` dan sinkronisasi reaktif daftar pustaka (`lib/editor/methods/mention-injector.ts`, `hooks/use-citation-mention.ts`).
  - [x] Automated Unit Testing: 13/13 tests passing (`__tests__/utils/citation-mention.test.ts`), total 164/164 tests passing across 18 test files.
- [x] **27. Phase 33: Multi-Chapter Thesis & Dissertation Project Binder**:
  - [x] Multi-chapter project binder engine (`lib/editor/project-binder.ts`): parsing nomor bab akademik, penomoran berkesinambungan gambar/tabel lintas bab standar Dikti (`Gambar {Bab}.{Nomor}`, `Tabel {Bab}.{Nomor}`), dan konsolidasi Master Bibliography.
  - [x] Thesis Project Binder Modal (`components/editor/modals/project-binder-modal.tsx`) dengan 4 tab interaktif, ringkasan statistik komprehensif, ekspor BibTeX terpadu (.bib), dan kompilasi naskah utuh (Markdown).
  - [x] Kartu integrasi binder pada tab Dokumen sidebar (`components/editor/sidebar-document-tab.tsx`) dengan indikator folder dan bab aktif.
  - [x] Pendaftaran aksi `cmd_project_binder` di `lib/editor/command-palette.ts` dan pintasan `Ctrl + Shift + M` di `shortcuts-modal.tsx`.
  - [x] Automated Unit Testing: 11/11 tests passing (`__tests__/utils/project-binder.test.ts`), total test suite lulus 175/175 tests across 19 test files.
- [x] **28. Phase 34: Academic Grammar & Style Linter**:
  - [x] Academic style & formality linter engine (`lib/editor/academic-linter.ts`): kamus aturan saintifik dwibahasa (EN / ID), deteksi kata non-formal, kontraksi, klaim tanpa data, bias orang pertama, dan kalkulator skor formalitas akademik.
  - [x] Academic Linter Modal (`components/editor/modals/academic-linter-modal.tsx`) dengan filter kategori, badge predikat Grade A-D, dan aksi 1-klik penggantian teks resmi.
  - [x] Kartu integrasi linter pada tab Dokumen sidebar (`components/editor/sidebar-document-tab.tsx`).
  - [x] **29. Phase 40: Canvas & Document Editor Interaction Hardening & Data Flow Reliability**:
  - [x] Sinkronisasi `holderId` mention sitasi (`@cite` / `@ref`) ke `editorjs-holder` dengan pencarian fallback.
  - [x] Jembatan injeksi tabel Literature Matrix via `editorJsRef.current.insertBlocks([tableBlock])`.
  - [x] Persistensi auto-save outline `AcademicScaffoldModal` dan target linter ke `#editorjs-holder`.
  - [x] Fallback sitasi sidebar saat kursor tidak aktif.
- [x] **30. Phase 41: Editor Canvas Lifecycle, Block Persistence & Rich Content Bridge**:
  - [x] Ketersediaan metode kembar `renderContent` & `render` pada `buildBlockMethods`.
  - [x] Insersi teks AI History Studio langsung ke kanvas via `customText`.
  - [x] Injeksi HTML kontekstual utuh tanpa memangkas tag `<cite>` via `createContextualFragment`.
  - [x] Auto-save persistensi blok toolbar/menu ke database/cloud.
  - [x] Penggantian markup sugesti tanpa duplikasi teks target.
- [x] **31. Phase 42: Latent Compilation, Icon Import, API Key Pool & Scoping Resilience Audit**:
  - [x] Koreksi typo impor ikon Tabler (`IconTextSpellcheck`, `IconBook`).
  - [x] Destrukturisasi prop `externalTargetSentence` pada `ParaphraseStudio` & fallback `monthly_quota || 0`.
  - [x] Penambahan kolom `institution?: string | null` pada `UserProfile` di `components/auth/auth-provider.tsx`.
  - [x] Hardening props `editor-layout.tsx` (`user?.id`, `'error'`, `PeerReviewModal` caller).
  - [x] Scope variable asynchronous `aiGenerationId` pada `interpret-stats/route.ts` dan rotasi multi-kunci `generate-outline/route.ts`.
  - [x] Verifikasi 0 compiler error `npx tsc --noEmit` dan 218/218 Vitest tests lulus pada 27 file.

## Do Not Work On Yet
- SPSS / PSPP (Strategy decided: "AI Output Interpreter" - user uploads output tables, AI interprets and drafts academic narrative to editor. Do not build a full SPSS clone).
- SEM PLS
- Journal publishing
- Realtime collaboration

