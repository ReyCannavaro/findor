# Findor — Backend Setup Guide

## Prerequisites
- Node.js 18+
- Supabase project (sudah ada)

---

## 1. Clone & Install

```bash
npm install
```

## 2. Environment Variables

Copy `.env.local` dan isi dengan kredensial Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=        # Project URL di Supabase Dashboard
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # anon/public key
SUPABASE_SERVICE_ROLE_KEY=       # service_role key (rahasia, server-only)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3. Database Migration

Jalankan file SQL berikut di **Supabase Dashboard → SQL Editor**:

```
supabase/migrations/001_initial_schema.sql
```

Urutan: jalankan sekali dari atas ke bawah. Semua tabel, RLS, trigger sudah ada di satu file.

## 4. Storage Buckets

Di **Supabase Dashboard → Storage**, buat 3 bucket:

| Bucket Name       | Public? | Keterangan                          |
|-------------------|---------|-------------------------------------|
| `vendor-docs`     | ❌ No   | KTP + selfie verifikasi vendor      |
| `booking-proofs`  | ❌ No   | Bukti transfer DP                   |
| `vendor-portfolio`| ✅ Yes  | Foto portofolio vendor (galeri)     |

## 5. Auth Settings (Supabase Dashboard → Auth)

- Enable **Email/Password** provider
- Enable **Google OAuth** provider (isi Client ID & Secret dari Google Cloud)
- Set **Site URL**: `http://localhost:3000`
- Tambah **Redirect URL**: `http://localhost:3000/auth/callback`

## 6. Run Dev Server

```bash
npm run dev
```

---

## Struktur Direktori Backend

```
findor/
├── app/
│   ├── api/v1/
│   │   ├── bookings/          # POST (buat), GET (list)
│   │   │   └── [id]/
│   │   │       ├── route.ts   # GET detail
│   │   │       ├── confirm/   # PATCH — vendor konfirmasi
│   │   │       ├── reject/    # PATCH — vendor tolak
│   │   │       ├── cancel/    # PATCH — user batalkan
│   │   │       ├── proof/     # POST — upload bukti DP
│   │   │       ├── verify-payment/  # PATCH — vendor verif DP
│   │   │       └── complete/  # PATCH — vendor tandai selesai
│   │   ├── reviews/
│   │   │   ├── route.ts       # POST buat ulasan
│   │   │   ├── [id]/route.ts  # PATCH edit ulasan
│   │   │   └── vendor/[vendorId]/route.ts  # GET list ulasan vendor
│   │   ├── search/route.ts    # GET search & filter vendor
│   │   ├── bookmarks/route.ts # GET list, POST toggle
│   │   └── vendors/[id]/
│   │       ├── route.ts       # GET detail vendor
│   │       └── availability/route.ts  # GET kalender, PATCH set off/on
│   ├── (auth)/login|register|callback/
│   ├── (main)/search|vendor/[id]/
│   ├── (user)/dashboard|bookings|bookmarks|profile/
│   ├── (vendor)/vendor/dashboard|services|bookings|availability|analytics/
│   └── (admin)/admin/vendors|users/
├── lib/
│   ├── supabase/
│   │   ├── client.ts   # Browser client
│   │   ├── server.ts   # Server client (SSR/API routes)
│   │   └── admin.ts    # Admin client (bypass RLS)
│   ├── validators/index.ts   # Zod schemas semua endpoint
│   └── utils/api.ts          # Response helpers (ok, badRequest, dll)
├── types/index.ts            # TypeScript types lengkap
├── middleware.ts             # Session refresh + route protection
└── supabase/migrations/
    └── 001_initial_schema.sql  # Full schema: tabel, RLS, trigger
```

---

## Urutan Pengerjaan Backend (Step by Step)

| Step | Modul                  | File Utama                              |
|------|------------------------|-----------------------------------------|
| ✅ 1  | Project setup          | Struktur direktori selesai              |
| ⬜ 2  | Auth                   | `app/api/v1/auth/` + callback route     |
| ⬜ 3  | Vendor Onboarding      | `app/api/v1/vendors/` POST + upload KTP |
| ⬜ 4  | Search & Filter        | `app/api/v1/search/route.ts`            |
| ⬜ 5  | Booking System         | `app/api/v1/bookings/` semua sub-route  |
| ⬜ 6  | Upload Bukti DP        | `app/api/v1/bookings/[id]/proof/`       |
| ⬜ 7  | Rating & Ulasan        | `app/api/v1/reviews/`                   |
| ⬜ 8  | Availability Calendar  | `app/api/v1/vendors/[id]/availability/` |
| ⬜ 9  | Bookmarks              | `app/api/v1/bookmarks/`                 |
| ⬜ 10 | Admin Panel            | Admin approve/reject vendor             |
