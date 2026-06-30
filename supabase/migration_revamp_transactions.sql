-- Migration: Revamp Transactions and Cash Flow Contract Mapping

-- 1. Add kontrak_hauling_id column to cash_flow table
ALTER TABLE public.cash_flow 
ADD COLUMN IF NOT EXISTS kontrak_hauling_id UUID REFERENCES public.kontrak_hauling(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_cash_flow_kontrak_hauling ON public.cash_flow(kontrak_hauling_id);

-- 2. Update BBM sync triggers to map kontrak_hauling_id from unit and use updated categories
CREATE OR REPLACE FUNCTION public.sync_bbm_to_cash_flow()
RETURNS TRIGGER AS $$
DECLARE
    unit_code TEXT;
    rand_kontrak UUID;
    cf_id UUID;
BEGIN
    SELECT kode_unit, kontrak_hauling_id INTO unit_code, rand_kontrak FROM public.unit WHERE id = NEW.unit_id;
    SELECT id INTO cf_id FROM public.cash_flow WHERE source_type = 'BBM' AND source_id = NEW.id;
    
    IF cf_id IS NULL THEN
        INSERT INTO public.cash_flow (tanggal, jenis, kategori, nominal, keterangan, source_type, source_id, kontrak_hauling_id)
        VALUES (
            NEW.tanggal,
            'Pengeluaran',
            'BBM Armada', -- Kategori pengeluaran baru sesuai request
            NEW.total_biaya,
            'Pembelian BBM Solar Unit ' || COALESCE(unit_code, '') || ' @' || NEW.lokasi_pengisian,
            'BBM',
            NEW.id,
            rand_kontrak
        );
    ELSE
        UPDATE public.cash_flow SET
            tanggal = NEW.tanggal,
            nominal = NEW.total_biaya,
            kategori = 'BBM Armada',
            keterangan = 'Pembelian BBM Solar Unit ' || COALESCE(unit_code, '') || ' @' || NEW.lokasi_pengisian,
            kontrak_hauling_id = rand_kontrak
        WHERE id = cf_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update Payroll sync triggers to map kontrak_hauling_id from driver and use updated categories
CREATE OR REPLACE FUNCTION public.sync_payroll_to_cash_flow()
RETURNS TRIGGER AS $$
DECLARE
    driver_name TEXT;
    rand_kontrak UUID;
    cf_id UUID;
    payment_date DATE;
BEGIN
    SELECT nama, kontrak_hauling_id INTO driver_name, rand_kontrak FROM public.driver WHERE id = NEW.driver_id;
    SELECT id INTO cf_id FROM public.cash_flow WHERE source_type = 'Payroll' AND source_id = NEW.id;
    
    payment_date := COALESCE(NEW.updated_at::date, NOW()::date);

    IF NEW.status = 'Paid' THEN
        IF cf_id IS NULL THEN
            INSERT INTO public.cash_flow (tanggal, jenis, kategori, nominal, keterangan, source_type, source_id, kontrak_hauling_id)
            VALUES (
                payment_date,
                'Pengeluaran',
                'Gaji', -- Kategori pengeluaran baru sesuai request
                NEW.total_gaji,
                'Gaji Driver: ' || COALESCE(driver_name, '') || ' Periode ' || NEW.bulan || '/' || NEW.tahun,
                'Payroll',
                NEW.id,
                rand_kontrak
            );
        ELSE
            UPDATE public.cash_flow SET
                tanggal = payment_date,
                nominal = NEW.total_gaji,
                kategori = 'Gaji',
                keterangan = 'Gaji Driver: ' || COALESCE(driver_name, '') || ' Periode ' || NEW.bulan || '/' || NEW.tahun,
                kontrak_hauling_id = rand_kontrak
            WHERE id = cf_id;
        END IF;
    ELSE
        IF cf_id IS NOT NULL THEN
            DELETE FROM public.cash_flow WHERE id = cf_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update Invoice sync triggers to use kontrak_hauling_id from invoice and use updated categories
CREATE OR REPLACE FUNCTION public.sync_invoice_to_cash_flow()
RETURNS TRIGGER AS $$
DECLARE
    company_name TEXT;
    cf_id UUID;
    payment_date DATE;
BEGIN
    SELECT perusahaan INTO company_name FROM public.kontrak_hauling WHERE id = NEW.kontrak_hauling_id;
    SELECT id INTO cf_id FROM public.cash_flow WHERE source_type = 'Invoice' AND source_id = NEW.id;
    
    payment_date := COALESCE(NEW.updated_at::date, NOW()::date);

    IF NEW.status = 'Paid' THEN
        IF cf_id IS NULL THEN
            INSERT INTO public.cash_flow (tanggal, jenis, kategori, nominal, keterangan, source_type, source_id, kontrak_hauling_id)
            VALUES (
                payment_date,
                'Pemasukan',
                'Pembayaran Invoice', -- Kategori pemasukan baru sesuai request
                NEW.total_tagihan,
                'Pembayaran Invoice No: ' || NEW.nomor_invoice || ' - Perusahaan: ' || COALESCE(company_name, '') || ' Periode ' || NEW.periode,
                'Invoice',
                NEW.id,
                NEW.kontrak_hauling_id
            );
        ELSE
            UPDATE public.cash_flow SET
                tanggal = payment_date,
                nominal = NEW.total_tagihan,
                kategori = 'Pembayaran Invoice',
                keterangan = 'Pembayaran Invoice No: ' || NEW.nomor_invoice || ' - Perusahaan: ' || COALESCE(company_name, '') || ' Periode ' || NEW.periode,
                kontrak_hauling_id = NEW.kontrak_hauling_id
            WHERE id = cf_id;
        END IF;
    ELSE
        IF cf_id IS NOT NULL THEN
            DELETE FROM public.cash_flow WHERE id = cf_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Backfill existing cash_flow rows with kontrak_hauling_id where possible and update their categories
UPDATE public.cash_flow cf
SET kontrak_hauling_id = b.kontrak_id,
    kategori = 'BBM Armada'
FROM (
    SELECT bbm.id, u.kontrak_hauling_id as kontrak_id
    FROM public.bbm
    JOIN public.unit u ON bbm.unit_id = u.id
) b
WHERE cf.source_type = 'BBM' AND cf.source_id = b.id;

UPDATE public.cash_flow cf
SET kontrak_hauling_id = d.kontrak_id,
    kategori = 'Gaji'
FROM (
    SELECT payroll.id, dr.kontrak_hauling_id as kontrak_id
    FROM public.payroll
    JOIN public.driver dr ON payroll.driver_id = dr.id
) d
WHERE cf.source_type = 'Payroll' AND cf.source_id = d.id;

UPDATE public.cash_flow cf
SET kontrak_hauling_id = inv.kontrak_hauling_id,
    kategori = 'Pembayaran Invoice'
FROM public.invoice inv
WHERE cf.source_type = 'Invoice' AND cf.source_id = inv.id;
