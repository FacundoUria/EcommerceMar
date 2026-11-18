import { useEffect } from 'react';

const MAX = 6; // px máximos de desplazamiento

/**
 * Efecto magnético sutil en todos los botones `.btn` (solo desktop con mouse, sin movimiento reducido):
 * el botón sigue un poco al cursor (máx 6px) usando la propiedad `translate` (transform).
 * Delegado en document: un solo listener para todo el sitio.
 */
export function useBotonesMagneticos() {
  useEffect(() => {
    const puede = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!puede || reducido) return;

    let actual = null;
    const soltar = () => {
      if (actual) actual.style.translate = '';
      actual = null;
    };
    const mover = (e) => {
      const btn = e.target.closest?.('.btn:not(:disabled)');
      if (btn !== actual) soltar();
      if (!btn) return;
      actual = btn;
      const r = btn.getBoundingClientRect();
      const dx = ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * MAX;
      const dy = ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * MAX;
      const lim = (v) => Math.max(-MAX, Math.min(MAX, v));
      btn.style.translate = `${lim(dx).toFixed(1)}px ${lim(dy).toFixed(1)}px`;
    };
    document.addEventListener('pointermove', mover, { passive: true });
    document.addEventListener('pointerleave', soltar);
    window.addEventListener('blur', soltar);
    return () => {
      document.removeEventListener('pointermove', mover);
      document.removeEventListener('pointerleave', soltar);
      window.removeEventListener('blur', soltar);
      soltar();
    };
  }, []);
}
