// Miniaturas de 20px (blur-up): las de /img las genera scripts/optimizar-assets.mjs (chunk aparte, lqip.json);
// las de las fotos subidas desde el panel vienen de la tabla `fotos` de Supabase (con copia en localStorage).
// Se cargan las dos juntas después del load, sin bloquear; mientras no llegan, el fondo es salvia-media.
import { useSyncExternalStore } from 'react';
import { claveImagen, datosFoto, registrarFotos } from './imagenes.js';
import { alActualizar, getLqipFotos } from '../services/productsService.js';

let mapa = null;
let promesa = null;
const subs = new Set();
const avisar = () => subs.forEach((cb) => cb());
const registrarSubidas = (porUrl) => registrarFotos(Object.entries(porUrl ?? {}).map(([url, lqip]) => ({ url, lqip })));

export function cargarLqip() {
  if (!promesa) {
    // allSettled: si una de las dos falla, la otra igual se usa
    promesa = Promise.allSettled([
      import('../data/lqip.json').then((m) => {
        mapa = m.default;
      }),
      getLqipFotos().then(registrarSubidas),
    ]).then(avisar);
    alActualizar((tipo) => tipo === 'lqip' && getLqipFotos().then(registrarSubidas).then(avisar, () => {}));
  }
  return promesa;
}

const suscribir = (cb) => {
  subs.add(cb);
  return () => subs.delete(cb);
};

/** Data URI de la miniatura de una foto (de /img, acepta la versión -sm; o subida desde el panel). */
export function useLqip(src) {
  return useSyncExternalStore(
    suscribir,
    () => (src ? ((mapa && mapa[`${claveImagen(src)}.webp`]) ?? datosFoto(src)?.lqip ?? null) : null),
    () => null,
  );
}
