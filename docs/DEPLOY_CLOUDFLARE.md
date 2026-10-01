# Despliegue en Cloudflare Workers

Zona Audio usa **OpenNext** para correr Next.js en el runtime de Cloudflare Workers.

## Archivos de configuración

| Archivo | Para qué sirve |
|---|---|
| `open-next.config.ts` | Ajustes de OpenNext (actualmente los predeterminados) |
| `wrangler.jsonc` | Nombre del worker, fecha de compatibilidad y assets |
| `cloudflare-env.d.ts` | Tipos de las variables de entorno (se genera sola) |

## Comandos

```bash
npm run cf:build      # compila para Cloudflare
npm run cf:preview    # compila y prueba en local con el runtime real
npm run cf:deploy     # compila y publica en producción
npm run cf:typegen    # regenera los tipos de variables de entorno
```

## Variables de entorno

Las variables **NO** van en `wrangler.jsonc` para producción. Se configuran como secretos:

```bash
npx wrangler secret put NEXT_PUBLIC_SUPABASE_URL
npx wrangler secret put NEXT_PUBLIC_SUPABASE_ANON_KEY
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put ADMIN_EMAIL
```

Para subirlos todas de una vez, desde una terminal con las variables cargadas:

```bash
npx wrangler secret bulk .dev.vars
```

## Primer despliegue

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Compila:

   ```bash
   npm run cf:build
   ```

3. Publica por primera vez (esto abre el navegador para autorizar a Cloudflare):

   ```bash
   npx wrangler login
   npx wrangler deploy
   ```

4. Configura los secretos:

   ```bash
   npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
   ```

5. Cada cambio en producción:

   ```bash
   npm run cf:deploy
   ```

## Notas importantes

- **Storage de Supabase:** las imágenes de productos y facturas siguen en Supabase, así que
  funcionan igual en producción. El panel sube imágenes al bucket `product-images`.
- **La imagen de la factura** se genera con `canvas` en el navegador del administrador, por lo que
  no depende del runtime de Cloudflare.
- **La base de datos** no cambia: sigue siendo Supabase Postgres.
- El archivo `.open-next/` y `.wrangler/` están en `.gitignore` porque son carpetas de compilación.