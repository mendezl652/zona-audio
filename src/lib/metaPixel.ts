// Zona Audio · Pixel de Meta (Facebook) y API de conversiones
//
// El pixel es un identificador publico: se puede leer en el codigo de la
// pagina. NO es una contrasena y no permite entrar a tu cuenta de Meta.
//
// El token de la API de conversiones SI es una credencial privada. Ese
// nunca va aqui ni en el codigo: vive en el servidor (ver src/app/api/meta/conversion).

/**
 * Id del pixel, expuesto al navegador.
 *
 * Este valor es publico por diseno: Meta lo pide pegarlo tal cual en el
 * codigo de la pagina. Se deja como valor por defecto para que funcione
 * aunque la variable de entorno no este configurada en Cloudflare, donde
 * las NEXT_PUBLIC_ se congelan al compilar.
 */
export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "1399377912264569";

/** Origen del sitio, usado para validar los envios del servidor. */
export const META_SITE_ORIGIN = "https://zonaaudio.com";

export type MetaEventName =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase"
  | "Lead"
  | "Contact";

/** Identificador de la accion, util para deduplicar pixel y servidor. */
export type MetaAction =
  | "ver_producto"
  | "agregar_al_carrito"
  | "iniciar_checkout"
  | "confirmar_pedido"
  | "consulta_whatsapp";

type FbqFn = ((...args: unknown[]) => void) & { q?: unknown[][]; loaded?: boolean };

declare global {
  interface Window {
    fbq?: FbqFn;
    _fbq?: FbqFn;
  }
}

/**
 * Carga el script de Meta una sola vez y deja fbq listo para usar.
 * Se llama desde el componente que necesita medir algo.
 */
export function cargarMetaPixel(): void {
  if (typeof window === "undefined") return;
  if (!META_PIXEL_ID) return;

  if (window.fbq) {
    window.fbq("init", META_PIXEL_ID);
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/es_LA/fbevents.js";
  document.head.appendChild(script);

  const fbq = ((...args: unknown[]) => {
    if (fbq.callMethod) return fbq.callMethod(...args);
    // La cola official de Meta: los argumentos se guardan hasta que
    // el script termina de cargar.
    (fbq.q = fbq.q ?? []).push(args);
  }) as FbqFn & { callMethod?: (...args: unknown[]) => void };
  fbq.loaded = true;
  fbq.q = [];

  window.fbq = fbq;
  window._fbq = fbq;

  fbq("init", META_PIXEL_ID);
  fbq("track", "PageView");
}

/**
 * Envia un evento al pixel del navegador.
 * `action` se repite en el servidor para que Meta deduplique.
 */
export function medirEvento(
  nombre: MetaEventName,
  params: Record<string, unknown> = {},
  action?: MetaAction
): void {
  if (typeof window === "undefined") return;
  if (!window.fbq) return;

  if (action) params.action = action;
  window.fbq("track", nombre, params);
}

/** Datos minimos de un producto para los eventos de catalogo. */
export function datosProducto(producto: {
  name: string;
  price: number;
  id: string;
}): Record<string, unknown> {
  return {
    content_ids: [producto.id],
    content_name: producto.name,
    content_type: "product",
    value: Number(producto.price ?? 0).toFixed(2),
    currency: "USD",
  };
}
