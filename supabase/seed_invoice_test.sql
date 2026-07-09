-- Seeder untuk menguji fitur Invoice
-- File ini akan membuat data master dummy (jika belum ada) dan beberapa data ritase berstatus 'Approved'

DO $$
DECLARE
    v_kontrak_id UUID;
    v_lokasi_loading_id UUID;
    v_lokasi_dumping_id UUID;
    v_unit_id UUID;
    v_driver_id UUID;
    v_profile_id UUID;
BEGIN
    -- 1. Buat / Ambil Kontrak Hauling
    SELECT id INTO v_kontrak_id FROM public.kontrak_hauling WHERE kode_kontrak = 'KTR-TEST-001' LIMIT 1;
    IF v_kontrak_id IS NULL THEN
        INSERT INTO public.kontrak_hauling (kode_kontrak, perusahaan, tanggal_mulai, tanggal_selesai, jumlah_unit, status)
        VALUES ('KTR-TEST-001', 'PT. Tambang Sejahtera (Dummy)', '2026-01-01', '2026-12-31', 10, 'Aktif')
        RETURNING id INTO v_kontrak_id;
    END IF;

    -- 2. Buat / Ambil Lokasi Loading
    SELECT id INTO v_lokasi_loading_id FROM public.lokasi_loading WHERE nama_lokasi = 'Pit A (Dummy)' LIMIT 1;
    IF v_lokasi_loading_id IS NULL THEN
        INSERT INTO public.lokasi_loading (nama_lokasi) VALUES ('Pit A (Dummy)') RETURNING id INTO v_lokasi_loading_id;
    END IF;

    -- 3. Buat / Ambil Lokasi Dumping
    SELECT id INTO v_lokasi_dumping_id FROM public.lokasi_dumping WHERE nama_lokasi = 'Stockpile 1 (Dummy)' LIMIT 1;
    IF v_lokasi_dumping_id IS NULL THEN
        INSERT INTO public.lokasi_dumping (nama_lokasi) VALUES ('Stockpile 1 (Dummy)') RETURNING id INTO v_lokasi_dumping_id;
    END IF;

    -- 4. Buat / Ambil Unit
    SELECT id INTO v_unit_id FROM public.unit WHERE kode_unit = 'DT-TEST-01' LIMIT 1;
    IF v_unit_id IS NULL THEN
        INSERT INTO public.unit (kode_unit, nomor_polisi, merk, tipe, tahun, kapasitas_ton, status, kontrak_hauling_id, biaya_sewa, durasi_sewa_bulan)
        VALUES ('DT-TEST-01', 'B 1234 TEST', 'Hino', 'FM 260 JD', 2023, 20.00, 'Aktif', v_kontrak_id, 0, 1)
        RETURNING id INTO v_unit_id;
    END IF;

    -- 5. Buat / Ambil Driver
    SELECT id INTO v_driver_id FROM public.driver WHERE nik = '1234567890123456' LIMIT 1;
    IF v_driver_id IS NULL THEN
        INSERT INTO public.driver (nama, nik, nomor_hp, alamat, nomor_sim, masa_berlaku_sim, tanggal_masuk, status, kontrak_hauling_id)
        VALUES ('Budi (Driver Dummy)', '1234567890123456', '08123456789', 'Jl. Dummy No.1', 'SIM-1234', '2030-01-01', '2026-01-01', 'Aktif', v_kontrak_id)
        RETURNING id INTO v_driver_id;
    END IF;

    -- 6. Insert data Ritase (Misalnya untuk tanggal 1-5 Juli 2026) berstatus Approved
    -- Jika sudah ada data ritase test ini, kita skip saja atau biarkan nambah
    
    INSERT INTO public.ritase (tanggal, kontrak_hauling_id, unit_id, driver_id, lokasi_loading_id, lokasi_dumping_id, jumlah_ritase, tonase, tarif_per_ritase, jenis_pengiriman, biaya_bbm, status)
    VALUES 
    -- 1 Juli: 5 rit (Pit ke tongkang) @ 1.372.800/rit. BBM: 25L * 5 rit * 10000 = 1.250.000
    ('2026-07-01', v_kontrak_id, v_unit_id, v_driver_id, v_lokasi_loading_id, v_lokasi_dumping_id, 5, 100.00, 1372800, 'Pit ke tongkang', 1250000, 'Approved'),
    
    -- 2 Juli: 4 rit (Pit ke stockfile) @ 1.240.800/rit. BBM: 25L * 4 rit * 10000 = 1.000.000
    ('2026-07-02', v_kontrak_id, v_unit_id, v_driver_id, v_lokasi_loading_id, v_lokasi_dumping_id, 4, 80.00, 1240800, 'Pit ke stockfile', 1000000, 'Approved'),
    
    -- 3 Juli: 6 rit (Pit ke tongkang) @ 1.372.800/rit. BBM: 25L * 6 rit * 10000 = 1.500.000
    ('2026-07-03', v_kontrak_id, v_unit_id, v_driver_id, v_lokasi_loading_id, v_lokasi_dumping_id, 6, 120.00, 1372800, 'Pit ke tongkang', 1500000, 'Approved'),
    
    -- 4 Juli: 5 rit (Pit ke stockfile) @ 1.240.800/rit. BBM: 25L * 5 rit * 10000 = 1.250.000
    ('2026-07-04', v_kontrak_id, v_unit_id, v_driver_id, v_lokasi_loading_id, v_lokasi_dumping_id, 5, 100.00, 1240800, 'Pit ke stockfile', 1250000, 'Approved'),
    
    -- 5 Juli: 3 rit (Pit ke tongkang) @ 1.372.800/rit. BBM: 25L * 3 rit * 10000 = 750.000
    ('2026-07-05', v_kontrak_id, v_unit_id, v_driver_id, v_lokasi_loading_id, v_lokasi_dumping_id, 3, 60.00, 1372800, 'Pit ke tongkang', 750000, 'Approved');
    
    -- Total Ritase = 23 rit
    -- Subtotal Kotor Invoice = (14 * 1.372.800) + (9 * 1.240.800) = 19.219.200 + 11.167.200 = 30.386.400

END $$;
