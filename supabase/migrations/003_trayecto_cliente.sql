-- Migración 003: Campo cliente en cr_trayectos
ALTER TABLE cr_trayectos ADD COLUMN IF NOT EXISTS cliente text;
