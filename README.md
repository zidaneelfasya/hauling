# Hauling Management System (HMS)

HMS adalah sistem ERP dan Fleet Management System (FMS) siap pakai yang dirancang khusus untuk operator/vendor hauling tambang nikel di Indonesia (pomalaa, Morowali, Kolaka, Halmahera). 

Sistem ini membantu mengotomatisasi pencatatan ritase angkutan nikel, monitoring utilisasi unit dump truck (DT), manajemen driver, log pengisian BBM, maintenance unit, payroll gaji driver berbasis trip, hingga penagihan invoice pelanggan lengkap dengan ekspor berkas PDF dan rekap analisis profit harian/bulanan/tahunan secara real-time.

---

## Fitur Utama & Modul Sistem

### 1. Dashboard Kinerja Operasional & Rekap Profit
Dashboard ini dirancang untuk memberikan visibilitas penuh bagi manajemen (Admin/Owner) mengenai pendapatan dan pengeluaran aktual operasional tambang dengan filter tanggal, bulan, atau tahun secara dinamis:
- **Rekap Harian:** Menampilkan volume hauling (Ritase/Tonase), Pendapatan kotor, HPP Harian (BBM + Gaji Supir per trip), Profit kotor, serta log audit rincian perjalanan harian yang disetujui (*Approved*).
- **Rekap Bulanan & Tahunan:** Menyediakan analisis *cashflow* riil. Selain Pendapatan dan HPP, dashboard mengalkulasi **Biaya Pengeluaran Riil (Actual Expenses)** yang mencakup:
  - Gaji Supir aktual (yang sudah dibayarkan/payroll).
  - Pembelian BBM solar riil (dari log transaksi BBM).
  - Biaya perawatan/service selesai (dari log maintenance *Completed*).
  - Biaya sewa unit dump truck bulanan (dihitung proporsional dari kontrak unit: `biaya_sewa / durasi_sewa_bulan`).
  - **Profit Bersih Riil:** `Pendapatan - Pengeluaran Riil`.
- **Grafik Interaktif:** Visualisasi perbandingan harian (pendapatan vs HPP vs pembelian BBM) dan tren bulanan (pendapatan vs biaya riil vs profit bersih) menggunakan Recharts, serta diagram porsi pengeluaran operasional.

> [!NOTE]
> Untuk penjelasan detail mengenai rumus matematika, logika pemrograman, dan simulasi alur keuangan yang menghasilkan angka-angka di atas, silakan baca **[Panduan Perhitungan Dashboard](file:///c:/Users/zidane/OneDrive/Documents/GitHub/hauling/README_DASHBOARD_CALCULATIONS.md)**.

### 2. Modul Kontrak Hauling (Master Data)
- Skema hauling menggunakan kontrak berbasis tarif per trip (ritase) dan tonase nikel.
- Mengeliminasi parameter finansial statis lama (nilai kontrak tahunan, target margin, budget operasional) dari database untuk fokus pada profitabilitas aktual berbasis volume pengiriman riil.
- Pengaturan unit armada dan supir yang ditugaskan (*assigned*) ke masing-masing kontrak.

### 3. Log Ritase Tambang (Shipment Logs)
- **Validasi Kontrak yang Ketat:** Saat mencatat ritase baru, admin/supervisor harus memilih Kontrak terlebih dahulu. Pilihan Unit Dump Truck dan Driver akan **otomatis difilter** hanya menampilkan unit/driver yang terdaftar pada kontrak tersebut guna mencegah inkonsistensi data.
- **Intersepsi Interaktif:** Jika pengguna mencoba mengklik dropdown Unit atau Driver sebelum memilih Kontrak, dropdown akan tetap tertutup dan sistem menampilkan notifikasi peringatan (*Warning Toast*).
- **Penghitungan HPP Per Ritase:** Di dalam modal detail ritase, sistem menghitung biaya aktual per perjalanan (*HPP per Ritase*), dihitung dari total HPP (`biaya_bbm + (jumlah_ritase * Rp50.000)`) dibagi jumlah ritase perjalanan.
- **Pemasukan per-Rit:** Input nilai tarif pemasukan per ritase perjalanan yang dikalikan dengan jumlah ritase untuk menampilkan kolom **Pendapatan** di tabel utama.

### 4. Payroll Gaji Supir Berbasis Trip (Trip-Based Payroll)
- Gaji driver dikalkulasi berbasis perjalanan (Rp50.000 per ritase yang disetujui).
- **Otomatisasi Database Trigger:**
  - **`tr_ritase_accumulated_update`:** Saat data ritase disetujui (*Status: Approved*) oleh supervisor, database otomatis menambah nilai `accumulated_ritase` di profil driver yang bersangkutan.
  - **`tr_payroll_paid_reset`:** Ketika slip gaji driver diubah statusnya menjadi **Paid (Lunas)**, database otomatis me-reset jumlah saldo trip supir (`accumulated_ritase`) kembali ke **0** untuk bulan berikutnya.
- Fitur **Auto-Pull** di form payroll memudahkan admin memuat jumlah ritase aktif yang belum dibayar milik driver secara instan langsung dari database.

### 5. Log BBM Solar & Perawatan Unit (Maintenance)
- Pencatatan log BBM solar mencakup volume (liter), harga per liter, lokasi pengisian, dan kalkulasi biaya otomatis.
- Pencatatan log perawatan unit mencakup jenis servis (ganti oli, ban, perbaikan mesin), vendor bengkel, odometer kilometer unit, status pengerjaan (*Scheduled*, *In Progress*, *Completed*), dan rincian biaya.

### 6. Invoice & Penagihan Customer
- Pembuatan draf tagihan untuk customer berdasarkan data periode hauling kontrak.
- Dilengkapi export PDF instan (*jsPDF client-side*) yang menghasilkan dokumen faktur invoice profesional lengkap dengan status pembayaran (Lunas / Terutang).

---

## Akses Keamanan Pengguna (RBAC)

Aplikasi memiliki pembatasan hak akses berbasis peran (**Role Based Access Control**):
- **Owner & Full Access / Admin:** Hak akses penuh untuk melihat rekap profit, mengelola unit, supir, menyetujui log BBM/Maintenance, membuat slip payroll, dan menerbitkan invoice penagihan.
- **Supervisor:** Menyetujui (*Approve*) atau menolak (*Reject*) draf ritase driver, serta mengubah status perbaikan maintenance unit.
- **Driver:** Mencatat ritase harian baru (tersimpan sebagai Draft) dan melihat data slip gaji pribadi mereka sendiri secara aman.

*Sistem Auto-Bootstrapping:* Pengguna pertama yang melakukan Sign Up di sistem akan otomatis mendapatkan peran **Owner**, sedangkan pendaftar berikutnya akan mendapatkan peran default **Driver**.

---

## Usability & Pengalaman Pengguna (UX)

- **Hapus Spinner Input Angka:** Semua input angka dihilangkan tombol panah atas-bawahnya (*spinners*) secara global menggunakan CSS agar tata letak input tetap rapi.
- **Bebas dari Angka 0 yang Mengunci:** State input numerik disimpan sebagai string sehingga pengguna dapat menghapus/mengosongkan (*backspace*) kolom input hingga bersih tanpa meninggalkan angka `0` yang mengganggu saat diketik ulang.

---

## Teknologi yang Digunakan

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Radix UI Primitives, React Hook Form, TanStack Table, Recharts, Lucide Icons.
- **State Management:** React Query (TanStack Query) client cache.
- **Backend:** Next.js Server Actions & Route Handlers.
- **Database & Auth:** Supabase PostgreSQL & Auth (dengan Row Level Security / RLS aktif pada seluruh tabel).
- **PDF Exporter:** Client-side jsPDF.

---

## Cara Install & Setup Lokal

### 1. Instalasi Dependensi
Jalankan perintah berikut di terminal komputer Anda:
```bash
npm install --legacy-peer-deps
```

### 2. Setup Environment (.env)
Buat berkas `.env` di root direktori proyek dan isi kredensial proyek Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-anon-key>
```

### 3. Migrasi Database (Setup Schema & Seeder)
Buka menu **SQL Editor** di Dashboard Supabase Anda, kemudian jalankan isi berkas SQL berikut secara berurutan:
1. **`supabase/schema.sql`**: Membuat seluruh tabel database, index performa, trigger sinkronisasi `updated_at`, trigger kalkulasi saldo ritase driver, dan mengaktifkan RLS.
2. **`supabase/seed.sql`**: Mengisi data awal operasional tambang nikel yang realistis ( armada unit DT, data driver, ritase log, BBM log, log maintenance, slip payroll, dan invoice customer).

---

## Cara Menjalankan Aplikasi

Jalankan perintah berikut untuk memulai server development lokal:
```bash
npm run dev
```
Buka browser Anda dan akses [http://localhost:3000](http://localhost:3000). 
- Lakukan **Sign Up** untuk akun pertama Anda agar otomatis terdaftar sebagai **Owner** dan dapat menguji seluruh alur kerja operasional.
