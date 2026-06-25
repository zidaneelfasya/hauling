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

-- 2. PELANGGAN Table
CREATE TABLE public.pelanggan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_perusahaan TEXT NOT NULL,
    pic TEXT NOT NULL,
    nomor_hp TEXT NOT NULL,
    alamat TEXT NOT NULL,
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. RITASE Table
CREATE TABLE public.ritase (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal DATE NOT NULL,
    unit_id UUID NOT NULL REFERENCES public.unit(id) ON DELETE RESTRICT,
    driver_id UUID NOT NULL REFERENCES public.driver(id) ON DELETE RESTRICT,
    lokasi_loading_id UUID NOT NULL REFERENCES public.lokasi_loading(id) ON DELETE RESTRICT,
    lokasi_dumping_id UUID NOT NULL REFERENCES public.lokasi_dumping(id) ON DELETE RESTRICT,
    jumlah_ritase INTEGER NOT NULL CONSTRAINT chk_jumlah_ritase CHECK (jumlah_ritase >= 0),
    tonase NUMERIC(10,2) NOT NULL CONSTRAINT chk_tonase CHECK (tonase >= 0),
    tarif_per_ritase NUMERIC(15,2) NOT NULL CONSTRAINT chk_tarif_per_ritase CHECK (tarif_per_ritase >= 0),
    total_pendapatan NUMERIC(15,2) NOT NULL CONSTRAINT chk_total_pendapatan CHECK (total_pendapatan >= 0),
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
    gaji_pokok NUMERIC(15,2) NOT NULL CONSTRAINT chk_payroll_pokok CHECK (gaji_pokok >= 0),
    insentif_ritase NUMERIC(15,2) NOT NULL CONSTRAINT chk_payroll_insentif CHECK (insentif_ritase >= 0),
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
    pelanggan_id UUID NOT NULL REFERENCES public.pelanggan(id) ON DELETE RESTRICT,
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

-- =========================================================================
-- INDEXES FOR PERFORMANCE
-- =========================================================================
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_unit_status ON public.unit(status);
CREATE INDEX idx_driver_status ON public.driver(status);
CREATE INDEX idx_driver_profile ON public.driver(profile_id);
CREATE INDEX idx_ritase_tanggal ON public.ritase(tanggal);
CREATE INDEX idx_ritase_status ON public.ritase(status);
CREATE INDEX idx_ritase_driver ON public.ritase(driver_id);
CREATE INDEX idx_ritase_unit ON public.ritase(unit_id);
CREATE INDEX idx_bbm_tanggal ON public.bbm(tanggal);
CREATE INDEX idx_bbm_unit ON public.bbm(unit_id);
CREATE INDEX idx_maintenance_tanggal ON public.maintenance(tanggal);
CREATE INDEX idx_maintenance_unit ON public.maintenance(unit_id);
CREATE INDEX idx_payroll_driver ON public.payroll(driver_id);
CREATE INDEX idx_payroll_period ON public.payroll(tahun, bulan);
CREATE INDEX idx_invoice_pelanggan ON public.invoice(pelanggan_id);

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
CREATE TRIGGER tr_pelanggan_updated_at BEFORE UPDATE ON public.pelanggan FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_lokasi_loading_updated_at BEFORE UPDATE ON public.lokasi_loading FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_lokasi_dumping_updated_at BEFORE UPDATE ON public.lokasi_dumping FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_unit_updated_at BEFORE UPDATE ON public.unit FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_driver_updated_at BEFORE UPDATE ON public.driver FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_ritase_updated_at BEFORE UPDATE ON public.ritase FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_bbm_updated_at BEFORE UPDATE ON public.bbm FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_maintenance_updated_at BEFORE UPDATE ON public.maintenance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_payroll_updated_at BEFORE UPDATE ON public.payroll FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_invoice_updated_at BEFORE UPDATE ON public.invoice FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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
ALTER TABLE public.pelanggan ENABLE ROW LEVEL SECURITY;
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

-- 1. Profiles Policies
CREATE POLICY "Profiles are viewable by authenticated users" 
    ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Profiles can be updated by Owner or Admin" 
    ON public.profiles FOR UPDATE TO authenticated 
    USING (public.get_user_role() IN ('Owner', 'Admin'))
    WITH CHECK (public.get_user_role() IN ('Owner', 'Admin'));

-- 2. Master Data (Pelanggan, Lokasi) Policies
CREATE POLICY "Master data viewable by authenticated users" 
    ON public.pelanggan FOR SELECT TO authenticated USING (true);
CREATE POLICY "Master data writeable by Owner, Full Access, Admin" 
    ON public.pelanggan FOR ALL TO authenticated 
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
