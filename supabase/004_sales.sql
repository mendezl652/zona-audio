-- Zona Audio · control de ventas y ganancias
-- Ejecuta este archivo en Supabase > SQL Editor.

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  product_name text not null,
  quantity numeric(12, 2) not null check (quantity > 0),
  unit_cost numeric(12, 2) not null default 0,
  unit_price numeric(12, 2) not null default 0,
  gross_revenue numeric(12, 2) not null default 0,
  total_cost numeric(12, 2) not null default 0,
  net_profit numeric(12, 2) not null default 0,
  sale_date date not null default current_date,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sales_sale_date_idx on public.sales (sale_date desc);
create index if not exists sales_product_id_idx on public.sales (product_id);

drop trigger if exists sales_set_updated_at on public.sales;
create trigger sales_set_updated_at
before update on public.sales
for each row execute function public.set_updated_at();

alter table public.sales enable row level security;
