// lib/config/feature-flags.ts
/**
 * Feature Flags Configuration for ScholarFlow
 * 
 * Mengontrol visibilitas fitur-fitur yang masih dalam tahap review / audit sebelum rilis publik.
 * Mengubah nilai flag ke `true` akan langsung mengaktifkan dan menampilkan kembali fitur terkait
 * tanpa perlu mengubah atau menulis ulang logika kode komponen.
 */

export const FEATURE_FLAGS = {
  /**
   * Modul Asisten AI Multimodal SPSS / PSPP Data Interpreter
   * (Tab 'Data SPSS' di Sidebar Kanan)
   */
  ENABLE_SPSS_INTERPRETER: false,

  /**
   * Matriks Sintesis Literatur & Synthesis Grid
   * (Di tab 'Statistik Dokumen' & shortcut Ctrl+Shift+T)
   */
  ENABLE_LITERATURE_MATRIX: false,

  /**
   * Format Target Jurnal & Publishing Presets (IEEE, Elsevier, SINTA, dll.)
   * (Di tab 'Statistik Dokumen' & shortcut Ctrl+Shift+J)
   */
  ENABLE_JOURNAL_PRESETS: false,

  /**
   * Peta Konsep & Jaringan Sitasi (Cross-Paper Concept Map 2D SVG)
   * (Di tab 'Statistik Dokumen' & shortcut Ctrl+Shift+N)
   */
  ENABLE_CONCEPT_MAP: false,

  /**
   * Paket Pengajuan Publikasi & Cover Letter AI
   * (Di tab 'Statistik Dokumen' & shortcut Ctrl+Shift+Y)
   */
  ENABLE_SUBMISSION_PACKAGE: false,
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;
