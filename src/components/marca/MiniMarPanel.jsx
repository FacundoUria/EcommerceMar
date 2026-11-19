import { m, useReducedMotion } from 'motion/react';
import Destellos from './Destellos.jsx';
import { fuenteImagen } from '../../lib/imagenes.js';
import { CINTURA, CORTE, FIGURA } from './miniMarGeo.js';

const EASE = [0.22, 1, 0.36, 1];
const DESTELLO_GLOBO = [{ x: '-6%', y: '-45%', tam: 11 }];

/**
 * Asomo de mini Mar en mobile (primera vez de la sesión): la figura sube desde el botón central hasta
 * la cintura, parada sobre la barra a la derecha, con el globito "¿Te ayudo a elegir?", y vuelve a
 * esconderse. Tocarla abre el chat. Va en un chunk aparte (lo carga MiniMarMobile.jsx al asomar y lo
 * precarga en idle). Abierto, el chat es ChatMar.jsx.
 */
export default function Panel({ geo, onAbrir }) {
  const reducido = useReducedMotion();
  const { alto, ancho, base, dedo, desdeBoton } = geo;
  const f = fuenteImagen(FIGURA, ancho * 2);

  // La figura sube desde el botón central (chica, abajo al medio) hasta la cintura, con un rebote suave
  const escondida = { x: desdeBoton.x, y: desdeBoton.y, scale: 0.3, opacity: 0 };
  const parada = { x: 0, y: alto * CINTURA, scale: 1, opacity: 1 };

  return (
    // Capa apoyada sobre la barra: la figura se recorta en el borde de arriba de la barra
    <m.div aria-hidden="true" className="pointer-events-none fixed inset-x-0 z-[39]" style={{ bottom: base, height: alto }}>
      <div className="absolute inset-0 overflow-hidden">
        <m.img
          src={f.src}
          srcSet={f.srcSet}
          sizes={`${ancho}px`}
          alt=""
          width="451"
          height="661"
          draggable="false"
          onClick={onAbrir}
          className="pointer-events-auto absolute right-0 drop-shadow-[0_10px_18px_rgb(34_56_43/0.2)]"
          style={{ width: ancho, height: alto, bottom: -CORTE, transformOrigin: '50% 100%' }}
          initial={escondida}
          animate={parada}
          exit={{ ...escondida, transition: { duration: reducido ? 0.25 : 0.4, ease: EASE } }}
          transition={reducido ? { duration: 0.3 } : { type: 'spring', bounce: 0.32, duration: 0.75 }}
        />
      </div>

      {/* Globito junto a la cabeza */}
      <m.button
        type="button"
        tabIndex={-1}
        onClick={onAbrir}
        className="pointer-events-auto absolute rounded-2xl rounded-br-md bg-crema-card px-3.5 py-2 text-[13px] font-bold whitespace-nowrap text-tinta shadow-flotante ring-1 ring-linea"
        style={{ right: geo.W - dedo.x + 10, top: dedo.y + alto * CINTURA - 34 }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
        transition={{ duration: 0.35, ease: EASE, delay: 0.45 }}
      >
        ¿Te ayudo a elegir?
        <Destellos puntos={DESTELLO_GLOBO} />
      </m.button>
    </m.div>
  );
}
