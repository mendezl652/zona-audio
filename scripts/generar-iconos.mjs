// Genera los iconos de Zona Audio (opcion "ZA") para el navegador y Google.
//
// Uso: node scripts/generar-iconos.mjs
//
// Tu logo horizontal (757x187) no sirve como favicon: al reducirlo a los
// 16-32 px que usa Google las letras se vuelven ilegibles. Aqui se compone
// una "ZA" con fondo blanco y letras negras, que si se lee a cualquier tamano.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const RAIZ = process.cwd();
const PUBLICO = path.join(RAIZ, "public");
const APP = path.join(RAIZ, "src", "app");

// Fondo blanco y letras negras.
const FONDO = "#FFFFFF";
const LETRA = "#121212";

/** Cuadricula con fondo blanco, esquinas redondeadas y la sigla ZA. */
function iconoZA(tam, { relleno = 0.66, colorLetra = LETRA } = {}) {
  const radio = Math.round(tam * 0.22);
  const fuente = Math.round(tam * relleno);

  return sharp(
    Buffer.from(
      `<svg width="${tam}" height="${tam}" xmlns="http://www.w3.org/2000/svg">
         <rect x="0" y="0" width="${tam}" height="${tam}" rx="${radio}" ry="${radio}" fill="${FONDO}"/>
         <text x="${tam / 2}" y="${tam / 2 + fuente * 0.02}"
               font-family="Arial Black, Arial, Helvetica, sans-serif"
               font-size="${fuente}" font-weight="900"
               letter-spacing="${-fuente * 0.04}"
               text-anchor="middle" dominant-baseline="central"
               fill="${colorLetra}">ZA</text>
       </svg>`
    )
  )
    .png()
    .toBuffer();
}

/** Icono cuadrado sin esquinas redondeadas (lo exige iOS en la pantalla de inicio). */
function iconoApple() {
  const tam = 180;
  const fuente = Math.round(tam * 0.62);

  return sharp(
    Buffer.from(
      `<svg width="${tam}" height="${tam}" xmlns="http://www.w3.org/2000/svg">
         <rect x="0" y="0" width="${tam}" height="${tam}" fill="${FONDO}"/>
         <text x="${tam / 2}" y="${tam / 2}" font-family="Arial Black, Arial, Helvetica, sans-serif"
               font-size="${fuente}" font-weight="900" letter-spacing="${-fuente * 0.04}"
               text-anchor="middle" dominant-baseline="central" fill="${LETRA}">ZA</text>
       </svg>`
    )
  )
    .png()
    .toBuffer();
}

/** Icono de fondo opaco para las vistas previas de redes sociales. */
function iconoCompartir() {
  const tam = 512;
  const fuente = Math.round(tam * 0.66);

  return sharp(
    Buffer.from(
      `<svg width="${tam}" height="${tam}" xmlns="http://www.w3.org/2000/svg">
         <rect x="0" y="0" width="${tam}" height="${tam}" fill="${FONDO}"/>
         <text x="${tam / 2}" y="${tam / 2}" font-family="Arial Black, Arial, Helvetica, sans-serif"
               font-size="${fuente}" font-weight="900" letter-spacing="${-fuente * 0.04}"
               text-anchor="middle" dominant-baseline="central" fill="${LETRA}">ZA</text>
       </svg>`
    )
  )
    .png()
    .toBuffer();
}

const base = await iconoZA(512);
const Comparativa = process.argv.includes("--comparativa");

const salidas = [
  ["favicon-16.png", 16],
  ["favicon-32.png", 32],
  ["favicon-48.png", 48],
];

for (const [nombre, tam] of salidas) {
  const buf = await sharp(base).resize(tam, tam).png().toBuffer();
  fs.writeFileSync(path.join(PUBLICO, nombre), buf);
  console.log(`${nombre.padEnd(16)} ${String(tam).padStart(3)}px  ${(buf.length / 1024).toFixed(1)} KB`);
}

// .ico de escritorio
const ico = await sharp(base).resize(256, 256).png().toBuffer();
fs.writeFileSync(path.join(APP, "favicon.ico"), ico);
console.log(`favicon.ico        256px  ${(ico.length / 1024).toFixed(1)} KB  (src/app)`);

const apple = await iconoApple();
fs.writeFileSync(path.join(PUBLICO, "apple-touch-icon.png"), apple);
console.log(`apple-touch-icon   180px  ${(apple.length / 1024).toFixed(1)} KB`);

const compartir = await iconoCompartir();
fs.writeFileSync(path.join(PUBLICO, "icono-zona-audio.png"), compartir);
console.log(`icono-zona-audio   512px  ${(compartir.length / 1024).toFixed(1)} KB`);

// Hoja de comparacion para revisar la legibilidad en tamanos reales.
if (Comparativa) {
  const carpeta = path.join(PUBLICO, "_comparativa");
  fs.mkdirSync(carpeta, { recursive: true });
  for (const tam of [512, 48, 32, 16]) {
    const escala = tam <= 32 ? 6 : 1;
    const lado = tam * escala;
    const img = await sharp(base).resize(lado, lado).png().toBuffer();
    const marco = await sharp({
      create: { width: lado + 24, height: lado + 24, channels: 3, background: "#555555" },
    })
      .composite([{ input: img, left: 12, top: 12 }])
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(carpeta, `za-${tam}.png`), marco);
  }
  console.log("\nComparacion lista en public\\_comparativa");
}

console.log("\nListo.");
