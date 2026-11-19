// Versiones de cada imagen de /img (las genera scripts/optimizar-assets.mjs en src/data/imagenes.json).
// En los datos las imágenes se nombran "/img/<carpeta>/<nombre>.webp" (un identificador); los archivos
// reales son "<nombre>-<ancho>.webp" en una escalera de anchos que nunca supera al original.
import manifiesto from '../data/imagenes.json';

/** "/img/x/foto.webp" | "-sm.webp" | "-640.webp" → "/img/x/foto" */
export const claveImagen = (src) => (src ? src.replace(/(-sm|-lg|-\d+)?\.webp$/, '') : '');

/** { w: [anchos], o: [ancho, alto del original] } o null si no es una imagen de /img */
export const infoImagen = (src) => manifiesto[claveImagen(src)] ?? null;

/**
 * Atributos de <img>: src (la versión más chica que cubra `anchoPx`, de fallback) + srcset con todos
 * los anchos. Con `sizes` el navegador elige la que corresponde a la densidad de la pantalla (1x/2x/3x).
 */
export function fuenteImagen(src, anchoPx = 640) {
  const clave = claveImagen(src);
  const m = manifiesto[clave];
  if (!m) return { src, srcSet: undefined };
  const w = m.w.find((x) => x >= anchoPx) ?? m.w[m.w.length - 1];
  return {
    src: `${clave}-${w}.webp`,
    srcSet: m.w.map((x) => `${clave}-${x}.webp ${x}w`).join(', '),
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
