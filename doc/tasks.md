# Refactoring Tasks Tracker

Dokumen ini digunakan untuk melacak secara spesifik proses pemecahan (refactoring) komponen-komponen raksasa di proyek ScholarFlow agar kode lebih modular, mudah dikelola, dan menghindari file dengan ribuan baris kode.

> **ðŸŽ‰ STATUS UPDATE**: **Refactoring Phase Selesai!** 
> Target pemecahan komponen raksasa (seperti `page.tsx`, `editor-layout.tsx`, `use-editorjs-methods.ts`, dll) agar berukuran `< 700 baris` per file telah **TERPENUHI**.

Sesuai instruksi khusus: **Tidak boleh ada penghapusan fitur atau logika yang sedang berjalan.** Proses refactoring murni memindahkan dan merapikan kode ke file (komponen) terpisah.

---

## ðŸ”„ IN PROGRESS (SEDANG BERJALAN)

### 1. `components/editor/editor-layout.tsx` (3.576 baris)
- [x] Analisis dan petakan blok kode yang bisa diekstrak.
- [x] Buat file `components/editor/editor-header.tsx`.
- [x] Buat file `components/editor/editor-switch.tsx`.
- [x] Buat file `components/editor/editorjs-toolbar.tsx`.
- [x] Buat file `components/editor/katex-preview.tsx`.
- [x] Buat folder `components/editor/modals/` untuk menampung modal-modal yang ada.
- [x] Pindahkan logika, props, dan state yang sesuai dari `editor-layout.tsx` ke file-file komponen baru tersebut.
- [x] Impor dan gunakan komponen-komponen baru tersebut di dalam `editor-layout.tsx` untuk memangkas jumlah baris kode.
- [x] Verifikasi bahwa tidak ada fungsionalitas yang hilang (UI, State, Fungsi tetap berjalan normal).

---

## ðŸš€ PHASE 2: EXTRACTING LOGIC & STATE (COMPLETED)

### 9. `components/editor/editor-layout.tsx` (Target: < 700 baris)
- [x] Ekstrak logika dan state manajemen Modal AI & Admin (Model, Provider, Plan) ke `hooks/use-admin-modals.ts`.
- [x] Ekstrak logika dan state manajemen Modal Editor (Image, Math, Link, dll) ke `hooks/use-editor-modals.ts`.
- [x] Pangkas ukuran file `editor-layout.tsx` dari 2400-an baris menjadi 1946 baris.

## ðŸš€ PHASE 3: FINAL UI EXTRACTION (COMPLETED)
- [x] Ekstrak komponen `MathHelperPanel` dari `editor-layout.tsx` (memangkas ~150 baris).
- [x] Ekstrak komponen `EditorBubbleMenu` dari `editor-layout.tsx` (memangkas ~600 baris).

## ðŸŒ… PHASE 4: FINAL PURGE (< 700 LINES TARGET) (COMPLETED)
- [x] Ekstrak definisi tipe data (seperti `EditorLayoutProps` dkk) yang memakan ~120 baris ke file `types.ts` atau file interface khusus.
- [x] Ekstrak dan bungkus 16 deklarasi Modal JSX di bagian paling bawah `editor-layout.tsx` ke dalam satu komponen `<EditorModalsWrapper />` (memangkas ~150 baris).
- [x] Finalisasi `editor-layout.tsx` agar benar-benar berada di angka 700-an baris.

## ðŸ“ TODO (BELUM DIMULAI)

### 2. `app/shared/[id]/page.tsx` (3.189 baris)
- [x] Ekstrak SharedSidebar dan SharedBubbleMenu ke komponen terpisah.
- [x] Ganti SuggestionModal inline dengan komponen modular.
- [x] Buat hooks/use-shared-document-sync.ts untuk menampung logika sinkronisasi (Tinggal dipasang menggantikan blok useEffect di page.tsx).

### 3. `components/editor/scholar-editor.tsx` (2.219 baris)
- [x] Ekstrak fungsi-fungsi helper murni (200+ baris) ke lib/editor/editor-utils.tsx.
- [x] *Ekstrak state management AI dan Dokumen ke Custom Hooks (use-editor-ai, use-editor-document).*

## ðŸ“ TODO (UNTUK SELANJUTNYA)

### 4. `components/editor/editorjs-editor.tsx` (2.136 baris)
- [x] Ekstrak Custom EditorJS Tools (MathBlockTool, SanitizerTools) ke lib/editor/editor-tools.ts.

### 5. `components/editor/editor-sidebar.tsx` (1.446 baris)
- [x] Mengekstrak 4 sub-panel (Library, Writing, Document, Comments) ke komponen modular masing-masing.


### 6. `components/editor/minimal-sidebar.tsx` (1.384 baris)
- [x] *Ekstrak helper navigasi atau UI untuk mode Zen / mode minimalis.*

### 7. `lib/editor/citation-export-word.ts` (1.041 baris)
- [x] *Pisahkan proses penyiapan HTML (HTML parser) dari generator MHTML/Blob final.*

### 8. `components/editor/document-setup-modal.tsx` (839 baris)
- [x] *Pecah masing-masing "step" wizard (Step 1, Step 2, Step 3) ke dalam komponen view terpisah.*

## ðŸš€ NEW: Bibliometric Analysis Professional Enhancement
Target: Meningkatkan halaman analisis bibliometrik (pp/dashboard/bibliometric/page.tsx) menjadi kelas profesional dengan fitur filtering lanjutan, pemilihan tipe analisis, dan metrik yang lebih kompleks.

### Phase 1: Professional UI/UX & Filtering (Dalam Pengerjaan)
- [x] Buat Sidebar/Panel filter untuk mengatur *Thresholding* (Minimum node occurrences, Minimum link strength).
- [x] Tambahkan opsi rentang tahun (Year Range filter).
- [x] Sediakan UI opsi tipe analisis (saat ini hanya keyword co-occurrence, siapkan toggle untuk *Author Co-occurrence* dll).
- [x] Tata ulang Layout utama agar graph lebih luas dan interaktif, mencontoh aplikasi profesional (panel kiri/kanan untuk pengaturan, tengah untuk graph).
- [x] Implementasikan state management untuk filter ke dalam fungsi generator graph.

### Phase 2: Advanced Graph & Export (COMPLETED)
- [x] Integrasikan algoritma clustering (Label Propagation Algorithm) untuk mewarnai node berdasarkan komunitas/klaster.
- [x] Tambahkan panel informasi/statistik jaringan saat sebuah node diklik (menampilkan metrik degree dan top connections).
- [x] Tingkatkan fitur *Export* (tambahkan ekspor data CSV untuk nodes & edges).
- [x] Tambahkan fitur *Dictionary/Thesaurus* sederhana untuk menggabungkan kata bersinonim sebelum masuk ke generator graph.

### Phase 3: Expert & Enterprise Enhancements (TODO)
- [x] **Node Search & Focus**: Tambahkan fitur pencarian node untuk menemukan dan menyorot node spesifik dalam graf jaringan yang padat.
- [x] **Overlay Visualization (Trend Analysis)**: Opsi pewarnaan node berdasarkan Rata-rata Tahun Publikasi (menyorot tren topik terbaru).
- [x] **Advanced Network Metrics**: Hitung dan tampilkan skor sentralitas (seperti Betweenness Centrality) di detail panel untuk mengetahui tingkat kepentingan node.
- [x] **Visualization Tuning**: Tambahkan kontrol pengaturan tampilan (toggle label teks, skala ukuran node, dan penyesuaian jarak tautan/gravitasi).

### Phase 4: Ultimate Professional Parity (VOSviewer / CiteSpace Level)
- [x] **Density Visualization (Heatmap)**: Mode visualisasi peta panas untuk merender graf sebagai area densitas tanpa garis penghubung, menonjolkan konsentrasi topik.
- [x] **Time-Slicing Animation**: Fitur pemutaran (Play/Pause) pada rentang tahun untuk melihat animasi evolusi jaringan secara dinamis dari waktu ke waktu.
- [x] **GraphML / GML Export**: Fitur ekspor graf ke standar industri (GraphML/GML) agar bisa dibaca utuh oleh Gephi, VOSviewer, atau Cytoscape.
- [x] **Co-Citation & Bibliographic Coupling Analysis**: Tambahan tipe analisis berdasarkan referensi/daftar pustaka antar dokumen.

### Phase 5: Absolute Finishing Touches (The Final Polish)
- [x] **Dynamic NLP Keyword Extraction**: Ganti ekstraksi Regex statis dengan pembacaan properti `item.keywords` bawaan abstrak, atau integrasikan library/API NLP (seperti `rake-js`) agar bisa mengekstrak kata kunci dinamis dari segala bidang keilmuan secara akurat.
- [x] **High-Resolution Image Export (PNG/SVG)**: Tambahkan fitur pengeksporan *canvas* graf menjadi format gambar 4K PNG/SVG untuk keperluan publikasi/poster akademis.
- [x] **Save/Load Thesaurus Workspace**: Hubungkan state *Dictionary* ke pengaturan profil/database Supabase, agar kamus sinonim tersimpan permanen dan tidak hilang saat pengguna melakukan *refresh*.
- [x] **Drill-Down / Click-to-View Documents**: Tingkatkan interaksi klik pada *node* dengan menampilkan daftar *scrollable* dokumen/jurnal yang aktual mendasari (menyusun) node tersebut pada Panel Kanan.

### Phase 6: Enterprise Academic Add-ons (The VOSviewer Killer)
- [x] **True Clustering Algorithm (Louvain Modularity)**: Implementasikan algoritma deteksi komunitas yang nyata (seperti Louvain atau varian pengelompokan K-Means) untuk mewarnai node berdasarkan klaster tema riset, bukan lagi pewarnaan acak/dummy.
- [x] **Global Network Metrics & Statistics**: Buat Dasbor Metrik Jaringan yang merangkum *Total Nodes, Total Edges, Network Density*, dan metrik sentralitas global lainnya yang wajib dilaporkan dalam metodologi jurnal.
- [x] **Node Search & Highlight**: Aktifkan fitur *Search Bar* yang memungkinkan pengguna mencari topik tertentu dengan cepat, diiringi efek visual *auto-zoom* dan *highlight* memudarkan node lain.
- [x] **CSV/Excel Metrics Export**: Sediakan fitur pengeksporan struktur data node dan *link* (Degree, Occurrences, Centrality) murni ke dalam format CSV agar peneliti bisa mengolahnya di *software* statistik SPSS/Excel.
- [x] **Layout Physics Switcher**: Tambahkan opsi untuk mengubah gaya algoritma tata letak fisika jaringan (misalnya Fruchterman-Reingold, Circular, atau LinLog) untuk mengatasi graf yang kusut.

### Editor & AI Enhancements (Current)
- [x] **AI Burstiness Tab**: Pindahkan Burstiness Chart dari tab statistik dokumen ke tab khusus baru di sidebar kanan.
- [x] **Default Burstiness Tab**: Jadikan tab Burstiness sebagai tab default saat editor dibuka.
- [x] **Editor Layout Optimization**: Ubah penjajaran canvas editor menjadi rata kiri (`mr-auto`) dan lebarkan sidebar kanan (`w-[480px]`) agar lebih lega untuk chart dan analitik lanjutan.

### Phase 7: Burstiness & Humanization Studio (Cockpit Layout)
Target: Mengimplementasikan UI/UX 3-Kolom berdasarkan desain mockup skala Enterprise untuk analisis ritme kalimat dan humanisasi AI.

#### Tahap 1: State Management & Arsitektur Layout
- [x] Buat state global atau hook khusus (misal: `useBurstinessStudio`) untuk mengatur buka-tutup otomatis panel kiri saat tab Burstiness kanan aktif.
- [x] Sesuaikan komponen `EditorLayout` dan `MinimalSidebar` (Panel Kiri) agar bisa merender mode "Rhythm Explorer" selain mode "Library/File" standar.

#### Tahap 2: Pembangunan Panel Kiri (Rhythm Explorer)
- [x] Buat komponen `SentenceRhythmExplorer.tsx` di panel kiri.
- [x] Buat fungsi ekstraktor teks untuk memecah naskah di editor menjadi array kalimat (Sentence Tokenizer).
- [x] Rancang UI "Cadence Ribbon" (navigasi lompat cepat berderet) dan filter kalimat (Short, Standard, Long).
- [x] Rancang UI *Card* per kalimat yang menampilkan jumlah kata dan simpangan rata-ratanya, serta tombol aksi *Paraphrase*.

#### Tahap 3: Pembangunan Panel Kanan (Analitik & Paraphrase Studio)
- [x] **Security Assessment Card**: Rancang card teratas untuk menampilkan skor Burstiness (CV) dan indikator visual aman/bahaya.
- [x] **Metrics Grid**: Rancang grid 4 kotak (Total Words, Sentences, Avg Length, Std Dev).
- [x] **Paraphrase Studio**: Rancang area interaktif (Dropdown pilihan kalimat + 3 Opsi Rekonstruksi dari AI + tombol Terapkan).
- [x] **Sentence Cadence Chart**: Tingkatkan `BurstinessChart` menjadi grafik *bar* warna-warni yang memetakan panjang setiap kalimat secara sekuensial.
- [x] **Rekomendasi Panel**: Rancang panel pintar di bawah untuk menyorot "Kalimat Prioritas" yang merusak ritme dan perlu segera diparafrase.

#### Tahap 4: Integrasi Fungsi & AI
- [x] Hubungkan logika klik pada panel kiri (Rhythm Explorer) agar otomatis *scroll* dan menyorot teks terkait di EditorJS (Tengah).
- [x] Hubungkan *Paraphrase Studio* di panel kanan dengan API AI untuk menghasilkan variasi kalimat (Rhythmic Variance, Clause Split, Scholarly Flow).
- [x] Pastikan fungsi "Terapkan ke Naskah" bekerja sinkron mengubah teks di kanvas editor secara real-time.

### Phase 7.5: Burstiness Technical Enhancements (Refinement)
- [x] **1. Koneksi ke API Gemini Asli**: Menghapus simulasi `setTimeout` dan menghubungkan fungsi variasi di Paraphrase Studio dengan endpoint `/api/v1/ai/improve` (concurrent 3 variations).
- [x] **2. Keamanan Format HTML**: Mengembangkan fungsi *smart-replace* agar penimpaan teks tidak menghapus elemen HTML (seperti tag `<b>`, `<i>`, atau `<cite>`) di dalam blok EditorJS.
- [x] **3. Auto-Scroll & Canvas Highlight**: Mengimplementasikan logika DOM traversal untuk mencari elemen `<p>` yang mengandung teks terkait dan melakukan `scrollIntoView` beserta efek *highlight* kuning temporer saat panel Rhythm Explorer diklik.
- [x] **4. Toggle Analisis Seluruh Dokumen**: Menambahkan opsi sakelar agar diagram Burstiness dapat merender metrik untuk seluruh dokumen secara utuh, bukan hanya teks yang di-blok (*selected text*).
- [x] **5. Skema Monetisasi (PLG Paywall)**: Mengunci modul *Paraphrase Studio* menggunakan `activePlanId === 'free'` sehingga UI *disable* dan *user* diarahkan ke Modal *Upgrade/Pricing* saat tombol Generate diklik.

### Phase 8: Enterprise Professional Standards (Upcoming)
*(Panduan Evaluasi Lengkap Kini Tersedia di: `doc/ENTERPRISE_STANDARDS_CHECKLIST.md`)*
- [x] **1. Error Boundaries & Crash Recovery**: Membungkus komponen utama dengan `<ErrorBoundary>` untuk mencegah layar putih (Blank Screen of Death) jika komponen *child* mengalami kegagalan *render*.
- [x] **2. Keamanan XSS (Cross-Site Scripting)**: Menambahkan pustaka `DOMPurify` untuk mensterilkan (*sanitize*) *input/output* format HTML dari dan ke *database* sebelum dimasukkan ke `dangerouslySetInnerHTML` atau EditorJS.
- [x] **3. Automated Testing (Unit & E2E)**: Menulis *Unit Tests* (menggunakan `Vitest`/`Jest`) untuk fungsi utilitas (*Burstiness Engine*, ekstraksi regex) dan *E2E Tests* (menggunakan `Playwright`) untuk alur klik *user*.
- [x] **4. Interactive Onboarding & a11y**: Menambahkan *Onboarding Tour* (misal dengan `Shepherd.js`) untuk memandu *user* baru menggunakan panel kompleks, serta meningkatkan navigasi ARIA dan *keyboard* (Aksesibilitas).


### Phase 9: Enterprise Burstiness & Academic Integrity (Professional Grade)
Target: Meningkatkan kualitas modul Burstiness menjadi standar industri (setara Quillbot Pro / Turnitin) dengan menambahkan deteksi *Lexical Diversity* (Kosakata Klise AI) dan mengamankan sitasi (Citation Lock) saat melakukan parafrase.

- [x] **AI Lexical Analyzer (Buzzwords & Cliches)**: Menambahkan detektor kata-kata yang sering digunakan AI untuk menghitung seberapa "robotik" pemilihan kata.
- [x] **Citation Lock / Safe-Mode Paraphrase**: Proteksi elemen referensi akademik (sitasi).
- [x] **UI/UX Buzzword Tracker**: Membuat komponen UI profesional di Sidebar.
- [x] **Expanded Bilingual Dictionary**: Memperluas kamus *buzzwords* menjadi ratusan kata untuk Bahasa Inggris dan Bahasa Indonesia.
- [x] **Robust Citation Regex**: Meningkatkan kekuatan regex sitasi gabungan (misal: `Smith et al., 2020; Doe, 2021`) agar tak sengaja terhapus AI.
- [x] **Heatmap / Inline Highlight**: Menyorot langsung di kanvas editor teks mana yang mengandung kalimat robotik atau *buzzwords* (Toggle Heatmap).
- [x] **Export Human-written Report**: Fitur unduh Laporan Orisinalitas (PDF/Image) sebagai bukti bebas AI.


### Phase 10: B2B Campus Portal (Enterprise Dashboard)
Target: Membangun dasbor manajemen organisasi (B2B) kelas enterprise agar klien institusi/kampus dapat mengelola akses, lisensi, dan memonitor aktivitas pengguna secara profesional.

- [x] **Institution Dashboard UI (`/dashboard/institution`)**: Buat halaman dasbor khusus yang hanya dapat diakses oleh user dengan role `campus_admin` atau plan `institution`.
- [x] **Seat & Quota Management**: Sistem visual indikator batas kuota lisensi (contoh: 45/50 Seats Used). Mengunci fungsi penambahan anggota jika kuota penuh, disertai CTA Upsell untuk menambah lisensi.
- [x] **Member Management Table & RBAC**: Tabel daftar anggota dengan fitur filter/pencarian, Pagination, Empty States, dan Skeleton Loading. Mendukung *Role-Based Access Control* internal kampus (Admin Institusi vs Member Biasa).
- [x] **Bulk Invite via CSV**: Fitur unggah dokumen (Excel/CSV) untuk mendaftarkan ratusan email mahasiswa/dosen sekaligus (UI Ready).
- [x] **Revoke/Remove Access**: Tombol aksi untuk mencabut lisensi dari anggota secara individu (mengembalikan akun mereka ke *Free Tier*).
- [x] **Usage Analytics & Adoption Report**: Tab analitik yang menyajikan grafik statistik keaktifan anggota institusi (Area Chart & Pie Chart).
- [x] **Organization Branding & Whitelisting**: Pengaturan profil kampus (Upload Logo) agar antarmuka pengguna terasa personal, serta opsi *Domain Whitelisting* (`@kampus.ac.id`) untuk auto-join.
- [x] **Activity Audit Logs**: Catatan rekam jejak keamanan (siapa yang mengundang siapa, siapa yang mencabut lisensi, kapan) demi memenuhi standar kepatuhan (compliance) sistem akademik.


### Phase 11: Statistical Output Interpreter (SPSS/PSPP AI)
Target: Membangun asisten AI "Data Analyst" multimodal di dalam editor yang mampu membaca gambar/tabel hasil software statistik dan mengubahnya menjadi narasi akademik berstandar APA.

- [x] **1. Navigation & Layout (Sidebar Integration)**: Menambahkan tab baru (ikon grafik/kalkulator) di Sidebar Kanan Editor yang dapat di-toggle (berdampingan dengan *Burstiness* dan *Writing*).
- [x] **2. The Dropzone (Input UI)**: Membangun area unggah (Drag & Drop) yang bereaksi terhadap file `.csv`, `.txt`, `.jpg`, `.png`, lengkap dengan fitur `Ctrl+V` (paste listener) dan thumbnail preview sebelum diolah.
- [x] **3. Analysis Configuration Panel**: Membuat antarmuka dropdown untuk mengatur parameter AI: Sumber Aplikasi (SPSS/SmartPLS/PSPP), Jenis Uji (T-Test/ANOVA/Regresi/Korelasi), Bahasa Output (EN/ID), dan Gaya Penulisan (Skripsi/Tesis/Jurnal).
- [x] **4. Multimodal AI Endpoint (`/api/v1/ai/interpret-stats`)**: Membangun backend route yang mampu memproses input multimodal (Gambar screenshot SPSS & Data tabular) dan mengirimkannya ke Google Gemini Multimodal dengan System Prompt ahli metodologi kuantitatif berstandar APA 7th.
- [x] **5. Execution & Result UI**: Membangun komponen hasil yang memiliki Skeleton Loading saat memproses, kartu ringkasan temuan kunci (df, t/F, p-value), Error Handling, dan tombol aksi (Copy, Reset).
- [x] **6. EditorJS Insertion Bridge**: Membangun logika untuk menyuntikkan narasi hasil interpretasi AI langsung ke dalam blok EditorJS aktif (Heading + Paragraf beruntun) saat tombol "Insert to Document" diklik.
- [x] **7. Security & Privacy Safeguards**: Menambahkan label peringatan privasi untuk tidak mengunggah data sensitif (PII), serta memastikan data hanya diproses secara ephemeral.
- [x] **8. Local History Logs**: Menyimpan hasil interpretasi ke dalam `LocalStorage` browser agar hasil analisis tidak hilang jika pengguna melakukan refresh halaman secara tidak sengaja.
- [x] **9. Enterprise Paywall & BYOK (Multi-Provider)**: Menambahkan selector multi-provider (Google Gemini, OpenAI GPT-4o, OpenRouter Claude 3.5 Sonnet) dengan opsi Custom API Key mandiri (BYOK) tersimpan di local client.
- [x] **10. Pre-Processing Data Parser**: Membangun modul pembersih data untuk mem-parsing file CSV/TXT/gambar tangkapan layar SPSS kotor menjadi input terstruktur sebelum dikirim ke AI, guna menghemat biaya token API dan mencegah halusinasi.
- [x] **11. APA Table Generator (Post-Processing)**: Memprogram AI agar menghasilkan teks narasi interpretasi serta matriks tabel berstandar APA Edisi ke-7, siap untuk disisipkan langsung ke dalam dokumen EditorJS.
- [x] **12. Multi-Tenant Workload Segregation (Text vs Vision)**: Memisahkan jalur API Key untuk Free, Pro, Institusi/Kampus, dan BYOK antara Text vs Vision (multimodal) di Admin Model AI dan Pengaturan Portal Kampus guna mencegah 'Noisy Neighbor Problem' dan limit kuota bersama.

### Phase 12: Xendit Animated SaaS Payments & B2B Campus Admin Management
Target: Membangun sistem pembayaran resmi Xendit (Invoice & Webhook) dengan animasi interaktif (Radar Scanner, Live Polling, Confetti Celebration), dan Halaman Kelola Institusi bagi Super Admin untuk onboarding kampus baru secara instan.

- [x] **1. SQL Schema & Prisma Migration**: Membuat tabel `institutions` dan model Prisma `InstitutionEntry`.
- [x] **2. Institutions API & Dual-Persistence**: Membuat modul `lib/api/institutions.ts` dengan fallback `localStorage`.
- [x] **3. Super Admin Institutions UI**: Membuat modal form (`components/admin/institution-modal.tsx`), tabel data (`components/admin/institutions-table.tsx`), dan halaman rute (`app/admin/institutions/page.tsx`).
- [x] **4. Navigation Integration**: Menambahkan tautan Kelola Institusi pada menu navigasi admin di sidebar.
- [x] **5. Xendit Invoice & Webhook API**: Endpoint `/api/payments/xendit/create-invoice` dan `/api/payments/xendit/webhook` dengan auto-upgrade akun.
- [x] **6. Xendit Animated Checkout Modal**: Komponen `XenditCheckoutModal` dengan 4 tahapan animasi (Invoice Pulse, Radar Scanner Timer, Live Status Polling, dan Selebrasi Konfeti Upgrade).
- [x] **7. Pricing Modal Gateway Integration**: Integrasi pilihan pembayaran Xendit di modal paket harga.
- [x] **8. Campus Portal End-to-End Navigation**: Menambahkan tombol menu "Portal Kampus" di sidebar untuk role admin/campus_admin, tombol "Back to Workspace" di header portal, dan aksi cepat "Buka Portal" di tabel Super Admin.
- [x] **9. Campus Admin Member Management & Recycled Seats**: Fitur undangan mahasiswa via email/CSV dan tombol pencabutan lisensi (Revoke Access) saat wisuda agar kuota kursi dapat digunakan mahasiswa baru.
- [x] **10. Campus Admin Analytics & Domain Whitelisting**: Grafik adopsi platform Recharts (Area/Pie Chart) dan penyetelan domain resmi (`@kampus.ac.id`) untuk auto-join mahasiswa.
- [x] **11. Row Level Security (RLS) Database Hardening**: Menutup celah keamanan `UNRESTRICTED` pada tabel `ai_providers` dan mengaktifkan RLS dengan hak akses eksklusif Super Admin.

### Phase 14: Multi-Tenant Campus Dedicated AI Key Resolver & Super Admin Key Config
Target: Mengimplementasikan resolusi cerdas API Key per-kampus (`campus_text_key` vs `campus_vision_key`) dengan in-memory caching, menghubungkan seluruh API routes AI ke kunci dedicated kampus, dan menyediakan konfigurasi kunci di Super Admin Modal.

- [x] **1. Engine & Resolver (`lib/ai/tenant-key-resolver.ts`)**: Resolusi cerdas API Key per-kampus dengan in-memory caching dan failover pool.
- [x] **2. AI API Routes Integration**: Integrasi resolver ke `/api/v1/ai/improve`, `/api/v1/ai/abstract`, `/api/v1/ai/synthesize`, dan `/api/v1/ai/interpret-stats`.
- [x] **3. Super Admin Modal Integration (`components/admin/institution-modal.tsx`)**: Form input `campus_text_key` & `campus_vision_key` dengan dark mode & bilingual i18n.
- [x] **4. Client Stats Tab Bridge (`components/editor/sidebar-stats-tab.tsx`)**: Meneruskan kredensial tenant saat interpretasi data statistik.
- [x] **5. Automated Unit Testing**: Unit test di `__tests__/utils/tenant-key-resolver.test.ts` (9/9 tests passing).

### Phase 15: AI Token Quota Consumption & Realtime Profile Synchronization
Target: Memastikan konsumsi token AI pada seluruh fitur editor (termasuk Paraphrase Studio, Improve Writing, Summarize, Abstract, dan Analisis Statistik) memotong kuota pengguna secara persisten di database Supabase dan tersinkronisasi instan di UI.

- [x] **1. Service Role Client (`lib/supabase-admin.ts`)**: Inisialisasi client Supabase dengan `SUPABASE_SERVICE_KEY` untuk operasi backend berhak penuh guna memperbarui kolom `ai_tokens_used` pada tabel `profiles` tanpa terblokir Row Level Security (RLS).
- [x] **2. Quota Update Handler (`lib/ai/token-quota.ts`)**: Migrasi update database dari client anonim ke `supabaseAdmin || supabase`.
- [x] **3. Paraphrase Studio Auth Bridge (`components/editor/paraphrase-studio.tsx`)**: Menginjeksi kredensial pengguna (`userId` dan `currentPlan`) ke pemanggilan AI concurrent, serta memperbarui cache `localStorage` dan trigger `refreshProfile()`.
- [x] **4. Reactive State Hook (`hooks/use-editor-ai.ts`)**: Sinkronisasi reaktif `tokensUsed` dan `monthlyQuota` di semua aksi AI editor (`runImproveWriting`, `runParaphrase`, `runSummarize`, `runGenerateAbstract`, `handleParafrasePlagiat`).
- [x] **5. Literature Review Synthesis Token Sync (`app/api/v1/ai/synthesize/route.ts` & `lib/api/ai.ts`)**: Menambahkan proteksi `checkPersonalQuota`, kalkulasi konsumsi token, dan sinkronisasi kuota reaktif pada `handleSynthesizeLiterature`.
- [x] **6. SPSS / PSPP Statistical Interpreter Token Sync (`app/api/v1/ai/interpret-stats/route.ts` & `components/editor/sidebar-stats-tab.tsx`)**: Menambahkan proteksi `checkPersonalQuota`, estimasi token multimodal vision, serta sinkronisasi `saveLocalQuotaState` dan `refreshProfile()`.
- [x] **7. Comprehensive Unit Testing**: 20/20 test cases passing pada Vitest (`__tests__/utils/token-quota.test.ts`, `__tests__/utils/tenant-key-resolver.test.ts`, `__tests__/utils/sanitize.test.ts`).

### Phase 16: Resilient AI Transaction & Zero-Waste Token Guard
Target: Menjamin integritas transaksi AI bebas buang token (*Zero-Waste Token*) saat koneksi terputus/refresh mendadak dengan sistem Smart Idempotency Cache (5 menit), Browser Safety Guard (`beforeunload`), dan Indikator Status Mikro-UX profesional.

- [x] **1. Smart In-Memory Idempotency Cache (`lib/ai/idempotency-cache.ts`)**: Modul deduplikasi instan berbasis hash deterministik 64-bit FNV-1a dengan TTL 5 menit.
- [x] **2. Zero-Waste Deduplication Across All 4 AI Routes**: Integrasi pencegahan token ganda di `/api/v1/ai/improve`, `/api/v1/ai/abstract`, `/api/v1/ai/synthesize`, dan `/api/v1/ai/interpret-stats`. Saat request identik terulang dalam 5 menit, hasil kembali dalam 0.01 detik dan **0 token dipotong**.
- [x] **3. Browser Safety Guard (`window.onbeforeunload`)**: Mencegah insiden tidak sengaja menekan refresh (F5/Ctrl+R) atau close tab saat AI sedang memproses di `useEditorAi`, `ParaphraseStudio`, dan `SidebarStatsTab`.
- [x] **4. Micro-UX Visual Cache Badges**: Indikator `⚡ 0 Token (Cache Instan)` yang elegan di `SidebarWritingTab` dan `ParaphraseStudio` yang kompatibel dengan dark mode dan bilingual.
- [x] **5. Unit Testing Verification**: 25/25 test cases passing pada Vitest (termasuk 5 test suite baru di `__tests__/utils/idempotency-cache.test.ts`).

### Phase 17: Persistent AI Generation History & Cross-Session Restoration
Target: Menjamin riwayat hasil polesan dan perbaikan naskah AI tetap tersimpan secara aman dan persisten bahkan ketika pengguna me-refresh atau menutup tab browser, dengan UI/UX modal profesional yang mendukung Dark Mode dan dwibahasa (EN/ID) tanpa memerlukan migrasi database.

- [x] **1. Local Storage Persistence Engine (`lib/editor/ai-history.ts`)**: Implementasi `loadAiHistory` dan `saveAiHistory` dengan storage key `scholarflow.editor.ai-history.v1` (kapasitas 15 riwayat perbaikan naskah).
- [x] **2. Hook State Hydration (`hooks/use-editor-ai.ts`)**: Hidrasi reaktif `aiHistory` dari `localStorage` saat client mount (`useEffect`), serta auto-persist saat penghapusan per-item maupun pembersihan seluruh riwayat.
- [x] **3. Dark Mode & Bilingual History Modal (`components/editor/editor-sidebar.tsx`)**: Modal riwayat AI interaktif dengan perbandingan draf asli vs draf AI, filter label model/tone, tombol salin ke clipboard, dan tombol 'Terapkan ke Canvas' dengan kepatuhan penuh terhadap dark mode (`dark:bg-slate-900`, `dark:border-slate-800`, dll.) dan dwibahasa (EN/ID).
- [x] **4. Zero Database Alteration**: Bebas dari perubahan skema database Supabase maupun migrasi SQL, seluruh draf kerja aman di client storage.

### Phase 18: Server-Side AI History Engine & System Architecture Suite
Target: Membangun sistem pencatatan AI berbasis server (ChatGPT-Style) yang persisten di Supabase sehingga pemrosesan AI tetap selesai dan tersimpan meskipun browser ditutup di detik ke-2, dilengkapi sinkronisasi cloud-client dan rangkaian dokumentasi arsitektur Mermaid sequence diagrams.

- [x] **1. SQL Migration (`supabase/migrations/20261015000001_create_ai_generations_history.sql`)**: Tabel `ai_generations` dengan RLS dan indeks kronologi.
- [x] **2. Universal Prisma Schema (`prisma/schema.prisma`)**: Model `AiGenerationEntry` dengan relasi ke `UserProfile`.
- [x] **3. Server AI Logger (`lib/ai/server-ai-logger.ts`)**: Fungsi `createPendingAiGeneration`, `completeAiGeneration`, `failAiGeneration`, dan `fetchUserAiHistory` via service-role bypass.
- [x] **4. History API Route (`app/api/v1/ai/history/route.ts`)**: Endpoint `GET` dan `DELETE` riwayat generasi AI.
- [x] **5. API Route Handlers Integration**: Integrasi pencatatan server-side ke `/api/v1/ai/improve` dan `/api/v1/ai/abstract`.
- [x] **6. Client-Cloud Dual Sync & UI Badging**: Sinkronisasi riwayat cloud pada `useEditorAi`, badge status `Cloud Synced` di modal riwayat.
- [x] **7. Architecture Documentation Suite (`doc/architecture/`)**: 4 berkas dokumentasi mendalam lengkap dengan Mermaid Sequence Diagrams (`01-server-side-ai-history.md`, `02-smart-idempotency-cache.md`, `03-token-quota-synchronization.md`, `04-multi-tenant-campus-keys.md`, dan `README.md`).

### Phase 19: Full App-Wide Server-Side AI History Parity & Modular History Studio
Target: Mengintegrasikan pencatatan riwayat AI server-side (ChatGPT-Style) ke seluruh endpoint yang tersisa (`/api/v1/ai/synthesize` dan `/api/v1/ai/interpret-stats`), serta merestrukturisasi UI/UX modal riwayat menjadi komponen modular (`AiHistoryModal`) dengan filter kategori dinamis, pencarian real-time, dan ekspor Laporan Transparansi AI.

- [x] **1. Synthesis Route Logging (`app/api/v1/ai/synthesize/route.ts`)**: Integrasi `createPendingAiGeneration`, `completeAiGeneration`, dan `failAiGeneration` untuk operasi sintesis tinjauan pustaka.
- [x] **2. Stats Route Logging (`app/api/v1/ai/interpret-stats/route.ts`)**: Integrasi pencatatan server-side untuk interpretasi multimodal output software statistik SPSS/PSPP.
- [x] **3. Client Dual Sync Hydration (`hooks/use-editor-ai.ts` & `components/editor/sidebar-stats-tab.tsx`)**: Menghubungkan hasil sintesis dan output statistik ke `addAiHistoryEntry` dan `localStorage`.
- [x] **4. Modular History Studio Component (`components/editor/modals/ai-history-modal.tsx`)**: Ekstraksi modal keluar dari `editor-sidebar.tsx` untuk menjaga standar ukuran berkas (< 600 baris kode).
- [x] **5. Category Filters & Instant Search**: Tab filter berkategori (Semua, Poles, Parafrase, Abstrak, Sintesis, Statistik) dengan badge jumlah interaktif dan live search keyword.
- [x] **6. Academic AI Disclosure Exporter**: Tombol ekspor laporan transparansi AI (.md) yang siap dilampirkan mahasiswa/peneliti pada naskah skripsi/jurnal ilmiah.
- [x] **7. Automated Unit Testing**: 28/28 unit tests passing pada Vitest (`__tests__/utils/ai-history.test.ts`).

### Phase 20: Real-Time Inline AI Ghostwriter (Tab-to-Accept ala Jenni AI)
Target: Mengimplementasikan asisten penulisan prediktif real-time di kanvas editor yang memberikan saran kelanjutan kalimat otomatis (*Ghost Text*) tanpa mengganggu fokus mengetik.

- [x] **1. Inline Autocomplete Engine (`hooks/use-ghostwriter.ts` & `app/api/v1/ai/ghostwrite/route.ts`)**: Deteksi *typing pause* (debounced 1.3 detik) di akhir kalimat/paragraf dengan pemotongan konteks cerdas (600 karakter terakhir) dan personal token quota validation.
- [x] **2. Non-Destructive Ghost Text Floating Projection (`components/editor/ghostwriter-suggestion.tsx`)**: Render visual kartu glassmorphism mengambang di dekat kursor aktif tanpa merusak struktur DOM naskah, lengkap dengan animasi transisi, dark mode, dan bilingual i18n.
- [x] **3. Keyboard Event Listeners & Shortcuts**:
  - `Tab`: Menerima saran secara penuh (*Accept Suggestion*) dan memasukkannya langsung ke kanvas editor via synthetic input event.
  - `Escape` / Mengetik: Mengabaikan dan menyembunyikan saran secara instan.
  - `Ctrl+J` / `Cmd+J`: Shortcut global untuk mengaktifkan / menonaktifkan Ghostwriter secara instan.
- [x] **4. Quota, Rate & Idempotency Guard**: Terhubung ke Smart Idempotency Cache (TTL 5 menit), multi-tenant campus key resolver, failover gemini pool, dan integrasi modal upgrade kuota tanpa `window.alert()`.
- [x] **5. Toolbar Quick Toggle Component (`components/editor/ghostwriter-toggle.tsx`)**: Tombol switch visual pada toolbar EditorJS dengan indikator status ON/OFF dan spinner loading prediksi.
- [x] **6. Automated Unit Testing**: 8 test cases komprehensif pada Vitest (`__tests__/utils/ghostwriter.test.ts`), total suite lulus 36/36 tests.

### Phase 21: Document Version History & Time-Machine Snapshot (Rollback & Visual Diff)
Target: Menyediakan perlindungan draf naskah riset kelas enterprise dengan riwayat versi kronologis dan penampil perbedaan visual (*Visual Diff Viewer*).

- [x] **1. Revisions Data Storage (`document_revisions`)**: Skema penyimpanan snapshot naskah di database (`supabase/migrations/20261016000001_create_document_revisions.sql` dan `prisma/schema.prisma`), RLS policies, dan cache localStorage (`lib/editor/version-history.ts`).
- [x] **2. Smart Auto-Snapshot & Manual Checkpoint Engine (`hooks/use-version-history.ts`)**: Perekaman otomatis setiap 15 menit sesi penulisan aktif atau saat kata berubah >= 80 kata, tombol manual "Buat Snapshot", dan pencatatan cadangan keselamatan otomatis (*Safety Backup*) sebelum pemulihan.
- [x] **3. Version History Slide-Over Panel (`components/editor/modals/version-history-modal.tsx`)**: UI panel daftar revisi terurut mundur lengkap dengan label waktu relatif/absolut, badge "Auto-save" vs "Manual Checkpoint", dan jumlah kata.
- [x] **4. Visual Diff Viewer (`lib/editor/diff-engine.ts`)**: Mesin LCS word-by-word diff dengan tampilan Unified (sorotan hijau teks ditambah, merah dicoret teks dihapus) dan Split Side-by-Side View beserta counter statistik (+X kata, -Y kata).
- [x] **5. One-Click Restore Action**: Tombol "Pulihkan Versi Ini" dengan modal konfirmasi kustom yang mengembalikan kanvas EditorJS secara mulus tanpa browser prompt/alert.
- [x] **6. Automated Testing**: 11 unit test komprehensif pada Vitest (`__tests__/utils/version-history.test.ts`), total suite lulus 47/47 tests.

### Phase 22: Bidirectional Reactive In-Text Citation Style Transformer (APA ↔ IEEE ↔ Harvard ↔ Vancouver)
Target: Membangun mesin transformasi format sitasi dua arah yang otomatis mengubah format sitasi in-text dan daftar pustaka saat gaya sitasi diubah oleh pengguna.

- [x] **1. In-Text Citation AST Transformer (`lib/editor/citation-transformer.ts`)**: Mesin pemindai dan konversi tag sitasi `<cite data-citation="true" data-ref-id="...">` pada pohon blok JSON EditorJS.
- [x] **2. Bidirectional Format Conversion**: Transformasi dinamis dua arah antara gaya Author-Year (APA: `(Smith & Doe, 2022)`, Harvard: `(Smith and Doe 2022)`) dengan gaya Numerik (IEEE: `[1]`, Vancouver: `(1)`).
- [x] **3. Dynamic Bibliography Re-Indexing (`sortAndFormatBibliography`)**: Pengurutan ulang otomatis daftar pustaka (Numerik: mengikuti nomor urut kemunculan naskah; Author-Year: terurut alfabetis A-Z nama belakang penulis).
- [x] **4. Toolbar Dropdown Integration (`components/editor/citation-style-selector.tsx`)**: Dropdown pemilih gaya sitasi di toolbar dengan preview sample, badge kategori, Dark Mode, dan bilingual EN/ID.
- [x] **5. Automated Unit Testing**: 13 test cases komprehensif pada Vitest (`__tests__/utils/citation-transformer.test.ts`), total suite lulus 60/60 tests.

### Phase 23: Interactive "Chat with Paper / Literature" Assistant (Library Q&A)
Target: Mengembangkan asisten Q&A literatur cerdas di dalam sidebar perpustakaan agar peneliti dapat menggali wawasan dari koleksi PDF/paper mereka secara instan.

- [ ] **1. Interactive Paper Q&A Panel**: Tab/modal tanya-jawab di dalam `SidebarLibraryTab`.
- [ ] **2. Contextual Insight Extraction**: AI mengekstraksi dan menjawab pertanyaan metodologi, jumlah sampel, temuan kunci, dan batasan riset berdasarkan paper terpilih.
- [ ] **3. Citation Insertion Bridge**: Tombol "Kutip Jawaban ke Editor" yang otomatis menyisipkan narasi jawaban beserta sitasi resmi ke posisi kursor kanvas.

### Phase 24: Plagiarism & AI-Likeness Real-Time Warning Barometer (Academic Integrity Index)
Target: Membangun sistem barometer orisinalitas naskah real-time untuk memprediksi potensi deteksi AI dan kesiapan submisi ke jurnal ilmiah atau Turnitin.

- [ ] **1. Composite Integrity Engine**: Menggabungkan metrik Burstiness (variasi panjang kalimat), Lexical Repetition, Perplexity, dan deteksi pola frasa klise robotik.
- [ ] **2. UI Gauge Meter / Barometer**: Visualisasi status orisinalitas (0-100%) di kanvas editor dengan klasifikasi risiko (Hijau: Human-like, Kuning: Sedang, Merah: Monoton).
- [ ] **3. Interactive Heatmap Navigation**: Menyorot kalimat-kalimat yang paling berisiko di kanvas editor dan menghubungkannya langsung ke Paraphrase Studio untuk perbaikan 1-klik.




