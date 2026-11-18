import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const UIContext = createContext(null);

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

  const value = useMemo(
    () => ({
      quickView,
      abrirQuickView: (producto, variante = null) => setQuickView({ producto, variante }),
      cerrarQuickView: () => setQuickView(null),
      toast,
      mostrarToast,
      cerrarToast: () => setToast(null),
    }),
    [quickView, toast, mostrarToast],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI tiene que usarse dentro de <UIProvider>');
  return ctx;
}
