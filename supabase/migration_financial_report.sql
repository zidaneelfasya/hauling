-- Migration: Financial Report & Cash Flow Revamp

-- 1. Alter public.bbm to add ritase_id referencing public.ritase
ALTER TABLE public.bbm 
ADD COLUMN IF NOT EXISTS ritase_id UUID REFERENCES public.ritase(id) ON DELETE CASCADE;

-- Create index on ritase_id for performance
CREATE INDEX IF NOT EXISTS idx_bbm_ritase_id ON public.bbm(ritase_id);

-- 2. Create public.cash_flow table
CREATE TABLE IF NOT EXISTS public.cash_flow (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal DATE NOT NULL,
    jenis TEXT NOT NULL CONSTRAINT chk_cash_flow_jenis CHECK (jenis IN ('Pemasukan', 'Pengeluaran')),
    kategori TEXT NOT NULL,
    nominal NUMERIC(15,2) NOT NULL CONSTRAINT chk_cash_flow_nominal CHECK (nominal >= 0),
    keterangan TEXT,
    source_type TEXT NOT NULL DEFAULT 'Manual' CONSTRAINT chk_cash_flow_source_type CHECK (source_type IN ('Manual', 'BBM', 'Payroll', 'Operational', 'Invoice')),
    source_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for date queries
CREATE INDEX IF NOT EXISTS idx_cash_flow_tanggal ON public.cash_flow(tanggal);
-- Index for sync queries
CREATE INDEX IF NOT EXISTS idx_cash_flow_source ON public.cash_flow(source_type, source_id);

-- Apply updated_at trigger
DROP TRIGGER IF EXISTS tr_cash_flow_updated_at ON public.cash_flow;
CREATE TRIGGER tr_cash_flow_updated_at 
    BEFORE UPDATE ON public.cash_flow 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.cash_flow ENABLE ROW LEVEL SECURITY;

-- 3. Define RLS Policies for cash_flow
DROP POLICY IF EXISTS "Cash flow viewable by authenticated users" ON public.cash_flow;
CREATE POLICY "Cash flow viewable by authenticated users" 
    ON public.cash_flow FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Cash flow writeable by Owner, Full Access, Admin" ON public.cash_flow;
CREATE POLICY "Cash flow writeable by Owner, Full Access, Admin" 
    ON public.cash_flow FOR ALL TO authenticated 
    USING (public.get_user_role() IN ('Owner', 'Full Access', 'Admin'))
    WITH CHECK (public.get_user_role() IN ('Owner', 'Full Access', 'Admin'));


-- 4. Create trigger functions for automatic sync to cash_flow

-- A. BBM Sync Trigger
CREATE OR REPLACE FUNCTION public.sync_bbm_to_cash_flow()
RETURNS TRIGGER AS $$
DECLARE
    unit_code TEXT;
    cf_id UUID;
BEGIN
    SELECT kode_unit INTO unit_code FROM public.unit WHERE id = NEW.unit_id;
    SELECT id INTO cf_id FROM public.cash_flow WHERE source_type = 'BBM' AND source_id = NEW.id;
    
    IF cf_id IS NULL THEN
        INSERT INTO public.cash_flow (tanggal, jenis, kategori, nominal, keterangan, source_type, source_id)
        VALUES (
            NEW.tanggal,
            'Pengeluaran',
            'BBM',
            NEW.total_biaya,
            'Pembelian BBM Solar Unit ' || COALESCE(unit_code, '') || ' @' || NEW.lokasi_pengisian,
            'BBM',
            NEW.id
        );
    ELSE
        UPDATE public.cash_flow SET
            tanggal = NEW.tanggal,
            nominal = NEW.total_biaya,
            keterangan = 'Pembelian BBM Solar Unit ' || COALESCE(unit_code, '') || ' @' || NEW.lokasi_pengisian
        WHERE id = cf_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.sync_bbm_delete_to_cash_flow()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.cash_flow WHERE source_type = 'BBM' AND source_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind BBM triggers
DROP TRIGGER IF EXISTS tr_sync_bbm_cash_flow ON public.bbm;
CREATE TRIGGER tr_sync_bbm_cash_flow
    AFTER INSERT OR UPDATE ON public.bbm
    FOR EACH ROW EXECUTE FUNCTION public.sync_bbm_to_cash_flow();

DROP TRIGGER IF EXISTS tr_sync_bbm_delete_cash_flow ON public.bbm;
CREATE TRIGGER tr_sync_bbm_delete_cash_flow
    AFTER DELETE ON public.bbm
    FOR EACH ROW EXECUTE FUNCTION public.sync_bbm_delete_to_cash_flow();


-- B. Payroll Sync Trigger
CREATE OR REPLACE FUNCTION public.sync_payroll_to_cash_flow()
RETURNS TRIGGER AS $$
DECLARE
    driver_name TEXT;
    cf_id UUID;
    payment_date DATE;
BEGIN
    SELECT nama INTO driver_name FROM public.driver WHERE id = NEW.driver_id;
    SELECT id INTO cf_id FROM public.cash_flow WHERE source_type = 'Payroll' AND source_id = NEW.id;
    
    -- Determine payment date (use updated_at date or current date)
    payment_date := COALESCE(NEW.updated_at::date, NOW()::date);

    IF NEW.status = 'Paid' THEN
        IF cf_id IS NULL THEN
            INSERT INTO public.cash_flow (tanggal, jenis, kategori, nominal, keterangan, source_type, source_id)
            VALUES (
                payment_date,
                'Pengeluaran',
                'Gaji Driver',
                NEW.total_gaji,
                'Gaji Driver: ' || COALESCE(driver_name, '') || ' Periode ' || NEW.bulan || '/' || NEW.tahun,
                'Payroll',
                NEW.id
            );
        ELSE
            UPDATE public.cash_flow SET
                tanggal = payment_date,
                nominal = NEW.total_gaji,
                keterangan = 'Gaji Driver: ' || COALESCE(driver_name, '') || ' Periode ' || NEW.bulan || '/' || NEW.tahun
            WHERE id = cf_id;
        END IF;
    ELSE
        -- If status is not Paid, delete from cash flow if exists
        IF cf_id IS NOT NULL THEN
            DELETE FROM public.cash_flow WHERE id = cf_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.sync_payroll_delete_to_cash_flow()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.cash_flow WHERE source_type = 'Payroll' AND source_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Payroll triggers
DROP TRIGGER IF EXISTS tr_sync_payroll_cash_flow ON public.payroll;
CREATE TRIGGER tr_sync_payroll_cash_flow
    AFTER INSERT OR UPDATE ON public.payroll
    FOR EACH ROW EXECUTE FUNCTION public.sync_payroll_to_cash_flow();

DROP TRIGGER IF EXISTS tr_sync_payroll_delete_cash_flow ON public.payroll;
CREATE TRIGGER tr_sync_payroll_delete_cash_flow
    AFTER DELETE ON public.payroll
    FOR EACH ROW EXECUTE FUNCTION public.sync_payroll_delete_to_cash_flow();


-- C. Operational Sync Trigger
CREATE OR REPLACE FUNCTION public.sync_operational_to_cash_flow()
RETURNS TRIGGER AS $$
DECLARE
    cf_id UUID;
BEGIN
    SELECT id INTO cf_id FROM public.cash_flow WHERE source_type = 'Operational' AND source_id = NEW.id;
    
    IF cf_id IS NULL THEN
        INSERT INTO public.cash_flow (tanggal, jenis, kategori, nominal, keterangan, source_type, source_id)
        VALUES (
            NEW.tanggal,
            'Pengeluaran',
            NEW.kategori,
            NEW.nominal,
            NEW.keterangan,
            'Operational',
            NEW.id
        );
    ELSE
        UPDATE public.cash_flow SET
            tanggal = NEW.tanggal,
            kategori = NEW.kategori,
            nominal = NEW.nominal,
            keterangan = NEW.keterangan
        WHERE id = cf_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.sync_operational_delete_to_cash_flow()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.cash_flow WHERE source_type = 'Operational' AND source_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Operational triggers
DROP TRIGGER IF EXISTS tr_sync_operational_cash_flow ON public.pengeluaran_operasional;
CREATE TRIGGER tr_sync_operational_cash_flow
    AFTER INSERT OR UPDATE ON public.pengeluaran_operasional
    FOR EACH ROW EXECUTE FUNCTION public.sync_operational_to_cash_flow();

DROP TRIGGER IF EXISTS tr_sync_operational_delete_cash_flow ON public.pengeluaran_operasional;
CREATE TRIGGER tr_sync_operational_delete_cash_flow
    AFTER DELETE ON public.pengeluaran_operasional
    FOR EACH ROW EXECUTE FUNCTION public.sync_operational_delete_to_cash_flow();


-- D. Invoice Sync Trigger
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
            INSERT INTO public.cash_flow (tanggal, jenis, kategori, nominal, keterangan, source_type, source_id)
            VALUES (
                payment_date,
                'Pemasukan',
                'Invoice Customer',
                NEW.total_tagihan,
                'Pembayaran Invoice No: ' || NEW.nomor_invoice || ' - Perusahaan: ' || COALESCE(company_name, '') || ' Periode ' || NEW.periode,
                'Invoice',
                NEW.id
            );
        ELSE
            UPDATE public.cash_flow SET
                tanggal = payment_date,
                nominal = NEW.total_tagihan,
                keterangan = 'Pembayaran Invoice No: ' || NEW.nomor_invoice || ' - Perusahaan: ' || COALESCE(company_name, '') || ' Periode ' || NEW.periode
            WHERE id = cf_id;
        END IF;
    ELSE
        -- If status is not Paid, delete from cash flow if exists
        IF cf_id IS NOT NULL THEN
            DELETE FROM public.cash_flow WHERE id = cf_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.sync_invoice_delete_to_cash_flow()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.cash_flow WHERE source_type = 'Invoice' AND source_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Invoice triggers
DROP TRIGGER IF EXISTS tr_sync_invoice_cash_flow ON public.invoice;
CREATE TRIGGER tr_sync_invoice_cash_flow
    AFTER INSERT OR UPDATE ON public.invoice
    FOR EACH ROW EXECUTE FUNCTION public.sync_invoice_to_cash_flow();

DROP TRIGGER IF EXISTS tr_sync_invoice_delete_cash_flow ON public.invoice;
CREATE TRIGGER tr_sync_invoice_delete_cash_flow
    AFTER DELETE ON public.invoice
    FOR EACH ROW EXECUTE FUNCTION public.sync_invoice_delete_to_cash_flow();


-- 5. Migrate existing historical data into cash_flow

-- Clear any existing synced cash_flow logs to prevent duplicates
DELETE FROM public.cash_flow WHERE source_type IN ('BBM', 'Payroll', 'Operational', 'Invoice');

-- Sync existing BBM logs
INSERT INTO public.cash_flow (tanggal, jenis, kategori, nominal, keterangan, source_type, source_id, created_at, updated_at)
SELECT 
    b.tanggal, 
    'Pengeluaran', 
    'BBM', 
    b.total_biaya, 
    'Pembelian BBM Solar Unit ' || COALESCE(u.kode_unit, 'DT') || ' @' || b.lokasi_pengisian, 
    'BBM', 
    b.id,
    b.created_at,
    b.updated_at
FROM public.bbm b
LEFT JOIN public.unit u ON b.unit_id = u.id;

-- Sync existing Paid payrolls
INSERT INTO public.cash_flow (tanggal, jenis, kategori, nominal, keterangan, source_type, source_id, created_at, updated_at)
SELECT 
    COALESCE(p.updated_at::date, p.created_at::date), 
    'Pengeluaran', 
    'Gaji Driver', 
    p.total_gaji, 
    'Gaji Driver: ' || COALESCE(d.nama, 'Driver') || ' Periode ' || p.bulan || '/' || p.tahun, 
    'Payroll', 
    p.id,
    p.created_at,
    p.updated_at
FROM public.payroll p
LEFT JOIN public.driver d ON p.driver_id = d.id
WHERE p.status = 'Paid';

-- Sync existing operational expenses
INSERT INTO public.cash_flow (tanggal, jenis, kategori, nominal, keterangan, source_type, source_id, created_at, updated_at)
SELECT 
    o.tanggal, 
    'Pengeluaran', 
    o.kategori, 
    o.nominal, 
    o.keterangan, 
    'Operational', 
    o.id,
    o.created_at,
    o.updated_at
FROM public.pengeluaran_operasional o;

-- Sync existing Paid invoices
INSERT INTO public.cash_flow (tanggal, jenis, kategori, nominal, keterangan, source_type, source_id, created_at, updated_at)
SELECT 
    COALESCE(i.updated_at::date, i.created_at::date), 
    'Pemasukan', 
    'Invoice Customer', 
    i.total_tagihan, 
    'Pembayaran Invoice No: ' || i.nomor_invoice || ' - Perusahaan: ' || COALESCE(k.perusahaan, '') || ' Periode ' || i.periode, 
    'Invoice', 
    i.id,
    i.created_at,
    i.updated_at
FROM public.invoice i
LEFT JOIN public.kontrak_hauling k ON i.kontrak_hauling_id = k.id
WHERE i.status = 'Paid';
