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

### 3. UI/UX & Navigation Redesign
- [x] **3.1 Settings & Navigation Menu Redesign** - Redesain sidebar pengaturan admin, menu utama, dan bantuan menjadi tampilan menu-list terkelompok dengan sub-judul deskriptif.
- [x] **3.2 My Documents File Explorer Tree** - Redesain panel My Documents menjadi struktur file explorer tree premium dan pembatasan 15 item independen untuk mencegah kekacauan visual.
- [x] **3.3 Centralized Document Creation** - Pemindahan dan pemusatan aksi 'Create New Document' ke dalam panel My Documents.

### 4. Custom React Portals & Interactive Modals
- [x] **4.1 Inline Math Equation Modal** - Penggantian prompt bawaan browser saat mengedit rumus inline dengan React Math Modal custom.
- [x] **4.2 Hyperlink Portal Modal** - Modal custom untuk menyisipkan, mengedit URL, dan menghapus tautan (*unlink*) beserta deteksi status aktif tombol toolbar.
- [x] **4.3 Color Picker Popover** - Popover pemilih warna highlight berbentuk blok persegi dengan dukungan unhighlighting.

### 5. Collaboration & History Management
- [x] **5.1 Public Document Sharing (`/shared/[id]`)** - Moda Read-Only dan Co-Editor untuk kolaborasi dokumen publik.
- [x] **5.2 Suggestions History Sub-tabs** - Sub-tab riwayat usulan diterima & ditolak (Accepted & Rejected Suggestions) dengan dukungan i18n.
- [x] **5.3 Header Badge & User Auth Chip** - Indikator status login pengguna (Logged In vs Guest) serta badge notifikasi aktif untuk komentar dan usulan.
- [x] **5.4 Page Visibility API Integration** - Penggunaan `document.visibilityState` untuk menghentikan sementara polling latar belakang saat tab browser tidak aktif.

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
- [ ] **4.1 Gemini 2.0 Flash Streaming Integration**
  - [ ] Upgrade API route `/api/v1/ai/improve` dan `/api/v1/ai/abstract` untuk mendukung **Server-Sent Events (SSE) / Streaming** Gemini 2.0 Flash API.
- [ ] **4.2 Edge Rate Limiting & Queueing**
  - [ ] Implementasikan Rate Limiter 15 Request Per Minute (RPM) berbasis Token Bucket / Sliding Window (kompatibel Vercel KV / In-Memory).
- [ ] **4.3 Lazy Loading & Bundle Splitting**
  - [ ] Dynamic import untuk Tiptap Extension, KaTeX Math Block, dan PDF.js viewer untuk mempercepat First Contentful Paint (FCP).
- [ ] **4.4 Edge-Safe API Routes Guard**
  - [ ] Refactor endpoint PDF parsing / RIS parsing agar menggunakan parser berbasis In-Memory TypedArray yang aman di lingkungan Serverless & Edge.

---

### 🛡️ EPIC 5: Testing & Production Readiness
- [ ] **5.1 Multi-DB Schema & Migration Guide**
  - [ ] Buat `prisma/schema.prisma` atau SQL Schema DDL yang identik untuk PostgreSQL dan MySQL.
- [ ] **5.2 Security & RLS Audit**
  - [ ] Audit RLS Supabase & middleware autentikasi Express.js untuk memastikan akses dokumen tersertifikasi secara ketat (`user_id` validation).
- [ ] **5.3 Resilience & Failure Recovery Testing**
  - [ ] Uji skenario offline/online, failover sync, error handling API fallback, dan validasi data Pydantic/Zod.
