-- Seeder file for Hauling Management System (HMS) - Single Contract Focused on Ritase

-- 1. Seed KONTRAK HAULING (1 Contract)
INSERT INTO public.kontrak_hauling (kode_kontrak, perusahaan, tanggal_mulai, tanggal_selesai, status) VALUES
('HK-2026-001', 'PT Vale Indonesia Tbk', '2026-01-01', '2026-12-31', 'Aktif');

-- 2. Seed LOKASI LOADING
INSERT INTO public.lokasi_loading (nama_lokasi) VALUES
('Pit Sorowako Barat'),
('Pit Sorowako Timur');

-- 3. Seed LOKASI DUMPING
INSERT INTO public.lokasi_dumping (nama_lokasi) VALUES
('Jetty Sorowako'),
('Stockpile Sorowako');

-- 4. Seed UNIT (Fleet Dump Trucks) - 5 Trucks
INSERT INTO public.unit (kode_unit, nomor_polisi, merk, tipe, tahun, kapasitas_ton, status) VALUES
('DT-001', 'DD 8122 XY', 'Hino', 'Ranger FM 260 JD', 2020, 24.00, 'Aktif'),
('DT-002', 'DD 8123 XY', 'Hino', 'Ranger FM 260 JD', 2020, 24.00, 'Aktif'),
('DT-003', 'DD 8124 XY', 'Hino', 'Ranger FM 260 JD', 2021, 24.00, 'Aktif'),
('DT-004', 'DD 8125 XY', 'Hino', 'Ranger FM 260 JD', 2021, 24.00, 'Aktif'),
('DT-005', 'DD 8126 XY', 'Mitsubishi Fuso', 'Fighter FN 62 F', 2019, 25.00, 'Aktif');

-- 5. Seed DRIVER - 5 Drivers
INSERT INTO public.driver (nama, nik, nomor_hp, alamat, nomor_sim, masa_berlaku_sim, tanggal_masuk, status) VALUES
('Supriadi', '7401021203850001', '085299887711', 'Kel. Wundudopi, Kendari', 'SIM-BII-9012', '2026-07-15', '2021-03-01', 'Aktif'),
('Budi Santoso', '7401021203850002', '085299887712', 'Bahodopi, Morowali', 'SIM-BII-9013', '2027-09-22', '2021-04-10', 'Aktif'),
('Hendra Wijaya', '7401021203850003', '085299887713', 'Sorowako, Luwu Timur', 'SIM-BII-9014', '2026-06-30', '2020-05-15', 'Aktif'),
('Dedi Kurniawan', '7401021203850004', '085299887714', 'Pomalaa, Kolaka', 'SIM-BII-9015', '2028-11-05', '2022-01-20', 'Aktif'),
('Agus Prayitno', '7401021203850005', '085299887715', 'Weda Tengah, Halmahera', 'SIM-BII-9016', '2026-07-08', '2022-06-11', 'Aktif');

-- 6. Seed transactional tables via PL/pgSQL block focused on Ritase
DO $$
DECLARE
    u_ids UUID[];
    d_ids UUID[];
    l_ids UUID[];
    dum_ids UUID[];
    kontrak_id UUID;
    
    i INT;
    rand_u UUID;
    rand_d UUID;
    rand_l UUID;
    rand_dum UUID;
    
    rit_count INT := 500;
    
    rand_date DATE;
    rand_rit INT;
    rand_ton NUMERIC(10,2);
    rand_tarif NUMERIC(15,2);
    
    base_km NUMERIC(10,2) := 5000.00;
    base_hm NUMERIC(10,2) := 1000.00;
    
    jenis_pengiriman_arr TEXT[] := ARRAY['Pit ke tongkang', 'Pit ke stockfile', 'Quary', 'Stockpile ke tongkang', 'OB'];
BEGIN
    -- Gather all IDs in arrays for easy access
    SELECT array_agg(id) INTO u_ids FROM public.unit;
    SELECT array_agg(id) INTO d_ids FROM public.driver;
    SELECT array_agg(id) INTO l_ids FROM public.lokasi_loading;
    SELECT array_agg(id) INTO dum_ids FROM public.lokasi_dumping;
    SELECT id INTO kontrak_id FROM public.kontrak_hauling LIMIT 1;

    -- Update driver and unit tables to link to this contract
    UPDATE public.driver SET kontrak_hauling_id = kontrak_id;
    UPDATE public.unit SET kontrak_hauling_id = kontrak_id;

    -- Generate RITASE
    FOR i IN 1..rit_count LOOP
        -- Select random records
        rand_u := u_ids[1 + floor(random() * array_length(u_ids, 1))::int];
        rand_d := d_ids[1 + floor(random() * array_length(d_ids, 1))::int];
        rand_l := l_ids[1 + floor(random() * array_length(l_ids, 1))::int];
        rand_dum := dum_ids[1 + floor(random() * array_length(dum_ids, 1))::int];
        
        -- Random date within the first half of 2026
        rand_date := DATE '2026-01-01' + floor(random() * 150)::int;
        
        rand_rit := 3 + floor(random() * 5)::int; -- 3 to 7 trips
        rand_ton := rand_rit * (20.0 + random() * 8.0); -- 20-28 tons per trip
        rand_tarif := 150000.00 + (floor(random() * 6)::int * 10000.00); -- 150k to 200k IDR per rit
        
        INSERT INTO public.ritase (
            tanggal, 
            kontrak_hauling_id, 
            unit_id, 
            driver_id, 
            lokasi_loading_id, 
            lokasi_dumping_id, 
            jumlah_ritase, 
            tonase, 
            tarif_per_ritase, 
            jenis_pengiriman, 
            biaya_bbm, 
            km_awal, 
            km_akhir, 
            hm_awal, 
            hm_akhir, 
            keterangan_tarif, 
            status, 
            created_at, 
            updated_at
        )
        VALUES (
            rand_date, 
            kontrak_id,
            rand_u, 
            rand_d, 
            rand_l, 
            rand_dum, 
            rand_rit, 
            rand_ton, 
            rand_tarif, 
            jenis_pengiriman_arr[1 + floor(random() * 5)::int],
            100000.00 + (floor(random() * 11)::int * 20000.00),
            base_km + (i * 10) + floor(random() * 5),
            base_km + (i * 10) + 15 + floor(random() * 10),
            base_hm + i + floor(random() * 2),
            base_hm + i + 2 + floor(random() * 2),
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

END $$;

-- 7. Generate specific data for July 1 to July 8, 2026
DO $$
DECLARE
    u_ids UUID[];
    d_ids UUID[];
    l_ids UUID[];
    dum_ids UUID[];
    kontrak_id UUID;
    
    curr_date DATE;
    u_idx INT;
    d_offset INT;
    
    rand_d UUID;
    rand_l UUID;
    rand_dum UUID;
    
    rand_rit INT;
    rand_ton NUMERIC(10,2);
    
    j_idx INT;
    jenis TEXT;
    tarif NUMERIC(15,2);
    
    base_km NUMERIC(10,2);
    base_hm NUMERIC(10,2);
    
    jenis_arr TEXT[] := ARRAY['Pit ke tongkang', 'Pit ke stockfile', 'Quary', 'Stockpile ke tongkang'];
    tarif_arr NUMERIC[] := ARRAY[1372800.00, 1240800.00, 950000.00, 132000.00];
BEGIN
    SELECT array_agg(id) INTO u_ids FROM public.unit;
    SELECT array_agg(id) INTO d_ids FROM public.driver;
    SELECT array_agg(id) INTO l_ids FROM public.lokasi_loading;
    SELECT array_agg(id) INTO dum_ids FROM public.lokasi_dumping;
    SELECT id INTO kontrak_id FROM public.kontrak_hauling LIMIT 1;

    FOR d_offset IN 0..7 LOOP
        curr_date := DATE '2026-07-01' + d_offset;
        
        -- Loop exactly 5 times, once for each of the 5 units
        FOR u_idx IN 1..5 LOOP
            -- Safeguard if unit array is smaller than 5 for some reason
            IF u_idx <= array_length(u_ids, 1) THEN
                rand_d := d_ids[1 + floor(random() * array_length(d_ids, 1))::int];
                rand_l := l_ids[1 + floor(random() * array_length(l_ids, 1))::int];
                rand_dum := dum_ids[1 + floor(random() * array_length(dum_ids, 1))::int];
                
                j_idx := 1 + floor(random() * 4)::int;
                jenis := jenis_arr[j_idx];
                tarif := tarif_arr[j_idx];
                
                -- Randomize ritase amount, e.g. 2 to 5
                rand_rit := 2 + floor(random() * 4)::int;
                rand_ton := rand_rit * (20.0 + random() * 5.0);
                
                base_km := 8000.00 + (d_offset * 50) + (u_idx * 10);
                base_hm := 500.00 + (d_offset * 10) + u_idx;

                INSERT INTO public.ritase (
                    tanggal, 
                    kontrak_hauling_id, 
                    unit_id, 
                    driver_id, 
                    lokasi_loading_id, 
                    lokasi_dumping_id, 
                    jumlah_ritase, 
                    tonase, 
                    tarif_per_ritase, 
                    jenis_pengiriman, 
                    biaya_bbm, 
                    km_awal, 
                    km_akhir, 
                    hm_awal, 
                    hm_akhir, 
                    keterangan_tarif, 
                    status, 
                    created_at, 
                    updated_at
                )
                VALUES (
                    curr_date, 
                    kontrak_id,
                    u_ids[u_idx], 
                    rand_d, 
                    rand_l, 
                    rand_dum, 
                    rand_rit, 
                    rand_ton, 
                    tarif, 
                    jenis,
                    500000.00 + (floor(random() * 5)::int * 10000.00), -- Biaya BBM
                    base_km,
                    base_km + 15 + floor(random() * 10),
                    base_hm,
                    base_hm + 2 + floor(random() * 2),
                    'Data khusus tanggal ' || curr_date,
                    'Approved',
                    curr_date::timestamptz + INTERVAL '12 hours',
                    curr_date::timestamptz + INTERVAL '14 hours'
                );
            END IF;
        END LOOP;
    END LOOP;
END $$;
