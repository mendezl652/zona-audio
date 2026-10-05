import type { Product } from "@/data/products";

/**
 * Convierte el nombre de un producto en un slug para la URL.
 * "Micrófonos inalámbricos Shure SN-808"
 *   → "microfonos-inalambricos-shure-sn-808"
 */
export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Slug de un producto. Usa solo el nombre para que la URL sea limpia y
 * facil de compartir: /producto/microfonos-inalambricos-shure-sn-808
 */
export function productSlug(product: Pick<Product, "name" | "id">): string {
  return slugify(product.name);
}

/** Rutas publicas de producto que Google puede indexar. */
export function productPath(product: Pick<Product, "name" | "id">): string {
  return `/producto/${productSlug(product)}`;
}
