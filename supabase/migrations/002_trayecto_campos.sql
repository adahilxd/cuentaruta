-- ============================================================
-- Migración 002: Campos odómetro, fotos y horas en cr_trayectos
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Odómetro (km inicio / km fin)
ALTER TABLE cr_trayectos ADD COLUMN IF NOT EXISTS km_ini   numeric;
ALTER TABLE cr_trayectos ADD COLUMN IF NOT EXISTS km_fin   numeric;

-- Fotos odómetro (URLs públicas de Storage)
ALTER TABLE cr_trayectos ADD COLUMN IF NOT EXISTS foto_ini_url text;
ALTER TABLE cr_trayectos ADD COLUMN IF NOT EXISTS foto_fin_url text;

-- Horas de turno
ALTER TABLE cr_trayectos ADD COLUMN IF NOT EXISTS h_inicio  text;
ALTER TABLE cr_trayectos ADD COLUMN IF NOT EXISTS h_fin     text;
ALTER TABLE cr_trayectos ADD COLUMN IF NOT EXISTS h_cobrar  numeric;

-- ============================================================
-- Bucket "odometros" en Supabase Storage:
-- Ir a Storage > New bucket > nombre: odometros > Public: ON
-- ============================================================
