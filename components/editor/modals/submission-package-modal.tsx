'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  IconX,
  IconCopy,
  IconCheck,
  IconDownload,
  IconMail,
  IconSparkles,
  IconShieldCheck,
  IconUsers,
  IconPackage,
  IconRefresh,
  IconPlus,
  IconTrash,
  IconFileText,
  IconBuildingArch,
  IconScale,
  IconDatabase,
} from '@tabler/icons-react';
import {
  buildJournalSubmissionPackage,
  exportSubmissionPackageMarkdown,
  generateSuggestedReviewers,
  synthesizeHighlights,
  buildCoverLetter,
  type SuggestedReviewer,
  type JournalSubmissionPackage,
} from '@/lib/editor/submission-package';

interface SubmissionPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  editorBlocks?: any[];
  bibliographyEntries?: any[];
  documentTitle?: string;
  authorName?: string;
  authorEmail?: string;
  institutionName?: string;
  language?: 'en' | 'id';
}

type TabType = 'cover_letter' | 'highlights' | 'declarations' | 'reviewers' | 'full_package';

const JOURNAL_PRESETS = [
  { name: 'IEEE Transactions on Software Engineering', editor: 'Prof. Per Runeson (Editor-in-Chief)' },
  { name: 'Elsevier Information and Software Technology', editor: 'Prof. Paris Avgeriou (Editor-in-Chief)' },
  { name: 'Springer Empirical Software Engineering', editor: 'Prof. Robert Feldt (Co-Editor-in-Chief)' },
  { name: 'Jurnal Ilmu Komputer dan Informasi (SINTA 1)', editor: 'Prof. Dr. Ir. Wahyu Catur Wibowo' },
  { name: 'PLOS ONE Academic Research', editor: 'Academic Editor Office' },
];

export function SubmissionPackageModal({
  isOpen,
  onClose,
  editorBlocks = [],
  bibliographyEntries = [],
  documentTitle = 'Untitled Manuscript',
  authorName = 'Corresponding Author',
  authorEmail = 'author@institution.edu',
  institutionName = 'Department of Academic Science, University',
  language = 'en',
}: SubmissionPackageModalProps) {
  const isEn = language === 'en';

  const [activeTab, setActiveTab] = useState<TabType>('cover_letter');
  const [journalName, setJournalName] = useState('IEEE Transactions on Software Engineering');
  const [editorName, setEditorName] = useState('Editor-in-Chief');
  const [manuscriptType, setManuscriptType] = useState('Original Research');
  const [corrAuthorName, setCorrAuthorName] = useState(authorName);
  const [corrAuthorEmail, setCorrAuthorEmail] = useState(authorEmail);
  const [corrAuthorAffiliation, setCorrAuthorAffiliation] = useState(institutionName);
  const [coAuthorsText, setCoAuthorsText] = useState('');
  const [noveltyStatement, setNoveltyStatement] = useState('');
  const [whyThisJournal, setWhyThisJournal] = useState('');

  // Declarations
  const [coiStatement, setCoiStatement] = useState(
    isEn
      ? 'The authors declare that they have no known competing financial interests or personal relationships that could have appeared to influence the work reported in this paper.'
      : 'Para penulis menyatakan tidak memiliki benturan kepentingan finansial maupun hubungan personal yang dapat mempengaruhi integritas hasil penelitian yang dilaporkan dalam naskah ini.'
  );
  const [fundingStatement, setFundingStatement] = useState(
    isEn
      ? 'This research did not receive any specific grant from funding agencies in the public, commercial, or not-for-profit sectors.'
      : 'Penelitian ini tidak menerima hibah atau pendanaan khusus dari lembaga publik, komersial, maupun organisasi nirlaba.'
  );
  const [dataAvailabilityStatement, setDataAvailabilityStatement] = useState(
    isEn
      ? 'The datasets and code generated during the current study are available from the corresponding author on reasonable request.'
      : 'Data dan kode pendukung yang dihasilkan dalam penelitian ini tersedia dari penulis korespondensi berdasarkan permintaan akademis yang wajar.'
  );

  // Highlights & Reviewers State
  const [highlights, setHighlights] = useState<string[]>([]);
  const [suggestedReviewers, setSuggestedReviewers] = useState<SuggestedReviewer[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Initialize or re-derive on open
  useEffect(() => {
    if (isOpen) {
      if (highlights.length === 0) {
        setHighlights(synthesizeHighlights(editorBlocks, documentTitle, language));
      }
      if (suggestedReviewers.length === 0) {
        setSuggestedReviewers(generateSuggestedReviewers(bibliographyEntries, authorName));
      }
      if (!corrAuthorName) setCorrAuthorName(authorName);
      if (!corrAuthorEmail) setCorrAuthorEmail(authorEmail);
      if (!corrAuthorAffiliation) setCorrAuthorAffiliation(institutionName);
    }
  }, [isOpen]);

  const coAuthors = useMemo(() => {
    return coAuthorsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [coAuthorsText]);

  const submissionPackage: JournalSubmissionPackage = useMemo(() => {
    return buildJournalSubmissionPackage({
      manuscriptTitle: documentTitle,
      journalName,
      editorName,
      manuscriptType: manuscriptType as any,
      correspondingAuthorName: corrAuthorName || authorName,
      correspondingAuthorEmail: corrAuthorEmail || authorEmail,
      correspondingAuthorAffiliation: corrAuthorAffiliation || institutionName,
      coAuthors,
      noveltyStatement,
      whyThisJournal,
      coiStatement,
      fundingStatement,
      dataAvailabilityStatement,
      highlights,
      suggestedReviewers,
      blocks: editorBlocks,
      bibliographyEntries,
      language,
    });
  }, [
    documentTitle,
    journalName,
    editorName,
    manuscriptType,
    corrAuthorName,
    corrAuthorEmail,
    corrAuthorAffiliation,
    coAuthors,
    noveltyStatement,
    whyThisJournal,
    coiStatement,
    fundingStatement,
    dataAvailabilityStatement,
    highlights,
    suggestedReviewers,
    editorBlocks,
    bibliographyEntries,
    language,
  ]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleApplyPreset = (preset: { name: string; editor: string }) => {
    setJournalName(preset.name);
    setEditorName(preset.editor);
  };

  const handleAddHighlight = () => {
    if (highlights.length < 5) {
      setHighlights([...highlights, isEn ? 'New key contribution of this research work' : 'Kontribusi kebaruan penting dari penelitian ini']);
    }
  };

  const handleUpdateHighlight = (index: number, val: string) => {
    const updated = [...highlights];
    updated[index] = val;
    setHighlights(updated);
  };

  const handleDeleteHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  const handleAddReviewer = () => {
    setSuggestedReviewers([
      ...suggestedReviewers,
      {
        name: isEn ? 'Dr. Scholar Name' : 'Dr. Nama Peneliti',
        affiliation: isEn ? 'Faculty of Science, University' : 'Fakultas Sains, Universitas',
        email: 'scholar@univ.edu',
        expertise: isEn ? 'Domain Modeling & Evaluation' : 'Pemodelan Domain & Evaluasi',
        reason: isEn ? 'Independent domain authority' : 'Pakar independen dalam topik penelitian ini',
      },
    ]);
  };

  const handleUpdateReviewer = (index: number, field: keyof SuggestedReviewer, val: string) => {
    const updated = [...suggestedReviewers];
    updated[index] = { ...updated[index], [field]: val };
    setSuggestedReviewers(updated);
  };

  const handleDeleteReviewer = (index: number) => {
    setSuggestedReviewers(suggestedReviewers.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <IconPackage className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                  {isEn ? 'Journal Submission Package Builder' : 'Penyusun Paket Pengajuan Jurnal'}
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  AI Cover Letter
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-xl">
                {isEn
                  ? 'Generate submission-ready cover letter, research highlights, ethics statements, and reviewer suggestions'
                  : 'Buat surat pengantar jurnal, poin kebaruan (highlights), deklarasi etika, dan rekomendasi reviewer'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body: Left Sidebar (Inputs & Tabs) + Right Main Workspace */}
        <div className="flex flex-1 min-h-0 divide-x divide-slate-200 dark:divide-slate-800 overflow-hidden">
          {/* Left Column: Metadata & Tab Nav */}
          <div className="w-80 shrink-0 flex flex-col p-4 bg-slate-50/50 dark:bg-slate-900/40 overflow-y-auto space-y-4">
            {/* Quick Journal Presets */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {isEn ? 'Target Journal Quick Fill' : 'Pilihan Cepat Target Jurnal'}
              </label>
              <div className="mt-1.5 space-y-1">
                {JOURNAL_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplyPreset(p)}
                    className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition truncate"
                  >
                    {p.name.split(' ')[0]} {p.name.split(' ')[1]} ({p.name.includes('SINTA') ? 'SINTA 1' : 'Scopus/WoS'})
                  </button>
                ))}
              </div>
            </div>

            {/* Target Journal Inputs */}
            <div className="space-y-2.5">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {isEn ? 'Journal Name' : 'Nama Jurnal'}
                </label>
                <input
                  type="text"
                  value={journalName}
                  onChange={(e) => setJournalName(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {isEn ? 'Addressed Editor' : 'Penerima Surat'}
                </label>
                <input
                  type="text"
                  value={editorName}
                  onChange={(e) => setEditorName(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {isEn ? 'Manuscript Type' : 'Jenis Naskah'}
                </label>
                <select
                  value={manuscriptType}
                  onChange={(e) => setManuscriptType(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Original Research">{isEn ? 'Original Research Article' : 'Artikel Penelitian Orisinal'}</option>
                  <option value="Review Article">{isEn ? 'Review Article / SLR' : 'Artikel Tinjauan / SLR'}</option>
                  <option value="Short Communication">{isEn ? 'Short Communication / Letter' : 'Komunikasi Singkat'}</option>
                  <option value="Case Study">{isEn ? 'Empirical Case Study' : 'Studi Kasus Empiris'}</option>
                </select>
              </div>
            </div>

            {/* Author Inputs */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {isEn ? 'Corresponding Author' : 'Penulis Korespondensi'}
              </label>
              <input
                type="text"
                placeholder={isEn ? 'Author Name' : 'Nama Penulis'}
                value={corrAuthorName}
                onChange={(e) => setCorrAuthorName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="email"
                placeholder={isEn ? 'Email address' : 'Alamat email'}
                value={corrAuthorEmail}
                onChange={(e) => setCorrAuthorEmail(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder={isEn ? 'Affiliation' : 'Afiliasi Kampus/Lembaga'}
                value={corrAuthorAffiliation}
                onChange={(e) => setCorrAuthorAffiliation(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder={isEn ? 'Co-authors (comma-separated)' : 'Penulis pendamping (pisahkan koma)'}
                value={coAuthorsText}
                onChange={(e) => setCoAuthorsText(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Navigation Tabs */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {isEn ? 'Package Sections' : 'Komponen Berkas'}
              </label>

              <button
                onClick={() => setActiveTab('cover_letter')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'cover_letter'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <IconMail className="h-4 w-4 shrink-0" />
                <span className="truncate">{isEn ? '1. Cover Letter' : '1. Surat Pengantar'}</span>
              </button>

              <button
                onClick={() => setActiveTab('highlights')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'highlights'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <IconSparkles className="h-4 w-4 shrink-0" />
                <span className="truncate">{isEn ? '2. Highlights' : '2. Poin Kebaruan'}</span>
                <span className="ml-auto px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300">
                  {highlights.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('declarations')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'declarations'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <IconShieldCheck className="h-4 w-4 shrink-0" />
                <span className="truncate">{isEn ? '3. Ethics & Declarations' : '3. Deklarasi Etika & COI'}</span>
              </button>

              <button
                onClick={() => setActiveTab('reviewers')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'reviewers'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <IconUsers className="h-4 w-4 shrink-0" />
                <span className="truncate">{isEn ? '4. Suggested Reviewers' : '4. Rekomendasi Reviewer'}</span>
                <span className="ml-auto px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300">
                  {suggestedReviewers.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('full_package')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'full_package'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <IconPackage className="h-4 w-4 shrink-0" />
                <span className="truncate">{isEn ? '5. Complete Package' : '5. Paket Lengkap'}</span>
              </button>
            </div>
          </div>

          {/* Right Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 overflow-y-auto p-6 space-y-6">
            {/* TAB 1: COVER LETTER */}
            {activeTab === 'cover_letter' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">
                      {isEn ? 'Official Cover Letter to Editor-in-Chief' : 'Surat Pengantar Resmi ke Dewan Redaksi'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {isEn
                        ? 'Highlights research novelty, scope alignment, and originality guarantee'
                        : 'Menegaskan kebaruan riset, keselarasan ruang lingkup, dan jaminan orisinalitas'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(submissionPackage.coverLetterText, 'cover_letter')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                    >
                      {copiedKey === 'cover_letter' ? <IconCheck className="h-4 w-4 text-emerald-500" /> : <IconCopy className="h-4 w-4" />}
                      {copiedKey === 'cover_letter' ? (isEn ? 'Copied!' : 'Tersalin!') : (isEn ? 'Copy Letter' : 'Salin Surat')}
                    </button>
                    <button
                      onClick={() => handleDownload(submissionPackage.coverLetterText, `Cover_Letter_${journalName.replace(/\s+/g, '_')}.txt`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 transition"
                    >
                      <IconDownload className="h-4 w-4" />
                      {isEn ? 'Download .txt' : 'Unduh .txt'}
                    </button>
                  </div>
                </div>

                {/* Custom Narrative Tuning */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {isEn ? 'Custom Novelty / Significance Statement' : 'Pernyataan Kebaruan Riset Khusus'}
                    </label>
                    <textarea
                      rows={3}
                      value={noveltyStatement}
                      onChange={(e) => setNoveltyStatement(e.target.value)}
                      placeholder={isEn ? 'Leave blank to use AI-synthesized novelty statement...' : 'Biarkan kosong untuk menggunakan formulasi AI default...'}
                      className="mt-1 w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {isEn ? 'Why Submit to This Journal (Scope Alignment)' : 'Alasan Keselarasan Ruang Lingkup Jurnal'}
                    </label>
                    <textarea
                      rows={3}
                      value={whyThisJournal}
                      onChange={(e) => setWhyThisJournal(e.target.value)}
                      placeholder={isEn ? 'Leave blank to use AI-synthesized scope alignment...' : 'Biarkan kosong untuk menggunakan formulasi AI default...'}
                      className="mt-1 w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Cover Letter Monospace Preview */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap select-text">
                  {submissionPackage.coverLetterText}
                </div>
              </div>
            )}

            {/* TAB 2: HIGHLIGHTS */}
            {activeTab === 'highlights' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">
                      {isEn ? 'Research Highlights (3 - 5 Bullet Points)' : 'Poin Kebaruan Utama (3 - 5 Poin)'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {isEn
                        ? 'Essential for Elsevier & IEEE: concise core findings with max 85 characters each'
                        : 'Wajib untuk Elsevier & IEEE: temuan kunci ringkas dengan panjang maksimal 85 karakter'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAddHighlight}
                      disabled={highlights.length >= 5}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 disabled:opacity-50 transition"
                    >
                      <IconPlus className="h-4 w-4" />
                      {isEn ? 'Add Highlight' : 'Tambah Poin'}
                    </button>
                    <button
                      onClick={() => handleCopy(highlights.map((h) => `• ${h}`).join('\n'), 'highlights')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition"
                    >
                      {copiedKey === 'highlights' ? <IconCheck className="h-4 w-4 text-emerald-500" /> : <IconCopy className="h-4 w-4" />}
                      {copiedKey === 'highlights' ? (isEn ? 'Copied!' : 'Tersalin!') : (isEn ? 'Copy' : 'Salin')}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {highlights.map((h, idx) => {
                    const isTooLong = h.length > 85;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border ${
                          isTooLong
                            ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30 dark:bg-rose-950/20'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                        } space-y-1.5`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            {isEn ? `Highlight #${idx + 1}` : `Poin #${idx + 1}`}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[11px] font-mono font-medium ${
                                isTooLong
                                  ? 'text-rose-600 dark:text-rose-400 font-bold'
                                  : 'text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              {h.length} / 85 {isEn ? 'chars' : 'karakter'}
                            </span>
                            {highlights.length > 3 && (
                              <button
                                onClick={() => handleDeleteHighlight(idx)}
                                className="p-1 text-slate-400 hover:text-rose-500 transition"
                              >
                                <IconTrash className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <input
                          type="text"
                          value={h}
                          onChange={(e) => handleUpdateHighlight(idx, e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: DECLARATIONS */}
            {activeTab === 'declarations' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">
                    {isEn ? 'Mandatory Ethical Declarations & Disclosure' : 'Deklarasi Etika & Pernyataan Wajib'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {isEn
                      ? 'COI, grant funding disclosure, and research data availability requirements'
                      : 'Kepatuhan konflik kepentingan, sumber pendanaan hibah, dan ketersediaan data riset'}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* COI */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                    <div className="flex items-center gap-2">
                      <IconScale className="h-4 w-4 text-indigo-500" />
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                        {isEn ? 'Conflict of Interest (COI) Statement' : 'Pernyataan Bebas Konflik Kepentingan'}
                      </h4>
                    </div>
                    <textarea
                      rows={2}
                      value={coiStatement}
                      onChange={(e) => setCoiStatement(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Funding */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                    <div className="flex items-center gap-2">
                      <IconBuildingArch className="h-4 w-4 text-emerald-500" />
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                        {isEn ? 'Funding & Grant Acknowledgement' : 'Sumber Pendanaan & Hibah Riset'}
                      </h4>
                    </div>
                    <textarea
                      rows={2}
                      value={fundingStatement}
                      onChange={(e) => setFundingStatement(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Data Availability */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                    <div className="flex items-center gap-2">
                      <IconDatabase className="h-4 w-4 text-amber-500" />
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                        {isEn ? 'Data Availability Statement' : 'Pernyataan Aksesibilitas Data'}
                      </h4>
                    </div>
                    <textarea
                      rows={2}
                      value={dataAvailabilityStatement}
                      onChange={(e) => setDataAvailabilityStatement(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SUGGESTED REVIEWERS */}
            {activeTab === 'reviewers' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">
                      {isEn ? 'Suggested Peer Reviewers' : 'Rekomendasi Mitra Bestari (Reviewer)'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {isEn
                        ? 'Candidate reviewers derived from cited literature in your bibliography'
                        : 'Kandidat reviewer independen yang disaring otomatis dari pustaka referensi Anda'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSuggestedReviewers(generateSuggestedReviewers(bibliographyEntries, corrAuthorName))}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                    >
                      <IconRefresh className="h-4 w-4" />
                      {isEn ? 'Regenerate' : 'Segarkan'}
                    </button>
                    <button
                      onClick={handleAddReviewer}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition"
                    >
                      <IconPlus className="h-4 w-4" />
                      {isEn ? 'Add' : 'Tambah'}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {suggestedReviewers.map((rev, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {isEn ? `Reviewer Candidate #${idx + 1}` : `Kandidat Reviewer #${idx + 1}`}
                        </span>
                        {suggestedReviewers.length > 2 && (
                          <button
                            onClick={() => handleDeleteReviewer(idx)}
                            className="p-1 text-slate-400 hover:text-rose-500 transition"
                          >
                            <IconTrash className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={rev.name}
                          onChange={(e) => handleUpdateReviewer(idx, 'name', e.target.value)}
                          placeholder="Name with Academic Title"
                          className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                        />
                        <input
                          type="email"
                          value={rev.email}
                          onChange={(e) => handleUpdateReviewer(idx, 'email', e.target.value)}
                          placeholder="Institutional Email"
                          className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                        />
                        <input
                          type="text"
                          value={rev.affiliation}
                          onChange={(e) => handleUpdateReviewer(idx, 'affiliation', e.target.value)}
                          placeholder="University / Affiliation"
                          className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white sm:col-span-2"
                        />
                        <input
                          type="text"
                          value={rev.reason}
                          onChange={(e) => handleUpdateReviewer(idx, 'reason', e.target.value)}
                          placeholder="Rationale / Absence of Conflict"
                          className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white sm:col-span-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: COMPLETE SUBMISSION PACKAGE */}
            {activeTab === 'full_package' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">
                      {isEn ? 'Consolidated Submission Package' : 'Paket Submisi Terkonsolidasi'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {isEn
                        ? 'Includes cover letter, highlights, statements, reviewer suggestions, and manuscript inventory'
                        : 'Mencakup surat pengantar, poin kebaruan, deklarasi etika, reviewer, dan inventaris naskah'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleCopy(
                          exportSubmissionPackageMarkdown(submissionPackage, language),
                          'full_package'
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition"
                    >
                      {copiedKey === 'full_package' ? (
                        <IconCheck className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <IconCopy className="h-4 w-4" />
                      )}
                      {copiedKey === 'full_package'
                        ? isEn
                          ? 'Copied Package!'
                          : 'Tersalin!'
                        : isEn
                        ? 'Copy Package Markdown'
                        : 'Salin Markdown Paket'}
                    </button>
                    <button
                      onClick={() =>
                        handleDownload(
                          exportSubmissionPackageMarkdown(submissionPackage, language),
                          `Submission_Package_${journalName.replace(/\s+/g, '_')}.md`
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
                    >
                      <IconDownload className="h-4 w-4" />
                      {isEn ? 'Download Package (.md)' : 'Unduh Paket (.md)'}
                    </button>
                  </div>
                </div>

                {/* Inventory Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-center">
                    <span className="block text-xs text-slate-400">{isEn ? 'Total Words' : 'Jumlah Kata'}</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">
                      {submissionPackage.metrics.totalWords.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-center">
                    <span className="block text-xs text-slate-400">{isEn ? 'Abstract' : 'Abstrak'}</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">
                      {submissionPackage.metrics.abstractWords} {isEn ? 'words' : 'kata'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-center">
                    <span className="block text-xs text-slate-400">{isEn ? 'Tables' : 'Tabel'}</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">
                      {submissionPackage.metrics.tableCount}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-center">
                    <span className="block text-xs text-slate-400">{isEn ? 'Figures' : 'Gambar'}</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">
                      {submissionPackage.metrics.figureCount}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-center">
                    <span className="block text-xs text-slate-400">{isEn ? 'References' : 'Rujukan'}</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">
                      {submissionPackage.metrics.referenceCount}
                    </span>
                  </div>
                </div>

                {/* Markdown Code Preview */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap select-text max-h-96 overflow-y-auto">
                  {exportSubmissionPackageMarkdown(submissionPackage, language)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {isEn
              ? 'Ready for submission systems: Elsevier Editorial Manager, IEEE Author Portal, ScholarOne, OJS'
              : 'Kompatibel dengan portal pengajuan: Elsevier Editorial Manager, IEEE Author Portal, ScholarOne, OJS'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
          >
            {isEn ? 'Close' : 'Tutup'}
          </button>
        </div>
      </div>
    </div>
  );
}
