# Multi-Tenant Campus Dedicated AI Key Resolver

## 📌 Ringkasan Arsitektur
Dokumentasi ini menjelaskan sistem isolasi rate-limit API Key kampus (*Bring-Your-Own-Key* / BYOK Institusi). Sistem ini membedakan beban kerja teks akademis (`campus_text_key`) dengan beban kerja analitik vision SPSS (`campus_vision_key`), dilengkapi dengan in-memory resolver cache (5 menit) dan failover pool otomatis.

---

## 🔄 Sequence Diagram: Resolusi Kunci API Kampus & Failover

Diagram berikut menunjukkan bagaimana sistem mengidentifikasi institusi pengguna dan mengarahkan panggilan AI ke kunci dedicated kampus yang tepat:

```mermaid
sequenceDiagram
    autonumber
    actor Student as Mahasiswa / Dosen Kampus
    participant Client as Editor ScholarFlow
    participant Route as Next.js API (/api/v1/ai/improve atau /interpret-stats)
    participant Resolver as Tenant Key Resolver (lib/ai/tenant-key-resolver.ts)
    participant DB as Database Supabase (institutions & institution_members)
    participant KeyPool as Multi-Key Failover Pool (lib/ai/gemini-key-pool.ts)
    participant Gemini as Google Gemini API

    Student->>Client: Menjalankan fitur AI (Teks / Vision SPSS)
    Client->>Route: POST API (userId, category: 'text' | 'vision')
    Route->>Resolver: resolveTenantKey(userId, category)
    
    alt Ada di In-Memory Resolver Cache (< 5 menit)
        Resolver-->>Route: Kembalikan cached tenant key instan (0 ms)
    else Belum Dicache
        Resolver->>DB: Query institution_members & institutions WHERE user_id = userId
        DB-->>Resolver: Data institusi (misal: "Universitas Indonesia", campus_text_key, campus_vision_key)
        Note over Resolver: Simpan hasil di memory cache selama 5 menit
        Resolver-->>Route: Kunci Dedicated Kampus + metadata institusi
    end

    Route->>KeyPool: executeWithFailover(campusKey, category)
    KeyPool->>Gemini: Eksekusi Request ke Gemini
    alt Kunci Kampus Berhasil
        Gemini-->>KeyPool: 200 OK (Hasil AI)
    else Kunci Kampus Kena Rate-Limit / Kuota Habis
        Note over KeyPool: ⚠️ Otomatis Failover ke Kunci Cadangan Pool ScholarFlow!
        KeyPool->>Gemini: Eksekusi Ulang dengan Failover Key
        Gemini-->>KeyPool: 200 OK (Hasil AI)
    end
    KeyPool-->>Route: Kembalikan hasil ke Route
    Route-->>Client: 200 OK (Teks Hasil + X-Tenant-Source: 'campus_byok')
    Client->>Student: Naskah tampil dengan proteksi rate-limit independen!
```

---

## 🏛️ Manfaat Isolasi Kunci Kampus:
1. **Tidak Ada Antrean / Tabrakan Kuota**: Kuota AI mahasiswa kampus tidak akan pernah terganggu oleh lonjakan pengguna umum di internet.
2. **Dedicated Vision Key**: Pemrosesan gambar tabel SPSS berukuran besar diarahkan ke kunci terpisah (`campus_vision_key`) sehingga tidak menghabiskan kuota pemrosesan teks naskah harian (`campus_text_key`).
3. **Failover Safety Net**: Jika kunci kampus bermasalah atau kehabisan kredit di Google Cloud, sistem secara cerdas beralih ke pool cadangan ScholarFlow agar aktivitas penulisan skripsi mahasiswa tidak terhenti mendadak.
