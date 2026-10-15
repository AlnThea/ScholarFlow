# Personal AI Token Quota & Service-Role Quota Tracking

## 📌 Ringkasan Arsitektur
Dokumentasi ini menjelaskan mekanisme pelacakan kuota token AI pengguna (*Personal Fair Usage Policy*), siklus reset 30 hari, dan pembaruan database berhak penuh (*service-role bypass*) untuk mencegah kegagalan pemotongan kuota akibat Row Level Security (RLS).

---

## 🔄 Sequence Diagram: Alur Pelacakan Kuota & Sinkronisasi Reaktif

Diagram berikut menunjukkan bagaimana backend memotong kuota pengguna secara persisten di Supabase dan menyinkronkan saldo token ke antarmuka editor secara real-time:

```mermaid
sequenceDiagram
    autonumber
    actor User as Pengguna (Browser)
    participant Client as Frontend (Editor UI & Hook)
    participant Route as Next.js API Route (/api/v1/ai/improve)
    participant QuotaEngine as Token Quota Engine (lib/ai/token-quota.ts)
    participant AdminClient as Supabase Service Client (lib/supabase-admin.ts)
    participant DB as Database Supabase (Table: profiles)

    User->>Client: Memilih teks & menekan tombol AI
    Client->>Route: POST /api/v1/ai/improve (userId, userPlan)
    Route->>QuotaEngine: checkPersonalQuota(userId, userPlan)
    QuotaEngine->>AdminClient: SELECT ai_tokens_used, ai_monthly_quota FROM profiles
    AdminClient->>DB: Query langsung dengan Service Key (Bypass RLS)
    DB-->>AdminClient: Record profil (used: 4,200 / limit: 50,000)
    QuotaEngine-->>Route: Quota valid (Allowed: true, remaining: 45,800)

    Route->>Route: Proses AI dengan LLM (Gemini)
    Route->>QuotaEngine: recordPersonalTokenConsumption(userId, tokensConsumed: 350)
    QuotaEngine->>AdminClient: UPDATE profiles SET ai_tokens_used = ai_tokens_used + 350
    AdminClient->>DB: Eksekusi UPDATE berhasil
    DB-->>AdminClient: OK
    QuotaEngine-->>Route: Usage Record (used: 4,550, limit: 50,000, remaining: 45,450)

    Route-->>Client: 200 OK (Payload + monthly_quota: 50000, tokens_used: 4550)
    Client->>Client: updateQuotaState(4550, 50000)
    Note over Client: Simpan cache lokal: saveLocalQuotaState()
    Client->>Client: refreshProfile() via useAuth()
    Client->>User: Meteran Token Quota Bar diperbarui secara instan!
```

---

## 🎚️ Alokasi Kuota Paket & Kebijakan Reset:
1. **Paket Free**: 50.000 token per 30 hari.
2. **Paket Pro**: 1.000.000 token per 30 hari.
3. **Paket Kampus (Institutional)**: Kuota terkustomisasi per anggota (dapat disetel oleh Campus Admin).
4. **Siklus Reset**: Otomatis reset setiap 30 hari dari tanggal pendaftaran (`ai_quota_reset_at`).
