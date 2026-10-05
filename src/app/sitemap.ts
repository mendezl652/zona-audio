import type { MetadataRoute } from "next";
import { getPublicCatalog } from "@/lib/catalog";
import { productPath } from "@/lib/productSlug";

const SITIO = "https://zonaaudio.com";

// Se genera en cada peticion para que los productos nuevos del panel
// aparezcan de inmediato, sin necesidad de redesplegar.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ahora = new Date();

  let productos: { name: string; id: string }[] = [];
  try {
    const { products } = await getPublicCatalog();
    productos = products;
  } catch {
    // Si Supabase no responde, se publica igualmente el sitemap principal.
    productos = [];
  }

  return [
    {
      url: SITIO,
      lastModified: ahora,
      changeFrequency: "daily",
      priority: 1,
    },
    // Una entrada por producto: cada uno puede aparecer en Google por su nombre.
    ...productos.map((producto) => ({
      url: `${SITIO}${productPath(producto)}`,
      lastModified: ahora,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}