-- Migration: 20260811000002_update_ai_models_provider_fields.sql
-- Description: Add provider_type, base_url, and custom_api_key columns to public.ai_models table for custom LLM provider & API key sellers support.

-- 1. Add new columns if they do not exist
ALTER TABLE public.ai_models 
ADD COLUMN IF NOT EXISTS provider_type text DEFAULT 'openrouter',
ADD COLUMN IF NOT EXISTS base_url text,
ADD COLUMN IF NOT EXISTS custom_api_key text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2. Ensure Row Level Security (RLS) is enabled
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies for SELECT, INSERT, UPDATE, DELETE if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_models' AND policyname = 'Allow public select on ai_models') THEN
    CREATE POLICY "Allow public select on ai_models" ON public.ai_models FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_models' AND policyname = 'Allow public insert on ai_models') THEN
    CREATE POLICY "Allow public insert on ai_models" ON public.ai_models FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_models' AND policyname = 'Allow public update on ai_models') THEN
    CREATE POLICY "Allow public update on ai_models" ON public.ai_models FOR UPDATE USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_models' AND policyname = 'Allow public delete on ai_models') THEN
    CREATE POLICY "Allow public delete on ai_models" ON public.ai_models FOR DELETE USING (true);
  END IF;
END $$;
