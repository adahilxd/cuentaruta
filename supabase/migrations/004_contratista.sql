-- ============================================================
-- CuentaRuta — 004_contratista.sql
-- Sistema contratista-conductor: invitaciones, aprobaciones, notificaciones
-- Ejecutar en: Supabase → SQL Editor
-- ============================================================

-- ─── INVITACIONES ────────────────────────────────────────────
create table if not exists cr_invitaciones (
  id             uuid primary key default gen_random_uuid(),
  contratista_id uuid references cr_usuarios(id) on delete cascade,
  email          text not null,
  token          text unique not null default gen_random_uuid()::text,
  estado         text default 'pendiente'
                 check (estado in ('pendiente', 'aceptada', 'expirada')),
  created_at     timestamptz default now(),
  expires_at     timestamptz default now() + interval '7 days'
);

-- ─── NOTIFICACIONES ──────────────────────────────────────────
create table if not exists cr_notificaciones (
  id              uuid primary key default gen_random_uuid(),
  usuario_id      uuid references cr_usuarios(id) on delete cascade,
  tipo            text not null,
  titulo          text not null,
  mensaje         text not null,
  leida           boolean default false,
  referencia_id   uuid,
  referencia_tipo text,
  created_at      timestamptz default now()
);

-- ─── COLUMNAS NUEVAS EN TRAYECTOS ────────────────────────────
alter table cr_trayectos
  add column if not exists aprobado_por     uuid references cr_usuarios(id),
  add column if not exists aprobado_at      timestamptz,
  add column if not exists motivo_rechazo   text;

-- ─── COLUMNAS NUEVAS EN VIÁTICOS ─────────────────────────────
alter table cr_viaticos
  add column if not exists estado           text default 'pendiente'
    check (estado in ('pendiente', 'aprobado', 'rechazado')),
  add column if not exists aprobado_por     uuid references cr_usuarios(id),
  add column if not exists aprobado_at      timestamptz,
  add column if not exists motivo_rechazo   text;

-- ─── RLS INVITACIONES ────────────────────────────────────────
alter table cr_invitaciones enable row level security;

create policy "contratista gestiona sus invitaciones"
  on cr_invitaciones for all
  using (auth.uid() = contratista_id);

-- Permite leer invitaciones pendientes por token (página /unirse)
create policy "leer invitacion pendiente por token"
  on cr_invitaciones for select
  using (estado = 'pendiente' and expires_at > now());

-- Permite actualizar al aceptar
create policy "aceptar invitacion"
  on cr_invitaciones for update
  using (estado = 'pendiente' and expires_at > now());

-- ─── RLS NOTIFICACIONES ──────────────────────────────────────
alter table cr_notificaciones enable row level security;

create policy "usuario ve sus notificaciones"
  on cr_notificaciones for all
  using (auth.uid() = usuario_id);

-- ─── RLS: CONTRATISTA VE SUS CONDUCTORES ─────────────────────
drop policy if exists "usuario ve su perfil" on cr_usuarios;
create policy "usuario ve su perfil"
  on cr_usuarios for select
  using (auth.uid() = id or contratista_id = auth.uid());

-- ─── RLS TRAYECTOS CONTRATISTA ───────────────────────────────
-- SELECT ya existe en schema.sql; agregar UPDATE
do $$ begin
  create policy "contratista aprueba trayectos"
    on cr_trayectos for update
    using (
      exists (
        select 1 from cr_usuarios
        where id = cr_trayectos.conductor_id
        and contratista_id = auth.uid()
      )
    );
exception when duplicate_object then null;
end $$;

-- ─── RLS VIÁTICOS CONTRATISTA ────────────────────────────────
do $$ begin
  create policy "contratista ve viaticos de sus conductores"
    on cr_viaticos for select
    using (
      exists (
        select 1 from cr_usuarios
        where id = cr_viaticos.conductor_id
        and contratista_id = auth.uid()
      )
    );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "contratista aprueba viaticos"
    on cr_viaticos for update
    using (
      exists (
        select 1 from cr_usuarios
        where id = cr_viaticos.conductor_id
        and contratista_id = auth.uid()
      )
    );
exception when duplicate_object then null;
end $$;
