import { lazy, Suspense, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'motion/react';
import Icon from './Icon.jsx';

// El modal (video, controles, gestos) va en un chunk aparte: se pide al tocar la miniatura y se precarga
// cuando el navegador está ocioso.
const cargarModal = () => import('./HistoriaVideoModal.jsx');
const Modal = lazy(cargarModal);

/**
 * Video vertical tipo "story": card protagonista (160px mobile / 220px desktop: poster, play grande al
 * centro, anillo dorado que gira lento como una historia sin ver, texto debajo) que abre
 * el video en un modal a pantalla completa, con audio. Se cierra con la X, deslizando hacia abajo o con Esc.
 * Sin controles nativos (chocaban con el gesto de cerrar): tocar pausa / sigue, barra de progreso arriba
 * y botón de sonido, como una story.
 */
export default function HistoriaVideo({ src, poster, texto, etiqueta, className = '' }) {
  const [abierta, setAbierta] = useState(false);
  useEffect(() => {
    const id = 'requestIdleCallback' in window ? requestIdleCallback(cargarModal, { timeout: 4000 }) : setTimeout(cargarModal, 2000);
    return () => ('cancelIdleCallback' in window ? cancelIdleCallback(id) : clearTimeout(id));
  }, []);
  return (
    <>
      <button
        type="button"
        onClick={() => setAbierta(true)}
        aria-label={etiqueta}
        className={`group flex w-40 flex-col items-center gap-3 text-center md:w-[220px] ${className}`}
      >
        {/* Anillo dorado que gira lento (como una historia sin ver) + aire arena entre el anillo y el poster */}
        <span className="anillo-historia relative block w-full rounded-[1.75rem] p-[3px] shadow-flotante transition duration-500 group-hover:-translate-y-1">
          <span className="block overflow-hidden rounded-[1.6rem] border-[3px] border-arena bg-salvia-media">
            <span className="relative block aspect-[9/16]">
              <img src={poster} alt="" width="576" height="1024" loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-tinta/35 via-transparent to-tinta/10" aria-hidden="true" />
              <span className="absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-crema-card/90 text-verde shadow-flotante backdrop-blur-sm transition duration-300 group-hover:scale-110 group-active:scale-95 md:size-20">
                <span className="pulso absolute inset-0 rounded-full" aria-hidden="true" />
                <Icon name="play" size={28} className="ml-1 md:size-8" />
              </span>
            </span>
          </span>
        </span>
        <span className="text-sm leading-snug font-bold text-tinta transition-colors group-hover:text-verde md:text-[15px]">{texto}</span>
      </button>
      {createPortal(
        <AnimatePresence>
          {abierta && (
            <Suspense key="modal" fallback={null}>
              <Modal src={src} poster={poster} etiqueta={etiqueta} onClose={() => setAbierta(false)} />
            </Suspense>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
