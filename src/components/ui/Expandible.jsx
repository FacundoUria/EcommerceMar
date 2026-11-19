import { useId, useLayoutEffect, useRef, useState } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

/**
 * Texto recortado a `lineas` líneas con un botón que lo despliega animado (alto medido, 0.5 s).
 * - `lineas={0}`: el contenido arranca oculto del todo (bloque "Leer más" de "Hola, soy Mar").
 * - `soloMobile`: desde md se ve completo y sin botón.
 * Si el texto entra en las líneas pedidas, no hay botón ni recorte.
 * Excepción pedida a "solo transform/opacity": el alto se anima para que el resto de la página acompañe.
 */
export default function Expandible({
  children,
  lineas = 3,
  soloMobile = false,
  textoAbrir = 'Ver más',
  textoCerrar = 'Ver menos',
  className = '',
  classNameBoton = '',
}) {
  const desktop = useMediaQuery('(min-width: 768px)');
  const activo = !(soloMobile && desktop);
  const id = useId();
  const interior = useRef(null);
  const [abierto, setAbierto] = useState(false);
  const [medidas, setMedidas] = useState(null); // { total, cerrado }

  // Mide el alto completo y el de `lineas` líneas (y vuelve a medir si cambia: fuente, ancho).
  useLayoutEffect(() => {
    const el = interior.current;
    if (!el || !activo) return;
    const medir = () => {
      const lh = parseFloat(getComputedStyle(el).lineHeight) || 24;
      setMedidas({ total: el.scrollHeight, cerrado: Math.round(lh * lineas) });
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [activo, lineas]);

  const recorta = activo && medidas && medidas.total > medidas.cerrado + 2;
  const alto = !recorta ? undefined : abierto ? medidas.total : medidas.cerrado;

  return (
    <div className={className}>
      <div
        id={id}
        style={{
          height: alto,
          overflow: recorta ? 'hidden' : undefined,
          transition: `height 0.5s ${EASE}, --corte 0.5s ${EASE}`,
          // Cerrado: la última línea se esfuma; al abrir, el esfumado se corre hasta abajo junto con el alto
          '--corte': abierto ? '100%' : '55%',
          maskImage: recorta && lineas > 0 ? 'linear-gradient(#000 var(--corte), transparent)' : undefined,
          WebkitMaskImage: recorta && lineas > 0 ? 'linear-gradient(#000 var(--corte), transparent)' : undefined,
        }}
        // Cerrado del todo: fuera del árbol de accesibilidad y del foco
        inert={recorta && !abierto && lineas === 0 ? true : undefined}
      >
        <div ref={interior}>{children}</div>
      </div>
      {recorta && (
        <button
          type="button"
          aria-expanded={abierto}
          aria-controls={id}
          onClick={() => setAbierto((a) => !a)}
          className={`mt-1 inline-flex items-center gap-1 text-sm font-bold text-verde underline-offset-4 hover:underline ${classNameBoton}`}
        >
          {abierto ? textoCerrar : textoAbrir}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" className={`transition-transform duration-500 ${abierto ? 'rotate-180' : ''}`}>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      )}
    </div>
  );
}
