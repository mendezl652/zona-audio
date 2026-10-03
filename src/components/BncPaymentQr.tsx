"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Codigo QR de pago movil de BNC.
 * Si la imagen no esta en /public/bnc-pago-movil-qr.png, el bloque
 * desaparece en lugar de mostrar un icono roto.
 */
export function BncPaymentQr() {
  const [noCargada, setNoCargada] = useState(false);

  if (noCargada) return null;

  return (
    <Image
      src="/bnc-pago-movil-qr.png"
      alt="Codigo QR Interbancario de BNC para el pago movil de Zona Audio"
      width={755}
      height={780}
      onError={() => setNoCargada(true)}
      className="w-full max-w-[260px] h-auto rounded-xl border border-[#d47217]/30 bg-white p-1"
    />
  );
}