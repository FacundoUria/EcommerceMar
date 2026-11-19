import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router';
import { AnimatePresence, m } from 'motion/react';
import Icon from '../ui/Icon.jsx';
import { fuenteImagen, imgFija } from '../../lib/imagenes.js';
import { ASPECTO, FIGURA, medir } from './miniMarGeo.js';

// El asomo (figura grande, globito) y el chat van en chunks aparte: se piden al asomar / al tocar el
// botón, y se precargan cuando el navegador está ocioso después del load (junto con la figura).
const cargarPanel = () => import('./MiniMarPanel.jsx');
const cargarChat = () => import('./ChatMar.jsx');
const Panel = lazy(cargarPanel);
const Chat = lazy(cargarChat);
const ASOMA_MS = 3000;
const CLAVE_ASOMO = 'dh-asomo';

/** Corre `fn` cuando el navegador está ocioso, después del load (Safari no tiene requestIdleCallback). */
function enIdle(fn) {
  const correr = () => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 4000 }) : setTimeout(fn, 2000));
  if (document.readyState === 'complete') correr();
  else window.addEventListener('load', correr, { once: true });
}

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


/**
 * Mini Mar en mobile (en desktop está el widget flotante de MiniMar.jsx). Es el botón central del
 * bottom nav: tocarlo abre el chat guiado de mini Mar (ChatMar.jsx: bottom sheet de ~75% del alto, con
 * mini Mar asomando por encima del borde; detrás, overlay arena al 40% con blur).
 * - Se cierra con la X, tocando afuera, deslizando hacia abajo, con el botón central (que muestra una X) o Esc.
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
  const estadoRef = useRef(estado);
  useEffect(() => {
    estadoRef.current = estado;
  }, [estado]);

  const mostrar = useCallback((nuevo) => {
    setGeo(medir(boton.current?.closest('ul')));
    setEstado(nuevo);
  }, []);
  const cerrar = useCallback(() => setEstado('cerrada'), []);

  // En idle después del load: el chunk del panel y la figura (así no esperan cuando se abre)
  useEffect(() => {
    enIdle(() => {
      cargarPanel();
      cargarChat();
      const img = new Image();
      img.src = fuenteImagen(FIGURA, Math.round(280 * ASPECTO * Math.min(window.devicePixelRatio || 1, 3))).src;
    });
  }, []);

  // Cambio de página → se cierra
  useEffect(() => cerrar(), [pathname, cerrar]);

  // Abierta: Esc, bloqueo de scroll y foco los maneja el chat (ChatMar.jsx)

  // Asomo de la primera vez: al bajar del hero (home) o a los 8 s / 300px en páginas sin hero
  const asomoHecho = useRef(false);
  const timerAsomo = useRef(0);
  useEffect(() => () => clearTimeout(timerAsomo.current), []);
  useEffect(() => {
    if (asomoHecho.current) return;
    const asomar = () => {
      if (asomoHecho.current) return;
      asomoHecho.current = true;
      // Si ya abrió el chat, no hace falta asomar (y no se lo cierra)
      if (estadoRef.current !== 'cerrada' || !primeraVez() || document.documentElement.dataset.overlay) return;
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
          aria-label={abierta ? 'Cerrar el chat con Mar' : '¿Te ayudo a elegir? Abrir el chat con Mar'}
          // Fondo arena (por la transparencia del avatar); verde solo cuando muestra la X
          className="relative flex size-[3.6rem] items-center justify-center overflow-hidden rounded-full border-4 border-arena bg-arena shadow-flotante transition active:scale-90"
          style={abierta ? { backgroundImage: 'linear-gradient(135deg, #3e6450 0%, #2f5240 100%)' } : undefined}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {abierta ? (
              <m.span key="x" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.3 }} className="text-arena">
                <Icon name="cerrar" size={24} strokeWidth={2.4} />
              </m.span>
            ) : (
              <m.img
                key="cara"
                {...imgFija('/img/marca/mini-mar-cara.webp', 50)} // avatar dedicado: cara centrada, llena el círculo
                alt=""
                width="192"
                height="192"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="size-full object-cover"
              />
            )}
          </AnimatePresence>
        </button>
        {/* Globito de chat en la esquina del círculo */}
        {!abierta && (
          // Badge chico (18px) sobre el borde del círculo, abajo a la derecha: fuera de la cara
          <span aria-hidden="true" className="pointer-events-none absolute right-0 bottom-0 flex size-[18px] items-center justify-center rounded-full bg-verde text-arena ring-2 ring-arena">
            <Icon name="chat" size={11} strokeWidth={2.4} />
          </span>
        )}
      </span>
      {createPortal(
        <AnimatePresence>
          {estado === 'asomando' && geo && (
            <Suspense key="asomo" fallback={null}>
              <Panel geo={geo} onAbrir={() => mostrar('abierta')} />
            </Suspense>
          )}
          {abierta && geo && (
            <Suspense key="chat" fallback={null}>
              <Chat modo="sheet" base={geo.base} onClose={cerrar} />
            </Suspense>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </li>
  );
}
