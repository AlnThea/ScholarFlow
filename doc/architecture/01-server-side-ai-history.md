# Server-Side AI History & Resilient Background Execution (ChatGPT-Style)

## 📌 Ringkasan Arsitektur
Dokumentasi ini menjelaskan arsitektur ketahanan transaksi AI di ScholarFlow, di mana pemrosesan AI tetap diselesaikan oleh server di awan (*cloud*) dan dicatat ke database Supabase meskipun pengguna menutup browser, me-refresh tab, atau mematikan laptop di tengah-tengah proses.

---

## 🔄 Sequence Diagram: Siklus Hidup Transaksi AI (Kasus Tab Ditutup di Detik ke-2)

Diagram berikut memetakan alur ketika pengguna menekan tombol AI pada jam 12:00:00, menutup browser di jam 12:00:02 (sebelum AI selesai), dan membuka kembali aplikasi di jam 19:00:00:

```mermaid
sequenceDiagram
    autonumber
    actor User as Pengguna (Browser)
    participant Client as Frontend (ScholarFlow Editor)
    participant NextServer as Server Next.js API (/api/v1/ai/improve)
    participant Logger as Server AI Logger (lib/ai/server-ai-logger.ts)
    participant Gemini as Google Gemini Cloud API
    participant Supabase as Database Supabase (Table: ai_generations)

    Note over User,Client: 12:00:00 - Pengguna memilih teks & klik "Poles Kalimat"
    Client->>NextServer: POST /api/v1/ai/improve (text, tone, userId, userPlan)
    NextServer->>Logger: createPendingAiGeneration(userId, text, tone)
    Logger->>Supabase: INSERT INTO ai_generations (status: 'pending')
    Supabase-->>Logger: Record ID dibuat (UUID)
    NextServer->>Gemini: Kirim Prompt Akademik ke Gemini 2.0 Flash

    Note over User,Client: 12:00:02 - PENGGUNA TIDAK SENGAJA MENUTUP TAB / LAPTOP
    Note over Client: Koneksi HTTP Client terputus (Client Aborted)
    Note over NextServer,Gemini: Server Next.js & Gemini Cloud TETAP BERJALAN di Cloud!

    Gemini-->>NextServer: 12:00:03 - Gemini selesai memproses & kirim hasil
    NextServer->>Logger: completeAiGeneration(generationId, resultText, tokens)
    Logger->>Supabase: UPDATE ai_generations SET status = 'completed', result_text = ...
    Supabase-->>Logger: Data tersimpan persisten secara permanen

    Note over User,Client: 19:00:00 (7 Jam Kemudian) - Pengguna membuka kembali ScholarFlow
    Client->>NextServer: GET /api/v1/ai/history?userId=...
    NextServer->>Supabase: SELECT * FROM ai_generations WHERE user_id = ... ORDER BY created_at DESC
    Supabase-->>NextServer: Mengembalikan daftar riwayat (Termasuk hasil jam 12:00:03)
    NextServer-->>Client: 200 OK (Array Riwayat AI)
    Client->>User: Render di Modal Riwayat AI (Badge "Cloud Synced")
    User->>Client: Klik "Terapkan ke Canvas" atau "Salin"
    Client->>User: Teks berhasil masuk ke kanvas dokumen tanpa kehilangan data!
```

---

## 🗄️ Skema Database Supabase (`public.ai_generations`)

Tabel ini menyimpan seluruh draf hasil pemrosesan AI secara persisten lintas sesi dan lintas perangkat:

```sql
CREATE TABLE IF NOT EXISTS public.ai_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    feature_type TEXT NOT NULL DEFAULT 'improve', -- 'improve', 'paraphrase', 'summarize', 'abstract', 'synthesize', 'stats'
    original_text TEXT,
    result_text TEXT,
    tone TEXT DEFAULT 'academic',
    model TEXT DEFAULT 'gemini',
    tokens_consumed INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed', -- 'pending', 'completed', 'failed'
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_ai_generations_user_chronology 
    ON public.ai_generations(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_generations_status 
    ON public.ai_generations(status);
```

---

## 🛡️ Kebijakan Row Level Security (RLS)

Keamanan data diproteksi ketat menggunakan RLS PostgreSQL:
1. **SELECT**: `auth.uid() = user_id` (Pengguna hanya bisa melihat riwayat miliknya).
2. **INSERT**: `auth.uid() = user_id` (Pengguna hanya bisa menambahkan riwayat atas akunnya).
3. **DELETE**: `auth.uid() = user_id` (Pengguna hanya bisa menghapus riwayat miliknya).
4. **Service Role**: Backend Next.js menggunakan `supabaseAdmin` (`process.env.SUPABASE_SERVICE_KEY`) untuk memperbarui status pekerjaan di latar belakang.

---

## 🚀 Keunggulan Arsitektur Ini:
1. **Zero Data Loss**: Pengguna tidak perlu khawatir jika laptop kehabisan baterai atau koneksi terputus saat AI berpikir.
2. **Multi-Device Synchronization**: Draf polesan AI yang dibuat di laptop kampus dapat langsung dibuka dan disalin dari smartphone atau komputer rumah.
3. **Optimized Token Spending**: Token yang sudah dipotong dari akun pengguna selalu membuahkan hasil draf yang dapat diambil kapan saja.
