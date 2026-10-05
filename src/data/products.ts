export interface SoundDemo {
  type: "guitar_rock" | "guitar_acoustic" | "synth_pad" | "synth_lead" | "drums_groove" | "drums_latin" | "mic_warmth" | "dj_drop";
  duration: number;
  notesDescription: string;
}

/** Una opcion concreta de un producto: medida, pack, color, etc. */
export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  currency?: "USD";
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isTopDeal?: boolean;
  hasAudioPreview?: boolean;
  freeShipping?: boolean;
  imageFit?: "cover" | "contain";
  images: string[];
  description: string;
  specs: Record<string, string | undefined>;
  features: string[];
  soundDemo: SoundDemo;
  /** Opciones del producto. Si tiene lista, el cliente debe elegir una. */
  variants?: ProductVariant[];
  /** Datos de la variante elegida, para mostrarlos en el carrito. */
  variantId?: string;
  variantLabel?: string;
  baseProductId?: string;
}

import productsData from "../../data/products.json";

export const products: Product[] = (productsData as unknown) as Product[];

export const categories = [
  "Todos",
  "Audio",
  "Instrumentos",
  "Tecnología",
  "Accesorios"
] as const;

export const brands = [
  "Zona Audio",
  "Shure",
  "Universal Pro",
  "Yamaha",
  "U12 Series",
  "Professional Stand"
] as const;
