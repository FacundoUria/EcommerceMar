import { useEffect, useRef } from 'react';

const FOCUSABLES = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Mantiene el foco dentro del diálogo, cierra con Escape y devuelve el foco al cerrar.
 * `enfocarContenedor`: el foco inicial va al contenedor (tabIndex=-1) en vez del primer control,
 * así no aparece un recuadro de foco sobre una opción al abrir con el mouse.
 */
export function useFocusTrap(ref, onClose, activo = true, { enfocarContenedor = false } = {}) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!activo) return;
    const previo = document.activeElement;
    const el = ref.current;
    const primero = enfocarContenedor ? null : el?.querySelector(FOCUSABLES);
    (primero ?? el)?.focus({ preventScroll: true });

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (e.key !== 'Tab' || !el) return;
      const items = [...el.querySelectorAll(FOCUSABLES)].filter((n) => n.offsetParent !== null);
      if (!items.length) return;
      const [a, z] = [items[0], items[items.length - 1]];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      // Devuelve el foco solo si quedó perdido (en body o dentro del diálogo que se cierra): con overlays
      // encadenados (drawer → checkout) el que termina de salir tarde no le saca el foco al nuevo.
      const actual = document.activeElement;
      const perdido = !actual || actual === document.body || el?.contains(actual);
      if (perdido && previo instanceof HTMLElement && previo.isConnected) previo.focus({ preventScroll: true });
    };
  }, [ref, activo]);
}
