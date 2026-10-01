"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Volume2,
  Heart,
  Eye,
  ShoppingCart,
  Star,
  Check
} from "lucide-react";
import { Product } from "@/data/products";
import { useCartStore, useWishlistStore, usePlayerStore } from "@/store/useStore";
import { formatProductPrice } from "@/utils/formatPrice";
import { formatVes, useBcvRate } from "@/components/BcvRateProvider";

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
  onOpenQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode = "grid",
  onOpenQuickView,
}) => {
  const { rate } = useBcvRate();
  const [justAdded, setJustAdded] = useState(false);
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { currentProduct, isPlaying, toggleSample } = usePlayerStore();

  const isAudioPlaying = isPlaying && currentProduct?.id === product.id;
  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleAudioToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSample(product);
  };

  if (viewMode === "list") {
    return (
      <div className="group rounded-2xl glass-panel p-4 sm:p-5 border border-[#d47217]/15 hover:border-[#d47217]/50 transition-all flex flex-col sm:flex-row items-center gap-5 shadow-lg hover:shadow-[#d47217]/10">
        {/* Thumbnail Image */}
        <div
          onClick={() => onOpenQuickView(product)}
          className={`relative w-full sm:w-48 h-48 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer border border-[#3F3F46] ${
            product.imageFit === "contain" ? "bg-[#E5E7EB]" : "bg-[#121212]"
          }`}
        >
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, 192px"
            className={`transition-transform duration-300 ${
              product.imageFit === "contain"
                ? "object-contain"
                : "object-cover group-hover:scale-105"
            }`}
          />

          {/* Badges */}
          {product.imageFit !== "contain" && (
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.isNew && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#d47217] text-white">
                  NOVEDAD ZONA AUDIO
                </span>
              )}
              {product.isTopDeal && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#d47217] text-white">
                  OFERTA
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 w-full space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#d47217] tracking-wider uppercase">
              {product.brand} • {product.subcategory}
            </span>
            <div className="flex items-center gap-1 text-[#d47217] text-xs">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-bold text-[#FFFFFF]">{product.rating.toLocaleString("es-ES", { maximumFractionDigits: 2 })}</span>
              <span className="text-[#e3deda]">({product.reviewCount.toLocaleString("es-ES")})</span>
            </div>
          </div>

          <h3
            onClick={() => onOpenQuickView(product)}
            className="text-base sm:text-lg font-bold text-[#FFFFFF] hover:text-[#d47217] cursor-pointer transition-colors"
          >
            {product.name}
          </h3>

          <p className="text-xs sm:text-sm text-[#e3deda] line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#e3deda]">
            {isOutOfStock ? (
              <span className="text-[#d47217] font-semibold">Agotado</span>
            ) : (
              <span className="text-[#d47217] font-medium flex items-center gap-1">
                <Check className="w-3 h-3" /> En stock en Zona Audio ({product.stock.toLocaleString("es-ES")} {product.stock === 1 ? "unidad" : "unidades"})
              </span>
            )}
            </div>
        </div>

        {/* Price & Actions */}
        <div className="sm:border-l sm:border-[#3F3F46] sm:pl-5 flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
          <div className="text-left sm:text-right">
            <div className="text-2xl font-black text-[#d47217] font-mono">
              {formatProductPrice(product)}
            </div>
            {rate > 0 && (
              <div className="text-[10px] text-[#e3deda] mt-0.5">≈ {formatVes(product.price * rate)}</div>
            )}
            {product.originalPrice && (
              <div className="text-xs text-[#e3deda] line-through font-mono">
                {formatProductPrice(product, product.originalPrice)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {product.hasAudioPreview !== false && (
              <button
                onClick={handleAudioToggle}
                title={isAudioPlaying ? "Detener vista previa del audio" : "Escuchar vista previa del audio"}
                aria-label={isAudioPlaying ? "Detener vista previa del audio" : "Escuchar vista previa del audio"}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isAudioPlaying
                    ? "bg-[#d47217]/25 text-[#d47217] border-[#d47217]"
                    : "bg-[#27272A] text-[#e3deda] border-[#52525B] hover:text-white"
                }`}
              >
                <Volume2 className={`w-4 h-4 ${isAudioPlaying ? "animate-pulse text-[#d47217]" : ""}`} />
              </button>
            )}

            <button
              onClick={handleWishlistToggle}
              aria-label={inWishlist ? "Quitar de la lista de deseos" : "Guardar en la lista de deseos"}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                inWishlist
                  ? "bg-[#d47217]/25 text-[#d47217] border-[#d47217]"
                  : "bg-[#27272A] text-[#e3deda] border-[#52525B] hover:text-white"
              }`}
            >
              <Heart className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`} />
            </button>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                isOutOfStock
                  ? "bg-[#3F3F46] text-[#e3deda] cursor-not-allowed"
                  : "cursor-pointer " +
                    (justAdded
                      ? "bg-[#d47217] text-white font-black"
                      : "bg-gradient-to-r from-[#d47217] to-[#d47217] hover:opacity-95 text-white")
              }`}
            >
              {isOutOfStock ? (
                "Agotado"
              ) : justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" /> ¡Agregado!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" /> Agregar al carrito
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid Mode Layout (Default Card with Warm Studio Styling)
  return (
    <div className="group relative rounded-2xl glass-panel p-2.5 sm:p-4 border border-[#d47217]/15 hover:border-[#d47217]/50 transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-[#d47217]/15 hover:-translate-y-1">
      {/* Top Media Container */}
      <div
        className={`relative w-full aspect-square rounded-xl overflow-hidden border border-[#3F3F46] ${
          product.imageFit === "contain" ? "bg-[#E5E7EB]" : "bg-[#121212]"
        }`}
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1200px) 50vw, 33vw"
          className={`transition-transform duration-500 ${
            product.imageFit === "contain"
              ? "object-contain"
              : "object-cover group-hover:scale-105"
          }`}
        />

        {/* Ambient Dark Gradient on bottom */}
        {product.imageFit !== "contain" && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/85 via-transparent to-transparent opacity-65 group-hover:opacity-35 transition-opacity" />
        )}

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex flex-col gap-1 sm:gap-1.5 z-10 max-w-[70%]">
          {product.imageFit !== "contain" && product.isNew && (
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#d47217] text-white shadow-md">
              NOVEDAD ZONA AUDIO
            </span>
          )}
          {product.imageFit !== "contain" && product.isTopDeal && (
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#d47217] text-white shadow-md">
              OFERTA
            </span>
          )}
          {isOutOfStock && (
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#e3deda] text-[#121212] shadow-md">
              Agotado
            </span>
          )}
          {product.imageFit !== "contain" && !isOutOfStock && product.stock <= 3 && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#d47217] text-white shadow-md">
              ¡Solo {product.stock === 1 ? "queda" : "quedan"} {product.stock.toLocaleString("es-ES")}!
            </span>
          )}
        </div>

        {/* Top-Right Quick Action: Wishlist */}
        {product.imageFit !== "contain" && (
          <button
            onClick={handleWishlistToggle}
            aria-label={inWishlist ? "Quitar de la lista de deseos" : "Guardar en la lista de deseos"}
            className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all cursor-pointer z-10 ${
              inWishlist
                ? "bg-[#d47217] text-white shadow-lg"
                : "bg-[#121212]/70 text-[#e3deda] hover:text-white hover:bg-[#27272A] border border-white/10"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${inWishlist ? "fill-current" : ""}`} />
          </button>
        )}

        {/* Hover Quick View Button */}
        {product.imageFit !== "contain" && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[#121212]/45 backdrop-blur-xs">
            <button
              onClick={() => onOpenQuickView(product)}
              className="px-4 py-2 rounded-full bg-[#FFFFFF] hover:bg-white text-[#121212] text-xs font-bold shadow-xl flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Vista rápida</span>
            </button>
          </div>
        )}

        {product.hasAudioPreview !== false && (
          <>
            {/* Audio Preview Strip on bottom of image */}
            <div className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-2 sm:left-2 sm:right-2 flex items-center justify-between p-1 sm:p-1.5 rounded-lg bg-[#121212]/85 backdrop-blur-md border border-[#d47217]/15">
              <button
                onClick={handleAudioToggle}
                className={`flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded transition-colors cursor-pointer ${
                  isAudioPlaying
                    ? "bg-[#d47217] text-white"
                    : "text-[#d47217] hover:text-[#FFFFFF]"
                }`}
              >
                <Volume2 className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isAudioPlaying ? "animate-pulse" : ""}`} />
                <span>{isAudioPlaying ? "Reproduciendo" : "Escuchar muestra"}</span>
              </button>

              {/* Mini Waveform Bars in Warm Accents */}
              <div className="hidden sm:flex items-end gap-1 h-3 px-1">
                <span
                  className={`w-0.5 rounded-full bg-[#d47217] ${
                    isAudioPlaying ? "animate-bar-1" : "h-1"
                  }`}
                />
                <span
                  className={`w-0.5 rounded-full bg-[#d47217] ${
                    isAudioPlaying ? "animate-bar-2" : "h-1.5"
                  }`}
                />
                <span
                  className={`w-0.5 rounded-full bg-[#d47217] ${
                    isAudioPlaying ? "animate-bar-3" : "h-1"
                  }`}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Product Details */}
      <div className="pt-3 pb-1 space-y-1.5">
        <div className="flex items-center justify-between text-xs gap-1">
          <span className="font-semibold text-[#d47217] uppercase tracking-wider text-[9px] sm:text-[11px] truncate">
            {product.brand}
          </span>
          <div className="flex items-center gap-1 text-[#d47217] text-xs shrink-0">
            <Star className="w-3 h-3 fill-current" />
            <span className="font-bold text-[#FFFFFF] text-[10px] sm:text-xs">{product.rating.toLocaleString("es-ES", { maximumFractionDigits: 2 })}</span>
            <span className="text-[#e3deda] text-[9px] sm:text-[10px]">({product.reviewCount.toLocaleString("es-ES")})</span>
          </div>
        </div>

        <h3
          onClick={() => onOpenQuickView(product)}
          className="text-[13px] sm:text-sm font-bold text-[#FFFFFF] group-hover:text-[#d47217] transition-colors line-clamp-2 sm:line-clamp-1 cursor-pointer"
        >
          {product.name}
        </h3>

        <p className="hidden sm:block text-xs text-[#e3deda] line-clamp-1">
          {product.subcategory} • {Object.values(product.specs).filter(Boolean)[0]}
        </p>

        {/* Pricing and Cart CTA */}
        <div className="pt-2 flex items-center justify-between gap-1">
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-black text-[#d47217] font-mono leading-none">
              {formatProductPrice(product)}
            </div>
            {rate > 0 && (
              <div className="text-[9px] sm:text-[10px] text-[#e3deda] mt-0.5 truncate">
                ≈ {formatVes(product.price * rate)}
              </div>
            )}
            {product.originalPrice && (
              <div className="text-[11px] text-[#e3deda] line-through font-mono">
                {formatProductPrice(product, product.originalPrice)}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label={isOutOfStock ? `${product.name} agotado` : `Agregar ${product.name} al carrito`}
            className={`p-2 sm:p-2.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center shrink-0 ${
              isOutOfStock
                ? "bg-[#3F3F46] text-[#e3deda] cursor-not-allowed"
                : "active:scale-95 cursor-pointer " +
                  (justAdded
                    ? "bg-[#d47217] text-white"
                    : "bg-gradient-to-r from-[#d47217] to-[#d47217] hover:opacity-95 text-white hover:shadow-[#d47217]/25")
            }`}
          >
            {isOutOfStock ? (
              <span className="text-[10px] font-black uppercase">Agotado</span>
            ) : justAdded ? (
              <Check className="w-4 h-4" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
