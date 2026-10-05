import type { Metadata } from "next";
import "./globals.css";

const SITIO = "https://zonaaudio.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITIO),
  title: {
    default: "Zona Audio | Micrófonos, instrumentos y equipos de audio en Caracas",
    template: "%s | Zona Audio",
  },
  description:
    "Tienda de audio en Caracas: instrumentos musicales y tecnología para estudio, escenario y streaming. Micrófonos inalámbricos, percusión latina y más. 20% de descuento en pagos en divisas.",
  keywords: [
    "Zona Audio",
    "Zona Audio Caracas",
    "comprar micrófonos Caracas",
    "micrófonos inalámbricos",
    "micrófonos inalám Venezuela",
    "Shure SN-808",
    "Shure SN-603",
    "micrófonos de cintillo",
    "timbales latinos",
    "piano Yamaha PSR-E383",
    "paral para micrófono",
    "equipos de audio profesional",
    "instrumentos musicales Caracas",
    "tienda de audio Venezuela",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_VE",
    url: SITIO,
    siteName: "Zona Audio",
    title:
      "Zona Audio | Micrófonos, instrumentos y equipos de audio en Caracas",
    description:
      "Micrófonos inalámbricos, percusión latina, teclados y tecnología de audio para estudio, escenario y streaming. Tienda física en Caracas. 20% de descuento en pagos en divisas.",
    images: [
      {
        url: "/zona-audio-logo.png",
        width: 757,
        height: 187,
        alt: "Zona Audio - Audio, instrumentos y tecnología",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zona Audio | Equipos de audio en Caracas",
    description:
      "Micrófonos inalámbricos, instrumentos musicales y tecnología para estudio y escenario.",
    images: ["/zona-audio-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "shopping",
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
