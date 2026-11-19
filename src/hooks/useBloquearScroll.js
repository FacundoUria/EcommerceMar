import { useEffect } from 'react';

// Contador global: con overlays encadenados (quick view → drawer, drawer → checkout) el que se cierra
// tarde (termina su animación de salida después de que abrió el otro) no desbloquea el scroll del nuevo.
let bloqueos = 0;
let previo = '';

/** Mientras un overlay está abierto, la página de atrás no scrollea. */
export function useBloquearScroll(activo = true) {
  useEffect(() => {
    if (!activo) return;
    if (bloqueos++ === 0) {
      previo = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    return () => {
      bloqueos = Math.max(0, bloqueos - 1);
      if (!bloqueos) document.body.style.overflow = previo;
    };
  }, [activo]);
}
