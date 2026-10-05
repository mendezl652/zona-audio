"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Volume2,
  Heart,
  ShoppingCart,
  Star,
  Check,
  Minus,
  Plus,
  Crown
} from "lucide-react";
import { Product } from "@/data/products";
import { useCartStore, useWishlistStore, usePlayerStore } from "@/store/useStore";
import { formatProductPrice } from "@/utils/formatPrice";
import { formatVes, useBcvRate } from "@/components/BcvRateProvider";
import { productWithVariant } from "@/components/VariantPicker";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

interface QuickViewContentProps {
  product: Product;
  onClose: () => void;
}

const QuickViewContent: React.FC<QuickViewContentProps> = ({
  product,
  onClose,
}) => {
  const { rate } = useBcvRate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { currentProduct, isPlaying, toggleSample } = usePlayerStore();

  const inWishlist = isInWishlist(product.id);
  const isAudioPlaying = isPlaying && currentProduct?.id === product.id;
  const isOutOfStock = product.stock <= 0;
  const tieneVariantes = (product.variants ?? []).length > 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-4xl bg-[#121212] border border-[#d47217]/20 rounded-3xl overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-200 text-[#FFFFFF] my-auto max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Cerrar vista rápida"
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-[#27272A]/90 hover:bg-[#27272A] text-[#e3deda] hover:text-white border border-[#52525B] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left: Multi-Angle Gallery */}
            <div className="space-y-4">
              <div
                className={`relative w-full aspect-square rounded-2xl overflow-hidden border border-[#52525B] shadow-inner ${
                  product.imageFit === "contain" ? "bg-[#E5E7EB]" : "bg-[#27272A]"
                }`}
              >
                <Image
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className={product.imageFit === "contain" ? "object-contain" : "object-cover"}
                />

                {/* Audio Playing Pill Overlay */}
                {product.hasAudioPreview !== false && isAudioPlaying && (
                  <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-[#121212]/90 backdrop-blur-md border border-[#d47217]/40 flex items-center justify-between text-xs text-[#d47217]">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Volume2 className="w-4 h-4 animate-bounce text-[#d47217]" />
                      Reproduciendo muestra de audio...
                    </span>
                    <div className="flex items-end gap-1 h-3">
                      <span className="w-1 bg-[#d47217] rounded animate-bar-1" />
                      <span className="w-1 bg-[#d47217] rounded animate-bar-2" />
                      <span className="w-1 bg-[#d47217] rounded animate-bar-3" />
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnails Row */}
              <div className="flex items-center gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    aria-label={`Ver imagen ${(idx + 1).toLocaleString("es-ES")} de ${product.name}`}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      product.imageFit === "contain" ? "bg-[#E5E7EB]" : "bg-[#27272A]"
                    } ${
                      selectedImageIndex === idx
                        ? "border-[#d47217] ring-2 ring-[#d47217]/30 scale-105"
                        : "border-[#52525B] hover:border-[#d47217]/50 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Ángulo ${(idx + 1).toLocaleString("es-ES")}`}
                      fill
                      sizes="80px"
                      className={product.imageFit === "contain" ? "object-contain" : "object-cover"}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Specifications & Direct Purchase */}
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#d47217] flex items-center gap-1">
                    <Crown className="w-3 h-3" /> {product.brand} • {product.subcategory}
                  </span>
                  <div className="flex items-center gap-1 text-[#d47217] text-xs">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-bold text-[#FFFFFF]">
                      {product.rating.toLocaleString("es-ES", { maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[#e3deda]">
                      ({product.reviewCount.toLocaleString("es-ES")}{" "}
                      {product.reviewCount === 1 ? "reseña verificada" : "reseñas verificadas"})
                    </span>
                  </div>
                </div>

                <h2 className="text-2xl font-black text-[#FFFFFF] mt-1">
                  {product.name}
                </h2>
              </div>

              {/* Price & Stock */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-3xl font-black text-[#d47217] font-mono">
                  {formatProductPrice(product)}
                </span>
                {rate > 0 && (
                  <span className="text-xs text-[#e3deda] font-mono">≈ {formatVes(product.price * rate)}</span>
                )}
                {product.originalPrice && (
                  <span className="text-lg text-[#e3deda] line-through font-mono">
                    {formatProductPrice(product, product.originalPrice)}
                  </span>
                )}
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-md border flex items-center gap-1 ${
                    isOutOfStock
                      ? "text-[#e3deda] bg-[#3F3F46] border-[#52525B]"
                      : "text-[#d47217] bg-[#d47217]/15 border-[#d47217]/30"
                  }`}
                >
                  {isOutOfStock ? (
                    "Agotado"
                  ) : (
                    <>
                      <Check className="w-3 h-3" />
                      {product.stock.toLocaleString("es-ES")}{" "}
                      {product.stock === 1 ? "unidad disponible" : "unidades disponibles"} en Zona Audio
                    </>
                  )}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#e3deda] leading-relaxed">
                {product.description}
              </p>

              {product.hasAudioPreview !== false && (
                <>
                  {/* Built-in Tone Auditioning Bar */}
                  <div className="p-3.5 rounded-2xl bg-[#27272A] border border-[#52525B] flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase text-[#e3deda] tracking-wider">
                        Vista previa del perfil de sonido
                      </span>
                      <p className="text-xs text-[#FFFFFF] font-medium">
                        {product.soundDemo.notesDescription}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleSample(product)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                        isAudioPlaying
                          ? "bg-[#d47217] text-white border-[#d47217]"
                          : "bg-[#27272A] hover:bg-[#3F3F46] text-[#FFFFFF] border-[#52525B]"
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>{isAudioPlaying ? "Detener tono" : "Reproducir tono"}</span>
                    </button>
                  </div>
                </>
              )}

              {/* Technical Specifications Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#e3deda] block">
                  Especificaciones de fábrica
                </span>
                <div className="bg-[#27272A]/70 overflow-hidden rounded-xl border border-[#52525B] text-xs">
                  {Object.entries(product.specs).map(([label, val]) =>
                    val ? (
                      <div
                        key={label}
                        className="grid grid-cols-[minmax(0,38%)_minmax(0,1fr)] gap-3 border-b border-[#3F3F46] px-3 py-2.5 last:border-b-0"
                      >
                        <span className="font-semibold leading-snug text-[#e3deda]">{label}:</span>
                        <span className="whitespace-pre-line leading-snug text-white">{val}</span>
                      </div>
                    ) : null
                  )}
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4 pt-3 border-t border-[#3F3F46]">
                <div className="flex items-center border border-[#52525B] rounded-xl overflow-hidden bg-[#27272A]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label={`Disminuir cantidad de ${product.name}`}
                    className="p-3 hover:bg-[#27272A] text-[#e3deda] hover:text-white transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-sm font-mono font-bold text-[#FFFFFF]">
                    {quantity.toLocaleString("es-ES")}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={isOutOfStock}
                    aria-label={`Aumentar cantidad de ${product.name}`}
                    className="p-3 hover:bg-[#27272A] text-[#e3deda] hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {tieneVariantes ? (
                  <VariantPickerInline product={product} />
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 py-3.5 rounded-2xl font-black text-sm transition-all shadow-xl flex items-center justify-center gap-2 ${
                      isOutOfStock
                        ? "bg-[#3F3F46] text-[#e3deda] cursor-not-allowed"
                        : "cursor-pointer " +
                          (justAdded
                            ? "bg-[#d47217] text-white font-black"
                            : "bg-gradient-to-r from-[#d47217] via-[#d47217] to-[#d47217] hover:opacity-95 text-white shadow-[#d47217]/25")
                    }`}
                  >
                    {isOutOfStock ? (
                      "Agotado"
                    ) : justAdded ? (
                      <>
                        <Check className="w-4 h-4" /> ¡Agregado al carrito de Zona Audio!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" /> Agregar al carrito • {formatProductPrice(product, product.price * quantity)}
                        {rate > 0 && (
                          <span className="ml-2 text-[#e3deda] font-normal">
                            ≈ {formatVes(product.price * quantity * rate)}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => toggleWishlist(product)}
                  aria-label={inWishlist ? "Quitar de la lista de deseos" : "Guardar en la lista de deseos"}
                  className={`p-3.5 rounded-2xl border transition-colors cursor-pointer ${
                    inWishlist
                      ? "bg-[#d47217]/20 text-[#d47217] border-[#d47217]"
                      : "bg-[#27272A] border-[#52525B] text-[#e3deda] hover:text-white"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`} />
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Selector de variantes dentro de la vista rapida, sin salir del modal. */
function VariantPickerInline({ product }: { product: Product }) {
  const variantes = product.variants ?? [];
  const [elegida, setElegida] = useState(variantes[0]?.id ?? "");
  const { addItem } = useCartStore();
  const [agregado, setAgregado] = useState(false);

  const seleccionada = variantes.find((v) => v.id === elegida) ?? variantes[0];
  const sinStock = !seleccionada || seleccionada.stock <= 0;

  const agregar = () => {
    if (!seleccionada) return;
    addItem(productWithVariant(product, seleccionada), 1);
    setAgregado(true);
    window.setTimeout(() => setAgregado(false), 1800);
  };

  return (
    <div className="flex-1 space-y-2">
      <div className="grid gap-1.5">
        {variantes.map((variante) => {
          const activa = variante.id === elegida;
          const agotada = variante.stock <= 0;
          return (
            <button
              key={variante.id}
              type="button"
              onClick={() => setElegida(variante.id)}
              aria-pressed={activa}
              className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition ${
                activa
                  ? "border-[#d47217] bg-[#d47217]/10"
                  : "border-[#52525B] bg-[#121212] hover:border-[#d47217]/60"
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate text-xs font-bold text-white">
                  {variante.name}
                </span>
                <span className="block text-[10px] text-[#e3deda]">
                  {agotada ? "Agotado" : `${variante.stock} disponibles`}
                </span>
              </span>
              <span className="shrink-0 font-mono text-xs font-black text-[#d47217]">
                ${variante.price.toFixed(2)}
              </span>
            </button>
          );
        })}
      </div>
      <button
        onClick={agregar}
        disabled={sinStock}
        className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all shadow-xl flex items-center justify-center gap-2 ${
          sinStock
            ? "bg-[#3F3F46] text-[#e3deda] cursor-not-allowed"
            : agregado
              ? "bg-[#d47217] text-white"
              : "bg-gradient-to-r from-[#d47217] to-[#d47217] hover:opacity-95 text-white shadow-[#d47217]/25"
        }`}
      >
        {sinStock ? (
          "Agotado"
        ) : agregado ? (
          <>
            <Check className="w-4 h-4" /> ¡Agregado!
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" /> Agregar
            {seleccionada ? ` • ${formatProductPrice(product, seleccionada.price)}` : ""}
          </>
        )}
      </button>
    </div>
  );
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
}) => {
  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  return <QuickViewContent key={product.id} product={product} onClose={onClose} />;
};
