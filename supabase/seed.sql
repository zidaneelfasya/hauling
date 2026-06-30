-- Seeder file for Hauling Management System (HMS)

-- 1. Seed KONTRAK HAULING (Hauling Contracts) - 10 Contracts
INSERT INTO public.kontrak_hauling (kode_kontrak, perusahaan, tanggal_mulai, tanggal_selesai, status) VALUES
('HK-2026-001', 'PT Vale Indonesia Tbk', '2026-01-01', '2026-12-31', 'Aktif'),
('HK-2026-002', 'PT Indonesia Morowali Industrial Park', '2026-01-01', '2026-12-31', 'Aktif'),
('HK-2026-003', 'PT Harita Nickel', '2026-02-01', '2026-11-30', 'Aktif'),
('HK-2026-004', 'PT Weda Bay Nickel', '2026-03-01', '2026-09-30', 'Aktif'),
('HK-2026-005', 'PT Virtue Dragon Nickel Industry', '2026-01-15', '2026-07-15', 'Aktif'),
('HK-2026-006', 'PT Aneka Tambang Tbk (Antam)', '2026-01-01', '2026-12-31', 'Aktif'),
('HK-2026-007', 'PT Bintangdelapan Mineral', '2026-04-01', '2026-10-31', 'Aktif'),
('HK-2026-008', 'PT Sulawesi Cahaya Mineral', '2026-05-01', '2026-12-31', 'Aktif'),
('HK-2026-009', 'PT Trimegah Bangun Persada', '2026-06-01', '2027-05-31', 'Aktif'),
('HK-2026-010', 'PT Ceria Nugraha Indotama', '2026-01-01', '2026-06-30', 'Selesai');

-- 2. Seed LOKASI LOADING - 10 Locations
INSERT INTO public.lokasi_loading (nama_lokasi) VALUES
('Pit Sorowako Barat'),
('Pit Pomalaa Selatan'),
('Pit Bahodopi Blok A'),
('Pit Obi Timur'),
('Pit Weda Tengah 2'),
('Pit Konawe Utara C'),
('Pit Routa Utara'),
('Pit Wolo Utama'),
('Pit Bahodopi Blok C'),
('Pit Obi Tengah');

-- 3. Seed LOKASI DUMPING - 10 Locations
INSERT INTO public.lokasi_dumping (nama_lokasi) VALUES
('Jetty Sorowako'),
('Jetty Pomalaa Utama'),
('Stockpile IMIP Utama'),
('Stockpile Harita Obi'),
('Jetty Weda Bay'),
('Jetty VDNI Konawe'),
('Stockpile Routa'),
('Jetty Ceria Wolo'),
('Stockpile IMIP Blok B'),
('Stockpile Weda Timur');

-- 4. Seed UNIT (Fleet Dump Trucks) - 20 Trucks
INSERT INTO public.unit (kode_unit, nomor_polisi, merk, tipe, tahun, kapasitas_ton, status) VALUES
('DT-001', 'DD 8122 XY', 'Hino', 'Ranger FM 260 JD', 2020, 24.00, 'Aktif'),
('DT-002', 'DD 8123 XY', 'Hino', 'Ranger FM 260 JD', 2020, 24.00, 'Aktif'),
('DT-003', 'DD 8124 XY', 'Hino', 'Ranger FM 260 JD', 2021, 24.00, 'Aktif'),
('DT-004', 'DD 8125 XY', 'Hino', 'Ranger FM 260 JD', 2021, 24.00, 'Aktif'),
('DT-005', 'DD 8126 XY', 'Mitsubishi Fuso', 'Fighter FN 62 F', 2019, 25.00, 'Maintenance'),
('DT-006', 'DT 9011 AB', 'Mitsubishi Fuso', 'Fighter FN 62 F', 2020, 25.00, 'Aktif'),
('DT-007', 'DT 9012 AB', 'Mitsubishi Fuso', 'Fighter FN 62 F', 2020, 25.00, 'Aktif'),
('DT-008', 'DT 9013 AB', 'Mitsubishi Fuso', 'Fighter FN 62 F', 2021, 25.00, 'Aktif'),
('DT-009', 'DT 9014 AB', 'Mitsubishi Fuso', 'Fighter FN 62 F', 2022, 25.00, 'Aktif'),
('DT-010', 'DT 9015 AB', 'Scania', 'P360 XT', 2022, 30.00, 'Aktif'),
('DT-011', 'DT 9016 CD', 'Scania', 'P360 XT', 2022, 30.00, 'Aktif'),
('DT-012', 'DT 9017 CD', 'Scania', 'P360 XT', 2023, 30.00, 'Aktif'),
('DT-013', 'DT 9018 CD', 'Scania', 'P360 XT', 2023, 30.00, 'Rusak'),
('DT-014', 'DD 7033 AZ', 'Hino', 'Ranger FM 280', 2022, 26.00, 'Aktif'),
('DT-015', 'DD 7034 AZ', 'Hino', 'Ranger FM 280', 2022, 26.00, 'Aktif'),
('DT-016', 'DD 7035 AZ', 'Hino', 'Ranger FM 280', 2023, 26.00, 'Aktif'),
('DT-017', 'DD 7036 AZ', 'Hino', 'Ranger FM 280', 2023, 26.00, 'Aktif'),
('DT-018', 'DT 8555 YY', 'Volvo', 'FMX 400', 2021, 30.00, 'Aktif'),
('DT-019', 'DT 8556 YY', 'Volvo', 'FMX 400', 2021, 30.00, 'Nonaktif'),
('DT-020', 'DT 8557 YY', 'Volvo', 'FMX 400', 2022, 30.00, 'Aktif');

-- 5. Seed DRIVER - 30 Drivers
-- (Using dates spanning historical employment; SIM expiry dates some soon, some far)
INSERT INTO public.driver (nama, nik, nomor_hp, alamat, nomor_sim, masa_berlaku_sim, tanggal_masuk, status) VALUES
('Supriadi', '7401021203850001', '085299887711', 'Kel. Wundudopi, Kendari', 'SIM-BII-9012', '2026-07-15', '2021-03-01', 'Aktif'),
('Budi Santoso', '7401021203850002', '085299887712', 'Bahodopi, Morowali', 'SIM-BII-9013', '2027-09-22', '2021-04-10', 'Aktif'),
('Hendra Wijaya', '7401021203850003', '085299887713', 'Sorowako, Luwu Timur', 'SIM-BII-9014', '2026-06-30', '2020-05-15', 'Aktif'),
('Dedi Kurniawan', '7401021203850004', '085299887714', 'Pomalaa, Kolaka', 'SIM-BII-9015', '2028-11-05', '2022-01-20', 'Aktif'),
('Agus Prayitno', '7401021203850005', '085299887715', 'Weda Tengah, Halmahera', 'SIM-BII-9016', '2026-07-08', '2022-06-11', 'Aktif'),
('Joko Susilo', '7401021203850006', '085299887716', 'Routa, Konawe', 'SIM-BII-9017', '2029-02-14', '2023-01-15', 'Aktif'),
('Rian Hidayat', '7401021203850007', '085299887717', 'Konawe Selatan', 'SIM-BII-9018', '2026-07-28', '2023-03-01', 'Aktif'),
('Bambang Utomo', '7401021203850008', '085299887718', 'Wolo, Kolaka', 'SIM-BII-9019', '2028-05-18', '2020-08-01', 'Aktif'),
('Asep Saepudin', '7401021203850009', '085299887719', 'Bahodopi, Morowali', 'SIM-BII-9020', '2026-07-01', '2021-11-20', 'Aktif'),
('Eko Prasetyo', '7401021203850010', '085299887720', 'Pulau Obi, Halmahera', 'SIM-BII-9021', '2027-10-30', '2022-04-05', 'Aktif'),
('Edi Sunarto', '7401021203850011', '085299887721', 'Konawe, Sultra', 'SIM-BII-9022', '2028-12-15', '2022-09-01', 'Aktif'),
('Fajar Ramadhan', '7401021203850012', '085299887722', 'Sorowako, Sura', 'SIM-BII-9023', '2026-08-11', '2023-02-12', 'Aktif'),
('Guntur Wibowo', '7401021203850013', '085299887723', 'Kolaka, Sultra', 'SIM-BII-9024', '2027-01-20', '2021-05-18', 'Aktif'),
('Heri Setiawan', '7401021203850014', '085299887724', 'Bahodopi, Morowali', 'SIM-BII-9025', '2028-08-08', '2022-10-10', 'Aktif'),
('Iwan Fals', '7401021203850015', '085299887725', 'Routa, Konawe', 'SIM-BII-9026', '2026-07-20', '2023-05-01', 'Aktif'),
('Junaidi', '7401021203850016', '085299887726', 'Wolo, Kolaka', 'SIM-BII-9027', '2029-04-12', '2023-06-15', 'Aktif'),
('Kurniawan', '7401021203850017', '085299887727', 'Pomalaa, Kolaka', 'SIM-BII-9028', '2026-12-05', '2020-12-01', 'Aktif'),
('Lutfi Hakim', '7401021203850018', '085299887728', 'Sorowako, Lutim', 'SIM-BII-9029', '2027-03-30', '2021-08-20', 'Aktif'),
('Mulyadi', '7401021203850019', '085299887729', 'Bahodopi, Morowali', 'SIM-BII-9030', '2028-06-25', '2022-03-14', 'Aktif'),
('Novianto', '7401021203850020', '085299887730', 'Pulau Obi, Halmahera', 'SIM-BII-9031', '2026-07-04', '2023-08-01', 'Aktif'),
('Oki Setiawan', '7401021203850021', '085299887731', 'Kendari, Sultra', 'SIM-BII-9032', '2029-05-30', '2023-10-10', 'Aktif'),
('Putra Utama', '7401021203850022', '085299887732', 'Weda Tengah, Halmahera', 'SIM-BII-9033', '2026-07-29', '2024-01-15', 'Aktif'),
('Qomarudin', '7401021203850023', '085299887733', 'Morowali, Sulteng', 'SIM-BII-9034', '2027-08-14', '2021-02-10', 'Aktif'),
('Rudi Tabuti', '7401021203850024', '085299887735', 'Pomalaa, Kolaka', 'SIM-BII-9035', '2028-09-09', '2022-07-20', 'Aktif'),
('Slamet Riyadi', '7401021203850025', '085299887736', 'Wolo, Kolaka', 'SIM-BII-9036', '2026-07-12', '2023-04-18', 'Aktif'),
('Taufik Hidayat', '7401021203850026', '085299887737', 'Konawe, Sultra', 'SIM-BII-9037', '2027-11-11', '2022-11-01', 'Aktif'),
('Umar Basri', '7401021203850027', '085299887738', 'Sorowako, Lutim', 'SIM-BII-9038', '2028-04-04', '2023-09-09', 'Aktif'),
('Viktor Jaya', '7401021203850028', '085299887740', 'Bahodopi, Morowali', 'SIM-BII-9039', '2026-07-25', '2024-02-01', 'Aktif'),
('Wahyu Hidayat', '7401021203850029', '085299887741', 'Pulau Obi, Halmahera', 'SIM-BII-9040', '2029-06-18', '2021-06-01', 'Aktif'),
('Yayan Ruhian', '7401021203850030', '085299887742', 'Wolo, Kolaka', 'SIM-BII-9042', '2026-07-22', '2022-05-20', 'Nonaktif');

-- 6. Seed transactional tables via PL/pgSQL block
-- Generating 200 Ritase, 100 BBM, 50 Maintenance, 30 Payroll, 50 Invoices
DO $$
DECLARE
    u_ids UUID[];
    d_ids UUID[];
    l_ids UUID[];
    dum_ids UUID[];
    kontrak_ids UUID[];
    
    i INT;
    rand_u UUID;
    rand_d UUID;
    rand_l UUID;
    rand_dum UUID;
    rand_kontrak UUID;
    
    rit_count INT := 200;
    bbm_count INT := 100;
    maint_count INT := 50;
    payroll_count INT := 30;
    invoice_count INT := 50;
    
    rand_date DATE;
    rand_rit INT;
    rand_ton NUMERIC(10,2);
    rand_tarif NUMERIC(15,2);
    total_rev NUMERIC(15,2);
    
    rand_liter NUMERIC(10,2);
    rand_price NUMERIC(15,2);
    
    rand_maint_cost NUMERIC(15,2);
    rand_km INT;
    
    d_id UUID;
    month_val INT;
    year_val INT;
    rand_rit_count INT;
    tarif_per_rit_val NUMERIC(15,2) := 50000.00;
    bonus_val NUMERIC(15,2);
    cut_val NUMERIC(15,2);
    total_salary NUMERIC(15,2);
    
    inv_num TEXT;
    inv_date DATE;
    inv_total NUMERIC(15,2);
    inv_period TEXT;
    inv_status TEXT;
BEGIN
    -- Gather all IDs in arrays for easy access
    SELECT array_agg(id) INTO u_ids FROM public.unit;
    SELECT array_agg(id) INTO d_ids FROM public.driver;
    SELECT array_agg(id) INTO l_ids FROM public.lokasi_loading;
    SELECT array_agg(id) INTO dum_ids FROM public.lokasi_dumping;
    SELECT array_agg(id) INTO kontrak_ids FROM public.kontrak_hauling;

    -- 6a. Generate 200 RITASE
    FOR i IN 1..rit_count LOOP
        -- Select random records
        rand_u := u_ids[1 + floor(random() * array_length(u_ids, 1))::int];
        rand_d := d_ids[1 + floor(random() * array_length(d_ids, 1))::int];
        rand_l := l_ids[1 + floor(random() * array_length(l_ids, 1))::int];
        rand_dum := dum_ids[1 + floor(random() * array_length(dum_ids, 1))::int];
        rand_kontrak := kontrak_ids[1 + floor(random() * array_length(kontrak_ids, 1))::int];
        
        -- Random date in May or June 2026
        rand_date := DATE '2026-05-01' + floor(random() * 55)::int;
        
        rand_rit := 3 + floor(random() * 5)::int; -- 3 to 7 trips
        rand_ton := rand_rit * (20.0 + random() * 8.0); -- 20-28 tons per trip
        rand_tarif := 150000.00 + (floor(random() * 6)::int * 10000.00); -- 150k to 200k IDR per rit
        
        INSERT INTO public.ritase (tanggal, kontrak_hauling_id, unit_id, driver_id, lokasi_loading_id, lokasi_dumping_id, jumlah_ritase, tonase, tarif_per_ritase, jenis_pengiriman, biaya_bbm, keterangan_tarif, status, created_at, updated_at)
        VALUES (
            rand_date, 
            rand_kontrak,
            rand_u, 
            rand_d, 
            rand_l, 
            rand_dum, 
            rand_rit, 
            rand_ton, 
            rand_tarif, 
            (ARRAY['Pit ke tongkang', 'Pit ke stockfile', 'Quary', 'Stockpile ke tongkang'])[1 + floor(random() * 4)::int],
            100000.00 + (floor(random() * 11)::int * 20000.00),
            'BBM Solar ' || (40 + floor(random() * 30)::int) || 'L, Toll, Uang Makan Driver Rp' || (50000 + floor(random() * 5)::int * 10000),
            CASE 
                WHEN random() < 0.85 THEN 'Approved' 
                WHEN random() < 0.6 THEN 'Rejected' 
                ELSE 'Draft' 
            END,
            rand_date::timestamptz + INTERVAL '12 hours',
            rand_date::timestamptz + INTERVAL '14 hours'
        );
    END LOOP;

    -- 6b. Generate 100 BBM Logs
    FOR i IN 1..bbm_count LOOP
        rand_u := u_ids[1 + floor(random() * array_length(u_ids, 1))::int];
        rand_date := DATE '2026-05-01' + floor(random() * 55)::int;
        rand_liter := 60.0 + floor(random() * 120)::int; -- 60 to 180 liters
        rand_price := 13500.00; -- Biosolar subsidi/industri basis
        
        INSERT INTO public.bbm (tanggal, unit_id, liter, harga_per_liter, total_biaya, lokasi_pengisian, created_at)
        VALUES (
            rand_date,
            rand_u,
            rand_liter,
            rand_price,
            rand_liter * rand_price,
            (ARRAY['SPBU Morowali', 'SPBU Kolaka', 'Fuel Truck Pit A', 'Jetty Fuel Station'])[1 + floor(random() * 4)::int],
            rand_date::timestamptz + INTERVAL '8 hours'
        );
    END LOOP;

    -- 6c. Generate 50 Maintenance Logs
    FOR i IN 1..maint_count LOOP
        rand_u := u_ids[1 + floor(random() * array_length(u_ids, 1))::int];
        rand_date := DATE '2026-05-01' + floor(random() * 55)::int;
        rand_maint_cost := 500000.00 + (floor(random() * 30)::int * 500000.00); -- 500k to 15m
        rand_km := 15000 + (i * 2400) + floor(random() * 1000)::int;
        
        INSERT INTO public.maintenance (tanggal, unit_id, jenis_maintenance, deskripsi, biaya, vendor, kilometer, status, created_at)
        VALUES (
            rand_date,
            rand_u,
            (ARRAY['Ganti Oli & Filter', 'Perbaikan Rem', 'Ganti Ban Luar', 'Perbaikan Suspensi', 'Service Ringan', 'Las Dump Body'])[1 + floor(random() * 6)::int],
            'Perawatan berkala armada dump truck nikel sesuai checklist standar operasional.',
            rand_maint_cost,
            (ARRAY['Bengkel Mining Pratama', 'Hino Service Center Kendari', 'Fuso Autoindo Morowali', 'Bengkel Las Cipta Jaya'])[1 + floor(random() * 4)::int],
            rand_km,
            (ARRAY['Completed', 'In Progress', 'Scheduled'])[1 + (CASE WHEN random() < 0.8 THEN 0 WHEN random() < 0.5 THEN 1 ELSE 2 END)],
            rand_date::timestamptz + INTERVAL '9 hours'
        );
    END LOOP;

    -- 6d. Generate 30 Payroll (May & June 2026, 15 drivers each)
    -- Ensure unique constraints
    FOR i IN 1..15 LOOP
        d_id := d_ids[i];
        
        -- May Payroll
        month_val := 5;
        year_val := 2026;
        rand_rit_count := 30 + floor(random() * 50)::int; -- 30 to 80 trips
        bonus_val := floor(random() * 3)::int * 200000.00;
        cut_val := floor(random() * 2)::int * 100000.00;
        total_salary := (rand_rit_count * tarif_per_rit_val) + bonus_val - cut_val;
        
        INSERT INTO public.payroll (driver_id, bulan, tahun, jumlah_ritase, tarif_per_ritase, bonus, potongan, total_gaji, status, created_at)
        VALUES (d_id, month_val, year_val, rand_rit_count, tarif_per_rit_val, bonus_val, cut_val, total_salary, 'Paid', DATE '2026-05-28');
        
        -- June Payroll (Draft)
        month_val := 6;
        year_val := 2026;
        rand_rit_count := 25 + floor(random() * 45)::int; -- 25 to 70 trips
        bonus_val := floor(random() * 2)::int * 200000.00;
        cut_val := floor(random() * 2)::int * 100000.00;
        total_salary := (rand_rit_count * tarif_per_rit_val) + bonus_val - cut_val;
        
        INSERT INTO public.payroll (driver_id, bulan, tahun, jumlah_ritase, tarif_per_ritase, bonus, potongan, total_gaji, status, created_at)
        VALUES (d_id, month_val, year_val, rand_rit_count, tarif_per_rit_val, bonus_val, cut_val, total_salary, 'Draft', DATE '2026-06-25');
    END LOOP;

    -- 6e. Generate 50 Invoices
    FOR i IN 1..invoice_count LOOP
        rand_kontrak := kontrak_ids[1 + floor(random() * array_length(kontrak_ids, 1))::int];
        inv_date := DATE '2026-03-01' + (i * 2)::int; -- Spreading dates
        inv_num := 'INV/HMS/' || year_val || '/' || lpad(i::text, 4, '0');
        inv_total := 45000000.00 + (floor(random() * 20)::int * 15000000.00); -- 45m to 345m
        
        IF i < 15 THEN
            inv_period := 'Maret 2026';
            inv_status := 'Paid';
        ELSIF i < 35 THEN
            inv_period := 'April 2026';
            inv_status := 'Paid';
        ELSIF i < 45 THEN
            inv_period := 'Mei 2026';
            inv_status := 'Sent';
        ELSE
            inv_period := 'Juni 2026';
            inv_status := 'Draft';
        END IF;

        INSERT INTO public.invoice (nomor_invoice, tanggal_invoice, kontrak_hauling_id, periode, total_tagihan, status, created_at)
        VALUES (inv_num, inv_date, rand_kontrak, inv_period, inv_total, inv_status, inv_date::timestamptz + INTERVAL '10 hours');
    END LOOP;

END $$;

-- Link random kontrak_hauling to drivers
UPDATE public.driver 
SET kontrak_hauling_id = (SELECT id FROM public.kontrak_hauling ORDER BY random() LIMIT 1);

-- Link random kontrak_hauling to units and set rental costs/durations
UPDATE public.unit 
SET kontrak_hauling_id = (SELECT id FROM public.kontrak_hauling ORDER BY random() LIMIT 1),
    biaya_sewa = 15000000.00 + (floor(random() * 5)::int * 2000000.00),
    durasi_sewa_bulan = (ARRAY[1, 3, 6, 12])[1 + floor(random() * 4)::int];

-- 7. Specific Seeder Data for "PT Amman Mineral Nusa Tenggara" (HK-2026-011)
DO $$
DECLARE
    contract_id UUID;
    u1_id UUID; u2_id UUID; u3_id UUID; u4_id UUID;
    d1_id UUID; d2_id UUID; d3_id UUID; d4_id UUID;
    l1_id UUID; dum1_id UUID;
    i INT;
    tgl DATE;
BEGIN
    -- Get loading/dumping location ids
    SELECT id INTO l1_id FROM public.lokasi_loading LIMIT 1;
    SELECT id INTO dum1_id FROM public.lokasi_dumping LIMIT 1;

    -- A. Insert Amman Mineral Contract
    INSERT INTO public.kontrak_hauling (
        kode_kontrak, perusahaan, tanggal_mulai, tanggal_selesai, 
        jumlah_unit, status
    ) VALUES (
        'HK-2026-011', 'PT Amman Mineral Nusa Tenggara', '2026-01-01', '2026-12-31', 
        4, 'Aktif'
    ) RETURNING id INTO contract_id;

    -- B. Insert Specific Fleet Units
    INSERT INTO public.unit (kode_unit, nomor_polisi, merk, tipe, tahun, kapasitas_ton, status, kontrak_hauling_id, biaya_sewa, durasi_sewa_bulan)
    VALUES ('DT-101', 'B 9101 AM', 'Hino', 'Ranger FM 260', 2021, 24.00, 'Aktif', contract_id, 18000000.00, 6) RETURNING id INTO u1_id;
    
    INSERT INTO public.unit (kode_unit, nomor_polisi, merk, tipe, tahun, kapasitas_ton, status, kontrak_hauling_id, biaya_sewa, durasi_sewa_bulan)
    VALUES ('DT-102', 'B 9102 AM', 'Hino', 'Ranger FM 260', 2021, 24.00, 'Aktif', contract_id, 18000000.00, 6) RETURNING id INTO u2_id;
    
    INSERT INTO public.unit (kode_unit, nomor_polisi, merk, tipe, tahun, kapasitas_ton, status, kontrak_hauling_id, biaya_sewa, durasi_sewa_bulan)
    VALUES ('DT-103', 'B 9103 AM', 'Mitsubishi Fuso', 'Fighter FN', 2022, 25.00, 'Aktif', contract_id, 20000000.00, 12) RETURNING id INTO u3_id;
    
    INSERT INTO public.unit (kode_unit, nomor_polisi, merk, tipe, tahun, kapasitas_ton, status, kontrak_hauling_id, biaya_sewa, durasi_sewa_bulan)
    VALUES ('DT-104', 'B 9104 AM', 'Mitsubishi Fuso', 'Fighter FN', 2022, 25.00, 'Aktif', contract_id, 20000000.00, 12) RETURNING id INTO u4_id;

    -- C. Insert Specific Drivers
    INSERT INTO public.driver (nama, nik, nomor_hp, alamat, nomor_sim, masa_berlaku_sim, tanggal_masuk, status, kontrak_hauling_id)
    VALUES ('Ahmad Sodikin', '3201011234560001', '081234567890', 'Batu Hijau, Sumbawa', 'SIM-BII-1101', '2028-12-12', '2023-05-10', 'Aktif', contract_id) RETURNING id INTO d1_id;

    INSERT INTO public.driver (nama, nik, nomor_hp, alamat, nomor_sim, masa_berlaku_sim, tanggal_masuk, status, kontrak_hauling_id)
    VALUES ('FX Heru Prasetyo', '3201011234560002', '081234567891', 'Maluk, Sumbawa Barat', 'SIM-BII-1102', '2027-06-18', '2024-01-15', 'Aktif', contract_id) RETURNING id INTO d2_id;

    INSERT INTO public.driver (nama, nik, nomor_hp, alamat, nomor_sim, masa_berlaku_sim, tanggal_masuk, status, kontrak_hauling_id)
    VALUES ('Teguh Wibowo', '3201011234560003', '081234567892', 'Sekeong, Sumbawa', 'SIM-BII-1103', '2029-03-24', '2024-03-01', 'Aktif', contract_id) RETURNING id INTO d3_id;

    INSERT INTO public.driver (nama, nik, nomor_hp, alamat, nomor_sim, masa_berlaku_sim, tanggal_masuk, status, kontrak_hauling_id)
    VALUES ('Irfan Bachdim', '3201011234560004', '081234567893', 'Taliwang, Sumbawa Barat', 'SIM-BII-1104', '2026-08-30', '2022-11-20', 'Aktif', contract_id) RETURNING id INTO d4_id;

    -- D. Generate realistic Monthly Payrolls (January - May 2026) for the 4 drivers
    FOR i IN 1..5 LOOP
        INSERT INTO public.payroll (driver_id, bulan, tahun, jumlah_ritase, tarif_per_ritase, bonus, potongan, total_gaji, status, created_at)
        VALUES (d1_id, i, 2026, 120, 50000.00, 300000.00, 100000.00, 6200000.00, 'Paid', ('2026-' || lpad(i::text, 2, '0') || '-28')::date);
        
        INSERT INTO public.payroll (driver_id, bulan, tahun, jumlah_ritase, tarif_per_ritase, bonus, potongan, total_gaji, status, created_at)
        VALUES (d2_id, i, 2026, 130, 50000.00, 250000.00, 0.00, 6750000.00, 'Paid', ('2026-' || lpad(i::text, 2, '0') || '-28')::date);

        INSERT INTO public.payroll (driver_id, bulan, tahun, jumlah_ritase, tarif_per_ritase, bonus, potongan, total_gaji, status, created_at)
        VALUES (d3_id, i, 2026, 125, 50000.00, 400000.00, 150000.00, 6500000.00, 'Paid', ('2026-' || lpad(i::text, 2, '0') || '-28')::date);

        INSERT INTO public.payroll (driver_id, bulan, tahun, jumlah_ritase, tarif_per_ritase, bonus, potongan, total_gaji, status, created_at)
        VALUES (d4_id, i, 2026, 140, 50000.00, 500000.00, 50000.00, 7450000.00, 'Paid', ('2026-' || lpad(i::text, 2, '0') || '-28')::date);
    END LOOP;

    -- E. Generate realistic BBM Fuel Logs (January - June 2026, weekly entries)
    FOR i IN 1..25 LOOP
        tgl := DATE '2026-01-05' + (i * 7)::int;
        IF tgl <= '2026-06-25'::date THEN
            INSERT INTO public.bbm (tanggal, unit_id, liter, harga_per_liter, total_biaya, lokasi_pengisian, created_at)
            VALUES (tgl, u1_id, 120.00, 13500.00, 1620000.00, 'SPBU Amman Batu Hijau', tgl::timestamptz + INTERVAL '7 hours');
            
            INSERT INTO public.bbm (tanggal, unit_id, liter, harga_per_liter, total_biaya, lokasi_pengisian, created_at)
            VALUES (tgl, u2_id, 115.00, 13500.00, 1552500.00, 'SPBU Amman Batu Hijau', tgl::timestamptz + INTERVAL '8 hours');

            INSERT INTO public.bbm (tanggal, unit_id, liter, harga_per_liter, total_biaya, lokasi_pengisian, created_at)
            VALUES (tgl, u3_id, 130.00, 13500.00, 1755000.00, 'Fuel Station Amman Maluk', tgl::timestamptz + INTERVAL '7 hours');

            INSERT INTO public.bbm (tanggal, unit_id, liter, harga_per_liter, total_biaya, lokasi_pengisian, created_at)
            VALUES (tgl, u4_id, 125.00, 13500.00, 1687500.00, 'Fuel Station Amman Maluk', tgl::timestamptz + INTERVAL '8 hours');
        END IF;
    END LOOP;

    -- F. Generate Maintenance Logs
    INSERT INTO public.maintenance (tanggal, unit_id, jenis_maintenance, deskripsi, biaya, vendor, kilometer, status, created_at)
    VALUES ('2026-02-15', u1_id, 'Ganti Oli & Filter', 'Service berkala oli mesin Hino Ranger 10.000 KM.', 1250000.00, 'Hino Service Sumbawa', 10450, 'Completed', '2026-02-15 09:00:00+07');

    INSERT INTO public.maintenance (tanggal, unit_id, jenis_maintenance, deskripsi, biaya, vendor, kilometer, status, created_at)
    VALUES ('2026-03-10', u2_id, 'Perbaikan Rem & Kaki-kaki', 'Penggantian kampas rem depan-belakang dan bushing tierod.', 3400000.00, 'Hino Service Sumbawa', 12100, 'Completed', '2026-03-10 10:00:00+07');

    INSERT INTO public.maintenance (tanggal, unit_id, jenis_maintenance, deskripsi, biaya, vendor, kilometer, status, created_at)
    VALUES ('2026-04-20', u3_id, 'Ganti Ban Luar', 'Penggantian 2 unit ban luar belakang Bridgestone mining pattern.', 7200000.00, 'Inti Ban Taliwang', 18300, 'Completed', '2026-04-20 08:30:00+07');

    INSERT INTO public.maintenance (tanggal, unit_id, jenis_maintenance, deskripsi, biaya, vendor, kilometer, status, created_at)
    VALUES ('2026-05-15', u4_id, 'Las Dump Body & Service Ringan', 'Perbaikan retakan plat dinding dump body dan ganti filter solar.', 2800000.00, 'Bengkel Las Karya Kita', 15900, 'Completed', '2026-05-15 11:00:00+07');

    -- G. Generate Ritase Logs (January - June 2026, weekly records to avoid overloading but keep it realistic)
    FOR i IN 1..25 LOOP
        tgl := DATE '2026-01-03' + (i * 7)::int;
        IF tgl <= '2026-06-25'::date THEN
            INSERT INTO public.ritase (tanggal, kontrak_hauling_id, unit_id, driver_id, lokasi_loading_id, lokasi_dumping_id, jumlah_ritase, tonase, tarif_per_ritase, jenis_pengiriman, biaya_bbm, keterangan_tarif, status, created_at)
            VALUES (tgl, contract_id, u1_id, d1_id, l1_id, dum1_id, 24, 576.00, 180000.00, 'Pit ke tongkang', 150000.00, 'Hauling Batu Hijau - Jetty Maluk', 'Approved', tgl::timestamptz + INTERVAL '12 hours');

            INSERT INTO public.ritase (tanggal, kontrak_hauling_id, unit_id, driver_id, lokasi_loading_id, lokasi_dumping_id, jumlah_ritase, tonase, tarif_per_ritase, jenis_pengiriman, biaya_bbm, keterangan_tarif, status, created_at)
            VALUES (tgl, contract_id, u2_id, d2_id, l1_id, dum1_id, 26, 624.00, 180000.00, 'Pit ke stockfile', 140000.00, 'Hauling Batu Hijau - Jetty Maluk', 'Approved', tgl::timestamptz + INTERVAL '12 hours');

            INSERT INTO public.ritase (tanggal, kontrak_hauling_id, unit_id, driver_id, lokasi_loading_id, lokasi_dumping_id, jumlah_ritase, tonase, tarif_per_ritase, jenis_pengiriman, biaya_bbm, keterangan_tarif, status, created_at)
            VALUES (tgl, contract_id, u3_id, d3_id, l1_id, dum1_id, 22, 550.00, 180000.00, 'Quary', 120000.00, 'Hauling Batu Hijau - Jetty Maluk', 'Approved', tgl::timestamptz + INTERVAL '12 hours');

            INSERT INTO public.ritase (tanggal, kontrak_hauling_id, unit_id, driver_id, lokasi_loading_id, lokasi_dumping_id, jumlah_ritase, tonase, tarif_per_ritase, jenis_pengiriman, biaya_bbm, keterangan_tarif, status, created_at)
            VALUES (tgl, contract_id, u4_id, d4_id, l1_id, dum1_id, 28, 700.00, 180000.00, 'Stockpile ke tongkang', 160000.00, 'Hauling Batu Hijau - Jetty Maluk', 'Approved', tgl::timestamptz + INTERVAL '12 hours');
        END IF;
    END LOOP;

    -- H. Generate Invoices
    INSERT INTO public.invoice (nomor_invoice, tanggal_invoice, kontrak_hauling_id, periode, total_tagihan, status, created_at)
    VALUES ('INV/AMMAN/2026/0001', '2026-02-05', contract_id, 'Januari 2026', 360000000.00, 'Paid', '2026-02-05 10:00:00+07');

    INSERT INTO public.invoice (nomor_invoice, tanggal_invoice, kontrak_hauling_id, periode, total_tagihan, status, created_at)
    VALUES ('INV/AMMAN/2026/0002', '2026-03-05', contract_id, 'Februari 2026', 345000000.00, 'Paid', '2026-03-05 10:00:00+07');

    INSERT INTO public.invoice (nomor_invoice, tanggal_invoice, kontrak_hauling_id, periode, total_tagihan, status, created_at)
    VALUES ('INV/AMMAN/2026/0003', '2026-04-05', contract_id, 'Maret 2026', 380000000.00, 'Paid', '2026-04-05 10:00:00+07');

    INSERT INTO public.invoice (nomor_invoice, tanggal_invoice, kontrak_hauling_id, periode, total_tagihan, status, created_at)
    VALUES ('INV/AMMAN/2026/0004', '2026-05-05', contract_id, 'April 2026', 390000000.00, 'Sent', '2026-05-05 10:00:00+07');

    INSERT INTO public.invoice (nomor_invoice, tanggal_invoice, kontrak_hauling_id, periode, total_tagihan, status, created_at)
    VALUES ('INV/AMMAN/2026/0005', '2026-06-05', contract_id, 'Mei 2026', 410000000.00, 'Draft', '2026-06-05 10:00:00+07');

END $$;

-- 8. Specific Seeder Data for "PT Vale Indonesia Tbk" (HK-2026-001)
DO $$
DECLARE
    contract_id UUID;
    u1_id UUID; u2_id UUID; u3_id UUID; u4_id UUID; u5_id UUID;
    d1_id UUID; d2_id UUID; d3_id UUID; d4_id UUID; d5_id UUID;
    l1_id UUID; dum1_id UUID;
    i INT;
    tgl DATE;
BEGIN
    -- Get loading/dumping location ids
    SELECT id INTO l1_id FROM public.lokasi_loading WHERE nama_lokasi = 'Pit Sorowako Barat';
    IF l1_id IS NULL THEN
        SELECT id INTO l1_id FROM public.lokasi_loading LIMIT 1;
    END IF;

    SELECT id INTO dum1_id FROM public.lokasi_dumping WHERE nama_lokasi = 'Jetty Sorowako';
    IF dum1_id IS NULL THEN
        SELECT id INTO dum1_id FROM public.lokasi_dumping LIMIT 1;
    END IF;

    -- Get PT Vale Contract ID
    SELECT id INTO contract_id FROM public.kontrak_hauling WHERE kode_kontrak = 'HK-2026-001';

    IF contract_id IS NOT NULL THEN
        -- B. Insert Specific Fleet Units
        INSERT INTO public.unit (kode_unit, nomor_polisi, merk, tipe, tahun, kapasitas_ton, status, kontrak_hauling_id, biaya_sewa, durasi_sewa_bulan)
        VALUES ('DT-201', 'DD 9201 VL', 'Hino', 'Ranger FM 260 JD', 2020, 24.00, 'Aktif', contract_id, 16000000.00, 3) RETURNING id INTO u1_id;
        
        INSERT INTO public.unit (kode_unit, nomor_polisi, merk, tipe, tahun, kapasitas_ton, status, kontrak_hauling_id, biaya_sewa, durasi_sewa_bulan)
        VALUES ('DT-202', 'DD 9202 VL', 'Hino', 'Ranger FM 260 JD', 2020, 24.00, 'Aktif', contract_id, 16000000.00, 3) RETURNING id INTO u2_id;
        
        INSERT INTO public.unit (kode_unit, nomor_polisi, merk, tipe, tahun, kapasitas_ton, status, kontrak_hauling_id, biaya_sewa, durasi_sewa_bulan)
        VALUES ('DT-203', 'DD 9203 VL', 'Hino', 'Ranger FM 260 JD', 2021, 24.00, 'Aktif', contract_id, 16000000.00, 3) RETURNING id INTO u3_id;
        
        INSERT INTO public.unit (kode_unit, nomor_polisi, merk, tipe, tahun, kapasitas_ton, status, kontrak_hauling_id, biaya_sewa, durasi_sewa_bulan)
        VALUES ('DT-204', 'DD 9204 VL', 'Hino', 'Ranger FM 260 JD', 2021, 24.00, 'Aktif', contract_id, 16000000.00, 3) RETURNING id INTO u4_id;

        INSERT INTO public.unit (kode_unit, nomor_polisi, merk, tipe, tahun, kapasitas_ton, status, kontrak_hauling_id, biaya_sewa, durasi_sewa_bulan)
        VALUES ('DT-205', 'DD 9205 VL', 'Volvo', 'FMX 400', 2022, 30.00, 'Aktif', contract_id, 22000000.00, 12) RETURNING id INTO u5_id;

        -- C. Insert Specific Drivers
        INSERT INTO public.driver (nama, nik, nomor_hp, alamat, nomor_sim, masa_berlaku_sim, tanggal_masuk, status, kontrak_hauling_id)
        VALUES ('Jafar Shadiq', '7302011234560001', '085311223344', 'Sorowako, Luwu Timur', 'SIM-BII-2201', '2028-05-15', '2022-04-10', 'Aktif', contract_id) RETURNING id INTO d1_id;

        INSERT INTO public.driver (nama, nik, nomor_hp, alamat, nomor_sim, masa_berlaku_sim, tanggal_masuk, status, kontrak_hauling_id)
        VALUES ('Hendrikus Gede', '7302011234560002', '085311223345', 'Malili, Luwu Timur', 'SIM-BII-2202', '2027-11-20', '2023-01-15', 'Aktif', contract_id) RETURNING id INTO d2_id;

        INSERT INTO public.driver (nama, nik, nomor_hp, alamat, nomor_sim, masa_berlaku_sim, tanggal_masuk, status, kontrak_hauling_id)
        VALUES ('Asep Mulyana', '7302011234560003', '085311223346', 'Nuha, Luwu Timur', 'SIM-BII-2203', '2026-12-05', '2023-08-01', 'Aktif', contract_id) RETURNING id INTO d3_id;

        INSERT INTO public.driver (nama, nik, nomor_hp, alamat, nomor_sim, masa_berlaku_sim, tanggal_masuk, status, kontrak_hauling_id)
        VALUES ('Yusuf Mansur', '7302011234560004', '085311223347', 'Wasuponda, Luwu Timur', 'SIM-BII-2204', '2029-01-30', '2024-02-12', 'Aktif', contract_id) RETURNING id INTO d4_id;

        INSERT INTO public.driver (nama, nik, nomor_hp, alamat, nomor_sim, masa_berlaku_sim, tanggal_masuk, status, kontrak_hauling_id)
        VALUES ('Zulham Zamrun', '7302011234560005', '085311223348', 'Sorowako, Luwu Timur', 'SIM-BII-2205', '2026-07-15', '2021-11-01', 'Aktif', contract_id) RETURNING id INTO d5_id;

        -- D. Generate Payroll (January - May 2026)
        FOR i IN 1..5 LOOP
            INSERT INTO public.payroll (driver_id, bulan, tahun, jumlah_ritase, tarif_per_ritase, bonus, potongan, total_gaji, status, created_at)
            VALUES (d1_id, i, 2026, 110, 50000.00, 200000.00, 50000.00, 5650000.00, 'Paid', ('2026-' || lpad(i::text, 2, '0') || '-28')::date);

            INSERT INTO public.payroll (driver_id, bulan, tahun, jumlah_ritase, tarif_per_ritase, bonus, potongan, total_gaji, status, created_at)
            VALUES (d2_id, i, 2026, 120, 50000.00, 200000.00, 0.00, 6200000.00, 'Paid', ('2026-' || lpad(i::text, 2, '0') || '-28')::date);

            INSERT INTO public.payroll (driver_id, bulan, tahun, jumlah_ritase, tarif_per_ritase, bonus, potongan, total_gaji, status, created_at)
            VALUES (d3_id, i, 2026, 115, 50000.00, 150000.00, 100000.00, 5800000.00, 'Paid', ('2026-' || lpad(i::text, 2, '0') || '-28')::date);

            INSERT INTO public.payroll (driver_id, bulan, tahun, jumlah_ritase, tarif_per_ritase, bonus, potongan, total_gaji, status, created_at)
            VALUES (d4_id, i, 2026, 130, 50000.00, 300000.00, 0.00, 6800000.00, 'Paid', ('2026-' || lpad(i::text, 2, '0') || '-28')::date);

            INSERT INTO public.payroll (driver_id, bulan, tahun, jumlah_ritase, tarif_per_ritase, bonus, potongan, total_gaji, status, created_at)
            VALUES (d5_id, i, 2026, 135, 50000.00, 400000.00, 100000.00, 7050000.00, 'Paid', ('2026-' || lpad(i::text, 2, '0') || '-28')::date);
        END LOOP;

        -- E. Generate BBM Fuel Logs (weekly)
        FOR i IN 1..25 LOOP
            tgl := DATE '2026-01-04' + (i * 7)::int;
            IF tgl <= '2026-06-25'::date THEN
                INSERT INTO public.bbm (tanggal, unit_id, liter, harga_per_liter, total_biaya, lokasi_pengisian, created_at)
                VALUES (tgl, u1_id, 100.00, 13500.00, 1350000.00, 'SPBU Sorowako Utama', tgl::timestamptz + INTERVAL '8 hours');

                INSERT INTO public.bbm (tanggal, unit_id, liter, harga_per_liter, total_biaya, lokasi_pengisian, created_at)
                VALUES (tgl, u2_id, 98.00, 13500.00, 1323000.00, 'SPBU Sorowako Utama', tgl::timestamptz + INTERVAL '9 hours');

                INSERT INTO public.bbm (tanggal, unit_id, liter, harga_per_liter, total_biaya, lokasi_pengisian, created_at)
                VALUES (tgl, u3_id, 105.00, 13500.00, 1417500.00, 'Fuel Dispenser Sorowako Pit A', tgl::timestamptz + INTERVAL '8 hours');

                INSERT INTO public.bbm (tanggal, unit_id, liter, harga_per_liter, total_biaya, lokasi_pengisian, created_at)
                VALUES (tgl, u4_id, 102.00, 13500.00, 1377000.00, 'Fuel Dispenser Sorowako Pit A', tgl::timestamptz + INTERVAL '9 hours');

                INSERT INTO public.bbm (tanggal, unit_id, liter, harga_per_liter, total_biaya, lokasi_pengisian, created_at)
                VALUES (tgl, u5_id, 140.00, 13500.00, 1890000.00, 'Jetty Fuel Station Sorowako', tgl::timestamptz + INTERVAL '8 hours');
            END IF;
        END LOOP;

        -- F. Generate Maintenance Logs
        INSERT INTO public.maintenance (tanggal, unit_id, jenis_maintenance, deskripsi, biaya, vendor, kilometer, status, created_at)
        VALUES ('2026-02-10', u1_id, 'Service Berkala & Radiator', 'Pengurasan air radiator dan penggantian coolant, serta service oli.', 1850000.00, 'Vale Workshop Malili', 9800, 'Completed', '2026-02-10 10:00:00+07');

        INSERT INTO public.maintenance (tanggal, unit_id, jenis_maintenance, deskripsi, biaya, vendor, kilometer, status, created_at)
        VALUES ('2026-03-18', u3_id, 'Perbaikan Rem', 'Pembersihan tromol and penggantian seal rem belakang.', 1500000.00, 'Vale Workshop Malili', 11400, 'Completed', '2026-03-18 09:30:00+07');

        INSERT INTO public.maintenance (tanggal, unit_id, jenis_maintenance, deskripsi, biaya, vendor, kilometer, status, created_at)
        VALUES ('2026-04-12', u5_id, 'Ganti Ban Belakang', 'Penggantian 4 unit ban belakang Volvo FMX.', 14500000.00, 'Bridgestone Depot Palopo', 22100, 'Completed', '2026-04-12 08:00:00+07');

        -- G. Generate Ritase Logs (weekly)
        FOR i IN 1..25 LOOP
            tgl := DATE '2026-01-02' + (i * 7)::int;
            IF tgl <= '2026-06-25'::date THEN
                INSERT INTO public.ritase (tanggal, kontrak_hauling_id, unit_id, driver_id, lokasi_loading_id, lokasi_dumping_id, jumlah_ritase, tonase, tarif_per_ritase, jenis_pengiriman, biaya_bbm, keterangan_tarif, status, created_at)
                VALUES (tgl, contract_id, u1_id, d1_id, l1_id, dum1_id, 20, 480.00, 150000.00, 'Pit ke tongkang', 100000.00, 'Hauling Sorowako Pit - Jetty', 'Approved', tgl::timestamptz + INTERVAL '12 hours');

                INSERT INTO public.ritase (tanggal, kontrak_hauling_id, unit_id, driver_id, lokasi_loading_id, lokasi_dumping_id, jumlah_ritase, tonase, tarif_per_ritase, jenis_pengiriman, biaya_bbm, keterangan_tarif, status, created_at)
                VALUES (tgl, contract_id, u2_id, d2_id, l1_id, dum1_id, 22, 528.00, 150000.00, 'Pit ke stockfile', 110000.00, 'Hauling Sorowako Pit - Jetty', 'Approved', tgl::timestamptz + INTERVAL '12 hours');

                INSERT INTO public.ritase (tanggal, kontrak_hauling_id, unit_id, driver_id, lokasi_loading_id, lokasi_dumping_id, jumlah_ritase, tonase, tarif_per_ritase, jenis_pengiriman, biaya_bbm, keterangan_tarif, status, created_at)
                VALUES (tgl, contract_id, u3_id, d3_id, l1_id, dum1_id, 18, 432.00, 150000.00, 'Quary', 90000.00, 'Hauling Sorowako Pit - Jetty', 'Approved', tgl::timestamptz + INTERVAL '12 hours');

                INSERT INTO public.ritase (tanggal, kontrak_hauling_id, unit_id, driver_id, lokasi_loading_id, lokasi_dumping_id, jumlah_ritase, tonase, tarif_per_ritase, jenis_pengiriman, biaya_bbm, keterangan_tarif, status, created_at)
                VALUES (tgl, contract_id, u4_id, d4_id, l1_id, dum1_id, 24, 576.00, 150000.00, 'Stockpile ke tongkang', 120000.00, 'Hauling Sorowako Pit - Jetty', 'Approved', tgl::timestamptz + INTERVAL '12 hours');

                INSERT INTO public.ritase (tanggal, kontrak_hauling_id, unit_id, driver_id, lokasi_loading_id, lokasi_dumping_id, jumlah_ritase, tonase, tarif_per_ritase, jenis_pengiriman, biaya_bbm, keterangan_tarif, status, created_at)
                VALUES (tgl, contract_id, u5_id, d5_id, l1_id, dum1_id, 25, 750.00, 150000.00, 'Pit ke tongkang', 130000.00, 'Hauling Sorowako Pit - Jetty', 'Approved', tgl::timestamptz + INTERVAL '12 hours');
            END IF;
        END LOOP;

        -- H. Generate Invoices
        INSERT INTO public.invoice (nomor_invoice, tanggal_invoice, kontrak_hauling_id, periode, total_tagihan, status, created_at)
        VALUES ('INV/VALE/2026/0001', '2026-02-05', contract_id, 'Januari 2026', 220000000.00, 'Paid', '2026-02-05 10:00:00+07');

        INSERT INTO public.invoice (nomor_invoice, tanggal_invoice, kontrak_hauling_id, periode, total_tagihan, status, created_at)
        VALUES ('INV/VALE/2026/0002', '2026-03-05', contract_id, 'Februari 2026', 210000000.00, 'Paid', '2026-03-05 10:00:00+07');

        INSERT INTO public.invoice (nomor_invoice, tanggal_invoice, kontrak_hauling_id, periode, total_tagihan, status, created_at)
        VALUES ('INV/VALE/2026/0003', '2026-04-05', contract_id, 'Maret 2026', 230000000.00, 'Paid', '2026-04-05 10:00:00+07');

        INSERT INTO public.invoice (nomor_invoice, tanggal_invoice, kontrak_hauling_id, periode, total_tagihan, status, created_at)
        VALUES ('INV/VALE/2026/0004', '2026-05-05', contract_id, 'April 2026', 245000000.00, 'Sent', '2026-05-05 10:00:00+07');

        INSERT INTO public.invoice (nomor_invoice, tanggal_invoice, kontrak_hauling_id, periode, total_tagihan, status, created_at)
        VALUES ('INV/VALE/2026/0005', '2026-06-05', contract_id, 'Mei 2026', 260000000.00, 'Draft', '2026-06-05 10:00:00+07');

        -- I. Generate Operational Expenses
        INSERT INTO public.pengeluaran_operasional (tanggal, kategori, nominal, keterangan, created_at)
        VALUES 
        ('2026-06-01', 'Operasional Kantor', 25000000.00, 'Sewa Kantor HMS Morowali (Bulan Juni 2026)', '2026-06-01 08:00:00+07'),
        ('2026-06-05', 'Operasional Kantor', 5000000.00, 'Tagihan Listrik PLN & Wi-Fi Biznet Kantor', '2026-06-05 10:00:00+07'),
        ('2026-06-10', 'Operasional Kantor', 10000000.00, 'Pembelian ATK, kertas A4, tinta printer Epson finance', '2026-06-10 14:00:00+07'),
        ('2026-06-15', 'Lainnya', 12000000.00, 'Biaya retribusi perawatan & penyiraman debu jalan hauling tambang', '2026-06-15 09:00:00+07'),
        ('2026-06-20', 'Lainnya', 8000000.00, 'Suplai air bersih depot tangki & gas LPG untuk mess supir DT', '2026-06-20 11:00:00+07');

    END IF;
END $$;



