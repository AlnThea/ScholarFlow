-- supabase/migrations/20261014000001_add_workload_category_and_campus_keys.sql
-- Migration: Add workload_category and access_tier to ai_models, and campus keys to institutions
-- Purpose: Support Multi-Tenant Workload Segregation (Text vs Vision) for Free, Pro, and Campus tiers.

-- 1. Update public.ai_models table
DO $$ 
BEGIN
    -- Add access_tier column ('free' | 'pro' | 'institution')
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_models' AND column_name = 'access_tier'
    ) THEN
        ALTER TABLE public.ai_models ADD COLUMN access_tier TEXT DEFAULT 'free';
    END IF;

    -- Add workload_category column ('all' | 'text' | 'vision')
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_models' AND column_name = 'workload_category'
    ) THEN
        ALTER TABLE public.ai_models ADD COLUMN workload_category TEXT DEFAULT 'all';
    END IF;

    -- Add display_order column for drag-and-drop prioritization
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_models' AND column_name = 'display_order'
    ) THEN
        ALTER TABLE public.ai_models ADD COLUMN display_order INTEGER DEFAULT 0;
    END IF;
END $$;

-- Update default models with their workload categories
UPDATE public.ai_models SET workload_category = 'all', access_tier = 'free' WHERE id = 'gemini';
UPDATE public.ai_models SET workload_category = 'text', access_tier = 'free' WHERE id = 'llama3';
UPDATE public.ai_models SET workload_category = 'text', access_tier = 'free' WHERE id = 'gemma2';
UPDATE public.ai_models SET workload_category = 'all', access_tier = 'pro' WHERE id = 'claude';

-- 2. Update public.institutions table (Campus BYOK Keys for Text & Vision)
DO $$ 
BEGIN
    -- Add campus_text_key column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'institutions' AND column_name = 'campus_text_key'
    ) THEN
        ALTER TABLE public.institutions ADD COLUMN campus_text_key TEXT;
    END IF;

    -- Add campus_vision_key column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'institutions' AND column_name = 'campus_vision_key'
    ) THEN
        ALTER TABLE public.institutions ADD COLUMN campus_vision_key TEXT;
    END IF;
END $$;
