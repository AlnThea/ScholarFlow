# ScholarFlow System Architecture & Sequence Diagrams 🏛️

Folder ini mendokumentasikan desain sistem, alur transaksi, dan diagram urutan (*sequence diagrams*) untuk modul-modul penting di ScholarFlow:

| Dokumen | Topik & Modul Terkait | Diagram Utama |
| :--- | :--- | :--- |
| **[01-server-side-ai-history.md](./01-server-side-ai-history.md)** | Server-Side AI History & Resilient Background Execution (ChatGPT-Style) | Alur transaksi saat tab ditutup di detik ke-2 dan dibuka kembali jam 19:00 |
| **[02-smart-idempotency-cache.md](./02-smart-idempotency-cache.md)** | Smart Idempotency Cache & Zero-Waste Token Deduplication (5-Minute TTL) | Alur deduplikasi request identik dan perlindungan 0-token |
| **[03-token-quota-synchronization.md](./03-token-quota-synchronization.md)** | Personal AI Token Quota & Service-Role Quota Tracking | Alur validasi kuota, service key bypass RLS, dan sinkronisasi reaktif UI |
| **[04-multi-tenant-campus-keys.md](./04-multi-tenant-campus-keys.md)** | Multi-Tenant Campus Dedicated AI Key Resolver & Workload Segregation | Alur isolasi rate-limit kunci kampus (`text` vs `vision`) dan failover pool |

---
*Seluruh diagram menggunakan sintaks resmi Mermaid (`sequenceDiagram`) yang dapat langsung dirender di GitHub, VS Code, maupun platform dokumentasi markdown.*
