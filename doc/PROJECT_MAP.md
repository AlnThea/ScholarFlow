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
- **`lib/supabase.ts`** - Initialized Supabase client connection [lib/supabase.ts](file:///c:/web/ScholarFlow/lib/supabase.ts).

---

### 4. Supabase Database (`supabase/`)
Database migration and layout details.
- **`supabase/migrations/`**
  - [supabase/migrations/20260707000001_initial_schema.sql](file:///c:/web/ScholarFlow/supabase/migrations/20260707000001_initial_schema.sql) - Initial tables (`profiles`, `citation_cache`, `citation_library`), indexes, triggers, and Row Level Security (RLS) policies.
  - [supabase/migrations/20260707000002_fix_profiles_rls.sql](file:///c:/web/ScholarFlow/supabase/migrations/20260707000002_fix_profiles_rls.sql) - Migration patch removing recursive circular rules.
  - [supabase/migrations/20260715000002_add_settings_to_documents.sql](file:///c:/web/ScholarFlow/supabase/migrations/20260715000002_add_settings_to_documents.sql) - Adds settings columns to documents table.
  - [supabase/migrations/20260716000001_create_pricing_plans_table.sql](file:///c:/web/ScholarFlow/supabase/migrations/20260716000001_create_pricing_plans_table.sql) - Creates dynamic pricing plans catalog with seeding.
  - [supabase/migrations/20260716000002_add_subscriptions_to_profiles.sql](file:///c:/web/ScholarFlow/supabase/migrations/20260716000002_add_subscriptions_to_profiles.sql) - Extends profiles table with subscription parameters.
  - [supabase/migrations/20260716000003_create_payment_gateways_table.sql](file:///c:/web/ScholarFlow/supabase/migrations/20260716000003_create_payment_gateways_table.sql) - Dynamic gateway settings toggle.
