// Miniaturas de 20px (blur-up) generadas por scripts/optimizar-assets.mjs.
// Se cargan en un chunk aparte, sin bloquear; mientras no llegan, el fondo es salvia-media.
import { useSyncExternalStore } from 'react';
import { claveImagen } from './imagenes.js';

let mapa = null;
let promesa = null;
const subs = new Set();

export function cargarLqip() {
  if (!promesa) {
    promesa = import('../data/lqip.json')
      .then((m) => {
        mapa = m.default;
        subs.forEach((cb) => cb());
      })
      .catch(() => {});
  }
  return promesa;
}

const suscribir = (cb) => {
  subs.add(cb);
  return () => subs.delete(cb);
};

/** Data URI de la miniatura de una foto de /img (acepta la versión -sm). */
export function useLqip(src) {
  return useSyncExternalStore(
    suscribir,
    () => (src && mapa ? (mapa[`${claveImagen(src)}.webp`] ?? null) : null),
    () => null,
  );
}
