import { useCallback, useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import Icon from './Icon.jsx';

/**
 * Carrusel de banners de Mar (los banners ya traen su texto: no se superpone nada).
 * - Scroll-snap nativo: se desliza con el dedo; en desktop flechas + arrastre con mouse.
 * - Autoplay lento (6 s) solo en pantalla y con la pestaña visible. Se pausa con hover, foco
 *   o al tocar (vuelve a andar 10 s después del último toque). Sin autoplay con movimiento reducido.
 * - Mobile: 1 banner por vista y asoma ~12% del siguiente (se nota que se desliza). Desktop: 2 (a todo el ancho un banner de 2:1 queda gigante).
 *   Los puntos representan posiciones de scroll, así que se ajustan solos a cuántos entran.
 */
const INTERVALO = 6000;
const PAUSA_TOQUE = 10000;

export default function Banners({ items, label = 'Novedades' }) {
  const ref = useRef(null);
  const pausa = useRef({ hover: false, foco: false, toqueHasta: 0 });
  const drag = useRef({ activo: false, x: 0, scroll: 0, movio: false });
  const reducido = useReducedMotion();
  const enPantalla = useInView(ref, { amount: 0.5 });
  const [activo, setActivo] = useState(0);
  const [posiciones, setPosiciones] = useState(items.length);

  const paso = useCallback(() => {
    const el = ref.current;
    const [a, b] = [el?.children[0], el?.children[1]];
    if (!a) return 1;
    return b ? b.offsetLeft - a.offsetLeft : a.offsetWidth;
  }, []);

  const medir = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const p = paso();
    const ultimo = Math.round((el.scrollWidth - el.clientWidth) / p);
    setPosiciones(ultimo + 1);
    setActivo(Math.min(ultimo, Math.round(el.scrollLeft / p)));
  }, [paso]);

  useEffect(() => {
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [medir]);

  const irA = useCallback(
    (i) => {
      const el = ref.current;
      if (!el) return;
      el.scrollTo({ left: i * paso(), behavior: reducido ? 'instant' : 'smooth' });
    },
    [paso, reducido],
  );

  // Autoplay
  useEffect(() => {
    if (reducido || !enPantalla) return;
    const id = setInterval(() => {
      const ps = pausa.current;
      if (ps.hover || ps.foco || Date.now() < ps.toqueHasta || drag.current.activo || document.hidden) return;
      irA(activo + 1 >= posiciones ? 0 : activo + 1);
    }, INTERVALO);
    return () => clearInterval(id);
  }, [reducido, enPantalla, activo, posiciones, irA]);

  // Arrastre con mouse (en touch ya funciona el scroll nativo)
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse') {
      pausa.current.toqueHasta = Date.now() + PAUSA_TOQUE;
      return;
    }
    if (e.button !== 0) return;
    drag.current = { activo: true, x: e.clientX, scroll: ref.current.scrollLeft, movio: false };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d.activo) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 5 && !d.movio) {
      d.movio = true;
      ref.current.style.scrollSnapType = 'none';
      ref.current.setPointerCapture(e.pointerId);
    }
    if (d.movio) ref.current.scrollLeft = d.scroll - dx;
  };
  const terminar = () => {
    const d = drag.current;
    if (!d.activo) return;
    d.activo = false;
    const el = ref.current;
    if (!el) return;
    el.style.scrollSnapType = '';
    if (d.movio) irA(Math.round(el.scrollLeft / paso()));
  };

  const flecha = (dir) => (
    <button
      type="button"
      onClick={() => irA(Math.max(0, Math.min(posiciones - 1, activo + dir)))}
      aria-label={dir < 0 ? 'Banner anterior' : 'Banner siguiente'}
      disabled={dir < 0 ? activo === 0 : activo >= posiciones - 1}
      className={`absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-crema-card/90 text-tinta shadow-flotante backdrop-blur-sm transition duration-300 hover:scale-105 hover:text-verde active:scale-95 disabled:pointer-events-none disabled:opacity-0 md:flex ${
        dir < 0 ? '-left-3 lg:-left-5' : '-right-3 lg:-right-5'
      }`}
    >
      <Icon name={dir < 0 ? 'flechaIzq' : 'flecha'} size={18} />
    </button>
  );

  return (
    <section
      aria-label={label}
      aria-roledescription="carrusel"
      className="contenedor relative"
      onPointerEnter={(e) => e.pointerType === 'mouse' && (pausa.current.hover = true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && (pausa.current.hover = false)}
      onFocus={() => (pausa.current.foco = true)}
      onBlur={() => (pausa.current.foco = false)}
    >
      <div className="relative">
        <div
          ref={ref}
          onScroll={medir}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={terminar}
          onPointerCancel={terminar}
          onPointerLeave={terminar}
          onClickCapture={(e) => drag.current.movio && (e.preventDefault(), (drag.current.movio = false))}
          onDragStart={(e) => e.preventDefault()}
          className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain md:cursor-grab md:gap-5 md:active:cursor-grabbing"
        >
          {items.map((b, n) => (
            <div
              key={b.src}
              role="group"
              aria-roledescription="banner"
              aria-label={`${n + 1} de ${items.length}`}
              className="aspect-[1504/704] w-[calc((100%-0.75rem)/1.12)] shrink-0 snap-start overflow-hidden rounded-3xl bg-salvia-media shadow-suave md:w-[calc(50%-0.625rem)]"
            >
              <img
                src={b.src}
                srcSet={`${b.src.replace(/\.webp$/, '-sm.webp')} 400w, ${b.src} 900w, ${b.src.replace(/\.webp$/, '-lg.webp')} 1504w`}
                sizes="(min-width: 768px) 50vw, 90vw"
                alt={b.alt}
                width="1504"
                height="704"
                loading={n === 0 ? 'eager' : 'lazy'}
                decoding="async"
                draggable="false"
                className={`size-full object-cover ${b.encuadre ?? ''}`}
              />
            </div>
          ))}
        </div>
        {flecha(-1)}
        {flecha(1)}
      </div>

      {posiciones > 1 && (
        <div className="mt-4 flex justify-center gap-1">
          {Array.from({ length: posiciones }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => irA(i)}
              aria-label={`Ir al banner ${i + 1}`}
              aria-current={i === activo ? 'true' : undefined}
              className="flex size-6 items-center justify-center"
            >
              <span className={`block h-1.5 w-1.5 rounded-full transition duration-500 ${i === activo ? 'scale-x-[2.6] bg-verde' : 'bg-verde/25'}`} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
