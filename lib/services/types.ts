// lib/services/types.ts
// Unified DataService Contract & Type Definitions for ScholarFlow Backend Abstraction

export type DocumentSettings = {
  publishYear: 'all' | '5_years' | 'custom';
  publishYearStart?: number | null;
  publishYearEnd?: number | null;
  impactFactor: 'all' | '0.25+' | '3+' | '10+';
  considerExternal: boolean;
  considerLibrary: boolean;
  limitCollection: string;
  citationStyle: string;
  citationLocale: string;
  showPageNumber: boolean;
  folders?: string[];
  folder_assignments?: Record<string, string>;
  projectId?: string;
  projectName?: string;
  projectType?: 'skripsi' | 'jurnal' | 'makalah' | 'independent';
  projectPart?: string;
  templateId?: 'empty' | 'ieee' | 'skripsi' | 'apa' | 'report';
  shareActive?: boolean;
  sharePermission?: 'view' | 'edit';
  alignments?: Record<string, string>;
};

export type DocumentEntry = {
  id: string;
  title: string;
  content: any; // EditorJS JSON content
  settings: DocumentSettings;
  user_id: string;
  created_at: string;
  updated_at: string;
  ownerPlan?: string;
};

export type DocumentListItem = {
  id: string;
  title: string;
  settings: DocumentSettings;
  created_at: string;
  updated_at: string;
};

export type UserProfile = {
  id: string;
  full_name: string | null;
  role: 'user' | 'admin';
  created_at: string;
  subscription_plan: string;
  subscription_status: string;
  subscription_end: string | null;
};

export type CitationCandidate = {
  reference_id: string;
  title: string;
  authors: string[];
  year: number | null;
  venue?: string | null;
  doi?: string | null;
  url?: string | null;
  abstract?: string | null;
  citation_count?: number;
  score?: number;
  source?: 'openalex' | 'crossref' | 'custom';
};

export type CitationLibraryEntry = {
  id: string;
  reference_id: string;
  citation_data: CitationCandidate;
  added_by: string | null;
  added_at: string;
};

export type PricingPlan = {
  id: string;
  name: string;
  price: number;
  price_period: string;
  description: string | null;
  features: string[];
  is_popular: boolean;
  promo_text: string | null;
  updated_at: string;
};

export type ServiceResponse<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Unified Repository / Data Provider Contract for ScholarFlow
 * Supports multi-backend adapters: Supabase SDK PaaS vs Self-Hosted Express.js REST API
 */
export interface IDataService {
  // Document Operations
  getDocuments(userId: string): Promise<DocumentListItem[]>;
  getDocumentById(docId: string, userId: string): Promise<DocumentEntry | null>;
  createDocument(
    userId: string,
    title?: string,
    content?: any,
    settings?: Partial<DocumentSettings>
  ): Promise<DocumentEntry | null>;
  updateDocument(
    docId: string,
    userId: string,
    updates: { title?: string; content?: any; settings?: Partial<DocumentSettings> }
  ): Promise<ServiceResponse>;
  deleteDocument(docId: string, userId: string): Promise<ServiceResponse>;
  getSharedDocument(docId: string): Promise<DocumentEntry | null>;
  updateSharedDocument(
    docId: string,
    updates: { title?: string; content?: any; settings?: Partial<DocumentSettings> }
  ): Promise<ServiceResponse>;

  // User Profile Operations
  getUserProfile(userId: string): Promise<UserProfile | null>;
  updateUserProfile(
    userId: string,
    updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>
  ): Promise<ServiceResponse>;

  // Citation Library Operations
  getCitationLibrary(userId: string): Promise<Record<string, CitationCandidate>>;
  saveCitationToLibrary(candidate: CitationCandidate, userId: string): Promise<ServiceResponse>;
  deleteCitationFromLibrary(referenceId: string, userId: string): Promise<ServiceResponse>;
  isCitationInLibrary(referenceId: string, userId: string): Promise<boolean>;

  // Catalog Pricing Operations
  getPricingPlans(): Promise<PricingPlan[]>;
  createPricingPlan(plan: Omit<PricingPlan, 'updated_at'>): Promise<ServiceResponse>;
  updatePricingPlan(
    planId: string,
    updates: Partial<Omit<PricingPlan, 'id' | 'updated_at'>>
  ): Promise<ServiceResponse>;
  deletePricingPlan(planId: string): Promise<ServiceResponse>;
}
