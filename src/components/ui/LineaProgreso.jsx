import { m, useReducedMotion } from 'motion/react';

/**
 * Línea fina que se "dibuja" con scaleX (solo transform) según un MotionValue 0→1,
 * por ejemplo el scrollYProgress de una sección. Con movimiento reducido queda completa.
 */
export default function LineaProgreso({ progreso, className = '' }) {
  const reducido = useReducedMotion();
  return (
    <span aria-hidden="true" className={`pointer-events-none block h-px overflow-hidden bg-verde/20 ${className}`}>
      <m.span className="block h-full origin-left bg-verde" style={{ scaleX: reducido ? 1 : progreso }} />
    </span>
  );
}
