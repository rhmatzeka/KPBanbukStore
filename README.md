# Aplikasi Inventaris Gudang

Aplikasi inventaris gudang berbasis Next.js, Prisma, dan PostgreSQL/Neon untuk mengelola produk, kategori, transaksi barang masuk/keluar, serta data pengguna dalam satu dashboard yang responsif.

## Ringkasan

- App: Next.js
- API: Next.js Route Handler
- ORM: Prisma
- Database: PostgreSQL, siap Neon
- UI: responsive untuk desktop, tablet, dan mobile
- Role utama: `Owner` dan `Admin`

## Fitur Utama

- Login pengguna
- Dashboard statistik inventaris
- CRUD kategori
- CRUD produk
- Transaksi barang masuk
- Transaksi barang keluar
- Update stok otomatis dari transaksi
- Monitoring stok minimum
- Stock opname / penyesuaian stok fisik
- Laporan transaksi dengan cetak PDF dan export CSV
- Audit log aktivitas pengguna
- Hak akses detail berdasarkan role
- Kelola user

## Role Pengguna

### Owner

- Akses dashboard
- Akses kategori
- Akses produk
- Akses transaksi
- Akses stock opname
- Akses laporan
- Akses audit log aktivitas
- Akses kelola user
- Dapat menghapus data master dan transaksi

### Admin

- Akses dashboard
- Akses kategori
- Akses produk
- Akses transaksi
- Akses stock opname
- Akses laporan
- Tidak dapat menghapus data master
- Tidak dapat mengakses kelola user dan audit log

## Akun Login Default

- Owner
- Email: `owner@gudang.com`
- Password: `password`
- Admin
- Email: `admin@gudang.com`
- Password: `password`

## Struktur Data Inti

Tabel bisnis utama:

- `roles`
- `users`
- `categories`
- `products`
- `transactions`

Skema database utama project:

- [frontend/prisma/schema.prisma](</C:/Rahmat Folder/UNPAM/TUGAS/KP/ProjectApp/frontend/prisma/schema.prisma:1>)

File seed:

- [frontend/prisma/seed.js](</C:/Rahmat Folder/UNPAM/TUGAS/KP/ProjectApp/frontend/prisma/seed.js:1>)

File SQL lama masih disimpan sebagai referensi migrasi:

- [database-inventaris.sql](</C:/Rahmat Folder/UNPAM/TUGAS/KP/ProjectApp/database-inventaris.sql:1>)

## Cara Menjalankan

### 1. Siapkan PostgreSQL/Neon

Buat database PostgreSQL, misalnya di Neon. Ambil connection string pooled atau direct connection.

### 2. Buat env

Di folder `frontend`, salin `.env.example` menjadi `.env.local`, lalu isi:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require"
NEXT_PUBLIC_API_URL="/api"
```

### 3. Push schema dan seed data

```bash
cd frontend
npm install
npm run db:push
npm run db:seed
```

### 4. Jalankan aplikasi

```bash
cd frontend
npm run dev
```

Aplikasi aktif di:

- `http://localhost:3000`

## Deploy ke Vercel

Deploy dengan **Root Directory** Vercel diset ke `frontend`, lalu set environment variable `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, dan `NEXT_PUBLIC_API_URL=/api`. Jalankan `npm run db:push` dan `npm run db:seed` dari lokal saat database masih kosong.

## Endpoint API Utama

### Auth

- `POST /api/login`
- `GET /api/me`

### Dashboard

- `GET /api/dashboard`
- `GET /api/dashboard/chart`

### Stock Opname dan Audit

- `GET|POST /api/stock-opnames`
- `GET /api/audit-logs`

### Master Data

- `GET|POST|PUT|DELETE /api/categories`
- `GET|POST|PUT|DELETE /api/products`
- `GET|POST|PUT|DELETE /api/users`

### Transaksi

- `GET|POST|DELETE /api/transactions`

## Aturan Bisnis Penting

- Email user harus unik
- Kode produk harus unik
- Kode transaksi harus unik
- Transaksi `in` menambah stok
- Transaksi `out` mengurangi stok
- Transaksi keluar ditolak jika stok tidak cukup
- Produk memakai `min_stock` untuk mendeteksi stok menipis
- Stock opname menyimpan stok sistem, stok fisik, selisih, alasan, tanggal, dan petugas
- Stock opname otomatis mengubah stok produk menjadi stok fisik yang diinput
- Aktivitas login, tambah, ubah, hapus, transaksi, dan stock opname dicatat ke audit log
- Owner memiliki akses penuh, sedangkan Admin fokus pada operasional stok tanpa akses hapus sensitif

## Struktur Folder Singkat

```text
ProjectApp/
├── frontend/
│   ├── app/
│   ├── prisma/
│   ├── src/
│   ├── public/
│   └── vercel.json
├── database-inventaris.sql
├── MIGRASI-NEXT-PRISMA.md
└── README.md
```

## Catatan

- File `frontend/.env` dan `frontend/.env.local` tidak di-push ke GitHub karena berisi connection string database.
- API sekarang berjalan di Next.js Route Handler pada path `/api`.
- UI sudah dirapikan agar lebih nyaman di berbagai ukuran layar.
- Jika tampilan browser belum berubah setelah update, lakukan hard refresh dengan `Ctrl + F5`.
