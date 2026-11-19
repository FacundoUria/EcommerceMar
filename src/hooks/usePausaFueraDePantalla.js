import { useEffect, useState } from 'react';

/**
 * Pausa las animaciones CSS en loop de una sección mientras está fuera de pantalla: le pone
 * `data-pausa` y index.css pausa toda animación adentro (animation-play-state). Se ven igual, pero no
 * trabajan cuando nadie las mira. Medido en el home mobile: el brillo dorado del hero (anima
 * background-position) repintaba el documento ~140 veces por segundo aunque estuviera fuera de pantalla
 * y trababa el arrastre del mazo de banners.
 * Devuelve si la sección está (cerca de estar) en pantalla, por si también hay que frenar algo de JS.
 * `listo`: false mientras el elemento todavía no está montado (se observa cuando pasa a true).
 */
export function usePausaFueraDePantalla(ref, { margen = '100px', listo = true } = {}) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!listo || !el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) delete el.dataset.pausa;
        else el.dataset.pausa = '';
        setVisible(e.isIntersecting);
      },
      { rootMargin: `${margen} 0px` },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      delete el.dataset.pausa;
    };
  }, [ref, margen, listo]);
  return visible;
}
