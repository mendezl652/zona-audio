"use client";

import { Clock, MapPin, MessageCircle } from "lucide-react";
import { CONTACT_PHONE, buildWhatsAppUrl } from "@/lib/contact";

/** Datos de contacto al final de la ficha de producto, con enlace a Maps. */
export function ContactBlock() {
  return (
    <section className="mt-10 grid gap-4 rounded-3xl border border-[#3F3F46] bg-[#27272A] p-5 sm:grid-cols-3">
      <div className="flex items-start gap-3">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#d47217]" />
        <div className="text-xs">
          <p className="font-bold text-white">Tienda física</p>
          <p className="mt-0.5 text-[#e3deda]">
            Av. Andrés Bello, Centro Andrés Bello, Torre Oeste, piso 3, oficina
            34-O, Caracas
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#d47217]" />
        <div className="text-xs">
          <p className="font-bold text-white">Horario</p>
          <p className="mt-0.5 text-[#e3deda]">
            Lunes a sábado, de 10:00 a. m. a 5:00 p. m. con cita previa
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#d47217]" />
        <div className="text-xs">
          <p className="font-bold text-white">Consultas</p>
          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 block text-[#e3deda] transition hover:text-[#d47217]"
          >
            WhatsApp {CONTACT_PHONE}
          </a>
        </div>
      </div>
    </section>
  );
}