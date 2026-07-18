-- ============================================================
-- ScholarFlow — Add Subscription Columns to Profiles Table
-- Created: 2026-07-16
-- Description: Adds subscription columns to profiles table
-- ============================================================

alter table public.profiles 
add column if not exists subscription_plan text not null default 'free',
add column if not exists subscription_status text not null default 'active',
add column if not exists subscription_end timestamptz default null;
