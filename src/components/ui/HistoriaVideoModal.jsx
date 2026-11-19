import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import Icon from './Icon.jsx';
import { useFocusTrap } from '../../hooks/useFocusTrap.js';
import { useOcultarBottomNav } from '../../hooks/useOcultarBottomNav.js';

const EASE = [0.22, 1, 0.36, 1];

/**
 * Modal a pantalla completa del video tipo story (chunk aparte: lo carga HistoriaVideo.jsx al tocar la
 * miniatura y lo precarga en idle).
 */
export default function Modal({ src, poster, etiqueta, onClose }) {
  const ref = useRef(null);
  const video = useRef(null);
  const barra = useRef(null);
  const [pausado, setPausado] = useState(false);
  const [mudo, setMudo] = useState(false);
  useFocusTrap(ref, onClose, true, { enfocarContenedor: true });
  useOcultarBottomNav(); // oculta bottom nav y mini Mar

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
