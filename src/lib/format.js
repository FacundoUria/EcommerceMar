import { urlImagen } from './imagenes.js';

const ars =new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

export const formatPrecio = (n) => ars.format(n);

/** Versión chica (≈400px) de una imagen de /img (miniaturas; SmartImg igual arma su srcset completo). */
export const imgSm = (src) => (src ? urlImagen(src, 400) : src);

export const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
