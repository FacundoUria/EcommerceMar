import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import Icon from '../ui/Icon.jsx';
import Destellos from './Destellos.jsx';
import { whatsappCon } from '../../config/negocio.js';
import { fuenteImagen, imgFija } from '../../lib/imagenes.js';

const LINK = whatsappCon('¡Hola Mar! Tengo una consulta.');
const FIGURA = '/img/marca/mini-mar.webp';
const ASPECTO = 451 / 661; // assets/marca/mini-mar.png
const DEDO = { x: 0.062, y: 0.342 }; // punta del dedo (señala arriba a la izquierda), en fracción de la imagen
const CORTE = 14; // px de la figura que quedan escondidos detrás del borde de la barra
const CINTURA = 0.45; // al asomar sola, baja este tanto de su alto: se ve hasta la cintura
const ASOMA_MS = 3000;
const CLAVE_ASOMO = 'dh-asomo';
const EASE = [0.22, 1, 0.36, 1];
const DESTELLO_GLOBO = [{ x: '-6%', y: '-45%', tam: 11 }];

/** ¿Primera vez en la sesión? (con try/catch: sin sessionStorage, no asoma) */
function primeraVez() {
  try {
    if (sessionStorage.getItem(CLAVE_ASOMO)) return false;
    sessionStorage.setItem(CLAVE_ASOMO, '1');
    return true;
  } catch {
    return false;
  }
}

/** Geometría según el ancho real de la pantalla y dónde está la barra (px). */
function medir(barra) {
  const W = window.innerWidth;
  const alto = Math.round(Math.min(280, W * 0.7));
  const ancho = Math.round(alto * ASPECTO);
  const base = barra ? Math.round(window.innerHeight - barra.getBoundingClientRect().top) : 76; // del borde de abajo al borde de arriba de la barra
  // punta del dedo, en coordenadas de la capa (que mide `alto` y está apoyada en la barra)
  const dedo = { x: W - ancho + ancho * DEDO.x, y: CORTE + alto * DEDO.y };
  return { W, alto, ancho, base, dedo, desdeBoton: { x: W / 2 - (W - ancho / 2), y: alto * 0.75 } };
}

/**
 * Mini Mar en mobile (en desktop está el widget flotante de MiniMar.jsx). Es el botón central del
 * bottom nav: tocarlo NO abre WhatsApp directo, abre a mini Mar:
 * - La figura sube desde el botón con un rebote suave y queda parada sobre la barra, a la derecha,
 *   señalando el botón grande "Escribile a Mar" (WhatsApp) con el globito "¿Te ayudo a elegir?".
 *   Detrás, overlay arena al 40% con blur.
 * - Se cierra tocando afuera, deslizando hacia abajo, con el botón central (que muestra una X) o Esc.
 * - La primera vez de la sesión, cuando ya bajó del hero (o a los 8 s en páginas sin hero), asoma sola
 *   ~3 s hasta la cintura, sin overlay, y vuelve a esconderse en el botón.
 * - Movimiento reducido: aparece y desaparece con fade (MotionConfig anula los desplazamientos).
 */
export default function BotonMarMobile() {
  const [estado, setEstado] = useState('cerrada'); // 'cerrada' | 'abierta' | 'asomando'
  const [geo, setGeo] = useState(null);
  const boton = useRef(null);
  const { pathname } = useLocation();
  const abierta = estado === 'abierta';

  const mostrar = useCallback((nuevo) => {
    setGeo(medir(boton.current?.closest('ul')));
    setEstado(nuevo);
  }, []);
  const cerrar = useCallback(() => setEstado('cerrada'), []);

  // La figura se baja después del load (así no espera cuando se abre)
  useEffect(() => {
    const precargar = () => {
      const img = new Image();
      img.src = fuenteImagen(FIGURA, Math.round(280 * ASPECTO * Math.min(window.devicePixelRatio || 1, 3))).src;
    };
    if (document.readyState === 'complete') setTimeout(precargar, 1500);
    else window.addEventListener('load', () => setTimeout(precargar, 1500), { once: true });
  }, []);

  // Cambio de página → se cierra
  useEffect(() => cerrar(), [pathname, cerrar]);

  // Abierta: Esc cierra y la página de atrás no scrollea
  useEffect(() => {
    if (!abierta) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && cerrar();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [abierta, cerrar]);

  // Asomo de la primera vez: al bajar del hero (home) o a los 8 s / 300px en páginas sin hero
  const asomoHecho = useRef(false);
  const timerAsomo = useRef(0);
  useEffect(() => () => clearTimeout(timerAsomo.current), []);
  useEffect(() => {
    if (asomoHecho.current) return;
    const asomar = () => {
      if (asomoHecho.current) return;
      asomoHecho.current = true;
      if (!primeraVez() || document.documentElement.dataset.overlay) return;
      mostrar('asomando');
      timerAsomo.current = setTimeout(() => setEstado((e) => (e === 'asomando' ? 'cerrada' : e)), ASOMA_MS);
    };
    const chequear = () => {
      const hero = document.querySelector('[data-hero]');
      if (hero ? window.scrollY > hero.offsetHeight * 0.7 : window.scrollY > 300) asomar();
    };
    const t = setTimeout(() => !document.querySelector('[data-hero]') && asomar(), 8000);
    window.addEventListener('scroll', chequear, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener('scroll', chequear);
    };
  }, [pathname, mostrar]);

  return (
    <li className="flex flex-1 items-center justify-center self-stretch">
      <span className="relative">
        <button
          ref={boton}
          type="button"
          onClick={() => (abierta ? cerrar() : mostrar('abierta'))}
          aria-expanded={abierta}
          aria-label={abierta ? 'Cerrar a mini Mar' : '¿Te ayudo a elegir? Abrir a mini Mar'}
          className="relative flex size-[3.6rem] items-center justify-center overflow-hidden rounded-full border-4 border-arena shadow-flotante transition active:scale-90"
          style={{ backgroundImage: 'linear-gradient(135deg, #3e6450 0%, #2f5240 100%)' }}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {abierta ? (
              <m.span key="x" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.3 }} className="text-arena">
                <Icon name="cerrar" size={24} strokeWidth={2.4} />
              </m.span>
            ) : (
              <m.img
                key="cara"
                {...imgFija('/img/marca/mini-mar-cara.webp', 50)}
                alt=""
                width="192"
                height="192"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="mt-2.5 size-[2.95rem] object-cover"
              />
            )}
          </AnimatePresence>
        </button>
        {/* Marca de WhatsApp en la esquina del círculo */}
        {!abierta && (
          <span aria-hidden="true" className="pointer-events-none absolute -right-1 -bottom-0.5 flex size-5 items-center justify-center rounded-full bg-crema-card text-verde shadow-suave">
            <Icon name="whatsapp" size={13} />
          </span>
        )}
      </span>
      {createPortal(
        <AnimatePresence>{estado !== 'cerrada' && geo && <Panel key="panel" geo={geo} estado={estado} onClose={cerrar} onAbrir={() => mostrar('abierta')} />}</AnimatePresence>,
        document.body,
      )}
    </li>
  );
}

function Panel({ geo, estado, onClose, onAbrir }) {
  const reducido = useReducedMotion();
  const abierta = estado === 'abierta';
  const wa = useRef(null);
  const { alto, ancho, base, dedo, desdeBoton } = geo;
  const f = fuenteImagen(FIGURA, ancho * 2);

  useEffect(() => {
    if (abierta) wa.current?.focus({ preventScroll: true });
  }, [abierta]);

  // La figura sube desde el botón central (chica, abajo al medio) hasta su lugar, con un rebote suave
  const escondida = { x: desdeBoton.x, y: desdeBoton.y, scale: 0.3, opacity: 0 };
  const parada = { x: 0, y: abierta ? 0 : alto * CINTURA, scale: 1, opacity: 1 };
  // Botón "Escribile a Mar": a la izquierda de la punta del dedo, un poco más arriba (donde apunta)
  const anchoBoton = Math.min(184, dedo.x - 18);
  const botonPos = { right: geo.W - dedo.x + 8, bottom: alto - dedo.y + 6 };

  return (
    <>
      {abierta && (
        <m.div
          aria-hidden="true"
          className="fixed inset-0 z-[38] touch-none bg-arena/40 backdrop-blur-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          onPanEnd={(_, info) => info.offset.y > 60 && onClose()}
        />
      )}
      {/* Capa apoyada sobre la barra: la figura se recorta en el borde de arriba de la barra */}
      <m.div
        role={abierta ? 'dialog' : undefined}
        aria-label={abierta ? 'Mini Mar: ¿Te ayudo a elegir?' : undefined}
        aria-hidden={abierta ? undefined : true}
        className="pointer-events-none fixed inset-x-0 z-[39]"
        style={{ bottom: base, height: alto }}
        drag={abierta ? 'y' : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => (info.offset.y > 60 || info.velocity.y > 500) && onClose()}
      >
        <div className="absolute inset-0 overflow-hidden">
          <m.img
            src={f.src}
            srcSet={f.srcSet}
            sizes={`${ancho}px`}
            alt=""
            width="451"
            height="661"
            draggable="false"
            onClick={abierta ? undefined : onAbrir}
            className="pointer-events-auto absolute right-0 drop-shadow-[0_10px_18px_rgb(34_56_43/0.2)]"
            style={{ width: ancho, height: alto, bottom: -CORTE, transformOrigin: '50% 100%' }}
            initial={escondida}
            animate={parada}
            exit={{ ...escondida, transition: { duration: reducido ? 0.25 : 0.4, ease: EASE } }}
            transition={reducido ? { duration: 0.3 } : { type: 'spring', bounce: 0.32, duration: 0.75 }}
          />
        </div>

        {/* Globito: al asomar, junto a la cabeza; abierta, arriba del botón */}
        <m.button
          type="button"
          tabIndex={-1}
          onClick={abierta ? undefined : onAbrir}
          className="pointer-events-auto absolute rounded-2xl rounded-br-md bg-crema-card px-3.5 py-2 text-[13px] font-bold whitespace-nowrap text-tinta shadow-flotante ring-1 ring-linea"
          style={abierta ? { right: botonPos.right + 8, bottom: botonPos.bottom + 58 } : { right: geo.W - dedo.x + 10, top: dedo.y + alto * CINTURA - 34 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          transition={{ duration: 0.35, ease: EASE, delay: 0.45 }}
        >
          ¿Te ayudo a elegir?
          <Destellos puntos={DESTELLO_GLOBO} />
        </m.button>

        {abierta && (
          <m.a
            ref={wa}
            href={LINK}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="pointer-events-auto absolute flex h-14 items-center justify-center gap-2 rounded-full px-5 text-[15px] font-bold whitespace-nowrap text-arena shadow-flotante outline-none focus-visible:ring-2 focus-visible:ring-tinta focus-visible:ring-offset-2"
            style={{ ...botonPos, width: anchoBoton, backgroundImage: 'linear-gradient(135deg, #3e6450 0%, #2f5240 100%)' }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
            transition={reducido ? { duration: 0.25, delay: 0.15 } : { type: 'spring', bounce: 0.4, duration: 0.55, delay: 0.3 }}
          >
            <Icon name="whatsapp" size={22} /> Escribile a Mar
          </m.a>
        )}
      </m.div>
    </>
  );
}
