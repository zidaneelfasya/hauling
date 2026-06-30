-- Migration: Remove jumlah_unit from kontrak_hauling table
ALTER TABLE public.kontrak_hauling DROP COLUMN IF EXISTS jumlah_unit;
