// lib/editor/burstiness-engine.ts
// Calculates sentence variance (burstiness) to detect AI vs Human patterns

export interface BurstinessMetrics {
  totalWords: number;
  totalSentences: number;
  averageSentenceLength: number;
  standardDeviation: number;
  burstinessScore: number;
  status: 'human' | 'warning' | 'ai';
  sentenceData: Array<{ index: number; words: number; text: string }>;
  buzzwordCount: number;
  detectedBuzzwords: Array<{ word: string; count: number }>;
  phraseCount?: number;
  detectedPhrases?: Array<{ phrase: string; count: number }>;
}

export const AI_BUZZWORDS = [
  // English AI Buzzwords (Original Baseline)
  'delve', 'tapestry', 'crucial', 'seamless', 'multifaceted', 'paramount',
  'realm', 'foster', 'landscape', 'intricate', 'testament', 'furthermore',
  'moreover', 'pivotal', 'underscore', 'embark', 'navigating', 'demystify',
  'comprehensive', 'nuance', 'unprecedented', 'vital', 'harness', 'leverage',
  'paradigm', 'symbiosis', 'myriad', 'catalyst', 'spearhead', 'trajectory',
  'imperative', 'synergy', 'transformative', 'meticulous', 'orchestrate',
  'elucidate', 'intricacies', 'resonates', 'interplay', 'cornerstone',
  // English AI Extended Lexicon (Wikipedia WP:AISIGNS & Computational Linguistics)
  'bolster', 'bolstered', 'cultivate', 'cultivating', 'encapsulate', 'encapsulating',
  'epitomize', 'epitomizing', 'fostering', 'illuminate', 'illuminating',
  'intertwine', 'intertwined', 'meticulously', 'propel', 'propelling',
  'redefine', 'redefining', 'showcase', 'showcases', 'showcasing',
  'transcend', 'transcending', 'underscores', 'underscoring', 'resonate',
  'resonating', 'garner', 'garnered', 'garnering', 'herald', 'heralded',
  'champion', 'championing', 'groundbreaking', 'indelible', 'indispensable',
  'quintessential', 'renowned', 'steadfast', 'enduring', 'exemplary',
  'commendable', 'holistic', 'noteworthy', 'beacon', 'bedrock', 'hallmark',
  'mosaic', 'nexus', 'conduit', 'apex', 'panoply', 'linchpin', 'bastion',
  'amplify', 'amplifying', 'augment', 'augmenting', 'dissect', 'dissecting',
  'engender', 'engendering', 'galvanize', 'galvanizing', 'harmonize', 'harmonizing',
  'instigate', 'instigating', 'manifest', 'manifesting', 'nurture', 'nurturing',
  'permeate', 'permeating', 'reverberate', 'reverberating', 'unravel', 'unraveling',
  'unveil', 'unveiling', 'boundless', 'captivating', 'consequential', 'formidable',
  'invaluable', 'kaleidoscopic', 'luminous', 'monumental', 'palpable', 'pervasive',
  'resilient', 'salient', 'seminal', 'unwavering', 'crucible', 'epitome', 'paragon',
  'pinnacle', 'vanguard', 'watershed', 'zenith', 'profoundly', 'seamlessly', 'ubiquitously',
  // Indonesian AI Klise (Original Baseline)
  'esensial', 'krusial', 'signifikan', 'menggarisbawahi', 'menyoroti',
  'komprehensif', 'transformasi', 'era', 'digital', 'lanskap', 'ranah',
  'paradigma', 'sinergi', 'katalis', 'berkaitan', 'seiring', 'berkembangnya',
  'zaman', 'navigasi', 'kompleksitas', 'nuansa', 'menyelaraskan', 'inovatif',
  'dinamis', 'memfasilitasi', 'mengintegrasikan', 'relevan', 'konteks',
  'mendorong', 'menjembatani', 'merajut', 'peran', 'penting', 'tantangan',
  'peluang', 'mendasar', 'pilar', 'fondasi', 'berkesinambungan',
  // Indonesian AI Extended Lexicon (Padanan Empiris Ilmiah)
  'membedah', 'mengartikulasikan', 'mempertegas', 'mengakselerasi', 'mentransformasi',
  'menyinergikan', 'menautkan', 'merangkul', 'mengejawantahkan', 'mengukuhkan',
  'mencetuskan', 'merefleksikan', 'fundamental', 'terobosan', 'mendalam',
  'substansial', 'integratif', 'progresif', 'representatif', 'transformatif',
  'berkelanjutan', 'berkelindan', 'berdaya', 'poros', 'tonggak', 'mozaik',
  'ekosistem', 'kancah', 'wahana', 'prakarsa', 'dinamika',
  'menggali', 'menelaah', 'mengakomodasi', 'mengoptimalisasi', 'mengoptimalkan',
  'menyuguhkan', 'menghadirkan', 'memanifestasikan', 'mengorkestrasi', 'mengamplifikasi',
  'mentransmisikan', 'mencanangkan', 'menggemakan', 'memantik', 'mengelevasi',
  'menstimulasi', 'memproyeksikan', 'merekonstruksi', 'mengukir', 'memadukan',
  'mutakhir', 'visioner', 'kolektif', 'hakiki', 'mutlak', 'substansi',
  'autentik', 'variatif', 'masif', 'intensif', 'solutif', 'kredibel',
  'adaptif', 'strategis', 'spektrum', 'dimensi', 'korelasi', 'implikasi',
  'manifestasi', 'konvergensi', 'divergensi', 'proyeksi', 'orientasi', 'esensi',
  'disrupsi', 'dialektika', 'kulminasi', 'trajektori', 'matriks', 'konstelasi'
];

/**
 * Multi-word cliché phrases characteristic of LLM prose (Wikipedia WP:AISIGNS & stylistic analysis).
 * Maximized with 100+ phrases for English and 100+ phrases for Indonesian.
 */
export const AI_CLICHE_PHRASES = [
  // =========================================================================
  // 🇬🇧 ENGLISH AI CLICHÉ PHRASES (100 PHRASES)
  // =========================================================================
  // 1. Preamble & Opening Tropes
  'in today\'s rapidly evolving digital landscape',
  'in an era characterized by rapid technological advancement',
  'in today\'s increasingly interconnected world',
  'against the backdrop of contemporary academic discourse',
  'at the intersection of theory and practice',
  'with the advent of modern computational tools',
  'in the contemporary landscape of higher education',
  'from the perspective of modern scholarship',
  'across the broader spectrum of academic research',
  'in an age marked by unprecedented technological disruption',
  'amidst the burgeoning interest in artificial intelligence',
  'in the fast-paced and ever-changing realm of',
  'taking a closer look at the intricate mechanisms of',
  'as we navigate the complexities of the modern era',
  'in the context of an increasingly globalized society',

  // 2. Negative Parallelisms & False Dichotomies
  'not only does it address, but it also fosters',
  'it is not merely a matter of, but rather a profound',
  'rather than simply replacing, it serves as a bridge to',
  'no longer just about, but fundamentally about',
  'not simply a question of, but an urgent call for',
  'far from being an isolated phenomenon, it represents',
  'it is not just an incremental step, but a paradigm shift',
  'rather than adopting a monolithic approach, it embraces',
  'not merely theoretical, but with far-reaching practical implications',
  'it does not merely highlight, but fundamentally reshapes',
  'not confined to academic theory, but deeply rooted in real-world',
  'instead of treating it as an afterthought, it prioritizes',
  'it is not an either-or proposition, but a symbiotic balance',
  'not just a technological tool, but a transformative catalyst',
  'rather than operating in a vacuum, it interacts dynamically with',

  // 3. Inflated Significance, Legacy & Grandiosity
  'serves as a testament to the enduring power of',
  'stands as a testament to the transformative potential of',
  'stands as a beacon of innovative excellence',
  'plays a crucial and multifaceted role in',
  'plays a pivotal role in shaping the future of',
  'plays an indispensable role in the ongoing development of',
  'leaves an indelible mark on the trajectory of',
  'leaves an indelible footprint on modern scholarship',
  'marks a monumental turning point in the history of',
  'marks a significant milestone on the journey toward',
  'setting the stage for future scholarly exploration',
  'holds profound implications for both researchers and practitioners',
  'sheds invaluable light on the multifaceted nature of',
  'underscores the paramount importance of cultivating',
  'highlights the vital necessity of establishing a robust',
  'embarks on a transformative journey toward',
  'constitutes the cornerstone of contemporary understanding',
  'acts as a catalyst for widespread innovation and change',
  'paves the way for unprecedented breakthroughs in',
  'epitomizes the pinnacle of modern academic achievement',

  // 4. Superficial Impact Synthesis & Participle Endings
  'thereby paving the way for sustainable and resilient growth',
  'shedding invaluable light on the intricate dynamics of',
  'offering profound insights into the multifaceted challenges of',
  'bridging the critical gap between empirical evidence and practice',
  'unlocking new horizons for interdisciplinary collaboration',
  'fostering a deeper and more comprehensive understanding of',
  'ensuring that the underlying nuances are meticulously preserved',
  'cultivating a robust framework capable of addressing',
  'weaving a rich tapestry of scholarly perspectives across',
  'illuminating the complex interplay between key variables',
  'harnessing the collective potential of diverse stakeholders',
  'leveraging cutting-edge methodologies to enhance fidelity',
  'orchestrating a harmonious balance between theory and reality',
  'transcending traditional boundaries to forge novel insights',
  'spearheading meaningful and lasting transformation across the discipline',
  'bolstering the foundational pillars of scientific inquiry',
  'demystifying the underlying intricacies that govern',
  'encapsulating the essence of contemporary advancements',

  // 5. Weasel Words & Attribution Padding
  'a growing body of scholarly literature suggests that',
  'empirical evidence increasingly points to the conclusion that',
  'scholars and practitioners alike widely agree that',
  'industry observers and academic experts have frequently noted that',
  'numerous studies have consistently demonstrated the efficacy of',
  'it is widely recognized throughout the academic community that',
  'contemporary research has increasingly focused on the role of',
  'mounting evidence indicates that there is a strong correlation between',
  'it has become increasingly evident to researchers in the field that',
  'a consensus is gradually emerging among leading thinkers that',
  'recent investigations have shed critical new light on the fact that',
  'literature in this domain has consistently emphasized the importance of',
  'it is paramount to recognize that multiple studies have shown',
  'broad consensus across the disciplinary landscape confirms that',
  'prominent researchers have repeatedly underscored the necessity of',
  'independent studies have largely corroborated the assertion that',

  // 6. Formulaic Conclusions & Future Prospects
  'despite these promising advancements, numerous challenges still loom',
  'navigating these multifaceted hurdles will undoubtedly require concerted efforts',
  'the future outlook remains exceptionally promising as new horizons emerge',
  'a concerted effort among all relevant stakeholders is imperative to',
  'moving forward, it is essential to strike a delicate balance between',
  'as we look toward the future, one thing remains abundantly clear',
  'addressing these persistent challenges will be pivotal to unlocking',
  'while the path ahead is fraught with complexities, the potential rewards',
  'continued vigilance and empirical rigor will be essential in ensuring',
  'only through sustained interdisciplinary collaboration can we hope to',
  'the ongoing evolution of this field presents both unique opportunities and',
  'these findings underscore the critical need for continued investigation into',
  'ultimately, the true test of this approach will lie in its ability to',
  'charting a viable path forward demands an innovative and holistic approach',
  'in conclusion, while significant strides have undeniably been made',
  'future research must actively embrace these emerging paradigms to',

  // =========================================================================
  // 🇮🇩 INDONESIAN AI CLICHÉ PHRASES (100 PHRASES)
  // =========================================================================
  // 1. Pembuka Bab & Preamble Monoton
  'seiring dengan pesatnya perkembangan teknologi di era digital',
  'dalam pusaran arus globalisasi dan modernisasi yang kian pesat',
  'pada era disrupsi teknologi dan informasi dewasa ini',
  'berkaca pada dinamika sosial dan ekonomi yang terus berkembang',
  'di tengah pesatnya kemajuan ilmu pengetahuan dan teknologi',
  'menghadapi lanskap tantangan global yang semakin kompleks',
  'dalam konteks pembangunan yang berkelanjutan dan inklusif',
  'berangkat dari pemikiran dan urgensi yang mendasar mengenai',
  'jika ditelaah lebih mendalam dari perspektif keilmuan modern',
  'pada tatanan masyarakat yang semakin dinamis dan terhubung',
  'dalam lembaran sejarah perkembangan pemikiran akademik kontemporer',
  'sejalan dengan dinamika transformasi yang tengah bergulir',
  'menghadapi era keemasan transformasi digital yang kian masif',
  'di tengah gemuruh kemajuan peradaban dan sains abad ke-21',
  'memasuki babak baru dalam khazanah keilmuan dan penelitian',
  'merespons panggilan zaman yang menuntut inovasi berkelanjutan',

  // 2. Kontras Semu & Pola Negatif
  'bukan sekadar persoalan teknis semata, melainkan menyangkut aspek yang jauh lebih mendalam',
  'tidak hanya berfokus pada hasil akhir, melainkan turut memperkuat proses',
  'alih-alih hanya mengandalkan pendekatan konvensional, penelitian ini justru merajut',
  'bukan hanya menyentuh aspek permukaan, tetapi juga mengakar pada fondasi',
  'bukan lagi sekadar pilihan alternatif, melainkan telah menjadi sebuah keharusan',
  'tidak semata-mata berbicara mengenai teori, tetapi memiliki implikasi praktis',
  'alih-alih berjalan secara terpisah, kedua konsep ini saling berkelindan',
  'bukan sekadar instrumen pendukung, melainkan katalisator utama bagi',
  'tidak dapat dipandang secara monolitik, melainkan harus dilihat secara multidimensi',
  'bukan hanya menjadi tanggung jawab satu pihak, melainkan tugas kolektif bersama',
  'jauh dari kesan sederhana, fenomena ini justru menghadirkan kompleksitas',
  'tidak bersifat statis, melainkan bergerak secara dinamis dan terus bertransformasi',
  'bukan merupakan hambatan yang mematikan, melainkan pemantik inovasi baru',
  'tidak berdiri sendiri di ruang hampa, melainkan berinteraksi aktif dengan',
  'bukan hanya relevan untuk masa kini, melainkan menjadi kompas bagi masa depan',
  'alih-alih memicu polarisasi, perbedaan ini justru memperkaya khazanah',

  // 3. Peninggian Signifikansi & Retorika Megah
  'menjadi bukti nyata atas komitmen yang tak tergoyahkan dalam',
  'memainkan peran yang teramat krusial dan tak tergantikan dalam',
  'meninggalkan jejak yang tak terhapuskan dalam ranah keilmuan',
  'menjadi tonggak sejarah penting dalam perjalanan panjang',
  'membuka cakrawala baru bagi kemajuan penelitian dan pengembangan',
  'memberikan kontribusi yang tak ternilai bagi khazanah pengetahuan nasional',
  'merupakan pilar fundamental yang menopang keberhasilan implementasi',
  'berdiri kokoh sebagai mercusuar harapan dan inovasi berkelanjutan',
  'menjadi katalisator utama yang mempercepat laju transformasi',
  'menandai titik balik penting dalam pergeseran paradigma ilmiah',
  'memberikan landasan yang kokoh dan tak tergoyahkan bagi studi lanjutan',
  'merepresentasikan puncak pencapaian akademik yang sarat makna',
  'menjadi benang merah yang merangkai berbagai perspektif yang terpisah',
  'memiliki signifikansi yang teramat mendalam bagi pembuat kebijakan',
  'mengukuhkan posisinya sebagai pelopor dalam bidang kajian yang bersangkutan',
  'menorehkan prestasi gemilang yang menjadi inspirasi bagi generasi penerus',
  'membawa angin segar dan optimisme baru di tengah berbagai keterbatasan',
  'menjadi fondasi utama yang memperkokoh bangunan keilmuan modern',

  // 4. Sintesis Ekor Kalimat & Partisipel Dangkal
  'sehingga membuka jalan bagi terciptanya ekosistem yang kondusif dan adaptif',
  'memberikan wawasan berharga mengenai dinamika yang saling berkelindan',
  'menjembatani kesenjangan antara teori akademis dan implementasi praktis di lapangan',
  'mendorong terciptanya sinergi yang harmonis antar berbagai pemangku kepentingan',
  'memperkaya khazanah keilmuan dengan menyuguhkan perspektif yang komprehensif',
  'mengakselerasi pencapaian target strategis secara terukur dan berkelanjutan',
  'menyelaraskan visi jangka panjang dengan kebutuhan nyata masyarakat',
  'membedah akar permasalahan secara holistik dan terperinci',
  'merajut kembali jalinan kerja sama lintas disiplin yang selama ini terabaikan',
  'mempertegas urgensi penerapan standar etika yang ketat dan transparan',
  'mengurai benang kusut problematika yang telah lama mengendap',
  'memantik diskursus yang lebih kritis dan mendalam di kalangan civitas akademika',
  'mengejawantahkan nilai-nilai kearifan ke dalam praktik profesional sehari-hari',
  'memformulasikan solusi cerdas yang tangguh dalam menghadapi ketidakpastian',
  'mengintegrasikan berbagai instrumen kebijakan guna menghasilkan dampak nyata',
  'mencerminkan kedewasaan berpikir dalam memandang keragaman sudut pandang',
  'mengamplifikasi gaung perubahan menuju tata kelola yang lebih akuntabel',

  // 5. Atribusi Samar & Pengisi Beban (Weasel Words)
  'berbagai kajian ilmiah terdahulu secara konsisten menunjukkan bahwa',
  'para pakar dan praktisi di bidang ini sepakat bahwa',
  'sejumlah pengamat dan analis kerap menyoroti pentingnya',
  'bukti empiris yang berkembang kian mempertegas kesimpulan bahwa',
  'banyak pihak berpendapat bahwa langkah strategis ini sangat diperlukan',
  'literatur akademik kontemporer telah menggarisbawahi urgensi dari',
  'sudah menjadi rahasia umum di kalangan akademisi bahwa',
  'sejumlah riset mutakhir berhasil mengungkap fakta menarik bahwa',
  'pandangan umum yang berkembang di masyarakat mengindikasikan bahwa',
  'para ilmuwan terkemuka telah berulang kali mengingatkan dampak dari',
  'data historis dan tren sektoral memperlihatkan korelasi yang erat antara',
  'tidak sedikit akademisi yang menaruh perhatian serius terhadap fenomena',
  'analisis mendalam dari berbagai laporan kredibel membuktikan bahwa',
  'studi komparatif di berbagai institusi terkemuka memperlihatkan bahwa',
  'kesepakatan umum yang mulai mengkristal di antara para peneliti adalah',
  'rekomendasi dari berbagai forum ilmiah menegaskan perlunya',
  'observasi lapangan yang cermat semakin memperkuat argumentasi bahwa',

  // 6. Penutup Bab Kaku & Klise Masa Depan
  'meskipun menghadapi berbagai tantangan kompleks yang saling berkelindan',
  'langkah strategis dan kolaborasi terpadu menjadi kunci keberhasilan di masa depan',
  'peluang untuk berkembang masih terbuka sangat lebar seiring berjalannya waktu',
  'keberhasilan jangka panjang menuntut adanya komitmen dan konsistensi dari semua pihak',
  'terlepas dari segala keterbatasan yang ada, masa depan tetap menawarkan harapan',
  'menavigasi rintangan multidimensi ini membutuhkan kerja keras dan kebersamaan',
  'roda transformasi telah bergulir dan tak dapat dihentikan oleh siapa pun',
  'upaya berkelanjutan dan evaluasi berkala menjadi keniscayaan yang mutlak',
  'jalan terjal di depan bukanlah penghalang melainkan ujian bagi ketangguhan kita',
  'dengan semangat inovasi dan gotong royong, optimisme masa depan akan tetap terjaga',
  'fase krusial ini menuntut keberanian moral untuk melakukan terobosan baru',
  'kesimpulan ini menegaskan perlunya penelitian lanjutan yang lebih mendalam',
  'akhir kata, fondasi yang telah diletakkan hari ini akan menjadi pijakan emas esok hari',
  'menyongsong era baru dengan kesiapan mental dan keilmuan yang mumpuni',
  'hanya dengan ketekunan dan keterbukaan pikiran kita dapat meraih hasil maksimal',
  'perjalanan ini masih panjang, namun arah tujuan telah tergambar dengan sangat benderang'
];

export function stripBibliographyFromText(text: string): string {
  if (!text) return '';
  // Match standalone bibliography headers (Daftar Pustaka, References, etc.) and strip everything after
  const biblioRegex = /(?:^|\n+)\s*(?:daftar\s+pustaka(?:\s*[\/&]\s*references)?|references|bibliografi|bibliography)\s*(?:\n+|$)/i;
  const match = text.search(biblioRegex);
  if (match !== -1) {
    return text.substring(0, match).trim();
  }
  return text;
}

export function calculateBurstiness(text: string): BurstinessMetrics {
  // Strip bibliography section first so citations do not distort originality and sentence rhythm
  const strippedText = stripBibliographyFromText(text);
  const cleanText = strippedText.replace(/<[^>]+>/g, ' ');
  if (!cleanText || !cleanText.trim()) {
    return {
      totalWords: 0,
      totalSentences: 0,
      averageSentenceLength: 0,
      standardDeviation: 0,
      burstinessScore: 0,
      status: 'human',
      sentenceData: [],
      buzzwordCount: 0,
      detectedBuzzwords: []
    };
  }

  // Smart sentence segmentation regex
  // Match ., !, or ? that is followed by whitespace and a capital letter or end of string.
  // Ignore standard academic abbreviations.
  // This is a simplified regex; negative lookbehind is supported in modern JS.
  const sentenceRegex = /(?<!\be\.g)(?<!\bi\.e)(?<!\bal)(?<!\bvs)(?<!\bJan)(?<!\bFeb)(?<!\bMar)(?<!\bApr)(?<!\bAug)(?<!\bSep)(?<!\bOct)(?<!\bNov)(?<!\bDec)(?<!\bDr)(?<!\bMr)(?<!\bMs)(?<!\bProf)(?<!\d)([.!?])\s+(?=[A-Z0-9]|$)/g;

  // Split and clean sentences by newline / paragraph boundaries first (strict paragraph isolation)
  const rawParagraphs = strippedText
    .split(/\r?\n+/)
    .map((p) => p.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\u00A0/g, ' ').replace(/[ \t]+/g, ' ').trim())
    .filter((p) => p.length > 0);

  const rawSentences: string[] = [];

  for (const para of rawParagraphs) {
    const paraSentences = para.split(sentenceRegex).reduce((acc: string[], val: string, i: number, arr: string[]) => {
      // Re-attach punctuation
      if (i % 2 === 0) {
        if (arr[i+1]) {
           acc.push((val + arr[i+1]).trim());
        } else {
           acc.push(val.trim());
        }
      }
      return acc;
    }, []).filter(s => s.length > 0);

    if (paraSentences.length > 0) {
      rawSentences.push(...paraSentences);
    } else {
      rawSentences.push(para);
    }
  }

  // If the regex splitting fails or produces no punctuation match, fallback
  const sentences = rawSentences.length > 0 ? rawSentences : [strippedText.trim()];

  const sentenceData = sentences.map((s, index) => {
    const wordCount = s.split(/\s+/).filter(w => w.length > 0).length;
    return { index: index + 1, words: wordCount, text: s };
  }).filter(s => s.words > 0);

  const totalSentences = sentenceData.length;
  const totalWords = sentenceData.reduce((acc, curr) => acc + curr.words, 0);
  
  if (totalSentences === 0) {
    return {
      totalWords: 0,
      totalSentences: 0,
      averageSentenceLength: 0,
      standardDeviation: 0,
      burstinessScore: 0,
      status: 'human',
      sentenceData: [],
      buzzwordCount: 0,
      detectedBuzzwords: []
    };
  }

  const averageSentenceLength = totalWords / totalSentences;

  // Calculate Standard Deviation
  const variance = sentenceData.reduce((acc, curr) => {
    return acc + Math.pow(curr.words - averageSentenceLength, 2);
  }, 0) / totalSentences;
  
  const standardDeviation = Math.sqrt(variance);

  // Burstiness Score = Coefficient of Variation (SD / Mean)
  // If mean is 0, score is 0.
  let burstinessScore = averageSentenceLength > 0 ? standardDeviation / averageSentenceLength : 0;
  
  // Normalize slightly to ensure the thresholds match the prompt intent
  burstinessScore = parseFloat(burstinessScore.toFixed(2));

  let status: 'human' | 'warning' | 'ai' = 'human';
  if (burstinessScore <= 0.30) {
    status = 'ai';
  } else if (burstinessScore >= 0.31 && burstinessScore <= 0.59) {
    status = 'warning';
  } else {
    status = 'human';
  }

  // Require minimum 3 sentences to trigger AI warning reliably
  if (totalSentences < 3 && status === 'ai') {
    status = 'warning'; 
  }

  // Find buzzwords (single words)
  const detectedBuzzwordsMap = new Map<string, number>();
  let buzzwordCount = 0;
  
  const wordsList: string[] = cleanText.toLowerCase().match(/\b([a-z]+)\b/g) || [];
  wordsList.forEach((w: string) => {
    if (AI_BUZZWORDS.includes(w)) {
      detectedBuzzwordsMap.set(w, (detectedBuzzwordsMap.get(w) || 0) + 1);
      buzzwordCount++;
    }
  });

  // Scan multi-word cliché phrases (Phase 72)
  const lowerCleanText = cleanText.toLowerCase();
  const detectedPhrasesMap = new Map<string, number>();
  let phraseCount = 0;

  AI_CLICHE_PHRASES.forEach((phrase) => {
    const pLower = phrase.toLowerCase().trim();
    if (!pLower) return;
    if (lowerCleanText.includes(pLower)) {
      let count = 0;
      let pos = lowerCleanText.indexOf(pLower);
      while (pos !== -1) {
        count++;
        pos = lowerCleanText.indexOf(pLower, pos + pLower.length);
      }
      if (count > 0) {
        detectedPhrasesMap.set(phrase, count);
        phraseCount += count;
        // Multi-word phrases carry strong weight in detecting robotic AI synthesis
        buzzwordCount += count * 2;
      }
    }
  });

  const detectedBuzzwords = Array.from(detectedBuzzwordsMap.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);

  const detectedPhrases = Array.from(detectedPhrasesMap.entries())
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalWords,
    totalSentences,
    averageSentenceLength: parseFloat(averageSentenceLength.toFixed(1)),
    standardDeviation: parseFloat(standardDeviation.toFixed(2)),
    burstinessScore,
    status,
    sentenceData,
    buzzwordCount,
    detectedBuzzwords,
    phraseCount,
    detectedPhrases
  };
}
