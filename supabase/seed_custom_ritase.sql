-- =========================================================================
-- CUSTOM SEEDER FOR HAULING MANAGEMENT SYSTEM
-- =========================================================================
-- Spesifikasi data ritase:
--   - Jumlah Ritase: 6
--   - Tonase: 90
--   - Tarif/Rit: 1.372.800
--   - Volume BBM: 150 Liter
--   - Harga/Liter: 6.800 (Total biaya BBM = 150 * 6.800 = 1.020.000)
--
-- Fitur:
--   - Dapat dipanggil dengan menentukan jumlah pengulangan data (loop count)
--   - Dapat menentukan tanggal pengisian secara kustom (tunggal atau range tanggal)
--   - Memilih relasi (kontrak, unit, driver, lokasi) secara acak dari data yang ada
--   - Jika database kosong, otomatis membuat data master dummy agar seeder berhasil dijalankan tanpa error
-- =========================================================================

-- Hapus versi fungsi lama terlebih dahulu untuk menghindari penumpukan overloading
DROP FUNCTION IF EXISTS public.seed_custom_ritase(INT);
DROP FUNCTION IF EXISTS public.seed_custom_ritase(INT, DATE);
DROP FUNCTION IF EXISTS public.seed_custom_ritase(INT, DATE, DATE);

CREATE OR REPLACE FUNCTION public.seed_custom_ritase(
    p_count INT, 
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS INT AS $$
DECLARE
    rand_kontrak UUID;
    rand_unit UUID;
    rand_driver UUID;
    rand_loading UUID;
    rand_dumping UUID;
    
    rit_id UUID;
    v_date DATE;
    i INT;
    inserted_count INT := 0;
    
    -- Parameter data ritase sesuai permintaan
    v_jumlah_ritase INT := 6;
    v_tonase NUMERIC(10,2) := 90.00;
    v_tarif NUMERIC(15,2) := 1372800.00;
    v_liter NUMERIC(10,2) := 150.00;
    v_harga_bbm NUMERIC(15,2) := 6800.00;
    v_total_bbm NUMERIC(15,2);
    
    -- Prefix unik agar tidak terjadi tabrakan constraint UNIQUE saat dijalankan berulang kali
    v_suffix TEXT;
BEGIN
    v_total_bbm := v_liter * v_harga_bbm; -- 1.020.000
    v_suffix := to_char(now(), 'MS'); -- Milidetik saat ini

    FOR i IN 1..p_count LOOP
        -- 1. Ambil Kontrak Hauling secara acak
        SELECT id INTO rand_kontrak FROM public.kontrak_hauling ORDER BY random() LIMIT 1;
        -- Jika kosong, buat baru
        IF rand_kontrak IS NULL THEN
            INSERT INTO public.kontrak_hauling (kode_kontrak, perusahaan, tanggal_mulai, tanggal_selesai, status)
            VALUES ('HK-CUST-' || v_suffix || '-' || i, 'PT Tambang Custom Seeder', '2026-01-01', '2026-12-31', 'Aktif')
            RETURNING id INTO rand_kontrak;
        END IF;

        -- 2. Ambil Lokasi Loading secara acak
        SELECT id INTO rand_loading FROM public.lokasi_loading ORDER BY random() LIMIT 1;
        -- Jika kosong, buat baru
        IF rand_loading IS NULL THEN
            INSERT INTO public.lokasi_loading (nama_lokasi)
            VALUES ('Pit Loading Seeder ' || i)
            RETURNING id INTO rand_loading;
        END IF;

        -- 3. Ambil Lokasi Dumping secara acak
        SELECT id INTO rand_dumping FROM public.lokasi_dumping ORDER BY random() LIMIT 1;
        -- Jika kosong, buat baru
        IF rand_dumping IS NULL THEN
            INSERT INTO public.lokasi_dumping (nama_lokasi)
            VALUES ('Jetty Dumping Seeder ' || i)
            RETURNING id INTO rand_dumping;
        END IF;

        -- 4. Ambil Unit Dump Truck secara acak
        SELECT id INTO rand_unit FROM public.unit ORDER BY random() LIMIT 1;
        -- Jika kosong, buat baru
        IF rand_unit IS NULL THEN
            INSERT INTO public.unit (kode_unit, nomor_polisi, merk, tipe, tahun, kapasitas_ton, status, kontrak_hauling_id)
            VALUES ('DT-CUST-' || v_suffix || '-' || i, 'B ' || (1000 + i)::text || ' CUST', 'Hino', 'Ranger FM 260 JD', 2021, 30.00, 'Aktif', rand_kontrak)
            RETURNING id INTO rand_unit;
        END IF;

        -- 5. Ambil Driver secara acak
        SELECT id INTO rand_driver FROM public.driver ORDER BY random() LIMIT 1;
        -- Jika kosong, buat baru
        IF rand_driver IS NULL THEN
            INSERT INTO public.driver (nama, nik, nomor_hp, alamat, nomor_sim, masa_berlaku_sim, tanggal_masuk, status, kontrak_hauling_id)
            VALUES ('Driver Custom ' || i, '9999' || v_suffix || (100000 + i)::text, '08123456789' || i::text, 'Alamat Custom Seeder ' || i, 'SIM-CUST-' || v_suffix || '-' || i, '2030-12-31', '2026-01-01', 'Aktif', rand_kontrak)
            RETURNING id INTO rand_driver;
        END IF;

        -- 6. Tentukan tanggal (menggunakan range jika keduanya diisi, atau tanggal tunggal jika hanya start_date diisi, atau acak jika keduanya NULL)
        IF p_start_date IS NOT NULL AND p_end_date IS NOT NULL THEN
            IF p_start_date > p_end_date THEN
                v_date := p_end_date + floor(random() * (p_start_date - p_end_date + 1))::int;
            ELSE
                v_date := p_start_date + floor(random() * (p_end_date - p_start_date + 1))::int;
            END IF;
        ELSIF p_start_date IS NOT NULL THEN
            v_date := p_start_date;
        ELSIF p_end_date IS NOT NULL THEN
            v_date := p_end_date;
        ELSE
            -- Generate tanggal acak di tahun 2026 (rentang Januari s.d. Juni)
            v_date := DATE '2026-01-01' + floor(random() * 180)::int;
        END IF;

        -- 7. Insert Data Ritase
        INSERT INTO public.ritase (
            tanggal, kontrak_hauling_id, unit_id, driver_id, lokasi_loading_id, lokasi_dumping_id, 
            jumlah_ritase, tonase, tarif_per_ritase, jenis_pengiriman, biaya_bbm, keterangan_tarif, status, 
            created_at, updated_at
        ) VALUES (
            v_date,
            rand_kontrak,
            rand_unit,
            rand_driver,
            rand_loading,
            rand_dumping,
            v_jumlah_ritase,
            v_tonase,
            v_tarif,
            'Pit ke tongkang', -- Jenis pengiriman default
            v_total_bbm,
            'Custom Seeder (6 Rit, 90 Ton, Tarif 1.372.800/rit)',
            'Approved', -- Disetujui agar langsung memengaruhi metrik dashboard
            v_date::timestamptz + INTERVAL '12 hours',
            v_date::timestamptz + INTERVAL '14 hours'
        )
        RETURNING id INTO rit_id;

        -- 8. Insert Data BBM yang terhubung ke Ritase
        INSERT INTO public.bbm (
            tanggal, unit_id, liter, harga_per_liter, total_biaya, lokasi_pengisian, ritase_id, created_at
        ) VALUES (
            v_date,
            rand_unit,
            v_liter,
            v_harga_bbm,
            v_total_bbm,
            'SPBU Utama Seeder',
            rit_id,
            v_date::timestamptz + INTERVAL '8 hours'
        );

        inserted_count := inserted_count + 1;
    END LOOP;

    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql;

-- =========================================================================
-- CARA MENJALANKAN DI SUPABASE SQL EDITOR:
-- =========================================================================
-- 1. Jalankan seluruh script di atas sekali untuk membuat/memperbarui fungsi seed_custom_ritase.
--
-- 2. Jalankan perintah query di bawah ini untuk memasukkan data:
--
--    -- A. Tanpa tanggal kustom (otomatis menggunakan tanggal acak):
--    SELECT public.seed_custom_ritase(10); 
--
--    -- B. Dengan satu tanggal kustom spesifik (misal: '2026-06-29'):
--    SELECT public.seed_custom_ritase(10, '2026-06-29'); 
--
--    -- C. Dengan range tanggal kustom (misal dari '2026-06-01' s/d '2026-06-30'):
--    SELECT public.seed_custom_ritase(10, '2026-06-01', '2026-06-30'); 
--
-- 3. (Opsional) Jika Anda ingin menghapus fungsi setelah selesai digunakan:
--
--    DROP FUNCTION IF EXISTS public.seed_custom_ritase(INT, DATE, DATE);
-- =========================================================================
