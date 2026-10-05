// Verifica si la tabla de variantes ya existe en Supabase.
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } });

const { error } = await db.from("product_variants").select("id").limit(1);

if (error) {
  console.log("NO EXISTE la tabla product_variants.");
  console.log("Ejecuta en Supabase > SQL Editor: supabase/007_variants.sql");
  console.log("Detalle:", error.message);
} else {
  console.log("OK: la tabla product_variants existe.");

  const { data: cables } = await db
    .from("products")
    .select("id, name, images")
    .ilike("name", "%xlr%");

  console.log("\nProductos con XLR:");
  (cables ?? []).forEach((p) => {
    console.log(`  ${p.name}`);
    console.log(`    imagenes: ${JSON.stringify(p.images)}`);
  });
}