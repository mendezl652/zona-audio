// Diagnostico de calidad del catalogo.
// Ejecuta: node scripts/revision-catalogo.mjs
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } });

const { data: productos } = await db.from("products").select("*");
const { data: facturas } = await db.from("invoices").select("id");
const { data: ventas } = await db.from("sales").select("id");

console.log("=== PRODUCTOS ===\n");
for (const p of productos ?? []) {
  const specs = Object.entries(p.specs ?? {}).filter(([, v]) => v && String(v).trim());
  const problemas = [];
  if (!p.description || p.description.length < 80) problemas.push("descripcion corta");
  if (specs.length < 3) problemas.push(`pocas specs (${specs.length})`);
  if (!p.images?.length) problemas.push("sin imagen");
  if (!p.subcategory) problemas.push("sin subcategoria");
  if (!p.stock) problemas.push("stock 0 (agotado)");
  if (!p.brand) problemas.push("sin marca");

  const estado = problemas.length ? problemas.join(", ") : "completo";
  console.log(`${p.name}`);
  console.log(`   ${estado}`);
}

const incompletos = (productos ?? []).filter((p) => {
  const specs = Object.entries(p.specs ?? {}).filter(([, v]) => v && String(v).trim());
  return !p.description || p.description.length < 80 || specs.length < 3 || !p.images?.length;
}).length;

console.log(`\n=== RESUMEN ===`);
console.log(`Productos totales      ${productos?.length ?? 0}`);
console.log(`Incompletos           ${incompletos}`);
console.log(`Facturas guardadas     ${facturas?.length ?? 0}`);
console.log(`Ventas registradas     ${ventas?.length ?? 0}`);
console.log(`Categoria "Tecnologia" vacia: ${!(productos ?? []).some((p) => p.category === "Tecnología")}`);