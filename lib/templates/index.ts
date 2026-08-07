// lib/templates/index.ts

import { getEmptyTemplate } from './empty';
import { getSkripsiTemplate } from './skripsi';
import { getIeeeTemplate } from './ieee';
import { getApaTemplate } from './apa';
import { getReportTemplate } from './report';

export interface TemplateMetadata {
  id: 'empty' | 'skripsi' | 'ieee' | 'apa' | 'report';
  category: 'academic' | 'journal' | 'general';
  badge: { en: string; id: string } | null;
  tags: string[];
  color: string;
  label: { en: string; id: string };
  desc: { en: string; id: string };
  outline: {
    en: string[];
    id: string[];
  };
}

export const TEMPLATES_METADATA: TemplateMetadata[] = [
  {
    id: 'empty',
    category: 'general',
    badge: null,
    tags: ['Minimal', 'Blank'],
    color: 'slate',
    label: { en: '📄 Empty Document', id: '📄 Dokumen Kosong' },
    desc: { en: 'A blank draft with only a title to start your writing from scratch.', id: 'Draf kosong dengan judul untuk mulai menulis dari awal.' },
    outline: {
      en: ['Untitled Document', 'Start writing your academic draft here...'],
      id: ['Dokumen Tanpa Judul', 'Mulai menulis draf akademik Anda di sini...']
    }
  },
  {
    id: 'skripsi',
    category: 'academic',
    badge: { en: 'Recommended', id: 'Rekomendasi' },
    tags: ['Thesis', 'Undergraduate', 'Standard ID'],
    color: 'indigo',
    label: { en: '🎓 Undergraduate Thesis', id: '🎓 Skripsi / Tugas Akhir' },
    desc: { en: 'Standard structure for Indonesian higher education undergraduate thesis containing 5 complete chapters.', id: 'Struktur standar untuk skripsi/tugas akhir perguruan tinggi Indonesia dengan 5 bab lengkap.' },
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
  },
  {
    id: 'ieee',
    category: 'journal',
    badge: { en: 'Format', id: 'Format' },
    tags: ['IEEE', 'Engineering', 'Proceeding'],
    color: 'blue',
    label: { en: '📚 IEEE Journal', id: '📚 Jurnal / Prosiding IEEE' },
    desc: { en: 'Standard format for engineering, technology, and computer science papers published in IEEE.', id: 'Format standar untuk publikasi bidang teknik, teknologi, dan ilmu komputer yang diterbitkan di IEEE.' },
    outline: {
      en: [
        'Abstract',
        'I. Introduction',
        'II. Proposed Methodology',
        'III. Experimental Evaluation & Results',
        'IV. Conclusion'
      ],
      id: [
        'Abstrak',
        'I. Pendahuluan',
        'II. Metodologi yang Diusulkan',
        'III. Evaluasi Eksperimen & Hasil',
        'IV. Kesimpulan'
      ]
    }
  },
  {
    id: 'apa',
    category: 'journal',
    badge: { en: 'APA 7th', id: 'APA Ed.7' },
    tags: ['APA Style', 'Social Science', 'Format'],
    color: 'emerald',
    label: { en: '📝 APA Style Journal', id: '📝 Jurnal Gaya APA (7th Ed)' },
    desc: { en: 'Format matching American Psychological Association (APA) 7th edition guidelines, common in social sciences.', id: 'Format sesuai pedoman American Psychological Association (APA) edisi ke-7, umum untuk ilmu sosial.' },
    outline: {
      en: [
        'Abstract',
        'Introduction',
        'Method',
        'Results',
        'Discussion'
      ],
      id: [
        'Abstrak',
        'Pendahuluan',
        'Metode',
        'Hasil',
        'Pembahasan'
      ]
    }
  },
  {
    id: 'report',
    category: 'general',
    badge: { en: 'Standard', id: 'Standar' },
    tags: ['Report', 'Project', 'Research'],
    color: 'violet',
    label: { en: '💼 Research Report', id: '💼 Laporan Riset / Proyek' },
    desc: { en: 'General research reporting template for college assignments or professional project analysis.', id: 'Templat pelaporan riset umum untuk tugas perkuliahan atau analisis proyek profesional.' },
    outline: {
      en: [
        'Executive Summary',
        'Background & Problem',
        'Data Analysis & Findings',
        'Recommendations & Solutions'
      ],
      id: [
        'Ringkasan Eksekutif',
        'Latar Belakang & Masalah',
        'Analisis Data & Temuan',
        'Rekomendasi & Solusi'
      ]
    }
  }
];

export function getTemplateBlocks(templateId: string | undefined, language: 'en' | 'id', title: string = '') {
  switch (templateId) {
    case 'skripsi':
      return getSkripsiTemplate(language);
    case 'ieee':
      return getIeeeTemplate(language);
    case 'apa':
      return getApaTemplate(language);
    case 'report':
      return getReportTemplate(language);
    case 'empty':
    default:
      return getEmptyTemplate(language, title);
  }
}
