"use client";

import React from "react";
import Image from "next/image";
import {
  X,
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  Crown
} from "lucide-react";
import { useWishlistStore, useCartStore } from "@/store/useStore";
import { Product } from "@/data/products";
import { formatProductPrice } from "@/utils/formatPrice";

interface WishlistDrawerProps {
  onOpenQuickView: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({ onOpenQuickView }) => {
  const { items, isWishlistOpen, closeWishlist, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();

  if (!isWishlistOpen) return null;

  const handleMoveToCart = (product: Product) => {
    addItem(product, 1);
    removeItem(product.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeWishlist}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#121212] border-l border-[#52525B] text-[#FFFFFF] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-[#3F3F46] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#d47217]/20 text-[#d47217] flex items-center justify-center font-bold">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h2 className="text-base font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-[#d47217]" /> Equipo guardado en Zona Audio
                </h2>
                <span className="text-xs text-[#e3deda] font-medium">
                  {items.length.toLocaleString("es-ES")} {items.length === 1 ? "instrumento" : "instrumentos"} en la bóveda privada
                </span>
              </div>
            </div>

            <button
              onClick={closeWishlist}
              aria-label="Cerrar lista de deseos"
              className="p-2 rounded-xl text-[#e3deda] hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Wishlist Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-[#3F3F46]">
            {items.length > 0 ? (
              items.map((product) => (
                <div key={product.id} className="pt-4 first:pt-0 flex gap-4">
                  {/* Thumbnail */}
                  <div
                    onClick={() => {
                      closeWishlist();
                      onOpenQuickView(product);
                    }}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border border-[#52525B] flex-shrink-0 cursor-pointer ${
                      product.imageFit === "contain" ? "bg-[#E5E7EB]" : "bg-[#27272A]"
                    }`}
                  >
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="80px"
                      className={product.imageFit === "contain" ? "object-contain" : "object-cover"}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-[#d47217] tracking-wider">
                      {product.brand}
                    </div>
                    <h3
                      onClick={() => {
                        closeWishlist();
                        onOpenQuickView(product);
                      }}
                      className="text-xs font-bold text-[#FFFFFF] truncate cursor-pointer hover:text-[#d47217]"
                    >
                      {product.name}
                    </h3>
                    <div className="text-sm font-black text-[#d47217] font-mono">
                      {formatProductPrice(product)}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleMoveToCart(product)}
                        className="px-3 py-1.5 rounded-lg bg-[#d47217] hover:bg-[#d47217] text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>Mover al carrito</span>
                      </button>

                      <button
                        onClick={() => removeItem(product.id)}
                        aria-label={`Eliminar ${product.name} de la lista de deseos`}
                        className="text-[#e3deda] hover:text-[#d47217] p-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#27272A] border border-[#52525B] flex items-center justify-center mx-auto text-[#e3deda]">
                  <Heart className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-[#FFFFFF]">Tu lista de deseos de Zona Audio está vacía</h4>
                <p className="text-xs text-[#e3deda] max-w-xs mx-auto">
                  Haz clic en el icono de corazón de cualquier guitarra, sintetizador o procesador de audio para guardarlo en tu bóveda privada.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-[#3F3F46] bg-[#121212]">
            <button
              onClick={closeWishlist}
              className="w-full py-3 rounded-xl bg-[#27272A] hover:bg-[#27272A] text-[#FFFFFF] font-bold text-xs flex items-center justify-center gap-2 border border-[#52525B]"
            >
              <span>Seguir explorando equipos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
