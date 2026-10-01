// Zona Audio · datos de contactocentralizados
// Cambia el número aquí y se actualiza en toda la tienda.

/** Número de WhatsApp en formato internacional, sin signos. */
export const WHATSAPP_NUMBER = "584142868519";

/** Número como se muestra al cliente. */
export const CONTACT_PHONE = "0414-2868519";

/** Mensaje de bienvenida que se abre al escribirle a la página. */
export const WELCOME_MESSAGE =
  "¡Bienvenido a Zona Audio! ¿En qué podemos ayudarte?";

/** Construye un enlace de WhatsApp con mensaje previo. */
export function buildWhatsAppUrl(message: string = WELCOME_MESSAGE): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Redes sociales de Zona Audio. */
export const SOCIAL_LINKS = [
  {
    id: "instagram",
    label: "Instagram",
    handle: "@zona_audio1",
    href: "https://www.instagram.com/zona_audio1",
  },
  {
    id: "tiktok",
    label: "TikTok",
    handle: "@zona.audio",
    href: "https://www.tiktok.com/@zona.audio",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    handle: CONTACT_PHONE,
    href: buildWhatsAppUrl(),
  },
] as const;