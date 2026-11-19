import { useEffect, useRef } from 'react';
import { m, useReducedMotion } from 'motion/react';
import Icon from '../ui/Icon.jsx';
import Destellos from './Destellos.jsx';
import { whatsappCon } from '../../config/negocio.js';
import { fuenteImagen } from '../../lib/imagenes.js';
import { CINTURA, CORTE, FIGURA } from './miniMarGeo.js';

const LINK = whatsappCon('¡Hola Mar! Tengo una consulta.');
const EASE = [0.22, 1, 0.36, 1];
const DESTELLO_GLOBO = [{ x: '-6%', y: '-45%', tam: 11 }];

/**
 * Panel de mini Mar en mobile (overlay, figura grande, botón "Escribile a Mar", globito). Va en un chunk
 * aparte: lo carga MiniMarMobile.jsx al tocar el botón central o al asomar (y lo precarga en idle).
 */
export default function Panel({ geo, estado, onClose, onAbrir }) {
  const reducido = useReducedMotion();
  const abierta = estado === 'abierta';
  const wa = useRef(null);
  const { alto, ancho, base, dedo, desdeBoton } = geo;
  const f = fuenteImagen(FIGURA, ancho * 2);

  useEffect(() => {
    if (abierta) wa.current?.focus({ preventScroll: true });
  }, [abierta]);

  // La figura sube desde el botón central (chica, abajo al medio) hasta su lugar, con un rebote suave
  const escondida = { x: desdeBoton.x, y: desdeBoton.y, scale: 0.3, opacity: 0 };
  const parada = { x: 0, y: abierta ? 0 : alto * CINTURA, scale: 1, opacity: 1 };
  // Botón "Escribile a Mar": a la izquierda de la punta del dedo, un poco más arriba (donde apunta)
  const anchoBoton = Math.min(184, dedo.x - 18);
  const botonPos = { right: geo.W - dedo.x + 8, bottom: alto - dedo.y + 6 };

  return (
    <>
      {abierta && (
        <m.div
          aria-hidden="true"
          className="fixed inset-0 z-[38] touch-none bg-arena/40 backdrop-blur-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          onPanEnd={(_, info) => info.offset.y > 60 && onClose()}
        />
      )}
      {/* Capa apoyada sobre la barra: la figura se recorta en el borde de arriba de la barra */}
      <m.div
        role={abierta ? 'dialog' : undefined}
        aria-label={abierta ? 'Mini Mar: ¿Te ayudo a elegir?' : undefined}
        aria-hidden={abierta ? undefined : true}
        className="pointer-events-none fixed inset-x-0 z-[39]"
        style={{ bottom: base, height: alto }}
        drag={abierta ? 'y' : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => (info.offset.y > 60 || info.velocity.y > 500) && onClose()}
      >
        <div className="absolute inset-0 overflow-hidden">
          <m.img
            src={f.src}
            srcSet={f.srcSet}
            sizes={`${ancho}px`}
            alt=""
            width="451"
            height="661"
            draggable="false"
            onClick={abierta ? undefined : onAbrir}
            className="pointer-events-auto absolute right-0 drop-shadow-[0_10px_18px_rgb(34_56_43/0.2)]"
            style={{ width: ancho, height: alto, bottom: -CORTE, transformOrigin: '50% 100%' }}
            initial={escondida}
            animate={parada}
            exit={{ ...escondida, transition: { duration: reducido ? 0.25 : 0.4, ease: EASE } }}
            transition={reducido ? { duration: 0.3 } : { type: 'spring', bounce: 0.32, duration: 0.75 }}
          />
        </div>

        {/* Globito: al asomar, junto a la cabeza; abierta, arriba del botón */}
        <m.button
          type="button"
          tabIndex={-1}
          onClick={abierta ? undefined : onAbrir}
          className="pointer-events-auto absolute rounded-2xl rounded-br-md bg-crema-card px-3.5 py-2 text-[13px] font-bold whitespace-nowrap text-tinta shadow-flotante ring-1 ring-linea"
          style={abierta ? { right: botonPos.right + 8, bottom: botonPos.bottom + 58 } : { right: geo.W - dedo.x + 10, top: dedo.y + alto * CINTURA - 34 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          transition={{ duration: 0.35, ease: EASE, delay: 0.45 }}
        >
          ¿Te ayudo a elegir?
          <Destellos puntos={DESTELLO_GLOBO} />
        </m.button>

        {abierta && (
          <m.a
            ref={wa}
            href={LINK}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="pointer-events-auto absolute flex h-14 items-center justify-center gap-2 rounded-full px-5 text-[15px] font-bold whitespace-nowrap text-arena shadow-flotante outline-none focus-visible:ring-2 focus-visible:ring-tinta focus-visible:ring-offset-2"
            style={{ ...botonPos, width: anchoBoton, backgroundImage: 'linear-gradient(135deg, #3e6450 0%, #2f5240 100%)' }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
            transition={reducido ? { duration: 0.25, delay: 0.15 } : { type: 'spring', bounce: 0.4, duration: 0.55, delay: 0.3 }}
          >
            <Icon name="whatsapp" size={22} /> Escribile a Mar
          </m.a>
        )}
      </m.div>
    </>
  );
}
