# Panel privado de Zona Audio

## Configuración de Supabase

1. Abre tu proyecto en [Supabase](https://supabase.com).
2. Ve a **SQL Editor** y ejecuta el archivo `supabase/schema.sql`.
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
- Los cambios se reflejan en el catálogo público.

## Seguridad

- Todas las rutas de escritura verifican la sesión de Supabase y el correo autorizado.
- La clave `service_role` solo se utiliza en el servidor.
- La tabla de productos solo permite lectura pública de productos publicados mediante RLS.
- El bucket `product-images` es público para que las imágenes puedan mostrarse en la tienda.
