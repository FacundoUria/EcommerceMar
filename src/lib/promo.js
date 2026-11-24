// Hora de las promos y si una promo está vigente. Todo en el navegador: la promo se prende y se apaga sola.
// Vista previa: `?promo=preview` en cualquier URL simula estar adentro de la campaña (queda en la pestaña hasta
// cerrarla o abrir `?promo=off`). No hay link a esto en ningún lado.
import { CAMPANA } from '../config/promo.js';

const CLAVE = 'dh-promo-preview';
let preview = null;

function enPreview() {
  if (preview !== null) return preview;
  preview = false;
  if (typeof window === 'undefined') return preview;
  try {
    const p = new URLSearchParams(window.location.search).get('promo');
    if (p === 'preview') sessionStorage.setItem(CLAVE, '1');
    if (p === 'off') sessionStorage.removeItem(CLAVE);
    preview = sessionStorage.getItem(CLAVE) === '1';
  } catch {
    preview = new URLSearchParams(window.location.search).get('promo') === 'preview';
  }
  return preview;
}

/** Hora para las promos (ms). En vista previa: el primer día de la campaña al mediodía. */
export const ahoraPromo = () => (enPreview() ? Date.parse(CAMPANA.desde) + 12 * 3600 * 1000 : Date.now());

const ms = (f) => (f ? Date.parse(f) : NaN);

/** ¿Está vigente entre `desde` y `hasta` (ISO)? Sin alguna de las dos fechas, no. */
export function vigente(desde, hasta, t = ahoraPromo()) {
  const d = ms(desde);
  const h = ms(hasta);
  return Number.isFinite(d) && Number.isFinite(h) && t >= d && t <= h;
}

/** ¿Está en curso la campaña de toda la tienda (barra de anuncio, forma de pago, pedido)? */
export const campanaActiva = (t = ahoraPromo()) => vigente(CAMPANA.desde, CAMPANA.hasta, t);

/** Próximo momento (ms) en que empieza o termina alguna de estas promos, o null. */
export function proximoCambio(rangos, t = ahoraPromo()) {
  let prox = null;
  for (const { desde, hasta } of rangos) {
    for (const f of [ms(desde), ms(hasta) + 1000]) if (Number.isFinite(f) && f > t && (prox === null || f < prox)) prox = f;
  }
  return prox;
}

/** "Termina hoy" / "Termina mañana" / "Termina en 3 días" (días de calendario de Argentina). */
export function terminaEn(hasta, t = ahoraPromo()) {
  const dia = (x) => Math.floor((x - 3 * 3600 * 1000) / 86400000); // día en hora argentina (-03:00)
  const n = dia(ms(hasta)) - dia(t);
  if (n <= 0) return 'Termina hoy';
  if (n === 1) return 'Termina mañana';
  return `Termina en ${n} días`;
}
