# Aplikasi Inventaris Gudang

Aplikasi inventaris gudang berbasis Laravel dan React untuk mengelola produk, kategori, transaksi barang masuk/keluar, serta data pengguna dalam satu dashboard yang responsif.

## Ringkasan

- Backend: Laravel 12 REST API
- Frontend: React.js
- Database: MySQL
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
- Kelola user

## Role Pengguna

### Owner

- Akses dashboard
- Akses kategori
- Akses produk
- Akses transaksi
- Akses kelola user

### Admin

- Akses dashboard
- Akses kategori
- Akses produk
- Akses transaksi
- Akses kelola user

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

File database utama project:

- [database-inventaris.sql](</C:/Rahmat Folder/UNPAM/TUGAS/KP/ProjectApp/database-inventaris.sql:1>)

File tersebut sudah berisi:

- pembuatan database `laravel_react_app`
- struktur tabel inti dan tabel pendukung Laravel
- seed data awal
- akun login default

## Cara Menjalankan

### 1. Jalankan MySQL

Gunakan XAMPP atau MySQL lokal, lalu pastikan service MySQL aktif.

### 2. Import database

Import file `database-inventaris.sql` ke MySQL, misalnya lewat phpMyAdmin atau command line.

Nama database yang dipakai aplikasi:

- `laravel_react_app`

### 3. Jalankan backend

```bash
cd backend
composer install
php artisan serve --host=0.0.0.0 --port=8000
```

Backend aktif di:

- `http://localhost:8000`

### 4. Jalankan frontend

```bash
cd frontend
npm install
npm start
```

Frontend aktif di:

- `http://localhost:3000`

## Konfigurasi Database Backend

File contoh konfigurasi:

- `backend/.env.example`

Salin menjadi `.env`, lalu gunakan konfigurasi berikut:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel_react_app
DB_USERNAME=root
DB_PASSWORD=
```

## Endpoint API Utama

### Auth

- `POST /api/login`
- `GET /api/me`

### Dashboard

- `GET /api/dashboard`
- `GET /api/dashboard/chart`

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

## Struktur Folder Singkat

```text
ProjectApp/
├── backend/
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── .env
├── frontend/
│   ├── src/
│   └── public/
├── database-inventaris.sql
├── CARA-RUN-APLIKASI.md
└── README.md
```

## Catatan

- File `backend/.env` memang tidak di-push ke GitHub karena berisi konfigurasi lokal. Untuk setup di komputer lain, gunakan `backend/.env.example` lalu rename/copy menjadi `backend/.env`.
- Frontend sekarang memakai base API dinamis dari host browser, jadi lebih aman saat dibuka dari `localhost` maupun IP jaringan lokal.
- UI sudah dirapikan agar lebih nyaman di berbagai ukuran layar.
- Jika tampilan browser belum berubah setelah update, lakukan hard refresh dengan `Ctrl + F5`.
