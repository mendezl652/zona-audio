# Panel privado de Zona Audio

## Configuración de Supabase

1. Abre tu proyecto en [Supabase](https://supabase.com).
2. Ve a **SQL Editor** y ejecuta el archivo `supabase/schema.sql`. Si ya tienes la base creada, ejecuta solo las migraciones nuevas: `supabase/002_invoices.sql`, `supabase/003_invoice_fields.sql` y `supabase/004_sales.sql`.
3. En **Authentication → Users**, crea el usuario administrador con correo y contraseña.
4. Copia `.env.example` como `.env.local` y completa:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_ANON
SUPABASE_SERVICE_ROLE_KEY=TU_CLAVE_SERVICE_ROLE
ADMIN_EMAIL=tu-correo@ejemplo.com
```

No publiques `.env.local` ni utilices la clave `service_role` en el navegador.

## Acceso

1. Ejecuta `npm.cmd run dev`.
2. Abre `http://localhost:3000/admin/login`.
3. Inicia sesión con el correo que definiste en `ADMIN_EMAIL`.

## Funciones del panel

- Crear, editar y eliminar productos.
- Subir varias imágenes por producto a Supabase Storage.
- Editar precio, stock, descripción, especificaciones y características.
- Marcar productos como publicados, destacados o novedades.
- Crear y eliminar categorías.
- Crear y eliminar marcas.
- Generar la imagen de la factura, descargarla y guardarla en el historial.
- Registrar ventas con su costo real y calcular ganancias y márgenes.
- Los cambios se reflejan en el catálogo público.

## Facturación

En la pestaña **Facturación** se llena el nombre del cliente, su cédula o RIF, teléfono,
descripción adicional, método de pago y los productos vendidos. Con **Descargar imagen** se
genera el recibo en PNG para enviarlo al cliente; con **Guardar factura** queda almacenado en la
tabla `invoices` para consultarlo, editarlo o eliminarlo después.

## Finanzas

La pestaña **Finanzas** funciona como el administrador financiero de la tienda:

- **Total vendido:** ingreso bruto del periodo (cantidad × precio publicado).
- **Ganancia neta total:** ingreso bruto menos los costos totales.
- **Margen de rentabilidad:** porcentaje de ganancia sobre el total vendido.

El precio de venta no se escribe a mano: el servidor toma el precio publicado del producto en la
tabla `products`, por lo que los reportes siempre coinciden con la página web. El costo unitario sí
lo registras tú, porque es lo que te costó a ti. Cada venta se guarda en la tabla `sales` y puede
editarse o eliminarse.

## Seguridad

- Todas las rutas de escritura verifican la sesión de Supabase y el correo autorizado.
- La clave `service_role` solo se utiliza en el servidor.
- La tabla de productos solo permite lectura pública de productos publicados mediante RLS.
- El bucket `product-images` es público para que las imágenes puedan mostrarse en la tienda.
