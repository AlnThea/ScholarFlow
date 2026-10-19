# Rencana Migrasi Layout: Modern Microsoft Word Ribbon (ScholarFlow Editor)

Dokumen ini memuat rencana kerja terstruktur (step-by-step) untuk memigrasikan tata letak (*layout*) halaman editor ScholarFlow ke gaya **Modern Microsoft Word Ribbon** yang rapi, profesional, dan bebas dari kesan padat/sesak (*cluttered*).

> **Prinsip Utama Migrasi (Zero Logic Regression):**
> 1. **Tidak Menghapus Logika/Fungsi**: Seluruh fungsi React (`hooks`, `useEditorJsMethods`, `state`, `API calls`, `event handlers`) tetap berjalan 100% seperti semula. Hanya tata letak penyajian (JSX + Tailwind) yang diperbarui.
> 2. **Native Stack**: Murni menggunakan React, Tailwind CSS, `@tabler/icons-react`, dan framer-motion yang sudah terpasang.
> 3. **Dark Mode & Bilingual**: Menjamin semua class Tailwind memiliki padanan `dark:` dan mendukung dwibahasa (EN/ID).
> 4. **Jaminan Fitur Mengambang (Floating Overlays)**:
>    - `EditorBubbleMenu` (menu seleksi teks melayang) tetap aktif saat blok teks disorot.
>    - `HighlightPopover` (palet warna stabilo) tetap muncul saat tombol highlight diklik.
>    - `GhostwriterSuggestion` (teks abu-abu AI inline) tetap muncul saat mengetik.
>    - `SuggestingChips` (chip terima/tolak saran naskah) tetap muncul di sisi blok.
>    - `CitationMentionDropdown` (autocomplete `@` sitasi) tetap merespons ketikan `@`.
>    - Seluruh atribut `data-tour` (`header-export`, `toolbar-undo-redo`, dll.) tetap dijaga agar fitur **Onboarding Tour** tidak error.
>    - Avatar pengguna kolaboratif (`activeUsers`) tetap tampil di header.

---

## 📌 DAFTAR TAHAPAN KERJA (CHECKLIST STEP-BY-STEP)

### Tahap 1: Restrukturisasi Header Atas (`components/editor/editor-header.tsx`)
- [x] Tambahkan ikon dokumen `[W]` di sisi kiri judul naskah.
- [x] Ubah struktur judul naskah menjadi 2 tingkat:
  - **Baris 1**: Input judul dokumen (tebal) + chip status `• Realtime WS` / `Smart Polling`.
  - **Baris 2**: Teks kecil status simpan awan (`☁️ Tersimpan otomatis ke Cloud`) dan timestamp (`Terakhir diedit baru saja`).
- [x] Rapikan jejeran tombol aksi sisi kanan header:
  - Tombol Spotlight Search `[Ctrl K]`
  - Dropdown Ekspor (`📥 Export ▾`)
  - Lonceng Notifikasi `🔔`
  - Tombol Bagikan `🔗 Share`
  - Kuota Token `⚡ 49.2k`
  - Tombol `💳 Pricing`
  - Tombol `📖 Research Assistant`
  - Tombol `🕒 History` (Riwayat Versi)
  - Tombol `🔬 Reviewer #2` (Badge Rose)
  - Pengaturan `⚙️` & Pintasan `⌨️`
- [x] **Titik Pengujian Tahap 1**: Header terlihat rapi, ganti judul dokumen berfungsi, dropdown ekspor dan tombol-tombol kanan membuka modal dengan normal, Dark Mode 100% kompatibel.

---

### Tahap 2: Pembuatan Navigasi Tab Ribbon (`components/editor/editorjs-toolbar.tsx`)
- [x] Buat state aktif tab ribbon di toolbar (`activeRibbonTab`: `'beranda' | 'sisipkan' | 'referensi' | 'tinjauan'`).
- [x] Buat bilah tab seleksi ala Microsoft Word tepat di bawah header:
  - **Beranda** (Teks & Format)
  - **Sisipkan** (Tabel, Gambar & Rumus)
  - **Referensi** (Sitasi & Bibliografi)
  - **Tinjauan & AI** (Reviewer #2, Ghostwriter & Integritas)
- [x] **Titik Pengujian Tahap 2**: Klik tab berpindah dengan mulus dan indikator tab aktif berwarna biru Word (`#185abd`).

---

### Tahap 3: Implementasi Tab "Beranda" (Formatting Essentials)
- [x] Kelompokkan alat-alat pemformatan dasar:
  - Mode Switcher: `SuggestingModeControl` (Editing vs Suggesting)
  - Tombol `Undo` & `Redo`
  - Dropdown Block Type (`Paragraph`, `Heading 1` - `6`)
  - Dropdown Font Size (`Default`, `12px` - `32px`)
  - Tombol Inline Formats (`B`, `I`, `U`, `S`, `Code`, `Superscript`, `Subscript`, `Link`, `Highlight`)
  - Tombol Perataan Paragraf (`Left`, `Center`, `Right`, `Justify`)
- [x] Pertahankan pemanggilan method asli: `editorJsRef.current?.undo()`, `toggleInlineFormat()`, `setBlockAlignment()`, dll.
- [x] **Titik Pengujian Tahap 3**: Semua tombol pemformatan teks di kanvas A4 berfungsi realtime.

---

### Tahap 4: Implementasi Tab "Sisipkan" (Insert Elements)
- [x] Kelompokkan alat-alat penyisipan elemen visual & matematis:
  - `IconPhoto`: Sisipkan Gambar (`setIsImageModalOpen(true)`)
  - `IconTable`: Sisipkan Tabel Akademik (`editorJsRef.current?.insertTable()`)
  - `IconCode`: Sisipkan Blok Kode Program (`editorJsRef.current?.insertCodeBlock()`)
  - `IconBookmark`: Rujukan Silang (@fig, @tab) (`onOpenCrossReferenceModal()`)
  - `IconSum`: Rumus Inline KaTeX (`setIsMathModalOpen(true)`)
  - `IconMath`: Rumus Blok Formula LaTeX (`editorJsRef.current?.insertMathBlock()`)
  - `IconCalculator`: Buka Panel LaTeX Math Helper (`setIsMathHelperOpen()`)
- [x] **Titik Pengujian Tahap 4**: Mengklik tombol gambar, tabel, rumus KaTeX, dan rujukan silang memunculkan modal/elemen terkait tanpa error.

---

### Tahap 5: Implementasi Tab "Referensi" (Citations & Bibliography)
- [x] Kelompokkan alat-alat sitasi ilmiah:
  - Tombol `@ Citation`: Membuka modal pencarian/penyisipan sitasi in-text (`onInsertCitation()`)
  - Selector Gaya Sitasi: Komponen dropdown `CitationStyleSelector` (`APA`, `IEEE`, `Harvard`, `Vancouver`, `Chicago`)
  - Rujukan silang Gambar & Tabel (`IconBookmark`)
- [x] **Titik Pengujian Tahap 5**: Pengubahan gaya sitasi dan penyisipan sitasi bekerja realtime.

---

### Tahap 6: Implementasi Tab "Tinjauan & AI" (Review & Integrity)
- [x] Kelompokkan alat-alat ulasan dan asistensi AI:
  - Toggle `Ghostwriter AI`: Komponen `GhostwriterToggle` (dengan debounced 4.5s)
  - `AcademicIntegrityPill`: Barometer orisinalitas (`onOpenIntegrityTab()`)
  - Mode Switcher: `SuggestingModeControl` (Batch accept/reject)
  - Indikator permanen (pinned) di ujung kanan ribbon: Barometer Integritas, Ghostwriter Toggle, dan status label dokumen
- [x] **Titik Pengujian Tahap 6**: Toggle Ghostwriter dan Barometer integritas membuka panel analisis dengan benar.

---

### Tahap 7: Harmonisasi Lembar Kanvas A4 & Bilah Status Bawah
- [x] Pastikan kanvas editor memiliki tampilan kertas A4 fisik dengan efek bayangan elegan (`a4-paper-shadow`).
- [x] Sinkronkan status di bilah bawah (footer):
  - Jumlah Kata & Karakter
  - Status Bahasa (ID/EN)
  - Indikator Skala / Zoom 100%
- [x] **Titik Pengujian Tahap 7**: Dokumen terasa seperti mengetik di Microsoft Word desktop / Google Docs profesional.

---

### Tahap 8: Verifikasi End-to-End & Uji Beban
- [x] Pastikan seluruh 42 fitur dari editor asli berfungsi normal.
- [x] Verifikasi autosave 4.5s (Zen Mode) dan backup localStorage tidak terganggu.
- [x] Uji responsivitas tema Gelap (Dark Mode) dan Terang (Light Mode).
- [x] Catat hasil di `AI_Rules/CHANGELOG.md` dan `doc/changelog.md`.
