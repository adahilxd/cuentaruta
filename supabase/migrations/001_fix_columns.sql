-- ============================================================
-- Migración 001: Alinear columnas con el código UI
-- Ejecutar en Supabase SQL Editor si ya corriste schema.sql anterior
-- ============================================================

-- ─── cr_trayectos ────────────────────────────────────────────
-- Renombrar ruta → origen (o agregar si no existe)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cr_trayectos' AND column_name='ruta') THEN
    ALTER TABLE cr_trayectos RENAME COLUMN ruta TO origen;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cr_trayectos' AND column_name='origen') THEN
    ALTER TABLE cr_trayectos ADD COLUMN origen text;
  END IF;
END $$;

-- Agregar destino si no existe
ALTER TABLE cr_trayectos ADD COLUMN IF NOT EXISTS destino text;

-- Agregar km si no existe (unificado, en lugar de km_ini/km_fin)
ALTER TABLE cr_trayectos ADD COLUMN IF NOT EXISTS km numeric;

-- Agregar semana si no existe
ALTER TABLE cr_trayectos ADD COLUMN IF NOT EXISTS semana int;

-- Agregar notas si no existe
ALTER TABLE cr_trayectos ADD COLUMN IF NOT EXISTS notas text;

-- ─── cr_viaticos ─────────────────────────────────────────────
-- Renombrar concepto → categoria
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cr_viaticos' AND column_name='concepto') THEN
    ALTER TABLE cr_viaticos RENAME COLUMN concepto TO categoria;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cr_viaticos' AND column_name='categoria') THEN
    ALTER TABLE cr_viaticos ADD COLUMN categoria text;
  END IF;
END $$;

-- Agregar descripcion
ALTER TABLE cr_viaticos ADD COLUMN IF NOT EXISTS descripcion text;

-- Agregar semana
ALTER TABLE cr_viaticos ADD COLUMN IF NOT EXISTS semana int;

-- ─── cr_documentos ───────────────────────────────────────────
-- Renombrar valor → costo
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cr_documentos' AND column_name='valor') THEN
    ALTER TABLE cr_documentos RENAME COLUMN valor TO costo;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cr_documentos' AND column_name='costo') THEN
    ALTER TABLE cr_documentos ADD COLUMN costo numeric;
  END IF;
END $$;

-- Agregar notas
ALTER TABLE cr_documentos ADD COLUMN IF NOT EXISTS notas text;

-- ─── Actualizar CHECK constraint de cr_trayectos.estado ──────
ALTER TABLE cr_trayectos DROP CONSTRAINT IF EXISTS cr_trayectos_estado_check;
ALTER TABLE cr_trayectos ADD CONSTRAINT cr_trayectos_estado_check
  CHECK (estado IN ('pendiente', 'pagado', 'en_revision', 'aprobado', 'rechazado'));
