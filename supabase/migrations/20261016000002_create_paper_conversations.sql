-- supabase/migrations/20261016000002_create_paper_conversations.sql
-- Migration: Interactive Chat with Paper / Literature Assistant Q&A History
-- Stores conversational exchanges and research insights per reference paper

CREATE TABLE IF NOT EXISTS public.paper_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reference_id TEXT NOT NULL,
    paper_title TEXT,
    paper_authors TEXT[] DEFAULT '{}',
    paper_year INTEGER,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_paper_chat UNIQUE (user_id, reference_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_paper_conversations_user_ref 
ON public.paper_conversations(user_id, reference_id);

CREATE INDEX IF NOT EXISTS idx_paper_conversations_updated 
ON public.paper_conversations(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.paper_conversations ENABLE ROW LEVEL SECURITY;

-- Clean existing policies if re-run
DROP POLICY IF EXISTS "Users can view their own paper conversations" ON public.paper_conversations;
DROP POLICY IF EXISTS "Users can insert their own paper conversations" ON public.paper_conversations;
DROP POLICY IF EXISTS "Users can update their own paper conversations" ON public.paper_conversations;
DROP POLICY IF EXISTS "Users can delete their own paper conversations" ON public.paper_conversations;

-- Policy 1: Users can read their own conversations
CREATE POLICY "Users can view their own paper conversations"
ON public.paper_conversations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own conversations
CREATE POLICY "Users can insert their own paper conversations"
ON public.paper_conversations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own conversations
CREATE POLICY "Users can update their own paper conversations"
ON public.paper_conversations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own conversations
CREATE POLICY "Users can delete their own paper conversations"
ON public.paper_conversations
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
