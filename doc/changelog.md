# Refactoring Changelog

Dokumen ini mencatat riwayat perubahan (*changelog*) secara spesifik yang berkaitan dengan upaya merapikan (refactoring) komponen-komponen berukuran raksasa di dalam ScholarFlow.

---

## [Unreleased] / Work In Progress
## ⚡ [v0.45.6] - 2026-10-29 (Maximized 465+ Bilingual AI Indicators: 145 Words + 100 Phrases per Language)

### 🎯 Integrasi Maksimal Masing-Masing 100+ Kata & 100+ Frasa per Bahasa (Total 465 Indikator)
- **Ekspansi Frasa Klise Gabungan (`AI_CLICHE_PHRASES`)**:
  - Memperluas array `AI_CLICHE_PHRASES` di [`lib/editor/burstiness-engine.ts`](file:///c:/web/ScholarFlow/lib/editor/burstiness-engine.ts) sehingga **Bahasa Inggris mencapai 100 frasa unik** dan **Bahasa Indonesia mencapai 100 frasa unik** (total 200 frasa gabungan) tanpa menghapus kode yang sudah ada.
  - Mencakup 6 kategori pola multi-kata khas LLM: *Preamble & Opening Tropes*, *Negative Parallelisms*, *Inflated Significance & Grandiosity*, *Superficial Participle Endings*, *Weasel Words & Attribution Padding*, serta *Formulaic Conclusions*.
- **Ekspansi Array Kata Tunggal AI (`AI_BUZZWORDS`)**:
  - Menjaga 145 kata tunggal Bahasa Inggris dan 120 kata tunggal Bahasa Indonesia (total 265 kata tunggal unik).
- **Pembaruan Master Lexicon Documentation (`doc/AI_BUZZWORDS_LEXICON.md`)**:
  - Menerbitkan dokumentasi master leksikon lengkap yang merinci seluruh 465 indikator penanda AI beserta analisis linguistik komputasionalnya.
- **Verifikasi**:
  - TypeScript: 0 error (`npx tsc --noEmit`).
  - Vitest: 230 dari 230 unit test lolos 100% di 27 berkas pengujian.

## ⚡ [v0.45.5] - 2026-10-22 (BYOK Architecture for PaperChat: Zero-Quota Deduction, Multi-Tenant Campus & Personal Key Support, Pro Model Access & Active Visual Badge)

### 🎯 Integrasi BYOK (Bring Your Own Key) & Nol Potongan Kuota Token
- **Dukungan Kunci Mandiri Kampus & Pengguna Pribadi (`app/api/v1/ai/paper-chat/route.ts`)**:
  - Mendeteksi secara otomatis apakah permintaan menggunakan kredensial kampus (`tenantKeyRes.source === 'campus_byok'`) atau API key mandiri pengguna (`customApiKey`).
  - **Nol Potongan Kuota (*Zero-Quota Deduction*)**: Melewati batasan kuota token server ScholarFlow sehingga pemakaian token dicatat 0 di akun pengguna dan tidak mengurangi jatah 50.000 token bulanan.
  - **Akses Terbuka ke Model Premium Pro**: Pengguna Free yang memakai kunci BYOK pribadi diizinkan mengakses model kelas atas (*Claude 3.5 Sonnet*, *GPT-4o*) karena biaya API ditanggung oleh akun mereka sendiri.
- **Badge Indikator Status BYOK Aktif (`components/editor/modals/paper-chat-modal.tsx`)**:
  - Menampilkan badge berwarna hijau emerald `🔑 BYOK UNLIMITED` pada header modal PaperChat jika kunci mandiri terdeteksi aktif.
- **Verifikasi**:
  - TypeScript: 0 error (`npx tsc --noEmit`).
  - Vitest: 229 dari 229 unit test lolos 100%.

## ⚡ [v0.45.4] - 2026-10-22 (PaperChat Freemium Hybrid Tier Strategy: Free Monthly Token Guard with Pro Model Gating & Reactive In-Modal Upgrade Triggers)

### 🎯 Strategi Tingkatan Freemium Hybrid untuk Chat Paper & Pemicu Upgrade Pro
- **Gating Model AI Premium pada Chat Paper (`app/api/v1/ai/paper-chat/route.ts`)**:
  - Menjaga fitur Chat Paper tetap terbuka untuk pengguna Free dengan batasan kuota bulanan 50.000 token.
  - Mengunci model kelas atas (misal Claude 3.5 Sonnet / GPT-4o) khusus untuk pengguna Pro (`requiresPro: true`).
- **Badge Indikator Status & Banner Penawaran Upgrade (`components/editor/modals/paper-chat-modal.tsx`)**:
  - Menambahkan badge status tingkatan (`PRO` emas atau `FREE` abu-abu dengan tombol pemicu *Upgrade Pro* cepat) pada header modal.
  - Menampilkan kartu banner upgrade berdesain elegan (lengkap dengan Dark Mode & teks dwibahasa EN-ID) tepat di atas kotak chat ketika kuota token Free habis atau saat pengguna memilih model Pro.
- **Koneksi Modal Harga (`components/editor/sidebar-library-tab.tsx`)**:
  - Meneruskan prop `onUpgradePro` untuk membuka `PricingModal` secara langsung saat tombol upgrade di dalam modal chat paper ditekan.
- **Verifikasi**:
  - TypeScript: 0 error (`npx tsc --noEmit`).
  - Vitest: 229 dari 229 unit test lolos 100%.

## ⚡ [v0.45.3] - 2026-10-22 (Real-Time Reactive Token Quota Deductions for PaperChat & Global Quota Event Bus)

### 🎯 Sinkronisasi Kuota Token Real-Time untuk Chat Paper & Global Event Bus
- **Pengiriman Pemakaian Token Real-Time dari PaperChat (`app/api/v1/ai/paper-chat/route.ts`)**:
  - Mengembalikan `tokens_used` dan `monthly_quota` langsung di dalam JSON respon endpoint PaperChat.
  - Memastikan setiap interaksi tanya jawab paper tercatat dan nilainya dikirimkan balik ke komponen antarmuka pengguna.
- **Global Reactive Token Quota Event Bus (`lib/ai/token-quota.ts`)**:
  - Memperbarui `saveLocalQuotaState` agar memancarkan custom event `scholarflow:quota-updated` secara global pada window browser.
  - Mengatasi keterbatasan isolasi state antar komponen yang terpisah hierarki sehingga tidak perlu reload halaman.
- **Pembaruan Reaktif pada Hook & Modal (`hooks/use-editor-ai.ts`, `components/editor/modals/paper-chat-modal.tsx`)**:
  - Memasang pendengar (*listener*) event di `useEditorAi` untuk menyegarkan state `tokensUsed` dan `monthlyQuota`.
  - Memanggil `saveLocalQuotaState` di dalam `PaperChatModal` sesaat setelah balasan AI diterima. Badge kuota token di header dan bilah samping kini langsung berkurang/ter-refresh seketika.
- **Verifikasi**:
  - TypeScript: 0 error (`npx tsc --noEmit`).
  - Vitest: 229 dari 229 unit test lolos 100%.

## ⚡ [v0.45.2] - 2026-10-22 (PaperChat Multi-Provider OpenRouter Cascading, Strict Scope Guardrails & Intelligent Language Detection)

### 🎯 Integrasi Multi-Provider OpenRouter pada PaperChat, Guardrails Keamanan & Deteksi Bahasa
- **Koneksi Dinamis OpenRouter & Model Database ke PaperChat (`app/api/v1/ai/paper-chat/route.ts`)**:
  - Memperbaiki akar masalah di mana fitur *Chat Paper* sebelumnya langsung jatuh ke teks *fallback* tiruan karena rute backend hanya mendukung kunci Gemini secara statis.
  - Mengintegrasikan fungsi `callOpenRouter` dan pembacaan dinamis model aktif dari Supabase (`ai_models` & `ai_providers`).
  - Meneruskan `selectedAiModel` dari `SidebarLibraryTab` ke `PaperChatModal` sehingga model pilihan pengguna dipakai langsung untuk membedah paper.
- **Pemasangan Guardrails Keamanan Ketat Terhadap Prompt Injection**:
  - Menanamkan instruksi pembatasan tegas pada prompt sistem: AI dilarang keras melayani permintaan di luar paper (seperti coding umum, pembuatan website, atau upaya peretasan database) dan wajib menolak secara sopan serta mengarahkan kembali ke topik paper ilmiah.
- **Deteksi Bahasa Cerdas & Penyesuaian Narasi Alami**:
  - Menghilangkan bug kalimat campuran bahasa Inggris-Indonesia pada template cadangan dengan menerapkan deteksi kata kunci bahasa Indonesia secara cerdas.
- **Verifikasi**:
  - TypeScript: 0 error (`npx tsc --noEmit`).
  - Vitest: 229 dari 229 unit test lolos 100%.

## ⚡ [v0.45.1] - 2026-10-22 (High-Density Professional Citation List with In-Canvas Text Locating & Foldable Details Drawer)

### 🎯 Redesain Daftar Sitasi Kompak & Fitur Tunjukkan Posisi Sitasi di Naskah
- **Tampilan Daftar Kompak & Profesional (`components/editor/sidebar-library-tab.tsx`)**:
  - Mengganti tampilan kartu besar yang memakan ruang vertikal menjadi tampilan daftar baris kompak (*high-density list row*) berstandar reference manager profesional (seperti Mendeley / Zotero).
  - Mengurangi ketinggian per entri dari ~180px menjadi ~40px sehingga daftar berisi lebih dari 20 sitasi dapat ditinjau dengan mudah tanpa perlu *scroll* panjang ke bawah.
  - Menampilkan nomor indeks referensi (`[1]`, `[2]`), nama penulis & tahun, badge folder ringkas, dan judul yang rapi terpotong (*truncated*).
- **Deteksi Posisi Sitasi di Naskah (*Interactive In-Canvas Locating*)**:
  - Mengklik baris sitasi (atau tombol ikon Target) akan secara otomatis menggulirkan (*smooth scroll*) kanvas naskah langsung ke kalimat tempat tanda sitasi tersebut berada, disertai efek sorotan berkedip (*pulsing yellow highlight*).
- **Laci Detail yang Dapat Dilipat (*Foldable Details Drawer*)**:
  - Setiap baris memiliki tombol panah untuk membuka/menutup rincian teks sitasi lengkap, status rujukan terkunci (untuk paket Free), dan penggantian folder tanpa mengganggu kerapian daftar utama.
- **Verifikasi**:
  - TypeScript: 0 error (`npx tsc --noEmit`).
  - Vitest: 229 dari 229 unit test lolos 100%.

## ⚡ [v0.45.0] - 2026-10-22 (AI Literature Review Dual-Action Synthesis: One-Click Clipboard Copying & In-Text Canvas Insertion)

### 🎯 Pilihan Aksi Ganda pada AI Literature Review: Salin 1-Klik & Sisipkan ke Naskah
- **Penambahan Tombol Salin & Sisipkan Berdampingan (`components/editor/sidebar-library-tab.tsx`)**:
  - Menghadirkan baris tombol aksi ganda (*Copy* & *Insert to Doc*) pada kartu hasil sintesis tinjauan pustaka di tab *Citations & Library*.
  - Mengimplementasikan fungsi salin 1-klik (`handleCopySynthesis`) dengan feedback visual instan (`IconCopy` → `IconCheck`, teks "Copied" / "Tersalin").
  - Pengguna memiliki fleksibilitas penuh: dapat langsung menyisipkan hasil sintesis ke posisi kursor di naskah dokumen, atau menyalinnya ke clipboard untuk ditempelkan ke Bab 2, catatan riset, maupun slide presentasi.
- **Verifikasi**:
  - TypeScript: 0 error (`npx tsc --noEmit`).
  - Vitest: 229 dari 229 unit test lolos 100%.

## ⚡ [v0.44.9] - 2026-10-22 (Smart Abstract Section Insertion, One-Click Clipboard Copying & 1-Click Auto-Cite AI Best Match Injection)

### 🎯 Penyisipan Cerdas Abstrak di Awal Dokumen, Salin Clipboard 1-Klik & Auto-Cite Instan
- **Penyisipan Aman Abstrak di Awal Dokumen (`lib/editor/methods/block-methods.ts`, `lib/editor/editor-tools.ts`, `hooks/use-editor-ai.ts`, `components/editor/sidebar-writing-tab.tsx`)**:
  - Menerapkan metode `insertAbstractSection` pada EditorJS yang secara otomatis menempatkan abstrak di bagian paling awal naskah (tepat setelah blok Judul dokumen jika ada, atau memperbarui blok Abstrak yang sudah ada).
  - Menjamin bahwa penerapan abstrak **tidak akan pernah menimpa, membelah, atau merusak paragraf naskah yang sudah ada**.
  - Tombol aksi pada kartu hasil sidebar otomatis berganti menjadi **"Insert at Beginning" / "Sisipkan di Awal"** jika hasil yang dibuat adalah abstrak.
  - Menambahkan catatan tips bilingual yang menenangkan pengguna bahwa teks naskah lain tidak akan terganggu.
- **Tombol Salin ke Clipboard 1-Klik**:
  - Menambahkan tombol **Copy / Salin** pada kartu hasil dengan umpan balik visual instan (`IconCopy` → `IconCheck`, teks "Copied" / "Tersalin").
- **Auto-Cite (AI) 1-Click Auto-Insert**:
  - Menerapkan `autoInsertBestCitation`: pengguna cukup memblok teks klaim lalu klik "Auto-Cite (AI)", sistem langsung mencari kandidat dengan *match* tertinggi di Semantic Scholar / CrossRef dan langsung menyisipkannya ke naskah + daftar pustaka secara instan tanpa perlu memilih manual dari daftar.
- **Verifikasi**:
  - TypeScript: 0 error (`npx tsc --noEmit`).
  - Vitest: 229 dari 229 unit test lolos 100%.

## ⚡ [v0.44.8] - 2026-10-22 (Unified Find Citation Flow: In-Canvas Floating Search Popup & Tab Switching Removal)

### 🎯 Penyatuan Alur Cari Sitasi: Popup Mengambang di Canvas & Penghapusan Perpindahan Tab
- **Penyelarasan Aksi Cari Sitasi Sidebar dengan Klik Kanan (`components/editor/editor-layout.tsx`, `components/editor/editor-sidebar.tsx`)**:
  - Memperbaiki alur tombol **'Find Citation' / 'Cari Sitasi'** di sidebar penulisan yang sebelumnya berpindah secara paksa ke tab `library` (yang hanya berisi daftar daftar pustaka yang telah dimasukkan, bukan hasil pencarian sitasi).
  - Menghapus efek samping `setWorkspaceTab('library')` pada `EditorSidebar` agar pengguna tetap berada di workspace penulisan.
  - Menerapkan `handleFindCitationWithPopup` pada `EditorLayout`: saat tombol *Find Citation* diklik, sistem menghitung posisi teks terpilih dan langsung membuka **Popup Sitasi Mengambang (`CitationMenu`)** tepat di atas kalimat naskah—sama persis seperti saat mengeklik kanan teks.
  - Pengguna dapat melihat kandidat jurnal dari Semantic Scholar / CrossRef secara real-time dan langsung mengeklik *Insert Citation* ke dokumen.
- **Verifikasi**:
  - TypeScript: 0 error (`npx tsc --noEmit`).
  - Vitest: 229 dari 229 unit test lolos 100%.

## ⚡ [v0.44.7] - 2026-10-22 (Connected OpenRouter & Custom Provider Database Keys to AI Generation Routes & Added Model Selector)

### 🎯 Sinkronisasi API Key OpenRouter/Custom Provider dari Database & Selector Model di Sidebar
- **Perbaikan Rute Pembuatan AI (`/api/v1/ai/improve`, `abstract`, `synthesize`)**:
  - Memperbaiki bug di mana endpoint AI server hanya memeriksa `process.env.OPENROUTER_API_KEY` dan mengabaikan API Key yang telah disimpan oleh admin/pengguna di tabel `ai_providers` dan `ai_models`.
  - Memperbarui fungsi `callOpenRouter` agar menerima parameter `customApiKey` dinamis dari konfigurasi database.
  - Menggunakan `supabaseAdmin` di sisi server untuk melewati RLS agar data kunci API penyedia tidak diblokir secara diam-diam.
  - Menerapkan *cascading resolution*: prioritas Kunci Model Kustom → Kunci Provider Terpilih → Kunci Provider OpenRouter Global → Variabel Environment.
- **Penambahan Pemilih Model AI di Sidebar Penulisan (`components/editor/sidebar-writing-tab.tsx`)**:
  - Menambahkan dropdown **Model AI** aktif tepat di atas tombol alat penulisan, memungkinkan pengguna langsung memilih model OpenRouter mereka sebagai model utama tanpa harus menunggu failover dari Gemini.
- **Verifikasi**:
  - TypeScript: 0 error (`npx tsc --noEmit`).
  - Vitest: 229 dari 229 unit test lolos 100%.

## ⚡ [v0.44.6] - 2026-10-22 (Return to Dashboard Navigation from File Document Hub Modal)

### 🎯 Penambahan Tombol Kembali ke Dashboard pada Menu File (Document Hub)
- **Tombol Exit to Dashboard (`components/editor/modals/document-hub-modal.tsx`, `components/editor/editor-layout.tsx`)**:
  - Menambahkan tombol **'Exit to Dashboard' / 'Kembali ke Dashboard'** yang terletak tepat di bawah tombol `← Back to Manuscript` pada sidebar kiri modal menu File.
  - Menambahkan tombol cepat **'Dashboard' / 'Dasbor'** pada header bar kanan di samping tombol `Back to Editor`.
  - Mengarahkan aksi secara mulus ke `/dashboard` melalui callback `onExitToDashboard` dan `onSelectDocument('')`.
  - Tampilan profesional dengan ikon `IconLayoutDashboard`, dukungan Dark Mode lengkap, dan bilingual otomatis.
- **Verifikasi**:
  - TypeScript: 0 error (`npx tsc --noEmit`).
  - Vitest: 229 dari 229 unit test lolos 100%.

## ⚡ [v0.44.5] - 2026-10-22 (Writing Tools Tooltip Alignment & Native Tooltip Clashing Fix)

### 🎯 Penyesuaian Posisi Tooltip & Pembersihan Tooltip Ganda Bawaan Browser
- **Penyesuaian Posisi Tooltip Kolom Kiri & Kanan (`components/editor/sidebar-writing-tab.tsx`)**:
  - Memperbaiki bug pergeseran posisi tooltip yang sebelumnya terlalu ke pojok kanan karena kekeliruan sumbu translate.
  - Menerapkan penyesuaian kolom pintar `align="left"` (kolom 1) dan `align="right"` (kolom 2):
    - **Kolom Kiri**: Tooltip sejajar rapi dari tepi kiri tombol (`left-0 items-start`) dengan panah lancip di `ml-14` yang mengarah tepat ke tengah tombol tanpa menabrak batas kiri sidebar.
    - **Kolom Kanan**: Tooltip sejajar rapi dari tepi kanan tombol (`right-0 items-end`) dengan panah lancip di `mr-14` yang mengarah tepat ke tengah tombol tanpa menabrak batas kanan sidebar.
- **Pembersihan Tooltip Native Browser**:
  - Menghapus atribut `title={description}` bawaan HTML pada tombol, sehingga tidak ada lagi tooltip kotak putih ganda dari browser yang saling bertumpuk dengan custom tooltip.
- **Verifikasi**:
  - TypeScript: 0 error (`npx tsc --noEmit`).
  - Vitest: 229 dari 229 unit test lolos 100%.

## ⚡ [v0.44.4] - 2026-10-22 (Compact 2-Column Writing Tools Grid with Hover Tooltips and Tiered Free/Pro Access Gating)

### 🎯 Tampilan Grid 2 Kolom, Hover Tooltip & Gating Free/Pro pada Alat Penulisan
- **Grid 2 Kolom Kompak (`components/editor/sidebar-writing-tab.tsx`)**:
  - Mengubah tampilan tombol alat penulisan (writing tools) dari daftar vertikal memanjang menjadi layout grid 2 kolom (`grid grid-cols-2 gap-2`).
  - Menghemat ruang vertikal lebih dari 50%, sehingga card 'Hasil Perbaikan AI' (Improve result) langsung terlihat di layar tanpa perlu banyak scroll ke bawah.
- **Hover Tooltips untuk Penjelasan Fitur**:
  - Memindahkan teks deskripsi panjang menjadi tooltip mengambang (`absolute bottom-full left-1/2 -translate-y-1/2 mb-1.5`) yang muncul saat kursor diarahkan ke atas tombol (hover).
- **Pembagian Tier Free vs. Pro**:
  - Fitur Free: **Paraphrase** (Parafrase), **Summarize** (Ringkas), dan **Find Citation** (Cari Sitasi).
  - Fitur Pro: **Improve Academic Writing** (Tingkatkan Gaya Akademik), **Generate Abstract** (Buat Abstrak), dan **Auto-Suggest Citation (AI)** (Saran Sitasi AI).
  - Menampilkan badge `PRO` pada fitur berbayar untuk pengguna paket gratis; jika diklik akan langsung memicu modal perbandingan harga (`PricingModal`).
- **Verifikasi**:
  - TypeScript: 0 error (`npx tsc --noEmit`).
  - Vitest: 229 dari 229 unit test lolos 100%.

## ⚡ [v0.44.3] - 2026-10-22 (Rerouted Pro Upgrade Triggers from Admin Plan Creation to Pricing Plans Table Modal)

### 🎯 Perbaikan Routing Modal Upgrade ke List Harga (PricingModal)
- **Reroute Pemicu Upgrade Pro**:
  - Memperbaiki kekeliruan di mana tombol 'Upgrade to Pro' di `ParaphraseStudio`, 'Upgrade to Pro to Export Report' di `SidebarBurstinessTab`, dan fitur-fitur berbayar di `EditorSidebar` membuka modal admin `PlanModal` ("Tambah Paket Baru / Edit Detail Paket").
  - Menghubungkan `setIsPlanModalOpen` pada `EditorSidebar`, `EditorBubbleMenu`, dan `useGhostwriter` di `components/editor/editor-layout.tsx` langsung ke `setIsPricingOpen`.
  - Sekarang saat pengguna mengeklik tombol upgrade, yang muncul adalah **Daftar Paket Harga (`PricingModal`)** resmi (Free, Pro Writer, Campus), rincian fitur, dan tombol metode pembayaran (Xendit QRIS / Stripe / Midtrans).
- **Verifikasi**:
  - TypeScript: 0 error (`npx tsc --noEmit`).
  - Vitest: 229 dari 229 unit test lolos 100%.

## ⚡ [v0.44.2] - 2026-10-22 (Flagged Sentences Deep Loading into Paraphrase Studio with Smooth Scroll & Instant Generation)

### 🎯 Perbaikan Integrasi 'Load into Paraphrase Studio' pada Barometer Integritas
- **Perbaikan Unmount Dini Paraphrase Studio**:
  - Memperbaiki bug di mana `ParaphraseStudio` menghilang dari DOM (`return null`) saat seleksi kalimat menghasilkan `metrics.totalSentences === 0` selama proses debouncing 1000ms.
  - Memperbaiki guard condition menjadi `if (!content && !selectedSentence && !externalTargetSentence) return null;`.
- **Auto-Scroll Mulus, Visual Pulse & Auto-Generate**:
  - Menghubungkan klik kartu kalimat berisiko ke `#paraphrase-studio-card` dengan auto-scroll halus ke area Paraphrase Studio di sidebar bawah.
  - Memberikan indikator visual `Dimuat! Membuka Studio...` dengan ikon centang hijau selama 2.5 detik.
  - Memberikan efek highlight cincin indigo (`ring-2 ring-indigo-500/40`) pada Studio Parafrase dan memfokuskan textarea.
  - Otomatis memulai pembuatan 3 variasi ilmiah untuk akun Pro atau membuka dialog upgrade untuk akun Free.
- **Verifikasi**:
  - TypeScript: 0 error (`npx tsc --noEmit`).
  - Vitest: 229 dari 229 unit test lolos 100%.

## ⚡ [v0.44.1] - 2026-10-22 (Full-Screen Word Backstage Document Hub Modal Upgrade)

### 🎯 Peningkatan Tampilan Menu File (Full-Screen Word Backstage Hub)
- **Transformasi Layout Layar Penuh Leluasa (`components/editor/modals/document-hub-modal.tsx`)**:
  - Mengubah modal dokumen hub dari popup dialog sempit di tengah (`max-w-4xl`) menjadi antarmuka Backstage layar penuh (`fixed inset-0 z-[100] flex flex-col bg-slate-900/60 backdrop-blur-sm`), setara dengan pengalaman modal Riwayat Versi (History / Time Machine).
  - Header permanen atas dengan indikator jumlah dokumen, tombol `+ Dokumen Baru`, dan tombol kembali ke naskah aktif.
  - Pembagian 2 kolom lapang:
    - **Panel Samping Kiri**: Navigasi kategori (Semua Dokumen, Skripsi/Thesis, Dokumen Mandiri), daftar folder proyek bab skripsi, dan kartu status sinkronisasi cloud.
    - **Area Utama Kanan**: Kolom pencarian instan, filter urutan (Terakhir Diedit vs Judul A-Z), dan grid kartu naskah responsif (1 s/d 4 kolom).
- **Portaling DOM & Zero Logic Regression**:
  - Menggunakan `createPortal(..., document.body)` untuk isolasi z-index teratas.
  - Menjaga 100% logika dan fungsionalitas: pemilihan dokumen, pembuatan naskah baru, penghapusan dokumen dengan konfirmasi modal, dukungan Dark Mode, dan dwibahasa EN/ID.
- **Verifikasi**:
  - TypeScript: 0 error (`npx tsc --noEmit`).
  - Vitest: 229 dari 229 unit test lolos pada 27 berkas pengujian.

## ⚡ [v0.44.0] - 2026-10-21 (Reviewer #2 Pro Tier Gating & Visual Badge Indicator)

### 🎯 Eksklusivitas Akun Pro untuk AI Peer Reviewer (Reviewer #2)
- **Gating Fitur Reviewer #2 untuk Akun Pro ke Atas**:
  - Membatasi fitur AI Peer Reviewer khusus untuk pengguna tier Pro Writer dan Institusi/Kampus.
  - Intersepsi pada toolbar ribbon, shortcut `Ctrl+Shift+R`, dan Command Palette: jika pengguna berada di tier Free, sistem otomatis membuka modal upgrade paket (*pricing modal*).
- **Badge Visual `🔒 PRO` di Toolbar**:
  - Tombol Reviewer #2 menampilkan badge `🔒 PRO` yang elegan dan ramah dark mode bagi pengguna akun Free.
- **Verifikasi**:
  - TypeScript: 0 error. Seluruh 229 unit test Vitest lolos 100%.

## ⚡ [v0.43.9] - 2026-10-21 (Smart Document Language Detection & Reviewer #2 Language Override)

### 🎯 Deteksi Otomatis Bahasa Naskah & Pemilih Bahasa Reviewer #2
- **Deteksi Cerdas Bahasa Dokumen**:
  - Menyelesaikan skenario di mana antarmuka aplikasi disetel ke Bahasa Inggris (`en`), namun naskah yang diketik adalah naskah Bahasa Indonesia (skripsi/tesis).
  - Sistem secara cerdas mendeteksi kata-kata penanda naskah Indonesia (`penelitian`, `metode`, `hasil`, dsb.) dan otomatis mengarahkan telaah ke Bahasa Indonesia.
- **Dropdown Pemilih Bahasa di Modal Reviewer #2**:
  - Menambahkan dropdown bahasa ulasan (`🇮🇩 Bahasa Indonesia` / `🇬🇧 English`) langsung di samping pilihan Target Jurnal, memungkinkan pengguna berganti bahasa ulasan kapan saja dengan 1 klik.
- **Verifikasi**:
  - TypeScript: 0 error. Seluruh 229 unit test Vitest lolos 100%.

## ⚡ [v0.43.8] - 2026-10-21 (Real-Time Reactive Token Quota Deductions & Bilingual Reviewer #2 Localization)

### 🎯 Sinkronisasi Kuota Token Real-Time & Bahasa Hasil Reviewer #2
- **Pengurangan Token Otomatis Tanpa Perlu Refresh Halaman**:
  - API `/api/v1/ai/peer-review` kini mengembalikan `tokens_used`, `monthly_quota`, dan `tokens_remaining`.
  - Mengimplementasikan callback `onTokensUpdated` dan event bus `scholarflow:tokens-updated` sehingga badge kuota token di navbar langsung berkurang otomatis begitu proses audit selesai tanpa perlu memuat ulang halaman.
- **Hasil Reviewer #2 Sesuai Bahasa Aktif (Bilingual ID/EN)**:
  - Instruksi LLM dipertegas agar seluruh hasil telaah (ringkasan eksekutif, kelebihan/kelemahan rubrik, pertanyaan kritis, checklist) wajib diterbitkan 100% dalam Bahasa Indonesia ketika mode `id` aktif, meskipun draf naskah berbahasa Inggris.
  - Cache naskah di-isolasi berdasarkan bahasa aktif (`<docId>.<lang>`) agar cache bahasa Inggris lama tidak tertinggal saat pengguna memilih Bahasa Indonesia.
- **Verifikasi**:
  - TypeScript: 0 error. Seluruh 229 unit test Vitest lolos 100%.

## ⚡ [v0.43.7] - 2026-10-21 (LaTeX & Journal Package Pro Tier Gating & HTML Entity Clean Output)

### 🎯 Pro Tier Exclusivity & Clean LaTeX Escaping (`components/editor/editor-header-actions.tsx`, `components/editor/editor-layout.tsx`, `components/editor/modals/latex-export-modal.tsx`, `lib/editor/latex-exporter.ts`)
- **Eksklusivitas Akun Pro untuk Ekspor LaTeX & Jurnal**:
  - Fitur ekspor paket LaTeX (.tex + .bib zip) kini dikhususkan untuk akun Pro ke atas (selain Free tier).
  - Akun Free tier yang mengklik menu atau shortcut akan diarahkan ke modal upgrade Pro.
  - Untuk akun Pro ke atas, modal terbuka langsung dengan tombol unduh instan (.zip / .tex) siap pakai di Overleaf.
- **Pembersihan Entitas HTML pada LaTeX**:
  - Mengonversi `&amp;` menjadi `&` sebelum karakter LaTeX di-escape, sehingga sitasi/daftar pustaka `[Putri &amp; Kurniawati]` ter-render bersih menjadi `[Putri \& Kurniawati]`.
- **Verifikasi**:
  - Seluruh 229 unit test Vitest lolos (ditambah 2 unit test baru). TypeScript 0 error.

## ⚡ [v0.43.6] - 2026-10-21 (Dropdown Stacking Context & Overflow Fix: Notifications & Export Button Overlap Resolution)

### 🎯 Z-Index Hierarchy & Dropdown Overflow Isolation (`components/editor/editor-header.tsx`, `components/editor/editor-sidebar.tsx`, `components/editor/editorjs-toolbar.tsx`, `components/editor/editor-header-actions.tsx`)
- **Penyesuaian Stacking Context Z-Index ("Ketimpa")**:
  - `EditorHeader` (Navbar 1) dinaikkan dari `z-30` ke `z-40` agar dropdown Notifikasi selalu berada di atas bilah di bawahnya.
  - `EditorJsToolbar` (Navbar 2) dinaikkan dari `z-10` ke `z-30` agar menu popup Ekspor selalu berada di atas canvas dan sidebar.
  - `EditorSidebar` (Citations & Library) diselaraskan dari `z-40` ke `z-20` (sesuai standar sidebar canvas), sehingga tidak lagi menutupi / memotong dropdown Notifikasi dan Ekspor.
- **Perbaikan Overflow Dropdown Toolbar**:
  - Baris tools pada `EditorJsToolbar` diubah menjadi `overflow-visible` agar dropdown menu Ekspor tidak terpotong oleh clipping `overflow-y: auto`.
- **Optimalisasi Posisi Dropdown**:
  - Menu Ekspor diatur dengan `left-0` agar muncul tepat di bawah tombol Ekspor.
  - Popover Notifikasi diatur dengan `right-0 sm:-right-20 md:-right-24 max-w-[calc(100vw-2rem)]` agar pas dengan margin kanan dan tidak menutupi tombol Ekspor.
- **Verifikasi**:
  - TypeScript: 0 error. Vitest: 227/227 test lolos 100%.

## ⚡ [v0.43.5] - 2026-10-21 (Navbar Layout Optimization: Relocated Research Assistant, History & Reviewer to Ribbon Bar)

### 🎯 Navbar Layout Refinement & Ribbon Bar Integration (`components/editor/editorjs-toolbar.tsx`, `components/editor/editor-header.tsx`, `components/editor/editor-layout.tsx`)
- **Relocated Quick Action Buttons to Ribbon Tab Row (`components/editor/editorjs-toolbar.tsx`)**:
  - Moved **Research Assistant**, **Version History**, and **Reviewer #2** buttons from Navbar 1 to Navbar 2, positioning them neatly on the right side of the Ribbon Tab row.
  - Deleted the static placeholder text `• Ribbon Bar Active`.
- **Streamlined Document Header (`components/editor/editor-header.tsx`)**:
  - Cleaned up Navbar 1 to focus primarily on document identity, notifications, and subscription controls.
- **Verification**:
  - Full TypeScript validation (`npx tsc --noEmit`) passes with 0 errors. All 227 Vitest unit tests pass.

## ⚡ [v0.43.4] - 2026-10-21 (HTML Entity & Non-Breaking Space Normalization & Save Persistence)

### 🎯 Non-Breaking Space (`&nbsp;` / `\u00A0`) Normalization & Clean Block Persistence (`lib/utils/sanitize.ts`, `components/editor/editorjs-editor.tsx`, `lib/editor/editor-utils.tsx`, `lib/editor/burstiness-engine.ts`, `components/editor/academic-integrity-barometer.tsx`)
- **Stray Leading `&nbsp;` Stripping on Render & Save (`lib/utils/sanitize.ts`, `components/editor/editorjs-editor.tsx`)**:
  - Automatically purges accidental leading non-breaking spaces (`&nbsp;` or `\u00A0`) at block starts upon render (`sanitizeEditorContent`) and upon save (`cleanSavedContent`), fixing persistence across page refreshes.
- **HTML Entity Decoding in Text Analysis (`lib/editor/editor-utils.tsx`, `lib/editor/burstiness-engine.ts`)**:
  - Implemented `cleanBlockHtmlText`: decodes `&nbsp;`, `\u00A0`, `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;` into proper readable characters rather than raw entity strings.
- **Resilient Range Selection in Editor DOM (`components/editor/academic-integrity-barometer.tsx`)**:
  - Standardized `selectTextInElement` and `handleSentenceClick` with `\u00A0` normalization across DOM text nodes.
- **Verification**:
  - Added unit test in `__tests__/utils/sanitize.test.ts` and `__tests__/utils/academic-integrity.test.ts`. Full Vitest suite passes all 227 unit tests across 27 test files.

## ⚡ [v0.43.3] - 2026-10-21 (Paragraph & Heading Isolation in Academic Integrity & Flagged Sentences)

### 🎯 Hard Paragraph Boundaries & Heading Exclusion from AI Sentence Flagging (`lib/editor/burstiness-engine.ts`, `lib/editor/editor-utils.tsx`, `components/editor/sidebar-burstiness-tab.tsx`, `components/editor/academic-integrity-barometer.tsx`, `__tests__/utils/academic-integrity.test.ts`)
- **Strict Paragraph & Line Boundary Segmentation (`lib/editor/burstiness-engine.ts`)**:
  - Resolved issue where chapter headers (e.g., "BAB 1: PENDAHULUAN"), sub-section numbers ("1.1 Latar Belakang"), and the opening manuscript paragraph were concatenated into a single oversized sentence.
  - Implemented newline segmentation first (`.split(/\r?\n+/)`), ensuring each block/paragraph is processed as an isolated unit.
- **Section Heading Exclusion from AI Sentence Analysis (`lib/editor/editor-utils.tsx`, `components/editor/sidebar-burstiness-tab.tsx`)**:
  - Enhanced `extractTextFromContent` with `options?: { excludeHeaders?: boolean }` so structural titles are never flagged as AI prose or prompted for paraphrasing.
- **Accurate Canvas Sentence Targeting & DOM Range Selection (`components/editor/academic-integrity-barometer.tsx`)**:
  - Standardized whitespace normalization (`.replace(/\s+/g, ' ')`) in `handleSentenceClick` and `selectTextInElement`, ensuring clicked flagged sentences directly highlight and center the exact matching sentence on the canvas.
- **Automated Verification**:
  - Added 2 new unit tests in `__tests__/utils/academic-integrity.test.ts`. Full Vitest suite passes all 225 unit tests across 27 test files. Full TypeScript check passes with 0 errors.

## ⚡ [v0.43.2] - 2026-10-21 (Auto-Purge Leftover Bibliography on Version History Restore & Zero-Citation Canvas Load)

### 🎯 Zero-Citation Version Restore & Canvas Auto-Cleanup (`components/editor/editorjs-editor.tsx`, `lib/editor/methods/block-methods.ts`)
- **Version History Restore Auto-Purge (`lib/editor/methods/block-methods.ts`)**:
  - In `renderContent` (used by Version History restore and document switching), added an automated post-render check: if the restored revision contains 0 in-text citations (`cite[data-citation]`), any leftover "Daftar Pustaka" / "References" header, blurred list, and upgrade banner anchored at the bottom are automatically purged.
  - Utilizes `isProgrammaticSystemUpdateRef` to safely bypass deletion guards and calls `saveCleanContent().then(onContentChange)` to persist the cleaned document state immediately.
- **Initial Canvas Mount Auto-Cleanup (`components/editor/editorjs-editor.tsx`)**:
  - Reinforced `onReady` post-render hook in `EditorJsEditor`: if a document loaded with 0 citations has a leftover bibliography header in its bottom 4 blocks, it purges those blocks cleanly and updates live statistics.
  - Guaranteed citation safety: whenever in-text citations exist (> 0), the bibliography is completely preserved and dynamically generated from active references.
- **Verification**:
  - Full TypeScript validation (`npx tsc --noEmit`) passes with 0 errors.
  - Full Vitest suite passes all 223 unit tests across 27 test files.

## ⚡ [v0.43.1] - 2026-10-21 (Bottom-Anchored Bibliography Isolation Protecting Manuscript Body)

### 🎯 Bulletproof Manuscript Body Isolation & Safe Bibliography Operations (`lib/editor/methods/block-methods.ts`, `components/editor/editorjs-editor.tsx`)
- **Bottom-Anchored Boundary Guard (`lib/editor/methods/block-methods.ts`)**:
  - Replaced global block-index querying with `findBibliographyHeaderIndex`: strictly inspects backwards only the last 4 blocks of the document (`total - 1` down to `Math.max(0, total - 4)`).
  - Deletes only from `total - 1` down to `headerIdx`, ensuring that all preceding manuscript text, chapter headers, and introduction paragraphs are physically inaccessible to the bibliography lifecycle.
  - When `entries.length === 0`, checks if a bibliography header exists in the bottom 4 blocks: if none exists, zero blocks are deleted; if present, only bottom bibliography blocks are purged.
- **Targeted Deletion Guard Refinement (`components/editor/editorjs-editor.tsx`)**:
  - Refined `editor.blocks.delete` interception to verify actual heading elements (`h1..h6`, `.ce-header`) and specific bibliography styling classes, preventing any normal author paragraph from being flagged as a locked block.
- **Verification**:
  - Full TypeScript type check (`npx tsc --noEmit`) passes with 0 errors.
  - Full Vitest suite passes all 223 unit tests across 27 test files.

## ⚡ [v0.43.0] - 2026-10-21 (Zero-Citation Purge, Bilingual Bibliography Header & Academic Integrity Barometer Exclusion)

### 🎯 Zero-Citation Purge & Academic Integrity Isolation (`lib/editor/methods/block-methods.ts`, `components/editor/editorjs-editor.tsx`, `lib/editor/editor-utils.tsx`, `lib/editor/burstiness-engine.ts`, `lib/editor/academic-integrity.ts`, `hooks/use-editor-citation.ts`)
- **Reliable Zero-Citation Deletion via Programmatic Bypass (`components/editor/editorjs-editor.tsx`, `lib/editor/methods/block-methods.ts`)**:
  - Resolved regression where deleting all citations in a document left behind ghost "Daftar Pustaka / References" headers and blurred reference blocks.
  - Root cause: `editor.blocks.delete` user-guard blocked deletions when `isRenderingRef` was reset prematurely by asynchronous `onReady` timeouts.
  - Added dedicated `isProgrammaticSystemUpdateRef` to safely bypass user-deletion blocks during internal `upsertBibliography` operations.
  - Refactored bibliography block cleanup to query block models directly from `editorRef.current.blocks` and delete in descending index order (`[N, N-1, ...]`): prevents index-shifting errors and cleans up header, content, and banner cards in a single atomic pass.
- **Bilingual Bibliography Header (Daftar Pustaka ↔ References) (`lib/editor/editor-utils.tsx`, `hooks/use-editor-citation.ts`, `components/editor/scholar-editor.tsx`)**:
  - Dynamically renders header as **Daftar Pustaka** when active language is Indonesian (`id`) and **References** when English (`en`), reactively updating on language toggle.
  - Implemented `isBibliographyHeaderText` to recognize all variations across legacy and new formats.
- **Exclusion from Academic Integrity Barometer, Heatmap & AI Burstiness (`lib/editor/editor-utils.tsx`, `lib/editor/burstiness-engine.ts`, `lib/editor/academic-integrity.ts`, `components/editor/sidebar-burstiness-tab.tsx`)**:
  - Bibliography header, citations, and upgrade cards are strictly stripped from `extractTextFromContent`, `calculateBurstiness`, and `calculateAcademicIntegrity`.
  - Academic Integrity Barometer (`70% Originality`, AI-likeness, rhythm) and Canvas Heatmap analyze only author manuscript prose without reference list noise.
- **Verification**:
  - Full TypeScript type check (`npx tsc --noEmit`) passes with 0 errors.
  - Full Vitest suite passes all 223 unit tests across 27 test files.

## ⚡ [v0.42.9] - 2026-10-21 (Dynamic In-Text Citation Deletion & Real-Time Bibliography Synchronization)

### 🎯 Live DOM & Bibliography Synchronization Hardening (`hooks/use-editor-citation.ts`, `lib/editor/methods/block-methods.ts`, `components/editor/editorjs-editor.tsx`, `components/editor/scholar-editor.tsx`)
- **Reactive DOM Reference IDs & Set-Union Bug Resolution (`hooks/use-editor-citation.ts`)**:
  - Fixed issue where deleting in-text citations (`<cite>`) from document content did not remove them from the 'Citations & Library' sidebar tab or bottom bibliography list.
  - Root cause: `bibliographyEntries = useMemo(...)` computed unique IDs via `allUniqueIds = Array.from(new Set([...orderedIds, ...activeReferenceIds]))`. Because mathematical set union always retains elements from `orderedIds` (loaded from static document blocks), deleted citations could never be evicted.
  - Added `hasInitializedLiveStats` flag to `useEditorCitation`: once live stats initialize (`editorJsStats !== null`), reference IDs are strictly derived from live DOM elements (`activeReferenceIds`). If all citations are removed, the library and bibliography immediately clear reactively.
- **Empty Bibliography Cleanup & Persistence (`lib/editor/methods/block-methods.ts`, `lib/editor/editor-tools.ts`)**:
  - Updated `upsertBibliography`: when all citations are deleted (`entries.length === 0`), all existing bibliography blocks (header, content, and premium lock cards) are deleted from the Editor.js canvas.
  - Dispatches `saveCleanContent().then(onContentChange)` to persist the cleared state to database/storage, and safely restores caret position.
  - Standardized `upsertBibliography` return types to `Promise<boolean>`, ensuring `lastUpsertedBibliographyKeyRef` properly flags success and prevents loop retries.
- **Ghost Citation Pruning & Real-Time Typing/Cut Listeners (`components/editor/editorjs-editor.tsx`)**:
  - Enhanced `calculateLiveStats()` to remove empty/ghost `<cite data-citation="true">` elements that can linger in `contenteditable` when users backspace citation tags.
  - Added `onInput` and `onCut` event listeners to the editor canvas wrapper to immediately trigger live stats recalculation whenever users delete, cut, or backspace citations.
- **Automated Verification**:
  - Full TypeScript validation (`npx tsc --noEmit`) passes with 0 errors.
  - Full Vitest suite passes all 222 unit tests across 27 test files.

## ⚡ [v0.42.8] - 2026-10-21 (Right-Click Context Menu & Bubble Menu Citation Search Synchronization)

### 🎯 Citation Search Query State Synchronization & Context Menu Hardening (`components/editor/scholar-editor.tsx`, `hooks/use-editor-citation.ts`, `hooks/use-editor-ai.ts`, `components/editor/bubble-menu/format-menu.tsx`, `components/editor/bubble-menu/citation-menu.tsx`, `components/editor/editor-layout.tsx`)
- **Direct Selection State Linking (`scholar-editor.tsx`, `use-editor-citation.ts`, `use-editor-ai.ts`)**:
  - Resolved regression where highlighting text and clicking 'Cari Kutipan / Sitasi' (Find Citations) from right-click context menu or floating bubble menu resulted in premature 'No citations found'.
  - Identified root cause: `useEditorCitation` was previously passed an empty string `''` placeholder (`// selectedText will be passed as empty initially`), causing `runCitationSearch` to immediately exit on `if (!selectedText.trim()) return;` without querying the OpenAlex/Crossref API.
  - Lifted and bound `selectedText` / `setSelectedText` state in `ScholarEditor`, sharing it simultaneously across `useEditorCitation` and `useEditorAi`.
- **Multi-Source Query Fallback Engine (`use-editor-citation.ts`, `format-menu.tsx`)**:
  - Upgraded `runCitationSearch` to accept an explicit `customQuery?: string` with robust 3-stage fallback: explicit query -> `selectedText` state -> DOM `window.getSelection()?.toString()`.
  - Updated `FormatMenu` button click to immediately extract and pass the active selection query to `onFindCitation(query)`.
- **Right-Click Context Menu Event Dispatch Guard (`editor-layout.tsx`)**:
  - Added immediate `onSelectionChange?.(text)` dispatch in `onContextMenu` when user right-clicks selected text, ensuring state is synchronized before opening the popup.
- **Dark Mode & Bilingual Polish on Citation Results Modal (`citation-menu.tsx`)**:
  - Integrated `useLanguage()` with dynamic English/Indonesian labels for loading, error, and empty result banners.
  - Added full Tailwind `dark:` variants across article cards, header, and buttons.
- **Automated Unit Testing (`__tests__/utils/editor-interaction-hardening.test.ts`)**:
  - Added unit test validating multi-stage query resolution with fallback to window selection.
  - All 222 unit tests passing with 0 errors across 27 test files.


### 🔄 Refactoring `components/editor/editor-layout.tsx`
*Status: Dalam pengerjaan (In Progress)*

**Perubahan yang telah dilakukan:**
- **Phase 36 (v0.43.0)**: Migrasi tata letak halaman editor utama ke **Modern Microsoft Word Ribbon Toolbar & Physical A4 Canvas** (`components/editor/editorjs-toolbar.tsx`, `components/editor/editor-header.tsx`, `components/editor/editor-layout.tsx`, `components/editor/minimal-sidebar.tsx`, `components/editor/sentence-rhythm-explorer.tsx`, `components/editor/modals/document-hub-modal.tsx`, `hooks/use-editor-layout-logic.ts`, `app/globals.css`) dengan Header & Ribbon Toolbar layar penuh (100% width) di paling atas, sidebar kiri berada tepat di bawah pita toolbar di dalam ruang kerja (sehingga membuka/menutup sidebar tidak menggeser navbar atas), Menu 'File' beraksen biru khas Microsoft Word di ribbon yang membuka Document Hub Modal skala besar (search, filter thesis vs independent docs, sorting, +New), 4 Tab Ribbon intuitif (Beranda, Sisipkan, Referensi, Tinjauan & AI), Header 2 tingkat dengan ikon Word [W], kanvas lembar fisik kertas A4 auto-grow (`items-start` + `h-auto self-start min-h-[1050px]`) yang membungkus gambar dan paragraf tanpa terpotong, bilah kontrol bawah (Admin/Language/Dark/Profile) disembunyikan saat dalam editor naskah agar sidebar bersih sesuai `mockup-editor-concepts.html`, Sentence Rhythm Explorer dengan pills filter auto row-wrap (`flex-wrap`) tanpa scrollbar horizontal, Cadence Ribbon interaktif klik-untuk-lompat ke kalimat di kanvas, Bilah Status Bawah permanen (Word Count, Char Count, Page, Skala 100%), dan Dark Mode 100% kompatibel tanpa regresi logika atau event handlers.
- **Phase 37 (v0.43.1)**: Sinkronisasi dwibahasa penuh (Bilingual EN <-> ID) & Dark Mode pada tab **AI Rhythm & Burstiness** (`components/editor/sidebar-burstiness-tab.tsx`, `components/editor/burstiness-chart.tsx`, `components/editor/academic-integrity-barometer.tsx`, `components/editor/editor-sidebar.tsx`). Menghubungkan komponen langsung ke `useLanguage()` reaktif, memastikan judul `AI Burstiness Score` <-> `Skor Burstiness AI`, sakelar `Entire Doc` <-> `Semua Dokumen`, teks panduan dan empty state beralih secara instan dan konsisten dengan dukungan Dark Mode penuh (`dark:bg-slate-800`, `dark:text-slate-200`, `dark:border-slate-700`).
- **Phase 38 (v0.43.2)**: Integrasi status autosave cloud dinamis di bawah judul naskah & migrasi indikator status bar bawah ala Microsoft Word (`hooks/use-editor-document.ts`, `components/editor/editor-header.tsx`, `components/editor/editor-layout.tsx`, `components/editor/editorjs-toolbar.tsx`, `components/editor/ghostwriter-toggle.tsx`). Menggantikan teks statis placeholder di bawah judul dengan status autosave asli (`statusLabel`: instan `Menyimpan...` / `Saving...` dengan spinner amber pada ketukan tombol, jeda debounce 3.000 ms yang dioptimalkan untuk kuota I/O Supabase Free Tier, transisi halus `Tersimpan` / `Saved` lalu `Tersimpan ke Cloud` / `Saved to Cloud`, dan pembaruan timestamp waktu simpan `updated_at` secara reaktif di React state tanpa perlu refresh browser), menghapus cluster kanan yang padat dari pita ribbon toolbar, serta memindahkan **Ghostwriter AI Assistant Toggle** dan **Pill Integritas Akademik (70% Orisinalitas)** ke bilah status footer bawah tepat di samping indikator `100% Zoom`.
- **Phase 39 (v0.43.3)**: Relokasi kapsul tombol aksi cepat dari navbar atas ke pojok kanan bilah alat Ribbon (`components/editor/editor-header-actions.tsx`, `components/editor/editorjs-toolbar.tsx`, `components/editor/editor-header.tsx`, `components/editor/editor-layout.tsx`).
- **Phase 40 (v0.43.4)**: Penyempurnaan pembagian tombol aksi: memindahkan **HANYA 4 tombol spesifik** ke pojok kanan bilah alat Ribbon (`components/editor/editor-header-actions.tsx`) yaitu **Export**, **Share**, **49.2k** (Token Quota), dan **Pengaturan ⚙️** (Icon Gerigi) sejajar dengan kontrol paragraf (Left, Center, Right, Justify), sementara tombol-tombol lainnya (**Notifikasi 🔔**, **Langganan/Pricing 💳**, **Asisten Riset 📖**, **Riwayat Versi 🕒**, **Reviewer #2 🔬**, **Pintasan Keyboard ⌨️**, dan **Avatar Co-Editors**) tetap dipertahankan rapi di header atas (`components/editor/editor-header.tsx`).
- Menyiapkan kerangka file baru untuk memecah `editor-layout.tsx` (yang awalnya memiliki 3.576 baris kode).
- Membuat file `components/editor/editor-header.tsx` (belum diintegrasikan penuh).
- Membuat file `components/editor/editor-switch.tsx` (belum diintegrasikan penuh).
- Membuat file `components/editor/editorjs-toolbar.tsx` (belum diintegrasikan penuh).
- Membuat file `components/editor/katex-preview.tsx` (belum diintegrasikan penuh).
- Membuat direktori `components/editor/modals/` untuk memecah komponen modal portal.

**Perubahan terbaru:**
- components/editor/editor-sidebar.tsx: Mengekstrak 4 sub-panel (Library, Writing, Document, Comments) ke komponen modular terpisah, memangkas ukuran dari 1.446 baris menjadi ~661 baris.
- components/editor/editorjs-editor.tsx: Mengekstrak Custom EditorJS Tools dan helpers (~280 baris) ke lib/editor/editor-tools.ts.
- components/editor/scholar-editor.tsx: Mengekstrak ~150 baris fungsi utilitas murni ke lib/editor/editor-utils.tsx.
- pp/shared/[id]/page.tsx: Mengekstrak SharedSidebar dan SharedBubbleMenu ke komponen modular, mengurangi ukuran file dari 3.189 baris menjadi ~2.260 baris.
- Mengganti SuggestionModal yang duplikat dengan impor komponen yang sudah ada.
- Membuat hooks/use-shared-document-sync.ts sebagai fondasi untuk memisahkan logika sinkronisasi realtime.
- Mengekstrak **Dashboard View & Admin Panel** (>1.100 baris kode) ke dalam components/editor/dashboard-view.tsx.
- Menggantikan kode dashboard di dalam ditor-layout.tsx dengan komponen <DashboardView />.
- Memastikan semua _props_ dikirimkan dengan benar tanpa merusak fungsionalitas.
- Mengekstrak **AI History Modal** ke dalam `components/editor/modals/ai-history-modal.tsx`, memangkas ukuran `components/editor/editor-sidebar.tsx` dari 756 baris menjadi 571 baris kode.
- **Phase 23 (v0.9.9)**: Mengembangkan asisten interaktif **Chat with Paper / Literature Q&A** (`components/editor/modals/paper-chat-modal.tsx`, `app/api/v1/ai/paper-chat/route.ts`, `lib/ai/paper-chat.ts`) dengan quick question pills akademis, ekstraksi metodologi/sampel/temuan/batasan, jembatan 1-klik kutip jawaban ke editor dengan tag `<cite>`, dan tabel sinkronisasi cloud `paper_conversations` (`supabase/migrations/20261016000002_create_paper_conversations.sql`).
- **Phase 24 (v1.0.0)**: Membangun **Plagiarism & AI-Likeness Real-Time Warning Barometer (Academic Integrity Index)** (`lib/editor/academic-integrity.ts`, `components/editor/academic-integrity-barometer.tsx`, `components/editor/academic-integrity-pill.tsx`) dengan visualisasi speedometer SVG real-time, 4 sub-gauge metrik (Burstiness CV, Lexical Diversity TTR, Densitas Klise AI, Cadence Balance), penyorot kanvas heatmap interaktif, dan navigasi 1-klik ke Paraphrase Studio untuk humanisasi kalimat.
- **Phase 25 (v1.0.1)**: Mengimplementasikan **AI Peer Reviewer & Journal Readiness Audit Simulation (Reviewer #2 Simulator)** (`lib/editor/peer-reviewer.ts`, `app/api/v1/ai/peer-review/route.ts`, `components/editor/modals/peer-review-modal.tsx`) dengan persona Reviewer #2 hyper-kritis, target reputasi jurnal (Scopus Q1/Q2, SINTA 1/2), 4 kartu rubrik evaluasi saintifik mendalam, pertanyaan pembelaan kritis (Critical Inquiries), checklist kesiapan submisi, tombol akses cepat di `editor-header.tsx`, dan kartu peluncur di tab Dokumen sidebar.
- **Phase 26 (v1.1.0)**: Menghadirkan **Academic Command Palette (Ctrl+K) & Global Keyboard Shortcuts Hub** (`lib/editor/command-palette.ts`, `components/editor/modals/command-palette-modal.tsx`, `components/editor/modals/shortcuts-modal.tsx`) dengan pencarian spotlight cepat, 7 kategori aksi terorganisir, drawer tooltip penjelasan manfaat aksi real-time, cheat sheet visual pintasan keyboard (tombol `?`), tombol akses cepat di header, dan navigasi keyboard penuh.
- **Phase 27 (v1.2.0)**: Membangun **Academic LaTeX & Journal Format Package Exporter (.tex + .bib Zip)** (`lib/editor/latex-exporter.ts`, `components/editor/modals/latex-export-modal.tsx`) dengan konversi blok naskah ke sintaks LaTeX standar, 4 template jurnal ilmiah (IEEE 2-Column, Elsevier elsarticle, ACM SIGCONF, arXiv Pre-print), bundler BibTeX otomatis, live code preview, tombol salin kode, dan pengemasan arsip .zip siap kompilasi Overleaf via JSZip.
- **Phase 28 (v1.3.0)**: Mengembangkan **Drag & Drop Reference Importer (.bib, .ris, & PDF metadata)** (`lib/editor/reference-importer.ts`, `components/editor/reference-dropzone.tsx`, `components/editor/modals/reference-import-modal.tsx`) dengan dukungan ekstraksi file BibTeX Zotero/Overleaf, multi-record RIS Mendeley/EndNote, ekstraksi DOI saintifik & judul dari dokumen PDF, modal pratinjau seleksi batch paper dengan tooltip informatif, tombol "Impor Berkas" langsung di tab Pustaka sidebar, serta pintasan keyboard `Ctrl+Shift+U` dan Command Palette.

- **Phase 29 (v1.4.0)**: Menghadirkan **Live "Track Changes" / Suggesting Mode** (components/editor/suggesting-mode.tsx, components/editor/suggesting-chips.tsx, lib/editor/suggesting-engine.ts, lib/editor/methods/suggestion-methods.ts) dengan toggle mode segmented (Editing vs Suggesting), markup coretan merah <del> dan garis bawah hijau <ins>, sanitasi atribut preservasi XSS, floating chips tinjauan usulan, dropdown review batch "Terima Semua" / "Tolak Semua", serta pendaftaran aksi pintasan keyboard Ctrl+Shift+S.

- **Phase 30 (v1.5.0)**: Mengembangkan **Figure & Table Scientific Auto-Numbering Engine** (lib/editor/cross-reference.ts, lib/editor/methods/cross-reference-methods.ts, components/editor/modals/cross-reference-modal.tsx) dengan pengindeksan sekuensial otomatis Gambar & Tabel, pembaruan reaktif rujukan silang di badan teks saat posisi blok berpindah, pemetaan shorthand syntax (@fig, @tab), modal dialog pemilih rujukan, interaksi klik lompat *smooth scroll* dengan sorotan cincin animasi, dan pintasan Ctrl+Shift+B.

**Selanjutnya:**
- Mengimplementasikan pemindahan logika dan komponen React dari `editor-layout.tsx` ke file-file tersebut.
- Menyambungkan (import) komponen yang diekstrak kembali ke `editor-layout.tsx` tanpa merusak *state* atau menghapus fungsionalitas aslinya.


- **Phase 31 (v0.31.0)**: Mengembangkan **Academic Thesis/Paper Outline & Structure Generator** (`lib/editor/academic-templates.ts`, `app/api/v1/ai/generate-outline/route.ts`, `lib/editor/methods/outline-scaffold.ts`, `components/editor/modals/academic-scaffold-modal.tsx`) dengan 4 preset struktur ilmiah standar (IMRaD Scopus/WoS, 5 Bab Skripsi Dikti, PRISMA 2020 SLR, Studi Kasus), takarir panduan penulisan per sub-bab, checklist metodologi, endpoint AI personalisasi outline berbasis judul/metode riset, konversi blok EditorJS cerdas, modal interaktif dwibahasa & dark mode, serta pintasan keyboard `Ctrl + Shift + O`.

- **Phase 32 (v0.32.0)**: Mengembangkan **Smart In-Text Reference Mention (`@cite` / `@ref`) & Quick Citation Injector** (`lib/editor/mention-parser.ts`, `lib/editor/reference-search-index.ts`, `components/editor/citation-mention-dropdown.tsx`, `lib/editor/methods/mention-injector.ts`, `hooks/use-citation-mention.ts`) dengan pendeteksi token mention aktif di kursor, kalkulator koordinat kursor `getBoundingClientRect()`, pengindeks pustaka lokal berkecepatan tinggi multi-field dengan fallback pencarian awan Crossref/OpenAlex, popover dropdown mengambang berorientasi keyboard (`↑`, `↓`, `Enter`, `Esc`), injeksi tag `<cite>` non-destruktif ke EditorJS, dark mode & bilingual EN/ID, serta dokumentasi pintasan di modal shortcut (13 unit test baru, total 164/164 lulus).

- **Phase 33 (v0.33.0)**: Mengembangkan **Multi-Chapter Thesis & Dissertation Project Binder** (`lib/editor/project-binder.ts`, `components/editor/modals/project-binder-modal.tsx`, `components/editor/sidebar-document-tab.tsx`) dengan engine pengikat naskah multi-bab (Bab 1 s.d. Bab 5), penomoran berkesinambungan gambar & tabel lintas-bab (`Gambar {Bab}.{Nomor}`, `Tabel {Bab}.{Nomor}`), konsolidasi Master Bibliography dari seluruh bab dengan pelacak bab rujukan, modal interaktif 4 tab dengan ekspor berkas .bib dan salin naskah utuh Markdown, kartu binder di sidebar, perintah `cmd_project_binder`, serta pintasan keyboard `Ctrl + Shift + M` (11 unit test baru, total 175/175 lulus).

- **Phase 34 (v0.34.0)**: Mengembangkan **Academic Grammar & Style Linter (Automated Tone & Style Auditor)** (`lib/editor/academic-linter.ts`, `components/editor/modals/academic-linter-modal.tsx`, `components/editor/sidebar-document-tab.tsx`, `components/editor/editor-layout.tsx`, `lib/editor/command-palette.ts`, `components/editor/modals/shortcuts-modal.tsx`) dengan kamus aturan saintifik dwibahasa (EN & ID) untuk mendeteksi kata informal/kolokial, kontraksi bahasa Inggris, klausa asumsi berlebihan (*sweeping assumptions*), dan bias orang pertama (*first-person bias*). Dilengkapi dengan kalkulasi skor gaya akademis (Grade A-D), filter kategori interaktif, penggantian 1-klik (*one-click fix*), kartu peluncur di tab Dokumen sidebar, perintah Command Palette `cmd_academic_linter`, serta pintasan keyboard `Ctrl + Shift + L` (9 unit test baru, total 184/184 lulus).

- **Phase 35 (v0.35.0)**: Mengembangkan **Conference & Thesis Defense Slide Deck Generator** (`lib/editor/slide-deck-generator.ts`, `components/editor/modals/slide-deck-modal.tsx`, `components/editor/sidebar-document-tab.tsx`, `components/editor/editor-layout.tsx`, `lib/editor/command-palette.ts`, `components/editor/modals/shortcuts-modal.tsx`) dengan generator naskah ke 9 slide baku sidang/konferensi (rasio 16:9), stage carousel slide interaktif, drawer catatan narasi pembicara (*Speaker Notes*), 3 tema visual (Modern Academic, Classic Navy, Minimal Emerald), ekspor Marp Markdown, serta berkas penampil presentasi HTML mandiri (*offline standalone deck*), kartu peluncur di sidebar, perintah `cmd_slide_deck`, dan pintasan keyboard `Ctrl + Shift + E` (5 unit test baru, total 189/189 lulus).

- **Phase 36 (v0.36.0)**: Mengembangkan **Interactive Literature Matrix & Synthesis Grid** (`lib/editor/literature-matrix.ts`, `components/editor/modals/literature-matrix-modal.tsx`, `components/editor/sidebar-document-tab.tsx`, `components/editor/editor-layout.tsx`, `lib/editor/command-palette.ts`, `components/editor/modals/shortcuts-modal.tsx`) dengan engine ekstraksi otomatis kolom matriks tinjauan pustaka (Studi/Sitasi, Metodologi, Sampel, Temuan Kunci, Batasan, Catatan Sintesis Bab 2), inferensi heuristik abstrak riset, pengeditan sel interaktif (*inline editing*), filter pencarian & kategori metodologi (SLR, Kuantitatif, Kualitatif, Machine Learning), aksi 1-klik salin tabel Markdown, unduh CSV (RFC 4180), dan injeksi langsung ke kanvas EditorJS, kartu peluncur di sidebar, perintah `cmd_literature_matrix`, serta pintasan keyboard `Ctrl + Shift + T` (7 unit test baru, total 196/196 lulus).

- **Phase 37 (v0.37.0)**: Mengembangkan **Journal Formatting & Publishing Presets Configurator** (`lib/editor/journal-presets.ts`, `components/editor/modals/journal-presets-modal.tsx`, `components/editor/sidebar-document-tab.tsx`, `components/editor/editor-layout.tsx`, `lib/editor/command-palette.ts`, `components/editor/modals/shortcuts-modal.tsx`) dengan basis data pedoman penerbit ilmiah otoritatif (IEEE Transactions, Elsevier, Springer Nature, SINTA 1 & 2 Dikti, PLOS ONE), mesin audit kesiapan naskah otomatis (batas kata total, batas panjang abstrak, kuota visual gambar/tabel, persentase kemutakhiran rujukan < 5 tahun, dan kesesuaian gaya sitasi), modal scorecard dengan predikat visual, tombol alih gaya sitasi 1-klik, kartu peluncur di sidebar, perintah `cmd_journal_presets`, serta pintasan keyboard `Ctrl + Shift + J` (5 unit test baru, total 201/201 lulus).

- **Phase 38 (v0.38.0)**: Mengembangkan **Cross-Paper Concept Map & Citation Network Visualizer** (`lib/editor/concept-map.ts`, `components/editor/modals/concept-map-modal.tsx`, `components/editor/sidebar-document-tab.tsx`, `components/editor/editor-layout.tsx`, `lib/editor/command-palette.ts`, `components/editor/modals/shortcuts-modal.tsx`) dengan ekstraksi kata kunci konsep multi-bahasa bebas stopword, klasifikasi 5 kluster tematik ilmiah, penentuan nodus sentral (*degree centrality*) dan densitas graf, kanvas SVG interaktif dengan sorotan cincin animasi (*pulse ring*) pada paper sentral, penyorotan tetangga (*neighbor highlighting*) saat hover/klik, drawer laci inspeksi detail sitasi lengkap dengan tautan DOI, filter pil kluster, ekspor diagram Mermaid, kartu peluncur di sidebar, perintah `cmd_concept_map`, serta pintasan keyboard `Ctrl + Shift + N` (5 unit test baru, total 206/206 lulus across 24 test files).

- **Phase 39 (v0.39.0)**: Mengembangkan **Automated Journal Submission Package Builder & Cover Letter AI** (`lib/editor/submission-package.ts`, `components/editor/modals/submission-package-modal.tsx`, `components/editor/sidebar-document-tab.tsx`, `components/editor/editor-layout.tsx`, `lib/editor/command-palette.ts`, `components/editor/modals/shortcuts-modal.tsx`) dengan mesin penyusun surat pengantar resmi ke Editor-in-Chief, perumusan kebaruan riset & keselarasan ruang lingkup jurnal, formulator rekomendasi mitra bestari (*Suggested Peer Reviewers*) independen dari daftar pustaka sitasi, pembuat poin kebaruan (*Research Highlights* ≤ 85 karakter) standar Elsevier / IEEE, deklarasi etika bebas konflik kepentingan (*Conflict of Interest*), sumber pendanaan hibah, ketersediaan data riset, modal interaktif 2-kolom, ekspor paket lengkap Markdown, unduh berkas .txt/.md, kartu peluncur di sidebar, perintah `cmd_submission_package`, serta pintasan keyboard `Ctrl + Shift + Y` (5 unit test baru, total 211/211 lulus across 25 test files).

- **Phase 40 (v0.40.0)**: Mengembangkan **Canvas & Document Editor Interaction Hardening & Data Flow Reliability** (`components/editor/editor-layout.tsx`, `hooks/use-citation-mention.ts`, `lib/editor/methods/citation-methods.ts`, `lib/editor/methods/block-methods.ts`, `__tests__/utils/editor-interaction-hardening.test.ts`) dengan perbaikan audit 5 titik kegagalan interaksi kanvas naskah:
  - **Sinkronisasi Mention Sitasi (`@cite` / `@ref` / `@`)**: Memperbaiki ketidaksesuaian ID container DOM dari `'scholarflow-editor'` menjadi `'editorjs-holder'` pada `useCitationMention` dan `editor-layout.tsx` serta menambahkan fallback hirarkis dinamis sehingga overlay pemilihan rujukan langsung muncul saat mengetik simbol mention.
  - **Jembatan Injeksi Tabel Literature Matrix**: Memperbaiki `onInjectTableToEditor` pada `editor-layout.tsx` agar memanggil `insertBlocks` resmi via `editorJsRef.current` (bukan mengakses objek privat `blocks` yang undefined), sehingga tabel sintesis matriks pustaka langsung terpasang di kanvas dan tersimpan otomatis.
  - **Auto-Save & Persistensi Outline Academic Scaffold**: Menghubungkan pemanggilan eksplisit `onContentChange` saat naskah struktur/outline baru diinjeksikan dari `AcademicScaffoldModal` agar draft tidak hilang saat browser direfresh.
  - **Target DOM & Auto-Save Academic Linter**: Mengarahkan selektor DOM penggantian kata formal ke `#editorjs-holder` dan menyambungkan `saveCleanContent().then(onContentChange)` agar perbaikan linter langsung terarsip di cloud/database.
  - **Fallback Cerdas Penyisipan Sitasi**: Memperkuat `insertCitation` pada `citation-methods.ts` sehingga jika pengguna mengklik "Insert Citation" dari sidebar pustaka tanpa menyeleksi teks terlebih dahulu, rujukan otomatis disisipkan di akhir paragraf aktif atau blok terakhir tanpa *silent failure*.
  - Menghitung ulang statistik kata/karakter/sitasi secara live (`calculateLiveStats`) saat kanvas di-render ulang.
  - Menambahkan pengujian otomatis Vitest (`__tests__/utils/editor-interaction-hardening.test.ts`) dengan kelulusan penuh **214/214 tests across 26 test files**.

- **Phase 41 (v0.41.0)**: Mengembangkan **Editor Canvas Lifecycle, Block Persistence & Rich Content Bridge** (`lib/editor/methods/block-methods.ts`, `hooks/use-editor-document.ts`, `hooks/use-version-history.ts`, `components/editor/scholar-editor.tsx`, `lib/editor/methods/inline-methods.ts`, `lib/editor/methods/suggestion-methods.ts`, `lib/editor/methods/cross-reference-methods.ts`, `__tests__/utils/editor-lifecycle-hardening.test.ts`) dengan perbaikan 5 kelemahan logika interaksi & persistensi:
  - **Kompabilitas Metode `render` & `renderContent`**: Menyediakan method alias `render` pada `buildBlockMethods` dan menyelaraskan pemanggilan di `use-editor-document.ts` serta `use-version-history.ts` agar penggantian format sitasi (APA ↔ IEEE ↔ Vancouver) dan pemulihan snapshot versi langsung me-render kanvas secara real-time.
  - **Jembatan Teks AI History Studio**: Memperbarui `handleInsertSynthesizedText` di `scholar-editor.tsx` agar menerima parameter `customText`, sehingga tombol "Apply to Canvas" di modal riwayat AI Studio berhasil menyisipkan draf pilihan.
  - **Injeksi HTML Kontekstual Utuh (`insertHtmlAtCursor`)**: Memperkuat `insertHtmlAtCursor` dengan pemulihan rentang kursor aktif (`targetRange`), penyisipan via `createContextualFragment(html)` tanpa memangkas tag `<cite>`, dispatch event `input`, dan auto-save ke `onContentChange`.
  - **Auto-Save Persistensi Blok Toolbar & Menu**: Menyambungkan `saveCleanContent().then(onContentChange)` pada seluruh aksi penyisipan blok di `block-methods.ts` (`insertImage`, `insertTable`, `insertCodeBlock`, `insertMathBlock`, `insertBibliographyText`, dan `setBlockType`).
  - **Penggantian Teks Sugesti Tanpa Duplikasi**: Memperbaiki `addSuggestionMark` di `suggestion-methods.ts` agar menggantikan `oldText` dengan markup usulan alih-alih menduplikasi teks, serta menambahkan dispatching event `input` pada seluruh aksi tinjauan usulan.
  - Menambahkan pengujian otomatis Vitest (`__tests__/utils/editor-lifecycle-hardening.test.ts`) dengan kelulusan penuh **218/218 tests across 27 test files**.

- **Phase 42 (v0.42.0)**: Mengembangkan **Latent Compilation, Icon Import, API Key Pool & Scoping Resilience Audit** (`components/editor/modals/academic-linter-modal.tsx`, `components/editor/sidebar-document-tab.tsx`, `components/editor/modals/concept-map-modal.tsx`, `components/editor/modals/literature-matrix-modal.tsx`, `components/editor/paraphrase-studio.tsx`, `components/editor/editor-layout.tsx`, `components/auth/auth-provider.tsx`, `lib/editor/literature-matrix.ts`, `app/api/v1/ai/interpret-stats/route.ts`, `app/api/v1/ai/paper-chat/route.ts`, `app/api/v1/ai/peer-review/route.ts`, `app/api/v1/ai/generate-outline/route.ts`, `__tests__/utils/concept-map.test.ts`, `__tests__/utils/editor-interaction-hardening.test.ts`, `__tests__/utils/citation-transformer.test.ts`):
  - **Koreksi Impor Ikon Tabler**: Memperbaiki `IconSpellCheck` menjadi `IconTextSpellcheck` dan `IconBookOpen` menjadi `IconBook` yang sempat memicu error kompilasi Next.js.
  - **Destrukturisasi & Fallback State Props**: Mendestrukturkan `externalTargetSentence` pada `ParaphraseStudio` serta menambahkan fallback aman `latestResult.monthly_quota || 0`.
  - **Penambahan Atribut Institusi pada `UserProfile`**: Menambahkan kolom `institution?: string | null` pada `UserProfile` (`components/auth/auth-provider.tsx`) untuk modal slide-deck dan submission package.
  - **Ketahanan Modals & Layout Editor**: Mengganti `currentUser?.id` menjadi `user?.id`, menyelaraskan tipe alert dari `'danger'` menjadi `'error'`, meneruskan bahasa langsung pada `setLanguage`, serta memperbarui prop `PeerReviewModal` (`userId`, `userPlan`).
  - **Audit Rute API AI Key Pool & Logging**: Mengangkat scope variabel `aiGenerationId` di luar blok `try` pada `interpret-stats`, memperbaiki signature panggilan `geminiKeyPool.execute<string>`, memetakan `tenantKeyRes.customKey`, serta menyelaraskan payload `completeAiGeneration`.
  - **Upgrade Rotasi Kunci `generate-outline`**: Memodernisasi `generate-outline` agar memanfaatkan rotasi multi-kunci otomatis via `geminiKeyPool.execute` dengan failover instan.
  - **Kompilasi TypeScript Bersih & Pengujian 100%**: Menuntaskan seluruh error kompilasi (`npx tsc --noEmit` -> 0 errors) dan mempertahankan kelulusan penuh **218/218 tests across 27 files**.

- **Phase 43 (v0.42.1)**: Mengembangkan **Autosave Debounce & Editor Loop Resolution** (`components/editor/editorjs-editor.tsx`, `lib/editor/editor-utils.tsx`, `hooks/use-editor-document.ts`, `components/editor/scholar-editor.tsx`):
  - **Eliminasi Looping Status Simpan**: Menyatukan aksi pasca-render DOM ke dalam `editor.render().then(...)` dan menahan flag `isRenderingRef` selama 400ms untuk mencegah mutasi KaTeX & textarea memicu `onChange`.
  - **Normalisasi Data Blok Simetris**: Menambahkan `normalizeBlockDataForComparison` pada `getContentComparisonString` untuk menstandarkan struktur blok dan mengabaikan perbedaan spasi `&nbsp;` serta ID blok dinamis.
  - **Penjagaan State Referential Equality**: Menambahkan guard check di `triggerDebouncedSave` untuk membatalkan simpan redundan dan mempertahankan referensi state `currentDocument` jika tidak ada perubahan nilai nyata.

- **Phase 44 (v0.42.2)**: Mengembangkan **Editor.js Toolbar Alignment & Heading Typography Normalization** (`app/globals.css`, `lib/ai/ghostwrite-helper.ts`, `app/api/v1/ai/ghostwrite/route.ts`):
  - **Normalisasi Baseline & Padding Heading**: Mengganti padding default `@editorjs/header` dengan `padding-top: 2px !important; padding-bottom: 4px !important; margin: 0 !important;` agar kalkulasi `Toolbar.moveAndOpen()` menempatkan tombol aksi `+ ::` tepat di tengah baris judul tanpa melorot.
  - **Hierarki Tipografi Heading Akademik**: Menstandarkan skala font judul (`h1` s.d. `h6`) dan spasi antar-bagian via `.ce-block:not(:first-child):has(.ce-header)`.
  - **Dukungan Penuh Dark Mode**: Menambahkan styling tema gelap untuk tombol aksi toolbar, toolbox popover, dan pencarian blok.
  - **Refactoring Typing Rute Next.js**: Mengekstrak `buildGhostwritePrompt` ke `lib/ai/ghostwrite-helper.ts` demi memenuhi standar rute Next.js App Router (0 compile error pada `tsc --noEmit`, 218/218 Vitest tests lulus).
