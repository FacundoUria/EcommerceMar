import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { rulo } from '../../lib/rulos.js';

const DORADO = 'rgb(126 96 43 / 0.25)';
const VERDE = 'rgb(62 100 80 / 0.25)';

// Composiciones por sección (viewBox 400x400). `rango`: tramo del scroll de la sección en que se dibuja cada trazo.
const VARIANTES = {
  hero: {
    caja: 'top-0 right-0 w-[78vw] max-w-[34rem] translate-x-[18%] -translate-y-[8%] md:w-[44vw]',
    trazos: [
      { d: rulo({ x: 40, y: 60, largo: 330, vueltas: 4, radio: 34, angulo: 32 }), color: DORADO, rango: [0.3, 0.62] },
      { d: rulo({ x: 120, y: 20, largo: 260, vueltas: 3, radio: 26, angulo: 48, afinar: 0.5 }), color: VERDE, rango: [0.34, 0.7] },
      { d: rulo({ x: 10, y: 170, largo: 220, vueltas: 3, radio: 22, angulo: 18, ovalo: 0.9 }), color: DORADO, rango: [0.4, 0.78] },
    ],
  },
  rutina: {
    caja: 'bottom-0 left-0 w-[80vw] max-w-[36rem] -translate-x-[22%] translate-y-[6%] md:w-[42vw]',
    trazos: [
      { d: rulo({ x: 30, y: 360, largo: 360, vueltas: 5, radio: 30, angulo: -38 }), color: VERDE, rango: [0.05, 0.45] },
      { d: rulo({ x: 0, y: 260, largo: 300, vueltas: 4, radio: 24, angulo: -22, afinar: 0.5 }), color: DORADO, rango: [0.15, 0.6] },
      { d: rulo({ x: 120, y: 390, largo: 250, vueltas: 3, radio: 28, angulo: -55, ovalo: 0.9 }), color: DORADO, rango: [0.3, 0.75] },
      { d: rulo({ x: 200, y: 330, largo: 160, vueltas: 2, radio: 18, angulo: -30 }), color: VERDE, rango: [0.45, 0.9] },
    ],
  },
  // ── Páginas internas (los monta App dentro de <main>; el progreso es el de la página entera) ──
  tienda: {
    caja: 'top-0 right-0 w-[72vw] max-w-[30rem] translate-x-[22%] -translate-y-[6%] md:w-[34vw]',
    trazos: [
      { d: rulo({ x: 20, y: 80, largo: 360, vueltas: 5, radio: 28, angulo: 28 }), color: DORADO, rango: [0.08, 0.32] },
      { d: rulo({ x: 90, y: 30, largo: 280, vueltas: 4, radio: 22, angulo: 44, afinar: 0.5 }), color: VERDE, rango: [0.12, 0.4] },
    ],
  },
  producto: {
    caja: 'top-[38%] left-0 w-[70vw] max-w-[28rem] -translate-x-[38%] md:w-[30vw]',
    trazos: [
      { d: rulo({ x: 40, y: 40, largo: 340, vueltas: 4, radio: 32, angulo: 62 }), color: DORADO, rango: [0.2, 0.55] },
      { d: rulo({ x: 130, y: 10, largo: 300, vueltas: 4, radio: 22, angulo: 78, ovalo: 0.9 }), color: VERDE, rango: [0.26, 0.65] },
    ],
  },
  rutinaPagina: {
    caja: 'bottom-0 right-0 w-[78vw] max-w-[34rem] translate-x-[24%] md:w-[38vw]',
    trazos: [
      { d: rulo({ x: 380, y: 380, largo: 360, vueltas: 5, radio: 30, angulo: -140 }), color: VERDE, rango: [0.25, 0.7] },
      { d: rulo({ x: 390, y: 280, largo: 280, vueltas: 4, radio: 22, angulo: -155, afinar: 0.5 }), color: DORADO, rango: [0.32, 0.8] },
      { d: rulo({ x: 300, y: 395, largo: 200, vueltas: 3, radio: 20, angulo: -120 }), color: DORADO, rango: [0.4, 0.9] },
    ],
  },
  servicios: {
    caja: 'top-0 left-0 w-[74vw] max-w-[32rem] -translate-x-[26%] -translate-y-[4%] md:w-[36vw]',
    trazos: [
      { d: rulo({ x: 380, y: 40, largo: 350, vueltas: 5, radio: 28, angulo: 150 }), color: DORADO, rango: [0.1, 0.38] },
      { d: rulo({ x: 390, y: 130, largo: 260, vueltas: 3, radio: 24, angulo: 165, ovalo: 0.9 }), color: VERDE, rango: [0.15, 0.45] },
    ],
  },
  carrito: {
    caja: 'top-[12%] right-0 w-[70vw] max-w-[28rem] translate-x-[36%] md:w-[30vw]',
    trazos: [
      { d: rulo({ x: 60, y: 20, largo: 340, vueltas: 4, radio: 30, angulo: 100 }), color: VERDE, rango: [0.3, 0.7] },
      { d: rulo({ x: 160, y: 40, largo: 260, vueltas: 3, radio: 22, angulo: 115, afinar: 0.5 }), color: DORADO, rango: [0.35, 0.8] },
    ],
  },
  footer: {
    caja: 'top-0 right-0 w-[90vw] max-w-[40rem] translate-x-[12%] -translate-y-[14%] md:w-[46vw]',
    trazos: [
      { d: rulo({ x: 0, y: 120, largo: 390, vueltas: 5, radio: 30, angulo: -8 }), color: DORADO, rango: [0, 0.75] },
      { d: rulo({ x: 60, y: 210, largo: 320, vueltas: 4, radio: 24, angulo: -18, afinar: 0.45 }), color: VERDE, rango: [0.1, 0.85] },
      { d: rulo({ x: 150, y: 60, largo: 240, vueltas: 3, radio: 20, angulo: 6, ovalo: 0.9 }), color: VERDE, rango: [0.2, 1] },
    ],
  },
};

/**
 * Rulos decorativos detrás del contenido de una sección, que se dibujan con el scroll de esa sección.
 * - Progreso: de "el borde de arriba entra por abajo de la pantalla" a "el de abajo sale por arriba"
 *   (con `hastaElFinal`: hasta que el borde de abajo llega al de la pantalla; el footer termina de
 *   dibujarse al final de la página).
 * - Se escribe stroke-dashoffset directo en el DOM (rAF, sin re-renders). Es propio en vez de
 *   useScroll/pathLength de motion: aquel no pinta el valor inicial hasta el primer scroll y el hero
 *   arrancaba sin rulos.
 * - Se mide sobre la propia capa (absolute inset-0 = la caja de la sección): la ref de la sección
 *   todavía no está conectada cuando monta este hijo.
 * - El padre tiene que ser `relative` (con `isolate` en las secciones con fondo propio: -z queda detrás
 *   del contenido y delante del fondo). En <main> no hay isolate (encerraría los z-index de los
 *   paneles fijos de cada página): ahí la capa va sobre el fondo del body y detrás del contenido.
 * - `fijo`: en secciones altas con sticky (rutina desktop), la capa acompaña la pantalla.
 * - Movimiento reducido: ya dibujados y quietos (no se escucha el scroll).
 */
export default function Rulos({ variante, fijo = false, hastaElFinal = false }) {
  const reducido = useReducedMotion();
  const capa = useRef(null);
  const v = VARIANTES[variante];

  useEffect(() => {
    const el = capa.current;
    if (!el || reducido) return;
    const paths = [...el.querySelectorAll('path')];
    let raf = 0;
    let ultimo = -1;
    const medir = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const recorrido = hastaElFinal ? r.height : vh + r.height;
      const p = Math.min(1, Math.max(0, (vh - r.top) / Math.max(1, recorrido)));
      if (Math.abs(p - ultimo) < 0.001) return;
      ultimo = p;
      paths.forEach((path, i) => {
        const [a, b] = v.trazos[i].rango;
        const t = Math.min(1, Math.max(0, (p - a) / (b - a)));
        path.style.strokeDashoffset = String(1 - t);
      });
    };
    const pedir = () => {
      if (!raf) raf = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener('scroll', pedir, { passive: true });
    const ro = new ResizeObserver(pedir);
    ro.observe(el);
    return () => {
      window.removeEventListener('scroll', pedir);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [reducido, hastaElFinal, v]);

  const svg = (
    <svg viewBox="0 0 400 400" className={`absolute ${v.caja}`} aria-hidden="true" focusable="false">
      {v.trazos.map((t, i) => (
        <path
          key={i}
          d={t.d}
          pathLength="1"
          fill="none"
          stroke={t.color}
          strokeWidth="1.3" // el viewBox de 400 se dibuja a ~450–550px: en pantalla queda ≈ 1.5px
          // dasharray 1 1 + offset 1 = oculto; offset 0 = dibujado. Remate butt: a 0% no queda un puntito.
          style={reducido ? undefined : { strokeDasharray: '1 1', strokeDashoffset: 1 }}
        />
      ))}
    </svg>
  );

  return (
    <div ref={capa} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-[5]">
      {fijo ? <div className="sticky top-0 h-screen overflow-hidden">{svg}</div> : <div className="absolute inset-0 overflow-hidden">{svg}</div>}
    </div>
  );
}
