// Crea el producto de cable XLR con sus tres variantes.
// Ejecuta SOLO despues de correr supabase/007_variants.sql
//   node scripts/crear-cable-xlr.mjs
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } });

// 1. Verificar que la tabla exista
const { error: checkError } = await db.from("product_variants").select("id").limit(1);
if (checkError) {
  console.error("Falta la tabla product_variants.");
  console.error("Ejecuta en Supabase > SQL Editor: supabase/007_variants.sql");
  process.exit(1);
}

// 2. Crear el producto si no existe
const NOMBRE = "Cable XLR profesional";
let { data: existente } = await db.from("products").select("*").ilike("name", NOMBRE).maybeSingle();

let productoId = existente?.id;

const datosProducto = {
  name: NOMBRE,
  brand: "Zona Audio",
  category: "Accesorios",
  subcategory: "Cables",
  price: 23,
  stock: 3,
  is_published: true,
  image_fit: "contain",
  images: ["/products/cable-xlr.webp"],
  rating: 4.8,
  review_count: 24,
  description:
    "Cable XLR balanceado para microfonos de estudio, vivo y equipos de audio. " +
    "Conector metalico, blindaje contra interferencias y completa flexibilidad. " +
    "Disponible en 3, 5 y 10 metros segun lo que necesites para conectar tu microfono " +
    "con la mixer o la interfaz sin tener que mover el equipo de sitio.",
  specs: {
    Conector: "XLR macho a XLR hembra, 3 pines",
    Tipo: "Balanceado con malla",
    "Largo disponible": "3 metros / 5 metros / 10 metros",
    Material: "Conductores de cobre con aislamiento flexible",
    Uso: "Microfonos, parlantes y equipos de audio",
    Garantia: "3 meses contra defectos de fabricacion",
  },
  features: [],
  sound_demo: { type: "mic_warmth", duration: 5, notes_description: "Prueba de audio" },
};

if (productoId) {
  const { error } = await db.from("products").update(datosProducto).eq("id", productoId);
  if (error) { console.error("Error actualizando producto:", error.message); process.exit(1); }
  console.log("Producto actualizado:", NOMBRE);
} else {
  const { data: creado, error } = await db.from("products").insert(datosProducto).select("id").single();
  if (error) { console.error("Error creando producto:", error.message); process.exit(1); }
  productoId = creado.id;
  console.log("Producto creado:", NOMBRE);
}

// 3. Crear las variantes
const VARIANTES = [
  { name: "3 metros", price: 23, stock: 1, sort_order: 1 },
  { name: "5 metros", price: 28, stock: 1, sort_order: 2 },
  { name: "10 metros", price: 39, stock: 1, sort_order: 3 },
];

const { data: yaCreadas } = await db
  .from("product_variants")
  .select("id, name")
  .eq("product_id", productoId);

for (const variante of VARIANTES) {
  const existe = (yaCreadas ?? []).find((v) => v.name === variante.name);
  if (existe) {
    const { error } = await db
      .from("product_variants")
      .update(variante)
      .eq("id", existe.id);
    console.log(error ? `  ERROR ${variante.name}: ${error.message}` : `  actualizada: ${variante.name}`);
    continue;
  }
  const { error } = await db
    .from("product_variants")
    .insert({ ...variante, product_id: productoId, is_active: true });
  console.log(error ? `  ERROR ${variante.name}: ${error.message}` : `  creada: ${variante.name} — $${variante.price} (${variante.stock} unidad)`);
}

// 4. Mostrar resultado
const { data: finales } = await db
  .from("product_variants")
  .select("name, price, stock, is_active")
  .eq("product_id", productoId)
  .order("sort_order");

console.log("\nVariantes finales:");
finales.forEach((v) => console.log(`  ${v.name} — $${v.price} — stock ${v.stock} — activa: ${v.is_active}`));