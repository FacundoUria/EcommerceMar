// Ruteo del panel, propio y mínimo (/admin/<sección>/<id>). No usa react-router a propósito: el data router
// (el que sabe frenar el botón "atrás") es un módulo compartido con la tienda y sumaba ~19 KB gzip a `comun`,
// que baja el home. Acá alcanza con history.pushState + popstate.
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

const oyentes = new Set();
const avisar = () => oyentes.forEach((f) => f());
let guardia = null; // (destino) => true si puede pasar (la registra el formulario con cambios sin guardar)
let ultima = location.pathname;

function cambiar(url, reemplazar) {
  history[reemplazar ? 'replaceState' : 'pushState'](null, '', url);
  ultima = url;
  window.scrollTo(0, 0);
  avisar();
}

/** Navegar dentro del panel. Con cambios sin guardar pregunta primero (salvo `forzar`). */
export function irA(url, { reemplazar = false, forzar = false } = {}) {
  if (url === location.pathname) return;
  if (!forzar && guardia && !guardia(url)) return;
  cambiar(url, reemplazar);
}

// Botón "atrás" / "adelante": si hay cambios sin guardar, se vuelve a dejar la URL del formulario (que sigue en
// pantalla) y se pregunta; si elige salir, se va al destino.
window.addEventListener('popstate', () => {
  const destino = location.pathname;
  if (destino !== ultima && guardia && !guardia(destino)) {
    history.pushState(null, '', ultima);
    return;
  }
  ultima = destino;
  window.scrollTo(0, 0);
  avisar();
});

const suscribir = (f) => {
  oyentes.add(f);
  return () => oyentes.delete(f);
};
/** La ruta actual (se actualiza al navegar). */
export const useRuta = () => useSyncExternalStore(suscribir, () => location.pathname);

/** <a> que navega dentro del panel (con Ctrl/Cmd o la ruedita abre pestaña nueva, como cualquier link). */
export function Enlace({ to, onClick, ...rest }) {
  return (
    <a
      href={to}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        irA(to);
      }}
      {...rest}
    />
  );
}

/**
 * Frena la navegación mientras `sucio`. Devuelve { pendiente, salir, quedarse }: `pendiente` es a dónde quería ir
 * (para mostrar "¿Salir sin guardar?").
 */
export function useGuardia(sucio) {
  const [pendiente, setPendiente] = useState(null);
  const sucioRef = useRef(sucio);
  sucioRef.current = sucio;
  useEffect(() => {
    const g = (destino) => {
      if (!sucioRef.current) return true;
      setPendiente(destino);
      return false;
    };
    guardia = g;
    return () => {
      if (guardia === g) guardia = null;
    };
  }, []);
  return {
    pendiente,
    salir: () => {
      const destino = pendiente;
      setPendiente(null);
      irA(destino, { forzar: true });
    },
    quedarse: () => setPendiente(null),
  };
}
