"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import type { Product } from "@/data/products";
import { useCartStore } from "@/store/useStore";
import { productWithVariant } from "@/components/VariantPicker";
import { medirAgregadoAlCarrito } from "@/components/MetaPixelEvents";
import { formatProductPrice } from "@/utils/formatPrice";
import { formatVes, useBcvRate } from "@/components/BcvRateProvider";

type Props = {
  product: Product;
};

/**
 * Selector compacto de variantes para la tarjeta del catalogo.
 * Permite elegir la medida y ver el precio sin salir de la pagina principal.
 */
export function CardVariantPicker({ product }: Props) {
  const variantes = product.variants ?? [];
  const [elegida, setElegida] = useState(variantes[0]?.id ?? "");
  const { addItem } = useCartStore();
  const { rate } = useBcvRate();
  const [agregado, setAgregado] = useState(false);

  const seleccionada =
    variantes.find((v) => v.id === elegida) ?? variantes[0] ?? null;
  const sinStock = variantes.every((v) => v.stock <= 0);
  const agotada = seleccionada ? seleccionada.stock <= 0 : false;
  const precio = seleccionada?.price ?? product.price;

  const agregar = () => {
    if (!seleccionada) return;
    const conVariante = productWithVariant(product, seleccionada);
    addItem(conVariante, 1);
    medirAgregadoAlCarrito(conVariante, 1);
    setAgregado(true);
    window.setTimeout(() => setAgregado(false), 1600);
  };

  return (
    <div className="relative z-10 space-y-2 border-t border-[#3F3F46] pt-2.5">
      <div className="flex flex-wrap gap-1.5">
        {variantes.map((variante) => {
          const activa = variante.id === elegida;
          const sinUnidades = variante.stock <= 0;
          return (
            <button
              key={variante.id}
              type="button"
              onClick={() => setElegida(variante.id)}
              aria-pressed={activa}
              className={`relative z-10 rounded-lg border px-2 py-1 text-[10px] font-bold transition ${
                sinUnidades
                  ? "border-[#3F3F46] text-[#e3deda] line-through opacity-60"
                  : activa
                    ? "border-[#d47217] bg-[#d47217]/15 text-[#d47217]"
                    : "border-[#52525B] text-[#e3deda] hover:border-[#d47217]/60 hover:text-white"
              }`}
            >
              {variante.name}
            </button>
          );
        })}
      </div>

      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-black text-[#d47217] font-mono leading-none">
            {formatProductPrice(product, precio)}
          </div>
          {rate > 0 && (
            <div className="mt-0.5 text-[9px] text-[#e3deda] truncate">
              ≈ {formatVes(preccionBCV(precio, rate))}
            </div>
          )}
          {seleccionada && (
            <div className="mt-0.5 text-[9px] text-[#e3deda]">
              {seleccionada.stock > 0
                ? `${seleccionada.stock} disponible${seleccionada.stock === 1 ? "" : "s"}`
                : "Agotado"}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={agregar}
          disabled={sinStock || agotada}
          aria-label={
            sinStock
              ? `${product.name} sin opciones disponibles`
              : `Agregar ${product.name} ${seleccionada?.name ?? ""} al carrito`
          }
          className={`relative z-10 p-2 sm:p-2.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center shrink-0 ${
            sinStock || agotada
              ? "bg-[#3F3F46] text-[#e3deda] cursor-not-allowed"
              : "active:scale-95 cursor-pointer " +
                (agregado
                  ? "bg-[#d47217] text-white"
                  : "bg-gradient-to-r from-[#d47217] to-[#d47217] hover:opacity-95 text-white hover:shadow-[#d47217]/25")
          }`}
        >
          {sinStock ? (
            <span className="text-[9px] font-black uppercase">Agotado</span>
          ) : agotada ? (
            <span className="text-[9px] font-black uppercase">Agotado</span>
          ) : agregado ? (
            <Check className="w-4 h-4" />
          ) : (
            <ShoppingCart className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}

function preccionBCV(precio: number, rate: number) {
  return precio * rate;
}
