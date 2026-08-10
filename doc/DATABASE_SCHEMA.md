# ScholarFlow Database Schema

This document details the PostgreSQL tables, indexes, triggers, and Row Level Security (RLS) policies set up in Supabase and Prisma ORM for ScholarFlow.

---

## 📊 Entity Relationship Summary
The database consists of the following 10 core tables:

1. **`profiles`**: Links to `auth.users` to manage user identity, access roles (`user` or `admin`), and active subscription plan (`plan_id`).
2. **`documents`**: Stores draft manuscripts, contents (block JSON format), and personalized settings (`publishYear`, `citationStyle`, `language`).
3. **`document_suggestions`**: Stores track-changes and AI suggestions (`original_text`, `suggested_text`, `status`).
4. **`document_comments`**: Stores in-document user comments (`user_id`, `user_name`, `content`).
5. **`document_notifications`**: Stores in-app user notifications for collaboration and document updates.
6. **`citation_cache`**: Caches OpenAlex and Crossref search results to improve performance and minimize rate limit usage.
7. **`citation_library`**: A global collection containing all references, parsed RIS entries, and uploaded PDF metadata.
8. **`ai_models`**: Dynamic catalog managing active LLM models (`gemini-2.0-flash`, `llama3`, `gemma2`, `claude-3.5`).
9. **`pricing_plans`**: Dynamically stores pricing packages (Free, Pro, Institution), features list, and price rates.
10. **`payment_gateways`**: Configuration table enabling admin to dynamically toggle Stripe or Midtrans gateway status.

---

## 🗄️ Table Details & RLS Policies

### 1. `profiles`
Stores user profile metadata, system roles, and active subscription status. Automatically populated via trigger when a new user signs up.

- **Columns**:
  - `id`: `uuid` (Primary Key, references `auth.users(id)` ON DELETE CASCADE)
  - `email`: `text` (Unique, required)
  - `full_name`: `text` (optional)
  - `avatar_url`: `text` (optional)
  - `role`: `text` (Default `'user'`, Check constraint: `role IN ('user', 'admin')`)
  - `plan_id`: `text` (Default `'free'`)
  - `created_at`: `timestamptz` (Default `now()`)
  - `updated_at`: `timestamptz` (Default `now()`)

- **Row Level Security (RLS)**:
  - Policy `"Users can read own profile"`: `USING (auth.uid() = id)`
  - Policy `"Users can update own profile"`: `USING (auth.uid() = id)`

---

### 2. `documents`
Stores user documents and draft manuscripts, including unique format and citation parameters.

- **Columns**:
  - `id`: `uuid` (Primary Key, Default `gen_random_uuid()`)
  - `user_id`: `uuid` (references `auth.users(id)` ON DELETE CASCADE)
  - `title`: `text` (Default `'Untitled Document'`)
  - `content`: `text` (Markdown or block JSON format)
  - `settings`: `jsonb` (Stores settings like `publishYear`, `citationStyle`, `language`, `showPageNumber`)
  - `shared_with`: `jsonb` (Stores sharing permissions: `{ public: boolean, users: string[] }`)
  - `created_at`: `timestamptz` (Default `now()`)
  - `updated_at`: `timestamptz` (Default `now()`)

- **Row Level Security (RLS)**:
  - Policy `"Users can view own or shared documents"`:
    ```sql
    USING (
      auth.uid() = user_id OR 
      (shared_with->>'public' = 'true') OR
      (shared_with->'users' ? auth.uid()::text)
    )
    ```
  - Policy `"Users can manage own documents"`: `USING (auth.uid() = user_id)`

---

### 3. `document_suggestions`
Stores track-changes and AI suggestions for collaborative manuscripts.

- **Columns**:
  - `id`: `uuid` (Primary Key, Default `gen_random_uuid()`)
  - `document_id`: `uuid` (references `documents(id)` ON DELETE CASCADE)
  - `user_id`: `uuid` (references `profiles(id)` ON DELETE CASCADE)
  - `original_text`: `text` (required)
  - `suggested_text`: `text` (required)
  - `status`: `text` (Default `'pending'`, Check constraint: `status IN ('pending', 'accepted', 'rejected')`)
  - `created_at`: `timestamptz` (Default `now()`)

- **Row Level Security (RLS)**:
  - Policy `"Users can manage suggestions on access documents"`: `USING (EXISTS (SELECT 1 FROM documents WHERE documents.id = document_id AND (documents.user_id = auth.uid() OR documents.shared_with->>'public' = 'true')))`

---

### 4. `document_comments`
Stores in-document comments by collaborators.

- **Columns**:
  - `id`: `uuid` (Primary Key, Default `gen_random_uuid()`)
  - `document_id`: `uuid` (references `documents(id)` ON DELETE CASCADE)
  - `user_id`: `uuid` (references `profiles(id)` ON DELETE CASCADE)
  - `user_name`: `text` (required)
  - `content`: `text` (required)
  - `created_at`: `timestamptz` (Default `now()`)

---

### 5. `document_notifications`
Stores in-app user notifications for collaboration and document updates.

- **Columns**:
  - `id`: `uuid` (Primary Key, Default `gen_random_uuid()`)
  - `user_id`: `uuid` (references `profiles(id)` ON DELETE CASCADE)
  - `title`: `text` (required)
  - `message`: `text` (required)
  - `is_read`: `boolean` (Default `false`)
  - `created_at`: `timestamptz` (Default `now()`)

---

### 6. `citation_cache`
A shared cache table storing search results from OpenAlex and Crossref.

- **Columns**:
  - `id`: `uuid` (Primary Key, Default `gen_random_uuid()`)
  - `query_key`: `text` (Unique search term identifier)
  - `results`: `jsonb` (Array of candidate objects)
  - `hit_count`: `integer` (Default `1`)
  - `created_at`: `timestamptz` (Default `now()`)

---

### 7. `citation_library`
Stores user-curated reference citations, parsed RIS entries, and extracted PDF metadata.

- **Columns**:
  - `id`: `uuid` (Primary Key, Default `gen_random_uuid()`)
  - `user_id`: `uuid` (references `profiles(id)` ON DELETE CASCADE)
  - `title`: `text` (required)
  - `authors`: `jsonb` (Array of author name strings)
  - `year`: `integer` (optional)
  - `journal`: `text` (optional)
  - `doi`: `text` (optional)
  - `url`: `text` (optional)
  - `abstract`: `text` (optional)
  - `citation_key`: `text` (optional)
  - `created_at`: `timestamptz` (Default `now()`)

- **Row Level Security (RLS)**:
  - Policy `"Users can manage own citation library"`: `USING (auth.uid() = user_id)`

---

### 8. `ai_models`
Dynamic catalog managing available LLM models for AI actions.

- **Columns**:
  - `id`: `text` (Primary Key, e.g. `'gemini'`, `'llama3'`, `'gemma2'`, `'claude'`)
  - `name`: `text` (e.g. `'Gemini 2.0 Flash (Direct)'`)
  - `model_id`: `text` (e.g. `'gemini-2.0-flash'`)
  - `is_enabled`: `boolean` (Default `true`)
  - `is_premium`: `boolean` (Default `false`)
  - `provider`: `text` (Default `'gemini'`)
  - `created_at`: `timestamptz` (Default `now()`)

---

### 9. `pricing_plans`
Stores pricing models and packages dynamically shown inside the user-facing modal.

- **Columns**:
  - `id`: `text` (Primary Key, e.g. `'free'`, `'pro'`, `'institution'`)
  - `name`: `text` (e.g. `'Pro Writer'`)
  - `price`: `numeric` (Default `0`)
  - `features`: `jsonb` (Array of feature item strings)
  - `is_popular`: `boolean` (Default `false`)
  - `created_at`: `timestamptz` (Default `now()`)

---

### 10. `payment_gateways`
Determines active payment gateways for subscription purchases.

- **Columns**:
  - `id`: `text` (Primary Key, e.g. `'stripe'`, `'midtrans'`)
  - `name`: `text` (Readable name)
  - `is_enabled`: `boolean` (Default `true`)
  - `config`: `jsonb` (Optional configuration parameters)
  - `created_at`: `timestamptz` (Default `now()`)
