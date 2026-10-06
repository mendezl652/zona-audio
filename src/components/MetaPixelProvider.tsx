"use client";

import React, { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { medirEvento, META_PIXEL_ID } from "@/lib/metaPixel";

/**
 * Registra las visitas al cambiar de ruta dentro de la tienda.
 *
 * El pixel base (el script y el PageView inicial) se imprime en el HTML del
 * servidor desde src/app/layout.tsx. Ese bloque tiene que vivir alli porque
 * un componente de React, por mas que use next/script, igualmente inyecta el
 * codigo desde el navegador y los rastreadores de Meta no lo verian.
 *
 * Meta guarda sus propias cookies (_fbp) para emparejar la visita con la que
 * luego reporta la API de conversiones. Por eso el pixel debe correr siempre,
 * aunque no haya anuncios activos todavia.
 */
export function MetaPixelProvider({ children }: { children: React.ReactNode }) {
  const ruta = usePathname();
  const busqueda = useSearchParams();

  // El primer PageView lo manda el bloque del servidor. Este efecto solo
  // cubre los cambios de ruta sin recargar la pagina.
  useEffect(() => {
    if (!META_PIXEL_ID || !window.fbq) return;
    medirEvento("PageView", { page_location: window.location.href });
  }, [ruta, busqueda]);

  return <>{children}</>;
}
