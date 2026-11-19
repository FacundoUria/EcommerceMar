import { useEffect } from 'react';

// Contador global: si hay overlays apilados, el nav vuelve recién cuando se cierra el último.
let abiertos = 0;

/**
 * Mientras un overlay (bottom-sheet de filtros, quick view, drawer del carrito) está abierto,
 * marca <html data-overlay="abierto"> y el bottom nav mobile baja y se oculta (solo CSS, transform).
 */
export function useOcultarBottomNav(activo = true) {
  useEffect(() => {
    if (!activo) return;
    abiertos += 1;
    document.documentElement.dataset.overlay = 'abierto';
    return () => {
      abiertos = Math.max(0, abiertos - 1);
      if (!abiertos) {
        delete document.documentElement.dataset.overlay;
      }
    };
  }, [activo]);
}
