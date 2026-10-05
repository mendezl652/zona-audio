-- Zona Audio · permitir que la tienda lea las variantes activas
-- Sin esta politica, la tabla product_variants queda bloqueada para el
-- publico y el selector de medidas no aparece en la web.

drop policy if exists "lectura publica de variantes activas" on public.product_variants;

create policy "lectura publica de variantes activas"
  on public.product_variants
  for select
  to anon, authenticated
  using (is_active = true);