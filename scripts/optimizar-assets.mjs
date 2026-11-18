// Convierte las fotos de assets/ a webp livianos en public/img/<carpeta>/.
// Uso: npm run assets:optimizar
//  - <nombre>.webp     → máx 900px de ancho (fotos grandes, galería)
//  - <nombre>-sm.webp  → máx 400px de ancho (cards, swatches, miniaturas)
// Ignora archivos VERIFICAR-* (fotos a confirmar) y personita* (falta permiso).
import { readdir, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const CARPETAS = ['productos', 'banners', 'estudio', 'mar', 'marca'];
const EXT = /\.(jpe?g|png|webp)$/i;
const IGNORAR = /^(VERIFICAR-|personita)/i;
const TAMANIOS = [
  { sufijo: '', ancho: 900 },
  { sufijo: '-sm', ancho: 400 },
];

let total = 0;
let pesoOrig = 0;
let pesoNuevo = 0;

for (const carpeta of CARPETAS) {
  const origen = path.resolve('assets', carpeta);
  const destino = path.resolve('public/img', carpeta);
  await mkdir(destino, { recursive: true });

  for (const archivo of await readdir(origen)) {
    if (!EXT.test(archivo) || IGNORAR.test(archivo)) continue;
    const nombre = archivo.replace(EXT, '');
    const entrada = path.join(origen, archivo);
    pesoOrig += (await stat(entrada)).size;

    for (const { sufijo, ancho } of TAMANIOS) {
      const salida = path.join(destino, `${nombre}${sufijo}.webp`);
      const info = await sharp(entrada)
        .rotate() // respeta la orientación EXIF de las fotos de celular
        .resize({ width: ancho, withoutEnlargement: true })
        .webp({ quality: 75, effort: 5 })
        .toFile(salida);
      if (!sufijo) pesoNuevo += info.size;
    }
    total++;
  }
}

const mb = (b) => (b / 1024 / 1024).toFixed(1) + ' MB';
console.log(`Listo: ${total} imágenes → public/img (${mb(pesoOrig)} → ${mb(pesoNuevo)} en tamaño grande)`);
