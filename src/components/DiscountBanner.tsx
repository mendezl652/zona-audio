import React from "react";

export const DiscountBanner: React.FC = () => {
  return (
    <aside
      aria-label="Oferta de descuento"
      className="sticky top-20 z-30 mb-6 w-fit max-w-full mx-auto"
    >
      <div className="flex items-center gap-2.5 rounded-full border border-[#d47217]/40 bg-[#1c1712]/95 py-2 pl-2 pr-4 shadow-lg shadow-[#d47217]/10 backdrop-blur-md sm:gap-3 sm:py-2.5 sm:pl-2.5 sm:pr-5">
        {/* Distintivo: se lee de un vistazo sin agrandar el texto */}
        <span className="shrink-0 rounded-full bg-[#d47217] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-white sm:px-3 sm:text-[10px]">
          Oferta
        </span>

        {/* El separador solo aparece cuando hay espacio */}
        <span className="hidden h-5 w-px shrink-0 bg-[#d47217]/30 sm:block" />

        <span className="min-w-0 text-left">
          <strong className="block text-[12px] font-black leading-tight text-[#FFFFFF] sm:text-sm">
            20% de descuento en pagos en divisas
          </strong>
          <span className="block text-[10px] font-medium leading-tight text-[#e3deda] sm:text-[11px]">
            Sobre todos nuestros productos
          </span>
        </span>
      </div>
    </aside>
  );
};
