// components/i18n/language-context.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'en' | 'id';

export const translations = {
  en: {
    'app.title': 'ScholarFlow',
    'navbar.dashboard': 'Dashboard',
    'navbar.billing': 'Billing',
    'navbar.admin': 'Admin Panel',
    'navbar.logout': 'Logout',
    'sidebar.library': 'Reference Library',
    'sidebar.drafts': 'Document Drafts',
    'sidebar.history': 'History',
    'sidebar.write': 'Write',
    'sidebar.references': 'References',
    'sidebar.add_folder': 'Add Folder',
    'sidebar.no_drafts': 'No drafts found.',
    'sidebar.delete_doc_confirm': 'Delete document "{title}"?',
    'sidebar.delete_ref_confirm': 'Delete this PDF reference from your library?',
    'sidebar.delete_ref_error': 'Failed to delete reference.',
    'editor.placeholder': 'Start writing your academic journal draft here...',
    'editor.saved_cloud': 'Saved to Cloud',
    'editor.saving': 'Saving...',
    'editor.saved_local': 'Saved Locally (Offline)',
    'editor.saved_backup': 'Using Offline Backup',
    'ai.title': 'AI Edit History',
    'ai.delete_history_confirm': 'Are you sure you want to delete your entire AI edit history?',
    'ai.no_history': 'No AI edit history available',
    'ai.badge.academic': 'Academic',
    'ai.badge.paraphrase': 'Paraphrase',
    'ai.badge.simplify': 'Simplify',
    'ai.badge.shorten': 'Condense',
    'ai.badge.expand': 'Elaborate',
    'ai.badge.summarize': 'Summarize',
    'ai.badge.abstract': 'Abstract',
    'ai.apply': 'Apply',
    'ai.copy': 'Copy',
    'ai.copied': 'Copied to Clipboard!',
    'menu.settings': 'AI Settings',
    'menu.actions': 'Assistant Actions',
    'menu.polish': 'Polish with AI',
    'menu.paraphrase': 'Paraphrase Sentence',
    'menu.citation': 'Search Citations',
    'setup.title': 'Create New Academic Document',
    'setup.type': 'Document Type / Project Grouping',
    'setup.single': 'Single Document',
    'setup.folder': 'Add Chapter/Section',
    'setup.project_name': 'Project Name / Main Title (Thesis/Journal)',
    'setup.paper_journal': '📚 Journal / Scientific Paper',
    'setup.paper_thesis': '🎓 Thesis / Dissertation',
    'setup.part_name': 'Section / Chapter Document Name',
    'setup.all_years': 'All Years',
    'setup.all_journals': 'All Journals',
    'setup.use_pdf': 'Use uploaded PDFs as AI citation context',
    'setup.citation_style': 'Document Citation Style',
    'setup.cancel': 'Cancel',
    'setup.create': 'Create Document',
    'setup.free_project_limit': '🔒 Free tier users are limited to 1 Project Folder. Please upgrade to Pro Writer in the Pricing menu to create unlimited projects!',
    'setup.free_part_limit': '🔒 Free tier users are limited to a maximum of 3 Chapters/Sections per project. Please upgrade to Pro Writer in the Pricing menu to add unlimited chapters!',
    'style.title': 'Select Citation Style & Localization',
    'style.search': 'Search citation style (e.g. APA, IEEE...)',
    'style.lang': 'Language Localization',
    'style.save': 'Save Selection',
    'pricing.title': 'Choose Your Subscription Plan',
    'pricing.subtitle': 'Boost your academic writing productivity with unlimited AI assistant features.',
    'pricing.free': 'Free',
    'pricing.popular': 'Popular',
    'pricing.view_plan': 'View Plan',
    'pricing.contact_us': 'Contact Us',
    'pricing.subscribe': 'Subscribe Now',
    'pricing.loading': 'Loading subscription plans...',
    'pricing.back': 'Back to Workspace',
    'pricing.active': 'Active',
    'pricing.active_fallback': 'Active Plan',
    'pricing.sales': 'Contact Sales Team',
    'admin.pricing.title': 'Manage Pricing Plans',
    'admin.pricing.price': 'Price',
    'admin.pricing.period': 'Billing Cycle',
    'admin.pricing.desc': 'Short Description',
    'admin.pricing.features': 'Features (one per line)',
    'admin.pricing.save': 'Save Changes',
    'admin.models.title': 'Manage AI Models',
    'admin.models.name': 'Display Name',
    'admin.models.id': 'Model ID',
    'admin.models.premium': 'Premium Type',
    'admin.models.active': 'Active',
    'admin.models.save': 'Save',
    'payment.pay': 'Pay Now',
    'payment.waiting': 'Waiting for Payment',
    'payment.instructions': 'Transfer Instructions',
    'share.title': 'Share Document',
    'share.copy': 'Copy Link'
  },
  id: {
    'app.title': 'ScholarFlow',
    'navbar.dashboard': 'Dasbor',
    'navbar.billing': 'Billing',
    'navbar.admin': 'Panel Admin',
    'navbar.logout': 'Keluar',
    'sidebar.library': 'Library Rujukan',
    'sidebar.drafts': 'Draf Dokumen',
    'sidebar.history': 'Riwayat',
    'sidebar.write': 'Tulis',
    'sidebar.references': 'Rujukan',
    'sidebar.add_folder': '+ Folder',
    'sidebar.no_drafts': 'Belum ada dokumen yang dibuat.',
    'sidebar.delete_doc_confirm': 'Hapus dokumen "{title}"?',
    'sidebar.delete_ref_confirm': 'Hapus rujukan PDF ini dari library Anda?',
    'sidebar.delete_ref_error': 'Gagal menghapus rujukan.',
    'editor.placeholder': 'Mulai menulis draf jurnal akademik Anda di sini...',
    'editor.saved_cloud': 'Tersimpan ke Cloud',
    'editor.saving': 'Menyimpan...',
    'editor.saved_local': 'Disimpan Lokal (Offline)',
    'editor.saved_backup': 'Menggunakan Cadangan Offline',
    'ai.title': 'Riwayat Perbaikan AI',
    'ai.delete_history_confirm': 'Apakah Anda yakin ingin menghapus seluruh riwayat perbaikan AI?',
    'ai.no_history': 'Belum ada riwayat perbaikan AI',
    'ai.badge.academic': 'Akademis',
    'ai.badge.paraphrase': 'Parafrase',
    'ai.badge.simplify': 'Sederhanakan',
    'ai.badge.shorten': 'Ringkas',
    'ai.badge.expand': 'Perluas',
    'ai.badge.summarize': 'Ringkasan',
    'ai.badge.abstract': 'Abstrak',
    'ai.apply': 'Terapkan',
    'ai.copy': 'Salin',
    'ai.copied': 'Tersalin ke Clipboard!',
    'menu.settings': 'Pengaturan AI',
    'menu.actions': 'Aksi Asisten',
    'menu.polish': 'Poles dengan AI',
    'menu.paraphrase': 'Parafrase Kalimat',
    'menu.citation': 'Cari Kutipan / Sitasi',
    'setup.title': 'Buat Dokumen Akademik Baru',
    'setup.type': 'Jenis Dokumen / Pengelompokan Proyek',
    'setup.single': 'Dokumen Tunggal',
    'setup.folder': 'Tambah Bab/Bagian',
    'setup.project_name': 'Nama Proyek / Judul Besar (Tesis/Jurnal)',
    'setup.paper_journal': '📚 Jurnal / Paper Ilmiah',
    'setup.paper_thesis': '🎓 Skripsi / Tesis / Disertasi',
    'setup.part_name': 'Bagian / Nama Bab Dokumen',
    'setup.all_years': 'Semua Tahun',
    'setup.all_journals': 'Semua Jurnal',
    'setup.use_pdf': 'Gunakan PDF yang di-upload sebagai konteks sitasi AI',
    'setup.citation_style': 'Gaya Sitasi Dokumen (Citation Style)',
    'setup.cancel': 'Batal',
    'setup.create': 'Buat Dokumen',
    'setup.free_project_limit': '🔒 Pengguna paket Free terbatas hanya bisa membuat 1 Folder Proyek. Silakan upgrade ke paket Pro Writer di menu Pricing untuk membuat Proyek tanpa batas!',
    'setup.free_part_limit': '🔒 Pengguna paket Free terbatas hanya bisa memiliki maksimal 3 Bab/Bagian dalam satu Proyek. Silakan upgrade ke paket Pro Writer di menu Pricing untuk menambah bab tanpa batas!',
    'style.title': 'Pilih Gaya Sitasi & Lokalisasi',
    'style.search': 'Cari gaya sitasi (misal: APA, IEEE...)',
    'style.lang': 'Lokalisasi Bahasa (Localized For)',
    'style.save': 'Simpan Pilihan',
    'pricing.title': 'Pilih Paket Langganan Anda',
    'pricing.subtitle': 'Tingkatkan produktivitas menulis jurnal ilmiah Anda dengan fitur asisten AI tanpa batas.',
    'pricing.free': 'Gratis',
    'pricing.popular': 'Terpopuler',
    'pricing.view_plan': 'Lihat Paket',
    'pricing.contact_us': 'Hubungi Kami',
    'pricing.subscribe': 'Berlangganan Sekarang',
    'pricing.loading': 'Memuat paket langganan...',
    'pricing.back': 'Kembali ke Workspace',
    'pricing.active': 'Paket Aktif',
    'pricing.active_fallback': 'Paket Aktif',
    'pricing.sales': 'Hubungi Tim Sales',
    'admin.pricing.title': 'Kelola Paket Pricing',
    'admin.pricing.price': 'Harga',
    'admin.pricing.period': 'Periode Harga',
    'admin.pricing.desc': 'Deskripsi Singkat',
    'admin.pricing.features': 'Fitur (satu per baris)',
    'admin.pricing.save': 'Simpan Perubahan',
    'admin.models.title': 'Kelola Model AI',
    'admin.models.name': 'Nama Tampilan',
    'admin.models.id': 'ID Model',
    'admin.models.premium': 'Tipe Premium',
    'admin.models.active': 'Aktif',
    'admin.models.save': 'Simpan',
    'payment.pay': 'Bayar Sekarang',
    'payment.waiting': 'Menunggu Pembayaran',
    'payment.instructions': 'Instruksi Transfer',
    'share.title': 'Bagikan Dokumen',
    'share.copy': 'Salin Link'
  }
} as const;

type TranslationKey = keyof typeof translations.en;

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
}

const LanguageContext = React.createContext<LanguageContextProps>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const stored = localStorage.getItem('scholarflow.language');
    if (stored === 'id' || stored === 'en') {
      setLanguageState(stored as Language);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('scholarflow.language', lang);
  };

  const t = (key: TranslationKey, params?: Record<string, string>): string => {
    let text: string = translations[language][key] || translations['en'][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return React.useContext(LanguageContext);
}
