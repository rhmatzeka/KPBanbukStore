# Cara Menjalankan Aplikasi Inventaris Gudang

## Persiapan Awal (Hanya Sekali)

### 1. Install Software yang Dibutuhkan
- ✅ XAMPP (sudah terinstall)
- Node.js (download dari https://nodejs.org - pilih versi LTS)
- Composer (download dari https://getcomposer.org/download/)

### 2. Setup Database
1. Buka XAMPP Control Panel
2. Start **Apache** dan **MySQL**
3. Buka browser, ketik: `http://localhost/phpmyadmin`
4. Klik tab **SQL**
5. Copy isi file `laravel_react_app.sql` dan paste di kolom SQL
6. Klik **Go** untuk import database

### 3. Setup Backend (Laravel) - Hanya Sekali
1. Buka **Command Prompt** atau **PowerShell**
2. Masuk ke folder backend:
   ```
   cd "C:\Rahmat Folder\UNPAM\TUGAS\KP\ProjectApp\backend"
   ```
3. Install dependencies (tunggu sampai selesai):
   ```
   composer install
   ```
4. Cek file `.env` sudah ada (sudah ada di project)

### 4. Setup Frontend (React) - Hanya Sekali
1. Buka **Command Prompt** atau **PowerShell** BARU (jangan tutup yang backend)
2. Masuk ke folder frontend:
   ```
   cd "C:\Rahmat Folder\UNPAM\TUGAS\KP\ProjectApp\frontend"
   ```
3. Install dependencies (tunggu 5-10 menit):
   ```
   npm install
   ```

---

## Cara Menjalankan Aplikasi (Setiap Kali Mau Pakai)

### Langkah 1: Start XAMPP
1. Buka **XAMPP Control Panel**
2. Klik **Start** pada **Apache**
3. Klik **Start** pada **MySQL**
4. Pastikan keduanya berwarna hijau

### Langkah 2: Jalankan Backend (Laravel)
1. Buka **Command Prompt** atau **PowerShell**
2. Masuk ke folder backend:
   ```
   cd "C:\Rahmat Folder\UNPAM\TUGAS\KP\ProjectApp\backend"
   ```
3. Jalankan server Laravel:
   ```
   php artisan serve
   ```
4. Tunggu sampai muncul: `Server running on [http://127.0.0.1:8000]`
5. **JANGAN TUTUP WINDOW INI!** Biarkan tetap terbuka

### Langkah 3: Jalankan Frontend (React)
1. Buka **Command Prompt** atau **PowerShell** BARU (window kedua)
2. Masuk ke folder frontend:
   ```
   cd "C:\Rahmat Folder\UNPAM\TUGAS\KP\ProjectApp\frontend"
   ```
3. Jalankan React:
   ```
   npm start
   ```
4. Tunggu sampai browser otomatis terbuka ke `http://localhost:3000`
5. **JANGAN TUTUP WINDOW INI!** Biarkan tetap terbuka

### Langkah 4: Buka Aplikasi
- Browser akan otomatis terbuka ke: `http://localhost:3000`
- Kalau tidak otomatis, buka browser dan ketik: `http://localhost:3000`

---

## Login Aplikasi

### Akun Owner (Punya Grafik)
- Email: `owner@gudang.com`
- Password: `password`

### Akun Admin (Bisa Kelola User)
- Email: `admin@gudang.com`
- Password: `password`

---

## Cara Menghentikan Aplikasi

### 1. Stop Frontend (React)
- Klik pada window Command Prompt yang menjalankan `npm start`
- Tekan `Ctrl + C`
- Ketik `Y` lalu Enter

### 2. Stop Backend (Laravel)
- Klik pada window Command Prompt yang menjalankan `php artisan serve`
- Tekan `Ctrl + C`

### 3. Stop XAMPP
- Buka XAMPP Control Panel
- Klik **Stop** pada MySQL
- Klik **Stop** pada Apache

---

## Troubleshooting (Kalau Ada Masalah)

### Error: "php is not recognized"
**Solusi:**
1. Buka XAMPP Control Panel
2. Klik **Shell** (tombol di kanan atas)
3. Jalankan perintah di shell XAMPP tersebut

### Error: "npm is not recognized"
**Solusi:**
- Install Node.js dari https://nodejs.org
- Restart Command Prompt setelah install

### Error: Port 8000 already in use
**Solusi:**
```
php artisan serve --port=8001
```
Lalu ubah di frontend `src/components` semua URL dari `8000` ke `8001`

### Error: Port 3000 already in use
**Solusi:**
- Tekan `Y` saat ditanya "Would you like to run the app on another port instead?"

### Database Connection Error
**Solusi:**
1. Pastikan MySQL di XAMPP sudah running (hijau)
2. Cek file `backend/.env`:
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=laravel_react_app
   DB_USERNAME=root
   DB_PASSWORD=
   ```

### Halaman Putih / Blank
**Solusi:**
1. Tekan `Ctrl + Shift + R` untuk hard refresh
2. Atau buka browser Incognito/Private mode

---

## Struktur Folder

```
ProjectApp/
├── backend/          → Laravel API (Backend)
│   ├── app/
│   ├── routes/
│   └── .env         → Konfigurasi database
│
├── frontend/         → React App (Frontend)
│   ├── src/
│   │   ├── components/
│   │   ├── App.js
│   │   └── App.css
│   └── public/
│
└── *.sql            → File database
```

---

## Tips

1. **Selalu jalankan 2 Command Prompt:**
   - Window 1: Backend (Laravel) - `php artisan serve`
   - Window 2: Frontend (React) - `npm start`

2. **Jangan tutup Command Prompt** selama aplikasi berjalan

3. **Kalau mau edit code:**
   - Edit file di folder `frontend/src/` untuk tampilan
   - Edit file di folder `backend/app/` untuk logic backend
   - Simpan file, aplikasi akan auto-reload

4. **Kalau ada error:**
   - Lihat pesan error di Command Prompt
   - Lihat pesan error di Browser Console (F12)

---

## Kontak
Kalau masih bingung, screenshot error nya dan tanya!
