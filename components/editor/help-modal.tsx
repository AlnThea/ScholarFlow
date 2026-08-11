// c:/web/ScholarFlow/components/editor/help-modal.tsx
'use client';

import React, { useState } from 'react';
import {
  IconX,
  IconHelpCircle,
  IconBook,
  IconSparkles,
  IconFileCode,
  IconDatabase,
  IconDownload,
  IconCheck,
  IconArrowRight,
  IconChevronRight,
  IconFileText,
  IconInfoCircle,
  IconExternalLink
} from '@tabler/icons-react';
import { useLanguage } from '../i18n/language-context';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'template' | 'ai' | 'citations' | 'architecture'>('template');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <IconHelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {language === 'en' ? 'ScholarFlow Help & Documentation Center' : 'Pusat Bantuan & Dokumentasi ScholarFlow'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {language === 'en' ? 'Guides, API workflows, and template localization instructions' : 'Panduan, alur kerja API, dan instruksi lokalisasi templat'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            title={language === 'en' ? 'Close Modal' : 'Tutup Modal'}
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-64 border-r border-slate-100 bg-slate-50/50 p-3 flex flex-col gap-1 shrink-0 overflow-y-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-2 pb-1">
              {language === 'en' ? 'Documentation Modules' : 'Modul Dokumentasi'}
            </span>

            <button
              type="button"
              onClick={() => setActiveTab('template')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition cursor-pointer ${
                activeTab === 'template'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <IconFileCode className={`h-4 w-4 shrink-0 ${activeTab === 'template' ? 'text-white' : 'text-indigo-500'}`} />
              <div className="flex flex-col min-w-0">
                <span className="truncate">{language === 'en' ? 'Template Localization' : 'Lokalisasi Templat'}</span>
                <span className={`text-[9px] font-normal truncate ${activeTab === 'template' ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {language === 'en' ? 'Custom manuscript structures' : 'Struktur manuskrip kustom'}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <IconSparkles className={`h-4 w-4 shrink-0 ${activeTab === 'ai' ? 'text-white' : 'text-amber-500'}`} />
              <div className="flex flex-col min-w-0">
                <span className="truncate">{language === 'en' ? 'AI Co-Pilot & Writing' : 'AI Co-Pilot & Penulisan'}</span>
                <span className={`text-[9px] font-normal truncate ${activeTab === 'ai' ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {language === 'en' ? 'Gemini 2.0 streaming & prompts' : 'Gemini 2.0 streaming & prompt'}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('citations')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition cursor-pointer ${
                activeTab === 'citations'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <IconBook className={`h-4 w-4 shrink-0 ${activeTab === 'citations' ? 'text-white' : 'text-emerald-500'}`} />
              <div className="flex flex-col min-w-0">
                <span className="truncate">{language === 'en' ? 'Library & References' : 'Perpustakaan & Sitasi'}</span>
                <span className={`text-[9px] font-normal truncate ${activeTab === 'citations' ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {language === 'en' ? 'PDF parsing & RIS imports' : 'Ekstrak PDF & impor RIS'}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition cursor-pointer ${
                activeTab === 'architecture'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <IconDatabase className={`h-4 w-4 shrink-0 ${activeTab === 'architecture' ? 'text-white' : 'text-blue-500'}`} />
              <div className="flex flex-col min-w-0">
                <span className="truncate">{language === 'en' ? 'Backend & Document Export' : 'Backend & Ekspor Dokument'}</span>
                <span className={`text-[9px] font-normal truncate ${activeTab === 'architecture' ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {language === 'en' ? 'Supabase vs Express, Word/PDF' : 'Supabase vs Express, Word/PDF'}
                </span>
              </div>
            </button>
          </div>

          {/* Content Pane */}
          <div className="flex-1 overflow-y-auto p-6 text-xs leading-relaxed text-slate-700">
            {/* TAB 1: TEMPLATE LOCALIZATION */}
            {activeTab === 'template' && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <IconFileCode className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {language === 'en' ? 'Custom Academic Template Localization' : 'Lokalisasi Templat Akademik Kustom'}
                  </h3>
                </div>

                <p>
                  {language === 'en'
                    ? 'ScholarFlow supports extensible bilingual academic manuscript templates. Templates define chapter structures, paragraph defaults, and bilingual metadata (English & Indonesian).'
                    : 'ScholarFlow mendukung templat manuskrip akademik bilingual yang dapat diperluas. Templat mengatur struktur bab, isi paragraf awal, dan metadata bilingual (Bahasa Indonesia & Inggris).'}
                </p>

                <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 flex flex-col gap-1 text-[11px]">
                  <span className="font-bold text-indigo-900">
                    {language === 'en' ? '📁 Directory Location:' : '📁 Lokasi Direktori:'}
                  </span>
                  <code className="bg-white text-indigo-700 px-2 py-1 rounded font-mono text-[10px] border border-indigo-100">
                    lib/templates/ (index.ts, skripsi.ts, ieee.ts, apa.ts, report.ts, empty.ts)
                  </code>
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="font-bold text-slate-800 text-[11px]">
                    {language === 'en' ? 'Steps to Register a New Custom Template:' : 'Langkah Pendaftaran Templat Kustom Baru:'}
                  </h4>
                  <ol className="list-decimal list-inside flex flex-col gap-2 font-medium">
                    <li>
                      <strong>{language === 'en' ? 'Create block file:' : 'Buat file generator blok:'}</strong>{' '}
                      {language === 'en' ? 'Add a new generator file in' : 'Tambahkan file generator baru di'} <code>lib/templates/my-template.ts</code>.
                    </li>
                    <li>
                      <strong>{language === 'en' ? 'Define bilingual function:' : 'Definisikan fungsi bilingual:'}</strong>{' '}
                      {language === 'en'
                        ? 'Export a function accepting language ("en" | "id") returning Editor.js blocks with random IDs.'
                        : 'Ekspor fungsi dengan parameter bahasa ("en" | "id") yang mengembalikan daftar blok Editor.js ber-ID unik.'}
                    </li>
                    <li>
                      <strong>{language === 'en' ? 'Register metadata:' : 'Daftarkan metadata:'}</strong>{' '}
                      {language === 'en'
                        ? 'Add entry to TEMPLATES_METADATA array in lib/templates/index.ts including label, badge, color, and outline.'
                        : 'Tambahkan entri baru ke array TEMPLATES_METADATA di lib/templates/index.ts termasuk label, badge, warna, dan outline.'}
                    </li>
                  </ol>
                </div>

                <div className="bg-slate-900 text-slate-100 p-3 rounded-xl overflow-x-auto text-[10px] font-mono leading-normal border border-slate-800">
                  <span className="text-slate-400">// Example: lib/templates/my-template.ts</span>
                  <br />
                  <span className="text-indigo-400">export function</span> getMyTemplate(language: <span className="text-emerald-300">'en' | 'id'</span>) {'{'}
                  <br />
                  &nbsp;&nbsp;<span className="text-indigo-400">return</span> [
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;{'{'} id: <span className="text-amber-300">"h-1-" + Math.random().toString(36).substr(2, 7)</span>, type: <span className="text-emerald-300">"header"</span>, data: {'{'} text: language === <span className="text-emerald-300">'en'</span> ? <span className="text-emerald-300">"Chapter 1: Intro"</span> : <span className="text-emerald-300">"Bab 1: Pendahuluan"</span>, level: 2 {'}'} {'}'},
                  <br />
                  &nbsp;&nbsp;];
                  <br />
                  {'}'}
                </div>

                <div className="text-[10px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  💡 {language === 'en' ? 'For a full technical guide, refer to' : 'Untuk panduan teknis lengkap, silakan lihat'} <strong>doc/TEMPLATE_LOCALIZATION_GUIDE.md</strong>.
                </div>
              </div>
            )}

            {/* TAB 2: AI CO-PILOT */}
            {activeTab === 'ai' && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <IconSparkles className="h-5 w-5 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {language === 'en' ? 'AI Academic Co-Pilot & Writing Gateway' : 'AI Academic Co-Pilot & Gateway Penulisan'}
                  </h3>
                </div>

                <p>
                  {language === 'en'
                    ? 'ScholarFlow integrates Google Gemini 2.0 Flash Streaming API, OpenRouter, and Custom OpenAI-Compatible LLM endpoints (Groq, Together, Ollama, LM Studio) to assist with academic writing.'
                    : 'ScholarFlow mengintegrasikan Google Gemini 2.0 Flash Streaming API, OpenRouter, serta Custom OpenAI-Compatible LLM (Groq, Together, Ollama, LM Studio) untuk membantu penulisan akademik.'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                    <span className="font-bold text-slate-800 text-[11px] block mb-1">
                      ✨ {language === 'en' ? 'Improve Writing & Paraphrase' : 'Sempurnakan & Parafrase'}
                    </span>
                    <p className="text-[10px] text-slate-600">
                      {language === 'en'
                        ? 'Select any text in the editor and click "Improve Writing" to elevate tone, grammar, and academic clarity.'
                        : 'Pilih teks di editor dan klik "Improve Writing" untuk meningkatkan nada, tata bahasa, dan kejelasan akademik.'}
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                    <span className="font-bold text-slate-800 text-[11px] block mb-1">
                      📄 {language === 'en' ? 'Abstract Generator' : 'Pembuat Abstrak Akademik'}
                    </span>
                    <p className="text-[10px] text-slate-600">
                      {language === 'en'
                        ? 'Generates structured academic abstracts (Background, Methodology, Key Findings, Conclusion) based on document content.'
                        : 'Menghasilkan abstrak akademik terstruktur (Latar Belakang, Metodologi, Temuan Utama, Kesimpulan) dari konteks dokumen.'}
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-900">
                  <span className="font-bold block mb-0.5">🛡️ Edge Rate Limiting Guard:</span>
                  {language === 'en'
                    ? 'Requests are protected by an Edge Rate Limiter restricting usage to 15 Requests Per Minute (15 RPM) per IP to ensure high availability.'
                    : 'Permintaan dilindungi oleh Edge Rate Limiter yang membatasi penggunaan 15 Request Per Minute (15 RPM) per IP demi keandalan server.'}
                </div>
              </div>
            )}

            {/* TAB 3: REFERENCE LIBRARY */}
            {activeTab === 'citations' && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <IconBook className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {language === 'en' ? 'Reference Library, PDF Parsing & RIS Imports' : 'Perpustakaan Sitasi, Ekstrak PDF & Impor RIS'}
                  </h3>
                </div>

                <p>
                  {language === 'en'
                    ? 'Manage scholarly citations, format reference lists (APA 7th & IEEE), and extract metadata directly from PDF papers and RIS citation files.'
                    : 'Kelola sitasi ilmiah, format daftar pustaka (APA 7th & IEEE), serta ekstrak metadata langsung dari berkas PDF jurnal dan RIS.'}
                </p>

                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-2 bg-emerald-50/60 border border-emerald-100 rounded-xl p-3">
                    <IconCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-emerald-950 text-[11px] block">
                        {language === 'en' ? 'PDF Paper Upload & Extraction' : 'Unggah & Ekstrak Berkas PDF'}
                      </span>
                      <p className="text-[10px] text-emerald-800">
                        {language === 'en'
                          ? 'In-memory serverless PDF parser extracts title, DOI, authors, and year to automatically add cited entries to your library.'
                          : 'Parser PDF in-memory mengestrak judul, DOI, penulis, dan tahun terbit untuk secara otomatis menambah rujukan ke perpustakaan Anda.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <IconCheck className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 text-[11px] block">
                        {language === 'en' ? 'RIS Reference Import' : 'Impor Referensi File RIS'}
                      </span>
                      <p className="text-[10px] text-slate-600">
                        {language === 'en'
                          ? 'Import reference files from EndNote, Mendeley, or Google Scholar (.ris) directly via the Library sidebar.'
                          : 'Impor berkas referensi dari EndNote, Mendeley, atau Google Scholar (.ris) secara langsung via sidebar Library.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ARCHITECTURE & EXPORTS */}
            {activeTab === 'architecture' && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <IconDatabase className="h-5 w-5 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {language === 'en' ? 'Multi-Backend Architecture & Document Exports' : 'Arsitektur Multi-Backend & Ekspor Dokumen'}
                  </h3>
                </div>

                <p>
                  {language === 'en'
                    ? 'ScholarFlow operates a Repository Pattern supporting seamless switching between Supabase PaaS and Express REST VPS backends, along with high-fidelity exports.'
                    : 'ScholarFlow menjalankan Repository Pattern yang mendukung alih-mode transparan antara Supabase PaaS dan Express REST VPS backend, serta ekspor berkualitas tinggi.'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="border border-blue-100 bg-blue-50/40 rounded-xl p-3">
                    <span className="font-bold text-blue-950 text-[11px] block mb-1">⚡ Hybrid Sync Engine</span>
                    <p className="text-[10px] text-blue-900">
                      {language === 'en'
                        ? 'Combines Supabase WebSocket Realtime with Express HTTP Polling, featuring automatic 3x failover and Page Visibility Guards.'
                        : 'Menggabungkan Supabase WebSocket Realtime dengan Express HTTP Polling, dilengkapi failover 3x dan Page Visibility Guard.'}
                    </p>
                  </div>

                  <div className="border border-indigo-100 bg-indigo-50/40 rounded-xl p-3">
                    <span className="font-bold text-indigo-950 text-[11px] block mb-1">📄 MS Word (MHTML) & PDF Export</span>
                    <p className="text-[10px] text-indigo-900">
                      {language === 'en'
                        ? 'Export manuscripts to Word (.doc MHTML) with base64 embedded images, alignment mapping, and client-side high-fidelity PDF printing.'
                        : 'Ekspor manuskrip ke Word (.doc MHTML) dengan gambar base64 tersemat, pemetaan alignment, dan cetak PDF presisi tinggi.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500">
          <span>ScholarFlow v0.5.2 • AI Academic & Research Co-Pilot</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition cursor-pointer shadow-xs"
          >
            {language === 'en' ? 'Got it' : 'Tutup'}
          </button>
        </div>
      </div>
    </div>
  );
}
