import { createClient } from "@supabase/supabase-js";
import {
  brands as fallbackBrands,
  categories as fallbackCategories,
  products as fallbackProducts,
  type Product,
} from "@/data/products";
import { getSupabaseEnv } from "@/lib/supabase/server";
import { productSlug } from "@/lib/productSlug";

export type CatalogSnapshot = {
  products: Product[];
  categories: string[];
  brands: string[];
};

/** Producto visto desde el panel: incluye el estado de publicación. */
export type AdminProduct = Product & { isPublished: boolean };

export type AdminCatalogSnapshot = {
  products: AdminProduct[];
  categories: Array<{ id: string; name: string }>;
  brands: Array<{ id: string; name: string }>;
};

type Row = Record<string, unknown>;

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function asSpecs(value: unknown): Record<string, string | undefined> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Row).map(([key, item]) => [
      key,
      typeof item === "string" ? item : String(item ?? ""),
    ])
  );
}

function asVariants(
  rows: Row[],
  productId: string,
  incluirInactivas: boolean
): Product["variants"] {
  const delProducto = rows.filter((row) => asString(row.product_id) === productId);
  if (delProducto.length === 0) return undefined;
  return delProducto
    .filter((row) => incluirInactivas || asBoolean(row.is_active))
    .sort((a, b) => asNumber(a.sort_order) - asNumber(b.sort_order))
    .map((row) => ({
      id: asString(row.id),
      name: asString(row.name, "Variante"),
      price: asNumber(row.price),
      stock: Math.round(asNumber(row.stock)),
      isActive: asBoolean(row.is_active),
    }));
}

/** Adjunta las variantes de cada producto del catalogo. */
async function attachVariants<T extends { id: string }>(
  productos: T[],
  fetchVariants: () => Promise<Row[]>,
  incluirInactivas = false
): Promise<(T & { variants?: Product["variants"] })[]> {
  if (productos.length === 0) return productos;
  let filas: Row[] = [];
  try {
    filas = await fetchVariants();
  } catch {
    return productos;
  }
  if (filas.length === 0) return productos;
  return productos.map((producto) => ({
    ...producto,
    variants: asVariants(filas, producto.id, incluirInactivas),
  }));
}

function asSoundDemo(value: unknown): Product["soundDemo"] {
  const demo = (value && typeof value === "object" ? value : {}) as Row;
  return {
    type: asString(demo.type, "drums_latin") as Product["soundDemo"]["type"],
    duration: asNumber(demo.duration, 5),
    notesDescription: asString(demo.notesDescription),
  };
}

export function mapProductRow(row: Row): Product {
  return {
    id: asString(row.id),
    name: asString(row.name, "Producto sin nombre"),
    brand: asString(row.brand, "Zona Audio"),
    category: asString(row.category, "Accesorios"),
    subcategory: asString(row.subcategory),
    price: asNumber(row.price),
    originalPrice:
      row.original_price === null || row.original_price === undefined
        ? undefined
        : asNumber(row.original_price),
    rating: asNumber(row.rating),
    reviewCount: asNumber(row.review_count),
    stock: asNumber(row.stock),
    isNew: asBoolean(row.is_new),
    isFeatured: asBoolean(row.is_featured),
    isBestSeller: asBoolean(row.is_best_seller),
    isTopDeal: asBoolean(row.is_top_deal),
    hasAudioPreview: asBoolean(row.has_audio_preview),
    freeShipping: asBoolean(row.free_shipping),
    imageFit: asString(row.image_fit, "cover") as Product["imageFit"],
    images: asStringArray(row.images),
    description: asString(row.description),
    specs: asSpecs(row.specs),
    features: asStringArray(row.features),
    soundDemo: asSoundDemo(row.sound_demo),
  };
}

/**
 * Busca un producto por su slug de URL.
 * Usa el catalogo publico para respetar la regla de "solo publicados".
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { products } = await getPublicCatalog();
  const objetivo = slug.toLowerCase();
  return (
    products.find((product) => productSlug(product) === objetivo) ?? null
  );
}

export function getFallbackCatalog(): CatalogSnapshot {
  return {
    products: fallbackProducts,
    categories: [...fallbackCategories],
    brands: [...fallbackBrands],
  };
}

export async function getPublicCatalog(): Promise<CatalogSnapshot> {
  const { url, anonKey, configured } = getSupabaseEnv();
  if (!configured || !url || !anonKey) return getFallbackCatalog();

  const supabase = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const [productResult, categoryResult, brandResult, variantResult] =
    await Promise.all([
      supabase
        .from("products")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("name").order("name"),
      supabase.from("brands").select("name").order("name"),
      supabase
        .from("product_variants")
        .select("*")
        .eq("is_active", true)
        .order("sort_order"),
    ]);

  if (productResult.error || categoryResult.error || brandResult.error) {
    console.error("No se pudo leer el catálogo de Supabase:", {
      products: productResult.error?.message,
      categories: categoryResult.error?.message,
      brands: brandResult.error?.message,
    });
    return getFallbackCatalog();
  }

  const categoryNames = (categoryResult.data ?? [])
    .map((row) => asString((row as Row).name))
    .filter(Boolean);
  const brandNames = (brandResult.data ?? [])
    .map((row) => asString((row as Row).name))
    .filter(Boolean);

  const base = (productResult.data ?? []).map((row) => mapProductRow(row as Row));
  const productos = await attachVariants(base, async () =>
    (variantResult.data ?? []) as Row[]
  );

  return {
    products: productos,
    categories: ["Todos", ...categoryNames],
    brands: brandNames,
  };
}

export async function getAdminCatalog(): Promise<AdminCatalogSnapshot> {
  const { url, serviceRoleKey } = getSupabaseEnv();
  if (!url || !serviceRoleKey) {
    throw new Error("Falta configurar SUPABASE_SERVICE_ROLE_KEY.");
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const [productResult, categoryResult, brandResult, variantResult] =
    await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
      supabase.from("brands").select("*").order("name"),
      supabase
        .from("product_variants")
        .select("*")
        .order("sort_order"),
    ]);

  if (productResult.error) throw new Error(productResult.error.message);
  if (categoryResult.error) throw new Error(categoryResult.error.message);
  if (brandResult.error) throw new Error(brandResult.error.message);

  // El panel ve tambien las variantes inactivas para poder reactivarlas.
  const base = (productResult.data ?? []).map((row) => ({
    ...mapProductRow(row as Row),
    isPublished: (row as Row).is_published !== false,
  }));
  const productos = await attachVariants(
    base,
    async () => (variantResult.data ?? []) as Row[],
    true
  );

  return {
    products: productos,
    categories: (categoryResult.data ?? []).map((row) => ({
      id: asString((row as Row).id),
      name: asString((row as Row).name),
    })),
    brands: (brandResult.data ?? []).map((row) => ({
      id: asString((row as Row).id),
      name: asString((row as Row).name),
    })),
  };
}
