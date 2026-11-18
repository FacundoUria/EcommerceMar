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
