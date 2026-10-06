"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Radio
} from "lucide-react";
import { products as fallbackProducts, Product } from "@/data/products";
import { useCartStore } from "@/store/useStore";
import { formatProductPrice } from "@/utils/formatPrice";
import { formatVes, useBcvRate } from "@/components/BcvRateProvider";

interface HeroProps {
  onSelectCategory?: (category: string) => void;
  onFilterBadge?: (filter: string) => void;
  onOpenQuickView?: (product: Product) => void;
  products?: Product[];
}

export const Hero: React.FC<HeroProps> = ({
  onFilterBadge,
  onOpenQuickView,
  products = fallbackProducts,
}) => {
  // Hero featured slides
  const preferredProducts = products.filter(
    (p) => p.id === "prod-6" || p.id === "prod-4"
  );
  const heroProducts = preferredProducts.length > 0 ? preferredProducts : products.slice(0, 2);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeChip, setActiveChip] = useState("Todo el equipo");

  const { addItem } = useCartStore();
  const { rate } = useBcvRate();

  const activeProduct =
    heroProducts[currentSlide] || heroProducts[0] || products[0] || fallbackProducts[0];
  const savings =
    (activeProduct.originalPrice || activeProduct.price) - activeProduct.price;

  // Auto carousel slide every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroProducts.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [heroProducts.length]);

  const filterChips = [
    { label: "Todo el equipo", badge: "all" },
    { label: "Equipos inalámbricos", badge: "wireless" },
  ];

  const handleChipClick = (chip: { label: string; badge: string }) => {
    setActiveChip(chip.label);
    if (onFilterBadge) {
      onFilterBadge(chip.badge);
    }
    const catalogElement = document.getElementById("catalog-section");
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden pt-6 pb-12 px-4 lg:px-8 border-b border-[#d47217]/10">
      {/* Warm Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-[#d47217]/12 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[480px] h-[480px] bg-[#d47217]/12 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Fast Filter Chips (Warm 2026 Trend) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          <span className="text-xs font-bold uppercase tracking-wider text-[#e3deda] mr-2 flex items-center gap-1.5 flex-shrink-0">
            <Sliders className="w-3.5 h-3.5 text-[#d47217]" />
            Filtro rápido:
          </span>
          {filterChips.map((chip) => (
            <button
              key={chip.badge}
              onClick={() => handleChipClick(chip)}
              className={`text-xs px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeChip === chip.label
                  ? "bg-[#d47217] text-white font-black shadow-lg shadow-[#d47217]/25 scale-105"
                  : "bg-[#27272A]/90 hover:bg-[#27272A] text-[#e3deda] border border-[#52525B] hover:border-[#d47217]/50"
              }`}
            >
              {chip.badge === "wireless" && <Radio className="w-3 h-3 text-[#d47217]" />}
              {chip.label}
            </button>
          ))}
        </div>

        {/* Dynamic Hero Showcase Card (Warm Glassmorphism) */}
        <div className="relative rounded-3xl glass-panel p-6 sm:p-10 lg:p-12 overflow-hidden border border-[#d47217]/15 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 z-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#d47217] mb-1 block">
                  {activeProduct.brand} • {activeProduct.subcategory}
                </span>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#FFFFFF] tracking-tight leading-[1.1]">
                  {activeProduct.name}
                </h1>
              </div>

              <p className="text-sm sm:text-base text-[#e3deda] line-clamp-3 leading-relaxed max-w-2xl">
                {activeProduct.description}
              </p>

              {/* Price & Savings */}
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-[#d47217] font-mono">
                  {formatProductPrice(activeProduct)}
                </span>
                {rate > 0 && (
                  <span className="text-sm text-[#e3deda] font-mono">
                    ≈ {formatVes(activeProduct.price * rate)}
                  </span>
                )}
                {activeProduct.originalPrice && (
                  <span className="text-lg text-[#e3deda] line-through font-mono">
                    {formatProductPrice(activeProduct, activeProduct.originalPrice)}
                  </span>
                )}
                {activeProduct.originalPrice && savings > 0 && (
                  <span className="text-xs font-bold text-[#d47217] bg-[#d47217]/15 px-2.5 py-1 rounded-lg border border-[#d47217]/30">
                    Ahorra ${savings.toLocaleString("es-ES", { maximumFractionDigits: 0 })} con Zona Audio
                  </span>
                )}
              </div>

              {/* Interactive Audio Demo CTA & Primary Actions */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => addItem(activeProduct, 1)}
                  className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#d47217] via-[#d47217] to-[#d47217] hover:opacity-95 text-white font-black text-sm tracking-wide shadow-xl shadow-[#d47217]/25 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span>Adquirir instrumento</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {onOpenQuickView && (
                  <button
                    onClick={() => onOpenQuickView(activeProduct)}
                    className="text-xs text-[#e3deda] hover:text-[#FFFFFF] underline underline-offset-4 cursor-pointer font-medium"
                  >
                    Ver hoja de especificaciones de fábrica
                  </button>
                )}
              </div>
            </div>

            {/* Right Showcase Column (Product Image with Warm Ambient Glow) */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div
                className={`relative w-full aspect-square max-w-[420px] rounded-3xl overflow-hidden p-4 border border-[#d47217]/15 group shadow-2xl ${
                  activeProduct.imageFit === "contain"
                    ? "bg-[#E5E7EB]"
                    : "bg-gradient-to-b from-[#27272A]/60 to-[#121212]/90"
                }`}
              >
                {activeProduct.imageFit !== "contain" && (
                  <div className="absolute inset-0 bg-radial from-[#d47217]/20 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                )}
                
                <Image
                  src={activeProduct.images[0]}
                  alt={activeProduct.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 420px"
                  className={`rounded-2xl transition-transform duration-500 ${
                    activeProduct.imageFit === "contain"
                      ? "object-contain"
                      : "object-cover group-hover:scale-105"
                  }`}
                />
              </div>

              {/* Carousel Controls */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
                <button
                  onClick={() =>
                    setCurrentSlide((prev) => (prev - 1 + heroProducts.length) % heroProducts.length)
                  }
                  aria-label="Diapositiva anterior"
                  className="p-2 rounded-full bg-[#27272A] border border-[#52525B] text-[#e3deda] hover:text-[#FFFFFF] hover:border-[#d47217] transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5">
                  {heroProducts.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      aria-label={`Ir a la diapositiva ${(i + 1).toLocaleString("es-ES")}`}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        currentSlide === i
                          ? "w-8 bg-[#d47217]"
                          : "w-2 bg-[#52525B] hover:bg-[#52525B]"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() =>
                    setCurrentSlide((prev) => (prev + 1) % heroProducts.length)
                  }
                  aria-label="Diapositiva siguiente"
                  className="p-2 rounded-full bg-[#27272A] border border-[#52525B] text-[#e3deda] hover:text-[#FFFFFF] hover:border-[#d47217] transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
