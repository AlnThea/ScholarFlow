// lib/services/supabase-service.ts
// Supabase Data Provider Adapter implementing IDataService

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

export class SupabaseDataService implements IDataService {
  private defaultSettings: DocumentSettings = {
    publishYear: 'all',
    publishYearStart: null,
    publishYearEnd: null,
    impactFactor: 'all',
    considerExternal: false,
    considerLibrary: false,
    limitCollection: 'all',
    citationStyle: 'apa',
    citationLocale: 'en-US',
    showPageNumber: false,
  };

  // ============================================================================
  // DOCUMENT OPERATIONS
  // ============================================================================

  async getDocuments(userId: string): Promise<DocumentListItem[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('id, title, settings, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error || !data) {
      console.error('[SupabaseDataService] getDocuments error:', error);
      return [];
    }

    return data as DocumentListItem[];
  }

  async getDocumentById(docId: string, userId: string): Promise<DocumentEntry | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('id, title, content, settings, user_id, created_at, updated_at')
      .eq('id', docId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      console.error('[SupabaseDataService] getDocumentById error:', error);
      return null;
    }

    return data as DocumentEntry;
  }

  async createDocument(
    userId: string,
    title = 'Untitled Document',
    content: any = null,
    settings: Partial<DocumentSettings> = {}
  ): Promise<DocumentEntry | null> {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        title,
        content,
        user_id: userId,
        settings: { ...this.defaultSettings, ...settings },
      })
      .select()
      .single();

    if (error || !data) {
      console.error('[SupabaseDataService] createDocument error:', error);
      return null;
    }

    return data as DocumentEntry;
  }

  async updateDocument(
    docId: string,
    userId: string,
    updates: { title?: string; content?: any; settings?: Partial<DocumentSettings> }
  ): Promise<ServiceResponse> {
    const { error } = await supabase
      .from('documents')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', docId)
      .eq('user_id', userId);

    if (error) {
      console.error('[SupabaseDataService] updateDocument error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  async deleteDocument(docId: string, userId: string): Promise<ServiceResponse> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', docId)
      .eq('user_id', userId);

    if (error) {
      console.error('[SupabaseDataService] deleteDocument error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  async getSharedDocument(docId: string): Promise<DocumentEntry | null> {
    try {
      const res = await fetch(`/api/shared-document?id=${encodeURIComponent(docId)}`);
      if (!res.ok) {
        console.error('[SupabaseDataService] getSharedDocument failed:', res.statusText);
        return null;
      }
      const data = await res.json();
      return data as DocumentEntry;
    } catch (err) {
      console.error('[SupabaseDataService] getSharedDocument error:', err);
      return null;
    }
  }

  async updateSharedDocument(
    docId: string,
    updates: { title?: string; content?: any; settings?: Partial<DocumentSettings> }
  ): Promise<ServiceResponse> {
    try {
      const res = await fetch(`/api/shared-document?id=${encodeURIComponent(docId)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.error || res.statusText };
      }

      return { success: true };
    } catch (err) {
      console.error('[SupabaseDataService] updateSharedDocument error:', err);
      return { success: false, error: String(err) };
    }
  }

  // ============================================================================
  // USER PROFILE OPERATIONS
  // ============================================================================

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, created_at, subscription_plan, subscription_status, subscription_end')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[SupabaseDataService] getUserProfile error:', error);
      return null;
    }

    if (!data) {
      const { data: inserted, error: insertError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          role: 'user',
          subscription_plan: 'free',
          subscription_status: 'active',
        })
        .select('id, full_name, role, created_at, subscription_plan, subscription_status, subscription_end')
        .maybeSingle();

      if (insertError) {
        console.error('[SupabaseDataService] Failed auto-creating profile:', insertError);
        return null;
      }

      return inserted as UserProfile;
    }

    return data as UserProfile;
  }

  async updateUserProfile(
    userId: string,
    updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>
  ): Promise<ServiceResponse> {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.error('[SupabaseDataService] updateUserProfile error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  // ============================================================================
  // CITATION LIBRARY OPERATIONS
  // ============================================================================

  async getCitationLibrary(): Promise<Record<string, CitationCandidate>> {
    const { data, error } = await supabase
      .from('citation_library')
      .select('reference_id, citation_data')
      .order('added_at', { ascending: false });

    if (error || !data) {
      console.error('[SupabaseDataService] getCitationLibrary error:', error);
      return {};
    }

    const result: Record<string, CitationCandidate> = {};
    for (const row of data) {
      result[row.reference_id] = row.citation_data as CitationCandidate;
    }

    return result;
  }

  async saveCitationToLibrary(
    candidate: CitationCandidate,
    userId: string
  ): Promise<ServiceResponse> {
    const { error } = await supabase.from('citation_library').upsert(
      {
        reference_id: candidate.reference_id,
        citation_data: candidate,
        added_by: userId,
      },
      { onConflict: 'reference_id', ignoreDuplicates: true }
    );

    if (error) {
      console.error('[SupabaseDataService] saveCitationToLibrary error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  async deleteCitationFromLibrary(referenceId: string): Promise<ServiceResponse> {
    const { error } = await supabase
      .from('citation_library')
      .delete()
      .eq('reference_id', referenceId);

    if (error) {
      console.error('[SupabaseDataService] deleteCitationFromLibrary error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  async isCitationInLibrary(referenceId: string): Promise<boolean> {
    const { data } = await supabase
      .from('citation_library')
      .select('id')
      .eq('reference_id', referenceId)
      .maybeSingle();

    return !!data;
  }

  // ============================================================================
  // CATALOG PRICING OPERATIONS
  // ============================================================================

  async getPricingPlans(): Promise<PricingPlan[]> {
    const { data, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .order('price', { ascending: true });

    if (error || !data) {
      console.error('[SupabaseDataService] getPricingPlans error:', error);
      return [];
    }

    return data as PricingPlan[];
  }

  async createPricingPlan(plan: Omit<PricingPlan, 'updated_at'>): Promise<ServiceResponse> {
    const { error } = await supabase.from('pricing_plans').insert({
      ...plan,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('[SupabaseDataService] createPricingPlan error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  async updatePricingPlan(
    planId: string,
    updates: Partial<Omit<PricingPlan, 'id' | 'updated_at'>>
  ): Promise<ServiceResponse> {
    const { error } = await supabase
      .from('pricing_plans')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', planId);

    if (error) {
      console.error('[SupabaseDataService] updatePricingPlan error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  async deletePricingPlan(planId: string): Promise<ServiceResponse> {
    const { error } = await supabase.from('pricing_plans').delete().eq('id', planId);

    if (error) {
      console.error('[SupabaseDataService] deletePricingPlan error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }
}
