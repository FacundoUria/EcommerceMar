// Piezas compartidas por los formularios del panel.
import { useState } from 'react';
import { Enlace } from './ruta.jsx';
import { Boton, Dialogo, ENTRADA } from './ui.jsx';

/** "← Volver a …" + título + "Ver en la tienda" (pestaña nueva). */
export function EncabezadoForm({ volverA, textoVolver, titulo, enTienda, oculto }) {
  return (
    <div className="space-y-3">
      <Enlace to={volverA} className="inline-flex min-h-12 items-center gap-2 text-[17px] font-bold text-verde underline-offset-4 hover:underline">
        <span aria-hidden="true">←</span> {textoVolver}
      </Enlace>
      <h1 className="font-serif text-3xl leading-tight text-tinta">{titulo}</h1>
      {enTienda &&
        (oculto ? (
          <p className="text-base text-texto-suave">Está oculto: no se ve en la tienda.</p>
        ) : (
          <a
            href={enTienda}
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-12 items-center gap-2 rounded-2xl border-2 border-verde bg-white px-5 text-[17px] font-bold text-verde hover:bg-salvia"
          >
            Ver en la tienda <span aria-hidden="true">↗</span>
          </a>
        ))}
    </div>
  );
}

/** Barra fija abajo con el botón Guardar (siempre a mano, también con el teclado del celu abierto). */
export function BarraGuardar({ sucio, guardando, onGuardar, texto = 'Guardar cambios' }) {
  return (
    // m-0: el space-y-* del formulario le pondría margen abajo y la despegaría del borde de la pantalla
    <div className="fixed inset-x-0 bottom-0 z-30 m-0 border-t border-linea bg-arena/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center gap-3">
        <p className="hidden flex-1 text-base text-texto-suave sm:block" aria-live="polite">
          {guardando ? 'Guardando…' : sucio ? 'Tenés cambios sin guardar' : 'Todo guardado'}
        </p>
        <Boton grande className="flex-1 sm:flex-none sm:px-10" disabled={guardando || !sucio} onClick={onGuardar}>
          {guardando ? 'Guardando…' : sucio ? texto : 'Guardado ✓'}
        </Boton>
      </div>
    </div>
  );
}

/**
 * "Ocultar o borrar": Ocultar (recomendado, reversible) o Borrar para siempre (hay que escribir BORRAR).
 * `onOcultar` puede faltar (ya está oculto).
 */
export function DialogoBorrar({ abierto, onCerrar, nombre, queSeBorra, onOcultar, onBorrar, ocupado }) {
  const [paso, setPaso] = useState('elegir'); // 'elegir' | 'confirmar'
  const [texto, setTexto] = useState('');
  const cerrar = () => {
    setPaso('elegir');
    setTexto('');
    onCerrar();
  };
  const confirmado = texto.trim().toUpperCase() === 'BORRAR';
  return (
    <Dialogo
      abierto={abierto}
      onCerrar={cerrar}
      titulo={paso === 'elegir' ? `¿Qué querés hacer con «${nombre}»?` : '¿Borrar para siempre?'}
      acciones={
        paso === 'elegir' ? (
          <>
            {onOcultar && (
              <>
                <Boton grande ancho disabled={ocupado} onClick={async () => { await onOcultar(); cerrar(); }}>
                  Ocultar (recomendado)
                </Boton>
                <p className="-mt-1 text-base text-texto-suave">Deja de verse en la tienda. Lo podés volver a mostrar cuando quieras.</p>
              </>
            )}
            <Boton variante="peligro" ancho disabled={ocupado} onClick={() => setPaso('confirmar')}>
              Borrar para siempre
            </Boton>
            <Boton variante="suave" ancho onClick={cerrar}>
              Cancelar
            </Boton>
          </>
        ) : (
          <>
            <Boton variante="peligroLleno" grande ancho disabled={!confirmado || ocupado} onClick={onBorrar}>
              {ocupado ? 'Borrando…' : 'Borrar para siempre'}
            </Boton>
            <Boton variante="suave" ancho disabled={ocupado} onClick={cerrar}>
              No, cancelar
            </Boton>
          </>
        )
      }
    >
      {paso === 'confirmar' && (
        <>
          <p>Esto no se puede deshacer. Se borra {queSeBorra}.</p>
          <label className="block space-y-1.5">
            <span className="block font-bold">Para confirmar, escribí BORRAR:</span>
            <input className={ENTRADA} value={texto} onChange={(e) => setTexto(e.target.value)} autoComplete="off" autoCapitalize="characters" />
          </label>
        </>
      )}
    </Dialogo>
  );
}

/** Botones ↑ ↓ para ordenar (grandes, con nombre accesible). */
export function SubirBajar({ nombre, onSubir, onBajar, primero, ultimo, ocupado }) {
  return (
    <span className="flex shrink-0 gap-1.5">
      <Boton variante="suave" className="min-w-12 px-0 text-xl" aria-label={`Subir ${nombre}`} disabled={primero || ocupado} onClick={onSubir}>
        ↑
      </Boton>
      <Boton variante="suave" className="min-w-12 px-0 text-xl" aria-label={`Bajar ${nombre}`} disabled={ultimo || ocupado} onClick={onBajar}>
        ↓
      </Boton>
    </span>
  );
}

/** Error al cargar los datos, con reintentar. */
export function ErrorCarga({ onReintentar }) {
  return (
    <div className="card space-y-4 rounded-3xl p-6 text-center">
      <p className="text-lg">No se pudieron cargar los datos. Revisá la conexión a internet.</p>
      <Boton grande onClick={onReintentar}>
        Probar de nuevo
      </Boton>
    </div>
  );
}
