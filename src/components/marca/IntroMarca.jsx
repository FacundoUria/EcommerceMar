import { useEffect, useState } from 'react';
import { espiral } from '../../lib/rulos.js';

const CLAVE = 'dh-intro';
const ARO = espiral({ cx: 90, cy: 90, r0: 64, r1: 80, vueltas: 1.18, inicio: -100 });

function primeraVisita() {
  try {
    return typeof window !== 'undefined' && !window.sessionStorage.getItem(CLAVE);
  } catch {
    return false; // sin sessionStorage (modo privado estricto): sin intro
  }
}

// Se decide una vez por carga. El hero lo usa para que su título entre cuando la intro se abre.
export const HAY_INTRO = primeraVisita();
export const DEMORA_INTRO = HAY_INTRO ? 0.95 : 0;

/**
 * Intro de marca, solo en la primera visita de la sesión: pantalla arena con el logo, un rulo lo rodea
 * dibujándose y la pantalla se abre hacia arriba (≈ 1.2 s en total). Tocar en cualquier lado la saltea.
 * Todo con CSS (no espera al chunk de motion) y por encima del contenido, que ya carga y se pinta detrás:
 * no retrasa el LCP. Movimiento reducido: aro ya dibujado y la pantalla se va con un fade.
 */
export default function IntroMarca() {
  const [visible, setVisible] = useState(HAY_INTRO);
  const [saltar, setSaltar] = useState(false);

  useEffect(() => {
    if (!visible) return;
    try {
      window.sessionStorage.setItem(CLAVE, '1');
    } catch {
      /* no pasa nada: se vería otra vez en la próxima carga */
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      // `.intro` lleva opacity 0.97 (ver index.css): con la capa 100% opaca Chrome no da por pintada
      // la foto del hero que queda debajo y el LCP esperaba a que se abriera la intro (792 → ~200 ms).
      className={`intro fixed inset-0 z-[100] flex flex-col items-center justify-center bg-arena ${saltar ? 'intro-ya' : ''}`}
      onClick={() => setSaltar(true)}
      onAnimationEnd={(e) => e.target === e.currentTarget && setVisible(false)}
    >
      <span className="relative size-[180px]">
        <img src="/img/marca/LOGO-sm.webp" alt="" width="112" height="112" className="intro-logo absolute top-1/2 left-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-multiply" />
        <svg viewBox="0 0 180 180" className="absolute inset-0 overflow-visible" focusable="false">
          <path d={ARO} pathLength="1" fill="none" stroke="#7e602b" strokeWidth="1.6" strokeLinecap="round" className="intro-aro" />
        </svg>
      </span>
      <button
        type="button"
        tabIndex={-1}
        onClick={(e) => {
          e.stopPropagation();
          setSaltar(true);
        }}
        className="absolute bottom-[max(2rem,env(safe-area-inset-bottom))] rounded-full px-5 py-2.5 text-sm font-semibold text-texto-suave transition hover:text-tinta"
      >
        Saltar
      </button>
    </div>
  );
}
