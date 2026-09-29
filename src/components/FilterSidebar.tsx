"use client";

import React from "react";
import {
  RotateCcw,
  Check,
  Layers,
  X,
  Crown
} from "lucide-react";
export interface FilterState {
  category: string;
  selectedBrands: string[];
  maxPrice: number;
  minPrice: number;
  inStockOnly: boolean;
  minRating: number;
  sortBy: "featured" | "price_asc" | "price_desc" | "rating" | "reviews";
}

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  totalProductsCount: number;
  matchingCount: number;
  categories: readonly string[];
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onReset,
  isMobileOpen,
  onCloseMobile,
  matchingCount,
  categories = ["Todos", "Teclados y pianos", "Audio profesional y micrófonos", "Baterías y percusión", "Accesorios"],
}) => {
  const handleCategorySelect = (category: string) => {
    onFilterChange({ ...filters, category });
  };

  const sidebarContent = (
    <div className="space-y-6">
      {/* Header and Reset Action */}
      <div className="flex items-center justify-between pb-3 border-b border-[#3F3F46]">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-[#d47217]" />
          <h2 className="text-sm font-black uppercase tracking-wider text-[#FFFFFF]">
            Filtros de Zona Audio
          </h2>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-[#e3deda] hover:text-[#d47217] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Restablecer</span>
        </button>
      </div>

      {/* 1. Category Filter */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-[#e3deda] flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#d47217]" />
          Categoría
        </label>
        <div className="space-y-1">
          {categories.map((cat) => {
            const isSelected = filters.category === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "bg-[#d47217]/20 text-[#e3deda] border border-[#d47217]/40 font-bold"
                    : "text-[#e3deda] hover:bg-[#27272A] hover:text-[#e3deda]"
                }`}
              >
                <span>{cat}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#d47217]" />}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-64 glass-panel rounded-2xl p-5 border border-[#d47217]/15 h-fit sticky top-28 shadow-xl">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative ml-auto w-full max-w-xs h-full bg-[#121212] border-l border-[#52525B] p-6 overflow-y-auto shadow-2xl z-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#3F3F46]">
                <span className="font-bold text-[#FFFFFF] text-base">Filtros de instrumentos</span>
                <button
                  aria-label="Cerrar filtros"
                  onClick={onCloseMobile}
                  className="p-1 rounded-lg text-[#e3deda] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {sidebarContent}
            </div>

            <div className="pt-6 border-t border-[#3F3F46] mt-6">
              <button
                onClick={onCloseMobile}
                className="w-full py-3 rounded-xl bg-[#d47217] text-white font-black text-sm shadow-lg shadow-[#d47217]/20"
              >
                Mostrar {matchingCount.toLocaleString("es-ES")}{" "}
                {matchingCount === 1 ? "resultado" : "resultados"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
