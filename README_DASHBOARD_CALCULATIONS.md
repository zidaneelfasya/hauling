# Panduan Perhitungan Dashboard Hauling Management System (HMS)

Dokumen ini menjelaskan secara rinci bagaimana metrik finansial dan operasional pada **Dashboard Eksekutif** dihitung, rumus matematika yang digunakan oleh sistem, serta contoh simulasi angka berdasarkan data seeder.

---

## 1. Ringkasan Metrik KPI Utama

Dashboard Eksekutif menampilkan 4 kartu KPI utama yang dihitung secara dinamis berdasarkan filter **Kontrak Kerja** dan **Periode Rekap** (Harian, Bulanan, atau Tahunan):

| Nama Metrik | Tampilan Dashboard | Deskripsi | Sumber Data Database |
| :--- | :--- | :--- | :--- |
| **Pendapatan** | `Pendapatan` | Akumulasi pendapatan kotor dari volume hauling | Tabel `ritase` (Status: *Approved*) |
| **Laba Bersih Estimasi** | `Laba Bersih Estimasi` | Estimasi keuntungan bersih setelah dikurangi HPP dan OpEx | Tabel `ritase`, `maintenance`, `unit`, `pengeluaran_operasional` |
| **Saldo Kas Riil** | `Saldo Kas Riil` | Arus kas bersih nyata yang tersimpan di sistem kas/rekening | Tabel `cash_flow` (Pemasukan vs Pengeluaran) |
| **Total Ritase (Trips)** | `Total Ritase (Trips)` | Total perjalanan hauling yang berhasil diselesaikan | Tabel `ritase` (Status: *Approved*) |

---

## 2. Rumus dan Algoritma Perhitungan Finansial

Sistem mengadopsi dua pendekatan akuntansi:
1. **Accrual Basis (Metrik Profitabilitas):** Untuk menghitung performa bisnis berjalan (Omset, HPP, OpEx, Net Profit).
2. **Cash Basis (Metrik Cash Flow):** Untuk memantau pergerakan uang tunai yang sesungguhnya (Cash In, Cash Out, Cash Balance).

---

### A. Pendapatan (Revenue)
Dihitung dari seluruh pengiriman ritase yang telah disetujui (*Approved*) dalam periode filter:
$$\text{Pendapatan} = \sum (\text{Jumlah Ritase} \times \text{Tarif Per Ritase})$$
- *Kode implementasi:* `Number(r.jumlah_ritase) * Number(r.tarif_per_ritase)`

---

### B. Biaya Langsung / Harga Pokok Penjualan (HPP Direct)
Merupakan pengeluaran yang berbanding lurus dengan jumlah trip hauling:
1. **Gaji Supir (HPP):** Dihitung flat Rp50.000 per ritase perjalanan.
   $$\text{Gaji Supir HPP} = \text{Jumlah Ritase} \times 50.000$$
2. **Konsumsi BBM (HPP):** Diambil langsung dari kolom `biaya_bbm` pada log ritase yang bersangkutan.
   $$\text{Biaya BBM HPP} = \text{Volume Liter} \times \text{Harga Per Liter}$$
3. **Total HPP:**
   $$\text{Total HPP Direct} = \text{Gaji Supir HPP} + \text{Biaya BBM HPP}$$

---

### C. Laba Kotor (Gross Profit)
Keuntungan kotor sebelum dikurangi biaya overhead kantor dan pemeliharaan alat berat:
$$\text{Laba Kotor (Gross Profit)} = \text{Pendapatan} - \text{Total HPP Direct}$$

---

### D. Biaya Operasional (Operating Expenses / OpEx)
Biaya tidak langsung untuk menjaga armada dump truck tetap berjalan:
1. **Biaya Perawatan (Maintenance Cost):** Total pengeluaran dari servis unit yang sudah selesai (*Completed*) dalam periode terpilih.
   $$\text{Biaya Maintenance} = \sum (\text{Biaya Servis dari tabel } \texttt{maintenance})$$
2. **Biaya Sewa Unit Ter-Prorata (Prorated Rent Cost):**
   Biaya sewa dump truck dihitung berdasarkan durasi hari dalam periode terpilih agar nilainya proporsional:
   - **Sewa Bulanan per Unit:** `biaya_sewa / durasi_sewa_bulan` (dari tabel `unit`).
   - **Jika rekap Harian (1 Hari):**
     $$\text{Biaya Sewa Harian} = \frac{\text{Sewa Bulanan}}{30}$$
   - **Jika rekap Bulanan (26 - 31 Hari):** Menggunakan nilai sewa bulanan penuh.
   - **Jika rekap Lainnya:**
     $$\text{Biaya Sewa Prorata} = \frac{\text{Sewa Bulanan} \times \text{Jumlah Hari Periode}}{30}$$
3. **Overhead Kantor/Korporat (Operational Overhead):**
   Diambil dari tabel `pengeluaran_operasional` (hanya dihitung ketika memilih filter *Semua Kontrak*).
4. **Total OpEx:**
   $$\text{Total OpEx} = \text{Biaya Maintenance} + \text{Biaya Sewa Prorata} + \text{Overhead Kantor}$$

---

### E. Laba Bersih Estimasi (Net Profit)
Sisa pendapatan bersih setelah memotong seluruh biaya langsung dan operasional:
$$\text{Laba Bersih Estimasi} = \text{Laba Kotor} - \text{Total OpEx}$$

---

### F. Arus Kas Riil & Saldo Kas (Cash Flow)
Berbeda dengan profitabilitas di atas, cash flow merekam pergerakan kas nyata di tabel `cash_flow`:
1. **Kas Masuk (Cash In):** Total transaksi bertipe `'Pemasukan'` pada periode filter (misal: pembayaran invoice pencairan dana dari customer).
2. **Kas Keluar (Cash Out):** Total transaksi bertipe `'Pengeluaran'` pada periode filter (misal: pembayaran payroll supir, pengisian tangki BBM solar industri, pelunasan invoice maintenance ke bengkel luar).
3. **Net Cash Flow:**
   $$\text{Net Cash Flow} = \text{Kas Masuk} - \text{Kas Keluar}$$
4. **Saldo Kas Riil (Cash Balance):**
   Saldo akhir berjalan yang dihitung secara kumulatif dari awal waktu hingga tanggal akhir periode terpilih:
   $$\text{Saldo Kas} = \sum_{\text{awal}}^{\text{tanggal\_akhir}} (\text{Pemasukan}) - \sum_{\text{awal}}^{\text{tanggal\_akhir}} (\text{Pengeluaran})$$

---

## 3. Simulasi & Contoh Perhitungan (Berdasarkan Custom Seeder)

Mari kita simulasikan perhitungan jika Anda menjalankan **1 data ritase** menggunakan `seed_custom_ritase` dengan parameter default berikut:
- **Jumlah Ritase:** 6 Rit
- **Tonase:** 90 Ton
- **Tarif/Rit:** Rp1.372.800
- **Volume BBM:** 150 Liter
- **Harga BBM:** Rp6.800 / Liter

### Langkah 1: Hitung Pendapatan (Revenue)
$$\text{Revenue} = 6 \text{ rit} \times \text{Rp}1.372.800 = \mathbf{\text{Rp}8.236.800}$$

### Langkah 2: Hitung HPP Direct
- **Gaji Driver HPP:** $6 \text{ rit} \times \text{Rp}50.000 = \text{Rp}300.000$
- **BBM HPP:** $150 \text{ liter} \times \text{Rp}6.800 = \text{Rp}1.020.000$
- **Total HPP:** $\text{Rp}300.000 + \text{Rp}1.020.000 = \mathbf{\text{Rp}1.320.000}$

### Langkah 3: Hitung Laba Kotor (Gross Profit)
$$\text{Gross Profit} = \text{Rp}8.236.800 - \text{Rp}1.320.000 = \mathbf{\text{Rp}6.916.800}$$

### Langkah 4: Hitung Biaya Operasional (OpEx)
Misalkan kita memfilter rekap secara **Harian** untuk 1 unit DT yang memiliki kontrak sewa Rp30.000.000 / bulan (durasi sewa 1 bulan):
- **Sewa Harian Unit:** $\text{Rp}30.000.000 / 30 = \text{Rp}1.000.000$
- **Maintenance:** Rp0 (tidak ada perawatan hari ini)
- **Overhead Kantor:** Rp0 (tidak ada biaya operasional luar)
- **Total OpEx Harian:** $\mathbf{\text{Rp}1.000.000}$

### Langkah 5: Hitung Laba Bersih Estimasi (Net Profit)
$$\text{Net Profit} = \text{Rp}6.916.800 - \text{Rp}1.000.000 = \mathbf{\text{Rp}5.916.800}$$

*Catatan: Inilah sebabnya sistem memunculkan angka profitabilitas tersebut pada dashboard Anda ketika filter harian dipilih.*
