// lib/api/ai-models.ts
import { supabase } from '../supabase';

export interface AIModel {
  id: string;
  name: string;
  model_id: string;
  is_enabled: boolean;
  is_premium: boolean;
  provider_type?: 'gemini' | 'openrouter' | 'custom_openai';
  base_url?: string;
  custom_api_key?: string;
  updated_at: string;
}

const LOCAL_STORAGE_KEY = 'scholarflow.ai_models.v1';

const DEFAULT_MODELS: AIModel[] = [
  { id: 'gemini', name: 'Gemini Flash (Direct)', model_id: 'gemini-1.5-flash', is_enabled: true, is_premium: false, provider_type: 'gemini', updated_at: new Date().toISOString() },
  { id: 'llama3', name: 'Llama 3 (Free OR)', model_id: 'meta-llama/llama-3-8b-instruct:free', is_enabled: true, is_premium: false, provider_type: 'openrouter', updated_at: new Date().toISOString() },
  { id: 'gemma2', name: 'Gemma 2 (Free OR)', model_id: 'google/gemma-2-9b-it:free', is_enabled: true, is_premium: false, provider_type: 'openrouter', updated_at: new Date().toISOString() },
  { id: 'claude', name: 'Claude 3.5 (Pro OR)', model_id: 'anthropic/claude-3.5-sonnet', is_enabled: true, is_premium: true, provider_type: 'openrouter', updated_at: new Date().toISOString() }
];

function getLocalStoredModels(): AIModel[] {
  if (typeof window === 'undefined') return DEFAULT_MODELS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return DEFAULT_MODELS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse local stored AI models:', e);
  }
  return DEFAULT_MODELS;
}

function saveLocalStoredModels(models: AIModel[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(models));
  } catch (e) {
    console.error('Failed to save AI models to localStorage:', e);
  }
}

/**
 * Mengambil daftar konfigurasi model AI dari Supabase (dengan cadangan LocalStorage)
 */
export async function fetchAIModels(): Promise<AIModel[]> {
  try {
    const { data, error } = await supabase
      .from('ai_models')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    if (data && data.length > 0) {
      saveLocalStoredModels(data as AIModel[]);
      return data as AIModel[];
    }
    return getLocalStoredModels();
  } catch (error) {
    console.warn('Error fetching AI models from Supabase (using local fallback persistence):', error);
    return getLocalStoredModels();
  }
}

/**
 * Mengubah data konfigurasi model AI di Supabase (dengan cadangan LocalStorage)
 */
export async function updateAIModel(
  id: string,
  updates: Partial<Omit<AIModel, 'id' | 'updated_at'>>
): Promise<AIModel> {
  let updatedModel: AIModel | null = null;
  try {
    const { data, error } = await supabase
      .from('ai_models')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      updatedModel = data as AIModel;
    } else if (error) {
      console.warn(`Supabase update AI model ${id} full update error:`, error.message);
      const basePayload: any = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) basePayload.name = updates.name;
      if (updates.model_id !== undefined) basePayload.model_id = updates.model_id;
      if (updates.is_enabled !== undefined) basePayload.is_enabled = updates.is_enabled;
      if (updates.is_premium !== undefined) basePayload.is_premium = updates.is_premium;

      const { data: baseData } = await supabase
        .from('ai_models')
        .update(basePayload)
        .eq('id', id)
        .select()
        .single();
      
    }
  } catch (error: any) {
    console.warn(`Supabase update AI model ${id} failed (updating local fallback):`, error?.message || error);
  }

  const currentLocal = getLocalStoredModels();
  const target = currentLocal.find(m => m.id === id);
  const fallbackUpdated: AIModel = updatedModel || {
    id,
    name: updates.name ?? target?.name ?? '',
    model_id: updates.model_id ?? target?.model_id ?? '',
    is_enabled: updates.is_enabled ?? target?.is_enabled ?? true,
    is_premium: updates.is_premium ?? target?.is_premium ?? false,
    provider_type: updates.provider_type ?? target?.provider_type ?? 'openrouter',
    base_url: updates.base_url ?? target?.base_url,
    custom_api_key: updates.custom_api_key ?? target?.custom_api_key,
    updated_at: new Date().toISOString(),
    ...target,
    ...updates,
  };

  const updatedList = currentLocal.map(m => m.id === id ? fallbackUpdated : m);
  saveLocalStoredModels(updatedList);
  return fallbackUpdated;
}

/**
 * Menambah model AI baru ke Supabase (dengan cadangan LocalStorage)
 */
export async function createAIModel(
  model: Omit<AIModel, 'updated_at'>
): Promise<AIModel> {
  let createdModel: AIModel | null = null;
  const now = new Date().toISOString();

  try {
    // 1. Coba simpan seluruh data (termasuk provider_type, base_url, custom_api_key)
    const { data, error } = await supabase
      .from('ai_models')
      .insert({ ...model, updated_at: now })
      .select()
      .single();

    if (!error && data) {
      createdModel = data as AIModel;
    } else if (error) {
      console.warn('Supabase create full AI model error:', error.message);

      // 2. Jika gagal karena kolom kustom belum dibuat di Supabase, coba simpan kolom dasar saja
      const basePayload = {
        id: model.id,
        name: model.name,
        model_id: model.model_id,
        is_enabled: model.is_enabled,
        is_premium: model.is_premium,
        updated_at: now
      };

      const { data: baseData, error: baseErr } = await supabase
        .from('ai_models')
        .insert(basePayload)
        .select()
        .single();

      if (!baseErr && baseData) {
        createdModel = { ...(baseData as AIModel), ...model };
      } else if (baseErr) {
        console.warn('Supabase create base AI model error:', baseErr.message);
      }
    }
  } catch (error: any) {
    console.warn('Supabase create AI model exception (saving to local fallback):', error?.message || error);
  }

  const newModel: AIModel = createdModel || {
    ...model,
    updated_at: now,
  };

  const currentLocal = getLocalStoredModels();
  const updatedList = [...currentLocal.filter(m => m.id !== newModel.id), newModel];
  saveLocalStoredModels(updatedList);
  return newModel;
}

/**
 * Menghapus model AI dari Supabase (dengan cadangan LocalStorage)
 */
export async function deleteAIModel(
  id: string
): Promise<boolean> {
  try {
    await supabase
      .from('ai_models')
      .delete()
      .eq('id', id);
  } catch (error) {
    console.warn(`Supabase delete AI model ${id} failed (updating local fallback):`, error);
  }

  const currentLocal = getLocalStoredModels();
  const updatedList = currentLocal.filter(m => m.id !== id);
  saveLocalStoredModels(updatedList);
  return true;
}
