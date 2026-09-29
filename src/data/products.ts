export interface SoundDemo {
  type: "guitar_rock" | "guitar_acoustic" | "synth_pad" | "synth_lead" | "drums_groove" | "drums_latin" | "mic_warmth" | "dj_drop";
  duration: number;
  notesDescription: string;
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
}

import productsData from "../../data/products.json";

export const products: Product[] = (productsData as unknown) as Product[];

export const categories = [
  "Todos",
  "Teclados y pianos",
  "Audio profesional y micrófonos",
  "Baterías y percusión",
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
