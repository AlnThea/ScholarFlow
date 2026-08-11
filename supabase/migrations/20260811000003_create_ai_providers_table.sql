-- supabase/migrations/20260811000003_create_ai_providers_table.sql
-- Create ai_providers table for 2-tier AI Provider & Model Management

CREATE TABLE IF NOT EXISTS public.ai_providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'custom_openai',
  base_url TEXT,
  api_key TEXT,
  is_built_in BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default built-in providers
INSERT INTO public.ai_providers (id, name, type, base_url, is_built_in)
VALUES
  ('gemini', 'Google Gemini Direct', 'gemini', NULL, TRUE),
  ('openrouter', 'OpenRouter API', 'openrouter', NULL, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Add provider_id column to ai_models table if missing
ALTER TABLE public.ai_models 
ADD COLUMN IF NOT EXISTS provider_id TEXT REFERENCES public.ai_providers(id) ON DELETE SET NULL;
