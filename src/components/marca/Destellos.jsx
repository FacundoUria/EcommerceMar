import { useState } from 'react';
import { PATH_ESTRELLA } from '../../lib/rulos.js';

export function Estrella({ className = '', style }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true" focusable="false">
      <path d={PATH_ESTRELLA} fill="currentColor" />
    </svg>
  );
}

const azar = (min, max) => min + Math.random() * (max - min);

// Alrededor de un título: arriba a la izquierda, arriba a la derecha y al costado
const PUNTOS_TITULO = [
  { x: '-5%', y: '-16%', tam: 12 },
  { x: '99%', y: '-10%', tam: 16 },
  { x: '104%', y: '52%', tam: 9 },
];

/** Envuelve un título principal y le suma destellos alrededor (se ajusta al ancho del texto). */
export function ConDestellos({ children, className = '' }) {
  return (
    <div className={`relative inline-block max-w-full ${className}`}>
      {children}
      <Destellos puntos={PUNTOS_TITULO} />
    </div>
  );
}

/**
 * Destellos que titilan (scale + opacity, CSS `.destello`) con duración y desfase al azar por estrella,
 * elegidos una vez al montar. `puntos`: [{ x, y, tam }] en % de la caja / px.
 * Con movimiento reducido no se muestran (ver index.css).
 */
export default function Destellos({ puntos, className = '' }) {
  const [tiempos] = useState(() => puntos.map(() => ({ dur: azar(2.4, 4.2), delay: azar(0.6, 3.4) })));
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      {puntos.map((p, i) => (
        <Estrella
          key={i}
          className="destello absolute text-dorado"
          style={{
            left: p.x,
            top: p.y,
            width: p.tam,
            height: p.tam,
            animationDuration: `${tiempos[i].dur}s`,
            animationDelay: `${tiempos[i].delay}s`,
          }}
        />
      ))}
    </span>
  );
}
