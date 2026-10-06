"use client";

import type { Product } from "@/data/products";
import {
  datosProducto,
  medirEvento,
  type MetaAction,
  type MetaEventName,
} from "@/lib/metaPixel";

/**
 * Reporta al pixel de Meta las acciones del visitante en la tienda:
 * ver un producto, agregarlo al carrito, abrir el checkout y confirmarlo.
 *
 * Los eventos importantes (agregar al carrito y confirmar) se envian dos
 * veces: una al navegador y otra al servidor por la API de conversiones.
 * Eso es lo que Meta llama "deduplicacion" y mejora la precision del
 * seguimiento cuando el navegador bloquea cookies.
 */

type Evento = {
  nombre: MetaEventName;
  params: Record<string, unknown>;
  servidor?: {
    em?: string;
    ph?: string;
    fn?: string;
    city?: string;
    country?: string;
    zp?: string;
    value?: number;
    currency?: string;
    content_ids?: string[];
    content_name?: string;
  };
};

const CIUDAD = "Caracas";
const PAIS = "VE";

/** Envia el mismo evento por la API de conversiones del servidor. */
async function enviarAlServidor(evento: Evento, action: MetaAction) {
  if (typeof window === "undefined") return;

  const cuerpo = {
    data: [
      {
        event_name: evento.nombre,
        event_time: Math.floor(Date.now() / 1000),
        event_id: evento.params.event_id as string,
        action,
        source_url: window.location.href,
        value: evento.servidor?.value,
        currency: evento.servidor?.currency ?? "USD",
        content_ids: evento.servidor?.content_ids,
        content_name: evento.servidor?.content_name,
        em: evento.servidor?.em,
        ph: evento.servidor?.ph,
        fn: evento.servidor?.fn,
        city: evento.servidor?.city,
        country: evento.servidor?.country,
        zp: evento.servidor?.zp,
      },
    ],
  };

  try {
    // keepalive asegura que el evento salga aunque el cliente se cierre.
    await fetch("/api/meta/conversion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
      keepalive: true,
    });
  } catch {
    // Si falla, el evento del navegador ya quedo registrado.
  }
}

/** Registra una vista de producto. */
export function medirVistaProducto(producto: Product) {
  const action = "ver_producto" as MetaAction;
  const eventId = generarId();

  medirEvento(
    "ViewContent",
    { ...datosProducto(producto), event_id: eventId },
    action
  );
  void enviarAlServidor(
    {
      nombre: "ViewContent",
      params: { event_id: eventId },
      servidor: {
        value: Number(producto.price ?? 0),
        content_ids: [producto.id],
        content_name: producto.name,
        city: CIUDAD,
        country: PAIS,
      },
    },
    action
  );
}

/** Registra un producto agregado al carrito. */
export function medirAgregadoAlCarrito(producto: Product, cantidad = 1) {
  const action = "agregar_al_carrito" as MetaAction;
  const eventId = generarId();

  medirEvento(
    "AddToCart",
    { ...datosProducto(producto), event_id: eventId, num_items: cantidad },
    action
  );
  void enviarAlServidor(
    {
      nombre: "AddToCart",
      params: { event_id: eventId },
      servidor: {
        value: Number(producto.price ?? 0) * cantidad,
        content_ids: [producto.id],
        content_name: producto.name,
        city: CIUDAD,
        country: PAIS,
      },
    },
    action
  );
}

/** Registra la apertura del checkout. */
export function medirInicioCheckout(total: number) {
  const action = "iniciar_checkout" as MetaAction;
  const eventId = generarId();

  medirEvento(
    "InitiateCheckout",
    { value: Number(total).toFixed(2), currency: "USD", event_id: eventId },
    action
  );
  void enviarAlServidor(
    {
      nombre: "InitiateCheckout",
      params: { event_id: eventId },
      servidor: { value: total, city: CIUDAD, country: PAIS },
    },
    action
  );
}

/** Registra el pedido confirmado. Es el evento mas importante para Meta. */
export function medirPedidoConfirmado(datos: {
  total: number;
  nombre?: string;
  telefono?: string;
  cedula?: string;
  productos?: { id: string; name: string; price: number; cantidad: number }[];
}) {
  const action = "confirmar_pedido" as MetaAction;
  const eventId = generarId();

  const value = Number(datos.total ?? 0);
  const contentIds = datos.productos?.map((p) => p.id) ?? [];
  const contentNames = datos.productos?.map((p) => `${p.cantidad}x ${p.name}`) ?? [];

  medirEvento(
    "Purchase",
    {
      value: value.toFixed(2),
      currency: "USD",
      event_id: eventId,
      content_ids: contentIds,
      content_name: contentNames.join(", ").slice(0, 200),
      content_type: "product",
      num_items: datos.productos?.reduce((n, p) => n + p.cantidad, 0) ?? 1,
    },
    action
  );

  void enviarAlServidor(
    {
      nombre: "Purchase",
      params: { event_id: eventId },
      servidor: {
        value,
        content_ids: contentIds,
        content_name: contentNames.join(", ").slice(0, 200),
        fn: datos.nombre,
        ph: datos.telefono,
        em: datos.cedula,
        city: CIUDAD,
        country: PAIS,
      },
    },
    action
  );
}

/** Registra un contacto directo por WhatsApp. */
export function medirConsultaWhatsApp(nombre?: string) {
  const action = "consulta_whatsapp" as MetaAction;
  const eventId = generarId();

  medirEvento("Contact", { event_id: eventId }, action);
  void enviarAlServidor(
    {
      nombre: "Contact",
      params: { event_id: eventId },
      servidor: { fn: nombre, city: CIUDAD, country: PAIS },
    },
    action
  );
}

/** Registra que el visitante abrio el carrito. */
export function medirCarritoAbierto(total: number, articulos: number) {
  const action = "abrir_carrito" as MetaAction;
  const eventId = generarId();

  medirEvento(
    "AddToCart",
    {
      value: Number(total ?? 0).toFixed(2),
      currency: "USD",
      event_id: eventId,
      num_items: articulos,
    },
    action
  );
  void enviarAlServidor(
    {
      nombre: "AddToCart",
      params: { event_id: eventId },
      servidor: { value: total, city: CIUDAD, country: PAIS },
    },
    action
  );
}

function generarId(): string {
  return `za-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
