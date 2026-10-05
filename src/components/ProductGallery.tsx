"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  images: string[];
  alt: string;
  imageFit?: "cover" | "contain";
  agotado?: boolean;
};

/** Galeria con minaturas: al tocar una, cambia la imagen principal. */
export function ProductGallery({
  images,
  alt,
  imageFit = "cover",
  agotado = false,
}: Props) {
  const disponibles = images.filter(Boolean);
  const [activa, setActiva] = useState(0);
  const principal = disponibles[activa] ?? disponibles[0];
  const ajuste = imageFit === "contain" ? "object-contain p-4" : "object-cover";

  if (!principal) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-3xl border border-[#3F3F46] bg-[#27272A] text-sm text-[#e3deda]">
        Sin imagen
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={`relative aspect-square overflow-hidden rounded-3xl border border-[#3F3F46] ${
          imageFit === "contain" ? "bg-[#E5E7EB]" : "bg-[#27272A]"
        }`}
      >
        <Image
          src={principal}
          alt={activa === 0 ? alt : `${alt} — imagen ${activa + 1}`}
          fill
          priority={activa === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={ajuste}
        />
        {agotado && (
          <span className="absolute left-4 top-4 rounded-lg bg-[#e3deda] px-3 py-1 text-xs font-black uppercase text-[#121212]">
            Agotado
          </span>
        )}
      </div>

      {disponibles.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {disponibles.map((img, indice) => (
            <button
              key={img}
              type="button"
              onClick={() => setActiva(indice)}
              aria-label={`Ver imagen ${indice + 1} de ${alt}`}
              aria-current={indice === activa}
              className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 transition ${
                indice === activa
                  ? "border-[#d47217]"
                  : "border-[#3F3F46] hover:border-[#d47217]/60"
              } ${imageFit === "contain" ? "bg-[#E5E7EB]" : "bg-[#121212]"}`}
            >
              <Image
                src={img}
                alt=""
                fill
                sizes="80px"
                className={ajuste}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}