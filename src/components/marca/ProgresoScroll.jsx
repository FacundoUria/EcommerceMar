import { useEffect, useMemo, useState } from 'react';
import { m, useScroll } from 'motion/react';
import { onda } from '../../lib/rulos.js';

const ALTO = 8;
const anchoVista = () => (typeof document === 'undefined' ? 1200 : document.documentElement.clientWidth);

/**
 * Progreso de scroll de la página: una línea fina ondulada (rulo estirado) arriba de todo, verde,
 * que se completa con el scroll (pathLength = stroke-dashoffset). La onda se recalcula al cambiar
 * el ancho (sin estirar el trazo). Sigue al scroll también con movimiento reducido: es información,
 * no decoración (no se mueve sola).
 */
export default function ProgresoScroll() {
  const { scrollYProgress } = useScroll();
  const [ancho, setAncho] = useState(anchoVista);

  useEffect(() => {
    const alCambiar = () => setAncho(anchoVista());
    window.addEventListener('resize', alCambiar, { passive: true });
    return () => window.removeEventListener('resize', alCambiar);
  }, []);

  const d = useMemo(() => onda({ largo: ancho, alto: ALTO }), [ancho]);

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={ancho}
      height={ALTO}
      viewBox={`0 0 ${ancho} ${ALTO}`}
      className="pointer-events-none fixed top-0 left-0 z-[60]"
    >
      {/* linecap butt: con 0% no queda un puntito en la esquina */}
      <m.path d={d} fill="none" stroke="#3e6450" strokeWidth="1.5" style={{ pathLength: scrollYProgress }} />
    </svg>
  );
}
