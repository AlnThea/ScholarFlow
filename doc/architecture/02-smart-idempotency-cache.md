# Smart Idempotency Cache & Zero-Waste Token Deduplication

## 📌 Ringkasan Arsitektur
Dokumentasi ini menjelaskan mekanisme deduplikasi transaksi AI berbasis **Smart Idempotency Cache** dengan masa kedaluwarsa 5 menit (TTL). Fitur ini mencegah pemborosan token pengguna dan mencegah panggilan duplikat ke LLM (Google Gemini) jika terjadi klik ganda, refresh berulang, atau pengiriman teks yang sama dalam jeda waktu singkat.

---

## 🔄 Sequence Diagram: Alur Deduplikasi Idempotency & 0-Token Protection

Diagram berikut memetakan bagaimana sistem mengenali request identik dan mengembalikan hasil dalam 0.01 detik tanpa memotong kuota token:

```mermaid
sequenceDiagram
    autonumber
    actor User as Pengguna (Browser)
    participant Client as Frontend (ScholarFlow Editor)
    participant Route as Next.js API (/api/v1/ai/improve)
    participant Cache as In-Memory Idempotency Cache (lib/ai/idempotency-cache.ts)
    participant Quota as Token Quota Guard (lib/ai/token-quota.ts)
    participant Gemini as Google Gemini Cloud API

    Note over User,Client: REQUEST PERTAMA (Jam 12:00:00)
    Client->>Route: POST /api/v1/ai/improve (Text: "Penelitian ini...", Tone: "academic")
    Route->>Cache: generateIdempotencyKey(userId, text, tone)
    Note over Cache: Deterministic 64-bit FNV-1a Hashing
    Route->>Cache: getIdempotentAiResponse(key)
    Cache-->>Route: null (Belum ada di cache)
    Route->>Quota: checkPersonalQuota(userId, userPlan)
    Quota-->>Route: allowed: true
    Route->>Gemini: Kirim prompt ke Gemini 2.0 Flash
    Gemini-->>Route: Kembalikan hasil teks perbaikan
    Route->>Quota: recordPersonalTokenConsumption(userId, 185 tokens)
    Route->>Cache: setIdempotentAiResponse(key, payload, TTL: 5 menit)
    Route-->>Client: 200 OK (Hasil Teks, 185 Token Terpotong)
    Client->>User: Tampilkan teks di Editor

    Note over User,Client: REQUEST KEDUA (Jam 12:01:30 - Teks & Tone Identik Dikirim Ulang)
    Client->>Route: POST /api/v1/ai/improve (Text: "Penelitian ini...", Tone: "academic")
    Route->>Cache: generateIdempotencyKey(userId, text, tone)
    Route->>Cache: getIdempotentAiResponse(key)
    Cache-->>Route: HIT! (Payload Ditemukan, sisa umur < 5 menit)
    Note over Route: ⚡ BYPASS PEMANGGILAN GEMINI & BYPASS PEMOTONGAN TOKEN!
    Route-->>Client: 200 OK (Hasil Instan, tokens_consumed: 0, is_idempotent_hit: true)
    Client->>User: Tampilkan Hasil Instan + Badge "⚡ 0 Token (Cache Instan)"
```

---

## ⚙️ Spesifikasi Teknis Engine Hashing
1. **Algoritma**: Double-Pass Deterministic 64-bit FNV-1a Hash.
   - Bekerja sangat cepat di Edge Runtime (Vercel Edge & Node.js) tanpa ketergantungan library eksternal.
   - Bebas tabrakan (*collision-resistant*) untuk teks akademis panjang.
2. **Kunci Cache Komposit**:
   - `userId` (Isolasi antar-pengguna)
   - `text` (Normalisasi spasi)
   - `tone` / `mode`
   - `model`
3. **Masa Aktif (TTL)**: 300.000 ms (5 menit) dengan pembersihan otomatis (*auto-pruning*).

---

## 🎯 Manfaat Bagi Pengguna:
- **Zero-Waste Token**: Token kuota bulanan tidak terbuang sia-sia akibat kesalahan jaringan atau tidak sengaja menekan tombol berulang.
- **Ultra-Fast Speed**: Respon kembali dalam 0.01 detik (10 milidetik).
- **Status Transparan**: Pengguna melihat badge hijau elegan bertuliskan `⚡ 0 Token (Cache Instan)`.
