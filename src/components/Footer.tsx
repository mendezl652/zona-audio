"use client";

import React from "react";
import Image from "next/image";
import {
  Phone,
  MapPin,
  Clock
} from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#121212] border-t border-[#d47217]/15 text-[#e3deda] text-xs">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto py-12 px-4 lg:px-8">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <Image
              src="/zona-audio-logo.png"
              alt="Zona Audio"
              width={757}
              height={187}
              className="h-8 w-auto max-w-[140px] object-contain"
            />
            <div className="flex flex-col">
              <span className="text-sm font-black uppercase tracking-[0.18em] text-[#FFFFFF]">
                Zona Audio
              </span>
              <span className="text-[10px] text-[#e3deda] tracking-wider">
                Audio, instrumentos y tecnología
              </span>
            </div>
          </div>

          <p className="text-xs text-[#e3deda] leading-relaxed pr-6">
            Zona Audio representa la excelencia en la selección de instrumentos musicales. Nos especializamos en guitarras eléctricas de calidad profesional, obras maestras acústicas, sintetizadores analógicos, micrófonos para transmisión y equipos auténticos de percusión latina.
          </p>

          <div className="space-y-2 pt-1 text-xs">
            <div className="flex items-center gap-2 text-[#e3deda]">
              <MapPin className="w-3.5 h-3.5 text-[#d47217] flex-shrink-0" />
              <span>Somos tienda física en la Av. Andrés Bello, Edificio Centro Andrés Bello - Torre Oeste, piso 3, oficina 34-O</span>
            </div>
            <div className="flex items-center gap-2 text-[#e3deda]">
              <Phone className="w-3.5 h-3.5 text-[#d47217] flex-shrink-0" />
              <span>Asistencia personalizada: 0414-2868519</span>
            </div>
            <div className="flex items-center gap-2 text-[#e3deda]">
              <Clock className="w-3.5 h-3.5 text-[#d47217] flex-shrink-0" />
              <span>Citas previas: lunes a sábado, de 10:00 a. m. a 5:00 p. m.</span>
            </div>
          </div>
        </div>

        </div>

      {/* Bottom Legal Bar */}
      <div className="border-t border-[#3F3F46] py-6 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#e3deda]">
          <div>
            © 2026 Zona Audio Inc. Todos los derechos reservados. Instrumentos musicales de lujo contemporáneos y equipos de audio para tecnología.
          </div>
          <div className="flex items-center gap-4 text-[#e3deda]">
            <span>Términos del servicio</span>
            <span>•</span>
            <span>Política de privacidad</span>
            <span>•</span>
            <span>Accesibilidad de Zona Audio</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
