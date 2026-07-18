-- supabase/migrations/20260718000001_create_ai_models_table.sql
-- Membuat tabel ai_models untuk konfigurasi model AI dinamis oleh admin

CREATE TABLE IF NOT EXISTS public.ai_models (
    id text PRIMARY KEY,
    name text NOT NULL,
    model_id text NOT NULL,
    is_enabled boolean NOT NULL DEFAULT true,
    is_premium boolean NOT NULL DEFAULT false,
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Mengaktifkan Row Level Security (RLS)
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;

-- Kebijakan RLS: Siapa pun (terotentikasi & publik) bisa membaca model AI
CREATE POLICY "Anyone can view active AI models" 
ON public.ai_models FOR SELECT 
USING (true);

-- Kebijakan RLS: Hanya admin yang bisa memodifikasi model AI
CREATE POLICY "Admins can manage AI models" 
ON public.ai_models FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Seed data awal untuk model-model AI
INSERT INTO public.ai_models (id, name, model_id, is_enabled, is_premium)
VALUES 
('gemini', 'Gemini Flash (Direct)', 'gemini-1.5-flash', true, false),
('llama3', 'Llama 3 (Free OR)', 'meta-llama/llama-3-8b-instruct:free', true, false),
('gemma2', 'Gemma 2 (Free OR)', 'google/gemma-2-9b-it:free', true, false),
('claude', 'Claude 3.5 (Pro OR)', 'anthropic/claude-3.5-sonnet', true, true)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, 
    model_id = EXCLUDED.model_id, 
    is_enabled = EXCLUDED.is_enabled, 
    is_premium = EXCLUDED.is_premium,
    updated_at = now();
