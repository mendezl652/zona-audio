-- Zona Audio · historial de facturas
-- Ejecuta este archivo en Supabase > SQL Editor después de schema.sql.

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_name text not null default 'Por definir',
  client_id_rif text not null default '',
  client_phone text not null default '',
  extra_description text not null default '',
  payment_method text not null default 'Por definir',
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12, 2) not null default 0,
  discount numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  markdown text not null default '',
  image_url text not null default '',
  status text not null default 'Enviada',
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invoices_created_at_idx on public.invoices (created_at desc);
create index if not exists invoices_client_name_idx on public.invoices (client_name);

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

alter table public.invoices enable row level security;
