"use client";

import { useMemo, useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import type { Product, ProductVariant } from "@/data/products";
import { useCartStore } from "@/store/useStore";
import { formatProductPrice } from "@/utils/formatPrice";
import { formatVes, useBcvRate } from "@/components/BcvRateProvider";
import { medirAgregadoAlCarrito } from "@/components/MetaPixelEvents";

/** Devuelve una copia del producto con los datos de la variante elegida. */
export function productWithVariant(product: Product, variant: ProductVariant): Product {
  return {
    ...product,
    // El id de la variante hace que cada medida sea un item distinto en el carrito.
    id: variant.id,
    name: `${product.name} — ${variant.name}`,
    price: variant.price,
    stock: variant.stock,
    variantId: variant.id,
    variantLabel: variant.name,
    baseProductId: product.id,
  };
}

type Props = {
  product: Product;
};

/**
 * Selector de opciones del producto. Si el producto no tiene variantes,
 * muestra el boton de compra normal.
 */
export function VariantPicker({ product }: Props) {
  const variantes = useMemo(() => product.variants ?? [], [product.variants]);
  const tieneVariantes = variantes.length > 0;
  const [elegida, setElegida] = useState<string>(variantes[0]?.id ?? "");
  const { addItem } = useCartStore();
  const { rate } = useBcvRate();
  const [agregado, setAgregado] = useState(false);

  const seleccionada = useMemo(
    () => variantes.find((v) => v.id === elegida) ?? variantes[0],
    [variantes, elegida]
  );

  const precioMostrado = tieneVariantes ? (seleccionada?.price ?? product.price) : product.price;
  const stockMostrado = tieneVariantes ? (seleccionada?.stock ?? 0) : product.stock;
  const agotado = stockMostrado <= 0;
  const sinOpciones = tieneVariantes && variantes.every((v) => v.stock <= 0);

  const agregar = () => {
    const item = tieneVariantes && seleccionada
      ? productWithVariant(product, seleccionada)
      : product;
    addItem(item, 1);
    medirAgregadoAlCarrito(item, 1);
    setAgregado(true);
    window.setTimeout(() => setAgregado(false), 1800);
  };

  return (
    <div className="space-y-4">
      {tieneVariantes && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#e3deda]">
            Elige la opción
          </p>
          <div className="grid gap-2">
            {variantes.map((variante) => {
              const activa = variante.id === elegida;
              const sinStock = variante.stock <= 0;
              return (
                <button
                  key={variante.id}
                  type="button"
                  onClick={() => setElegida(variante.id)}
                  aria-pressed={activa}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition ${
                    activa
                      ? "border-[#d47217] bg-[#d47217]/10"
                      : sinStock
                        ? "border-[#3F3F46] bg-[#121212] opacity-60"
                        : "border-[#52525B] bg-[#121212] hover:border-[#d47217]/60"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-white">
                      {variante.name}
                    </span>
                    <span className="block text-[11px] text-[#e3deda]">
                      {sinStock ? "Agotado" : `${variante.stock} disponible${variante.stock === 1 ? "" : "s"}`}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="font-mono text-sm font-black text-[#d47217]">
                      ${variante.price.toFixed(2)}
                    </span>
                    {activa && <Check className="h-4 w-4 text-[#d47217]" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-mono text-2xl font-black text-[#d47217]">
          {formatProductPrice(product, precioMostrado)}
        </span>
        {rate > 0 && (
          <span className="text-xs text-[#e3deda]">
            ≈ Bs. {formatVes(precioMostrado * rate)}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={agregar}
        disabled={agotado || sinOpciones}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-white transition disabled:cursor-not-allowed disabled:bg-[#3F3F46] disabled:text-[#e3deda] sm:w-auto ${
          agotado || sinOpciones
            ? ""
            : agregado
              ? "bg-[#d47217]"
              : "bg-gradient-to-r from-[#d47217] to-[#d47217] hover:opacity-95"
        }`}
      >
        {sinOpciones ? (
          "Sin opciones disponibles"
        ) : agotado ? (
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

      {tieneVariantes && (
        <p className="text-xs text-[#e3deda]">
          Cada opción se agrega por separado al carrito. 20% de descuento en pagos en divisas.
        </p>
      )}
    </div>
  );
}