import { useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { ANUNCIO } from '../../config/negocio.js';
import { Estrella } from '../marca/Destellos.jsx';

const TEXTO = ANUNCIO.join(' ');

/** Una vuelta del texto (las frases separadas por un espacio, como lo escribió Mar). */
function Tramo() {
  return (
    <span className="flex shrink-0 items-center gap-[0.35em] pr-[0.35em]">
      {ANUNCIO.map((f) => (
        <span key={f} className="whitespace-nowrap">
          {f}
        </span>
      ))}
      {/* Entre vuelta y vuelta, el destello de la marca (dorado claro sobre el verde) */}
      <Estrella className="mx-[0.6em] size-3 shrink-0 text-[#e9d8a6]" />
    </span>
  );
}

/**
 * Franja fina arriba de todo (sobre el header, en todas las páginas). Alto fijo (34px) y en el flujo
 * normal: al scrollear se va con la página y el header sticky queda arriba sin saltos (CLS 0).
 * Marquee infinito lento (solo transform, CSS); se pausa con hover y al tocarla (toque = pausa / sigue).
 * Movimiento reducido: quieta y centrada; las frases que no entran en una línea quedan ocultas.
 */
export default function BarraAnuncio() {
  const reducido = useReducedMotion();
  const [pausa, setPausa] = useState(false);

  return (
    <div className="h-[34px] overflow-hidden bg-verde text-[13px] leading-[34px] font-semibold text-arena">
      {reducido ? (
        <p className="contenedor flex h-[34px] flex-wrap justify-center gap-x-[0.35em]">
          {ANUNCIO.map((f) => (
            <span key={f} className="whitespace-nowrap">
              {f}
            </span>
          ))}
        </p>
      ) : (
        <>
          <p className="sr-only">{TEXTO}</p>
          <div
            aria-hidden="true"
            data-pausa={pausa || undefined}
            onPointerDown={(e) => e.pointerType !== 'mouse' && setPausa((p) => !p)}
            className="cinta-anuncio flex w-max"
          >
            {/* 6 tramos (≈ 800px c/u): cada mitad mide ≈ 2400px y cubre pantallas anchas sin huecos */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Tramo key={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
