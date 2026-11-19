import { Children, useCallback, useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import Icon from './Icon.jsx';

/**
 * Carrusel horizontal: scroll-snap nativo (touch) + arrastre con mouse + flechas en desktop.
 * Los hijos deberían tener ancho fijo (ej. w-[70%] md:w-72) y `snap-start`.
 *
 * - `gutter`: margen lateral (CSS). Por defecto alinea con `.contenedor`.
 * - `hint`: al entrar en pantalla se desliza 40px y vuelve (una vez) para mostrar que se arrastra.
 * - `autoplay`: ms entre avances. Se pausa con hover / touch / foco y fuera de pantalla. Con movimiento reducido, cada 8 s como mínimo.
 * - `puntos`: puntos de progreso (solo mobile).
 */
/**
 * `cabecera`: título de la sección. Si se pasa, se muestra arriba con el contador "01 / 08" (Playfair)
 * y las flechas prev/next juntas a la derecha (en lugar de flechas sobre las cards).
 */
export default function Carousel({ children, label, className = '', itemsClassName = 'gap-4', gutter, hint = false, autoplay = 0, puntos = false, cabecera = null }) {
  const ref = useRef(null);
  const drag = useRef({ activo: false, x: 0, scroll: 0, movio: false });
  const pausa = useRef({ hover: false, touchHasta: 0, foco: false });
  const [bordes, setBordes] = useState({ inicio: true, fin: false });
  const [activo, setActivo] = useState(0);
  const reducido = useReducedMotion();
  const visibleUnaVez = useInView(ref, { once: true, amount: 0.6 });
  const enPantalla = useInView(ref, { amount: 0.3 });
  const total = Children.count(children);

  // Paso = ancho de un ítem + gap
  const paso = useCallback(() => {
    const el = ref.current;
    const a = el?.children[0];
    const b = el?.children[1];
    if (!a) return el?.clientWidth ?? 0;
    return b ? b.offsetLeft - a.offsetLeft : a.offsetWidth;
  }, []);

  // Hint: una sola vez, solo transform (Web Animations API)
  useEffect(() => {
    const el = ref.current;
    if (!hint || !visibleUnaVez || reducido || !el?.animate) return;
    el.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-40px)', offset: 0.45 }, { transform: 'translateX(0)' }],
      { duration: 800, delay: 350, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    );
  }, [hint, visibleUnaVez, reducido]);

  const actualizar = () => {
    const el = ref.current;
    if (!el) return;
    setBordes({ inicio: el.scrollLeft < 8, fin: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
    const p = paso();
    if (p) setActivo(Math.min(total - 1, Math.round(el.scrollLeft / p)));
  };

  useEffect(() => {
    actualizar();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(actualizar);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  // Autoplay lento
  useEffect(() => {
    if (!autoplay || !enPantalla) return;
    const id = setInterval(() => {
      const el = ref.current;
      const ps = pausa.current;
      if (!el || ps.hover || ps.foco || Date.now() < ps.touchHasta || drag.current.activo) return;
      const alFinal = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      el.scrollTo({ left: alFinal ? 0 : el.scrollLeft + paso(), behavior: 'smooth' });
    }, reducido ? Math.max(autoplay, 8000) : autoplay);
    return () => clearInterval(id);
  }, [autoplay, reducido, enPantalla, paso]);

  const mover = (dir) => {
    const el = ref.current;
    el?.scrollBy({ left: dir * Math.max(paso(), el.clientWidth * 0.8), behavior: 'smooth' });
  };
  const irA = (i) => ref.current?.scrollTo({ left: i * paso(), behavior: 'smooth' });

  // Arrastre con mouse (en touch ya funciona el scroll nativo)
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse') pausa.current.touchHasta = Date.now() + 8000;
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
  const onClickCapture = (e) => {
    if (drag.current.movio) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.movio = false;
    }
  };

  const flecha = (dir) => {
    const deshabilitada = dir < 0 ? bordes.inicio : bordes.fin;
    return (
      <button
        type="button"
        onClick={() => mover(dir)}
        aria-label={dir < 0 ? 'Anterior' : 'Siguiente'}
        disabled={deshabilitada}
        className={`absolute top-[40%] z-10 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full border border-linea bg-crema-card text-tinta shadow-flotante transition duration-300 hover:scale-105 hover:text-verde active:scale-95 disabled:pointer-events-none disabled:opacity-0 md:flex ${
          dir < 0 ? 'left-3 lg:left-6' : 'right-3 lg:right-6'
        }`}
      >
        <Icon name={dir < 0 ? 'flechaIzq' : 'flecha'} size={20} />
      </button>
    );
  };

  const dos = (n) => String(n).padStart(2, '0');
  const posicion = bordes.fin ? total : Math.min(total, activo + 1);
  const flechaArriba = (dir) => (
    <button
      type="button"
      onClick={() => mover(dir)}
      aria-label={dir < 0 ? 'Anterior' : 'Siguiente'}
      disabled={dir < 0 ? bordes.inicio : bordes.fin}
      className="flex size-12 items-center justify-center rounded-full border border-verde/40 text-verde transition duration-300 hover:border-verde hover:bg-verde hover:text-arena active:scale-95 disabled:pointer-events-none disabled:opacity-35"
    >
      <Icon name={dir < 0 ? 'flechaIzq' : 'flecha'} size={20} />
    </button>
  );

  return (
    <div
      className={`relative ${className}`}
      role="region"
      aria-roledescription="carrusel"
      aria-label={label}
      onPointerEnter={(e) => e.pointerType === 'mouse' && (pausa.current.hover = true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && (pausa.current.hover = false)}
      onFocus={() => (pausa.current.foco = true)}
      onBlur={() => (pausa.current.foco = false)}
    >
      {cabecera && (
        <div className="contenedor mb-6 flex items-end justify-between gap-6">
          {cabecera}
          {/* En mobile no: se desliza con el dedo (y están los puntos) */}
          <div className="hidden items-center gap-5 md:flex">
            <p className="font-serif text-xl text-texto-suave tabular-nums" aria-live="polite">
              <span className="text-tinta">{dos(posicion)}</span> / {dos(total)}
            </p>
            <div className="flex gap-2">
              {flechaArriba(-1)}
              {flechaArriba(1)}
            </div>
          </div>
        </div>
      )}
      <div
        ref={ref}
        onScroll={actualizar}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={terminar}
        onPointerCancel={terminar}
        onPointerLeave={terminar}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
        style={gutter ? { '--gutter': gutter } : undefined}
        className={`no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-px-[var(--gutter)] px-[var(--gutter)] py-3 [--gutter:1rem] md:cursor-grab md:[--gutter:max(2rem,calc((100vw-84rem)/2+2rem))] md:active:cursor-grabbing ${itemsClassName}`}
      >
        {children}
      </div>
      {!cabecera && flecha(-1)}
      {!cabecera && flecha(1)}
      {puntos && total > 1 && (
        <div className="mt-3 flex justify-center gap-3 md:hidden" aria-hidden="true">
          {Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              type="button"
              tabIndex={-1}
              onClick={() => irA(i)}
              className={`h-1.5 w-1.5 rounded-full transition duration-500 ${i === activo ? 'scale-x-[2.6] bg-verde' : 'bg-verde/25'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
