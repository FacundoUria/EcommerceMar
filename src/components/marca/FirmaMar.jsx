import { useLayoutEffect, useRef } from 'react';
import { useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';

// "Mar" escrito a mano en un solo trazo (M de tres arcos, a con su panza, r con hombro) y un remate que
// sube. viewBox 0 0 190 92.
const TRAZO =
  'M10 74 C14 60 18 36 25 22 C28 15 33 17 32 27 C31 42 29 57 31 69 ' +
  'C34 52 40 30 47 22 C51 17 55 21 54 30 C53 44 51 58 53 68 ' +
  'C56 52 62 33 68 26 C72 22 76 26 75 35 C74 47 72 59 76 66 ' +
  'C80 72 86 64 89 57 C92 49 89 43 82 45 C74 48 72 63 80 65 ' +
  'C86 66 92 57 95 48 C94 57 93 65 99 67 C104 68 108 58 111 49 ' +
  // r: sube en punta, piquito y hombro corto antes de bajar (si no, se lee como una n)
  'C112 44 115 43 115 48 C118 44 122 45 122 50 C122 57 121 63 126 66 ' +
  'C140 64 162 54 182 40';

/**
 * Firma "Mar" (dorada, trazo caligráfico) que se dibuja con el scroll de la sección: stroke-dashoffset
 * escrito directo en el DOM (como los rulos, sin re-renders). Movimiento reducido: ya dibujada.
 */
export default function FirmaMar({ className = '' }) {
  const svg = useRef(null);
  const path = useRef(null);
  const largo = useRef(0);
  const reducido = useReducedMotion();
  // Se dibuja mientras la firma sube desde el borde de abajo hasta el 55% de la pantalla
  const { scrollYProgress } = useScroll({ target: svg, offset: ['start 95%', 'start 55%'] });

  const pintar = (p) => {
    const el = path.current;
    if (!el || !largo.current) return;
    el.style.strokeDashoffset = reducido ? '0' : String(largo.current * (1 - Math.min(1, Math.max(0, p))));
  };

  // Valor inicial antes de pintar (no espera al primer scroll)
  useLayoutEffect(() => {
    const el = path.current;
    if (!el) return;
    largo.current = el.getTotalLength();
    el.style.strokeDasharray = String(largo.current);
    pintar(scrollYProgress.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducido]);
  useMotionValueEvent(scrollYProgress, 'change', pintar);

  return (
    <svg ref={svg} viewBox="0 0 190 92" role="img" aria-label="Firma: Mar" className={`h-auto w-36 text-dorado md:w-44 ${className}`}>
      <path ref={path} d={TRAZO} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
