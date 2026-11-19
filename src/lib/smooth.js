// Scroll nativo (sin Lenis). Lenis con lerp 0.1 tardaba ~540 ms en llegar al destino de una muesca de
// la rueda y con touchpad iba 20–30 px atrasado todo el tiempo ("input lag"). El scroll suave queda solo
// para anclas y scroll por código (scroll-behavior: smooth en html).

/** Ir a una posición (inmediato: sin animación, ej. al cambiar de página). */
export function scrollA(y, { inmediato = false } = {}) {
  window.scrollTo({ top: y, behavior: inmediato ? 'instant' : 'smooth' });
}
