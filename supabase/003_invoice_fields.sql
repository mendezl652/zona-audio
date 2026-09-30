-- Zona Audio · campos adicionales de facturas
-- Ejecuta este archivo si ya habías creado la tabla invoices con 002_invoices.sql.

alter table public.invoices
  add column if not exists client_id_rif text not null default '';

alter table public.invoices
  add column if not exists extra_description text not null default '';
