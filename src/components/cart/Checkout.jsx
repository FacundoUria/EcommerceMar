import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m, useDragControls, useReducedMotion } from 'motion/react';
import { useNavigate } from 'react-router';
import Icon from '../ui/Icon.jsx';
import Roll from '../ui/Roll.jsx';
import FotoProducto from '../product/FotoProducto.jsx';
import Destellos from '../marca/Destellos.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';
import { useFocusTrap } from '../../hooks/useFocusTrap.js';
import { useOcultarBottomNav } from '../../hooks/useOcultarBottomNav.js';
import { useBloquearScroll } from '../../hooks/useBloquearScroll.js';
import { formatPrecio, plural } from '../../lib/format.js';
import { fuenteImagen } from '../../lib/imagenes.js';
import { explotarDestellos } from '../../lib/destellos.js';
import { copiarTexto } from '../../lib/copiar.js';
import { campanaActiva } from '../../lib/promo.js';
import { CAMPANA } from '../../config/promo.js';
import { DEPARTAMENTOS_ENVIO, NOTA_ENVIOS, departamentoEnvio, localidadesDe } from '../../config/envios.js';
import {
  LARGO_MAXIMO,
  armarMensaje,
  envioDe,
  guardarDatos,
  leerDatosGuardados,
  linkPedido,
  numeroPedido,
  validarDatos,
} from '../../lib/pedido.js';

const EASE = [0.22, 1, 0.36, 1];
const FIGURA = '/img/marca/mini-mar.webp';
const PAGOS = ['Efectivo', 'Transferencia', 'Tarjeta'];
const ENTREGAS = [
  { id: 'envio', titulo: 'Envío a domicilio', icono: 'camionFino' },
  { id: 'retiro', titulo: 'Retiro en el estudio', icono: 'local' },
];
// Orden de los campos obligatorios (al enviar con errores, el foco va al primero)
const OBLIGATORIOS = ['nombre', 'entrega', 'departamento', 'localidad', 'direccion'];
// Errores que se borran al cambiar un campo (cambiar la entrega o el departamento invalida lo que depende de eso)
const BORRA_ERRORES = {
  entrega: ['entrega', 'departamento', 'localidad', 'direccion'],
  departamento: ['departamento', 'localidad'],
};

const ETIQUETA = 'mb-1.5 block text-sm font-bold text-tinta';
const campoClase = (error) =>
  `w-full rounded-2xl border bg-arena/60 px-4 text-[16px] text-tinta transition-colors outline-none placeholder:text-texto-suave focus:bg-crema-card focus:ring-4 ${
    error ? 'border-red-700 focus:ring-red-700/10' : 'border-linea focus:border-verde focus:ring-verde/10'
  }`;

/** Abre WhatsApp en otra pestaña (en el celu, la app). Si el navegador lo bloquea, va en la misma. */
function abrirWhatsApp(url) {
  const w = window.open(url, '_blank');
  if (w) w.opener = null;
  else window.location.href = url;
}

/**
 * Checkout por WhatsApp (decisión de Mar: no hay pago online). Paso de datos → mensaje con el pedido a su
 * WhatsApp → confirmación. Bottom-sheet en mobile (arrastrable para cerrar), panel lateral en desktop.
 * El carrito NO se vacía solo: recién con "Ya lo envié".
 */
export default function Checkout({ onClose }) {
  const { lineas, cantidadTotal, total, vaciar } = useCart();
  // Con algún producto en promo durante la campaña (Black Friday): solo efectivo o transferencia
  const conPromo = campanaActiva() && lineas.some((l) => l.promo);
  const pagos = conPromo ? CAMPANA.pagos : PAGOS;
  const { mostrarToast } = useUI();
  const navigate = useNavigate();
  const desktop = useMediaQuery('(min-width: 768px)');
  const reducido = useReducedMotion();
  const ref = useRef(null);
  const nombreRef = useRef(null);
  const controles = useDragControls();
  const [numero] = useState(numeroPedido);
  const [datos, setDatos] = useState(() => ({
    nombre: '',
    entrega: '',
    direccion: '',
    departamento: '',
    localidad: '',
    pago: '',
    nota: '',
    ...leerDatosGuardados(),
  }));
  // Retiro (o envío sin localidad elegida) = null: el total queda sin envío
  const envio = envioDe(datos);
  const costoEnvio = envio?.precio ?? null;
  const deptoElegido = departamentoEnvio(datos.departamento);
  const localidades = localidadesDe(deptoElegido);
  const [errores, setErrores] = useState({});
  const [enviado, setEnviado] = useState(null); // { mensaje, url } después de tocar "Enviar"
  useFocusTrap(ref, onClose, true, { enfocarContenedor: true });
  useOcultarBottomNav();
  useBloquearScroll();

  // Desktop: el foco va al primer campo. Mobile: al diálogo (si no, el teclado tapa medio sheet al abrir)
  useEffect(() => {
    if (desktop) nombreRef.current?.focus({ preventScroll: true });
    // la figura de la confirmación, ya bajada
    new Image().src = fuenteImagen(FIGURA, 320 * Math.min(window.devicePixelRatio || 1, 2)).src;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si el carrito se vacía (otra pestaña), no hay pedido que mandar
  useEffect(() => {
    if (!lineas.length && !enviado) onClose();
  }, [lineas.length, enviado, onClose]);

  const set = (campo, valor) => {
    setDatos((d) => ({
      ...d,
      [campo]: valor,
      // Otro departamento = otras localidades: hay que volver a elegir
      ...(campo === 'departamento' && valor !== d.departamento ? { localidad: '' } : null),
    }));
    setErrores((e) => {
      const borrar = BORRA_ERRORES[campo] ?? [campo];
      if (!borrar.some((k) => e[k])) return e;
      const resto = { ...e };
      borrar.forEach((k) => delete resto[k]);
      return resto;
    });
  };

  const enviar = (e) => {
    e.preventDefault();
    const errs = validarDatos(datos);
    setErrores(errs);
    const primero = OBLIGATORIOS.find((k) => errs[k]);
    if (primero) {
      const el = ref.current?.querySelector(`[data-campo="${primero}"]`);
      el?.focus({ preventScroll: true });
      (el?.closest('[data-bloque]') ?? el)?.scrollIntoView({ block: 'center', behavior: reducido ? 'auto' : 'smooth' });
      return;
    }
    guardarDatos(datos);
    const mensaje = armarMensaje({
      lineas,
      datos: { ...datos, pago: pagos.includes(datos.pago) ? datos.pago : '' },
      numero,
      encabezado: conPromo ? CAMPANA.encabezadoPedido : null,
    });
    const url = linkPedido(mensaje);
    explotarDestellos(e.nativeEvent?.submitter);
    abrirWhatsApp(url);
    setEnviado({ mensaje, url });
  };

  const yaLoEnvie = () => {
    vaciar();
    onClose();
    navigate('/');
    mostrarToast({
      titulo: '¡Gracias por tu pedido!',
      texto: `Pedido ${numero} · Mar te responde por WhatsApp`,
      imagen: '/img/marca/mini-mar-cara.webp',
      duracion: 4500,
    });
  };

  const anim = reducido
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : desktop
      ? { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } }
      : { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } };

  // Arrastrar desde la agarradera o la fila del título (no desde el botón de cerrar)
  const empezarArrastre = (e) => {
    if (!desktop && !reducido && !e.target.closest('button')) controles.start(e);
  };

  return (
    <div className="fixed inset-0 z-[75] flex items-end md:block">
      <m.div className="velo absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <m.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-titulo"
        tabIndex={-1}
        {...anim}
        transition={{ type: 'spring', damping: 32, stiffness: 300 }}
        drag={desktop || reducido ? false : 'y'}
        dragListener={false}
        dragControls={controles}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 120 || info.velocity.y > 600) onClose();
        }}
        className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-5xl bg-crema-card shadow-flotante outline-none md:absolute md:inset-y-0 md:right-0 md:max-h-none md:max-w-md md:rounded-l-5xl md:rounded-tr-none"
      >
        <div className="flex shrink-0 touch-none flex-col md:touch-auto" onPointerDown={empezarArrastre}>
          <span aria-hidden="true" className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-verde/20 md:hidden" />
          <div className="flex items-center justify-between px-6 pt-2 pb-3 md:pt-6">
            {enviado ? <span /> : (
              <h2 id="checkout-titulo" className="text-2xl">
                Tus datos
              </h2>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="flex size-10 items-center justify-center rounded-full text-tinta transition hover:rotate-90 hover:bg-salvia active:scale-90"
            >
              <Icon name="cerrar" />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {enviado ? (
            <Confirmacion key="listo" numero={numero} mensaje={enviado.mensaje} onListo={yaLoEnvie} onReabrir={() => abrirWhatsApp(enviado.url)} />
          ) : (
            <m.form
              key="datos"
              noValidate
              onSubmit={enviar}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-6 pt-1 pb-6">
                <Campo id="nombre" etiqueta="Nombre y apellido" error={errores.nombre}>
                  {(aria) => (
                    <input
                      ref={nombreRef}
                      {...aria}
                      type="text"
                      autoComplete="name"
                      enterKeyHint="next"
                      maxLength={80}
                      value={datos.nombre}
                      onChange={(e) => set('nombre', e.target.value)}
                      className={`h-12 ${campoClase(errores.nombre)}`}
                    />
                  )}
                </Campo>

                <fieldset data-bloque>
                  <legend className={ETIQUETA}>Entrega</legend>
                  <div className="grid grid-cols-2 gap-2.5">
                    {ENTREGAS.map((o, i) => {
                      const sel = datos.entrega === o.id;
                      return (
                        <label
                          key={o.id}
                          className={`relative flex cursor-pointer flex-col gap-2.5 rounded-3xl border p-4 transition duration-200 active:scale-[0.98] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-verde ${
                            sel
                              ? 'border-verde bg-salvia text-verde shadow-suave'
                              : errores.entrega
                                ? 'border-red-700 bg-crema-card text-tinta'
                                : 'border-linea bg-arena/60 text-tinta hover:border-verde/40'
                          }`}
                        >
                          <input
                            type="radio"
                            name="entrega"
                            value={o.id}
                            checked={sel}
                            onChange={() => set('entrega', o.id)}
                            data-campo={i === 0 ? 'entrega' : undefined}
                            aria-invalid={errores.entrega ? true : undefined}
                            aria-describedby={errores.entrega ? 'checkout-error-entrega' : undefined}
                            className="sr-only"
                          />
                          <Icon name={o.icono} size={26} strokeWidth={1.6} />
                          <span className="pr-4 text-sm leading-tight font-bold">{o.titulo}</span>
                          <span
                            aria-hidden="true"
                            className={`absolute top-3 right-3 flex size-5 items-center justify-center rounded-full border transition ${
                              sel ? 'scale-100 border-verde bg-verde text-arena' : 'scale-90 border-tinta/20'
                            }`}
                          >
                            {sel && <Icon name="check" size={13} strokeWidth={3} />}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <ErrorCampo id="checkout-error-entrega" texto={errores.entrega} />

                  <AnimatePresence initial={false} mode="wait">
                    {datos.entrega === 'envio' && (
                      // Departamento → localidad (con el precio de su zona) → dirección, todo a la vista
                      <Desplegable key="envio" className="pt-5">
                        <Campo id="departamento" etiqueta="Departamento" error={errores.departamento}>
                          {(aria) => (
                            <span className="relative block">
                              <select
                                {...aria}
                                value={deptoElegido?.id ?? ''}
                                onChange={(e) => set('departamento', e.target.value)}
                                className={`h-14 appearance-none pr-11 text-[17px] ${campoClase(errores.departamento)} ${deptoElegido ? '' : 'text-texto-suave'}`}
                              >
                                <option value="" disabled>
                                  Elegí uno
                                </option>
                                {DEPARTAMENTOS_ENVIO.map((d) => (
                                  <option key={d.id} value={d.id} className="text-tinta">
                                    {d.nombre}
                                  </option>
                                ))}
                              </select>
                              <Icon name="abajo" size={20} className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-texto-suave" />
                            </span>
                          )}
                        </Campo>

                        <AnimatePresence initial={false} mode="wait">
                          {deptoElegido && (
                            <Desplegable key={deptoElegido.id} className="pt-5">
                              {localidades.length ? (
                                <fieldset data-bloque>
                                  <legend className={ETIQUETA}>Localidad o barrio</legend>
                                  <div className="grid gap-2">
                                    {localidades.map((l, i) => (
                                      <OpcionLocalidad
                                        key={l.id}
                                        localidad={l}
                                        seleccionada={datos.localidad === l.id}
                                        error={errores.localidad}
                                        primera={i === 0}
                                        onElegir={() => set('localidad', l.id)}
                                      />
                                    ))}
                                  </div>
                                  <ErrorCampo id="checkout-error-localidad" texto={errores.localidad} />
                                  <p className="mt-3 text-xs leading-relaxed text-texto-suave">{NOTA_ENVIOS}</p>
                                </fieldset>
                              ) : (
                                <p className="flex items-center gap-3 rounded-3xl bg-salvia/70 px-4 py-3.5 text-[15px] text-tinta">
                                  <Icon name="camionFino" size={22} strokeWidth={1.6} className="shrink-0 text-verde" />
                                  El envío a {deptoElegido.nombre} lo coordinás con Mar
                                </p>
                              )}
                            </Desplegable>
                          )}
                        </AnimatePresence>

                        <div className="pt-5">
                          <Campo id="direccion" etiqueta="Dirección" error={errores.direccion}>
                            {(aria) => (
                              <input
                                {...aria}
                                type="text"
                                autoComplete="street-address"
                                enterKeyHint="next"
                                maxLength={120}
                                placeholder="Calle, número, piso"
                                value={datos.direccion}
                                onChange={(e) => set('direccion', e.target.value)}
                                className={`h-12 ${campoClase(errores.direccion)}`}
                              />
                            )}
                          </Campo>
                        </div>
                      </Desplegable>
                    )}
                    {datos.entrega === 'retiro' && (
                      <m.p
                        key="retiro"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, transition: { duration: 0.15 } }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="mt-3 text-xs text-texto-suave"
                      >
                        Mar te pasa la dirección y el horario por WhatsApp
                      </m.p>
                    )}
                  </AnimatePresence>
                </fieldset>

                <fieldset>
                  <legend className={ETIQUETA}>
                    Forma de pago <Opcional />
                  </legend>
                  {conPromo && (
                    <p className="mb-2.5 flex items-start gap-2 rounded-2xl bg-salvia px-3 py-2.5 text-sm font-semibold text-tinta" role="note">
                      <span aria-hidden="true">🖤</span>
                      {CAMPANA.avisoPago}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {pagos.map((p) => {
                      const sel = datos.pago === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          aria-pressed={sel}
                          onClick={() => set('pago', sel ? '' : p)}
                          className={`chip ${sel ? 'border-verde bg-salvia text-verde' : 'border-linea bg-arena/60 text-tinta hover:border-verde/40'}`}
                        >
                          {sel && <Icon name="check" size={14} strokeWidth={2.6} />}
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <Campo id="nota" etiqueta={<>Nota <Opcional /></>}>
                  {(aria) => (
                    <textarea
                      {...aria}
                      rows={2}
                      maxLength={300}
                      placeholder="¿Algo más que quieras contarle a Mar?"
                      value={datos.nota}
                      onChange={(e) => set('nota', e.target.value)}
                      className={`block resize-none py-3 ${campoClase(false)}`}
                    />
                  )}
                </Campo>
              </div>

              <div className="shrink-0 border-t border-linea bg-arena px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                {/* Con localidad elegida: subtotal + envío arriba y el total ya con el envío */}
                <div aria-live="polite">
                  <AnimatePresence initial={false}>
                    {costoEnvio != null && (
                      <Desplegable key="subtotal" className="pb-1">
                        <FilaResumen etiqueta={`Subtotal (${plural(cantidadTotal, 'producto', 'productos')})`}>
                          <span className="precio">{formatPrecio(total)}</span>
                        </FilaResumen>
                      </Desplegable>
                    )}
                    {envio && (
                      <Desplegable key="envio" className="pb-2.5">
                        <FilaResumen etiqueta="Envío">
                          {costoEnvio != null ? <span className="precio">{formatPrecio(costoEnvio)}</span> : 'a coordinar con Mar'}
                        </FilaResumen>
                      </Desplegable>
                    )}
                  </AnimatePresence>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2.5">
                      <Miniaturas lineas={lineas} />
                      {costoEnvio != null ? (
                        <span className="text-sm font-bold text-tinta">Total con envío</span>
                      ) : (
                        <span className="text-sm text-texto-suave">{plural(cantidadTotal, 'producto', 'productos')}</span>
                      )}
                    </span>
                    <span className="precio text-2xl text-tinta">{formatPrecio(total + (costoEnvio ?? 0))}</span>
                  </div>
                </div>
                <p className="mt-1.5 text-[11px] text-texto-suave">Precios y stock sujetos a confirmación de Mar</p>
                <button type="submit" className="btn btn-primario mt-3 w-full">
                  <Roll>
                    <Icon name="whatsapp" size={20} /> Enviar pedido por WhatsApp
                  </Roll>
                </button>
              </div>
            </m.form>
          )}
        </AnimatePresence>
      </m.div>
    </div>
  );
}

function Opcional() {
  return <span className="ml-1 text-xs font-medium text-texto-suave">(opcional)</span>;
}

/**
 * Bloque que se despliega animando el alto (excepción pedida a "solo transform/opacity": lo de abajo
 * acompaña). Movimiento reducido: solo fade. El margen negativo + padding deja lugar a los anillos de foco.
 */
function Desplegable({ children, className = '' }) {
  const reducido = useReducedMotion();
  const cerrado = reducido ? { opacity: 0 } : { height: 0, opacity: 0 };
  return (
    <m.div
      initial={cerrado}
      animate={reducido ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
      exit={{ ...cerrado, transition: { duration: 0.25, ease: EASE } }}
      transition={{ duration: 0.45, ease: EASE }}
      className="-mx-1.5 overflow-hidden px-1.5"
    >
      <div className={`pb-1.5 ${className}`}>{children}</div>
    </m.div>
  );
}

/** Localidad o barrio: botón grande con el nombre y el precio de su zona (o "A coordinar"). */
function OpcionLocalidad({ localidad, seleccionada, error, primera, onElegir }) {
  const conPrecio = localidad.precio != null;
  return (
    <label
      className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-3xl border px-4 py-3 transition duration-200 active:scale-[0.98] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-verde ${
        seleccionada
          ? 'border-verde bg-salvia text-verde shadow-suave'
          : error
            ? 'border-red-700 bg-crema-card text-tinta'
            : 'border-linea bg-arena/60 text-tinta hover:border-verde/40'
      }`}
    >
      <input
        type="radio"
        name="localidad"
        value={localidad.id}
        checked={seleccionada}
        onChange={onElegir}
        data-campo={primera ? 'localidad' : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? 'checkout-error-localidad' : undefined}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition ${
          seleccionada ? 'scale-100 border-verde bg-verde text-arena' : 'scale-90 border-tinta/25 bg-crema-card'
        }`}
      >
        {seleccionada && <Icon name="check" size={14} strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1 text-base leading-snug font-semibold">{localidad.nombre}</span>
      {conPrecio ? (
        <span className="precio shrink-0 text-[17px]">{formatPrecio(localidad.precio)}</span>
      ) : (
        <span className={`shrink-0 text-sm font-semibold ${seleccionada ? '' : 'text-texto-suave'}`}>A coordinar</span>
      )}
    </label>
  );
}

function FilaResumen({ etiqueta, children }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-texto-suave">{etiqueta}</span>
      <span className="font-semibold text-tinta">{children}</span>
    </div>
  );
}

/** Etiqueta + campo + error. `children(aria)` recibe id/aria-invalid/aria-describedby/data-campo. */
function Campo({ id, etiqueta, error, children }) {
  const idCampo = `checkout-${id}`;
  const idError = `${idCampo}-error`;
  return (
    <div data-bloque>
      <label htmlFor={idCampo} className={ETIQUETA}>
        {etiqueta}
      </label>
      {children({
        id: idCampo,
        'data-campo': id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? idError : undefined,
      })}
      <ErrorCampo id={idError} texto={error} />
    </div>
  );
}

function ErrorCampo({ id, texto }) {
  return (
    <AnimatePresence initial={false}>
      {texto && (
        <m.p
          key={texto}
          id={id}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-1.5 text-xs font-semibold text-red-700"
        >
          {texto}
        </m.p>
      )}
    </AnimatePresence>
  );
}

/** Hasta 3 fotos de los productos, encimadas (+N si hay más). */
function Miniaturas({ lineas }) {
  const vistas = lineas.slice(0, 3);
  const resto = lineas.length - vistas.length;
  return (
    <span aria-hidden="true" className="flex shrink-0 -space-x-2.5">
      {vistas.map((l) => (
        <span key={l.clave} className="relative size-9 overflow-hidden rounded-full ring-2 ring-arena">
          <FotoProducto src={l.imagen} sizes="36px" placeholderTitulo={l.nombre} zoom={false} halo={false} compacta />
        </span>
      ))}
      {resto > 0 && (
        <span className="relative flex size-9 items-center justify-center rounded-full bg-salvia text-xs font-bold text-verde ring-2 ring-arena">
          +{resto}
        </span>
      )}
    </span>
  );
}

const PUNTOS_FIGURA = [
  { x: '2%', y: '22%', tam: 14 },
  { x: '92%', y: '14%', tam: 18 },
  { x: '98%', y: '60%', tam: 10 },
  { x: '-4%', y: '66%', tam: 9 },
];

/** Pantalla de confirmación: mini Mar, el número de pedido y qué sigue. */
function Confirmacion({ numero, mensaje, onListo, onReabrir }) {
  const [copiado, setCopiado] = useState(null); // null | 'ok' | 'error'
  const largo = mensaje.length > LARGO_MAXIMO; // WhatsApp puede cortar el link: además se puede copiar
  const figura = fuenteImagen(FIGURA, 320);
  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center md:justify-center md:pb-16"
    >
      {/* Mini Mar asomando de un círculo salvia (la figura está cortada abajo: el círculo la recorta) */}
      <div className="relative mx-auto h-52 w-44 shrink-0">
        <m.span
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="absolute inset-x-0 bottom-0 aspect-square rounded-full bg-salvia"
        />
        <span className="absolute inset-0 overflow-hidden rounded-b-full">
          <m.img
            src={figura.src}
            srcSet={figura.srcSet}
            sizes="140px"
            alt=""
            width="451"
            height="661"
            initial={{ opacity: 0, y: 70 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 150, delay: 0.12 }}
            // corrida a la derecha: el corte de la imagen (la mano) queda fuera del círculo
            className="absolute bottom-0 left-[30px] h-[200px] w-auto max-w-none"
          />
        </span>
        <Destellos puntos={PUNTOS_FIGURA} />
      </div>

      <h2 id="checkout-titulo" className="mt-5 text-4xl">
        ¡Listo!
      </h2>
      <p className="mx-auto mt-2 max-w-xs text-texto-suave">Mar va a responderte por WhatsApp para coordinar el pago y la entrega 💚</p>
      <p className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-salvia px-4 py-2 text-sm font-semibold text-verde">
        Pedido <span className="precio tracking-wider text-tinta">{numero}</span>
      </p>

      <div className="mt-auto grid gap-2.5 pt-8 md:mt-0">
        <button type="button" onClick={onListo} className="btn btn-primario w-full">
          <Roll>
            <Icon name="check" size={18} strokeWidth={2.4} /> Ya lo envié
          </Roll>
        </button>
        <button type="button" onClick={onReabrir} className="btn btn-borde w-full">
          <Roll>
            <Icon name="whatsapp" size={18} /> Volver a abrir WhatsApp
          </Roll>
        </button>
        {largo && (
          <button
            type="button"
            onClick={async () => setCopiado((await copiarTexto(mensaje)) ? 'ok' : 'error')}
            className="btn w-full text-verde hover:bg-salvia"
          >
            <Icon name={copiado === 'ok' ? 'check' : 'copiar'} size={18} />
            {copiado === 'ok' ? '¡Copiado!' : copiado === 'error' ? 'No se pudo copiar' : 'Copiar pedido'}
          </button>
        )}
      </div>
    </m.div>
  );
}
