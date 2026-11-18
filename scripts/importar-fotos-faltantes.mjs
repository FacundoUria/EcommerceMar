// Baja de la Tiendanube de Mar las fotos de productos/servicios que no tenemos en assets/productos.
// Uso: npm run fotos:importar   (agregar -- --forzar para volver a bajar todo). Node 18+, sin dependencias.
import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { products, services } from '../src/data/products.js';

const BASE = 'https://dreamhairarg.mitiendanube.com/productos';
const OUT = path.resolve('assets/productos');
const forzar = process.argv.includes('--forzar');

const existe = (f) => access(f).then(() => true, () => false);

function ogImage(html) {
  const m =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (!m) return null;
  let url = m[1].replace(/&amp;/g, '&');
  if (url.startsWith('//')) url = 'https:' + url;
  return url;
}

// Tiendanube sirve tamaños con sufijo -<ancho>-<alto>.<ext>; pedimos la grande en webp.
const versionGrande = (url) => url.replace(/-\d+-\d+\.(webp|jpe?g|png)(\?.*)?$/i, '-1024-1024.webp');

async function bajar(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (importador de fotos)' } });
  if (!r.ok) throw new Error(`HTTP ${r.status} en ${url}`);
  return r;
}

const items = [...products, ...services].filter((p) => p.tn);
await mkdir(OUT, { recursive: true });

const ok = [];
const fallaron = [];
for (const item of items) {
  const destino = path.join(OUT, `${item.id}.webp`);
  if (!forzar && (await existe(destino))) {
    ok.push(`${item.id} (ya estaba)`);
    continue;
  }
  try {
    const html = await (await bajar(`${BASE}/${item.tn}/`)).text();
    const og = ogImage(html);
    if (!og) throw new Error('la página no tiene og:image');
    let res;
    try {
      res = await bajar(versionGrande(og));
    } catch {
      res = await bajar(og); // si no existe la grande, usamos la original
    }
    await writeFile(destino, Buffer.from(await res.arrayBuffer()));
    ok.push(item.id);
    console.log(`✓ ${item.id}`);
  } catch (e) {
    fallaron.push(`${item.id} (${item.tn}): ${e.message}`);
    console.log(`✗ ${item.id}: ${e.message}`);
  }
}

console.log(`\nListas: ${ok.length}/${items.length}`);
if (fallaron.length) {
  console.log('Fallaron (van a mostrar placeholder):');
  fallaron.forEach((f) => console.log('  - ' + f));
  process.exitCode = 1;
}
