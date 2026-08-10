# 🐘 Database Migration Guide — ScholarFlow

Panduan ini berisi langkah-demi-langkah cara melakukan skema dan data migrasi dari **Supabase Cloud (PaaS)** ke **PostgreSQL / MySQL VPS Self-Hosted (aaPanel / DigitalOcean / Docker)**.

---

## 🛠️ Opsi 1: Migrasi Menggunakan Prisma ORM (Direkomendasikan)

ScholarFlow menyediakan file skema Prisma universal di [`prisma/schema.prisma`](file:///c:/web/ScholarFlow/prisma/schema.prisma).

### 1. Ubah `DATABASE_URL` di File `.env`
Sesuaikan URL koneksi database VPS Anda di file `.env.local` atau `.env`:
```env
# Contoh PostgreSQL VPS
DATABASE_URL="postgresql://postgres:password123@localhost:5432/scholarflow?schema=public"

# Atau Contoh MySQL VPS (Ubah provider di schema.prisma ke "mysql")
# DATABASE_URL="mysql://user:password123@localhost:3306/scholarflow"
```

### 2. Jalankan Perintah Migrasi Prisma
```bash
# 1. Jalankan migrasi skema tabel otomatis
npx prisma migrate dev --name init_scholarflow

# 2. Generate TypeScript Client
npx prisma generate
```

---

## 📜 Opsi 2: Skema DDL SQL Manual (PostgreSQL & MySQL)

Jika Anda tidak menggunakan Prisma dan ingin mengeksekusi SQL DDL secara langsung via **aaPanel / pgAdmin / phpMyAdmin**:

### PostgreSQL DDL Script:
```sql
-- Create Enum Types
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE suggestion_status AS ENUM ('pending', 'accepted', 'rejected');

-- Profiles Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    plan_id VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Documents Table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'Untitled Document',
    content TEXT NOT NULL,
    settings JSONB,
    shared_with JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for Query Speed
CREATE INDEX idx_documents_user_id ON documents(user_id);
```

---

## 🔄 Cara Menukar Target Backend di ScholarFlow

Setelah database VPS aktif:
1. Jalankan container backend Express API (`docker compose up -d` di folder `docker/`).
2. Di file `.env.local`, ubah pilihan backend:
   ```env
   NEXT_PUBLIC_BACKEND_TYPE=express
   NEXT_PUBLIC_EXPRESS_API_URL=https://api.domain-anda.com/api/v1
   ```
3. Aplikasi ScholarFlow akan **otomatis 100% menggunakan backend VPS** tanpa perlu mengubah kode frontend!
