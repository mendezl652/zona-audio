-- Zona Audio · variantes de producto
-- Permite vender un mismo producto en distintas medidas o packs.
-- Ejecuta en Supabase > SQL Editor.

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  name text not null,
  price numeric(12, 2) not null default 0,
  stock integer not null default 0,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_variants_product_idx
  on public.product_variants (product_id);

drop trigger if exists product_variants_set_updated_at on public.product_variants;
create trigger product_variants_set_updated_at
before update on public.product_variants
for each row execute function public.set_updated_at();

alter table public.product_variants enable row level security;

--borra las variantes cuando se elimina el producto
create or replace function public.delete_product_variants()
returns trigger as $$
begin
  delete from public.product_variants where product_id = old.id;
  return old;
end;
$$ language plpgsql;

drop trigger if exists products_cascade_variants on public.products;
create trigger products_cascade_variants
after delete on public.products
for each row execute function public.delete_product_variants();