-- Enable uuid-ossp if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Enums/Check constraints for role and status
-- Role: Owner, Full Access, Admin, Supervisor, Driver
-- Unit Status: Aktif, Maintenance, Rusak, Nonaktif
-- Driver Status: Aktif, Nonaktif
-- Ritase Status: Draft, Approved, Rejected
-- BBM Status: (none, calculated automatically)
-- Maintenance Status: Scheduled, In Progress, Completed
-- Payroll Status: Draft, Paid
-- Invoice Status: Draft, Sent, Paid

-- 1. PROFILES Table (links to auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nama TEXT NOT NULL,
    role TEXT NOT NULL CONSTRAINT chk_profile_role CHECK (role IN ('Owner', 'Full Access', 'Admin', 'Supervisor', 'Driver')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. KONTRAK HAULING Table
CREATE TABLE public.kontrak_hauling (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_kontrak TEXT UNIQUE NOT NULL,
    perusahaan TEXT NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    status TEXT NOT NULL CONSTRAINT chk_kontrak_status CHECK (status IN ('Aktif', 'Selesai', 'Nonaktif')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. LOKASI LOADING Table
CREATE TABLE public.lokasi_loading (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_lokasi TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. LOKASI DUMPING Table
CREATE TABLE public.lokasi_dumping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_lokasi TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. UNIT Table
CREATE TABLE public.unit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_unit TEXT UNIQUE NOT NULL,
    nomor_polisi TEXT NOT NULL,
    merk TEXT NOT NULL,
    tipe TEXT NOT NULL,
    tahun INTEGER NOT NULL,
    kapasitas_ton NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL CONSTRAINT chk_unit_status CHECK (status IN ('Aktif', 'Maintenance', 'Rusak', 'Nonaktif')),
    kontrak_hauling_id UUID REFERENCES public.kontrak_hauling(id) ON DELETE SET NULL,
    biaya_sewa NUMERIC(15,2) NOT NULL DEFAULT 0 CONSTRAINT chk_unit_biaya_sewa CHECK (biaya_sewa >= 0),
    durasi_sewa_bulan INTEGER NOT NULL DEFAULT 1 CONSTRAINT chk_unit_durasi_sewa CHECK (durasi_sewa_bulan >= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. DRIVER Table
CREATE TABLE public.driver (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT NOT NULL,
    nik TEXT UNIQUE NOT NULL,
    nomor_hp TEXT NOT NULL,
    alamat TEXT NOT NULL,
    nomor_sim TEXT NOT NULL,
    masa_berlaku_sim DATE NOT NULL,
    tanggal_masuk DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Aktif' CONSTRAINT chk_driver_status CHECK (status IN ('Aktif', 'Nonaktif')),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    kontrak_hauling_id UUID REFERENCES public.kontrak_hauling(id) ON DELETE SET NULL,
    accumulated_ritase INTEGER NOT NULL DEFAULT 0 CONSTRAINT chk_accumulated_ritase CHECK (accumulated_ritase >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. RITASE Table
CREATE TABLE public.ritase (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal DATE NOT NULL,
    kontrak_hauling_id UUID NOT NULL REFERENCES public.kontrak_hauling(id) ON DELETE RESTRICT,
    unit_id UUID NOT NULL REFERENCES public.unit(id) ON DELETE RESTRICT,
    driver_id UUID NOT NULL REFERENCES public.driver(id) ON DELETE RESTRICT,
    lokasi_loading_id UUID NOT NULL REFERENCES public.lokasi_loading(id) ON DELETE RESTRICT,
    lokasi_dumping_id UUID NOT NULL REFERENCES public.lokasi_dumping(id) ON DELETE RESTRICT,
    jumlah_ritase INTEGER NOT NULL CONSTRAINT chk_jumlah_ritase CHECK (jumlah_ritase >= 0),
    tonase NUMERIC(10,2) NOT NULL CONSTRAINT chk_tonase CHECK (tonase >= 0),
    tarif_per_ritase NUMERIC(15,2) NOT NULL CONSTRAINT chk_tarif_per_ritase CHECK (tarif_per_ritase >= 0),
    jenis_pengiriman TEXT NOT NULL CONSTRAINT chk_jenis_pengiriman CHECK (jenis_pengiriman IN ('Pit ke tongkang', 'Pit ke stockfile', 'Quary', 'Stockpile ke tongkang')),
    biaya_bbm NUMERIC(15,2) NOT NULL DEFAULT 0 CONSTRAINT chk_biaya_bbm CHECK (biaya_bbm >= 0),
    keterangan_tarif TEXT,
    status TEXT NOT NULL DEFAULT 'Draft' CONSTRAINT chk_ritase_status CHECK (status IN ('Draft', 'Approved', 'Rejected')),
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    rejected_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. BBM Table
CREATE TABLE public.bbm (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal DATE NOT NULL,
    unit_id UUID NOT NULL REFERENCES public.unit(id) ON DELETE RESTRICT,
    liter NUMERIC(10,2) NOT NULL CONSTRAINT chk_bbm_liter CHECK (liter >= 0),
    harga_per_liter NUMERIC(15,2) NOT NULL CONSTRAINT chk_bbm_harga CHECK (harga_per_liter >= 0),
    total_biaya NUMERIC(15,2) NOT NULL CONSTRAINT chk_bbm_total CHECK (total_biaya >= 0),
    lokasi_pengisian TEXT NOT NULL,
    ritase_id UUID REFERENCES public.ritase(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. MAINTENANCE Table
CREATE TABLE public.maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal DATE NOT NULL,
    unit_id UUID NOT NULL REFERENCES public.unit(id) ON DELETE RESTRICT,
    jenis_maintenance TEXT NOT NULL,
    deskripsi TEXT NOT NULL,
    biaya NUMERIC(15,2) NOT NULL CONSTRAINT chk_maint_biaya CHECK (biaya >= 0),
    vendor TEXT NOT NULL,
    kilometer INTEGER NOT NULL CONSTRAINT chk_maint_km CHECK (kilometer >= 0),
    status TEXT NOT NULL DEFAULT 'Scheduled' CONSTRAINT chk_maint_status CHECK (status IN ('Scheduled', 'In Progress', 'Completed')),
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. PAYROLL Table
CREATE TABLE public.payroll (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES public.driver(id) ON DELETE RESTRICT,
    bulan INTEGER NOT NULL CONSTRAINT chk_payroll_bulan CHECK (bulan >= 1 AND bulan <= 12),
    tahun INTEGER NOT NULL,
    jumlah_ritase INTEGER NOT NULL DEFAULT 0 CONSTRAINT chk_payroll_jumlah_ritase CHECK (jumlah_ritase >= 0),
    tarif_per_ritase NUMERIC(15,2) NOT NULL DEFAULT 50000 CONSTRAINT chk_payroll_tarif_per_ritase CHECK (tarif_per_ritase >= 0),
    bonus NUMERIC(15,2) NOT NULL DEFAULT 0 CONSTRAINT chk_payroll_bonus CHECK (bonus >= 0),
    potongan NUMERIC(15,2) NOT NULL DEFAULT 0 CONSTRAINT chk_payroll_potongan CHECK (potongan >= 0),
    total_gaji NUMERIC(15,2) NOT NULL CONSTRAINT chk_payroll_total CHECK (total_gaji >= 0),
    status TEXT NOT NULL DEFAULT 'Draft' CONSTRAINT chk_payroll_status CHECK (status IN ('Draft', 'Paid')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_driver_period UNIQUE (driver_id, bulan, tahun)
);

-- 11. INVOICE Table
CREATE TABLE public.invoice (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor_invoice TEXT UNIQUE NOT NULL,
    tanggal_invoice DATE NOT NULL,
    kontrak_hauling_id UUID NOT NULL REFERENCES public.kontrak_hauling(id) ON DELETE RESTRICT,
    periode TEXT NOT NULL,
    total_tagihan NUMERIC(15,2) NOT NULL CONSTRAINT chk_invoice_total CHECK (total_tagihan >= 0),
    status TEXT NOT NULL DEFAULT 'Draft' CONSTRAINT chk_invoice_status CHECK (status IN ('Draft', 'Sent', 'Paid')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. AUDIT LOG Table
CREATE TABLE public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    email TEXT,
    role TEXT,
    aktivitas TEXT NOT NULL,
    detail JSONB,
    waktu TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. OPERATIONAL EXPENSES Table
CREATE TABLE public.pengeluaran_operasional (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal DATE NOT NULL,
    kategori TEXT NOT NULL CONSTRAINT chk_kategori CHECK (kategori IN ('Operasional Kantor', 'Lainnya')),
    nominal NUMERIC(15,2) NOT NULL CONSTRAINT chk_nominal CHECK (nominal >= 0),
    keterangan TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. CASH FLOW Table
CREATE TABLE public.cash_flow (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal DATE NOT NULL,
    jenis TEXT NOT NULL CONSTRAINT chk_cash_flow_jenis CHECK (jenis IN ('Pemasukan', 'Pengeluaran')),
    kategori TEXT NOT NULL,
    nominal NUMERIC(15,2) NOT NULL CONSTRAINT chk_cash_flow_nominal CHECK (nominal >= 0),
    keterangan TEXT,
    source_type TEXT NOT NULL DEFAULT 'Manual' CONSTRAINT chk_cash_flow_source_type CHECK (source_type IN ('Manual', 'BBM', 'Payroll', 'Operational', 'Invoice')),
    source_id UUID,
    kontrak_hauling_id UUID REFERENCES public.kontrak_hauling(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================================
-- INDEXES FOR PERFORMANCE
-- =========================================================================
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_unit_status ON public.unit(status);
CREATE INDEX idx_unit_kontrak_hauling ON public.unit(kontrak_hauling_id);
CREATE INDEX idx_driver_status ON public.driver(status);
CREATE INDEX idx_driver_profile ON public.driver(profile_id);
CREATE INDEX idx_driver_kontrak_hauling ON public.driver(kontrak_hauling_id);
CREATE INDEX idx_ritase_tanggal ON public.ritase(tanggal);
CREATE INDEX idx_ritase_status ON public.ritase(status);
CREATE INDEX idx_ritase_driver ON public.ritase(driver_id);
CREATE INDEX idx_ritase_unit ON public.ritase(unit_id);
CREATE INDEX idx_bbm_tanggal ON public.bbm(tanggal);
CREATE INDEX idx_bbm_unit ON public.bbm(unit_id);
CREATE INDEX idx_bbm_ritase_id ON public.bbm(ritase_id);
CREATE INDEX idx_maintenance_tanggal ON public.maintenance(tanggal);
CREATE INDEX idx_maintenance_unit ON public.maintenance(unit_id);
CREATE INDEX idx_payroll_driver ON public.payroll(driver_id);
CREATE INDEX idx_payroll_period ON public.payroll(tahun, bulan);
CREATE INDEX idx_invoice_kontrak_hauling ON public.invoice(kontrak_hauling_id);
CREATE INDEX idx_ritase_kontrak_hauling ON public.ritase(kontrak_hauling_id);
CREATE INDEX idx_pengeluaran_operasional_tanggal ON public.pengeluaran_operasional(tanggal);
CREATE INDEX idx_cash_flow_tanggal ON public.cash_flow(tanggal);
CREATE INDEX idx_cash_flow_source ON public.cash_flow(source_type, source_id);
CREATE INDEX idx_cash_flow_kontrak_hauling ON public.cash_flow(kontrak_hauling_id);


-- =========================================================================
-- UPDATED_AT TRIGGER
-- =========================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables that have updated_at
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_kontrak_hauling_updated_at BEFORE UPDATE ON public.kontrak_hauling FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_lokasi_loading_updated_at BEFORE UPDATE ON public.lokasi_loading FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_lokasi_dumping_updated_at BEFORE UPDATE ON public.lokasi_dumping FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_unit_updated_at BEFORE UPDATE ON public.unit FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_driver_updated_at BEFORE UPDATE ON public.driver FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_ritase_updated_at BEFORE UPDATE ON public.ritase FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_bbm_updated_at BEFORE UPDATE ON public.bbm FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_maintenance_updated_at BEFORE UPDATE ON public.maintenance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_payroll_updated_at BEFORE UPDATE ON public.payroll FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_invoice_updated_at BEFORE UPDATE ON public.invoice FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_pengeluaran_operasional_updated_at BEFORE UPDATE ON public.pengeluaran_operasional FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_cash_flow_updated_at BEFORE UPDATE ON public.cash_flow FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- AUTO PROFILE CREATION ON USER SIGNUP (WITH AUTO OWNER FOR FIRST USER)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    profile_count INTEGER;
    assigned_role TEXT;
    full_name TEXT;
BEGIN
    -- Check if it's the first profile ever created
    SELECT COUNT(*) INTO profile_count FROM public.profiles;
    IF profile_count = 0 THEN
        assigned_role := 'Owner';
    ELSE
        assigned_role := COALESCE(NEW.raw_user_meta_data->>'role', 'Driver');
    END IF;

    -- Extract full name
    full_name := COALESCE(
        NEW.raw_user_meta_data->>'nama', 
        NEW.raw_user_meta_data->>'full_name', 
        NEW.raw_user_meta_data->>'name', 
        SPLIT_PART(NEW.email, '@', 1)
    );

    INSERT INTO public.profiles (id, nama, role, created_at, updated_at)
    VALUES (NEW.id, full_name, assigned_role, NOW(), NOW());

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- HELPER FUNCTION FOR RLS ROLE RETRIEVAL
-- =========================================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kontrak_hauling ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lokasi_loading ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lokasi_dumping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ritase ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bbm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengeluaran_operasional ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flow ENABLE ROW LEVEL SECURITY;


-- 1. Profiles Policies
CREATE POLICY "Profiles are viewable by authenticated users" 
    ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Profiles can be updated by Owner or Admin" 
    ON public.profiles FOR UPDATE TO authenticated 
    USING (public.get_user_role() IN ('Owner', 'Admin'))
    WITH CHECK (public.get_user_role() IN ('Owner', 'Admin'));

-- 2. Master Data (Kontrak Hauling, Lokasi) Policies
CREATE POLICY "Kontrak hauling viewable by authenticated users" 
    ON public.kontrak_hauling FOR SELECT TO authenticated USING (true);
CREATE POLICY "Kontrak hauling writeable by Owner, Full Access, Admin" 
    ON public.kontrak_hauling FOR ALL TO authenticated 
    USING (public.get_user_role() IN ('Owner', 'Full Access', 'Admin'))
    WITH CHECK (public.get_user_role() IN ('Owner', 'Full Access', 'Admin'));

CREATE POLICY "Loading Locations viewable by authenticated users" 
    ON public.lokasi_loading FOR SELECT TO authenticated USING (true);
CREATE POLICY "Loading Locations writeable by Owner, Full Access, Admin" 
    ON public.lokasi_loading FOR ALL TO authenticated 
    USING (public.get_user_role() IN ('Owner', 'Full Access', 'Admin'))
    WITH CHECK (public.get_user_role() IN ('Owner', 'Full Access', 'Admin'));

CREATE POLICY "Dumping Locations viewable by authenticated users" 
    ON public.lokasi_dumping FOR SELECT TO authenticated USING (true);
CREATE POLICY "Dumping Locations writeable by Owner, Full Access, Admin" 
    ON public.lokasi_dumping FOR ALL TO authenticated 
    USING (public.get_user_role() IN ('Owner', 'Full Access', 'Admin'))
    WITH CHECK (public.get_user_role() IN ('Owner', 'Full Access', 'Admin'));

-- 3. Fleet Units Policies
CREATE POLICY "Units viewable by authenticated users" 
    ON public.unit FOR SELECT TO authenticated USING (true);
CREATE POLICY "Units writeable by Owner, Full Access, Admin" 
    ON public.unit FOR ALL TO authenticated 
    USING (public.get_user_role() IN ('Owner', 'Full Access', 'Admin'))
    WITH CHECK (public.get_user_role() IN ('Owner', 'Full Access', 'Admin'));

-- 4. Drivers Policies
CREATE POLICY "Drivers viewable by authenticated users" 
    ON public.driver FOR SELECT TO authenticated USING (true);
CREATE POLICY "Drivers writeable by Owner, Full Access, Admin" 
    ON public.driver FOR ALL TO authenticated 
    USING (public.get_user_role() IN ('Owner', 'Full Access', 'Admin'))
    WITH CHECK (public.get_user_role() IN ('Owner', 'Full Access', 'Admin'));

-- 5. Ritase Policies
CREATE POLICY "Ritase viewable by managers and supervisors" 
    ON public.ritase FOR SELECT TO authenticated 
    USING (public.get_user_role() IN ('Owner', 'Full Access', 'Admin', 'Supervisor') 
           OR driver_id IN (SELECT id FROM public.driver WHERE profile_id = auth.uid()));

CREATE POLICY "Ritase insertable by all logged-in users" 
    ON public.ritase FOR INSERT TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Ritase updateable by Owner, Admin, Full Access" 
    ON public.ritase FOR UPDATE TO authenticated 
    USING (public.get_user_role() IN ('Owner', 'Full Access', 'Admin') 
           OR (public.get_user_role() = 'Supervisor' AND status IN ('Draft', 'Approved', 'Rejected'))
           OR (public.get_user_role() = 'Driver' AND status = 'Draft' AND driver_id IN (SELECT id FROM public.driver WHERE profile_id = auth.uid())));

CREATE POLICY "Ritase deleteable by Owner, Admin, Full Access" 
    ON public.ritase FOR DELETE TO authenticated 
    USING (public.get_user_role() IN ('Owner', 'Full Access', 'Admin'));

-- 6. BBM Policies
CREATE POLICY "BBM viewable by managers/supervisors or drivers for their units" 
    ON public.bbm FOR SELECT TO authenticated 
    USING (public.get_user_role() IN ('Owner', 'Full Access', 'Admin', 'Supervisor', 'Driver'));

CREATE POLICY "BBM writeable by Owner, Full Access, Admin" 
    ON public.bbm FOR ALL TO authenticated 
    USING (public.get_user_role() IN ('Owner', 'Full Access', 'Admin'))
    WITH CHECK (public.get_user_role() IN ('Owner', 'Full Access', 'Admin'));

-- 7. Maintenance Policies
CREATE POLICY "Maintenance viewable by authenticated users" 
    ON public.maintenance FOR SELECT TO authenticated USING (true);

CREATE POLICY "Maintenance writeable by Owner, Full Access, Admin" 
    ON public.maintenance FOR ALL TO authenticated 
    USING (public.get_user_role() IN ('Owner', 'Full Access', 'Admin'))
    WITH CHECK (public.get_user_role() IN ('Owner', 'Full Access', 'Admin'));

CREATE POLICY "Maintenance updateable by Supervisor for status approval" 
    ON public.maintenance FOR UPDATE TO authenticated 
    USING (public.get_user_role() IN ('Owner', 'Full Access', 'Admin', 'Supervisor'));

-- 8. Payroll Policies
CREATE POLICY "Payroll viewable by Owner, Full Access, Admin or Driver themselves" 
    ON public.payroll FOR SELECT TO authenticated 
    USING (public.get_user_role() IN ('Owner', 'Full Access', 'Admin') 
           OR driver_id IN (SELECT id FROM public.driver WHERE profile_id = auth.uid()));

CREATE POLICY "Payroll writeable by Owner, Full Access, Admin" 
    ON public.payroll FOR ALL TO authenticated 
    USING (public.get_user_role() IN ('Owner', 'Full Access', 'Admin'))
    WITH CHECK (public.get_user_role() IN ('Owner', 'Full Access', 'Admin'));

-- 9. Invoice Policies
CREATE POLICY "Invoice viewable by Owner, Full Access, Admin, Supervisor" 
    ON public.invoice FOR SELECT TO authenticated 
    USING (public.get_user_role() IN ('Owner', 'Full Access', 'Admin', 'Supervisor'));

CREATE POLICY "Invoice writeable by Owner, Full Access, Admin" 
    ON public.invoice FOR ALL TO authenticated 
    USING (public.get_user_role() IN ('Owner', 'Full Access', 'Admin'))
    WITH CHECK (public.get_user_role() IN ('Owner', 'Full Access', 'Admin'));

-- 10. Audit Logs Policies
CREATE POLICY "Audit logs viewable by Owner, Full Access, Admin" 
    ON public.audit_log FOR SELECT TO authenticated 
    USING (public.get_user_role() IN ('Owner', 'Full Access', 'Admin'));

CREATE POLICY "Audit logs insertable by system/anyone authenticated" 
    ON public.audit_log FOR INSERT TO authenticated 
    WITH CHECK (true);

-- 11. Operational Expenses Policies
CREATE POLICY "Operational expenses viewable by authenticated users" 
    ON public.pengeluaran_operasional FOR SELECT TO authenticated USING (true);

CREATE POLICY "Operational expenses writeable by Owner, Full Access, Admin" 
    ON public.pengeluaran_operasional FOR ALL TO authenticated 
    USING (public.get_user_role() IN ('Owner', 'Full Access', 'Admin'))
    WITH CHECK (public.get_user_role() IN ('Owner', 'Full Access', 'Admin'));

-- 12. Cash Flow Policies
CREATE POLICY "Cash flow viewable by authenticated users" 
    ON public.cash_flow FOR SELECT TO authenticated USING (true);

CREATE POLICY "Cash flow writeable by Owner, Full Access, Admin" 
    ON public.cash_flow FOR ALL TO authenticated 
    USING (public.get_user_role() IN ('Owner', 'Full Access', 'Admin'))
    WITH CHECK (public.get_user_role() IN ('Owner', 'Full Access', 'Admin'));


-- =========================================================================
-- DRIVER ACCUMULATED RITASE & PAYROLL RESET TRIGGERS
-- =========================================================================
CREATE OR REPLACE FUNCTION public.update_driver_accumulated_ritase()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.status = 'Approved' THEN
            UPDATE public.driver 
            SET accumulated_ritase = accumulated_ritase + NEW.jumlah_ritase
            WHERE id = NEW.driver_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.status = 'Approved' THEN
            UPDATE public.driver 
            SET accumulated_ritase = GREATEST(0, accumulated_ritase - OLD.jumlah_ritase)
            WHERE id = OLD.driver_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- If status changed to Approved
        IF OLD.status <> 'Approved' AND NEW.status = 'Approved' THEN
            UPDATE public.driver 
            SET accumulated_ritase = accumulated_ritase + NEW.jumlah_ritase
            WHERE id = NEW.driver_id;
        -- If status changed from Approved
        ELSIF OLD.status = 'Approved' AND NEW.status <> 'Approved' THEN
            UPDATE public.driver 
            SET accumulated_ritase = GREATEST(0, accumulated_ritase - OLD.jumlah_ritase)
            WHERE id = OLD.driver_id;
        -- If it remained Approved but fields changed
        ELSIF OLD.status = 'Approved' AND NEW.status = 'Approved' THEN
            -- Driver changed
            IF OLD.driver_id <> NEW.driver_id THEN
                UPDATE public.driver 
                SET accumulated_ritase = GREATEST(0, accumulated_ritase - OLD.jumlah_ritase)
                WHERE id = OLD.driver_id;
                
                UPDATE public.driver 
                SET accumulated_ritase = accumulated_ritase + NEW.jumlah_ritase
                WHERE id = NEW.driver_id;
            -- Same driver, different quantity
            ELSIF OLD.jumlah_ritase <> NEW.jumlah_ritase THEN
                UPDATE public.driver 
                SET accumulated_ritase = GREATEST(0, accumulated_ritase - OLD.jumlah_ritase + NEW.jumlah_ritase)
                WHERE id = NEW.driver_id;
            END IF;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_ritase_accumulated_update
AFTER INSERT OR UPDATE OR DELETE ON public.ritase
FOR EACH ROW EXECUTE FUNCTION public.update_driver_accumulated_ritase();

CREATE OR REPLACE FUNCTION public.reset_driver_accumulated_ritase_on_paid()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Paid' AND (TG_OP = 'INSERT' OR OLD.status <> 'Paid') THEN
        UPDATE public.driver 
        SET accumulated_ritase = 0
        WHERE id = NEW.driver_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_payroll_paid_reset
AFTER INSERT OR UPDATE ON public.payroll
FOR EACH ROW EXECUTE FUNCTION public.reset_driver_accumulated_ritase_on_paid();


-- =========================================================================
-- AUTOMATIC SYNC TRIGGERS TO CASH_FLOW
-- =========================================================================

-- A. BBM Sync Trigger
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
            'BBM Armada',
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

CREATE OR REPLACE FUNCTION public.sync_bbm_delete_to_cash_flow()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.cash_flow WHERE source_type = 'BBM' AND source_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_sync_bbm_cash_flow
    AFTER INSERT OR UPDATE ON public.bbm
    FOR EACH ROW EXECUTE FUNCTION public.sync_bbm_to_cash_flow();

CREATE TRIGGER tr_sync_bbm_delete_cash_flow
    AFTER DELETE ON public.bbm
    FOR EACH ROW EXECUTE FUNCTION public.sync_bbm_delete_to_cash_flow();


-- B. Payroll Sync Trigger
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

CREATE OR REPLACE FUNCTION public.sync_payroll_delete_to_cash_flow()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.cash_flow WHERE source_type = 'Payroll' AND source_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_sync_payroll_cash_flow
    AFTER INSERT OR UPDATE ON public.payroll
    FOR EACH ROW EXECUTE FUNCTION public.sync_payroll_to_cash_flow();

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

CREATE TRIGGER tr_sync_operational_cash_flow
    AFTER INSERT OR UPDATE ON public.pengeluaran_operasional
    FOR EACH ROW EXECUTE FUNCTION public.sync_operational_to_cash_flow();

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
            INSERT INTO public.cash_flow (tanggal, jenis, kategori, nominal, keterangan, source_type, source_id, kontrak_hauling_id)
            VALUES (
                payment_date,
                'Pemasukan',
                'Pembayaran Invoice',
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

CREATE OR REPLACE FUNCTION public.sync_invoice_delete_to_cash_flow()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.cash_flow WHERE source_type = 'Invoice' AND source_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_sync_invoice_cash_flow
    AFTER INSERT OR UPDATE ON public.invoice
    FOR EACH ROW EXECUTE FUNCTION public.sync_invoice_to_cash_flow();

CREATE TRIGGER tr_sync_invoice_delete_cash_flow
    AFTER DELETE ON public.invoice
    FOR EACH ROW EXECUTE FUNCTION public.sync_invoice_delete_to_cash_flow();
