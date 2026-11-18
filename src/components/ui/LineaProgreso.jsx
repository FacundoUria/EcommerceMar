import { m, useReducedMotion } from 'motion/react';

/**
 * Línea fina que se "dibuja" con scaleX (o scaleY si `vertical`) según un MotionValue 0→1,
 * por ejemplo el scrollYProgress de una sección. Solo transform. Con movimiento reducido queda completa.
 */
export default function LineaProgreso({ progreso, vertical = false, className = '' }) {
  const reducido = useReducedMotion();
  const valor = reducido ? 1 : progreso;
  return (
    <span aria-hidden="true" className={`pointer-events-none block overflow-hidden bg-verde/20 ${vertical ? 'w-px' : 'h-px'} ${className}`}>
      <m.span
        className={`block size-full bg-verde ${vertical ? 'origin-top' : 'origin-left'}`}
        style={vertical ? { scaleY: valor } : { scaleX: valor }}
      />
    </span>
  );
}
