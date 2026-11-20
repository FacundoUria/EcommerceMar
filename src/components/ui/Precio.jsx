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
 * - `desde`: antepone "Desde" (producto con variantes de precios distintos, sin variante elegida).
 * - Si el valor cambia después (otra variante en la ficha), se muestra el nuevo directo, sin contar.
 */
export default function Precio({ valor, desde = false, className = '', as: Tag = 'span' }) {
  const ref = useRef(null);
  const final = formatPrecio(valor);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // El número se escribe a mano (textContent): React ya no actualiza ese texto, así que el valor
    // actual se escribe siempre que no se anime (si no, al cambiar de variante quedaba el precio viejo)
    const quieto = () => {
      el.textContent = formatPrecio(valor);
    };
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducido || !('IntersectionObserver' in window) || vistos.has(el)) return quieto();
    // Ya visible al montar (arriba de todo): no se anima, se ve el precio final sin parpadeo.
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      vistos.add(el);
      return quieto();
    }
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
      {desde && (
        <span aria-hidden="true" className="mr-1 text-[0.8em] font-medium">
          Desde
        </span>
      )}
      <span className="relative inline-block">
        <span className="invisible" aria-hidden="true">{final}</span>
        <span ref={ref} aria-hidden="true" className="absolute inset-y-0 left-0 whitespace-nowrap">
          {final}
        </span>
      </span>
      <span className="sr-only">{desde ? `Desde ${final}` : final}</span>
    </Tag>
  );
}
