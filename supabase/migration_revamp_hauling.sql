-- 1. Alter public.driver table
ALTER TABLE public.driver 
ADD COLUMN IF NOT EXISTS accumulated_ritase INTEGER NOT NULL DEFAULT 0 CONSTRAINT chk_accumulated_ritase CHECK (accumulated_ritase >= 0);

-- 2. Alter public.ritase table
ALTER TABLE public.ritase 
ADD COLUMN IF NOT EXISTS jenis_pengiriman TEXT CONSTRAINT chk_jenis_pengiriman CHECK (jenis_pengiriman IN ('Pit ke tongkang', 'Pit ke stockfile', 'Quary', 'Stockpile ke tongkang')),
ADD COLUMN IF NOT EXISTS biaya_bbm NUMERIC(15,2) DEFAULT 0 CONSTRAINT chk_biaya_bbm CHECK (biaya_bbm >= 0);

-- Update existing NULL records for jenis_pengiriman
UPDATE public.ritase SET jenis_pengiriman = 'Pit ke tongkang' WHERE jenis_pengiriman IS NULL;

-- Make jenis_pengiriman NOT NULL
ALTER TABLE public.ritase ALTER COLUMN jenis_pengiriman SET NOT NULL;

-- Calculate current accumulated_ritase for active drivers based on existing approved ritases
UPDATE public.driver d
SET accumulated_ritase = COALESCE((
    SELECT SUM(jumlah_ritase) 
    FROM public.ritase r 
    WHERE r.driver_id = d.id AND r.status = 'Approved'
), 0);

-- 3. Alter public.payroll table
-- First check if new columns exist, otherwise add them
ALTER TABLE public.payroll 
ADD COLUMN IF NOT EXISTS jumlah_ritase INTEGER NOT NULL DEFAULT 0 CONSTRAINT chk_payroll_jumlah_ritase CHECK (jumlah_ritase >= 0),
ADD COLUMN IF NOT EXISTS tarif_per_ritase NUMERIC(15,2) NOT NULL DEFAULT 50000 CONSTRAINT chk_payroll_tarif_per_ritase CHECK (tarif_per_ritase >= 0);

-- Migrate old data: convert historical total_gaji into trip counts based on Rp 50.000 rate where appropriate, or just set defaults
UPDATE public.payroll 
SET jumlah_ritase = COALESCE(floor((insentif_ritase) / 50000), 0),
    tarif_per_ritase = 50000
WHERE insentif_ritase > 0;

-- Now drop old columns
ALTER TABLE public.payroll 
DROP COLUMN IF EXISTS gaji_pokok,
DROP COLUMN IF EXISTS insentif_ritase;

-- 4. Create trigger to update driver.accumulated_ritase automatically on ritase changes
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

DROP TRIGGER IF EXISTS tr_ritase_accumulated_update ON public.ritase;

CREATE TRIGGER tr_ritase_accumulated_update
AFTER INSERT OR UPDATE OR DELETE ON public.ritase
FOR EACH ROW EXECUTE FUNCTION public.update_driver_accumulated_ritase();

-- 5. Create trigger to reset driver.accumulated_ritase to 0 when payroll is set to 'Paid'
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

DROP TRIGGER IF EXISTS tr_payroll_paid_reset ON public.payroll;

CREATE TRIGGER tr_payroll_paid_reset
AFTER INSERT OR UPDATE ON public.payroll
FOR EACH ROW EXECUTE FUNCTION public.reset_driver_accumulated_ritase_on_paid();
