"use client";

import React from "react";
import Image from "next/image";
import {
  Flame,
  Package,
  ShoppingCart,
  Crown
} from "lucide-react";
import { products, Product } from "@/data/products";
import { useCartStore } from "@/store/useStore";

interface StudioBundlesProps {
  onOpenQuickView: (product: Product) => void;
}

export const StudioBundles: React.FC<StudioBundlesProps> = ({ onOpenQuickView }) => {
  const { addItem } = useCartStore();

  const bundles = [
    {
      id: "bundle-1",
      title: "Kit de percusión Zona Audio",
      tagline:
        "Batería electrónica TD-27KV2 y set de congas LP para una actuación completa",
      productIds: ["prod-10", "prod-11"],
      savings: 500,
      badge: "PAQUETE DE PERCUSIÓN ZONA AUDIO 2026",
      bgGradient: "from-[#302124] via-[#241C1F] to-[#121212]",
    },
  ];

  const handleAddBundle = (productIds: string[]) => {
    productIds.forEach((id) => {
      const p = products.find((item) => item.id === id);
      if (p) addItem(p, 1);
    });
  };

  return (
    <section className="py-12 px-4 lg:px-8 border-b border-[#d47217]/10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#d47217]">
              <Crown className="w-3.5 h-3.5 text-[#d47217]" />
              <span>Soluciones Zona Audio seleccionadas</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#FFFFFF] tracking-tight mt-1">
              Paquetes de estudio Zona Audio
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#e3deda] max-w-md">
            Instrumentos seleccionados a mano y equipos de élite, diseñados para lograr un flujo de señal óptimo, una combinación de impedancias ideal y ahorros instantáneos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bundles.map((bundle) => {
            const bundleItems = bundle.productIds
              .map((id) => products.find((p) => p.id === id))
              .filter(Boolean) as Product[];

            const regularTotal = bundleItems.reduce((sum, p) => sum + p.price, 0);
            const bundlePrice = regularTotal - bundle.savings;

            return (
              <div
                key={bundle.id}
                className={`relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br ${bundle.bgGradient} border border-[#d47217]/15 shadow-2xl flex flex-col justify-between space-y-6 group hover:border-[#d47217]/50 transition-all`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-[#d47217]/20 text-[#d47217] border border-[#d47217]/35">
                      {bundle.badge}
                    </span>
                    <span className="text-xs font-bold text-[#d47217] bg-[#d47217]/15 px-2.5 py-1 rounded-lg border border-[#d47217]/30 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-[#d47217]" />
                      Ahorro directo: ${bundle.savings.toLocaleString("es-ES")}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-[#FFFFFF] group-hover:text-[#d47217] transition-colors">
                      {bundle.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#e3deda] mt-1">
                      {bundle.tagline}
                    </p>
                  </div>

                  {/* Included Items Thumbnails & Links */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#e3deda] flex items-center gap-1">
                      <Package className="w-3 h-3 text-[#d47217]" />
                      Incluye en este equipo:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {bundleItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => onOpenQuickView(item)}
                          className="flex items-center gap-2.5 p-2 rounded-xl bg-[#121212]/80 border border-[#3F3F46] hover:border-[#d47217]/60 cursor-pointer transition-colors"
                        >
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#27272A] flex-shrink-0">
                            <Image
                              src={item.images[0]}
                              alt={item.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-bold text-[#FFFFFF] truncate">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-[#d47217] font-mono">
                              ${item.price.toLocaleString("es-ES")}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bundle Pricing and Action */}
                <div className="pt-4 border-t border-[#3F3F46] flex items-center justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-[#d47217] font-mono">
                      ${bundlePrice.toLocaleString("es-ES", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-xs text-[#e3deda] line-through font-mono">
                      Con un valor de ${regularTotal.toLocaleString("es-ES", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddBundle(bundle.productIds)}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#d47217] to-[#d47217] hover:opacity-95 text-white font-black text-xs transition-all shadow-lg shadow-[#d47217]/20 flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Adquirir paquete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
