-- ============================================================
-- ScholarFlow — Create Payment Gateways Table
-- Created: 2026-07-16
-- Description: Table for active payment gateways configuration
-- ============================================================

create table if not exists public.payment_gateways (
  id text primary key,
  name text not null,
  is_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.payment_gateways enable row level security;

-- Drop existing policies if any
drop policy if exists "Anyone can view payment gateways" on public.payment_gateways;
drop policy if exists "Admins can manage payment gateways" on public.payment_gateways;

-- Read policy for everyone
create policy "Anyone can view payment gateways"
  on public.payment_gateways for select
  using (true);

-- Manage policy for admins
create policy "Admins can manage payment gateways"
  on public.payment_gateways for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Seed initial gateways
insert into public.payment_gateways (id, name, is_enabled)
values
  ('stripe', 'Stripe (Global Credit Card/Apple Pay)', true),
  ('midtrans', 'Midtrans (GoPay/Virtual Account/Local Card)', true)
on conflict (id) do update
set
  name = excluded.name,
  is_enabled = excluded.is_enabled;
