"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Heart, ShoppingCart } from "lucide-react";
import type { Product } from "@/data/products";
import { useCartStore, useWishlistStore } from "@/store/useStore";
import { formatProductPrice } from "@/utils/formatPrice";
import { formatVes, useBcvRate } from "@/components/BcvRateProvider";
import { medirAgregadoAlCarrito } from "@/components/MetaPixelEvents";

/** Precio, conversion en bs y boton de compra para la ficha de producto. */
export function ProductActions({ product }: { product: Product }) {
  const { addItem, openCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { rate } = useBcvRate();
  const router = useRouter();
  const [agregado, setAgregado] = useState(false);

  const agotado = (product.stock ?? 0) <= 0;
  const enDeseos = isInWishlist(product.id);

  const agregar = () => {
    addItem(product, 1);
    medirAgregadoAlCarrito(product, 1);
    setAgregado(true);
    window.setTimeout(() => setAgregado(false), 1800);
    openCart();
  };

  const alternarDeseo = () => toggleWishlist(product);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-sm text-[#e3deda]">
          En bolívares:{" "}
          {rate > 0 ? (
            <span className="font-mono font-bold text-white">
              ≈ Bs. {formatVes(product.price * rate)}
            </span>
          ) : (
            <span className="text-[#e3deda]">consultando la tasa BCV...</span>
          )}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={agregar}
          disabled={agotado}
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-white transition disabled:cursor-not-allowed disabled:bg-[#3F3F46] disabled:text-[#e3deda] sm:flex-none ${
            agotado
              ? ""
              : agregado
                ? "bg-[#d47217]"
                : "bg-gradient-to-r from-[#d47217] to-[#d47217] hover:opacity-95"
          }`}
        >
          {agotado ? (
            "Agotado"
          ) : agregado ? (
            <>
              <Check className="h-4 w-4" /> Agregado al carrito
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" /> Agregar al carrito
            </>
          )}
        </button>

        <button
          type="button"
          onClick={alternarDeseo}
          aria-label={
            enDeseos ? "Quitar de la lista de deseos" : "Guardar en la lista de deseos"
          }
          className={`flex h-12 w-12 items-center justify-center rounded-xl border transition ${
            enDeseos
              ? "border-[#d47217] bg-[#d47217] text-white"
              : "border-[#52525B] bg-[#27272A] text-[#e3deda] hover:border-[#d47217] hover:text-white"
          }`}
        >
          <Heart className={`h-4 w-4 ${enDeseos ? "fill-current" : ""}`} />
        </button>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="h-12 rounded-xl border border-[#52525B] bg-[#27272A] px-4 text-xs font-bold text-white transition hover:border-[#d47217]"
        >
          Seguir comprando
        </button>
      </div>

      <p className="text-xs text-[#e3deda]">
        {formatProductPrice(product)} · Envíos a todo el país · 20% de descuento en
        pagos en divisas
      </p>
    </div>
  );
}