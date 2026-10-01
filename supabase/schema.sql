-- Zona Audio · catálogo y autenticación
-- Ejecuta este archivo en Supabase > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text not null default 'Zona Audio',
  category text not null default 'Accesorios',
  subcategory text not null default '',
  price numeric(12, 2) not null default 0,
  original_price numeric(12, 2),
  rating numeric(3, 2) not null default 0,
  review_count integer not null default 0,
  stock integer not null default 0,
  is_new boolean not null default false,
  is_featured boolean not null default false,
  is_best_seller boolean not null default false,
  is_top_deal boolean not null default false,
  has_audio_preview boolean not null default false,
  free_shipping boolean not null default false,
  image_fit text not null default 'cover' check (image_fit in ('cover', 'contain')),
  images text[] not null default '{}',
  description text not null default '',
  specs jsonb not null default '{}'::jsonb,
  features text[] not null default '{}',
  sound_demo jsonb not null default '{}'::jsonb,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_published_idx on public.products (is_published);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_brand_idx on public.products (brand);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;

drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories"
on public.categories for select
to anon, authenticated
using (true);

drop policy if exists "Public can read brands" on public.brands;
create policy "Public can read brands"
on public.brands for select
to anon, authenticated
using (true);

drop policy if exists "Public can read published products" on public.products;
create policy "Public can read published products"
on public.products for select
to anon, authenticated
using (is_published = true);

-- El panel usa la service role del servidor después de validar el correo admin.
-- No se otorgan permisos de escritura al navegador.

insert into public.categories (name)
values
  ('Teclados y pianos'),
  ('Audio profesional y micrófonos'),
  ('Baterías y percusión'),
  ('Accesorios')
on conflict (name) do nothing;

insert into public.brands (name)
values
  ('Zona Audio'),
  ('Shure'),
  ('Universal Pro'),
  ('Yamaha'),
  ('U12 Series'),
  ('Professional Stand')
on conflict (name) do nothing;

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

-- Bucket público para las imágenes de productos.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');
