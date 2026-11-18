import { useLayoutEffect, useRef, useState } from 'react';
import { rulo } from '../../lib/rulos.js';
import Destellos from './Destellos.jsx';

// Destellos alrededor de las palabras (posición en % de la caja de las palabras, tamaño en px)
const PUNTOS = [
  { x: '-6%', y: '-22%', tam: 14 },
  { x: '96%', y: '-30%', tam: 18 },
  { x: '104%', y: '42%', tam: 10 },
  { x: '38%', y: '-40%', tam: 9 },
  { x: '-12%', y: '78%', tam: 11 },
];

/**
 * Subrayado en forma de rulo (se dibuja a mano, 0.9 s, al terminar de entrar el título) + destellos,
 * sobre las palabras con `selector` dentro del elemento padre (que tiene que ser `relative`).
 * Mide con offsetLeft/offsetTop (ignoran el transform de la animación de entrada) y vuelve a medir
 * al cambiar el ancho o al cargar las fuentes. Si las palabras caen en dos líneas, usa la última.
 * Usa su propia ref + parentElement: la ref del padre todavía no está conectada cuando corre este efecto.
 */
export default function AdornoTitulo({ selector = '.brillo-dorado', delay = 1.25 }) {
  const propio = useRef(null);
  const [caja, setCaja] = useState(null);

  useLayoutEffect(() => {
    const el = propio.current?.parentElement;
    if (!el) return;
    const medir = () => {
      const palabras = [...el.querySelectorAll(selector)].map((p) => p.closest('[data-palabra]') ?? p);
      if (!palabras.length) return;
      const ultima = palabras[palabras.length - 1];
      const linea = palabras.filter((p) => Math.abs(p.offsetTop - ultima.offsetTop) < 4);
      const left = Math.min(...linea.map((p) => p.offsetLeft));
      const right = Math.max(...linea.map((p) => p.offsetLeft + p.offsetWidth));
      setCaja({ left, top: ultima.offsetTop, width: right - left, height: ultima.offsetHeight });
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    document.fonts?.ready.then(medir);
    return () => ro.disconnect();
  }, [selector]);

  if (!caja || caja.width < 20) return <span ref={propio} hidden />;

  // Subrayado: rulo estirado del ancho de las palabras, ~30% del alto de la línea
  const w = Math.round(caja.width);
  const h = Math.max(14, Math.round(caja.height * 0.3));
  const ovalo = 0.6;
  const d = rulo({ x: 3, y: 2, largo: w - 6, vueltas: Math.min(6, Math.max(3, Math.round(w / 70))), radio: (h - 5) / (2 * ovalo), ovalo, afinar: 0.25 });

  return (
    <span ref={propio} aria-hidden="true" className="pointer-events-none absolute" style={{ left: caja.left, top: caja.top, width: caja.width, height: caja.height }}>
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="absolute left-0 top-[88%] overflow-visible" focusable="false">
        <path d={d} pathLength="1" fill="none" stroke="#7e602b" strokeWidth="2" strokeLinecap="round" className="trazo-a-mano" style={{ '--delay': `${delay}s` }} />
      </svg>
      <Destellos puntos={PUNTOS} />
    </span>
  );
}
