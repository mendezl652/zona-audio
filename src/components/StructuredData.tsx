"use client";

import { useEffect } from "react";

type Product = {
  id: string;
  name: string;
  description?: string;
  price?: number;
  images?: string[];
  brand?: string;
  stock?: number;
  rating?: number;
  reviewCount?: number;
};

const SITIO = "https://zonaaudio.com";

/**
 * Datos estructurados de tipo Store: le dice a Google que esto es una
 * tienda, con productos, precios yformas de pago. Es lo que permite que
 * aparezcan los precios y las estrellas directamente en los resultados.
 */
export function StructuredData({ productos }: { productos: Product[] }) {
  useEffect(() => {
    const publicado = (datos: unknown) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.zonaAudio = "true";
      script.textContent = JSON.stringify(datos);
      document.head.appendChild(script);
      return () => {
        script.remove();
      };
    };

    const lista = productos
      .filter((p) => p.name && Number(p.price) > 0)
      .slice(0, 40)
      .map((p) => ({
        "@type": "Product",
        name: p.name,
        description: (p.description ?? "").slice(0, 500),
        image: p.images?.[0]?.startsWith("http")
          ? p.images[0]
          : `${SITIO}${p.images?.[0] ?? ""}`,
        brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
        offers: {
          "@type": "Offer",
          url: SITIO,
          priceCurrency: "USD",
          price: Number(p.price).toFixed(2),
          availability:
            (p.stock ?? 0) > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          seller: { "@type": "Organization", name: "Zona Audio" },
        },
        ...(p.rating
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: Number(p.rating).toFixed(1),
                reviewCount: p.reviewCount ?? 0,
              },
            }
          : {}),
      }));

    const desinstalar = [
      publicado({
        "@context": "https://schema.org",
        "@type": "Store",
        "@id": `${SITIO}#tienda`,
        name: "Zona Audio",
        description:
          "Equipos de audio, instrumentos musicales y tecnología para estudio, escenario y streaming en Caracas, Venezuela.",
        url: SITIO,
        // Google prefiere un logo cuadrado para los datos estructurados de tienda.
        logo: `${SITIO}/icono-zona-audio.png`,
        image: `${SITIO}/icono-zona-audio.png`,
        telephone: "+58 414-2868519",
        email: "mendezl652@gmail.com",
        priceRange: "$16 - $375",
        currenciesAccepted: "USD, VES",
        paymentAccepted: "Pago móvil, transferencia, Zelle, Binance Pay, efectivo",
        address: {
          "@type": "PostalAddress",
          streetAddress:
            "Av. Andrés Bello, Edificio Centro Andrés Bello, Torre Oeste, piso 3, oficina 34-O",
          addressLocality: "Caracas",
          addressRegion: "Distrito Capital",
          addressCountry: "VE",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 10.4813,
          longitude: -66.9042,
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ],
            opens: "10:00",
            closes: "17:00",
          },
        ],
        sameAs: [
          "https://www.instagram.com/zona_audio1",
          "https://www.tiktok.com/@zona.audio",
        ],
        makesOffer: lista,
      }),
      publicado({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${SITIO}#sitio`,
        url: SITIO,
        name: "Zona Audio",
        inLanguage: "es-VE",
        publisher: { "@id": `${SITIO}#tienda` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITIO}/?buscar={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }),
    ];

    return () => desinstalar.forEach((quitar) => quitar());
  }, [productos]);

  return null;
}