# ScholarFlow Enterprise Standards & QA Checklist

Dokumen ini berfungsi sebagai Standard Operating Procedure (SOP) dan daftar periksa kualitas (QA) yang **WAJIB DIULANGI DAN DICEK** setiap kali sebuah fitur atau halaman baru ditambahkan ke dalam sistem ScholarFlow.

---

## 🛡️ Pilar 1: Pertahanan Aplikasi (Crash Recovery & Error Boundaries)
Setiap fitur/komponen raksasa (seperti Editor, Sidebar, Chart) tidak boleh mematikan seluruh aplikasi jika terjadi gagal render (Blank Screen of Death).
- [ ] Apakah komponen utama sudah dibungkus dengan `<ErrorBoundary>`?
- [ ] Apakah ada UI pengganti (Fallback UI) yang elegan ketika komponen tersebut gagal me-render data kotor?
- [ ] Apakah variabel yang bisa bernilai `undefined` atau `null` sudah ditangani dengan *optional chaining* (`?.`) atau nilai bawaan (default value)?

## 🔒 Pilar 2: Pengamanan Data & XSS (Cross-Site Scripting)
Karena aplikasi kita memuat banyak format HTML dan *rich text*, kita harus waspada terhadap injeksi *script* jahat.
- [ ] Apakah setiap konten berbasis *User Generated Content* (UGC) yang menggunakan `dangerouslySetInnerHTML` telah melewati proses sanitasi (misal menggunakan `DOMPurify`)?
- [ ] Apakah API menerima data mentah tanpa melakukan validasi skema (Zod/Pydantic) di backend?
- [ ] Apakah setiap endpoint *database* (Supabase/Express) memiliki batasan otoritas pengguna yang jelas (RLS / *Row Level Security*)?

## 🧪 Pilar 3: Pengujian Otomatis (Automated Testing)
Jangan mengandalkan pengujian klik manual semata untuk *logic* inti yang sangat matematis atau kompleks.
- [ ] Apakah logika *core* utilitas (misal regex, kalkulasi burstiness, algoritma node) sudah memiliki *Unit Tests* (menggunakan Vitest/Jest)?
- [ ] Apakah alur pembayaran/upgrade atau *login* memiliki *End-to-End Test* (menggunakan Playwright/Cypress)?
- [ ] Apakah perubahan kode ini merusak (*breaking change*) kompatibilitas fungsi yang lama?

## 🧭 Pilar 4: Onboarding, Navigasi, & Aksesibilitas (UX/a11y)
Fitur yang canggih tidak ada gunanya jika *user* merasa terintimidasi atau tidak tahu tombol mana yang harus ditekan.
- [ ] Jika ini adalah halaman/fitur baru yang kompleks (misal *Bibliometric Graph* / *Burstiness*), apakah ada *Tooltip* Bantuan (IconInfoCircle) atau *Interactive Tour* (misal: Shepherd.js / React Joyride)?
- [ ] Apakah semua tombol aksi memiliki efek *hover*, *disabled state*, dan *loading state* (animasi berputar)?
- [ ] Apakah fitur ini mendukung secara penuh pergantian dua bahasa (Inggris & Indonesia) tanpa *hardcode* teks?
- [ ] Apakah fitur ini terlihat rapi saat *Dark Mode* dan *Light Mode* (dukungan kelas `dark:` di Tailwind)?
