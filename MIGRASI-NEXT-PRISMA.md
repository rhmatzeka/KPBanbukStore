# Migrasi Next.js + Prisma + Neon

Project ini sudah dipindahkan dari Laravel API + MySQL menjadi Next.js API + Prisma + PostgreSQL.

## Lokasi Utama

- App Next.js: `frontend`
- API route: `frontend/app/api/[[...path]]/route.js`
- Prisma schema: `frontend/prisma/schema.prisma`
- Seed data: `frontend/prisma/seed.js`
- SQL lama: `database-inventaris.sql`

## Setup Neon

1. Buat project database di Neon.
2. Ambil connection string PostgreSQL.
3. Buat file `frontend/.env.local`.
4. Isi env berikut:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require"
NEXT_PUBLIC_API_URL="/api"
```

## Setup Database

Jalankan dari folder `frontend`:

```bash
npm install
npm run db:push
npm run db:seed
```

Login default:

- `owner@gudang.com` / `password`
- `admin@gudang.com` / `password`

## Jalankan Lokal

```bash
cd frontend
npm run dev
```

Buka `http://localhost:3000`.

## Deploy Vercel

Set root directory Vercel ke `frontend`, lalu tambahkan environment variable:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require"
NEXT_PUBLIC_API_URL="/api"
```

Build command default `npm run build` sudah cukup. Jalankan `npm run db:push` dan `npm run db:seed` sekali saat database masih kosong.
