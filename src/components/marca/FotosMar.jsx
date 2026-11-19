import { useEffect, useRef, useState } from 'react';
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react';
import SmartImg from '../ui/SmartImg.jsx';
import RevealImagen from '../ui/RevealImagen.jsx';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';
import { usePausaFueraDePantalla } from '../../hooks/usePausaFueraDePantalla.js';

// Fotos de Mar del mazo (la 1.ª arranca adelante). mar-con-productos-1 mide 387px: adelante se ve más
// blanda que las otras (pedir a Mar el original; anotado en docs/confirmar-con-mar.md).
const FOTOS = [
  { src: '/img/mar/mar-con-producto.webp', alt: 'Mar, especialista en rizos de Dream Hair', w: 914, h: 1600, encuadre: 'object-top' },
  { src: '/img/mar/inicio.webp', alt: 'Mar en su estudio Dream Hair', w: 793, h: 1064, encuadre: 'object-[50%_30%]' },
  { src: '/img/mar/mar-con-productos-1.webp', alt: 'Mar con productos para rulos', w: 387, h: 516, encuadre: 'object-top' },
];
// Lugar en el mazo: adelante derecha; detrás, asomando y rotadas ±4°
const POSICION = [
  'translate3d(0,0,0) rotate(0deg) scale(1)',
  'translate3d(8%,-3%,0) rotate(4deg) scale(0.95)',
  'translate3d(-9%,-1%,0) rotate(-4deg) scale(0.92)',
];
const Z = [4, 2, 1]; // el marco salvia va en 3: siempre detrás de la de adelante
const DURACION = 750;
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const SIZES = '(min-width: 768px) 448px, 86vw';
// Etiquetas alrededor de la foto (lejos de la cara, que está arriba al centro). k: cuánto siguen al mouse
const ETIQUETAS = [
  { texto: '✨ Coach capilar', clase: '-left-[9%] top-[50%] md:-left-[16%]', retraso: '0s', k: 14 },
  { texto: '✂️ Corte en seco', clase: '-right-[8%] top-[66%] md:-right-[14%]', retraso: '-1.6s', k: -10 },
  { texto: '🛍️ Showroom', clase: '-left-[5%] top-[84%] md:-left-[9%]', retraso: '-3.1s', k: 8 },
];
const CLAVE_PISTA = 'dh-pista-fotos-mar';
const TILT_MAX = 5; // grados

function primeraVez() {
  try {
    if (sessionStorage.getItem(CLAVE_PISTA)) return false;
    sessionStorage.setItem(CLAVE_PISTA, '1');
    return true;
  } catch {
    return false;
  }
}

/**
 * Fotos de "Hola, soy Mar": mazo de 3 fotos (la de adelante con el marco salvia; dos detrás asomando
 * rotadas ±4°). Tocar / hacer clic pasa la de adelante al fondo con un giro y deslizamiento y sube la
 * siguiente. Etiquetas que flotan alrededor (en desktop además siguen un poco al mouse) y la foto de
 * adelante se inclina hasta 5° con el mouse. Todo transform/opacity, sin setState por movimiento.
 * Movimiento reducido: el mazo cambia con un fade, sin loops ni tilt.
 */
export default function FotosMar({ seccion }) {
  const reducido = useReducedMotion();
  const mouse = useMediaQuery('(hover: hover) and (pointer: fine)');
  const [orden, setOrden] = useState([0, 1, 2]);
  const [pista, setPista] = useState(false);
  const mazo = useRef(null);
  const marco = useRef(null);
  const capas = useRef([]); // [{ afuera, adentro, tilt }] por foto
  const chips = useRef([]);
  const animando = useRef(false);
  const ordenRef = useRef(orden);
  const raf = useRef(0);

  useEffect(() => {
    ordenRef.current = orden;
  }, [orden]);

  // Parallax de capas con el scroll (como antes): el marco y las fotos se mueven distinto (máx. 30px)
  const { scrollYProgress } = useScroll({ target: seccion, offset: ['start end', 'end start'] });
  // (el marco va adentro del mazo para quedar entre las fotos: su parallax es relativo al de las fotos)
  const yFotos = useTransform(scrollYProgress, [0, 1], [-15, 15]);
  const yMarco = useTransform(scrollYProgress, [0, 1], [30, -30]);

  // Loops (etiquetas) en pausa fuera de pantalla
  const caja = useRef(null);
  const visible = usePausaFueraDePantalla(caja);

  // "Tocá para ver más": una vez por sesión, cuando la sección ya se ve
  useEffect(() => {
    if (!visible || pista === 'hecha') return;
    const t = setTimeout(() => primeraVez() && setPista(true), 1400);
    return () => clearTimeout(t);
  }, [visible, pista]);
  useEffect(() => {
    if (pista !== true) return;
    const t = setTimeout(() => setPista('hecha'), 5000);
    return () => clearTimeout(t);
  }, [pista]);

  const pasar = () => {
    if (animando.current) return;
    setPista('hecha');
    const frente = ordenRef.current[0];
    const capa = capas.current[frente];
    if (reducido || !capa?.adentro?.animate) {
      // Movimiento reducido: el mazo cambia con un fade (las fotos cambian de lugar mientras no se ven)
      const el = mazo.current;
      if (!el?.animate) return setOrden((o) => [...o.slice(1), o[0]]);
      animando.current = true;
      el.animate([{ opacity: 1 }, { opacity: 0, offset: 0.5 }, { opacity: 1 }], { duration: 500, easing: 'ease-in-out' }).onfinish = () => {
        animando.current = false;
      };
      setTimeout(() => setOrden((o) => [...o.slice(1), o[0]]), 250);
      return;
    }
    animando.current = true;
    if (capa.tilt) soltarTilt(capa.tilt);
    // La de adelante sale hacia la derecha girando y vuelve por detrás al fondo del mazo. Mientras sale
    // queda encima de todo; a mitad de camino pasa atrás.
    capa.adentro.animate(
      [
        { transform: 'translate3d(0,0,0) rotate(0deg)' },
        { transform: 'translate3d(70%,-5%,0) rotate(12deg)', offset: 0.45 },
        { transform: 'translate3d(0,0,0) rotate(0deg)' },
      ],
      { duration: DURACION, easing: 'cubic-bezier(0.45, 0, 0.25, 1)' },
    );
    capa.afuera.animate([{ zIndex: 6 }, { zIndex: 6, offset: 0.45 }, { zIndex: 0, offset: 0.46 }, { zIndex: 0 }], { duration: DURACION });
    // El marco acompaña: un vaivén suave cuando llega la nueva foto
    marco.current?.animate([{ rotate: '-4deg' }, { rotate: '-7deg', offset: 0.5 }, { rotate: '-4deg' }], { duration: DURACION, easing: EASE });
    setOrden((o) => [...o.slice(1), o[0]]);
    setTimeout(() => {
      animando.current = false;
    }, DURACION);
  };

  // ── Mouse (desktop): etiquetas con parallax y tilt de la foto de adelante, en el mismo frame ──
  const mover = (e) => {
    if (!mouse || reducido || e.pointerType !== 'mouse') return;
    const { clientX, clientY } = e;
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const r = caja.current?.getBoundingClientRect();
      if (!r) return;
      const px = Math.max(-1, Math.min(1, (clientX - r.left) / r.width - 0.5)); // -0.5…0.5 sobre la foto
      const py = Math.max(-1, Math.min(1, (clientY - r.top) / r.height - 0.5));
      chips.current.forEach((c, i) => {
        if (!c) return;
        c.style.transition = "none";
        c.style.transform = `translate3d(${(px * ETIQUETAS[i].k).toFixed(1)}px,${(py * ETIQUETAS[i].k).toFixed(1)}px,0)`;
      });
      const tilt = capas.current[ordenRef.current[0]]?.tilt;
      if (tilt && Math.abs(px) <= 0.5 && Math.abs(py) <= 0.5) {
        tilt.style.transition = 'none';
        tilt.style.transform = `perspective(900px) rotateX(${(-py * TILT_MAX * 2).toFixed(2)}deg) rotateY(${(px * TILT_MAX * 2).toFixed(2)}deg)`;
      } else if (tilt) {
        soltarTilt(tilt);
      }
    });
  };
  const soltarTilt = (tilt) => {
    tilt.style.transition = `transform 300ms ${EASE}`;
    tilt.style.transform = '';
  };
  const salir = () => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    chips.current.forEach((c) => {
      if (!c) return;
      c.style.transition = `transform 300ms ${EASE}`;
      c.style.transform = '';
      setTimeout(() => (c.style.transition = ''), 320);
    });
    capas.current.forEach((c) => c?.tilt && soltarTilt(c.tilt));
  };

  // La sección entera escucha al mouse (las etiquetas se mueven aunque el mouse esté sobre el texto)
  useEffect(() => {
    const s = seccion.current;
    if (!s || !mouse || reducido) return;
    s.addEventListener('pointermove', mover, { passive: true });
    s.addEventListener('pointerleave', salir, { passive: true });
    return () => {
      s.removeEventListener('pointermove', mover);
      s.removeEventListener('pointerleave', salir);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seccion, mouse, reducido]);

  const frente = orden[0];
  return (
    <div ref={caja} className="relative mx-auto w-[86%] max-w-md">
      <m.div
        ref={mazo}
        role="button"
        tabIndex={0}
        aria-label={`Ver otra foto de Mar (foto ${frente + 1} de ${FOTOS.length})`}
        onClick={pasar}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            pasar();
          }
        }}
        style={reducido ? undefined : { y: yFotos }}
        className="relative aspect-[4/5] cursor-pointer rounded-5xl outline-none select-none focus-visible:ring-4 focus-visible:ring-verde/40 focus-visible:ring-offset-4 focus-visible:ring-offset-arena"
      >
        {/* Marco salvia: en z 3, entre las fotos de atrás y la de adelante (la acompaña siempre) */}
        <m.div ref={marco} aria-hidden="true" style={reducido ? { zIndex: 3 } : { y: yMarco, zIndex: 3 }} className="absolute -inset-3 rotate-[-4deg] rounded-5xl bg-salvia-media" />
        {FOTOS.map((f, i) => {
          const pos = orden.indexOf(i);
          return (
            <div
              key={f.src}
              ref={(n) => (capas.current[i] = { ...capas.current[i], afuera: n })}
              aria-hidden={pos !== 0 || undefined}
              className="absolute inset-0"
              style={{ transform: POSICION[pos], zIndex: Z[pos], transition: reducido ? 'none' : `transform ${DURACION}ms ${EASE}` }}
            >
              <div ref={(n) => (capas.current[i] = { ...capas.current[i], adentro: n })} className="size-full">
                <div ref={(n) => (capas.current[i] = { ...capas.current[i], tilt: n })} className="size-full">
                  <div className="size-full overflow-hidden rounded-5xl bg-salvia-media shadow-flotante">
                    <RevealImagen>
                      <SmartImg src={f.src} sizes={SIZES} alt={f.alt} width={f.w} height={f.h} className={`size-full object-cover ${f.encuadre}`} />
                    </RevealImagen>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </m.div>

      {/* Etiquetas flotantes: afuera sigue al mouse (desktop), adentro flota en loop (CSS) */}
      {ETIQUETAS.map((t, i) => (
        <div key={t.texto} ref={(n) => (chips.current[i] = n)} aria-hidden="true" className={`pointer-events-none absolute z-10 ${t.clase}`}>
          <span
            className="chip-flotar block rounded-full border border-dorado/50 bg-crema-card px-3 py-1.5 text-[13px] font-semibold whitespace-nowrap text-tinta shadow-suave"
            style={{ animationDelay: t.retraso }}
          >
            {t.texto}
          </span>
        </div>
      ))}

      {/* Pista: aparece una vez por sesión */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-tinta/85 px-3.5 py-1.5 text-[13px] font-semibold whitespace-nowrap text-arena shadow-flotante transition-opacity duration-500 ${
          pista === true ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className={pista === true && !reducido ? 'mano-toque inline-block' : 'inline-block'}>👆</span>
        {mouse ? 'Hacé clic para ver más' : 'Tocá para ver más'}
      </div>
    </div>
  );
}
