"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  Sparkles,
  Crown
} from "lucide-react";
import { useCartStore } from "@/store/useStore";
import {
  formatMoney,
  formatProductPrice,
  type ProductCurrency,
} from "@/utils/formatPrice";
import { formatVes, useBcvRate } from "@/components/BcvRateProvider";

interface CartDrawerProps {
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout }) => {
  const { rate, isLoading: rateLoading, error: rateError } = useBcvRate();
  const [couponInput, setCouponInput] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    couponCode,
    discountRate,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDiscount,
    getTotal,
    getItemCount,
  } = useCartStore();

  if (!isCartOpen) return null;

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const total = getTotal();
  const totalVes = rate > 0 ? total * rate : null;
  const itemCount = getItemCount();
  const cartCurrency: ProductCurrency = "USD";

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback({
      success: res.success,
      message: res.message,
    });
    if (res.success) {
      setCouponInput("");
    }
  };

  const handleCheckoutClick = () => {
    closeCart();
    onOpenCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#121212] border-l border-[#52525B] text-[#FFFFFF] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="p-5 border-b border-[#3F3F46]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#d47217]/20 text-[#d47217] flex items-center justify-center font-bold">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-[#d47217]" /> Carrito Zona Audio
                  </h2>
                  <span className="text-xs text-[#e3deda] font-medium">
                    {itemCount.toLocaleString("es-ES")} {itemCount === 1 ? "instrumento reservado" : "instrumentos reservados"} en la bóveda
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    title="Vaciar carrito"
                    className="text-xs text-[#e3deda] hover:text-[#d47217] transition-colors p-1"
                  >
                    Vaciar
                  </button>
                )}
                <button
                  onClick={closeCart}
                  aria-label="Cerrar carrito"
                  className="p-2 rounded-xl text-[#e3deda] hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>

          <div className="px-5 py-2 border-b border-[#3F3F46] text-[11px] text-[#e3deda] flex items-center justify-between gap-3">
            <span>
              {rateLoading
                ? "Consultando tasa oficial BCV..."
                : rateError
                  ? "Tasa BCV no disponible"
                  : rate > 0
                    ? `Tasa oficial BCV: Bs. ${rate.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / USD`
                    : "Tasa BCV no disponible"}
            </span>
            {totalVes !== null && <span className="text-[#d47217]">≈ {formatVes(totalVes)}</span>}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-[#3F3F46]">
            {items.length > 0 ? (
              items.map(({ product, quantity }) => (
                <div key={product.id} className="pt-4 first:pt-0 flex gap-4">
                  {/* Thumbnail */}
                  <div
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border border-[#52525B] flex-shrink-0 ${
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
                    <h3 className="text-xs font-bold text-[#FFFFFF] truncate">
                      {product.name}
                    </h3>
                    <div className="text-sm font-black text-[#d47217] font-mono">
                      {formatProductPrice(product, product.price * quantity, { minimumFractionDigits: 2 })}
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center border border-[#52525B] rounded-lg overflow-hidden bg-[#27272A]">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          aria-label={`Disminuir cantidad de ${product.name}`}
                          className="p-1.5 hover:bg-[#27272A] text-[#e3deda] hover:text-white transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-mono font-bold text-[#FFFFFF]">
                          {quantity.toLocaleString("es-ES")}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          aria-label={`Aumentar cantidad de ${product.name}`}
                          className="p-1.5 hover:bg-[#27272A] text-[#e3deda] hover:text-white transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(product.id)}
                        aria-label={`Eliminar ${product.name} del carrito`}
                        className="text-[#e3deda] hover:text-[#d47217] p-1 transition-colors cursor-pointer"
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
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-[#FFFFFF]">Tu carrito de Zona Audio está vacío</h4>
                <p className="text-xs text-[#e3deda] max-w-xs mx-auto">
                  Explora guitarras, sintetizadores y micrófonos artesanales para comenzar a armar tu equipo.
                </p>
                <button
                  onClick={closeCart}
                  className="mt-2 px-5 py-2 rounded-full bg-[#d47217] text-white font-black text-xs shadow-md"
                >
                  Explorar instrumentos Zona Audio
                </button>
              </div>
            )}
          </div>

          {/* Drawer Footer & Checkout Calculation */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#3F3F46] bg-[#121212] space-y-4">
              {/* Promo Code Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Código promocional (prueba AURAVIP2026)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#27272A] border border-[#52525B] text-xs text-[#FFFFFF] uppercase placeholder:normal-case placeholder-[#e3deda] outline-none focus:border-[#d47217]"
                    />
                    <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#e3deda]" />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-[#FFFFFF] text-xs font-bold transition-colors cursor-pointer border border-[#52525B]"
                  >
                    Aplicar
                  </button>
                </div>

                {couponFeedback && (
                  <p
                    role="status"
                    aria-live="polite"
                    className={`text-[11px] font-medium flex items-center gap-1 ${
                      couponFeedback.success ? "text-[#d47217]" : "text-[#d47217]"
                    }`}
                  >
                    {couponFeedback.message}
                  </p>
                )}

                {couponCode && (
                  <div className="flex items-center justify-between bg-[#d47217]/15 border border-[#d47217]/30 px-2.5 py-1.5 rounded-lg text-xs">
                    <span className="text-[#d47217] font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#d47217]" /> {couponCode} ({(discountRate * 100).toLocaleString("es-ES", { maximumFractionDigits: 0 })}% de descuento)
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      aria-label={`Quitar código promocional ${couponCode}`}
                      className="text-[#e3deda] hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </form>

              {/* Price Calculation Breakdown */}
              <div className="space-y-1.5 text-xs text-[#e3deda] font-medium pt-2 border-t border-[#3F3F46]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#FFFFFF] font-mono">
                    {formatMoney(subtotal, cartCurrency, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-[#d47217] font-semibold">
                    <span>Descuento Zona Audio</span>
                    <span className="font-mono">
                      -{formatMoney(discount, cartCurrency, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-black text-[#FFFFFF] pt-2 border-t border-[#3F3F46]">
                  <span>Monto total</span>
                  <span className="text-[#d47217] font-mono text-lg">
                    {formatMoney(total, cartCurrency, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Checkout CTA Button */}
              <button
                onClick={handleCheckoutClick}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#d47217] via-[#d47217] to-[#d47217] hover:opacity-95 text-white font-black text-sm tracking-wide shadow-xl shadow-[#d47217]/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Continuar al pago VIP</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#e3deda]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#d47217]" />
                <span>Pago manual • Confirmación y seguimiento por WhatsApp</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
