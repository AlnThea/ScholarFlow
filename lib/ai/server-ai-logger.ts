// lib/ai/server-ai-logger.ts
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

export type AiGenerationRecord = {
  id: string;
  user_id: string;
  document_id?: string | null;
  feature_type: string;
  original_text?: string | null;
  result_text?: string | null;
  tone?: string | null;
  model?: string | null;
  tokens_consumed?: number;
  status: 'pending' | 'completed' | 'failed';
  error_message?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at?: string;
};

/**
 * Creates a PENDING AI generation entry in Supabase database before or while calling the LLM.
 * Returns the generated job ID.
 */
export async function createPendingAiGeneration(params: {
  userId: string;
  documentId?: string | null;
  featureType?: string;
  originalText?: string;
  tone?: string;
  model?: string;
  metadata?: Record<string, any>;
}): Promise<string | null> {
  if (!params.userId) return null;

  const client = supabaseAdmin || supabase;
  try {
    const { data, error } = await client
      .from('ai_generations')
      .insert({
        user_id: params.userId,
        document_id: params.documentId || null,
        feature_type: params.featureType || 'improve',
        original_text: params.originalText || '',
        tone: params.tone || 'academic',
        model: params.model || 'gemini',
        status: 'pending',
        metadata: params.metadata || {},
      })
      .select('id')
      .single();

    if (error) {
      console.warn('[Server AI Logger] Failed to create pending record:', error.message);
      return null;
    }

    return data?.id || null;
  } catch (err) {
    console.warn('[Server AI Logger] Exception while creating pending record:', err);
    return null;
  }
}

/**
 * Completes an AI generation record with final text and consumed tokens.
 */
export async function completeAiGeneration(
  id: string,
  params: {
    resultText: string;
    tokensConsumed?: number;
    metadata?: Record<string, any>;
  }
): Promise<boolean> {
  if (!id) return false;

  const client = supabaseAdmin || supabase;
  try {
    const { error } = await client
      .from('ai_generations')
      .update({
        result_text: params.resultText,
        tokens_consumed: params.tokensConsumed || 0,
        status: 'completed',
        metadata: params.metadata || {},
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.warn('[Server AI Logger] Failed to complete record:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Server AI Logger] Exception while completing record:', err);
    return false;
  }
}

/**
 * Marks an AI generation record as FAILED with error message.
 */
export async function failAiGeneration(
  id: string,
  errorMessage: string
): Promise<boolean> {
  if (!id) return false;

  const client = supabaseAdmin || supabase;
  try {
    const { error } = await client
      .from('ai_generations')
      .update({
        status: 'failed',
        error_message: errorMessage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    return !error;
  } catch (err) {
    console.warn('[Server AI Logger] Exception while failing record:', err);
    return false;
  }
}

/**
 * Convenience method to write a completed record in one shot if pending wasn't pre-created.
 */
export async function recordDirectAiGeneration(params: {
  userId: string;
  documentId?: string | null;
  featureType?: string;
  originalText?: string;
  resultText: string;
  tone?: string;
  model?: string;
  tokensConsumed?: number;
  metadata?: Record<string, any>;
}): Promise<string | null> {
  if (!params.userId) return null;

  const client = supabaseAdmin || supabase;
  try {
    const { data, error } = await client
      .from('ai_generations')
      .insert({
        user_id: params.userId,
        document_id: params.documentId || null,
        feature_type: params.featureType || 'improve',
        original_text: params.originalText || '',
        result_text: params.resultText || '',
        tone: params.tone || 'academic',
        model: params.model || 'gemini',
        tokens_consumed: params.tokensConsumed || 0,
        status: 'completed',
        metadata: params.metadata || {},
      })
      .select('id')
      .single();

    if (error) {
      console.warn('[Server AI Logger] Direct record failed:', error.message);
      return null;
    }
    return data?.id || null;
  } catch (err) {
    console.warn('[Server AI Logger] Exception in recordDirectAiGeneration:', err);
    return null;
  }
}

/**
 * Retrieves the latest AI generations for a given user.
 */
export async function fetchUserAiHistory(
  userId: string,
  limit: number = 20
): Promise<AiGenerationRecord[]> {
  if (!userId) return [];

  const client = supabaseAdmin || supabase;
  try {
    const { data, error } = await client
      .from('ai_generations')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('[Server AI Logger] Failed to fetch user history:', error.message);
      return [];
    }

    return (data as AiGenerationRecord[]) || [];
  } catch (err) {
    console.warn('[Server AI Logger] Exception in fetchUserAiHistory:', err);
    return [];
  }
}

/**
 * Deletes a single AI generation entry or clears all entries for a user.
 */
export async function deleteUserAiHistory(
  userId: string,
  generationId?: string,
  clearAll: boolean = false
): Promise<boolean> {
  if (!userId) return false;

  const client = supabaseAdmin || supabase;
  try {
    let query = client.from('ai_generations').delete().eq('user_id', userId);

    if (!clearAll && generationId) {
      query = query.eq('id', generationId);
    }

    const { error } = await query;
    return !error;
  } catch (err) {
    console.warn('[Server AI Logger] Exception in deleteUserAiHistory:', err);
    return false;
  }
}
