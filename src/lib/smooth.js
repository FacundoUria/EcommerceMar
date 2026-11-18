// Smooth scroll con Lenis: solo desktop con mouse (pointer: fine) y sin movimiento reducido.
// En mobile táctil se mantiene el scroll nativo (Lenis lo empeora). Se carga en un chunk aparte.
// Lenis mueve el scroll real de window, así que motion/useScroll, el header y los sticky siguen andando.
let lenis = null;

export async function iniciarSmooth() {
  const fino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fino || reducido || lenis) return lenis;
  const { default: Lenis } = await import('lenis');
  lenis = new Lenis({ lerp: 0.1, allowNestedScroll: true });
  const raf = (t) => {
    lenis.raf(t);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
  return lenis;
}

/** Ir a una posición respetando Lenis si está activo. */
export function scrollA(y, { inmediato = false } = {}) {
  if (lenis) lenis.scrollTo(y, { immediate: inmediato });
  else window.scrollTo({ top: y, behavior: inmediato ? 'instant' : 'smooth' });
}

/** Pausar el smooth mientras hay un overlay abierto (drawer, quick view, filtros). */
export function pausarSmooth(pausar) {
  if (!lenis) return;
  if (pausar) lenis.stop();
  else lenis.start();
}
