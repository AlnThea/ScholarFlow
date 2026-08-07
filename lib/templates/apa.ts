// lib/templates/apa.ts

export function getApaTemplate(language: 'en' | 'id') {
  return [
    { 
      id: "h-apa-0-" + Math.random().toString(36).substring(2, 9), 
      type: "header", 
      data: { 
        text: language === 'en' ? "Abstract" : "Abstrak", 
        level: 2 
      } 
    },
    { 
      id: "p-apa-0-" + Math.random().toString(36).substring(2, 9), 
      type: "paragraph", 
      data: { 
        text: language === 'en' 
          ? "This study examines the dual impacts of hybrid learning modalities on both student academic engagement and psychological well-being. Using a sample of 250 undergraduate students, we measured learning outcomes and stress scales over a 16-week academic semester. The results indicate that while hybrid structures offer temporal flexibility, they require significant self-regulatory capabilities to maintain engagement levels equivalent to traditional face-to-face instruction." 
          : "Studi ini meneliti dampak ganda modalitas pembelajaran hibrida terhadap keterlibatan akademis mahasiswa dan kesejahteraan psikologis. Menggunakan sampel 250 mahasiswa sarjana, kami mengukur hasil belajar dan skala stres selama semester akademik 16 minggu. Hasil menunjukkan bahwa meskipun struktur hibrida menawarkan fleksibilitas waktu, mereka memerlukan kemampuan regulasi diri yang signifikan untuk mempertahankan tingkat keterlibatan yang setara dengan pengajaran tatap muka tradisional." 
      } 
    },
    { 
      id: "h-apa-1-" + Math.random().toString(36).substring(2, 9), 
      type: "header", 
      data: { 
        text: language === 'en' ? "Introduction" : "Pendahuluan", 
        level: 2 
      } 
    },
    { 
      id: "p-apa-1-" + Math.random().toString(36).substring(2, 9), 
      type: "paragraph", 
      data: { 
        text: language === 'en' 
          ? "The widespread adoption of hybrid educational frameworks has transformed the landscape of higher education. Previous literature suggests that virtual instruction can isolate students, leading to reduced engagement. In this study, we seek to expand upon existing models by integrating cognitive load theory with student engagement indices to map the transition from physical classrooms to hybrid spaces." 
          : "Adopsi kerangka pendidikan hibrida yang meluas telah mengubah lanskap pendidikan tinggi. Literatur sebelumnya menunjukkan bahwa pengajaran virtual dapat mengisolasi siswa, yang menyebabkan berkurangnya keterlibatan. Dalam studi ini, kami berupaya memperluas model yang ada dengan mengintegrasikan teori beban kognitif dengan indeks keterlibatan siswa untuk memetakan transisi dari ruang kelas fisik ke ruang hibrida." 
      } 
    },
    { 
      id: "h-apa-2-" + Math.random().toString(36).substring(2, 9), 
      type: "header", 
      data: { 
        text: language === 'en' ? "Method" : "Metode", 
        level: 2 
      } 
    },
    { 
      id: "p-apa-2-" + Math.random().toString(36).substring(2, 9), 
      type: "paragraph", 
      data: { 
        text: language === 'en' 
          ? "Participants comprised 250 undergraduate students (150 female, 100 male) aged 18 to 22. Materials utilized included the Student Engagement Scale (SES) and the Perceived Stress Scale (PSS-10). The experimental procedure involved bi-weekly self-reported questionnaires administered online, combined with tracking LMS activity logs throughout the semester." 
          : "Partisipan terdiri dari 250 mahasiswa sarjana (150 perempuan, 100 laki-laki) berusia 18 hingga 22 tahun. Materi yang digunakan meliputi Skala Keterlibatan Siswa (SES) dan Skala Stres Persepsi (PSS-10). Prosedur eksperimen melibatkan kuesioner laporan diri dua mingguan yang diberikan secara online, dikombinasikan dengan pelacakan log aktivitas LMS sepanjang semester." 
      } 
    },
    { 
      id: "h-apa-3-" + Math.random().toString(36).substring(2, 9), 
      type: "header", 
      data: { 
        text: language === 'en' ? "Results" : "Hasil", 
        level: 2 
      } 
    },
    { 
      id: "p-apa-3-" + Math.random().toString(36).substring(2, 9), 
      type: "paragraph", 
      data: { 
        text: language === 'en' 
          ? "A repeated-measures ANOVA was conducted to analyze changes in engagement scores across the semester. The main effect of learning modality was statistically significant, F(2, 248) = 14.25, p < .001. Post-hoc analysis using Bonferroni correction revealed that students reported lower emotional engagement during weeks with entirely asynchronous activities compared to synchronous hybrid sessions." 
          : "ANOVA ukuran berulang dilakukan untuk menganalisis perubahan skor keterlibatan sepanjang semester. Efek utama dari modalitas pembelajaran secara statistik signifikan, F(2, 248) = 14.25, p < 0,001. Analisis post-hoc menggunakan koreksi Bonferroni mengungkapkan bahwa siswa melaporkan keterlibatan emosional yang lebih rendah selama minggu-minggu dengan aktivitas sepenuhnya asinkron dibandingkan dengan sesi hibrida sinkron." 
      } 
    },
    { 
      id: "h-apa-4-" + Math.random().toString(36).substring(2, 9), 
      type: "header", 
      data: { 
        text: language === 'en' ? "Discussion" : "Pembahasan", 
        level: 2 
      } 
    },
    { 
      id: "p-apa-4-" + Math.random().toString(36).substring(2, 9), 
      type: "paragraph", 
      data: { 
        text: language === 'en' 
          ? "The findings support the hypothesis that structured hybrid learning environments foster higher student satisfaction compared to completely asynchronous setups. However, the rise in perceived stress scales during mid-semester highlights a critical need for academic support networks. Limitations of this study include relying on self-reported metrics, and future research should incorporate physiological indicators of cognitive fatigue." 
          : "Temuan ini mendukung hipotesis bahwa lingkungan pembelajaran hibrida terstruktur mendorong kepuasan mahasiswa yang lebih tinggi dibandingkan dengan pengaturan asinkron sepenuhnya. Namun, kenaikan skala stres persepsi selama pertengahan semester menyoroti kebutuhan kritis akan jaringan dukungan akademis. Batasan studi ini termasuk mengandalkan metrik laporan diri, dan penelitian masa depan harus memasukkan indikator fisiologis dari kelelahan kognitif." 
      } 
    }
  ];
}
