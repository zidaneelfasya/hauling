-- Drop nilai_kontrak, target_margin, and budget_operasional from kontrak_hauling table
ALTER TABLE public.kontrak_hauling 
DROP COLUMN IF EXISTS nilai_kontrak,
DROP COLUMN IF EXISTS target_margin,
DROP COLUMN IF EXISTS budget_operasional;
