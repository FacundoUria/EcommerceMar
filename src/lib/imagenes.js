// Versiones de cada imagen de /img (las genera scripts/optimizar-assets.mjs en src/data/imagenes.json).
// En los datos las imágenes se nombran "/img/<carpeta>/<nombre>.webp" (un identificador); los archivos
// reales son "<nombre>-<ancho>.webp" en una escalera de anchos que nunca supera al original.
import manifiesto from '../data/imagenes.json';

/**
 * "/img/x/foto.webp" | "-sm.webp" | "-640.webp" → "/img/x/foto". Si el nombre ya es una imagen del manifiesto
 * se usa tal cual: hay fotos cuyo nombre termina en número ("ghee-lola-350", "cepillo-pirulito-2") y sacarles
 * el "-350" como si fuera un ancho las confundía con otra foto (o con ninguna: quedaba el placeholder).
 */
export function claveImagen(src) {
  if (!src) return '';
  const nombre = src.replace(/\.webp$/, '');
  return manifiesto[nombre] ? nombre : src.replace(/(-sm|-lg|-\d+)?\.webp$/, '');
}

// ───────── Fotos subidas desde el panel (bucket "productos" de Supabase) ─────────
// El panel recorta cuadrado y sube 3 tamaños: 400, 800 y 1200 px, sin agrandar nunca (si el recorte mide
// menos de 1200, el más grande es el del recorte: 1000 → 400, 800, 1000). En los datos se guarda la URL de
// la versión más grande, "<base>-<ancho>.webp" (o .jpg si el navegador no sabe hacer webp): con ese ancho
// alcanza para saber cuáles hay.
export const ESCALERA_SUBIDAS = [400, 800, 1200];
const SUBIDA = /^(.+\/storage\/v1\/object\/public\/productos\/.+)-(\d+)\.(webp|jpg)$/;

/** Anchos que genera el panel para un recorte de `lado` px (nunca más grande que el recorte). */
export const anchosSubida = (lado) => {
  const max = Math.min(Math.round(lado), ESCALERA_SUBIDAS.at(-1));
  return [...ESCALERA_SUBIDAS.filter((w) => w < max), max];
};

/** { base, ext, w, o } de una foto del bucket, o null si no es una. */
function subida(src) {
  const m = typeof src === 'string' && src.match(SUBIDA);
  if (!m) return null;
  const max = Number(m[2]);
  return { base: m[1], ext: m[3], w: anchosSubida(max), o: [max, max] };
}

/** Todas las URLs (una por tamaño) de una foto del bucket: para borrarla. [] si no es del bucket. */
export const archivosSubida = (src) => {
  const s = subida(src);
  return s ? s.w.map((w) => `${s.base}-${w}.${s.ext}`) : [];
};

// Datos de las fotos subidas (tabla `fotos` de Supabase): color dominante, fondo y miniatura borrosa. Son los
// mismos que tienen las de /img en colores.json, fondos.json y lqip.json. Los registra el service al armar el
// catálogo (color y fondo) y lib/lqip.js (miniaturas); se buscan por la foto, sea cual sea el tamaño pedido.
const datosSubidas = new Map(); // base de la URL → { color, fondo, lqip }

/** Filas { url, color?, fondo?, lqip? } de la tabla `fotos`. */
export function registrarFotos(filas) {
  for (const f of filas ?? []) {
    const s = subida(f.url);
    if (!s) continue;
    const antes = datosSubidas.get(s.base) ?? {};
    const nuevo = { ...antes };
    for (const k of ['color', 'fondo', 'lqip']) if (k in f) nuevo[k] = f[k];
    datosSubidas.set(s.base, nuevo);
  }
}

/** { color, fondo, lqip } de una foto subida, o undefined (foto de /img o sin datos). */
export const datosFoto = (src) => {
  const s = subida(src);
  return s ? datosSubidas.get(s.base) : undefined;
};

/** { w: [anchos], o: [ancho, alto del original] } o null si no es una imagen de /img ni del bucket */
export const infoImagen = (src) => manifiesto[claveImagen(src)] ?? subida(src);

/**
 * Atributos de <img>: src (la versión más chica que cubra `anchoPx`, de fallback) + srcset con todos
 * los anchos. Con `sizes` el navegador elige la que corresponde a la densidad de la pantalla (1x/2x/3x).
 */
export function fuenteImagen(src, anchoPx = 640) {
  const clave = claveImagen(src);
  const m = manifiesto[clave];
  const s = m ? null : subida(src);
  if (!m && !s) return { src, srcSet: undefined };
  const anchos = (m ?? s).w;
  const url = m ? (x) => `${clave}-${x}.webp` : (x) => `${s.base}-${x}.${s.ext}`;
  const w = anchos.find((x) => x >= anchoPx) ?? anchos[anchos.length - 1];
  return {
    src: url(w),
    srcSet: anchos.map((x) => `${url(x)} ${x}w`).join(', '),
  };
}

/** URL de la versión más chica que cubra `anchoPx` px reales. */
export const urlImagen = (src, anchoPx) => fuenteImagen(src, anchoPx).src;

/** Atributos para un <img> de tamaño fijo en CSS (miniaturas): src + srcset + sizes. */
export const imgFija = (src, cssPx) => ({ ...fuenteImagen(src, cssPx * 2), sizes: `${cssPx}px` });

/**
 * Tope de resolución: las fotos con pocos px se muestran como máximo a la mitad de su ancho original
 * (nítidas a 2x en vez de estiradas). La auditoría (scripts/auditar-imagenes.mjs) lo apaga para medir
 * el tamaño que pide el diseño.
 */
export const conTope = () => !(typeof window !== 'undefined' && window.__auditoriaSinTope);
