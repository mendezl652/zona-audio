"use client";

import { useEffect } from "react";
import type { Product } from "@/data/products";
import { medirVistaProducto } from "@/components/MetaPixelEvents";

/**
 * Registra la visita a la ficha de un producto.
 *
 * Es un componente aparte porque la pagina del producto se genera en el
 * servidor: asi el evento se manda una sola vez y solo cuando hay pixel
 * configurado.
 */
export function MedirFichaProducto({ producto }: { producto: Product }) {
  useEffect(() => {
    medirVistaProducto(producto);
    // Solo al montar: no se vuelve a medir la misma ficha.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [producto.id]);

  return null;
}
