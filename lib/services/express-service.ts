// lib/services/express-service.ts
// Express.js REST API Data Provider Adapter implementing IDataService (Multi-DB Agnostic: PostgreSQL, MySQL, MariaDB)

import { supabase } from '@/lib/supabase';
import type {
  IDataService,
  DocumentListItem,
  DocumentEntry,
  DocumentSettings,
  UserProfile,
  CitationCandidate,
  PricingPlan,
  ServiceResponse,
} from './types';

export class ExpressDataService implements IDataService {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = (
      baseUrl ||
      process.env.NEXT_PUBLIC_EXPRESS_API_URL ||
      'http://localhost:5000/api/v1'
    ).replace(/\/$/, '');
  }

  /**
   * Helper to retrieve authorization headers with Bearer JWT token
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) {
        headers['Authorization'] = `Bearer ${data.session.access_token}`;
      }
    } catch (err) {
      console.warn('[ExpressDataService] Failed fetching auth session token:', err);
    }

    return headers;
  }

  /**
   * Helper wrapper for fetch requests
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: string | null }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...(options.headers || {}),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: null,
          error: errorData.message || errorData.error || response.statusText,
        };
      }

      const result = await response.json();
      return { data: result.data !== undefined ? result.data : result, error: null };
    } catch (err: any) {
      console.error(`[ExpressDataService] Network request failed (${endpoint}):`, err);
      return { data: null, error: err.message || 'Network connection failed' };
    }
  }

  // ============================================================================
  // DOCUMENT OPERATIONS
  // ============================================================================

  async getDocuments(userId: string): Promise<DocumentListItem[]> {
    const { data, error } = await this.request<DocumentListItem[]>(
      `/documents?user_id=${encodeURIComponent(userId)}`
    );
    if (error || !data) {
      console.error('[ExpressDataService] getDocuments error:', error);
      return [];
    }
    return data;
  }

  async getDocumentById(docId: string, userId: string): Promise<DocumentEntry | null> {
    const { data, error } = await this.request<DocumentEntry>(
      `/documents/${encodeURIComponent(docId)}?user_id=${encodeURIComponent(userId)}`
    );
    if (error || !data) {
      console.error('[ExpressDataService] getDocumentById error:', error);
      return null;
    }
    return data;
  }

  async createDocument(
    userId: string,
    title = 'Untitled Document',
    content: any = null,
    settings: Partial<DocumentSettings> = {}
  ): Promise<DocumentEntry | null> {
    const { data, error } = await this.request<DocumentEntry>('/documents', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        title,
        content,
        settings,
      }),
    });

    if (error || !data) {
      console.error('[ExpressDataService] createDocument error:', error);
      return null;
    }
    return data;
  }

  async updateDocument(
    docId: string,
    userId: string,
    updates: { title?: string; content?: any; settings?: Partial<DocumentSettings> }
  ): Promise<ServiceResponse> {
    const { error } = await this.request<void>(`/documents/${encodeURIComponent(docId)}`, {
      method: 'PATCH',
      body: JSON.stringify({
        user_id: userId,
        ...updates,
      }),
    });

    if (error) {
      console.error('[ExpressDataService] updateDocument error:', error);
      return { success: false, error };
    }
    return { success: true };
  }

  async deleteDocument(docId: string, userId: string): Promise<ServiceResponse> {
    const { error } = await this.request<void>(
      `/documents/${encodeURIComponent(docId)}?user_id=${encodeURIComponent(userId)}`,
      {
        method: 'DELETE',
      }
    );

    if (error) {
      console.error('[ExpressDataService] deleteDocument error:', error);
      return { success: false, error };
    }
    return { success: true };
  }

  async getSharedDocument(docId: string): Promise<DocumentEntry | null> {
    const { data, error } = await this.request<DocumentEntry>(
      `/shared-documents/${encodeURIComponent(docId)}`
    );
    if (error || !data) {
      console.error('[ExpressDataService] getSharedDocument error:', error);
      return null;
    }
    return data;
  }

  async updateSharedDocument(
    docId: string,
    updates: { title?: string; content?: any; settings?: Partial<DocumentSettings> }
  ): Promise<ServiceResponse> {
    const { error } = await this.request<void>(
      `/shared-documents/${encodeURIComponent(docId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }
    );

    if (error) {
      console.error('[ExpressDataService] updateSharedDocument error:', error);
      return { success: false, error };
    }
    return { success: true };
  }

  // ============================================================================
  // USER PROFILE OPERATIONS
  // ============================================================================

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.request<UserProfile>(
      `/profiles/${encodeURIComponent(userId)}`
    );
    if (error || !data) {
      console.error('[ExpressDataService] getUserProfile error:', error);
      return null;
    }
    return data;
  }

  async updateUserProfile(
    userId: string,
    updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>
  ): Promise<ServiceResponse> {
    const { error } = await this.request<void>(`/profiles/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });

    if (error) {
      console.error('[ExpressDataService] updateUserProfile error:', error);
      return { success: false, error };
    }
    return { success: true };
  }

  // ============================================================================
  // CITATION LIBRARY OPERATIONS
  // ============================================================================

  async getCitationLibrary(): Promise<Record<string, CitationCandidate>> {
    const { data, error } = await this.request<Record<string, CitationCandidate>>(
      '/citations/library'
    );
    if (error || !data) {
      console.error('[ExpressDataService] getCitationLibrary error:', error);
      return {};
    }
    return data;
  }

  async saveCitationToLibrary(
    candidate: CitationCandidate,
    userId: string
  ): Promise<ServiceResponse> {
    const { error } = await this.request<void>('/citations/library', {
      method: 'POST',
      body: JSON.stringify({
        candidate,
        user_id: userId,
      }),
    });

    if (error) {
      console.error('[ExpressDataService] saveCitationToLibrary error:', error);
      return { success: false, error };
    }
    return { success: true };
  }

  async deleteCitationFromLibrary(referenceId: string): Promise<ServiceResponse> {
    const { error } = await this.request<void>(
      `/citations/library/${encodeURIComponent(referenceId)}`,
      {
        method: 'DELETE',
      }
    );

    if (error) {
      console.error('[ExpressDataService] deleteCitationFromLibrary error:', error);
      return { success: false, error };
    }
    return { success: true };
  }

  async isCitationInLibrary(referenceId: string): Promise<boolean> {
    const { data, error } = await this.request<{ exists: boolean }>(
      `/citations/library/check/${encodeURIComponent(referenceId)}`
    );
    if (error || !data) return false;
    return !!data.exists;
  }

  // ============================================================================
  // CATALOG PRICING OPERATIONS
  // ============================================================================

  async getPricingPlans(): Promise<PricingPlan[]> {
    const { data, error } = await this.request<PricingPlan[]>('/pricing-plans');
    if (error || !data) {
      console.error('[ExpressDataService] getPricingPlans error:', error);
      return [];
    }
    return data;
  }

  async createPricingPlan(plan: Omit<PricingPlan, 'updated_at'>): Promise<ServiceResponse> {
    const { error } = await this.request<void>('/pricing-plans', {
      method: 'POST',
      body: JSON.stringify(plan),
    });

    if (error) {
      console.error('[ExpressDataService] createPricingPlan error:', error);
      return { success: false, error };
    }
    return { success: true };
  }

  async updatePricingPlan(
    planId: string,
    updates: Partial<Omit<PricingPlan, 'id' | 'updated_at'>>
  ): Promise<ServiceResponse> {
    const { error } = await this.request<void>(
      `/pricing-plans/${encodeURIComponent(planId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }
    );

    if (error) {
      console.error('[ExpressDataService] updatePricingPlan error:', error);
      return { success: false, error };
    }
    return { success: true };
  }

  async deletePricingPlan(planId: string): Promise<ServiceResponse> {
    const { error } = await this.request<void>(
      `/pricing-plans/${encodeURIComponent(planId)}`,
      {
        method: 'DELETE',
      }
    );

    if (error) {
      console.error('[ExpressDataService] deletePricingPlan error:', error);
      return { success: false, error };
    }
    return { success: true };
  }
}
