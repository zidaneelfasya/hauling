ALTER TABLE public.ritase ADD COLUMN km_awal NUMERIC(10,2);
ALTER TABLE public.ritase ADD COLUMN km_akhir NUMERIC(10,2);
ALTER TABLE public.ritase ADD COLUMN hm_awal NUMERIC(10,2);
ALTER TABLE public.ritase ADD COLUMN hm_akhir NUMERIC(10,2);

ALTER TABLE public.ritase DROP CONSTRAINT IF EXISTS chk_jenis_pengiriman;
ALTER TABLE public.ritase ADD CONSTRAINT chk_jenis_pengiriman CHECK (jenis_pengiriman IN ('Pit ke tongkang', 'Pit ke stockfile', 'Quary', 'Stockpile ke tongkang', 'OB'));
