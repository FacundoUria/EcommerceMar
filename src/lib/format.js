const ars = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

export const formatPrecio = (n) => ars.format(n);

/** Versión chica (400px) de una imagen de /img: "/img/x/foto.webp" → "/img/x/foto-sm.webp" */
export const imgSm = (src) => (src ? src.replace(/\.webp$/, '-sm.webp') : src);

export const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
