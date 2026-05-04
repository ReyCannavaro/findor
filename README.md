<div align="center">
  <img src="public/logo.png" alt="Findor Logo" width="420" />

  <br/>
  <br/>

  <p><strong>Platform marketplace vendor event premium untuk Indonesia</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" />
    <img src="https://img.shields.io/badge/Supabase-2.x-3ECF8E?style=flat-square&logo=supabase" />
    <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss" />
    <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" />
  </p>
</div>

---

## Daftar Isi

- [Tentang Findor](#tentang-findor)
- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Arsitektur Sistem](#arsitektur-sistem)
- [Struktur Direktori](#struktur-direktori)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Alur Bisnis](#alur-bisnis)
- [Instalasi & Setup](#instalasi--setup)
- [Environment Variables](#environment-variables)
- [Storage Buckets](#storage-buckets)
- [Middleware & Route Protection](#middleware--route-protection)
- [Halaman Frontend](#halaman-frontend)
- [Kontributor](#kontributor)

---

## Tentang Findor

**Findor** (*Find Your Vendor*) adalah platform marketplace yang menghubungkan penyelenggara acara (user) dengan vendor event profesional (vendor) di seluruh Indonesia. Mulai dari sound system, dekorasi, catering, fotografi, hingga entertainment — semua terverifikasi dan bisa dipesan dalam satu platform.

Keunggulan Findor:
- Setiap vendor melewati **verifikasi 5 tahap** (KTP + selfie + cek peralatan)
- Sistem **escrow pembayaran** — DP aman, dana dikunci sampai event selesai
- **Garansi dana kembali 100%** jika vendor tidak hadir di hari H
- Dashboard manajemen booking lengkap untuk vendor dan user

---

## Fitur Utama

### Untuk Pengguna (User)
- Daftar & login via email/password atau Google OAuth
- Cari vendor dengan filter kategori, kota, harga, rating, dan ketersediaan tanggal
- Lihat detail vendor: profil, galeri, paket layanan, ulasan, dan lokasi di peta
- Buat booking, upload bukti DP, dan pantau status pesanan secara real-time
- Simpan vendor favorit ke bookmarks
- Beri ulasan & rating setelah event selesai
- Kelola profil termasuk update foto avatar

### Untuk Vendor
- Daftar toko via wizard 3-step (info toko + upload KTP & selfie)
- Dashboard statistik: total booking, rating, dan booking pending
- Kelola katalog layanan: tambah, edit, dan soft-delete paket dengan harga min-max
- Terima, konfirmasi, atau tolak booking dari klien
- Verifikasi bukti DP yang diupload klien
- Tandai event sebagai selesai untuk memicu pengiriman ulasan
- Set ketersediaan kalender (available/off/full)
- Lihat statistik performa toko

### Untuk Admin
- Dashboard operasional: total vendor, booking hari ini, dan antrian verifikasi
- Review dokumen vendor (KTP vs selfie) dan approve/reject pendaftaran
- Manajemen pengguna: lihat daftar user, role, dan status

---

## Tech Stack

| Layer | Teknologi | Versi |
|---|---|---|
| Framework | Next.js (App Router) | 16.2 |
| UI Library | React | 19 |
| Language | TypeScript | 5 |
| Database | Supabase (PostgreSQL) | 2.x |
| Auth | Supabase Auth (Email + Google OAuth) | — |
| Storage | Supabase Storage | — |
| Styling | Tailwind CSS v4 + CSS Variables | 4 |
| Validasi | Zod | 4.x |
| Icons | Lucide React | 0.462 |
| Peta | Leaflet + React Leaflet | 1.9 / 5.0 |
| Date Picker | React Day Picker | 9.x |
| Date Utils | date-fns | 4.x |
| Toast | react-hot-toast | 2.6 |
| Font | Fraunces + Inter + Plus Jakarta Sans | — |

---

## Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
│   Next.js App Router — React 19 — Tailwind CSS v4           │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP / fetch
┌─────────────────────▼───────────────────────────────────────┐
│                  Next.js Server (Edge/Node)                   │
│   ┌────────────────┐  ┌─────────────────────────────────┐   │
│   │  Middleware.ts │  │     API Routes /api/v1/**        │   │
│   │  Route Guard   │  │  (Server Actions + Route Handler)│   │
│   └────────────────┘  └──────────────┬──────────────────┘   │
└──────────────────────────────────────┼──────────────────────┘
                                       │ Supabase SDK
┌──────────────────────────────────────▼──────────────────────┐
│                        Supabase                              │
│   ┌───────────────┐  ┌───────────┐  ┌──────────────────┐   │
│   │  PostgreSQL   │  │   Auth    │  │     Storage      │   │
│   │  + RLS        │  │  (JWT)    │  │  avatars/        │   │
│   │  + Triggers   │  │  + OAuth  │  │  vendor-docs/    │   │
│   └───────────────┘  └───────────┘  │  booking-proofs/ │   │
│                                     └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Pola autentikasi:**
- Semua request ke API routes menggunakan `createClient()` (SSR server client)
- Session di-manage via cookie oleh `@supabase/ssr`
- `getUser()` selalu verify ke Supabase server — aman dari token manipulasi
- Admin operations menggunakan `createAdminClient()` yang bypass RLS

---

## Struktur Direktori

```
findor/
├── app/
│   ├── (auth)/                        # Layout tanpa navbar
│   │   ├── login/page.tsx             # Halaman login
│   │   ├── register/page.tsx          # Halaman register user
│   │   └── callback/route.ts          # OAuth callback handler
│   │
│   ├── (main)/                        # Layout dengan navbar publik
│   │   ├── search/page.tsx            # Halaman browse & filter vendor
│   │   ├── vendor/[id]/page.tsx       # Detail vendor
│   │   ├── how-it-works/page.tsx      # Cara kerja Findor
│   │   └── about/page.tsx             # Tentang kami
│   │
│   ├── (user)/                        # Halaman user (login required)
│   │   ├── dashboard/page.tsx         # Dashboard user
│   │   ├── bookings/page.tsx          # Riwayat & status booking
│   │   ├── bookmarks/page.tsx         # Vendor tersimpan
│   │   └── profile/page.tsx           # Edit profil & avatar
│   │
│   ├── (vendor)/vendor/               # Halaman vendor (role=vendor required)
│   │   ├── register/page.tsx          # Wizard daftar vendor (3 step)
│   │   ├── dashboard/page.tsx         # Dashboard vendor
│   │   ├── bookings/page.tsx          # Kelola booking masuk
│   │   ├── services/page.tsx          # CRUD layanan & paket
│   │   ├── availability/page.tsx      # Kalender ketersediaan
│   │   └── analytics/page.tsx         # Statistik performa
│   │
│   ├── (admin)/admin/                 # Halaman admin (role=admin required)
│   │   ├── vendors/page.tsx           # Antrian verifikasi & approve vendor
│   │   └── users/page.tsx             # Manajemen pengguna
│   │
│   ├── api/v1/                        # REST API routes
│   │   ├── auth/
│   │   │   ├── register/route.ts      # POST — daftar user baru
│   │   │   ├── login/route.ts         # POST — login email/password
│   │   │   ├── logout/route.ts        # POST — logout & clear session
│   │   │   ├── me/route.ts            # GET profil | PATCH update + avatar
│   │   │   └── google/route.ts        # GET — OAuth Google redirect
│   │   │
│   │   ├── search/route.ts            # GET — cari & filter vendor
│   │   │
│   │   ├── vendors/
│   │   │   ├── route.ts               # POST — onboarding vendor + upload KTP/selfie
│   │   │   └── [id]/
│   │   │       ├── route.ts           # GET — detail vendor + layanan + ulasan
│   │   │       ├── services/
│   │   │       │   ├── route.ts       # GET list | POST tambah layanan
│   │   │       │   └── [serviceId]/route.ts  # PATCH edit | DELETE hapus layanan
│   │   │       └── availability/route.ts  # GET kalender | PATCH set tanggal
│   │   │
│   │   ├── bookings/
│   │   │   ├── route.ts               # GET list | POST buat booking
│   │   │   └── [id]/
│   │   │       ├── route.ts           # GET detail booking
│   │   │       ├── confirm/route.ts   # PATCH — vendor konfirmasi
│   │   │       ├── reject/route.ts    # PATCH — vendor tolak
│   │   │       ├── cancel/route.ts    # PATCH — user batalkan
│   │   │       ├── proof/route.ts     # POST — user upload bukti DP
│   │   │       ├── verify-payment/route.ts  # PATCH — vendor verifikasi DP
│   │   │       └── complete/route.ts  # PATCH — vendor tandai selesai
│   │   │
│   │   ├── reviews/
│   │   │   ├── route.ts               # POST — buat ulasan
│   │   │   ├── [id]/route.ts          # PATCH edit | DELETE hapus ulasan
│   │   │   └── vendor/[vendorId]/route.ts  # GET — semua ulasan vendor
│   │   │
│   │   ├── bookmarks/route.ts         # GET list | POST toggle bookmark
│   │   ├── analytics/route.ts         # GET — statistik vendor
│   │   │
│   │   └── admin/
│   │       ├── vendors/route.ts       # GET antrian | — verifikasi
│   │       ├── vendors/[id]/route.ts  # PATCH approve/reject vendor
│   │       └── users/route.ts         # GET list semua user
│   │
│   ├── globals.css                    # Design tokens & CSS variables
│   ├── layout.tsx                     # Root layout + Google Fonts
│   ├── page.tsx                       # Homepage dengan hero slider
│   ├── loading.tsx                    # Global loading state
│   ├── error.tsx                      # Global error boundary
│   ├── not-found.tsx                  # 404 page
│   ├── robots.ts                      # SEO robots.txt
│   └── sitemap.ts                     # SEO sitemap.xml
│
├── components/
│   ├── navbar.tsx                     # Navbar responsif dengan auth state
│   ├── footer.tsx                     # Footer dengan sitemap links
│   └── ui/
│       ├── Badge.tsx                  # Badge komponen
│       ├── Modal.tsx                  # Modal wrapper
│       └── Toast.tsx                  # Toast notifikasi
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  # Browser Supabase client
│   │   ├── server.ts                  # Server Supabase client (SSR)
│   │   └── admin.ts                   # Admin client (bypass RLS)
│   ├── validators/index.ts            # Semua Zod schemas
│   └── utils/api.ts                   # Response helpers & file validation
│
├── types/index.ts                     # TypeScript interfaces & types
├── middleware.ts                      # Session refresh + role-based route guard
│
├── supabase/migrations/
│   ├── 001_initial_schema.sql         # Schema utama: tabel, RLS, trigger
│   └── 003_avatars_storage.sql        # Bucket avatars + storage RLS
│
└── public/
    ├── logo.png                       # Logo horizontal (navbar)
    ├── logo-icon.png                  # Logo ikon (favicon/app icon)
    ├── findor_white.png               # Logo putih (dark background)
    ├── hero/                          # Foto hero slider homepage
    ├── categories/                    # Foto tiap kategori layanan
    ├── vendors/                       # Foto vendor populer
    ├── about/                         # Foto halaman about
    ├── team/                          # Foto tim
    └── trust/                         # Foto trust section
```

---

## Database Schema

### Tabel Utama

```sql
-- Enum types
CREATE TYPE booking_status AS ENUM (
  'pending', 'confirmed', 'waiting_payment',
  'dp_verified', 'completed', 'rejected', 'cancelled'
);
CREATE TYPE availability_status AS ENUM ('available', 'full', 'off');
CREATE TYPE user_role AS ENUM ('user', 'vendor', 'admin');
```

| Tabel | Deskripsi |
|---|---|
| `user_profiles` | Data profil pengguna (sync dari `auth.users` via trigger) |
| `vendor_profiles` | Data toko vendor: kategori, kota, rating, status verifikasi |
| `services` | Paket layanan per vendor dengan harga min-max |
| `bookings` | Transaksi booking user ↔ vendor dengan status lifecycle |
| `availability_blocks` | Kalender ketersediaan vendor per tanggal |
| `reviews` | Ulasan & rating user setelah booking selesai |
| `bookmarks` | Daftar vendor yang di-save oleh user |

### Relasi Kunci

```
auth.users (Supabase)
    │ trigger: handle_new_user()
    ▼
user_profiles ──── 1:1 ──── vendor_profiles
                                 │
                          1:N ──┤├── 1:N ── services
                                │
                          1:N ──┘
                          bookings ── N:1 ── services
                              │
                        1:1 ──┘
                          reviews
```

### Trigger Otomatis

- **`on_auth_user_created`** — Saat user baru daftar, otomatis insert row ke `user_profiles` dengan data dari `raw_user_meta_data` (full_name, avatar_url dari OAuth)
- **`trg_update_vendor_rating`** — Setiap INSERT atau UPDATE di tabel `reviews`, kalkulasi ulang `rating_avg` dan `review_count` di `vendor_profiles`

### Row Level Security (RLS)

Semua tabel menggunakan RLS. Policy utama:

| Tabel | Kebijakan |
|---|---|
| `user_profiles` | User hanya bisa UPDATE profil sendiri |
| `vendor_profiles` | Read publik untuk vendor aktif, update hanya pemilik |
| `services` | Read publik, write hanya vendor pemilik |
| `bookings` | User lihat booking sendiri, vendor lihat booking ke toko mereka |
| `reviews` | Read publik, create/update hanya penulis |
| `bookmarks` | Private per user |

---

## API Reference

> Base URL: `/api/v1`
> Semua response menggunakan format: `{ success: boolean, data?: T, error?: string }`

### Auth

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `POST` | `/auth/register` | ❌ | Daftar akun baru |
| `POST` | `/auth/login` | ❌ | Login email & password |
| `POST` | `/auth/logout` | ✅ | Logout & clear session |
| `GET` | `/auth/me` | ✅ | Profil user + data vendor (jika ada) |
| `PATCH` | `/auth/me` | ✅ | Update profil + upload avatar |
| `GET` | `/auth/google` | ❌ | Redirect ke Google OAuth |

**Register** `POST /auth/register`
```json
// Request body
{ "email": "user@mail.com", "password": "min8char", "full_name": "Nama Lengkap" }

// Response 201
{ "success": true, "data": { "user": { "id": "uuid", "email": "...", "full_name": "..." }, "session": null, "message": "Cek email untuk verifikasi." } }
```

**Login** `POST /auth/login`
```json
// Request body
{ "email": "user@mail.com", "password": "password123" }

// Response 200
{ "success": true, "data": { "user": { "id": "...", "role": "user" }, "session": { "access_token": "...", "expires_at": 1234567890 } } }
```

**Update Profil + Avatar** `PATCH /auth/me`
```
// Content-Type: multipart/form-data
avatar_file: <File>    // jpg/png/webp, maks 2MB
full_name: "Nama Baru" // opsional
phone: "+628123456789" // opsional

// Atau Content-Type: application/json
{ "full_name": "Nama Baru", "phone": "+628123456789" }
```

---

### Vendor

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `POST` | `/vendors` | ✅ user | Daftar toko vendor (upload KTP + selfie) |
| `GET` | `/vendors/:id` | ❌ | Detail vendor + layanan + 10 ulasan terbaru |
| `GET` | `/vendors/:id/services` | ❌ | List layanan aktif vendor |
| `POST` | `/vendors/:id/services` | ✅ vendor | Tambah layanan baru |
| `PATCH` | `/vendors/:id/services/:sid` | ✅ vendor | Edit layanan (partial update) |
| `DELETE` | `/vendors/:id/services/:sid` | ✅ vendor | Soft delete layanan |
| `GET` | `/vendors/:id/availability` | ❌ | Kalender ketersediaan bulan tertentu |
| `PATCH` | `/vendors/:id/availability` | ✅ vendor | Set tanggal available/blocked |

**Onboarding Vendor** `POST /vendors`
```
// Content-Type: multipart/form-data
store_name: "Melody Aura Sound"
category: "Sound System"
whatsapp_number: "+6281234567890"
city: "Jakarta"
description: "Deskripsi toko..." (opsional)
address: "Jl. Sudirman No. 1" (opsional)
ktp_file: <File>     // jpg/png/webp/pdf, maks 5MB
selfie_file: <File>  // jpg/png/webp, maks 5MB
```

**Tambah Layanan** `POST /vendors/:id/services`
```json
{
  "name": "Paket Sound System Premium",
  "category": "Sound System",
  "price_min": 15000000,
  "price_max": 25000000,
  "unit": "event",
  "description": "Termasuk mixer, speaker aktif 2000W, microphone wireless 4 pcs."
}
```

---

### Search

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `GET` | `/search` | ❌ | Cari & filter vendor |

**Query Parameters:**

| Param | Type | Default | Keterangan |
|---|---|---|---|
| `q` | string | — | Kata kunci nama vendor |
| `category` | string | — | Filter kategori |
| `city` | string | — | Filter kota (case-insensitive) |
| `price_min` | number | — | Harga minimal layanan |
| `price_max` | number | — | Harga maksimal layanan |
| `rating_min` | 1–5 | — | Rating minimal vendor |
| `date` | YYYY-MM-DD | — | Hanya tampilkan vendor available di tanggal ini |
| `sort` | `rating\|price_asc\|price_desc\|newest` | `rating` | Urutan hasil |
| `page` | number | 1 | Halaman pagination |
| `per_page` | number | 12 | Jumlah per halaman (maks 50) |

> **Catatan implementasi:** Price filter dilakukan via subquery ke tabel `services` sebelum main query — sehingga `total` dan `total_pages` selalu akurat. Sort harga menggunakan aplikasi-level sort setelah filter DB untuk menghindari limitasi PostgREST.

---

### Booking

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `POST` | `/bookings` | ✅ user | Buat booking baru |
| `GET` | `/bookings` | ✅ | List booking (user/vendor sesuai role) |
| `GET` | `/bookings/:id` | ✅ | Detail booking |
| `PATCH` | `/bookings/:id/confirm` | ✅ vendor | Konfirmasi booking |
| `PATCH` | `/bookings/:id/reject` | ✅ vendor | Tolak booking |
| `PATCH` | `/bookings/:id/cancel` | ✅ user | Batalkan booking (hanya saat `pending`) |
| `POST` | `/bookings/:id/proof` | ✅ user | Upload bukti DP |
| `PATCH` | `/bookings/:id/verify-payment` | ✅ vendor | Verifikasi/klarifikasi DP |
| `PATCH` | `/bookings/:id/complete` | ✅ vendor | Tandai event selesai |

**Status Lifecycle Booking:**

```
[User buat booking]
        │
     pending  ──── vendor reject ──→  rejected
        │
  vendor confirm
        │
    confirmed  ─── user cancel ──→  cancelled
        │
  (user upload DP)
        │
  waiting_payment
        │
  vendor verify DP
        │
   dp_verified
        │
  vendor complete
        │
    completed
        │
  (user bisa review)
```

**Buat Booking** `POST /bookings`
```json
{
  "vendor_id": "uuid",
  "service_id": "uuid",
  "event_date": "2025-12-25",
  "event_name": "Wedding Ceremony Andi & Sari",
  "event_location": "Ballroom Hotel Grand, Jakarta Selatan",
  "setup_time": "07:00",
  "notes": "Mohon hadir H-1 untuk survey lokasi."
}
```

**Query Params GET /bookings:**

| Param | Nilai | Keterangan |
|---|---|---|
| `role` | `user` \| `vendor` | Override role filter (default: role dari session) |
| `status` | booking_status | Filter status tertentu |
| `page` | number | Halaman |
| `per_page` | number | Maks 50 |

---

### Reviews

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `POST` | `/reviews` | ✅ user | Buat ulasan (booking harus `completed`) |
| `PATCH` | `/reviews/:id` | ✅ user | Edit ulasan sendiri |
| `DELETE` | `/reviews/:id` | ✅ user | Hapus ulasan (trigger recalculate rating) |
| `GET` | `/reviews/vendor/:vendorId` | ❌ | Semua ulasan milik vendor |

**Buat Ulasan** `POST /reviews`
```json
{
  "booking_id": "uuid",
  "rating": 5,
  "comment": "Vendor sangat profesional, sound system berkualitas tinggi!"
}
```

---

### Admin

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `GET` | `/admin/vendors` | ✅ admin | List vendor pending verifikasi |
| `PATCH` | `/admin/vendors/:id` | ✅ admin | Approve atau reject vendor |
| `GET` | `/admin/users` | ✅ admin | List semua pengguna |

**Approve/Reject Vendor** `PATCH /admin/vendors/:id`
```json
// Approve
{ "action": "approve" }

// Reject
{ "action": "reject", "reason": "Foto KTP tidak jelas, mohon upload ulang." }
```

---

## Alur Bisnis

### Alur Pengguna (Klien)

```
Daftar/Login
    │
Browse & filter vendor (/search)
    │
Pilih vendor & lihat detail (/vendor/[id])
    │
Klik "Minta Penawaran" → Isi form booking
    │
Tunggu konfirmasi vendor (status: pending → confirmed)
    │
Upload bukti DP
    │
Vendor verifikasi DP (status: dp_verified) → Tanggal terkunci
    │
Hari H — event berlangsung
    │
Vendor tandai selesai (status: completed)
    │
User beri ulasan & rating (1–5 bintang)
```

### Alur Vendor

```
Daftar toko (/vendor/register)
    │ Upload KTP + selfie
    │
Menunggu verifikasi admin (1–2 hari kerja)
    │
Toko aktif → Tambah layanan & paket (/vendor/services)
    │
Terima notifikasi booking baru (/vendor/bookings)
    │
Konfirmasi atau tolak booking
    │
Verifikasi bukti DP klien
    │
Tandai event selesai setelah hari H
    │
Terima ulasan dari klien
```

### Alur Admin

```
Login sebagai admin
    │
Lihat antrian vendor pending (/admin/vendors)
    │
Review KTP + selfie vendor
    │
Approve (toko aktif) atau Reject (dengan alasan)
    │
Vendor mendapat notifikasi via WhatsApp
```

---

## Instalasi & Setup

### Prerequisites

- Node.js `18+`
- npm atau yarn
- Akun [Supabase](https://supabase.com) (free tier cukup untuk development)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/findor.git
cd findor
npm install
```

### 2. Setup Environment Variables

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Jalankan Database Migration

Buka **Supabase Dashboard → SQL Editor**, lalu jalankan file berikut secara berurutan:

```bash
# File 1 — Schema utama
supabase/migrations/001_initial_schema.sql

# File 2 — Storage bucket avatars
supabase/migrations/003_avatars_storage.sql
```

### 4. Setup Storage Buckets

Di **Supabase Dashboard → Storage**, buat 2 bucket berikut secara manual:

| Bucket Name | Public | File Size Limit | MIME Types yang Diizinkan |
|---|---|---|---|
| `vendor-docs` | ❌ Private | 5 MB | `image/jpeg, image/png, image/webp, application/pdf` |
| `booking-proofs` | ❌ Private | 10 MB | `image/jpeg, image/png, image/webp, application/pdf` |

> Bucket `avatars` sudah dibuat otomatis saat migration `003_avatars_storage.sql` dijalankan.

### 5. Setup Auth Supabase

Di **Supabase Dashboard → Authentication → Providers:**

**Email/Password:**
- Enable: ✅
- Confirm email: sesuai kebutuhan (disable untuk development)

**Google OAuth:**
1. Buat project di [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google OAuth API
3. Buat OAuth 2.0 Client ID
4. Isi authorized redirect URI: `https://xxxxx.supabase.co/auth/v1/callback`
5. Copy Client ID & Secret ke Supabase → Auth → Google Provider

**URL Settings (Auth → URL Configuration):**
```
Site URL: http://localhost:3000
Redirect URLs: http://localhost:3000/auth/callback
```

### 6. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

### 7. (Opsional) Buat Akun Admin

Setelah daftar user biasa, jalankan query ini di Supabase SQL Editor untuk upgrade ke admin:

```sql
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'admin@email-kamu.com';
```

---

## Environment Variables

| Variable | Required | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Project URL dari Supabase Dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Anon/public key (aman untuk client) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key — **rahasia, server-only!** Jangan expose ke client |
| `NEXT_PUBLIC_APP_URL` | ✅ | URL aplikasi (untuk OAuth callback redirect) |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` digunakan hanya di `lib/supabase/admin.ts` untuk operasi admin yang bypass RLS. **Jangan pernah gunakan di komponen client-side.**

---

## Storage Buckets

| Bucket | Visibilitas | Digunakan untuk | Siapa yang upload |
|---|---|---|---|
| `avatars` | 🌐 Public | Foto profil pengguna | User (dirinya sendiri) |
| `vendor-docs` | 🔒 Private | KTP + selfie verifikasi vendor | User saat onboarding vendor |
| `booking-proofs` | 🔒 Private | Bukti transfer DP | User setelah booking dikonfirmasi |

**Struktur path file:**

```
avatars/
  └── {user_id}/avatar-{timestamp}.{ext}

vendor-docs/
  └── {user_id}/
      ├── ktp-{timestamp}.{ext}
      └── selfie-{timestamp}.{ext}

booking-proofs/
  └── {booking_id}/dp-{timestamp}.{ext}
```

---

## Middleware & Route Protection

File `middleware.ts` di root project melindungi semua route berdasarkan status login dan role.

| Route Group | Kondisi | Redirect jika gagal |
|---|---|---|
| `/login`, `/register` | Harus **belum login** | → `/dashboard` |
| `/dashboard`, `/bookings`, `/bookmarks`, `/profile` | Harus **login** | → `/login?redirect=...` |
| `/vendor/dashboard`, `/vendor/services`, dll | Harus login **dan** `role = vendor` | Bukan vendor → `/vendor/register`; belum login → `/login?redirect=...` |
| `/admin`, `/admin/**` | Harus login **dan** `role = admin` | → `/dashboard` |
| `/api/v1/admin/**` | Harus login **dan** `role = admin` | → `401` atau `403` JSON |

---

## Halaman Frontend

| Route | Komponen | Auth | Deskripsi |
|---|---|---|---|
| `/` | `app/page.tsx` | ❌ | Homepage dengan hero slider 3 slide, kategori, vendor populer, trust section |
| `/search` | `app/(main)/search/page.tsx` | ❌ | Browse vendor dengan filter real-time |
| `/vendor/[id]` | `app/(main)/vendor/[id]/page.tsx` | ❌ | Detail vendor: galeri, paket, peta Leaflet, ulasan |
| `/how-it-works` | `app/(main)/how-it-works/page.tsx` | ❌ | Cara kerja platform |
| `/about` | `app/(main)/about/page.tsx` | ❌ | Tentang tim Findor |
| `/login` | `app/(auth)/login/page.tsx` | ❌ | Form login + Google OAuth |
| `/register` | `app/(auth)/register/page.tsx` | ❌ | Form register user baru |
| `/dashboard` | `app/(user)/dashboard/page.tsx` | ✅ | Ringkasan booking aktif & vendor tersimpan |
| `/bookings` | `app/(user)/bookings/page.tsx` | ✅ | Daftar booking + upload bukti DP |
| `/bookmarks` | `app/(user)/bookmarks/page.tsx` | ✅ | Vendor favorit |
| `/profile` | `app/(user)/profile/page.tsx` | ✅ | Edit profil + ganti avatar |
| `/vendor/register` | `app/(vendor)/vendor/register/page.tsx` | ✅ | Wizard 3-step daftar vendor |
| `/vendor/dashboard` | `app/(vendor)/vendor/dashboard/page.tsx` | ✅ vendor | Dashboard statistik toko |
| `/vendor/bookings` | `app/(vendor)/vendor/bookings/page.tsx` | ✅ vendor | Kelola booking: konfirmasi, tolak, verif DP |
| `/vendor/services` | `app/(vendor)/vendor/services/page.tsx` | ✅ vendor | CRUD katalog layanan |
| `/vendor/availability` | `app/(vendor)/vendor/availability/page.tsx` | ✅ vendor | Kalender ketersediaan |
| `/vendor/analytics` | `app/(vendor)/vendor/analytics/page.tsx` | ✅ vendor | Statistik performa |
| `/admin/vendors` | `app/(admin)/admin/vendors/page.tsx` | ✅ admin | Approve/reject pendaftaran vendor |
| `/admin/users` | `app/(admin)/admin/users/page.tsx` | ✅ admin | Manajemen pengguna |

---

## Scripts

```bash
# Development
npm run dev

# Build production
npm run build

# Start production server
npm run start

# Lint
npm run lint
```

---

## Kontributor

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="public/team/arga.jpg" width="80" style="border-radius:50%" /><br/>
        <b>Arga</b><br/>
        <sub>Backend Developer</sub>
      </td>
      <td align="center">
        <img src="public/team/bayu.jpg" width="80" style="border-radius:50%" /><br/>
        <b>Bayu</b><br/>
        <sub>Frontend Developer</sub>
      </td>
      <td align="center">
        <img src="public/team/raffi.jpg" width="80" style="border-radius:50%" /><br/>
        <b>Raffi</b><br/>
        <sub>UI/UX Designer</sub>
      </td>
      <td align="center">
        <img src="public/team/rey.jpg" width="80" style="border-radius:50%" /><br/>
        <b>Rey</b><br/>
        <sub>Product Manager</sub>
      </td>
    </tr>
  </table>
</div>

---

<div align="center">
  <img src="public/logo-icon.png" width="48" />
  <br/>
  <p><sub>© 2024 Findor — The Curated Gallery for Premium Events</sub></p>
  <p><sub>Dibangun dengan ❤️ menggunakan Next.js & Supabase</sub></p>
</div>