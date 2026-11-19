import { Children, useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { useInView, useReducedMotion } from 'motion/react';
import Icon from './Icon.jsx';

const ESCALA_LATERAL = 0.94;
const PAUSA_TOQUE = 8000;

/**
 * Carrusel único del sitio (Embla, liviano): drag con inercia y frenado suave, snap al centro
 * (skipSnaps: un flick fuerte avanza varias), loop cuando hay cards de sobra.
 * - La card centrada a escala 1 y las laterales a 0.94 (según la distancia al centro, escrito directo en
 *   el DOM en cada frame, sin re-renders). Con movimiento reducido, todas a escala 1.
 * - Barra de progreso fina abajo. Flechas circulares a los costados sobre un degradé del color de fondo
 *   (`fondo`), solo con hover / foco en desktop; avanzan con easing suave.
 * - Mobile: una card (`anchoMobile`) con las vecinas asomando. Desktop: 4 cards en el ancho del contenedor.
 * - `autoplay` (ms): avanza solo en pantalla; pausa con hover, foco o al tocar (8 s). Reducido: ≥ 8 s.
 * Si todas las cards entran (no hay para scrollear) no hay flechas, barra ni escala.
 */
export default function Carrusel({ children, label, anchoMobile = '72%', autoplay = 0, fondo = 'var(--color-arena)', className = '' }) {
  const reducido = useReducedMotion();
  const [viewportRef, api] = useEmblaCarousel({ align: 'center', loop: true, skipSnaps: true, duration: 32 });
  const raiz = useRef(null);
  const barra = useRef(null);
  const pausa = useRef({ hover: false, foco: false, hasta: 0 });
  const enPantalla = useInView(raiz, { amount: 0.3 });
  const [puede, setPuede] = useState(false); // ¿hay para scrollear?
  const repintar = useRef(() => {});
  const total = Children.count(children);

  // Escala por distancia al centro + barra de progreso
  useEffect(() => {
    if (!api) return;
    let raf = 0;
    const pintar = () => {
      raf = 0;
      const vp = api.rootNode().getBoundingClientRect();
      const centro = vp.left + vp.width / 2;
      const mueve = api.canScrollNext() || api.canScrollPrev();
      for (const slide of api.slideNodes()) {
        const interno = slide.firstElementChild;
        if (!interno) continue;
        if (reducido || !mueve) {
          interno.style.transform = '';
          continue;
        }
        // Centro de la card (no del slide, que suma el espaciado); la escala no mueve su centro
        const r = interno.getBoundingClientRect();
        const d = Math.min(1, Math.abs(r.left + r.width / 2 - centro) / slide.offsetWidth);
        interno.style.transform = `scale(${(1 - (1 - ESCALA_LATERAL) * d).toFixed(4)})`;
      }
      if (barra.current) {
        const w = Math.max(0.14, 1 / api.scrollSnapList().length);
        const p = Math.min(1, Math.max(0, api.scrollProgress()));
        barra.current.style.width = `${w * 100}%`;
        barra.current.style.transform = `translateX(${((p * (1 - w)) / w) * 100}%)`;
      }
    };
    const pedir = () => {
      if (!raf) raf = requestAnimationFrame(pintar);
    };
    repintar.current = pedir;
    const reiniciar = () => {
      setPuede(api.canScrollNext() || api.canScrollPrev());
      pedir();
    };
    reiniciar();
    api.on('scroll', pedir);
    api.on('reInit', reiniciar);
    api.on('resize', reiniciar);
    api.on('pointerDown', () => (pausa.current.hasta = Date.now() + PAUSA_TOQUE));
    return () => {
      api.off('scroll', pedir);
      api.off('reInit', reiniciar);
      api.off('resize', reiniciar);
      cancelAnimationFrame(raf);
    };
  }, [api, reducido]);

  // La barra se monta cuando hay para scrollear: pintarla apenas aparece
  useEffect(() => repintar.current(), [puede]);

  // Autoplay lento
  useEffect(() => {
    if (!api || !autoplay || !enPantalla || !puede) return;
    const id = setInterval(
      () => {
        const p = pausa.current;
        if (p.hover || p.foco || Date.now() < p.hasta || document.hidden) return;
        if (api.canScrollNext()) api.scrollNext();
        else api.scrollTo(0);
      },
      reducido ? Math.max(autoplay, 8000) : autoplay,
    );
    return () => clearInterval(id);
  }, [api, autoplay, enPantalla, puede, reducido]);

  const flecha = (dir) => (
    <div
      className={`pointer-events-none absolute inset-y-0 z-10 hidden w-24 items-center opacity-0 transition-opacity duration-300 group-focus-within/carrusel:opacity-100 group-hover/carrusel:opacity-100 md:flex lg:w-32 ${
        dir < 0 ? 'left-0 justify-start pl-3 lg:pl-6' : 'right-0 justify-end pr-3 lg:pr-6'
      }`}
      style={{ background: `linear-gradient(${dir < 0 ? 90 : 270}deg, ${fondo} 15%, transparent)` }}
    >
      <button
        type="button"
        onClick={() => (dir < 0 ? api?.scrollPrev() : api?.scrollNext())}
        aria-label={dir < 0 ? 'Anterior' : 'Siguiente'}
        className="pointer-events-auto flex size-12 items-center justify-center rounded-full border border-linea bg-crema-card text-tinta shadow-flotante transition duration-300 hover:scale-105 hover:text-verde active:scale-95"
      >
        <Icon name={dir < 0 ? 'flechaIzq' : 'flecha'} size={20} />
      </button>
    </div>
  );

  return (
    <div
      ref={raiz}
      role="region"
      aria-roledescription="carrusel"
      aria-label={label}
      className={`group/carrusel relative ${className}`}
      onPointerEnter={(e) => e.pointerType === 'mouse' && (pausa.current.hover = true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && (pausa.current.hover = false)}
      onFocus={() => (pausa.current.foco = true)}
      onBlur={() => (pausa.current.foco = false)}
    >
      <div className="relative">
        <div ref={viewportRef} className="overflow-hidden">
          {/*
            Espaciado como recomienda Embla: padding en cada slide + margen negativo en el contenedor (con
            `gap` CSS no cuenta el espacio después de la última card y al dar la vuelta quedaban pegadas).
            `safe center`: si todas entran quedan centradas (alineadas con el contenedor); si no, empiezan al
            inicio. Es fijo desde el primer render: si la posición de las cards cambia después de iniciar,
            Embla no vuelve a medir y los snaps quedan corridos (las cards se veían encimadas).
          */}
          <div className="-ml-4 flex touch-pan-y [justify-content:safe_center] py-4 select-none md:-ml-5" style={{ '--ancho-m': anchoMobile }}>
            {Children.map(children, (hijo, i) => (
              <div
                role="group"
                aria-label={`${i + 1} de ${total}`}
                // Ancho de la card + su espaciado. Desktop: 4 cards en el contenedor (máx 84rem − 4rem − 3 espacios)
                // relative + z-10 en hover/foco: la card sube solo lo justo para que su sombra quede arriba de las
                // vecinas. La escala (≤ 1) y el 3D se aplican al contenido, dentro del espacio de su slide.
                className="relative min-w-0 shrink-0 grow-0 basis-[calc(var(--ancho-m)+1rem)] pl-4 focus-within:z-10 hover:z-10 md:basis-[calc((min(100vw,84rem)-4rem-3.75rem)/4+1.25rem)] md:pl-5"
              >
                <div className="h-full origin-center will-change-transform">{hijo}</div>
              </div>
            ))}
          </div>
        </div>
        {puede && flecha(-1)}
        {puede && flecha(1)}
      </div>
      {puede && (
        <div className="mx-auto mt-3 h-[3px] w-40 overflow-hidden rounded-full bg-verde/15" aria-hidden="true">
          <div ref={barra} className="h-full rounded-full bg-verde" />
        </div>
      )}
    </div>
  );
}
