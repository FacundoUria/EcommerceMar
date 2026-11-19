import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, m, useInView, useReducedMotion } from 'motion/react';
import Reveal, { cascada } from './Reveal.jsx';
import RevealImagen from './RevealImagen.jsx';
import { fuenteImagen } from '../../lib/imagenes.js';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';

/**
 * Banners de Mar (traen su propio texto: no se superpone nada ni se recortan).
 * - Mobile: mazo de cartas apiladas (la de adelante entera, 2 detrás asomando escalonadas y rotadas ±3°).
 *   Se pasa con swipe: la carta sale volando hacia el costado con rotación y la siguiente sube. Autoplay
 *   cada 6 s (8 s con movimiento reducido), en pantalla; se pausa 10 s al tocar.
 * - Desktop: bento (una grande + tres chicas en columna, 3:1 → todas con la proporción del banner),
 *   zoom suave y elevación en hover, entrada en cascada con cortina.
 * Las fotos se piden recién cerca de la pantalla (no compiten con el LCP del hero).
 */
export default function Banners({ items, label = 'Novedades' }) {
  const desktop = useMediaQuery('(min-width: 768px)');
  const ref = useRef(null);
  const cerca = useInView(ref, { once: true, margin: '400px 0px' });
  return (
    <section ref={ref} aria-label={label} className="contenedor relative">
      {desktop ? <Bento items={items} cerca={cerca} /> : <Mazo items={items} cerca={cerca} />}
    </section>
  );
}

function ImgBanner({ banner, cerca, sizes, className = '' }) {
  const f = fuenteImagen(banner.src, 800);
  return (
    <img
      src={cerca ? f.src : undefined}
      srcSet={cerca ? f.srcSet : undefined}
      sizes={sizes}
      alt={banner.alt}
      width="1504"
      height="704"
      loading="lazy"
      decoding="async"
      draggable="false"
      className={`size-full object-cover ${className}`}
    />
  );
}

/* ───────── Desktop: bento ───────── */
// Columnas 3:1 → la grande y las chicas tienen (casi) la proporción del banner (2.14:1)
const SIZES_GRANDE = '(min-width: 1344px) 950px, calc(75vw - 44px)';
const SIZES_CHICA = '(min-width: 1344px) 316px, calc(25vw - 20px)';

function Bento({ items, cerca }) {
  const [grande, ...chicas] = items;
  const celda = (b, i, sizes, clase) => (
    <Reveal key={b.src} delay={cascada(i, 4)} className={clase}>
      <div className="group size-full overflow-hidden rounded-3xl bg-salvia-media shadow-suave transition duration-500 ease-out hover:-translate-y-1.5 hover:shadow-flotante">
        <RevealImagen delay={0.1 + i * 0.08}>
          <ImgBanner banner={b} cerca={cerca} sizes={sizes} className="transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
        </RevealImagen>
      </div>
    </Reveal>
  );
  return (
    <div className="grid grid-cols-[3fr_1fr] grid-rows-3 gap-5">
      {celda(grande, 0, SIZES_GRANDE, 'row-span-3')}
      {chicas.map((b, i) => celda(b, i + 1, SIZES_CHICA, 'aspect-[1504/704]'))}
    </div>
  );
}

/* ───────── Mobile: mazo de cartas ───────── */
const AUTOPLAY = 6000;
const AUTOPLAY_REDUCIDO = 8000;
const PAUSA_TOQUE = 10000;
// Posición en el mazo: 0 adelante, 1 y 2 asomando detrás (escalonadas y rotadas ±3°)
const POSICION = [
  { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 },
  { x: 0, y: 14, rotate: 3, scale: 0.94, opacity: 1 },
  { x: 0, y: 28, rotate: -3, scale: 0.88, opacity: 1 },
];
const EASE_SALIDA = [0.32, 0.72, 0, 1];

function Mazo({ items, cerca }) {
  const reducido = useReducedMotion();
  const ref = useRef(null);
  const enPantalla = useInView(ref, { amount: 0.5 });
  const [orden, setOrden] = useState(() => items.map((_, i) => i));
  const [dir, setDir] = useState(-1); // hacia dónde sale volando la carta de adelante
  const pausaHasta = useRef(0);

  const pasar = useCallback((d = -1) => {
    setDir(d);
    setOrden((o) => [...o.slice(1), o[0]]);
  }, []);
  const irA = (i) => {
    setDir(-1);
    setOrden((o) => {
      const k = o.indexOf(i);
      return [...o.slice(k), ...o.slice(0, k)];
    });
  };

  useEffect(() => {
    if (!enPantalla) return;
    const id = setInterval(() => {
      if (Date.now() < pausaHasta.current || document.hidden) return;
      pasar(-1);
    }, reducido ? AUTOPLAY_REDUCIDO : AUTOPLAY);
    return () => clearInterval(id);
  }, [enPantalla, reducido, pasar]);

  const salir = (d) =>
    reducido ? { opacity: 0, transition: { duration: 0.3 } } : { x: `${d * 125}%`, rotate: d * 16, opacity: 0, transition: { duration: 0.55, ease: EASE_SALIDA } };

  return (
    <div ref={ref} role="region" aria-roledescription="carrusel" aria-label="Novedades" onPointerDown={() => (pausaHasta.current = Date.now() + PAUSA_TOQUE)}>
      {/* El mazo: las cartas de atrás asoman por abajo (por eso el margen) */}
      <div className="relative mx-auto mb-10 aspect-[1504/704] w-[94%]">
        <AnimatePresence initial={false} custom={dir}>
          {orden
            .slice(0, 3)
            .map((idx, pos) => (
              <m.div
                key={idx}
                role="group"
                aria-roledescription="banner"
                aria-label={`${idx + 1} de ${items.length}`}
                aria-hidden={pos > 0 || undefined}
                custom={dir}
                variants={{ salir }}
                initial={{ x: 0, y: 40, rotate: 0, scale: 0.82, opacity: 0 }}
                animate={POSICION[pos]}
                exit="salir"
                transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                style={{ zIndex: 3 - pos }}
                drag={pos === 0 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.9}
                onDragEnd={(_, info) => {
                  if (Math.abs(info.offset.x) > 70 || Math.abs(info.velocity.x) > 450) pasar(info.offset.x > 0 ? 1 : -1);
                }}
                className={`absolute inset-0 touch-pan-y overflow-hidden rounded-3xl bg-salvia-media ring-1 ring-linea ${pos === 0 ? 'shadow-flotante' : 'shadow-suave'}`}
              >
                <ImgBanner banner={items[idx]} cerca={cerca} sizes="calc(94vw - 30px)" />
              </m.div>
            ))
            .reverse()}
        </AnimatePresence>
      </div>
      <div className="flex justify-center gap-1">
        {items.map((b, i) => (
          <button
            key={b.src}
            type="button"
            onClick={() => irA(i)}
            aria-label={`Ver banner ${i + 1}: ${b.alt}`}
            aria-current={orden[0] === i ? 'true' : undefined}
            className="flex size-6 items-center justify-center"
          >
            <span className={`block h-1.5 w-1.5 rounded-full transition duration-500 ${orden[0] === i ? 'scale-x-[2.6] bg-verde' : 'bg-verde/25'}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
