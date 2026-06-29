-- Migration: Add Operational Expenses Table

-- 1. Create table public.pengeluaran_operasional
CREATE TABLE IF NOT EXISTS public.pengeluaran_operasional (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal DATE NOT NULL,
    kategori TEXT NOT NULL CONSTRAINT chk_kategori CHECK (kategori IN ('Operasional Kantor', 'Lainnya')),
    nominal NUMERIC(15,2) NOT NULL CONSTRAINT chk_nominal CHECK (nominal >= 0),
    keterangan TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Add performance index on date queries
CREATE INDEX IF NOT EXISTS idx_pengeluaran_operasional_tanggal ON public.pengeluaran_operasional(tanggal);

-- 3. Add auto updated_at trigger
CREATE TRIGGER tr_pengeluaran_operasional_updated_at 
    BEFORE UPDATE ON public.pengeluaran_operasional 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.pengeluaran_operasional ENABLE ROW LEVEL SECURITY;

-- 5. Define RLS Policies
CREATE POLICY "Operational expenses viewable by authenticated users" 
    ON public.pengeluaran_operasional FOR SELECT TO authenticated USING (true);

CREATE POLICY "Operational expenses writeable by Owner, Full Access, Admin" 
    ON public.pengeluaran_operasional FOR ALL TO authenticated 
    USING (public.get_user_role() IN ('Owner', 'Full Access', 'Admin'))
    WITH CHECK (public.get_user_role() IN ('Owner', 'Full Access', 'Admin'));

-- 6. Insert initial seed data for June 2026
INSERT INTO public.pengeluaran_operasional (tanggal, kategori, nominal, keterangan) VALUES
('2026-06-01', 'Operasional Kantor', 25000000.00, 'Sewa Kantor HMS Morowali (Bulan Juni 2026)'),
('2026-06-05', 'Operasional Kantor', 5000000.00, 'Tagihan Listrik PLN & Wi-Fi Biznet Kantor'),
('2026-06-10', 'Operasional Kantor', 10000000.00, 'Pembelian ATK, kertas A4, tinta printer Epson finance'),
('2026-06-15', 'Lainnya', 12000000.00, 'Biaya retribusi perawatan & penyiraman debu jalan hauling tambang'),
('2026-06-20', 'Lainnya', 8000000.00, 'Suplai air bersih depot tangki & gas LPG untuk mess supir DT');
