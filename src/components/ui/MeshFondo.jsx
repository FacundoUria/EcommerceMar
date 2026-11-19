import { useRef } from 'react';
import { usePausaFueraDePantalla } from '../../hooks/usePausaFueraDePantalla.js';
/**
 * Fondo "mesh gradient" animado, solo CSS: 4 manchas difuminadas (radial-gradient)
 * que se desplazan muy lento (20–30 s, ida y vuelta) con transform.
 * Con prefers-reduced-motion quedan quietas (ver .mancha en index.css).
 * El padre tiene que ser `relative isolate overflow-hidden`.
 */
const MANCHAS = [
  { color: 'var(--color-salvia)', pos: '-left-[20%] -top-[25%]', tam: 'size-[80vmax] md:size-[60vmax]', anim: 'deriva-a 26s' },
  { color: 'var(--color-salvia-media)', pos: '-right-[25%] top-[10%]', tam: 'size-[70vmax] md:size-[50vmax]', anim: 'deriva-b 30s', opacidad: 0.75 },
  { color: 'var(--color-arena)', pos: 'left-[20%] -bottom-[30%]', tam: 'size-[75vmax] md:size-[55vmax]', anim: 'deriva-c 22s' },
  { color: 'rgb(126 96 43 / 0.15)', pos: 'right-[15%] -bottom-[10%]', tam: 'size-[45vmax] md:size-[32vmax]', anim: 'deriva-a 28s reverse' },
  // Toques de color de los productos (rosa y turquesa al 20%), sin cambiar la paleta base
  { color: 'rgb(244 182 194 / 0.2)', pos: '-left-[10%] top-[35%]', tam: 'size-[50vmax] md:size-[34vmax]', anim: 'deriva-b 27s reverse' },
  { color: 'rgb(158 216 210 / 0.2)', pos: 'right-[5%] -top-[15%]', tam: 'size-[48vmax] md:size-[32vmax]', anim: 'deriva-c 24s' },
];

export default function MeshFondo({ fundidoAbajo = true }) {
  // Las manchas son capas enormes: fuera de pantalla quedan quietas
  const ref = useRef(null);
  usePausaFueraDePantalla(ref);
  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-arena">
      {MANCHAS.map((mn, i) => (
        <span
          key={i}
          className={`mancha ${mn.pos} ${mn.tam}`}
          style={{
            background: `radial-gradient(circle at center, ${mn.color} 0%, transparent 68%)`,
            opacity: mn.opacidad ?? 1,
            animation: `${mn.anim} ease-in-out infinite alternate`,
          }}
        />
      ))}
      {fundidoAbajo && <span className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-arena" />}
    </div>
  );
}
