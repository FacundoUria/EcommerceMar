// Color dominante de cada foto de producto (lo genera scripts/optimizar-assets.mjs, ignora blancos y grises).
// No cambia la paleta base: solo tiñe el halo detrás del producto, el borde en hover, el fondo de la foto
// en /producto y los destellos al agregar. Foto neutra o desconocida → dorado suave.
import colores from '../data/colores.json';

export const COLOR_NEUTRO = '#c9a55c';

/** Color de una foto (acepta la versión -sm). */
export const colorDe = (src) => colores[src?.replace(/-sm\.webp$/, '.webp')] ?? COLOR_NEUTRO;
