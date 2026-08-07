// lib/templates/skripsi.ts

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
          ? "In the current era of digitalization, higher education institutions are required to integrate information technology to improve the efficiency of academic processes. One crucial process is the management of final projects or undergraduate theses. Based on field observations, the process of submitting titles, academic advising, to defense scheduling is often still done manually or using semi-digital methods that lack integration. This leads to delays in study completion and a lack of transparency in student progress tracking. Therefore, this research designs a thesis management information system that automates the entire advising and administration workflow." 
          : "Di era digitalisasi saat ini, institusi pendidikan tinggi dituntut untuk mengintegrasikan teknologi informasi guna meningkatkan efisiensi proses akademis. Salah satu proses krusial adalah pengelolaan tugas akhir atau skripsi. Berdasarkan observasi di lapangan, proses pengajuan judul, bimbingan, hingga penjadwalan sidang seringkali masih dilakukan secara manual atau semi-digital yang kurang terintegrasi. Hal ini mengakibatkan keterlambatan penyelesaian studi dan kurangnya transparansi pelacakan kemajuan mahasiswa. Oleh karena itu, penelitian ini merancang sistem informasi manajemen tugas akhir yang mengotomatiskan seluruh alur bimbingan dan administrasi." 
      } 
    },
    { 
      id: "h-skripsi-2-" + Math.random().toString(36).substring(2, 9), 
      type: "header", 
      data: { 
        text: language === 'en' ? "Chapter 2: Literature Review" : "Bab 2: Tinjauan Pustaka", 
        level: 2 
      } 
    },
    { 
      id: "p-skripsi-2-" + Math.random().toString(36).substring(2, 9), 
      type: "paragraph", 
      data: { 
        text: language === 'en' 
          ? "This literature review discusses the fundamental theories of software engineering, the MVC (Model-View-Controller) architecture, and relational database systems. Previous research by Pratama and Wijaya (2023) indicates that the implementation of web-based information systems can improve coordination effectiveness between advisors and students by 45%. Furthermore, usability analysis using the System Usability Scale (SUS) method will be used as a reference framework to evaluate the user interface of the developed system." 
          : "Tinjauan pustaka ini membahas teori dasar mengenai rekayasa perangkat lunak, arsitektur MVC (Model-View-Controller), serta sistem basis data relasional. Penelitian terdahulu oleh Pratama dan Wijaya (2023) menunjukkan bahwa penerapan sistem informasi berbasis web dapat meningkatkan efektivitas koordinasi antara dosen pembimbing dan mahasiswa sebesar 45%. Selain itu, analisis kegunaan (usability) menggunakan metode System Usability Scale (SUS) akan digunakan sebagai kerangka acuan untuk mengevaluasi antarmuka pengguna sistem yang dikembangkan." 
      } 
    },
    { 
      id: "h-skripsi-3-" + Math.random().toString(36).substring(2, 9), 
      type: "header", 
      data: { 
        text: language === 'en' ? "Chapter 3: Research Methodology" : "Bab 3: Metode Penelitian", 
        level: 2 
      } 
    },
    { 
      id: "p-skripsi-3-" + Math.random().toString(36).substring(2, 9), 
      type: "paragraph", 
      data: { 
        text: language === 'en' 
          ? "The research methodology used follows the SDLC (Software Development Life Cycle) development model with a Waterfall approach. The stages begin with requirements analysis through interviews with the department head, system design using Unified Modeling Language (UML) such as Use Case Diagrams and Class Diagrams, coding implementation using React and Node.js, and end with functionality testing using the Black-Box testing method." 
          : "Metodologi penelitian yang digunakan mengikuti model pengembangan SDLC (Software Development Life Cycle) dengan pendekatan Waterfall. Tahapan dimulai dari analisis kebutuhan melalui wawancara dengan program studi, perancangan sistem menggunakan Unified Modeling Language (UML) seperti Use Case Diagram dan Class Diagram, implementasi pengodean menggunakan React dan Node.js, hingga pengujian fungsionalitas menggunakan metode Black-Box testing." 
      } 
    },
    { 
      id: "h-skripsi-4-" + Math.random().toString(36).substring(2, 9), 
      type: "header", 
      data: { 
        text: language === 'en' ? "Chapter 4: Results and Discussion" : "Bab 4: Hasil dan Pembahasan", 
        level: 2 
      } 
    },
    { 
      id: "p-skripsi-4-" + Math.random().toString(36).substring(2, 9), 
      type: "paragraph", 
      data: { 
        text: language === 'en' 
          ? "The developed thesis management information system has been successfully implemented and thoroughly tested. Black-Box functionality testing shows a 100% success rate for all major modules, including title draft submission, revision file upload, and online advising logs. The user satisfaction evaluation using the SUS questionnaire yielded an average score of 82.5, which falls into the 'Excellent' (Acceptable) category. This data analysis confirms that the system is suitable for widespread deployment." 
          : "Sistem informasi manajemen tugas akhir yang dikembangkan telah berhasil diimplementasikan dan diuji secara menyeluruh. Pengujian fungsionalitas Black-Box menunjukkan tingkat keberhasilan 100% untuk semua modul utama, termasuk pengajuan draf judul, unggah berkas revisi, dan log bimbingan online. Evaluasi kepuasan pengguna menggunakan kuesioner SUS menghasilkan skor rata-rata 82,5, yang termasuk dalam kategori 'Excellent' (Acceptable). Analisis data ini mengonfirmasi bahwa sistem layak digunakan secara luas." 
      } 
    },
    { 
      id: "h-skripsi-5-" + Math.random().toString(36).substring(2, 9), 
      type: "header", 
      data: { 
        text: language === 'en' ? "Chapter 5: Conclusion" : "Bab 5: Penutup", 
        level: 2 
      } 
    },
    { 
      id: "p-skripsi-5-" + Math.random().toString(36).substring(2, 9), 
      type: "paragraph", 
      data: { 
        text: language === 'en' 
          ? "This research concludes that the design and implementation of the web-based thesis management information system successfully overcomes manual bureaucracy bottlenecks by providing transparent advising tracking for students and lecturers. For future work, it is recommended to add a real-time notification module via WhatsApp API and integrate an automatic plagiarism detection system for uploaded proposal documents." 
          : "Penelitian ini menyimpulkan bahwa rancang bangun sistem informasi manajemen tugas akhir berbasis web berhasil mengatasi kendala birokrasi manual dengan menyediakan transparansi pelacakan bimbingan bagi mahasiswa dan dosen. Untuk pengembangan di masa mendatang, disarankan menambahkan modul notifikasi real-time via WhatsApp API dan integrasi sistem deteksi plagiarisme otomatis pada dokumen proposal yang diunggah." 
      } 
    }
  ];
}
