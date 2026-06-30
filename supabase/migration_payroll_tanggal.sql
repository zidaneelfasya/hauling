-- Migration: Add tanggal (date) column to payroll table
-- This allows users to input a custom payment date instead of relying on created_at

-- 1. Add tanggal column with default to today
ALTER TABLE public.payroll 
ADD COLUMN IF NOT EXISTS tanggal DATE NOT NULL DEFAULT CURRENT_DATE;

-- 2. Backfill existing rows: set tanggal from created_at
UPDATE public.payroll SET tanggal = created_at::date WHERE tanggal = CURRENT_DATE AND created_at::date != CURRENT_DATE;

-- 3. Update the payroll-to-cash_flow sync trigger to use NEW.tanggal
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
    
    -- Use the explicit tanggal column instead of updated_at
    payment_date := COALESCE(NEW.tanggal, NOW()::date);

    IF NEW.status = 'Paid' THEN
        IF cf_id IS NULL THEN
            INSERT INTO public.cash_flow (tanggal, jenis, kategori, nominal, keterangan, source_type, source_id, kontrak_hauling_id)
            VALUES (
                payment_date,
                'Pengeluaran',
                'Gaji',
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
