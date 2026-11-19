// Geometría de mini Mar en mobile, compartida entre el botón central (bundle principal) y el panel
// (chunk aparte que se carga al tocar el botón o al asomar).
export const FIGURA = '/img/marca/mini-mar.webp';
export const ASPECTO = 451 / 661; // assets/marca/mini-mar.png
const DEDO = { x: 0.062, y: 0.342 }; // punta del dedo (señala arriba a la izquierda), en fracción de la imagen
export const CORTE = 14; // px de la figura que quedan escondidos detrás del borde de la barra
export const CINTURA = 0.45; // al asomar sola, baja este tanto de su alto: se ve hasta la cintura

/** Geometría según el ancho real de la pantalla y dónde está la barra (px). */
export function medir(barra) {
  const W = window.innerWidth;
  const alto = Math.round(Math.min(280, W * 0.7));
  const ancho = Math.round(alto * ASPECTO);
  const base = barra ? Math.round(window.innerHeight - barra.getBoundingClientRect().top) : 76; // del borde de abajo al borde de arriba de la barra
  // punta del dedo, en coordenadas de la capa (que mide `alto` y está apoyada en la barra)
  const dedo = { x: W - ancho + ancho * DEDO.x, y: CORTE + alto * DEDO.y };
  return { W, alto, ancho, base, dedo, desdeBoton: { x: W / 2 - (W - ancho / 2), y: alto * 0.75 } };
}
