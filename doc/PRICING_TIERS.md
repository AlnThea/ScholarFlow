# ScholarFlow Pricing & Feature Tiers (Comprehensive List)

Dokumen ini memetakan batasan fitur secara menyeluruh (*exhaustive*) antara pengguna **Free Tier** dan **Pro Tier** di seluruh modul ScholarFlow (Editor, AI, Library, Ekspor, Kolaborasi, dan Bibliometrik). Pemetaan ini adalah acuan final untuk implementasi *PLG (Product-Led Growth) Paywall*.

---

## 🟢 FREE TIER (Pelajar / Pengguna Dasar)
Paket gratis untuk kebutuhan penulisan draf standar dan manajemen referensi berskala kecil.

### 1. Editor & Formatting Dasar
- Akses penuh ke kanvas Editor (Teks, *Headings*, *Lists*).
- Sisip Tabel dan Gambar.
- Blok Rumus Matematika (KaTeX) & *Inline Math React Modal*.
- Multi-color Text Highlighter dengan *Color Picker Popover*.
- Custom Hyperlink Modal (Insert/Edit/Unlink).
- Dukungan *Dark Mode* dan *Bilingual* (Inggris/Indonesia).

### 2. Manajemen Dokumen & Perpustakaan
- *File Explorer Tree* (My Documents).
- **Batasan**: Maksimal **15** *Independent Documents* di panel navigasi.
- Manajemen referensi manual (*My Library*).
- Pencarian literatur dasar via API OpenAlex/Crossref.

### 3. Asisten AI & Analitik (Terbatas)
- Fitur AI *Summarize* (Ringkas Teks).
- Fitur AI *Generate Abstract*.
- Melihat *Burstiness Score* & Grafik Ritme Kalimat (*Sentence Cadence Chart*).
- Menggunakan model AI standar dengan *Edge Rate Limiting* ketat (15 *Requests per Minute*).

### 4. Ekspor & Kolaborasi
- Ekspor naskah ke **MS Word (.doc/MHTML)** dan **High-Fidelity PDF**.
- **Terkunci**: Halaman Daftar Pustaka/Bibliografi *dihilangkan* dari hasil ekspor.
- *Public Link Sharing* terbatas pada mode **Read-Only**.

---

## 💎 PRO TIER (Peneliti & Penulis Profesional)
Paket premium tanpa batas untuk kolaborasi lanjutan, analitik tingkat *enterprise*, dan jaminan integritas akademik.

### 1. Ekspor & Manajemen Tanpa Batas
- **Unlimited Documents**: Membuat dokumen independen tanpa batas kuota.
- **Full Word & PDF Export**: Hasil ekspor dokumen 100% lengkap, termasuk *header*, margin rapi, dan halaman **Daftar Pustaka/Bibliografi** yang diformat otomatis.
- **Bulk Library Import**: Impor massal referensi menggunakan file `.ris` / `BibTeX`.
- **PDF Metadata Extraction**: Upload PDF jurnal dan AI akan otomatis mengekstrak metadatanya ke *Library*.

### 2. AI Paraphrase Studio & Academic Integrity
- **Full Paraphrase Studio**: Akses ke seluruh variasi penulisan ulang (*Paraphrase, Simplify, Academic, Shorten, Expand*).
- **Author Stylometry (Mimic My Voice)**: AI mampu membaca konteks dokumen dan mereplikasi gaya tulisan, ritme, serta kosakata asli penulis.
- **Citation Safe-Mode**: Penguncian sitasi (mendukung format APA/IEEE). Sitasi dijamin tidak akan terhapus atau diganti saat teks diparafrase oleh AI.
- **AI Lexical Analyzer (Buzzword Tracker)**: Melacak kata-kata klise robotik khas AI (*delve, tapestry, esensial, dll.*).
- **Heatmap Inline Highlight**: Menyorot (memberi warna) kalimat-kalimat klise atau robotik langsung secara *live* di dalam kanvas editor.
- **Export Originality Report**: Mengunduh Sertifikat Laporan Orisinalitas berformat PDF/HTML yang berisi Skor Burstiness dan bebas AI sebagai alat bukti akademik.

### 3. Kolaborasi Profesional
- **Co-Editor Mode**: Teman atau dosen pembimbing dapat diundang via tautan untuk melakukan *real-time collaboration*.
- **Suggestions History**: Memfasilitasi *Track Changes* (Usulan diterima/ditolak).
- Notifikasi *Badge* untuk komentar dan kolaborator aktif.

### 4. Advanced Bibliometric Analytics
- Akses penuh ke halaman *Bibliometric Dashboard*.
- **Visualisasi Jaringan Lanjutan**: Pengelompokan metrik menggunakan algoritma *Louvain Modularity Clustering* yang presisi.
- **Time-Slicing Animation** & **Density Heatmap Visualization**.
- Mode **Drill-down**: Mengeklik "Node" untuk melihat rincian jurnal penyusunnya.
- Filter tingkat lanjut (*Thresholding*, *Year Range*, pencarian Node dengan kamera *Auto-Zoom*).
- **High-Res Export**: Ekspor grafik ke PNG Resolusi 4K atau grafik vektor SVG.
- **Data Export**: Ekspor metrik jaringan (Degree, Occurrences, Links) murni ke format CSV untuk diolah di SPSS/Excel.
- **GraphML/GML Export**: Mengunduh struktur jaringan untuk dibuka di aplikasi industri seperti *Gephi* atau *VOSviewer*.

### 5. Konfigurasi AI Lanjutan (BYOK)
- **Custom AI Gateway**: Memasukkan API Key OpenAI/LLM pihak ketiga secara mandiri (*Bring Your Own Key*).
- Akses ke server dan *routing* model premium tanpa penjagaan *Rate Limit* yang agresif.
