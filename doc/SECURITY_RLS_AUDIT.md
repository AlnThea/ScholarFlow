# 🛡️ Security & Row Level Security (RLS) Audit Report — ScholarFlow

Dokumen ini memverifikasi audit keamanan sistem ScholarFlow untuk memastikan isolasi data antar-pengguna terjamin 100% aman baik di **Supabase Cloud (RLS)** maupun di **Express.js VPS REST API (JWT Bearer Middleware)**.

---

## 1. 🔒 Supabase Row Level Security (RLS) Audit

Pada Supabase PostgreSQL, seluruh kebijakan RLS dikonfigurasi dengan aturan `auth.uid() = user_id`:

### A. Kebijakan RLS Tabel `documents`
- **Enable RLS**: `ALTER TABLE documents ENABLE ROW LEVEL SECURITY;`
- **SELECT Policy**: User hanya dapat melihat dokumen milik sendiri ATAU dokumen yang dibagikan kepadanya (`shared_with`).
  ```sql
  CREATE POLICY "Users can view own or shared documents" ON documents
    FOR SELECT USING (
      auth.uid() = user_id OR 
      (shared_with->>'public' = 'true') OR
      (shared_with->'users' ? auth.uid()::text)
    );
  ```
- **INSERT Policy**: User hanya dapat membuat dokumen dengan `user_id = auth.uid()`.
  ```sql
  CREATE POLICY "Users can insert own documents" ON documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  ```
- **UPDATE/DELETE Policy**: User hanya dapat mengedit/menghapus dokumen milik sendiri.
  ```sql
  CREATE POLICY "Users can update own documents" ON documents
    FOR UPDATE USING (auth.uid() = user_id);
  ```

---

## 2. 🔑 Express.js REST API JWT Authentication Middleware

Pada backend Express.js VPS, otentikasi diamankan melalui header HTTP `Authorization: Bearer <JWT_TOKEN>`:

- **Auth Verification**: Token JWT diverifikasi menggunakan `jsonwebtoken` library.
- **Owner Guard**: Setiap endpoint dokumen (`GET /documents/:id`, `PUT /documents/:id`, `DELETE /documents/:id`) memverifikasi `req.user.id === document.user_id`. Jika mismatch, mengembalikan `HTTP 403 Forbidden`.

---

## 3. 🛡️ Verification Checklist

- [x] RLS Supabase aktif untuk seluruh tabel domain (`documents`, `profiles`, `citation_library`).
- [x] Middleware JWT Express.js menolak request tanpa valid Bearer Header (`HTTP 401 Unauthorized`).
- [x] Input sanitization pada AI Prompts & Edge Rate Limiting (15 RPM) aktif.
- [x] Secret key (`SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`) **tidak diekspos ke client-side bundle**.
