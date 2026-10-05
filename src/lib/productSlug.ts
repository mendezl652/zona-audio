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

/** Slug de un producto, sin depender del servidor. */
export function productSlug(product: Pick<Product, "name" | "id">): string {
  const base = slugify(product.name);
  // Si dos productos comparten nombre, se differentiate con el inicio del id.
  const sufijo = slugify(product.id).slice(0, 6);
  return sufijo ? `${base}-${sufijo}` : base;
}

/** Rutas publicas de producto que Google puede indexar. */
export function productPath(product: Pick<Product, "name" | "id">): string {
  return `/producto/${productSlug(product)}`;
}
