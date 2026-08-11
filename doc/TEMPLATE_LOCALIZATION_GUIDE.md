# ScholarFlow Template Localization & Customization Guide 🎓🌐

Dokumen ini berisi panduan teknis dan tata cara pengesetkan templat dokumen akademik (*Academic Manuscript Templates*) di **ScholarFlow**. Panduan ini mencakup struktur data templat, mekanisme **bilingual (i18n)**, serta panduan langkah-demi-langkah bagi pengembang dan pengguna untuk menambahkan atau menyesuaikan (*localize*) templat kustom sesuai standar institusi/perguruan tinggi maupun jurnal ilmiah.

---

## 🛠️ 1. Struktur Templat Akademik (Template Architecture)

Seluruh templat penulisan di ScholarFlow tersimpan di direktori `lib/templates/`. Arsitektur templat terdiri dari dua komponen utama:

1. **Metadata Templat (`TemplateMetadata`)**: Menyimpan definisi identitas templat, ikon, tag, kategori, serta deskripsi dan outline beralih-bahasa (`en` dan `id`).
2. **Generator Blok Dokumen (`getTemplateBlocks`)**: Fungsi yang mengembalikan daftar blok dokumen awal (*Editor.js block data structure*) yang disesuaikan dengan bahasa target pengguna.

---

## 📂 2. Skema Metadata (`lib/templates/index.ts`)

Setiap templat harus terdaftar di array `TEMPLATES_METADATA` pada [lib/templates/index.ts](file:///c:/web/ScholarFlow/lib/templates/index.ts). Berikut adalah kontrak interface `TemplateMetadata`:

```typescript
export interface TemplateMetadata {
  id: 'empty' | 'skripsi' | 'ieee' | 'apa' | 'report' | string;
  category: 'academic' | 'journal' | 'general';
  badge: { en: string; id: string } | null;
  tags: string[];
  color: string; // Tailwind color token (e.g. 'indigo', 'blue', 'emerald')
  label: { en: string; id: string };
  desc: { en: string; id: string };
  outline: {
    en: string[];
    id: string[];
  };
}
```

### Contoh Entri Metadata Templat Bilingual:

```typescript
{
  id: 'skripsi',
  category: 'academic',
  badge: { en: 'Recommended', id: 'Rekomendasi' },
  tags: ['Thesis', 'Undergraduate', 'Standard ID'],
  color: 'indigo',
  label: { en: '🎓 Undergraduate Thesis', id: '🎓 Skripsi / Tugas Akhir' },
  desc: { 
    en: 'Standard structure for Indonesian higher education undergraduate thesis containing 5 complete chapters.', 
    id: 'Struktur standar untuk skripsi/tugas akhir perguruan tinggi Indonesia dengan 5 bab lengkap.' 
  },
  outline: {
    en: [
      'Chapter 1: Introduction (Background, Problem Statement, Objectives)',
      'Chapter 2: Literature Review (Theoretical Foundation, Previous Studies)',
      'Chapter 3: Research Methodology (Data Collection, System Design)',
      'Chapter 4: Results and Discussion (Analysis, Evaluation, Charts)',
      'Chapter 5: Conclusion (Summary, Suggestions for Future Work)'
    ],
    id: [
      'Bab 1: Pendahuluan (Latar Belakang, Rumusan Masalah, Tujuan)',
      'Bab 2: Tinjauan Pustaka (Landasan Teori, Penelitian Terkait)',
      'Bab 3: Metode Penelitian (Pengumpulan Data, Perancangan Sistem)',
      'Bab 4: Hasil dan Pembahasan (Analisis, Evaluasi, Grafik)',
      'Bab 5: Penutup (Kesimpulan, Saran Pengembangan)'
    ]
  }
}
```

---

## 📝 3. Format Data Blok Templat (`lib/templates/<id>.ts`)

Setiap file templat mengeset struktur bab dan paragraf awal menggunakan fungsi generator bertipe `(language: 'en' | 'id') => BlockData[]`.

Contoh implementasi templat [skripsi.ts](file:///c:/web/ScholarFlow/lib/templates/skripsi.ts):

```typescript
export function getSkripsiTemplate(language: 'en' | 'id') {
  return [
    { 
      id: "h-skripsi-1-" + Math.random().toString(36).substring(2, 9), 
      type: "header", 
      data: { 
        text: language === 'en' ? "Chapter 1: Introduction" : "Bab 1: Pendahuluan", 
        level: 2 
      } 
    },
    { 
      id: "p-skripsi-1-" + Math.random().toString(36).substring(2, 9), 
      type: "paragraph", 
      data: { 
        text: language === 'en' 
          ? "In the current era of digitalization, higher education institutions are required to integrate..." 
          : "Di era digitalisasi saat ini, institusi pendidikan tinggi dituntut untuk mengintegrasikan..." 
      } 
    },
    // Bab-bab selanjutnya...
  ];
}
```

---

## 🚀 4. Langkah-Langkah Menambahkan Templat Kustom Baru

Untuk menambahkan templat kustom baru (misalnya templat **Disertasi** atau **Jurnal Nature**), ikuti langkah-langkah berikut:

### Langkah 1: Buat File Templat Baru di `lib/templates/`
Buat file baru `lib/templates/disertasi.ts`:

```typescript
// lib/templates/disertasi.ts

export function getDisertasiTemplate(language: 'en' | 'id') {
  return [
    {
      id: "h-dis-1-" + Math.random().toString(36).substring(2, 9),
      type: "header",
      data: {
        text: language === 'en' ? "Chapter 1: Introduction & Research Gaps" : "Bab 1: Pendahuluan & Celah Penelitian",
        level: 2
      }
    },
    {
      id: "p-dis-1-" + Math.random().toString(36).substring(2, 9),
      type: "paragraph",
      data: {
        text: language === 'en'
          ? "This doctoral dissertation investigates original scientific novelties in..."
          : "Disertasi doktoral ini meneliti kebaruan ilmiah (*novelty*) orisinal dalam..."
      }
    }
  ];
}
```

### Langkah 2: Daftarkan Metadatakannya di `lib/templates/index.ts`
Buka [lib/templates/index.ts](file:///c:/web/ScholarFlow/lib/templates/index.ts):

1. Import fungsi generator baru:
```typescript
import { getDisertasiTemplate } from './disertasi';
```

2. Tambahkan entri ke `TEMPLATES_METADATA`:
```typescript
{
  id: 'disertasi',
  category: 'academic',
  badge: { en: 'Doctoral', id: 'Doktoral' },
  tags: ['Dissertation', 'PhD', 'Advanced'],
  color: 'purple',
  label: { en: '🎓 Doctoral Dissertation', id: '🎓 Disertasi Doktoral' },
  desc: { 
    en: 'Advanced structure for doctoral thesis focusing on scientific novelty.', 
    id: 'Struktur tingkat lanjut untuk disertasi S3 yang berfokus pada kebaruan ilmiah.' 
  },
  outline: {
    en: ['Chapter 1: Introduction & Gaps', 'Chapter 2: Theoretical Foundations', ...],
    id: ['Bab 1: Pendahuluan & Celah', 'Bab 2: Landasan Teori', ...]
  }
}
```

3. Perbarui fungsi `getTemplateBlocks`:
```typescript
export function getTemplateBlocks(templateId: string | undefined, language: 'en' | 'id', title: string = '') {
  switch (templateId) {
    case 'disertasi':
      return getDisertasiTemplate(language);
    case 'skripsi':
      return getSkripsiTemplate(language);
    // ...
  }
}
```

---

## 🌐 5. Integrasi Modal Setup Dokumen

Ketika pengguna membuat dokumen baru via tombol **Create New Document**, komponen [document-setup-modal.tsx](file:///c:/web/ScholarFlow/components/editor/document-setup-modal.tsx) akan merender daftar templat dari `TEMPLATES_METADATA`. 

Otomatisasi i18n bekerja secara real-time via hook `useLanguage()`, sehingga saat pengguna mengubah bahasa dari **EN** ke **ID** (atau sebaliknya), baik judul, deskripsi, maupun isi blok awal akan disesuaikan tanpa perlu reload halaman.

---

## ⚡ 6. Best Practices Pengembangan Templat
1. **ID Unik**: Selalu gunakan `Math.random().toString(36).substring(2, 9)` untuk prefix ID blok agar tidak bentrok saat penyalinan atau sinkronisasi database.
2. **Kepatuhan Tipe Data**: Gunakan tipe blok baku Editor.js (`header`, `paragraph`, `list`, `table`, `math`).
3. **Simetri Bahasa**: Pastikan setiap bab di daftar `outline.en` memiliki pasangan yang tepat di `outline.id`.
