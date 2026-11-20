// De dónde sale cada imagen del sitio y cómo se exporta (lo usan optimizar-assets.mjs y auditar-imagenes.mjs).
//
// Regla: los webp se generan SIEMPRE desde el original de mayor resolución que haya, nunca desde un webp o
// jpg ya achicado (sin doble compresión). Los originales tal como los mandó Mar viven en
// assets/<carpeta>/originales/ (ignorada por git); en assets/<carpeta>/ quedan las versiones renombradas.
// Si en esta máquina no está el original (clon nuevo), se usa la de assets/<carpeta>/<nombre>.
import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

/**
 * Por carpeta: anchos a exportar (se agrega el ancho del original si es menor que el mayor; nunca se
 * agranda) y calidad webp. Fotos q82; banners q88 (traen texto: que las letras queden nítidas);
 * marca q88 (logo con letras chicas e ilustración).
 */
export const CARPETAS = {
  productos: { anchos: [400, 640, 960, 1280], calidad: 82 },
  banners: { anchos: [480, 800, 1200, 1600], calidad: 88 },
  estudio: { anchos: [400, 640, 960, 1280], calidad: 82 },
  mar: { anchos: [400, 640, 960, 1280], calidad: 82 },
  marca: { anchos: [96, 192, 320, 480], calidad: 88 },
  resenas: { anchos: [96, 192], calidad: 82 },
};

const O = (carpeta, archivo) => `assets/${carpeta}/originales/${archivo}`;
const W = (hora) => `WhatsApp Image 2026-11-20 at ${hora}.jpeg`; // fotos que mandó Mar por WhatsApp

/** Originales de mayor resolución (y recorte, en px del original) por imagen "carpeta/nombre". */
export const FUENTES = {
  // Fotos del estudio (las del celu de Mar, resolución completa)
  'estudio/asesoramiento-basico': { archivo: O('estudio', 'IMG_6208.JPG.jpeg') },
  'estudio/asesoramiento-completo': { archivo: O('estudio', 'IMG_6203.PNG') },
  'estudio/asesoramiento-deluxe': { archivo: O('estudio', 'IMG_6430.PNG') },
  'estudio/celulas-madre-infrarrojo': { archivo: O('estudio', 'IMG_6426.PNG') },
  'estudio/corte-en-seco': { archivo: O('estudio', 'IMG_6205.PNG') },
  'estudio/lavado': { archivo: O('estudio', 'IMG_6207.PNG') },
  'estudio/lo-hiciste-tu': { archivo: O('estudio', 'IMG_6429.JPG.jpeg') },
  'estudio/ozonoterapia': { archivo: O('estudio', 'IMG_6427.PNG') },
  // Banners (marcas-lideres: sin la franja "www.dreamhair.com" de abajo, dominio incorrecto)
  'banners/asesoramiento-corte-en-seco': { archivo: O('banners', 'WhatsApp Image 2026-11-18 at 18.20.56.jpeg') },
  'banners/dream-hair-studio': { archivo: O('banners', 'IMG_6216.JPG.jpeg') },
  'banners/envios-mendoza': { archivo: O('banners', 'IMG_6338.JPG.jpeg') },
  'banners/hola-soy-mar': { archivo: O('banners', 'IMG_6211.JPG.jpeg') },
  'banners/marcas-lideres': { archivo: O('banners', 'IMG_6212.JPG.jpeg'), recorte: { left: 0, top: 0, width: 1376, height: 644 } },
  'banners/promos-rulos': { archivo: O('banners', 'IMG_6334.JPG.jpeg') },
  // Reseñas: recorte cuadrado centrado en la cara
  'resenas/maria-victoria-lovisolo': { archivo: O('resenas', 'IMG_6503.PNG'), recorte: { left: 0, top: 250, width: 760, height: 760 } },
  'resenas/abril-cabrera': { archivo: O('resenas', 'IMG_6502.PNG'), recorte: { left: 60, top: 19, width: 280, height: 280 } },
  'resenas/magali-gonzalez': { archivo: O('resenas', 'IMG_6500.PNG'), recorte: { left: 144, top: 170, width: 900, height: 900 } },
  'resenas/carina-luna': { archivo: O('resenas', 'IMG_6498.PNG'), recorte: { left: 125, top: 160, width: 750, height: 750 } },
  // Productos nuevos de Mar (nov 2026). Las de modelo o fondo de color: `fondo: 'escena'` (sin multiply,
  // cover en su marco aunque el borde sea blanco) y `encuadre` = object-position del cover (CSS).
  'productos/cofia-xl-saten': { archivo: O('productos', W('10.06.10')), fondo: 'escena', encuadre: '55% 50%' },
  'productos/cofia-long-saten': { archivo: O('productos', W('10.06.35')), fondo: 'escena', encuadre: '40% 50%' },
  'productos/ondulador-saten': { archivo: O('productos', W('10.07.20')), fondo: 'escena' },
  'productos/practiplopping': { archivo: O('productos', W('10.08.16')), fondo: 'escena', encuadre: '50% 30%' },
  'productos/cepillo-tangle': { archivo: O('productos', W('10.08.45')) },
  'productos/cepillo-pinza': { archivo: O('productos', W('10.09.22')) },
  'productos/shampoo-skala-mais-cachos': { archivo: O('productos', W('10.10.30')) },
  'productos/crema-arbell-argan': { archivo: O('productos', W('10.10.52')) },
  'productos/atomizador-day-after': { archivo: O('productos', W('10.11.24')) }, // 425 px: pedir una mejor
  'productos/difusor-plegable': { archivo: O('productos', W('10.11.50')), fondo: 'escena' },
  'productos/mascara-han-alfa-keratina': { archivo: O('productos', W('10.12.52')) },
  'productos/ghee-lola-100': { archivo: O('productos', W('10.13.17')) },
  'productos/ghee-lola-350': { archivo: O('productos', W('10.13.33')) },
  // Álbumes (zips): mascarillas Lola 450 g y tratamientos Fidelité 270 g
  'productos/mascarillas-lola': { archivo: O('productos', W('10.10.01')) },
  'productos/mascarillas-lola-milagre': { archivo: O('productos', W('10.10.01 (1)')) },
  'productos/mascarillas-lola-dream-cream': { archivo: O('productos', W('10.10.01 (2)')) },
  'productos/mascarillas-lola-danos-vorazes': { archivo: O('productos', W('10.10.01 (3)')) },
  'productos/mascarillas-lola-morte-subita': { archivo: O('productos', W('10.10.02')) },
  'productos/tratamientos-fidelite': { archivo: O('productos', W('10.12.26')) },
  'productos/tratamientos-fidelite-keratina': { archivo: O('productos', W('10.12.26 (1)')) },
  'productos/tratamientos-fidelite-almendras': { archivo: O('productos', W('10.12.26 (2)')) },
  'productos/tratamientos-fidelite-coco-vainilla': { archivo: O('productos', W('10.12.27')) },
};

const EXT = /\.(jpe?g|png|webp)$/i;
const IGNORAR = /^(VERIFICAR-|personita)/i; // fotos a confirmar / sin permiso

/**
 * Imágenes de una carpeta: [{ nombre, archivo, recorte, desdeOriginal, fondo, encuadre }] (solo el primer
 * nivel). `fondo` ('blanco' | 'escena') pisa la detección automática; `encuadre` es el object-position.
 */
export async function imagenesDe(carpeta) {
  const dir = path.resolve('assets', carpeta);
  const lista = [];
  for (const archivo of (await readdir(dir)).sort()) {
    if (!EXT.test(archivo) || IGNORAR.test(archivo)) continue;
    const nombre = archivo.replace(EXT, '');
    const f = FUENTES[`${carpeta}/${nombre}`];
    const original = f && existsSync(path.resolve(f.archivo));
    lista.push({
      nombre,
      archivo: original ? path.resolve(f.archivo) : path.join(dir, archivo),
      // el recorte es en px del original; la copia de assets/ ya viene recortada
      recorte: original ? f.recorte : undefined,
      desdeOriginal: !!original,
      faltaOriginal: !!f && !original, // hay original definido pero no está en esta máquina
      // valen con o sin original (la copia de assets/ es la misma foto)
      fondo: f?.fondo,
      encuadre: f?.encuadre,
    });
  }
  return lista;
}

/** Anchos a exportar: los de la carpeta menores al original + el del original si es más chico que el mayor. */
export function anchosPara(original, anchos) {
  const lista = anchos.filter((w) => w < original);
  if (original <= anchos[anchos.length - 1]) {
    // si el original está apenas arriba del último paso, lo reemplaza (no dos archivos casi iguales)
    if (lista.length && original < lista[lista.length - 1] * 1.12) lista.pop();
    lista.push(original);
  } else if (!lista.includes(anchos[anchos.length - 1])) {
    lista.push(anchos[anchos.length - 1]);
  }
  return lista;
}
