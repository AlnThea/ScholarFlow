# ScholarFlow Database Schema 📊

This document details the PostgreSQL tables, indexes, triggers, and Row Level Security (RLS) policies set up in Supabase and Prisma ORM for ScholarFlow, synchronized with all 12 migration scripts.

---

## 📊 Entity Relationship Summary
The database consists of 10 core production tables:

1. **`profiles`**: User identities linked to Supabase `auth.users` (`id`, `email`, `full_name`, `avatar_url`, `role`, `subscription_plan`, `subscription_status`, `subscription_end`).
2. **`documents`**: Draft manuscripts (`id`, `user_id`, `title`, `content`, `settings`, `created_at`, `updated_at`).
3. **`document_comments`**: In-document block comments (`id`, `document_id`, `block_id`, `selected_text`, `comment_text`, `author_name`, `resolved`, `created_at`).
4. **`document_suggestions`**: Track-changes & AI suggestions (`id`, `document_id`, `user_id`, `author_name`, `selected_text`, `suggested_text`, `status`, `created_at`).
5. **`document_notifications`**: Co-editor notification bell (`id`, `document_id`, `recipient_id`, `sender_name`, `message`, `read`, `created_at`).
6. **`citation_cache`**: Caches OpenAlex/Crossref search results (`id`, `query_hash`, `query_text`, `results`, `sources`, `hit_count`, `created_at`, `expires_at`).
7. **`citation_library`**: References cited by users (`id`, `reference_id`, `citation_data`, `added_by`, `added_at`).
8. **`ai_models`**: Dynamic AI model catalog (`id`, `name`, `model_id`, `is_enabled`, `is_premium`, `updated_at`).
9. **`pricing_plans`**: Dynamic subscription plans (`id`, `name`, `price`, `price_period`, `description`, `features`, `is_popular`, `promo_text`, `updated_at`).
10. **`payment_gateways`**: Active payment gateways (`id`, `name`, `is_enabled`, `updated_at`).

---

## 🗄️ Detailed Table Specifications & RLS Policies

### 1. `profiles`
Stores user profile metadata, system roles, and active subscription status. Automatically populated via trigger when a new user signs up.

- **Columns**:
  - `id`: `uuid` (Primary Key, references `auth.users(id)` ON DELETE CASCADE)
  - `email`: `text` (Unique, required)
  - `full_name`: `text` (optional)
  - `avatar_url`: `text` (optional)
  - `role`: `text` (Default `'user'`, Check constraint: `role IN ('user', 'admin')`)
  - `subscription_plan`: `text` (Default `'free'`)
  - `subscription_status`: `text` (Default `'active'`)
  - `subscription_end`: `timestamptz` (Default `null`)
  - `created_at`: `timestamptz` (Default `now()`)

- **Row Level Security (RLS)**:
  - `"Users can read own profile"`: `USING (auth.uid() = id)`
  - `"Users can update own profile"`: `USING (auth.uid() = id)`

---

### 2. `documents`
Stores user documents and draft manuscripts, including their unique format/citation parameters.

- **Columns**:
  - `id`: `uuid` (Primary Key, Default `gen_random_uuid()`)
  - `user_id`: `uuid` (references `auth.users(id)` ON DELETE CASCADE)
  - `title`: `text` (Default `'Untitled'`)
  - `content`: `jsonb` (EditorJS block JSON format)
  - `settings`: `jsonb` (Stores `publishYear`, `impactFactor`, `considerExternal`, `considerLibrary`, `citationStyle`, `language`, `showPageNumber`, `shareActive`, `sharePermission`)
  - `created_at`: `timestamptz` (Default `now()`)
  - `updated_at`: `timestamptz` (Default `now()`)

- **Row Level Security (RLS)**:
  - `"Users can view own or shared documents"`:
    ```sql
    USING (
      auth.uid() = user_id OR 
      (settings->>'shareActive')::boolean = true
    )
    ```
  - `"Users can manage own documents"`: `USING (auth.uid() = user_id)`

---

### 3. `document_comments`
Stores in-document co-editor comments associated with specific block IDs.

- **Columns**:
  - `id`: `uuid` (Primary Key, Default `gen_random_uuid()`)
  - `document_id`: `uuid` (references `documents(id)` ON DELETE CASCADE)
  - `block_id`: `text` (Editor.js block identifier)
  - `selected_text`: `text` (Context text selection)
  - `comment_text`: `text` (Required comment message)
  - `author_name`: `text` (Default `'Guest Co-Editor'`)
  - `resolved`: `boolean` (Default `false`)
  - `created_at`: `timestamptz` (Default `now()`)

- **Row Level Security (RLS)**:
  - `"Anyone can read comments on shared documents"`: `USING (EXISTS (SELECT 1 FROM documents d WHERE d.id = document_id AND (d.user_id = auth.uid() OR (d.settings->>'shareActive')::boolean = true)))`
  - `"Anyone can insert comments on shared/owned documents with edit access"`: `WITH CHECK (EXISTS (SELECT 1 FROM documents d WHERE d.id = document_id AND (d.user_id = auth.uid() OR ((d.settings->>'shareActive')::boolean = true AND d.settings->>'sharePermission' = 'edit'))))`

---

### 4. `document_suggestions`
Stores track-changes and AI suggestions.

- **Columns**:
  - `id`: `text` (Primary Key)
  - `document_id`: `uuid` (references `documents(id)` ON DELETE CASCADE)
  - `user_id`: `uuid` (optional)
  - `author_name`: `text` (Default `'Collaborator'`)
  - `selected_text`: `text`
  - `suggested_text`: `text`
  - `status`: `text` (Default `'pending'`, Check constraint: `status IN ('pending', 'accepted', 'rejected')`)
  - `created_at`: `timestamptz` (Default `now()`)

- **Row Level Security (RLS)**:
  - `"Anyone can read suggestions on shared documents"`: `USING (EXISTS (SELECT 1 FROM documents d WHERE d.id = document_id AND (d.user_id = auth.uid() OR (d.settings->>'shareActive')::boolean = true)))`

---

### 5. `document_notifications`
Notification bell entries triggered by collaboration actions.

- **Columns**:
  - `id`: `uuid` (Primary Key, Default `gen_random_uuid()`)
  - `document_id`: `uuid` (references `documents(id)` ON DELETE CASCADE)
  - `recipient_id`: `uuid` (references `auth.users(id)` ON DELETE CASCADE)
  - `sender_name`: `text` (Default `'Guest Co-Editor'`)
  - `message`: `text` (Required)
  - `read`: `boolean` (Default `false`)
  - `created_at`: `timestamptz` (Default `now()`)

- **Row Level Security (RLS)**:
  - `"Users can view own notifications"`: `USING (auth.uid() = recipient_id)`

---

### 6. `citation_cache`
Caches OpenAlex and Crossref search results to eliminate API rate limits.

- **Columns**:
  - `id`: `uuid` (Primary Key, Default `gen_random_uuid()`)
  - `query_hash`: `text` (Unique MD5 query hash)
  - `query_text`: `text`
  - `results`: `jsonb` (Array of candidate objects)
  - `sources`: `text[]` (Array of source names)
  - `hit_count`: `integer` (Default `1`)
  - `created_at`: `timestamptz` (Default `now()`)
  - `expires_at`: `timestamptz` (Default `now() + interval '7 days'`)

---

### 7. `citation_library`
Global collection of references cited across manuscripts.

- **Columns**:
  - `id`: `uuid` (Primary Key, Default `gen_random_uuid()`)
  - `reference_id`: `text` (Unique identifier)
  - `citation_data`: `jsonb` (Metadata JSON)
  - `added_by`: `uuid` (references `auth.users(id)` ON DELETE SET NULL)
  - `added_at`: `timestamptz` (Default `now()`)

---

### 8. `ai_models`
Dynamic AI model configuration catalog.

- **Columns**:
  - `id`: `text` (Primary Key, e.g. `'gemini'`, `'llama3'`, `'gemma2'`, `'claude'`)
  - `name`: `text` (e.g. `'Gemini Flash (Direct)'`)
  - `model_id`: `text` (e.g. `'gemini-1.5-flash'`)
  - `is_enabled`: `boolean` (Default `true`)
  - `is_premium`: `boolean` (Default `false`)
  - `updated_at`: `timestamptz` (Default `now()`)

---

### 9. `pricing_plans`
Stores subscription packages shown in user pricing modals.

- **Columns**:
  - `id`: `text` (Primary Key, e.g. `'free'`, `'pro'`, `'institution'`)
  - `name`: `text`
  - `price`: `numeric` (Default `0`)
  - `price_period`: `text` (Default `'bulan'`)
  - `description`: `text`
  - `features`: `text[]`
  - `is_popular`: `boolean` (Default `false`)
  - `promo_text`: `text`
  - `updated_at`: `timestamptz` (Default `now()`)

---

### 10. `payment_gateways`
Active payment gateway configurations (Stripe / Midtrans).

- **Columns**:
  - `id`: `text` (Primary Key, e.g. `'stripe'`, `'midtrans'`)
  - `name`: `text`
  - `is_enabled`: `boolean` (Default `true`)
  - `updated_at`: `timestamptz` (Default `now()`)
