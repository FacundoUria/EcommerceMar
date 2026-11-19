import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { AnimatePresence, m, useDragControls, useReducedMotion } from 'motion/react';
import Icon from '../ui/Icon.jsx';
import Destellos from './Destellos.jsx';
import { CHAT, opcionChat } from '../../config/chat.js';
import { whatsappCon } from '../../config/negocio.js';
import { useServiceGroups } from '../../hooks/useCatalog.js';
import { useFocusTrap } from '../../hooks/useFocusTrap.js';
import { useBloquearScroll } from '../../hooks/useBloquearScroll.js';
import { fuenteImagen, imgFija } from '../../lib/imagenes.js';
import { PATH_ESTRELLA, espiral } from '../../lib/rulos.js';
import { ASPECTO, FIGURA } from './miniMarGeo.js';

const EASE = [0.22, 1, 0.36, 1];
const ESCRIBIENDO_MS = 700;
const CLAVE = 'dh-chat';
const CARA = '/img/marca/mini-mar-cara.webp';
const DEGRADE_VERDE = 'linear-gradient(135deg, #3e6450 0%, #2f5240 100%)';
const DESTELLOS_HEADER = [
  { x: '-18%', y: '-14%', tam: 10 },
  { x: '92%', y: '-22%', tam: 8 },
];

const hora = () => new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });

// ── Conversación ────────────────────────────────────────────────────────────────────────────────────
// Mensajes guardados (sessionStorage, con try/catch): solo referencias al guion / a las opciones, los
// textos salen siempre de src/config/chat.js.
//   { id, guion: i, hora }              mensaje i del guion (de Mar o la burbuja de ejemplo)
//   { id, de: 'clienta', opcion, hora } chip que tocó la clienta
//   { id, de: 'mar', opcion, hora }     respuesta de Mar a ese chip

function leer() {
  try {
    const g = JSON.parse(sessionStorage.getItem(CLAVE));
    if (Array.isArray(g?.mensajes)) return g.mensajes.filter((x) => x.guion != null || opcionChat(x.opcion));
  } catch {
    /* sin sessionStorage o dato roto: conversación nueva */
  }
  return [];
}

function guardar(mensajes) {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify({ mensajes }));
  } catch {
    /* sin sessionStorage: no se recuerda */
  }
}

/** Lo que falta mostrar: el resto del guion o la respuesta a la última pregunta. */
function pendiente(mensajes) {
  const vistos = mensajes.filter((x) => x.guion != null).length;
  if (vistos < CHAT.guion.length) return { guion: vistos, deMar: CHAT.guion[vistos].de === 'mar' };
  const ultimo = mensajes.at(-1);
  if (ultimo?.de === 'clienta') return { de: 'mar', opcion: ultimo.opcion, deMar: true };
  return null;
}

function useConversacion() {
  const reducido = useReducedMotion();
  const [mensajes, setMensajes] = useState(leer);
  const [escribiendo, setEscribiendo] = useState(false);
  const siguienteId = useRef(mensajes.reduce((n, x) => Math.max(n, x.id + 1), 0));
  const falta = pendiente(mensajes);

  useEffect(() => guardar(mensajes), [mensajes]);

  // Va mostrando lo pendiente de a un mensaje: "escribiendo…" ~700 ms antes de cada mensaje de Mar (pausa
  // igual antes de la burbuja de ejemplo). Movimiento reducido: sin "escribiendo…", aparecen directo.
  useEffect(() => {
    const p = pendiente(mensajes);
    if (!p) return;
    const { deMar, ...nuevo } = p;
    if (deMar && !reducido) setEscribiendo(true);
    const t = setTimeout(
      () => {
        setEscribiendo(false);
        setMensajes((prev) => [...prev, { ...nuevo, id: siguienteId.current++, hora: hora() }]);
      },
      reducido ? 60 : ESCRIBIENDO_MS,
    );
    return () => {
      clearTimeout(t);
      setEscribiendo(false);
    };
  }, [mensajes, reducido]);

  const preguntar = (opcion) => {
    if (pendiente(mensajes)) return;
    setMensajes((prev) => [...prev, { id: siguienteId.current++, de: 'clienta', opcion, hora: hora() }]);
  };

  const usados = useMemo(() => new Set(mensajes.filter((x) => x.de === 'clienta').map((x) => x.opcion)), [mensajes]);
  const guionListo = mensajes.filter((x) => x.guion != null).length >= CHAT.guion.length;
  return { mensajes, escribiendo, preguntar, usados, ocupado: !!falta, guionListo };
}

// ── Piezas ──────────────────────────────────────────────────────────────────────────────────────────

// Fondo: rulos y destellos al 5% (como el patrón de corazones del chat de Noé, con la identidad de acá)
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

const entrada = (lado) => ({
  initial: { opacity: 0, y: 10, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.35, ease: EASE },
  style: { transformOrigin: lado === 'izq' ? '0% 100%' : '100% 100%' },
});

function Cara({ tam = 28, className = '' }) {
  return (
    <img
      {...imgFija(CARA, tam)}
      alt=""
      width="192"
      height="192"
      className={`shrink-0 rounded-full bg-arena object-cover ring-2 ring-crema-card ${className}`}
      style={{ width: tam, height: tam }}
    />
  );
}

function Hora({ children, clara = false }) {
  return <span className={`mt-1 block text-right text-[10px] tabular-nums ${clara ? 'text-arena/75' : 'text-texto-suave'}`}>{children}</span>;
}

/** Burbuja de Mar: izquierda, crema, con su carita. */
function BurbujaMar({ hora: h, children }) {
  return (
    <m.div {...entrada('izq')} className="flex items-end gap-2">
      <Cara />
      <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-crema-card px-3.5 pt-2.5 pb-1.5 text-[14px] leading-relaxed text-tinta shadow-suave ring-1 ring-linea">
        <span className="sr-only">Mar: </span>
        {children}
        <Hora>{h}</Hora>
      </div>
    </m.div>
  );
}

/** Burbuja de la clienta: derecha, verde. `ejemplo`: la del guion, más tenue (salvia). */
function BurbujaClienta({ hora: h, ejemplo = false, children }) {
  return (
    <m.div {...entrada('der')} className="flex justify-end">
      <div
        className={`max-w-[82%] rounded-2xl rounded-br-md px-3.5 pt-2 pb-1.5 text-[14px] leading-relaxed ${
          ejemplo ? 'bg-salvia text-tinta ring-1 ring-verde/15' : 'font-semibold text-arena shadow-suave'
        }`}
        style={ejemplo ? undefined : { backgroundImage: DEGRADE_VERDE }}
      >
        <span className="sr-only">{ejemplo ? 'Ejemplo de una clienta: ' : 'Vos: '}</span>
        {children}
        <Hora clara={!ejemplo}>{h}</Hora>
      </div>
    </m.div>
  );
}

function Escribiendo() {
  return (
    <m.div {...entrada('izq')} className="flex items-end gap-2">
      <Cara />
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-crema-card px-4 py-3.5 shadow-suave ring-1 ring-linea" aria-hidden="true">
        {[0, 150, 300].map((d) => (
          <span key={d} className="escribiendo-punto block size-1.5 rounded-full bg-verde/60" style={{ animationDelay: `${d}ms` }} />
        ))}
      </div>
      <span className="sr-only">Mar está escribiendo…</span>
    </m.div>
  );
}

function BotonWhatsApp({ label, mensaje }) {
  return (
    <a
      href={whatsappCon(mensaje)}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2.5 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold text-arena shadow-suave transition hover:shadow-flotante active:scale-95"
      style={{ backgroundImage: DEGRADE_VERDE }}
    >
      <Icon name="whatsapp" size={16} /> {label}
    </a>
  );
}

/** Mini-card de un servicio (foto, nombre, duración y "¡Reservar!" por WhatsApp). */
function ServicioMini({ s }) {
  return (
    <div className="mt-2.5 flex gap-3 rounded-2xl bg-arena/70 p-2 ring-1 ring-linea">
      <img {...imgFija(s.imagen, 72)} alt="" width="72" height="72" className="size-[72px] shrink-0 rounded-xl bg-salvia-media object-cover" />
      <div className="flex min-w-0 flex-1 flex-col items-start">
        <p className="font-serif text-[15px] leading-tight text-tinta">{s.nombre}</p>
        <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-salvia px-2 py-0.5 text-[11px] font-bold text-verde">
          <Icon name="reloj" size={12} strokeWidth={2} />
          <span className="sr-only">Duración:</span> {s.duracion}
        </p>
        <a
          href={whatsappCon(`¡Hola Mar! Quiero reservar: ${s.nombre}`)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`¡Reservar! ${s.nombre} por WhatsApp`}
          className="mt-auto inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-bold text-arena transition active:scale-95"
          style={{ backgroundImage: DEGRADE_VERDE }}
        >
          <Icon name="whatsapp" size={14} /> ¡Reservar!
        </a>
      </div>
    </div>
  );
}

function Respuesta({ opcion, servicios, onNavegar }) {
  const r = opcionChat(opcion)?.respuesta;
  if (!r) return null;
  return (
    <>
      <p>{r.texto}</p>
      {r.servicios?.map((id) => {
        const s = servicios[id];
        return s ? <ServicioMini key={id} s={s} /> : null;
      })}
      {r.whatsapp && <BotonWhatsApp {...r.whatsapp} />}
      {r.boton && (
        <Link
          to={r.boton.to}
          onClick={onNavegar}
          className="mt-2.5 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold text-arena shadow-suave transition hover:shadow-flotante active:scale-95"
          style={{ backgroundImage: DEGRADE_VERDE }}
        >
          {r.boton.label} <Icon name="flecha" size={15} strokeWidth={2.2} />
        </Link>
      )}
      {r.link && (
        <Link to={r.link.to} onClick={onNavegar} className="mt-2 block text-[13px] font-bold text-verde underline-offset-4 hover:underline">
          {r.link.label}
        </Link>
      )}
    </>
  );
}

/** Fila de chips con scroll horizontal (en desktop la rueda del mouse también la mueve). */
function FilaChips({ titulo, opciones, usados, ocupado, onElegir }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || el.scrollWidth <= el.clientWidth) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);
  return (
    <div className="mt-2">
      {titulo && <p className="mb-1 px-1 text-[11px] font-bold text-texto-suave">{titulo}</p>}
      <ul
        ref={ref}
        aria-label={titulo || 'Opciones'}
        className="no-scrollbar -mx-3 flex gap-1.5 overflow-x-auto px-3 pb-0.5 [mask-image:linear-gradient(90deg,transparent,#000_12px,#000_calc(100%-20px),transparent)]"
      >
        {opciones.map((o) => {
          const usado = usados.has(o.id);
          return (
            <li key={o.id} className="shrink-0">
              <button
                type="button"
                disabled={ocupado}
                onClick={() => onElegir(o.id)}
                className={`inline-flex items-center gap-1 rounded-full border border-verde/30 bg-crema-card px-3 py-1.5 text-[13px] font-semibold whitespace-nowrap text-verde transition duration-200 hover:border-verde hover:bg-salvia active:scale-95 disabled:cursor-wait ${
                  usado ? 'opacity-55 hover:opacity-100' : ''
                }`}
              >
                {usado && <Icon name="check" size={13} strokeWidth={2.6} />}
                {o.texto}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── Chat ────────────────────────────────────────────────────────────────────────────────────────────

function Chat({ onClose, cabeceraProps = {}, conAgarradera = false, pieExtra = 0 }) {
  const { mensajes, escribiendo, preguntar, usados, ocupado, guionListo } = useConversacion();
  const reducido = useReducedMotion();
  const log = useRef(null);
  const { data: grupos } = useServiceGroups();
  const servicios = useMemo(
    () => Object.fromEntries((grupos ?? []).flatMap((g) => g.servicios).map((s) => [s.id, s])),
    [grupos],
  );

  // Baja solo al llegar un mensaje (scroll interno del chat). Al abrir, directo al final. Si la respuesta
  // es más alta que lo visible (cards de servicios en un celu chico), queda a la vista su comienzo.
  const primera = useRef(true);
  useEffect(() => {
    const box = log.current;
    if (!box) return;
    const ultimo = box.lastElementChild;
    const alto = ultimo && !primera.current && ultimo.offsetHeight > box.clientHeight - 24;
    const top = alto ? ultimo.offsetTop - 12 : box.scrollHeight;
    box.scrollTo({ top, behavior: primera.current || reducido ? 'auto' : 'smooth' });
    primera.current = false;
  }, [mensajes.length, escribiendo, reducido]);

  return (
    <>
      {/* Cabecera: carita, nombre, "en línea", WhatsApp y cerrar */}
      <div {...cabeceraProps} className={`relative shrink-0 border-b border-linea bg-salvia ${cabeceraProps.className ?? ''}`}>
        {conAgarradera && <span aria-hidden="true" className="mx-auto mt-2.5 block h-1.5 w-12 rounded-full bg-verde/20" />}
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="relative">
            <Cara tam={42} className="ring-verde/30" />
            <span aria-hidden="true" className="absolute right-0 bottom-0 size-3 rounded-full bg-[#3fa66a] ring-2 ring-salvia" />
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <h2 id="chat-mar-titulo" className="relative inline-block font-serif text-[17px] text-tinta">
              {CHAT.nombre}
              <Destellos puntos={DESTELLOS_HEADER} />
            </h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-texto-suave">
              <span aria-hidden="true" className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#3fa66a] opacity-50 [animation-duration:2.2s] motion-reduce:hidden" />
                <span className="relative size-2 rounded-full bg-[#3fa66a]" />
              </span>
              {CHAT.estado}
            </p>
          </div>
          <a
            href={whatsappCon(CHAT.whatsappHeader)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escribile a Mar por WhatsApp"
            className="flex size-10 items-center justify-center rounded-full text-verde transition hover:bg-salvia-media/50 active:scale-90"
          >
            <Icon name="whatsapp" size={24} />
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar el chat"
            className="flex size-10 items-center justify-center rounded-full text-tinta transition hover:rotate-90 hover:bg-salvia-media/50 active:scale-90"
          >
            <Icon name="cerrar" />
          </button>
        </div>
      </div>

      {/* Conversación */}
      <div className="relative min-h-0 flex-1 bg-arena">
        <PatronRulos />
        <div
          ref={log}
          role="log"
          aria-live="polite"
          aria-label="Conversación con Mar"
          className="relative h-full space-y-3 overflow-x-hidden overflow-y-auto overscroll-contain px-3.5 py-4"
        >
          <AnimatePresence initial={false}>
            {mensajes.map((x) => {
              if (x.guion != null) {
                const g = CHAT.guion[x.guion];
                return g.de === 'mar' ? (
                  <BurbujaMar key={x.id} hora={x.hora}>{g.texto}</BurbujaMar>
                ) : (
                  <BurbujaClienta key={x.id} hora={x.hora} ejemplo>{g.texto}</BurbujaClienta>
                );
              }
              if (x.de === 'clienta') {
                return <BurbujaClienta key={x.id} hora={x.hora}>{opcionChat(x.opcion).texto}</BurbujaClienta>;
              }
              return (
                <BurbujaMar key={x.id} hora={x.hora}>
                  <Respuesta opcion={x.opcion} servicios={servicios} onNavegar={onClose} />
                </BurbujaMar>
              );
            })}
            {escribiendo && <Escribiendo key="escribiendo" />}
          </AnimatePresence>
        </div>
      </div>

      {/* Abajo: input falso, las opciones (siguen disponibles después de cada respuesta) y el pie */}
      <div className="shrink-0 border-t border-linea bg-crema-card px-3 pt-3" style={{ paddingBottom: pieExtra + 8 }}>
        <div aria-hidden="true" className="flex items-center gap-2">
          <div className="flex-1 rounded-full bg-arena px-4 py-2.5 text-sm text-texto-suave">{CHAT.placeholder}</div>
          <div className="flex size-10 items-center justify-center rounded-full text-arena shadow-suave" style={{ backgroundImage: DEGRADE_VERDE }}>
            <Icon name="flecha" size={18} strokeWidth={2.2} />
          </div>
        </div>
        <m.div
          inert={!guionListo}
          initial={false}
          animate={{ opacity: guionListo ? 1 : 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          {CHAT.grupos.map((g) => (
            <FilaChips key={g.titulo || 'principal'} titulo={g.titulo} opciones={g.opciones} usados={usados} ocupado={ocupado} onElegir={preguntar} />
          ))}
        </m.div>
        <a
          href={whatsappCon(CHAT.pie.mensaje)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center justify-center gap-1.5 py-1.5 text-[12px] font-semibold text-texto-suave transition hover:text-verde"
        >
          <Icon name="whatsapp" size={14} className="text-verde" />
          {CHAT.pie.texto}
        </a>
      </div>
    </>
  );
}

// ── Contenedores ────────────────────────────────────────────────────────────────────────────────────

/**
 * Mobile: bottom sheet (~75% del alto) con el chat, apoyado detrás del bottom nav (el botón central
 * queda a la vista y cierra con su X). Mini Mar asoma a la derecha, por encima del borde del sheet.
 * Se cierra con la X, tocando afuera, deslizando hacia abajo (desde la cabecera o el velo), con Esc o
 * con el botón central. `base`: px del borde de abajo al borde de arriba del bottom nav.
 */
function SheetMobile({ onClose, base }) {
  const reducido = useReducedMotion();
  const ref = useRef(null);
  const controles = useDragControls();
  useFocusTrap(ref, onClose, true, { enfocarContenedor: true });
  useBloquearScroll();

  const W = window.innerWidth;
  const alto = Math.round(Math.min(200, W * 0.52));
  const ancho = Math.round(alto * ASPECTO);
  const f = fuenteImagen(FIGURA, ancho * 2);

  const empezarArrastre = (e) => {
    if (!reducido && !e.target.closest('a, button')) controles.start(e);
  };

  return (
    <div className="fixed inset-0 z-[41]">
      <m.div
        aria-hidden="true"
        className="absolute inset-0 touch-none bg-arena/40 backdrop-blur-[3px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        onPanEnd={(_, info) => info.offset.y > 60 && onClose()}
      />
      <m.div
        className="absolute inset-x-0 bottom-0 h-[75dvh]"
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
        {/* Mini Mar asomando por encima del borde, a la derecha (el sheet la tapa de la cintura para abajo) */}
        <m.img
          src={f.src}
          srcSet={f.srcSet}
          sizes={`${ancho}px`}
          alt=""
          width="451"
          height="661"
          draggable="false"
          aria-hidden="true"
          className="pointer-events-none absolute right-3 drop-shadow-[0_10px_18px_rgb(34_56_43/0.2)]"
          style={{ width: ancho, height: alto, bottom: `calc(100% - ${Math.round(alto * 0.5)}px)`, transformOrigin: '50% 100%' }}
          initial={{ y: alto * 0.6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={reducido ? { duration: 0.3 } : { type: 'spring', bounce: 0.35, duration: 0.8, delay: 0.2 }}
        />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-mar-titulo"
          tabIndex={-1}
          className="relative flex h-full flex-col overflow-hidden rounded-t-4xl bg-crema-card shadow-flotante outline-none"
        >
          <Chat
            onClose={onClose}
            conAgarradera
            pieExtra={base}
            cabeceraProps={{ className: 'touch-none', onPointerDown: empezarArrastre }}
          />
        </div>
      </m.div>
    </div>
  );
}

/**
 * Desktop: ventana de chat (~380×540) sobre la esquina, a la izquierda de mini Mar (donde apunta su
 * dedo). `derecha`: px desde el borde derecho de la pantalla. Se cierra con la X, Esc o tocando afuera
 * (afuera = fuera de la ventana y de mini Mar).
 */
function VentanaDesktop({ onClose, derecha }) {
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
      className="fixed bottom-6 z-[42] flex w-[380px] flex-col overflow-hidden rounded-4xl bg-crema-card shadow-flotante ring-1 ring-linea outline-none"
      style={{ right: derecha, height: 'min(540px, calc(100dvh - 7rem))', transformOrigin: '100% 100%' }}
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
 * Chat guiado de mini Mar (chunk aparte: lo cargan MiniMarMobile y MiniMar al abrir, y lo precargan en
 * idle). Preguntas predefinidas como chips: la elegida aparece como mensaje de la clienta, "escribiendo…"
 * y responde Mar; se puede seguir preguntando. Guion y respuestas en src/config/chat.js. La conversación
 * se recuerda en la sesión.
 */
export default function ChatMar({ modo, onClose, base = 76, derecha = 24 }) {
  return modo === 'ventana' ? <VentanaDesktop onClose={onClose} derecha={derecha} /> : <SheetMobile onClose={onClose} base={base} />;
}
