"use client";

import React, { useEffect } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { medirEvento, META_PIXEL_ID } from "@/lib/metaPixel";

/**
 * Pixel de Meta (Facebook).
 *
 * El script se inyecta desde el servidor con next/script, que es como Meta
 * lo espera: si se cargara solo con useEffect, Meta no lo detectaria hasta
 * despues de que JavaScript corriera y podria marcar el pixel como roto.
 *
 * Meta guarda sus propias cookies (_fbp) para emparejar la visita con la que
 * luego reporta la API de conversiones. Por eso el pixel debe correr siempre,
 * aunque no haya anuncios activos todavia.
 */
export function MetaPixelProvider({ children }: { children: React.ReactNode }) {
  const ruta = usePathname();
  const busqueda = useSearchParams();

  // La primera visita la reporta el bloque de inicializacion de Meta.
  // Este efecto solo cubre los cambios de ruta dentro de la tienda.
  useEffect(() => {
    if (!META_PIXEL_ID || !window.fbq) return;
    medirEvento("PageView", { page_location: window.location.href });
  }, [ruta, busqueda]);

  if (!META_PIXEL_ID) return <>{children}</>;

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        src="https://connect.facebook.net/es_LA/fbevents.js"
      />
      {/* Código base oficial de Meta: crea fbq, lo inicializa y registra PageView */}
      <Script id="meta-pixel-init" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/es_LA/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      {children}
    </>
  );
}
