import { useEffect, useRef } from 'react';

const FOCUSABLES = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/** Mantiene el foco dentro del diálogo, cierra con Escape y devuelve el foco al cerrar. */
export function useFocusTrap(ref, onClose, activo = true) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!activo) return;
    const previo = document.activeElement;
    const el = ref.current;
    const primero = el?.querySelector(FOCUSABLES);
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
      if (previo instanceof HTMLElement) previo.focus({ preventScroll: true });
    };
  }, [ref, activo]);
}
