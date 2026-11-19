// Genera los webp del sitio en public/img/<carpeta>/ desde los ORIGINALES de mayor resolución
// (ver scripts/fuentes-imagenes.mjs: nunca desde un webp/jpg ya achicado, sin doble compresión).
// Uso: npm run assets:optimizar   (agregar -- --forzar para regenerar todo)
//  - <nombre>-<ancho>.webp → una escalera de anchos por imagen (ej. 400/640/960/1280), nunca más ancha que
//    el original. Los componentes arman srcset + sizes con src/data/imagenes.json (src/lib/imagenes.js) y el
//    navegador elige la versión para 1x / 2x / 3x.
//  - Calidad webp: fotos q82, banners y marca q88 (texto nítido). Al achicar, unsharp muy suave (sigma 0.5).
//  - src/data/imagenes.json → { "/img/<carpeta>/<nombre>": { w: [anchos], o: [ancho, alto del original] } }
//  - src/data/lqip.json     → miniatura de 20px en base64 (blur-up mientras carga la real)
//  - src/data/fondos.json   → foto de producto con fondo 'blanco' (multiply) o 'escena'
//  - src/data/colores.json  → color dominante de cada foto de producto (halo, borde, destellos)
// Borra de public/img los webp que ya no corresponden a ninguna imagen (no quedan en el bundle).
import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { CARPETAS, anchosPara, imagenesDe } from './fuentes-imagenes.mjs';

const CON_LQIP = new Set(['productos', 'estudio', 'mar']); // las que se ven con blur-up
const forzar = process.argv.includes('--forzar');
const mtime = (f) => stat(f).then((s) => s.mtimeMs, () => 0);
const ESTE_SCRIPT = Math.max(await mtime(new URL(import.meta.url)), await mtime(new URL('./fuentes-imagenes.mjs', import.meta.url)));

/** Pipeline base: orientación EXIF + recorte (si la imagen lo tiene). */
const base = (img) => {
  let s = sharp(img.archivo).rotate();
  if (img.recorte) s = s.extract(img.recorte);
  return s;
};

/**
 * ¿La foto tiene fondo blanco (estudio) o de escena (madera, exterior)?
 * Mira el borde de la foto: si casi todo es blanco/gris muy claro → 'blanco' (se usa mix-blend multiply).
 */
async function tipoDeFondo(img) {
  const N = 48;
  const { data } = await base(img).resize(N, N, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let claros = 0;
  let total = 0;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (x > 2 && x < N - 3 && y > 2 && y < N - 3) continue; // solo el marco de 3px
      const i = (y * N + x) * 3;
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      claros += Math.min(r, g, b) > 225 && Math.max(r, g, b) - Math.min(r, g, b) < 22 ? 1 : 0;
      total++;
    }
  }
  return claros / total > 0.8 ? 'blanco' : 'escena';
}

/**
 * Color dominante "con color" de la foto, ignorando blancos, grises y casi negros (fondos de estudio,
 * tapas negras, sombras). Agrupa los píxeles en cubos RGB de 16 niveles pesados por saturación y
 * devuelve el promedio del cubo ganador en hex. null si la foto es toda neutra.
 */
async function colorDominante(img) {
  const { data } = await base(img).resize(64, 64, { fit: 'inside' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const cubos = new Map();
  for (let i = 0; i < data.length; i += 3) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 510;
    const s = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255));
    if (s < 0.22 || l < 0.12 || l > 0.9) continue; // blanco, gris o casi negro
    const clave = (r >> 4) * 256 + (g >> 4) * 16 + (b >> 4);
    const c = cubos.get(clave) ?? { peso: 0, r: 0, g: 0, b: 0, n: 0 };
    c.peso += s;
    c.r += r;
    c.g += g;
    c.b += b;
    c.n++;
    cubos.set(clave, c);
  }
  let mejor = null;
  for (const c of cubos.values()) if (!mejor || c.peso > mejor.peso) mejor = c;
  if (!mejor || mejor.n < 6) return null;
  const hex = (v) => Math.round(v / mejor.n).toString(16).padStart(2, '0');
  return `#${hex(mejor.r)}${hex(mejor.g)}${hex(mejor.b)}`;
}

/**
 * Fotos de producto con fondo "blanco" que en realidad es gris claro (fotos de proveedor): se llevan las
 * luces a blanco puro para que el multiply las funda con el fondo de la marca sin dejar un recuadro.
 * Solo toca los valores por encima de una rodilla (170): los colores del producto quedan igual.
 * Devuelve la fuente como raw (o null si el fondo ya es blanco).
 */
async function blanquear(img) {
  const { data, info } = await base(img).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const borde = [[], [], []];
  const paso = Math.max(1, Math.round(Math.min(W, H) / 120));
  for (let y = 0; y < H; y += paso) {
    for (let x = 0; x < W; x += paso) {
      if (x > 3 && x < W - 4 && y > 3 && y < H - 4) continue; // solo el marco de 4px
      const i = (y * W + x) * 3;
      for (let c = 0; c < 3; c++) borde[c].push(data[i + c]);
    }
  }
  const fondo = borde.map((v) => v.sort((a, b) => a - b)[v.length >> 1]);
  if (Math.min(...fondo) >= 250) return null;
  const RODILLA = 170;
  const curva = fondo.map((b) => {
    const t = new Uint8Array(256);
    for (let v = 0; v < 256; v++) t[v] = v <= RODILLA ? v : Math.min(255, Math.round(RODILLA + ((v - RODILLA) * (255 - RODILLA)) / Math.max(1, b - RODILLA)));
    return t;
  });
  for (let i = 0; i < data.length; i += 3) for (let c = 0; c < 3; c++) data[i + c] = curva[c][data[i + c]];
  return { data, info };
}

const manifiesto = {};
const lqip = {};
const fondos = {};
const colores = {};
let total = 0;
let generadas = 0;
let borradas = 0;
const sinOriginal = [];

for (const [carpeta, conf] of Object.entries(CARPETAS)) {
  const destino = path.resolve('public/img', carpeta);
  await mkdir(destino, { recursive: true });
  const validos = new Set();

  for (const img of await imagenesDe(carpeta)) {
    const { width: ancho, height: alto } = await base(img).toBuffer({ resolveWithObject: true }).then((r) => r.info);
    const anchos = anchosPara(ancho, conf.anchos);
    const tFuente = Math.max(await mtime(img.archivo), ESTE_SCRIPT);
    if (img.faltaOriginal) sinOriginal.push(`${carpeta}/${img.nombre}`);

    const fondo = carpeta === 'productos' ? await tipoDeFondo(img) : null;
    const blanca = fondo === 'blanco' ? await blanquear(img) : null;
    const fuente = () => (blanca ? sharp(blanca.data, { raw: blanca.info }) : base(img));

    for (const w of anchos) {
      const archivo = `${img.nombre}-${w}.webp`;
      validos.add(archivo);
      const salida = path.join(destino, archivo);
      if (!forzar && (await mtime(salida)) > tFuente) continue;
      let s = fuente().resize({ width: w, withoutEnlargement: true });
      if (w < ancho) s = s.sharpen({ sigma: 0.5 }); // unsharp muy suave al achicar
      await s.webp({ quality: conf.calidad, alphaQuality: 100, effort: 5, smartSubsample: true }).toFile(salida);
      generadas++;
    }
    const clave = `/img/${carpeta}/${img.nombre}`;
    manifiesto[clave] = { w: anchos, o: [ancho, alto] };

    if (CON_LQIP.has(carpeta)) {
      const buf = await base(img).resize({ width: 20 }).webp({ quality: 40 }).toBuffer();
      lqip[`${clave}.webp`] = `data:image/webp;base64,${buf.toString('base64')}`;
    }
    if (carpeta === 'productos') {
      fondos[`${clave}.webp`] = fondo;
      const color = await colorDominante(img);
      if (color) colores[`${clave}.webp`] = color;
    }
    total++;
  }

  // Webp viejos (otro nombre o ancho): fuera del bundle
  for (const f of await readdir(destino)) {
    if (f.endsWith('.webp') && !validos.has(f)) {
      await rm(path.join(destino, f));
      borradas++;
    }
  }
}

await writeFile(path.resolve('src/data/imagenes.json'), JSON.stringify(manifiesto) + '\n');
await writeFile(path.resolve('src/data/lqip.json'), JSON.stringify(lqip) + '\n');
await writeFile(path.resolve('src/data/fondos.json'), JSON.stringify(fondos, null, 1) + '\n');
await writeFile(path.resolve('src/data/colores.json'), JSON.stringify(colores, null, 1) + '\n');
console.log(`colores.json: ${Object.keys(colores).length} fotos con color (${Object.keys(fondos).length - Object.keys(colores).length} neutras → dorado)`);
const blancos = Object.values(fondos).filter((v) => v === 'blanco').length;
console.log(`fondos.json: ${blancos} con fondo blanco, ${Object.keys(fondos).length - blancos} de escena`);
console.log(`Listo: ${total} imágenes · ${generadas} webp nuevos · ${borradas} viejos borrados · imagenes.json ${Object.keys(manifiesto).length} entradas`);
if (sinOriginal.length) console.log(`Sin original en esta máquina (se usó la copia de assets/): ${sinOriginal.join(', ')}`);
