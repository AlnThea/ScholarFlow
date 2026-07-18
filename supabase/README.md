# Supabase — ScholarFlow

Folder ini berisi semua SQL migration untuk database ScholarFlow di Supabase.

## Struktur

```
supabase/
├── README.md
└── migrations/
    ├── 20260707000001_initial_schema.sql   ← schema pertama (profiles, citation_cache, citation_library)
    └── 20260707000002_fix_profiles_rls.sql ← fix circular RLS policy di profiles
```

## Cara Menjalankan Migration

### Setup Pertama Kali (fresh database)
Jalankan file **secara berurutan** di Supabase → SQL Editor → New Query:

1. `20260707000001_initial_schema.sql`
2. `20260707000002_fix_profiles_rls.sql`

### Update / Fix Saja
Cukup jalankan file migration terbaru yang belum pernah dijalankan.

---

## Tabel yang Ada

| Tabel | Keterangan |
|---|---|
| `public.profiles` | Data profil user + role (`user` / `admin`). Auto-dibuat via trigger saat register. |
| `public.citation_cache` | Cache hasil pencarian OpenAlex & Crossref. Shared semua user, expired 7 hari. |
| `public.citation_library` | Koleksi citation global. Semua user bisa baca & tambah, hanya admin yang bisa hapus. |

---

## Role System

| Role | Hak Akses |
|---|---|
| `user` | Baca + tambah citation library, search citation (via cache) |
| `admin` | Semua hak user + bisa hapus citation library |

### User baru → role otomatis
Saat user register, **trigger `on_auth_user_created`** otomatis membuat row di `profiles` dengan `role = 'user'`.

### Cara upgrade user jadi Admin
```sql
-- 1. Lihat semua user
select p.role, u.email, p.id
from public.profiles p
join auth.users u on u.id = p.id;

-- 2. Upgrade ke admin (ganti UUID dengan id yang tepat)
update public.profiles
set role = 'admin'
where id = 'uuid-user-nya';
```

### Cara insert profile untuk user lama (sebelum trigger dipasang)
```sql
insert into public.profiles (id, full_name, role)
select
  id,
  coalesce(raw_user_meta_data->>'full_name', ''),
  'user'
from auth.users
where email = 'email-user@contoh.com'
on conflict (id) do nothing;
```

---

## Catatan Penting — RLS (Row Level Security)

### ❌ JANGAN buat policy seperti ini (circular reference):
```sql
-- INI BERBAHAYA — menyebabkan infinite recursion!
create policy "Admin can read all profiles"
  on public.profiles for select
  using (exists (
    select 1 from public.profiles  ← query profiles dalam policy profiles!
    where id = auth.uid() and role = 'admin'
  ));
```

### ✅ Untuk cek role admin di server-side, gunakan service role key:
```typescript
// Di Next.js API route (server-side)
const supabaseAdmin = createClient(url, SUPABASE_SERVICE_KEY);
const { data } = await supabaseAdmin
  .from('profiles')
  .select('role')
  .eq('id', userId)
  .single();
```

---

## Environment Variables yang Dibutuhkan

```env
# Frontend (Next.js) — boleh expose ke browser
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...anon_key...

# Server-side saja — JANGAN prefix NEXT_PUBLIC_!
SUPABASE_SERVICE_KEY=eyJ...service_role_key...
```
