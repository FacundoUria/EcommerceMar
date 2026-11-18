// Convierte las fotos de assets/ a webp livianos en public/img/<carpeta>/.
// Uso: npm run assets:optimizar   (agregar -- --forzar para regenerar todo)
//  - <nombre>.webp     → máx 900px de ancho (fotos grandes, galería)
//  - <nombre>-sm.webp  → máx 400px de ancho (cards, swatches, miniaturas)
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
const forzar = process.argv.includes('--forzar');

const mtime = (f) => stat(f).then((s) => s.mtimeMs, () => 0);

let total = 0;
let generadas = 0;
const lqip = {};

for (const carpeta of CARPETAS) {
  const origen = path.resolve('assets', carpeta);
  const destino = path.resolve('public/img', carpeta);
  await mkdir(destino, { recursive: true });

  for (const archivo of (await readdir(origen)).sort()) {
    if (!EXT.test(archivo) || IGNORAR.test(archivo)) continue;
    const nombre = archivo.replace(EXT, '');
    const entrada = path.join(origen, archivo);
    const tOrigen = await mtime(entrada);

    for (const { sufijo, ancho } of TAMANIOS) {
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
    total++;
  }
}

await writeFile(path.resolve('src/data/lqip.json'), JSON.stringify(lqip) + '\n');
const kb = (JSON.stringify(lqip).length / 1024).toFixed(1);
console.log(`Listo: ${total} imágenes (${generadas} versiones nuevas) → public/img · lqip.json ${Object.keys(lqip).length} miniaturas (${kb} KB)`);
