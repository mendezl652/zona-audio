// Muestra los cables con sus variantes (consultas separadas: la tabla de
// variantes no tiene clave foranea porque product_id es text).
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } });

const { data: cables, error } = await anon
  .from("products")
  .select("id, name, category, price, stock, images")
  .ilike("name", "%cable%")
  .order("name");

if (error) { console.error("ERROR:", error.message); process.exit(1); }

const { data: variantes } = await anon
  .from("product_variants").select("product_id, name, price, stock").order("sort_order");

console.log("CABLES PUBLICADOS (" + cables.length + "):\n");
for (const c of cables) {
  console.log(c.name + "   [" + c.category + "]");
  console.log("  imagen: " + JSON.stringify(c.images));
  const suyas = (variantes ?? []).filter((v) => v.product_id === c.id);
  if (suyas.length > 0) {
    suyas.forEach((v) => console.log(`    - ${v.name}   $${v.price}   stock ${v.stock}`));
  } else {
    console.log("    sin variantes");
  }
  console.log("");
}

const { count } = await anon.from("products").select("*", { count: "exact", head: true });
console.log("TOTAL de productos publicados: " + count);