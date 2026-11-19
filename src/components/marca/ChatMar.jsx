import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { m, useDragControls, useReducedMotion } from 'motion/react';
import Icon from '../ui/Icon.jsx';
import Destellos from './Destellos.jsx';
import { CHAT, opcionChat } from '../../config/chat.js';
import { whatsappCon } from '../../config/negocio.js';
import { useServiceGroups } from '../../hooks/useCatalog.js';
import { useFocusTrap } from '../../hooks/useFocusTrap.js';
import { useBloquearScroll } from '../../hooks/useBloquearScroll.js';
import { useOcultarBottomNav } from '../../hooks/useOcultarBottomNav.js';
import { fuenteImagen, imgFija } from '../../lib/imagenes.js';
import { PATH_ESTRELLA, espiral } from '../../lib/rulos.js';
import { ASPECTO, FIGURA } from './miniMarGeo.js';

const EASE = [0.22, 1, 0.36, 1];
const CLAVE = 'dh-chat';
const CARA = '/img/marca/mini-mar-cara.webp';
const DEGRADE_VERDE = 'linear-gradient(135deg, #3e6450 0%, #2f5240 100%)';
const DESTELLOS_HEADER = [
  { x: '-18%', y: '-14%', tam: 10 },
  { x: '92%', y: '-22%', tam: 8 },
];
// Mini Mar de la bienvenida: se ve de la cintura para arriba (56% de arriba de la ilustración)
const FIG_ALTO = 210;
const FIG_ANCHO = Math.round(FIG_ALTO * ASPECTO);
const FIG_VISIBLE = Math.round(FIG_ALTO * 0.56);
// Foco visible y grande (teclado): anillo verde con aire
const FOCO = 'outline-none focus-visible:ring-4 focus-visible:ring-verde/45 focus-visible:ring-offset-2 focus-visible:ring-offset-arena';

/** Pantalla actual (inicio = null o el id de una opción), recordada en la sesión (con try/catch). */
function leerPantalla() {
  try {
    const id = JSON.parse(sessionStorage.getItem(CLAVE))?.pantalla;
    return opcionChat(id) ? id : null;
  } catch {
    return null;
  }
}
function guardarPantalla(pantalla) {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify({ pantalla }));
  } catch {
    /* sin sessionStorage: no se recuerda */
  }
}

/** Abre WhatsApp en otra pestaña (en el celu, la app). */
const linkWhatsApp = (mensaje) => ({ href: whatsappCon(mensaje), target: '_blank', rel: 'noopener noreferrer' });

// Fondo: rulos y destellos al 5%
const RULO_PATRON = espiral({ cx: 30, cy: 34, r0: 2, r1: 13, vueltas: 1.7 });
const RULO_PATRON_2 = espiral({ cx: 96, cy: 98, r0: 1.5, r1: 10, vueltas: 1.5, inicio: 120 });
function PatronRulos() {
  const id = useId();
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full text-verde opacity-[0.05]">
      <defs>
        <pattern id={id} width="128" height="128" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d={RULO_PATRON} />
            <path d={RULO_PATRON_2} />
          </g>
          <g fill="currentColor">
            <path d={PATH_ESTRELLA} transform="translate(84 18) scale(0.6)" />
            <path d={PATH_ESTRELLA} transform="translate(18 86) scale(0.45)" />
            <path d={PATH_ESTRELLA} transform="translate(58 66) scale(0.3)" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

function Cara({ tam, className = '' }) {
  return (
    <img
      {...imgFija(CARA, tam)}
      alt=""
      width="192"
      height="192"
      className={`rounded-full bg-arena object-cover ${className}`}
      style={{ width: tam, height: tam }}
    />
  );
}

const entrada = (i = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: EASE, delay: 0.05 + i * 0.05 },
});

// ── Pantalla de inicio: mini Mar saluda y las 6 opciones como botones grandes ─────────────────────

function Inicio({ onElegir, enfocar }) {
  const f = fuenteImagen(FIGURA, FIG_ANCHO * 2);
  const primero = useRef(null);
  useEffect(() => {
    if (enfocar) (document.querySelector(`[data-opcion="${enfocar}"]`) ?? primero.current)?.focus({ preventScroll: true });
  }, [enfocar]);

  return (
    <div className="px-4 pt-3 pb-4">
      <div className="flex items-start">
        <m.p
          {...entrada()}
          className="relative z-10 mt-3 -mr-1 flex-1 rounded-3xl rounded-tr-md bg-crema-card px-4 py-3.5 text-[17px] leading-snug font-semibold text-tinta shadow-suave ring-1 ring-linea"
        >
          {CHAT.saludo}
        </m.p>
        {/* Mini Mar de la cintura para arriba, señalando hacia el globo (se achica a la carita al elegir) */}
        <m.div
          layoutId="chat-mini-mar"
          aria-hidden="true"
          className="shrink-0 overflow-hidden"
          style={{ width: FIG_ANCHO, height: FIG_VISIBLE, borderRadius: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <img src={f.src} srcSet={f.srcSet} sizes={`${FIG_ANCHO}px`} alt="" width="451" height="661" draggable="false" className="block" style={{ width: FIG_ANCHO, height: FIG_ALTO, maxWidth: 'none' }} />
        </m.div>
      </div>

      <ul aria-label="¿En qué te ayudo?" className="mt-3 space-y-2">
        {CHAT.opciones.map((o, i) => {
          const contenido = (
            <>
              <span aria-hidden="true" className={`flex size-10 shrink-0 items-center justify-center rounded-full text-[21px] ${o.whatsapp ? 'bg-crema-card/15' : 'bg-salvia'}`}>
                {o.icono}
              </span>
              <span className="flex-1">{o.texto}</span>
              <Icon name={o.whatsapp ? 'whatsapp' : 'flecha'} size={20} strokeWidth={2.2} className={o.whatsapp ? '' : 'text-verde'} />
            </>
          );
          const clase = `flex min-h-14 w-full items-center gap-3 rounded-2xl px-3.5 py-2 text-left text-[17px] font-bold transition active:scale-[0.98] ${FOCO}`;
          return (
            <m.li key={o.id} {...entrada(i + 1)}>
              {o.whatsapp ? (
                <a
                  ref={i === 0 ? primero : undefined}
                  data-opcion={o.id}
                  {...linkWhatsApp(o.whatsapp)}
                  aria-label={`${o.texto} por WhatsApp`}
                  className={`${clase} text-arena shadow-suave hover:shadow-flotante`}
                  style={{ backgroundImage: DEGRADE_VERDE }}
                >
                  {contenido}
                </a>
              ) : (
                <button
                  ref={i === 0 ? primero : undefined}
                  type="button"
                  data-opcion={o.id}
                  onClick={() => onElegir(o.id)}
                  className={`${clase} border border-verde/25 bg-crema-card text-tinta shadow-suave hover:border-verde hover:bg-salvia`}
                >
                  {contenido}
                </button>
              )}
            </m.li>
          );
        })}
      </ul>
    </div>
  );
}

// ── Pantalla de respuesta: SOLO el mensaje de Mar, un botón principal y "Volver" ──────────────────

function ServicioMini({ s }) {
  return (
    <div className="mt-3 flex items-center gap-3.5 rounded-2xl bg-crema-card p-2.5 shadow-suave ring-1 ring-linea">
      <img {...imgFija(s.imagen, 88)} alt="" width="88" height="88" className="size-[88px] shrink-0 rounded-xl bg-salvia-media object-cover" />
      <div className="min-w-0">
        <p className="font-serif text-[19px] leading-tight text-tinta">{s.nombre}</p>
        <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-salvia px-3 py-1 text-[15px] font-bold text-verde">
          <Icon name="reloj" size={16} strokeWidth={2} />
          <span className="sr-only">Duración:</span> {s.duracion}
        </p>
      </div>
    </div>
  );
}

function Respuesta({ opcion, servicios, onVolver, onNavegar }) {
  const { respuesta: r } = opcion;
  const s = r.servicio ? servicios[r.servicio] : null;
  const mensaje = useRef(null);
  useEffect(() => mensaje.current?.focus({ preventScroll: true }), []);

  const principal = `flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl px-5 text-[17px] font-bold text-arena shadow-suave transition hover:shadow-flotante active:scale-[0.98] ${FOCO}`;
  let accion = null;
  if (r.accion.tipo === 'pagina') {
    accion = (
      <Link to={r.accion.to} onClick={onNavegar} className={principal} style={{ backgroundImage: DEGRADE_VERDE }}>
        {r.accion.label} <Icon name="flecha" size={20} strokeWidth={2.2} />
      </Link>
    );
  } else {
    const reservar = r.accion.tipo === 'reservar';
    if (!reservar || s) {
      accion = (
        <a
          {...linkWhatsApp(reservar ? `¡Hola Mar! Quiero reservar: ${s.nombre}` : r.accion.mensaje)}
          aria-label={reservar ? `¡Reservar! ${s.nombre} por WhatsApp` : `${r.accion.label}`}
          className={principal}
          style={{ backgroundImage: DEGRADE_VERDE }}
        >
          <Icon name="whatsapp" size={22} /> {reservar ? '¡Reservar!' : r.accion.label}
        </a>
      );
    }
  }

  return (
    <div className="px-4 pt-4 pb-5">
      <div className="flex items-start gap-2.5">
        {/* La figura de la bienvenida se achica hasta acá (misma layoutId) */}
        <m.div
          layoutId="chat-mini-mar"
          aria-hidden="true"
          className="shrink-0 overflow-hidden ring-2 ring-crema-card"
          style={{ width: 48, height: 48, borderRadius: 999 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <Cara tam={48} />
        </m.div>
        <m.div
          ref={mensaje}
          tabIndex={-1}
          {...entrada(1)}
          className={`flex-1 space-y-2.5 rounded-3xl rounded-tl-md bg-crema-card px-4 py-3.5 text-[17px] leading-relaxed text-tinta shadow-suave ring-1 ring-linea ${FOCO}`}
        >
          <span className="sr-only">Mar dice:</span>
          {r.texto.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </m.div>
      </div>

      <m.div {...entrada(2)}>
        {s && <ServicioMini s={s} />}
        <div className="mt-4 space-y-3">
          {accion}
          {r.link && (
            <Link
              to={r.link.to}
              onClick={onNavegar}
              className={`mx-auto flex min-h-12 w-fit items-center rounded-full px-3 text-[16px] font-bold text-verde underline underline-offset-4 ${FOCO}`}
            >
              {r.link.label}
            </Link>
          )}
          <button
            type="button"
            onClick={onVolver}
            className={`flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-verde bg-crema-card px-5 text-[17px] font-bold text-verde transition hover:bg-salvia active:scale-[0.98] ${FOCO}`}
          >
            {CHAT.volver}
          </button>
        </div>
      </m.div>
    </div>
  );
}

// ── Chat ──────────────────────────────────────────────────────────────────────────────────────────

function Chat({ onClose, cabeceraProps = {}, conAgarradera = false }) {
  const [pantalla, setPantalla] = useState(leerPantalla);
  const [volviDe, setVolviDe] = useState(null); // al volver, el foco va a la opción que se había elegido
  const cuerpo = useRef(null);
  const { data: grupos } = useServiceGroups();
  const servicios = useMemo(
    () => Object.fromEntries((grupos ?? []).flatMap((g) => g.servicios).map((s) => [s.id, s])),
    [grupos],
  );
  const opcion = opcionChat(pantalla);

  useEffect(() => {
    guardarPantalla(pantalla);
    cuerpo.current?.scrollTo({ top: 0 });
  }, [pantalla]);

  return (
    <>
      {/* Cabecera: carita, nombre, "en línea" y cerrar (X grande) */}
      <div {...cabeceraProps} className={`relative shrink-0 border-b border-linea bg-salvia ${cabeceraProps.className ?? ''}`}>
        {conAgarradera && <span aria-hidden="true" className="mx-auto mt-2.5 block h-1.5 w-12 rounded-full bg-verde/20" />}
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="relative shrink-0">
            <Cara tam={44} className="ring-2 ring-crema-card" />
            <span aria-hidden="true" className="absolute right-0 bottom-0 size-3 rounded-full bg-[#3fa66a] ring-2 ring-salvia" />
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <h2 id="chat-mar-titulo" className="relative inline-block font-serif text-[18px] text-tinta">
              {CHAT.nombre}
              <Destellos puntos={DESTELLOS_HEADER} />
            </h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-[14px] font-semibold text-texto-suave">
              <span aria-hidden="true" className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#3fa66a] opacity-50 [animation-duration:2.2s] motion-reduce:hidden" />
                <span className="relative size-2 rounded-full bg-[#3fa66a]" />
              </span>
              {CHAT.estado}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar el chat"
            className={`flex size-11 shrink-0 items-center justify-center rounded-full bg-crema-card text-tinta shadow-suave ring-1 ring-linea transition hover:bg-salvia-media/40 active:scale-90 ${FOCO}`}
          >
            <Icon name="cerrar" size={24} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 bg-arena">
        <PatronRulos />
        <div ref={cuerpo} className="relative h-full overflow-x-hidden overflow-y-auto overscroll-contain">
          {opcion ? (
            <Respuesta
              key={opcion.id}
              opcion={opcion}
              servicios={servicios}
              onNavegar={onClose}
              onVolver={() => {
                setVolviDe(opcion.id);
                setPantalla(null);
              }}
            />
          ) : (
            <Inicio key="inicio" enfocar={volviDe} onElegir={setPantalla} />
          )}
        </div>
      </div>
    </>
  );
}

// ── Contenedores ──────────────────────────────────────────────────────────────────────────────────

/**
 * Mobile: bottom sheet (85% del alto). El bottom nav se esconde mientras está abierto (más lugar, menos
 * cosas en pantalla). Se cierra con la X, tocando afuera o con Esc (también deslizando la cabecera, pero
 * nada depende de deslizar).
 */
function SheetMobile({ onClose }) {
  const reducido = useReducedMotion();
  const ref = useRef(null);
  const controles = useDragControls();
  useFocusTrap(ref, onClose, true, { enfocarContenedor: true });
  useBloquearScroll();
  useOcultarBottomNav();

  const empezarArrastre = (e) => {
    if (!reducido && !e.target.closest('a, button')) controles.start(e);
  };

  return (
    <div className="fixed inset-0 z-[41]">
      <m.div
        aria-hidden="true"
        className="absolute inset-0 bg-arena/40 backdrop-blur-[3px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />
      <m.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-mar-titulo"
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 flex h-[85dvh] flex-col overflow-hidden rounded-t-4xl bg-crema-card pb-[env(safe-area-inset-bottom)] shadow-flotante outline-none"
        initial={reducido ? { opacity: 0 } : { y: '100%' }}
        animate={reducido ? { opacity: 1 } : { y: 0 }}
        exit={reducido ? { opacity: 0 } : { y: '100%' }}
        transition={reducido ? { duration: 0.25 } : { type: 'spring', damping: 32, stiffness: 300 }}
        drag={reducido ? false : 'y'}
        dragListener={false}
        dragControls={controles}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => (info.offset.y > 110 || info.velocity.y > 600) && onClose()}
      >
        <Chat onClose={onClose} conAgarradera cabeceraProps={{ className: 'touch-none', onPointerDown: empezarArrastre }} />
      </m.div>
    </div>
  );
}

/**
 * Desktop: ventana de chat (400×600) en la esquina de abajo a la derecha. La mini Mar flotante se oculta
 * mientras está abierta (la de adentro la reemplaza). Se cierra con la X, Esc o tocando afuera.
 */
function VentanaDesktop({ onClose }) {
  const ref = useRef(null);
  useFocusTrap(ref, onClose, true, { enfocarContenedor: true });

  useEffect(() => {
    const afuera = (e) => {
      if (ref.current?.contains(e.target) || e.target.closest?.('[data-mini-mar]')) return;
      onClose();
    };
    document.addEventListener('pointerdown', afuera);
    return () => document.removeEventListener('pointerdown', afuera);
  }, [onClose]);

  return (
    <m.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-mar-titulo"
      tabIndex={-1}
      className="fixed right-6 bottom-6 z-[42] flex w-[400px] flex-col overflow-hidden rounded-4xl bg-crema-card shadow-flotante ring-1 ring-linea outline-none"
      style={{ height: 'min(600px, calc(100dvh - 3rem))', transformOrigin: '100% 100%' }}
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 12, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
    >
      <Chat onClose={onClose} />
    </m.div>
  );
}

/**
 * Chat de mini Mar (chunk aparte: lo cargan MiniMarMobile y MiniMar al abrir, y lo precargan en idle).
 * Un paso a la vez, con botones grandes: inicio (mini Mar saluda + 6 opciones) → la respuesta de la
 * opción elegida (mensaje, un botón principal y "Volver a las opciones"). Textos en src/config/chat.js.
 * La pantalla en la que quedó se recuerda en la sesión.
 */
export default function ChatMar({ modo, onClose }) {
  return modo === 'ventana' ? <VentanaDesktop onClose={onClose} /> : <SheetMobile onClose={onClose} />;
}
