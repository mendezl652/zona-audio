import { NextResponse } from "next/server";
import { cabecerasSeguridad } from "@/lib/security";
import { META_SITE_ORIGIN } from "@/lib/metaPixel";

// API de conversiones de Meta: envia eventos desde el servidor para que
// no se pierdan cuando el navegador bloquea las cookies o el pixel.
//
// El token de acceso es una credencial privada: se lee de META_CAPI_TOKEN
// (secreto en Cloudflare) y NUNCA se expone al navegador.

export const dynamic = "force-dynamic";

const ENDPOINT = `https://graph.facebook.com/v21.0/${process.env.NEXT_PUBLIC_META_PIXEL_ID}/events`;

type Entrada = {
  event_name?: string;
  event_time?: number;
  event_id?: string;
  action?: string;
  source_url?: string;
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_name?: string;
  content_type?: string;
  em?: string;
  ph?: string;
  fn?: string;
  city?: string;
  country?: string;
  zp?: string;
};

const EVENTOS_PERMITIDOS = new Set([
  "PageView",
  "ViewContent",
  "AddToCart",
  "InitiateCheckout",
  "AddPaymentInfo",
  "Purchase",
  "Lead",
  "Contact",
]);

export async function POST(request: Request) {
  const token = process.env.META_CAPI_TOKEN;

  if (!token) {
    // No rompe la tienda: el pixel del navegador sigue funcionando solo.
    return NextResponse.json(
      { ok: false, omitido: "META_CAPI_TOKEN no esta configurado." },
      { status: 200, headers: cabecerasSeguridad() }
    );
  }

  // Solo aceptamos envios desde nuestro propio sitio.
  const origen = request.headers.get("origin");
  if (origen && origen !== META_SITE_ORIGIN) {
    return NextResponse.json(
      { error: "Origen no permitido." },
      { status: 403, headers: cabecerasSeguridad() }
    );
  }

  let datos: { data?: Entrada[] };
  try {
    datos = (await request.json()) as { data?: Entrada[] };
  } catch {
    return NextResponse.json(
      { error: "Cuerpo no valido." },
      { status: 400, headers: cabecerasSeguridad() }
    );
  }

  const entradas = (datos.data ?? []).filter(
    (e) => e.event_name && EVENTOS_PERMITIDOS.has(e.event_name)
  );

  if (entradas.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No hay eventos validos." },
      { status: 400, headers: cabecerasSeguridad() }
    );
  }

  // Los hash son asincronos, asi que se resuelven antes de armar el cuerpo.
  const fbc = cookie(request, "fbc") ?? cookie(request, "_fbp");
  const ahora = Math.floor(Date.now() / 1000);
  const ip = ipDelCliente(request);
  const agente = request.headers.get("user-agent") ?? undefined;

  const eventos = await Promise.all(
    entradas.slice(0, 20).map(async (e) => {
      const eventId = e.event_id ?? `${Date.now()}`;

      const [em, ph, fn, ct, country, zp] = await Promise.all([
        e.em ? hash(e.em) : undefined,
        e.ph ? hash(e.ph) : undefined,
        e.fn ? hash(e.fn) : undefined,
        e.city ? hash(e.city) : undefined,
        e.country ? hash(e.country) : undefined,
        e.zp ? hash(e.zp) : undefined,
      ]);

      const datosUsuario: Record<string, unknown> = {
        client_ip_address: ip,
        client_user_agent: agente,
        fbp: fbc,
      };
      if (em) datosUsuario.em = [em];
      if (ph) datosUsuario.ph = [ph];
      if (fn) datosUsuario.fn = [fn];
      if (ct) datosUsuario.ct = [ct];
      if (country) datosUsuario.country = [country];
      if (zp) datosUsuario.zp = [zp];

      const customData: Record<string, unknown> = {};
      if (e.content_ids) customData.content_ids = e.content_ids;
      if (e.content_name) customData.content_name = e.content_name;
      if (e.content_ids || e.content_name) {
        customData.content_type = e.content_type ?? "product";
      }
      if (typeof e.value === "number" && Number.isFinite(e.value)) {
        customData.value = e.value.toFixed(2);
        customData.currency = e.currency ?? "USD";
      }

      return {
        event_name: e.event_name!,
        event_time: e.event_time ?? ahora,
        // El mismo event_id viaja desde el navegador: asi Meta cuenta el
        // evento una sola vez aunque lo hayan recibido los dos canales.
        event_id: eventId,
        event_source_url: e.source_url ?? `${META_SITE_ORIGIN}/`,
        action: e.action,
        user_data: datosUsuario,
        custom_data:
          Object.keys(customData).length > 0 ? customData : undefined,
      };
    })
  );

  const cuerpo = { data: eventos, access_token: token };

  try {
    const respuesta = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
    });
    const resultado = await respuesta.json();

    return NextResponse.json(
      { ok: respuesta.ok, respuesta: resultado },
      { status: respuesta.ok ? 200 : 502, headers: cabecerasSeguridad() }
    );
  } catch {
    return NextResponse.json(
      { error: "No se pudo contactar a la API de Meta." },
      { status: 502, headers: cabecerasSeguridad() }
    );
  }
}

/** SHA-256 en minusculas: Meta exige ese formato para los datos del usuario. */
async function hash(valor: string): Promise<string> {
  const limpio = valor.trim().toLowerCase();
  const datos = new TextEncoder().encode(limpio);
  const buffer = await crypto.subtle.digest("SHA-256", datos);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** IP real del visitante, para que Meta pueda verificar la geolocalizacion. */
function ipDelCliente(request: Request): string | undefined {
  const conPuerto = request.headers.get("cf-connecting-ip");
  if (conPuerto) return conPuerto;
  const reenviada = request.headers.get("x-forwarded-for");
  if (!reenviada) return undefined;
  return reenviada.split(",")[0]?.trim();
}

function cookie(request: Request, nombre: string): string | undefined {
  const cabecera = request.headers.get("cookie");
  if (!cabecera) return undefined;
  for (const parte of cabecera.split(";")) {
    const [clave, ...resto] = parte.trim().split("=");
    if (clave === nombre) return resto.join("=");
  }
  return undefined;
}


