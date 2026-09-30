# Zona Audio

Tienda en línea de equipos y artículos de audio, con catálogo público, carrito, checkout con tasa
BCV, pago en divisas o bolívares, y un panel privado para administrar productos, facturación y
ganancias.

## Puesta en marcha

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para la tienda y
[http://localhost:3000/admin/login](http://localhost:3000/admin/login) para el panel privado.

## Variables de entorno

Copia `.env.example` como `.env.local` y completa:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_ANON
SUPABASE_SERVICE_ROLE_KEY=TU_CLAVE_SERVICE_ROLE
ADMIN_EMAIL=tu-correo@ejemplo.com
```

`.env.local` está excluido de Git. La clave `service_role` solo se usa en el servidor.

## Base de datos

Ejecuta en Supabase → **SQL Editor**, en este orden:

1. `supabase/schema.sql` (o las migraciones sueltas si la base ya existe)
2. `supabase/002_invoices.sql` — tabla de facturas
3. `supabase/003_invoice_fields.sql` — cédula/RIF, teléfono y descripción adicional
4. `supabase/004_sales.sql` — tabla de ventas y ganancias
5. `supabase/seed.sql` — catálogo inicial de productos

## Funciones

### Tienda

- Catálogo por categorías y marcas, con búsqueda y detalles de producto.
- Carrito persistente en el navegador, cantidades y cupones.
- Checkout en dos modalidades: divisas (14% de descuento) o bolívares con tasa BCV.
- Pedido enviado a WhatsApp con el formato fijo de la tienda.

### Panel privado

- Productos: crear, editar, eliminar, imágenes, precio, stock, especificaciones.
- Categorías y marcas administrables.
- Facturación: generar la imagen de la factura, descargarla, guardarla y buscarla.
- Finanzas: registrar ventas con su costo real y ver total vendido, ganancia neta y margen.

## Más información

- Guía del panel: `docs/PANEL_ADMIN.md`
- Documentación de Next.js: [nextjs.org/docs](https://nextjs.org/docs)