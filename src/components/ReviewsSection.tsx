"use client";

import React from "react";
import { Star, CheckCircle } from "lucide-react";

export const ReviewsSection: React.FC = () => {
  const reviews = [
    {
      id: "rev-2",
      author: "Elena Rostova",
      role: "Productora de voces principales",
      location: "Miami, FL",
      gear: "Micrófonos inalámbricos Shure SN-808",
      rating: 5,
      date: "agosto de 2026",
      comment:
        "El sistema inalámbrico de cuatro canales capturó todas las voces con gran claridad durante nuestro evento. Las salidas XLR independientes facilitaron la mezcla y el pedido llegó muy pronto, con seguimiento y atención personalizada.",
    },
  ];

  return (
    <section className="py-12 px-4 lg:px-8 border-b border-[#d47217]/10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-[#FFFFFF]">
            Reseñas de artistas Zona Audio
          </h2>
          <p className="text-xs sm:text-sm text-[#e3deda]">
            Desde estudios de grabación de primer nivel hasta giras por todo el mundo, descubre por qué los creadores eligen Zona Audio.
          </p>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-2xl glass-panel p-6 border border-[#d47217]/15 space-y-4 flex flex-col justify-between shadow-xl hover:border-[#d47217]/40 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#d47217]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#e3deda] font-medium">
                    {rev.date}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#e3deda] leading-relaxed italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-[#3F3F46] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#FFFFFF]">
                    {rev.author}
                  </span>
                  <span className="text-[10px] text-[#d47217] font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Compra verificada
                  </span>
                </div>
                <div className="text-[11px] text-[#e3deda]">
                  {rev.role} • {rev.location}
                </div>
                <div className="text-[11px] font-mono text-[#e3deda] pt-0.5">
                  Equipo: <span className="text-[#e3deda]">{rev.gear}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
