// lib/editor/academic-templates.ts
// Phase 31: Academic Thesis/Paper Outline & Structure Generator Engine

export type AcademicStructurePresetId = 
  | 'imrad'
  | 'skripsi_5bab'
  | 'slr_prisma'
  | 'case_study';

export interface AcademicSectionDefinition {
  id: string;
  key: string;
  title: {
    en: string;
    id: string;
  };
  level: 1 | 2 | 3;
  guidingPrompt: {
    en: string;
    id: string;
  };
  checklist: {
    en: string[];
    id: string[];
  };
  suggestedParagraphsCount?: number;
  isRequired?: boolean;
}

export interface AcademicStructurePreset {
  id: AcademicStructurePresetId;
  name: {
    en: string;
    id: string;
  };
  category: 'journal' | 'thesis' | 'review' | 'case';
  badge: {
    en: string;
    id: string;
  };
  description: {
    en: string;
    id: string;
  };
  color: string;
  sections: AcademicSectionDefinition[];
}

export const ACADEMIC_STRUCTURE_PRESETS: AcademicStructurePreset[] = [
  {
    id: 'imrad',
    name: {
      en: 'IMRaD International Journal',
      id: 'Jurnal Internasional IMRaD'
    },
    category: 'journal',
    badge: {
      en: 'Scopus / WoS Standard',
      id: 'Standar Scopus / WoS'
    },
    description: {
      en: 'Universal publication structure: Introduction, Methods, Results, and Discussion format standard for empirical and experimental journals.',
      id: 'Struktur publikasi ilmiah universal: Introduction, Methods, Results, and Discussion format standar jurnal bereputasi tinggi.'
    },
    color: 'indigo',
    sections: [
      {
        id: 'sec_title',
        key: 'title',
        title: { en: 'Manuscript Title', id: 'Judul Naskah' },
        level: 1,
        guidingPrompt: {
          en: 'Concise, informative title (10-15 words) reflecting the core variables, method, and scientific outcome without abbreviations.',
          id: 'Judul ringkas dan informatif (10-15 kata) yang mencerminkan variabel utama, metode, dan hasil saintifik tanpa singkatan non-standar.'
        },
        checklist: {
          en: ['Under 15 words', 'States primary independent and dependent variables', 'Avoids vague clickbait phrases'],
          id: ['Maksimal 15 kata', 'Menyebutkan variabel bebas dan terikat utama', 'Menghindari frasa bias atau sensasional']
        },
        isRequired: true
      },
      {
        id: 'sec_abstract',
        key: 'abstract',
        title: { en: 'Abstract', id: 'Abstrak' },
        level: 2,
        guidingPrompt: {
          en: 'Structured single-paragraph summary (200-250 words) comprising: Background (1 sentence), Objective, Methodology, Key Findings with statistics, and Scientific Contribution.',
          id: 'Ringkasan terstruktur satu paragraf (200-250 kata) mencakup: Latar Belakang (1 kalimat), Tujuan Riset, Metodologi, Temuan Kunci dengan nilai statistik, dan Kontribusi Saintifik.'
        },
        checklist: {
          en: ['Word count: 200-250 words', 'Includes quantitative metrics/p-values', 'Highlights explicit novelty claim'],
          id: ['Jumlah kata 200-250 kata', 'Menyertakan metrik kuantitatif/p-value', 'Menonjolkan klaim kebaruan secara eksplisit']
        },
        isRequired: true
      },
      {
        id: 'sec_intro',
        key: 'introduction',
        title: { en: '1. Introduction', id: '1. Pendahuluan' },
        level: 2,
        guidingPrompt: {
          en: 'Establishes the broad problem, synthesizes conflicting prior literature, highlights the critical research gap, and explicitly formulates research hypotheses or objectives.',
          id: 'Menjelaskan urgensi masalah luas, mensintesis perdebatan literatur terdahulu, menonjolkan celah riset (research gap), dan merumuskan tujuan atau hipotesis riset secara eksplisit.'
        },
        checklist: {
          en: ['Funnels from general global problem to narrow gap', 'Cites recent high-impact publications (past 3-5 years)', 'Concludes with clear research questions'],
          id: ['Piramida terbalik dari isu makro ke celah mikro', 'Merujuk literatur mutakhir 3-5 tahun terakhir', 'Diakhiri dengan rumusan tujuan/pertanyaan riset yang jelas']
        },
        isRequired: true
      },
      {
        id: 'sec_methods',
        key: 'methods',
        title: { en: '2. Research Methodology', id: '2. Metode Penelitian' },
        level: 2,
        guidingPrompt: {
          en: 'Provides reproducible protocol details: experimental design, population/sample size calculations, instrument validation/reliability, and statistical analytical procedures.',
          id: 'Menjelaskan protokol riset yang dapat direplikasi: desain eksperimen, kalkulasi ukuran populasi/sampel, validitas & reliabilitas instrumen, serta prosedur analisis statistik.'
        },
        checklist: {
          en: ['Replicable by an independent researcher', 'Defines sampling formula and power calculation', 'States ethical board approvals if involving humans'],
          id: ['Dapat direplikasi peneliti independen', 'Menjelaskan rumus sampel dan pengujian validitas', 'Menyatakan persetujuan etik (ethical clearance) jika berlaku']
        },
        isRequired: true
      },
      {
        id: 'sec_results',
        key: 'results',
        title: { en: '3. Results', id: '3. Hasil Penelitian' },
        level: 2,
        guidingPrompt: {
          en: 'Objective presentation of experimental or observational data without subjective interpretation. References figures and tables systematically with statistical significance.',
          id: 'Penyajian data eksperimental atau observasi secara objektif tanpa interpretasi spekulatif. Merujuk gambar dan tabel secara sistematis beserta tingkat signifikansi statistik.'
        },
        checklist: {
          en: ['Presents data without speculative opinions', 'Accompanied by formatted tables & cross-referenced figures', 'Reports exact p-values, effect sizes, and confidence intervals'],
          id: ['Menyajikan fakta data tanpa opini spekulatif', 'Didukung tabel berstandar dan rujukan silang gambar', 'Melaporkan p-value persis, effect size, dan interval kepercayaan']
        },
        isRequired: true
      },
      {
        id: 'sec_discussion',
        key: 'discussion',
        title: { en: '4. Discussion', id: '4. Pembahasan' },
        level: 2,
        guidingPrompt: {
          en: 'Interprets findings in relation to initial hypotheses and prior studies. Explains underlying mechanisms, addresses discrepancies, acknowledges limitations, and discusses theoretical implications.',
          id: 'Menginterpretasi temuan dalam kaitannya dengan hipotesis awal dan literatur terdahulu. Menjelaskan mekanisme kausalitas, mengulas anomali, mengakui batasan riset, serta menguraikan implikasi teoritis.'
        },
        checklist: {
          en: ['Compares current findings with prior literature', 'Identifies reasons for anomalous results', 'Acknowledges study limitations honestly'],
          id: ['Membandingkan temuan dengan penelitian sebelumnya', 'Mengidentifikasi penyebab hasil anomali', 'Mengakui keterbatasan metodologi secara jujur']
        },
        isRequired: true
      },
      {
        id: 'sec_conclusion',
        key: 'conclusion',
        title: { en: '5. Conclusion & Future Outlook', id: '5. Kesimpulan & Saran' },
        level: 2,
        guidingPrompt: {
          en: 'Concise summary of theoretical and practical breakthroughs without repeating verbatim numbers. Recommends targeted pathways for future researchers.',
          id: 'Ringkasan padat mengenai kontribusi teoritis dan terobosan praktis tanpa sekadar mengulang angka. Merekomendasikan arah riset lanjutan yang terarah.'
        },
        checklist: {
          en: ['Answers the initial research question directly', 'Highlights actionable practical implications', 'Proposes concrete future research trajectories'],
          id: ['Menjawab pertanyaan riset awal secara tegas', 'Menyajikan implikasi praktis yang dapat diterapkan', 'Mengusulkan roadmap riset lanjutan yang konkrit']
        },
        isRequired: true
      }
    ]
  },
  {
    id: 'skripsi_5bab',
    name: {
      en: 'Indonesian Thesis (5 Chapters Standard)',
      id: 'Skripsi / Tesis 5 Bab Standar Dikti'
    },
    category: 'thesis',
    badge: {
      en: 'Dikti National Standard',
      id: 'Standar Nasional Dikti'
    },
    description: {
      en: 'Comprehensive 5-chapter structure compliant with Indonesian higher education guidelines for undergraduate and master theses.',
      id: 'Struktur naskah 5 bab lengkap sesuai buku pedoman penulisan karya ilmiah perguruan tinggi di Indonesia.'
    },
    color: 'emerald',
    sections: [
      {
        id: 'sec_bab1',
        key: 'bab1_pendahuluan',
        title: { en: 'Chapter I: Introduction', id: 'Bab I: Pendahuluan' },
        level: 2,
        guidingPrompt: {
          en: 'Covers background of the study, problem identification, research boundaries, problem formulations, study objectives, and operational research significance.',
          id: 'Mencakup latar belakang masalah, identifikasi masalah, batasan masalah, rumusan masalah, tujuan penelitian, dan manfaat penelitian (teoritis & praktis).'
        },
        checklist: {
          en: ['Clear background with empirical phenomena', 'Explicit research boundaries', 'Aligned problem statements and objectives'],
          id: ['Latar belakang didukung data fenomena empiris', 'Batasan ruang lingkup penelitian tegas', 'Kesesuaian rumusan masalah dengan tujuan penelitian']
        },
        isRequired: true
      },
      {
        id: 'sec_bab2',
        key: 'bab2_pustaka',
        title: { en: 'Chapter II: Literature Review', id: 'Bab II: Tinjauan Pustaka' },
        level: 2,
        guidingPrompt: {
          en: 'Establishes grand & operational theories, critical synthesis of recent relevant research, conceptual framework diagram, and formal hypothesis formulation.',
          id: 'Menguraikan landasan teori (grand, middle, applied theory), telaah penelitian terdahulu yang relevan, kerangka konseptual berpikir, dan perumusan hipotesis penelitian.'
        },
        checklist: {
          en: ['Comprehensive theoretical basis for all variables', 'Synthesis matrix of previous studies', 'Conceptual diagram mapping relationships'],
          id: ['Kajian teori komprehensif untuk seluruh variabel', 'Matriks perbandingan penelitian terdahulu', 'Bagan alur kerangka berpikir visual']
        },
        isRequired: true
      },
      {
        id: 'sec_bab3',
        key: 'bab3_metode',
        title: { en: 'Chapter III: Research Methodology', id: 'Bab III: Metode Penelitian' },
        level: 2,
        guidingPrompt: {
          en: 'Details research approach (quantitative/qualitative/R&D), population & sampling techniques, operational definition of variables, instrument testing, and analytical techniques.',
          id: 'Mendokumentasikan jenis penelitian, waktu & tempat penelitian, populasi & teknik sampling, definisi operasional variabel, uji instrumen (validitas & reliabilitas), dan teknik analisis data.'
        },
        checklist: {
          en: ['Clear operational definition & measurement indicators', 'Valid sampling formula (e.g. Slovin/Hair)', 'Detailed hypothesis testing procedure'],
          id: ['Tabel definisi operasional variabel beserta indikator', 'Rumus penentuan ukuran sampel teruji', 'Tahapan uji asumsi klasik dan hipotesis terinci']
        },
        isRequired: true
      },
      {
        id: 'sec_bab4',
        key: 'bab4_hasil',
        title: { en: 'Chapter IV: Results and Discussion', id: 'Bab IV: Hasil dan Pembahasan' },
        level: 2,
        guidingPrompt: {
          en: 'Presents research object overview, descriptive statistics, prerequisite statistical tests, hypothesis testing results, and exhaustive scholarly discussion comparing with Chapter II theories.',
          id: 'Menyajikan gambaran umum objek riset, statistik deskriptif, uji prasyarat analisis, hasil pengujian hipotesis, dan pembahasan mendalam yang mengonfirmasi/membantah teori di Bab II.'
        },
        checklist: {
          en: ['Well-formatted tabular summaries', 'Objective hypothesis acceptance/rejection reporting', 'Deep scholarly discussion connecting results to theory'],
          id: ['Tabel ringkasan statistik terformat rapi', 'Penetapan penerimaan/penolakan hipotesis tegas', 'Pembahasan ilmiah yang mengaitkan temuan dengan kajian pustaka']
        },
        isRequired: true
      },
      {
        id: 'sec_bab5',
        key: 'bab5_penutup',
        title: { en: 'Chapter V: Conclusion and Suggestions', id: 'Bab V: Penutup' },
        level: 2,
        guidingPrompt: {
          en: 'Delivers synthesized conclusions answering the problem statements, theoretical and managerial implications, and actionable recommendations for stakeholders and future researchers.',
          id: 'Menyajikan simpulan menyeluruh yang menjawab rumusan masalah, implikasi teoritis dan praktis bagi pemangku kepentingan, serta saran operasional untuk penelitian selanjutnya.'
        },
        checklist: {
          en: ['Direct answers to Chapter I problem statements', 'Actionable recommendations for institutional stakeholders', 'Constructive guidance for upcoming researchers'],
          id: ['Simpulan menjawab rumusan masalah secara lugas', 'Saran praktis dapat dieksekusi institusi/organisasi', 'Saran metodologis untuk peneliti lanjutan']
        },
        isRequired: true
      }
    ]
  },
  {
    id: 'slr_prisma',
    name: {
      en: 'Systematic Literature Review (PRISMA 2020)',
      id: 'Tinjauan Pustaka Sistematis (PRISMA 2020)'
    },
    category: 'review',
    badge: {
      en: 'PRISMA Compliant',
      id: 'Standar PRISMA'
    },
    description: {
      en: 'Gold-standard transparent protocol for systematic reviews and meta-analyses based on the international PRISMA 2020 statement.',
      id: 'Protokol standar internasional untuk naskah systematic literature review dan meta-analisis berbasis pedoman PRISMA 2020.'
    },
    color: 'teal',
    sections: [
      {
        id: 'sec_slr_intro',
        key: 'slr_introduction',
        title: { en: '1. Introduction & Rationale', id: '1. Pendahuluan & Rasional Riset' },
        level: 2,
        guidingPrompt: {
          en: 'Describes the rationale for the review in the context of what is already known, addressing explicit research questions formatted using PICO/PCC framework.',
          id: 'Menguraikan rasionalisasi pentingnya tinjauan pustaka, kesenjangan sintesis sebelumnya, serta pertanyaan riset terstruktur dengan kerangka PICO atau PCC.'
        },
        checklist: {
          en: ['PICO/PCC framework defined', 'Clear gap in existing reviews identified'],
          id: ['Kerangka PICO/PCC terdefinisi jelas', 'Celah ulasan literatur sebelumnya diuraikan']
        },
        isRequired: true
      },
      {
        id: 'sec_slr_methods',
        key: 'slr_methods',
        title: { en: '2. Methods (Eligibility & Search Strategy)', id: '2. Metode (Kriteria Kelayakan & Strategi Pencarian)' },
        level: 2,
        guidingPrompt: {
          en: 'Specifies inclusion and exclusion criteria, electronic database sources (Scopus, Web of Science, PubMed), exact Boolean search query strings, and data extraction protocols.',
          id: 'Mendefinisikan kriteria inklusi dan eksklusi, basis data elektronik yang disisir, string kata kunci Boolean spesifik, dan protokol ekstraksi data.'
        },
        checklist: {
          en: ['Full Boolean search strings documented', 'Databases and date ranges specified', 'Two-reviewer screening protocol detailed'],
          id: ['String pencarian Boolean lengkap terdokumentasi', 'Rentang tahun dan database rujukan dicantumkan', 'Protokol penyaringan independen dijelaskan']
        },
        isRequired: true
      },
      {
        id: 'sec_slr_flow',
        key: 'slr_prisma_flow',
        title: { en: '3. PRISMA Flow Diagram & Selection Results', id: '3. Diagram Alir PRISMA & Hasil Seleksi' },
        level: 2,
        guidingPrompt: {
          en: 'Documents the systematic filtration stages: Identification -> Screening -> Eligibility -> Included studies, explaining reasons for exclusions at each stage.',
          id: 'Mendokumentasikan tahapan filtrasi sistematis: Identifikasi -> Penyaringan -> Kelayakan -> Studi Terpilih, beserta alasan eliminasi naskah di tiap tahap.'
        },
        checklist: {
          en: ['Identification count recorded', 'Duplicates removed count stated', 'Exclusion reasons categorized'],
          id: ['Jumlah artikel identifikasi tercatat', 'Jumlah duplikasi tereliminasi disebutkan', 'Kategori alasan eliminasi terinci']
        },
        isRequired: true
      },
      {
        id: 'sec_slr_synthesis',
        key: 'slr_synthesis',
        title: { en: '4. Thematic Synthesis & Quality Assessment', id: '4. Sintesis Tematik & Penilaian Kualitas' },
        level: 2,
        guidingPrompt: {
          en: 'Presents structured comparative synthesis of included papers, risk of bias assessments, thematic taxonomies, and meta-analytic evidence.',
          id: 'Menyajikan sintesis komparatif terstruktur atas paper yang lolos seleksi, penilaian risiko bias, taksonomi tematik, dan matriks temuan utama.'
        },
        checklist: {
          en: ['Comparative study matrix included', 'Quality assessment checklist documented', 'Thematic clusters clearly synthesized'],
          id: ['Tabel matriks komparasi studi terlampir', 'Penilaian kualitas metodologi terdokumentasi', 'Klaster tema riset terpetakan secara logis']
        },
        isRequired: true
      },
      {
        id: 'sec_slr_discussion',
        key: 'slr_discussion',
        title: { en: '5. Discussion & Future Research Agenda', id: '5. Pembahasan & Agenda Riset Masa Depan' },
        level: 2,
        guidingPrompt: {
          en: 'Interprets broad patterns across literature, discusses methodological heterogeneity, and constructs a strategic research agenda for subsequent scholars.',
          id: 'Menginterpretasi pola luas dalam literatur, mengulas heterogenitas metodologi antar-paper, dan menyusun agenda riset strategis bagi peneliti selanjutnya.'
        },
        checklist: {
          en: ['Discusses gaps identified across papers', 'Constructs future research agenda matrix'],
          id: ['Membahas celah yang ditemukan di seluruh naskah', 'Menyusun peta jalan agenda riset masa depan']
        },
        isRequired: true
      }
    ]
  },
  {
    id: 'case_study',
    name: {
      en: 'Clinical & Organizational Case Study',
      id: 'Studi Kasus Klinis & Organisasi'
    },
    category: 'case',
    badge: {
      en: 'Case Report Standard',
      id: 'Standar Laporan Kasus'
    },
    description: {
      en: 'Structured format for reporting clinical patient cases, organizational interventions, and industrial problem-solving investigations.',
      id: 'Format terstruktur untuk melaporkan kasus klinis, intervensi manajerial organisasi, dan investigasi problem-solving industri.'
    },
    color: 'amber',
    sections: [
      {
        id: 'sec_case_intro',
        key: 'case_intro',
        title: { en: '1. Background & Context', id: '1. Latar Belakang & Konteks Kasus' },
        level: 2,
        guidingPrompt: {
          en: 'Introduces the uniqueness or rarity of the case, institutional/patient context, and why this investigation provides valuable scientific or clinical insights.',
          id: 'Menjelaskan keunikan atau kelangkaan kasus, konteks institusi/pasien, dan mengapa investigasi ini memberikan wawasan saintifik atau praktis yang berharga.'
        },
        checklist: {
          en: ['Establishes novelty/rarity', 'Protects confidentiality/PII'],
          id: ['Menjelaskan kebaruan/urgensi kasus', 'Menjaga kerahasiaan identitas subjek']
        },
        isRequired: true
      },
      {
        id: 'sec_case_presentation',
        key: 'case_presentation',
        title: { en: '2. Case Presentation & Timeline', id: '2. Presentasi Kasus & Kronologi' },
        level: 2,
        guidingPrompt: {
          en: 'Chronological timeline of symptoms, operational breakdowns, diagnostic assessments, and baseline metrics before intervention.',
          id: 'Kronologi sistematis mengenai gejala atau kendala operasional, pengujian diagnostik, dan metrik dasar sebelum intervensi diterapkan.'
        },
        checklist: {
          en: ['Chronological timeline clearly organized', 'Diagnostic measurements and baseline reported'],
          id: ['Garis waktu kronologis tersusun runut', 'Hasil pengukuran diagnostik dasar dicantumkan']
        },
        isRequired: true
      },
      {
        id: 'sec_case_intervention',
        key: 'case_intervention',
        title: { en: '3. Strategic Intervention & Management', id: '3. Intervensi Strategis & Penanganan' },
        level: 2,
        guidingPrompt: {
          en: 'Comprehensive description of the solutions, treatments, or strategic implementations deployed, including rationales for decisions made.',
          id: 'Uraian komprehensif mengenai solusi, tindakan penanganan, atau intervensi strategis yang diterapkan beserta rasionalisasi keputusannya.'
        },
        checklist: {
          en: ['Detailed intervention protocol', 'Rationale for chosen strategy explained'],
          id: ['Protokol tindakan dijelaskan terperinci', 'Alasan pemilihan intervensi dipaparkan']
        },
        isRequired: true
      },
      {
        id: 'sec_case_outcome',
        key: 'case_outcome',
        title: { en: '4. Outcomes, Follow-up & Lessons Learned', id: '4. Hasil Evaluasi, Tindak Lanjut & Pelajaran' },
        level: 2,
        guidingPrompt: {
          en: 'Post-intervention metrics, longitudinal stability, unintended consequences, and critical lessons for broader practice.',
          id: 'Metrik evaluasi pasca-intervensi, stabilitas jangka panjang, kendala tak terduga, dan pelajaran penting bagi praktisi di bidang terkait.'
        },
        checklist: {
          en: ['Quantitative outcome indicators presented', 'Key lessons synthesized for practitioners'],
          id: ['Indikator keberhasilan kuantitatif ditampilkan', 'Pelajaran berharga dirangkum untuk praktisi']
        },
        isRequired: true
      }
    ]
  }
];

export function getAcademicPreset(presetId: AcademicStructurePresetId): AcademicStructurePreset {
  const found = ACADEMIC_STRUCTURE_PRESETS.find(p => p.id === presetId);
  return found || ACADEMIC_STRUCTURE_PRESETS[0];
}

export function getAllAcademicPresets(): AcademicStructurePreset[] {
  return ACADEMIC_STRUCTURE_PRESETS;
}

export interface ScaffoldConversionOptions {
  language: 'en' | 'id';
  includePromptsAsParagraphs?: boolean;
  includeChecklistsAsLists?: boolean;
  paperTitle?: string;
  fieldOfStudy?: string;
}

/**
 * Converts academic sections into clean EditorJS block objects
 */
export function convertScaffoldToEditorJsBlocks(
  preset: AcademicStructurePreset,
  options: ScaffoldConversionOptions
): any[] {
  const isEn = options.language === 'en';
  const blocks: any[] = [];

  // Generate unique clean block ID
  const genId = (prefix: string) => `${prefix}-${Math.random().toString(36).substring(2, 9)}`;

  // Optional Document Title block
  if (options.paperTitle && options.paperTitle.trim()) {
    blocks.push({
      id: genId('h-title'),
      type: 'header',
      data: {
        text: options.paperTitle.trim(),
        level: 1
      }
    });
  }

  preset.sections.forEach((sec, idx) => {
    // If title was provided in options, skip the first title section to avoid duplication
    if (sec.key === 'title' && options.paperTitle) {
      return;
    }

    const sectionTitle = isEn ? sec.title.en : sec.title.id;
    const guidingPrompt = isEn ? sec.guidingPrompt.en : sec.guidingPrompt.id;
    const checklistItems = isEn ? sec.checklist.en : sec.checklist.id;

    // Header block
    blocks.push({
      id: genId(`h-sec-${sec.key}`),
      type: 'header',
      data: {
        text: sectionTitle,
        level: sec.level
      }
    });

    // Guiding Prompt Block (styled as an informative research directive blockquote/paragraph)
    if (options.includePromptsAsParagraphs !== false) {
      const guidancePrefix = isEn ? '💡 <i>Guidance:</i> ' : '💡 <i>Panduan Penulisan:</i> ';
      blocks.push({
        id: genId(`p-guide-${sec.key}`),
        type: 'paragraph',
        data: {
          text: `${guidancePrefix}${guidingPrompt}`
        }
      });
    }

    // Checklist Block
    if (options.includeChecklistsAsLists && checklistItems && checklistItems.length > 0) {
      blocks.push({
        id: genId(`list-sec-${sec.key}`),
        type: 'list',
        data: {
          style: 'unordered',
          items: checklistItems.map(item => `[ ] ${item}`)
        }
      });
    }

    // Placeholder body paragraph where student starts writing
    blocks.push({
      id: genId(`p-body-${sec.key}`),
      type: 'paragraph',
      data: {
        text: isEn 
          ? 'Start writing your research argument here...' 
          : 'Mulai menuliskan argumen penelitian Anda di sini...'
      }
    });
  });

  return blocks;
}

/**
 * Converts scaffold structure into Markdown format
 */
export function convertScaffoldToMarkdown(
  preset: AcademicStructurePreset,
  options: ScaffoldConversionOptions
): string {
  const isEn = options.language === 'en';
  const lines: string[] = [];

  if (options.paperTitle) {
    lines.push(`# ${options.paperTitle}\n`);
  }

  preset.sections.forEach((sec) => {
    if (sec.key === 'title' && options.paperTitle) return;

    const prefix = '#'.repeat(sec.level || 2);
    const title = isEn ? sec.title.en : sec.title.id;
    const prompt = isEn ? sec.guidingPrompt.en : sec.guidingPrompt.id;
    const checklist = isEn ? sec.checklist.en : sec.checklist.id;

    lines.push(`${prefix} ${title}\n`);

    if (options.includePromptsAsParagraphs !== false) {
      lines.push(`> 💡 **${isEn ? 'Guidance' : 'Panduan'}:** ${prompt}\n`);
    }

    if (options.includeChecklistsAsLists && checklist && checklist.length > 0) {
      checklist.forEach(item => {
        lines.push(`- [ ] ${item}`);
      });
      lines.push('');
    }

    lines.push(isEn ? 'Start drafting here...\n' : 'Mulai menulis draf di sini...\n');
  });

  return lines.join('\n');
}
