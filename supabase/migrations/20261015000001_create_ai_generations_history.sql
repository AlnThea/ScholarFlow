-- supabase/migrations/20261015000001_create_ai_generations_history.sql
-- Table to persist AI generation jobs and history across browser closures and sessions (ChatGPT-style)

CREATE TABLE IF NOT EXISTS public.ai_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    feature_type TEXT NOT NULL DEFAULT 'improve', -- 'improve', 'paraphrase', 'summarize', 'abstract', 'synthesize', 'stats'
    original_text TEXT,
    result_text TEXT,
    tone TEXT DEFAULT 'academic',
    model TEXT DEFAULT 'gemini',
    tokens_consumed INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed', -- 'pending', 'completed', 'failed'
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for speedy querying by user and chronology
CREATE INDEX IF NOT EXISTS idx_ai_generations_user_chronology 
    ON public.ai_generations(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_generations_status 
    ON public.ai_generations(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;

-- 1. Users can view only their own AI generations
DROP POLICY IF EXISTS "Users can view own ai generations" ON public.ai_generations;
CREATE POLICY "Users can view own ai generations"
    ON public.ai_generations
    FOR SELECT
    USING (auth.uid() = user_id);

-- 2. Users can insert their own AI generations
DROP POLICY IF EXISTS "Users can insert own ai generations" ON public.ai_generations;
CREATE POLICY "Users can insert own ai generations"
    ON public.ai_generations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own AI generations
DROP POLICY IF EXISTS "Users can update own ai generations" ON public.ai_generations;
CREATE POLICY "Users can update own ai generations"
    ON public.ai_generations
    FOR UPDATE
    USING (auth.uid() = user_id);

-- 4. Users can delete their own AI generations
DROP POLICY IF EXISTS "Users can delete own ai generations" ON public.ai_generations;
CREATE POLICY "Users can delete own ai generations"
    ON public.ai_generations
    FOR DELETE
    USING (auth.uid() = user_id);

-- 5. Service role can perform all operations (used by server-side background handlers)
DROP POLICY IF EXISTS "Service role full access on ai generations" ON public.ai_generations;
CREATE POLICY "Service role full access on ai generations"
    ON public.ai_generations
    FOR ALL
    USING (true)
    WITH CHECK (true);
