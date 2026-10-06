// Revisa los productos recien agregados: imagenes, precio, stock y como
// los muestra la tienda (incluidas las variantes).
//
// Ejecuta: node scripts/revision-productos.mjs
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } });

const { data: productos, error } = await anon
  .from("products")
  .select("id, name, brand, category, subcategory, price, stock, is_published, image_fit, images, specs, description")
  .order("category").order("name");

if (error) { console.error("ERROR:", error.message); process.exit(1); }

const { data: variantes } = await anon
  .from("product_variants").select("product_id, name, price, stock, is_active").order("sort_order");

// Cuenta palabras para saber si la descripcion sirve en Google.
const palabras = (texto) => (texto || "").trim().split(/\s+/).filter(Boolean).length;

let avisos = 0;
const marcar = (msg) => { avisos++; return "  ! " + msg; };

console.log("REVISION DE PRODUCTOS PUBLICADOS\n");

for (const p of productos) {
  const imgs = p.images ?? [];
  const specs = Object.entries(p.specs ?? {}).filter(([, v]) => v && String(v).trim());
  const suyas = (variantes ?? []).filter((v) => v.product_id === p.id);
  console.log("=".repeat(74));
  console.log(`${p.name}`);
  console.log(`  [${p.category}${p.subcategory ? " / " + p.subcategory : ""}]  ${p.brand || "sin marca"}`);
  console.log(`  Precio: $${p.price}   Stock: ${p.stock}   ${p.is_published ? "Publicado" : "BORRADOR (no se ve)"}`);
  console.log(`  Ajuste de imagen: ${p.image_fit || "cover (por defecto)"}`);

  // Imagenes
  if (imgs.length === 0) {
    console.log(marcar("SIN FOTO: el cliente no ve nada del producto"));
  } else {
    console.log(`  Imagenes: ${imgs.length}${suyas.length > 0 ? "" : ""}`);
    imgs.forEach((img, i) => {
      const esPrimera = i === 0;
      console.log(`    ${esPrimera ? "[1]" : `[${i + 1}]`} ${p.image_fit === "contain" ? "contain" : "cover "} ${img}`);
    });
    if (imgs.length === 1 && suyas.length > 0) {
      console.log("    (una sola foto para un producto con opciones: conviene anadir mas)");
    }
  }

  // Texto para Google
  const palabrasDesc = palabras(p.description);
  if (palabrasDesc === 0) {
    console.log(marcar("SIN DESCRIPCION: Google no tiene texto para indexar"));
  } else if (palabrasDesc < 25) {
    console.log(`  Descripcion: ${palabrasDesc} palabras (short, ideal 60-120)`);
  } else {
    console.log(`  Descripcion: ${palabrasDesc} palabras`);
  }

  console.log(`  Especificaciones: ${specs.length}`);
  if (specs.length === 0) {
    console.log("    (sin especificaciones en la ficha)");
  }

  // Coherencia precio base vs variantes
  if (suyas.length > 0) {
    console.log(`  Variantes (${suyas.length}):`);
    const precios = suyas.map((v) => Number(v.price));
    const min = Math.min(...precios);
    const max = Math.max(...precios);
    console.log(`    rango de precios: $${min} - $${max}`);
    for (const v of suyas) {
      const inactiva = v.is_active === false;
      const sinStock = Number(v.stock) <= 0;
      console.log(`    - ${v.name.padEnd(16)} $${String(v.price).padEnd(6)} stock ${String(v.stock).padEnd(5)}${inactiva ? " [inactiva]" : ""}${sinStock ? " [agotada]" : ""}`);
    }
    if (min !== Number(p.price)) {
      console.log(marcar(`el precio base ($${p.price}) no coincide con la variante mas barata ($${min})`));
    }
    const sinStockTodas = suyas.every((v) => Number(v.stock) <= 0);
    if (sinStockTodas) {
      console.log(marcar("todas las variantes estan agotadas: se vera AGOTADO"));
    }
  }

  console.log("");
}

console.log("=".repeat(74));
const porCategoria = {};
for (const p of productos) porCategoria[p.category] = (porCategoria[p.category] ?? 0) + 1;
console.log("Total: " + productos.length + " productos");
for (const [cat, n] of Object.entries(porCategoria)) {
  console.log(`  ${String(n).padStart(2)}  ${cat}`);
}
const sinFoto = productos.filter((p) => !(p.images ?? []).length).length;
console.log(`\nSin foto: ${sinFoto}   Con menos de 3 fotos: ${productos.filter((p) => (p.images ?? []).length < 3).length}`);
console.log(avisos === 0 ? "\nTodo en orden." : `\n${avisos} aviso(s) a revisar.`);
