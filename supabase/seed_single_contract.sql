-- Seeder file for single contract: PT Vale Indonesia Tbk (HK-2026-001)
-- Tailored with specific shipping rates, unit capacity (15T), rental costs (75M), and HPP values.

-- Clear existing data to ensure a clean single-contract database
TRUNCATE public.cash_flow, public.invoice, public.payroll, public.maintenance, public.bbm, public.ritase, public.driver, public.unit, public.kontrak_hauling, public.lokasi_loading, public.lokasi_dumping CASCADE;

-- 1. Seed Single Contract
INSERT INTO public.kontrak_hauling (id, kode_kontrak, perusahaan, tanggal_mulai, tanggal_selesai, jumlah_unit, status) VALUES
('a0000000-0000-0000-0000-000000000001', 'HK-2026-001', 'PT Vale Indonesia Tbk', '2026-01-01', '2026-12-31', 5, 'Aktif');

-- 2. Seed Locations
INSERT INTO public.lokasi_loading (id, nama_lokasi) VALUES
('b0000000-0000-0000-0000-000000000001', 'Pit Sorowako Barat'),
('b0000000-0000-0000-0000-000000000002', 'Pit Sorowako Timur');

INSERT INTO public.lokasi_dumping (id, nama_lokasi) VALUES
('c0000000-0000-0000-0000-000000000001', 'Jetty Sorowako'),
('c0000000-0000-0000-0000-000000000002', 'Stockpile Sorowako');

-- 3. Seed Units (5 China Fleet Dump Trucks linked to PT Vale, 15 Ton, Rental 75M)
INSERT INTO public.unit (id, kode_unit, nomor_polisi, merk, tipe, tahun, kapasitas_ton, status, kontrak_hauling_id, biaya_sewa, durasi_sewa_bulan) VALUES
('d0000000-0000-0000-0000-000000000001', 'DT-201', 'DD 9201 VL', 'Shacman', 'F3000', 2022, 15.00, 'Aktif', 'a0000000-0000-0000-0000-000000000001', 75000000.00, 12),
('d0000000-0000-0000-0000-000000000002', 'DT-202', 'DD 9202 VL', 'Shacman', 'F3000', 2022, 15.00, 'Aktif', 'a0000000-0000-0000-0000-000000000001', 75000000.00, 12),
('d0000000-0000-0000-0000-000000000003', 'DT-203', 'DD 9203 VL', 'Shacman', 'F3000', 2023, 15.00, 'Aktif', 'a0000000-0000-0000-0000-000000000001', 75000000.00, 12),
('d0000000-0000-0000-0000-000000000004', 'DT-204', 'DD 9204 VL', 'Shacman', 'F3000', 2023, 15.00, 'Aktif', 'a0000000-0000-0000-0000-000000000001', 75000000.00, 12),
('d0000000-0000-0000-0000-000000000005', 'DT-205', 'DD 9205 VL', 'Howo', 'TX 371', 2023, 15.00, 'Aktif', 'a0000000-0000-0000-0000-000000000001', 75000000.00, 12);

-- 4. Seed Drivers (5 Drivers linked to PT Vale)
INSERT INTO public.driver (id, nama, nik, nomor_hp, alamat, nomor_sim, masa_berlaku_sim, tanggal_masuk, status, kontrak_hauling_id) VALUES
('e0000000-0000-0000-0000-000000000001', 'Jafar Shadiq', '7302011234560001', '085311223344', 'Sorowako, Luwu Timur', 'SIM-BII-2201', '2028-05-15', '2022-04-10', 'Aktif', 'a0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000002', 'Hendrikus Gede', '7302011234560002', '085311223345', 'Malili, Luwu Timur', 'SIM-BII-2202', '2027-11-20', '2023-01-15', 'Aktif', 'a0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000003', 'Asep Mulyana', '7302011234560003', '085311223346', 'Nuha, Luwu Timur', 'SIM-BII-2203', '2026-12-05', '2023-08-01', 'Aktif', 'a0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000004', 'Yusuf Mansur', '7302011234560004', '085311223347', 'Wasuponda, Luwu Timur', 'SIM-BII-2204', '2029-01-30', '2024-02-12', 'Aktif', 'a0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000005', 'Zulham Zamrun', '7302011234560005', '085311223348', 'Sorowako, Luwu Timur', 'SIM-BII-2205', '2026-07-15', '2021-11-01', 'Aktif', 'a0000000-0000-0000-0000-000000000001');

-- 5. Seed Transactional Data via PL/pgSQL block
DO $$
DECLARE
    contract_id UUID := 'a0000000-0000-0000-0000-000000000001';
    
    u_ids UUID[] := ARRAY[
        'd0000000-0000-0000-0000-000000000001'::uuid,
        'd0000000-0000-0000-0000-000000000002'::uuid,
        'd0000000-0000-0000-0000-000000000003'::uuid,
        'd0000000-0000-0000-0000-000000000004'::uuid,
        'd0000000-0000-0000-0000-000000000005'::uuid
    ];
    
    d_ids UUID[] := ARRAY[
        'e0000000-0000-0000-0000-000000000001'::uuid,
        'e0000000-0000-0000-0000-000000000002'::uuid,
        'e0000000-0000-0000-0000-000000000003'::uuid,
        'e0000000-0000-0000-0000-000000000004'::uuid,
        'e0000000-0000-0000-0000-000000000005'::uuid
    ];
    
    l1 UUID := 'b0000000-0000-0000-0000-000000000001';
    l2 UUID := 'b0000000-0000-0000-0000-000000000002';
    dum1 UUID := 'c0000000-0000-0000-0000-000000000001';
    dum2 UUID := 'c0000000-0000-0000-0000-000000000002';
    
    w INT;
    u_idx INT;
    tgl DATE;
    ritase_id UUID;
    
    -- Specific rates configured as per user inputs
    jenis_pengiriman TEXT;
    tarif_per_ritase NUMERIC(15,2);
    jumlah_ritase INT;
    tonase NUMERIC(10,2);
    
    -- HPP BBM parameters (25L/rit @ Rp 13.500)
    liter_per_rit NUMERIC(10,2) := 25.00;
    harga_per_liter NUMERIC(15,2) := 13500.00;
    computed_biaya_bbm NUMERIC(15,2);
    
    -- Payroll variables (Jan - May)
    month_val INT;
    total_trips INT;
    bonus NUMERIC(15,2);
    potongan NUMERIC(15,2);
    total_salary NUMERIC(15,2);
    driver_id UUID;
    
    -- Invoice variables
    inv_num TEXT;
    inv_date DATE;
    inv_total NUMERIC(15,2);
    inv_period TEXT;
    inv_status TEXT;
BEGIN

    -- A. Generate realistic Ritase & linked BBM logs (weekly, Jan 2026 - Jun 2026)
    FOR w IN 1..25 LOOP
        tgl := DATE '2026-01-02' + (w * 7)::int;
        IF tgl <= '2026-06-25'::date THEN
            
            -- Generate a trip log for each unit
            FOR u_idx IN 1..5 LOOP
                -- Determine a random shipment type with its specific tarif
                jenis_pengiriman := (ARRAY['Pit ke tongkang', 'Pit ke stockfile', 'Quary', 'Stockpile ke tongkang'])[1 + floor(random() * 4)::int];
                
                IF jenis_pengiriman = 'Pit ke tongkang' THEN
                    tarif_per_ritase := 1372800.00; -- 5.2 USD x 15 ton
                ELSIF jenis_pengiriman = 'Pit ke stockfile' THEN
                    tarif_per_ritase := 1240800.00; -- 4.7 USD x 15 ton
                ELSIF jenis_pengiriman = 'Quary' THEN
                    tarif_per_ritase := 950000.00;  -- Rp 950.000/rit
                ELSE
                    tarif_per_ritase := 132000.00;  -- Rp 132.000/rit
                END IF;
                
                jumlah_ritase := 20 + floor(random() * 10)::int; -- 20-29 trips per week
                tonase := jumlah_ritase * 15.00; -- 15 tons per unit
                
                -- BBM HPP (25L/rit)
                computed_biaya_bbm := jumlah_ritase * liter_per_rit * harga_per_liter;
                
                -- Insert Ritase
                INSERT INTO public.ritase (
                    tanggal, kontrak_hauling_id, unit_id, driver_id, 
                    lokasi_loading_id, lokasi_dumping_id, jumlah_ritase, 
                    tonase, tarif_per_ritase, jenis_pengiriman, biaya_bbm, 
                    status, approved_by, approved_at, created_at
                )
                VALUES (
                    tgl, 
                    contract_id, 
                    u_ids[u_idx], 
                    d_ids[u_idx], 
                    CASE WHEN random() < 0.5 THEN l1 ELSE l2 END, 
                    CASE WHEN random() < 0.5 THEN dum1 ELSE dum2 END, 
                    jumlah_ritase, 
                    tonase, 
                    tarif_per_ritase, 
                    jenis_pengiriman, 
                    computed_biaya_bbm, 
                    'Approved', 
                    NULL, -- Approved by system seeder
                    tgl::timestamptz + INTERVAL '14 hours',
                    tgl::timestamptz + INTERVAL '12 hours'
                )
                RETURNING id INTO ritase_id;
                
                -- Insert matching BBM log
                INSERT INTO public.bbm (
                    tanggal, unit_id, liter, harga_per_liter, 
                    total_biaya, lokasi_pengisian, ritase_id, created_at
                )
                VALUES (
                    tgl, 
                    u_ids[u_idx], 
                    jumlah_ritase * liter_per_rit, 
                    harga_per_liter, 
                    computed_biaya_bbm, 
                    'SPBU Utama Sorowako', 
                    ritase_id, 
                    tgl::timestamptz + INTERVAL '8 hours'
                );
            END LOOP;

        END IF;
    END LOOP;

    -- B. Generate Payrolls (January - May 2026, 5 drivers, status Paid)
    -- Gaji Driver: 50,000 / ritase
    FOR month_val IN 1..5 LOOP
        FOR u_idx IN 1..5 LOOP
            driver_id := d_ids[u_idx];
            total_trips := 80 + floor(random() * 40)::int; -- 80-119 trips per month
            bonus := floor(random() * 3)::int * 150000.00;
            potongan := floor(random() * 2)::int * 50000.00;
            total_salary := (total_trips * 50000.00) + bonus - potongan;
            
            INSERT INTO public.payroll (driver_id, bulan, tahun, jumlah_ritase, tarif_per_ritase, bonus, potongan, total_gaji, status, created_at)
            VALUES (
                driver_id, 
                month_val, 
                2026, 
                total_trips, 
                50000.00, 
                bonus, 
                potongan, 
                total_salary, 
                'Paid', 
                ('2026-' || lpad(month_val::text, 2, '0') || '-28')::date
            );
        END LOOP;
    END LOOP;

    -- C. Generate Maintenance Logs (Completed)
    INSERT INTO public.maintenance (tanggal, unit_id, jenis_maintenance, deskripsi, biaya, vendor, kilometer, status, created_at)
    VALUES 
    ('2026-02-10', u_ids[1], 'Service Berkala & Radiator', 'Pengurasan air radiator dan penggantian coolant, serta service oli.', 1850000.00, 'Vale Workshop Malili', 9800, 'Completed', '2026-02-10 10:00:00+07'),
    ('2026-03-18', u_ids[3], 'Perbaikan Rem', 'Pembersihan tromol and penggantian seal rem belakang.', 1500000.00, 'Vale Workshop Malili', 11400, 'Completed', '2026-03-18 09:30:00+07'),
    ('2026-04-12', u_ids[5], 'Ganti Ban Belakang', 'Penggantian 4 unit ban belakang Volvo FMX.', 14500000.00, 'Bridgestone Depot Palopo', 22100, 'Completed', '2026-04-12 08:00:00+07');

    -- D. Generate Invoices (Jan - May 2026)
    FOR month_val IN 1..5 LOOP
        inv_date := ('2026-' || lpad((month_val + 1)::text, 2, '0') || '-05')::date;
        inv_num := 'INV/VALE/2026/' || lpad(month_val::text, 4, '0');
        inv_total := 180000000.00 + (floor(random() * 15)::int * 15000000.00); -- 180m to 405m
        
        IF month_val <= 3 THEN
            inv_status := 'Paid';
        ELSIF month_val = 4 THEN
            inv_status := 'Sent';
        ELSE
            inv_status := 'Draft';
        END IF;

        INSERT INTO public.invoice (nomor_invoice, tanggal_invoice, kontrak_hauling_id, periode, total_tagihan, status, created_at)
        VALUES (
            inv_num, 
            inv_date, 
            contract_id, 
            CASE 
                WHEN month_val = 1 THEN 'Januari 2026'
                WHEN month_val = 2 THEN 'Februari 2026'
                WHEN month_val = 3 THEN 'Maret 2026'
                WHEN month_val = 4 THEN 'April 2026'
                ELSE 'Mei 2026'
            END, 
            inv_total, 
            inv_status, 
            inv_date::timestamptz + INTERVAL '10 hours'
        );
    END LOOP;

    -- E. Generate Operational Expenses
    INSERT INTO public.pengeluaran_operasional (tanggal, kategori, nominal, keterangan, created_at)
    VALUES 
    ('2026-06-01', 'Operasional Kantor', 25000000.00, 'Sewa Kantor HMS Sorowako (Bulan Juni 2026)', '2026-06-01 08:00:00+07'),
    ('2026-06-05', 'Operasional Kantor', 5000000.00, 'Tagihan Listrik PLN & Wi-Fi Biznet Kantor', '2026-06-05 10:00:00+07'),
    ('2026-06-10', 'Operasional Kantor', 10000000.00, 'Pembelian ATK, kertas A4, tinta printer Epson finance', '2026-06-10 14:00:00+07'),
    ('2026-06-15', 'Lainnya', 12000000.00, 'Biaya retribusi perawatan & penyiraman debu jalan hauling tambang', '2026-06-15 09:00:00+07'),
    ('2026-06-20', 'Lainnya', 8000000.00, 'Suplai air bersih depot tangki & gas LPG untuk mess supir DT', '2026-06-20 11:00:00+07');

END $$;

-- Manual entries in Cash Flow (to demonstrate manual entries CRUD)
INSERT INTO public.cash_flow (tanggal, jenis, kategori, nominal, keterangan, source_type, source_id)
VALUES 
('2026-06-02', 'Pengeluaran', 'Sewa Unit Tambahan', 15000000.00, 'Sewa unit dump truck tambahan harian untuk operasional Sorowako', 'Manual', NULL),
('2026-06-07', 'Pemasukan', 'Penjualan Scrap Besi', 5500000.00, 'Penjualan ban bekas & besi tua workshop Sorowako', 'Manual', NULL);
