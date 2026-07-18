# ScholarFlow Database Schema

This document details the PostgreSQL tables, indexes, triggers, and Row Level Security (RLS) policies set up in Supabase for ScholarFlow.

---

## 📊 Entity Relationship Summary
The database consists of the following key tables:
1. **`profiles`**: Links to Supabase `auth.users` to manage user identity, access roles (`user` or `admin`), and active subscription status (`subscription_plan`).
2. **`documents`**: Stores draft manuscripts, contents (EditorJS blocks), and personalized configuration metadata (`settings`).
3. **`citation_cache`**: Caches OpenAlex and Crossref search results to improve performance and minimize rate limit usage.
4. **`citation_library`**: A global collection containing all references, including parsed RIS entries and PDF metadata, uploaded by users.
5. **`pricing_plans`**: Dynamically stores pricing packages (Free, Pro, Institution), features list, prices, and active promo texts.
6. **`payment_gateways`**: Configuration table enabling admin to dynamically toggle Stripe or Midtrans active gateway status.

---

## 🗄️ Table Details

### 1. `profiles`
Stores user profile meta-data, system roles, and active subscription status. Automatically populated via trigger when a new user signs up.

- **Columns**:
  - `id`: `uuid` (Primary Key, references `auth.users(id)` ON DELETE CASCADE)
  - `full_name`: `text` (optional)
  - `role`: `text` (Default `'user'`, Check constraint: `role IN ('user', 'admin')`)
  - `subscription_plan`: `text` (Default `'free'`)
  - `subscription_status`: `text` (Default `'active'`)
  - `subscription_end`: `timestamptz` (Default `null`, expiration date)
  - `created_at`: `timestamptz` (Default `now()`)

- **Row Level Security (RLS)**:
  - Policy `"Users can read own profile"`: `USING (auth.uid() = id)`
  - Policy `"Users can update own profile"`: `USING (auth.uid() = id)`

---

### 2. `documents`
Stores user documents and draft manuscripts, including their unique format/citation parameters.

- **Columns**:
  - `id`: `uuid` (Primary Key, Default `gen_random_uuid()`)
  - `user_id`: `uuid` (references `auth.users(id)` ON DELETE CASCADE)
  - `title`: `text` (Default `'Untitled'`)
  - `content`: `jsonb` (EditorJS block JSON format)
  - `settings`: `jsonb` (Stores settings like `publishYear`, `impactFactor`, `considerExternal`, `considerLibrary`, `citationStyle`, `language`, `showPageNumber`)
  - `created_at`: `timestamptz` (Default `now()`)
  - `updated_at`: `timestamptz` (Default `now()`)

- **Row Level Security (RLS)**:
  - Policy `"Users can manage own documents"`: `USING (auth.uid() = user_id)`

---

### 3. `citation_cache`
A shared cache table storing API results from OpenAlex and Crossref.

- **Columns**:
  - `id`: `uuid` (Primary Key, Default `gen_random_uuid()`)
  - `query_hash`: `text` (Unique, MD5 hash of normalized query terms)
  - `query_text`: `text` (Original search term)
  - `results`: `jsonb` (Stores array of `CitationCandidate` objects)
  - `sources`: `text[]` (Array of source names, e.g. `{'OpenAlex', 'Crossref'}`)
  - `hit_count`: `integer` (Default `1`, increments on every cache hit)
  - `created_at`: `timestamptz` (Default `now()`)
  - `expires_at`: `timestamptz` (Default `now() + interval '7 days'`)

---

### 4. `citation_library`
A global curated library storing references that users have actively cited in their documents (including extracted PDFs and uploaded RIS citations).

- **Columns**:
  - `id`: `uuid` (Primary Key, Default `gen_random_uuid()`)
  - `reference_id`: `text` (Unique, DOI or title-based citation identifier)
  - `citation_data`: `jsonb` (Full metadata of the `CitationCandidate`)
  - `added_by`: `uuid` (References `auth.users(id)` ON DELETE SET NULL)
  - `added_at`: `timestamptz` (Default `now()`)

---

### 5. `pricing_plans`
Stores pricing models and packages dynamically shown inside the user-facing modal.

- **Columns**:
  - `id`: `text` (Primary Key, e.g. `'free'`, `'pro'`, `'institution'`)
  - `name`: `text` (e.g. `'Pro Writer'`)
  - `price`: `numeric` (Default `0`)
  - `price_period`: `text` (Default `'bulan'`, e.g., `'selamanya'`, `'tahun'`)
  - `description`: `text`
  - `features`: `text[]` (List of feature items)
  - `is_popular`: `boolean` (Default `false`)
  - `promo_text`: `text` (Optional, dynamic red promo badge)
  - `updated_at`: `timestamptz` (Default `now()`)

- **Row Level Security (RLS)**:
  - Policy `"Anyone can view pricing plans"`: `USING (true)`
  - Policy `"Admins can manage pricing plans"`:
    ```sql
    USING (EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ))
    ```

---

### 6. `payment_gateways`
Determines which payment gateways are currently active and available for subscription purchases.

- **Columns**:
  - `id`: `text` (Primary Key, e.g. `'stripe'`, `'midtrans'`)
  - `name`: `text` (Readable name)
  - `is_enabled`: `boolean` (Default `true`)
  - `updated_at`: `timestamptz` (Default `now()`)

- **Row Level Security (RLS)**:
  - Policy `"Anyone can view payment gateways"`: `USING (true)`
  - Policy `"Admins can manage payment gateways"`:
    ```sql
    USING (EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ))
    ```
