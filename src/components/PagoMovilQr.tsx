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
      width={1080}
      height={1920}
      onError={() => setNoCargada(true)}
      className="w-full max-w-[280px] h-auto rounded-xl border border-[#d47217]/30 bg-white p-1"
    />
  );
}