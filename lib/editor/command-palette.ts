// lib/editor/command-palette.ts
// Academic Command Palette & Global Shortcut Hub Engine (Phase 26)

export type CommandCategory = 
  | 'ai'
  | 'citations'
  | 'insert'
  | 'review'
  | 'formatting'
  | 'navigation'
  | 'system';

export interface CommandItem {
  id: string;
  title: string;
  description: string;
  tooltip: string; // Comprehensive explanation for tooltip modal/badge
  category: CommandCategory;
  shortcut?: string;
  keywords: string[];
  actionId: string;
  badge?: string;
}

export interface CommandCategoryMeta {
  id: CommandCategory | 'all';
  labelEn: string;
  labelId: string;
  icon: string;
}

export const COMMAND_CATEGORIES: CommandCategoryMeta[] = [
  { id: 'all', labelEn: 'All Actions', labelId: 'Semua Perintah', icon: 'IconSparkles' },
  { id: 'ai', labelEn: 'AI Research Assistant', labelId: 'Asisten Riset AI', icon: 'IconBrain' },
  { id: 'review', labelEn: 'Peer Review & Integrity', labelId: 'Peer Review & Integritas', icon: 'IconMicroscope' },
  { id: 'citations', labelEn: 'Citations & Literature', labelId: 'Sitasi & Referensi', icon: 'IconQuote' },
  { id: 'insert', labelEn: 'Insert Elements', labelId: 'Sisipkan Elemen', icon: 'IconCirclePlus' },
  { id: 'formatting', labelEn: 'Citation Styles', labelId: 'Format Gaya Sitasi', icon: 'IconFileText' },
  { id: 'navigation', labelEn: 'View & History', labelId: 'Tampilan & Riwayat', icon: 'IconHistory' },
  { id: 'system', labelEn: 'System & Export', labelId: 'Sistem & Ekspor', icon: 'IconSettings' },
];

/**
 * Returns default academic commands with bilingual EN/ID tooltips and descriptions
 */
export function getAvailableCommands(language: 'en' | 'id'): CommandItem[] {
  const isEn = language === 'en';

  return [
    // --- REVIEW & INTEGRITY ---
    {
      id: 'cmd_peer_review',
      title: isEn ? 'Reviewer #2 Simulation' : 'Simulasi Reviewer #2',
      description: isEn ? 'Simulate critical peer review for Scopus/SINTA readiness' : 'Simulasi peer review buta kritis untuk kesiapan Scopus/SINTA',
      tooltip: isEn
        ? 'Performs a deep editorial audit simulating harsh Reviewer #2 feedback. Evaluates methodology rigour, novelty claims, argument coherence, and citation vulnerabilities with an actionable submission checklist.'
        : 'Melakukan audit editorial naskah dengan persona Reviewer #2 yang kritis. Mengevaluasi metodologi, klaim kebaruan riset, koherensi argumen saintifik, dan celah sitasi beserta checklist kesiapan submit.',
      category: 'review',
      shortcut: 'Ctrl + Shift + R',
      keywords: ['reviewer', 'review', 'audit', 'scopus', 'sinta', 'peer review', 'jurnal', 'journal'],
      actionId: 'open_peer_review',
      badge: 'Scopus/SINTA',
    },
    {
      id: 'cmd_integrity_barometer',
      title: isEn ? 'Academic Integrity & AI Barometer' : 'Barometer Integritas & Deteksi AI',
      description: isEn ? 'Real-time originality speedometer (Burstiness, Cliché, TTR)' : 'Speedometer orisinalitas naskah real-time (Burstiness, Klise, TTR)',
      tooltip: isEn
        ? 'Visualizes real-time academic integrity index combining sentence burstiness variance, lexical diversity, AI cliché density, and syntactic rhythm. Highlights high-risk sentences for instant humanization.'
        : 'Memvisualisasikan skor orisinalitas naskah real-time menggunakan indeks gabungan variasi panjang kalimat (burstiness), keberagaman leksikal (TTR), densitas kata klise AI, dan ritme sintaksis.',
      category: 'review',
      shortcut: 'Ctrl + Shift + I',
      keywords: ['plagiat', 'plagiarism', 'integrity', 'barometer', 'ai detector', 'burstiness', 'orisinalitas'],
      actionId: 'open_integrity_barometer',
      badge: 'Realtime',
    },
    {
      id: 'cmd_paper_chat',
      title: isEn ? 'Chat with Paper / Literature Q&A' : 'Tanya Paper / Literature Q&A',
      description: isEn ? 'Ask methodology and findings from your library references' : 'Gali wawasan metodologi, temuan kunci, dan sintesis dari paper rujukan',
      tooltip: isEn
        ? 'Opens literature dialogue assistant to inspect methodology, sample size, key conclusions, and limitations of stored library papers with 1-click citation quoting to editor.'
        : 'Membuka dialog asisten literatur untuk menanyakan metodologi, sampel data, temuan kunci, dan batasan paper referensi dengan tombol kutip langsung ke naskah.',
      category: 'citations',
      shortcut: 'Ctrl + Shift + P',
      keywords: ['chat', 'paper', 'library', 'literature', 'tanya', 'buku', 'referensi'],
      actionId: 'open_paper_chat',
      badge: 'Library',
    },

    // --- AI ASSISTANT ---
    {
      id: 'cmd_toggle_ghostwriter',
      title: isEn ? 'Toggle Ghostwriter Auto-Complete' : 'Aktifkan/Nonaktifkan Ghostwriter AI',
      description: isEn ? 'Inline gray copilot predictive sentence suggestion' : 'Saran kalimat prediktif inline abu-abu saat mengetik',
      tooltip: isEn
        ? 'Enables or disables academic copilot autocomplete. Automatically predicts formal academic sentence completions as you type with Tab to accept or Esc to dismiss.'
        : 'Mengaktifkan atau mematikan saran penulisan prediktif cerdas. Memberikan saran kelanjutan kalimat akademis abu-abu secara otomatis saat Anda mengetik naskah.',
      category: 'ai',
      shortcut: 'Ctrl + Shift + G',
      keywords: ['ghostwriter', 'autocomplete', 'copilot', 'saran', 'predictive'],
      actionId: 'toggle_ghostwriter',
    },
    {
      id: 'cmd_improve_writing',
      title: isEn ? 'Improve & Polish Academic Writing' : 'Poles Tulisan Akademis (Improve)',
      description: isEn ? 'Enhance vocabulary, flow, and scholarly tone' : 'Tingkatkan diksi ilmiah, tata bahasa, dan alur akademis',
      tooltip: isEn
        ? 'Refines selected paragraph with formal scholarly tone, rigorous transition markers, and passive academic voice suitable for high-impact journals.'
        : 'Memoles paragraf yang dipilih dengan gaya bahasa ilmiah baku, transisi logis yang kuat, dan struktur kalimat formal sesuai standar jurnal bereputasi.',
      category: 'ai',
      keywords: ['improve', 'polish', 'tulis', 'grammar', 'perbaiki', 'bahasa'],
      actionId: 'improve_writing',
    },
    {
      id: 'cmd_paraphrase',
      title: isEn ? 'Paraphrase Studio' : 'Studio Parafrase Cerdas',
      description: isEn ? 'Rephrase text to lower similarity & increase fluency' : 'Ubah susunan kalimat untuk menekan plagiarisme & memperjelas makna',
      tooltip: isEn
        ? 'Restructures sentences to maintain core scholarly meaning while maximizing lexical variety and eliminating repetitive AI syntactical patterns.'
        : 'Menyusun ulang kalimat dengan mempertahankan esensi ilmiah asli sekaligus meningkatkan variasi kosakata untuk menghindari deteksi kemiripan turnitin.',
      category: 'ai',
      keywords: ['paraphrase', 'parafrase', 'rewrite', 'humanize', 'ubah kalimat'],
      actionId: 'open_paraphrase',
    },
    {
      id: 'cmd_generate_abstract',
      title: isEn ? 'Generate Academic Abstract' : 'Buat Abstrak Naskah Otomatis',
      description: isEn ? 'Synthesize IMRAD structured abstract from current document' : 'Sintesis abstrak berstruktur IMRAD dari draf naskah saat ini',
      tooltip: isEn
        ? 'Synthesizes an IMRAD (Introduction, Method, Results, and Discussion) abstract with word-count constraint (150-250 words) from active manuscript text.'
        : 'Menghasilkan abstrak terstruktur IMRAD (Pendahuluan, Metode, Hasil, dan Pembahasan) sekitar 150-250 kata berdasarkan konten naskah aktif.',
      category: 'ai',
      keywords: ['abstract', 'abstrak', 'summary', 'ringkasan', 'imrad'],
      actionId: 'generate_abstract',
    },

    // --- CITATIONS & FORMATTING ---
    {
      id: 'cmd_find_citation',
      title: isEn ? 'Search Citations (Crossref & OpenAlex)' : 'Cari Sitasi (Crossref & OpenAlex)',
      description: isEn ? 'Find peer-reviewed papers by title, author, or DOI' : 'Cari paper ilmiah terindeks berdasarkan judul, penulis, atau DOI',
      tooltip: isEn
        ? 'Queries global bibliographic indexes (Crossref, OpenAlex, Semantic Scholar) and inserts in-text citations with instant bibliography linking.'
        : 'Melakukan pencarian ke database bibliografi global dan menyisipkan sitasi ke teks naskah lengkap dengan sinkronisasi otomatis ke daftar pustaka.',
      category: 'citations',
      shortcut: 'Ctrl + Shift + C',
      keywords: ['cite', 'citation', 'sitasi', 'referensi', 'crossref', 'openalex', 'doi'],
      actionId: 'search_citation',
    },
    {
      id: 'cmd_style_apa',
      title: 'APA 7th Edition (Author, Year)',
      description: isEn ? 'Switch citation style to APA: (Smith & Doe, 2024)' : 'Ubah gaya sitasi ke format APA: (Smith & Doe, 2024)',
      tooltip: isEn
        ? 'Converts all in-text citations to author-year parenthetical format and sorts bibliography alphabetically by first author surname.'
        : 'Mengonversi seluruh sitasi naskah ke format penulis-tahun dan menyusun daftar pustaka secara alfabetis A-Z nama belakang penulis.',
      category: 'formatting',
      keywords: ['apa', 'apa 7', 'citation style', 'format sitasi', 'author year'],
      actionId: 'set_style_apa',
      badge: 'APA 7th',
    },
    {
      id: 'cmd_style_ieee',
      title: 'IEEE Style [Numeric Index]',
      description: isEn ? 'Switch citation style to IEEE: [1], [2]-[4]' : 'Ubah gaya sitasi ke format numerik IEEE: [1], [2]-[4]',
      tooltip: isEn
        ? 'Converts citations to bracketed numbers ordered strictly by their appearance in the manuscript text, standard for Engineering & Computer Science.'
        : 'Mengonversi sitasi ke penomoran kurung siku berurutan sesuai kemunculan pertama pada naskah, standar IEEE untuk teknik & ilmu komputer.',
      category: 'formatting',
      keywords: ['ieee', 'numeric', 'angka', 'engineering', 'komputer'],
      actionId: 'set_style_ieee',
      badge: 'IEEE',
    },
    {
      id: 'cmd_style_harvard',
      title: 'Harvard Style (Author Year)',
      description: isEn ? 'Switch citation style to Harvard: (Smith and Doe 2024)' : 'Ubah gaya sitasi ke Harvard: (Smith and Doe 2024)',
      tooltip: isEn
        ? 'Standard author-year format without comma separator between author and year in parenthetical citations.'
        : 'Format standar penulis-tahun tanpa tanda koma di antara nama penulis dan tahun pada sitasi dalam kurung.',
      category: 'formatting',
      keywords: ['harvard', 'author year', 'uk'],
      actionId: 'set_style_harvard',
      badge: 'Harvard',
    },
    {
      id: 'cmd_style_vancouver',
      title: 'Vancouver Style (1) [Medical/Health]',
      description: isEn ? 'Switch citation style to Vancouver: (1) numeric' : 'Ubah gaya sitasi ke Vancouver numerik: (1)',
      tooltip: isEn
        ? 'Parenthetical numeric citation system required by medical, biomedical, and health sciences journals.'
        : 'Sistem penomoran kurung lengkung numerik yang diwajibkan oleh jurnal kedokteran, biomedis, dan ilmu kesehatan.',
      category: 'formatting',
      keywords: ['vancouver', 'medical', 'kesehatan', 'kedokteran'],
      actionId: 'set_style_vancouver',
      badge: 'Vancouver',
    },

    // --- INSERT ELEMENTS ---
    {
      id: 'cmd_insert_math',
      title: isEn ? 'Insert LaTeX Math Formula' : 'Sisipkan Rumus Matematika LaTeX',
      description: isEn ? 'Add KaTeX equation block or inline formula ($$)' : 'Tambahkan blok persamaan matematika KaTeX atau rumus ($$)',
      tooltip: isEn
        ? 'Inserts a formatted mathematical formula block rendered via KaTeX. Supports matrix, integrals, fractions, Greek symbols, and complex theorems.'
        : 'Menyisipkan rumus matematika terformat menggunakan mesin KaTeX. Mendukung matriks, integral, pecahan, simbol Yunani, dan teorema kompleks.',
      category: 'insert',
      shortcut: 'Ctrl + M',
      keywords: ['math', 'latex', 'rumus', 'persamaan', 'formula', 'katex'],
      actionId: 'insert_math',
    },
    {
      id: 'cmd_insert_bibliography',
      title: isEn ? 'Insert Bibliography / References Block' : 'Sisipkan Daftar Pustaka / Referensi',
      description: isEn ? 'Generate complete formatted reference list at cursor' : 'Buat daftar rujukan terformat lengkap di posisi kursor aktif',
      tooltip: isEn
        ? 'Generates a dynamically sorted bibliography list of all cited sources formatted in your active citation style.'
        : 'Menghasilkan daftar pustaka lengkap dari seluruh paper yang disitasi dalam naskah, otomatis terformat sesuai gaya sitasi aktif.',
      category: 'insert',
      keywords: ['bibliography', 'daftar pustaka', 'referensi', 'rujukan', 'references'],
      actionId: 'insert_bibliography',
    },
    {
      id: 'cmd_insert_image',
      title: isEn ? 'Insert Image / Figure' : 'Sisipkan Gambar / Diagram',
      description: isEn ? 'Upload or link research figure with caption' : 'Unggah atau tautkan gambar riset lengkap dengan takarir (caption)',
      tooltip: isEn
        ? 'Inserts an academic figure block with numbered caption and source attribution.'
        : 'Menyisipkan gambar penelitian dengan takarir berpenomoran dan atribusi sumber gambar.',
      category: 'insert',
      keywords: ['image', 'figure', 'gambar', 'diagram', 'chart', 'foto'],
      actionId: 'insert_image',
    },

    // --- NAVIGATION & SYSTEM ---
    {
      id: 'cmd_version_history',
      title: isEn ? 'Version History & Time Machine' : 'Riwayat Versi & Time Machine',
      description: isEn ? 'Inspect past snapshots, word-by-word diffs & restore' : 'Lihat revisi terdahulu, perbandingan teks LCS, & pulihkan naskah',
      tooltip: isEn
        ? 'Opens document revision timeline. Compare changes word-by-word with green additions and red deletions, or restore any checkpoint safely.'
        : 'Membuka garis waktu revisi naskah. Bandingkan perubahan kata-per-kata dengan penanda hijau/merah, atau pulihkan versi naskah sebelumnya dengan aman.',
      category: 'navigation',
      shortcut: 'Ctrl + H',
      keywords: ['history', 'revisi', 'version', 'time machine', 'restore', 'pulihkan'],
      actionId: 'open_version_history',
    },
    {
      id: 'cmd_keyboard_shortcuts',
      title: isEn ? 'Keyboard Shortcuts Cheat Sheet' : 'Daftar Pintasan Keyboard',
      description: isEn ? 'View all keyboard shortcuts and productivity tips' : 'Tampilkan daftar lengkap pintasan keyboard & tips produktivitas',
      tooltip: isEn
        ? 'Shows visual cheat sheet of all available keyboard combinations for lightning-fast writing without leaving your keyboard.'
        : 'Menampilkan panduan visual seluruh kombinasi tombol pintasan keyboard untuk mempercepat penulisan naskah tanpa repot mengklik mouse.',
      category: 'navigation',
      shortcut: '?',
      keywords: ['shortcut', 'keyboard', 'hotkey', 'tombol', 'bantuan'],
      actionId: 'open_shortcuts',
    },
    {
      id: 'cmd_export_word',
      title: isEn ? 'Export to Microsoft Word (.docx)' : 'Ekspor ke Microsoft Word (.docx)',
      description: isEn ? 'Download formatted DOCX with native references' : 'Unduh naskah DOCX terformat dengan daftar pustaka resmi',
      tooltip: isEn
        ? 'Generates a publication-ready Microsoft Word document with proper typography, heading hierarchy, tables, and formatted bibliography.'
        : 'Menghasilkan dokumen Microsoft Word (.docx) siap kirim dengan hierarki judul yang rapi, tabel, dan daftar rujukan terformat.',
      category: 'system',
      keywords: ['export', 'word', 'docx', 'unduh', 'download'],
      actionId: 'export_word',
      badge: '.DOCX',
    },
    {
      id: 'cmd_export_pdf',
      title: isEn ? 'Export to PDF Document (.pdf)' : 'Ekspor ke Dokumen PDF (.pdf)',
      description: isEn ? 'Print or save publication-grade PDF file' : 'Cetak atau simpan naskah PDF berkualitas publikasi',
      tooltip: isEn
        ? 'Compiles document to academic printable PDF with clean margins, embedded equations, and professional layout.'
        : 'Mengompilasi naskah menjadi dokumen PDF yang rapi dengan margin standar, rumus KaTeX jernih, dan tata letak profesional.',
      category: 'system',
      keywords: ['export', 'pdf', 'cetak', 'print', 'download'],
      actionId: 'export_pdf',
      badge: '.PDF',
    },
    {
      id: 'cmd_export_latex',
      title: isEn ? 'Export to LaTeX Package (.tex + .bib Zip)' : 'Ekspor Paket LaTeX Jurnal (.tex + .bib Zip)',
      description: isEn ? 'Download Overleaf-ready ZIP with IEEE, Elsevier, or ACM templates' : 'Unduh paket ZIP siap Overleaf dengan template IEEE, Elsevier, atau ACM',
      tooltip: isEn
        ? 'Compiles manuscript blocks into standardized LaTeX document (.tex) and BibTeX references (.bib) bundled in an Overleaf-ready ZIP package.'
        : 'Mengompilasi naskah menjadi dokumen LaTeX standar (.tex) dan rujukan BibTeX (.bib) terpadu dalam paket ZIP siap Overleaf.',
      category: 'system',
      shortcut: 'Ctrl + Shift + X',
      keywords: ['latex', 'tex', 'overleaf', 'ieee', 'elsevier', 'acm', 'bibtex', 'zip', 'export'],
      actionId: 'export_latex',
      badge: 'Overleaf / Zip',
    },
    {
      id: 'cmd_toggle_theme',
      title: isEn ? 'Toggle Dark / Light Mode' : 'Ganti Tema Gelap / Terang',
      description: isEn ? 'Switch visual theme for comfortable day/night writing' : 'Beralih antara tema gelap dan terang untuk kenyamanan mata',
      tooltip: isEn
        ? 'Toggles high-contrast dark mode to reduce eye strain during late-night paper writing sessions.'
        : 'Mengubah tema visual antara mode gelap untuk kenyamanan mata saat menulis malam hari dan mode terang yang jernih.',
      category: 'system',
      shortcut: 'Ctrl + Shift + D',
      keywords: ['dark', 'light', 'theme', 'tema', 'gelap', 'terang', 'warna'],
      actionId: 'toggle_theme',
    },
    {
      id: 'cmd_toggle_language',
      title: isEn ? 'Switch Language (Bahasa Indonesia)' : 'Ganti Bahasa (English)',
      description: isEn ? 'Change application interface language' : 'Ubah bahasa antarmuka aplikasi',
      tooltip: isEn
        ? 'Instantly switches the entire user interface and AI prompt configurations between English and Bahasa Indonesia.'
        : 'Beralih seketika antara Bahasa Indonesia dan Bahasa Inggris untuk seluruh antarmuka dan konfigurasi AI.',
      category: 'system',
      keywords: ['language', 'bahasa', 'english', 'indonesia', 'terjemah'],
      actionId: 'toggle_language',
    },
  ];
}

/**
 * Filter commands based on search term and active category
 */
export function filterCommands(
  commands: CommandItem[],
  query: string,
  categoryFilter: CommandCategory | 'all' = 'all'
): CommandItem[] {
  const cleanQuery = (query || '').trim().toLowerCase();

  return commands.filter((cmd) => {
    // Category match
    if (categoryFilter !== 'all' && cmd.category !== categoryFilter) {
      return false;
    }

    // No search query -> return all in category
    if (!cleanQuery) return true;

    // Search query matches title, description, keywords, or shortcut
    if (cmd.title.toLowerCase().includes(cleanQuery)) return true;
    if (cmd.description.toLowerCase().includes(cleanQuery)) return true;
    if (cmd.keywords.some((kw) => kw.toLowerCase().includes(cleanQuery))) return true;
    if (cmd.shortcut && cmd.shortcut.toLowerCase().includes(cleanQuery)) return true;
    if (cmd.badge && cmd.badge.toLowerCase().includes(cleanQuery)) return true;

    return false;
  });
}
