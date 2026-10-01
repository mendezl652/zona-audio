"use client";

import React from "react";
import Image from "next/image";
import {
  Phone,
  MapPin,
  Clock
} from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/contact";

function SocialIcon({ id }: { id: string }) {
  const shared = { fill: "currentColor", "aria-hidden": true } as const;

  if (id === "whatsapp") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" {...shared}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 0 1 6.988 2.896 9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488" />
      </svg>
    );
  }

  if (id === "tiktok") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" {...shared}>
        <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 1 1 .77-5.06v-3.1a5.66 5.66 0 0 0-.77-.05A5.66 5.66 0 1 0 15.54 15.4V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.28 4.28 0 0 1-3.24-1.48" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" {...shared}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#121212] border-t border-[#d47217]/15 text-[#e3deda] text-xs">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto py-12 px-4 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFFFFF]">
            Síguenos
          </h4>
          <div className="flex flex-wrap gap-2.5">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.id}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                title={`${social.label} · ${social.handle}`}
                aria-label={`${social.label} de Zona Audio`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#3F3F46] bg-[#27272A] text-white transition hover:border-[#d47217] hover:bg-[#d47217] hover:text-white"
              >
                <SocialIcon id={social.id} />
              </a>
            ))}
          </div>
          <p className="text-[11px] text-[#e3deda]">
            Escríbenos y síguenos para no perderte las próximas llegadas.
          </p>
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
