// Hora de las promos y si una promo está vigente. Todo en el navegador: la promo se prende y se apaga sola.
// Vista previa: `?promo=preview` en cualquier URL simula estar adentro del Black Friday y
// `?promo=navidad-preview`, adentro del Especial de Navidad (el primer día de cada una, al mediodía). Queda en
// la pestaña hasta cerrarla o abrir `?promo=off`. No hay link a esto en ningún lado.
import { CAMPANA } from '../config/promo.js';
import { NAVIDAD } from '../config/navidad.js';

const CLAVE = 'dh-promo-preview';
const MEDIODIA = 12 * 3600 * 1000;
// valor de ?promo= → desde cuándo simula
const PREVIEWS = { preview: CAMPANA.desde, 'navidad-preview': NAVIDAD.desde };
let preview; // undefined = sin leer todavía; null = sin vista previa; si no, la clave de PREVIEWS

function enPreview() {
  if (preview !== undefined) return preview;
  preview = null;
  if (typeof window === 'undefined') return preview;
  const p = new URLSearchParams(window.location.search).get('promo');
  try {
    if (p in PREVIEWS) sessionStorage.setItem(CLAVE, p);
    if (p === 'off') sessionStorage.removeItem(CLAVE);
    const guardada = sessionStorage.getItem(CLAVE);
    preview = guardada === '1' ? 'preview' : guardada in PREVIEWS ? guardada : null; // '1': como se guardaba antes
  } catch {
    preview = p in PREVIEWS ? p : null;
  }
  return preview;
}

/** Hora para las promos (ms). En vista previa: el primer día de esa promo al mediodía. */
export const ahoraPromo = () => {
  const p = enPreview();
  return p ? Date.parse(PREVIEWS[p]) + MEDIODIA : Date.now();
};

const ms = (f) => (f ? Date.parse(f) : NaN);

/** ¿Está vigente entre `desde` y `hasta` (ISO)? Sin alguna de las dos fechas, no. */
export function vigente(desde, hasta, t = ahoraPromo()) {
  const d = ms(desde);
  const h = ms(hasta);
  return Number.isFinite(d) && Number.isFinite(h) && t >= d && t <= h;
}

/** ¿Está en curso la campaña de toda la tienda (barra de anuncio, forma de pago, pedido)? */
export const campanaActiva = (t = ahoraPromo()) => vigente(CAMPANA.desde, CAMPANA.hasta, t);

/** ¿Está en curso el Especial de Navidad (inicio, /servicios y barra de anuncio)? */
export const navidadActiva = (t = ahoraPromo()) => vigente(NAVIDAD.desde, NAVIDAD.hasta, t);

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
