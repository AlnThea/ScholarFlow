# ScholarFlow Project Map

This document serves as a guide for AI agents and developers to understand the project layout, file locations, and structural organization of ScholarFlow.

---

## 🛠️ Technology Stack
- **Frontend**: Next.js App Router (React 19), TypeScript, TailwindCSS.
- **Editor**: [Editor.js](file:///c:/web/ScholarFlow/components/editor/editorjs-editor.tsx) with custom plugins/extensions (LaTeX math blocks, inline citations, table, code).
- **Database / Auth**: Supabase (PostgreSQL).
- **Citation Engine**: `@citation-js/core` (APA Style formatting).
- **AI Backend**: Gemini API (`gemini-1.5-flash` / `gemini-pro`).

---

## 📂 Directory Structure & File Index

### 1. Application Routing & Pages (`app/`)
The routing is handled by Next.js App Router.

- **`app/(auth)/`** - Authentication layouts and views.
  - [app/(auth)/layout.tsx](file:///c:/web/ScholarFlow/app/(auth)/layout.tsx) - Auth wrapper layout.
  - `app/(auth)/login/` - Login page component.
  - `app/(auth)/register/` - Registration page component.
- **`app/api/`** - Next.js serverless API routes:
  - [app/api/improve-writing/route.ts](file:///c:/web/ScholarFlow/app/api/improve-writing/route.ts) - Standard rewrite/improve writing endpoint calling Gemini.
  - [app/api/citations/search/route.ts](file:///c:/web/ScholarFlow/app/api/citations/search/route.ts) - Citation search endpoint, handles cache lookup in Supabase and fetches from OpenAlex/Crossref.
  - [app/api/citations/resolve-pdf/route.ts](file:///c:/web/ScholarFlow/app/api/citations/resolve-pdf/route.ts) - HTML parser to extract Google Scholar pdf_url metadata from OJS landing pages.
  - [app/api/citations/view-pdf/route.ts](file:///c:/web/ScholarFlow/app/api/citations/view-pdf/route.ts) - Proxy streaming endpoint to bypass attachment headers and serve PDF with CORS.
  - [app/api/citations/translate/route.ts](file:///c:/web/ScholarFlow/app/api/citations/translate/route.ts) - Proxy translation API communicating with Google Translate.
  - [app/api/v1/ai/improve/route.ts](file:///c:/web/ScholarFlow/app/api/v1/ai/improve/route.ts) - Versioned endpoint for rewriting text with customized academic prompts and fallback modes.
  - [app/api/v1/ai/abstract/route.ts](file:///c:/web/ScholarFlow/app/api/v1/ai/abstract/route.ts) - Endpoint for generating structured academic abstracts based on document context.
  - [app/api/library/upload/route.ts](file:///c:/web/ScholarFlow/app/api/library/upload/route.ts) - Serverless-friendly Next.js API route that reads PDF files in memory, extracts metadata using `pdf-parse`, and inserts to Supabase.
- **`app/page.tsx`** - Main dashboard route [app/page.tsx](file:///c:/web/ScholarFlow/app/page.tsx). Renders the editor if authenticated; redirects to `/login` if not.
- **`app/globals.css`** - Global styles and custom CSS rules [app/globals.css](file:///c:/web/ScholarFlow/app/globals.css).

---

### 2. UI Components (`components/`)
Reusable and page-level React components.

- **`components/auth/`**
  - [components/auth/auth-provider.tsx](file:///c:/web/ScholarFlow/components/auth/auth-provider.tsx) - Context provider managing Supabase session, user state, profiles, and active subscription plan details.
- **`components/editor/`**
  - [components/editor/scholar-editor.tsx](file:///c:/web/ScholarFlow/components/editor/scholar-editor.tsx) - Core logic controller. Manages state for selected text, citations, history, library, and bindings.
  - [components/editor/editorjs-editor.tsx](file:///c:/web/ScholarFlow/components/editor/editorjs-editor.tsx) - Component interfacing with Editor.js. Includes custom plugins, LaTeX blocks, block styling alignment, stats calculators, and bibliography list syncing.
  - [components/editor/editor-layout.tsx](file:///c:/web/ScholarFlow/components/editor/editor-layout.tsx) - Workspace shell structure. Renders header toolbars, selection bubble menus (for formatting/citation search), active dashboard rails, and admin pricing managers.
  - [components/editor/editor-sidebar.tsx](file:///c:/web/ScholarFlow/components/editor/editor-sidebar.tsx) - Sidebar containing Library, Writing (AI actions), and Document (stats/actions).
  - [components/editor/minimal-sidebar.tsx](file:///c:/web/ScholarFlow/components/editor/minimal-sidebar.tsx) - Collapsible left rail/sidebar navigation. Supports client-side RIS importing.
  - [components/editor/document-setup-modal.tsx](file:///c:/web/ScholarFlow/components/editor/document-setup-modal.tsx) - Configuration wizard triggered when creating a new manuscript.
  - [components/editor/citation-style-modal.tsx](file:///c:/web/ScholarFlow/components/editor/citation-style-modal.tsx) - Two-column modal selector for citation styles and localization languages.
  - [components/editor/pricing-modal.tsx](file:///c:/web/ScholarFlow/components/editor/pricing-modal.tsx) - Dynamically loaded Pricing plans subscription catalog.
  - [components/editor/gateway-selector-modal.tsx](file:///c:/web/ScholarFlow/components/editor/gateway-selector-modal.tsx) - Route selector allowing users to choose Stripe or Midtrans gateways.
  - [components/editor/stripe-checkout-modal.tsx](file:///c:/web/ScholarFlow/components/editor/stripe-checkout-modal.tsx) - Simulated checkout flow styling matching Stripe Checkout interface.
  - [components/editor/midtrans-checkout-modal.tsx](file:///c:/web/ScholarFlow/components/editor/midtrans-checkout-modal.tsx) - Simulated Snap checkout popup for GoPay, QRIS, and Virtual Accounts.

- **`components/i18n/`**
  - [components/i18n/language-context.tsx](file:///c:/web/ScholarFlow/components/i18n/language-context.tsx) - React Context provider (`LanguageProvider`) and hook (`useLanguage`) managing the active language and dictionary lookups.

---

### 3. Business Logic & Utilities (`lib/`)
Shared services, schema interfaces, and editor logic.

- **`lib/api/`** - Frontend-to-backend API fetchers:
  - [lib/api/ai.ts](file:///c:/web/ScholarFlow/lib/api/ai.ts) - Contacts `/api/improve-writing`.
  - [lib/api/citations.ts](file:///c:/web/ScholarFlow/lib/api/citations.ts) - Contacts `/api/citations/search`.
  - [lib/api/citation-library.ts](file:///c:/web/ScholarFlow/lib/api/citation-library.ts) - Direct fetches/inserts to Supabase database `citation_library`.
  - [lib/api/pricing.ts](file:///c:/web/ScholarFlow/lib/api/pricing.ts) - Queries and updates dynamic pricing plans in Supabase.
  - [lib/api/payment-gateways.ts](file:///c:/web/ScholarFlow/lib/api/payment-gateways.ts) - Manages payment gateway state parameters.
- **`lib/editor/`** - Content formatting and data adapters:
  - [lib/editor/bibliography.ts](file:///c:/web/ScholarFlow/lib/editor/bibliography.ts) - APA citation formatter utilizing `citation.js` and serialization helpers.
  - [lib/editor/citation-export.ts](file:///c:/web/ScholarFlow/lib/editor/citation-export.ts) - Serializes citation lists to TXT or JSON formats.
  - [lib/editor/citation-history.ts](file:///c:/web/ScholarFlow/lib/editor/citation-history.ts) - Stores and rotates local citation search histories.
  - [lib/editor/sample-content.ts](file:///c:/web/ScholarFlow/lib/editor/sample-content.ts) - Template content for new/empty editor canvases.
- **`lib/services/`** - Data Provider Abstraction (Repository Pattern):
  - [lib/services/types.ts](file:///c:/web/ScholarFlow/lib/services/types.ts) - Unified `IDataService` contract interface.
  - [lib/services/supabase-service.ts](file:///c:/web/ScholarFlow/lib/services/supabase-service.ts) - Supabase PaaS database adapter.
  - [lib/services/express-service.ts](file:///c:/web/ScholarFlow/lib/services/express-service.ts) - Express.js REST API VPS adapter.
  - [lib/services/index.ts](file:///c:/web/ScholarFlow/lib/services/index.ts) - `getDataService()` factory, `<DataProvider>`, and `useDataService()` hook.
- **`lib/sync/`** - Hybrid Realtime & Polling Sync Engine:
  - [lib/sync/hybrid-sync-engine.ts](file:///c:/web/ScholarFlow/lib/sync/hybrid-sync-engine.ts) - Core sync engine (WebSocket + Smart Polling + 3x Failover + Page Visibility Guard).
  - [lib/sync/index.ts](file:///c:/web/ScholarFlow/lib/sync/index.ts) - `<SyncProvider>` React Context and `useHybridSync()` hook.
- **`lib/config/`** - App Configuration & Environment Mode:
  - [lib/config/env.ts](file:///c:/web/ScholarFlow/lib/config/env.ts) - Environment Mode helper (`NEXT_PUBLIC_APP_ENV` - Laravel `APP_ENV` equivalent).
- **`lib/ai/`** - AI Rate Limiter & Edge Parsers:
  - [lib/ai/rate-limiter.ts](file:///c:/web/ScholarFlow/lib/ai/rate-limiter.ts) - 15 RPM Edge Rate Limiter (Token Bucket / Sliding Window).
  - [lib/ai/edge-parser.ts](file:///c:/web/ScholarFlow/lib/ai/edge-parser.ts) - In-memory TypedArray RIS & BibTeX parser.
- **`docker/`** - Multi-Hosting Docker & Nginx Configs:
  - [docker/Dockerfile](file:///c:/web/ScholarFlow/docker/Dockerfile) - Multi-stage Node.js Alpine build for Express API.
  - [docker/docker-compose.yml](file:///c:/web/ScholarFlow/docker/docker-compose.yml) - 1-Click orchestration (Express REST + PostgreSQL).
  - [docker/nginx.conf](file:///c:/web/ScholarFlow/docker/nginx.conf) - Production Nginx Reverse Proxy with SSL & WSS WebSocket headers.
- **`prisma/`** - Multi-Database ORM Schema:
  - [prisma/schema.prisma](file:///c:/web/ScholarFlow/prisma/schema.prisma) - Universal Prisma schema for PostgreSQL and MySQL.

---

### 5. Documentation & Roadmap (`doc/`)
- [doc/PRODUCTION_TASKS.md](file:///c:/web/ScholarFlow/doc/PRODUCTION_TASKS.md) - Master task roadmap & production readiness checklist.
- [doc/DATABASE_MIGRATION_GUIDE.md](file:///c:/web/ScholarFlow/doc/DATABASE_MIGRATION_GUIDE.md) - Step-by-step database migration guide (Supabase -> VPS).
- [doc/SECURITY_RLS_AUDIT.md](file:///c:/web/ScholarFlow/doc/SECURITY_RLS_AUDIT.md) - Security & Row Level Security (RLS) audit report.
- [doc/API_REFERENCE.md](file:///c:/web/ScholarFlow/doc/API_REFERENCE.md) - Endpoint API documentation.
- [doc/DATABASE_SCHEMA.md](file:///c:/web/ScholarFlow/doc/DATABASE_SCHEMA.md) - Database schema & RLS policies.
- [doc/EDITOR_FLOW.md](file:///c:/web/ScholarFlow/doc/EDITOR_FLOW.md) - Editor & citation workflow breakdown.
- [doc/PROJECT_MAP.md](file:///c:/web/ScholarFlow/doc/PROJECT_MAP.md) - Full project map index.


