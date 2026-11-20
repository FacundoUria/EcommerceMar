import { Children, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

const UMBRAL = 6; // px que se tiene que mover el mouse para que sea arrastre y no click

/**
 * Fila horizontal que se nota que sigue (categorías de /tienda, miniaturas de /producto):
 * - Esfumado del color del fondo en el borde que tiene más contenido (el izquierdo recién al deslizar).
 * - Botón "›" sobre el esfumado que avanza la fila; desaparece al llegar al final.
 * - Snap a cada ítem, sin scrollbar, sin rebote que dispare el "atrás" del navegador.
 * - Con mouse se arrastra (sin romper el click: recién es arrastre a partir de 6 px).
 * - El ítem activo (`selectorActivo`) se centra solo cuando cambia `activo` (sin mover la página).
 * Todo eso solo si desborda: con `md:flex-wrap` en `claseFila` desde md bajan de línea y es una fila común.
 */
export default function FilaDeslizable({
  children,
  className = '',
  claseFila = '',
  activo,
  selectorActivo = '[aria-pressed="true"]',
  ...rest // role, aria-label
}) {
  const fila = useRef(null);
  const reducido = useReducedMotion();
  const [estado, setEstado] = useState({ desborda: false, inicio: true, fin: true });
  const arrastre = useRef(null); // { id, x, scroll, activo } mientras se aprieta el mouse
  const arrastro = useRef(false); // el click que sigue a un arrastre no cuenta
  const primera = useRef(true);
  const cantidad = Children.count(children);

  const medir = useCallback(() => {
    const el = fila.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const desborda = max > 1;
    const inicio = !desborda || el.scrollLeft <= 1;
    const fin = !desborda || el.scrollLeft >= max - 1;
    setEstado((e) => (e.desborda === desborda && e.inicio === inicio && e.fin === fin ? e : { desborda, inicio, fin }));
  }, []);

  // Se mide al deslizar, al cambiar el ancho y cuando cambian los ítems (cargan las categorías, las fuentes)
  useLayoutEffect(() => {
    const el = fila.current;
    if (!el) return;
    const ro = new ResizeObserver(medir);
    const observar = () => {
      ro.disconnect();
      ro.observe(el);
      for (const hijo of el.children) ro.observe(hijo);
      medir();
    };
    observar();
    const mo = new MutationObserver(observar);
    mo.observe(el, { childList: true });
    let raf = 0;
    const alDeslizar = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(medir);
    };
    el.addEventListener('scroll', alDeslizar, { passive: true });
    return () => {
      ro.disconnect();
      mo.disconnect();
      cancelAnimationFrame(raf);
      el.removeEventListener('scroll', alDeslizar);
    };
  }, [medir]);

  // El activo, al centro (scrollTo de la fila: scrollIntoView también movería la página)
  useEffect(() => {
    const el = fila.current;
    const item = el?.querySelector(selectorActivo);
    if (!item) return;
    if (el.scrollWidth - el.clientWidth > 1) {
      const left = item.offsetLeft - (el.clientWidth - item.offsetWidth) / 2;
      el.scrollTo({ left, behavior: primera.current || reducido ? 'auto' : 'smooth' });
    }
    primera.current = false;
  }, [activo, cantidad, selectorActivo, reducido]);

  const avanzar = () => {
    const el = fila.current;
    el?.scrollBy({ left: el.clientWidth * 0.7, behavior: reducido ? 'auto' : 'smooth' });
  };

  // Arrastre con el mouse. El snap se apaga mientras dura (si no, cada scrollLeft vuelve al ítem) y al
  // soltar se desliza hasta el ítem más cercano.
  const alApretar = (e) => {
    const el = fila.current;
    if (e.pointerType !== 'mouse' || e.button !== 0 || el.scrollWidth - el.clientWidth <= 1) return;
    arrastre.current = { id: e.pointerId, x: e.clientX, scroll: el.scrollLeft, activo: false };
  };
  const alMover = (e) => {
    const a = arrastre.current;
    const el = fila.current;
    if (!a || a.id !== e.pointerId) return;
    const dx = e.clientX - a.x;
    if (!a.activo) {
      if (Math.abs(dx) < UMBRAL) return;
      a.activo = true;
      arrastro.current = true;
      el.setPointerCapture(e.pointerId);
      el.style.scrollSnapType = 'none';
      el.style.cursor = 'grabbing';
    }
    el.scrollLeft = a.scroll - dx;
  };
  const alSoltar = (e) => {
    const a = arrastre.current;
    const el = fila.current;
    if (!a || a.id !== e.pointerId) return;
    arrastre.current = null;
    if (!a.activo) return;
    el.style.cursor = '';
    // Ítem más cercano (centrado, como el snap) y recién ahí vuelve el snap
    const max = el.scrollWidth - el.clientWidth;
    let destino = el.scrollLeft;
    let mejor = Infinity;
    for (const hijo of el.children) {
      const t = Math.min(max, Math.max(0, hijo.offsetLeft + hijo.offsetWidth / 2 - el.clientWidth / 2));
      if (Math.abs(t - el.scrollLeft) < mejor) {
        mejor = Math.abs(t - el.scrollLeft);
        destino = t;
      }
    }
    el.scrollTo({ left: destino, behavior: reducido ? 'auto' : 'smooth' });
    const volverSnap = () => {
      el.style.scrollSnapType = '';
      el.removeEventListener('scrollend', volverSnap);
    };
    el.addEventListener('scrollend', volverSnap);
    setTimeout(volverSnap, 600); // navegadores sin scrollend
    setTimeout(() => (arrastro.current = false), 0);
  };

  const { desborda, inicio, fin } = estado;
  return (
    <div className={`relative ${className}`}>
      <div
        ref={fila}
        {...rest}
        onPointerDown={alApretar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={alSoltar}
        onLostPointerCapture={alSoltar}
        onDragStart={(e) => desborda && e.preventDefault()} // fotos: sin el arrastre nativo de imágenes
        onClickCapture={(e) => {
          if (!arrastro.current) return;
          e.preventDefault();
          e.stopPropagation();
        }}
        style={desborda ? { '--fila-izq': inicio ? '0px' : '28px', '--fila-der': fin ? '0px' : '56px' } : undefined}
        className={`no-scrollbar relative flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain *:snap-center ${
          desborda ? 'fila-deslizable cursor-grab' : ''
        } ${claseFila}`}
      >
        {children}
      </div>
      {desborda && (
        // Ayuda visual para mouse y dedo; con teclado se recorren los ítems con Tab (el foco los trae a la vista)
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={avanzar}
          className={`absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-linea bg-crema-card text-tinta shadow-suave transition duration-300 hover:border-verde/40 active:scale-90 ${
            fin ? 'pointer-events-none scale-75 opacity-0' : 'opacity-100'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 6 6 6-6 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
