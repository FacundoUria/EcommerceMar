// Piezas del panel. Pensado para una persona mayor y desde el celular: letra ≥ 16 px (casi todo 17–18),
// botones de 48–56 px de alto, un solo botón principal por pantalla, textos cortos y claros.
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';

export const ENTRADA =
  'block min-h-12 w-full rounded-xl border border-tinta/25 bg-white px-4 py-3 text-[17px] text-tinta placeholder:text-texto-suave/70 focus:border-verde focus:outline-2 focus:outline-offset-1 focus:outline-verde aria-[invalid=true]:border-red-700';

const VARIANTES = {
  primario: 'btn-primario text-arena',
  secundario: 'border-2 border-verde bg-white text-verde hover:bg-salvia',
  peligro: 'border-2 border-red-700 bg-white text-red-800 hover:bg-red-50',
  peligroLleno: 'bg-red-700 text-white hover:bg-red-800',
  suave: 'bg-salvia text-tinta hover:bg-salvia-media',
};

export function Boton({ variante = 'primario', grande = false, ancho = false, className = '', children, ...rest }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 font-bold transition select-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
        grande ? 'min-h-14 text-lg' : 'min-h-12 text-[17px]'
      } ${ancho ? 'w-full' : ''} ${VARIANTES[variante]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Etiqueta + campo + ayuda + error. `children(id, props)` dibuja el campo con el id y los aria correctos. */
export function Campo({ etiqueta, ayuda, error, opcional = false, children }) {
  const id = useId();
  const idAyuda = `${id}-ayuda`;
  const idError = `${id}-error`;
  const describe = [ayuda && idAyuda, error && idError].filter(Boolean).join(' ') || undefined;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[17px] font-bold text-tinta">
        {etiqueta}
        {opcional && <span className="ml-1.5 font-normal text-texto-suave">(opcional)</span>}
      </label>
      {ayuda && (
        <p id={idAyuda} className="text-base text-texto-suave">
          {ayuda}
        </p>
      )}
      {children(id, { 'aria-describedby': describe, 'aria-invalid': error ? true : undefined })}
      {error && (
        <p id={idError} className="text-base font-semibold text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}

/** Campo de precio con "$" adelante. `valor` es el texto ("15.000"). */
export function EntradaPrecio({ valor, onCambio, placeholder, ...rest }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[17px] text-texto-suave">$</span>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        className={`${ENTRADA} pl-9 tabular-nums`}
        value={valor}
        placeholder={placeholder}
        onChange={(e) => onCambio(e.target.value.replace(/[^\d.]/g, ''))}
        onBlur={(e) => {
          const d = e.target.value.replace(/\D/g, '');
          onCambio(d ? new Intl.NumberFormat('es-AR').format(Number(d)) : '');
        }}
        {...rest}
      />
    </div>
  );
}

/** Interruptor grande (role="switch"): toda la fila es tocable. */
export function Interruptor({ activo, onCambio, etiqueta, descripcion, textoSi = 'Sí', textoNo = 'No' }) {
  const id = useId();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-describedby={descripcion ? `${id}-d` : undefined}
      onClick={() => onCambio(!activo)}
      className={`flex min-h-16 w-full items-center gap-4 rounded-2xl border-2 px-4 py-3 text-left transition ${
        activo ? 'border-verde bg-salvia' : 'border-tinta/20 bg-white'
      }`}
    >
      <span className="flex-1">
        <span className="block text-[17px] font-bold text-tinta">{etiqueta}</span>
        {descripcion && (
          <span id={`${id}-d`} className="block text-base text-texto-suave">
            {descripcion}
          </span>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <span className={`text-base font-bold ${activo ? 'text-verde' : 'text-texto-suave'}`}>{activo ? textoSi : textoNo}</span>
        <span className={`relative h-8 w-14 rounded-full transition ${activo ? 'bg-verde' : 'bg-tinta/30'}`} aria-hidden="true">
          <span className={`absolute top-1 size-6 rounded-full bg-white shadow transition-[left] ${activo ? 'left-7' : 'left-1'}`} />
        </span>
      </span>
    </button>
  );
}

/** "Visible" (verde) / "Oculto" (gris). */
export function Insignia({ visible }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[15px] font-bold ${
        visible ? 'bg-salvia text-verde' : 'bg-tinta/10 text-texto-suave'
      }`}
    >
      {visible ? 'Visible' : 'Oculto'}
    </span>
  );
}

/** Diálogo modal (<dialog> nativo: atrapa el foco y se cierra con Esc). */
export function Dialogo({ abierto, onCerrar, titulo, children, acciones }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierto && !d.open) d.showModal();
    if (!abierto && d.open) d.close();
  }, [abierto]);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onCerrar?.();
      }}
      aria-labelledby={titulo ? 'dialogo-titulo' : undefined}
      className="m-auto w-[min(100vw-2rem,30rem)] rounded-3xl bg-crema-card p-0 text-tinta shadow-2xl backdrop:bg-tinta/50"
    >
      {abierto && (
        <div className="space-y-5 p-6">
          {titulo && (
            <h2 id="dialogo-titulo" className="font-serif text-2xl leading-tight">
              {titulo}
            </h2>
          )}
          <div className="space-y-3 text-[17px] leading-relaxed">{children}</div>
          {acciones && <div className="flex flex-col gap-3">{acciones}</div>}
        </div>
      )}
    </dialog>
  );
}

/** Ruedita + texto. */
export function Cargando({ texto = 'Cargando…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-lg text-texto-suave" role="status">
      <span className="size-6 animate-spin rounded-full border-[3px] border-verde/25 border-t-verde" aria-hidden="true" />
      {texto}
    </div>
  );
}

// ───────── Avisos ("Guardado ✓", errores) ─────────

const AvisosContext = createContext(null);
export const useAvisos = () => useContext(AvisosContext);

export function AvisosProvider({ children }) {
  const [aviso, setAviso] = useState(null);
  const timer = useRef(null);
  const mostrar = useCallback((texto, tipo = 'ok') => {
    clearTimeout(timer.current);
    setAviso({ texto, tipo, n: Date.now() });
    timer.current = setTimeout(() => setAviso(null), tipo === 'error' ? 8000 : 3500);
  }, []);
  // El aviso visible va en un popover (capa superior): así queda arriba también de un diálogo abierto, que si
  // no lo taparía con su velo. Los lectores de pantalla lo leen de la región role="status" (siempre en el DOM).
  const capa = useRef(null);
  useEffect(() => {
    const el = capa.current;
    if (!el?.showPopover) return;
    if (el.matches(':popover-open')) el.hidePopover();
    if (aviso) el.showPopover(); // reabrirlo lo pone encima de lo último abierto
  }, [aviso]);
  return (
    <AvisosContext.Provider value={mostrar}>
      {children}
      <div className="sr-only" role="status" aria-live="polite">
        {aviso?.texto}
      </div>
      <div
        ref={capa}
        popover="manual"
        className="pointer-events-none inset-x-0 top-3 bottom-auto m-0 w-full overflow-visible border-0 bg-transparent p-0 px-4 open:flex open:justify-center"
      >
        {aviso && (
          <div
            key={aviso.n}
            className={`pointer-events-auto flex max-w-md items-start gap-3 rounded-2xl px-5 py-4 text-[17px] font-bold shadow-2xl ${
              aviso.tipo === 'error' ? 'bg-red-800 text-white' : 'bg-verde text-arena'
            }`}
          >
            <span className="flex-1" aria-hidden="true">
              {aviso.texto}
            </span>
            <button type="button" onClick={() => setAviso(null)} className="-my-1 -mr-2 min-h-10 min-w-10 rounded-full text-xl" aria-label="Cerrar aviso">
              ×
            </button>
          </div>
        )}
      </div>
    </AvisosContext.Provider>
  );
}
