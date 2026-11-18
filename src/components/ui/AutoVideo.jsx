import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import Icon from './Icon.jsx';

/**
 * Video mudo en loop tipo reel.
 * - Muestra el poster como <img> (cuenta para LCP y no espera al video).
 * - Carga el video recién cuando está cerca de la pantalla y el navegador está ocioso.
 * - Pausa fuera de pantalla. Con prefers-reduced-motion no hace autoplay: muestra botón de play.
 */
export default function AutoVideo({ src, poster, alt, className = '', priority = false, width = 576, height = 1024 }) {
  const ref = useRef(null);
  const wrap = useRef(null);
  const reducido = useReducedMotion();
  const [cargar, setCargar] = useState(false);
  const [listo, setListo] = useState(false);
  const [manual, setManual] = useState(false);

  // Decidir cuándo pedir el video
  useEffect(() => {
    if (reducido && !manual) return;
    const el = wrap.current;
    let idle;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const empezar = () => setCargar(true);
        if (priority && 'requestIdleCallback' in window) idle = requestIdleCallback(empezar, { timeout: 2500 });
        else empezar();
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (idle) cancelIdleCallback(idle);
    };
  }, [reducido, manual, priority]);

  // Play / pausa según visibilidad
  useEffect(() => {
    const v = ref.current;
    if (!cargar || !v) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, [cargar]);

  return (
    <div ref={wrap} className={`relative overflow-hidden ${className}`}>
      <img
        src={poster}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding={priority ? 'sync' : 'async'}
        className="absolute inset-0 size-full object-cover"
      />
      {cargar && (
        <video
          ref={ref}
          src={src}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          aria-hidden="true"
          onPlaying={() => setListo(true)}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${listo ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      {reducido && !manual && (
        <button
          type="button"
          onClick={() => setManual(true)}
          aria-label="Reproducir video"
          className="glass absolute right-4 bottom-4 z-10 flex size-12 items-center justify-center rounded-full text-verde shadow-suave"
        >
          <Icon name="play" size={20} />
        </button>
      )}
    </div>
  );
}
