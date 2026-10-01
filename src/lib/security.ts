import { NextResponse } from "next/server";

/**
 * Limitador de intentos en memoria.
 * Evita ataques de fuerza bruta contra el login y endpoints publicos.
 *
 * Nota: en Cloudflare Workers la memoria es efimera por instancia, asi que
 * esto es una primera capa. La proteccion real la pone Cloudflare desde
 * el panel (Rate Limiting / WAF), que es lo que se recomienda configurar.
 */

type Bucket = { count: number; resetAt: number };

const MAX_PORVENTANA = 5;
const VENTANA_MS = 10 * 60 * 1000; // 10 minutos

const buckets = new Map<string, Bucket>();

/** Limpia las entradas vencidas para no crecer sin limite. */
function limpiar() {
  const ahora = Date.now();
  for (const [clave, bucket] of buckets) {
    if (bucket.resetAt <= ahora) buckets.delete(clave);
  }
}

/** Devuelve la IP real del visitante, detras de Cloudflare. */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "desconocida"
  );
}

/** true si la peticion queda permitida; false si ya se paso el limite. */
export function permiteIntento(clave: string): boolean {
  const ahora = Date.now();

  if (buckets.size > 5000) limpiar();

  const bucket = buckets.get(clave);
  if (!bucket || bucket.resetAt <= ahora) {
    buckets.set(clave, { count: 1, resetAt: ahora + VENTANA_MS });
    return true;
  }

  bucket.count += 1;
  return bucket.count <= MAX_PORVENTANA;
}

/** Borra el contador cuando el login fue exitoso. */
export function reiniciarIntentos(clave: string) {
  buckets.delete(clave);
}

/** Cabeceras de seguridad basicas para toda la web. */
export function cabecerasSeguridad(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-XSS-Protection": "0",
    "Strict-Transport-Security":
      "max-age=31536000; includeSubDomains; preload",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(self)",
  };
}

/** Respuesta 429 cuando se supera el limite. */
export function respuestaDemasiadosIntentos(reintentarEnMin: number) {
  return NextResponse.json(
    {
      error:
        "Demasiados intentos. Espera unos minutos antes de volver a intentar.",
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(reintentarEnMin * 60),
        ...cabecerasSeguridad(),
      },
    }
  );
}