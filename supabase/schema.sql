-- ============================================================
-- CuentaRuta — Schema principal
-- Ejecutar en: Supabase → SQL Editor
-- ============================================================

-- ─── USUARIOS ────────────────────────────────────────────────
create table cr_usuarios (
  id               uuid references auth.users primary key,
  nombre           text,
  telefono         text,
  placa            text,
  empresa          text,
  rol              text check (rol in ('conductor', 'contratista')),
  contratista_id   uuid references cr_usuarios(id),
  plan             text default 'trial',
  trial_ends_at    timestamptz default now() + interval '14 days',
  paddle_customer_id      text,
  paddle_subscription_id  text,
  created_at       timestamptz default now()
);

-- ─── TRAYECTOS ───────────────────────────────────────────────
create table cr_trayectos (
  id           uuid primary key default gen_random_uuid(),
  conductor_id uuid references cr_usuarios(id) on delete cascade,
  fecha        date not null,
  semana       int,
  ruta         text,
  cliente      text,
  km_ini       numeric,
  km_fin       numeric,
  hora_ini     time,
  hora_fin     time,
  horas        numeric,
  extras       numeric default 0,
  valor        numeric,
  factura      text,
  estado       text default 'pendiente'
               check (estado in ('pendiente', 'pagado', 'aprobado', 'rechazado')),
  foto_ini_url text,
  foto_fin_url text,
  notas        text,
  created_at   timestamptz default now()
);

-- ─── VIÁTICOS ────────────────────────────────────────────────
create table cr_viaticos (
  id           uuid primary key default gen_random_uuid(),
  conductor_id uuid references cr_usuarios(id) on delete cascade,
  fecha        date not null,
  concepto     text not null,
  monto        numeric not null,
  tipo_pago    text,
  notas        text,
  created_at   timestamptz default now()
);

-- ─── FLUJO SEMANAL ───────────────────────────────────────────
create table cr_flujo (
  id            uuid primary key default gen_random_uuid(),
  conductor_id  uuid references cr_usuarios(id) on delete cascade,
  semana        int,
  fecha_salida  date,
  salidas       numeric default 0,
  fecha_ingreso date,
  ingresos      numeric default 0,
  obs           text,
  estado        text default 'pendiente'
                check (estado in ('pendiente', 'pagado')),
  created_at    timestamptz default now()
);

-- ─── DOCUMENTOS ──────────────────────────────────────────────
create table cr_documentos (
  id           uuid primary key default gen_random_uuid(),
  conductor_id uuid references cr_usuarios(id) on delete cascade,
  nombre       text not null,
  vencimiento  date,
  valor        numeric,
  estado       text default 'vigente'
               check (estado in ('vigente', 'vence_pronto', 'vencido')),
  created_at   timestamptz default now()
);

-- ─── REFERIDOS ───────────────────────────────────────────────
create table cr_referidos (
  id           uuid primary key default gen_random_uuid(),
  referente_id uuid references cr_usuarios(id),
  referido_id  uuid references cr_usuarios(id),
  porcentaje   numeric default 30,
  estado       text default 'activo',
  fecha        timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table cr_usuarios  enable row level security;
alter table cr_trayectos enable row level security;
alter table cr_viaticos  enable row level security;
alter table cr_flujo     enable row level security;
alter table cr_documentos enable row level security;
alter table cr_referidos enable row level security;

-- ─── POLÍTICAS ───────────────────────────────────────────────

-- cr_usuarios
create policy "usuario ve su perfil"
  on cr_usuarios for select
  using (auth.uid() = id);

create policy "usuario actualiza su perfil"
  on cr_usuarios for update
  using (auth.uid() = id);

create policy "usuario inserta su perfil"
  on cr_usuarios for insert
  with check (auth.uid() = id);

-- cr_trayectos
create policy "conductor ve sus trayectos"
  on cr_trayectos for all
  using (auth.uid() = conductor_id);

-- Contratista ve trayectos de sus conductores
create policy "contratista ve trayectos de sus conductores"
  on cr_trayectos for select
  using (
    exists (
      select 1 from cr_usuarios c
      where c.id = cr_trayectos.conductor_id
        and c.contratista_id = auth.uid()
    )
  );

-- cr_viaticos
create policy "conductor ve sus viaticos"
  on cr_viaticos for all
  using (auth.uid() = conductor_id);

create policy "contratista ve viaticos de sus conductores"
  on cr_viaticos for select
  using (
    exists (
      select 1 from cr_usuarios c
      where c.id = cr_viaticos.conductor_id
        and c.contratista_id = auth.uid()
    )
  );

-- cr_flujo
create policy "conductor ve su flujo"
  on cr_flujo for all
  using (auth.uid() = conductor_id);

-- cr_documentos
create policy "conductor ve sus documentos"
  on cr_documentos for all
  using (auth.uid() = conductor_id);

create policy "contratista ve documentos de sus conductores"
  on cr_documentos for select
  using (
    exists (
      select 1 from cr_usuarios c
      where c.id = cr_documentos.conductor_id
        and c.contratista_id = auth.uid()
    )
  );

-- cr_referidos
create policy "usuario ve sus referidos"
  on cr_referidos for select
  using (auth.uid() = referente_id or auth.uid() = referido_id);

-- ============================================================
-- TRIGGER: crear perfil automáticamente al registrarse
-- ============================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.cr_usuarios (id, nombre, rol)
  values (
    new.id,
    new.raw_user_meta_data ->> 'nombre',
    coalesce(new.raw_user_meta_data ->> 'plan', 'conductor')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- ÍNDICES para consultas frecuentes
-- ============================================================

create index idx_trayectos_conductor on cr_trayectos(conductor_id, fecha desc);
create index idx_trayectos_semana    on cr_trayectos(conductor_id, semana);
create index idx_viaticos_conductor  on cr_viaticos(conductor_id, fecha desc);
create index idx_flujo_conductor     on cr_flujo(conductor_id, semana);
create index idx_documentos_venc     on cr_documentos(conductor_id, vencimiento);
create index idx_usuarios_contratista on cr_usuarios(contratista_id);
