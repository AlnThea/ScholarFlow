export type StatsSoftware = 'spss' | 'smartpls' | 'pspp' | 'r_studio' | 'generic';

export type StatsTestType =
  | 'auto'
  | 'ttest'
  | 'anova'
  | 'regression'
  | 'correlation'
  | 'mann_whitney'
  | 'chi_square'
  | 'cronbach_alpha'
  | 'pls_sem';

export type StatsLanguage = 'id' | 'en';

export type StatsStyle = 'skripsi' | 'thesis' | 'journal' | 'compact';

export type StatsAIProvider = 'gemini' | 'openai' | 'openrouter';

export interface StatsInputData {
  type: 'image' | 'csv' | 'text';
  fileName: string;
  fileSize: number; // in bytes
  mimeType: string;
  previewUrl?: string; // Data URL for image display
  base64Data?: string; // base64 string without data prefix
  rawText?: string; // parsed text for CSV / text output
  lineCount?: number;
}

export interface StatsAnalysisConfig {
  software: StatsSoftware;
  testType: StatsTestType;
  language: StatsLanguage;
  style: StatsStyle;
  researchQuestion?: string;
  hypothesis?: string;
  aiProvider?: StatsAIProvider;
  aiModel?: string;
  customApiKey?: string;
}

export interface StatsInterpretationResult {
  id: string;
  timestamp: number;
  software: StatsSoftware;
  testType: string;
  title: string;
  summary: string;
  narrativeAPA: string;
  statisticalFindings: {
    statisticName: string;
    value: string;
    pValue?: string;
    degreesOfFreedom?: string;
    isSignificant: boolean;
    interpretation: string;
  }[];
  apaTableMarkdown?: string;
  recommendation: string;
  rawResponse?: string;
  providerUsed?: string;
  modelUsed?: string;
}
