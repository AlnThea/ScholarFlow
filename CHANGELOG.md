# ScholarFlow CHANGELOG 📜

All notable changes, architectural milestones, and UI improvements to the ScholarFlow AI Academic Co-Pilot project will be documented in this file.

## ⚡ [v0.9.3] - 2026-10-15 (Persistent AI Generation History & Cross-Session Restoration)

### 📜 Local Storage Persistence & Session Safety
- **Storage Engine (`lib/editor/ai-history.ts`)**: Built persistent `loadAiHistory` and `saveAiHistory` utilities with localStorage key `scholarflow.editor.ai-history.v1` and a FIFO capacity limit of 15 items, ensuring working AI drafts are retained across tab closes and browser refreshes.
- **Hook State Hydration (`hooks/use-editor-ai.ts`)**: Hydrated `aiHistory` from client localStorage on mount within `useEffect`, keeping the history synchronized when entries are added, deleted individually, or cleared altogether.
- **Enterprise Dark Mode & Bilingual Modal (`components/editor/editor-sidebar.tsx`)**: Upgraded the AI History Modal popup with full dark mode support (`dark:bg-slate-900`, `dark:border-slate-800`, `dark:text-slate-100`), tone pill indicators, model badges, side-by-side original vs. polished comparison, one-click clipboard copying, and direct 'Apply to Canvas' functionality.
- **Zero Database Changes**: Operating purely on the client-side working storage layer, this feature requires zero Supabase table migrations, ensuring zero extra latency or cloud bandwidth overhead.

## ⚡ [v0.9.2] - 2026-10-15 (Resilient AI Transaction & Zero-Waste Token Guard)

### 🛡️ Smart Idempotency Cache & Zero-Waste Token Deduplication
- **Engine (`lib/ai/idempotency-cache.ts`)**: Built a deterministic 64-bit double-pass FNV-1a hash caching engine with a 5-minute TTL to deduplicate identical AI prompts across both Edge and Node.js runtimes.
- **Deduplication Across All 4 AI Endpoints**:
  - `/api/v1/ai/improve`: Returns cached response in 0.01s with `0` tokens charged if the user submits the same text and tone within 5 minutes.
  - `/api/v1/ai/abstract`: Reuses recent context abstracts on page refreshes without re-calling Google Gemini.
  - `/api/v1/ai/synthesize`: Deduplicates literature review synthesis for identical reference selections.
  - `/api/v1/ai/interpret-stats`: Caches multimodal SPSS table analyses by combining user ID, config, and input data signatures.

### 🛡️ Browser Safety Guard (`window.onbeforeunload`) & Micro-UX Badges
- **Accidental Refresh/Close Prevention**: Integrated `beforeunload` event listeners in `useEditorAi`, `ParaphraseStudio`, and `SidebarStatsTab`, protecting users from losing active generations if they press F5, Ctrl+R, or Close Tab.
- **Cache Hit Indicator**: Added visual `⚡ 0 Token (Cache Instan)` status indicators to `SidebarWritingTab` and `ParaphraseStudio` with full dark mode and bilingual (EN <-> ID) support.
- **Unit Testing**: Added Vitest test suite in `__tests__/utils/idempotency-cache.test.ts` (5/5 tests passing, 25/25 tests passing in total suite).

## ⚡ [v0.9.1] - 2026-10-15 (AI Token Quota Consumption & Realtime Profile Synchronization Fix)

### 🛡️ Service-Role Database Permissions & Accurate Quota Tracking
- **Server-side Service Role Client (`lib/supabase-admin.ts`)**: Initialized privileged Supabase client utilizing `process.env.SUPABASE_SERVICE_KEY`, allowing backend route handlers to update user `ai_tokens_used` metrics without getting silently rejected by Row Level Security (`auth.uid() = id`).
- **Engine DB Client Upgrade (`lib/ai/token-quota.ts`)**: Upgraded `checkPersonalQuota` and `recordPersonalTokenConsumption` to leverage `supabaseAdmin || supabase`.

### ⚡ Client-Side State Synchronization & Paraphrase Studio Bridge
- **Paraphrase Studio User Context (`components/editor/paraphrase-studio.tsx`)**:
  - Connected `useAuth()` to provide `user.id` and `profile.subscription_plan` across all 3 concurrent `improveWriting` variations (`paraphrase`, `simplify`, `mimic`).
  - Added token quota synchronization to local cache via `saveLocalQuotaState` and triggered `refreshProfile()` upon generation.
  - Added proactive quota exhaustion handling that triggers `setIsPlanModalOpen(true)` if user reaches monthly allowance.
- **Editor AI Hook Reactive Synchronization (`hooks/use-editor-ai.ts`)**:
  - Created centralized `updateQuotaState` callback synchronizing `tokensUsed`, `monthlyQuota`, `localStorage`, and `refreshProfile()`.
  - Linked `updateQuotaState` across `runImproveWriting`, `runParaphrase`, `runSummarize`, `runGenerateAbstract`, and `handleParafrasePlagiat`.
- **Literature Review Synthesis Quota Guard (`app/api/v1/ai/synthesize/route.ts` & `lib/api/ai.ts`)**:
  - Integrated `checkPersonalQuota` and `recordPersonalTokenConsumption` into `/api/v1/ai/synthesize`.
  - Upgraded `synthesizeLiteratureReview` client function and `handleSynthesizeLiterature` hook to transmit user credentials and reactively update `updateQuotaState`.
- **SPSS / PSPP Statistical Interpreter Quota Protection (`app/api/v1/ai/interpret-stats/route.ts` & `components/editor/sidebar-stats-tab.tsx`)**:
  - Enforced `checkPersonalQuota` on multimodal vision and table analysis requests.
  - Calculated consumed tokens and recorded usage, automatically synchronizing `saveLocalQuotaState` and triggering `refreshProfile()` upon successful analysis.
- **Automated Verification**: Ran Vitest unit tests verifying 20/20 test cases pass.

## 🏛️ [v0.9.0] - 2026-10-15 (Multi-Tenant Campus Dedicated AI Key Resolver & Super Admin Key Config)

### 🔑 Per-Tenant Key Isolation & Resolution Engine
- **Tenant Key Resolver Engine (`lib/ai/tenant-key-resolver.ts`)**: Built an intelligent per-campus API key resolver that queries user university affiliation via `institution_members` or `profiles.institution_id`, isolates campus rate limits (`campus_text_key` vs `campus_vision_key`), and implements in-memory caching (5-minute TTL) with tiered failover pools (`campus_byok` -> `campus_pool` -> `pro_pool` -> `free_pool`).
- **End-to-End AI Endpoints Integration**:
  - `/api/v1/ai/improve`: Dynamic injection of resolved campus key and category pool into SSE streaming and direct generation runners, returning `tenant_source` and `institution_name` metadata.
  - `/api/v1/ai/abstract`: Upgraded to `geminiKeyPool` multi-key failover and tenant key resolution.
  - `/api/v1/ai/synthesize`: Upgraded to `geminiKeyPool` failover and campus tenant key resolution.
  - `/api/v1/ai/interpret-stats`: Multimodal SPSS vision analysis now resolves and injects `campus_vision_key` dedicated for university stats workloads.
- **Client Integration (`components/editor/sidebar-stats-tab.tsx`)**: Connected user session and active subscription tier to statistical interpreter API calls.
- **Super Admin Key Config (`components/admin/institution-modal.tsx`)**: Added dedicated BYOK input fields for `campus_text_key` and `campus_vision_key` with Dark Mode and Bilingual (EN <-> ID) support.
- **Automated Unit Testing**: Created comprehensive test suite in `__tests__/utils/tenant-key-resolver.test.ts` (9/9 tests passing in Vitest).

## 💳 [v0.8.5] - 2026-10-12 (Xendit Animated Payments & B2B Campus Admin Management)

### 🚀 Xendit Hosted Invoice & Animated In-App Checkout
- **Xendit Invoice Creation & Webhook Endpoints**: Implemented `/api/payments/xendit/create-invoice` and `/api/payments/xendit/webhook` supporting live Xendit API integration with graceful sandbox simulation fallback.
- **Rich 4-Stage In-App Animated Checkout Modal**: Created `XenditCheckoutModal` featuring invoice creation pulse, live countdown timer (`23:59:45`), active radar pulse listener (`animate-ping`), live polling detector, instant demo simulation trigger, and celebration confetti upgrade moment.
- **Gateway Selection Parity**: Updated `GatewaySelectorModal` and `PricingModal` to present Xendit Invoice alongside Stripe and Midtrans.
- **Hybrid API Key Management**: Supported Xendit credentials through both `.env` (`XENDIT_SECRET_KEY`) and Admin Panel (`/admin/gateways`).

### 🏛️ B2B Campus & Institutional Partner Management (`/admin/institutions`)
- **SQL Migration Script**: Created `supabase/migrations/20261012000001_create_institutions_table.sql` with RLS policies and table indexes.
- **Prisma Model**: Added `InstitutionEntry` universal model to `prisma/schema.prisma`.
- **API Service & Dual-Persistence**: Implemented `lib/api/institutions.ts` supporting full CRUD operations with `localStorage` dual-persistence fallback (`scholarflow.institutions.v1`).
- **Super Admin Management UI**: Built `app/admin/institutions/page.tsx`, `components/admin/institutions-table.tsx` with seat capacity progress bars and KPI metric cards, and `components/admin/institution-modal.tsx` with domain whitelisting and PIC email assignments.
- **Admin Sidebar Navigation**: Linked "Campus & Institutions" directly in `SidebarSettingsView`.
- **100% Bilingual & Dark Mode**: All new UI components strictly adhere to Tailwind Dark Mode and dynamic EN/ID localization.


### 🚀 B2B Campus Portal (Institution Dashboard)
- **Enterprise UI/UX Layout**: Implemented `/dashboard/institution` with a professional, Silicon Valley-standard SaaS dashboard utilizing `framer-motion` for smooth staggered animations and state transitions.
- **Micro-UX Refinements**: Built a robust Member Management data table featuring Search, Status Filters, **Pagination**, elegant **Empty States**, and **Skeleton Loading** placeholders.
- **Seat & Quota Management**: Added visual KPI cards with dynamic animated progress bars showing license capacity (e.g., "42/150 Seats Allocated") to drive PLG Upselling.
- **Usage Analytics**: Integrated `recharts` to render beautiful, responsive Area Charts (Platform Adoption Rate) and Pie Charts (Role Distribution) to provide campus admins with actionable ROI metrics.
- **Organization Branding**: Added a settings tab supporting custom organization names and Domain Whitelisting configuration (e.g., `@um.ac.id`) for automated member invites.
- **Role-Based Access Control (RBAC)**: Added visual badges and permission-ready UI for managing Campus Admins vs Standard Members.
- **100% Bilingual & Dark Mode**: Dashboard UI is fully compliant with EN/ID localization and responsive Tailwind Dark Mode.

## 🚀 [v0.7.0] - 2026-09-30 (Enterprise Burstiness & Academic Integrity)

### 🛡️ Professional Grade UI & Security
- **Heatmap / Inline Highlight**: Added non-destructive visual heatmap directly in the Editor canvas (`.ce-block`) that highlights detected AI buzzwords using safe regex DOM replacement without destroying block formats.
- **AI Lexical Analyzer & Buzzword Tracker**: Expanded `AI_BUZZWORDS` dictionaries with hundreds of words for both English and Indonesian. Implemented a professional UI in `SidebarBurstinessTab` that counts and displays specific detected cliches.
- **Citation Lock (Safe-Mode Paraphrase)**: Implemented robust dual-regex protection (supporting APA/Harvard and IEEE formats) in `ParaphraseStudio`. The system securely locks citations like `(Smith et al., 2020)` into `[CITE_N]` placeholders before calling Gemini, restoring them flawlessly post-generation to prevent AI hallucination or deletion.
- **Author Stylometry (Mimic My Voice)**: Upgraded the `improveWriting` API to accept an author's `styleReference`. Paraphrase Studio now dynamically reads the surrounding document text to instruct the AI to perfectly mimic the author's unique vocabulary, rhythm, and stylistic quirks instead of generating generic academic text.
- **Originality Certificate Export**: Added `handleExportReport` to generate and print a certified "ScholarFlow Originality Report" (PDF), providing researchers tangible proof of their document's burstiness score, lexical diversity, and human-written status.
- **Enterprise UI Refinements**: Added "SAFE-MODE" UI badge and visual warning alerts (Amber/Emerald states) for Lexical Analyzer. Fully responsive with Dark Mode and `isEn` bilingual support.

## 🚀 [v0.6.0] - 2026-09-22

### 📊 Bibliometric Network Analytics (Phase 5 & 6)
- **Dynamic NLP Keyword Extraction**: Replaced static regex keyword whitelist with advanced NLP extraction, integrating `keyword-extractor` and `stopword` for comprehensive bilingual (English & Indonesian) stopword filtering and true topic detection.
- **Thesaurus / Dictionary Auto-Save**: Connected the Thesaurus/Synonym dictionary to Supabase `user_profiles` (JSONB preferences) with a 2000ms debounce auto-save, ensuring workspace persistence across sessions. Added capability to map words to empty strings to dynamically exclude/hide irrelevant nodes.
- **High-Resolution & Vector Export**: 
  - Added **PNG (4K)** export feature leveraging 3x canvas upscaling and anti-aliasing.
  - Added **SVG (Vector)** export feature via custom programmatic mathematical generation of nodes and links for infinite-resolution academic poster printing.
- **Source Documents Drill-Down**: Upgraded node click interaction in the Detail Panel to list all underlying source documents (Title, Author, Year) contributing to the selected cluster.
- **True Clustering Algorithm (Louvain Modularity)**: Integrated `jlouvain` to compute actual Louvain Modularity communities/clusters, completely replacing randomized/dummy grouping.
- **Global Network Metrics Dashboard**: Implemented a floating dashboard in the bottom-left displaying Total Nodes, Total Links, Network Density, and Average Degree.
- **Metrics Data Export**: Added `Export CSV` functionality to download raw node metrics (Occurrences, Centrality, Cluster Group, Neighbors Count) for statistical analysis in SPSS or Excel.
- **Node Search & Auto-Zoom**: Optimized the existing search bar in the floating toolbar to trigger camera auto-panning and zoom onto targeted topics.
- **Layout Physics Switcher**: Added UI control to dynamically change the network layout algorithms (Force-Directed/Repulsion, Circular/Radial, Grid/Matrix, and Freeze/No Physics).
- **System-wide Bilingual & Dark Mode Refactoring**: Fully translated and styled all modals, sidebars, dashboard tabs, and payment flows to strictly support EN/ID language toggles and Tailwind dark mode classes seamlessly.

## 🚀 [Unreleased]

### 🏗️ Massive Architecture Refactoring & Type-Safety
- **Refactored**: Pemecahan secara masif komponen-komponen raksasa (seperti `page.tsx`, `editor-layout.tsx`, `use-editorjs-methods.ts`, dll) hingga berukuran `< 700 baris`. Arsitektur kini sangat modular.
- **Fixed**: Perbaikan 100% kompilasi TypeScript (*Type-Safe*).

### 🎨 Enterprise Dashboard Redesign
- **Redesigned**: Antarmuka User Dashboard (`app/dashboard/page.tsx`) dirombak menjadi kelas Enterprise (dengan *Metrics Cards*, *Quick Access* ber-grid elegan, dan animasi *hover* transisi yang mulus).

### 📊 Bibliometric Network Analysis (Ultimate Professional Parity)
- **Added**: Fitur *Node Search & Focus* dengan *camera zoom* dan penyorotan dinamis.
- **Added**: Fitur *Overlay Visualization (Trend Analysis)* untuk mewarnai *node* berdasarkan rata-rata tahun terbit.
- **Added**: Ekstraksi dan penghitungan *PageRank Centrality* langsung di grafik untuk mendeteksi *node* terpenting.
- **Added**: Dukungan *Density Visualization (Heatmap)* untuk menyorot konsentrasi klaster topik tanpa garis graf.
- **Added**: Fitur *Time-Slicing Animation* untuk menganimasikan rentang tahun evolusi graf secara otomatis (*Play/Pause*).
- **Added**: Fungsi Ekspor *GraphML* untuk memigrasikan hasil graf ke Gephi, VOSviewer, atau Cytoscape.
- **Added**: Mode analisis baru: *Co-Citation* dan *Bibliographic Coupling* antar dokumen (Berdasarkan Daftar Pustaka).
- **Added**: Kontrol Visual (*Visual Tuning*) untuk *physics gravity* / tegangan antar *node* dan kontrol *scaling* ukuran teks/graf.

### 🔗 Sidebar Integration Fix
- **Fixed**: Perbaikan integrasi *Sidebar* dengan halaman *My Library* dan *Bibliometric Analysis*. Navigasi di luar *editor* konsisten dan bebas dari URL 404.
### ✨ Distraction-Free Zen Mode Layout
- **Added**: Upgraded the Left Sidebar (`MinimalSidebar`) to completely hide (`w-0`) when collapsed instead of shrinking to `w-16`. A floating Hamburger menu appears on the document header to toggle it, providing a fully immersive, distraction-free writing canvas for the user.

### 🛡️ Enterprise Professional Standards (Phase 8 Planned)
- **Planned**: Add Error Boundaries for robust component crash recovery.
- **Planned**: Implement DOMPurify to prevent XSS (Cross-Site Scripting) vulnerabilities in EditorJS and UI components.
- **Planned**: Introduce automated testing suite (Vitest/Jest for unit tests, Playwright for E2E).
- **Planned**: Interactive onboarding tours (Shepherd.js) and accessibility (a11y) improvements.

### ✨ Burstiness & Sentence Length Analyzer
- **Added**: Integrating a 100% Client-Side Sentence Variance (Burstiness) Analyzer to detect AI-generated text patterns using Math/Regex (Standard Deviation) and visualizing it with `recharts` in the editor sidebar.
- **Improved**: Dedicated "Burstiness" tab inside the right sidebar serving as the default open tab, allowing more space for chart visualizations.
- **Layout Tweaks**: Main canvas editor aligned to the left and right sidebar widened to `480px` for optimal analytics viewing.
- **Added (Cockpit Layout)**: Implemented 3-column architecture synchronizing the Right Sidebar with the Left Sidebar. The Left Sidebar automatically expands to a 350px `SentenceRhythmExplorer` when the Burstiness tab is active.
- **Added (Rhythm Explorer)**: Sentence tokenizer that breaks down the manuscript into clickable Sentence Cards grouped by length (short, standard, long, complex) with a visual Cadence Ribbon.
- **Added (Paraphrase Studio)**: Right-panel UI containing a 4-box metrics grid and an interactive AI Paraphrase Studio with smart priority sentence highlighting.
- **Added (AI Integration)**: Connected the Paraphrase Studio to the Gemini API (concurrently generating 3 variations: Rhythmic, Clause Split, and Scholarly Flow).
- **Added (Real-time Sync)**: "Apply" function replaces text directly within the EditorJS data blocks in real-time.
- **Added (Smart Replace & Auto-Scroll)**: Implemented DOM traversal for auto-scrolling to clicked sentences and a flexible Regex engine to overwrite text without stripping HTML formats (bold, italic, citations).
- **Added (Document Toggle)**: Switch to analyze the burstiness of the entire document text at once instead of just selected segments.
- **Added (Paywall & PLG)**: Locked the Paraphrase Studio feature behind a Pro subscription, rendering a disabled UI with an "Upgrade to Pro" call-to-action button for Free Tier users.

## 🛠️ [v0.7.5] - 2026-08-11

### 🔌 AI Provider Management Table & Database Column Alignment Fix
- **Registered AI Providers Table Section**:
  - Added dedicated **Section 0: Provider AI Terdaftar & Gateway Kredensial** table on `/admin/models` page displaying Provider ID, Provider Name, Engine Type, API Base URL, API Key Status, Edit Provider action, and **Delete Provider** action.
- **Database Payload Alignment**:
  - Fixed insert/update payload matching in `lib/api/ai-models.ts` for Supabase `public.ai_providers` (`id`, `name`, `type`, `base_url`, `api_key`) and `public.ai_models` (`provider_id`).

---

## 🎯 [v0.7.3] - 2026-08-11

### 🔌 Pure Dynamic Provider Registration & Cleaned Default Catalog
- **Cleaned Built-In Defaults**:
  - Removed pre-seeded Hugging Face, Groq, and Together AI providers from `DEFAULT_PROVIDERS` in `lib/api/ai-models.ts`. Only `Google Gemini Direct` and `OpenRouter API` remain as hardcoded built-ins.
- **100% Dynamic Provider Addition**:
  - Hugging Face, Groq Cloud, Together AI, or Custom OpenAI proxies are now added **100% dynamically** by the Admin via the **+ Tambah Provider AI** modal.

---

## 🗄️ [v0.7.2] - 2026-08-11

### 💾 SQL Migration & Prisma Schema for AI Providers Table
- **Supabase Migration Script**:
  - Created official SQL migration script [20260811000003_create_ai_providers_table.sql](file:///c:/web/ScholarFlow/supabase/migrations/20260811000003_create_ai_providers_table.sql) to provision `ai_providers` table and default seed data.
- **Prisma Schema Update**:
  - Added `AiProviderEntry` model to [schema.prisma](file:///c:/web/ScholarFlow/prisma/schema.prisma) and linked `provider_id` field in `AiModelEntry`.

---

## ✨ [v0.7.1] - 2026-08-11

### 🎨 Clean & Streamlined Add/Edit AI Model Modal
- **Clean 4-Field Model Modal**:
  - Refactored Add/Edit AI Model Modal to focus purely on Model setup: **AI Provider selection**, **Gateway Key**, **Model Display Name**, and **Real API Model ID**.
  - Replaced cluttered model-level Base URL / API Key inputs with a clean **Linked Provider Credentials Info Badge** that shows the parent Provider credentials.
- **Top Banner Quick Provider Management**:
  - Added **Manage Providers** button directly in the `/admin/models` dashboard top banner alongside the **Add New Model** button for rapid provider management.

---

## 🏛️ [v0.7.0] - 2026-08-11

### 🏢 2-Tier AI Provider & Model Management Architecture
- **Provider & Model Decoupling**:
  - Implemented 2-tier Provider management in `lib/api/ai-models.ts` (`AIProvider` & `AIModel`), allowing Admins to register AI Providers (Hugging Face, Groq, Together AI, Custom Proxy) with API Keys & Base URLs **once**.
- **Model Provider Linking**:
  - When adding new AI Models, Admins select the registered Provider from a dropdown and enter only the **Model ID** (e.g. `meta-llama/Llama-3.3-70B-Instruct`). Models automatically inherit API credentials from their parent Provider.
- **Provider Modal & Persistence**:
  - Added Provider Management Portal (`isProviderModalOpen`) and dual-persistence in Supabase `ai_providers` table & LocalStorage (`scholarflow.ai_providers.v1`).

---

## 🔑 [v0.6.2] - 2026-08-11

### ⚡ Dynamic In-App API Key Configuration for Multi-Model Providers
- **In-App Dynamic API Key Entry**:
  - Enhanced Create/Edit AI Model Modal to dynamically display **API Key & Base URL** input fields whenever selecting `Hugging Face`, `Groq Cloud`, `Together AI`, or `Custom OpenAI` providers.
  - Allows Admins to input provider tokens (`hf_xxxx`, `gsk_xxxx`, `tgp_xxxx`, etc.) directly through the UI without editing `.env` or restarting the server.
  - Gemini & OpenRouter maintain default fallback to `.env` variables if custom keys are left empty.

---

## 🤖 [v0.6.1] - 2026-08-11

### 🤗 Hugging Face, Groq Cloud & Together AI Multi-Model Catalog Support
- **Hugging Face Inference & Router API (`huggingface`)**:
  - Implemented `callHuggingFace` supporting 1-key multi-model routing across Hugging Face Hub models (e.g. `meta-llama/Llama-3.3-70B-Instruct`, `Qwen/Qwen2.5-Coder-32B-Instruct`, `deepseek-ai/DeepSeek-R1-Distill-Qwen-32B`).
  - Accepts `HUGGINGFACE_API_KEY`, `HF_TOKEN`, or custom model key.
- **Groq Cloud & Together AI Native Support (`groq`, `together`)**:
  - Added dedicated provider choices and badge indicators for Groq Cloud (`https://api.groq.com/openai/v1`) and Together AI (`https://api.together.xyz/v1`).

---

## 🔄 [v0.6.0] - 2026-08-11

### 🔑 Gemini Multi-API Key Failover & Rotation Pool
- **Automatic Multi-Key Failover Engine**:
  - Implemented [gemini-key-pool.ts](file:///c:/web/ScholarFlow/lib/ai/gemini-key-pool.ts) allowing ScholarFlow to accept multiple Google Gemini API keys (comma or whitespace separated) from `.env` (`GEMINI_API_KEYS` or `GEMINI_API_KEY`) or Admin Model configurations.
  - Automatically tracks rate limits (HTTP 429 / Quota Exceeded / Resource Exhausted) and puts exhausted keys in a temporary cooldown state while instantly failing over to key #2, #3, etc.
  - **Zero UI Complexity**: Displays only 1 single Gemini model to the end user while transparently scaling daily quota capacity up to 3x, 5x, or 10x in the backend.
  - **Auto-Reset**: Cooldown states automatically expire when keys are restored by Google API reset timers.

---

## 🌐 [v0.5.5] - 2026-08-11

### 🌍 100% Bilingual UI i18n & Modal Button Spacing Polish
- **100% Bilingual Support for Admin AI Models (`/admin/models`)**:
  - Upgraded `/admin/models` dashboard view and Create/Edit AI Model Modal to be 100% bilingual (`language === 'en'` vs `language === 'id'`).
  - Added dynamic English and Indonesian translations for headers, descriptions, stats cards, table headers, status badges, modal fields, placeholders, helper hints, option labels, tooltips, and action buttons.
- **Mandatory UI i18n Rule Enforcer**:
  - Created [ui_i18n.md](file:///c:/web/ScholarFlow/.agents/rules/ui_i18n.md) and updated [AI_RULES_MINI.md](file:///c:/web/ScholarFlow/AI_Rules/AI_RULES_MINI.md) with mandatory bilingual i18n guidelines for all future component developments.
- **Modal Button Spacing & Padding Polish**:
  - Fixed invalid `px-4.5` Tailwind CSS class on modal action buttons, replacing it with `px-6 py-2.5 inline-flex items-center justify-center gap-2 shrink-0 whitespace-nowrap` for ample, symmetrical padding.

---

## 🚀 [v0.5.4] - 2026-08-11

### 🎯 Canvas Text Selection Apply Fix & Dual-Persistence Database Backup
- **Selection Range Auto-Restore for AI Apply**:
  - Upgraded `insertText` in `editorjs-editor.tsx` and `scholar-editor.tsx` to automatically remember and restore the exact text selection range (`lastHighlightedRangeRef` / `lastSelectionRangeRef`) when clicking **Apply** in the right sidebar.
  - Refocused the main document canvas element (`contenteditable`) and replaced original text with AI polished results in real-time, triggering EditorJS auto-save and statistics re-calculation.
- **Auto-Switching Right Sidebar to Writing Tab**:
  - Upgraded `scholar-editor.tsx` and `editor-sidebar.tsx` so that triggering AI Polish, Paraphrase, Summarize, Generate Abstract, or Plagiarism Paraphrase automatically opens and switches the right sidebar straight to the **Writing (AI Assist)** tab (`'writing'`).
- **Database Schema Migration & Dual-Persistence Backup**:
  - Added **LocalStorage Dual-Persistence** (`scholarflow.ai_models.v1`) to `lib/api/ai-models.ts` so custom AI models added or edited via the Admin Panel remain persisted locally even if cloud DB table migrations are pending.
  - Gracefully sanitized Supabase insert/update payloads to fallback to base fields (`id`, `name`, `model_id`, `is_enabled`, `is_premium`) if custom schema columns are missing.
  - Created official SQL migration file [`supabase/migrations/20260811000002_update_ai_models_provider_fields.sql`](file:///c:/web/ScholarFlow/supabase/migrations/20260811000002_update_ai_models_provider_fields.sql) and updated [`prisma/schema.prisma`](file:///c:/web/ScholarFlow/prisma/schema.prisma).
- **Custom React Alert & Confirm Modal Portal**:
  - Replaced native browser `alert()` and `confirm()` prompts with a high-contrast, custom React Modal Portal (`showAlertModal` & `showConfirmModal`).
- **Live Provider Engine Indicators**:
  - Added **Tipe Provider API Badge** in Admin AI Models tables (`Google Gemini`, `Custom OpenAI`, `OpenRouter`) and **Live Engine Indicator Banner** in the editor toolbar.

---

## ⚡ [v0.5.3] - 2026-08-11

### 🎛️ Admin AI Model Active Toggles & Test Connection Feature
- **High-Contrast Toggle Switches (`/admin/models`)**:
  - **Off State**: Upgraded to a high-contrast theme featuring a 2px crisp border (`border-2 border-slate-400`), dark slate knob (`bg-slate-500`), inner background shadow (`bg-slate-200 shadow-inner`), and distinct `Off` badge label (`text-slate-600 bg-slate-100 border-slate-300`).
  - **Free Tier On State**: Vivid emerald green theme (`bg-emerald-500 border-emerald-600 shadow-emerald-500/20 ring-2 ring-emerald-500/20`) with white knob and emerald status badge.
  - **Pro Writer On State**: Vivid enterprise indigo theme (`bg-indigo-600 border-indigo-700 shadow-indigo-500/20 ring-2 ring-indigo-500/20`) with white knob and indigo status badge.
  - **Global Switch Component**: Enhanced reusable `<Switch />` component with dark knob and crisp border styling when Off.
- **AI Gateway Test Connection System (`/api/v1/ai/test-connection`)**:
  - **Edge API Endpoint**: Created `/api/v1/ai/test-connection` route to ping Google Gemini, OpenRouter, and Custom OpenAI-Compatible endpoints with latency calculation (`ms`) and response validation.
  - **1-Click Table Action Button**: Added `⚡ Test Connection` button in the action column of both Free Tier and Pro Writer tables in `/admin/models`.
  - **Modal Integration**: Added `⚡ Uji Koneksi` button to the Admin AI Model Create & Edit Modal alongside `Simpan Data`.

---

## 📚 [v0.5.2] - 2026-08-11

### 🎓 Template Localization & Interactive UI Help Center
- **Template Localization Guide**: Added detailed developer and user guide at [doc/TEMPLATE_LOCALIZATION_GUIDE.md](file:///c:/web/ScholarFlow/doc/TEMPLATE_LOCALIZATION_GUIDE.md) covering template architecture, `TemplateMetadata` interface, bilingual (`en` & `id`) block functions, and step-by-step instructions for adding custom academic manuscript templates.
- **Interactive Help & Documentation Modal (`HelpModal`)**: Implemented a React portal modal component for interactive documentation directly accessible from the navigation sidebar.
  - **4 Module Tabs**: Custom Template Localization, AI Academic Co-Pilot & Prompts, Reference Library & PDF/RIS Imports, and Multi-Backend Architecture & Document Exports.
  - **Bilingual i18n Support**: Seamless switching between English and Indonesian in real-time.
- **Sidebar Navigation Integration**: Connected `MinimalSidebar` Help item (both expanded and collapsed states) to trigger the `HelpModal` portal in `EditorLayout`.

---

## 🚀 [v0.5.1] - 2026-08-10

### 🤖 LLM Gateway & Custom AI Provider Enhancements
- **Custom OpenAI-Compatible API Support**: Added full support for third-party API key sellers, custom proxy endpoints, private LLM instances (OneAPI, NewAPI, Groq, Together, LM Studio, Ollama), and custom API endpoints (`POST ${baseUrl}/chat/completions`).
- **Dynamic Provider Routing**: Upgraded backend API `/api/v1/ai/improve` to dynamically route requests based on `provider_type` (`gemini`, `openrouter`, `custom_openai`), custom `base_url`, and custom `custom_api_key` overrides.
- **Admin AI Models UI Redesign (`/admin/models`)**:
  - Split single table view into 2 clean grouped sections:
    1. 🎁 **Free Tier AI Models (Gratis)** (active vs off indicators, status toggle switches, Gateway Key, Display Name, API Model ID, Access Tier, and action controls).
    2. ⭐ **Pro Writer / Premium AI Models (Berbayar)** (restricted model tier management).
  - **Stats Overview Bar**: Added real-time counters for Total AI Models, Active Free Tier models, and Active Pro Writer models.
  - **1-Click Quick Toggle**: Enabled single-click toggling of model active/inactive status (`is_enabled`) directly from table rows.
  - **Enterprise Aesthetic**: Replaced rounded corner styling from `rounded-3xl`/`rounded-2xl` to crisp, professional enterprise borders (`rounded-xl` and `rounded-lg`).
- **Admin Modal Upgrade**: Added **Provider API Type** selector (`Google Gemini Direct`, `OpenRouter API`, `Custom OpenAI-Compatible API`), **Custom API Base URL** input field, and **Custom API Key** input field to the AI model creation and editing modal.

---

## ⚡ [v0.5.0-architecture] - 2026-08-10

### 🛡️ Architecture Sprint Milestone (EPICs 1 - 5)
- **EPIC 1: Database & Backend Abstraction (Repository Pattern)**:
  - Unified `IDataService` contract interface at `@/lib/services/types.ts`.
  - Implemented `SupabaseDataService` adapter and `ExpressDataService` HTTP REST client adapter with JWT Auth header handling.
  - Built Service Factory & `DataProvider` React Context Provider governed by `NEXT_PUBLIC_BACKEND_TYPE` (`supabase` vs `express`).
- **EPIC 2: Multi-Hosting Adapters**:
  - Vercel Edge Runtime compatibility (`export const runtime = 'edge'`).
  - Cloudflare Pages / Workers OpenNext compatibility layer and Security Headers (`X-Frame-Options`, `X-Content-Type-Options`).
  - Production Express.js VPS Docker containerization (`Dockerfile`, `docker-compose.yml`, and Nginx Reverse Proxy config).
- **EPIC 3: Hybrid Sync Engine**:
  - Created `HybridSyncEngine` combining Supabase WebSocket Realtime with Express.js Smart HTTP Polling.
  - Automatic 3x failover guarantee with background reconnection recovery.
  - Integrated `Page Visibility Guard` (`document.visibilityState`) to pause heartbeats and polling on inactive browser tabs.
- **EPIC 4: AI Engine & Performance Optimization**:
  - Upgraded `/api/v1/ai/improve` and `/api/v1/ai/abstract` to support Gemini 2.0 Streaming (SSE ReadableStream).
  - Token Bucket Edge Rate Limiter enforcing a 15 Request Per Minute (15 RPM) guard per client IP.
  - Client-side in-memory RIS/BibTeX parsers and Next.js `dynamic()` bundle splitting for KaTeX and PDF.js.
- **EPIC 5: Testing & Production Readiness**:
  - Multi-DB Prisma ORM Schema (`prisma/schema.prisma`) for PostgreSQL and MySQL.
  - Security RLS Audit and resilience testing.

---

## 📝 [v0.4.0] - 2026-08-09

### 🌐 Internationalization (i18n) & UI Polish
- **Bilingual Context Provider**: Added `LanguageProvider` and `useLanguage` hook supporting English and Indonesian.
- **UI Localization**: Localized layout components, sidebars, confirmation modals, setup wizard, Stripe/Midtrans checkout, and LaTeX Math Helper.
- **AI Target Language Prompting**: AI backend automatically detects and responds in the target document language.
- **Document Export Enhancements**: MS Word MHTML (`.doc`) export with embedded base64/blob images, client-side PDF export, highlight mapping, and Free plan bibliography export restriction modal.
- **UI/UX Redesign**: Grouped menu-list sidebar, My Documents file explorer tree (15-item limit), centralized document creation, and custom React modals for inline equations and hyperlinks.
