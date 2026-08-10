# ScholarFlow CHANGELOG 📜

All notable changes, architectural milestones, and UI improvements to the ScholarFlow AI Academic Co-Pilot project will be documented in this file.

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
