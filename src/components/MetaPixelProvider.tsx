"use client";

import React, { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cargarMetaPixel, medirEvento, META_PIXEL_ID } from "@/lib/metaPixel";

/**
 * Carga el pixel de Meta una vez por pagina y registra la visita.
 *
 * Meta guarda sus propias cookies (_fbp) para emparejar la visita con la
 * que luego reporta la API de conversiones. Por eso el pixel debe correr
 * siempre, aunque no haya anuncios activos todavia.
 */
export function MetaPixelProvider({ children }: { children: React.ReactNode }) {
  const ruta = usePathname();
  const busqueda = useSearchParams();

  // Carga el script y registra la primera visita. Los cambios de ruta los
  // vigila el efecto de abajo, asi que aqui el array va vacio a proposito.
  useEffect(() => {
    if (!META_PIXEL_ID) return;
    cargarMetaPixel();
    medirEvento("PageView");
  }, []);

  useEffect(() => {
    if (!META_PIXEL_ID || !window.fbq) return;
    const url = busqueda?.toString();
    medirEvento("PageView", url ? { page_location: `${ruta}?${url}` } : {});
  }, [ruta, busqueda]);

  return <>{children}</>;
}
