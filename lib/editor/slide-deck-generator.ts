/**
 * slide-deck-generator.ts
 *
 * Academic Conference & Thesis Defense Slide Deck Generator Engine.
 * Converts EditorJS manuscript AST blocks into a structured academic presentation deck
 * with support for Marp Markdown, Standalone Interactive HTML Deck, and Speaker Notes.
 */

export interface SlideItem {
  id: string;
  slideNumber: number;
  title: string;
  subtitle?: string;
  category: 'title' | 'problem' | 'objectives' | 'literature' | 'methodology' | 'findings' | 'discussion' | 'conclusion' | 'references' | 'custom';
  bulletPoints: string[];
  speakerNotes: string;
  visualHighlight?: {
    type: 'quote' | 'statistic' | 'figure' | 'table';
    content: string;
    caption?: string;
  };
}

export interface SlideDeckProject {
  title: string;
  presenter: string;
  institution?: string;
  dateString?: string;
  templateTheme: 'academic-modern' | 'classic-navy' | 'minimal-emerald';
  slides: SlideItem[];
  estimatedMinutes: number;
}

export interface SlideDeckOptions {
  authorName?: string;
  institutionName?: string;
  language?: 'en' | 'id';
  templateTheme?: 'academic-modern' | 'classic-navy' | 'minimal-emerald';
  targetDurationMinutes?: number;
}

/**
 * Strips HTML tags and unescapes basic entities
 */
export function cleanHtmlText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<cite[^>]*>([\s\S]*?)<\/cite>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Extracts bullet points from an EditorJS block or raw text
 */
function extractBullets(text: string, maxPoints = 4): string[] {
  const cleaned = cleanHtmlText(text);
  if (!cleaned) return [];

  // Split into sentences
  const sentences = cleaned
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15 && s.length < 220);

  if (sentences.length === 0 && cleaned.length > 0) {
    return [cleaned.slice(0, 180) + (cleaned.length > 180 ? '...' : '')];
  }

  return sentences.slice(0, maxPoints);
}

/**
 * Generates an academic conference / thesis defense slide deck from EditorJS blocks.
 */
export function generateAcademicSlideDeck(
  blocks: any[],
  documentTitle = 'Academic Research Presentation',
  options: SlideDeckOptions = {}
): SlideDeckProject {
  const isEn = options.language === 'en';
  const theme = options.templateTheme || 'academic-modern';
  const author = options.authorName || (isEn ? 'Researcher / Author' : 'Peneliti / Mahasiswa');
  const institution = options.institutionName || 'ScholarFlow Academic Workspace';

  const slides: SlideItem[] = [];

  // 1. Title Slide
  slides.push({
    id: 'slide-title',
    slideNumber: 1,
    title: documentTitle || (isEn ? 'Conference / Thesis Defense' : 'Sidang Skripsi & Disertasi'),
    subtitle: isEn
      ? `Research Defense & Scientific Conference Presentation`
      : `Presentasi Sidang Skripsi & Konferensi Ilmiah`,
    category: 'title',
    bulletPoints: [
      isEn ? `Author: ${author}` : `Penyusun: ${author}`,
      isEn ? `Institution: ${institution}` : `Institusi: ${institution}`,
      isEn ? `Format: Thesis Examination / Conference Track` : `Sesi: Ujian Sidang / Jalur Konferensi`,
    ],
    speakerNotes: isEn
      ? `Distinguished examiners and honorable colleagues, welcome to my research defense titled "${documentTitle}".`
      : `Selamat pagi/siang kepada dewan penguji dan pembimbing yang terhormat, perkenankan saya mempresentasikan penelitian berjudul "${documentTitle}".`,
  });

  // Collect text and headings from blocks
  const sections: { title: string; blocks: any[] }[] = [];
  let currentSecTitle = isEn ? 'Introduction' : 'Pendahuluan';
  let currentSecBlocks: any[] = [];

  for (const block of blocks) {
    if (block.type === 'header' && block.data?.text) {
      if (currentSecBlocks.length > 0) {
        sections.push({ title: currentSecTitle, blocks: currentSecBlocks });
        currentSecBlocks = [];
      }
      currentSecTitle = cleanHtmlText(block.data.text);
    } else {
      currentSecBlocks.push(block);
    }
  }
  if (currentSecBlocks.length > 0) {
    sections.push({ title: currentSecTitle, blocks: currentSecBlocks });
  }

  // Predefined standard thesis slides if minimal sections found
  const defaultCategories: Array<{
    cat: SlideItem['category'];
    titleEn: string;
    titleId: string;
    noteEn: string;
    noteId: string;
  }> = [
    {
      cat: 'problem',
      titleEn: 'Problem Statement & Background',
      titleId: 'Latar Belakang & Rumusan Masalah',
      noteEn: 'Highlight the central real-world gap and theoretical tension motivating this study.',
      noteId: 'Jelaskan kesenjangan empiris dan urgensi yang melatarbelakangi penelitian ini.',
    },
    {
      cat: 'objectives',
      titleEn: 'Research Objectives & Scope',
      titleId: 'Tujuan & Batasan Penelitian',
      noteEn: 'Clarify the exact research questions and hypotheses addressed.',
      noteId: 'Paparkan tujuan spesifik dan cakupan batasan riset yang diuji.',
    },
    {
      cat: 'literature',
      titleEn: 'Theoretical Framework & Literature',
      titleId: 'Kerangka Teoretis & Tinjauan Pustaka',
      noteEn: 'Connect to primary baseline literature and theoretical foundation.',
      noteId: 'Hubungkan dengan landasan teori utama serta penelitian terdahulu yang relevan.',
    },
    {
      cat: 'methodology',
      titleEn: 'Methodology & Research Design',
      titleId: 'Metodologi & Desain Penelitian',
      noteEn: 'Detail the population, sampling technique, instruments, and data analysis pipeline.',
      noteId: 'Uraikan metode pengumpulan data, instrumen, dan teknik analisis yang digunakan.',
    },
    {
      cat: 'findings',
      titleEn: 'Key Results & Empirical Findings',
      titleId: 'Hasil Utama & Temuan Empiris',
      noteEn: 'Focus on primary statistical or qualitative findings addressing the questions.',
      noteId: 'Fokuskan pada temuan kuantitatif/kualitatif utama yang menjawab rumusan masalah.',
    },
    {
      cat: 'discussion',
      titleEn: 'Discussion & Scientific Contribution',
      titleId: 'Pembahasan & Kontribusi Ilmiah',
      noteEn: 'Interpret the broader implications and compare with prior studies.',
      noteId: 'Tafsirkan dampak temuan dan bandingkan dengan konsensus literatur terdahulu.',
    },
    {
      cat: 'conclusion',
      titleEn: 'Conclusion & Recommendations',
      titleId: 'Kesimpulan & Saran Riset',
      noteEn: 'Synthesize the final takeaway message and prospective future research avenues.',
      noteId: 'Sintesiskan intisari kesimpulan akhir serta rekomendasi praktis dan teoretis.',
    },
  ];

  // Map each standard category to document content or synthesize from blocks
  let slideIndex = 2;

  // Search matching sections
  for (const def of defaultCategories) {
    const matchingSec = sections.find((s) => {
      const lower = s.title.toLowerCase();
      if (def.cat === 'problem' && (lower.includes('latar') || lower.includes('background') || lower.includes('problem') || lower.includes('masalah'))) return true;
      if (def.cat === 'objectives' && (lower.includes('tujuan') || lower.includes('objective') || lower.includes('rumusan') || lower.includes('scope'))) return true;
      if (def.cat === 'literature' && (lower.includes('pustaka') || lower.includes('literature') || lower.includes('teori') || lower.includes('theory'))) return true;
      if (def.cat === 'methodology' && (lower.includes('metod') || lower.includes('method') || lower.includes('prosedur'))) return true;
      if (def.cat === 'findings' && (lower.includes('hasil') || lower.includes('finding') || lower.includes('result') || lower.includes('analisis'))) return true;
      if (def.cat === 'discussion' && (lower.includes('bahas') || lower.includes('discuss') || lower.includes('implikasi'))) return true;
      if (def.cat === 'conclusion' && (lower.includes('simpul') || lower.includes('conclu') || lower.includes('saran'))) return true;
      return false;
    });

    let bullets: string[] = [];
    if (matchingSec && matchingSec.blocks.length > 0) {
      for (const b of matchingSec.blocks) {
        if (bullets.length >= 4) break;
        if (b.type === 'paragraph' && b.data?.text) {
          bullets.push(...extractBullets(b.data.text, 2));
        } else if (b.type === 'list' && Array.isArray(b.data?.items)) {
          for (const item of b.data.items) {
            const cleanedItem = cleanHtmlText(typeof item === 'string' ? item : item?.content || '');
            if (cleanedItem) bullets.push(cleanedItem);
            if (bullets.length >= 4) break;
          }
        }
      }
    }

    // Default bullet fallback if not enough text extracted
    if (bullets.length === 0) {
      if (def.cat === 'problem') {
        bullets = isEn
          ? ['Existing empirical literature reveals significant research inconsistencies.', 'Traditional models lack real-time predictive accuracy in dynamic environments.', 'Urgent necessity for an integrated methodological framework.']
          : ['Kesenjangan empiris pada literatur terdahulu memerlukan telaah mendalam.', 'Model konvensional belum mampu menangani variabel dinamis secara akurat.', 'Urgensi pengembangan pendekatan metodologis yang lebih terintegrasi.'];
      } else if (def.cat === 'objectives') {
        bullets = isEn
          ? ['Identify the core determinant parameters influencing the observed outcome.', 'Formulate and validate a robust analytical framework.', 'Deliver evidence-based recommendations for academic and practical implementation.']
          : ['Mengidentifikasi faktor determinan utama yang mempengaruhi luaran sistem.', 'Merumuskan dan menguji validitas kerangka analisis yang diusulkan.', 'Memberikan rekomendasi berbasis bukti untuk penerapan akademik dan praktis.'];
      } else if (def.cat === 'methodology') {
        bullets = isEn
          ? ['Rigorous research design employing standardized measurement protocols.', 'Representative sample collection conforming to statistical power thresholds.', 'Multivariate regression and thematic triangulation techniques.']
          : ['Desain penelitian terstandar dengan protokol pengukuran valid.', 'Pengambilan sampel representatif yang memenuhi kaidah kekuatan statistik.', 'Analisis multivariat dan triangulasi data komprehensif.'];
      } else if (def.cat === 'findings') {
        bullets = isEn
          ? ['Primary hypothesis is strongly supported by empirical data (p < 0.05).', 'Substantial performance improvement compared to baseline benchmarks.', 'Validation metrics demonstrate consistent reliability across all test clusters.']
          : ['Hipotesis utama terbukti secara signifikan oleh data empiris (p < 0.05).', 'Peningkatan performa terukur secara konsisten melampaui tolok ukur acuan.', 'Metrik evaluasi menunjukkan reliabilitas tinggi pada seluruh klaster uji.'];
      } else {
        bullets = isEn
          ? ['Synthesized core scientific contributions to the discipline.', 'Addressed central research questions formulated in Chapter 1.', 'Identified actionable roadmap for progressive future studies.']
          : ['Sintesis kontribusi kebaruan ilmiah terhadap bidang studi.', 'Menjawab seluruh pertanyaan riset yang diajukan pada Bab Pendahuluan.', 'Peluang eksplorasi lanjutan untuk riset di masa mendatang.'];
      }
    }

    slides.push({
      id: `slide-${def.cat}-${slideIndex}`,
      slideNumber: slideIndex++,
      title: isEn ? def.titleEn : def.titleId,
      category: def.cat,
      bulletPoints: bullets.slice(0, 4),
      speakerNotes: isEn ? def.noteEn : def.noteId,
    });
  }

  // 9. Closing References Slide
  slides.push({
    id: `slide-refs-${slideIndex}`,
    slideNumber: slideIndex,
    title: isEn ? 'References & Acknowledgments' : 'Daftar Pustaka & Penutup',
    subtitle: isEn ? 'Selected Citations & Q&A Discussion' : 'Rujukan Utama & Sesi Tanya Jawab',
    category: 'references',
    bulletPoints: [
      isEn ? 'Thank you to thesis supervisors, examiners, and research sponsors.' : 'Terima kasih kepada dewan penguji, dosen pembimbing, dan rekan akademisi.',
      isEn ? 'Key references available in full manuscript bibliography.' : 'Daftar pustaka lengkap terlampir pada dokumen naskah naskah skripsi.',
      isEn ? 'Open for questions, defense feedback, and scientific critique.' : 'Sesi tanya jawab, masukan, dan diskusi akademik dipersilakan.',
    ],
    speakerNotes: isEn
      ? 'I conclude my presentation here. I respectfully welcome questions, critiques, and guidance from the honorable board of examiners.'
      : 'Demikian presentasi dari saya. Dengan penuh hormat, saya menyambut baik pertanyaan, masukan, dan arahan dari dewan penguji.',
  });

  // Calculate estimated presentation duration (approx 1.5 - 2 minutes per slide)
  const estimatedMinutes = Math.round(slides.length * 1.75);

  return {
    title: documentTitle,
    presenter: author,
    institution,
    templateTheme: theme,
    slides,
    estimatedMinutes,
  };
}

/**
 * Converts a SlideDeckProject into standard Marp Markdown format.
 * Can be opened in VS Code Marp plugin or Obsidian.
 */
export function exportToMarpMarkdown(deck: SlideDeckProject): string {
  const frontmatter = `---
marp: true
theme: default
paginate: true
header: '${deck.title.replace(/'/g, "\\'")}'
footer: '${deck.presenter.replace(/'/g, "\\'")} | ${deck.institution ? deck.institution.replace(/'/g, "\\'") : ''}'
style: |
  section {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    padding: 40px 60px;
  }
  h1 {
    color: #1e293b;
  }
  h2 {
    color: #4338ca;
    border-bottom: 2px solid #e0e7ff;
    padding-bottom: 8px;
  }
  footer {
    font-size: 14px;
    color: #64748b;
  }
---
`;

  const slideTexts = deck.slides.map((s, idx) => {
    if (s.category === 'title') {
      return `<!-- _class: lead -->
# ${s.title}
${s.subtitle ? `### ${s.subtitle}\n` : ''}
**${deck.presenter}**  
*${deck.institution || ''}*

<!--
Speaker Notes:
${s.speakerNotes}
-->`;
    }

    const bulletsFormatted = s.bulletPoints.map((bp) => `- ${bp}`).join('\n');
    return `## ${s.title}

${bulletsFormatted}

<!--
Speaker Notes:
${s.speakerNotes}
-->`;
  });

  return frontmatter + '\n' + slideTexts.join('\n\n---\n\n') + '\n';
}

/**
 * Converts a SlideDeckProject into a standalone self-contained HTML presentation
 * with keyboard navigation, dark mode support, and fullscreen button.
 */
export function exportToStandaloneHtml(deck: SlideDeckProject): string {
  const slidesJson = JSON.stringify(deck.slides);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(deck.title)} - Slide Deck</title>
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #6366f1;
      --accent-light: #818cf8;
      --border: #334155;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      user-select: none;
    }
    header {
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border);
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(8px);
    }
    .brand { font-size: 14px; font-weight: 700; color: var(--accent-light); display: flex; align-items: center; gap: 8px; }
    .deck-title { font-size: 13px; color: var(--text-muted); max-width: 50%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .viewport {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      perspective: 1000px;
    }
    .slide-card {
      width: 100%;
      max-width: 980px;
      aspect-ratio: 16 / 9;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      padding: 48px 56px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .slide-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--accent-light);
      background: rgba(99, 102, 241, 0.15);
      padding: 4px 10px;
      border-radius: 9999px;
      width: fit-content;
      margin-bottom: 12px;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    .slide-title {
      font-size: 32px;
      font-weight: 800;
      line-height: 1.25;
      margin-bottom: 8px;
      color: #fff;
    }
    .slide-subtitle {
      font-size: 16px;
      color: var(--text-muted);
      margin-bottom: 24px;
    }
    .bullet-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 16px;
    }
    .bullet-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      font-size: 18px;
      line-height: 1.5;
      color: #e2e8f0;
    }
    .bullet-item::before {
      content: "•";
      color: var(--accent);
      font-size: 24px;
      line-height: 1;
    }
    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--border);
      padding-top: 16px;
      font-size: 12px;
      color: var(--text-muted);
    }
    .notes-box {
      margin-top: 16px;
      padding: 12px 16px;
      background: rgba(0, 0, 0, 0.25);
      border-left: 3px solid var(--accent);
      border-radius: 4px;
      font-size: 13px;
      color: #cbd5e1;
      font-style: italic;
    }
    .controls {
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border);
      background: rgba(15, 23, 42, 0.8);
    }
    .btn {
      background: var(--card-bg);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .btn:hover { background: var(--accent); border-color: var(--accent); }
    .btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .progress-bar-container {
      flex: 1;
      max-width: 320px;
      height: 6px;
      background: var(--border);
      border-radius: 9999px;
      overflow: hidden;
      margin: 0 16px;
    }
    .progress-bar-fill {
      height: 100%;
      background: var(--accent);
      transition: width 0.3s ease;
    }
    .slide-counter { font-size: 13px; font-weight: 600; color: var(--text-muted); }
  </style>
</head>
<body>
  <header>
    <div class="brand">🎓 ScholarFlow Defense Deck</div>
    <div class="deck-title">${escapeHtml(deck.title)}</div>
    <div style="font-size:12px; color:var(--text-muted);">~${deck.estimatedMinutes} Mins Presentation</div>
  </header>

  <main class="viewport">
    <div id="slideCard" class="slide-card">
      <!-- Injected via JS -->
    </div>
  </main>

  <footer class="controls">
    <button id="btnPrev" class="btn" onclick="prevSlide()">◀ Previous</button>
    <div style="display:flex; align-items:center;">
      <span id="counter" class="slide-counter">1 / ${deck.slides.length}</span>
      <div class="progress-bar-container">
        <div id="progressFill" class="progress-bar-fill" style="width: ${(1 / deck.slides.length) * 100}%"></div>
      </div>
    </div>
    <div style="display:flex; gap:8px;">
      <button class="btn" onclick="toggleNotes()">📝 Speaker Notes</button>
      <button class="btn" onclick="toggleFullscreen()">⛶ Fullscreen</button>
      <button id="btnNext" class="btn" onclick="nextSlide()">Next ▶</button>
    </div>
  </footer>

  <script>
    const slides = ${slidesJson};
    let currentIndex = 0;
    let showNotes = true;

    function renderSlide() {
      const slide = slides[currentIndex];
      const card = document.getElementById('slideCard');
      const counter = document.getElementById('counter');
      const progressFill = document.getElementById('progressFill');
      const btnPrev = document.getElementById('btnPrev');
      const btnNext = document.getElementById('btnNext');

      counter.textContent = (currentIndex + 1) + ' / ' + slides.length;
      progressFill.style.width = (((currentIndex + 1) / slides.length) * 100) + '%';
      btnPrev.disabled = currentIndex === 0;
      btnNext.disabled = currentIndex === slides.length - 1;

      let bulletsHtml = '';
      if (slide.bulletPoints && slide.bulletPoints.length > 0) {
        bulletsHtml = '<ul class="bullet-list">' +
          slide.bulletPoints.map(b => '<li class="bullet-item">' + escapeHtml(b) + '</li>').join('') +
          '</ul>';
      }

      let notesHtml = '';
      if (showNotes && slide.speakerNotes) {
        notesHtml = '<div class="notes-box">💡 <b>Speaker Note:</b> ' + escapeHtml(slide.speakerNotes) + '</div>';
      }

      card.innerHTML =
        '<div>' +
          '<div class="slide-badge">' + escapeHtml(slide.category) + '</div>' +
          '<h1 class="slide-title">' + escapeHtml(slide.title) + '</h1>' +
          (slide.subtitle ? '<p class="slide-subtitle">' + escapeHtml(slide.subtitle) + '</p>' : '') +
          bulletsHtml +
        '</div>' +
        '<div>' +
          notesHtml +
          '<div class="slide-footer" style="margin-top:16px;">' +
            '<span>${escapeHtml(deck.presenter)} - ${escapeHtml(deck.institution || '')}</span>' +
            '<span>Slide ' + (currentIndex + 1) + '</span>' +
          '</div>' +
        '</div>';
    }

    function prevSlide() {
      if (currentIndex > 0) {
        currentIndex--;
        renderSlide();
      }
    }

    function nextSlide() {
      if (currentIndex < slides.length - 1) {
        currentIndex++;
        renderSlide();
      }
    }

    function toggleNotes() {
      showNotes = !showNotes;
      renderSlide();
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        prevSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    });

    function escapeHtml(text) {
      if (!text) return '';
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    renderSlide();
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
