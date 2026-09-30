"use client";

import { Check, Volume2 } from "lucide-react";

export type PreviewSpecRow = {
  id: string;
  label: string;
  value: string;
};

type ProductPreviewCardProps = {
  name: string;
  price: number;
  originalPrice: number;
  stock: number;
  description: string;
  specs: PreviewSpecRow[];
  image: string;
  imageFit: "cover" | "contain";
  hasAudioPreview: boolean;
  soundNotes: string;
  isPublished: boolean;
};

/**
 * Réplica de la ficha del producto que ve el cliente en la web.
 * Se actualiza mientras se llena el formulario.
 */
export function ProductPreviewCard({
  name,
  price,
  originalPrice,
  stock,
  description,
  specs,
  image,
  imageFit,
  hasAudioPreview,
  soundNotes,
  isPublished,
}: ProductPreviewCardProps) {
  const visibleSpecs = specs.filter(
    (row) => row.label.trim() && row.value.trim()
  );
  const hasDiscount =
    originalPrice > 0 && originalPrice > price && price > 0;
  const discount = hasDiscount
    ? Math.round((1 - price / originalPrice) * 100)
    : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#3F3F46] bg-[#27272A]">
      <div className="flex items-center justify-between gap-2 border-b border-[#3F3F46] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#e3deda]">
            Vista previa en la web
          </span>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
            isPublished
              ? "bg-[#d47217] text-white"
              : "border border-[#52525B] text-[#e3deda]"
          }`}
        >
          {isPublished ? "Publicado" : "Borrador"}
        </span>
      </div>

      <div className="flex gap-4 p-4">
        <div
          className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-[#121212]"
        >
          {image ? (
            <div
              className="h-full w-full"
              style={{
                backgroundImage: `url("${image}")`,
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize: imageFit === "contain" ? "contain" : "cover",
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-[#e3deda]">
              Sin imagen
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-black text-white">
            {name.trim() || "Nombre del producto"}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <div>
              {hasDiscount && (
                <span className="block text-[10px] text-[#e3deda] line-through">
                  ${originalPrice.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              )}
              <span className="font-mono text-xl font-black text-[#d47217]">
                ${price.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                <span className="ml-1 text-xs text-[#e3deda]">= Bs.</span>
              </span>
            </div>
            {hasDiscount && (
              <span className="rounded-lg border border-[#d47217] bg-[#d47217]/10 px-2 py-1 text-[10px] font-bold text-[#d47217]">
                -{discount}%
              </span>
            )}
            {stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#d47217]/40 bg-[#d47217]/10 px-2.5 py-1.5 text-[11px] font-bold text-[#e3deda]">
                <Check className="h-3.5 w-3.5" />
                {stock.toLocaleString("es-VE")}{" "}
                {stock === 1 ? "unidad disponible" : "unidades disponibles"} en
                Zona Audio
              </span>
            ) : (
              <span className="rounded-lg border border-[#52525B] px-2.5 py-1.5 text-[11px] font-bold text-[#e3deda]">
                Agotado
              </span>
            )}
          </div>

          <p className="mt-3 line-clamp-4 text-xs leading-relaxed text-[#e3deda]">
            {description.trim() || "La descripción del producto aparece aquí."}
          </p>
        </div>
      </div>

      {hasAudioPreview && (
        <div className="mx-4 mb-4 flex items-center justify-between gap-3 rounded-2xl border border-[#52525B] bg-[#121212] p-3">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#e3deda]">
              Vista previa del perfil de sonido
            </span>
            <p className="truncate text-xs font-medium text-white">
              {soundNotes.trim() || "Descripción del perfil de sonido"}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#52525B] px-3.5 py-2 text-xs font-bold text-white">
            <Volume2 className="h-4 w-4" /> Reproducir tono
          </span>
        </div>
      )}

      <div className="px-4 pb-4">
        <span className="block text-xs font-bold uppercase tracking-wider text-[#e3deda]">
          Especificaciones de fábrica
        </span>
        <div className="mt-2 divide-y divide-[#3F3F46] rounded-xl border border-[#52525B] bg-[#121212] p-3 text-xs">
          {visibleSpecs.length === 0 ? (
            <p className="py-1 text-[11px] text-[#e3deda]">
              Las especificaciones que agregues se muestran aquí.
            </p>
          ) : (
            visibleSpecs.map((row) => (
              <div key={row.id} className="flex justify-between gap-4 py-1.5 first:pt-0 last:pb-0">
                <span className="font-medium text-[#e3deda]">{row.label}:</span>
                <span className="max-w-[65%] whitespace-pre-line text-left font-semibold text-white">
                  {row.value}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}