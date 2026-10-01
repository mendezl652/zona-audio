-- Zona Audio · categorías del catálogo
-- Ejecuta este archivo en Supabase > SQL Editor.

-- 1. Reemplaza las categorías existentes por las definitivas.
delete from public.categories;

insert into public.categories (name) values
  ('Audio'),
  ('Instrumentos'),
  ('Tecnología'),
  ('Accesorios');

-- 2. Mueve los productos a la categoría que les corresponde.
update public.products
set category = 'Audio'
where category ilike 'Audio%';

update public.products
set category = 'Instrumentos'
where category ilike 'Baterías%'
   or category ilike 'Teclados%';