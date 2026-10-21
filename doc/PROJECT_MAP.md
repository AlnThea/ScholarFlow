# ScholarFlow Project Map 🗺️

Dokumen ini berfungsi sebagai peta navigasi teknis komprehensif (*Master Project Map*) bagi para *developer* dan *AI agents* untuk memahami arsitektur, hierarki direktori, fungsi berkas-berkas penting, serta aliran data (*data flow*) pada platform **ScholarFlow AI Academic Co-Pilot**.

---

## 🛠️ Technology Stack & Core Infrastructure

- **Frontend & App Framework**: Next.js App Router (React 19), TypeScript, TailwindCSS (Full Dark Mode & Responsive Layout).
- **Rich-Text Academic Canvas**: [Editor.js](file:///c:/web/ScholarFlow/components/editor/editorjs-editor.tsx) dengan custom plugins (LaTeX KaTeX math blocks, in-text citation mentions, dynamic tables, code blocks, and sticky headers).
- **Database & Authentication**: Supabase (PostgreSQL) dengan Row Level Security (RLS) & Prisma ORM abstraction.
- **Data Layer Architecture**: Repository Pattern ([`IDataService`](file:///c:/web/ScholarFlow/lib/services/types.ts)) yang mendukung dual provider: Supabase PaaS ([`supabase-service.ts`](file:///c:/web/ScholarFlow/lib/services/supabase-service.ts)) dan Express REST VPS ([`express-service.ts`](file:///c:/web/ScholarFlow/lib/services/express-service.ts)).
- **Citation & Bibliography Engine**: `@citation-js/core` dengan engine bidirectional formatting (APA 7th, IEEE, Harvard, Chicago) ([`citation-transformer.ts`](file:///c:/web/ScholarFlow/lib/editor/citation-transformer.ts)).
- **Academic AI Co-Pilot Models**: Multi-model integration via Google Gemini (`gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-2.0-flash-exp`) dengan load-balancing key pool ([`gemini-key-pool.ts`](file:///c:/web/ScholarFlow/lib/ai/gemini-key-pool.ts)).
- **Token Quota & Campus Multi-Tenancy**: Quota tracking engine ([`token-quota.ts`](file:///c:/web/ScholarFlow/lib/ai/token-quota.ts)) & Campus Domain Key Resolver ([`tenant-key-resolver.ts`](file:///c:/web/ScholarFlow/lib/ai/tenant-key-resolver.ts)).
- **Internationalization (i18n)**: Bilingual English ↔ Bahasa Indonesia dynamic context provider ([`language-context.tsx`](file:///c:/web/ScholarFlow/components/i18n/language-context.tsx)).
- **Testing & Quality Assurance**: Vitest unit test suite (27 test files, 229 unit tests passing 100%).

---

## 📂 Master Directory & File Index

```
ScholarFlow/
├── app/                  # Next.js App Router (Halaman, Layouts, dan Serverless API)
├── components/           # React UI Components (Editor, Modals, Sidebars, Admin, Dashboard)
├── hooks/                # Custom React Hooks (AI, Citations, Layout, Modals, Sync)
├── lib/                  # Business Logic, Academic Engines, AI Services, Templates
├── doc/                  # Dokumentasi Teknis, Arsitektur, Skema DB, dan Roadmap
├── AI_Rules/             # Aturan Pengembangan, Changelog, dan Task Tracking
├── __tests__/            # Vitest Unit Test Suites (229 Tests across 27 files)
├── prisma/               # Prisma ORM Schema untuk PostgreSQL & VPS
├── docker/               # Docker & Nginx Deployment Configs
├── types/                # Global TypeScript Declarations
└── supabase/             # Supabase Migrations & Database Functions
```

---

### 1. Application Routing & Endpoints (`app/`)

Next.js App Router mengelola antarmuka pengguna dan endpoint API serverless:

#### A. User Interface Pages
- [app/page.tsx](file:///c:/web/ScholarFlow/app/page.tsx) - Entrypoint dashboard & editor. Merender kanvas editor jika user telah terautentikasi atau mengarahkan ke login.
- [app/editor/[id]/page.tsx](file:///c:/web/ScholarFlow/app/editor/[id]/page.tsx) - Halaman canvas editor naskah spesifik berdasarkan ID dokumen.
- [app/shared/[id]/page.tsx](file:///c:/web/ScholarFlow/app/shared/[id]/page.tsx) - Viewer kolaborasi / naskah publik *read-only* atau *comment-only*.
- [app/(auth)/login/page.tsx](file:///c:/web/ScholarFlow/app/(auth)/login/page.tsx) - Halaman autentikasi login pengguna.
- [app/(auth)/register/page.tsx](file:///c:/web/ScholarFlow/app/(auth)/register/page.tsx) - Halaman registrasi akun baru.
- [app/dashboard/page.tsx](file:///c:/web/ScholarFlow/app/dashboard/page.tsx) - Portal utama manajemen naskah, bibliometrik, dan perpustakaan sitasi.
- [app/dashboard/bibliometric/page.tsx](file:///c:/web/ScholarFlow/app/dashboard/bibliometric/page.tsx) - Graf visualisasi jejaring sitasi bibliometrik interaktif.
- [app/dashboard/library/page.tsx](file:///c:/web/ScholarFlow/app/dashboard/library/page.tsx) - Manajemen koleksi literatur & sitasi pribadi.
- [app/dashboard/institution/page.tsx](file:///c:/web/ScholarFlow/app/dashboard/institution/page.tsx) - Portal analitik riset & pemakaian token kampus/institusi.
- [app/admin/pricing/page.tsx](file:///c:/web/ScholarFlow/app/admin/pricing/page.tsx) - Manajemen paket langganan dan kuota token admin.
- [app/admin/gateways/page.tsx](file:///c:/web/ScholarFlow/app/admin/gateways/page.tsx) - Pengaturan payment gateways (Stripe, Midtrans, Xendit).
- [app/admin/institutions/page.tsx](file:///c:/web/ScholarFlow/app/admin/institutions/page.tsx) - Manajemen lisensi kampus & domain institusi.
- [app/admin/models/page.tsx](file:///c:/web/ScholarFlow/app/admin/models/page.tsx) - Konfigurasi model AI LLM & pemetaan tier.
- [app/settings/page.tsx](file:///c:/web/ScholarFlow/app/settings/page.tsx) - Pengaturan profil pengguna, preferensi bahasa, dan API keys.
- [app/billing/page.tsx](file:///c:/web/ScholarFlow/app/billing/page.tsx) - Riwayat transaksi, status langganan, dan penambahan kuota token.

#### B. Serverless AI API Endpoints (`app/api/v1/ai/`)
- [app/api/v1/ai/peer-review/route.ts](file:///c:/web/ScholarFlow/app/api/v1/ai/peer-review/route.ts) - **Reviewer #2 Engine**: Simulasi telaah naskah kritis berstandar Q1/Scopus dengan penghitungan konsumsi token real-time.
- [app/api/v1/ai/paper-chat/route.ts](file:///c:/web/ScholarFlow/app/api/v1/ai/paper-chat/route.ts) - **Literature Q&A Co-Pilot**: Tanya-jawab berbasis konteks literatur dan naskah aktif.
- [app/api/v1/ai/ghostwrite/route.ts](file:///c:/web/ScholarFlow/app/api/v1/ai/ghostwrite/route.ts) - **Academic Ghostwriter**: Prediksi kalimat lanjutan dan pelengkap argumen ilmiah otomatis.
- [app/api/v1/ai/generate-outline/route.ts](file:///c:/web/ScholarFlow/app/api/v1/ai/generate-outline/route.ts) - Generator kerangka riset (IMRaD & Standar Skripsi Dikti).
- [app/api/v1/ai/abstract/route.ts](file:///c:/web/ScholarFlow/app/api/v1/ai/abstract/route.ts) - Generator abstrak terstruktur (Background, Methods, Results, Conclusion).
- [app/api/v1/ai/improve/route.ts](file:///c:/web/ScholarFlow/app/api/v1/ai/improve/route.ts) - AI Paraphrase & Academic Style Enhancer.
- [app/api/v1/ai/synthesize/route.ts](file:///c:/web/ScholarFlow/app/api/v1/ai/synthesize/route.ts) - Ekstraksi matriks sintesis multi-makalah dan perbandingan literatur.
- [app/api/v1/ai/interpret-stats/route.ts](file:///c:/web/ScholarFlow/app/api/v1/ai/interpret-stats/route.ts) - Interpretasi statistik naratif dari data tabel/metodologi.
- [app/api/v1/ai/user-quota/route.ts](file:///c:/web/ScholarFlow/app/api/v1/ai/user-quota/route.ts) & [check-balance/route.ts](file:///c:/web/ScholarFlow/app/api/v1/ai/check-balance/route.ts) - Pengecekan sisa kuota token dan status lisensi secara real-time.
- [app/api/v1/ai/history/route.ts](file:///c:/web/ScholarFlow/app/api/v1/ai/history/route.ts) - Riwayat prompt dan log audit server-side AI.

#### C. Citations, Collaboration & Payment Endpoints
- [app/api/citations/search/route.ts](file:///c:/web/ScholarFlow/app/api/citations/search/route.ts) - Pencarian metadata sitasi instan (Crossref, OpenAlex, Semantic Scholar).
- [app/api/citations/resolve-pdf/route.ts](file:///c:/web/ScholarFlow/app/api/citations/resolve-pdf/route.ts) - Resolusi PDF naskah dari portal OJS / landing page jurnal.
- [app/api/citations/view-pdf/route.ts](file:///c:/web/ScholarFlow/app/api/citations/view-pdf/route.ts) - Streaming proxy PDF untuk memotong hambatan CORS.
- [app/api/library/upload/route.ts](file:///c:/web/ScholarFlow/app/api/library/upload/route.ts) - Ekstraksi PDF-to-metadata berbasis `pdf-parse` langsung ke Supabase.
- [app/api/v1/presence/route.ts](file:///c:/web/ScholarFlow/app/api/v1/presence/route.ts) & [suggestions/route.ts](file:///c:/web/ScholarFlow/app/api/v1/suggestions/route.ts) - Kolaborasi naskah *live* dan mode pelacakan saran perbaikan (*suggesting mode*).
- [app/api/payments/xendit/create-invoice/route.ts](file:///c:/web/ScholarFlow/app/api/payments/xendit/create-invoice/route.ts) & [webhook/route.ts](file:///c:/web/ScholarFlow/app/api/payments/xendit/webhook/route.ts) - Integrasi gerbang pembayaran invoice & QRIS lokal.

---

### 2. UI Components & Layout Hierarchy (`components/`)

Komponen React dirancang modular dengan pemisahan antara kanvas editor, panel navigasi, bilah alat (*ribbon bar*), serta modal interaktif:

#### A. Core Editor Architecture (`components/editor/`)
- [components/editor/scholar-editor.tsx](file:///c:/web/ScholarFlow/components/editor/scholar-editor.tsx) - Kontroller utama state naskah. Menghubungkan kanvas Editor.js dengan state sitasi, token bar, sidebars, dan riwayat revisi.
- [components/editor/editor-layout.tsx](file:///c:/web/ScholarFlow/components/editor/editor-layout.tsx) - Layout workspace utama. Mengatur susunan header (`z-40`), ribbon bar (`z-30`), sidebars (`z-20`), bubble menus, serta menangani shortcut keyboard global (`Ctrl+Shift+R`, `Ctrl+Shift+X`, dsb.).
- [components/editor/editorjs-editor.tsx](file:///c:/web/ScholarFlow/components/editor/editorjs-editor.tsx) - Bridge komponen Editor.js. Mengintegrasikan custom tools (LaTeX math block, in-text citation spans, paragraph normalization, auto-scrolling).
- [components/editor/editorjs-toolbar.tsx](file:///c:/web/ScholarFlow/components/editor/editorjs-toolbar.tsx) - Bilah ribbon bar atas yang memuat tombol Reviewer #2 (dengan badge `🔒 PRO` untuk free tier), Literature Q&A, AI Outliner, dan kontrol formatting.
- [components/editor/editor-header.tsx](file:///c:/web/ScholarFlow/components/editor/editor-header.tsx) & [editor-header-actions.tsx](file:///c:/web/ScholarFlow/components/editor/editor-header-actions.tsx) - Navbar tingkat atas (Brand, Document Title, Sync Status, Token Quota Pill, dan Menu Export Dropdown).
- [components/editor/editor-sidebar.tsx](file:///c:/web/ScholarFlow/components/editor/editor-sidebar.tsx) - Panel samping terintegrasi dengan tab:
  - `sidebar-library-tab.tsx` - Koleksi sitasi & referensi naskah.
  - `sidebar-writing-tab.tsx` - Asisten penulisan akademis & parafrase.
  - `sidebar-stats-tab.tsx` - Statistik kata, keterbacaan (*readability*), dan waktu baca.
  - `sidebar-burstiness-tab.tsx` - Analisis variasi panjang kalimat (*sentence burstiness*).
  - `sidebar-comments-tab.tsx` - Komentar kolaborasi & anotasi pembimbing.
- [components/editor/minimal-sidebar.tsx](file:///c:/web/ScholarFlow/components/editor/minimal-sidebar.tsx) - Sidebar rail navigasi kiri (*Tree view explorer* untuk naskah & bab skripsi).
- [components/editor/academic-integrity-barometer.tsx](file:///c:/web/ScholarFlow/components/editor/academic-integrity-barometer.tsx) - Barometer integritas akademik real-time yang memindai persentase risiko deteksi AI secara lokal dan non-destruktif.
- [components/editor/citation-mention-dropdown.tsx](file:///c:/web/ScholarFlow/components/editor/citation-mention-dropdown.tsx) - Dropdown auto-complete cerdas saat pengguna mengetik `@cite` atau `@ref` di kanvas.
- [components/editor/editor-bubble-menu.tsx](file:///c:/web/ScholarFlow/components/editor/editor-bubble-menu.tsx) - Floating bubble menu saat teks diblok (AI rewrite, sitasi instan, formatting inline).

#### B. Specialized Academic Modals (`components/editor/modals/`)
- [components/editor/modals/peer-review-modal.tsx](file:///c:/web/ScholarFlow/components/editor/modals/peer-review-modal.tsx) - Modal evaluasi **AI Peer Reviewer (Reviewer #2)** dengan deteksi bahasa otomatis, pemilih bahasa ulasan (ID/EN), dan pemilihan target jurnal.
- [components/editor/modals/paper-chat-modal.tsx](file:///c:/web/ScholarFlow/components/editor/modals/paper-chat-modal.tsx) - Modal chat interaktif untuk menganalisis literatur naskah dan dokumen riset.
- [components/editor/modals/latex-export-modal.tsx](file:///c:/web/ScholarFlow/components/editor/modals/latex-export-modal.tsx) - Modal eksportir paket LaTeX (.tex + .bib + gambar) siap pakai di Overleaf dengan proteksi Pro tier.
- [components/editor/modals/export-upgrade-modal.tsx](file:///c:/web/ScholarFlow/components/editor/modals/export-upgrade-modal.tsx) - Modal upgrade akun untuk fitur eksklusif Pro (LaTeX package export & Reviewer #2).
- [components/editor/modals/project-binder-modal.tsx](file:///c:/web/ScholarFlow/components/editor/modals/project-binder-modal.tsx) - Modal penggabung multi-bab (*Binder*) untuk skripsi, tesis, dan disertasi.
- [components/editor/modals/academic-linter-modal.tsx](file:///c:/web/ScholarFlow/components/editor/modals/academic-linter-modal.tsx) - Linter gaya tata bahasa akademis (*passive voice, nominalization, informal jargon*).
- [components/editor/modals/academic-scaffold-modal.tsx](file:///c:/web/ScholarFlow/components/editor/modals/academic-scaffold-modal.tsx) - Generator rancangan bab dan outline riset terstandar.
- [components/editor/modals/concept-map-modal.tsx](file:///c:/web/ScholarFlow/components/editor/modals/concept-map-modal.tsx) - Peta konsep dan jejaring relasi antar sitasi (*citation network visualizer*).
- [components/editor/modals/literature-matrix-modal.tsx](file:///c:/web/ScholarFlow/components/editor/modals/literature-matrix-modal.tsx) - Matriks sintesis literatur otomatis untuk tinjauan pustaka (*Literature Review*).
- [components/editor/modals/slide-deck-modal.tsx](file:///c:/web/ScholarFlow/components/editor/modals/slide-deck-modal.tsx) - Generator slide presentasi sidang skripsi dan konferensi otomatis.
- [components/editor/modals/submission-package-modal.tsx](file:///c:/web/ScholarFlow/components/editor/modals/submission-package-modal.tsx) - Pembuat paket submit jurnal lengkap beserta AI Cover Letter.
- [components/editor/modals/version-history-modal.tsx](file:///c:/web/ScholarFlow/components/editor/modals/version-history-modal.tsx) - Pelacak riwayat versi naskah, pembanding *diff*, dan pemulihan *snapshot*.
- [components/editor/modals/reference-import-modal.tsx](file:///c:/web/ScholarFlow/components/editor/modals/reference-import-modal.tsx) - Importer referensi naskah (BibTeX, RIS, Mendeley, Zotero, dan PDF).
- [components/editor/modals/journal-presets-modal.tsx](file:///c:/web/ScholarFlow/components/editor/modals/journal-presets-modal.tsx) - Pemilih preset format jurnal tujuan (Elsevier, IEEE, Nature, Springer, Sinta).
- [components/editor/modals/command-palette-modal.tsx](file:///c:/web/ScholarFlow/components/editor/modals/command-palette-modal.tsx) - *Quick Command Palette* (`Ctrl+K`) untuk navigasi cepat semua aksi aplikasi.

#### C. Payment & Subscription Modals
- [components/editor/pricing-modal.tsx](file:///c:/web/ScholarFlow/components/editor/pricing-modal.tsx) - Katalog paket langganan (Free Tier, Pro Writer, Campus/Institution).
- [components/editor/gateway-selector-modal.tsx](file:///c:/web/ScholarFlow/components/editor/gateway-selector-modal.tsx) - Pemilih rute pembayaran (Stripe, Midtrans, Xendit).
- [components/editor/midtrans-checkout-modal.tsx](file:///c:/web/ScholarFlow/components/editor/midtrans-checkout-modal.tsx) - Popup Snap Midtrans (QRIS, GoPay, Bank Transfer).
- [components/editor/stripe-checkout-modal.tsx](file:///c:/web/ScholarFlow/components/editor/stripe-checkout-modal.tsx) - Modal pembayaran kartu kredit internasional Stripe.

#### D. Core Shared & Providers (`components/auth/` & `components/i18n/`)
- [components/auth/auth-provider.tsx](file:///c:/web/ScholarFlow/components/auth/auth-provider.tsx) - Provider sesi Supabase, status profil pengguna, plan langganan aktif, dan hak akses tier.
- [components/i18n/language-context.tsx](file:///c:/web/ScholarFlow/components/i18n/language-context.tsx) - Context provider dwibahasa (ID ↔ EN) yang mengelola kamus kosakata dan *locale state*.

---

### 3. Business Logic, Academic Engines & Services (`lib/`)

Logika bisnis dan kalkulasi akademis ScholarFlow dikelompokkan dalam modul murni (*pure TypeScript*):

#### A. Academic Content & Editor Engines (`lib/editor/`)
- [lib/editor/peer-reviewer.ts](file:///c:/web/ScholarFlow/lib/editor/peer-reviewer.ts) - Logika rubrik akademis, simulasi persona reviewer, dan prompt engineering untuk Reviewer #2.
- [lib/editor/latex-exporter.ts](file:///c:/web/ScholarFlow/lib/editor/latex-exporter.ts) - Konverter blok Editor.js menjadi naskah LaTeX bersih, decoding entitas HTML (`&amp;` → `\&`), pembuatan `.bib`, dan kompilasi `.zip`.
- [lib/editor/citation-transformer.ts](file:///c:/web/ScholarFlow/lib/editor/citation-transformer.ts) - Engine formatting sitasi dua arah (in-text dan daftar pustaka) untuk style APA 7th, IEEE, Harvard, dan Chicago.
- [lib/editor/citation-mention.ts](file:///c:/web/ScholarFlow/lib/editor/citation-mention.ts) & [mention-parser.ts](file:///c:/web/ScholarFlow/lib/editor/mention-parser.ts) - Parsing dan injeksi sitasi inline menggunakan simbol `@cite` dan `@ref`.
- [lib/editor/project-binder.ts](file:///c:/web/ScholarFlow/lib/editor/project-binder.ts) - Penggabungan multi-bab naskah skripsi/tesis dengan penomoran figur, tabel, dan daftar pustaka terpadu.
- [lib/editor/academic-integrity.ts](file:///c:/web/ScholarFlow/lib/editor/academic-integrity.ts) & [burstiness-engine.ts](file:///c:/web/ScholarFlow/lib/editor/burstiness-engine.ts) - Kalkulator variasi panjang kalimat (*Burstiness*) dan indikator keterbacaan akademis.
- [lib/editor/academic-linter.ts](file:///c:/web/ScholarFlow/lib/editor/academic-linter.ts) - Analisis linter naskah ilmiah mendeteksi kalimat pasif berlebih, ambiguitas, dan nada informal.
- [lib/editor/concept-map.ts](file:///c:/web/ScholarFlow/lib/editor/concept-map.ts) - Ekstraksi hubungan antar sitasi menjadi graf relasi konsep riset.
- [lib/editor/literature-matrix.ts](file:///c:/web/ScholarFlow/lib/editor/literature-matrix.ts) - Pembentuk tabel sintesis pustaka komparatif (Metode, Temuan, Kelemahan).
- [lib/editor/slide-deck-generator.ts](file:///c:/web/ScholarFlow/lib/editor/slide-deck-generator.ts) - Generator format slide Marp / HTML untuk presentasi sidang ilmiah.
- [lib/editor/submission-package.ts](file:///c:/web/ScholarFlow/lib/editor/submission-package.ts) - Otomasi paket berkas submit jurnal beserta cover letter AI.
- [lib/editor/version-history.ts](file:///c:/web/ScholarFlow/lib/editor/version-history.ts) & [diff-engine.ts](file:///c:/web/ScholarFlow/lib/editor/diff-engine.ts) - Penyimpanan snapshot naskah lokal/cloud dan algoritma diff pembanding versi.
- [lib/editor/reference-importer.ts](file:///c:/web/ScholarFlow/lib/editor/reference-importer.ts) & [ris-parser.ts](file:///c:/web/ScholarFlow/lib/editor/ris-parser.ts) - Parser referensi RIS, BibTeX, dan teks mentah.
- [lib/editor/suggesting-engine.ts](file:///c:/web/ScholarFlow/lib/editor/suggesting-engine.ts) - Mesin pelacak perubahan naskah (*Track Changes*) mirip Google Docs/MS Word.
- [lib/editor/cross-reference.ts](file:///c:/web/ScholarFlow/lib/editor/cross-reference.ts) - Engine referensi silang dinamis untuk Gambar, Tabel, dan Persamaan Matematika.
- [lib/editor/citation-export-word.ts](file:///c:/web/ScholarFlow/lib/editor/citation-export-word.ts) & [word-html-generator.ts](file:///c:/web/ScholarFlow/lib/editor/word-html-generator.ts) - Generator ekspor naskah ke format Microsoft Word (.doc MHTML) dengan gambar tersemat.

#### B. Sub-methods Kanvas Editor (`lib/editor/methods/`)
- [lib/editor/methods/block-methods.ts](file:///c:/web/ScholarFlow/lib/editor/methods/block-methods.ts) - Manipulasi blok Editor.js (tambah, hapus, reposisi, sanitasi).
- [lib/editor/methods/citation-methods.ts](file:///c:/web/ScholarFlow/lib/editor/methods/citation-methods.ts) - Injeksi sitasi ke kanvas dan sinkronisasi real-time daftar pustaka.
- [lib/editor/methods/inline-methods.ts](file:///c:/web/ScholarFlow/lib/editor/methods/inline-methods.ts) - Format inline (bold, italic, underline, math).
- [lib/editor/methods/mention-injector.ts](file:///c:/web/ScholarFlow/lib/editor/methods/mention-injector.ts) - Injektor penyisip token sitasi dari dropdown `@cite`.
- [lib/editor/methods/outline-scaffold.ts](file:///c:/web/ScholarFlow/lib/editor/methods/outline-scaffold.ts) - Penyusun struktur naskah ke kanvas dokumen.
- [lib/editor/methods/suggestion-methods.ts](file:///c:/web/ScholarFlow/lib/editor/methods/suggestion-methods.ts) - Logika terima (*accept*) atau tolak (*reject*) revisi saran.

#### C. Enterprise AI & Multi-Tenant Infrastructure (`lib/ai/`)
- [lib/ai/token-quota.ts](file:///c:/web/ScholarFlow/lib/ai/token-quota.ts) - Engine alokasi kuota token bulanan, kalkulasi pemakaian per-fitur, dan pengurangan token reaktif.
- [lib/ai/tenant-key-resolver.ts](file:///c:/web/ScholarFlow/lib/ai/tenant-key-resolver.ts) - Resolusi cerdas API Key Gemini: memprioritaskan kunci kampus/institusi bila terdaftar, dan kunci personal jika independen.
- [lib/ai/idempotency-cache.ts](file:///c:/web/ScholarFlow/lib/ai/idempotency-cache.ts) - Cache cerdas berbasis hash SHA-256 pada prompt untuk mencegah redundansi panggilan LLM.
- [lib/ai/gemini-key-pool.ts](file:///c:/web/ScholarFlow/lib/ai/gemini-key-pool.ts) - Multi-key pool dengan mekanisme rotasi dan fallback otomatis saat batas kuota API tercapai.
- [lib/ai/rate-limiter.ts](file:///c:/web/ScholarFlow/lib/ai/rate-limiter.ts) - Rate limiter berbasis algoritma sliding window / token bucket.
- [lib/ai/server-ai-logger.ts](file:///c:/web/ScholarFlow/lib/ai/server-ai-logger.ts) - Pencatatan audit trail penggunaan AI server-side ke Supabase.

#### D. Data Service Layer & Realtime Sync (`lib/services/` & `lib/sync/`)
- [lib/services/types.ts](file:///c:/web/ScholarFlow/lib/services/types.ts) - Kontrak interface `IDataService` (Repository Pattern).
- [lib/services/supabase-service.ts](file:///c:/web/ScholarFlow/lib/services/supabase-service.ts) - Implementasi adapter Supabase PostgreSQL.
- [lib/services/express-service.ts](file:///c:/web/ScholarFlow/lib/services/express-service.ts) - Implementasi adapter REST VPS Express.js.
- [lib/services/index.ts](file:///c:/web/ScholarFlow/lib/services/index.ts) - Service factory `getDataService()` dan `<DataProvider>`.
- [lib/sync/hybrid-sync-engine.ts](file:///c:/web/ScholarFlow/lib/sync/hybrid-sync-engine.ts) - Mesin sinkronisasi naskah gabungan WebSocket + smart polling fallback dengan proteksi visibilitas tab.

#### E. Academic Document Templates (`lib/templates/`)
- [lib/templates/skripsi.ts](file:///c:/web/ScholarFlow/lib/templates/skripsi.ts) - Template standar skripsi universitas Indonesia (Bab I - Bab V).
- [lib/templates/apa.ts](file:///c:/web/ScholarFlow/lib/templates/apa.ts) - Template naskah jurnal standar format APA 7th Edition.
- [lib/templates/ieee.ts](file:///c:/web/ScholarFlow/lib/templates/ieee.ts) - Template naskah konferensi teknis IEEE (dua kolom).
- [lib/templates/report.ts](file:///c:/web/ScholarFlow/lib/templates/report.ts) - Template laporan riset ilmiah komprehensif.

---

### 4. Custom React Hooks (`hooks/`)

Daftar *custom hooks* untuk abstraksi logika presentasi komponen:
- [hooks/use-editor-ai.ts](file:///c:/web/ScholarFlow/hooks/use-editor-ai.ts) - Menangani pemanggilan Gemini AI, pemotongan token reaktif, dan event bus `scholarflow:tokens-updated`.
- [hooks/use-editor-citation.ts](file:///c:/web/ScholarFlow/hooks/use-editor-citation.ts) - Mengelola state pencarian referensi, penambahan sitasi, dan pembaruan daftar pustaka.
- [hooks/use-editor-document.ts](file:///c:/web/ScholarFlow/hooks/use-editor-document.ts) - Pengelolaan metadata dokumen, auto-save debounce, dan status sinkronisasi cloud.
- [hooks/use-editor-layout-logic.ts](file:///c:/web/ScholarFlow/hooks/use-editor-layout-logic.ts) - Manajemen status panel sidebar kanan, rail kiri, dan modal-modal editor.
- [hooks/use-editor-modals.ts](file:///c:/web/ScholarFlow/hooks/use-editor-modals.ts) - Dispatcher dan controller pembukaan 20+ modal akademis.
- [hooks/use-editorjs-methods.ts](file:///c:/web/ScholarFlow/hooks/use-editorjs-methods.ts) - Abstraksi akses langsung ke instance internal Editor.js.
- [hooks/use-ghostwriter.ts](file:///c:/web/ScholarFlow/hooks/use-ghostwriter.ts) - Hook cerdas untuk mendeteksi jeda pengetikan dan menampilkan saran ghostwriter.
- [hooks/use-citation-mention.ts](file:///c:/web/ScholarFlow/hooks/use-citation-mention.ts) - Hook deteksi karakter `@` dan pencarian cepat sitasi inline.
- [hooks/use-version-history.ts](file:///c:/web/ScholarFlow/hooks/use-version-history.ts) - Hook pembuatan snapshot otomatis dan pemulihan revisi naskah.
- [hooks/use-shared-document-sync.ts](file:///c:/web/ScholarFlow/hooks/use-shared-document-sync.ts) - Hook sinkronisasi dokumen bersama untuk kolaborasi *real-time*.

---

### 5. Unit Test Suite Matrix (`__tests__/utils/`)

ScholarFlow dilindungi oleh **27 berkas pengujian** dengan **229 pengujian unit Vitest** yang lolos 100%:

| Berkas Pengujian | Area Fungsional yang Diverifikasi |
| :--- | :--- |
| [`peer-reviewer.test.ts`](file:///c:/web/ScholarFlow/__tests__/utils/peer-reviewer.test.ts) | Verifikasi simulasi Reviewer #2, rubrik penilaian, dan lokalisasi bahasa. |
| [`latex-exporter.test.ts`](file:///c:/web/ScholarFlow/__tests__/utils/latex-exporter.test.ts) | Verifikasi naskah LaTeX, escaping simbol, dan decoding entitas HTML (`&amp;` → `\&`). |
| [`token-quota.test.ts`](file:///c:/web/ScholarFlow/__tests__/utils/token-quota.test.ts) | Verifikasi kuota token, deduksi otomatis, dan isolasi plan Free vs Pro. |
| [`tenant-key-resolver.test.ts`](file:///c:/web/ScholarFlow/__tests__/utils/tenant-key-resolver.test.ts) | Verifikasi resolusi API key institusi kampus vs kunci personal pengguna. |
| [`citation-transformer.test.ts`](file:///c:/web/ScholarFlow/__tests__/utils/citation-transformer.test.ts) | Verifikasi transformasi style sitasi (APA, IEEE, Harvard, Chicago) dan urutan alfabetis. |
| [`citation-mention.test.ts`](file:///c:/web/ScholarFlow/__tests__/utils/citation-mention.test.ts) | Verifikasi deteksi trigger `@cite` dan injeksi sitasi inline. |
| [`project-binder.test.ts`](file:///c:/web/ScholarFlow/__tests__/utils/project-binder.test.ts) | Verifikasi penggabungan bab skripsi, re-indeks figur/tabel, dan kompilasi naskah. |
| [`academic-integrity.test.ts`](file:///c:/web/ScholarFlow/__tests__/utils/academic-integrity.test.ts) | Verifikasi barometer integritas, deteksi frasa AI, dan isolasi paragraf. |
| [`academic-linter.test.ts`](file:///c:/web/ScholarFlow/__tests__/utils/academic-linter.test.ts) | Verifikasi deteksi kalimat pasif, redundansi, dan saran perbaikan linter. |
| [`academic-templates.test.ts`](file:///c:/web/ScholarFlow/__tests__/utils/academic-templates.test.ts) | Verifikasi scaffold naskah skripsi Dikti dan IMRaD format. |
| [`paper-chat.test.ts`](file:///c:/web/ScholarFlow/__tests__/utils/paper-chat.test.ts) | Verifikasi Q&A naskah, fallback offline, dan ekstraksi konteks literatur. |
| [`ghostwriter.test.ts`](file:///c:/web/ScholarFlow/__tests__/utils/ghostwriter.test.ts) | Verifikasi prediksi kalimat dan saran ghostwriting non-intrusif. |
| [`concept-map.test.ts`](file:///c:/web/ScholarFlow/__tests__/utils/concept-map.test.ts) | Verifikasi ekstraksi node dan edge graf relasi sitasi. |
| [`literature-matrix.test.ts`](file:///c:/web/ScholarFlow/__tests__/utils/literature-matrix.test.ts) | Verifikasi sintesis tabel pustaka perbandingan naskah. |
| [`slide-deck-generator.test.ts`](file:///c:/web/ScholarFlow/__tests__/utils/slide-deck-generator.test.ts) | Verifikasi struktur slide sidang skripsi dan formatting Marp. |
| [`submission-package.test.ts`](file:///c:/web/ScholarFlow/__tests__/utils/submission-package.test.ts) | Verifikasi pembuatan cover letter dan kelengkapan paket submit jurnal. |
| [`journal-presets.test.ts`](file:///c:/web/ScholarFlow/__tests__/utils/journal-presets.test.ts) | Verifikasi preset aturan jurnal Elsevier, IEEE, Nature, Springer, Sinta. |
| [`version-history.test.ts`](file:///c:/web/ScholarFlow/__tests__/utils/version-history.test.ts) | Verifikasi snapshot versi dokumen dan komputasi perbandingan diff. |
| [`reference-importer.test.ts`](file:///c:/web/ScholarFlow/__tests__/utils/reference-importer.test.ts) | Verifikasi parsing format berkas BibTeX, RIS, dan metadata PDF. |
| [`suggesting-mode.test.ts`](file:///c:/web/ScholarFlow/__tests__/utils/suggesting-mode.test.ts) | Verifikasi pelacakan revisi, persetujuan dan penolakan saran perbaikan. |
| [`cross-reference.test.ts`](file:///c:/web/ScholarFlow/__tests__/utils/cross-reference.test.ts) | Verifikasi keterkaitan penomoran otomatis gambar, tabel, dan persamaan. |
| [`idempotency-cache.test.ts`](file:///c:/web/ScholarFlow/__tests__/utils/idempotency-cache.test.ts) | Verifikasi pencegahan redundansi request LLM melalui SHA-256 hash. |
| [`command-palette.test.ts`](file:///c:/web/ScholarFlow/__tests__/utils/command-palette.test.ts) | Verifikasi indeks aksi shortcut keyboard dan registrasi perintah cepat. |
| [`editor-lifecycle-hardening.test.ts`](file:///c:/web/ScholarFlow/__tests__/utils/editor-lifecycle-hardening.test.ts) | Verifikasi siklus inisialisasi kanvas dan pencegahan duplikasi blok. |
| [`editor-interaction-hardening.test.ts`](file:///c:/web/ScholarFlow/__tests__/utils/editor-interaction-hardening.test.ts) | Verifikasi ketahanan seleksi teks, formatting, dan event listeners. |
| [`sanitize.test.ts`](file:///c:/web/ScholarFlow/__tests__/utils/sanitize.test.ts) | Verifikasi sanitasi input HTML untuk mencegah serangan XSS. |
| [`ai-history.test.ts`](file:///c:/web/ScholarFlow/__tests__/utils/ai-history.test.ts) | Verifikasi persistensi dan pencatatan riwayat pemanggilan AI. |

---

### 6. Architectural Documentation & Specifications (`doc/`)

Folder `doc/` menyimpan pedoman arsitektur dan spesifikasi sistem yang mendalam:

- **Dokumentasi Arsitektur Spesifik (`doc/architecture/`)**:
  - [`01-server-side-ai-history.md`](file:///c:/web/ScholarFlow/doc/architecture/01-server-side-ai-history.md) - Spesifikasi persistensi log riwayat pemanggilan AI server-side.
  - [`02-smart-idempotency-cache.md`](file:///c:/web/ScholarFlow/doc/architecture/02-smart-idempotency-cache.md) - Arsitektur caching SHA-256 idempotency untuk menekan biaya API AI.
  - [`03-token-quota-synchronization.md`](file:///c:/web/ScholarFlow/doc/architecture/03-token-quota-synchronization.md) - Desain sinkronisasi kuota token real-time antara server, database, dan UI.
  - [`04-multi-tenant-campus-keys.md`](file:///c:/web/ScholarFlow/doc/architecture/04-multi-tenant-campus-keys.md) - Arsitektur multi-tenancy kampus, pembagian kuota per fakultas, dan resolusi domain institusi.
- **Pedoman Sistem & Database**:
  - [`PRODUCTION_TASKS.md`](file:///c:/web/ScholarFlow/doc/PRODUCTION_TASKS.md) - Master roadmap 50+ fase pengembangan dan kesiapan produksi.
  - [`DATABASE_SCHEMA.md`](file:///c:/web/ScholarFlow/doc/DATABASE_SCHEMA.md) - Skema tabel PostgreSQL lengkap (users, profiles, documents, citations, quotas, audit).
  - [`DATABASE_MIGRATION_GUIDE.md`](file:///c:/web/ScholarFlow/doc/DATABASE_MIGRATION_GUIDE.md) - Panduan migrasi database dari Supabase PaaS ke VPS mandiri.
  - [`PRICING_TIERS.md`](file:///c:/web/ScholarFlow/doc/PRICING_TIERS.md) - Rincian pembagian fitur, kuota kata/token, dan harga (Free Tier vs Pro Writer vs Campus).
  - [`API_REFERENCE.md`](file:///c:/web/ScholarFlow/doc/API_REFERENCE.md) - Dokumentasi REST API untuk integrasi pihak ketiga.
  - [`EDITOR_FLOW.md`](file:///c:/web/ScholarFlow/doc/EDITOR_FLOW.md) - Aliran daur hidup kanvas Editor.js, persistence payload, dan sinkronisasi blok.
  - [`ENTERPRISE_STANDARDS_CHECKLIST.md`](file:///c:/web/ScholarFlow/doc/ENTERPRISE_STANDARDS_CHECKLIST.md) - Standar audit kepatuhan ISO/IEC, proteksi data, dan keamanan RLS.
  - [`TEMPLATE_LOCALIZATION_GUIDE.md`](file:///c:/web/ScholarFlow/doc/TEMPLATE_LOCALIZATION_GUIDE.md) - Panduan penambahan template dokumen dan lokalisasi dwibahasa.

---

## 🧭 Panduan Eksekusi Tugas & Pemeliharaan untuk AI Agent / Developer

Saat melakukan penambahan fitur atau perbaikan bug pada ScholarFlow, selalu ikuti prinsip berikut:
1. **Aturan Preservasi Kode**: Jangan pernah menghapus kode yang sudah ada kecuali diminta secara eksplisit. Selalu prioritaskan penambahan atau penyempurnaan fungsi (*non-destructive coding*).
2. **Dukungan Dark Mode**: Seluruh elemen antarmuka baru wajib memiliki varian `dark:` Tailwind CSS yang kontras dan nyaman di mata.
3. **Dukungan Dwibahasa (Bilingual EN ↔ ID)**: Semua teks antarmuka, label, tombol, dan pesan kesalahan harus mendukung dwi-bahasa melalui `useLanguage()` atau kondisional `isEn ? ... : ...`.
4. **Verifikasi Pengujian**: Sebelum melakukan commit, selalu jalankan verifikasi tipe TypeScript (`npx tsc --noEmit`) dan seluruh test suite Vitest (`npx vitest run`) untuk memastikan **229/229 tes tetap lolos 100%**.
