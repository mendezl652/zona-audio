"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { FilterSidebar, FilterState } from "@/components/FilterSidebar";
import { CatalogGrid } from "@/components/CatalogGrid";
import { CartDrawer } from "@/components/CartDrawer";
import { WishlistDrawer } from "@/components/WishlistDrawer";
import { QuickViewModal } from "@/components/QuickViewModal";
import { CheckoutModal } from "@/components/CheckoutModal";
import { AudioFloatingPlayer } from "@/components/AudioFloatingPlayer";
import { ReviewsSection } from "@/components/ReviewsSection";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { BcvRateProvider } from "@/components/BcvRateProvider";
import { DiscountBanner } from "@/components/DiscountBanner";
import { categories as fallbackCategories, products, Product } from "@/data/products";

const initialFilters: FilterState = {
  category: "Todos",
  selectedBrands: [],
  maxPrice: 6000,
  minPrice: 0,
  inStockOnly: false,
  minRating: 0,
  sortBy: "featured",
};

export default function Home() {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(products);
  const [catalogCategories, setCatalogCategories] = useState<string[]>([
    ...fallbackCategories,
  ]);

  useEffect(() => {
    let active = true;
    fetch("/api/catalog", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { products?: Product[]; categories?: string[] } | null) => {
        if (!active || !payload) return;
        if (Array.isArray(payload.products)) setCatalogProducts(payload.products);
        if (Array.isArray(payload.categories) && payload.categories.length > 0) {
          setCatalogCategories(payload.categories);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  // Dynamic Filtering & Sorting
  const filteredProducts = useMemo(() => {
    return catalogProducts
      .filter((product) => {
        // Category
        if (filters.category !== "Todos" && product.category !== filters.category) {
          return false;
        }

        // Brands
        if (
          filters.selectedBrands.length > 0 &&
          !filters.selectedBrands.includes(product.brand)
        ) {
          return false;
        }

        // Price
        if (product.price > filters.maxPrice) {
          return false;
        }

        // Stock
        if (filters.inStockOnly && product.stock <= 0) {
          return false;
        }

        // Rating
        if (filters.minRating > 0 && product.rating < filters.minRating) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case "price_asc":
            return a.price - b.price;
          case "price_desc":
            return b.price - a.price;
          case "rating":
            return b.rating - a.rating;
          case "reviews":
            return b.reviewCount - a.reviewCount;
          case "featured":
          default:
            return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        }
      });
  }, [catalogProducts, filters]);

  // Handler for category selection from nav or hero
  const handleSelectCategory = (category: string) => {
    setFilters((prev) => ({ ...prev, category }));
    const catalogEl = document.getElementById("catalog-section");
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handler for Hero chips
  const handleHeroBadgeFilter = (badge: string) => {
    if (badge === "all") {
      setFilters(initialFilters);
    } else if (badge === "new") {
      setFilters({ ...initialFilters, category: "Todos" });
    } else if (badge === "wireless") {
      setFilters({
        ...initialFilters,
        category: "Audio profesional y micrófonos",
      });
    } else if (badge === "offers") {
      setFilters({
        ...initialFilters,
        maxPrice: 2000,
      });
    } else if (badge === "top_rated") {
      setFilters({
        ...initialFilters,
        minRating: 4.8,
      });
    }
  };

  return (
    <BcvRateProvider>
      <div className="min-h-screen flex flex-col bg-[#121212] text-[#FFFFFF] selection:bg-[#d47217] selection:text-white">
      {/* 1. Header (Sticky & Glassmorphic) */}
      <Header
        onSelectCategory={handleSelectCategory}
        onOpenQuickView={(p) => setQuickViewProduct(p)}
        products={catalogProducts}
        categories={catalogCategories}
      />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <Hero
          onSelectCategory={handleSelectCategory}
          onFilterBadge={handleHeroBadgeFilter}
          onOpenQuickView={(p) => setQuickViewProduct(p)}
          products={catalogProducts}
        />

        {/* 3. Catalog Section with Dynamic Multi-Faceted Filters */}
        <section
          id="catalog-section"
          className="max-w-7xl mx-auto px-4 lg:px-8 py-12 scroll-mt-24"
        >
          <DiscountBanner />

          <div className="flex gap-8 items-start">
            {/* Sidebar Filters */}
            <FilterSidebar
              filters={filters}
              onFilterChange={setFilters}
              onReset={() => setFilters(initialFilters)}
              isMobileOpen={isMobileFilterOpen}
              onCloseMobile={() => setIsMobileFilterOpen(false)}
              totalProductsCount={catalogProducts.length}
              matchingCount={filteredProducts.length}
              categories={catalogCategories}
            />

            {/* Catalog Grid */}
            <CatalogGrid
              products={filteredProducts}
              totalProductsCount={catalogProducts.length}
              filters={filters}
              onFilterChange={setFilters}
              onOpenMobileFilter={() => setIsMobileFilterOpen(true)}
              onOpenQuickView={(p) => setQuickViewProduct(p)}
              onResetFilters={() => setFilters(initialFilters)}
            />
          </div>
        </section>

        {/* 4. Artist Community Reviews & Trust Metrics */}
        <ReviewsSection />
      </main>

      {/* 6. Footer */}
      <Footer />

      {/* Drawers, Modals & Floating Audio Dock */}
      <CartDrawer onOpenCheckout={() => setIsCheckoutOpen(true)} />
      <WishlistDrawer onOpenQuickView={(p) => setQuickViewProduct(p)} />
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
      <AudioFloatingPlayer />
      <WhatsAppButton />
      </div>
    </BcvRateProvider>
  );
}
