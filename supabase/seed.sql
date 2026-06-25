-- Seeder file for Hauling Management System (HMS)

-- 1. Seed PELANGGAN (Customers) - 10 Companies
INSERT INTO public.pelanggan (id, nama_perusahaan, pic, nomor_hp, alamat) VALUES
('c1000000-0000-0000-0000-000000000001', 'PT Vale Indonesia Tbk', 'Bambang Triyono', '08112345678', 'Sorowako, Luwu Timur, Sulawesi Selatan'),
('c1000000-0000-0000-0000-000000000002', 'PT Indonesia Morowali Industrial Park', 'Hendra Wijaya', '08123456789', 'Kawasan Industri IMIP, Bahodopi, Morowali, Sulawesi Tengah'),
('c1000000-0000-0000-0000-000000000003', 'PT Harita Nickel', 'Siti Rahma', '08134567890', 'Pulau Obi, Halmahera Selatan, Maluku Utara'),
('c1000000-0000-0000-0000-000000000004', 'PT Weda Bay Nickel', 'Christian K.', '08145678901', 'Weda Tengah, Halmahera Tengah, Maluku Utara'),
('c1000000-0000-0000-0000-000000000005', 'PT Virtue Dragon Nickel Industry', 'Mr. Wang', '08156789012', 'Konawe, Sulawesi Tenggara'),
('c1000000-0000-0000-0000-000000000006', 'PT Aneka Tambang Tbk (Antam)', 'Agus Hermawan', '08167890123', 'Pomalaa, Kolaka, Sulawesi Tenggara'),
('c1000000-0000-0000-0000-000000000007', 'PT Bintangdelapan Mineral', 'Joko Susilo', '08178901234', 'Bahodopi, Morowali, Sulawesi Tengah'),
('c1000000-0000-0000-0000-000000000008', 'PT Sulawesi Cahaya Mineral', 'Rian Hidayat', '08189012345', 'Routa, Konawe, Sulawesi Tenggara'),
('c1000000-0000-0000-0000-000000000009', 'PT Trimegah Bangun Persada', 'Dewi Lestari', '08190123456', 'Kawasan Industri Obi, Halmahera Selatan, Maluku Utara'),
('c1000000-0000-0000-0000-000000000010', 'PT Ceria Nugraha Indotama', 'Yusuf Wibisono', '08111223344', 'Wolo, Kolaka, Sulawesi Tenggara');

-- 2. Seed LOKASI LOADING - 10 Locations
INSERT INTO public.lokasi_loading (id, nama_lokasi) VALUES
('l1000000-0000-0000-0000-000000000001', 'Pit Sorowako Barat'),
('l1000000-0000-0000-0000-000000000002', 'Pit Pomalaa Selatan'),
('l1000000-0000-0000-0000-000000000003', 'Pit Bahodopi Blok A'),
('l1000000-0000-0000-0000-000000000004', 'Pit Obi Timur'),
('l1000000-0000-0000-0000-000000000005', 'Pit Weda Tengah 2'),
('l1000000-0000-0000-0000-000000000006', 'Pit Konawe Utara C'),
('l1000000-0000-0000-0000-000000000007', 'Pit Routa Utara'),
('l1000000-0000-0000-0000-000000000008', 'Pit Wolo Utama'),
('l1000000-0000-0000-0000-000000000009', 'Pit Bahodopi Blok C'),
('l1000000-0000-0000-0000-000000000010', 'Pit Obi Tengah');

-- 3. Seed LOKASI DUMPING - 10 Locations
INSERT INTO public.lokasi_dumping (id, nama_lokasi) VALUES
('d1000000-0000-0000-0000-000000000001', 'Jetty Sorowako'),
('d1000000-0000-0000-0000-000000000002', 'Jetty Pomalaa Utama'),
('d1000000-0000-0000-0000-000000000003', 'Stockpile IMIP Utama'),
('d1000000-0000-0000-0000-000000000004', 'Stockpile Harita Obi'),
('d1000000-0000-0000-0000-000000000005', 'Jetty Weda Bay'),
('d1000000-0000-0000-0000-000000000006', 'Jetty VDNI Konawe'),
('d1000000-0000-0000-0000-000000000007', 'Stockpile Routa'),
('d1000000-0000-0000-0000-000000000008', 'Jetty Ceria Wolo'),
('d1000000-0000-0000-0000-000000000009', 'Stockpile IMIP Blok B'),
('d1000000-0000-0000-0000-000000000010', 'Stockpile Weda Timur');

-- 4. Seed UNIT (Fleet Dump Trucks) - 20 Trucks
INSERT INTO public.unit (id, kode_unit, nomor_polisi, merk, tipe, tahun, kapasitas_ton, status) VALUES
('u1000000-0000-0000-0000-000000000001', 'DT-001', 'DD 8122 XY', 'Hino', 'Ranger FM 260 JD', 2020, 24.00, 'Aktif'),
('u1000000-0000-0000-0000-000000000002', 'DT-002', 'DD 8123 XY', 'Hino', 'Ranger FM 260 JD', 2020, 24.00, 'Aktif'),
('u1000000-0000-0000-0000-000000000003', 'DT-003', 'DD 8124 XY', 'Hino', 'Ranger FM 260 JD', 2021, 24.00, 'Aktif'),
('u1000000-0000-0000-0000-000000000004', 'DT-004', 'DD 8125 XY', 'Hino', 'Ranger FM 260 JD', 2021, 24.00, 'Aktif'),
('u1000000-0000-0000-0000-000000000005', 'DT-005', 'DD 8126 XY', 'Mitsubishi Fuso', 'Fighter FN 62 F', 2019, 25.00, 'Maintenance'),
('u1000000-0000-0000-0000-000000000006', 'DT-006', 'DT 9011 AB', 'Mitsubishi Fuso', 'Fighter FN 62 F', 2020, 25.00, 'Aktif'),
('u1000000-0000-0000-0000-000000000007', 'DT-007', 'DT 9012 AB', 'Mitsubishi Fuso', 'Fighter FN 62 F', 2020, 25.00, 'Aktif'),
('u1000000-0000-0000-0000-000000000008', 'DT-008', 'DT 9013 AB', 'Mitsubishi Fuso', 'Fighter FN 62 F', 2021, 25.00, 'Aktif'),
('u1000000-0000-0000-0000-000000000009', 'DT-009', 'DT 9014 AB', 'Mitsubishi Fuso', 'Fighter FN 62 F', 2022, 25.00, 'Aktif'),
('u1000000-0000-0000-0000-000000000010', 'DT-010', 'DT 9015 AB', 'Scania', 'P360 XT', 2022, 30.00, 'Aktif'),
('u1000000-0000-0000-0000-000000000011', 'DT-011', 'DT 9016 CD', 'Scania', 'P360 XT', 2022, 30.00, 'Aktif'),
('u1000000-0000-0000-0000-000000000012', 'DT-012', 'DT 9017 CD', 'Scania', 'P360 XT', 2023, 30.00, 'Aktif'),
('u1000000-0000-0000-0000-000000000013', 'DT-013', 'DT 9018 CD', 'Scania', 'P360 XT', 2023, 30.00, 'Rusak'),
('u1000000-0000-0000-0000-000000000014', 'DT-014', 'DD 7033 AZ', 'Hino', 'Ranger FM 280', 2022, 26.00, 'Aktif'),
('u1000000-0000-0000-0000-000000000015', 'DT-015', 'DD 7034 AZ', 'Hino', 'Ranger FM 280', 2022, 26.00, 'Aktif'),
('u1000000-0000-0000-0000-000000000016', 'DT-016', 'DD 7035 AZ', 'Hino', 'Ranger FM 280', 2023, 26.00, 'Aktif'),
('u1000000-0000-0000-0000-000000000017', 'DT-017', 'DD 7036 AZ', 'Hino', 'Ranger FM 280', 2023, 26.00, 'Aktif'),
('u1000000-0000-0000-0000-000000000018', 'DT-018', 'DT 8555 YY', 'Volvo', 'FMX 400', 2021, 30.00, 'Aktif'),
('u1000000-0000-0000-0000-000000000019', 'DT-019', 'DT 8556 YY', 'Volvo', 'FMX 400', 2021, 30.00, 'Nonaktif'),
('u1000000-0000-0000-0000-000000000020', 'DT-020', 'DT 8557 YY', 'Volvo', 'FMX 400', 2022, 30.00, 'Aktif');

-- 5. Seed DRIVER - 30 Drivers
-- (Using dates spanning historical employment; SIM expiry dates some soon, some far)
INSERT INTO public.driver (id, nama, nik, nomor_hp, alamat, nomor_sim, masa_berlaku_sim, tanggal_masuk, status) VALUES
('d1000000-0000-0000-0000-000000000001', 'Supriadi', '7401021203850001', '085299887711', 'Kel. Wundudopi, Kendari', 'SIM-BII-9012', '2026-07-15', '2021-03-01', 'Aktif'),
('d1000000-0000-0000-0000-000000000002', 'Budi Santoso', '7401021203850002', '085299887712', 'Bahodopi, Morowali', 'SIM-BII-9013', '2027-09-22', '2021-04-10', 'Aktif'),
('d1000000-0000-0000-0000-000000000003', 'Hendra Wijaya', '7401021203850003', '085299887713', 'Sorowako, Luwu Timur', 'SIM-BII-9014', '2026-06-30', '2020-05-15', 'Aktif'),
('d1000000-0000-0000-0000-000000000004', 'Dedi Kurniawan', '7401021203850004', '085299887714', 'Pomalaa, Kolaka', 'SIM-BII-9015', '2028-11-05', '2022-01-20', 'Aktif'),
('d1000000-0000-0000-0000-000000000005', 'Agus Prayitno', '7401021203850005', '085299887715', 'Weda Tengah, Halmahera', 'SIM-BII-9016', '2026-07-08', '2022-06-11', 'Aktif'),
('d1000000-0000-0000-0000-000000000006', 'Joko Susilo', '7401021203850006', '085299887716', 'Routa, Konawe', 'SIM-BII-9017', '2029-02-14', '2023-01-15', 'Aktif'),
('d1000000-0000-0000-0000-000000000007', 'Rian Hidayat', '7401021203850007', '085299887717', 'Konawe Selatan', 'SIM-BII-9018', '2026-07-28', '2023-03-01', 'Aktif'),
('d1000000-0000-0000-0000-000000000008', 'Bambang Utomo', '7401021203850008', '085299887718', 'Wolo, Kolaka', 'SIM-BII-9019', '2028-05-18', '2020-08-01', 'Aktif'),
('d1000000-0000-0000-0000-000000000009', 'Asep Saepudin', '7401021203850009', '085299887719', 'Bahodopi, Morowali', 'SIM-BII-9020', '2026-07-01', '2021-11-20', 'Aktif'),
('d1000000-0000-0000-0000-000000000010', 'Eko Prasetyo', '7401021203850010', '085299887720', 'Pulau Obi, Halmahera', 'SIM-BII-9021', '2027-10-30', '2022-04-05', 'Aktif'),
('d1000000-0000-0000-0000-000000000011', 'Edi Sunarto', '7401021203850011', '085299887721', 'Konawe, Sultra', 'SIM-BII-9022', '2028-12-15', '2022-09-01', 'Aktif'),
('d1000000-0000-0000-0000-000000000012', 'Fajar Ramadhan', '7401021203850012', '085299887722', 'Sorowako, Sura', 'SIM-BII-9023', '2026-08-11', '2023-02-12', 'Aktif'),
('d1000000-0000-0000-0000-000000000013', 'Guntur Wibowo', '7401021203850013', '085299887723', 'Kolaka, Sultra', 'SIM-BII-9024', '2027-01-20', '2021-05-18', 'Aktif'),
('d1000000-0000-0000-0000-000000000014', 'Heri Setiawan', '7401021203850014', '085299887724', 'Bahodopi, Morowali', 'SIM-BII-9025', '2028-08-08', '2022-10-10', 'Aktif'),
('d1000000-0000-0000-0000-000000000015', 'Iwan Fals', '7401021203850015', '085299887725', 'Routa, Konawe', 'SIM-BII-9026', '2026-07-20', '2023-05-01', 'Aktif'),
('d1000000-0000-0000-0000-000000000016', 'Junaidi', '7401021203850016', '085299887726', 'Wolo, Kolaka', 'SIM-BII-9027', '2029-04-12', '2023-06-15', 'Aktif'),
('d1000000-0000-0000-0000-000000000017', 'Kurniawan', '7401021203850017', '085299887727', 'Pomalaa, Kolaka', 'SIM-BII-9028', '2026-12-05', '2020-12-01', 'Aktif'),
('d1000000-0000-0000-0000-000000000018', 'Lutfi Hakim', '7401021203850018', '085299887728', 'Sorowako, Lutim', 'SIM-BII-9029', '2027-03-30', '2021-08-20', 'Aktif'),
('d1000000-0000-0000-0000-000000000019', 'Mulyadi', '7401021203850019', '085299887729', 'Bahodopi, Morowali', 'SIM-BII-9030', '2028-06-25', '2022-03-14', 'Aktif'),
('d1000000-0000-0000-0000-000000000020', 'Novianto', '7401021203850020', '085299887730', 'Pulau Obi, Halmahera', 'SIM-BII-9031', '2026-07-04', '2023-08-01', 'Aktif'),
('d1000000-0000-0000-0000-000000000021', 'Oki Setiawan', '7401021203850021', '085299887731', 'Kendari, Sultra', 'SIM-BII-9032', '2029-05-30', '2023-10-10', 'Aktif'),
('d1000000-0000-0000-0000-000000000022', 'Putra Utama', '7401021203850022', '085299887732', 'Weda Tengah, Halmahera', 'SIM-BII-9033', '2026-07-29', '2024-01-15', 'Aktif'),
('d1000000-0000-0000-0000-000000000023', 'Qomarudin', '7401021203850023', '085299887733', 'Morowali, Sulteng', 'SIM-BII-9034', '2027-08-14', '2021-02-10', 'Aktif'),
('d1000000-0000-0000-0000-000000000024', 'Rudi Tabuti', '7401021203850024', '085299887734', 'Pomalaa, Kolaka', 'SIM-BII-9035', '2028-09-09', '2022-07-20', 'Aktif'),
('d1000000-0000-0000-0000-000000000025', 'Slamet Riyadi', '7401021203850025', '085299887735', 'Wolo, Kolaka', 'SIM-BII-9036', '2026-07-12', '2023-04-18', 'Aktif'),
('d1000000-0000-0000-0000-000000000026', 'Taufik Hidayat', '7401021203850026', '085299887736', 'Konawe, Sultra', 'SIM-BII-9037', '2027-11-11', '2022-11-01', 'Aktif'),
('d1000000-0000-0000-0000-000000000027', 'Umar Basri', '7401021203850027', '085299887737', 'Sorowako, Lutim', 'SIM-BII-9038', '2028-04-04', '2023-09-09', 'Aktif'),
('d1000000-0000-0000-0000-000000000028', 'Viktor Jaya', '7401021203850028', '085299887738', 'Bahodopi, Morowali', 'SIM-BII-9039', '2026-07-25', '2024-02-01', 'Aktif'),
('d1000000-0000-0000-0000-000000000029', 'Wahyu Hidayat', '7401021203850029', '085299887739', 'Pulau Obi, Halmahera', 'SIM-BII-9040', '2029-06-18', '2021-06-01', 'Aktif'),
('d1000000-0000-0000-0000-000000000030', 'Yayan Ruhian', '7401021203850030', '085299887740', 'Wolo, Kolaka', 'SIM-BII-9041', '2026-07-22', '2022-05-20', 'Nonaktif');

-- 6. Seed transactional tables via PL/pgSQL block
-- Generating 200 Ritase, 100 BBM, 50 Maintenance, 30 Payroll, 50 Invoices
DO $$
DECLARE
    u_ids UUID[];
    d_ids UUID[];
    l_ids UUID[];
    dum_ids UUID[];
    cust_ids UUID[];
    
    i INT;
    rand_u UUID;
    rand_d UUID;
    rand_l UUID;
    rand_dum UUID;
    rand_cust UUID;
    
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
    base_pay NUMERIC(15,2) := 4500000.00;
    incentive NUMERIC(15,2);
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
    SELECT array_agg(id) INTO cust_ids FROM public.pelanggan;

    -- 6a. Generate 200 RITASE
    FOR i IN 1..rit_count LOOP
        -- Select random records
        rand_u := u_ids[1 + floor(random() * array_length(u_ids, 1))::int];
        rand_d := d_ids[1 + floor(random() * array_length(d_ids, 1))::int];
        rand_l := l_ids[1 + floor(random() * array_length(l_ids, 1))::int];
        rand_dum := dum_ids[1 + floor(random() * array_length(dum_ids, 1))::int];
        
        -- Random date in May or June 2026
        rand_date := DATE '2026-05-01' + floor(random() * 55)::int;
        
        rand_rit := 3 + floor(random() * 5)::int; -- 3 to 7 trips
        rand_ton := rand_rit * (20.0 + random() * 8.0); -- 20-28 tons per trip
        rand_tarif := 150000.00 + (floor(random() * 6)::int * 10000.00); -- 150k to 200k IDR per rit
        total_rev := rand_rit * rand_tarif;
        
        INSERT INTO public.ritase (tanggal, unit_id, driver_id, lokasi_loading_id, lokasi_dumping_id, jumlah_ritase, tonase, tarif_per_ritase, total_pendapatan, status, created_at, updated_at)
        VALUES (
            rand_date, 
            rand_u, 
            rand_d, 
            rand_l, 
            rand_dum, 
            rand_rit, 
            rand_ton, 
            rand_tarif, 
            total_rev, 
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
        incentive := 1500000.00 + (floor(random() * 15)::int * 150000.00); -- 1.5m to 3.75m
        bonus_val := floor(random() * 3)::int * 200000.00;
        cut_val := floor(random() * 2)::int * 100000.00;
        total_salary := base_pay + incentive + bonus_val - cut_val;
        
        INSERT INTO public.payroll (driver_id, bulan, tahun, gaji_pokok, insentif_ritase, bonus, potongan, total_gaji, status, created_at)
        VALUES (d_id, month_val, year_val, base_pay, incentive, bonus_val, cut_val, total_salary, 'Paid', DATE '2026-05-28');
        
        -- June Payroll (Draft)
        month_val := 6;
        year_val := 2026;
        incentive := 1200000.00 + (floor(random() * 15)::int * 150000.00);
        bonus_val := floor(random() * 2)::int * 200000.00;
        cut_val := floor(random() * 2)::int * 100000.00;
        total_salary := base_pay + incentive + bonus_val - cut_val;
        
        INSERT INTO public.payroll (driver_id, bulan, tahun, gaji_pokok, insentif_ritase, bonus, potongan, total_gaji, status, created_at)
        VALUES (d_id, month_val, year_val, base_pay, incentive, bonus_val, cut_val, total_salary, 'Draft', DATE '2026-06-25');
    END LOOP;

    -- 6e. Generate 50 Invoices
    FOR i IN 1..invoice_count LOOP
        rand_cust := cust_ids[1 + floor(random() * array_length(cust_ids, 1))::int];
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

        INSERT INTO public.invoice (nomor_invoice, tanggal_invoice, pelanggan_id, periode, total_tagihan, status, created_at)
        VALUES (inv_num, inv_date, rand_cust, inv_period, inv_total, inv_status, inv_date::timestamptz + INTERVAL '10 hours');
    END LOOP;

END $$;
