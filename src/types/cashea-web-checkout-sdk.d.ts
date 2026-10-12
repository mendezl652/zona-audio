// El paquete cashea-web-checkout-sdk no incluye tipos de TypeScript.
// Estos son los metodos que usa Zona Audio, segun el README y el codigo
// publicado del SDK (dist/webcheckout-sdk.min.js).

declare module "cashea-web-checkout-sdk" {
  export type CasheaProducto = {
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

  export type CasheaPayload = {
    deliveryMethod: "IN_STORE" | "DELIVERY";
    redirectUrl: string;
    merchantName: string;
    orders: {
      store: { id: number; name: string; enabled: boolean };
      products: CasheaProducto[];
    }[];
    identificationNumber: string;
    invoiceId?: string;
    externalClientId: string;
    deliveryPrice?: number;
  };

  export default class CheckoutSDK {
    constructor(config: { apiKey: string });
    createCheckoutButton(options: {
      payload: CasheaPayload;
      container: HTMLElement;
    }): void;
  }
}
