import { useEffect, useRef } from 'react';
import { formatPrecio } from '../../lib/format.js';

const DURACION = 600;
const vistos = new WeakSet();

/**
 * Precio que cuenta rápido desde 0 al entrar en pantalla (0.6 s, una sola vez por elemento).
 * - Reserva el ancho del precio final (copia invisible): el conteo no mueve el layout.
 * - El número se escribe directo en el DOM (sin re-renders).
 * - Con movimiento reducido o sin IntersectionObserver: el precio final directo.
 * - Lectores de pantalla: siempre el precio final.
 */
export default function Precio({ valor, className = '', as: Tag = 'span' }) {
  const ref = useRef(null);
  const final = formatPrecio(valor);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducido || !('IntersectionObserver' in window) || vistos.has(el)) return;
    // Ya visible al montar (arriba de todo): no se anima, se ve el precio final sin parpadeo.
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return;
    el.textContent = formatPrecio(0);
    let raf;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        vistos.add(el);
        const t0 = performance.now();
        const paso = (t) => {
          const p = Math.min(1, (t - t0) / DURACION);
          const ease = 1 - (1 - p) ** 3;
          el.textContent = formatPrecio(Math.round((valor * ease) / 10) * 10);
          if (p < 1) raf = requestAnimationFrame(paso);
          else el.textContent = formatPrecio(valor);
        };
        raf = requestAnimationFrame(paso);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = formatPrecio(valor);
    };
  }, [valor]);

  return (
    <Tag className={`precio ${className}`}>
      <span className="relative inline-block">
        <span className="invisible" aria-hidden="true">{final}</span>
        <span ref={ref} aria-hidden="true" className="absolute inset-y-0 left-0 whitespace-nowrap">
          {final}
        </span>
      </span>
      <span className="sr-only">{final}</span>
    </Tag>
  );
}
