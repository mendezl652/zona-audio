-- Zona Audio · descuento en facturas
-- Ejecuta este archivo si ya habías creado la tabla invoices.

alter table public.invoices
  add column if not exists subtotal numeric(12, 2) not null default 0;

alter table public.invoices
  add column if not exists discount numeric(12, 2) not null default 0;

-- Rellena el subtotal de las facturas anteriores.
update public.invoices
set subtotal = total
where subtotal = 0 and total > 0;