// Convierte las fotos de assets/ a webp livianos en public/img/<carpeta>/.
// Uso: npm run assets:optimizar   (agregar -- --forzar para regenerar todo)
//  - <nombre>.webp     → máx 900px de ancho (fotos grandes, galería)
//  - <nombre>-sm.webp  → máx 400px de ancho (cards, swatches, miniaturas)
//  - <nombre>-lg.webp  → máx 1600px, solo banners (carrusel a todo el ancho en desktop)
//  - src/data/lqip.json → miniatura de 20px en base64 por foto (blur-up mientras carga la real)
// Ignora archivos VERIFICAR-* (fotos a confirmar) y personita* (falta permiso).
// Saltea las versiones que ya existen y son más nuevas que el original.
import { readdir, mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const CARPETAS = ['productos', 'banners', 'estudio', 'mar', 'marca'];
const CON_LQIP = new Set(['productos', 'estudio', 'mar']); // las que se ven en la web
const EXT = /\.(jpe?g|png|webp)$/i;
const IGNORAR = /^(VERIFICAR-|personita)/i;
const TAMANIOS = [
  { sufijo: '', ancho: 900 },
  { sufijo: '-sm', ancho: 400 },
];
const EXTRA = { banners: [{ sufijo: '-lg', ancho: 1600 }] };
const forzar = process.argv.includes('--forzar');

const mtime = (f) => stat(f).then((s) => s.mtimeMs, () => 0);

/**
 * ¿La foto tiene fondo blanco (estudio) o de escena (madera, exterior)?
 * Mira el borde de la foto: si casi todo es blanco/gris muy claro → 'blanco' (se usa mix-blend multiply).
 */
async function tipoDeFondo(archivo) {
  const N = 48;
  const { data } = await sharp(archivo).rotate().resize(N, N, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let claros = 0;
  let total = 0;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (x > 2 && x < N - 3 && y > 2 && y < N - 3) continue; // solo el marco de 3px
      const i = (y * N + x) * 3;
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      const claro = Math.min(r, g, b) > 225 && Math.max(r, g, b) - Math.min(r, g, b) < 22;
      claros += claro ? 1 : 0;
      total++;
    }
  }
  return claros / total > 0.8 ? 'blanco' : 'escena';
}

let total = 0;
let generadas = 0;
const lqip = {};
const fondos = {};

for (const carpeta of CARPETAS) {
  const origen = path.resolve('assets', carpeta);
  const destino = path.resolve('public/img', carpeta);
  await mkdir(destino, { recursive: true });

  for (const archivo of (await readdir(origen)).sort()) {
    if (!EXT.test(archivo) || IGNORAR.test(archivo)) continue;
    const nombre = archivo.replace(EXT, '');
    const entrada = path.join(origen, archivo);
    const tOrigen = await mtime(entrada);

    for (const { sufijo, ancho } of [...TAMANIOS, ...(EXTRA[carpeta] ?? [])]) {
      const salida = path.join(destino, `${nombre}${sufijo}.webp`);
      if (!forzar && (await mtime(salida)) > tOrigen) continue;
      await sharp(entrada)
        .rotate() // respeta la orientación EXIF de las fotos de celular
        .resize({ width: ancho, withoutEnlargement: true })
        .webp({ quality: 75, effort: 5 })
        .toFile(salida);
      generadas++;
    }

    if (CON_LQIP.has(carpeta)) {
      const buf = await sharp(entrada).rotate().resize({ width: 20 }).webp({ quality: 40 }).toBuffer();
      lqip[`/img/${carpeta}/${nombre}.webp`] = `data:image/webp;base64,${buf.toString('base64')}`;
    }
    if (carpeta === 'productos') fondos[`/img/productos/${nombre}.webp`] = await tipoDeFondo(entrada);
    total++;
  }
}

await writeFile(path.resolve('src/data/lqip.json'), JSON.stringify(lqip) + '\n');
await writeFile(path.resolve('src/data/fondos.json'), JSON.stringify(fondos, null, 1) + '\n');
const blancos = Object.values(fondos).filter((v) => v === 'blanco').length;
console.log(`fondos.json: ${blancos} con fondo blanco, ${Object.keys(fondos).length - blancos} de escena`);
const kb = (JSON.stringify(lqip).length / 1024).toFixed(1);
console.log(`Listo: ${total} imágenes (${generadas} versiones nuevas) → public/img · lqip.json ${Object.keys(lqip).length} miniaturas (${kb} KB)`);
