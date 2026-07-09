-- Add new columns to the invoice table to support automated calculation
ALTER TABLE public.invoice
ADD COLUMN IF NOT EXISTS tanggal_mulai DATE,
ADD COLUMN IF NOT EXISTS tanggal_selesai DATE,
ADD COLUMN IF NOT EXISTS total_ritase INTEGER NOT NULL DEFAULT 0 CONSTRAINT chk_invoice_total_ritase CHECK (total_ritase >= 0),
ADD COLUMN IF NOT EXISTS potongan NUMERIC(15,2) NOT NULL DEFAULT 0 CONSTRAINT chk_invoice_potongan CHECK (potongan >= 0);
