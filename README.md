# ScholarFlow 🎓✨

**ScholarFlow** is an AI-Powered Academic Research & Co-Pilot Workspace focused on writing, citation workflow, real-time collaboration, and automated bibliography management.

---

## 🌟 Key Architecture & Features

- **🎓 TipTap & Editor.js Academic Canvas**: Rich academic text editor supporting inline citations, LaTeX math formulas, table blocks, track-changes, and automated APA bibliography generation.
- **🔌 Multi-Backend & Repository Pattern (`EPIC 1`)**: Abstracted Data Provider supporting **Supabase PaaS** or **Express.js REST API (VPS)** with a single environment flag (`NEXT_PUBLIC_BACKEND_TYPE`).
- **🛡️ Production Environment Mode Guard**: Laravel-style `NEXT_PUBLIC_APP_ENV` (`development` | `staging` | `production`) with safety lock guard protecting production backend settings.
- **🌐 Universal Multi-Hosting Flexibility (`EPIC 2`)**:
  - **Vercel Edge Runtime**: API Routes optimized with `export const runtime = 'edge'`.
  - **Cloudflare Pages / OpenNext**: Compatible export flags and Enterprise Security Headers (`X-Frame-Options`, `X-Content-Type-Options`).
  - **Docker VPS Containerization**: Multi-stage `Dockerfile`, 1-click `docker-compose.yml` (Express REST + PostgreSQL), and Nginx WSS Reverse Proxy config.
- **⚡ Hybrid Realtime & Polling Sync Engine (`EPIC 3`)**:
  - **Supabase WebSocket Realtime**: Live document sync via `postgres_changes`.
  - **Adaptive Smart HTTP Polling**: 3s active typing vs 15s idle interval.
  - **3x Auto-Failover Guarantee**: Disconnections automatically failover to polling with background reconnect recovery.
  - **Page Visibility Guard**: Pauses polling/heartbeats on inactive tabs (`document.hidden`), reducing RAM and database bandwidth by up to 80%.
- **🧠 Gemini 2.0 Flash SSE Streaming & Rate Limiting (`EPIC 4`)**:
  - Real-time word-by-word streaming (`ReadableStream` text/event-stream) under 1 second.
  - Edge Rate Limiter enforcing a strict **15 Request Per Minute (15 RPM)** limit per client/IP.
  - In-memory `TypedArray` RIS & BibTeX parsers + Next.js `dynamic()` bundle splitting.
- **🛡️ Production Readiness & Multi-DB (`EPIC 5`)**: Universal Prisma ORM schema (`prisma/schema.prisma`), step-by-step Database Migration Guide, and Security RLS Audit.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js App Router (React 19), TypeScript, Vanilla CSS / Tailwind.
- **Editor**: Editor.js & TipTap Extensions (LaTeX math, inline citations, table blocks).
- **Backend & Database**: Supabase (PostgreSQL) PaaS OR Express.js REST API (PostgreSQL / MySQL) VPS.
- **AI Engine**: Google Gemini API (`gemini-2.0-flash` SSE Streaming) with OpenRouter fallback.
- **Citation Engine**: `@citation-js/core` (APA Style, BibTeX, RIS parser).

---

## 🚀 Quick Start

### 1. Installation
```bash
git clone https://github.com/AlnThea/ScholarFlow.git
cd ScholarFlow
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your environment variables:
```env
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_BACKEND_TYPE=supabase

NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

GEMINI_API_KEY=AIzaSy...
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📚 Documentation & Reference Guides

- 📋 [Master Production Tasks Roadmap](file:///c:/web/ScholarFlow/doc/PRODUCTION_TASKS.md)
- 🐘 [Database Migration Guide (Supabase -> VPS)](file:///c:/web/ScholarFlow/doc/DATABASE_MIGRATION_GUIDE.md)
- 🛡️ [Security & RLS Audit Report](file:///c:/web/ScholarFlow/doc/SECURITY_RLS_AUDIT.md)
- 📊 [Database Schema & Table Reference](file:///c:/web/ScholarFlow/doc/DATABASE_SCHEMA.md)
- 🗺️ [Full Project Map](file:///c:/web/ScholarFlow/doc/PROJECT_MAP.md)

---

## 📄 License

MIT License © 2026 ScholarFlow Team
