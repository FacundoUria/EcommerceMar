import { useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { useMediaQuery } from './useMediaQuery.js';

/**
 * Card 3D (desktop con mouse, sin movimiento reducido): se inclina hasta 6° siguiendo el mouse
 * (perspective 800px) y un brillo diagonal se mueve con la inclinación. Sin re-renders.
 * Uso: const t = useTarjeta3D(); <article ref={t.ref} {...t.eventos}>{t.brillo}…</article>
 * (el article tiene que ser `relative overflow-hidden`).
 */
export function useTarjeta3D() {
  const ref = useRef(null);
  const brilloRef = useRef(null);
  const conHover = useMediaQuery('(hover: hover) and (pointer: fine)');
  const reducido = useReducedMotion();
  const activo = conHover && !reducido;

  const onPointerMove = (e) => {
    if (!activo || e.pointerType !== 'mouse') return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5; // -0.5 … 0.5
    const py = (e.clientY - r.top) / r.height - 0.5;
    // Sin transición de transform mientras sigue al mouse: responde en el mismo frame (antes 120 ms)
    el.style.transition = 'box-shadow 500ms, border-color 500ms';
    el.style.transform = `perspective(800px) rotateX(${(-py * 12).toFixed(2)}deg) rotateY(${(px * 12).toFixed(2)}deg)`;
    if (brilloRef.current) {
      brilloRef.current.style.opacity = '1';
      brilloRef.current.style.transform = `translate(${(px * 40).toFixed(1)}%, ${(py * 40).toFixed(1)}%)`;
    }
  };
  const onPointerLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 500ms, border-color 500ms';
    el.style.transform = '';
    if (brilloRef.current) brilloRef.current.style.opacity = '0';
  };

  const brillo = activo ? (
    <span aria-hidden="true" className="pointer-events-none absolute -inset-1/2 z-20 overflow-hidden">
      <span
        ref={brilloRef}
        className="absolute inset-0 opacity-0 transition-opacity duration-500"
        style={{ background: 'linear-gradient(115deg, transparent 38%, rgb(255 253 248 / 0.38) 50%, transparent 62%)' }}
      />
    </span>
  ) : null;

  return { ref, eventos: { onPointerMove, onPointerLeave }, brillo };
}
