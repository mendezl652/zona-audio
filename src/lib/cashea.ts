// Zona Audio · Cashea Web Checkout
//
// SDK: cashea-web-checkout-sdk
//
// NOTA sobre la documentacion de Cashea: los nombres de campo que aparecen
// en su web no coinciden con los que el SDK valida de verdad. Estos son los
// que exige el paquete (ver dist/webcheckout-sdk.min.js):
//
//   deliveryMethod        "IN_STORE" | "DELIVERY"
//   redirectUrl           URL absoluta a donde vuelve el cliente
//   merchantName          nombre del comercio
//   orders[]              [{ store: { id: Number, name, enabled: Boolean },
//                           products: [...] }]
//   identificationNumber  cedula o RIF del cliente
//   externalClientId      identificador unico del cliente
//   invoiceId             opcional
//   deliveryPrice         opcional
//
//   products[].id         string
//   products[].name       string
//   products[].sku        string   (obligatorio)
//   products[].description string  (obligatorio)
//   products[].imageUrl   URL absoluta valida
//   products[].quantity   entero >= 1
//   products[].price      >= 0
//   products[].tax        opcional, >= 0
//   products[].discount   opcional, >= 0
//
// El SDK valida el payload en el navegador y, si algo falla, NO abre el
// checkout. Por eso aqui se arma con valores garantizados.

/** Clave publica de Cashea. No es secreta: viaja al navegador por diseño. */
export const CASHEA_PUBLIC_API_KEY = process.env.NEXT_PUBLIC_CASHEA_API_KEY ?? "";

/** Nombre que vera el cliente en la pantalla de pago de Cashea. */
export const CASHEA_MERCHANT_NAME = "Zona Audio";

/** Identificador numerico de la tienda en Cashea. */
export const CASHEA_STORE_ID = 1;

/** A donde Cashea devuelve al cliente tras intentar el pago. */
export const CASHEA_REDIRECT_URL = "https://zonaaudio.com/cashea/retorno";

export type TipoEntregaCashea = "IN_STORE" | "DELIVERY";

export type ProductoCashea = {
  id: string;
  name: string;
  sku: string;
  description: string;
  imageUrl: string;
  quantity: number;
  price: number;
  tax?: number;
  discount?: number;
};

export type PayloadCashea = {
  deliveryMethod: TipoEntregaCashea;
  redirectUrl: string;
  merchantName: string;
  orders: {
    store: { id: number; name: string; enabled: boolean };
    products: ProductoCashea[];
  }[];
  identificationNumber: string;
  invoiceId?: string;
  externalClientId: string;
  deliveryPrice?: number;
};

/** El sitio donde vive la tienda, para armar URLs absolutas de las fotos. */
const ORIGEN = "https://zonaaudio.com";

/**
 * Convierte la ruta de una imagen en una URL absoluta.
 * Cashea exige un URI valido, y las imagenes locales son rutas relativas.
 */
function urlAbsoluta(imagen: string | undefined): string {
  if (!imagen) return `${ORIGEN}/zona-audio-logo.png`;
  if (imagen.startsWith("http")) return imagen;
  return `${ORIGEN}${imagen.startsWith("/") ? "" : "/"}${imagen}`;
}

export type ProductoParaCashea = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images?: string[];
  description?: string;
  brand?: string;
};

/**
 * Arma el payload que Cashea espera.
 *
 * `invoiceId` se usa como externalClientId para que el pedido quede
 * emparejado con el numero de orden que ya genera la tienda.
 */
export function armarPayloadCashea(datos: {
  productos: ProductoParaCashea[];
  identificacion: string;
  invoiceId: string;
  externalClientId: string;
  deliveryMethod?: TipoEntregaCashea;
}): PayloadCashea {
  const productos: ProductoCashea[] = datos.productos.map((p) => ({
    id: p.id,
    name: p.name.slice(0, 120),
    // El SDK exige sku y description como texto obligatorio.
    sku: (p.brand ? `${p.brand}-` : "") + p.id.slice(0, 40),
    description: (p.description?.trim() || p.name).slice(0, 300),
    imageUrl: urlAbsoluta(p.images?.[0]),
    quantity: Math.max(1, Math.floor(p.quantity)),
    // El precio se redondea a 2 decimales: Cashea no acepta mas precision.
    price: Math.round(Number(p.price) * 100) / 100,
    tax: 0,
    discount: 0,
  }));

  return {
    deliveryMethod: datos.deliveryMethod ?? "IN_STORE",
    redirectUrl: CASHEA_REDIRECT_URL,
    merchantName: CASHEA_MERCHANT_NAME,
    orders: [
      {
        store: {
          id: CASHEA_STORE_ID,
          name: CASHEA_MERCHANT_NAME,
          enabled: true,
        },
        products: productos,
      },
    ],
    identificationNumber: datos.identificacion.trim(),
    invoiceId: datos.invoiceId,
    externalClientId: datos.externalClientId,
    deliveryPrice: 0,
  };
}

/**
 * Abre el checkout de Cashea.
 *
 * Se importa el SDK de forma dinamica para que el codigo de Cashea solo se
 * descargue cuando el cliente realmente elige pagar con ese metodo.
 */
export async function abrirCheckoutCashea(payload: PayloadCashea): Promise<void> {
  if (!CASHEA_PUBLIC_API_KEY) {
    throw new Error(
      "Cashea no esta configurado: falta la clave publica de integracion."
    );
  }

  const modulo = await import("cashea-web-checkout-sdk");
  const CheckoutSDK = modulo.default;

  const sdk = new CheckoutSDK({ apiKey: CASHEA_PUBLIC_API_KEY });

  const contenedor = document.createElement("div");
  contenedor.id = "cashea-checkout-container";
  // El SDK necesita un elemento en el DOM donde insertar el boton y disparar
  // la redireccion; se crea fuera de la vista y se quita al terminar.
  contenedor.style.position = "fixed";
  contenedor.style.left = "-9999px";
  contenedor.style.top = "0";
  document.body.appendChild(contenedor);

  try {
    sdk.createCheckoutButton({ payload, container: contenedor });

    // El boton que crea el SDK se dispara solo para abrir la pantalla.
    const boton = contenedor.querySelector("button") as HTMLButtonElement | null;
    if (boton) {
      boton.click();
    }
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "No se pudo iniciar el pago con Cashea."
    );
  } finally {
    // Cashea ya redirigio al cliente; si falla, el nodo sobra.
    window.setTimeout(() => {
      contenedor.remove();
    }, 2000);
  }
}

/** Indica si Cashea esta disponible para mostrar el boton de pago. */
export function casheaDisponible(): boolean {
  return Boolean(CASHEA_PUBLIC_API_KEY);
}
