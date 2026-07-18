// lib/api/ai-models.ts
import { supabase } from '../supabase';

export interface AIModel {
  id: string;
  name: string;
  model_id: string;
  is_enabled: boolean;
  is_premium: boolean;
  updated_at: string;
}

/**
 * Mengambil daftar konfigurasi model AI dari Supabase
 */
export async function fetchAIModels(): Promise<AIModel[]> {
  try {
    const { data, error } = await supabase
      .from('ai_models')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    return (data as AIModel[]) || [];
  } catch (error) {
    console.error('Error fetching AI models:', error);
    // Fallback data jika tabel belum dimigrasi di cloud
    return [
      { id: 'gemini', name: 'Gemini Flash (Direct)', model_id: 'gemini-1.5-flash', is_enabled: true, is_premium: false, updated_at: new Date().toISOString() },
      { id: 'llama3', name: 'Llama 3 (Free OR)', model_id: 'meta-llama/llama-3-8b-instruct:free', is_enabled: true, is_premium: false, updated_at: new Date().toISOString() },
      { id: 'gemma2', name: 'Gemma 2 (Free OR)', model_id: 'google/gemma-2-9b-it:free', is_enabled: true, is_premium: false, updated_at: new Date().toISOString() },
      { id: 'claude', name: 'Claude 3.5 (Pro OR)', model_id: 'anthropic/claude-3.5-sonnet', is_enabled: true, is_premium: true, updated_at: new Date().toISOString() }
    ];
  }
}

/**
 * Mengubah data konfigurasi model AI di Supabase (Khusus Admin)
 */
export async function updateAIModel(
  id: string,
  updates: Partial<Omit<AIModel, 'id' | 'updated_at'>>
): Promise<AIModel> {
  const { data, error } = await supabase
    .from('ai_models')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating AI model ${id}:`, error);
    throw error;
  }

  return data as AIModel;
}
