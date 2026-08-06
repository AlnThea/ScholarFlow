-- ============================================================
-- ScholarFlow — Add Sharing Policies for Documents & Library
-- Created: 2026-08-05
-- Description: Enable public read/write access based on share status
-- ============================================================

-- 1. Public Read Policy for shared documents
create policy "Anyone can read shared documents"
  on public.documents for select
  using (
    (settings->>'shareActive')::boolean = true
  );

-- 2. Public Update Policy for shared documents with co-editor status
create policy "Anyone can update shared co-editor documents"
  on public.documents for update
  using (
    (settings->>'shareActive')::boolean = true and
    settings->>'sharePermission' = 'edit'
  )
  with check (
    (settings->>'shareActive')::boolean = true and
    settings->>'sharePermission' = 'edit'
  );

-- 3. Public Read Policy for citation library (required to render shared document bibliographies)
drop policy if exists "Authenticated users can read citation library" on public.citation_library;

create policy "Anyone can read citation library"
  on public.citation_library for select
  using (true);
