# 🏛️ LaporMas — Sistem Pelaporan Pengaduan Masyarakat Transparan & Modern

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://report-sistem-masyarakat-xmc5.vercel.app/)
[![Backend Status](https://img.shields.io/badge/Backend-Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app/)
[![Database](https://img.shields.io/badge/Database-Aiven%20MySQL-FF4F00?style=for-the-badge&logo=mysql&logoColor=white)](https://aiven.io/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](#license)

**LaporMas** adalah platform sistem informasi pengaduan dan aspirasi masyarakat berbasis lokasi (*GIS*) dan bukti foto publik yang dirancang untuk memfasilitasi komunikasi transparan antara warga dan petugas instansi pemerintah/daerah secara *real-time*.

---

## 🌟 Fitur Utama

### 📱 Portal Warga (Web & Mobile)
- **📍 Presisi Lokasi GPS (Interactive Map)**: Menentukan koordinat lokasi pengaduan secara presisi menggunakan peta interaktif OpenStreetMap / Leaflet.
- **📸 Upload Foto Bukti Pengaduan**: Mendukung berbagai format gambar (`.png`, `.jpg`, `.jpeg`, `.webp`, `.heic`, `.gif`, `.bmp`) dengan pratinjau langsung, kartu metadata berkas, dan dukungan upload via kamera / galeri.
- **👍 Sistem Dukungan Suara (+1 Upvote)**: Warga dapat memberikan dukungan pada laporan publik agar diprioritaskan oleh petugas instansi.
- **💬 Diskusi & Tanggapan Transparan**: Kolom komentar publik untuk warga dan balasan resmi dari petugas.
- **⏳ Timeline Status Real-Time**: Alur penanganan dari `Menunggu Verifikasi` ➔ `Sedang Diproses` ➔ `Selesai Ditangani` / `Ditolak`.

### 🛡️ Panel Super Admin & Petugas
- **📊 Dashboard Analytics & Statistik**: Grafik ringkasan laporan, rasio penyelesaian masalah, serta status distribusi pengaduan.
- **⚡ Quick Status Update & Template Balasan**: Memperbarui status laporan beserta tanggapan resmi secara cepat menggunakan template respon bawaan.
- **📂 Manajemen Kategori**: Pengelolaan kategori pengaduan (Infrastruktur, Kebersihan, Keamanan, Layanan Publik) beserta ikon dan warna pembeda.
- **👥 Manajemen Pengguna & Peran**: Pengelolaan hak akses pengguna (`user`, `admin`, `super_admin`).

---

## 💻 Teknologi & Stack Utama

### ⚙️ Backend API (`/backend`)
- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database ORM**: Sequelize ORM
- **Database Support**: MySQL 8.x (Production/Cloud via Aiven) & SQLite3 (Zero-config fallback mode untuk lokal)
- **Autentikasi**: JSON Web Token (JWT) & bcrypt.js password hashing
- **Upload Handler**: Multer

### 🌐 Frontend Web (`/frontend-web`)
- **Library**: React 19 & Vite 8
- **Styling**: Vanilla CSS dengan Design System **Civic Dark Pro** (Glassmorphism, custom micro-animations, responsive layout)
- **Peta Interaktif**: React Leaflet & Leaflet API
- **Icons**: Lucide React
- **Notifikasi**: React Hot Toast

### 📱 Frontend Mobile (`/frontend-mobile`)
- **Framework**: React Native & Expo SDK
- **Navigasi**: React Navigation (Stack & Bottom Tabs)
- **Media Access**: Expo Image Picker (Kamera & Galeri)
- **Design Tokens**: Sync 100% dengan skema warna Web (`lapormasTheme.js`)

---

## 📂 Struktur Direktori Project

```text
report-sistem-masyarakat/
├── backend/                  # RESTful API Server (Express.js + Sequelize)
│   ├── src/
│   │   ├── config/           # Database configuration & Multer upload engine
│   │   ├── controllers/      # Auth, Report, Category, Comment, & Vote Logic
│   │   ├── middleware/       # JWT Auth & Role-based Access Control
│   │   ├── models/           # Sequelize Schemas (User, Report, Category, Comment, Vote)
│   │   └── routes/           # Express Route definitions
│   ├── uploads/              # Public uploaded report photos
│   └── server.js             # Entrypoint server & auto DB migration/seeder
├── frontend-web/             # Web Application (React 19 + Vite)
│   ├── src/
│   │   ├── api/              # Axios HTTP client configuration
│   │   ├── components/       # Navbar, ReportCard, StatusBadge, Leaflet Map, Lightbox
│   │   ├── context/          # AuthContext (JWT Token & User Session)
│   │   ├── pages/            # Landing, Login, Register, Dashboard, CreateReport, ReportDetail, AdminPanel
│   │   └── index.css         # Civic Dark Pro Design System
├── frontend-mobile/          # Mobile Application (React Native + Expo)
│   ├── src/
│   │   ├── screens/          # Login, Register, ReportsList, CreateReport, ReportDetail
│   │   └── theme/            # Shared Civic Dark Pro design tokens
└── README.md
```

---

## 🚀 Panduan Jalankan Secara Lokal (Local Setup)

### 1. Prasyarat
- **Node.js** v18.x atau versi lebih baru
- **npm** v9.x atau versi lebih baru
- *(Opsional)* **MySQL** (misal via Laragon / XAMPP), atau gunakan mode otomatis **SQLite** tanpa instalasi database tambahan.

---

### 2. Setup Backend API Server

```bash
cd backend

# 1. Install dependensi
npm install

# 2. Salin environment file
cp .env.example .env

# 3. Jalankan server (secara otomatis akan membuat database & data dummy awal)
npm run dev
```

> **Catatan Database**:
> Secara default, Backend disetting menggunakan `DB_DIALECT=sqlite` sehingga **langsung berjalan tanpa perlu install MySQL**. Jika ingin menggunakan MySQL lokal, ubah variabel di `.env` backend:
> ```env
> DB_DIALECT=mysql
> DB_HOST=localhost
> DB_PORT=3306
> DB_USER=root
> DB_PASSWORD=
> DB_NAME=pengaduan_masyarakat
> ```

---

### 3. Setup Frontend Web Application

```bash
cd frontend-web

# 1. Install dependensi
npm install

# 2. Jalankan development server
npm run dev
```

Aplikasi Web akan dapat diakses pada browser di: `http://localhost:5173`

---

### 4. Setup Frontend Mobile Application (Expo)

```bash
cd frontend-mobile

# 1. Install dependensi
npm install

# 2. Jalankan Expo dev server
npm start
```

Pindai QR code yang muncul menggunakan aplikasi **Expo Go** pada smartphone Android/iOS Anda.

---

## 🔑 Akun Demo Pengujian

Anda dapat langsung menggunakan akun demo yang telah di-seed secara otomatis oleh sistem:

| Peran (Role) | Email | Password | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@pengaduan.com` | `admin123` | Akses Penuh: Kelola Laporan, User, & Kategori |
| **Admin Petugas** | `admin@pengaduan.com` | `admin123` | Update Status Penanganan & Balasan Resmi |
| **Warga Demo** | `warga@pengaduan.com` | `user123` | Buat Laporan, Unggah Foto, & Beri Dukungan Suara |

---

## 🌐 Panduan Deployment

### Deployment Backend (Railway / Render / Heroku)
1. Hubungkan repository GitHub ke layanan cloud hosting (misal Railway).
2. Set Environment Variables di dashboard cloud:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `DB_DIALECT=mysql` (atau `sqlite`)
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (dari provider database cloud seperti **Aiven.io**)
   - `JWT_SECRET=your_jwt_secret_key`

### Deployment Frontend Web (Vercel / Netlify)
1. Import folder `frontend-web` di **Vercel**.
2. Tambahkan Environment Variable:
   - `VITE_API_URL=https://<your-backend-railway-url>.up.railway.app/api`
3. Klik **Deploy**.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

<p align="center">
  Dibuat dengan ❤️ untuk transparansi dan kemajuan pelayanan publik masyarakat.
</p>
