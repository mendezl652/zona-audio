// Verificación temporal de la tabla invoices en Supabase.
// Ejecuta: node scripts/verificar-facturas.mjs
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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase
  .from("invoices")
  .select("id, subtotal, discount, total")
  .limit(3);

if (error) {
  console.error("ERROR:", error.message);
  process.exit(1);
}

console.log("OK: columnas subtotal y discount existen.");
console.log("Facturas registradas:", data.length);
for (const row of data) {
  console.log(`  total=${row.total} subtotal=${row.subtotal} descuento=${row.discount}`);
}