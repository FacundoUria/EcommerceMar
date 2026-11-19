import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, m } from 'motion/react';
import Icon from './Icon.jsx';
import { useFocusTrap } from '../../hooks/useFocusTrap.js';
import { useOcultarBottomNav } from '../../hooks/useOcultarBottomNav.js';

const EASE = [0.22, 1, 0.36, 1];

/**
 * Video vertical tipo "story": miniatura (poster, bordes redondeados, anillo con degradé dorado) que abre
 * el video en un modal a pantalla completa, con audio. Se cierra con la X, deslizando hacia abajo o con Esc.
 * Sin controles nativos (chocaban con el gesto de cerrar): tocar pausa / sigue, barra de progreso arriba
 * y botón de sonido, como una story.
 */
export default function HistoriaVideo({ src, poster, texto, etiqueta, className = '' }) {
  const [abierta, setAbierta] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setAbierta(true)} aria-label={etiqueta} className={`group flex items-center gap-3.5 text-left ${className}`}>
        {/* Anillo dorado (degradé) + aire arena entre el anillo y la foto */}
        <span className="anillo-historia relative block w-[4.5rem] shrink-0 rounded-[1.15rem] p-[2.5px] shadow-suave transition duration-500 group-hover:-translate-y-0.5 group-hover:shadow-flotante md:w-20">
          <span className="block overflow-hidden rounded-2xl border-2 border-arena">
            <span className="relative block aspect-[9/16]">
              <img src={poster} alt="" width="576" height="1024" loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute inset-0 bg-tinta/15" aria-hidden="true" />
              <span className="absolute top-1/2 left-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-crema-card/90 text-verde shadow-suave backdrop-blur-sm">
                <Icon name="play" size={15} className="ml-0.5" />
              </span>
            </span>
          </span>
        </span>
        <span className="text-sm leading-snug font-bold text-tinta transition-colors group-hover:text-verde">
          <span aria-hidden="true" className="text-dorado">▶ </span>
          {texto}
        </span>
      </button>
      {createPortal(
        <AnimatePresence>{abierta && <Modal src={src} poster={poster} etiqueta={etiqueta} onClose={() => setAbierta(false)} />}</AnimatePresence>,
        document.body,
      )}
    </>
  );
}

function Modal({ src, poster, etiqueta, onClose }) {
  const ref = useRef(null);
  const video = useRef(null);
  const barra = useRef(null);
  const [pausado, setPausado] = useState(false);
  const [mudo, setMudo] = useState(false);
  useFocusTrap(ref, onClose, true, { enfocarContenedor: true });
  useOcultarBottomNav(); // oculta bottom nav y mini Mar, pausa Lenis

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Progreso (escrito directo en el DOM, sin re-renders)
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    let raf = 0;
    const tick = () => {
      if (barra.current && v.duration) barra.current.style.transform = `scaleX(${v.currentTime / v.duration})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Si el navegador no deja arrancar con sonido, arranca mudo (se puede activar con el botón)
    v.play().catch(() => {
      v.muted = true;
      setMudo(true);
      v.play().catch(() => setPausado(true));
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const alternar = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      <m.div className="absolute inset-0 bg-tinta/90 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <m.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={etiqueta}
        tabIndex={-1}
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 80, scale: 0.97 }}
        transition={{ duration: 0.45, ease: EASE }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.7 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 120 || info.velocity.y > 600) onClose();
        }}
        className="relative h-[100dvh] w-full touch-none overflow-hidden bg-black outline-none md:h-[92vh] md:w-auto md:aspect-[9/16] md:rounded-4xl md:shadow-flotante"
      >
        <m.video
          ref={video}
          src={src}
          poster={poster}
          playsInline
          muted={mudo}
          preload="auto"
          onTap={alternar}
          onPlay={() => setPausado(false)}
          onPause={() => setPausado(true)}
          onEnded={() => setPausado(true)}
          className="size-full object-contain"
        >
          Tu navegador no puede reproducir este video.
        </m.video>

        {/* Barra de progreso (arriba, como una story) */}
        <span className="absolute inset-x-4 top-[max(0.75rem,env(safe-area-inset-top))] h-[3px] overflow-hidden rounded-full bg-white/25" aria-hidden="true">
          <span ref={barra} className="block h-full origin-left scale-x-0 rounded-full bg-white" />
        </span>

        <div className="absolute inset-x-4 top-[calc(max(0.75rem,env(safe-area-inset-top))+0.75rem)] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              const v = video.current;
              if (!v) return;
              v.muted = !mudo;
              setMudo(!mudo);
            }}
            aria-label={mudo ? 'Activar sonido' : 'Silenciar'}
            className="flex size-11 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition active:scale-90"
          >
            <Icon name={mudo ? 'mudo' : 'sonido'} size={20} />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar video"
            className="flex size-11 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:rotate-90 active:scale-90"
          >
            <Icon name="cerrar" size={22} />
          </button>
        </div>

        {/* Pausado: botón grande de play en el centro */}
        <AnimatePresence>
          {pausado && (
            <m.button
              type="button"
              onClick={alternar}
              aria-label="Reproducir"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25 }}
              className="absolute top-1/2 left-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-crema-card/90 text-verde shadow-flotante"
            >
              <Icon name="play" size={30} className="ml-1" />
            </m.button>
          )}
        </AnimatePresence>

        <p className="pointer-events-none absolute inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] text-center text-xs font-semibold text-white/70 md:hidden" aria-hidden="true">
          Deslizá hacia abajo para cerrar
        </p>
      </m.div>
    </div>
  );
}
