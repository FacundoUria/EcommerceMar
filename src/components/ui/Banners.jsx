import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import Reveal, { cascada } from './Reveal.jsx';
import RevealImagen from './RevealImagen.jsx';
import { fuenteImagen } from '../../lib/imagenes.js';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';

/**
 * Banners de Mar (traen su propio texto: no se superpone nada ni se recortan).
 * - Mobile: mazo de cartas apiladas (la de adelante entera, 2 detrás asomando escalonadas y rotadas ±3°).
 *   Se pasa con swipe: la carta sale volando hacia el costado con rotación y la siguiente sube. Autoplay
 *   cada 6 s (8 s con movimiento reducido), en pantalla; se pausa 10 s al tocar. Optimizado para que el
 *   arrastre no trabe el celu (ver Mazo).
 * - Desktop: bento (una grande + tres chicas en columna, 3:1 → todas con la proporción del banner),
 *   zoom suave y elevación en hover, entrada en cascada con cortina.
 * Las fotos se piden recién cerca de la pantalla (no compiten con el LCP del hero).
 */
export default function Banners({ items, label = 'Novedades' }) {
  const desktop = useMediaQuery('(min-width: 768px)');
  const ref = useRef(null);
  const cerca = useInView(ref, { once: true, margin: '400px 0px' });
  return (
    // overflow-x: clip → la carta que sale volando no agranda la página (scroll horizontal en el celu)
    <section ref={ref} aria-label={label} className="contenedor relative overflow-x-clip">
      {desktop ? <Bento items={items} cerca={cerca} /> : <Mazo items={items} cerca={cerca} />}
    </section>
  );
}

/** `tope`: ancho máximo (px reales) del srcset; el mazo mobile no necesita las versiones de 1200/1504. */
function ImgBanner({ banner, cerca, sizes, tope = Infinity, className = '' }) {
  const f = fuenteImagen(banner.src, Math.min(800, tope));
  const entradas = f.srcSet?.split(', ') ?? [];
  const conTope = entradas.filter((e) => parseInt(e.split(' ')[1], 10) <= tope);
  const srcSet = (conTope.length ? conTope : entradas.slice(0, 1)).join(', ') || undefined;
  return (
    <img
      src={cerca ? f.src : undefined}
      srcSet={cerca ? srcSet : undefined}
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
// Banners del mazo: hasta 800px reales (una carta mide ~340px: 2,3x). Las de 1200/1504 pesaban ~11 MB
// decodificadas entre las 4 y trababan el celu al moverlas.
const TOPE_MOVIL = 800;
// Posición en el mazo (en la capa de afuera, quieta mientras se arrastra): 0 adelante, 1 y 2 asomando
// detrás (escalonadas y rotadas ±3°), 3+ escondidas en el fondo (la próxima en subir).
const POSICION = [
  { transform: 'translate3d(0,0,0) rotate(0deg) scale(1)', opacity: 1 },
  { transform: 'translate3d(0,14px,0) rotate(3deg) scale(0.94)', opacity: 1 },
  { transform: 'translate3d(0,28px,0) rotate(-3deg) scale(0.88)', opacity: 1 },
  { transform: 'translate3d(0,40px,0) rotate(0deg) scale(0.82)', opacity: 0 },
];
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_SALIDA = 'cubic-bezier(0.32, 0.72, 0, 1)';
const UMBRAL_PX = 70;
const UMBRAL_VEL = 0.45; // px/ms

/**
 * Mazo de banners (mobile). Pensado para que el arrastre no trabe el celu:
 * - Cada carta tiene dos capas: la de afuera tiene su lugar en el mazo (transform + transición CSS) y la
 *   de adentro es la que se arrastra/vuela. El DOM no se reordena nunca (el orden es solo z-index).
 * - Arrastre con pointer events: el transform (translate3d + rotate) se escribe directo en el DOM una vez
 *   por frame (requestAnimationFrame), sin setState de React. will-change solo en la carta que se
 *   arrastra y solo mientras dura. Las de atrás quedan quietas.
 * - El vuelo de salida es una animación WAAPI (transform + opacity: corre en el compositor).
 * - La sombra es fija e igual en todas las cartas (no cambia ni se anima), sin filter/blur/clip-path.
 * - Movimiento reducido: sin vuelo ni desplazamientos, la carta se va con un fade.
 */
function Mazo({ items, cerca }) {
  const reducido = useReducedMotion();
  const ref = useRef(null);
  const enPantalla = useInView(ref, { amount: 0.5 });
  const [orden, setOrden] = useState(() => items.map((_, i) => i));
  const [saliendo, setSaliendo] = useState(null); // carta que vuela: sigue adelante hasta terminar
  const [saltando, setSaltando] = useState(null); // carta que vuelve al fondo sin transición
  const ordenRef = useRef(orden);
  const pausaHasta = useRef(0);
  const cartas = useRef([]); // capa de adentro de cada carta, por índice de banner
  const vuelo = useRef(null);
  const arrastre = useRef(null);

  useEffect(() => {
    ordenRef.current = orden;
  }, [orden]);

  /** La de adelante se va (volando hacia `d`, desde donde quedó el arrastre) y sube la siguiente. */
  const pasar = useCallback(
    (d = -1, desde = 'translate3d(0,0,0) rotate(0deg)') => {
      if (vuelo.current) return;
      const idx = ordenRef.current[0];
      const el = cartas.current[idx];
      setSaliendo(idx);
      setOrden((o) => [...o.slice(1), o[0]]);
      if (!el?.animate) {
        setSaliendo(null);
        return;
      }
      el.style.willChange = 'transform, opacity';
      const anim = el.animate(
        reducido
          ? [{ opacity: 1 }, { opacity: 0 }]
          : [
              { transform: desde, opacity: 1 },
              { transform: `translate3d(${d * 125}%,0,0) rotate(${d * 16}deg)`, opacity: 0 },
            ],
        { duration: reducido ? 300 : 450, easing: EASE_SALIDA, fill: 'forwards' },
      );
      vuelo.current = { anim, el, idx };
      anim.onfinish = () => {
        // La capa de afuera salta al fondo (oculta) sin transición; recién después se suelta la animación
        setSaliendo(null);
        setSaltando(idx);
      };
    },
    [reducido],
  );

  // Ya en el fondo y oculta: se limpia la carta que voló y se reactivan las transiciones
  useLayoutEffect(() => {
    if (saltando == null) return;
    const v = vuelo.current;
    if (v) {
      v.anim.cancel();
      v.el.style.transform = '';
      v.el.style.transition = '';
      v.el.style.willChange = '';
      vuelo.current = null;
    }
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setSaltando(null)));
    return () => cancelAnimationFrame(id);
  }, [saltando]);

  const irA = (i) => {
    if (vuelo.current) return;
    setOrden((o) => {
      const k = o.indexOf(i);
      return [...o.slice(k), ...o.slice(0, k)];
    });
  };

  useEffect(() => {
    if (!enPantalla) return;
    const id = setInterval(() => {
      if (Date.now() < pausaHasta.current || document.hidden || arrastre.current) return;
      pasar(-1);
    }, reducido ? AUTOPLAY_REDUCIDO : AUTOPLAY);
    return () => clearInterval(id);
  }, [enPantalla, reducido, pasar]);

  // ── Arrastre de la carta de adelante ──
  const onPointerDown = (e) => {
    if (vuelo.current || (e.pointerType === 'mouse' && e.button !== 0)) return;
    arrastre.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, activo: false, raf: 0, muestras: [] };
  };
  const onPointerMove = (e) => {
    const a = arrastre.current;
    const el = cartas.current[ordenRef.current[0]];
    if (!a || e.pointerId !== a.id || !el) return;
    const dx = e.clientX - a.x0;
    if (!a.activo) {
      if (Math.abs(dx) < 6) return;
      if (Math.abs(e.clientY - a.y0) > Math.abs(dx)) {
        arrastre.current = null; // es scroll vertical: lo maneja el navegador (touch-action: pan-y)
        return;
      }
      a.activo = true;
      el.setPointerCapture?.(e.pointerId);
      el.style.transition = 'none';
      el.style.willChange = 'transform';
    }
    a.dx = dx;
    a.muestras.push([e.timeStamp, dx]);
    if (a.muestras.length > 6) a.muestras.shift();
    if (!a.raf) {
      a.raf = requestAnimationFrame(() => {
        a.raf = 0;
        el.style.transform = `translate3d(${a.dx}px,0,0) rotate(${(a.dx * 0.04).toFixed(2)}deg)`;
      });
    }
  };
  const onPointerUp = (e) => {
    const a = arrastre.current;
    arrastre.current = null;
    if (!a || e.pointerId !== a.id || !a.activo) return;
    cancelAnimationFrame(a.raf);
    const el = cartas.current[ordenRef.current[0]];
    if (!el) return;
    const [t0, x0] = a.muestras[0] ?? [0, 0];
    const [t1, x1] = a.muestras[a.muestras.length - 1] ?? [0, 0];
    const vel = t1 > t0 ? (x1 - x0) / (t1 - t0) : 0;
    const desde = `translate3d(${a.dx}px,0,0) rotate(${(a.dx * 0.04).toFixed(2)}deg)`;
    if (e.type !== 'pointercancel' && (Math.abs(a.dx) > UMBRAL_PX || Math.abs(vel) > UMBRAL_VEL)) {
      el.style.transform = desde;
      pasar((Math.abs(a.dx) > UMBRAL_PX ? a.dx : vel) > 0 ? 1 : -1, desde);
      return;
    }
    // No alcanzó: vuelve a su lugar
    el.style.transition = `transform 0.4s ${EASE}`;
    el.style.transform = '';
    const fin = () => {
      el.style.transition = '';
      el.style.willChange = '';
    };
    el.addEventListener('transitionend', fin, { once: true });
    setTimeout(fin, 500);
  };

  return (
    <div ref={ref} role="region" aria-roledescription="carrusel" aria-label="Novedades" onPointerDownCapture={() => (pausaHasta.current = Date.now() + PAUSA_TOQUE)}>
      {/* El mazo: las cartas de atrás asoman por abajo (por eso el margen) */}
      <div className="relative mx-auto mb-10 aspect-[1504/704] w-[94%]">
        {items.map((b, idx) => {
          const pos = saliendo === idx ? 0 : Math.min(orden.indexOf(idx), POSICION.length - 1);
          const delante = pos === 0 && saliendo !== idx;
          return (
            <div
              key={b.src}
              role="group"
              aria-roledescription="banner"
              aria-label={`${idx + 1} de ${items.length}`}
              aria-hidden={!delante || undefined}
              className="absolute inset-0"
              style={{
                ...POSICION[pos],
                zIndex: saliendo === idx ? 10 : POSICION.length - pos,
                transition: saltando === idx ? 'none' : reducido ? 'opacity 0.3s ease-out' : `transform 0.5s ${EASE}, opacity 0.4s ease-out`,
              }}
            >
              <div
                ref={(n) => (cartas.current[idx] = n)}
                onPointerDown={delante ? onPointerDown : undefined}
                onPointerMove={delante ? onPointerMove : undefined}
                onPointerUp={delante ? onPointerUp : undefined}
                onPointerCancel={delante ? onPointerUp : undefined}
                className="size-full touch-pan-y overflow-hidden rounded-3xl bg-salvia-media shadow-flotante ring-1 ring-linea select-none"
              >
                <ImgBanner banner={b} cerca={cerca} sizes="calc(94vw - 30px)" tope={TOPE_MOVIL} />
              </div>
            </div>
          );
        })}
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
