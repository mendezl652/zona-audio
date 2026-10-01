import React from "react";

export const DiscountBanner: React.FC = () => {
  return (
    <aside
      aria-label="Oferta de descuento"
      className="sticky top-24 z-30 mb-6 w-full rounded-2xl border border-[#d47217]/35 bg-[#121212]/95 px-4 py-3 shadow-xl shadow-[#d47217]/10 backdrop-blur-md"
    >
      <div className="flex items-center justify-center gap-3 text-center">
        <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.2em] text-[#d47217]">
          Ofertas
        </span>
        <span className="h-7 w-px shrink-0 bg-[#d47217]/35" />
        <div className="min-w-0">
          <strong className="block text-sm font-black leading-tight text-[#FFFFFF]">
            20% de descuento en pagos en divisas
          </strong>
          <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-[#e3deda]">
            Sobre todos nuestros productos
          </span>
        </div>
      </div>
    </aside>
  );
};
