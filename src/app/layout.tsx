import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zona Audio | Equipos de audio e instrumentos musicales",
  description:
    "Zona Audio: equipos de audio, instrumentos musicales y soluciones para estudio, escenario y streaming.",
  keywords: [
    "Zona Audio",
    "Audio profesional",
    "Instrumentos musicales de lujo",
    "Micrófonos inalámbricos",
    "Shure SN-808",
    "Timbales latinos",
    "Percusión latina",
    "Equipos de audio profesional",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#121212] text-[#FFFFFF]">
        {children}
      </body>
    </html>
  );
}
