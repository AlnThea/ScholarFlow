-- supabase/migrations/20261016000001_create_document_revisions.sql
-- Migration: Document Version History & Time-Machine Snapshot Table
-- Compatible with ScholarFlow documents table schema (using settings JSONB)

CREATE TABLE IF NOT EXISTS public.document_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled Document',
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    word_count INTEGER NOT NULL DEFAULT 0,
    change_summary TEXT,
    is_auto_saved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast chronological lookup by document
CREATE INDEX IF NOT EXISTS idx_document_revisions_doc_created 
ON public.document_revisions(document_id, created_at DESC);

-- Index for user audit trail
CREATE INDEX IF NOT EXISTS idx_document_revisions_user 
ON public.document_revisions(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.document_revisions ENABLE ROW LEVEL SECURITY;

-- Clean existing policies if re-run
DROP POLICY IF EXISTS "Users can view revisions of their accessible documents" ON public.document_revisions;
DROP POLICY IF EXISTS "Users can create revisions for their documents" ON public.document_revisions;
DROP POLICY IF EXISTS "Document owners can delete revisions" ON public.document_revisions;

-- Policy 1: Document owners & shared collaborators can view revisions
CREATE POLICY "Users can view revisions of their accessible documents"
ON public.document_revisions
FOR SELECT
USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM public.documents d
        WHERE d.id = document_revisions.document_id
        AND (
            d.user_id = auth.uid() OR 
            (COALESCE(d.settings->>'shareActive', 'false'))::boolean = true
        )
    )
);

-- Policy 2: Document editors & owners can insert new revisions
CREATE POLICY "Users can create revisions for their documents"
ON public.document_revisions
FOR INSERT
WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM public.documents d
        WHERE d.id = document_revisions.document_id
        AND (
            d.user_id = auth.uid() OR 
            (
                (COALESCE(d.settings->>'shareActive', 'false'))::boolean = true AND 
                d.settings->>'sharePermission' = 'edit'
            )
        )
    )
);

-- Policy 3: Document owners can delete revisions
CREATE POLICY "Document owners can delete revisions"
ON public.document_revisions
FOR DELETE
USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM public.documents d
        WHERE d.id = document_revisions.document_id
        AND d.user_id = auth.uid()
    )
);
