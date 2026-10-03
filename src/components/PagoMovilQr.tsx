"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Codigo QR de pago movil interbancario.
 * Si la imagen no esta en /public/pago-movil-qr.png, el bloque desaparece
 * en lugar de mostrar un icono roto.
 */
export function PagoMovilQr() {
  const [noCargada, setNoCargada] = useState(false);

  if (noCargada) return null;

  return (
    <Image
      src="/pago-movil-qr.png"
      alt="Codigo QR de pago movil interbancario de Zona Audio"
      width={1195}
      height={1200}
      // Sin optimizacion: Next convierte a WebP/AVIF y redimensiona,
      // lo cual rompe la lectura del codigo QR.
      unoptimized
      onError={() => setNoCargada(true)}
      className="w-full max-w-[300px] h-auto rounded-xl bg-white p-1"
    />
  );
}