# Hauling Management System (HMS)

HMS adalah sistem ERP dan Fleet Management System produksi (production-ready) yang dirancang khusus untuk vendor hauling tambang nikel di Indonesia (konteks operasional Morowali, Kolaka, Halmahera).

Sistem ini membantu mengotomatisasi pencatatan ritase angkutan nikel, monitoring status unit DT, pengelolaan driver dan reminder masa berlaku SIM, log pembelian BBM solar, maintenance unit, payroll gaji driver, hingga penerbitan invoice penagihan pelanggan lengkap dengan export PDF.

---

## Fitur Utama & Keamanan (RBAC)

Aplikasi memiliki pembatasan hak akses berbasis peran (**Role Based Access Control / RBAC**):
- **Owner & Full Access / Admin:** Mengelola seluruh data operasional, membuat slip payroll, dan menerbitkan invoice penagihan.
- **Supervisor:** Menyetujui (Approve) atau menolak (Reject) ritase driver, serta menyetujui log perbaikan maintenance unit.
- **Driver:** Mencatat ritase harian baru (tersimpan sebagai Draft) dan melihat data slip gaji pribadi mereka sendiri secara aman.

*Sistem Bootstrapping Otomatis:* User pertama yang melakukan pendaftaran akun (Sign Up) akan otomatis mendapatkan peran **Owner**, sedangkan pendaftar berikutnya akan default mendapatkan peran **Driver** (dapat diubah oleh Admin di tabel database).

---

## Teknologi yang Digunakan

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Radix UI Primitives, React Hook Form, TanStack Table, Recharts, Lucide Icons.
- **State Management:** React Query (TanStack Query) client cache.
- **Backend:** Next.js Server Actions & Route Handlers.
- **Database & Auth:** Supabase PostgreSQL & Auth (dengan Row Level Security / RLS aktif pada seluruh tabel).
- **PDF Exporter:** Client-side jsPDF.

---

## Cara Install & Setup Lokal

### 1. Kloning dan Instalasi Dependensi
Jalankan perintah berikut di terminal komputer Anda:
```bash
npm install --legacy-peer-deps
```

### 2. Setup Environment Variables (.env)
Buat file `.env` di root direktori proyek (salin dari `.env.example`) dan isi kredensial proyek Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-anon-key>
```

### 3. Migrasi Database (Setup Schema & Seeder)
Buka menu **SQL Editor** di Dashboard Supabase Anda, kemudian salin dan jalankan isi berkas SQL berikut secara berurutan:
1. **`supabase/schema.sql`**: Membuat seluruh tabel database, index performa, trigger sinkronisasi `updated_at`, fungsi otomatisasi pembuatan profil saat signup, serta mengaktifkan kebijakan keamanan RLS.
2. **`supabase/seed.sql`**: Mengisi data awal operasional yang realistis (20 Unit DT, 30 Driver, 200 data ritase nikel, 100 log BBM, 50 log maintenance, 30 slip payroll, dan 50 invoice customer).

---

## Cara Menjalankan Aplikasi

Jalankan perintah berikut untuk memulai server development lokal:
```bash
npm run dev
```
Buka browser Anda dan akses [http://localhost:3000](http://localhost:3000). 
- Halaman utama `/` akan otomatis mengalihkan Anda ke `/protected` yang memvalidasi otentikasi.
- Lakukan **Sign Up** akun pertama Anda untuk menjadi **Owner** sistem secara langsung dan dapat mengeksplorasi seluruh modul HMS.

---

## Panduan Deployment ke Vercel

Sistem ini didesain sepenuhnya agar kompatibel dengan Vercel:

1. Buat repositori baru di GitHub dan lakukan push codebase HMS Anda ke sana.
2. Masuk ke Dashboard Vercel dan buat proyek baru dengan mengimpor repositori GitHub tersebut.
3. Di bagian **Environment Variables**, tambahkan dua kunci berikut sesuai dengan konfigurasi Supabase Anda:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Klik **Deploy**. Vercel akan otomatis mendeteksi konfigurasi Next.js 15, melakukan build statis, dan menerbitkan web app produksi Anda.

*Catatan untuk URL Redirect:* Pastikan Anda menambahkan URL produksi Vercel Anda di panel dashboard **Supabase Auth -> Redirect URLs** agar callback login/signup berjalan lancar pada server production.
