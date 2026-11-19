import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { m } from 'motion/react';
import Icon from '../ui/Icon.jsx';
import Destellos from './Destellos.jsx';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';
import { whatsappCon } from '../../config/negocio.js';
import { imgFija, urlImagen } from '../../lib/imagenes.js';

const DESTELLO_GLOBO = [{ x: '-6%', y: '-45%', tam: 11 }];
const LINK = whatsappCon('¡Hola Mar! Tengo una consulta.');
const TEXTO = '¿Te ayudo a elegir?';
const ABIERTA_MS = 6000; // a los 6 s se achica
const EASE = [0.22, 1, 0.36, 1];

// Ilustración (assets/marca/mini-mar.png, 451×661): cortada a la derecha y abajo → va pegada a esos bordes.
// Punta del dedo (señala arriba a la izquierda), en fracción del ancho / alto de la imagen.
const ASPECTO = 451 / 661;
const DEDO = { x: 0.062, y: 0.342 };
const ALTO = 300;
const BOTON = 56;
const MARGEN = 24;

/**
 * La ilustración dibujada en un <canvas> y no en un <img>: aparece después de la carga y en páginas con
 * poco contenido (/carrito) pasaba a ser el elemento LCP (2.86 → 3.21 s). Un canvas no cuenta para el LCP.
 */
function FiguraCanvas({ ancho, alto }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(ancho * dpr);
    canvas.height = Math.round(alto * dpr);
    const img = new Image();
    img.decoding = 'async';
    img.src = urlImagen('/img/marca/mini-mar.webp', canvas.width);
    let vivo = true;
    img.onload = () => {
      if (!vivo) return;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    return () => {
      vivo = false;
    };
  }, [ancho, alto]);
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ width: ancho, height: alto }}
      className="block drop-shadow-[0_10px_18px_rgb(34_56_43/0.18)]"
    />
  );
}

/**
 * Mini Mar señalando el botón de WhatsApp (abajo a la derecha, en todas las páginas) — SOLO DESKTOP.
 * En mobile no hay widget flotante: el WhatsApp es el botón central del bottom nav (BottomNav.jsx).
 * - NO entra al cargar: en el home, cuando el hero salió de pantalla (scroll > 70% de su alto); en páginas
 *   sin hero, a los 300px de scroll o a los 8 s. Entra desde abajo con un rebote; a su izquierda, donde
 *   apunta el dedo, el botón de WhatsApp y el globito "¿Te ayudo a elegir?".
 * - A los 6 s se achica: queda el botón en la esquina con su carita. Hover (mouse) o tocar la carita la
 *   vuelve a mostrar. Compacta, se esconde mientras se superpone con [data-evitar-mini-mar] (mini-card de
 *   Skala del hero).
 * - Oculta con el carrito, el quick view o los filtros abiertos (<html data-overlay="abierto">).
 * - Movimiento reducido: sin desplazamientos (MotionConfig reducedMotion="user"), solo fades.
 * Solo transform + opacity. La imagen se pide recién después del `load` (no compite con el LCP) y va en
 * un canvas (no se vuelve el elemento LCP).
 */
export default function MiniMar() {
  const desktop = useMediaQuery('(min-width: 768px)');
  return desktop ? <MiniMarDesktop /> : null;
}

function MiniMarDesktop() {
  const alto = ALTO;
  const boton = BOTON;
  const margen = MARGEN;
  const { pathname } = useLocation();
  const [montada, setMontada] = useState(false);
  const [abierta, setAbierta] = useState(true);
  const [tapando, setTapando] = useState(false); // compacta encima de algo que no debe tapar
  const timer = useRef(null);
  const imagen = useRef(null);

  // La imagen se baja después del load y antes de mostrarla (el canvas no tiene "cargando": entraría vacío)
  useEffect(() => {
    const precargar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const img = new Image();
      img.src = urlImagen('/img/marca/mini-mar.webp', Math.round(ALTO * ASPECTO * dpr));
      imagen.current = img.decode().catch(() => {});
    };
    if (document.readyState === 'complete') precargar();
    else window.addEventListener('load', precargar, { once: true });
    return () => window.removeEventListener('load', precargar);
  }, []);

  // Cuándo entra: NO al cargar. Con hero ([data-hero], el home): cuando se scrolleó más del 70% de su
  // alto. Sin hero: a los 300px de scroll o a los 8 s en la página, lo que pase primero.
  useEffect(() => {
    if (montada) return;
    let hecho = false;
    const mostrar = () => {
      if (hecho) return;
      hecho = true;
      const listo = () => (imagen.current ?? Promise.resolve()).then(() => setMontada(true));
      if (document.readyState === 'complete') listo();
      else window.addEventListener('load', () => setTimeout(listo, 50), { once: true });
    };
    const chequear = () => {
      const hero = document.querySelector('[data-hero]');
      if (hero ? window.scrollY > hero.offsetHeight * 0.7 : window.scrollY > 300) mostrar();
    };
    const t = setTimeout(() => !document.querySelector('[data-hero]') && mostrar(), 8000);
    window.addEventListener('scroll', chequear, { passive: true });
    chequear();
    return () => {
      clearTimeout(t);
      window.removeEventListener('scroll', chequear);
    };
  }, [montada, pathname]);

  const cerrarEn = useCallback((ms) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAbierta(false), ms);
  }, []);
  const abrir = (ms) => {
    setAbierta(true);
    if (ms) cerrarEn(ms);
    else clearTimeout(timer.current);
  };

  useEffect(() => {
    if (montada) cerrarEn(ABIERTA_MS);
    return () => clearTimeout(timer.current);
  }, [montada, cerrarEn]);

  // Compacta: si el botón (con su carita) queda encima de algo marcado con data-evitar-mini-mar (la
  // mini-card de Skala del hero, si la clienta vuelve arriba), se esconde mientras dure la superposición.
  useEffect(() => {
    if (!montada || abierta) {
      setTapando(false);
      return;
    }
    const abajo = margen;
    let raf = 0;
    const chequear = () => {
      raf = 0;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const AIRE = 12; // la carita asoma 12px arriba a la izquierda
      const caja = { l: W - margen - boton - AIRE, r: W - margen, t: H - abajo - boton - AIRE, b: H - abajo };
      const choca = [...document.querySelectorAll('[data-evitar-mini-mar]')].some((el) => {
        const e = el.getBoundingClientRect();
        return e.width && e.left < caja.r && e.right > caja.l && e.top < caja.b && e.bottom > caja.t;
      });
      setTapando(choca);
    };
    const programar = () => !raf && (raf = requestAnimationFrame(chequear));
    chequear();
    window.addEventListener('scroll', programar, { passive: true });
    window.addEventListener('resize', programar);
    const id = setInterval(programar, 1000); // la card también se mueve sola (flota, parallax)
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
      window.removeEventListener('scroll', programar);
      window.removeEventListener('resize', programar);
    };
  }, [montada, abierta, margen, boton, pathname]);

  if (!montada) return null;

  // Geometría (px desde la esquina inferior derecha de la pantalla)
  const ancho = Math.round(alto * ASPECTO);
  const pie = 0; // pegada al borde de abajo
  const dedo = { der: ancho * (1 - DEDO.x), abajo: pie + alto * (1 - DEDO.y) };
  // Botón abierto: a la izquierda y un poco arriba de la punta del dedo. Compacto: en la esquina.
  const abiertoPos = { der: dedo.der + 6, abajo: dedo.abajo - 4 };
  const compactoPos = { der: margen, abajo: margen };
  const dx = abiertoPos.der - compactoPos.der; // cuánto se corre a la derecha al achicarse
  const dy = abiertoPos.abajo - compactoPos.abajo; // y hacia abajo

  const hover = {
    onPointerEnter: (e) => e.pointerType === 'mouse' && abrir(0),
    onPointerLeave: (e) => e.pointerType === 'mouse' && cerrarEn(1200),
  };

  return (
    <div
      className="pointer-events-none fixed right-0 bottom-0 z-[29] transition-[opacity,visibility] duration-300 in-data-[overlay=abierto]:invisible in-data-[overlay=abierto]:opacity-0"
      data-mini-mar
    >
      {/* La figura */}
      <m.a
        href={LINK}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={-1}
        aria-hidden="true"
        {...hover}
        className={`absolute right-0 block ${abierta ? 'pointer-events-auto' : 'pointer-events-none'}`}
        style={{ bottom: pie, width: ancho, height: alto }}
        initial={{ y: '105%', opacity: 0 }}
        animate={abierta ? { y: '0%', opacity: 1 } : { y: '105%', opacity: 0 }}
        transition={
          abierta
            ? { y: { type: 'spring', bounce: 0.38, duration: 0.85 }, opacity: { duration: 0.35 } }
            : { y: { duration: 0.5, ease: EASE }, opacity: { duration: 0.35, delay: 0.15 } }
        }
      >
        <FiguraCanvas ancho={ancho} alto={alto} />
      </m.a>

      {/* Botón + globito + carita: se mueven juntos entre la posición "abierta" y la esquina */}
      <m.div
        className="absolute"
        style={{ right: abiertoPos.der, bottom: abiertoPos.abajo, width: boton, height: boton }}
        initial={{ x: 0, y: 0, opacity: 0, scale: 0.6 }}
        animate={{ x: abierta ? 0 : dx, y: abierta ? 0 : dy, opacity: tapando ? 0 : 1, scale: 1 }}
        transition={{
          x: { duration: 0.6, ease: EASE },
          y: { duration: 0.6, ease: EASE },
          opacity: { duration: 0.3, delay: tapando ? 0 : 0.25 },
          scale: { type: 'spring', bounce: 0.45, duration: 0.6, delay: 0.25 },
        }}
        {...hover}
      >
        <a
          href={LINK}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${TEXTO} Escribile a Mar por WhatsApp`}
          className={`${tapando ? 'pointer-events-none' : 'pointer-events-auto'} relative flex size-full items-center justify-center rounded-full text-arena shadow-flotante transition hover:scale-105 active:scale-95`}
          style={{ backgroundImage: 'linear-gradient(135deg, #3e6450 0%, #2f5240 100%)' }}
        >
          <span className="pulso absolute inset-0 rounded-full" aria-hidden="true" />
          <Icon name="whatsapp" size={28} />
        </a>

        {/* Globito, a la izquierda del botón */}
        <m.span
          aria-hidden="true"
          className="absolute top-1/2 right-[calc(100%+0.6rem)] -translate-y-1/2 rounded-2xl rounded-br-md bg-crema-card px-3.5 py-2 text-[13px] font-bold whitespace-nowrap text-tinta shadow-flotante ring-1 ring-linea"
          initial={{ opacity: 0, x: 8 }}
          animate={abierta ? { opacity: 1, x: 0 } : { opacity: 0, x: 8 }}
          transition={{ duration: 0.35, ease: EASE, delay: abierta ? 0.55 : 0 }}
        >
          {TEXTO}
          <Destellos puntos={DESTELLO_GLOBO} />
        </m.span>

        {/* Carita (modo compacto): tocarla vuelve a mostrar a mini Mar */}
        <m.button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => abrir(4000)}
          className={`absolute -top-3 -left-3 size-8 overflow-hidden rounded-full bg-salvia shadow-suave ring-2 ring-crema-card ${abierta || tapando ? 'pointer-events-none' : 'pointer-events-auto'}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={abierta ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: EASE, delay: abierta ? 0 : 0.35 }}
        >
          <img {...imgFija('/img/marca/mini-mar-cara.webp', 32)} alt="" width="160" height="160" className="size-full object-cover" />
        </m.button>
      </m.div>
    </div>
  );
}
