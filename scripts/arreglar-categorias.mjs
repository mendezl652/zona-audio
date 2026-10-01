// Asigna cada producto a su categoria correcta y asegura la lista de categorias.
// Ejecuta: node scripts/arreglar-categorias.mjs
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((line) => line.trim() && !line.trim().startsWith("#"))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
    })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const CATEGORIAS = ["Audio", "Instrumentos", "Tecnología", "Accesorios"];

/** Decide la categoria correcta segun el nombre del producto. */
function categoriaDe(nombre) {
  const n = nombre.toLowerCase();
  // Los soportes van primero: "Paral para micrófono" también dice "micrófono".
  if (
    n.includes("paral") ||
    n.includes("soporte") ||
    n.includes("base") ||
    n.includes("atril") ||
    n.includes("cable") ||
    n.includes("adaptador") ||
    n.includes("funda") ||
    n.includes("estuche")
  ) {
    return "Accesorios";
  }
  if (n.includes("micrófono") || n.includes("microfono") || n.includes("mic")) {
    return "Audio";
  }
  if (
    n.includes("timbales") ||
    n.includes("batería") ||
    n.includes("bateria") ||
    n.includes("percusión") ||
    n.includes("percusion") ||
    n.includes("piano") ||
    n.includes("teclado") ||
    n.includes("guitarra") ||
    n.includes("sintetizador")
  ) {
    return "Instrumentos";
  }
  return "Audio";
}

// 1. Asegurar la lista de categorias
const { data: actuales } = await supabase.from("categories").select("id,name");
const nombresActuales = new Set((actuales ?? []).map((c) => c.name));

for (const nombre of CATEGORIAS) {
  if (nombresActuales.has(nombre)) {
    console.log(`categoria ya existe: ${nombre}`);
    continue;
  }
  const { error } = await supabase.from("categories").insert({ name: nombre });
  console.log(error ? `  ERROR creando ${nombre}: ${error.message}` : `  creada: ${nombre}`);
}

// 2. Quitar categorias que sobren
for (const cat of actuales ?? []) {
  if (!CATEGORIAS.includes(cat.name)) {
    await supabase.from("categories").delete().eq("id", cat.id);
    console.log(`  eliminada: ${cat.name}`);
  }
}

// 3. Asignar cada producto
const { data: productos, error: prodError } = await supabase
  .from("products")
  .select("id,name,category");

if (prodError) {
  console.error("ERROR leyendo productos:", prodError.message);
  process.exit(1);
}

console.log("\n--- PRODUCTOS ---");
for (const producto of productos ?? []) {
  const correcta = categoriaDe(producto.name);
  const cambio = producto.category !== correcta;
  if (cambio) {
    const { error } = await supabase
      .from("products")
      .update({ category: correcta })
      .eq("id", producto.id);
    if (error) console.log(`  ERROR ${producto.name}: ${error.message}`);
  }
  const flecha = cambio
    ? `${producto.category}  ->  ${correcta}`
    : `${correcta}  (sin cambio)`;
  console.log(`  ${flecha}`);
}

// 4. Resultado final
console.log("\n--- CATEGORIAS FINALES ---");
const { data: finales } = await supabase.from("categories").select("name");
finales.forEach((c) => console.log(`  ${c.name}`));

console.log("\n--- PRODUCTOS FINALES ---");
const { data: finalesProd } = await supabase.from("products").select("name,category");
finalesProd.forEach((p) => console.log(`  ${p.name}  =>  ${p.category}`));