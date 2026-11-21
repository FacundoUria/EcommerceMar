// Estado compartido del panel: los datos de Supabase y "hay cambios sin guardar".
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { cargarTodo } from './datos.js';
import { useGuardia } from './ruta.jsx';
import { Boton, Dialogo } from './ui.jsx';

// ───────── Datos ─────────

const DatosContext = createContext(null);
/** { datos: { categorias, productos, servicios } | null, error, recargar() } */
export const useDatos = () => useContext(DatosContext);

export function DatosProvider({ children }) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const recargar = useCallback(async () => {
    try {
      const d = await cargarTodo();
      setDatos(d);
      setError(null);
      return d;
    } catch (e) {
      setError(e);
      throw e;
    }
  }, []);
  useEffect(() => {
    recargar().catch(() => {});
  }, [recargar]);
  return <DatosContext.Provider value={{ datos, error, recargar }}>{children}</DatosContext.Provider>;
}

// ───────── Cambios sin guardar ─────────

export const SucioContext = createContext(() => {});

/** Diálogo "¿Salir sin guardar?". */
export function DialogoSinGuardar({ abierto, onSalir, onQuedarse }) {
  return (
    <Dialogo
      abierto={abierto}
      onCerrar={onQuedarse}
      titulo="¿Salir sin guardar?"
      acciones={
        <>
          <Boton grande ancho onClick={onQuedarse}>
            Seguir editando
          </Boton>
          <Boton variante="peligro" ancho onClick={onSalir}>
            Salir sin guardar
          </Boton>
        </>
      }
    >
      <p>Hiciste cambios que todavía no guardaste. Si salís ahora, se pierden.</p>
    </Dialogo>
  );
}

/**
 * Para los formularios: con cambios sin guardar, frena el botón "atrás", los links del panel y "Salir"
 * (pregunta primero) y avisa si se cierra la pestaña. Devuelve el diálogo para dibujar. Después de guardar o
 * borrar se navega con irA(url, { forzar: true }).
 */
export function useCambiosSinGuardar(sucio) {
  const marcar = useContext(SucioContext);
  const { pendiente, salir, quedarse } = useGuardia(sucio);

  useEffect(() => {
    marcar(sucio);
    return () => marcar(false);
  }, [sucio, marcar]);

  useEffect(() => {
    if (!sucio) return;
    const avisar = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', avisar);
    return () => window.removeEventListener('beforeunload', avisar);
  }, [sucio]);

  return <DialogoSinGuardar abierto={pendiente != null} onSalir={salir} onQuedarse={quedarse} />;
}
