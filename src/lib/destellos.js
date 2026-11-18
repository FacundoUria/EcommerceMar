// Destellos sueltos (DOM + Web Animations API, solo transform/opacity): explosión al agregar al carrito
// y lluvia cuando la rutina queda completa. Se crean en <body> (no los recorta ningún overflow) y se
// borran al terminar. Con movimiento reducido no hacen nada.
import { PATH_ESTRELLA } from './rulos.js';

const DORADOS = ['#7e602b', '#9a7535', '#a8823f', '#c9a55c'];
const azar = (min, max) => min + Math.random() * (max - min);
const reducido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function estrella(tam, color) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  el.setAttribute('viewBox', '0 0 24 24');
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<path d="${PATH_ESTRELLA}" style="fill:${color}"/>`; // style: admite color-mix()
  Object.assign(el.style, { position: 'absolute', left: `${-tam / 2}px`, top: `${-tam / 2}px`, width: `${tam}px`, height: `${tam}px`, willChange: 'transform, opacity' });
  return el;
}

function capa() {
  const el = document.createElement('div');
  el.setAttribute('aria-hidden', 'true');
  Object.assign(el.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '10000', overflow: 'hidden' });
  document.body.appendChild(el);
  return el;
}

/**
 * 10–12 destellos que salen del centro de `origen` en direcciones al azar, se achican y desaparecen (0.6 s).
 * `color`: el del producto (src/lib/colores.js); los destellos alternan ese color, mezclas con dorado y dorado.
 */
export function explotarDestellos(origen, color) {
  if (!origen?.getBoundingClientRect || reducido() || !Element.prototype.animate) return;
  const r = origen.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const c = capa();
  const n = 10 + Math.floor(Math.random() * 3);
  const paleta = color
    ? [color, `color-mix(in srgb, ${color} 55%, #a8823f)`, '#9a7535', `color-mix(in srgb, ${color} 30%, #c9a55c)`]
    : DORADOS;
  const anims = [];
  for (let i = 0; i < n; i++) {
    const s = estrella(azar(8, 15), paleta[i % paleta.length]);
    s.style.left = `${cx + parseFloat(s.style.left)}px`;
    s.style.top = `${cy + parseFloat(s.style.top)}px`;
    c.appendChild(s);
    const ang = (i / n) * Math.PI * 2 + azar(-0.3, 0.3);
    const dist = azar(38, 78);
    const giro = azar(-120, 120);
    anims.push(
      s.animate(
        // easing por tramo (la animación es lineal): salen rápido y grandes, después se achican y se apagan
        [
          { transform: 'translate(0,0) scale(0.4) rotate(0deg)', opacity: 1, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
          { transform: `translate(${Math.cos(ang) * dist * 0.75}px, ${Math.sin(ang) * dist * 0.75}px) scale(1) rotate(${giro / 2}deg)`, opacity: 1, offset: 0.4, easing: 'cubic-bezier(0.5, 0, 0.75, 0)' },
          { transform: `translate(${Math.cos(ang) * dist}px, ${Math.sin(ang) * dist}px) scale(0) rotate(${giro}deg)`, opacity: 0 },
        ],
        { duration: 600 },
      ).finished,
    );
  }
  Promise.allSettled(anims).then(() => c.remove());
}

/** Lluvia suave de destellos desde arriba de la pantalla (≈ 1.5 s en total). */
export function lluviaDestellos(cantidad = 26) {
  if (reducido() || !Element.prototype.animate) return;
  const c = capa();
  const ancho = window.innerWidth;
  const alto = window.innerHeight;
  const anims = [];
  for (let i = 0; i < cantidad; i++) {
    const s = estrella(azar(7, 15), DORADOS[i % DORADOS.length]);
    s.style.left = `${azar(0.04, 0.96) * ancho}px`;
    s.style.top = '-16px';
    c.appendChild(s);
    const caida = alto * azar(0.45, 0.8);
    const deriva = azar(-40, 40);
    anims.push(
      s.animate(
        [
          { transform: 'translate(0,0) scale(0.6) rotate(0deg)', opacity: 0, easing: 'ease-out' },
          { transform: `translate(${deriva * 0.3}px, ${caida * 0.25}px) scale(1) rotate(60deg)`, opacity: 1, offset: 0.2, easing: 'cubic-bezier(0.33, 0, 0.6, 1)' },
          { transform: `translate(${deriva}px, ${caida}px) scale(0.3) rotate(${azar(140, 260)}deg)`, opacity: 0 },
        ],
        { duration: azar(850, 1000), delay: azar(0, 500), fill: 'backwards' },
      ).finished,
    );
  }
  Promise.allSettled(anims).then(() => c.remove());
}
