import { Children, useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

const ESCALA_LATERAL = 0.88;
const OPACIDAD_LATERAL = 0.6;

/**
 * Carrusel mobile con snap al centro: la card centrada a escala 1 y las laterales a 0.88 / opacidad 0.6,
 * ligado al scroll horizontal (transform + opacity, sin re-render). Barra de progreso fina abajo.
 * Con movimiento reducido las cards quedan a tamaño completo (la barra sigue indicando la posición).
 */
export default function CarruselCentrado({ children, label, anchoItem = 'w-[72vw] max-w-[20rem]', className = '' }) {
  const ref = useRef(null);
  const barra = useRef(null);
  const reducido = useReducedMotion();
  const total = Children.count(children);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const pintar = () => {
      raf = 0;
      const centro = el.scrollLeft + el.clientWidth / 2;
      for (const item of el.children) {
        const interno = item.firstElementChild;
        if (!interno) continue;
        if (reducido) {
          interno.style.transform = '';
          interno.style.opacity = '';
          continue;
        }
        const d = Math.min(1, Math.abs(item.offsetLeft + item.offsetWidth / 2 - centro) / item.offsetWidth);
        interno.style.transform = `scale(${1 - (1 - ESCALA_LATERAL) * d})`;
        interno.style.opacity = String(1 - (1 - OPACIDAD_LATERAL) * d);
      }
      const max = el.scrollWidth - el.clientWidth;
      const ratio = max > 0 ? el.scrollLeft / max : 0;
      if (barra.current) barra.current.style.transform = `scaleX(${1 / total + (1 - 1 / total) * ratio})`;
    };
    const pedir = () => {
      if (!raf) raf = requestAnimationFrame(pintar);
    };
    pintar();
    el.addEventListener('scroll', pedir, { passive: true });
    const ro = new ResizeObserver(pedir);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', pedir);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [reducido, total]);

  return (
    <div className={className} role="region" aria-roledescription="carrusel" aria-label={label}>
      <div ref={ref} className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain px-[14vw] py-3">
        {Children.map(children, (hijo) => (
          <div className={`${anchoItem} shrink-0 snap-center`}>
            <div className="origin-center will-change-transform">{hijo}</div>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-4 h-[3px] w-32 overflow-hidden rounded-full bg-verde/15" aria-hidden="true">
        <div ref={barra} className="h-full origin-left rounded-full bg-verde" style={{ transform: `scaleX(${1 / Math.max(total, 1)})` }} />
      </div>
    </div>
  );
}
