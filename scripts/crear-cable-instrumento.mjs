// Crea el cable de instrumento 1/4" a XLR con las mismas medidas y
// precios del cable XLR profesional.
// Ejecuta: node scripts/crear-cable-instrumento.mjs
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } });

const { error: checkError } = await db.from("product_variants").select("id").limit(1);
if (checkError) {
  console.error("Falta la tabla product_variants.");
  process.exit(1);
}

const NOMBRE = 'Cable de instrumento 1/4"';

const datosProducto = {
  name: NOMBRE,
  brand: "Zona Audio",
  category: "Accesorios",
  subcategory: "Cables",
  price: 23,
  stock: 12,
  is_published: true,
  image_fit: "contain",
  images: ["/products/cable-instrumento-xlr.webp"],
  rating: 4.8,
  review_count: 18,
  description:
    'Cable de instrumento con plug de 1/4" (6.35 mm) a XLR macho para conectar ' +
    "guitarra, bajo o pedal de efectos a un amplificador o mixer. Conector " +
    "metalico, blindaje contra interferencias y cable flexible para evitar que se " +
    "danie. Disponible en 3, 5 y 10 metros.",
  specs: {
    Conector: 'Plug 1/4" (6.35 mm) a XLR macho',
    Tipo: "Instrumento mono",
    "Largo disponible": "3 metros / 5 metros / 10 metros",
    Material: "Conductores de cobre con aislamiento flexible",
    Uso: "Guitarra, bajo, pedales y amplifiers",
    Garantia: "3 meses contra defectos de fabricacion",
  },
  features: [],
  sound_demo: { type: "guitar_acoustic", duration: 5, notes_description: "Prueba de audio" },
};

const { data: existente } = await db.from("products").select("id").ilike("name", NOMBRE).maybeSingle();
let productoId = existente?.id;

if (productoId) {
  const { error } = await db.from("products").update(datosProducto).eq("id", productoId);
  if (error) { console.error("Error actualizando:", error.message); process.exit(1); }
  console.log("Producto actualizado:", NOMBRE);
} else {
  const { data: creado, error } = await db.from("products").insert(datosProducto).select("id").single();
  if (error) { console.error("Error creando:", error.message); process.exit(1); }
  productoId = creado.id;
  console.log("Producto creado:", NOMBRE);
}

const VARIANTES = [
  { name: "3 metros", price: 23, stock: 4, sort_order: 1 },
  { name: "5 metros", price: 28, stock: 4, sort_order: 2 },
  { name: "10 metros", price: 39, stock: 4, sort_order: 3 },
];

const { data: yaCreadas } = await db
  .from("product_variants").select("id, name").eq("product_id", productoId);

for (const variante of VARIANTES) {
  const existe = (yaCreadas ?? []).find((v) => v.name === variante.name);
  if (existe) {
    const { error } = await db.from("product_variants").update(variante).eq("id", existe.id);
    console.log(error ? `  ERROR ${variante.name}: ${error.message}` : `  actualizada: ${variante.name}`);
    continue;
  }
  const { error } = await db.from("product_variants")
    .insert({ ...variante, product_id: productoId, is_active: true });
  console.log(error ? `  ERROR ${variante.name}: ${error.message}` : `  creada: ${variante.name} — $${variante.price} — ${variante.stock} unidades`);
}

const { data: finales } = await db.from("product_variants")
  .select("name, price, stock").eq("product_id", productoId).order("sort_order");
console.log("\nVariantes:");
finales.forEach((v) => console.log(`  ${v.name} — $${v.price} — stock ${v.stock}`));
