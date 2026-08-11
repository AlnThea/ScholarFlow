# ScholarFlow CHANGELOG 📜

All notable changes, architectural milestones, and UI improvements to the ScholarFlow AI Academic Co-Pilot project will be documented in this file.

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
