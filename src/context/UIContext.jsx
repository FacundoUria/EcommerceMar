import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const UIContext = createContext(null);
// Solo las acciones (estables): las cards abren el quick view y muestran toasts sin re-renderizarse cada
// vez que aparece o se va un toast.
const UIAccionesContext = createContext(null);

/** Estado de UI global: quick view abierto y toasts. */
export function UIProvider({ children }) {
  const [quickView, setQuickView] = useState(null); // { producto, variante }
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const mostrarToast = useCallback((t) => {
    clearTimeout(timer.current);
    setToast({ ...t, id: Date.now() });
    timer.current = setTimeout(() => setToast(null), t.duracion ?? 3200);
  }, []);

  const acciones = useMemo(
    () => ({
      abrirQuickView: (producto, variante = null) => setQuickView({ producto, variante }),
      cerrarQuickView: () => setQuickView(null),
      mostrarToast,
      cerrarToast: () => setToast(null),
    }),
    [mostrarToast],
  );
  const value = useMemo(() => ({ quickView, toast, ...acciones }), [quickView, toast, acciones]);

  return (
    <UIAccionesContext.Provider value={acciones}>
      <UIContext.Provider value={value}>{children}</UIContext.Provider>
    </UIAccionesContext.Provider>
  );
}

/** Solo las acciones de UI (estables): no re-renderiza con cada toast o quick view. */
export function useUIAcciones() {
  const ctx = useContext(UIAccionesContext);
  if (!ctx) throw new Error('useUIAcciones tiene que usarse dentro de <UIProvider>');
  return ctx;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI tiene que usarse dentro de <UIProvider>');
  return ctx;
}
