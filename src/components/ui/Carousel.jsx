import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';

/**
 * Carrusel horizontal con scroll-snap nativo (touch) + arrastre con mouse + flechas en desktop.
 * Los hijos deberían tener ancho fijo (ej. w-[70%] sm:w-64) y `snap-start`.
 */
export default function Carousel({ children, label, className = '', itemsClassName = 'gap-4' }) {
  const ref = useRef(null);
  const drag = useRef({ activo: false, x: 0, scroll: 0, movio: false });
  const [bordes, setBordes] = useState({ inicio: true, fin: false });

  const actualizarBordes = () => {
    const el = ref.current;
    if (!el) return;
    setBordes({ inicio: el.scrollLeft < 8, fin: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  };

  useEffect(() => {
    actualizarBordes();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(actualizarBordes);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const mover = (dir) => {
    const el = ref.current;
    el?.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  // Arrastre con mouse (en touch ya funciona el scroll nativo)
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
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
    if (ref.current) ref.current.style.scrollSnapType = '';
  };
  // Si hubo arrastre, que el soltar no dispare el click del link
  const onClickCapture = (e) => {
    if (drag.current.movio) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.movio = false;
    }
  };

  return (
    <div className={`group/car relative ${className}`} role="region" aria-roledescription="carrusel" aria-label={label}>
      <div
        ref={ref}
        onScroll={actualizarBordes}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={terminar}
        onPointerCancel={terminar}
        onPointerLeave={terminar}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
        className={`no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-px-[var(--gutter)] px-[var(--gutter)] pb-2 [--gutter:max(1rem,calc((100vw-72rem)/2+1rem))] md:cursor-grab md:active:cursor-grabbing ${itemsClassName}`}
      >
        {children}
      </div>
      <button
        type="button"
        onClick={() => mover(-1)}
        aria-label="Anterior"
        className={`glass absolute top-1/3 left-2 hidden size-11 items-center justify-center rounded-full text-verde shadow-suave transition hover:scale-105 active:scale-95 md:flex ${bordes.inicio ? 'pointer-events-none opacity-0' : 'opacity-0 group-hover/car:opacity-100'}`}
      >
        <Icon name="flechaIzq" size={20} />
      </button>
      <button
        type="button"
        onClick={() => mover(1)}
        aria-label="Siguiente"
        className={`glass absolute top-1/3 right-2 hidden size-11 items-center justify-center rounded-full text-verde shadow-suave transition hover:scale-105 active:scale-95 md:flex ${bordes.fin ? 'pointer-events-none opacity-0' : 'opacity-0 group-hover/car:opacity-100'}`}
      >
        <Icon name="flecha" size={20} />
      </button>
    </div>
  );
}
