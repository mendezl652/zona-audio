// Copia .env.local a .dev.vars para poder subirlos a Cloudflare de una vez.
// Ejecuta: node scripts/preparar-secretos.mjs
import fs from "node:fs";

const NECESARIOS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_EMAIL",
];

const lineas = fs
  .readFileSync(".env.local", "utf8")
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"));

const valores = new Map();
for (const linea of lineas) {
  const indice = linea.indexOf("=");
  if (indice === -1) continue;
  valores.set(linea.slice(0, indice).trim(), linea.slice(indice + 1).trim());
}

const faltantes = NECESARIOS.filter((clave) => !valores.get(clave));
if (faltantes.length > 0) {
  console.error("Faltan en .env.local:", faltantes.join(", "));
  process.exit(1);
}

const salida = NECESARIOS.map((clave) => `${clave}=${valores.get(clave)}`).join("\n");
fs.writeFileSync(".dev.vars", `${salida}\n`);

console.log("Archivo .dev.vars creado con:");
NECESARIOS.forEach((clave) => {
  const largo = valores.get(clave).length;
  console.log(`  ${clave}  (${largo} caracteres)`);
});
console.log("\nAhora ejecuta:  npx wrangler secret bulk .dev.vars");