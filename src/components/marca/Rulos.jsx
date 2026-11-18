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
 * - El padre tiene que ser `relative isolate` (-z: detrás del contenido, delante del fondo).
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
