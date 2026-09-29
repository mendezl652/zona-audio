"use client";

import React, { useState } from "react";
import {
  LayoutGrid,
  List,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  SearchX,
  Sparkles,
  Crown
} from "lucide-react";
import { Product } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { FilterState } from "@/components/FilterSidebar";

interface CatalogGridProps {
  products: Product[];
  totalProductsCount: number;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onOpenMobileFilter: () => void;
  onOpenQuickView: (product: Product) => void;
  onResetFilters: () => void;
}

export const CatalogGrid: React.FC<CatalogGridProps> = ({
  products,
  totalProductsCount,
  filters,
  onFilterChange,
  onOpenMobileFilter,
  onOpenQuickView,
  onResetFilters,
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      sortBy: e.target.value as FilterState["sortBy"],
    });
  };

  const removeBrandFilter = (brand: string) => {
    onFilterChange({
      ...filters,
      selectedBrands: filters.selectedBrands.filter((b) => b !== brand),
    });
  };

  const hasActiveFilters =
    filters.category !== "Todos" ||
    filters.selectedBrands.length > 0 ||
    filters.maxPrice < 6000 ||
    filters.inStockOnly ||
    filters.minRating > 0;
  const localizedMinRating = filters.minRating.toLocaleString("es-ES", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <div className="flex-1 space-y-6">
      {/* Catalog Controls Header */}
      <div className="glass-panel rounded-2xl p-4 border border-[#d47217]/15 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        {/* Left: Product count & Mobile filter toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileFilter}
            className="lg:hidden px-3.5 py-2 rounded-xl bg-[#27272A] text-[#FFFFFF] text-xs font-bold border border-[#52525B] flex items-center gap-2 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#d47217]" />
            <span>Filtros</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#d47217]" />
            )}
          </button>

          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-[#d47217] flex items-center gap-1">
              <Crown className="w-3 h-3" /> Colección maestra de Zona Audio
            </div>
            <div className="text-sm font-bold text-[#FFFFFF]">
              Mostrando{" "}
              <span className="text-[#d47217] font-mono">
                {products.length.toLocaleString("es-ES")}
              </span>{" "}
              de{" "}
              <span className="text-[#e3deda] font-mono">
                {totalProductsCount.toLocaleString("es-ES")}
              </span>{" "}
              {totalProductsCount === 1 ? "instrumento" : "instrumentos"}
            </div>
          </div>
        </div>

        {/* Right: Sort By Dropdown & View Mode Switcher */}
        <div className="flex items-center gap-3">
          {/* Sort Selector */}
          <div className="flex items-center gap-2 bg-[#121212] border border-[#52525B] rounded-xl px-3 py-1.5 text-xs text-[#e3deda]">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#d47217] flex-shrink-0" />
            <span className="hidden sm:inline text-[#e3deda] font-medium">Orden:</span>
            <select
              value={filters.sortBy}
              onChange={handleSortChange}
              aria-label="Ordenar productos"
              className="bg-transparent text-[#FFFFFF] font-semibold outline-none cursor-pointer pr-2"
            >
              <option value="featured" className="bg-[#121212] text-[#FFFFFF]">
                Destacados de Zona Audio
              </option>
              <option value="price_asc" className="bg-[#121212] text-[#FFFFFF]">
                Precio: de menor a mayor
              </option>
              <option value="price_desc" className="bg-[#121212] text-[#FFFFFF]">
                Precio: de mayor a menor
              </option>
              <option value="rating" className="bg-[#121212] text-[#FFFFFF]">
                Mejor valorados ★
              </option>
              <option value="reviews" className="bg-[#121212] text-[#FFFFFF]">
                Con más reseñas
              </option>
            </select>
          </div>

          {/* Grid vs List View Toggle */}
          <div className="hidden sm:flex items-center bg-[#121212] border border-[#52525B] rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode("grid")}
              title="Vista de cuadrícula"
              aria-label="Vista de cuadrícula"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#d47217] text-white font-black shadow"
                  : "text-[#e3deda] hover:text-[#FFFFFF]"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              title="Vista de lista"
              aria-label="Vista de lista"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-[#d47217] text-white font-black shadow"
                  : "text-[#e3deda] hover:text-[#FFFFFF]"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#e3deda] font-medium mr-1">
            Filtros activos:
          </span>

          {filters.category !== "Todos" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#d47217]/20 text-[#d47217] border border-[#d47217]/35">
              Categoría: {filters.category}
              <button
                aria-label={`Quitar filtro de categoría: ${filters.category}`}
                onClick={() => onFilterChange({ ...filters, category: "Todos" })}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.selectedBrands.map((brand) => (
            <span
              key={brand}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#d47217]/20 text-[#FFFFFF] border border-[#d47217]/35"
            >
              {brand}
              <button
                aria-label={`Quitar filtro de marca: ${brand}`}
                onClick={() => removeBrandFilter(brand)}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {filters.maxPrice < 6000 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#d47217]/20 text-[#d47217] border border-[#d47217]/35">
              Hasta ${filters.maxPrice.toLocaleString("es-ES")}
              <button
                aria-label="Quitar filtro de precio máximo"
                onClick={() => onFilterChange({ ...filters, maxPrice: 6000 })}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.inStockOnly && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#d47217]/20 text-[#d47217] border border-[#d47217]/35">
              Solo con stock
              <button
                aria-label="Quitar filtro de disponibilidad"
                onClick={() =>
                  onFilterChange({ ...filters, inStockOnly: false })
                }
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.minRating > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#d47217]/20 text-[#d47217] border border-[#d47217]/35">
              ★ {localizedMinRating} o más
              <button
                aria-label={`Quitar filtro de valoración: ${localizedMinRating} o más`}
                onClick={() => onFilterChange({ ...filters, minRating: 0 })}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={onResetFilters}
            className="text-xs text-[#d47217] hover:text-[#d47217] underline underline-offset-4 ml-1 cursor-pointer font-semibold"
          >
            Borrar todo
          </button>
        </div>
      )}

      {/* Product Grid / List */}
      {products.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
              : "space-y-4"
          }
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              viewMode={viewMode}
              onOpenQuickView={onOpenQuickView}
            />
          ))}
        </div>
      ) : (
        /* Empty Results Fallback */
        <div className="glass-panel rounded-3xl p-12 text-center border border-[#d47217]/15 space-y-4 my-8">
          <div className="w-16 h-16 rounded-2xl bg-[#27272A] border border-[#52525B] flex items-center justify-center mx-auto text-[#e3deda]">
            <SearchX className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[#FFFFFF]">
            No hay instrumentos que coincidan con los filtros actuales de Zona Audio
          </h3>
          <p className="text-sm text-[#e3deda] max-w-md mx-auto">
            Intenta ampliar el rango de precios o quitar algunos filtros de marca para ver más instrumentos.
          </p>
          <button
            onClick={onResetFilters}
            className="px-6 py-2.5 rounded-full bg-[#d47217] hover:bg-[#d47217] text-white font-black text-xs shadow-lg shadow-[#d47217]/20 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Restablecer todos los filtros</span>
          </button>
        </div>
      )}
    </div>
  );
};
