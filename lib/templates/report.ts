// lib/templates/report.ts

export function getReportTemplate(language: 'en' | 'id') {
  return [
    { 
      id: "h-rep-1-" + Math.random().toString(36).substring(2, 9), 
      type: "header", 
      data: { 
        text: language === 'en' ? "Executive Summary" : "Ringkasan Eksekutif", 
        level: 2 
      } 
    },
    { 
      id: "p-rep-1-" + Math.random().toString(36).substring(2, 9), 
      type: "paragraph", 
      data: { 
        text: language === 'en' 
          ? "This research report evaluates the feasibility of expanding our e-grocery delivery operations into secondary metropolitan areas in Indonesia. By analyzing demographic shifts and purchasing power indices, the study suggests that a phased expansion starting in early 2027 will yield a 15% increase in annual active users. Initial capital expenditures will be balanced by operational efficiencies achieved through local hub-spoke distribution networks." 
          : "Laporan riset ini mengevaluasi kelayakan perluasan operasi pengiriman e-grocery kami ke wilayah metropolitan sekunder di Indonesia. Dengan menganalisis pergeseran demografis dan indeks daya beli, studi ini menyarankan bahwa ekspansi bertahap mulai awal 2027 akan menghasilkan peningkatan 15% pengguna aktif tahunan. Pengeluaran modal awal akan diseimbangkan oleh efisiensi operasional yang dicapai melalui jaringan distribusi hub-spoke lokal." 
      } 
    },
    { 
      id: "h-rep-2-" + Math.random().toString(36).substring(2, 9), 
      type: "header", 
      data: { 
        text: language === 'en' ? "Background & Problem" : "Latar Belakang & Masalah", 
        level: 2 
      } 
    },
    { 
      id: "p-rep-2-" + Math.random().toString(36).substring(2, 9), 
      type: "paragraph", 
      data: { 
        text: language === 'en' 
          ? "The domestic e-grocery sector has experienced saturation in primary tier-1 cities, driving the need for new market exploration. While tier-2 cities present substantial growth potential, logistical infrastructures remain underdeveloped. This study outlines key supply-chain bottlenecks and consumer behavior variations that differ significantly from urban centers." 
          : "Sektor e-grocery domestik telah mengalami saturasi di kota-kota utama tier-1, mendorong kebutuhan akan eksplorasi pasar baru. Meskipun kota-kota tier-2 menyajikan potensi pertumbuhan yang besar, infrastruktur logistik masih kurang berkembang. Studi ini menguraikan hambatan rantai pasok utama dan variasi perilaku konsumen yang berbeda secara signifikan dari pusat perkotaan." 
      } 
    },
    { 
      id: "h-rep-3-" + Math.random().toString(36).substring(2, 9), 
      type: "header", 
      data: { 
        text: language === 'en' ? "Data Analysis & Findings" : "Analisis Data & Temuan", 
        level: 2 
      } 
    },
    { 
      id: "p-rep-3-" + Math.random().toString(36).substring(2, 9), 
      type: "paragraph", 
      data: { 
        text: language === 'en' 
          ? "Data collected from 1,200 survey respondents indicates a strong preference for fresh produce delivery over dry goods. Cross-tabulation reveals that families with dual incomes spend 25% more on digital grocery services compared to single-income households. Moreover, localized delivery route optimization is projected to reduce average last-mile delivery times by 18 minutes." 
          : "Data yang dikumpulkan dari 1.200 responden survei menunjukkan preferensi yang kuat untuk pengiriman produk segar dibandingkan barang kering. Tabulasi silang mengungkapkan bahwa keluarga dengan pendapatan ganda membelanjakan 25% lebih banyak untuk layanan grocery digital dibandingkan dengan rumah tangga berpendapatan tunggal. Selain itu, optimalisasi rute pengiriman lokal diproyeksikan mengurangi waktu pengiriman jarak terakhir rata-rata sebesar 18 menit." 
      } 
    },
    { 
      id: "h-rep-4-" + Math.random().toString(36).substring(2, 9), 
      type: "header", 
      data: { 
        text: language === 'en' ? "Recommendations & Solutions" : "Rekomendasi & Solusi", 
        level: 2 
      } 
    },
    { 
      id: "p-rep-4-" + Math.random().toString(36).substring(2, 9), 
      type: "paragraph", 
      data: { 
        text: language === 'en' 
          ? "We recommend establishing micro-fulfillment centers (MFCs) in strategic suburban nodes. Partnering with local agricultural cooperatives will stabilize inventory supplies and lower transport costs. Furthermore, launching targeted localization campaigns via social commerce is key to establishing early brand presence prior to full operations." 
          : "Kami merekomendasikan pembentukan pusat pemenuhan mikro (micro-fulfillment center/MFC) di titik-titik pinggiran kota yang strategis. Kemitraan dengan koperasi pertanian lokal akan menstabilkan pasokan inventaris dan menurunkan biaya transportasi. Selain itu, meluncurkan kampanye lokalisasi terarah melalui social commerce adalah kunci untuk membangun kehadiran merek awal sebelum operasi penuh." 
      } 
    }
  ];
}
