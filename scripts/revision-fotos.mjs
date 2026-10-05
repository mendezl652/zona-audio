// Revisa la calidad de las fotos de cada producto publicado.
// Marca las imagenes que se verian borrosas en el celular del cliente.
//
// Ejecuta: node scripts/revision-fotos.mjs
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const MIN_LADO = 1000; // por debajo de esto se ve borroso en celular
const MAX_PESO_MB = 2;

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } });

const { data: productos, error } = await anon
  .from("products")
  .select("id, name, category, images")
  .order("category")
  .order("name");

if (error) { console.error("ERROR:", error.message); process.exit(1); }

/** Lee el tamano en pixeles de un archivo local (WebP y JPEG). */
function medir(ruta) {
  try {
    const buf = fs.readFileSync(ruta);
    // JPEG: buscar marcador SOF
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2;
      while (i < buf.length - 9) {
        if (buf[i] !== 0xff) { i++; continue; }
        const marcador = buf[i + 1];
        if (marcador >= 0xc0 && marcador <= 0xcf &&
            marcador !== 0xc4 && marcador !== 0xc8 && marcador !== 0xcc) {
          return { ancho: buf.readUInt16BE(i + 7), alto: buf.readUInt16BE(i + 5) };
        }
        i += 2 + buf.readUInt16BE(i + 2);
      }
    }
    // WebP (VP8 / VP8L / VP8X)
    if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
      const formato = buf.toString("ascii", 12, 16);
      if (formato === "VP8 ") {
        return { ancho: buf.readUInt16LE(26) & 0x3fff, alto: buf.readUInt16LE(28) & 0x3fff };
      }
      if (formato === "VP8L") {
        const b = buf.readUInt32LE(21);
        return { ancho: (b & 0x3fff) + 1, alto: ((b >> 14) & 0x3fff) + 1 };
      }
      if (formato === "VP8X") {
        const ancho = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16));
        const alto = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16));
        return { ancho, alto };
      }
    }
    return null;
  } catch {
    return null;
  }
}

let problemas = 0;

console.log("REVISION DE FOTOS DEL CATALOGO\n");
console.log("Se marca con ! cuando el lado menor es menor de " + MIN_LADO + " px o pesa mas de " + MAX_PESO_MB + " MB\n");
console.log("-".repeat(78));

for (const p of productos) {
  const imgs = p.images ?? [];
  if (imgs.length === 0) {
    console.log(`\n[ SIN FOTO ]  ${p.name}`);
    problemas++;
    continue;
  }

  const detalles = [];
  for (const url of imgs) {
    const nombre = url.split("/").pop();
    // Las imagenes locales viven en public/products
    const local = path.join("public", url.replace(/^\/+/, ""));
    const existeLocal = fs.existsSync(local);
    const pesoKB = existeLocal ? Math.round(fs.readFileSync(local).length / 1024) : null;
    const medidas = existeLocal ? medir(local) : null;
    const malo = !existeLocal || (medidas && Math.min(medidas.ancho, medidas.alto) < MIN_LADO)
      || (pesoKB !== null && pesoKB > MAX_PESO_MB * 1024);
    if (malo) problemas++;
    detalles.push({
      nombre,
      peso: pesoKB === null ? "en la nube" : pesoKB + " KB",
      px: medidas ? `${medidas.ancho}x${medidas.alto}` : "no medida",
      malo,
      inexistente: existeLocal ? false : true,
    });
  }

  const utiles = detalles.filter((d) => !d.malo).length;
  console.log(`\n${p.name}   [${p.category}]`);
  for (const d of detalles) {
    const marca = d.malo ? "!" : " ";
    const nota = d.inexistente ? "  <- no esta en public/products"
      : d.malo ? "  <- mejorarla" : "";
    console.log(`  ${marca} ${d.nombre.padEnd(38)} ${String(d.px).padEnd(12)} ${d.peso.padEnd(11)}${nota}`);
  }
  if (imgs.length < 3) {
    console.log(`      (${imgs.length} foto(s); se recomienda 3 o mas)`);
  }
  console.log(`      Aptas para la ficha: ${utiles}/${detalles.length}`);
}

console.log("\n" + "-".repeat(78));
console.log(problemas === 0
  ? "Todo en orden."
  : `${problemas} punto(s) por revisar.`);
console.log("Ver docs/GUIDA_FOTOS.md para como tomar las fotos.");
