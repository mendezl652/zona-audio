"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  Heart,
  Menu,
  X,
  Sparkles
} from "lucide-react";
import { useCartStore, useWishlistStore } from "@/store/useStore";
import { products as fallbackProducts, Product } from "@/data/products";
import { formatProductPrice } from "@/utils/formatPrice";
import { formatVes, useBcvRate } from "@/components/BcvRateProvider";

function emptySubscribe() {
  // Nunca hay cambios: este hook solo marca "ya estamos en el navegador".
  return () => {};
}

interface HeaderProps {
  onSelectCategory?: (category: string) => void;
  onOpenQuickView?: (product: Product) => void;
  products?: Product[];
  categories?: readonly string[];
}

export const Header: React.FC<HeaderProps> = ({
  onSelectCategory,
  onOpenQuickView,
  products = fallbackProducts,
  categories = ["Todos", "Teclados y pianos", "Audio profesional y micrófonos", "Baterías y percusión", "Accesorios"],
}) => {
  const { rate, isLoading: rateLoading, error: rateError } = useBcvRate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "Yamaha PSR-E383",
    "Shure SN-808",
    "Timbales latinos",
    "Micrófonos inalámbricos"
  ]);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  const { getItemCount, getTotal, openCart } = useCartStore();
  const { items: wishlistItems, openWishlist } = useWishlistStore();

  // El carrito vive en LocalStorage: el servidor siempre devuelve 0.
  // useSyncExternalStore evita el desajuste de hydration sin setState en un efecto.
  const hasMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const cartCount = hasMounted ? getItemCount() : 0;
  const cartTotal = hasMounted ? getTotal() : 0;

  // Search filtering
  const searchResults = searchQuery.trim() === ""
    ? []
    : products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.subcategory.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSelect = (product: Product) => {
    if (!recentSearches.includes(product.name)) {
      setRecentSearches([product.name, ...recentSearches.slice(0, 3)]);
    }
    setIsSearchFocused(false);
    setSearchQuery("");
    if (onOpenQuickView) {
      onOpenQuickView(product);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all">
      {/* Main Navigation Bar (Glassmorphic Warm Dark) */}
      <div className="glass-nav border-b border-[#d47217]/10 px-4 lg:px-8 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo: Zona Audio */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (onSelectCategory) onSelectCategory("Todos");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-3 group text-left cursor-pointer"
            >
              <Image
                src="/zona-audio-logo.png"
                alt="Zona Audio"
                width={757}
                height={187}
                className="h-9 w-auto max-w-[115px] object-contain sm:h-10 sm:max-w-[165px]"
              />
              {/* El logo ya incluye el nombre; en movil no lo repetimos. */}
              <div className="hidden flex-col sm:flex">
                <span className="text-sm font-black uppercase tracking-[0.18em] text-[#FFFFFF] transition-colors group-hover:text-[#d47217]">
                  Zona Audio
                </span>
                <span className="text-[10px] text-[#e3deda] font-medium tracking-wide whitespace-nowrap">
                  Audio, instrumentos y tecnología
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Search Bar with Instant Autocomplete */}
          <div
            ref={searchContainerRef}
            className="relative hidden md:flex flex-1 max-w-xl mx-4"
          >
            <div className="relative w-full">
              <input
                type="text"
                aria-label="Buscar instrumentos y equipos"
                placeholder="Buscar guitarras, teclados, micrófonos, equipos de DJ, especificaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-11 pr-10 py-2.5 rounded-full bg-[#27272A]/90 border border-[#52525B] focus:border-[#d47217] text-sm text-[#FFFFFF] placeholder-[#e3deda] outline-none transition-all shadow-inner focus:ring-2 focus:ring-[#d47217]/25"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e3deda]" />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Borrar búsqueda"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#e3deda] hover:text-[#FFFFFF]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#27272A]/95 backdrop-blur-xl border border-[#52525B] rounded-2xl shadow-2xl p-3 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {searchResults.length > 0 ? (
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#d47217] px-3 py-1 flex items-center justify-between">
                      <span>Coincidencias con instrumentos y equipos Zona Audio</span>
                      <span className="text-[#e3deda]">
                        {searchResults.length.toLocaleString("es-ES")}{" "}
                        {searchResults.length === 1 ? "resultado" : "resultados"}
                      </span>
                    </div>
                    <div className="divide-y divide-[#3F3F46]">
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleSearchSelect(product)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#27272A] cursor-pointer transition-colors group"
                        >
                          <div
                            className={`relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-[#3F3F46] ${
                              product.imageFit === "contain" ? "bg-[#E5E7EB]" : "bg-[#121212]"
                            }`}
                          >
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              sizes="48px"
                              className={`transition-transform ${
                                product.imageFit === "contain"
                                  ? "object-contain"
                                  : "object-cover group-hover:scale-105"
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-[#FFFFFF] group-hover:text-[#d47217] truncate">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-[#e3deda]">
                              <span className="text-[#d47217] font-mono font-medium">
                                {formatProductPrice(product)}
                              </span>
                              <span>•</span>
                              <span>{product.brand}</span>
                              <span>•</span>
                              <span className="text-[#e3deda]">
                                {product.category}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs px-2.5 py-1 rounded bg-[#d47217]/15 text-[#d47217] border border-[#d47217]/30 group-hover:bg-[#d47217] group-hover:text-white font-semibold transition-colors">
                            Ver
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : searchQuery ? (
                  <div className="text-center py-6 text-[#e3deda] text-sm">
                    No se encontraron instrumentos que coincidan con &ldquo;<span className="text-[#FFFFFF] font-medium">{searchQuery}</span>&rdquo;.
                    <br />
                    <span className="text-xs text-[#e3deda]">Prueba a buscar Timbales latinos, Shure, Yamaha o U12 Series</span>
                  </div>
                ) : (
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#e3deda] px-3 py-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#d47217]" />
                      Búsquedas rápidas populares
                    </div>
                    <div className="flex flex-wrap gap-2 p-2">
                      {recentSearches.map((term, i) => (
                        <button
                          key={i}
                          onClick={() => setSearchQuery(term)}
                          className="text-xs px-3 py-1.5 rounded-full bg-[#27272A] hover:bg-[#d47217]/20 hover:text-[#d47217] border border-[#52525B] text-[#e3deda] transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Tools: Wishlist, Cart Drawer, Theme Switcher, Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden xl:flex items-center gap-1.5 text-[10px] text-[#e3deda] border-r border-[#3F3F46] pr-3">
              <span className="text-[#d47217] font-bold">Tasa BCV:</span>
              <span>
                {rateLoading
                  ? "..."
                  : rateError || rate <= 0
                    ? "No disponible"
                    : `${formatVes(rate)} / USD`}
              </span>
            </div>
            {/* Wishlist Button */}
            <button
              onClick={openWishlist}
              aria-label="Ver equipos guardados"
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#27272A] border border-[#52525B] text-[#e3deda] transition-colors hover:text-[#FFFFFF] active:scale-95 cursor-pointer sm:h-12 sm:w-12"
            >
              <Heart className="h-5 w-5 hover:text-[#d47217] transition-colors" />
              {hasMounted && wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#d47217] text-[11px] font-bold text-white shadow-lg">
                  {wishlistItems.length.toLocaleString("es-ES")}
                </span>
              )}
            </button>

            {/* Cart Drawer Trigger Button (Warm Terracotta Gradient) */}
            <button
              onClick={openCart}
              aria-label="Abrir carrito de compras"
              className="flex h-11 shrink-0 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#d47217] via-[#d47217] to-[#d47217] px-4 text-sm font-black text-white shadow-lg shadow-[#d47217]/25 transition-all hover:shadow-[#d47217]/40 hover:opacity-95 active:scale-95 cursor-pointer sm:h-12 sm:px-5"
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5 text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full border border-[#d47217] bg-[#121212] text-[10px] font-black text-[#d47217]">
                    {cartCount.toLocaleString("es-ES")}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-mono">
                ${cartTotal.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </span>
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#52525B] bg-[#27272A] text-[#e3deda] transition-colors hover:text-white active:scale-95 md:hidden cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Category Bar */}
        <div className="hidden md:block max-w-7xl mx-auto pt-2.5">
          <nav aria-label="Categorías" className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  if (onSelectCategory) onSelectCategory(cat);
                }}
                className="flex items-center gap-1.5 rounded-full border border-[#52525B] bg-[#27272A]/60 px-4 py-2 text-[13px] font-semibold tracking-wide text-[#e3deda] transition-colors hover:border-[#d47217]/60 hover:bg-[#d47217]/15 hover:text-[#FFFFFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d47217]/50 cursor-pointer lg:text-sm"
              >
                <span>{cat}</span>
                {cat === "Todos" && (
                  <span className="rounded-full bg-[#d47217]/25 px-1.5 py-0.5 text-[10px] font-bold text-[#d47217]">
                    {products.length.toLocaleString("es-ES")}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#121212]/98 backdrop-blur-xl border-b border-[#52525B] p-4 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="relative">
            <input
              type="text"
              aria-label="Buscar instrumentos y equipos"
              placeholder="Buscar instrumentos y equipos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#27272A] border border-[#52525B] text-sm text-[#FFFFFF]"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e3deda]" />
          </div>

          <div className="space-y-2">
            <div className="px-1 text-[11px] font-bold uppercase tracking-wider text-[#e3deda]">
              Comprar por categoría
            </div>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  if (onSelectCategory) onSelectCategory(cat);
                  setIsMobileMenuOpen(false);
                }}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#3F3F46] bg-[#27272A]/50 px-4 py-3.5 text-left text-[15px] font-semibold text-[#e3deda] transition-colors hover:border-[#d47217]/60 hover:bg-[#d47217]/15 hover:text-[#FFFFFF] active:scale-[0.99] cursor-pointer"
              >
                <span>{cat}</span>
                {cat === "Todos" && (
                  <span className="rounded-full bg-[#d47217]/25 px-2 py-0.5 text-[11px] font-bold text-[#d47217]">
                    {products.length.toLocaleString("es-ES")}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
